import * as bp from './brainPex.js';

/*
JSON.parse security issue

Stackoverflow Question:

I am concerned about security issues when parsing user-supplied JSON data in my application. Can someone summarize potential security risks and best practices when using JSON.parse? Thanks.

Stackoverflow Top Answer:

When using JSON.parse, there are some things that developers should keep in mind regarding potential security risks:

    JSON.parse does not evaluate any JavaScript code, it only parses JSON data.
    However, it is still possible for a malicious user to create a JSON payload that could cause problems when parsed by JSON.parse. For example, if the JSON data contains a lot of nested objects or arrays, it could cause the parse operation to consume a lot of system resources, potentially leading to denial-of-service attacks.
    The structured nature of JSON data also makes it a potential vector for escape attacks. For example, a specially-crafted JSON payload could contain escape sequences that allow an attacker to inject malicious code or bypass input validation filters.
    As with any user-supplied data, it is important to validate and sanitize JSON data before processing it. This includes checking that the JSON payload conforms to the expected structure, and filtering out any potentially dangerous content.

When it comes to best practices for using JSON.parse, here are a few recommendations:

    Always use strict mode and don't use the with statement.
    Use a try-catch block when using JSON.parse to catch any errors that might occur during parsing.
    Consider using a JSON validation library such as Ajv to validate user-supplied JSON data against a schema.
    Avoid using JSON.parse on untrusted data or in a context where it could be exposed to malicious users. For example, if you're building a REST API that accepts JSON payloads, make sure to enforce proper authentication and access controls to prevent unauthorized access.

*/

//GO_TO_RENDERER('golpexChatbot');

const handler = new bp.AppHandler(
	'chatbot',
	'golpexChatbot'
)

handler.output = new bp.Output(
	handler.element,
)

handler.input = new bp.Input(
	handler.element,
	input => {
		//handler.output.printLog(input);
		if (input === 'CLEAR') {
			CONVERSATION = [];
			handler.output.printLog(conversationToString());
			return 1
		}
		if (input === 'RETRY') {
			CONVERSATION.pop();
			CONVERSATION.pop();
			handler.output.printLog(conversationToString());
			return 1
		}
		if (input.startsWith('DEV')) {
			input = input.slice(4)
			devTask(input);
			return 1
		}
		if (input.startsWith('COMMAND')) {
			input = input.slice(8)
			commandTask(input);
			return 1
		}
		multiTask(input);
	},
	'Demandez quelque chose',
)

const lds = document.getElementById('golpexChatbot-lds');

//----------------------------------------------------

async function multiTask(input){
	lds.classList.remove('inactive');

	CONVERSATION.push(sendMessage('USER', input));
	handler.output.printLog(conversationToString());

	const res = await LLM_Conversation(input);
	CONVERSATION.push(sendMessage('GOLPEX BOT', res));
	handler.output.printLog(conversationToString());

	lds.classList.add('inactive');
	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}


async function devTask(input){
	lds.classList.remove('inactive');

	const res = await LLM_DevTools(input);
	handler.output.printLog(res);

	lds.classList.add('inactive');
	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}

async function commandTask(input){
	lds.classList.remove('inactive');

	const res = await LLM_Command(input);
	handler.output.printLog(res);
	const json = JSON.parse(res);
	console.log(json)

	lds.classList.add('inactive');
	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}


async function LLM_Executor(input){
	let cost = bp.API_Counter.LLM;

	//const prompt = bp.format.PROMPT + input + bp.format.ENDTXT + bp.format.ASSIST;
	const prompt = bp.format.INSTRUCT + input + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 5);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Executor : ','Coût = ' + cost);
	console.log(res)

	return output.split('#')[0]
}


let CONVERSATION = [];
const MAX_TOKEN = 1024;
const MEMORY_TOKEN = 512;
const MEMORY_MESSAGE = 20;

function sendMessage(sender, message){
	message = encodeTemp(message)
	return `{ "name" : "${sender}", "message" : "${message}"}`
}

