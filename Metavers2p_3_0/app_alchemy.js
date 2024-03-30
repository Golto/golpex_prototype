// ===============================================================================================================================
// ===============================================================================================================================
//													IMPORT
// ===============================================================================================================================


import * as bp from './brainPex.js';

let app, promptInput, elementsOutput, lds;


// ===============================================================================================================================
// ===============================================================================================================================
//													MULTI TASK
// ===============================================================================================================================

async function multiTask(input){
	lds.classList.remove('display-none');

	const res = await mergeElements(input);
	AlchemyList()

	console.log('API_COUNTER.LLM = ', bp.API_COUNTER.LLM);
	lds.classList.add('display-none');
}

function AlchemyList(){
	let input = ''
	for (let elem of availableElements) {
		input += elem + '\n';
	}
	//console.log(input); // HANDLER
	elementsOutput.innerText += `\n${input}`;
}

// ===================================================================
//											Alchemy

class AlchemyElement{

	constructor(name = '', parents = []){
		this.name = name
		this.parents = parents;

		for (let parentName of this.parents) {
			const parent = AlchemyElement.list.get(parentName)
			if (!parent.children.has(this.name)) {
				parent.children.add(this.name)
			}
		}

		this.children = new Set();
		//this.isUnlocked = false;
		AlchemyElement.list.set(this.name, this)
	}

	get rank(){
		//Pas idéal, car peut avoir des ancêtres de rank différents
		//On fera en sorte que le premier parent soit celui avec le plus haut rank
		if (this.parents.length > 0) {
			const firstParent = AlchemyElement.list.get(this.parents[0])
			return 1 + firstParent.rank
		}
		return 0
	}

	//AI generated
	isEqualParents(otherParents) {
		// Vérifier si le tableau des parents a la même longueur
		if (this.parents.length !== otherParents.length) {
		return false;
		}

		// Vérifier si chaque élément dans le tableau des parents est présent dans l'autre tableau
		for (var i = 0; i < this.parents.length; i++) {
		var parent = this.parents[i];
		if (!otherParents.includes(parent)) {
			return false;
		}
		}

		// Vérifier si chaque élément dans l'autre tableau est présent dans le tableau des parents
		for (var i = 0; i < otherParents.length; i++) {
		var parent = otherParents[i];
		if (!this.parents.includes(parent)) {
			return false;
		}
		}

		// Les deux tableaux ont les mêmes éléments
		return true;
	}

}

AlchemyElement.list = new Map()

//------------------------------------------

function set2array(set){
	let array = []
	for(let x of set){
		array.push(x)
	}
	return array
}

function elems2string(){
	let obj = {};

	const elementsList = set2array(availableElements)

	for (let indexElem in elementsList) {
		elem = elementsList[indexElem]

		let parents = {};
		const elemObj = AlchemyElement.list.get(elem)
		for (let indexParent in elemObj.parents) {
			//console.log(indexParent, elem, elemObj.parent)
			parents[indexParent] = elemObj.parents[indexParent];
		}
		let children = {};

		const childrenList = set2array(elemObj.children)

		for (let indexChild in childrenList) {
			//console.log(child, elem, elemObj.children)
			children[indexChild] = childrenList[indexChild];
		}


		obj[indexElem] = {
			name : elem,
			parents : parents,
			children : children,
			sizeParents : elemObj.parents.length,
			sizeChildren : childrenList.length,
		};


	}
	return obj
}

//------------------------------------------

//tier 0 elements
const air = new AlchemyElement('air')
const earth = new AlchemyElement('earth')
const water = new AlchemyElement('water')
const fire = new AlchemyElement('fire')

/*
// NON PRIS EN COMPTE QUAND ON CRAFT: à refaire
new AlchemyElement('rock', ['earth', 'earth'])
new AlchemyElement('lava', ['fire', 'earth'])
new AlchemyElement('steam', ['air', 'water'])
new AlchemyElement('wind', ['air', 'air'])
new AlchemyElement('heat', ['air', 'fire'])
*/

let availableElements = new Set(['air', 'earth', 'water', 'fire'])

// MERGE -------------------------------------------

