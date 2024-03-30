
function indentExpression(expression) {

	let indented = expression.replace(/[\[\],]/g, ' $& ');
	
	let indentation = 0;
	indented = indented.replace(/\S+/g, match => {
		let spaces = ' '.repeat(indentation);
		if(match === '[') {
			indentation += 4;
		}
		if(match === ']') {
			indentation -= 4;
		}
		return `\n${spaces}${match}`;
	});

	return indented;
}

// ===============================================================================================================================
// ===============================================================================================================================
//													CLASS PROGRAM
// ===============================================================================================================================


class Program {
	constructor(code) {

		if (Program.list.get(code.name)) {
			throw Error(`Program's name is already taken : ${code.name}`);
		}

		this.name = code.name;
		this.version = code.version;
		this.author = code.author;
		this.license = code.license;
		this.structures = new Map();
		this.variables = new Map();

		this.structures = this.setupStructures(code);
		this.variables = this.setupVariables(code);

		
		Program.list.set(this.name, this)
	}

	setupStructures(code) {
		let structures = new Map();

		code.structures.map( s => {
			if (this.structures.get(s.class)) {
				throw Error(`Class ${s.class} already exist`);
			}
			const _class = new StructClass(s.class, this);
			
			
			// pour chaque classe, rajouter méthodes
			s.methods.map( m => {
				if (_class.methods.get(m.name)) {
					throw Error(`Method ${m.name} in class ${s.class} already exist`);
				}
				_class.addMethod(m.name, m.data);
			})

			//console.table(_class)
			//
			structures.set(s.class, _class )
		})
		
		return structures
	}

	findObject(varName, _instanceof, code) {
		const _class = code.structures.find(c => c.class === _instanceof);
		if (!_class) {
			//console.warn();
			throw Error(`Object ${varName} not found because there is no class : ${_instanceof}`);
			return null
		}
		const object = _class.objects.find( e => e.toVariable === varName )
		return object
	}

	setupVariables(code) {
		let variables = new Map();
		code.variables.map( v => {
			
			const _class = this.structures.get(v.instanceof);
			if (!_class) {
				throw Error(`Class ${v.instanceof} not found`);
			}
			const object = this.findObject(v.name, v.instanceof, code);
			if (!object) {
				throw Error(`There is no object ${v.name} instance of ${v.instanceof}`);
			}
			
			// pour chaque classe, rajouter objets
			const classObject = _class.addObject(object.toVariable, object.data);

			variables.set(v.name, classObject);
		})
		return variables
	}

	rename(name) {
		this.name = name;
		return this
	}

	changeVersion(version) {
		this.version = version;
		return this
	}

	changeAuthor(author) {
		this.author = author;
		return this
	}
	
	changeLicense(license) {
		this.license = license;
		return this
	}

	addStructClass() {
		//...
		return this
	}

	removeStructClass() {
		//...
		return this
	}

	modifyStructClass() {
		//...
		return this
	}


	run(code) {
		// code : text
		try {
			const lexed = lexer(code)
			const parsed = parser(lexed)

			// HARD RESET
			this.structures.clear();
			this.variables.clear();
			this.structures = this.setupStructures(parsed);
			this.variables = this.setupVariables(parsed);

		} catch (error) {
			console.error(error)
		}
	}

	exec(input) { // temp
		const lexed = mutableLexer(input);

		const result = Program.getInstruction(lexed.method, {variables : this.variables, args : lexed.arguments, toVariable : "__TEMP__"});

		//this.variables.get(lexed.arguments[0])
		//this.variables.get("__TEMP__")
		return {result, value : this.variables.get(lexed.arguments[0]), variable : lexed.arguments[0]}
	}
}

Program.list = new Map();

Program.new = (name, version, author, license) => {
	return new Program({
		name,
		version,
		author,
		license,
		structures : [],
		variables : []
	})
}

Program.import = json => {
	try {
		const programCode = JSON.parse(json);
		return new Program(programCode);
	} catch (error) {
		console.error(error)
	}
}

Program.export = json => {
	//... read program, return json
}

Program.getOperation = (operationName, {variables, args, toVariable}) => {

	//console.log(operationName)
	const operation = Program.operations[operationName];
	if (!operation) {
		//throw Error(`'${operationName}' does not exist as operation`)
		return (a, b) => {
			//console.log(toVariable)
			//console.log(args[0])
			//console.warn("this", variables.get(args[0]).toString())
			//console.log(a[operationName](b).toString())
			return a[operationName](b)
		}

	}

	return (a, b) => {
		//console.log(a.instanceof, b.instanceof, operation)
		if (a.instanceof === 'real' && b.instanceof === 'real') {
			const value = operation(a.get(0), b.get(0))
			return Program.builtinClass['real']._constructor('__TEMP__',[value])
		}

		// faire les entiers

		return operation(a, b)
	}
	
}

// (scalar, scalar) -> scalar
Program.operations = {
	PLUS : (a,b) => a + b,
	TIMES : (a,b) => a * b,
	COMPOSE : (f,g) => x => f(g(x)),
	MIN : (a,b) => Math.min(a,b),
	MAX : (a,b) => Math.max(a,b),
	MANHATTAN : (a,b) => Math.abs( a - b ), // distance 1
	HYPOTHENUS : (a,b) => Math.hypot( a, b ), // distance 2
	// not elementary
	MINUS : (a,b) => a - b,
	DIVISION : (a,b) => a / b,
	MODULO : (a,b) => a % b, // bugué pour les <0 en js
	POWER : (a,b) => a ** b,
}



