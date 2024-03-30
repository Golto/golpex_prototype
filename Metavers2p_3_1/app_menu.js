// ===============================================================================================================================
// ===============================================================================================================================
//													IMPORT
// ===============================================================================================================================


import * as bp from './brainPex.js';

let app, promptInput, directionOutput, buttonsOutput, lds;

// ===============================================================================================================================
// ===============================================================================================================================
//													MULTI TASK
// ===============================================================================================================================

async function multiTask(input){
	lds.classList.remove('display-none');
	const res = await LLM_Redirect(input);

	redirects[res](input);
	directionOutput.innerText = res;

	lds.classList.add('display-none');
}	

let redirects = {
	CHATBOT : ()=>{
		GO_TO_RENDERER('appChatbot');
		//goToSection(2);
	},
	ALCHEMY : ()=>{
		GO_TO_RENDERER('appAlchemy');
		//goToSection(2);
	},
	IDLE : ()=>{
		GO_TO_RENDERER('appIdle');
		//goToSection(2);
	},
	MATH : ()=>{
		GO_TO_RENDERER('appChatbot');
		//goToSection(2);
	},
	// deprecated
	ADVENTURE : ()=>{
		GO_TO_RENDERER('main-page');
		//goToSection(2);
	},
	// deprecated
	GRAPHER : ()=>{
		GO_TO_RENDERER('appChatbot');
		//goToSection(2);
	},
	//
	INFO : ()=>{
		GO_TO_RENDERER('project-page');
		goToSection(4);
	},
	CONTACT : ()=>{
		GO_TO_RENDERER('contact-page');
		goToSection(5);
	},
	TIERLIST : ()=>{
		GO_TO_RENDERER('main-page');
		goToSection(6);
	},
	MATHWORLD : ()=>{
		GO_TO_RENDERER('appMathWorld');
		//goToSection(7);
	},
	SANDBOX : ()=>{
		GO_TO_RENDERER('appSandbox');
		//goToSection(7);
	},
	LINEAR_TD : ()=>{
		GO_TO_RENDERER('appLinearTD');
		//goToSection(7);
	},
	//
	UNKNOWN : (input)=>{
		redirectMisunderstood(input);
		goToSection(1);
	},
	MENU : ()=>{
		GO_TO_RENDERER('main-page');
		goToSection(1);
	},
	PAINT : ()=>{
		GO_TO_RENDERER('appPaint');
	},
}

async function redirectMisunderstood(input) {
	let res = await LLM_RedirectError(input);
	directionOutput.innerText = `Erreur : Destination inconnue\n${res}`
}

// à refaire
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

// à refaire
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
	buttonsOutput.appendChild(element);
}



// ===============================================================================================================================
// ===============================================================================================================================
//													INIT
// ===============================================================================================================================




function init() {
	app = document.getElementById('appMenu');
	promptInput = app.querySelectorAll('input')[0];
	buttonsOutput = app.querySelectorAll('output')[0];
	directionOutput = app.querySelectorAll('output')[1];
	promptInput.onExec = (input, e) => multiTask(input, e);

	const mainPage = document.getElementById('main-page');
	const navInput = mainPage.querySelectorAll('input.nav')[0];
	//console.log(mainPage, navInput)
	navInput.onExec = (input, e) => multiTask(input, e);

	const ldsObj = new Element('lds', {})
		.css({
			position : 'absolute',
			background : 'var(--color-white-semi)',
			borderRadius : '100%',
			bottom : '20%',
			right : '10%',
		})
		.class('lds', 'display-none')
		
	ldsObj.attachTo(directionOutput)
	lds = ldsObj.element;

	//addElement('CHATBOT', 'Chatbot')
	addElement('MATH', 'Mathematics & Chatbot')
	addElement('INFO', 'Informations')
	addElement('CONTACT', 'Contact')

	addElement('MATHWORLD', 'Math World')
	addElement('SANDBOX', 'Sandbox world')
	addElement('LINEAR_TD', 'Linear Tower Defense')
	addElement('ALCHEMY', 'Alchemy game')
	addElement('TIERLIST', 'Tier list')
	addElement('IDLE', 'Idle & Craft')
	addElement('PAINT', 'Icon Art')
}

RENDERERS_INIT.set('appMenu', init);