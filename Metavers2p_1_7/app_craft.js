import * as bp from './brainPex.js';


const handler = new bp.AppHandler(
	'craft',
	'golpexCraft'
)

handler.output = new bp.Output(
	handler.element,
)

handler.input = new bp.Input(
	handler.element,
	input => {
		if (input === "USER") {
			handler.output.printLog(inventory.toString())
			return 1
		}
		if (input === "ITEM") {
			console.log(Item.list)
			console.log(Item.name2id)
			return 1
		}
		if (input === "RECIPE") {
			console.log(Recipe.list)
			console.log(Recipe.name2id)
			return 1
		}
		//handler.output.printLog(input);
		multiTask(input);
		return 1
	},
	'item to be crafted'
)

//----------------------------------------------------

async function multiTask(input){
	
	Recipe.create(input);

	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}	

function recipeCreator(recipeInput){
	console.log("recipeCreator-input : ",recipeInput)
	const items = recipeInput.replaceAll('  ',' ').replaceAll(', ',',').split(',');
	let string = '[';
	for(let item of items){
		let [value, name] = item.split(' ');
		string += `{"item":"${name}", "number" : ${value}},`;
	}
	string += ']';
	const text = string.replaceAll(',]', ']').replaceAll(' ', '');
	console.log("recipeCreator-output : ",text)
	const json = JSON.parse(text);

	return {json : json, text : text}
}

// ===========================================================================================
//														INVENTORY
class Inventory{
	constructor(){
		this.owner = 'USER';
		this.id = crypto.randomUUID();
		this.items = new Map();
	}

	add(itemName, value){
		const itemId = Item.name2id.get(itemName);

		// validité de l'item
		if (!Item.list.get(itemId)) {
			console.warn(`${itemName} non existant`)
			return 0
		}

		// rajout de l'item
		const quantity = this.items.get(itemId);

		if (quantity) {
			this.items.set(itemName, quantity + value);
			return 1
		}
		this.items.set(itemName, value);
		return 0
	}

	remove(itemName, value){
		const itemId = Item.name2id.get(itemName);

		// validité de l'item
		if (!Item.list.get(itemId)) {
			console.warn(`${itemName} non existant`)
			return 0
		}

		// supression de l'item
		
		const quantity = this.items.get(itemId);

		if (quantity >= value) {
			this.items.set(itemName, quantity - value);
			return 1
		}
		return 0
	}

	toString(){
		let string = '';
		for(let [e,i] of this.items){
			string += `{item : ${e}, number : ${i}},`;
		}
		return string
	}
}

// ===========================================================================================
//														ITEM
class Item{
	constructor(name){
		this.id = crypto.randomUUID();
		this.name = name;
		Item.list.set(this.id, this);
		Item.name2id.set(this.name, this.id);
	}
}
Item.list = new Map();
Item.name2id = new Map();
// ===========================================================================================
//														RECIPE
class Recipe{
	constructor(id, item, recipe, type){
		this.id = id;
		this.item = item;
		this.recipeJSON = recipe;
		this.type = type;
		Recipe.list.set(id, this);
		Recipe.name2id.set(this.item, this.id);
	}
}

Recipe.list = new Map();
Recipe.name2id = new Map();

Recipe.create = async function(input){
	// existence du craft (en fonction de input)
	if (Recipe.exist(input)) {
		return Recipe.list.get(Recipe.name2id.get(input));
	}

	// création du craft
	const res = await LLM_CraftRecipe(input);

	const item = res.item;
	const recipe = recipeCreator(res.recipe);
	const type = res.type;
	const id = await sha256(`${res.item}/${recipe.text}`)

	// existence du craft (en fonction de res)
	if (Recipe.exist(item)) {
		return Recipe.list.get(Recipe.name2id.get(item));
	}
	//
	return new Recipe(id, item, recipe.json, type);
}

Recipe.exist = function (item){
	const id = Recipe.name2id.get(item);
	return !!id
}

// --------------------------------------------------------------------------
//														LLM craft recipe