Program.getFunction = (_functionName, {variables, args, toVariable}) => {

	const _function = Program.functions[_functionName];
	if (!_function) {
		//throw Error(`'${_functionName}' does not exist as function`)
		return (x, i) => {
			return x[_functionName](i)
		}

	}

	return (x, i) => {
		//console.log(x.instanceof, i.instanceof, _function)
		if (x.instanceof === 'real' && i.instanceof === 'real') {
			const value = _function(x.get(0), i.get(0))
			return Program.builtinClass['real']._constructor('__TEMP__',[value])
		}

		// faire les entiers

		return _function(x, i)
	}
	
}


// (scalar, scalar) -> scalar
Program.functions = {
	ADD : (x,i) => x + i,
	SUB : (x,i) => x - i,
	MULT : (x,i) => x * i,
	DIV : (x,i) => x / i,
	POW : (x,i) => Math.pow(x, i), //x^2
	POWEXP : (x,i) => Math.pow(i, x), //2^x
	EXP : (x,i) => Math.exp(x),
	LN : (x,i) => Math.log(x),
	ABS : (x,i) => Math.abs(x),
	COS : (x,i) => Math.cos(x),
	SIN : (x,i) => Math.sin(x),
	TAN : (x,i) => Math.tan(x),
	ACOS : (x,i) => Math.acos(x),
	ASIN : (x,i) => Math.asin(x),
	ATAN : (x,i) => Math.atan(x),
	COSH : (x,i) => Math.cosh(x),
	SINH : (x,i) => Math.sinh(x),
	TANH : (x,i) => Math.tanh(x),
	ACOSH : (x,i) => Math.acosh(x),
	ASINH : (x,i) => Math.asinh(x),
	ATANH : (x,i) => Math.atanh(x),
	ATANH2 : (x,i) => Math.atanh2(x),
	SQRT : (x,i) => Math.sqrt(x),
	CBRT : (x,i) => Math.cbrt(x),
	CEIL : (x,i) => Math.ceil(x),
	FLOOR : (x,i) => Math.floor(x),
	ROUND : (x,i) => Math.round(x),
	SIGN : (x,i) => Math.sign(x),
	RANDOM : (x,i) => Math.random(x),
	MIN : (x,i) => Math.min(x,i),
	MAX : (x,i) => Math.max(x,i),
	PERLIN : (x,i) => 0,
	//non standard
	CLZ32 : (x,i) => Math.clz32(x),
	EXPM1 : (x,i) => Math.expm1(x), // exp(x) - 1
	FROUND : (x,i) => Math.fround(x),
	HYPOT : (x,i) => Math.hypot(x,i),
	IMUL : (x,i) => Math.imul(x),
	LOG10 : (x,i) => Math.log10(x),
	LOG2 : (x,i) => Math.log2(x),
	LOG1p : (x,i) => Math.log1p(x),
	TRUNC : (x,i) => Math.trunc(x),
}


Program.getInstruction = (instructionName, {variables, args, toVariable}) => {

	//console.log('instruction : ', instructionName)
	const instruction = Program.instructions[instructionName];
	if (!instruction) {
		//throw Error(`'${instructionName}' does not exist`)
		return Program.applyMethod(instructionName, variables, args, toVariable)
	}

	return Program.instructions[instructionName](variables, args, toVariable)
}

Program.instructions = {
	/*
	variables : Map
	args : Array

	Exemple :
	method:dot(this, vector)
	let [value]
	this.operation(TIMES, vector)
	value = this.reduceWith(PLUS)
	return:value

	variables = map( "this"->this, "vector"->vector, "value"->0 )

	operation
	args = ["this", "TIMES", "vector"]

	reduceWith
	args = ["this", "PLUS"]
	toVariable = "value"
	*/
}

// instructions

Program.getVariable = (arg, variables) => {
	if (Number.isFinite(Number(arg))) {
		return Number(arg)
	}
	return variables.get(arg)
}

Program.instructions.copy = (variables, args) => {	// pas test
	let _this = Program.getVariable(args[0], variables);
	let _struct = Program.getVariable(args[1], variables);
	
	_this.copy(_struct);
	return _this
}

Program.instructions.clone = (variables, args, toVariable) => { // pas test
	let _this = Program.getVariable(args[0], variables);

	const value = _this.clone();
	variables.set(toVariable, value);
	return value
}

Program.instructions.identity = (variables, args) => {
	let _this = Program.getVariable(args[0], variables);

	_this.identity();
	return _this
}

Program.instructions.operation = (variables, args) => {
	let _this = Program.getVariable(args[0], variables);
	let _operation = Program.getOperation(args[1], {variables, args});
	let _struct = Program.getVariable(args[2], variables);

	_this.operation(_operation, _struct);
	return _this
}

Program.instructions.slice = (variables, args) => {
	let _this = Program.getVariable(args[0], variables);
	let start = Program.getVariable(args[1], variables);
	let end = Program.getVariable(args[2], variables);

	_this.slice(start, end);
	return _this
}

Program.instructions.get = (variables, args, toVariable) => { // pas test
	let _this = Program.getVariable(args[0], variables);
	let index = Program.getVariable(args[1], variables);

	const value = _this.get(index);
	variables.set(toVariable, value);
	return value
}

Program.instructions.set = (variables, args) => { // pas test
	let _this = Program.getVariable(args[0], variables);
	let index = Program.getVariable(args[1], variables);
	let value = Program.getVariable(args[2], variables);

	_this.set(index, value);
	return _this
}

Program.instructions.push = (variables, args) => { // pas test
	let _this = Program.getVariable(args[0], variables);
	let s = Program.getVariable(args[1], variables);

	_this.push(s);
	return _this
}

Program.instructions.concat = (variables, args) => { // pas test
	let _this = Program.getVariable(args[0], variables);
	let struct = Program.getVariable(args[1], variables);

	_this.concat(struct);
	return _this
}

