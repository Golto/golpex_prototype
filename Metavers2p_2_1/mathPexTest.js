

/* ====================================== STRUCTURE ====================================== */

class Structure {

	constructor(array){
		this.array = array;
	}

	toString() {
		return `[${this.array.toString()}]`
	}

	copy(struct) {
		this.array = [...struct.array];
		return this
	}

	clone() {
		return new Structure([...this.array])
	}

	classic(operation, struct) {
		// classic(+)[(1, 2, 3), (4, 5, 6)] = (5, 7, 9) 
		this.array = this.array.map( (e,i) => operation(e, struct.array[i]) );
		return this
	}

	slice(start, end) {
		// slice(1,2)[(1, 2, 3, 4)] = (2, 3)
		this.array = this.array.slice( start, end + 1 ); // end inclus !!!
		return this
	}

	push(s) {
		// push(1,2)[3] = (1,2,3)
		this.array.push(s);
		return this
	}

	concat(struct) {
		// concat(1,2)[(3,4)] = (1,2,3,4)
		this.array = this.array.concat(struct.array);
		return this
	}

	apply(operation) {
		// apply(+)[(1, 2, 3)] = 1 + 2 + 3
		let value = this.array[0];
		for( let i = 1; i < this.array.length; i++){
			value = operation( value, this.array[i] );
		}

		return value
	}

	reverse() {
		// reverse[(1, 2, 3)] = (3, 2, 1)
		const temp = [...this.array];
		const N = this.array.length;
		this.array = this.array.map( (e,i) => temp[N-1-i] );
		return this
	}

	func(_function) {
		// func(f)[(1, 2, 3)] = (f(1), f(2), f(3))
		this.array = this.array.map( e => _function(e));
		return this
	}

	get index() {
		// index[(1, 2, 3)] = [0, 1, 2]
		const array = Array.from(this.array.keys());
		return new Structure(array);
	}

	get length() {
		return this.array.length;
	}

	// méthodes non-élémentaires combinaison de celles ci-dessus

	convType1(innerOperation, outerOperation, struct) {
		//(a0, a1) x (b0, b1) = (a0*b0, a1*b0+a0*b1, a1*b1)
		const N = this.length - 1;
		const f = i => {
			const start = Math.max(0, i-N);
			const end = Math.min(N, i);

			const tempA = this.clone().slice(start, end).reverse();
			
			const tempB = struct.clone().slice(start, end);

			tempA.classic(innerOperation, tempB);

			return tempA.apply(outerOperation)
		}

		const id = Structure.id( 2 * N + 1 );
		this.copy(id.func(f));
		return this
	}

	convType2(innerOperation, outerOperation, struct) {
		//(a0, a1) x (b0, b1) = (a0*b1, a0*b0+a1*b1, a1*b0)
		
		const temp = struct.clone();
		temp.reverse();
		this.convType1(innerOperation, outerOperation, temp);

		return this
	}
}

Structure.join = (a,b) => new Structure([a,b]);							// join(a,b) = (a,b)
Structure.push = (struct,a) => struct.clone().push(a);					// push((a,b),x) = (a,b,x)
Structure.concat = (structA,structB) => structA.clone().concat(structB);// concat((a,b),(x,y)) = (a,b,x,y)
Structure.id = n => new Structure(Array.from(new Array(n).keys()));		// id(3) = (0,1,2)


Structure.VARIABLES = new Map();

/* ====================================== STRUCTURE BUILDER ====================================== */

class StructureBuilder {
	constructor(name) {
		this.name = name;
		this.methods = new Map();
		this.objects = new Map();
		this.__constructor = (varName, array) => {
			const struct = new Structure(array);

			for (let [methodKey, methodValue] of this.methods) {
				struct[methodKey] = function(...args){

					return StructureBuilder.classes.get(name).applyMethod(methodKey, [this,...args]);
				}
			}

			struct.instanceOf = this.name;

			struct.copy = s => {
				struct.array = [...s.array];
				return struct
			};
			struct.clone = () => {
				return this.__constructor([...struct.array])
			};
			this.objects.set(varName, struct);
			
			return struct
		}

		StructureBuilder.classes.set(name, this);
	}

	newMethod(name, data) {
		/*
		// Exemple avec class Vector
		{
			name : "add",
			data : {
				arguments : ["this", "vector"],
				variables : [],
				instructions : [
					{
						"name" : "classic",
						"arguments" : ["this", "PLUS", "vector"],
						"toVariable" : null,
					}
				]
				"return" : "this",
			}
		}
		*/
		this.methods.set(name, data);
		this.updateMethods();
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

			StructureBuilder.execute[instruction.name](variables, instruction.arguments, instruction.toVariable);

		}

