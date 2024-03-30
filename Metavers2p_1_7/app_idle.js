import * as bp from './brainPex.js';

GO_TO_RENDERER('golpexIdle')

const handler = new bp.AppHandler(
	'idle',
	'golpexIdle'
)

handler.output = new bp.Output(
	handler.element,
)

handler.craftDisplay = new bp.Output(
	handler.element,
)

handler.input = new bp.Input(
	handler.element,
	input => {
		multiTask(input);
	},
)

//----------------------------------------------------

async function multiTask(input){

	
	await searchCraft(input);

}

let selectedCraft;

/*

// Initialisation des variables
let score = 0;
let clickPower = 1;
let autoPower = 0;
let autoInterval;

// Fonction pour incrémenter le score
function incrementScore() {
  score += clickPower;
  updateScore();
}

// Fonction pour mettre à jour l'affichage du score
function updateScore() {
  document.getElementById('score').innerText = score;
}

// Fonction pour acheter une amélioration de clic
function buyClickUpgrade() {
  if (score >= 10) {
    score -= 10;
    clickPower++;
    updateScore();
    document.getElementById('clickUpgrade').innerText = 'Upgrade Click (Cost: ' + (10 + clickPower * 5) + ')';
  }
}

// Fonction pour acheter une amélioration automatique
function buyAutoUpgrade() {
  if (score >= 20) {
    score -= 20;
    autoPower++;
    updateScore();
    document.getElementById('autoUpgrade').innerText = 'Upgrade Auto (Cost: ' + (20 + autoPower * 10) + ')';
    if (autoPower === 1) {
      autoInterval = setInterval(incrementScore, 1000);
    }
  }
}

// Événement de clic sur le bouton pour augmenter le score manuellement
document.getElementById('incrementButton').addEventListener('click', incrementScore);

// Événement de clic sur le bouton pour acheter une amélioration de clic
document.getElementById('clickUpgrade').addEventListener('click', buyClickUpgrade);

// Événement de clic sur le bouton pour acheter une amélioration automatique
document.getElementById('autoUpgrade').addEventListener('click', buyAutoUpgrade);

class Item{
	constructor(){
		this.cost = 0;
	}
}

*/

class Inventory {
	constructor() {
		this.items = new Map();
	}

	set(item, value) {
		this.items.set(item, value);
	}

	get(item) {
		return this.items.get(item);
	}

	add(item, value) {
		let itemValue = this.items.get(item)
		if (itemValue) {
			itemValue += value;
			this.set(item, itemValue);
			return itemValue
		}
		this.set(item, value);
		return value
	}

	remove(item, value) {
		let itemValue = this.items.get(item)
		if (itemValue >= value) {
			itemValue -= value;
			this.set(item, itemValue);
			return itemValue
		}
		return itemValue
	}

	get toDisplay() {
		/*
		let display = '';
		for(let [item, value] of this.items){
			display += `${item} : ${value}\n`;
		}
		return display
		*/
		for(let [item, value] of this.items) {
			//console.log(item,handler.output.element.getElementsByClassName('golpex-idle-element')[item])
			handler.output.element.getElementsByClassName('golpex-idle-element')[item].innerText = `${item} : ${inventory.items.get(item)}`;
		}
		
	}

}

/*
class Craft {
	constructor(item, recipe) {
		this.item = item;		// string
		this.recipe = recipe; // list of {item : string, value : integer}
		Craft.map.set(item, this)
	}

	get toDisplay() {
		let display = `Item : \n${this.item}\n\nCraft : \n`;
		for(let object of this.recipe){
			display += `${object.item} : ${object.value}\n`;
		}
		return display
	}
}

Craft.map = new Map();
*/
const inventory = new Inventory();

inventory.set('wood', 0);
inventory.set('rock', 0);
inventory.set('sand', 0);
inventory.set('dirt', 0);
inventory.set('clay', 0);
inventory.set('snow', 0);
inventory.set('water', 0);

inventory.set('furnace', 0);
inventory.set('coal', 0);
inventory.set('iron', 0);

inventory.set('shovel', 0);
inventory.set('hammer', 0);
inventory.set('axe', 1);
inventory.set('pickaxe', 1);