async function LLM_CraftRecipe(input){
	let cost = bp.API_Counter.LLM;

	const prompt = 
`### instructions :
In a sandbox game, a user want to craft items. User ask for an item and the response indicates the recipe to follow to craft it.
Types of items that can be crafted :
- MATERIALS : items like 'sticks', 'planks', 'rocks', 'powder', ...
- TOOLS : items like 'axe', 'shovel', 'pickaxe', ...
- BLOCKS : items like 'bricks', 'furnace', 'chest', ...
Input examples :
response : {"item" : "stone_pickaxe", "recipe" : "2 stick, 3 stone", "type" : "TOOLS"} <END>
response : {"item" : "planks", "recipe" : "1 wood" ,"type" : "MATERIALS"} <END>
response : {"item" : "furnace", "recipe" : "7 stone, 1 coal", "type" : "BLOCKS"} <END>
Given a user input, return the response in the format (respecting quotation marks) : {"item" : STRING, "recipe" : STRING, "type" : STRING} <END>
### input :
${input}
### response :`;
	let res = await bp.promptIteratorLLM(prompt, 2);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_CraftRecipe : ','Coût = ' + cost);
	console.log(res)

	output = JSON.parse(output.split('#')[0].split('<END>')[0].replaceAll('\n', ''));
	return output
}
// ===========================================================================================
//														MAIN
new Item('dirt')
new Item('wood')//xxx log --> xxx planks
new Item('stone')
new Item('mud')
new Item('gravel')
new Item('clay')
new Item('sand')
new Item('snow')
new Item('ORES')
new Item('FOOD')
new Item('wool')

/*
### instructions :
In a sandbox game, a user want to craft items.
Types of items that can be crafted :
- MATERIALS : items like 'sticks', 'planks', 'rocks', 'powder', 'string', 'rope', ...
- TOOLS : items like 'axe', 'shovel', 'pickaxe', ...
- BLOCKS : items like 'bricks', 'furnace', 'chest', ...
Input examples :
recipe : 2 stick, 3 stone / response : {"crafted" : "1 stone_pickaxe", "type" : "TOOLS"}
recipe : 1 wood / response : {"crafted" : "4 planks", "type" : "MATERIALS"}
recipe : 7 stone, 1 coal / response : {"crafted" : "1 furnace", "type" : "BLOCKS"}
Given a user input, return the response in the format (respecting quotation marks) : {"crafted" : STRING, "type" : STRING} ###END
### input :
recipe : 2 stick, 2 iron_ingot
### response :
{"crafted": "2 iron_sword", "type": "TOOLS"}

RECIPE -> ITEM (to be crafted)
*/

/*

### instructions :
In a sandbox game, a user want to craft items. User ask for an item and the response indicates the recipe to follow to craft it.
Types of items that can be crafted :
- MATERIALS : items like 'sticks', 'planks', 'rocks', 'powder', ...
- TOOLS : items like 'axe', 'shovel', 'pickaxe', ...
- BLOCKS : items like 'bricks', 'furnace', 'chest', ...
Input examples :
response : {"item" : "stone_pickaxe", "recipe" : "2 stick, 3 stone", "type" : "TOOLS"} ###END
response : {"item" : "planks", "recipe" : "1 wood" ,"type" : "MATERIALS"} ###END
response : {"item" : "furnace", "recipe" : "7 stone, 1 coal", "type" : "BLOCKS"} ###END
Given a user input, return the response in the format (respecting quotation marks) : {"item" : STRING, "recipe" : STRING, "type" : STRING} ###END
### input :
bricks
### response :
{"item": "bricks", "recipe": "3 clay", "type":"BLOCKS"} #

ITEM (to be crafted) -> RECIPE

*/



// ===========================================================================================
//														INVENTORY

const inventory = new Inventory();
inventory.add('dirt', 5);
inventory.add('stone', 10);




//hachage chatGPT3.5
async function sha256(message) {
  const utf8Message = new TextEncoder().encode(message); // Convertit le message en UTF-8 bytes
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8Message); // Calcule le hachage du message
  return hex(hashBuffer); // Convertit le résultat du hachage en une chaîne hexadécimale
}

function hex(buffer) {
  const hexCodes = [];
  const view = new DataView(buffer);
  for (let i = 0; i < view.byteLength; i += 4) {
    const value = view.getUint32(i);
    const stringValue = value.toString(16);
    const paddedValue = stringValue.padStart(8, '0');
    hexCodes.push(paddedValue);
  }
  return hexCodes.join('');
}
//