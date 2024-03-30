// ===============================================================================================================================
// ===============================================================================================================================
//													IMPORT
// ===============================================================================================================================

import * as bp from './brainPex.js';
import * as mp from './mathPex.js';

let app, promptInput, chatOutput, lds;


function updateMathML2MathJax() {
	console.log('Pour update MathJax :', 'MathJax.typesetPromise()')
	MathJax.typesetPromise();
}

// ===============================================================================================================================
// ===============================================================================================================================
//													MULTI TASK
// ===============================================================================================================================

async function multiTask(input){
	lds.classList.remove('display-none');

	// ------------------------------------------------------------
	// 							COMMAND TASK

	if (input.startsWith('/')) {

		const command = parseCommand(input);
		if (!command) {
			console.error(`the command is mistyped`);
			sendError('System' , `the command is mistyped`, 'Left');
			lds.classList.add('display-none');
			return 0
		}
		if (!COMMANDS[command.name]) {
			console.error(`${command.name} : this command does not exist`);
			sendError('System' , `${command.name} : this command does not exist`, 'Left');
			lds.classList.add('display-none');
			return 0
		}
		/*
		const res = await COMMANDS[command.name](command.input);
		console.log(res);
		*/
		try {
			send('User', input, 'Right', false);
			await COMMANDS[command.name](command.input);
			// code à exécuter en cas de succès
		} catch (error) {
			console.error('System', error);
			sendError('System' , error, 'Left');
			// code à exécuter en cas d'erreur
		}

		lds.classList.add('display-none');
		return 1
	}

	// ------------------------------------------------------------
	// 							CHAT TASK


	try {
		await chatTask(input);
	} catch (error) {
		console.error('System', error);
		sendError('System', error, 'Left');

		// repêchage
		try {
			await fishOutTask(input);
		} catch (errorFishOut) {
			console.error('System - FISH OUT', errorFishOut);
			sendError('System - FISH OUT', errorFishOut, 'Left');
			const sorryMessage = 
`Le repêchage a échoué, il est possible que le modèle LLM ou l'API ait un problème.
Merci de soit réessayer avec un prompt différent, soit de changer de modèle avec la commande : /changeModel [LLM/T2I/ASR] [MODEL_NAME]
// Large Language Models (LLM)
	BLOOM
	BLOOM_3B
	OPEN_ASSISTANT
	OPEN_ASSISTANT_4
	GUANACO_33B
	FALCON
	ORCA
	
// Text-to-Image (T2I)
	OPEN_JOURNEY

// Automatic Speech Recognition (ASR)
	WHISPER
`

			sendError('System - FISH OUT', sorryMessage, 'Left');
		}
		//
	}

	// remove load ----
	// si jamais loadElement n'est pas remove suite à une erreur
	if (bp.LOAD_ELEMENT.element) {
		bp.LOAD_ELEMENT.element.remove();
		bp.LOAD_ELEMENT.element = null;
	}
	// ----------------


	lds.classList.add('display-none');
	console.log('API_COUNTER.LLM = ', bp.API_COUNTER.LLM);
	return 2
}

// ===============================================================================================================================
// ===============================================================================================================================
//													COMMANDS
// ===============================================================================================================================

function parseCommand(input) {
	if (input === "/help") return {name : "help"}

	const regex = /^\/(\w+)\s(.+)$/; // Regular expression to match the pattern
	const match = input.match(regex);

	if (match) {
		const name = match[1];
		const commandText = match[2];
		return {
			name: name,
			input: commandText
		};
	} else {
		return null; // Return null if the input doesn't match the pattern
	}
}