document.getElementById('idle_axe').innerText = `wood`;
document.getElementById('idle_pickaxe').innerText = `rock`;
/*
new Craft('wood', []);
new Craft('rock', []);
new Craft('sand', []);
new Craft('clay', []);
new Craft('snow', []);
new Craft('furnace', [{item : 'wood', value : 3}, {item : 'rock', value : 20}]);
*/
// -----------------------------------------------------------------------------------------------

document.getElementById('idle_axe').addEventListener('click', ()=>{
	inventory.add('wood', 1);

	//document.getElementById('idle_axe').innerText = `axe --> wood\n${inventory.get('wood')}`;
	//handler.output.printLog(`Inventory :\n${inventory.toDisplay}`)
	inventory.toDisplay
});

// --------------------------------------------------

document.getElementById('idle_pickaxe').addEventListener('click', ()=>{
	inventory.add('rock', 1);

	//document.getElementById('idle_pickaxe').innerText = `pickaxe --> rock\n${inventory.get('rock')}`;
	//handler.output.printLog(`Inventory :\n${inventory.toDisplay}`)
	inventory.toDisplay
});

// --------------------------------------------------

/*
document.getElementById('idle_craft').addEventListener('click', ()=>{
	const requiredItems = [...selectedCraft.recipe];

	let requirments = true;
	for(let object of requiredItems) {
		requirments &= inventory.get(object.item) >= object.value;
	}

	if (requirments) {
		//retirer les items de recipe
		for(let object of requiredItems){
			inventory.remove(object.item, object.value);
		}
		//ajouter l'item
		inventory.add(selectedCraft.item, 1);
	} else {
		console.log('pas assez de ressources', requiredItems, inventory.items);
	}

	document.getElementById('idle_axe').innerText = `axe --> wood\n${inventory.get('wood')}`;
	document.getElementById('idle_pickaxe').innerText = `pickaxe --> rock\n${inventory.get('rock')}`;
	handler.output.printLog(`Inventory :\n${inventory.toDisplay}`)
});
*/

// -----------------------------------------------------------------------------------------------

/*
### instructions :
This is a combining elements game. You need to combine elements in order to form new ones.
Discovered items : ["wood", "rock"]
Given a recipe, return the response in the format (respecting quotation marks) {"recipe" : LIST OF {"item" : STRING, "value" : INTEGER}, "isCorrect" : BOOL} <END>
Write {<END>} after response format.
### input :
3 woods, 2 rocks
### response :
{"recipe": [{"item": "wood", "value": 3}, {"item": "rock", "value": 2}], "isCorrect": true}
*/

async function LLM_RecipeConverter(input){
	let cost = bp.API_Counter.LLM;

	const prompt = `### instructions :
This is a combining elements game. You need to combine elements in order to form new ones.
Discovered items : [${[...inventory.items.keys()].toString()}]
Given a recipe, return the response in the format (respecting quotation marks) {"recipe" : LIST OF {"item" : STRING, "value" : INTEGER}, "isCorrect" : BOOL} <END>
Write <END> after response format.
### input :
${input}
### response :`;
	let res = await bp.promptIteratorLLM(prompt, 3, false);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Executor : ','Coût = ' + cost);
	console.log(res)

	output = output = outputCleaner(output);
	output = JSON.parse(output)
	return output
}

/*
### instructions :
This is a combining elements game. You need to combine elements in order to form new ones.
Discovered items : [wood, rock]
Given an item, return the response in the format (respecting quotation marks) {"item" : STRING, "recipe" : LIST OF {"item" : STRING, "value" : INTEGER}, "isCorrect" : BOOL} <END>
Write <END> after response format.
"Value" is the number of each item requred to build the input element.
Examples :
- wooden door = 15 woods
- small cottage = 10 rocks & 200 woods
- furnace = 20 rocks & 3 woods
- shovel = 2 irons & 3 woods
- iron = 4 rock & furnace
### input :
a wooden house
### response :
*/

