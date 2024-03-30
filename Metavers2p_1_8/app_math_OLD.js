import * as bp from './brainPex.js';

//GO_TO_RENDERER('golpexMath')

const handler = new bp.AppHandler(
	'menu',
	'golpexMath'
)

handler.output = new bp.Output(
	handler.element,
)
handler.output.element.classList.add('padding');
//handler.output.printLog(`Exemple : Soit u et v des vecteurs, tel que u = 2v, que vaut u si 2u+v = (0 15 35) ?`);

handler.output.printLog(`
this.multiply(polynom){
	this.convType1(TIMES, PLUS, polynom);
	return this
}
`);

handler.input = new bp.Input(
	handler.element,
	input => {
		multiTask(input);
	},
	'Tapez ici un problème de maths'
)



async function multiTask(input){
	console.log(Vector)

	let res = await LLM_Javascript2GolpexCode(input);
	//console.log('js2golp',res, res.is_a_method, res.golpex_code);
	if (!res.is_a_method) return 0

	res = await LLM_GolpexCode2JSON(res.golpex_code.join('\n') );
	//console.log('golp2json', res.name, res);

	Vector.newMethod(
		res.name,
		res.data
	)

	console.log(Vector)

	

	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}	



/*
Soit u et v des vecteurs, tel que u = 2v, que vaut u si 2u+v = (0 1 2) ?

u : vecteur 3
v : vecteur 3

v = ('x unk', 'y unk', 'z unk')
u = ('2*x unk', '2*y unk', '2*z unk')
2u = ('4*x unk', '4*y unk', '4*z unk')
2u+v = ('5*x unk', '5*y unk', '5*z unk')
'5*x unk' = 0 & '5*y unk' = 1 & '5*z unk' = 2
'x unk' = 0/5 frac & 'y unk' = 1/5 frac & 'z unk' = 2/5 frac
v = (0/5, 1/5, 2/5)
u = (0/5, 2/5, 4/5)



### instructions :
D'un problème mathématique donné, récupères tous les objets mathématiques et retourne response sous le format :
{ "objects" : LIST of { "variable_name" : STRING, "type" : STRING } }
### input :
Soit u et v des vecteurs, tel que u = 2v, que vaut u si 2u+v = (0 15 35) ?
### response :
{
  "objects": [
	{
	  "variable_name": "u",
	  "type": "vector"
	},
	{
	  "variable_name": "v",
	  "type": "vector"
	}
  ]
}



*/



/*

### instructions :
D'un problème mathématique donné, récupères tous les objets mathématiques et retourne response sous le format :
{ "objects" : LIST of { "variable_name" : STRING, "type" : STRING, "isKnown" : BOOL } }
### input :
Soit u et v des vecteurs, tel que u = 2v, que vaut u si v = (0 15 35) ?
### response :
{
	"objects": [
	{
		"variable_name": "u",
		"type": "vecteur",
		"isKnown": false
	},
	{
		"variable_name": "v",
		"type": "vecteur",
		"isKnown": true
	}
	]
}<END>
### input :
Soit u polynôme, tel que deg(u)=1 u(0)=1 et u'(0)=2, que vaut u?
### response :

*/

/*
### instructions :
D'un problème mathématique donné, récupères tous les objets mathématiques et retourne response sous le format :
{ "objects" : LIST of { "variable_name" : STRING, "type" : STRING, "isKnown" : BOOL } }
### input :
Soit u et v des vecteurs, tel que u = 2v, que vaut u si v = (0 15 35) ?
### response :
{
"objects": [
{
"variable_name": "u",
"type": "vecteur",
"isKnown": false
},
{
"variable_name": "v",
"type": "vecteur",
"isKnown": true
}
]
} <END>
### input :
Soit u polynôme, tel que deg(u)=1 u(0)=1 et u'(0)=2, que vaut u?
### response :
{
"objects": [
{
"variable_name": "u",
"type": "polynôme",
"isKnown": false
}
]
}<END>
*/

// https://www.mathcha.io/editor/kgKLXherUZnHEPOYy9ilYJk1CeLyr4kI693ZXe
class Structure {

	constructor(array){
		this.array = array;
	}

	toString() {
		return `[${this.array.toString()}]`
	}