Program.instructions.reduceWith = (variables, args, toVariable) => {
	let _this = Program.getVariable(args[0], variables);
	let _operation = Program.getOperation(args[1], {variables, args, toVariable});
	
	const value = _this.reduceWith(_operation);
	variables.set(toVariable, value);
	return value
}

Program.instructions.reverse = (variables, args) => { // pas test
	let _this = Program.getVariable(args[0], variables);
	
	_this.reverse();
	return _this
}

Program.instructions.map = (variables, args) => {
	// permet de gérer les fonctions qui dépendent de 2 variables : exemple "POW:x"
	[functionName, arg] = args[1].split(':');
	//
	let _this = Program.getVariable(args[0], variables);
	let _function = Program.getFunction(functionName, {variables, args});

	//console.log(args[0], _this, functionName, _function)
	if (arg) {
		const x = Program.getVariable(arg, variables);
		//console.log(arg, x)
		_this.map(i => _function(x,i));
	} else {
		_this.map(_function);
	}
	return _this
}

Program.instructions.index = (variables, args, toVariable) => { // pas test
	let _this = Program.getVariable(args[0], variables);

	const value = _this.index;
	variables.set(toVariable, value);
	return value
}

Program.instructions.length = (variables, args, toVariable) => {
	let _this = Program.getVariable(args[0], variables);

	const value = _this.length;
	variables.set(toVariable, value);
	return value
}

Program.instructions.convType1 = (variables, args) => { // pas test
	let _this = Program.getVariable(args[0], variables);
	let _innerOperation = Program.getOperation(args[1], {variables, args});
	let _outerOperation = Program.getOperation(args[2], {variables, args});
	let _struct = Program.getVariable(args[3], variables);
	
	_this.convType1(_innerOperation, _outerOperation, _struct);
	return _this
}

Program.instructions.convType2 = (variables, args) => { // pas test
	let _this = Program.getVariable(args[0], variables);
	let _innerOperation = Program.getOperation(args[1], {variables, args});
	let _outerOperation = Program.getOperation(args[2], {variables, args});
	let _struct = Program.getVariable(args[3], variables);
	
	_this.convType2(_innerOperation, _outerOperation, _struct);
	return _this
}

// Structure
/*
Program.instructions.join = (variables, args, toVariable) => {
	let a = Program.getVariable(args[0], variables);
	let b = Program.getVariable(args[1], variables);

	const value = Structure.join(a,b);
	variables.set(toVariable, value);
}
	push : (variables, args, toVariable) => {
		let struct = Program.getVariable(args[0], variables);
		let a = Program.getVariable(args[1], variables);

		const value = Structure.push(struct,a);
		variables.set(toVariable, value);
	},
	concat : (variables, args, toVariable) => {
		let structA = Program.getVariable(args[0], variables);
		let structB = Program.getVariable(args[1], variables);

		const value = Structure.concat(structA,structB);
		variables.set(toVariable, value);
	},
	id : (variables, args, toVariable) => {
		let n = Program.getVariable(args[0], variables);

		const value = Structure.id(n);
		variables.set(toVariable, value);
	},
	real : (variables, args, toVariable) => {
		let n = args[0];

		const value = Number(n);
		variables.set(toVariable, value);
	}*/


Program.instructions.cloneToClass = (variables, args, toVariable) => {
	// this.transferToClass('newClass')

	/*
	B = matrix(real(5), real(6))
	A = B.cloneToClass('vector')
	return:A => A = vector(real(5), real(6))
	*/
	
	let _this = Program.getVariable(args[0], variables);
	let className = args[1].toLowerCase();
	
	const value = _this.cloneToClass(className);
	variables.set(toVariable, value);
	return value
}

Program.applyMethod = (method, variables, args, toVariable) => {
	
	/*
	Peut être appelé à la place de :
		- instruction
		- operation
		- function

	Exemples :

	// instruction : "distanceTo"

	let [value]
	value = this.distanceTo(vector)


	// operation : "add"
	// matrix[vector[...], vector[...]]

	Matrix <- this.add(matrix)
	this.operation(add, matrix)


	// function : "at"
	// polyctor[polynom[P], polynom[Q]] --> vector[real[p], real[q]]

	this.map(at)

	// rajouter la possibilité de passer à une autre classe : ici de polyctor à vector
	// vector._constructor(..., [...polyctor.array])

	*/

	let objects = args.map( arg => Program.getVariable(arg, variables));

	if (!toVariable) {
		// mutable object
		return objects[0][method](...objects.slice(1))
	}
	// toVariable object
	const value = objects[0][method](...objects.slice(1));
	variables.set(toVariable, value);
	return value
}

// ===============================================================================================================================
// ===============================================================================================================================
//													STRUCTURE - OBJECTS 
// ===============================================================================================================================


class StructObject {

	constructor(array){
		this.array = array;
	}

	toString() {
		return `[${this.array.toString()}]`
	}

	copy(struct) {
		// struct(struct) -> struct
		this.array = [...struct.array];
		return this
	}

	clone() {
		// struct -> struct
		return new StructObject( [...this.array.map( s => Number.isFinite(s) ? s : s.clone() )] )
	}

	identity() {
		return this
	}

	operation(operation, struct) {
		// struct(operation, struct) -> struct
		// operation(+)[(1, 2, 3), (4, 5, 6)] = (5, 7, 9) 
		this.array = this.array.map( (e,i) => operation(e, struct.array[i]) );
		return this
	}

	slice(start, end) {
		// struct(int, int) -> struct
		// slice(1,2)[(1, 2, 3, 4)] = (2, 3)
		this.array = this.array.slice( start, end + 1 ); // end inclus !!!
		return this
	}