async function LLM_ItemRecipe(input){
	let cost = bp.API_Counter.LLM;

	const prompt = `### instructions :
This is a combining elements game. You need to combine elements in order to form new ones.
Discovered items : [${[...inventory.items.keys()].toString()}]
Given an item, return the response in the format (respecting quotation marks) {"item" : STRING, "recipe" : LIST OF {"item" : STRING, "value" : INTEGER}, "isCorrect" : BOOL} <END>
Write <END> after response format.
"Value" is the number of each item requred to build the input element.
Examples :
- wooden door = 15 woods
- small cottage = 10 rocks & 200 woods
- furnace = 20 rocks & 3 woods
- shovel = 2 irons & 3 woods
- iron = 4 rock & furnace
### input :
${input}
### response :`;
	let res = await bp.promptIteratorLLM(prompt, 4, false);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Executor : ','Coût = ' + cost);
	console.log(res)

	output = outputCleaner(output);
	output = JSON.parse(output)
	return output
}

function outputCleaner(output) {
	const cleanList = ['#ars', 'package com', '#this', '#<END', '#include', '###', '<END>', '# 19', 'Tags:', '# END', '# 1.']
	for (let token of cleanList) {
		output = output.split(token)[0];
	}
	return output
}

/*
idées d'améliorations

crafter un furnace/outil = plusieurs utilisations

possibilité de crafter des usines de matériau :
	(par défaut)
	- scierie = craft : 500 wood & x rocks => 1 wood / min
	- mine = craft : ... => 1 rock / min
	(par LLM)
	- ferme wheat/min
	- boulangerie
	- forgerie


*/
// -------------------------------------------------------------------

/*
prompt : 'a house'

	LLM_ItemRecipe

"type" are "material", "tool", "work_station", "building"
"tool_needed" are "none" or STRING
"work_station_needed" are "none" or STRING
res = {
	"item" : STRING,
	"type" : STRING,
	"work_station_needed" : STRING,
	"tool_needed" : STRING,
	"recipe" : LIST OF {
		"item" : STRING,
		"value" : INTEGER
	}
}
// -------------------------------------------------------------------
{
	"item" : "wood",
	"type" : "material",
	"work_station_needed" : "none",
	"tool_needed" : "axe",
	"recipe" : []
}

'{"item" : "wood", "type" : "material", "work_station_needed" : "none", "tool_needed" : "axe", "recipe" : []}' 
// ---------------------------
{
	"item" : "rock",
	"type" : "material",
	"work_station_needed" : "none",
	"tool_needed" : "pickaxe",
	"recipe" : []
}

'{"item" : "rock", "type" : "material", "work_station_needed" : "none", "tool_needed" : "pickaxe", "recipe" : []}' 
// ---------------------------
{
	"item" : "furnace",
	"type" : "work_station",
	"work_station_needed" : "none",
	"tool_needed" : "none",
	"recipe" : [
		{
			"item" : "wood",
			"value" : 3
		},
		{
			"item" : "wood",
			"value" : 20
		},
	]
}

'{"item" : "furnace", "type" : "work_station", "work_station_needed" : "none", "tool_needed" : "none", "recipe" : [{"item" : "wood", "value" : 3}, {"item" : "wood", "value" : 20}]}' 
// ---------------------------
{
	"item" : "coal",
	"type" : "material",
	"work_station_needed" : "furnace",
	"tool_needed" : "none",
	"recipe" : [
		{
			"item" : "wood",
			"value" : 2
		},
	]
}

'{"item" : "coal", "type" : "material", "work_station_needed" : "furnace", "tool_needed" : "none", "recipe" : [{"item" : "wood", "value" : 2}]}'
// ---------------------------
{
	"item" : "iron",
	"type" : "material",
	"work_station_needed" : "furnace",
	"tool_needed" : "none",
	"recipe" : [
		{
			"item" : "coal",
			"value" : 1
		},
		{
			"item" : "rock",
			"value" : 4
		},
	]
}

'{"item" : "iron", "type" : "material", "work_station_needed" : "furnace", "tool_needed" : "none", "recipe" : [{"item" : "coal", "value" : 1}, {"item" : "rock", "value" : 4}]}' 
// ---------------------------
{
	"item" : "shovel",
	"type" : "tool",
	"work_station_needed" : "none",
	"tool_needed" : "none",
	"recipe" : [
		{
			"item" : "iron",
			"value" : 1
		},
		{
			"item" : "wood",
			"value" : 2
		},
	]
}

'{"item" : "shovel", "type" : "tool", "work_station_needed" : "none", "tool_needed" : "none", "recipe" : [{"item" : "iron", "value" : 1}, {"item" : "wood", "value" : 2}]}' 

.replaceAll('\n','').replaceAll('\t','').replaceAll(',', ', ')



- '{"item" : "wood", "type" : "material", "work_station_needed" : "none", "tool_needed" : "axe", "recipe" : []}'
- '{"item" : "rock", "type" : "material", "work_station_needed" : "none", "tool_needed" : "pickaxe", "recipe" : []}'
- '{"item" : "furnace", "type" : "work_station", "work_station_needed" : "none", "tool_needed" : "none", "recipe" : [{"item" : "wood", "value" : 3}, {"item" : "wood", "value" : 20}]}' 
- '{"item" : "coal", "type" : "material", "work_station_needed" : "furnace", "tool_needed" : "none", "recipe" : [{"item" : "wood", "value" : 2}]}'
- '{"item" : "iron", "type" : "material", "work_station_needed" : "furnace", "tool_needed" : "none", "recipe" : [{"item" : "coal", "value" : 1}, {"item" : "rock", "value" : 4}]}' 
- '{"item" : "shovel", "type" : "tool", "work_station_needed" : "none", "tool_needed" : "none", "recipe" : [{"item" : "iron", "value" : 1}, {"item" : "wood", "value" : 2}]}' 
- '{"item" : "wooden door", "type" : "building", "work_station_needed" : "none", "tool_needed" : "none", "recipe" : [{"item" : "wood", "value" : 20}]}'
- '{"item" : "small cottage", "type" : "building", "work_station_needed" : "none", "tool_needed" : "none", "recipe" : [{"item" : "rock", "value" : 10}, {"item" : "wood", "value" : 200}]}'
*/
class Craft {
	constructor(item, type, workStation, tool, recipe){
		this.item = item;
		this.type = type;
		this.workStationNeeded = workStation;
		this.toolNeeded = tool;
		this.recipe = recipe;
		Craft.map.set(item, this);
		addElement(this.item);
	}

