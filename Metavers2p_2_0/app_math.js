import * as bp from './brainPex.js';
import * as mp from './mathPex.js';

//GO_TO_RENDERER('golpexMath');
//GO_TO_RENDERER('golpexPaint');

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


// for code
const KEY_WORD_LIST_RED = ['return', 'public', 'private', 'or', 'and', 'if', 'for', 'while', 'in', 'for', '#include', 'template', 'import', 'export'];
const KEY_WORD_LIST_YELLOW = ['self', 'this', 'class'];
const KEY_WORD_LIST_AQUA = ['def', 'function', '=>', 'int', 'str', 'bool', 'void'];
const KEY_WORD_LIST_SALMON = ['==', '===', '<=', '>=', '<', '>', '!=', '!==', '+', '-', '*', '/', '%', ',', ';', '.', ':', '!', '^', '**', '+=', '-=', '*=', '/=', '%=', 'new'];

// update MathML2MathJax

function updateMathML2MathJax() {
	console.log('Pour update MathJax :', 'MathJax.typesetPromise()')
	MathJax.typesetPromise();
}

//----------------------------------------------------

async function multiTask(input){
	lds.classList.remove('inactive');

	if (input.startsWith('DEV')) {
		input = input.slice(4)
		devTask(input);
		lds.classList.add('inactive');
		return 1
	}
	if (input.startsWith('COMMAND')) {
		input = input.slice(8)
		commandTask(input);
		lds.classList.add('inactive');
		return 1
	}
	if (input === 'CLEAR') {
		CONVERSATION = [];
		CONVERSATION_ELEMENTS.map( e => e.remove() );
		CONVERSATION_ELEMENTS = [];
		//handler.output.printLog(conversationToString());

		lds.classList.add('inactive');
		return 1
	}
	if (input === 'RETRY') {
		CONVERSATION.pop();
		CONVERSATION.pop();
		const elements = CONVERSATION_ELEMENTS.slice(-2);
		elements.map( e => e.remove() );
		CONVERSATION_ELEMENTS.pop();
		CONVERSATION_ELEMENTS.pop();
		//handler.output.printLog(conversationToString());

		lds.classList.add('inactive');
		return 1
	}

	if (input === 'LOG') {
		console.log(CONVERSATION);
		console.log(conversationToString(true));
		

		/*
		const row = createElement.row(createElement.number(35), createElement.operator('+'), createElement.variable('x'))
		handler.output.element.appendChild(
			createMathElement( createElement.parenthesis(row) )
		)
		handler.output.element.appendChild(
			createMathElement( createElement.integral( createElement.number(0), createElement.variable('x'), createElement.variable(''), 't' ) )
		)

		handler.output.element.appendChild(
			createMathElement(createElement.array( createElement.variable('x'), createElement.variable('y'), createElement.sup(createElement.variable('z'), createElement.number(5))))
		)*/
		/*
		handler.output.element.appendChild(
			createElement.codearea('code')
		)*/
/*
		handler.output.element.appendChild(
			createElement.mathcha(mathchaRedirect['groupTheoryL3'])
		)
		handler.output.element.appendChild(
			createElement.youtube('WoqPAbNbkB8')
		)
		handler.output.element.appendChild(
			createElement.huggingface('huggingface-projects-qr-code-ai-art-generator')
		)*/

		handler.output.element.appendChild(
			createElement.desmos(desmos_id)
		)

		handler.output.element.appendChild(
			createElement.desmosGraph()
		)

		lds.classList.add('inactive');
		return 1
	}

	if (input.startsWith('NEW')) {
		const _class = input.slice(4).toUpperCase().slice(0,20);
		new mp.StructureBuilder(_class);
		console.log(mp.StructureBuilder.classes.get(_class));

		handler.output.element.appendChild(
			createElement.classObject(_class)
		)
		// pour update les objets d'une classe pour intégrer les nouvelles méthodes, faire : for(let obj of class){obj = obj.clone()}
		
		lds.classList.add('inactive');
		return 1
	}


	if (input === 'UPDATE') {
		//mjObject = MathJax.mathml2chtml("<math></math>"); 

		updateMathML2MathJax()
		
		lds.classList.add('inactive');
		return 1
	}

	if (input.startsWith('GOLPEX DEV')) {
		// créer une nouvelle structure >> struct:structureName
		// ajouter une méthode >> method:structureName(...argsName) + code
		// créer un objet >> new:structureName(...args)
		// créer un format MathML >> mathml:objectName


		lds.classList.add('inactive');
		return 1
	}

	send('User', input);
	handler.output.element.scrollTop = handler.output.element.scrollTopMax

	if (/wikipedia|wiki/i.test(input)) {
		const betterInput = input.replaceAll(/wikipedia|wiki/ig, ''); // remplacer par await LLM_findTopic(input)
		const res = await searchWikipedia( betterInput );
		console.log(res.title, input, input.replaceAll(/wikipedia|wiki/ig, '') )
		const wikiElement = createElement.wikipedia(res.title);
		handler.output.element.appendChild(wikiElement);
	} else {
		const res = await LLM_Conversation(input);
		send('Bot', res);
	}
	handler.output.element.scrollTop = handler.output.element.scrollTopMax 

	lds.classList.add('inactive');
	console.log('API_COUNTER.LLM = ', bp.API_COUNTER.LLM)
}


