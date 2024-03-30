import * as bp from './brainPex.js';

const handler = new bp.Handler(
	'Game - Adventure',
	'inputRolePlay',
	'outputRolePlay',
	input => {
		multiTask(input);
	}
);

async function multiTask(input){
	/*
	const res = await LLM_Player2Data(player1.toString(), '{"isJulieAFriend" : BOOL, "action" : STRING,}');
	handler.printLog(res)
	console.log(JSON.parse(res))*/
	
	/*
	const res = await LLM_Item2CraftRecipe(input);
	handler.printLog(res)
	console.log(JSON.parse(res))*/

	const requirements = await LLM_task2Requirements(input);
	handler.printLog(requirements)
	//console.log(JSON.parse(requirements))

	const conditions = await LLM_isRequirementsMet(player1, input, requirements)
	handler.printLog(conditions)
	//console.log(JSON.parse(conditions))

	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}

function randInt(min, max){
	return Math.floor(min + Math.random() * (max - min) )
}

const nextButton = document.getElementById('buttonRolePlay');
nextButton.addEventListener('click', ()=>{
		handler.printLog(player1.toString());
	});

//------------------------------------------------------
/*

### instructions :
<input>
### response :
<output>

*/

async function LLM_Executor(input){
	let cost = bp.API_Counter.LLM;

	const prompt = bp.format.INSTRUCT + input + bp.format.INPUT + bp.format.ENDER + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 1);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Executor : ','Coût = ', cost);
	console.log(res)

	return output.split('###END')[0] // .split('#')[0] nécessaire car le modèle a tendance à rajouter "# 1999–2001 ..."
}

//------------------------------------------------------
/*

### instructions :
Given a building, return the following datas in this format : {price : VALUE, isResidential : BOOL, isCommercial : BOOL, isInsustrial : BOOL}
### input :
a house
### response :
{
  "price": 100000,
  "isResidential": true,
  "isCommercial": false,
  "isInsustrial": false
}

*/

async function LLM_BuildingPricing(input){
	let cost = bp.API_Counter.LLM;

	const prompt = bp.format.INSTRUCT + 'Given a building, return the following datas in this format (respecting quotation marks) : {"price" : VALUE, "isResidential" : BOOL, "isCommercial" : BOOL, "isInsustrial" : BOOL}' + bp.format.INPUT + input + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 3);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_BuildingPricing : ','Coût = ', cost);
	console.log(res)

	return output.split('#')[0] // .split('#')[0] nécessaire car le modèle a tendance à rajouter "# 1999–2001 ..."
}

//------------------------------------------------------
/*

### instructions :
Given the player state, return the following datas in this format : {isHealthy: BOOL, goal : STRING}
### input :
{name : Johan, age : 20, health : ["Broken leg"], social : [{Lucie, friend}, {Lucas, enemy}], Inventory : []}
### response :
{isHealthy: false, goal : "Recover from the broken leg"}

*/

async function LLM_Player2Data(input, format){
	let cost = bp.API_Counter.LLM;

	const prompt = bp.format.INSTRUCT + `Given the player state, return the following datas in this format (respecting quotation marks) : ${format}` + bp.format.INPUT + input + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 2);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Player2Data : ','Coût = ', cost);
	console.log(res)

	return output.split('#')[0] // .split('#')[0] nécessaire car le modèle a tendance à rajouter "# 1999–2001 ..."
}

//------------------------------------------------------
/*

### instructions :
Given an item that we want to craft, return the following datas in this format : {itemsNeeded : LIST OF {item : STRING, number : INTEGER}}
### input :
- phone
### response :
{
  "itemsNeeded": [
    {
      "item": "copper wire",
      "number": 1
    },
    {
      "item": "screen",
      "number": 1
    }
  ]
}

*/

async function LLM_Item2CraftRecipe(input){
	let cost = bp.API_Counter.LLM;

	const prompt = bp.format.INSTRUCT + `Given an item that we want to craft, return the following datas in this format (respecting quotation marks) : {itemsNeeded : LIST OF {item : STRING, number : INTEGER}}` + bp.format.INPUT + input + bp.format.ENDER + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 10);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Item2CraftRecipe : ','Coût = ', cost);
	console.log(res)

	return output.split('#')[0] // .split('#')[0] nécessaire car le modèle a tendance à rajouter "# 1999–2001 ..."
}

