import * as bp from './brainPex.js';


const handler = new bp.AppHandler(
	'alchemy',
	'golpexAlchemy'
)

handler.output = new bp.Output(
	handler.element,
)

handler.outputList = new bp.Output(
	handler.element,
)

handler.input = new bp.Input(
	handler.element,
	input => {
		//handler.output.printLog(input);
		multiTask(input);
	},
	'format obligatoire :air,air'
)

//----------------------------------------------------

async function multiTask(input){
	const res = await mergeElements(input);
	AlchemyList()

	//const res = await LLM_Executor(input);
	//handler.output.printLog(res)
	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}

function AlchemyList(){
	input = ''
	for (let elem of availableElements) {
		input += elem + '\n';
	}
	handler.outputList.printLog(input);
}

//----------------------------------------------------

async function LLM_Executor(input){
	let cost = bp.API_Counter.LLM;

	//const prompt = bp.format.PROMPT + input + bp.format.ENDTXT + bp.format.ASSIST;
	const prompt = bp.format.INSTRUCT + input + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 5);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Executor : ','Coût = ' + cost);
	console.log(res)

	return output
}

// ===================================================================
//											Alchemy

class Element{

	constructor(name = '', parents = []){
		this.name = name
		this.parents = parents;

		for (let parentName of this.parents) {
			const parent = Element.list.get(parentName)
			if (!parent.children.has(this.name)) {
				parent.children.add(this.name)
			}
		}

		this.children = new Set();
		//this.isUnlocked = false;
		Element.list.set(this.name, this)
	}

	get rank(){
		//Pas idéal, car peut avoir des ancêtres de rank différents
		//On fera en sorte que le premier parent soit celui avec le plus haut rank
		if (this.parents.length > 0) {
			const firstParent = Element.list.get(this.parents[0])
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

Element.list = new Map()
//------------------------------------------
/*
//AI generated
function intersection(setA, setB) {
	let result = new Set();
	for (let elem of setB) {
		if (setA.has(elem)) {
			result.add(elem);
		}
	}
	return result;
}*/
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
		const elemObj = Element.list.get(elem)
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
const air = new Element('air')
const earth = new Element('earth')
const water = new Element('water')
const fire = new Element('fire')

let availableElements = new Set(['air', 'earth', 'water', 'fire'])
/*
//tier 0 elements
const set = new Element('set')
const union = new Element('union')
const intersection = new Element('intersection')
const pair = new Element('pair')
const empty = new Element('empty')
const induction = new Element('induction')

let availableElements = new Set(['set', 'union', 'intersection', 'pair', 'empty', 'induction'])
*/
//------------------------------------------

async function LLM_ElementsMerge(input){
	let cost = bp.API_Counter.LLM;

	//const prompt = bp.format.INSTRUCT + 'This is an alchemy game. You need to combine elements in order to form new ones.\nGiven a list of elements, return the response in the format (respecting quotation marks) {"resultedElement" : STRING, "isCorrect" : BOOL}###END\nExamples : {"resultedElement" : "plant", "recipe" : ["water", "earth"]}###END\n{"resultedElement" : "rock", "recipe" : ["earth", "earth"]}###END\n{"resultedElement" : "lava", "recipe" : ["fire", "earth"]}###END\n{"resultedElement" : "steam", "recipe" : ["water", "air"]}###END' + bp.format.INPUT + 'recipe : ' + input + bp.format.RESPONSE;
	const prompt =
`### instructions :
This is an alchemy game. You need to combine elements in order to form new ones.
Given a list of elements, return the response in the format (respecting quotation marks) {"resultedElement" : STRING, "isCorrect" : BOOL}<END>
Examples : {"resultedElement" : "plant", "recipe" : ["water", "earth"]}<END>
{"resultedElement" : "rock", "recipe" : ["earth", "earth"]}<END>
{"resultedElement" : "lava", "recipe" : ["fire", "earth"]}<END>
{"resultedElement" : "steam", "recipe" : ["water", "air"]}<END>
{"resultedElement" : "wind", "recipe" : ["air", "air"]}<END>
### input :
recipe : ${input}
### response :`
	let res = await bp.promptIteratorLLM(prompt, 1);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Executor : ','Coût = ' + cost);
	console.log(res)

	return output.split('#')[0].split('<END>')[0]
}
/*
async function LLM_ElementsMergeMaths(input){
	let cost = bp.API_Counter.LLM;

	const prompt = bp.format.INSTRUCT + 'This is an alchemy game. You need to combine elements in order to form new ones.\nGiven a list of elements in ZF theory of sets in mathematics, return the element created in the format (respecting quotation marks) {"resultedElement" : STRING, "isCorrect" : BOOL}###END\nExamples : {"resultedElement" : "one", "recipe" : ["empty", "pair"]}###END\n{"resultedElement" : "two", "recipe" : ["empty", "union", "one"]}###END\n{"resultedElement" : "three", "recipe" : ["one", "add", "two"]}###END\n{"resultedElement" : "whole numbers", "recipe" : ["induction", "numbers"]}###END' + bp.format.INPUT + 'recipe : ' + input + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 1);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Executor : ','Coût = ' + cost);
	console.log(res)

	return output.split('#')[0].split('<END>')[0]
}
*/
//------------------------------------------

async function mergeElements(input){
	const elementsTestedName = input.split(',');
	//N'autorise pas de fusionner des éléments que l'utilisateur ne possède pas
	for (let elem of elementsTestedName) {
		if (!availableElements.has(elem)) {
			handler.output.printLog('Vous n\'avez pas certains éléments');
			return null
		}
	}
	
	//['air', 'air'] ---> [airObject, airObject]
	//let elementsTested = elementsTestedName.map(e => Element.list.get(e))

	const json = await LLM_ElementsMerge(elementsTestedName);
	const parsedJson = JSON.parse(json);
	const newElem = parsedJson.resultedElement;
	if (!parsedJson.isCorrect) {
		handler.output.printLog('Ces éléments n\'ont pas abouti');
		return newElem
	}

	
	if (availableElements.has(newElem)) {
		//L'élément est déjà possédé
		//console.log('Vous avez déjà crée : ' + newElem);
		handler.output.printLog('Vous avez déjà crée : ' + newElem);
		return newElem
	}

	
	availableElements.add(newElem);
	new Element(newElem, elementsTestedName);
	//console.log('création', availableElements, newElem)
	//console.log('Création de l\'élément : ' + newElem);
	handler.output.printLog('Création de l\'élément : ' + newElem);
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

		new Element(name, parents)
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

handler.output.printLog(`Modèle recommandé : ${bp.models.guanaco33b}\nModèle utilisé : ${bp.currentModels.LLM}`)
AlchemyList()