const COMMANDS = {

	help : async () => {
		send(
			"System",
`
\`\`\`Commandes
/help
/changeModel ['LLM'/'T2I'/'ASR'] [modelName]
/input2json [text]
/send [sender] > [message] > ['Left'/'Right']
/memory ['log'/'retry'/'clear']
/newClass [name]
/calc [varA] [method] [varB:optional]
/doc ['golpexCode'/'structure'/'operations'/'functions']
\`\`\`

\`\`\`Description
/help : envoie ce module d'aide aux commandes.

/changeModel : Si vous avez besoin de changer de modèle.
	LLM (Large Language Model)
		BLOOM
		BLOOM_3B
		OPEN_ASSISTANT
		OPEN_ASSISTANT_4
		-> GUANACO_33B
		FALCON
	T2I (Text To Image)
		OPEN_JOURNEY
		-> OPEN_JOURNEY_V4
		SD_COMPRESSED
		SDXL1_0
		SD1_5
		SD2_1
	ASR (Automatic Speech Recognition)
		-> WHISPER

/input2json : pour récupérer le format json "COMMAND" envoyé au chatbot pour définir l'agent utilisé.

/send : Envoyer un message au nom de 'sender', 'Left' ou 'Right' pour définir où commence la bulle de texte.

/memory :
	- log : ouvrir la console ! console.log la mémoire du chatbot.
	- retry : retire de la mémoire les deux derniers messages, en général pour réessayer un prompt.
	- clear : efface la mémoire du chatbot.

/newClass : Permet de créer une structure mathématique. Ouvre une fenêtre pour customiser sa 'classe'
	Exemple : /newClass Vector
(!! : Cette fonctionnalité n'est pas complètement implémentée dans cette version.)

/calc : Permet de calculer sur des structures crées avec /newClass.
(!! : Cette fonctionnalité n'est pas complètement implémentée dans cette version.)

/doc : Permet d'accéder à la documentation du golpex-code
(!! : Cette fonctionnalité n'est pas complètement implémentée dans cette version.)
\`\`\`
`,
			"Left"
		)
	},

	// /changeModel LLM/T2I/ASR [modelName]
	// /changeModel LLM GUANACO_33B
	changeModel : async (input) => {
		send('User', input, 'Right');
		const [type, modelName] = input.split(' ');
		bp.CURRENT_MODELS[type] = bp.MODELS[modelName];
		send(
			"System - /changeModel",
			`Modèles recommandés :\n
			LLM : ${bp.MODELS.GUANACO_33B}
			T2I : ${bp.MODELS.OPEN_JOURNEY_V4}
			ASR : ${bp.MODELS.WHISPER}\n\n
			Modèles utilisés :\n
			LLM : ${bp.CURRENT_MODELS.LLM}
			T2I : ${bp.CURRENT_MODELS.T2I}
			ASR : ${bp.CURRENT_MODELS.ASR}`,
			"Left"
		);
		return bp.CURRENT_MODELS
	},

	// /input2json [text]
	// /input2json graph of x^2+1=0
	input2json : async (input) => {
		const res = await LLM_costCallback('command', input);
		send('System - /input2json', `\`\`\`json\n${formatIndentedJson(JSON.stringify(res))}\`\`\``, 'Left');
		return res
	},

	// subTask

	wikipedia : async (input) => {
		const [topic] = input.split('>');
		const res = await LLM_Wikipedia(input, [
			{arg : 'topic', value : topic},
		]);
		send('System - /wikipedia', res, 'Left');
		return res
	},
	graph : async (input) => {
		const [equation] = input.split('>');
		const res = await LLM_Graph(input, [
			{arg : 'equation', value : equation},
		]);
		send('System - /graph', res, 'Left');
		return res
	},
	code : async (input) => {
		const [language_used, goal] = input.split('>');
		const res = await LLM_Code(input, [
			{arg : 'language_used', value : language_used},
			{arg : 'goal', value : goal},
		]);
		send('System - /code', res, 'Left');
		return res
	},
	text : async (input) => {
		const [goal, about] = input.split('>');
		const res = await LLM_Text(input, [
			{arg : 'about', value : about},
			{arg : 'goal', value : goal},
		]);
		send('System - /text', res, 'Left');
		return res
	},
	youtube : async (input) => {
		const [topic] = input.split('>');
		const res = await LLM_Youtube(input, [
			{arg : 'topic', value : topic},
		]);
		send('System - /youtube', res, 'Left');
		return res
	},
	image : async (input) => {
		send('System - /image', `\`\`\`IMAGE\n${input}\`\`\``, 'Left');
		//return res
	},
	info : async (input) => {
		const [requested_info] = input.split('>');
		const res = await LLM_infoGolpex(input, [
			{arg : 'requested_info', value : requested_info},
		]);
		send('System - /info', res, 'Left');
		return res
	},
	huggingface : async (input) => {
		const [topic] = input.split('>');
		const res = await LLM_HuggingFace(input, [
			{arg : 'topic', value : topic},
		]);
		send('System - /huggingface', res, 'Left');
		return res
	},
	error : async (input) => {
		sendError('System - /error', `ERROR : ${input}`, 'Left');
		//return res
	},

	// ---

	chat : async (input) => {
		const res = await LLM_classicChat(input);
		send('System - /classic', res, 'Left');
		return res
	},

	// ---

	pdf : async (input) => {
		const res = search(input, pdfFiles);
		//send('System - /pdf', `\`\`\`pdf\n${formatIndentedJson(JSON.stringify(res))}\`\`\``, 'Left');
		const matches = await searchPDF(res.path, input);

		let pages = new Set();
		for (let match of matches) {
			pages.add(match.page);
		}
		send('System - /pdf', `\`\`\`PDF_FILES:${res.path}\n${[...pages]}\`\`\``, 'Left');
		
		return res
	},

	// /send [sender] > [message] > ['Left'/'Right']
	send : (input) => {
		const [sender, message, direction] = input.split('>');
		send(sender, message, direction);
	},

	// /memory ['log'/'retry'/'clear']
	memory : (input) => {
		if (input === 'log') {
			console.log(Memory.CONVERSATION);
		}
		if (input === 'retry') {
			Memory.retry();
		}
		if (input === 'clear') {
			Memory.clear();
		}
		
	},

	// /newClass [name]
	newClass : (name) => {
		//mp.newClass(name);
		chatOutput.appendChild(
			createElement.classObject(name)
		);
	},

	// /calc [varA] [method] [varB]
	calc : (input) => {
		const [varA, method, varB] = input.split(' ');
		const A = mp.Structure.VARIABLES.get(varA).clone();
		const B = mp.Structure.VARIABLES.get(varB);
		const classA = mp.StructureBuilder.classes.get(A.instanceOf);

		send('System - Calc', `${varA}.${method}(${varB}) = ${A[method](B)}`, 'Left')
	},

	// /doc ['algebrity'/'structure'/'operations'/'functions']
	doc : (input) => {
		if (input === 'algebrity') {
			send("System", `
Les codes ci dessous sont des exemples d'implémentations de méthodes en golpex-code.

\`\`\`Declare a class
new:CLASS_NAME
\`\`\`

\`\`\`General method of a class
CLASS_NAME <- method:this.NAME(ARGS)
let [VARIABLES]
INSTRUCTIONS
return:RETURN_VALUE
\`\`\`

\`\`\`General object of a class
CLASS_NAME <- object:VAR_NAME[ARGS]
temp:ARG_0 = Vector <- object:[ARGS_0]
temp:ARG_1 = Vector <- object:[ARGS_1]
...
\`\`\`

\`\`\`Addition of Vectors
Vector <- method:this.add(vector)
let []
this.operation(PLUS, vector)
return:this
\`\`\`

\`\`\`Dot product of Vectors
Vector <- method:this.dot(vector)
let [value]
this.operation(TIMES, vector)
value = this.reduceWith(PLUS, vector)
return:value
\`\`\`


\`\`\`Addition of Polynoms
Polynom <- method:this.add(polynom)
let []
this.operation(PLUS, polynom)
return:this
\`\`\`

\`\`\`Multiplication of Polynoms
Polynom <- method:this.multiply(polynom)
let []
this.convType1(TIMES, PLUS, polynom)
return:this
\`\`\`

\`\`\`Evaluation at x of a Polynom
Polynom <- method:this.at(x)
let [id, value]
id = index(this)
id.map(POW:x)
id.operation(TIMES, this)
value = id.reduceWith(PLUS)
return:value
\`\`\`

\`\`\`Derivative of a Polynom
Polynom <- method:this.derivate()
let [deg, id]
deg = this.length()
id = this.index()
this.operation(TIMES, id)
this.slice(1, deg)
return:this
\`\`\`

\`\`\`Declare a Real number
Real <- object:x[2.0]
\`\`\`

\`\`\`Declare a Matrix
Matrix <- object:M[v0, v1]
temp:v0 = Vector <- object:[v00, v01]
temp:v1 = Vector <- object:[v10, v11]
temp:v00 = Real <- object:[1.0]
temp:v01 = Real <- object:[2.0]
temp:v10 = Real <- object:[3.0]
temp:v11 = Real <- object:[4.0]
\`\`\`
`, "Left")
		}
		if (input === 'structure') {
			send("System", `
Les méthodes ci-dessous sont les méthodes par défaut dans Algebrity.

'Mutable' means that 'this' object is changed after applying the method.
'toVariable' means that 'this' is not changed, and the result of the method needs to be stored in a variable.


\`\`\`Copy - Mutable
// Values of 'other' are copied to 'this'.
this.copy(other)
\`\`\`

Return a clone of object 'this'.
\`\`\`Clone - toVariable
this.clone()
\`\`\`


\`\`\`Operation - Mutable
// Values are resulted from values of 'this' OPERATION values of 'other'.
this.operation(OPERATION, other)
\`\`\`


\`\`\`Reverse - Mutable
// Values are reversed in order. (values at the beginning go to the end).
this.reverse()
\`\`\`


\`\`\`Slice - Mutable

// Values are sliced from value 'begin' to value 'end' (included).
this.slice(begin, end)
\`\`\`


\`\`\`ReduceWith - toVariable
// return the value we get when we apply OPERATION on all values.
this.ReduceWith(OPERATION)
\`\`\`


\`\`\`Map - Mutable
// Values are resulted from FUNCTION(value).
this.map(FUNCTION)
\`\`\`

\`\`\`Get - toVariable
// return the value at INDEX of this.
this.get(INDEX)
\`\`\`

\`\`\`Set - Mutable
// Value at INDEX is now VALUE
this.set(INDEX, VALUE)
\`\`\`

\`\`\`Join - toVariable
// return an array with 2 values : STRUCT_A at 0 and STRUCT_B at 1.
join(STRUCT_A, STRUCT_B, array)
\`\`\`

\`\`\`Id - toVariable
// return an array of length N : array[integer[0], integer[1], ..., integer[N]].
id(N, array)
\`\`\`

return Length of object 'this'.
\`\`\`Length - toVariable
this.length()
\`\`\`

return the indices of object 'this' with Structure class.
\`\`\`Index - toVariable
this.index()
\`\`\`

Values are resulted from the natural convolution of 'this' and 'other' values.
- see "Convolution in Discrete Probability Theory"
\`\`\`ConvType1 - Mutable
this.convType1(INNER_OPERATION, OUTER_OPERATION, other)
\`\`\`

Values are resulted from the opposite convolution of 'this' and 'other' values.
- see "Multiplication of Polynoms"
\`\`\`ConvType2 - Mutable
this.convType2(INNER_OPERATION, OUTER_OPERATION, other)
\`\`\`

`, "Left")
		}
		if (input === 'operations') {
			send("System", `
Les opérations ci-dessous sont les méthodes par défaut dans Algebrity.

\`\`\`Opérations
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
\`\`\`

`, "Left")
		}
		if (input === 'functions') {
			send("System", `
Les fonctions ci-dessous sont les méthodes par défaut dans Algebrity.

\`\`\`Fonctions
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
RANDINT : (x,i) => //... 		// random integer value between x and i
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
\`\`\`

`, "Left")
		}
	},
}

// ===============================================================================================================================
// ===============================================================================================================================
//													UTILITIES FUNCTIONS
// ===============================================================================================================================


// one line json -> indented json

function formatIndentedJson(stringifiedJson) {
	try {
		const parsedJson = JSON.parse(stringifiedJson);
		const indentedJson = JSON.stringify(parsedJson, null, 2);
		return indentedJson;
	} catch (error) {
		console.error("Error parsing JSON:", error);
		return null;
	}
}

// "This is a text. And there is an other" & [' ', '\\.'] -> [ "This", "is", "a", "text", "", "And", "there", "is", "an", "other" ]
// [WORD, WORD, ...]
function multiSplit(text, separators) {
	// Escape special characters in the separators and join them with the OR operator '|'
	const regex = new RegExp(separators.join('|'), 'g');
	const result = text.split(regex);
	return result;
}

// "This is a text. And there is an other" & ' ' -> [ "This", " ", "is", " ", "a", " ", "text.", " ", "And", " ", … ]
// [WORD, SEP, WORD, ...]
function smartSplit(text, separator) {
	const result = text.split(new RegExp(`(${separator})`, 'g'));
	return result
}

// "This is a text. And there is an other" & [' ', '\\.'] -> [ "This", " ", "is", " ", "a", " ", "text", ".", "", " ", … ]
// [WORD, SEP, WORD, ...]
function multiSmartSplit(text, separators) {
	const result = text.split(new RegExp(`(${separators.join('|')})`, 'g'));
	return result
}

