import * as bp from './brainPex.js';

const handler = new bp.AppHandler(
	'menu',
	'golpexMenu'
)

handler.output = new bp.Output(
	handler.element,
)
handler.output.element.classList.add('padding');
handler.output.printLog(`Exemple : où il est le chatbot ?`);

handler.input = new bp.Input(
	handler.element,
	input => {
		//handler.output.printLog(input);
		multiTask(input);
	},
	'Tapez : Je veux aller ...'
)

handler.buttonbar = new bp.Output(
	handler.element,
)





//----------------------------------------------------

async function multiTask(input){
	const res = await LLM_Redirect(input);

	redirects[res](input);
	handler.output.printLog(res)
	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}	

let redirects = {
	CHATBOT : ()=>{
		GO_TO_RENDERER('golpexChatbot');
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
	ADVENTURE : ()=>{
		GO_TO_RENDERER('main');
		//goToSection(2);
	},
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
	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}


async function LLM_Redirect(input){
	let cost = bp.API_Counter.LLM;

	const prompt = 
`### instructions :
User ask to go on certain sections, determine the destination. Possibles destinations are :
'CHATBOT', 'ALCHEMY', 'IDLE', 'MATH', 'GRAPHER', 'ADVENTURE', 'MENU', 'INFO', 'CONTACT', 'TIERLIST', 'SANDBOX', 'UNKNOWN'
Info : Golpex is the name of this project, if user ask what it is, redirect the user to INFO.
Given a user input, return the response in the format (respecting quotation marks) : {"destination" : STRING} <END>
Example : {"destination" : "CHATBOT"} <END>;
Don't give anything other than this format, adding "<END>" after the format is mandatory.
### input :
${input}
### response :`;
	let res = await bp.promptIteratorLLM(prompt, 1);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Redirect : ','Coût = ' + cost);
	console.log(res)

	output = JSON.parse(output.split('#')[0].split('<END>')[0].replaceAll('\n', '')).destination;

	return output
}


// pas utilisé pour le moment
async function LLM_Command(input){
	let cost = bp.API_Counter.LLM;

	const prompt = 
`### instructions :
When user enters a reference to a specific command, return the contents in the format { "command" : STRING}<END>
### input :
${input}
### response :`;
	//je veux voir mon inventaire => {"command" : "INVENTAIRE" }###END
	let res = await bp.promptIteratorLLM(prompt, 1);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Command : ','Coût = ' + cost);
	console.log(res)

	output = JSON.parse(output.split('#')[0].split('<END>')[0]).command;

	return output
}

async function LLM_RedirectError(input){
	let cost = bp.API_Counter.LLM;

	const prompt = 
`### instructions :
User ask to go on certain sections, but the sytem was unable to determine the destination. Possibles destinations are :
'CHATBOT', 'ALCHEMY', 'IDLE', 'MATH', 'ADVENTURE', 'GRAPHER', 'INFO', 'CONTACT', 'TIERLIST', 'SANDBOX', 'MENU'
Your mission is to ask for a precision and details about the destination, you can also help user by giving destinations ideas.
Given the user input leading to the error, return the response in the format (respecting quotation marks) : {"assistant" : STRING, "issue" : STRING }<END>
Don't give anything other than this format, adding "<END>" after the format is mandatory.
### input :
${input}
### response :`;
	let res = await bp.promptIteratorLLM(prompt, 3);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_RedirectError : ','Coût = ' + cost);
	console.log(res)
	
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
	element.classList.add('golpex-menu-element');
	handler.buttonbar.element.appendChild(element);
}

addElement('CHATBOT', 'Chatbot')
addElement('SANDBOX', 'Sandbox world')
addElement('LINEAR_TD', 'Linear Tower Defense')
addElement('ALCHEMY', 'Alchemy game')
addElement('TIERLIST', 'Tier list')
addElement('IDLE', 'Idle & Craft')
addElement('MATH', 'Mathematics')
addElement('INFO', 'Informations')
addElement('CONTACT', 'Contact')