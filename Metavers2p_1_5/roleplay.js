/*

BIOME GENERATOR

Biome description -> Biome name

<|system|>In a sandbox game, with plenty of biomes to explore.<|endoftext|>
Biome description : Tropical temperature. Humidity. Tall trees, vines, vast flora and fauna. Biome name : Jungle<|endoftext|>
Biome description : Oaks, bushes, grass. Soft temperature.
Biome name : Forest<|endoftext|>
Biome description : Dunes and sand. Windy, sunny, hot. Biome name : Desert<|endoftext|>
Biome description : Fire and lava all over the place. Black rocks. Biome name : Volcanic<|endoftext|>
Biome description : Underwater, warm, deep. Biome name : Aquatic


Biome name -> Biome description

<|system|>In a sandbox game, with plenty of biomes to explore.<|endoftext|>
Biome name : Jungle. Biome description : Tropical temperature. Humidity. Tall trees, vines, vast flora and fauna<|endoftext|>
Biome name : Forest. Biome description : Oaks, bushes, grass. Soft temperature<|endoftext|>
Biome name : Desert. Biome description : Dunes and sand. Windy, sunny, hot<|endoftext|>
Biome name : Volcanic. Biome description : Fire and lava all over the place. Black rocks<|endoftext|>
Biome name : Mushrooms. Biome description : Growing on logs and in the dirt. Colors ranging from white to brown.

+ text2img

CRAFT GENERATOR

<|system|>In a sandbox game, with plenty of items to craft.<|endoftext|>
Item recipe : wood(2) / Item crafted : plank(1)<|endoftext|>
Item recipe : wood(1), rock(1) / Item crafted : tool(1)<|endoftext|>
Item recipe : wood(1), coal(1) / Item crafted : torch(5)<|endoftext|>
Item recipe : wool(2) / Item crafted : cloth(1)<|endoftext|>
Item recipe : iron(2) / Item crafted : armor(1)


ADVENTURE GENERATOR

<|system|>In a sandbox game, a character living an adventure.<|endoftext|>
Past Actions : Visited an ancient house, got a sword, got some food.
Present State : Good health, low on stamina.
Choice : Get some rest in a bard.
Future events resulted from Choice : The bard gives the character some rest and he gains some stamina.

*/

function outputExtractor(prompt, response){
	const output = response.slice(prompt.length)
	return output
}

const format = {
	SYSTEM : "<|system|>",
	ENDTXT : "<|endoftext|>",
	PROMPT : "<|prompter|>",
	ASSIST : "<|assistant|>",
	PREBEG : "<|prefix_begin|>",
	PREEND : "<|prefix_end|>",
	PADDIN : "<|padding|>",

	build : input => {return "<|" + input + "|>"},
	labelStart : input => {return "<" + input + ">"},
	labelEnd : input => {return "</" + input + ">"},
	labelRegex : label => {return "/<" + label + ">(.*?)<\/" + label + ">/"},
}

async function promptLLM(input){
	const res = await queryOpenAssistant({"inputs": input});
	if (res.error) return(res);
	return res[0].generated_text
}

async function promptText2Img(input){
	const res = await queryTxt2Img({"inputs": input});
	//if (res.error) return res
	return res
}

const inputRolePlay = document.getElementById('inputRolePlay')
const outputRolePlay = document.getElementById('outputRolePlay')
const imageRolePlay = document.getElementById('imageRolePlay')

const previousRolePlay = document.getElementById('previousRolePlay')
const stateRolePlay = document.getElementById('stateRolePlay')


function handleRolePlay(e){
	let input = inputRolePlay.value

	if(e.key === 'Enter'){
		//T2I_BiomeDescription(input);
		player.LLM_adventureGen01(input);
	}

}

function printLog(input){
	outputRolePlay.innerText = input;
}





let API_Counter = {
	LLM : 0,//Large Language Model
	T2I : 0,//Text to Image
}

async function T2I_Background(input){
	const result = await promptText2Img(input)
	const imageUrl = URL.createObjectURL(result);
	imageRolePlay.src = imageUrl;
	API_Counter.T2I += 1;
	return result

}

async function LLM_adventureGen01(input){
	const memories = 'Visited an ancient house, got a sword, got some food.';
	const state = 'Good health, low on stamina.';
	/*
	ADVENTURE GENERATOR

	<|system|>In a sandbox game, a character living an adventure.<|endoftext|>
	Past Actions : Visited an ancient house, got a sword, got some food.
	Present State : Good health, low on stamina.
	Choice : Get some rest in a bard.
	Future events resulted from Choice : The bard gives the character some rest and he gains some stamina.
	*/
	let prompt = "";
	prompt += format.SYSTEM + 'In a sandbox game, a character living an adventure.' + format.ENDTXT;
	prompt += '\nPast Actions : ' + memories + format.ENDTXT;
	prompt += '\nPresent State : ' + state + format.ENDTXT;
	prompt += '\nChoice : ' + input + format.ENDTXT;	//is the choice plausible ? else : forbid the choice
	prompt += 'Future events resulted from Choice : ';
	let res = prompt;
	const MAX = 1;
	
	for (let i = 0; i < MAX; i++) {
		res = await promptLLM(res);
		API_Counter.LLM += 1;
		if (res.error) return res.error
		printLog('LLM_adventureGen01 : ' + i/MAX*100 + '%');
	}
	printLog('LLM_adventureGen01 : 100%');

	let output = outputExtractor(prompt, res);
	printLog(output)

	return output
}