function copyToClipboard(text) {
	navigator.clipboard.writeText(text);
}

// ===============================================================================================================================
// ===============================================================================================================================
//													MEMORY
// ===============================================================================================================================



/*
MAX_TOKEN is 1024 : represents approximately 4500 characters

*/
const MAX_MEMORY_CHARACTERS = 1536; // 3/4 * 2048
const MAX_MEMORY_MESSAGE = 20;

class Memory {
	constructor(sender, text, element){
		this.sender = sender;
		this.text = text;
		this.element = element; 
		Memory.CONVERSATION.push(this);
	}

	toString() {
		return `${this.sender} said : ${this.text}`
	}

	remove() {
		this.element.remove();
	}
}
Memory.CONVERSATION = [];
Memory.retry = () => {
	const twoLast = Memory.CONVERSATION.splice(-2,2);
	twoLast.map( e => e.remove() );
};
Memory.clear = () => {
	Memory.CONVERSATION.map( e => e.remove() );
	Memory.CONVERSATION.splice(0,Memory.CONVERSATION.length);
};
Memory.shortMemory = () => {
	let text = 'Last messages :\n';
	const array = Memory.CONVERSATION.slice(-MAX_MEMORY_MESSAGE);
	for (let message of array) {
		text += `${message.toString().replaceAll('\n',' ').replaceAll('\t', ' ')}\n`
	}
	return text.slice(-MAX_MEMORY_CHARACTERS)
}
Memory.longMemory = () => {
	//...
	return 0
}

// ===============================================================================================================================
// ===============================================================================================================================
//													CHAT TASK
// ===============================================================================================================================


async function chatTask(input) {

	await send('User', input,'Right');

	// set load -------
	const loadElement = sendLoading('System - LOADING', 'Envoi requête');
	console.log(loadElement)
	bp.LOAD_ELEMENT.element = loadElement;
	// ----------------

	const res = await LLM_costCallback('command', input);

	let output = '';

	if (res.commands.length > 0) {
		for (let command of res.commands) {

			console.warn(command.name)
			// set load -------
			loadElement.innerText = `Envoi commande : ${command.name}`;
			// ----------------

			//const section = `${await readCommand(input, command)}\n`;
			const section = `${await LLM_costCallback('readCommand', input, command)}\n`;
			output += section;
		}
	} else {
		output = await LLM_costCallback('noCommandFound', input);
	}

	
	console.log(output);
	// retirer la dernière phrase
	//output = output.split('.').slice(0,-1).join('.');

	// remove load ----
	bp.LOAD_ELEMENT.element = null;
	loadElement.remove();
	// ----------------

	
	await send('Bot', output, 'Left');

	return output
}

/*

USER : Graph of 2x+1 then create a code in python with matplotlib.
BOT : Sure, here is the graph of function 2x+1 :
{
	class : 'graph',
	graph : "2x+1"
}

And then, here is the python code using matplotlib :

{
	class : 'code',
	language : 'python',
	goal : 'represent 2x+1 with matplotlib'
}

If you have any other request, don't hesitate to ask.
<END>

*/


async function fishOutTask(input) {

	const output = await LLM_costCallback('fishOut', input);
	
	await send('Bot', output,'Left');

	return output
}

// ===============================================================================================================================
// ===============================================================================================================================
//													LLM - PROMPTS
// ===============================================================================================================================


const LLM = {
	command : LLM_Command,
	readCommand : readCommand,
	subTask : {
		graph : LLM_Graph,
		code : LLM_Code,
		wikipedia : LLM_Wikipedia,
		youtube : LLM_Youtube,
		huggingface : LLM_HuggingFace,
		text : LLM_Text,
		infoGolpex : LLM_infoGolpex,
		imageGen : TEXT_image,
	},
	fishOut : LLM_classicChat,
	noCommandFound : LLM_classicChat,
	unknownCommand : LLM_classicChat,
}

async function LLM_costCallback(callback, ...args) {
	let cost = bp.API_COUNTER.LLM;

	const res = await LLM[callback](...args);

	cost = bp.API_COUNTER.LLM - cost;

	console.log(`Cost of ${callback} : ${cost} generations`);

	return res
}

// COMMAND EXTRACT -------------------------------------------

/*
### instructions :
Identify a command in user input, response in the format :
{ "commands" : LIST of  {"command" : STRING, "args" : LIST OF ARGS }
Then write "that's the end !" after.
### commands :
Possible commands in format "command/LIST of ARGS"
- graph/[ { equation : STRING }]
- code/[ { language_used : STRING}, { goal : STRING } ]
- wikipedia/[ { topic : STRING } ]
- youtube/[ { topic : STRING } ]
### input :
Graph of 2x+1 then give me in python using matplotlib a code to represent this graph
### response : {
	"commands": [
		{
			"command": "graph",
			"args": [
				{
					"equation": "2x+1"
				}
			]
		},
		{
			"command": "code",
			"args": [
				{
					"language_used": "python",
					"goal": "represent this graph"
				}
			]
		}
	]
}

That's the end ! #include "config.
*/

/*
{
	"commands" : [
		{
			"name" : "wikipedia",
			"args" : [
				{
					"arg" : "topic",
					"value" : "group theory"
				}
			] 
		},
		{
			"name" : "youtube",
			"args" : [
				{
					"arg" : "topic",
					"value" : "group theory"
				}
			] 
		}
	]
}
*/



async function LLM_Command(input){

	const STOP_TOKEN = "json completed !";
	const MAX_ITERATION = 13;

	const prompt =
`### instructions :
Identify a command in user input, response in the format :
{ "commands" : LIST of  {"name" : STRING, "args" : LIST OF ARGS }
Then after finishing json format, write "${STOP_TOKEN}".
### commands :
Possible commands in format "name/LIST of ARGS"
- graph/[ { "arg" : "equation", "value" : STRING }]
- code/[ { "arg" : "language_used", "value" : STRING }, { "arg" : "goal", "value" : STRING } ]
- wikipedia/[ { "arg" : "topic", "value" : STRING } ]
- youtube/[ { "arg" : "topic", "value" : STRING } ]
- huggingface/[ { "arg" : "topic", "value" : STRING } ] /*if user ask for an AI model*/
- text/[ { "arg" : "about", "value" : STRING}, { "arg" : "goal", "value" : STRING } ]
- infoGolpex/[ { "arg" : "requested_info", "value" : STRING } ]
- imageGen/[ { "arg" : "prompt", "value", STRING } ]
### input :
show me a wikipedia page about group theory and youtube video about it
### response :
{ "commands" : [ { "name" : "wikipedia" , "args" : [ {"arg" : "topic" , "value" : "group theory" } ] } , { "name" : "youtube" , "args" : [ { "arg" : "topic" , "value" : "group theory" } ] } ] }
### context :
${Memory.shortMemory()}
### input :
${input}
### response :`

	console.log('prompt : ',prompt)
	
	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	console.log('output : ',output)

	return JSON.parse(output.replaceAll('\n', ''));
}

// read Command -------------------------------------------

async function readCommand(input, command) {
	const name = command.name;
	const args = command.args;
	if (name in LLM.subTask) {
		return await LLM.subTask[name](input, args);
	}
	return await LLM.unknownCommand(input, args);
}

// GRAPH -------------------------------------------

async function LLM_Graph(input, args){
	const STOP_TOKEN = "text completed !";
	const MAX_ITERATION = 7;

	const equation = args.find( e => e.arg === "equation");

	if (!equation) return '```ERROR:GRAPH\n No "equation" found```'

	const prompt =
`### instructions :
Given the context, write a short text about the graph that will be shown.
Then after finishing the text, write "${STOP_TOKEN}".
### context :
${Memory.shortMemory()}
### equation :
${equation.value}
### response :`

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	output += 
`
\`\`\`GRAPH
${equation.value}
\`\`\``;

	return output
}

// CODE -------------------------------------------

async function LLM_Code(input, args){
	const STOP_TOKEN = "code completed !";
	const MAX_ITERATION = 17;

	const language_used = args.find( e => e.arg === "language_used");
	const goal = args.find( e => e.arg === "goal");

	if (!language_used) return '```ERROR:CODE\n No "language_used" found```'
	if (!goal) return '```ERROR:CODE\n No "goal" found```'

	const prompt =
`### instructions :
Given the context, write a code given a language and a goal to achieve.
Use the format :
\`\`\`CODE:${language_used.value}
code
\`\`\`${STOP_TOKEN}
Then after finishing the code, write "${STOP_TOKEN}".
### context :
${Memory.shortMemory()}
### language used :
${language_used.value}
### goal :
${goal.value}
### response :`

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	return output
}