	get toDisplay() {
		let display = `Item : ${this.item}
Work station needed: ${this.workStationNeeded}
Tool needed: ${this.toolNeeded}
Craft : 
`;
		for(let object of this.recipe){
			display += `${object.item} : ${object.value}\n`;
		}
		return display
	}
}
Craft.map = new Map();

new Craft('wood', 'material', null, 'axe', [])
new Craft('rock', 'material', null, 'pickaxe', [])
new Craft('sand', 'material', null, 'shovel', [])
new Craft('dirt', 'material', null, 'shovel', [])
new Craft('clay', 'material', null, 'shovel', [])
new Craft('snow', 'material', null, 'shovel', [])
new Craft('water', 'material', null, 'bucket', [])

new Craft('furnace', 'work_station', null, null, [{item : 'wood', value : 3}, {item : 'rock', value : 20}]);
new Craft('coal', 'material', 'furnace', null, [{item : 'wood', value : 2}]);
new Craft('iron', 'material', 'furnace', null, [{item : 'coal', value : 1}, {item : 'rock', value : 4}]);

new Craft('shovel', 'tool', null, null, [{item : 'iron', value : 1}, {item : 'wood', value : 2}]);
new Craft('hammer', 'tool', null, null, [{item : 'iron', value : 2}, {item : 'wood', value : 2}]);
new Craft('axe', 'tool', null, null, [{item : 'iron', value : 3}, {item : 'wood', value : 2}]);
new Craft('pickaxe', 'tool', null, null, [{item : 'iron', value : 4}, {item : 'wood', value : 2}]);