class Character {
	constructor(name, age){
		this.uuid = crypto.randomUUID();
		this.name = name;
		this.age = age;

		this.relations = [];


		this.health = 'Good health';
		this.hunger = 'Saturated';
		this.thirsth = 'Not thirsthy';
		this.energy = 'Not tired';
		this.memories = '';

	}

	async LLM_adventureGen01(input){
		/*
		ADVENTURE GENERATOR

		<|system|>In a sandbox game, a character living an adventure.<|endoftext|>
		Past Actions : Visited an ancient house, got a sword, got some food.
		Present State : Good health, low on stamina.
		Choice : Get some rest in a bard.
		Future events resulted from Choice : The bard gives the character some rest and he gains some stamina.
		*/
		let prompt = "";
		prompt += format.SYSTEM + 'In a sandbox game, a character living an adventure.' + format.ENDTXT;
		prompt += 'Past Actions : ' + this.memories + format.ENDTXT;
		prompt += 'Present health : ' + this.health + format.ENDTXT;//
		prompt += 'Present hunger : ' + this.hunger + format.ENDTXT;//
		prompt += 'Present thirsth : ' + this.thirsth + format.ENDTXT;//
		prompt += 'Present energy : ' + this.energy + format.ENDTXT;
		prompt += format.SYSTEM + 'Player has to make a choice in order to progress in the adventure' + format.ENDTXT;
		prompt += 'Choice : ' + input + format.ENDTXT;	//is the choice plausible ? else : forbid the choice
		prompt += format.SYSTEM + 'Due to this choice, Player will encounter new Events.' + format.ENDTXT;
		prompt += 'Resulted Event :';
		let res = prompt;
		//-------------------------------------------------
		let MAX = 1;
		for (let i = 0; i < MAX; i++) {
			res = await promptLLM(res);
			API_Counter.LLM += 1;
			if (res.error) return res.error
			printLog('LLM_adventureGen01 : ' + i/MAX*100 + '%');
		}
		printLog('LLM_adventureGen01 : 100%');
		//-------------------------------------------------

		console.log('\npast memories : ', this.memories)

		let output = outputExtractor(prompt, res);
		printLog(output)

		this.memories += output;
		previousRolePlay.innerText += output + '\n';
		this.memories = this.memories.slice(-200);

		console.log('new memories : ', this.memories)
		//-------------------------------------------------
		prompt = res + format.ENDTXT + 'New Health :';
		res = prompt;
		//-------------------------------------------------
		MAX = 1;
		for (let i = 0; i < MAX; i++) {
			res = await promptLLM(res);
			API_Counter.LLM += 1;
			if (res.error) return res.error
			printLog('LLM_adventureGen01 : ' + i/MAX*100 + '%');
		}
		printLog('LLM_adventureGen01 : 100%');
		//-------------------------------------------------

		console.log('\npast health : ', this.health)

		output = outputExtractor(prompt, res);
		printLog(output)

		this.health = output;

		console.log('new health : ', this.health)
		//-------------------------------------------------
		prompt = res + format.ENDTXT + 'New Energy :';
		res = prompt;
		//-------------------------------------------------
		MAX = 1;
		for (let i = 0; i < MAX; i++) {
			res = await promptLLM(res);
			API_Counter.LLM += 1;
			if (res.error) return res.error
			printLog('LLM_adventureGen01 : ' + i/MAX*100 + '%');
		}
		printLog('LLM_adventureGen01 : 100%');
		//-------------------------------------------------

		console.log('\npast health : ', this.energy)

		output = outputExtractor(prompt, res);
		printLog(output)

		this.energy = output;
		
		console.log('new health : ', this.energy)


		this.printState();

		return output
	}

	printState(){
		let text = 'Name : ' + this.name;
		text += '\nAge : ' + this.age;
		text += '\nHealth : ' + this.health;
		text += '\nEnergy : ' + this.energy;
		text += '\n...';
		stateRolePlay.innerText = text;
	}
}



class Relation {
	constructor(character1, character2){
		this.uuid = crypto.randomUUID();
		this.character1 = character1;
		this.character2 = character2;
		this.state = 'Neutral';
	}
}



const player = new Character('Golto', 20);