//------------------------------------------------------
/*

### instructions :
Given the player state and a task, return the following datas in this format : {ItemsNeeded: LIST OF {item : STRING, number : INTEGER}, skillsNeeded : LIST OF {skill : STRING, level : INTEGER}}
### input :
{name : Johan, age : 20, health : [], social : [{Lucie, friend}, {Lucas, enemy}], Inventory : []}
Task : "Fight a giant spider in the dark forest"
### response :
{ItemsNeeded: [
  {item: "Torch", number: 1},
  {item: "Healing Potion", number: 1},
  {item: "Sword", number: 1}
], skillsNeeded: [
  {skill: "Sword Fighting", level: 3},
  {skill: "Healing", level: 2}
]}


### instructions :
Given the player state and a task, return the following datas in this format : {ItemsNeeded: LIST OF {item : STRING, number : INTEGER}, skillsNeeded : LIST OF {skill : STRING, level : INTEGER}}
### input :
{name : Johan, age : 20, health : [], social : [{Lucie, friend}, {Lucas, enemy}], Inventory : []}
Task : "Fight the colossal Lava Golem level 49"
End reponse with ###END
### response :
{ItemsNeeded: [
  {item: "Health Potion", number:5},
  {item: "Fire Resistance Potion", number: 2},
  {item: "Iron Sword", number: 1},
  {item: "Heavy Armor", number: 1}
],
skillsNeeded:[
  {skill: "Fire Magic", level: 10},
  {skill: "Heavy Weapons", level: 15},
  {sk...
*/

async function LLM_task2Requirements(task){
	let cost = bp.API_Counter.LLM;

	//const prompt = bp.format.INSTRUCT + `Given the player state and a task, return the following datas in this format (respecting quotation marks) : {"ItemsNeeded": LIST OF {"item" : STRING, "number" : INTEGER}, "skillsNeeded" : LIST OF {"skill" : STRING, "level" : INTEGER, "explanation" : STRING}}` + bp.format.INPUT + "\nPlayer state : " + input + "\nTask : " + task + bp.format.ENDER + bp.format.RESPONSE;
	const prompt = bp.format.INSTRUCT + `Given a task, return the following datas in this format (respecting quotation marks) : {"ItemsNeeded": LIST OF {"item" : STRING, "number" : INTEGER}, "skillsNeeded" : LIST OF {"skill" : STRING, "level" : INTEGER, "explanation" : STRING}}\nAdd ###END after the format.` + bp.format.INPUT + "Task : " + task + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 10);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_task2Requirements : ','Coût = ', cost);
	console.log(res)

	return output.split('#')[0] // .split('#')[0] nécessaire car le modèle a tendance à rajouter "# 1999–2001 ..."
}

//------------------------------------------------------

/*

### instructions :
Given the player state, a task and the requirements for the task, return the following datas in this format : {hasEnoughItems : BOOL, hasEnoughSkills : BOOL}
If Player has better equipments or better skills, then the requirments are satisfied.
### input :
{name : Marc, age : 20, health : ["broken arm", ], relations : [{with : Julie, state : friends}, ], inventory : [{item : diamond armor, number : 1}, {item : diamond sword, number : 1}, {item : flask of mega healing, number : 1},], skills : []}
Task : "fight a goblin level 11"
Requirements : {ItemsNeeded: [
  {item: "healing potion", number: 1},
  {item: "dagger", number: 1},
  {item:"leather armor", number: 1}
],
skillsNeeded: [
  {skill: "swordsmanship", level: 5},
 {skill: "magic", level: 3}
]}
End reponse with ###END
### response :
{hasEnoughItems : TRUE, hasEnoughSkills : FALSE}

*/
/*
### instructions :
Given the player state, a task and the requirements for the task, return the following datas in this format : {hasEnoughItems : BOOL, hasEnoughSkills : BOOL, explantion : STRING}
If Player has better equipments or better skills suited for the task, then the requirements are satisfied.
### input :
{name : Marc, age : 20, health : ["broken arm", ], relations : [{with : Julie, state : friends}, ], inventory : [{item : diamond armor, number : 1}, {item : diamond sword, number : 1}, {item : flask of mega healing, number : 1},], skills : [{skill: "sword attack", level: 6}, {skill: "fire magic", level: 5},]}
Task : "Dig a hole"
Requirements : {
  "ItemsNeeded": [
    {
      "item": "shovel",
      "number": 1
    }
  ],
  "skillsNeeded": [
    {
      "skill": "digging",
      "level": 1,
      "explanation": "You need to be able to digwith your hands."
    }
  ]
}
End reponse with ###END
### response :
*/