async function LLM_ElementsMerge(input){
	const STOP_TOKEN = "text completed !";
	const MAX_ITERATION = 7;

	const prompt =
`### instructions :
This is an alchemy game. You need to combine elements in order to form new ones.
Given a list of elements, return the response in the format :
{ "resultedElement" : STRING , "recipe" : LIST of STRING, "isCorrect" : BOOL }
Then after finishing the text, write "${STOP_TOKEN}".
### input :
air,air
### response :
{ "resultedElement" : "wind" , "recipe" : [ "air" , "air" ] , "isCorrect" : true }${STOP_TOKEN}
### input :
air,water
### response :
{ "resultedElement" : "cloud" , "recipe" : [ "air" , "water" ] , "isCorrect" : true }${STOP_TOKEN}
### input :
earth,earth
### response :
{ "resultedElement" : "rock" , "recipe" : [ "earth" , "earth" ] , "isCorrect" : true }${STOP_TOKEN}
### input :
rock,earth
### response :
{ "resultedElement" : "mountain" , "recipe" : [ "rock" , "earth" ] , "isCorrect" : true }${STOP_TOKEN}
### input :
plant,plant
### response :
{ "resultedElement" : "tree" , "recipe" : [ "plant" , "plant" ] , "isCorrect" : true }${STOP_TOKEN}
### input :
water,water,water
### response :
{ "resultedElement" : "ocean" , "recipe" : [ "water" , "water", "water" ] , "isCorrect" : true }${STOP_TOKEN}
### input :
water,earth
### response :
{ "resultedElement" : "plant" , "recipe" : [ "water" , "earth" ] , "isCorrect" : true }${STOP_TOKEN}
### input :
${input}
### response : `

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	return output
}

//------------------------------------------

async function mergeElements(input){
	const elementsTestedName = input.trim().split(',');
	//N'autorise pas de fusionner des éléments que l'utilisateur ne possède pas
	for (let elem of elementsTestedName) {
		if (!availableElements.has(elem)) {
			console.log('Vous n\'avez pas certains éléments'); //HANDLER
			elementsOutput.innerText = 'Vous n\'avez pas certains éléments'
			return null
		}
	}
	
	//['air', 'air'] ---> [airObject, airObject]
	//let elementsTested = elementsTestedName.map(e => AlchemyElement.list.get(e))

	const json = await LLM_ElementsMerge(elementsTestedName);
	const parsedJson = JSON.parse(json);
	const newElem = parsedJson.resultedElement;
	if (!parsedJson.isCorrect) {
		console.log('Ces éléments n\'ont pas abouti'); // HANDLER
		elementsOutput.innerText = 'Ces éléments n\'ont pas abouti'
		return newElem
	}

	
	if (availableElements.has(newElem)) {
		//L'élément est déjà possédé
		//console.log('Vous avez déjà crée : ' + newElem);
		console.log('Vous avez déjà crée : ' + newElem); //HANDLER
		elementsOutput.innerText = `Vous avez déjà crée : ${newElem}`
		return newElem
	}

	
	availableElements.add(newElem);
	new AlchemyElement(newElem, elementsTestedName);
	//console.log('création', availableElements, newElem)
	//console.log('Création de l\'élément : ' + newElem);
	console.log('Création de l\'élément : ' + newElem); //HANDLER
	elementsOutput.innerText = `Création de l'élément : ${newElem}`
	return newElem

}


function save() {

	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();
	const currentMonth = currentDate.getMonth() + 1;
	const currentDay = currentDate.getDate();
	const currentHour = currentDate.getHours();
	const currentMinutes = currentDate.getMinutes();
	const currentSeconds = currentDate.getSeconds();

	const data = {
		date : currentDay + '/' + currentMonth + '/' + currentYear + ' ' + currentHour + '/' + currentMinutes + '/' + currentSeconds,
		author : 'Golpex',
		elements : elems2string(),
		sizeElements : availableElements.size,
	};

	const jsonData = JSON.stringify(data);

	let virtualLink = document.createElement("a");
	let jsonFile = new Blob([jsonData], {type: 'application/json'});
	virtualLink.href = URL.createObjectURL(jsonFile);

	virtualLink.download = 'Golpex Alchemy Saved ' + currentDay + '_' + currentMonth + '_' + currentYear + ' ' + currentHour + '_' + currentMinutes + '_' + currentSeconds + '.json';
	virtualLink.click();
}

let ocje = {}

function load(json){
	let obj = JSON.parse(json)
	//console.log(obj)
	if(false) {console.error("Fichier dans un format incorrect !"); return;}
	//console.log(obj.elements)

	availableElements.clear();
	ocje = obj.elements
	
	const elements = obj.elements;
	const maxIter = obj.sizeElements;
	for (let i = 0; i < maxIter; i++) {
		//console.log(elements[i])

		const name = elements[i].name;
		const sizeParents = elements[i].sizeParents;
		const parents = []
		for (let j = 0; j < sizeParents; j++) {
			parents.push(elements[i].parents[j])
		}
		//console.log(name,sizeParents,parents)

		new AlchemyElement(name, parents)
		availableElements.add(name)
	}

	//return obj.elements
}




async function importJson() {
	let json = await document.getElementById("importAlchemy").files[0].text();
	//console.log(json)
	load(json);
	//console.log('end')
}

// ===============================================================================================================================
// ===============================================================================================================================
//													INIT
// ===============================================================================================================================




function init() {
	app = document.getElementById('appAlchemy');
	promptInput = app.querySelectorAll('input')[0];
	elementsOutput = app.querySelectorAll('output')[0];
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
		
	ldsObj.attachTo(elementsOutput)
	lds = ldsObj.element;

	AlchemyList()
}

RENDERERS_INIT.set('appAlchemy', init);