		return variables.get(method.return);
	}

	updateMethods() {
		// objects created before newMethod, get updated to have new methods
		const name = this.name;
		for (let [key, object] of this.objects) {
			for (let [methodKey, methodValue] of this.methods) {

				object[methodKey] = function(...args){
					return StructureBuilder.classes.get(name).applyMethod(methodKey, [this,...args]);
				}
			}
		}
		
		return this
	}

	execMethodCode(input) {
		let code = input.split('\n');
		const res = readMethodCode(code);
		this.newMethod(
			res.name,
			res.data
		)
	}

	execObjectLine(input) {
		let line = input.split('\n')[0];
		const res = readObjectLine(line);
		Structure.VARIABLES.set(
			res.object_name,
			this.__constructor(res.args)
		)
	}
}

StructureBuilder.operations = {
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

StructureBuilder.functions = {
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



StructureBuilder.execute = {
	copy : (variables, args) => {	// pas test
		let _this = variables.get(args[0]);
		let _struct = variables.get(args[1]);
		
		_this.copy(_struct);
	},
	clone : (variables, args, toVariable) => { // pas test
		let _this = variables.get(args[0]);

		const value = _this.clone();
		variables.set(toVariable, value);
	},
	classic : (variables, args) => {
		let _this = variables.get(args[0]);
		let _operation = StructureBuilder.operations[args[1]];
		let _struct = variables.get(args[2]);
		
		_this.classic(_operation, _struct);
	},
	slice : (variables, args) => {
		let _this = variables.get(args[0]);
		let start = variables.get(args[1]);
		let end = variables.get(args[2]);

		_this.slice(start, end);
	},
	push : (variables, args) => { // pas test
		let _this = variables.get(args[0]);
		let s = variables.get(args[1]);

		_this.push(s);
	},
	concat : (variables, args) => { // pas test
		let _this = variables.get(args[0]);
		let struct = variables.get(args[1]);

		_this.concat(struct);
	},
	apply : (variables, args, toVariable) => {
		let _this = variables.get(args[0]);
		let _operation = StructureBuilder.operations[args[1]];
		
		const value = _this.apply(_operation);;
		variables.set(toVariable, value);
	},
	reverse : (variables, args) => { // pas test
		let _this = variables.get(args[0]);
		
		_this.reverse();
	},
	func : (variables, args) => {
		// permet de gérer les fonctions qui dépendent de 2 variables : exemple "POW:x"
		[functionName, arg] = args[1].split(':');
		//
		let _this = variables.get(args[0]);
		let _function = StructureBuilder.functions[functionName];

		if (arg) {
			const x = variables.get(arg);
			const temp = i => _function(x,i);
			_this.func(temp);
		} else {
			_this.func(_function);
		}
	},
	index : (variables, args, toVariable) => { // pas test
		let _this = variables.get(args[0]);

		const value = _this.index;
		variables.set(toVariable, value);
	},
	length : (variables, args, toVariable) => {
		let _this = variables.get(args[0]);

		const value = _this.length;
		variables.set(toVariable, value);
	},
	convType1 : (variables, args) => { // pas test
		let _this = variables.get(args[0]);
		let _innerOperation = StructureBuilder.operations[args[1]];
		let _outerOperation = StructureBuilder.operations[args[2]];
		let _struct = variables.get(args[3]);
		
		_this.convType1(_innerOperation, _outerOperation, _struct);
	},
	convType2 : (variables, args) => { // pas test
		let _this = variables.get(args[0]);
		let _innerOperation = StructureBuilder.operations[args[1]];
		let _outerOperation = StructureBuilder.operations[args[2]];
		let _struct = variables.get(args[3]);
		
		_this.convType2(_innerOperation, _outerOperation, _struct);
	},
	// Structure

	join : (variables, args, toVariable) => {
		let a = variables.get(args[0]);
		let b = variables.get(args[1]);

		const value = Structure.join(a,b);
		variables.set(toVariable, value);
	},
	push : (variables, args, toVariable) => {
		let struct = variables.get(args[0]);
		let a = variables.get(args[1]);

		const value = Structure.push(struct,a);
		variables.set(toVariable, value);
	},
	concat : (variables, args, toVariable) => {
		let structA = variables.get(args[0]);
		let structB = variables.get(args[1]);

		const value = Structure.concat(structA,structB);
		variables.set(toVariable, value);
	},
	id : (variables, args, toVariable) => {
		let n = variables.get(args[0]);

		const value = Structure.id(n);
		variables.set(toVariable, value);
	},
	real : (variables, args, toVariable) => {
		let n = args[0];

		const value = Number(n);
		variables.set(toVariable, value);
	},
}

StructureBuilder.classes = new Map;






function readObjectLine(line) {
	line = line.replaceAll(' ','');

	let a = line.split(':');
	if (a[0] === 'object') {
		let b = a[1].split('(')
		const OBJECT_NAME = b[0];
		const ARGS = b[1].split(')')[0].split(',')
		return {role : 'object', object_name : OBJECT_NAME, args : ARGS }
	}
}

// à refaire pour pouvoir créer des objets plus complexes que : object:A(1,2,3)
// comme par exemple :
/*
object:MAT(line1, line2, line3)
MatrixLine <- object:line1(1,2,3)
MatrixLine <- object:line1(2,0,4)
MatrixLine <- object:line1(1,5,0)
*/
// line1, line2, line3 : sont des variables temporaires ici




function readMethodLine(line) {
	line = line.replaceAll(' ','')

	let a = line.split(':')
	if(a[0] === 'method'){
		let b = a[1].split('(')
		const METHOD_NAME = b[0]
		const ARGS = b[1].split(')')[0].split(',')
		return {role : 'method', method_name : METHOD_NAME, args : ARGS }
	}
	if(a[0] === 'return'){
		const VARIABLE = a[1]
		return {role : 'return', variable : VARIABLE }
	}


	a = a[0]
	let c = a.split('[')
	if(c[0] === 'let'){
		const VARIABLES = c[1].split(']')[0].split(',')
		return {role : 'let', variables : VARIABLES }
	}
	if (a.includes('=')) {
		let d = a.split("=")
		const TO_VARIABLE = d[0]
		d = d[1].split('(')
		const METHOD_NAME = d[0]
		const ARGS = d[1].split(')')[0].split(',')
		return {role : 'assign', method_name : METHOD_NAME, args : ARGS, to_variable : TO_VARIABLE }
	}
	//
	let e = line.split('(')
	const METHOD_NAME = e[0]
	const ARGS = e[1].split(')')[0].split(',')
	return {role : 'function', method_name : METHOD_NAME, args : ARGS }
}

function readMethodCode(code) { // code : Array of Line
	let name, _arguments, variables, _return;
	let instructions = [];

	for (let line of code) {
		const res = readMethodLine(line);
		if (res.role === 'method') {
			name = res.method_name;
			_arguments = res.args;
		}
		if (res.role === 'let') {
			variables = res.variables;
		}
		if (res.role === 'assign') {
			const obj = {
				name : res.method_name,
				arguments : res.args,
				toVariable: res.to_variable
			}
			instructions.push(obj)
		}
		if (res.role === 'function') {
			const obj = {
				name : res.method_name,
				arguments : res.args,
				toVariable: null
			}
			instructions.push(obj)
		}
		if (res.role === 'return') {
			_return = res.variable
		}
	}

	const interpretation = {
		name : name,
		data : {
			arguments : _arguments,
			variables : variables,
			instructions : instructions,
			return : _return
		}
	}
	return interpretation
}


/*
code = "method:at(this, x)\nlet [deg, id, value]\ndeg = length(this)\nid = struct_id(deg)\nfunc(id, POW:x)\nclassic(id, TIMES, this)\nvalue = apply(id, PLUS)\nreturn:value";
codeC = readCode(code.split('\n'));
JSON.stringify(codeC) 
*/

polynom = new StructureBuilder('polynom');

polynom.execMethodCode(`method:add(this, polynom)
let []
classic(this, PLUS, polynom)
return:this`);

polynom.execMethodCode(`method:multiply(this, polynom)
let []
convType1(this, TIMES, PLUS, polynom)
return:this`);

polynom.execMethodCode(`method:at(this, x)
let [id, value]
id = index(this)
func(id, POW:x)
classic(id, TIMES, this)
value = apply(id, PLUS)
return:value`);

polynom.execMethodCode(`method:derivate(this)
let [deg, id, one]
one = real(1)
deg = length(this)
id = index(this)
classic(this, TIMES, id)
slice(this, one, deg)
return:this`);

a = polynom.__constructor([1,2,3,4]);
b = polynom.__constructor([2,3,4,5]);

console.warn('import mathPex');
//export {Structure, StructureBuilder}


//let outputElement = document.getElementById('golpexMath').getElementsByClassName('container')[0].getElementsByClassName('output')[0]



function newClass(name) {
	return new StructureBuilder(name);
}

function addNewMethod(code, className) {
	StructureBuilder.classes.get(className).execMethodCode(code);
}

function addNewObject(code, className) {
	StructureBuilder.classes.get(className).execObjectLine(code);
}