	get(index) {
		// struct(int) -> scalar
		const value = this.array[index];
		return value
	} 

	set(index, value) {
		// struct(int, *) -> struct
		this.array[index] = value;
		return this
	}

	push(s) {
		// struct(scalar) -> struct
		// push(1,2)[3] = (1,2,3)
		this.array.push(s);
		return this
	}

	concat(struct) {
		// struct(struct) -> struct
		// concat(1,2)[(3,4)] = (1,2,3,4)
		this.array = this.array.concat(struct.array);
		return this
	}

	reduceWith(operation) {
		// struct(operation) -> scalar
		// reduceWith(+)[(1, 2, 3)] = 1 + 2 + 3
		let value = this.array[0];
		for( let i = 1; i < this.array.length; i++){
			value = operation( value, this.array[i] );
		}

		return value
	}

	reverse() {
		// struct -> struct
		// reverse[(1, 2, 3)] = (3, 2, 1)
		const temp = [...this.array];
		const N = this.array.length;
		this.array = this.array.map( (e,i) => temp[N-1-i] );
		return this
	}

	map(_function) {
		// struct(function) -> struct
		// func(f)[(1, 2, 3)] = (f(1), f(2), f(3))
		this.array = this.array.map( e => _function(e));
		return this
	}

	get index() {
		// struct -> struct
		// index[(1, 2, 3)] = [0, 1, 2]
		const array = Array.from(this.array.keys());
		return new StructObject(array);
	}

	get length() {
		// struct -> int
		// length[(1, 2, 3)] = 3
		return this.array.length;
	}

	// méthodes non-élémentaires combinaison de celles ci-dessus

	convType1(innerOperation, outerOperation, struct) {
		// struct(operation, operation, struct) -> struct
		//(a0, a1) x (b0, b1) = (a0*b0, a1*b0+a0*b1, a1*b1)
		const N = this.length - 1;
		const f = i => {
			const start = Math.max(0, i-N);
			const end = Math.min(N, i);

			const tempA = this.clone().slice(start, end).reverse();
			
			const tempB = struct.clone().slice(start, end);

			tempA.operation(innerOperation, tempB);

			return tempA.reduceWith(outerOperation)
		}

		const id = StructObject.id( 2 * N + 1 );
		this.copy(id.map(f));
		return this
	}

	convType2(innerOperation, outerOperation, struct) {
		// struct(operation, operation, struct) -> struct
		//(a0, a1) x (b0, b1) = (a0*b1, a0*b0+a1*b1, a1*b0)
		
		const temp = struct.clone();
		temp.reverse();
		this.convType1(innerOperation, outerOperation, temp);

		return this
	}
}

// (scalar, scalar) -> struct
// join(a,b) = (a,b)
StructObject.join = (a,b) => new StructObject([a,b]);

// (struct, scalar) -> struct
// push((a,b),x) = (a,b,x)
StructObject.push = (struct,a) => struct.clone().push(a);

// (struct, struct) -> struct
// concat((a,b),(x,y)) = (a,b,x,y)
StructObject.concat = (structA,structB) => structA.clone().concat(structB);

// (int) -> struct
// id(3) = (0,1,2)
StructObject.id = n => new StructObject(Array.from(new Array(n).keys()));


// ===============================================================================================================================
// ===============================================================================================================================
//													STRUCTURE - CLASS 
// ===============================================================================================================================

class StructClass {
	constructor(name, program) {
		this.program = program;
		this.name = name;
		this.methods = new Map();
		this.objects = new Map();
		this.displayString = (object) => {
			return `${this.name}${object}`
		};
		this._constructor = (varName, array) => {

			// this : StructClass

			const structObject = new StructObject(array);

			// rajouter les méthodes
			for (let [methodKey, methodValue] of this.methods) {
				structObject[methodKey] = (...args) => {
					
					return this.applyMethod(methodKey, [structObject,...args]);
				}
			}
			
			structObject.toString = () => {
				return `${this.name}[${structObject.array}]`
			}

			structObject.clone = () => {
				return this._constructor('__TEMP__', [...structObject.array.map( s => Number.isFinite(s) ? s : s.clone() )] )
			};

			structObject.instanceof = this.name;

			structObject.cloneToClass = (className) => {
				const _class = this.program.structures.get(className);
				if (!_class) {
					throw Error(`Can not clone, because there is no class '${className}'`)
				}

				return _class._constructor('__TEMP__', [...structObject.array.map( s => Number.isFinite(s) ? s : s.clone() )] )
			}

			//structObject.index => typage

			this.objects.set(varName, structObject);


			return structObject
		}
	}

	addMethod(name, data) {
/*
METHOD = {
	class : STRING/Class_name,
	type : "METHOD",
	name : STRING/Name,
	data : {
		arguments : LIST of STRING/Args,
		variables : LIST of STRING/Variables,
		instructions : LIST of {
				name : STRING,
				arguments : LIST of STRING,
				toVariable : STRING or NULL,
			}/Instructions
		return : STRING/Return_value,
	}
	display : To Be Determined
}
*/
		this.methods.set(name, data);
	}

	addObject(toVariable, data) {
/*
OBJECT = {
	class : STRING/Class_name,
	type : "OBJECT",
	toVariable : STRING or NULL/Var_name,
	data : {
		arguments : LIST of STRING/Args,
		objects : LIST of {
				"name" : STRING,
				"object" : OBJECT,
			}/Objects
	}
}
*/
		const array = this.setupObject(data.objects, data.arguments);
		const object = this._constructor(toVariable, array)

		this.objects.set(toVariable, object);

		//console.log(array, object.toString())
		return object

	}