async function devTask(input){
	lds.classList.remove('inactive');

	send('Dev Input', input);
	handler.output.element.scrollTop = handler.output.element.scrollTopMax 

	const res = await LLM_DevTools(input);
	//handler.output.printLog(res);
	//console.log(res)
	
	send('Dev Output', res);
	handler.output.element.scrollTop = handler.output.element.scrollTopMax 

	lds.classList.add('inactive');
	console.log('API_COUNTER.LLM = ', bp.API_COUNTER.LLM)
}

async function commandTask(input){
	lds.classList.remove('inactive');

	send('Command Input', input);
	handler.output.element.scrollTop = handler.output.element.scrollTopMax 

	const res = await LLM_Command(input);
	//handler.output.printLog(res);
	const json = JSON.parse(res);
	console.log(json)


	send('Command Output', res);
	handler.output.element.scrollTop = handler.output.element.scrollTopMax 

	lds.classList.add('inactive');
	console.log('API_COUNTER.LLM = ', bp.API_COUNTER.LLM)
}


async function LLM_Executor(input){
	let cost = bp.API_COUNTER.LLM;

	//const prompt = bp.format.PROMPT + input + bp.format.ENDTXT + bp.format.ASSIST;
	const prompt = bp.format.INSTRUCT + input + bp.format.RESPONSE;
	let output = await bp.promptIteratorLLM(prompt, 5);

	cost = bp.API_COUNTER.LLM - cost;

	console.log('LLM_Executor : ','Coût = ' + cost);

	return output.split('#')[0]
}


let CONVERSATION = [];
let CONVERSATION_ELEMENTS = [];
const MAX_TOKEN = 1024;
const MEMORY_TOKEN = 512;
const MEMORY_MESSAGE = 20;

function formatMessage(sender, message){
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
	let cost = bp.API_COUNTER.LLM;
	const MAX_ITERATION = 10;

	const prompt = 
`### instructions :
You are GOLPEX BOT, you help USER. 'input' is the conversation, continue it.
Information : Golpex is a project about learning mathematics intuively by playing games. These games have the special property that they have normal gameplays and you don't notice maths at first glance. Golpex relies on modern technology to be future-proof such as AI, VR/AR and blockchains. For other informations, please go to 'Contact me'.
After answering to USER, GOLPEX BOT finish by <END>.
To graph : write "[GRAPH : equation/function]"
To represent code : write "\`\`\`language_used
code
\`\`\`"
### input :
${conversationToString(true)}
### response :
GOLPEX BOT : `;
	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', 'User :', 'USER :', 'GOLPEX BOT : ', 'golpex bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		'<END>'
	);

	//output = outputCleaner(output);

	cost = bp.API_COUNTER.LLM - cost;

	console.log('LLM_Conversation : ','Coût = ' + cost);

	if (cost === MAX_ITERATION) return output + '...'

	return output
}


