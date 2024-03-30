// ===============================================================================================================================
// ===============================================================================================================================
//													IMPORT
// ===============================================================================================================================

import * as bp from './brainPex.js';
import * as mp from './mathPex.js';



//GO_TO_RENDERER('golpexMath');
//GO_TO_RENDERER('golpexPaint');


// ===============================================================================================================================
// ===============================================================================================================================
//													HANDLER
// ===============================================================================================================================

const container = document.getElementById('golpexMath').getElementsByClassName('container')[0];


const handler = new bp.AppHandler(
	'menu',
	container
)

handler.output = handler.addOutput();

handler.input = handler.addInput(
	input => {
		multiTask(input);
	},
	'Demandez quelque chose',
	true
)

const lds = document.getElementById('global-lds');

function updateMathML2MathJax() {
	console.log('Pour update MathJax :', 'MathJax.typesetPromise()')
	MathJax.typesetPromise();
}

// ===============================================================================================================================
// ===============================================================================================================================
//													MULTI TASK
// ===============================================================================================================================

async function multiTask(input){
	lds.classList.remove('inactive');

	// ------------------------------------------------------------
	// 							COMMAND TASK

	if (input.startsWith('/')) {

		const command = parseCommand(input);
		if (!command) {
			console.error(`the command is mistyped`);
			sendError('System' , `the command is mistyped`, 'Left');
			lds.classList.add('inactive');
			return 0
		}
		if (!COMMANDS[command.name]) {
			console.error(`${command.name} : this command does not exist`);
			sendError('System' , `${command.name} : this command does not exist`, 'Left');
			lds.classList.add('inactive');
			return 0
		}
		/*
		const res = await COMMANDS[command.name](command.input);
		console.log(res);
		*/
		try {
			await COMMANDS[command.name](command.input);
			// code à exécuter en cas de succès
		} catch (error) {
			console.error('System', error);
			sendError('System' , error, 'Left');
			// code à exécuter en cas d'erreur
		}

		lds.classList.add('inactive');
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


	lds.classList.add('inactive');
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
		const [type, modelName] = input.split(' ');
		bp.CURRENT_MODELS[type] = bp.MODELS[modelName];
		send(
			"System",
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
		//const res = await LLM['command'](input);
		const res = await LLM_costCallback('command', input);
		send('System', `\`\`\`json\n${formatIndentedJson(JSON.stringify(res))}\`\`\``, 'Left');
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
		handler.output.element.appendChild(
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

	// /doc ['golpexCode'/'structure'/'operations'/'functions']
	doc : (input) => {
		if (input === 'golpexCode') {
			send("System", `
Les codes ci dessous sont des exemples d'implémentations de méthodes en golpex-code.

				GENERAL SCHEMA
\`\`\`General method of a class
method:NAME(ARGS)
let [VARIABLES]
INSTRUCTIONS
return:RETURN_VALUE
\`\`\`
				VECTORS
\`\`\`Addition of Vectors
method:add(this, vector)
let []
classic(this, PLUS, vector)
return:this
\`\`\`

\`\`\`Dot product of Vectors
method:dot(this, vector)
let [value]
classic(this, TIMES, vector)
value = apply(this, PLUS, vector)
return:value
\`\`\`

				POLYNOMS
\`\`\`Addition of Polynoms
method:add(this, polynom)
let []
classic(this, PLUS, polynom)
return:this
\`\`\`

\`\`\`Multiplication of Polynoms
method:multiply(this, polynom)
let []
convType1(this, TIMES, PLUS, polynom)
return:this
\`\`\`

\`\`\`Evaluation at x of a Polynom
method:at(this, x)
let [id, value]
id = index(this)
func(id, POW:x)
classic(id, TIMES, this)
value = apply(id, PLUS)
return:value
\`\`\`

\`\`\`Derivative of a Polynom
method:derivate(this)
let [deg, id, one]
one = real(1)
deg = length(this)
id = index(this)
classic(this, TIMES, id)
slice(this, one, deg)
return:this
\`\`\`
`, "Left")
		}
		if (input === 'structure') {
			send("System", `
Les méthodes ci-dessous sont les méthodes utilisables dans un golpex-code.

'Mutable' means that 'this' object is changed after applying the method.
'toVariable' means that 'this' is not changed, and the result of the method needs to be stored in a variable.

Values of 'other' are copied to 'this'.
\`\`\`Copy - Mutable
copy(this, other)
\`\`\`

Return a clone of object 'this'.
\`\`\`Clone - toVariable
clone(this)
\`\`\`

Values are resulted from values of 'this' OPERATION values of 'other'.
\`\`\`Classic - Mutable
classic(this, OPERATION, other)
\`\`\`

Values are reversed in order. (values at the beginning go to the end).
\`\`\`Reverse - Mutable
reverse(this)
\`\`\`

Values are sliced from value 'begin' to value 'end' (included).
\`\`\`Slice - Mutable
slice(this, begin, end)
\`\`\`

return the value we get when we apply OPERATION on all values.
\`\`\`Apply - toVariable
apply(this, OPERATION)
\`\`\`

Values are resulted from FUNCTION(value).
\`\`\`Func - Mutable
func(this, FUNCTION)
\`\`\`

//...
\`\`\`Join - //...
//...
\`\`\`

//...
\`\`\`Push - //...
//...
\`\`\`

return Length of object 'this'.
\`\`\`Length - toVariable
length(this)
\`\`\`

return the indices of object 'this' with Structure class.
\`\`\`Index - toVariable
index(this)
\`\`\`

return a Structure [0, 1, ..., N].
\`\`\`Id - toVariable
id(N)
\`\`\`

return the real value of x.
\`\`\`Real - toVariable
real(x)
\`\`\`

Values are resulted from the natural convolution of 'this' and 'other' values.
- see "Convolution in Discrete Probability Theory"
\`\`\`ConvType1 - Mutable
convType1(this, INNER_OPERATION, OUTER_OPERATION, other)
\`\`\`

Values are resulted from the opposite convolution of 'this' and 'other' values.
- see "Multiplication of Polynoms"
\`\`\`ConvType2 - Mutable
convType2(this, INNER_OPERATION, OUTER_OPERATION, other)
\`\`\`

`, "Left")
		}
		if (input === 'operations') {
			//...
		}
		if (input === 'functions') {
			//...
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
	const loadElement = await sendLoading('System - LOADING', 'Envoi requête');
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

	if (!equation) return '[ERROR GRAPH: No "equation" found]'

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

	output += `\n[GRAPH : ${equation.value}]`;

	return output
}

// CODE -------------------------------------------

async function LLM_Code(input, args){
	const STOP_TOKEN = "code completed !";
	const MAX_ITERATION = 17;

	const language_used = args.find( e => e.arg === "language_used");
	const goal = args.find( e => e.arg === "goal");

	if (!language_used) return '[ERROR : in CODE: No "language_used" found]'
	if (!goal) return '[ERROR : in CODE: No "goal" found]'

	const prompt =
`### instructions :
Given the context, write a code given a language and a goal to achieve.
Use the format :
\`\`\`${language_used.value}
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
			return '[ERROR : in WIKIPEDIA : No "topic" or "about" found]'
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

	output += `\n[WIKIPEDIA : ${topic.value}]`;

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
			return '[ERROR : in WIKIPEDIA : No "topic" or "about" found]'
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

	output += `\n[YOUTUBE : ${topic.value}]`;

	return output
}

// TEXT -------------------------------------------

async function LLM_Text(input, args){
	const STOP_TOKEN = "text completed !";
	const MAX_ITERATION = 23;

	const about = args.find( e => e.arg === "about");
	const goal = args.find( e => e.arg === "goal");

	if (!about) return '[ERROR : in TEXT : No "about" found]'
	if (!goal) return '[ERROR : in TEXT : No "goal" found]'

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

	if (!requested_info) return '[ERROR : in INFO GOLPEX : No "requested_info" found]'

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

	if (!prompt) return '[ERROR : in INFO GOLPEX : No "prompt" found]'

	return `[IMAGE : ${prompt.value}]`
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
//													HTML/CSS - elements
// ===============================================================================================================================


// CODE -------------------------------------------


function isCodeDetected(input) {
	let regex = /```([^`]+)```/g;
	return regex.test(input)
}

function extractCode(input) {
	const inputArray = input.split('```')
	const content = inputArray[1].split('\n');
	const language = content[0];
	const code = content.slice(1).join('\n');
	return {language : language, code : code, beforeCode : inputArray[0], afterCode : inputArray.slice(2).join('```')}
}

const KEY_WORD_LIST_RED = ['return', 'public', 'private', 'require', 'or', 'and', 'if', 'else', 'elif', 'switch', 'case', 'break', 'try', 'catch', 'for', 'while', 'in', 'for', '#include', 'template', 'import', 'export'];
const KEY_WORD_LIST_YELLOW = ['self', 'this', 'class'];
const KEY_WORD_LIST_AQUA = [ 'await', 'async', 'def', 'function', '=>', 'int', 'str', 'bool', 'void', 'const', 'let', 'var'];
const KEY_WORD_LIST_SALMON = ['==', '===', '<=', '>=', '->', '-->', '<', '>', '!=', '!==', '+', '-', '*', '/', '%', '@', ',', ';', '.', ':', '!', '^', '**', '+=', '-=', '*=', '/=', '%=', 'new'];

function colorCodeElement(element, token) {
	if ( KEY_WORD_LIST_RED.includes( token.replaceAll(' ', '') ) ) {
		element.appendChild( createElement.spanColor(token, 'orangered') );
		return element
	} 
	if ( KEY_WORD_LIST_YELLOW.includes( token ) ) {
		element.appendChild( createElement.spanColor(token, '#ffff66') );
		return element
	}
	if ( KEY_WORD_LIST_AQUA.includes( token ) ) {
		element.appendChild( createElement.spanColor(token, 'Aqua') );
		return element
	}
	if ( KEY_WORD_LIST_SALMON.includes( token ) ) {
		element.appendChild( createElement.spanColor(token, 'salmon') );
		return element
	}
	element.appendChild( createElement.spanColor(token, 'lightblue') )
	return element
}

// GRAPH -------------------------------------------

function isGraphDetected(input) {
	const regex = /\[GRAPH\s*:\s*(.*?)\]/;
	return regex.test(input)
}

function extractGraph(input) {
	const regex = /\[GRAPH\s*:\s*(.*?)\]/;

	const matches = input.match(regex);

	const inputArray = input.split(matches[0]);
	const equation = cleanEquation(matches[1]);

	return {graph : equation, beforeGraph : inputArray[0], afterGraph : inputArray.slice(1).join(matches[0])}
}

function cleanEquation(input) {
	// remplacer par du regex
	return input.
		replaceAll('(', '{(').
		replaceAll(')', ')}').
		replaceAll('sqrt', '\\sqrt').
		replaceAll('cos', '\\cos').
		replaceAll('sin', '\\sin')
}

// WIKIPEDIA -------------------------------------------

function isWikiDetected(input) {
	const regex = /\[WIKIPEDIA\s*:\s*(.*?)\]/;
	return regex.test(input)
}

function extractWiki(input) {
	const regex = /\[WIKIPEDIA\s*:\s*(.*?)\]/;

	const matches = input.match(regex);

	const inputArray = input.split(matches[0]);
	const topic = matches[1];

	return {wiki : topic, beforeWiki : inputArray[0], afterWiki : inputArray.slice(1).join(matches[0])}
}

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

// Image -------------------------------------------

function isImageDetected(input) {
	const regex = /\[IMAGE\s*:\s*(.*?)\]/;
	return regex.test(input)
}

function extractImage(input) {
	const regex = /\[IMAGE\s*:\s*(.*?)\]/;

	const matches = input.match(regex);

	const inputArray = input.split(matches[0]);
	const description = matches[1];

	return {description, beforeImage : inputArray[0], afterImage : inputArray.slice(1).join(matches[0])}
}

// SEND MESSAGE -------------------------------------------


async function send(sender, input, direction) {
	const element = await createElement.message(sender, input, direction)
	handler.output.element.appendChild( element );
	new Memory(sender, input, element);

	//scroll vers le bas
	handler.output.element.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
	return 1
}

async function sendError(sender, input, direction) {
	const element = await createElement.messageError(sender, input, direction);
	handler.output.element.appendChild( element );
	
	//scroll vers le bas
	handler.output.element.scrollTo({ top: element.offsetTop, behavior: 'smooth' });

	setTimeout(()=>{
		  element.remove();
		}, 20000);
	return 1
}

async function sendLoading(sender, input) {
	const element = await createElement.messageLoading(sender, input);
	handler.output.element.appendChild( element );

	//scroll vers le bas
	handler.output.element.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
	return element
}

// Create Elements -------------------------------------------

const createElement = {

	//basic
	divCentered : () => {
		const element = document.createElement('div');
		element.classList.add('div-centered');
		return element
	},
	p : (text) => {
		const element = document.createElement('p');
		element.innerText = text;
		return element
	},
	pre : (text) => {
		const element = document.createElement('pre');
		element.innerText = text;
		return element
	},
	span : (text) => {
		const element = document.createElement('span');
		element.innerText = text;
		return element
	},
	input : (placeholder) => {
		const element = document.createElement('input');
		element.setAttribute('placeholder', placeholder);
		return element
	},
	textarea : (text) => {
		const element = document.createElement('textarea');
		element.innerText = text;
		return element
	},
	

	//custom

	message : async (sender, input, direction = '') => {
		const element = document.createElement('div');
		element.classList.add('message');
		element.style[`borderBottom${direction}Radius`] ='0px';
		

		const senderElement = document.createElement('h2');
		senderElement.classList.add('title');
		senderElement.innerText = sender;
		element.appendChild(senderElement);

		//...
		
		
		// detect and create code
		while (isCodeDetected(input)) {
			const res = extractCode(input);
			input = res.afterCode;
			const text = createElement.p(res.beforeCode);
			const code = createElement.code(res.language, res.code);
			element.appendChild(text);
			element.appendChild(code);
		}

		// detect and graph
		while (isGraphDetected(input)) {
			const res = extractGraph(input);
			input = res.afterGraph;
			const text = createElement.p(res.beforeGraph);
			const graph = createElement.desmosGraph(res.graph);
			element.appendChild(text);
			element.appendChild(graph);
		}

		// detect and wiki
		while (isWikiDetected(input)) {
			const res = extractWiki(input);
			input = res.afterWiki;
			const text = createElement.p(res.beforeWiki);
			const page = await searchWikipedia(res.wiki);
			const wiki = createElement.wikipedia(page.title);
			element.appendChild(text);
			element.appendChild(wiki);
		}

		// detect and image
		while (isImageDetected(input)) {
			const res = extractImage(input);
			input = res.afterImage;
			const text = createElement.p(res.beforeImage);
			console.log(res, res.description)
			const image = await T2I_executor(res.description);
			const imageContainer = createElement.divCentered();
			element.appendChild(text);
			element.appendChild(imageContainer.appendChild(image));
		}



		// pure text
		element.appendChild( createElement.p(input) )

		return element
		
	},
	messageError : async (sender, input, direction = '') => {
		const element = document.createElement('div');
		element.classList.add('message');
		element.style[`borderBottom${direction}Radius`] ='0px';
		element.style.color = '#a90000';
		element.style.backgroundColor = '#ffa7004a';
		

		const senderElement = document.createElement('h2');
		senderElement.classList.add('title');
		senderElement.innerText = sender;
		element.appendChild(senderElement);

		element.appendChild( createElement.p(input) )

		return element
	},
	messageLoading : async (sender, input) => {
		const element = document.createElement('div');
		element.classList.add('message');
		element.style.backgroundColor = '#ffb693c2';
		

		const senderElement = document.createElement('h2');
		senderElement.classList.add('title');
		senderElement.innerText = sender;
		element.appendChild(senderElement);

		element.appendChild( createElement.p(input) )

		return element
	},
	spanColor : (text, color) => {
		const element = document.createElement('span');
		element.innerText = text;
		element.style.whiteSpace = 'pre';
		element.style.color = color;
		return element
	},
	code : (language, code) => {
		const element = document.createElement('div');
		element.classList.add('container');

		const topbar = document.createElement('div');
		topbar.classList.add('topbar');
		element.appendChild(topbar);

		const languageElement = document.createElement('h2');
		
		languageElement.style.color = 'white';
		languageElement.style.display = 'flex';
		languageElement.style.alignItems = 'center';
		languageElement.style.padding = '0px 20px';

		languageElement.innerText = language;
		topbar.appendChild(languageElement);

		const btnCopy = document.createElement('button');
		btnCopy.appendChild(createElement.fa('clipboard'));
		btnCopy.onclick = () => {copyToClipboard(code)};
		topbar.appendChild(btnCopy);
		

		const codeElement = document.createElement('pre');
		codeElement.classList.add('code')
		codeElement.setAttribute('spellcheck', 'false');
		element.appendChild(codeElement);
		//element.innerText = code;

		// rajouter couleur en fonction de language
		//bleu violet rouge blanc orange

		const array = multiSmartSplit(code, [' ', ',', '\\(', '\\)', '\\[', '\\]', '\\.', ';', ':', '\\{', '\\}', '\n', '\t']);
		//console.log(array);
		for(let token of array){
			colorCodeElement(codeElement, token);
		}
		// ---

		return element
	},
	codearea : (text) => {
		const element = document.createElement('textarea');
		element.classList.add('code');
		element.setAttribute('spellcheck', 'false');
		return element
	},
	wikipedia : (title) => {
		const element = document.createElement('iframe');
		element.src = `https://fr.wikipedia.org/wiki/${title}`;
		element.classList.add('wikipedia');
		return element
	},
	mathcha : (pageid) => {
		const element = document.createElement('iframe');
		element.src = `https://www.mathcha.io/editor/${pageid}?embedded=true`;
		element.setAttribute('frameBorder', "0");
		element.classList.add('mathcha');
		return element
	},
	youtube : (videoid) => {
		const element = document.createElement('iframe');
		element.src = `https://www.youtube-nocookie.com/embed/${videoid}`;
		element.setAttribute('frameBorder', "0");
		element.setAttribute('title', "YouTube video player");
		element.setAttribute('allow', "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
		element.setAttribute('allowfullscreen', true);
		element.classList.add('youtube');
		return element
	},
	huggingface : (spaceName) => {
		const element = document.createElement('iframe');
		element.src = `https://${spaceName}.hf.space`;
		element.setAttribute('frameBorder', "0");
		element.classList.add('huggingface');
		return element
	},
	desmos : (id) => {
		const element = document.createElement('iframe');
		element.src = `https://www.desmos.com/calculator/${id}?embed`;
		element.setAttribute('frameBorder', "0");
		element.classList.add('desmos');
		return element
	},
	desmosGraph : (equation = 'x^2+y^2=100') => {
		console.log('https://www.desmos.com/api/v1.8/docs/index.html?lang=fr#document-basic-calculators');

		const element = document.createElement('div');
		element.classList.add('desmos');
		element.classList.add('graph');
		const calculator = Desmos.GraphingCalculator(element);
		calculator.setExpression({
			latex: equation,
			color: '#ff8c00'
		});
		return element
	},
	soundCloud : (equation = 'x^2+y^2=100') => { // à faire
		const element = document.createElement('div');
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

		buttonDelete.appendChild( createElement.fa('trash') );
		buttonModify.appendChild( createElement.fa('pencil') );
		buttonValidate.appendChild( createElement.fa('check') );

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

		buttonDelete.appendChild( createElement.fa('trash') );
		buttonModify.appendChild( createElement.fa('pencil') );
		buttonValidate.appendChild( createElement.fa('check') );

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

		buttonDelete.appendChild( createElement.fa('trash') );
		buttonModify.appendChild( createElement.fa('pencil') );

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

		methodAdd.appendChild( createElement.fa('plus') );
		methodAdd.appendChild( createElement.spanColor('Method', '#1f1f1f') );

		objectAdd.appendChild( createElement.fa('plus') );
		objectAdd.appendChild( createElement.spanColor('Object', '#1f1f1f') );
		
		bottomBar.appendChild(methodAdd);
		bottomBar.appendChild(objectAdd);
		// ---
		return element
	},

	//fontawesome
	fa : (iconName) => {
		const element = document.createElement('i');
		element.classList.add(`fa-solid`);
		element.classList.add(`fa-${iconName}`);
		return element
	},

	//MathML
	math : (innerElement) => {
		const element = document.createElement('math');
		element.setAttribute('xmlns', "http://www.w3.org/1998/Math/MathML");
		element.appendChild(innerElement);
		return element
	},
	row : (...elements) => {
		const row = document.createElement('mrow');
		for(let element of elements) {
			row.appendChild(element);
		}
		return row
	},
	fraction : (overElement, underElement) => {
		const frac = document.createElement('mfrac');
		frac.appendChild(overElement);
		frac.appendChild(underElement);
		return frac
	},
	sqrt : (innerElement) => {
		const element = document.createElement('msqrt');
		element.appendChild(innerElement);
		return element
	},
	root : () => {
		//
	},
	sub : (element, subElement) => {
		const sub = document.createElement('msub');
		sub.appendChild(element);
		sub.appendChild(subElement);
		return sub
	},
	sup : (element, supElement) => {
		const sup = document.createElement('msup');
		sup.appendChild(element);
		sup.appendChild(supElement);
		return sup
	},
	subsup : (element, subElement, supElement) => {
		const subsup = document.createElement('msubsup');
		subsup.appendChild(element);
		subsup.appendChild(subElement);
		subsup.appendChild(supElement);
		return subsup
	},
	under : (element, underElement) => {
		const under = document.createElement('munder');
		under.appendChild(element);
		under.appendChild(underElement);
		return under
	},
	over : (element, overElement) => {
		const mover = document.createElement('mover');
		mover.appendChild(element);
		mover.appendChild(overElement);
		return mover
	},
	underover : (element, underElement, overElement) => {
		const underover = document.createElement('munderover');
		underover.appendChild(element);
		underover.appendChild(underElement);
		underover.appendChild(overElement);
		return underover
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
	text : (text) => {
		const element = document.createElement('mtext');
		element.innerText = text;
		return element
	},
	operator : (operator) => {
		const element = document.createElement('mo');
		element.innerText = operator;
		return element
	},
	variable : (variable) => {
		const element = document.createElement('mi');
		element.innerText = variable;
		return element
	},
	number : (number) => {
		const element = document.createElement('mn');
		element.innerText = number;
		return element
	},
	unit : (unit) => {
		const element = document.createElement('ms');
		element.innerText = unit;
		return element
	},
	error : () => {
		//
	},
	
	integral : (a, b, innerElement, variableName) => {
		// intagrel(a,b) inner dx
		const integral = createElement.operator('∫');
		//integral.setAttribute('data-mjx-texclass', "OP");

		const definiteIntegral = createElement.subsup(integral, a, b);
		const intergrand = innerElement;
		const differential = createElement.variable('d');
		const variable = createElement.variable(variableName);

		const element = createElement.row(definiteIntegral, intergrand, differential, variable);
		
		return element
	},

	function : (functionName, ...argsElements) => { // pas fait
		// f(x,y,z...)
		const _function = createElement.variable(functionName);
		//
	},

	parenthesis : (innerElement, isStretchy = true, inSymbol = '(', outSymbol = ')') => {
		// (inner)
		const inElement = createElement.operator(inSymbol);
		inElement.setAttribute('stretchy', isStretchy);
		const outElement = createElement.operator(outSymbol);
		outElement.setAttribute('stretchy', isStretchy);
		const element = createElement.row(inElement, innerElement, outElement);
		return element
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

/*

function multiSplit(text, separators) {
		const result = text.split(new RegExp(`(${separators.join('|')})`, 'g'));
		return result
}
undefined
multiSplit('Linear Algebra: Introduction to Vector Spaces', [' ', ':'])
Array(13) [ "Linear", " ", "Algebra", ":", "", " ", "Introduction", " ", "to", " ", … ]
​
0: "Linear"
​
1: " "
​
2: "Algebra"
​
3: ":"
​
4: ""
​
5: " "
​
6: "Introduction"
​
7: " "
​
8: "to"
​
9: " "
​
10: "Vector"
​
11: " "
​
12: "Spaces"
​
length: 13
​
<prototype>: Array []

multiSplit('Abstract vector spaces | Chapter 16, Essence of linear algebra', [' ', ':', '|'])
Array(105) [ "A", "", "b", "", "s", "", "t", "", "r", "", … ]

multiSplit('Abstract vector spaces | Chapter 16, Essence of linear algebra', [' ', ':'])
Array(19) [ "Abstract", " ", "vector", " ", "spaces", " ", "|", " ", "Chapter", " ", … ]
​
0: "Abstract"
​
1: " "
​
2: "vector"
​
3: " "
​
4: "spaces"
​
5: " "
​
6: "|"
​
7: " "
​
8: "Chapter"
​
9: " "
​
10: "16,"
​
11: " "
​
12: "Essence"
​
13: " "
​
14: "of"
​
15: " "
​
16: "linear"
​
17: " "
​
18: "algebra"
​
length: 19
​
<prototype>: Array []

*/

const youtubeVideos = [
	{ id : 'WUvTyaaNkzM', title : "Essence of calculus : chapter 1 ; Au coeur de l'analyse"},
	{ id : '9vKqVkMQHKk', title : "Essence of calculus : The paradox of the derivative chapter 2 ; Le paradoxe de la dérivée | Chapitre 2, Au coeur de l'analyse"}
]

const soundcouldSong = [
	
]

/*
send(
	"System",
	`Modèle recommandé : ${bp.MODELS.GUANACO_33B}
	Modèle utilisé : ${bp.CURRENT_MODELS.LLM}`,
	"Left"
);*/
send(
	"Golpex : Mathematics & Chatbot",
	"Bonjour, ce chatbot peut échanger avec vous, résoudre une tâche textuelle, coder des fonctions simples, chercher une page wikipedia, grapher une équation ou une fonction, générer une image et vous renseigner sur Golpex. Tapez /help pour en savoir plus sur les différentes commandes.",
	"Left"
)