	setupObject(objects, args) {
		/*
		[obj:v0, obj:v1] <= setupObject(objects, ['v0', 'v1'])
		['v0', 'v1'].map( argName => new CLASS._constructor(__TEMP__, setupObject(['vi0', 'vi1'])) )
		*/
		/*
		console.table(objects)
		console.table(args)
		console.table(program)
		*/

		return args.map( arg => {

			if (Number.isFinite(Number(arg))) {
				//console.log(Number(arg))
				return Number(arg)
			}

			const objVar = objects.find( obj => obj.name === arg)
			
			if (!objVar) {
				// rajouter error si !obj
				throw Error(`Object ${arg} do not exist or has not been found`)
			}

			const obj = objVar.object;

			if (!obj.class) {
				// rajouter error si !obj.class => Mauvais format d'objet
				// risque de boucle infini
				throw Error(`Object ${arg} does not have a valid format. Can not proceed with it.`)
			}

			//console.log(obj);
			
			if (['real', 'integer'].includes(obj.class)) {
				return Program.builtinClass[obj.class]._constructor("__TEMP__", [obj.data.value]);
			}

			
			const _class = this.program.structures.get(obj.class)

			//console.warn("PROG", objects)
			return _class._constructor('__TEMP__', this.setupObject(objects, obj.data.arguments))
		})
	}


	applyMethod(name, _arguments) {
		/*
		// Exemple avec class Vector
		name : "add",
		_arguments : [obj, vector],
		*/

		let variables = new Map();
		const method = this.methods.get(name);
		const instructions = method.instructions;

		// récupération des arguments de la méthode
		for (let index in _arguments) {
			const argName = method.arguments[index];
			const arg = _arguments[index];
			variables.set( argName, arg );
		}

		// récupération des arguments de programmation
		for (let variable of method.variables) {
			variables.set( variable, 0 );
		}

		// exécution des instructions
		for (let instruction of instructions) {
			/*
			console.log("NAME : ", instruction.name)
			console.table([...variables.keys()])
			console.table(instruction.arguments)
			console.log("toVariable : ", instruction.toVariable)
			*/

			//Program.instructions[instruction.name](variables, instruction.arguments, instruction.toVariable);
			Program.getInstruction(instruction.name, {variables, args : instruction.arguments, toVariable : instruction.toVariable})
		}

		return Program.getVariable(method.return, variables);
	}
}

// =======================================================

Program.builtinClass = {
	real : new StructClass('real'),
	integer : new StructClass('integer'),
}


// ===============================================================================================================================
// ===============================================================================================================================
//													PARSER
// ===============================================================================================================================



// ======================================================
//					LEXER

function lexer(code) {
	code = `new:real\nnew:integer\n${code}`; // rajout des classes built in
	const instructions = code.split('\n').map( line => line.replaceAll(' ', ''));
	let lines = [];
	instructions.map( (line, index) => {
		if (line) {
			if (!line.startsWith('//')) {
				lines.push( { lineNumber : index, instruction : lineLexer(line)} );
			}
		}
	})
	return lines
}

function lineLexer(line) {
	//line = new:className
	const a = line.split(':');
	//a = [new, className]
	if (a[0] === 'new') {
		return classLexer(a[1])
	}
	if (a[0] === 'return') {
		return returnLexer(a[1])
	}
	if (a[0] === 'temp') {
		return subObjectLexer(...a.slice(1))
	}
	const b = a[0].split('<-')
	if (b.length > 1) {
		if (b[1] === 'method') {
			//Vector <- method:this.dot(other)
			return methodLexer(b[0], a[1])
		}
		if (b[1] === 'object') {
			return objectLexer(b[0], a[1])
		}
	}
	const c = line.split('[');
	//let[value,this_clone]
	if (c[0] === 'let') {
		return variablesLexer(c[1].slice(0, -1))
	}
	const d = c[0].split('=');
	if (d.length > 1) {
		return affectationLexer(d[0], d[1])
	}
	return mutableLexer(d[0])
}

function classLexer(className) {
	// new : CLASS_NAME
	//console.log('NEW_CLASS : ' , className)
	return { type : "newClass", class : className.toLowerCase()}
}

function returnLexer(varName) {
	// return : VAR_NAME
	//console.log('RETURN : ' , varName)
	return { type : "return", varName}
}

function subObjectLexer(subObject, args) {
	// temp : SUB_OBJECT
	const [toVariable, className, object] = subObject.replace('=','<-').split('<-')
	if (object !== 'object') {
		throw Error('incorrect syntax : object')
	}
	args = args.slice(1,-1).split(',')
	//console.log('SUB_OBJECT : ' , subObject, args.slice(1,-1).split(','))
	return { type : "subObject", toVariable, class : className.toLowerCase(), arguments : args}
}

function methodLexer(className, methodData) {
	// CLASS_NAME <- method : METHOD_DATA
	const a = methodData.split('.');
	if (a[0] === 'this') {
		const b = a.slice(1).join('.').split('(');
		const method = b[0];
		let args = b[1].slice(0, -1).split(',');
		if (args[0] === '') {args = []}
		args = ["this", ...args];
		//console.log(method, ["this", ...args])
		return {type : "method", class : className.toLowerCase(), data : {method, arguments : args}}
	}
	const c = methodData.split('(');
	const method = c[0];
	const args = c[1].slice(0, -1).split(',');
	//console.log('CLASS : ' , className, 'METHOD_DATA : ' , methodData)
	return {type : "method", class : className.toLowerCase(), data : {method, arguments : args}}
}