	id() {
		return this
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
	/*
	{
		"name" : "classic",
		"arguments" : [this, operation, struct],
		"toVariable" : null,
	}
	*/

	slice(start, end) {
		// slice(1,2)[(1, 2, 3, 4)] = (2, 3)
		this.array = this.array.slice( start, end + 1 ); // end inclus !!!
		return this
	}
	/*
	{
		"name" : "slice",
		"arguments" : [this, start, end],
		"toVariable" : null,
	}
	*/

	apply(operation) {
		// apply(+)[(1, 2, 3)] = 1 + 2 + 3
		let value = this.array[0];
		for( let i = 1; i < this.array.length; i++){
			value = operation( value, this.array[i] );
		}

		return value
	}
	/*
	{
		"name" : "apply",
		"arguments" : [this, operation],
		"toVariable" : string,
	}
	*/


	reverse() {
		// reverse[(1, 2, 3)] = (3, 2, 1)
		const temp = [...this.array];
		const N = this.array.length;
		this.array = this.array.map( (e,i) => temp[N-1-i] );
		return this
	}
	/*
	{
		"name" : "reverse",
		"arguments" : [this],
		"toVariable" : null,
	}
	*/

	func(_function) {
		// func(f)[(1, 2, 3)] = (f(1), f(2), f(3))
		this.array = this.array.map( e => _function(e));
		return this
	}
	/*
	{
		"name" : "func",
		"arguments" : [this, function],
		"toVariable" : null,
	}
	*/

	get index() {
		// index[(1, 2, 3)] = [0, 1, 2]
		const array = Array.from(this.array.keys());
		return new Int8Array(array);  //opti nécessaire ?
	}
	/*
	{
		"name" : "index",
		"arguments" : [this],
		"toVariable" : string,
	}
	*/

	get length() {
		return this.array.length;
	}
	/*
	{
		"name" : "length",
		"arguments" : [this],
		"toVariable" : string,
	}
	*/


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
	/*
	{
		"name" : "convType1",
		"arguments" : [this, innerOperation, outerOperation, struct],
		"toVariable" : null,
	}
	*/

	convType2(innerOperation, outerOperation, struct) {
		//(a0, a1) x (b0, b1) = (a0*b1, a1*b0+a0*b1, a1*b0)
		
		const temp = struct.clone();
		temp.reverse();
		this.convType1(innerOperation, outerOperation, temp);

		return this
	}
	/*
	{
		"name" : "convType2",
		"arguments" : [this, innerOperation, outerOperation, struct],
		"toVariable" : null,
	}
	*/
}

Structure.join = (...args) => new Structure(args);    // join(a,b) = (a,b)
Structure.id = n => new Structure(Array.from(new Array(n).keys())); // id(3) = (0,1,2)

const PLUS = (a,b) => a+b
const TIMES = (a,b) => a*b
const COMPOSE = (f,g) => x => f(g(x))

class StructureBuilder {
	constructor(name) {
		this.name = name;
		this.methods = new Map();
		this.__constructor = (array) => {
			const struct = new Structure(array);

			for (let [methodKey, methodValue] of this.methods) {
				struct[methodKey] = function(...args){
					return name.applyMethod(methodKey, [this,...args])//Polynom.applyMethod(methodKey, [this,...args])

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
			
			return struct
		}

		StructureBuilder.classes.set(name, this);
	}

	toJson() {
		const methods = [];
		for (let [name, data] of this.methods) {
			methods.push({
				name : name,
				data : data
			})
		}
		return JSON.stringify({
			name : this.name,
			methods : methods
			},
		)
	}

	fromJson(json) {
		// security risk : JSON injection
		//JSON.parse(json)
		return 0
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

	execCode(input) {
		let code = input.split('\n');
		const res = readCode(code);
		this.newMethod(
			res.name,
			res.data
		)
	}
}

StructureBuilder.operations = {
	PLUS : PLUS,
	TIMES : TIMES,
	COMPOSE : COMPOSE,
}

StructureBuilder.functions = {
	ADD : (x,i) => x + i,
	SUB : (x,i) => x - i,
	MULT : (x,i) => x * i,
	DIV : (x,i) => x / i,
	POW : (x,i) => x ** i,
	POWEXP : (x,i) => i ** x,
	EXP : x => Math.exp(x),
	LN : x => Math.log(x),
	ABS : x => Math.abs(x),
}

StructureBuilder.execute = {
	copy : (variables, args) => {	// pas test
		let _this = variables.get(args[0]);
		let _struct = variables.get(args[1]);
		
		_this.copy(_struct);
	},
	clone : (variables, args, toVariable) => { // pas test
		0
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
		// permet de gérer les fonctions qui dépendent de 2 variables : exemple "POW>x"
		[functionName, arg] = args[1].split('_');
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
	struct_join : 0,
	struct_id : (variables, args, toVariable) => {
		let n = variables.get(args[0]);

		const value = Structure.id(n);
		variables.set(toVariable, value);
	},
}

StructureBuilder.classes = new Map;

//------------------------------------

const Vector = new StructureBuilder('Vector');
const Polynom = new StructureBuilder('Polynom');
const Rational = new StructureBuilder('Rational');
const Complex = new StructureBuilder('Complex');

// vector

Vector.execCode(`method:add(this, vector)
let []
classic(this, PLUS, vector)
return:this`)

Vector.execCode(`method:dotProduct(this, vector)
let [value]
classic(this, TIMES, vector)
value = apply(this, PLUS)
return:value`)

// polynom

Polynom.execCode(`method:add(this, polynom)
let []
classic(this, PLUS, polynom)
return:this`)

Polynom.execCode(`method:multiply(this, polynom)
let []
convType1(this, TIMES, PLUS, polynom)
return:this`)

Polynom.execCode(`method:at(this, x)
let [deg, id, value]
deg = length(this)
id = struct_id(deg)
func(id, POW_x)
classic(id, TIMES, this)
value = apply(id, PLUS)
return:value`)














function outputCleaner(output) {
	const cleanList = ['#ars', 'package com', '#this', '#<END', '#include', '###', '<END>', '# 19', 'Tags:', '# END', '# 1.']
	for (let token of cleanList) {
		output = output.split(token)[0];
	}
	return output
}

async function LLM_Javascript2GolpexCode(input){
	let cost = bp.API_Counter.LLM;

	const prompt = `### instructions :
Given a code in javascript that represents a class method. Returns in the JSON format :
{
    "is_a_method" : BOOL,
    "golpex_code" : LIST of STRING,
}
### input :
this.at(x) {
    const deg = this.length;
    const id = Structure.id(deg);
    id.func( i => x ** i);
    id.classic(TIMES, this);
    const value = id.apply(PLUS);
    return value
}
### response :
{
    "is_a_method" : true,
    "golpex_code" : [
        "method:at(this, x)",
        "let [deg, id, value]",
        "deg = length(this)",
        "id = struct_id(deg)",
        "func(id, POW_x)",
        "classic(id, TIMES, this)",
        "value = apply(id, PLUS)",
        "return:value"
    ]
}
### input :
this.dotProduct(vector){
    this.classic(TIMES, vector);
    let value = this.apply(PLUS);
    return value
}
### response :
{
    "is_a_method": true,
    "golpex_code": [
        "let [value]",
        "method:dotProduct(this, vector)",
        "classic(this, TIMES, vector)",
        "value = apply(this, PLUS)",
        "return:value"
    ]
}
### input :
${input}
### response :`;
	let res = await bp.promptIteratorLLM(prompt, 5, false);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Javascript2GolpexCode : ','Coût = ' + cost);
	console.log(res, output)

	output = outputCleaner(output);
	output = output.replaceAll('\n','').replaceAll('\t','');
	return JSON.parse(output)
}

async function LLM_GolpexCode2JSON(input){
	let cost = bp.API_Counter.LLM;

	const prompt = `### instructions :
Given a code in strict language code that represents a class method. Returns the JSON format that is equivalent:
### input :
method:at(this, x)
let [deg, id, value]
deg = length(this)
id = struct_id(deg)
func(id, POW_x)
classic(id, TIMES, this)
value = apply(id, PLUS)
return:value
### response :
{
	"name": "at",
	"data": {
		"arguments": ["this", "x"],
		"variables": ["deg", "id", "value"],
		"instructions": [
			{
				"name": "length",
				"arguments": ["this"],
				"toVariable": "deg"
			},
			{
				"name": "struct_id",
				"arguments": ["deg"],
				"toVariable": "id"
			},
			{
				"name": "func",
				"arguments": ["id", "POW_x"],
				"toVariable": null
			},
			{
				"name": "classic",
				"arguments": ["id", "TIMES", "this"],
				"toVariable": null
			},
			{
				"name": "apply",
				"arguments": ["id", "PLUS"],
				"toVariable": "value"
			}
		],
		"return": "value"
	}
}
### input :
${input}
### response :`;
	let res = await bp.promptIteratorLLM(prompt, 10, false);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Javascript2GolpexCode : ','Coût = ' + cost);
	console.log(res)

	output = outputCleaner(output);
	output = output.replaceAll('\n','').replaceAll('\t','');
	return JSON.parse(output)
}

/*
this.dotProduct(vector){
    this.classic(TIMES, vector);
    let value = this.apply(PLUS);
    return value
}

this.multiply(polynom){
    this.convType1(TIMES, PLUS, polynom);
    return this
}
*/

/*

"Créer une nouvelle classe : 'Rigolôme'" ---> NEW_CLASS
"Rajoutes une méthode à 'Rigolôme'" ---> NEW_METHOD(await args,instructions)


lire golpex code :

let line = "method:at(this, x)" / "let [deg, id, value]"
line = line.replaceAll(' ','')

let a = line.split(':')
if(a[0] === 'method'){
	let b = a.split('(')
	METHOD_NAME = b[0]
	ARGS = b[1].split(')')[0].split(',')
}

a = a[0]
let c = a.split('[')
if(c[0] === 'let'){
	VARIABLES = c[1].split(']')[0].split(',')
}
*/

function readLine(line) {
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
	let e = a.split('(')
	const METHOD_NAME = e[0]
	const ARGS = e[1].split(')')[0].split(',')
	return {role : 'function', method_name : METHOD_NAME, args : ARGS }
}

function readCode(code) { // code : Array of Line
	let name, _arguments, variables, _return;
	let instructions = [];

	for (let line of code) {
		const res = readLine(line);
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
code = `method:at(this, x)
let [deg, id, value]
deg = length(this)
id = struct_id(deg)
func(id, POW_x)
classic(id, TIMES, this)
value = apply(id, PLUS)
return:value`.split('\n')
*/

const text_area = document.getElementById('golpexMath_txtArea')
golpexMath_txtArea.addEventListener('keyup', txtArea_handle);

function txtArea_handle(e) {
	const input = text_area.value;
	console.log(e.key)
	if(e.key === 'ArrowRight'){
		onExec(input);
	}
}

function onExec(input) {
	let code = input.split('\n');
	const res = readCode(code);
	console.log(res)
}


handler.classBar = new bp.Output(
	handler.element,
)
/*
position: absolute;
right: 0%;
top: 0%;
margin: 0;
width: 30%;
height: 100%;
*/

function addElementClass(name) {
	const element = document.createElement('button');
	element.innerText = `${name}`;
	element.addEventListener('click', function(){


	});
	element.setAttribute('name', name);
	element.classList.add('golpex-menu-element');
	handler.classBar.element.appendChild(element);
}
addElementClass('vector')
addElementClass('polynom')

/*
<div class="output golpex-math-element">
	<div class="div-centered column">
		<div class="div-centered row">
			<button class='spaced'>MOINS</button>
			<p class='spaced'>Polynom</p>
		</div>
		<div class="div-centered row">
			<div class="div-centered column">
				<div class="div-centered row">
					<button>MOINS</button>
					<button>MODIF</button>
					<p>add</p>
				</div>
			</div>
			<div class="div-centered column">
				<div class="div-centered row">
					<button>MOINS</button>
					<button>MODIF</button>
					<p>a[1,2,3]</p>
				</div>

			</div>
		</div>
	</div>
	<!-- -->
	<div class="div-centered column">
		<div class="div-centered row">
			<button>MOINS</button>
			<p>Vector</p>
		</div>
		<div class="div-centered row">
			<div class="div-centered column">
				<div class="div-centered row">
					<button>MOINS</button>
					<button>MODIF</button>
					<p>dotProduct</p>
				</div>
			</div>
			<div class="div-centered column">
				<div class="div-centered row">
					<button>MOINS</button>
					<button>MODIF</button>
					<p>b[1,2,7]</p>
				</div>

			</div>
		</div>
	</div>
	<!-- -->
	<div class="div-centered column">
		<button>PLUS</button>
	</div>
</div>
*/

/*
.golpex-math-element

position: absolute;
right: 0;
top: 0;
margin: 0;
width: 300px;
max-height: 100%;
height: 100%;
*/

/*
.golpex-math-element children

height: auto;
min-height: 100px;
*/

/*
width: 100%;
*/
/*
.spaced

padding: 10px;
margin: 10px;
*/



/*
Faire un chatbot avec des maths intégrés dedans sous forme de bouton

Texte normal => <p></p>
Code => <pre></pre> + <span color>
Vecteur/Matrice/... => <div container> modify/rename/delete + LATEX/MathML </div>

.slice(1,-1).split(',').map(e=>Number(e))
'(1, 2, 3)' => Array[1,2,3]
*/