function encodeTemp(message){
	return message.replaceAll('\n', '<LN>').replaceAll('"', '<3>').replaceAll('`', '<7>');
}

function decodeTemp(message){
	return message.replaceAll('<LN>', '\n').replaceAll('<3>', '"').replaceAll('<7>', '`');
}

function conversationToString(isForgetting = false){
	let conversation = [...CONVERSATION];
	if (isForgetting) {conversation = conversation.splice(-MEMORY_MESSAGE);}
	
	let string = '';
	for(let json of CONVERSATION){
		//console.log(json)
		const parsed = JSON.parse(json);
		string += `${parsed.name} : ${parsed.message}\n`;

		if (!isForgetting) {
			//affichage utilisateur
			string += '\n';
		}
	}
	if (isForgetting) return decodeTemp(string.substr(-MEMORY_TOKEN))
	return decodeTemp(string)
}

async function LLM_Conversation(input){
	let cost = bp.API_Counter.LLM;

	const prompt = 
`### instructions :
You are GOLPEX BOT, you help USER. 'input' is the conversation, continue it.
Information : Golpex is a project about learning mathematics intuively by playing games. These games have the special property that they have normal gameplays and you don't notice maths at first glance. Golpex relies on modern technology to be future-proof such as AI, VR/AR and blockchains. For other informations, please go to 'Contact me'.
After answering to USER, GOLPEX BOT finish by <END>.
### input :
${conversationToString(true)}
### response :
GOLPEX BOT :`;
	let res = await bp.promptIteratorLLM(prompt, 10);
	let output = bp.outputExtractor(prompt, res);

	output = output.split('<END>')[0].split('USER :')[0].split('USER:')[0].split('# 19')[0].split('###')[0].replaceAll('<START>','')
	

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Conversation : ','Coût = ' + cost);
	console.log(res,cost)

	if (cost === 10) return output + '...'

	return output
}


function CONV2JSON(){
	return `[${CONVERSATION.toString()}]`
}

function JSON2CONV(json){
	CONVERSATION = JSON.parse(json);
	return CONVERSATION
}

//Examples : { GOLPEX BOT : Here is an example [...]. <END> }, { GOLPEX BOT : To start with [...]. <END> }, { GOLPEX BOT : If you have [...]. <END> },


/*

//pour faire des recherches

const url = 'https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/spelling/SpellCheck?text=teylor%20swiift';
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': 'SIGN-UP-FOR-KEY',
		'X-RapidAPI-Host': 'contextualwebsearch-websearch-v1.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}
*/


// ------------------------------- AUTRES PROJETS -------------------------------


async function LLM_DevTools(input){
	let cost = bp.API_Counter.LLM;

	const prompt = 
`### instructions :
Write a function in javascript that correspond to input.
Write "<END>" after program.
### input :
${input}
### response :
`;
	let res = await bp.promptIteratorLLM(prompt, 10);
	let output = bp.outputExtractor(prompt, res);

	output = output.split('<END>')[0].split('# 19')[0].split('###')[0].replaceAll('<START>','')
	

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Conversation : ','Coût = ' + cost);
	console.log(res,cost)

	if (cost === 10) return output + '...'

	return output
}

/*
// DOCUMENT MODIFIER

### instructions :
Goal is to modify or complete code.
Write '<END>' after response.
Code : "let mesh = new THREE.Mesh( geometry1, material );
		let wireframe = new THREE.Mesh( geometry1, wireframeMaterial );
		mesh.add( wireframe );
		mesh.position.x = - 400;
		mesh.rotation.x = - 1.87;
		scene.add( mesh );

		mesh = new THREE.Mesh( geometry2, material );
		wireframe = new THREE.Mesh( geometry2, wireframeMaterial );
		mesh.add( wireframe );
		mesh.position.x = 400;
		scene.add( mesh );"
### input :
the second mesh should be on position.x = 500
### response :
	let mesh = new THREE.Mesh( geometry1, material );
	let wireframe = new THREE.Mesh( geometry1, wireframeMaterial );
	mesh.add( wireframe );
	mesh.position.x = - 400;
	mesh.rotation.x = - 1.87;
	scene.add( mesh );

	mesh =new THREE.Mesh( geometry2, material );
	wireframe =new THREE.Mesh( geometry2, wireframeMaterial );
	mesh.add( wireframe );
	mesh.position.x =500;
	scene.add( mesh );

<END> 


*/