async function LLM_isRequirementsMet(player, task, requirements){ // problème avec : dig a hole
	let cost = bp.API_Counter.LLM;

	const prompt = bp.format.INSTRUCT + `Given the player inventory and skills, a task and the requirements to complete the task, return the following datas in this format : {"hasEnoughItems" : BOOL, "hasEnoughSkills" : BOOL, "explanation" : STRING}\nIf Player has better equipments or better skills suited for the task, then the requirements are satisfied. If the equipment is not suited for the task, the requirements are not satisfied.` + bp.format.INPUT + "\nPlayer inventory : " + player.toStringInventory() + "\nPlayer skills : " + player.toStringSkills() + "\nTask : " + task + "\nRequirements : " + requirements + "\nDo Player has the required items ?" + bp.format.ENDER + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 10);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_isRequirementsMet : ','Coût = ', cost);
	console.log(res)

	return output.split('#')[0] // .split('#')[0] nécessaire car le modèle a tendance à rajouter "# 1999–2001 ..."
}

//------------------------------------------------------
/*
### instructions :
 Clean the JSON format. Correct the sentences and clear everything outside the JSON. Add ###END after the JSON
### input :
{"ItemsNeeded": [{"item": "shovel", "number": 1}, {"item": "bucket", "number": 1}, {"item": "pickaxe", "number": 1}], "skillsNeeded": [{"skill": "strength", "level": 3, "explanation": "To be able to digand lift heavy objects"}, {"skill": "endurance", "level": 2, "explanation": "To be able to dig for a long time without getting tired"}, {"skill": "patience", "level": 1, "explanation": "To beable to dig without getting discouraged"}]} Tags: c
### response :
{"ItemsNeeded": [{"item": "shovel", "number": 1}, {"item": "bucket", "number": 1}, {"item": "pickaxe", "number": 1}], "skillsNeeded": [{"skill": "strength", "level": 3, "explanation": "To be able to digand lift heavy objects"}, {"skill": "endurance", "level": 2, "explanation": "To be able to dig for a long time without getting tired"}, {"skill": "patience", "level": 1, "explanation": "To beable to dig without getting discouraged"}]}

### seo :
{"ItemsNeeded": [{"item": "sh...

*/
async function LLM_jsonCorrection(erroredJson){
	let cost = bp.API_Counter.LLM;

	const prompt = bp.format.INSTRUCT + `Clean the JSON format. Correct the sentences and clear everything outside the JSON. Add ###END after the JSON.` + bp.format.INPUT + erroredJson + bp.format.ENDER + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 10);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_jsonCorrection : ','Coût = ', cost);
	console.log(res)

	return output.split('#')[0] // .split('#')[0] nécessaire car le modèle a tendance à rajouter "# 1999–2001 ..."
}
//------------------------------------------------------
/*

### instructions :
This is an alchemy game. You need to combine elements in order to form new ones.
Given a list of elements, return the response in the format (respecting quotation marks) {"recipe" : LIST OF STRING, "result" : STRING}
Examples : 
 {"recipe" : ["water", "earth"], "resultedElement" : "plant"}
{"recipe" : ["earth", "earth"], "resultedElement" : "rock"}
{"recipe" : ["fire", "earth"], "resultedElement" : "lava"}
{"recipe" : ["water", "air"], "resultedElement" : "steam"}
### input :
recipe : earth, earth
### response :
{"recipe" : ["earth", "earth"], "resultedElement" :"rock"}

*/



//------------------------------------------------------
/*

### instructions :
You are Lucie, a student in science.
Given a conversation, return the next sentence in the format : { next : STRING }
End with "###END"
### input :
{previous : [
{name : Marc, say : "Have you been to the cinema ?"},
{name : Lucie, say : "I'm going to the cinema tonight. Do you want to come with me ?"},
] }
### response :

*/