function objectLexer(className, objectData) {
	// CLASS_NAME <- object : OBJECT_DATA
	//console.log('CLASS : ' , className, 'OBJECT_DATA : ' , objectData.slice(1, -1).split(','))

	const a = objectData.split('[')
	const args = a[1].slice(0, -1).split(',');
	return {type : "object", class : className.toLowerCase(), arguments : args, toVariable : a[0] }
}

function variablesLexer(args) {
	// let[ARGS]
	let variables = args.split(',');
	if (variables[0] === '') {
		variables = []
	}
	//console.log('ARGS : ' , variables)
	return { type : "varMethod", variables}
}

function affectationLexer(toVariable, method) {
	// TO_VARIABLE = METHOD
	//console.log('TO_VARIABLE : ' , toVariable, 'METHOD : ' , method)
	const lexedMethod = mutableLexer(method);
	return { type : "toVariableInstruction", method : lexedMethod.method, arguments : lexedMethod.arguments, toVariable}
}

function mutableLexer(method) {
	// METHOD
	const a = method.split('.');
	if (a.length > 1) {
		const b = a.slice(1).join('.').split('(');
		const methodName = b[0];
		let args = b[1].slice(0, -1).split(',');
		if (args[0] === '') {args = []}
		args = [a[0], ...args];
		return { type : "mutableInstruction", method : methodName, arguments : args}
	}
	const c = method.split('(');
	const methodName = c[0];
	const args = c[1].slice(0, -1).split(',');
	 
	//console.log('METHOD : ' , method)
	return { type : "mutableInstruction", method : methodName, arguments : args}
	/*
	PENSER A MODIFIER car
	join(A) =/= A.join()

	créer un type supplémentaire ici et pour affectationLexer aussi
	*/
}


// ======================================================
//					PARSER


function parser(lexedCode) {
	let structures = [];
	let variables = [];

	let currentEntity;

	lexedCode.map( line => {
		const lineNumber = line.lineNumber;
		const instruction = line.instruction;
		

		if (instruction.type === "newClass") {
			//console.log(lineNumber, instruction)

			structures.push({
				class : instruction.class,
				type : "CLASS",
				methods : [],
				objects : []
			})
		}

		if (instruction.type === "method") {
			//console.log(lineNumber, instruction)

			const className = instruction.class;
			const _class = structures.find( c => c.class === className);
			_class.methods.push({
				class : className,
				type : "METHOD",
				name : instruction.data.method,
				data : {
					arguments : instruction.data.arguments,
					variables : [],
					instructions : [],
					return : null
				}
			})

			currentEntity = {
				type : "METHOD",
				class : className,
				name : instruction.data.method
			}
		}


		// currentEntity dependant
		if (instruction.type === "varMethod") {
			//console.log(lineNumber, instruction)

			if (currentEntity.type !== 'METHOD') {
				throw Error(`Can not define method's variables if component is not a method`)
			}

			const _class = structures.find( c => c.class === currentEntity.class);
			const method = _class.methods.find( m => m.name === currentEntity.name);
			method.data.variables.push(...instruction.variables)
		}
		
		// currentEntity dependant
		if (instruction.type === "mutableInstruction") {
			//console.log(lineNumber, instruction)

			if (currentEntity.type !== 'METHOD') {
				throw Error(`Can not define method's mutable instruction if component is not a method`)
			}

			const _class = structures.find( c => c.class === currentEntity.class);
			const method = _class.methods.find( m => m.name === currentEntity.name);
			method.data.instructions.push({
				name : instruction.method,
				arguments : [...instruction.arguments],
				toVariable : null,
			})
		}

		// currentEntity dependant
		if (instruction.type === "toVariableInstruction") {
			//console.log(lineNumber, instruction)

			if (currentEntity.type !== 'METHOD') {
				throw Error(`Can not define method's immutable instruction if component is not a method`)
			}

			const _class = structures.find( c => c.class === currentEntity.class);
			const method = _class.methods.find( m => m.name === currentEntity.name);
			method.data.instructions.push({
				name : instruction.method,
				arguments : [...instruction.arguments],
				toVariable : instruction.toVariable,
			})
		}

		// currentEntity dependant
		if (instruction.type === "return") {
			//console.log(lineNumber, instruction)

			if (currentEntity.type !== 'METHOD') {
				throw Error(`Can not return if component is not a method`)
			}

			const _class = structures.find( c => c.class === currentEntity.class);
			const method = _class.methods.find( m => m.name === currentEntity.name);
			method.data.return = instruction.varName

		}


		
		if (instruction.type === "object") {
			//console.log(lineNumber, instruction)


			const className = instruction.class;
			const _class = structures.find( c => c.class === className);

			_class.objects.push({
				class : className,
				type : "OBJECT",
				toVariable : instruction.toVariable,
				data : {
					arguments : [...instruction.arguments],
					objects : [],
					value : null
				}
			})

			variables.push({
				name : instruction.toVariable,
				instanceof : className,
			})


			currentEntity = {
				type : "OBJECT",
				class : className,
				name : instruction.toVariable
			}
			

			
		}


		if (instruction.type === "subObject") {
			//console.log(lineNumber, instruction)


			if (currentEntity.type !== 'OBJECT') {
				throw Error(`Can not define subObject if component is not an object`)
			}

			const _class = structures.find( c => c.class === currentEntity.class);
			const object = _class.objects.find( o => o.toVariable === currentEntity.name);
			
			const isBuiltInClass = ['real', 'integer'].includes(instruction.class);
			const value = isBuiltInClass ? Number(instruction.arguments[0]) : null;
			const args = isBuiltInClass ? [] : [...instruction.arguments]

			object.data.objects.push({
				name : instruction.toVariable,
				object : {
					class : instruction.class,
					type : "OBJECT",
					toVariable : null,
					data : {
						arguments : args,
						objects : [],
						value
					}
				}
			})

			/*{
				"name" : "v0",
				"object" : {
					class : "vector",
					type : "OBJECT",
					toVariable : null,
					data : {
						arguments : ["v00", "v01"],
						objects : []
					}
				}
			},*/
		}
	})

	return {structures, variables}
}