function CONV2JSON(){
	return `[${CONVERSATION.toString()}]`
}

function JSON2CONV(json){
	CONVERSATION = JSON.parse(json);
	return CONVERSATION
}


// ------------------------------- AUTRES PROJETS -------------------------------


async function LLM_DevTools(input){
	let cost = bp.API_COUNTER.LLM;

	const prompt = 
`### instructions :
Write a function in javascript that correspond to input. Use the format \`\`\`js \`\`\`
Write "<END>" after program.
### input :
${input}
### response : `;
	let output = await bp.promptIteratorLLM(prompt, 10);

	output = output.split('<END>')[0].split('# 19')[0].split('###')[0].replaceAll('<START>','')
	

	cost = bp.API_COUNTER.LLM - cost;

	console.log('LLM_Conversation : ','Coût = ' + cost);

	if (cost === 10) return output + '...'

	return output
}



async function LLM_Command(input){
	let cost = bp.API_COUNTER.LLM;

	const prompt = 
`### instructions :
Identify a command in user input, response in the format :
{"command" : STRING, "args" : LIST OF STRING/FLOAT/BOOL }
Write '<END>' after response.
### input :
${input}
### response :`;
	let output = await bp.promptIteratorLLM(prompt, 2);

	output = output.split('<END>')[0].split('USER :')[0].split('USER:')[0].split('# 19')[0].split('###')[0].replaceAll('<START>','')
	

	cost = bp.API_COUNTER.LLM - cost;

	console.log('LLM_Conversation : ','Coût = ' + cost);

	return output
}
// ------------------------------- ----------- -------------------------------


function send(sender, input) {

	// send message
	CONVERSATION.push(formatMessage(sender, input));

	// create message
	const messageElement = document.createElement('div');
	messageElement.classList.add('message');

	const senderElement = document.createElement('h2');
	senderElement.classList.add('title');
	senderElement.innerText = sender;
	messageElement.appendChild(senderElement);
		// txt -> <p></p> , code -> <pre> [span color] </pre> , latex -> <MathML>...</.>
		// in txt : mathObject -> <golpex-math> ... </.>

	// detect and create code
	while (isCodeDetected(input)) {
		const res = extractCode(input);
		input = res.afterCode;
		const text = createTextElement(res.beforeCode);
		const code = createCodeElement(res.language, res.code);
		messageElement.appendChild(text);
		messageElement.appendChild(code);
	}

	// detect and graph
	while (isGraphdetected(input)) {
		const res = extractGraph(input);
		input = res.afterGraph;
		const text = createTextElement(res.beforeGraph);
		//const graph = createElement.spancolor(res.graph, '#ff0000');
		const graph = createElement.desmosGraph(res.graph);
		messageElement.appendChild(text);
		messageElement.appendChild(graph);
	}

	const text = createTextElement(input);
	messageElement.appendChild(text);

	// show message
	handler.output.element.appendChild(messageElement)

	CONVERSATION_ELEMENTS.push(messageElement)

}

send("System",`Modèle recommandé : ${bp.MODELS.GUANACO_33B}\nModèle utilisé : ${bp.CURRENT_MODELS.LLM}`);
send("Golpex : Mathematics & Chatbot", "Bonjour, ce chatbot est à votre disposition pour échanger sur des concepts mathématiques. Vous pouvez bien sûr posez des questions sur n'importe quel sujet, mais sa première fonction est de pouvoir créer, stocker et calculer des structures mathématiques.")


// ----

function isCodeDetected(input) {
	let regex = /```([^`]+)```/g;
	return regex.test(input)
}

function extractCode(input) {
	const inputArray = input.split('```')
	const content = inputArray[1].split('\n');
	const language = content[0];
	const code = content.slice(1).join('\n');
	return {language : language, code : code, beforeCode : inputArray[0], afterCode : inputArray.slice(2).join('\n')}
}

