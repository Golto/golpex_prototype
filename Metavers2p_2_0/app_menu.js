import * as bp from './brainPex.js';

const container = document.getElementById('golpexMenu').getElementsByClassName('container')[0];

const handler = new bp.AppHandler(
	'menu',
	container
)

handler.output = handler.addOutput();

handler.output.element.classList.add('log');
handler.output.printLog(`Exemple : où il est le chatbot ?`);

handler.input = handler.addInput(
	input => {
		multiTask(input);
	},
	'Tapez : Je veux aller ...',
	true
)

handler.buttonbar = handler.addOutput();
handler.buttonbar.element.classList.add('bar');




//----------------------------------------------------

async function multiTask(input){
	const res = await LLM_Redirect(input);

	redirects[res](input);
	handler.output.printLog(res)
	console.log('API_COUNTER.LLM = ', bp.API_COUNTER.LLM)
}	

let redirects = {
	CHATBOT : ()=>{
		GO_TO_RENDERER('golpexMath');
		//goToSection(2);
	},
	ALCHEMY : ()=>{
		GO_TO_RENDERER('golpexAlchemy');
		//goToSection(2);
	},
	IDLE : ()=>{
		GO_TO_RENDERER('golpexIdle');
		//goToSection(2);
	},
	MATH : ()=>{
		GO_TO_RENDERER('golpexMath');
		//goToSection(2);
	},
	// deprecated
	ADVENTURE : ()=>{
		GO_TO_RENDERER('main');
		//goToSection(2);
	},
	// deprecated
	GRAPHER : ()=>{
		GO_TO_RENDERER('golpexGrapher');
		//goToSection(2);
	},
	//
	INFO : ()=>{
		GO_TO_RENDERER('main');
		goToSection(4);
	},
	CONTACT : ()=>{
		GO_TO_RENDERER('main');
		goToSection(5);
	},
	TIERLIST : ()=>{
		GO_TO_RENDERER('main');
		goToSection(6);
	},
	SANDBOX : ()=>{
		GO_TO_RENDERER('golpexSandbox');
		//goToSection(7);
	},
	LINEAR_TD : ()=>{
		GO_TO_RENDERER('golpexLinearTD');
		//goToSection(7);
	},
	//
	UNKNOWN : (input)=>{
		redirectMisunderstood(input);
		goToSection(1);
	},
	MENU : ()=>{
		GO_TO_RENDERER('main');
		goToSection(1);
	},
}

function goToSection(number){
	window.scroll({
		top: getHeightOfElementById(`section${number}`),
		behavior: 'smooth'
	})
}

function goOnTop(){
	window.scroll({
		top: 0,
		behavior: 'smooth'
	})
}

async function redirectMisunderstood(input) {
	let res = await LLM_RedirectError(input);
	handler.output.printLog(`Erreur : Destination inconnue\n${res}`)
	console.log('API_COUNTER.LLM = ', bp.API_COUNTER.LLM)
}


async function LLM_Redirect(input){
	let cost = bp.API_COUNTER.LLM;

	const prompt = 
`### instructions :
User ask to go on certain sections, determine the destination. Possibles destinations are :
'CHATBOT' : To ask questions, tasks or talk with a chatbot.
'ALCHEMY' : A game to mix elements.
'IDLE' : An idle game in which you can craft items.
'MATH' : To talk about mathematics/graphing functions.
'INFO' : To get Informations for this project (which is Golpex).
'CONTACT' : To get in touch with the creator of the project. (discord, youtube channel, mail, phone...)
'SANDBOX' : A sandbox world to build and play in a virtual world.
'LINEAR_TD' : A Tower Defense game.
'UNKNOWN' : If 'input' is not clear enought.
'TIERLIST' : To make a tier-list.

Given a user input, return the response in the format (respecting quotation marks) : {"destination" : STRING} <END>
Example : {"destination" : "CHATBOT"} <END>;
Don't give anything other than this format, writing "<END>" after the format is mandatory.
### input :
${input}
### response :`;
	let output = await bp.promptIteratorLLM(prompt, 1, true, ['#', 'Tags'], '<END>');
	console.log(output)

	cost = bp.API_COUNTER.LLM - cost;

	console.log('LLM_Redirect : ','Coût = ' + cost);

	output = JSON.parse(output.replaceAll('\n', '')).destination;

	return output
}


// pas utilisé pour le moment
async function LLM_Command(input){
	let cost = bp.API_COUNTER.LLM;

	const prompt = 
`### instructions :
When user enters a reference to a specific command, return the contents in the format { "command" : STRING}<END>
### input :
${input}
### response : `;
	//je veux voir mon inventaire => {"command" : "INVENTAIRE" }<END>
	let output = await bp.promptIteratorLLM(prompt, 1, true, ['#', 'Tags'], '<END>');

	cost = bp.API_COUNTER.LLM - cost;

	console.log('LLM_Command : ','Coût = ' + cost);

	output = JSON.parse(output).command;

	return output
}

async function LLM_RedirectError(input){
	let cost = bp.API_COUNTER.LLM;

	const prompt = 
`### instructions :
User ask to go on certain sections, but the system was unable to determine the destination. Possibles destinations are :
'CHATBOT' : To ask questions, tasks or talk with a chatbot.
'ALCHEMY' : A game to mix elements.
'IDLE' : An idle game in which you can craft items.
'MATH' : To talk about mathematics/graphing functions.
'INFO' : To get Informations for this project (which is Golpex).
'CONTACT' : To get in touch with the creator of the project. (discord, youtube channel, mail, phone...)
'SANDBOX' : A sandbox world to build and play in a virtual world.
'LINEAR_TD' : A Tower Defense game.
'UNKNOWN' : If 'input' is not clear enought.
'TIERLIST' : To make a tier-list.

Your mission is to ask for a precision and details about the destination, also help user by giving destinations ideas.
Given the user input leading to the error, return the response in the format (respecting quotation marks) : {"assistant" : STRING, "issue" : STRING }<END>
Don't give anything other than this format, writing "<END>" after the format is mandatory.
### input :
${input}
### response :`;
	let output = await bp.promptIteratorLLM(prompt, 3);

	cost = bp.API_COUNTER.LLM - cost;

	console.log('LLM_RedirectError : ','Coût = ' + cost);
	
	return JSON.parse(output.split('#')[0].split('<END>')[0].replaceAll('\n', '')).assistant
}
// --------------------------

function addElement(item, name) {
	const element = document.createElement('button');
	element.innerText = `${name}`;
	element.addEventListener('click', function(){

		redirects[item]();

	});
	element.setAttribute('name', item);
	element.classList.add('element');
	handler.buttonbar.element.appendChild(element);
}

//addElement('CHATBOT', 'Chatbot')
addElement('MATH', 'Mathematics & Chatbot')
addElement('INFO', 'Informations')
addElement('CONTACT', 'Contact')

addElement('SANDBOX', 'Sandbox world')
addElement('LINEAR_TD', 'Linear Tower Defense')
addElement('ALCHEMY', 'Alchemy game')
addElement('TIERLIST', 'Tier list')
addElement('IDLE', 'Idle & Craft')