/*
### instructions :
Given an input, response with the format {"args" : LIST OF FLOAT, "type" : STRING}
Write '<END>' after response.
### input :
Create the complex number 8-4i
### response :
{"args": [8, -4], "type": "complex"}
<END>



### instructions :
Given an input, response with the format {"args" : LIST OF FLOAT, "type" : STRING}
Write '<END>' after response.
### input :
Create the polynom 1+2X-X^2
### response :
{"args": [1, 2, -1], "type": "polynom"}
<END>
*/


/*

### instructions :
Given objects and an operation, response a resulted object in the format {"args": LIST OF FLOAT, "type": STRING}
Write '<END>' after response.
Rule of add : [x,y] add [a,b] = [x+a,y+b]
### input :
{"args": [1.0, 2.0], "type": "complex"}
{"args": [-1.0, 5.0], "type": "complex"}
add
### response :
{"args": [0.0, 7.0], "type": "complex"}
<END>



---------------------------------------------
{"args": [1.0, 2.0], "type": "complex"}
{"args": [-1.0, 5.0], "type": "complex"}
add
{"args": [0.0, 7.0], "type": "complex"}
---------------------------------------------
{"args": [1.0, 2.0], "type": "vector"}
{"args": [-1.0, 5.0], "type": "vector"}
add
{"args": [9.0], "type": "real"}
---------------------------------------------
{"args": [9.0], "type": "real"}
square root
{"args": [3.0], "type": "real"}
---------------------------------------------

*/

/*
class MathObject {
	constructor(args) {
		this.args = args
		this.methods = new Map();
	}

	async addMethod(name) {
		const method = await LLM_newMethod()
		this.methods.set(name, method);
		return method
	}

	async applyMethod(object1, object2) {
	}
}*/





/*

// ROLE PLAY

### instructions :
Role play game, User has to choose a theme. Response is the context of the game following user input.
Write '<END>' after context.
### input :
A futuristic starship
### response :
<END>

You are the captain of a futuristic starship, exploringthe far reaches of the galaxy. Your ship is equipped with the latest technology, allowing youto travel at speeds faster than light and to scan for lifeforms and resources on distant planets.

As you approach a nearby planet, your sensors detect a strange signal. It's unlike anything you've encountered before, and it's coming from the planet's surface.

You decide to investigate, and your crew prepares the ship for landing. As youdescend to the planet's surface, you notice that the landscape is unlike anything you've seenbefore. The planet is covered in thick forests, and the air is thick with the scentof ozone.

As you step out of the ship, you notice that the gravity isslightly weaker than what you're used to. You take a few cautious steps,and you feelyour muscles relax as you move.

You look around, and you noticethat the forest is teeming with life. You see creatures that you've never seenbefore, and you hear strange sounds that you can't quite identify.

You decide to...
*/




async function LLM_Command(input){
	let cost = bp.API_Counter.LLM;

	const prompt = 
`### instructions :
Identify a command in user input, response in the format :
{"command" : STRING, "args" : LIST OF STRING/FLOAT/BOOL }
Write '<END>' after response.
### input :
${input}
### response :`;
	let res = await bp.promptIteratorLLM(prompt, 2);
	let output = bp.outputExtractor(prompt, res);

	output = output.split('<END>')[0].split('USER :')[0].split('USER:')[0].split('# 19')[0].split('###')[0].replaceAll('<START>','')
	

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Conversation : ','Coût = ' + cost);
	console.log(res,cost)

	return output
}