// ===============================================================================================================================
// ===============================================================================================================================
//													TEST
// ===============================================================================================================================
/*
const PROGRAM = {
	name : 'demo avec des vecteurs',
	version : '3.14',
	author : 'golto',
	license : 'MIT',
	structures : [
		{
			class : "vector",
			type : "CLASS",
			methods : [
				{
					class : "vector",
					type : "METHOD",
					name : "multiplyScalar",
					data : {
						arguments : ["this", "scalar"],
						variables : [],
						instructions : [
							{
								name : "map",
								arguments : ["this", "MULT:scalar"],
								toVariable : null,
							}
						],
						return : "this",
					},
					display : 'To Be Determined'
				},
				{
					class : "vector",
					type : "METHOD",
					name : "add",
					data : {
						arguments : ["this", "other"],
						variables : [],
						instructions : [
							{
								name : "operation",
								arguments : ["this", "PLUS", "other"],
								toVariable : null,
							}
						],
						return : "this",
					},
					display : 'To Be Determined'
				},
				{
					class : "vector",
					type : "METHOD",
					name : "dot",
					data : {
						arguments : ["this", "other"],
						variables : ["value", "this_clone"],
						instructions : [
							{
								name : "clone",
								arguments : ["this"],
								toVariable : "this_clone",
							},
							{
								name : "operation",
								arguments : ["this_clone", "TIMES", "other"],
								toVariable : null,
							},
							{
								name : "reduceWith",
								arguments : ["this_clone", "PLUS"],
								toVariable : "value",
							}
						],
						return : "value",
					},
					display : 'To Be Determined'
				},
				{
					class : "vector",
					type : "METHOD",
					name : "testVect",
					data : {
						arguments : ["this", "other"],
						variables : [],
						instructions : [
							{
								name : "add",
								arguments : ["this", "other"],
								toVariable : null,
							}
						],
						return : "this",
					},
					display : 'To Be Determined'
				},
				{
					class : "vector",
					type : "METHOD",
					name : "sum",
					data : {
						arguments : ["this"],
						variables : ["value"],
						instructions : [
							{
								name : "reduceWith",
								arguments : ["this", "PLUS"],
								toVariable : "value",
							}
						],
						return : "value",
					},
					display : 'To Be Determined'
				},

			],
			objects : [
				{
					class : "vector",
					type : "OBJECT",
					toVariable : "u",
					data : {
						arguments : ["v0", "v1"],
						objects : [
							{
								"name" : "v0",
								"object" : {
									class : "real",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : [],
										objects : [],
										value : 1.0
									}
								}
							},
							{
								"name" : "v1",
								"object" : {
									class : "real",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : [],
										objects : [],
										value : 2.0
									}
								}
							}
						]
					}
				},
				{
					class : "vector",
					type : "OBJECT",
					toVariable : "v",
					data : {
						arguments : ["v0", "v1"],
						objects : [
							{
								"name" : "v0",
								"object" : {
									class : "real",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : [],
										objects : [],
										value : -5.0
									}
								}
							},
							{
								"name" : "v1",
								"object" : {
									class : "real",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : [],
										objects : [],
										value : 7.0
									}
								}
							}
						]
					}
				}
			],
			display : 'To Be Determined'
		},


		{
			class : "matrix",
			type : "CLASS",
			methods : [
				{
					class : "matrix",
					type : "METHOD",
					name : "add",
					data : {
						arguments : ["this", "other"],
						variables : [],
						instructions : [
							{
								name : "operation",
								arguments : ["this", "add", "other"],
								toVariable : null,
							}
						],
						return : "this",
					},
					display : 'To Be Determined'
				},
				{
					class : "matrix",
					type : "METHOD",
					name : "innerSum",
					data : {
						arguments : ["this", "other"],
						variables : ["value"],
						instructions : [
							{
								name : "clone",
								arguments : ["this"],
								toVariable : "value",
							},
							{
								name : "map",
								arguments : ["value", "sum"],
								toVariable : null,
							},
							{
								name : "cloneToClass",
								arguments : ["value", "vector"],
								toVariable : "value",
							},
						],
						return : "value",
					},
					display : 'To Be Determined'
				}
			],
			objects : [
				{
					class : "matrix",
					type : "OBJECT",
					toVariable : "M",
					data : {
						arguments : ["v0", "v1"],
						objects : [
							{
								"name" : "v0",
								"object" : {
									class : "vector",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : ["v00", "v01"],
										objects : []
									}
								}
							},
							{
								"name" : "v1",
								"object" : {
									class : "vector",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : ["v10", "v11"],
										objects : [],
									}
								}
							},
							{
								"name" : "v00",
								"object" : {
									class : "real",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : [],
										objects : [],
										value : 1.0
									}
								}
							},
							{
								"name" : "v01",
								"object" : {
									class : "real",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : [],
										objects : [],
										value : 2.0
									}
								}
							},
							{
								"name" : "v10",
								"object" : {
									class : "real",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : [],
										objects : [],
										value : 3.0
									}
								}
							},
							{
								"name" : "v11",
								"object" : {
									class : "real",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : [],
										objects : [],
										value : 4.0
									}
								}
							},
						]
					}
				},
				{
					class : "matrix",
					type : "OBJECT",
					toVariable : "ID",
					data : {
						arguments : ["v0", "v1"],
						objects : [
							{
								"name" : "v0",
								"object" : {
									class : "vector",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : ["v00", "v01"],
										objects : []
									}
								}
							},
							{
								"name" : "v1",
								"object" : {
									class : "vector",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : ["v10", "v11"],
										objects : [],
									}
								}
							},
							{
								"name" : "v00",
								"object" : {
									class : "real",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : [],
										objects : [],
										value : 1.0
									}
								}
							},
							{
								"name" : "v01",
								"object" : {
									class : "real",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : [],
										objects : [],
										value : 0.0
									}
								}
							},
							{
								"name" : "v10",
								"object" : {
									class : "real",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : [],
										objects : [],
										value : 0.0
									}
								}
							},
							{
								"name" : "v11",
								"object" : {
									class : "real",
									type : "OBJECT",
									toVariable : null,
									data : {
										arguments : [],
										objects : [],
										value : 1.0
									}
								}
							},
						]
					}
				}
			],
			display : 'To Be Determined'
		}
	],
	variables : [
		{
			name : "u",
			instanceof : "vector",
		},
		{
			name : "v",
			instanceof : "vector",
		},
		{
			name : "M",
			instanceof : "matrix",
		},
		{
			name : "ID",
			instanceof : "matrix",
		}
	]
}
*/