async function LLM_conversation(description, previous){
	let cost = bp.API_Counter.LLM;

	const prompt = bp.format.INSTRUCT + `${description}\n Given a conversation, return the next sentence in the format : { next : STRING }\nEnd with "###END"` + bp.format.INPUT + previous + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 3);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_conversation : ','Coût = ', cost);
	console.log(res)

	return output.split('#')[0] // .split('#')[0] nécessaire car le modèle a tendance à rajouter "# 1999–2001 ..."
}

//------------------------------------------------------

function taskSuccess(){
	const dice = randInt(1,20);
	if (dice > 18) return "critical success"
	if (dice > 9) return "moderate success"
	if (dice > 2) return "moderate failure"
	return "critical failure"
}



class Player {
	constructor(name, age){
		this.uuid = crypto.randomUUID();	// STRING								"0c76ec3a-4769-4803-8136-28ffbe55eb86"
		this.name = name;					// STRING								"Marc"
		this.age = age;						// INTEGER								20
		this.health = [];					// LIST OF STRING						["Broken leg", "Flu", ]
		this.relations = [];				// LIST OF RELATION 					[]
		this.inventory = [];				// LIST OF OBJECTS {ITEM, INTEGER} 		[{item : "wood", number : 14}, ]
		this.skills = [];					// LIST OF OBJECTS {ITEM, INTEGER} 		[{skill : "socialize", level : 3}, ]
		this.memories = [];					// LIST OF ...
		Player.list.set(this.uuid, this)
	}

	toString(){
		let health = '';
		let relations = '';
		let inventory = '';
		let skills = '';
		for (let healthState of this.health) {
			health += `"${healthState}", `;
		}
		for (let relation of this.relations) {
			relations += `${relation.toString()}, `;
		}
		for (let itemObj of this.inventory) {
			inventory += `{item : ${itemObj.item.name}, number : ${itemObj.number}}, `;
		}
		inventory += "{item : diamond armor, number : 1}, {item : diamond sword, number : 1}, {item : flask of mega healing, number : 1},";//temp
		skills += "{skill: sword attack, level: 6}, {skill: fire magic, level: 5},";//temp

		return `{name : ${this.name}, age : ${this.age}, health : [${health}], relations : [${relations}], inventory : [${inventory}], skills : [${skills}]}`
	}

	toStringInventory(){
		let inventory = '';
		for (let itemObj of this.inventory) {
			inventory += `{item : ${itemObj.item.name}, number : ${itemObj.number}}, `;
		}
		inventory += "{item : diamond armor, number : 1}, {item : diamond sword, number : 1}, {item : flask of mega healing, number : 1}, {item : shovel, number : 0}, ";//temp
		return inventory
	}

	toStringSkills(){
		let skills = '';
		for (let skillObj of this.skills) {
			skills += `{skill : ${skillObj.skill.name}, level : ${skillObj.level}}, `;
		}
		skills += "{skill: sword attack, level: 6}, {skill: fire magic, level: 5},";//temp
		return skills
	}
}
Player.list = new Map();


class Relation {
	constructor(playerId, withPlayerId){
		this.playerId = playerId;			// STRING		"0c76ec3a-4769-4803-8136-28ffbe55eb86"
		this.withPlayerId = withPlayerId;	// STRING 		"e58b6b48-5186-41f3-b213-5f2ec007cf82"
		this.state = '';					// STRING		"Solid Frienship"
	}

	toString(){
		const withPlayer = Player.list.get(this.withPlayerId);
		return `{with : ${withPlayer.name}, state : ${this.state}}`
	}
}

class Item {
	constructor(name){
		this.uuid = crypto.randomUUID();	// STRING		"0c76ec3a-4769-4803-8136-28ffbe55eb86"
		this.name = name;					// STRING 		"rock"
		Item.list.set(this.uuid, this)
	}
}
Item.list = new Map();


const dirt = new Item('dirt');
const rock = new Item('rock');

const diamond_armor = new Item('diamond armor');
const diamond_sword = new Item('diamond sword');
const healing_flask = new Item('flask of mega healing');

const player1 = new Player('Marc', 20);

//health
player1.health.push('broken arm');

//relation
const player2 = new Player('Julie', 21);

const relation12 = new Relation(player1.uuid, player2.uuid);
relation12.state = 'friends';

player1.relations.push(relation12);

//inventory
player1.inventory.push({item : dirt, number : 12});
player1.inventory.push({item : rock, number : 4});


//handler.printLog(player2.toString())