// ----

function isGraphdetected(input) {
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

//

function createTextElement(text) {
	const element = document.createElement('p');
	element.innerText = text;
	return element
}

function createMathObjectElement() {	// refaire
	/*
	<span class="div-start row">

		<span class="div-start column">
			<button class="btn">+</button>	<i class="fa-solid fa-plus"></i>
			<button class="btn">m</button>	<i class="fa-solid fa-pen"></i>
		</span>

		<span class="div-centered row">
			<button class="btn1">${stringObject}</button>
		</span>

	</span>
	*/
	const element = document.createElement('span');
	element.classList.add('div-start');
	element.classList.add('row');

	// colonnes

	const columnButtons = document.createElement('span');
	columnButtons.classList.add('div-start');
	columnButtons.classList.add('column');

	const columnObject = document.createElement('span');
	columnObject.classList.add('div-start');
	columnObject.classList.add('row');

	//

	const buttonAdd = document.createElement('button');
	buttonAdd.classList.add('btn');
	buttonAdd.appendChild( createElement.fa('plus') );
	const buttonModify = document.createElement('button');
	buttonModify.classList.add('btn');
	buttonModify.appendChild( createElement.fa('pen') );
	const buttonDelete = document.createElement('button');
	buttonDelete.classList.add('btn');
	buttonDelete.appendChild( createElement.fa('xmark') );

	columnButtons.appendChild(buttonAdd);
	columnButtons.appendChild(buttonModify);
	columnButtons.appendChild(buttonDelete);

	//

	const object = document.createElement('span');
	object.classList.add('object');
	// remplacer innerText par des objets MathML
	object.innerText = 'En cours...';

	columnObject.appendChild(object);

	//

	element.appendChild(columnButtons);
	element.appendChild(columnObject);

	/*
	.btn {
		width: 20px;
		height: 20px;
		border: none;
	}
	*/

	return element
}


function copyToClipboard(text) {
	navigator.clipboard.writeText(text);
}


function createCodeElement(language, code) {
	const element = document.createElement('div');
	element.classList.add('container');

	const topbar = document.createElement('div');
	topbar.classList.add('topbar');
	element.appendChild(topbar);

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

	const array = multiSplit(code, [' ', ',', '\\(', '\\)', '\\[', '\\]', '\\.', ';', ':', '\\{', '\\}', '\n', '\t']);
	//console.log(array);
	for(let token of array){

		colorCodeElement(codeElement, token)
		
	}
	// ---

	return element
}

function colorCodeElement(element, token) {
	if ( KEY_WORD_LIST_RED.includes( token.replaceAll(' ', '') ) ) {
		element.appendChild( createElement.spancolor(token, 'orangered') );
		return element
	} 
	if ( KEY_WORD_LIST_YELLOW.includes( token ) ) {
		element.appendChild( createElement.spancolor(token, '#ffff66') );
		return element
	}
	if ( KEY_WORD_LIST_AQUA.includes( token ) ) {
		element.appendChild( createElement.spancolor(token, 'Aqua') );
		return element
	}
	if ( KEY_WORD_LIST_SALMON.includes( token ) ) {
		element.appendChild( createElement.spancolor(token, 'salmon') );
		return element
	}
	element.appendChild( createElement.spancolor(token, 'lightblue') )
	return element
}
// ---

function createMathElement(inner) {
	const element = document.createElement('math');
	element.setAttribute('xmlns', "http://www.w3.org/1998/Math/MathML");
	element.appendChild(inner);
	return element
}

function addElementClass(name, func) {
	const element = document.createElement('button');
	element.innerText = `${name}`;
	element.addEventListener('click', func);
	element.setAttribute('name', name);
	element.classList.add('golpex-math-element');
	return element
}

/*

<math xmlns="http://www.w3.org/1998/Math/MathML">...</math>

<mi>a</mi> <mi>cos</mi>
<mn>4</mn>
<mo>=</mo> <mo>+</mo> 
<msup> <mi>x</mi><mn>2</mn> </msup> (x^2)
<msub> <mi>x</mi><mn>2</mn> </msub> (x_2)

<mrow></mrow> (regrouper en 1 ligne)
<mfrac></mfrac> => <mfrac> <mrow>EXPR_A</mrow> <mrow>EXPR_B</mrow> </mfrac>
<mover></mover> => <mover> <mrow>EXPR_A</mrow> <mrow>EXPR_B</mrow> </mover>


<msqrt></msqrt>

<mo stretchy="false">(</mo>
	INNER EXPRESSION
<mo stretchy="false">)</mo>

<mtext></mtext>

<mo>&#xD7;</mo> (cross x)
<mo>&#x2260;</mo> (=/=)
<mo>&#x2212;</mo> (long -)
<mo>&#x00B1;</mo> (+-)
<mo>&#x22C5;</mo> (.)
<mo stretchy="false">&#x2192;</mo> (flèche de vecteur)
<mi>&#x3C0;</mi> (pi)
<mi>&#x3B8;</mi> (theta)
<mi>&#x3D5;</mi> (phi)
<mi>&#x2202;</mi> (partial derivative)
<mi>&#x2207;</mi> (inv delta)
<mi>A</mi> 						(italic par défaut)
<mi mathvariant="normal">A</mi>	(non-italic)
<mi mathvariant="bold">A</mi> 	(gras)
<mo data-mjx-texclass="OP">&#x222B;</mo> (intégrale)
<mo data-mjx-texclass="OP">&#x222E;</mo> (intégrale de contour)
*/

function smartSplit(text, separator) {
	const result = text.split(new RegExp(`(${separator})`, 'g'));
	return result
}

function multiSplit(text, separators) {
	const result = text.split(new RegExp(`(${separators.join('|')})`, 'g'));
	return result
}

let createElement = {

	codearea : (text) => {
		const element = document.createElement('textarea');
		element.classList.add('code');
		element.setAttribute('spellcheck', 'false');
		return element
	},

	matharea : (text) => {
		const element = document.createElement('textarea');
		element.classList.add('math');
		element.setAttribute('spellcheck', 'false');
		return element
	},

	classObject : (className) => {
		const element = document.createElement('div');
		element.classList.add('class-container');

		// .topbar
		const topBar = document.createElement('div');
		topBar.classList.add('topbar');

		element.appendChild(topBar);

		// .topbar < .btn + title + .btn
		const topbarBtn_null = document.createElement('button');
		topbarBtn_null.classList.add('btn');
		topbarBtn_null.style.opacity = '0%';

		const topbarTitle = document.createElement('h2');
		topbarTitle.classList.add('div-centered')
		topbarTitle.innerText = className;

		const topbarBtn_delete = document.createElement('button');
		topbarBtn_delete.classList.add('btn');
		topbarBtn_delete.appendChild(createElement.fa('xmark'));
		topbarBtn_delete.onclick = ()=>{console.log('delete')};

		topBar.appendChild(topbarBtn_null);
		topBar.appendChild(topbarTitle);
		topBar.appendChild(topbarBtn_delete);

		//.object-appearance

		const objectApperance = document.createElement('div');
		objectApperance.classList.add('object-appearance');
		objectApperance.appendChild(createElement.spancolor('Object Appearance', '#111'));

		objectApperance.appendChild(
			createElement.math(
				createElement.array(
					createElement.variable('x'),
					createElement.variable('y'),
					createElement.variable('z')
				)
			)
		)
		objectApperance.appendChild(createElement.matharea());

		element.appendChild(objectApperance);

		//.object-appearance

		const bottomBar = document.createElement('div');
		bottomBar.classList.add('bottombar');

		element.appendChild(bottomBar);
		//

		// .bottombar < .btn + .btn
		const bottombarBtn_method = document.createElement('button');
		bottombarBtn_method.classList.add('btn');
		bottombarBtn_method.appendChild(createElement.fa('plus'));
		bottombarBtn_method.appendChild(createElement.spancolor('new method','#111'));
		bottombarBtn_method.onclick = ()=>{console.log('new method')};

		const bottombarBtn_object = document.createElement('button');
		bottombarBtn_object.classList.add('btn');
		bottombarBtn_object.appendChild(createElement.fa('plus'));
		bottombarBtn_object.appendChild(createElement.spancolor('new object','#111'));
		bottombarBtn_object.onclick = ()=>{console.log('new object')};

		bottomBar.appendChild(bottombarBtn_method);
		bottomBar.appendChild(bottombarBtn_object);

		return element

	},

	//objects

	spancolor : (text, color) => {
		const element = document.createElement('span');
		element.innerText = text;
		element.style.whiteSpace = 'pre';
		element.style.color = color;
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
		/*
		calculator.setExpression({
		  id: 'pointA',
		  latex: 'A=(1,2)',
		  pointStyle: Desmos.Styles.CROSS,
		  color: '#ff0000'
		});
		calculator.setExpression({
		  type: 'table',
		  columns: [
		    {
		      latex: 'x',
		      values: ['1', '2', '3', '4', '5']
		    },
		    {
		      latex: 'y',
		      values: ['1', '4', '9', '16', '25'],
		      dragMode: Desmos.DragModes.XY
		    },
		    {
		      latex: 'x^2',
		      color: Desmos.Colors.BLUE,
		      columnMode: Desmos.ColumnModes.LINES
		    }
		  ]
		});
		*/
		//calculator.removeExpression({ id: 'parabola' });
		/*
	var calculator = Desmos.GraphingCalculator(elt);

calculator.setExpression({ id: 'a-slider', latex: 'a=1' });
var a = calculator.HelperExpression({ latex: 'a' });

calculator.setExpression({ id: 'list', latex: 'L=[1, 2, 3]' });
var L = calculator.HelperExpression({ latex: 'L' });

Helper expressions have two observable properties: numericValue for expressions that evaluate to a number, and listValue for expressions that evaluate to a list. They are updated whenever the expression changes.
HelperExpression.numericValue

a.observe('numericValue', function() {
  console.log(a.numericValue);
});

L.observe('listValue', function() {
  console.log(L.listValue);
});
		*/
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

	function : (functionName, ...argsElements) => {
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
<math> : Définit le conteneur racine pour les expressions MathML.
<mrow> : Définit une rangée mathématique, qui est une séquence ordonnée d'éléments.
<mfrac> : Représente une fraction mathématique.
<msqrt> : Représente une racine carrée.
<mroot> : Représente une racine nn-ième.
<msub> : Définit un exposant inférieur ou un indice.
<msup> : Définit un exposant supérieur ou un exposant.
<msubsup> : Définit un exposant inférieur et un exposant supérieur.
<munder> : Définit un sous-script.
<mover> : Définit un sur-script.
<munderover> : Définit un sous-script et un sur-script.
<mtable> : Définit un tableau mathématique.
<mtr> : Définit une rangée dans un tableau mathématique.
<mtd> : Définit une cellule dans un tableau mathématique.
<mtext> : Insère du texte dans une expression mathématique.
<mo> : Représente un opérateur ou un signe mathématique.
<mi> : Représente une variable ou un identifiant mathématique.
<mn> : Représente un nombre dans une expression mathématique.
<ms> : Représente un texte littéral (par exemple, unité de mesure) dans une expression mathématique.
<merror> : Indique une erreur dans une expression mathématique.
*/


function outputCleaner(output) {
	const cleanList = ['END #', 'User :', 'USER :', '#ars', 'package com', '#this', '#<END', '###', '<END>', '# 19', 'Tags:', '# END', '# 1.']
	for (let token of cleanList) {
		output = output.split(token)[0];
	}
	return output
}

async function LLM_detectMathObject(input){
	let cost = bp.API_COUNTER.LLM;

	const prompt = 
`### instructions :
Given a text, detect each mathematical object and return in the JSON format :
{ "objects" : LIST of {type : STRING, value : STRING}}
Known types : vector, polynom, complex, rational
### input :
text = "Les vecteurs jouent un rôle essentiel dans de nombreux domaines de l'informatique et des mathématiques. Un vecteur peut être représenté sous la forme (1, 2, 3), où chaque valeur correspond à une dimension spécifique."
### response :
{
	"objects": [
	{
		"type": "vector",
		"value": "A (1, 2, 3)"
	}
	]
}
### input :
text = "Si A = (1, 2, 3) et B = (2, 5, -7), donnes la valeur de C=A+B"
### response :
{
	"objects": [
	{
		"type": "vector",
		"value": "A = (1, 2, 3)"
	},
	{
		"type": "vector",
		"value": "B = (2, 5, -7)"
	}
	]
}
### input :
text = "${input}"
### response : `;
	let output = await bp.promptIteratorLLM(prompt, 4);

	cost = bp.API_COUNTER.LLM - cost;

	console.log('LLM_detectMathObject : ','Coût = ' + cost);
	
	output = outputCleaner(output);
	output = output.replaceAll('\n','').replaceAll('\t','');
	return JSON.parse(output)
}

/*
### instructions :
Pour chaque objet mathématique, définir le type comme ceci <math-object>OBJECT</math-object>
### input :
Génères un texte parlant de polynômes
### response :
Les polynômes sont des objets mathématiques importants dans l'algèbre. Un polynôme est une expression mathématique formée par la somme ou la différence de termes appelés monômes. Chaque monôme est composé d'un coefficient multiplicatif et d'une variable élevée à une puissance entière non négative.

Par exemple, le polynôme suivant est un polynôme du deuxième degré :

<math-object>P(x)=3x2−2x+1</math-object>

Dans ce polynôme, les coefficients sont 3, -2 et 1, et les variables sont x élevée aux puissances 2, 1 et 0 respectivement.
### input :
Donnes des exemples de nombres complexes
### response :
*/

/*
### instructions :
Given a text, detect all math text object that needs to be converted to LateX, in the JSON format : { LIST of {type : STRING, value : STRING}}
### input :
Les polynômes sont des objets mathématiques importants dans l'algèbre. Un polynôme est une expression mathématique formée par la somme ou la différence de termes appelés monômes. Chaque monôme est composé d'un coefficient multiplicatif et d'une variable élevée à une puissance entière non négative.

Par exemple, le polynôme suivant est un polynôme du deuxième degré :

P(x)=3x2−2x+1

Dans ce polynôme, les coefficients sont 3, -2 et 1, et les variables sont x élevée aux puissances 2, 1 et 0 respectivement.
### response :
{
[
	{
	"type": "polynom",
	"value": "P(x)=3x2−2x+1"
	}
]
}
### input :
*/


/*
(...) & , & null => (x,y,z)
[...] & , & null => [x,y,z]
... & + & X^i => xX^0+yX^1+zX^2
... & = & (X,i) => x(X,0)=y(X,1)=z(X,2)
*/


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

let mathchaRedirect = {
	groupTheoryL3 : 'BwG4NFBDtnquBe471PFD72Qe1HneXMDH9VMNN6',
	statisticL3 : 'Xr1L5HqLS21T7MwXn0cL2E73He6MxONc0w0mox',
	analyticFunctionL3 : 'q9QJ1uQ2IQnTOj1NBWT90xjrUXoEnB0tpG4xwl',
	differentialEquationL3 : 'mYqWKIOwsvWh8o2eKQtmjK09qSjVwvNNudGoLwk',
	numericalAnalysisL3 : 'r9qVmHyjSEpUZ5GN3NuepG79ZTZDxZEEio3eVwM',
}

const desmos_id = 'mjnwlblznb';

/*https://search.brave.com/*/