/*
const RAW_PROGRAM =
`
new:Vector

Vector <- method:this.multiplyScalar(scalar)
let [vv0, vv1, vv2]
this.map(MULT:scalar)
return:this

Vector <- method:this.add(other)
let []
this.operation(PLUS, other)
return:this

Vector <- method:this.dot(other)
let [value, this_clone]
this_clone = this.clone()
this_clone.operation(TIMES, other)
value = this_clone.reduceWith(PLUS)
return:value

Vector <- method:this.testVect(other)
let []
this.add(other)
return:this

// commentaire

Vector <- method:this.sum()
let [value]
value = this.reduceWith(PLUS)
return:value

Vector <- object:u[v0, v1]
temp:v0 = Real <- object:[1.0]
temp:v1 = Real <- object:[2.0]

Vector <- object:v[v0, v1]
temp:v0 = Real <- object:[-5.0]
temp:v1 = Real <- object:[7.0]

new:Matrix

Matrix <- method:this.add(other)
let []
this.operation(add, other)
return:this

Matrix <- method:this.innerSum(other)
let [value]
value = this.clone()
value.map(sum)
value = value.cloneToClass(Vector)
return:this

Matrix <- object:M[v0, v1]
temp:v0 = Vector <- object:[v00, v01]
temp:v1 = Vector <- object:[v10, v11]
temp:v00 = Real <- object:[1.0]
temp:v01 = Real <- object:[2.0]
temp:v10 = Real <- object:[3.0]
temp:v11 = Real <- object:[4.0]

Matrix <- object:ID[v0, v1]
temp:v0 = Vector <- object:[v00, v01]
temp:v1 = Vector <- object:[v10, v11]
temp:v00 = Real <- object:[1.0]
temp:v01 = Real <- object:[0.0]
temp:v10 = Real <- object:[0.0]
temp:v11 = Real <- object:[1.0]
`*/



/*
const RAW_PROGRAM =
`
new:Real
Real <- object:x[2.0]
`

const lexed = lexer(RAW_PROGRAM)
const parsedCode = parser(lexed)

const PROGRAM = {
	name : 'demo avec des vecteurs',
	version : '3.14',
	author : 'golto',
	license : 'MIT',
	structures : parsedCode.structures,
	variables : parsedCode.variables
}

const PROGRAM_JSON = JSON.stringify(PROGRAM);

const _program = Program.import(PROGRAM_JSON);
*/

/*
const vector = _program.structures.get('vector');

const real = Program.builtinClass['real'];
const integer = Program.builtinClass['integer'];

const x = vector._constructor('__TEMP__', [
	real._constructor('__TEMP__', [7]),
	real._constructor('__TEMP__', [4]),
])

const y = vector._constructor('__TEMP__', [
	real._constructor('__TEMP__', [-1]),
	real._constructor('__TEMP__', [3]),
])

const u = _program.variables.get('u')
const v = _program.variables.get('v')
const M = _program.variables.get('M')
const ID = _program.variables.get('ID')

*/







/*

const matrix = new StructClass('matrix')
const line = new StructClass('line')
const real = new StructClass('real')

A = new StructObject([
		new StructObject([1,2]),
		new StructObject([3,4])
	])

B = matrix._constructor('A', [
		line._constructor('__TEMP__', [
			real._constructor('__TEMP__', [1]),
			real._constructor('__TEMP__', [2]),
		]),
		line._constructor('__TEMP__', [
			real._constructor('__TEMP__', [3]),
			real._constructor('__TEMP__', [4]),
		])
	])

C = matrix._constructor('A', [
		line._constructor('__TEMP__', [
			real._constructor('__TEMP__', [7]),
			real._constructor('__TEMP__', [4]),
		]),
		line._constructor('__TEMP__', [
			real._constructor('__TEMP__', [-3]),
			real._constructor('__TEMP__', [0]),
		])
	])

x = real._constructor('__TEMP__', [7])

u = line._constructor('__TEMP__', [
		real._constructor('__TEMP__', [7]),
		real._constructor('__TEMP__', [4]),
	])

console.log(`Sans StructClass A :\n${A}`)
console.log(`Avec StructClass B :\n${B}`)
console.log(`Avec StructClass C :\n${C}`)
console.log(`Avec StructClass x :\n${x}`)
console.log(`Avec StructClass u :\n${u}`)

*/

/*
x.toString()
y.toString()
x.add(y).toString()
x.multiplyScalar(real._constructor([2]))

*/