async function LLM_ItemRecipe2(input, context){
	let cost = bp.API_Counter.LLM;

	const prompt = `### instructions :
This is a combining elements game. You need to combine elements in order to form new ones.
Discovered materials : [wood, rock, wood, iron, coal, sand, clay, snow, water, glass, wheat]
Discovered tools : [shovel, hammer, axe, pickaxe, bucket]
Discovered work stations : [furnace, anvil]
Given an item, return the response in the format (respecting quotation marks)
{
	"item" : STRING,
	"type" : STRING,
	"work_station_needed" : STRING,
	"tool_needed" : STRING,
	"recipe" : LIST OF {
		"item" : STRING,
		"value" : INTEGER
	},
	"isCorrect" : BOOL
}
"value" is the number of each item requred to build the input element.
"type" are "material", "work_station", "building"
"work_station_needed" are null or STRING
"tool_needed" are null or STRING

${context}

Write <END> after format is complete.
### input :
${input}
### response :`;
	let res = await bp.promptIteratorLLM(prompt, 8, false);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_ItemRecipe2 : ','Coût = ' + cost);
	console.log(res)

	output = outputCleaner(output);
	output = output.replaceAll('\n','').replaceAll('\t','');
	output = JSON.parse(output);
	return output
}

/*
Example :
- for primary materials such as wood, sand, rock, dirt, etc..., a tool is needed.
{"item" : PRIMARY_ELEMENT, "type" : "material", "work_station_needed" : null, "tool_needed" : TOOL, "recipe" : [], "isCorrect" : BOOL}
- for derived materials such as coal, iron, glass, etc..., a tool or a work station could be needed and the recipe must be simple.
{"item" : DERIVED_ELEMENT, "type" : "material", "work_station_needed" : WORK_STATION, "tool_needed" : TOOL, "recipe" : MATERIALS, "isCorrect" : BOOL}
- for tools, a couple of Materials are needed
{"item" : TOOL, "type" : "tool", "work_station_needed" : null, "tool_needed" : null, "recipe" : MATERIALS, "isCorrect" : BOOL}
- for work stations, a couple of Materials are needed
{"item" : WORK_STATION, "type" : "work_station", "work_station_needed" : null, "tool_needed" : null, "recipe" : MATERIALS, "isCorrect" : BOOL}
- for buildings, "recipe" needs to have construction materials in vast amount (example : ~100 woods/rocks), and  a related material for the building (bakery = bread, sawmill = wood, smeltery = iron, etc...). Also, a hammer is needed.
{"item" : BUILDING, "type" : "building", "work_station_needed" : null, "tool_needed" : "hammer", "recipe" : MATERIALS, "isCorrect" : BOOL}

*/

/*
Here are a couple of examples for the logic of crafting :
2 iron + 2 wood => hammer (tool)
furnace (work station) + 2 wood => coal
furnace (work station) + 1 coal + 4 rock => iron
furnace (work station) + 1 coal + 2 sand => glass
hammer (tool) + 20 rock + 100 wood => house
hammer (tool) + 20 rock + 80 wood + 5 bread => bakery
40 iron => anvil (work station)
anvil (work station) + 2 iron + 1 wood => sword (tool)
*/


async function LLM_ItemContext(input){
	let cost = bp.API_Counter.LLM;

	const prompt = `### instructions :
This is a combining elements game. You need to combine elements in order to form new ones.
Examples of materials : [wood, rock, wood, iron, coal, sand, clay, snow, water, glass, wheat]
Examples of tools : [shovel, hammer, axe, pickaxe, bucket]
Examples of work stations : [furnace, anvil, kitchen, alambic]

References :
"""
To get buildings, we will need a hammer and hundreds of woods and rocks, depending if it's a wooden building or not. For a specific building such as a bakery, add few breads as materials.

To get elementary materials such as rock, wood, dirt or sand, you will need a dedicated tool and no specific materials.

To get more elaborated material such as glass or bricks, you'll need basic material and possibly a work station. For example, glass can be obtained with a furnace, with these materials : 1 coal and sand.

To get  a tool such as a pickaxe or a bucket, you get them with 1 or 2 materials and no tool or work station is not needed. Iron is most likely to be one of the required materials.
"""

Given an item, explain how to get the input while answering the following questions :
Overall, how can we get the item ? Is a tool needed ? If so, which tool ? Is a work station needed ? If so, which work station ? What type of materials do we need ? How many of them ?
Write "<END>" after finishing answering questions.
### input :
${input}
### response :  `;
	let res = await bp.promptIteratorLLM(prompt, 3, true);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_ItemContext : ','Coût = ' + cost);
	console.log(res)

	output = outputCleaner(output);
	output = output.replaceAll('\n','').replaceAll('\t','');
	return output
}



