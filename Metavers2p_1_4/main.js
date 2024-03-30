
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

//AI generated
function intersection(setA, setB) {
	let result = new Set();
	for (let elem of setB) {
		if (setA.has(elem)) {
			result.add(elem);
		}
	}
	return result;
}
//------------------------------------------


//tier 0 elements
const air = new Element('air')
const earth = new Element('earth')
const water = new Element('water')
const fire = new Element('fire')
/*
//tier 1 elements

const wind = new Element('wind', ['air', 'air'])
const plant = new Element('plant', ['air', 'earth'])
const cloud = new Element('cloud', ['air', 'water'])
const heat = new Element('heat', ['air', 'fire'])

const rock = new Element('rock', ['earth', 'earth'])
//const aaa = new Element('aaa', ['earth', 'water'])
const lava = new Element('lava', ['earth', 'fire'])

const lake = new Element('lake', ['water', 'water'])
const steam = new Element('steam', ['water', 'fire'])

//const aaa = new Element('aaa', ['fire', 'fire'])


const sky = new Element('sky', ['air', 'air', 'air'])
const gravity = new Element('gravity', ['earth', 'earth', 'earth'])
const ocean = new Element('ocean', ['water', 'water', 'water'])
//const aaa = new Element('aaa', ['fire', 'fire', 'fire'])

const swamp = new Element('swamp', ['earth', 'water', 'plant']);

//tier 2 elements

//test
const space = new Element('space', ['sky', 'sky'])
*/

//------------------------------------------

//elements dispos

let availableElements = new Set(['air', 'earth', 'water', 'fire'])

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


const preprompt = "We have a list of elements as an input, combine them to create a new element. Examples : fire + water = steam, water + earth = plant, "

function outputExtractorA(prompt, response){
	const output = response.slice(prompt.length)
	return output
}

async function promptA(input){
	const response = await query({"inputs": input})
	const res = response[0].generated_text
	const output = outputExtractorA(input, res)
	return output
}

async function mergeAI(elementsTestedName){
	let input = preprompt;
	const maxIter = elementsTestedName.length - 1;
	for (let i = 0; i < maxIter; i++) {
		input += elementsTestedName[i] + ' + '
	}
	input += elementsTestedName[maxIter] + ' ='

	const newElem = await promptA(input)
	return newElem.replace(' ','')
}

async function mergeElements(elementsTestedName){
	//N'autorise pas de fusionner des éléments que l'utilisateur ne possède pas
	for (let elem of elementsTestedName) {
		if (!availableElements.has(elem)) {
			//console.log('Vous n\'avez pas certains éléments');
			printLogAlchemy('Vous n\'avez pas certains éléments')
			return null
		}
	}
	
	//['air', 'air'] ---> [airObject, airObject]
	//let elementsTested = elementsTestedName.map(e => Element.list.get(e))

	const newElem = await mergeAI(elementsTestedName);

	
	if (availableElements.has(newElem)) {
		//L'élément est déjà possédé
		//console.log('Vous avez déjà crée : ' + newElem);
		printLogAlchemy('Vous avez déjà crée : ' + newElem)
		return newElem
	}

	
	availableElements.add(newElem);
	new Element(newElem, elementsTestedName);
	//console.log('création', availableElements, newElem)
	//console.log('Création de l\'élément : ' + newElem);
	printLogAlchemy('Création de l\'élément : ' + newElem);
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


const inAlchemy = document.getElementById('inputAlchemy')
const outAlchemy = document.getElementById('outputAlchemy')

const outAlchemyList = document.getElementById('outputAlchemyList')

function handleAlchemy(e){
	let input = inAlchemy.value
	outAlchemy.innerText = '';

	if(e.key === 'Enter'){
		a = input.split(',')
		mergeElements(a).then(printLogAlchemyList);
	}
}

function printLogAlchemy(input){
	outAlchemy.innerText = input;
}
function printLogAlchemyList(){
	input = ''
	for (let elem of availableElements) {
		input += elem + '\n';
	}
	outAlchemyList.innerText = input;
}