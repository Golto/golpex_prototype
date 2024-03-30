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
	const res = await LLM_Executor(input);
	handler.printLog(res)
	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}

async function LLM_Executor(input){
	let cost = bp.API_Counter.LLM;

	const prompt = bp.format.INSTRUCT + input + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 1);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Executor : ','Coût = ' + cost);
	console.log(res)

	return output.split('#')[0] // .split('#')[0] nécessaire car le modèle a tendance à rajouter "# 1999–2001 ..."
}

/*
### Instructions :
We are in an adventure game. In order to progress in the game, we can craft items, fight monsters and explore the world. To know which actions are possible, we have at our disposal some data.
### Player Memories :
Player is in an abandonned house in the forest.
### Player stats :
health : good/ hunger : good/name : Max/age : 20
### Inventory :
sticks (3)
### Prompt :
Find woods, in order to craft wheel
### Response :
*/

/*

### Instructions :
We are in an adventure game. In order to progress in the game, we can craft items, fight monsters and explore the world. To know which actions are possible, we have at our disposal some data.
### Player Memories :
Player is in an abandonned house in the forest.
You can't find any woods in the area. You can try to explore the forest orgo back to the city.
### Player stats :
health : good, hunger : good, name : Max, age : 20
### Inventory :
sticks (3)
### Prompt :
Go back to the city
### Response :
You go back to the city.

You find a shop.

Shopkeeper: "Hello, what can I do for you?"

Player : "I'm lookingfor some food"

Shopkeeper: "Sure, we have some apples and

*/

/*
### Instructions :
We are in an adventure game. In order to progress in the game, we can craft items. Given ingredient items, output a resulted item from them.
### Prompt :
sticks (2), iron (3)
### Resulted item :
//a knife 
*/


/*
### Instructions :
We are in a city builder game. In order to progress in the game, we develop the city by adding buildings. Each building has a price. Say if we have enough money to build or not. If yes, write the mention "OK_BUILD", if not write "NOT_BUILD"
### Existing structures :
House (13)
### Money :
14,000$
### Prompt :
Bakery
### Response :
//NOT_BUILD # 1999–2000-es
*/

/*

### Instructions :
We are in a city builder game. In order to progress in the game, we develop the city by adding buildings. Each building has a price. Say if we have enough money to build or not.
### Existing structures :
House (13)
### Money :
14,000$
### Prompt :
Bakery
### Response :
You have 14,000$ and the Bakery costs 10,000$.
You have enough money to build the Bakery. # 1

*/

/*
### Instructions :
We are in a city builder game. In order to progress in the game, we develop the city by adding buildings. Each building has a price. For a specific building, estimate the price to build it. Write the value with $
### Prompt :
Bakery
### Response :
$1000 # 1999–2000-
*/

/*
### Instructions :
We are in a city builder game. In order to progress in the game, we develop the city by adding buildings. Each building has a price. For a specific building, estimate the price to build it. Write the value with $ in the following format <$VALUE>
### Prompt :
Bakery
### Response :
<$1000> # 1999–200
*/

/*
### Known prices :
House <$10000>, Bakery <$15000>, Small Shop<$20000>, Hotel <$50000>, Park <$5000>, Hospital <$100000>, 
*/

const nextButton = document.getElementById('buttonRolePlay');
nextButton.addEventListener('click', ()=>{});

class Building {
	constructor(name, price, type){
		this.name = name;
		this.uuid = crypto.randomUUID();
		this.price = price;
		this.type = type; //residential / commercial / industrial / ...
	}
}


class City {
	constructor(name){
		this.name = name;
		this.uuid = crypto.randomUUID();
		this.citizens = 0;
		this.buildings = new Map;
		this.money = 0;
	}
}

function next(){

	return 0
}

const house = new Building('house', 15000, 'residential');
const shop = new Building('shop', 15000, 'commercial');
const industry = new Building('industry', 15000, 'industrial');