async function searchCraft(input) {
	// Si le craft existe avec input
	let craft = Craft.map.get(input)
	if (craft) {
		handler.craftDisplay.printLog(craft.toDisplay);
		selectedCraft = craft;
		console.log('craft existe avec input', craft)
		return 1
	}
	// si le craft existe avec res
	const context = await LLM_ItemContext(input);
	const res = await LLM_ItemRecipe2(input, context);
	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
	console.log(res)

	if (res.isCorrect) {
		
		craft = Craft.map.get(res.item);
		if (craft) {
			handler.craftDisplay.printLog(craft.toDisplay);
			selectedCraft = craft;
			console.log('craft existe avec res', craft)
			return 1
		}
		// le craft n'a pas été trouvé, on le crée
		craft = new Craft(res.item, res.type, res.work_station_needed, res.tool_needed, res.recipe);

		handler.craftDisplay.printLog(craft.toDisplay);
		selectedCraft = craft;
		console.log('craft crée', craft)
	}
}

function craft() {

	//console.log(selectedCraft)
	//console.log(Craft.map)
	//console.log(inventory.items)

	// verify requirement

	let requirements = true;

	if (selectedCraft.toolNeeded) {
		const tool = inventory.items.get(selectedCraft.toolNeeded);
		requirements &= !!tool;
		//console.log('tool : ', !!tool)
	}

	if (selectedCraft.workStationNeeded) {
		const workStation = inventory.items.get(selectedCraft.workStationNeeded);
		requirements &= !!workStation;
		//console.log('tool : ', !!workStation)
	}

	for(let object of selectedCraft.recipe) {
		requirements &= inventory.get(object.item) >= object.value;
	}

	// apply craft if requirements

	if (requirements) {
		//retirer les items de recipe
		for(let object of selectedCraft.recipe){
			inventory.remove(object.item, object.value);
		}
		//ajouter l'item
		inventory.add(selectedCraft.item, 1);
	} else {
		console.log('éléments du craft manquant', selectedCraft, inventory.items);
	}

	//handler.output.printLog(`Inventory :\n${inventory.toDisplay}`)
inventory.toDisplay

}

document.getElementById('idle_craft').addEventListener('click', craft );



function applyCraft(craft) {

	// verify requirement

	let requirements = true;

	if (craft.toolNeeded) {
		const tool = inventory.items.get(craft.toolNeeded);
		requirements &= !!tool;
		//console.log('tool : ', !!tool)
	}

	if (craft.workStationNeeded) {
		const workStation = inventory.items.get(craft.workStationNeeded);
		requirements &= !!workStation;
		//console.log('tool : ', !!workStation)
	}

	for(let object of craft.recipe) {
		requirements &= inventory.get(object.item) >= object.value;
	}

	// apply craft if requirements

	if (requirements) {
		//retirer les items de recipe
		for(let object of craft.recipe){
			inventory.remove(object.item, object.value);
			// update éléments retirés
			handler.output.element.getElementsByClassName('golpex-idle-element')[object.item].innerText = `${object.item} : ${inventory.items.get(object.item)}`
		}
		//ajouter l'item
		inventory.add(craft.item, 1);
	} else {
		console.log('éléments du craft manquant', craft, inventory.items);
	}

}


function addElement(item) {
	const element = document.createElement('button');
	element.innerText = `${item} : ${inventory.items.get(item)}`;
	element.addEventListener('click', function(){

		const craft = Craft.map.get(item);
		applyCraft(craft);
		this.innerText = `${item} : ${inventory.items.get(item)}`

		console.log(item, craft, this)
	});
	element.setAttribute('name', item);
	element.classList.add('golpex-idle-element');
	handler.output.element.appendChild(element);
}