// WIKIPEDIA -------------------------------------------

async function LLM_Wikipedia(input, args){
	const STOP_TOKEN = "Sentence completed !";
	const MAX_ITERATION = 7;

	let topic = args.find( e => e.arg === "topic");

	if (!topic) {
		const about = args.find( e => e.arg === "about");
		if (!about) {
			return '```ERROR:WIKIPEDIA\n No "topic" or "about" found```'
		}
		topic = about;
	}

	const prompt =
`### instructions :
Given the context, write a short sentence inviting you to read the Wikipedia page that will be displayed.
Then after finishing the sentence, write "${STOP_TOKEN}".
### context :
${Memory.shortMemory()}
### topic :
${topic.value}
### response :`

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['[https:', 'https:', 'END #', '\n\n\n\n', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	output +=
`
\`\`\`WIKIPEDIA
${topic.value}
\`\`\``;

	return output
}

// YOUTUBE -------------------------------------------

async function LLM_Youtube(input, args){
	const STOP_TOKEN = "Sentence completed !";
	const MAX_ITERATION = 7;

	let topic = args.find( e => e.arg === "topic");

	if (!topic) {
		const about = args.find( e => e.arg === "about");
		if (!about) {
			return '```ERROR:YOUTUBE\n No "topic" or "about" found```'
		}
		topic = about;
	}

	const prompt =
`### instructions :
Given the context, write a short sentence inviting the user to watch the Youtube video shown with a slightly formal tone.
Don't write links.
Then after finishing the sentence, write "${STOP_TOKEN}".
### context :
${Memory.shortMemory()}
### topic :
${topic.value}
### response :`

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['[Watch', '[https:', 'https:', 'END #', '\n\n\n\n', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	output +=
`
\`\`\`YOUTUBE
${topic.value}
\`\`\``;

	return output
}

// YOUTUBE -------------------------------------------

async function LLM_HuggingFace(input, args){
	const STOP_TOKEN = "Sentence completed !";
	const MAX_ITERATION = 7;

	let topic = args.find( e => e.arg === "topic");

	if (!topic) {
		const about = args.find( e => e.arg === "about");
		if (!about) {
			return '```ERROR:HUGGING_FACE\n No "topic" or "about" found```'
		}
		topic = about;
	}

	// temp
	const space = search(input, huggingfaceSpaces);

	const prompt =
`### instructions :
Given the context, write a short sentence about the HuggingFace's space being shown.
Then after finishing the sentence, write "${STOP_TOKEN}".
### found huggingface's space :
name : ${space.name}
description : ${space.description}
### context :
${Memory.shortMemory()}
### topic :
${topic.value}
### response :`

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['[Watch', '[https:', 'https:', 'END #', '\n\n\n\n', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	output +=
`
\`\`\`HUGGING_FACE
${topic.value}
\`\`\``;

	return output
}

// TEXT -------------------------------------------

async function LLM_Text(input, args){
	const STOP_TOKEN = "text completed !";
	const MAX_ITERATION = 23;

	const about = args.find( e => e.arg === "about");
	const goal = args.find( e => e.arg === "goal");

	if (!about) return '```ERROR:TEXT\n No "about" found```'
	if (!goal) return '```ERROR:TEXT\n No "goal" found```'

	const prompt =
`### instructions :
Given the context, write an argumented text following a goal and the subject it is about.
Then after finishing the text, write "${STOP_TOKEN}".
### context :
${Memory.shortMemory()}
### about :
${about.value}
### goal :
${goal.value}
### response :`

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['[Watch', '[https:', 'https:', 'END #', '\n\n\n\n', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	return output
}


// INFO GOLPEX -------------------------------------------



async function LLM_infoGolpex(input, args) {

	const STOP_TOKEN = "Info has been given !";
	const MAX_ITERATION = 13;

	const requested_info = args.find( e => e.arg === "requested_info");

	if (!requested_info) return '```ERROR:INFO_GOLPEX\n No "requested_info" found```'

	const prompt =
`### instructions :
Given the context, give user the specific info he searched for.
Then after giving the info, write "${STOP_TOKEN}".
### informations :
This project aims to make math fun and relaxing like a video game would be. The logic of mathematics is transcribed in the gameplay and the structures in the characters. To make the project viable over time, a whole action plan has been devised that uses new technologies such as AI, VR, AR and blockchains.
The idea for this project was thought about during the years 2020 and 2021 and really started in September 2021. The creator bears the nickname "Golto". For more information, go to "Contact" or you can visit the project's Discord.
### context :
${Memory.shortMemory()}
### requested info :
${requested_info.value}
### response :`

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['[Watch', '[https:', 'https:', 'END #', '\n\n\n\n', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	// problème : STOP_TOKEN coupé par \n
	output = output.replaceAll('\n', '');
	output = output.split(STOP_TOKEN)[0];

	return output

}


// IMAGE GENERATION -------------------------------------------

function TEXT_image(input, args) {

	const prompt = args.find( e => e.arg === "prompt");

	if (!prompt) return '```ERROR:IMAGE\n No "prompt" found```'
	return `
\`\`\`IMAGE
${prompt.value}
\`\`\``;

}


async function T2I_executor(prompt) {

	let output = await bp.promptText2Img(prompt);
	output.style.borderRadius = '20px';

	return output

}



// CLASSIC CHAT -------------------------------------------



async function LLM_classicChat(input) {

	const STOP_TOKEN = "Bot replied !";
	const MAX_ITERATION = 13;

	const prompt =
`### instructions :
Given the context, Bot continue the conversation with User.
Then after Bot replied, write "${STOP_TOKEN}".
### context :
${Memory.shortMemory()}
### response :
Bot says : `

	console.log('prompt : ',prompt)
	
	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', 'User sa', 'USER sa', 'BOT sa', 'bot sa', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	console.log('output : ',output)

	return output

}




// ===============================================================================================================================
// ===============================================================================================================================
//													OBJECT DETECTION
// ===============================================================================================================================


// CODE -------------------------------------------

const KEY_WORD_LIST_RED = [ '/', '=', 'return', 'public', 'private', 'require', 'or', 'and', 'if', 'else', 'elif', 'switch', 'case', 'break', 'try', 'catch', 'for', 'while', 'in', 'for', '#include', 'template', 'import', 'export'];
const KEY_WORD_LIST_YELLOW = ['self', 'this'];
const KEY_WORD_LIST_AQUA = [ 'await', 'async', 'def', 'function', '=>', 'int', 'str', 'bool', 'void', 'const', 'let', 'var'];
const KEY_WORD_LIST_SALMON = ['(', ')', '[', ']', '{', '}', '==', '===', '<=', '>=', '->', '-->', '<', '>', '!=', '!==', '+', '-', '*', '/', '%', '@', ',', ';', '.', ':', '!', '^', '**', '+=', '-=', '*=', '/=', '%=', 'new'];
const KEY_WORD_LIST_PURPLE = ['method', 'object', 'temp', 'class'];

function colorCodeElement(element, token) {
	if ( KEY_WORD_LIST_RED.includes( token.replaceAll(' ', '') ) ) {
		new Element('chatbot-color', {text : token, color : 'orangered'}).attachTo(element)
		return element
	} 
	if ( KEY_WORD_LIST_YELLOW.includes( token ) ) {
		new Element('chatbot-color', {text : token, color : '#ffff66'}).attachTo(element)
		return element
	}
	if ( KEY_WORD_LIST_AQUA.includes( token ) ) {
		new Element('chatbot-color', {text : token, color : 'Aqua'}).attachTo(element)
		return element
	}
	if ( KEY_WORD_LIST_SALMON.includes( token ) ) {
		new Element('chatbot-color', {text : token, color : 'salmon'}).attachTo(element)
		return element
	}
	if ( KEY_WORD_LIST_PURPLE.includes( token ) ) {
		new Element('chatbot-color', {text : token, color : '#e139e1'}).attachTo(element)
		return element
	}
	
	new Element('chatbot-color', {text : token, color : 'lightblue'}).attachTo(element)
	return element
}

// GRAPH -------------------------------------------

function cleanEquation(input) {
	// remplacer par du regex
	return input.
		replaceAll('(', '{(').
		replaceAll(')', ')}').
		replaceAll('sqrt', '\\sqrt').
		replaceAll('cqrt', '\\cqrt').
		replaceAll('sign', '\\sign').
		replaceAll('abs', '\\abs').
		replaceAll('floor', '\\floor').
		replaceAll('ceil', '\\ceil').
		replaceAll('max', '\\max').
		replaceAll('min', '\\min').
		replaceAll('round', '\\round').
		replaceAll('mod', '\\mod').
		replaceAll('cos', '\\cos').
		replaceAll('sin', '\\sin').
		replaceAll('tan', '\\tan').
		replaceAll('cosh', '\\cosh').
		replaceAll('sinh', '\\sinh').
		replaceAll('tanh', '\\tanh').
		replaceAll('arccos', '\\arccos').
		replaceAll('arcsin', '\\arcsin').
		replaceAll('arctan', '\\arctan').
		replaceAll('log', '\\log').
		replaceAll('ln', '\\ln').
		replaceAll('exp', '\\exp')
}

// WIKIPEDIA -------------------------------------------


async function searchWikipedia(theme) {
	const apiUrl = "https://fr.wikipedia.org/w/api.php";
	const url = `${apiUrl}?action=query&format=json&list=search&srsearch=${theme}&origin=*`;

	try {
		const response = await fetch(url);
		const data = await response.json();
		const pages = data.query.search;

		if (pages.length > 0) {
			return { title: pages[0].title };
		}
		console.log("Aucun résultat trouvé.");
		return { title: null, noResult: true }; // Ou autre valeur appropriée en cas d'absence de résultat

	} catch (error) {
		console.error("Erreur lors de la requête à l'API de Wikipédia.", error);
		return { title: null, error: error }; // Ou autre valeur appropriée en cas d'erreur
	}
}

// YOUTUBE -------------------------------------------

async function searchYoutube(theme) {
	return {id : 'zSgx8U16stk'}
}

// ----------------------------------------------------------------------------------------
//														global detection

function isFormatDetected(input) {
	let regex = /```([^`]+)```/g;
	return regex.test(input)
}

function parseFormat(input) {
	const inputArray = input.split('```')
	const content = inputArray[1].split('\n');
	const contentName = content[0];
	const contentInner = content.slice(1).join('\n');
	return {name : contentName, inner : contentInner, before : inputArray[0], after : inputArray.slice(2).join('```')}
}

// ===============================================================================================================================
// ===============================================================================================================================
//													SEND MESSAGES
// ===============================================================================================================================



async function send(sender, text, direction, isMemorized = true) {

	const message = new Element('chatbot-message', {sender, text, direction});
	message.attachTo(chatOutput);
	if (isMemorized) {
		new Memory(sender, text, message.element);
	}

	//scroll vers le bas
	chatOutput.parentElement.scrollTo({ top: message.element.offsetTop, behavior: 'smooth' });
	return 1
}

function sendError(sender, text, direction) {

	const element = new Element('chatbot-message-error', {sender, text, direction});
	element.attachTo(chatOutput);
	
	//scroll vers le bas
	chatOutput.parentElement.scrollTo({ top: element.offsetTop, behavior: 'smooth' });

	setTimeout(()=>{
		  element.element.remove();
		}, 20000);
	return 1
}

function sendLoading(sender, text) {

	const element = new Element('chatbot-message-loading', {sender, text});
	element.attachTo(chatOutput);

	//scroll vers le bas
	chatOutput.parentElement.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
	return element.element
}



// ===============================================================================================================================
// ===============================================================================================================================
//													HTML/CSS - elements
// ===============================================================================================================================

// ----------------------------------------------------------------------------------------
//														chatbot-message

Element.customElements.set('chatbot-message', ({sender, text, direction}) => {

	let unparsedText = text;

	const message = new Element('div')
		.class('message', 'wrapper', 'spacer-small-pt', 'spacer-small-pb', 'flex-column', 'flex-gap20')
		.append(
			new Element('h2')
				.class('title', 'text-center')
				.text(sender)
		)
		
	if ('Left' === direction) {
		message.css({ borderBottomLeftRadius : '0px' });
	}
	if ('Right' === direction) {
		message.css({ borderBottomRightRadius : '0px' });
	}

	while (isFormatDetected(unparsedText)) {
		const res = parseFormat(unparsedText);
		unparsedText = res.after;
		message
			.append(
				new Element('p').css({ fontFamily : 'Exo' })
					.text(res.before)
			)
			.append(
				new Element('chatbot-object-redirection', {name : res.name, inner : res.inner})//.text(`${res.name} / ${res.inner}`)
			)
	}

	message.append(
			new Element('p').css({ fontFamily : 'Exo' })
				.text(unparsedText)
		)

	return message.element
})

// ----------------------------------------------------------------------------------------
//														chatbot-message-error

Element.customElements.set('chatbot-message-error', ({sender, text, direction}) => {

	const message = new Element('div')
		.class('message', 'wrapper', 'spacer-small-pt', 'spacer-small-pb', 'flex-column', 'flex-gap20')
		.append(
			new Element('h2')
				.class('title', 'text-center')
				.text(sender)
		)
		.append(
			new Element('p').text(text)
		)
		.css({
			color : '#a90000',
			backgroundColor : '#ffa7004a',
		})

	if ('Left' === direction) {
		message.css({ borderBottomLeftRadius : '0px' });
	}
	if ('Right' === direction) {
		message.css({ borderBottomRightRadius : '0px' });
	}

	return message.element
})

// ----------------------------------------------------------------------------------------
//														chatbot-message-loading

Element.customElements.set('chatbot-message-loading', ({sender, text}) => {

	return new Element('div')
		.class('message', 'wrapper', 'spacer-small-pt', 'spacer-small-pb', 'flex-column', 'flex-gap20')
		.append(
			new Element('h2')
				.class('title', 'text-center')
				.text(sender)
		)
		.append(
			new Element('p').text(text)
		)
		.css({
			backgroundColor : '#ffb693c2',
		})
		.element
})

// ----------------------------------------------------------------------------------------
//														chatbot-color

Element.customElements.set('chatbot-color', ({text, color}) => {

	return new Element('span')
		.text(text)
		.css({color})
		.element
})

// ----------------------------------------------------------------------------------------
//														chatbot-a

Element.customElements.set('chatbot-a', ({href, text}) => {

	return new Element('a')
		.attr({ href, target : "_blank"})
		.text(text)
		.element
})

// ----------------------------------------------------------------------------------------
//														chatbot-code


Element.customElements.set('chatbot-code', ({language, code}) => {

	const codeColor = new Element('pre').class('code')
		.attrFromMap(new Map([
			['spellcheck', false]
		]));

	const container = new Element('div').class('container')
		.append(
			new Element('div').class('topbar')
				.append(
					new Element('h2').class('spacer-small-pb', 'spacer-small-pt', 'wrapper')
						.css({
							color : 'var(--color-white)',
						})
						.text(language)
				)
				.append(
					new Element('button')
						.append(
							new Element('fa-icon', {name : 'clipboard'})
								.addEventListener( 'click', () => {
									copyToClipboard(code);
								})
						)
				)
		)
		.append(
			codeColor
		)

	const array = multiSmartSplit(code, [' ', ',', '\\(', '\\)', '\\[', '\\]', '\\.', ';', ':', '\\{', '\\}', '\n', '\t']);

	for(let token of array){
		colorCodeElement(codeColor.element, token);
	}

	return container.element
})


// ----------------------------------------------------------------------------------------
//														chatbot-pseudo-code

/*
Possibilité de modifier cet élément
*/

Element.customElements.set('chatbot-pseudo-code', ({name, inner}) => {

	const codeColor = new Element('pre').class('code')
		.attrFromMap(new Map([
			['spellcheck', false]
		]));

	const container = new Element('div').class('container')
		.append(
			new Element('div').class('topbar')
				.append(
					new Element('h2').class('spacer-small-pb', 'spacer-small-pt', 'wrapper')
						.css({
							color : 'var(--color-white)',
						})
						.text(name)
				)
				.append(
					new Element('button')
						.append(
							new Element('fa-icon', {name : 'clipboard'})
								.addEventListener( 'click', () => {
									copyToClipboard(inner);
								})
						)
				)
		)
		.append(
			codeColor
		)

	const array = multiSmartSplit(inner, [' ', ',', '\\(', '\\)', '\\[', '\\]', '\\.', ';', ':', '\\{', '\\}', '\n', '\t']);

	for(let token of array){
		colorCodeElement(codeColor.element, token);
	}

	return container.element
})

// ----------------------------------------------------------------------------------------
//														chatbot-error

Element.customElements.set('chatbot-error', ({type, detail}) => {

	return new Element('div').class('flex-column')
		.css({
			backgroundColor : 'var(--color-black)'
		})
		.append(
			new Element('chatbot-color', {
				text : `ERROR : ${type}`,
				color : 'var(--color-red)',
			}).class('large-text')
		)
		.append(
			new Element('chatbot-color', {
				text : detail,
				color : 'var(--color-red)',
			})
		)
		.element
})

// ----------------------------------------------------------------------------------------
//														chatbot-object-redirection

/*
ERROR
TEXT
GRAPH
WIKIPEDIA
YOUTUBE
TEXT
IMAGE
INFO_GOLPEX
CODE
others...

Example : ERROR:CODE code
*/

/*
```[name:arg0,arg1,...]
[innerContent]
```
*/

let objectRedirection = new Map();

objectRedirection.set(
	'ERROR',
	(detail, type) => new Element('chatbot-error', {type, detail}).element
);
objectRedirection.set(
	'CODE',
	(code, language) => new Element('chatbot-code', {language, code}).element
);
objectRedirection.set(
	'GRAPH',
	(equation) => {
		equation = cleanEquation(equation);
		console.log(equation)
		return new Element('desmos-graph', {equation}).element
	}
);
objectRedirection.set(
	'WIKIPEDIA',
	(topic) => {
		const asyncContainer = new Element('div').element;

		// Quand la page sera trouvée, la mettre dans un conteneur
		async function temp(){
			const page = await searchWikipedia(topic);
			new Element('wikipedia', {title : page.title}).attachTo(asyncContainer);
		}
		temp()

		return asyncContainer
	}
);

objectRedirection.set(
	'YOUTUBE',
	(topic) => {
		const asyncContainer = new Element('div')
			.append(
				new Element('chatbot-error', {type : 'API payante', detail : 'Recherche de solutions alternatives... =('})
			)
			.element;

		// Quand la page sera trouvée, la mettre dans un conteneur
		async function temp(){
			const video = await searchYoutube(topic);
			new Element('youtube', {videoid : video.id}).attachTo(asyncContainer);
		}
		temp()

		return asyncContainer
	}
);
objectRedirection.set(
	'IMAGE',
	(prompt) => {
		const asyncContainer = new Element('div').element;

		// Quand la page sera trouvée, la mettre dans un conteneur
		async function temp(){
			const image = await T2I_executor(prompt);
			asyncContainer.appendChild(image);
		}
		temp()

		return asyncContainer
	}
);

objectRedirection.set(
	'PDF_FILES',
	(pages, path) => {

		pages = pages ? pages.split(',') : [];
		
		const asyncContainer = new Element('div')
			.class('flex-gap20', 'flex-column')
			.element;

		new Element('chatbot-a', {href : path, text : path}).attachTo(asyncContainer)

		for(let page of pages) {
			new Element('pdf-canvas', {path, page}).attachTo(asyncContainer);
		}

		//new Element('slide', {}).attachTo(asyncContainer)
		return asyncContainer
	}
);

objectRedirection.set(
	'HUGGING_FACE',
	(topic) => {
		const space = search(topic, huggingfaceSpaces);
		return new Element('huggingface', {spaceName : space.name}).element;
	}
);

objectRedirection.set(
	'TEXT',
	(text) => new Element('p').text(text).element
);
objectRedirection.set(
	'INFO_GOLPEX',
	(text) => new Element('p').text(text).element
);

Element.customElements.set('chatbot-object-redirection', ({name, inner}) => {

	let [command, args] = name.split(':');
	if (args) {
		args = args.split(',');
	} else {
		args = [];
	}
	//console.log(command, args)
	
	const commandObject = objectRedirection.get(command);
	if (commandObject) {
		return commandObject(inner,...args)
	}
	return new Element('chatbot-pseudo-code', {name : command, inner}).element // faire un élément dédié au lieu d'utiliser 'code'
	 
})

// ===============================================================================================================================
// ===============================================================================================================================
//													HTML/CSS - elements OLD
// ===============================================================================================================================


const createElement = {

	
	codearea : (text) => {
		const element = document.createElement('textarea');
		element.classList.add('code');
		element.setAttribute('spellcheck', 'false');
		return element
	},

	// maths structure

	classMethodObject : (className) => {

		let name = 'NAME';

		const element = document.createElement('div');
		element.classList.add('method');

		element.style.display = 'flex';
		element.style.flexDirection = 'column';

		// topbar

		const topBar = document.createElement('div');
		element.appendChild(topBar);
		topBar.classList.add('topbar');

		const buttonDelete = document.createElement('button');
		const methodContainer = document.createElement('div');
		const buttonModify = document.createElement('button');
		const buttonValidate = document.createElement('button');
		buttonValidate.classList.add('inactive');

		buttonDelete.onclick = () => {
			element.remove();
			mp.deleteMethod(className, name);
			console.log(mp.StructureBuilder.classes.get(className).methods);
		}

		buttonModify.onclick = () => {
			editArea.classList.remove('inactive');
			buttonValidate.classList.remove('inactive');
			buttonModify.classList.add('inactive');
			//...
		}

		buttonValidate.onclick = () => {
			editArea.classList.add('inactive');
			buttonValidate.classList.add('inactive');
			buttonModify.classList.remove('inactive');
			validateCode(editArea.value);
		}

		buttonDelete.classList.add('btn');
		methodContainer.classList.add('name');
		buttonModify.classList.add('btn');
		buttonValidate.classList.add('btn');

		buttonDelete.appendChild( new Element('fa-icon', {name : 'trash'}).element );
		buttonModify.appendChild( new Element('fa-icon', {name : 'pencil'}).element );
		buttonValidate.appendChild( new Element('fa-icon', {name : 'check'}).element );

		const methodName = document.createElement('span');
		methodName.innerText = `method:NAME(ARGS) : `;
		// remplacer NAME et ARGS par les valeurs programmées
		const methodAppearence = document.createElement('input');
		methodAppearence.value = 'this+obj';
		methodAppearence.style.backgroundColor = 'white'; // input pour apparence
		methodAppearence.setAttribute('disabled', true); // temp
		methodAppearence.style.display = 'none'; // temp

		methodContainer.appendChild(methodName);
		methodContainer.appendChild(methodAppearence);

		topBar.appendChild(buttonDelete);
		topBar.appendChild(methodContainer);
		topBar.appendChild(buttonModify);
		topBar.appendChild(buttonValidate);

		// edit

		const editArea = createElement.codearea();
		editArea.classList.add('inactive');
		element.appendChild(editArea);

		editArea.onkeyup = (e) => {
			const value = editArea.value;

			if(e.key === 'Enter' && e.ctrlKey){
				validateCode(value);
			}
		}

		function validateCode(code) {
			console.log(code);

			//const interpretedCode = mp.readMethodCode(value.split('\n'));
			try {
				//delete old method
				mp.deleteMethod(className, name);

				//build new method
				const interpretedCode = mp.readMethodCode(code.split('\n'));
				methodName.innerText = `method:${interpretedCode.name}(${interpretedCode.data.arguments.toString()}) : `;
				
				mp.addNewMethod(className, code);
				console.log(mp.StructureBuilder.classes.get(className).methods);
				name = interpretedCode.name;

			} catch(error) {
				console.error('Error while interpreting code', error);
				sendError(
					'System - Code Validation',
					`Error while interpreting code :\n${error}`,
					'Left'
				);
			}
		}

		editArea.value = 'method:NAME(args)';

		return element
	},
	classObjectObject : (className) => {

		let name = 'NAME'

		const element = document.createElement('div');
		element.classList.add('object');

		element.style.display = 'flex';
		element.style.flexDirection = 'column';

		// topbar

		const topBar = document.createElement('div');
		element.appendChild(topBar);
		topBar.classList.add('topbar');

		const buttonDelete = document.createElement('button');
		const objectContainer = document.createElement('div');
		const buttonModify = document.createElement('button');
		const buttonValidate = document.createElement('button');
		buttonValidate.classList.add('inactive');

		buttonDelete.onclick = () => {
			element.remove();
			mp.deleteObject(className, name);
			console.log(mp.StructureBuilder.classes.get(className).objects);
		}

		buttonModify.onclick = () => {
			editArea.classList.remove('inactive');
			buttonValidate.classList.remove('inactive');
			buttonModify.classList.add('inactive');
			//...
		}

		buttonValidate.onclick = () => {
			editArea.classList.add('inactive');
			buttonValidate.classList.add('inactive');
			buttonModify.classList.remove('inactive');
			validateCode(editArea.value);
		}

		buttonDelete.classList.add('btn');
		objectContainer.classList.add('name');
		buttonModify.classList.add('btn');
		buttonValidate.classList.add('btn');

		buttonDelete.appendChild( new Element('fa-icon', {name : 'trash'}).element );
		buttonModify.appendChild( new Element('fa-icon', {name : 'pencil'}).element );
		buttonValidate.appendChild( new Element('fa-icon', {name : 'check'}).element );

		const objectName = document.createElement('span');
		objectName.innerText = `object:${name}(ARGS) :`;
		// remplacer NAME et ARGS par les valeurs programmées
		const objectAppearence = document.createElement('input');
		objectAppearence.value = 'var=this';
		objectAppearence.style.backgroundColor = 'white'; // input pour apparence
		objectAppearence.setAttribute('disabled', true); // temp
		objectAppearence.style.display = 'none'; // temp

		objectContainer.appendChild(objectName);
		objectContainer.appendChild(objectAppearence);

		topBar.appendChild(buttonDelete);
		topBar.appendChild(objectContainer);
		topBar.appendChild(buttonModify);
		topBar.appendChild(buttonValidate);

		// edit

		const editArea = createElement.codearea();
		editArea.classList.add('inactive');
		element.appendChild(editArea);

		editArea.onkeyup = (e) => {
			const value = editArea.value;

			if(e.key === 'Enter' && e.ctrlKey){
				validateCode(value);
			}
		}

		function validateCode(code) {
			//console.log(code);

			try {
				//delete old object
				mp.deleteObject(className, name);

				//build new object
				const interpretedCode = mp.readObjectLine(code.split('\n')[0]);
				objectName.innerText = `object:${interpretedCode.name}(${interpretedCode.args.toString()}) : `;
				
				mp.addNewObject(className, code);
				console.log(mp.StructureBuilder.classes.get(className).objects);
				name = interpretedCode.name;

			} catch(error) {
				console.error('Error while interpreting code', error);
				sendError(
					'System - Code Validation',
					`Error while interpreting code :\n${error}`,
					'Left'
				);
			}
		}

		editArea.value = 'object:NAME(args)';

		return element
	},

	classObject : (name) => {

		mp.newClass(name);
		console.log(mp.StructureBuilder.classes)
		
		/*
		INPUT
		background-color: white;
border: none;
border-radius: 20px;
padding: 5px;
margin: 5px;
font-family: Geologica;
		*/

		const element = document.createElement('div');
		element.classList.add('class-container');

		const topBar = document.createElement('div');
		const methodsContainer = document.createElement('div');
		const objectsContainer = document.createElement('div');
		const bottomBar = document.createElement('div');

		topBar.classList.add('topbar');
		methodsContainer.classList.add('methods');
		objectsContainer.classList.add('objects');
		bottomBar.classList.add('bottombar');

		element.appendChild(topBar);
		element.appendChild(methodsContainer);
		element.appendChild(objectsContainer);
		element.appendChild(bottomBar);

		// top bar

		const buttonDelete = document.createElement('button');
		const classContainer = document.createElement('div');
		const buttonModify = document.createElement('button');

		buttonDelete.onclick = () => {
			element.remove();
			mp.deleteClass(name);
		}

		buttonDelete.classList.add('btn');
		classContainer.classList.add('class');
		buttonModify.classList.add('btn');

		buttonDelete.appendChild( new Element('fa-icon', {name : 'trash'}).element );
		buttonModify.appendChild( new Element('fa-icon', {name : 'pencil'}).element );

		const className = document.createElement('span');
		className.innerText = `${name} : `;
		const classAppearence = document.createElement('input');
		classAppearence.value = ' (x,y,z,...)';
		classAppearence.style.backgroundColor = 'white'; // input pour apparence
		classAppearence.setAttribute('disabled', true); // temp
		classAppearence.style.display = 'none'; // temp

		classContainer.appendChild(className);
		classContainer.appendChild(classAppearence);

		topBar.appendChild(buttonDelete);
		topBar.appendChild(classContainer);
		topBar.appendChild(buttonModify);

		// methods

		//...

		// objects

		//...

		// bottom bar

		const methodAdd = document.createElement('button');
		const objectAdd = document.createElement('button');

		methodAdd.classList.add('btn');
		objectAdd.classList.add('btn');
		methodAdd.onclick = () => {
			methodsContainer.appendChild(createElement.classMethodObject(name))
		};
		objectAdd.onclick = () => {
			objectsContainer.appendChild(createElement.classObjectObject(name))
		};

		methodAdd.appendChild( new Element('fa-icon', {name : 'plus'}).element );
		methodAdd.appendChild( new Element('chatbot-color', {text : 'Method', color : '#1f1f1f'}).element );

		objectAdd.appendChild( new Element('fa-icon', {name : 'plus'}).element );
		objectAdd.appendChild( new Element('chatbot-color', {text : 'Object', color : '#1f1f1f'}).element );
		
		bottomBar.appendChild(methodAdd);
		bottomBar.appendChild(objectAdd);
		// ---
		return element
	},


	table : () => {
		//
	},
	tablerow : () => {
		//
	},
	tablecell : () => {
		//
	},

	array : (...argsElements) => {
		// [a,b,c,...]

		// [a,b,c] => [a,virgule,b,virgule,c]
		let newArr = [];

		for (let i = 0; i < argsElements.length; i++) {
			newArr.push(argsElements[i]); // Ajouter l'élément original
			if (i !== argsElements.length - 1) {
			newArr.push( createElement.operator(',') ); // Ne pas ajouter 'virgule' après le dernier élément
			}
		}

		const row = createElement.row(...newArr)
		// ---
		
		const vector = createElement.parenthesis(row, true, '[', ']');
		return vector
	}
}


const youtubeVideos = [
	// Analyse
	{
		id : 'WUvTyaaNkzM',
		author : '3Blue1Brown',
		title : "Essence of calculus : chapter 1 ; Au coeur de l'analyse",
		description : "Essence of calculus : chapter 1 ; Au coeur de l'analyse, 3b1b, 3blue1brown",
	},
	{
		id : '9vKqVkMQHKk',
		author : '3Blue1Brown',
		title : "Essence of calculus : The paradox of the derivative chapter 2 ; Le paradoxe de la dérivée | Chapitre 2, Au coeur de l'analyse",
		description : "Essence of calculus : The paradox of the derivative chapter 2 ; Le paradoxe de la dérivée | Chapitre 2, Au coeur de l'analyse, 3b1b, 3blue1brown",
	},

	// Algèbre Linéaire
	{
		id : 'fNk_zzaMoSs',
		author : '3Blue1Brown',
		title : "What is a vector? | Essence of Linear Algebra, Chapter 1 ; Qu'est-ce qu'un vecteur ? | Essence de l'algèbre linéaire, chapitre 1",
		description : "What is a vector? | Essence of Linear Algebra, Chapter 1 ; Qu'est-ce qu'un vecteur ? | Essence de l'algèbre linéaire, chapitre 1, 3b1b, 3blue1brown",
	},
	{
		id : 'k7RM-ot2NWY',
		author : '3Blue1Brown',
		title : "Linear, vector and basic vector combinations | Essence of Linear Algebra, Chapter 2 ; Combinaisons linéaires, vectoriel et vecteurs de base | Essence de l'algèbre linéaire, chapitre 2",
		description : "Linear, vector and basic vector combinations | Essence of Linear Algebra, Chapter 2 ; Combinaisons linéaires, vectoriel et vecteurs de base | Essence de l'algèbre linéaire, chapitre 2, 3b1b, 3blue1brown",
	},

	// Groupe
	{
		id : 'KufsL2VgELo',
		author : 'Nemean',
		title : "Researchers Use Group Theory to Speed Up Algorithms — Introduction to Groups; Des chercheurs utilisent la théorie des groupes pour accélérer les algorithmes — Introduction aux groupes",
		description : "Researchers Use Group Theory to Speed Up Algorithms — Introduction to Groups; Des chercheurs utilisent la théorie des groupes pour accélérer les algorithmes — Introduction aux groupes, Nemean",
	},
]

const soundcloudSong = [
	{
		id : '',
		author : '',
		title : "",
		description : "",
	},
]

const huggingfaceSpaces = [
	{
		name : 'cocktailpeanut-audiogen', 
		description : 'AudioGen, génération de sons, Facebook, MetaAI, sound generations, noise, bruit'
	},
	{
		name : 'hysts-sd-xl',
		description : 'Stable Diffusion, SD, génération d\'images, text to image, T2I, SDXL1.0, Stability, image generation'
	},
	{
		name : 'mms-meta-mms',
		description : 'Text to Speech, Speech to text, voix, parole, Language Identification, génération de voix, Transcription, MMS, TTS, ASR, Facebook, MetaAI'
	},
	{
		name : 'kevinwang676-bark-with-voice-cloning',
		description : 'Voice cloning, Text to Speech, clonage de voix, TTS, Bark, Suno'
	},
	{
		name : 'huggingface-projects-qr-code-ai-art-generator',
		description : 'qr code, text to image, image of qr code merged with art, T2I'
	},
	{
		name : 'facebook-musicgen',
		description : 'Text to Music, musique, sons, génération de musique, T2M, MusicGen, Facebook, MetaAI, LAST VERSION, BEST'
	},
	{
		name : 'fffiloni-image-to-musicgen',
		description : 'Image to Music, musique, sons, génération de musique avec image, I2M, MusicGen, fffiloni'
	},
]



const pdfFiles = [
	{
		path : './ressource/pdf/Fiches_AnalyseNumerique2.pdf',
		title : 'Analyse Numérique',
		grade : 'L3S2',
		description : 'Analyse Numérique, L3S2, Problème de Cauchy, Cauchy-Lipschitz local, Discrétisation, Méthodes numériques, Euler explicite, Euler implicite, Crank-Nicolson, Heun, Runge-Kutta, Résolution d\'équations, point fixe, ordre de convergence, théorème de convergence, méthode de Newton, Erreur de consistance, troncature, stabilité, stabilité absolue, lemme de gronwall discret, convergence, approximations'
	},
	{
		path : './ressource/pdf/Fiches_Statistiques.pdf',
		title : 'Statistiques',
		grade : 'L3S2',
		description : 'Statistiques, L3S2, variables aléatoires, convergences en probabilités, presque sûrement, loi forte des grands nombres, théorème central limite, lemme de Borel-Cantelli, Lemme de Slutsky, théorème de Cramér, Estimateurs, sans biais, asynpotiquement sans biais, fortement consistant, faiblement consistant, convergeant au sens Lp, fonction de répartition, intervalle de confiance, convergence en loi, moments empiriques, espérance, variance, maximum de vraissemblance, tests d\'hypothèses, fonction pivotale, gaussienne, loi de Poisson, binomiale'
	},
	{
		path : './ressource/pdf/Fiches_CalculDifferentielEquationsDifferentielles.pdf',
		title : 'Calcul différentiel et équations différentielles',
		grade : 'L3S2',
		description : 'Calcul différentiel, équations différentielles, L3S2, Théorème d\'inversion locale, théorème des fonctions implicites, extrema locaux, Jacobienne, Hessienne, coercive, anti-coercive, Multiplicateurs de Lagrange, développements limités, Lipschitz, Thérème de Cauchy-Lipschitz, Solution maximale, Solution globale, Intégrale première, Wronskien, Résolvante, Espace des solutions, Variation de la constante, exponentielle de matrice, formule de Duhamel, équation différentielle linéaire avec coefficients constants, système dynamique, solution stationnaire, points d\'équilibres, périodiques, stable, asynpotiquement stable, instable, le flot, lemme de gronwall continu, critère de stabilité, Théorème de Lyapunov, équation homogène, solution particulière'
	},
	{
		path : './ressource/pdf/Fiches_FonctionsAnalytiques.pdf',
		title : 'Fonctions analytiques',
		grade : 'L3S2',
		description : 'Fonctions analytiques, L3S2, Fonctions complexes, Série entière, fonction analytique, Principe des zéros isolés, Principe du prolongement analytique, principe du maximum, fonction holomorphe, exponentielle, équations de Cauchy-Riemann, Intégrer sur un chemin, Lacet, Indice, Théorème de Cauchy, équivalence holomorphe analytiques, résidus, développements de Laurent, Fonction méromorphe, Théorème des résidus, intégrale réelle, primitives, Thérème de Morera, Série de Fourier, polynôme trigonométrique, Normes Lp, pi, périodiques, convergence de séries, Série de Fourier, Noyaux, Théorème de Fejér, Théorème de Riesz-Fischer, théorème de Dirichlet, valeur principale de Cauchy'
	},
	{
		path : './ressource/pdf/Fiches_TheorieGroupes.pdf',
		title : 'Théorie des groupes',
		grade : 'L3S2',
		description : 'Théorie des groupes, L3S2, loi interne, neutre, inverse, loi associative, abéliens, table de Cayley, puissances et ordre, sous-groupes, produit de groupe, conjugué, groupes cycliques, morphismes, générateurs, engendrée, classification des groupes, ensembles Z/nZ, groupes Z/nZ, isomorphismes, Homomorphisme, Hom(), automorphismes, classes à gauche, classes à droite, Théorème de Lagrange, sous-groupe distingué, groupe quotient, Théorème d\'homomorphisme, Automorphismes intérieurs, groupe G, Aut(G), groupe symétrique, Sn, Permutations, transpositions, cycles, Théorème de Cayley, produit de cycles disjoints, signature, déterminant, groupe alterné, groupe simple, groupe normal, action de groupe, stabilisateurs, orbites, Lemme de Burnside, Formule des classes, Groupe abélien de type fini, groupe abélien libre, Bases adaptées, matrice de rapport, géométrie affine, espace vectoriel euclidien, symétrie, espace affine, osmétrie affine, Théorie des corps, Polynômes sur un corps, Structure de K*, Nombre unipériodique, division euclidienne'
	},
	/*
	{
		path : '',
		title : '',
		description : ''
	},
	*/
]
/*
				API
Wikipedia : free
Youtube : not free + auth token
Spotify : free + auth token
Soundcloud : free + auth token
OpenAI : not free + auth token
https://mixedanalytics.com/blog/list-actually-free-open-no-auth-needed-apis/
*/









// pageList : LIST of { name/id : STRING, description : STRING, ...}

function search(topic, pageList) {
  let maxScore = 0;
  let bestPage;

  for (let page of pageList) {
    let score = similarity(topic, page.description);
    if (score > maxScore) {
      maxScore = score;
      bestPage = page;
    }
  }

  return bestPage;
}

/*
function search(topic) {

  // Classe les pages par score de similarité décroissant
  const sortedPages = hugginfaceSpaces.sort((a, b) => {
    let scoreA = similarity(topic, a.description);
    let scoreB = similarity(topic, b.description);
    return scoreB - scoreA;
  });

  // Retourne les 3 premiers résultats
  return sortedPages.slice(0, 3); 
}*/


// strings similarity
// ClaudeV2 - generated

function similarity(a, b) {
  // Nettoyage du texte
  const clean = text => text.toLowerCase().replace(/[^\w\s]|_/g, "").replace('\'', ' ').split(/\s+/);
  a = clean(a);
  b = clean(b);
  
  // Similarité entre deux mots
  const wordSimilarity = (w1, w2) => {
    // Compte le nombre de lettres en commun
    let letters = 0; 
    for (let i = 0; i < Math.min(w1.length, w2.length); i++) {
      if (w1[i] === w2[i]) letters++; 
    }
    return letters / Math.max(w1.length, w2.length);
  }

  let score = 0;
  for (let word of a) {
    // Trouve le mot le plus similaire dans b
    let max = 0;
    for (let w of b) {
      let sim = wordSimilarity(word, w);
      if (sim > max) max = sim;
    }
    // Ajoute la similarité maximale au score
    score += max;
  }

  return score;
}


// ===============================================================================================================================
// ===============================================================================================================================
//													INIT
// ===============================================================================================================================




function init() {
	app = document.getElementById('appChatbot');
	promptInput = app.querySelectorAll('input')[0];
	chatOutput = app.querySelectorAll('output')[0];
	promptInput.onExec = (input, e) => multiTask(input, e);
	//console.log(app, promptInput, chatOutput)

	const ldsObj = new Element('lds', {})
		.css({
			position : 'absolute',
			background : 'var(--color-white-semi)',
			borderRadius : '100%',
			bottom : '20%',
			right : '10%',
		})
		.class('lds', 'display-none')
		
	ldsObj.attachTo(chatOutput)
	lds = ldsObj.element;

	send(
		"Golpex : Mathematics & Chatbot",
		"Bonjour, ce chatbot peut échanger avec vous, résoudre une tâche textuelle, coder des fonctions simples, chercher une page wikipedia, grapher une équation ou une fonction, générer une image et vous renseigner sur Golpex. Tapez /help pour en savoir plus sur les différentes commandes.",
		"Left"
	)
}

RENDERERS_INIT.set('appChatbot', init);