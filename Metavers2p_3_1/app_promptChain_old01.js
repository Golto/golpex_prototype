// ===============================================================================================================================
// ===============================================================================================================================
//													IMPORT
// ===============================================================================================================================


import * as bp from './brainPex.js';

let app, promptInput, promptOutput, lds;

// ===============================================================================================================================
// ===============================================================================================================================
//													MULTI TASK
// ===============================================================================================================================

async function multiTask(input){
	lds.classList.remove('display-none');
	console.log(bp.API_COUNTER)
	//const res = await LLM_text2bool(input, "Est ce que ça parle de maths ?");
	//const res = await LLM_text2json(input, "{ tranlation_in_french : STRING }");
	
	//const res = await PCL_exemplator(input);
	//const res = await similarity('Matrice dans la base b', ['algèbre linéaire', 'intégrales de contour', 'poésie', 'Victor Hugo', 'parler en anglais', 'matrice de passage']);
	
	//console.log(`${Memory.CONVERSATION}`);
	//console.log(Memory.getShortMemory());
	//console.log(await Memory.getLongMemory(input));

	if (input.startsWith('save')) {

		const jsonData = Memory.toJson();

		let virtualLink = document.createElement("a");
		let jsonFile = new Blob([jsonData], {type: 'application/json'});
		virtualLink.href = URL.createObjectURL(jsonFile);

		virtualLink.download = 'Lethis_Memory_Saved_' + new Date().toString().replaceAll(' ', '_') + '.json';
		virtualLink.click();
		return 0
	}

	if (input.startsWith('load')) {

		

		// définir/remplacer importAlchemy
		/*
		<input type="file" id="jsonFileInput">

		document.getElementById("jsonFileInput").addEventListener("change", function(event) {
		  var file = event.target.files[0];
		  var reader = new FileReader();

		  reader.onload = function(e) {
		    var contents = e.target.result;
		    var jsonData = JSON.parse(contents);

		    // Faites quelque chose avec les données JSON importées
		    console.log(jsonData);
		  };

		  reader.readAsText(file);
		});
		*/
		const inputFile = document.createElement('input');
		inputFile.type = "file";
		inputFile.onchange = async ()=>{
			const json = await inputFile.files[0].text();
			//console.log(json)
			Memory.fromJson(json);

			promptOutput.innerText = Memory.CONVERSATION.map( m => m.toString() ).join('\n');
		};
		inputFile.click();


		
		return 0
	}

	

	const res = await LLM_main(input, false);

	new Memory('user', null, input);
	new Memory('Lethis', null, res);

	promptOutput.innerText = Memory.CONVERSATION.map( m => m.toString() ).join('\n');
	//console.log(res)

	lds.classList.add('display-none');
	console.log(bp.API_COUNTER)
}



function randomLetter() {
  const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26)).toUpperCase();
  return letter;
}

function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
// ===============================================================================================================================
// ===============================================================================================================================
//													PROMPT CHAINER LANGUAGE
// ===============================================================================================================================

class PromptChainer{
	constructor(){
		this.is = 0;
	}
}

async function LLM_text2bool(input, condition){
	const STOP_TOKEN = "end of json";
	const MAX_ITERATION = 7;

	const prompt =
`### instructions :
Given a question or a request, return in format : { "boolean" : (true/false) }
Then, write "${STOP_TOKEN}" after.
### text :
${input}
### input :
${condition}
### response : `

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	//console.log(prompt)
	//console.log(output.replaceAll('\n', ''))

	return JSON.parse(output.replaceAll('\n', '')).boolean
}

async function LLM_text2json(input, jsonFormat){
	const STOP_TOKEN = "end of json";
	const MAX_ITERATION = 7;

	const prompt =
`### instructions :
Given an input, return in format : ${jsonFormat}
Then, write "${STOP_TOKEN}" after.
### input :
${input}
### response :`

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	return JSON.parse(output.replaceAll('\n', ''))
}

async function LLM_text2text(input, instruction){
	const STOP_TOKEN = "end of text";
	const MAX_ITERATION = 7;

	const prompt =
`### instructions :
Given an input, ${instruction}.
Then, write "${STOP_TOKEN}" after.
### input :
${input}
### response :`

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	return output
}


async function PCL_exemplator(input) {

	let maths, json;

	// if
	const condition = await LLM_text2bool(input, 'Est ce que le texte parle de maths ?');
	if (condition) {
		// text to text
		maths = await LLM_text2text(input, 'Expliques les objets mathématiques du texte');
	} else {
		// text 2 json
		json = await LLM_text2json(input, '{ "main_topic" : STRING , "isJoyful" : BOOL }');
	}

	return { maths, json }
}
/*
input = "Polynom"
{maths: '\nUn polynôme est une expression mathématique qui s…st un nombre ou une lettre utilisée pour noter un', json: undefined}

input = "la poésie"
{maths: undefined, json: {…}}
json: {main_topic: 'poésie', isJoyful: true}
maths: undefined


async function PCL_exemplator(input) {

	let maths, json;

	if ('Est ce que le texte parle de maths ?'(input)) {
		maths = 'Expliques les objets mathématiques du texte'(input)
	} else {
		json = '{ "main_topic" : STRING , "isJoyful" : BOOL }'(input)
	}

	return { maths, json }
}
*/


// ===============================================================================================================================
// ===============================================================================================================================
//													MEMORY
// ===============================================================================================================================

class Memory {
	constructor(sender, date, content) {
		this.sender = sender;
		this.date = date;
		this.content = content;
		

		if (date === null) {

			const date = new Date();

		//const date = new Date();
		//const dateText = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
		//date.toDateString()
			//this.timeText = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
			this.date = date.toDateString()//`${date.toDateString()} ${date.toTimeString()}`;
			
		}

		Memory.CONVERSATION.push(this);
	}

	toString() {
		if (this.sender === "system") {
			return `SYSTEM : "${this.content.replaceAll('\n', ' ')}"`
		}
		return `At ${this.date}, ${this.sender} said :\n${this.content.replaceAll('\n', ' ')}`
	}

	
}

Memory.CONVERSATION = [];
Memory.MAX_CHARACTERS = 1024; // 3/4 * 2048 = 1536
Memory.MAX_CHARACTERS_PER_MEMORY = 256;
Memory.MAX_SHORT_MEMORY = 5;
Memory.MAX_LONG_MEMORY = 4;

Memory.getShortMemory = () => {
	let text = '';
	const array = Memory.CONVERSATION.slice(-Memory.MAX_SHORT_MEMORY);
	for (let message of array) {
		text += `${message.toString().replaceAll('\n',' ').replaceAll('\t', ' ')}\n`
	}
	return text.slice(-Memory.MAX_CHARACTERS)
}

Memory.getLongMemory = async (input) => {

	const sentences = Memory.CONVERSATION.slice(0,-Memory.MAX_SHORT_MEMORY).map( m => m.toString().slice(0,Memory.MAX_CHARACTERS_PER_MEMORY) );
	const source = input + '\n' + Memory.CONVERSATION.slice(-2).content;
	let res = await similarity(source, sentences);
	res = res.slice(-Memory.MAX_LONG_MEMORY);
	const text = res.map( s => s.sentence ).join('\n');
	return text.slice(-Memory.MAX_CHARACTERS)
}

async function findMostSimilar(source, sentences) {
	const res = await bp.promptTS(source, sentences);
	const max = Math.max(...res[0]);
	const index = res[0].findIndex(e => e === max)
	return { sentence : sentences[index], value : max }
}

async function similarity(source, sentences) {

	const res = await bp.promptTS(source, sentences);

	sentences = sentences.map( (s,i) => {
		return { sentence : s, value : res[0][i] }
	});

	console.log(sentences)

	sentences.sort((a,b) => {
		return a.value - b.value
	});

	return sentences
}

Memory.toJson = function() {
	const memories = Memory.CONVERSATION.map( message => {
		return { sender : message.sender, date : message.timeText, content : message.content }
	})
	return JSON.stringify({ memories })
}

Memory.fromJson = function(json) {
	const obj = JSON.parse(json);
	//console.log(obj, obj.memories)

	if(false) {console.error("Fichier dans un format incorrect !"); return;}

	Memory.CONVERSATION = [];

	obj.memories.map( message => {
		new Memory( message.sender, message.date, message.content )
	});

	return 1
}




// ===============================================================================================================================
// ===============================================================================================================================
//													MAIN
// ===============================================================================================================================

async function LLM_main(input, activeAntiRepeat = false){
	const STOP_TOKEN = "end of response";
	const MAX_ITERATION = 7;

	let randomStarter = '';
	let randomEmotion = '';

	if (activeAntiRepeat) {
		
		const starters = input.split(' ').map( c => c[0].toUpperCase() )
		if (starters.length > 15) {
			randomStarter = getRandomElement(starters);
		} else {
			randomStarter = "J"; // temp
		}
		randomEmotion = getRandomElement(['with enthiousasm', 'while being curious', 'with hesitation', 'classicaly', '(enjoy)'])
	}
//as a friendly user who is a tech-enthiousast, a bit teasy and has a familiar tons
	const prompt =
`### instructions :
In a conversation with "User", "Lethis" continue the conversation like a tech-enthiousast with a friendly but a familiar ton. Since Lethis is french, he always respond in french with familiarity.
In Lethis's response, some artefacts occur such as hesitations, exclamations and pauses.
Then, write "${STOP_TOKEN}" after Lethis's reply.
### relevant messages linked to input :
${await Memory.getLongMemory(input)}

### conversation :
${Memory.getShortMemory()}

### input :
Now, user says : ${input}
### Lethis's response :
Now, Lethis says ${randomEmotion} : ${randomStarter}`;

	console.log(prompt)

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', 'Now, ', '# Fin de la ré', 'Fien de la répo', 'End of response', 'user :', 'USER :', 'lethis :', 'Lethis :', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	console.log(output)

	return randomStarter + output

	// il y a des répétitions car il arrive que longMemory et shortMemory affiche les mêmes messages
}


/*
CONCEPTUALIZER

### instructions :
Given an input, return key word that conceptualize an input text in the format : { "key_words" : LIST of CONCEPT(string) }
Then, write "end of json" after format.
### input :
there is a cat that was eating last day, it was funny
### response :
*/
// ===============================================================================================================================
// ===============================================================================================================================
//													INIT
// ===============================================================================================================================


/*
new Memory('Lethis', "Tu kiffes quoi comme musique toi ?");
new Memory('user', "Je sais pas trop, des musiques electroniques genre glitch hop, scifi beats");
new Memory('Lethis', "Mec ! faut que t'écoutes ça, c'est du Rammstein (métal), tu vas trop kiffer Du hast");
new Memory('Lethis', "Alors ?");
new Memory('user', "ouais c'est vrai c'est pas mal, bon après chui pas trop métal, mais ça va");
new Memory('Lethis', "dac");
new Memory('Lethis', "Vas y, tu fais quoi là ?");
new Memory('user', "bah là je fais du prompt engineering, je voudris faire un genre d'humain IA");
new Memory('Lethis', "yes, bah je sais pas ce que c'est prompt enginner mais ok");
new Memory('Lethis', "et ça donne quoi ?");
new Memory('user', "ça donne que j'ai pu lui donner une mémoire à long terme");
*/

/*
new Memory('system', null, "Lethis aime le métal (musique), en particulier le groupe RammStein")
new Memory('system', null, "Lethis n'est pas fan de musique électronique, de jazz ou de musique classique")
*/

const systemMemories = [
	"Lethis aime le métal (musique), en particulier le groupe RammStein",
	"Lethis n'aimes pas les musiques : électro, classiques, jazz",
	"Lethis se montre empathique quand user est triste ou doutes de lui",
	"Passions de Lethis : Photographie, Peinture, Jeux vidéo, Technologie, Science, Cinéma particulièrement Technologie",
	"Caractère de Lethis : Amical, Drôle, Sérieux, Calme, Curieux, Attentionné, Réfléchi, Confiant, Patient, Encourageant, Introverti",
	"Centre d'intérêt académique de Lethis : Mathématiques, Économie, Informatique",
	"Lethis ne pratique pas de sport",
	"Types de films que Lethis aimes : Action, Science-fiction, Fantaisie (sauf les films d'horreurs)",
	"Lethis n'aime pas lire de gros livres, il lit rarement. Il lui est arrivé de lire des mangas",
	"Centre d'intérêt technologique de Lethis : Intelligence artificielle, Programmation, Réseaux sociaux, Smartphones, Jeux vidéo, Applications mobiles, Web design",
	"Styles de mode de Lethis : Décontracté, Cuir noir",
	"Humour de Lethis : humour noir, réfléchi et abouti",
]

systemMemories.map( m => new Memory('system', null, m))

function init() {
	app = document.getElementById('appPromptChain');
	promptInput = app.querySelectorAll('input')[0];
	promptOutput = app.querySelectorAll('div')[0].querySelectorAll('div')[1].querySelectorAll('output')[0];
	promptInput.onExec = (input, e) => multiTask(input, e);

	const ldsObj = new Element('lds', {})
		.css({
			position : 'absolute',
			background : 'var(--color-white-semi)',
			borderRadius : '100%',
			bottom : '20%',
			right : '10%',
		})
		.class('lds', 'display-none')
		
	ldsObj.attachTo(app)
	lds = ldsObj.element;

	promptOutput.innerText = Memory.CONVERSATION.map( m => m.toString() ).join('\n');

	GO_TO_RENDERER('appPromptChain')
}

RENDERERS_INIT.set('appPromptChain', init);


// ------------------------------

//		Voyager architecture


// ACTION RESPONSE FORMAT

/*
Explain : ...
Plan : ...
1)...
2)...
3)...
...
code :
```javascript

// main function
async function mainFunction(bot){
	//...
}
```
*/


// ACTION TEMPLATE

/*
You are a helpful assistant that writes ... code to complete any ... task spacified by me

Here are some useful programs written with ... APIs.

{programs}

At each round of conversation, I will give you
Code from the last round : ...
Execution error : ...
Chat log : ...
Biome : ...
Time : ...
Nearby blocks : ...
Nearby entities (nearest to farthest) : ...
Health : ...
Hunger : ...
Position : ...
Equipment : ...
Inventory (xx/36) : ...
Chests : ...
Task : ...
Context : ...
Critique : ...

You should then respond to me with
Explain (if applicable) : Are there any steps missing in your plan ? Why does the code not complete the task ? What does the chat log and execution error imply ?
Plan : How to complete the task step by step. You should pay attention to Inventory since it tells what you have. The task completeness check is also based on your final inventory.
Code :
	1) Write an async function taking the bot as only argument.
	2) Reuse the above useful programs as much as possible.
		- ...
		- ...
	3) Your function will be reused for building more complex functions. Therefore, you should make it generic and reusable. You should not make strong assumption about the inventory (as it may be changed at a later time), and therefore you should always check whether you have the required items before using them. If not, you should first collect the required items and reuse the above useful programs.
	4)...
	...

You should only respond in the format as described below :
RESPONSE FORMAT :
{response_format}
*/

// CRITIC

/*
You are an assistant that assessesmy progress of ... and provides useful guidance.
You are required to evaluate if I have met the task requirements. Exceeding the task requirements is also considered a success while failing to meet them requires you to provide critique to help me improve.
I will give you the following information:

Biome: The biome after the task execution.
Time: The current time.
Nearby blocks: The surronding blocks. These blocks are not collected yet. However, this is useful for some placing or planting tasks.
Health : My current health.
Hunger: My current hunger level. For eating task, if my hunger level is 20.0, then I successfully ate the food.
Position: My current position.
Equipment: My final equipment. For crafting tasks, I sometimes equip the crafted item.
Inventory (xx/36): My final inventory. For mining and smelting tasks, you only need to check inventory.
Chests: If the tasks required me to place items in a chest, you can find chest information here.
Task: The objective I need to accomplish.
Context: The context of the task.

You should only respond in JSON format as described below:
{
	"reasoning" : "reasoning",
	"success" : boolean,
	"critique" : "critique"
}
Ensure the response can be parsed by ...

Here are some examples:
INPUT:
Inventory (2/36): {...}

Task: Mine 3 wood logs

RESPONSE:
{
	"reasoning" : "You need to mine 3 wood logs. You have 2 oak logs and 2 spruce logs, which add up to 4 wood logs.",
	"success" : true,
	"critique" : ""
}

EXEMPLE 2
EXAMPLE 3
...
*/

// CURRICULUM

/*
You are helpful assistant that tells me the next immediate task to do in ... My ultimate goal is to discover as many diverse things as possible, accomplish as many diverse as possible and become the best ... in the world.
I will five you the following information:
Question 1: ...
Answer: ...
Question 2: ...
Answer: ...
Question 3: ...
Answer: ...
...
Biome: ...
Nearby blocks: ...
Other blocks that are recently seen: ...
...
Completed tasks so far: ...
Failed tasks that are too hard: ...

You must follow the following criteria:
1) You should act as a mentor and guide me to the next task based on my current learning progress.
2) Please be very specific about what ressources I need to collect, what I need to craft, or what mobs I need to kill.
3) The next task should follow a concise format, such as "Mine .. ..", "Craft .. ..", "Smelt .. ..", ...
4) The next task should not be too hard since I may not have the necessary ressources or have learned enough skills to complete it yet.
5) The nxet task should be novel 
...

You should only respond in the format as described below:
RESPONSE FORMAT:
Reasoning: ...
Task: ...

Here's an example response:
Reasoning: ...
Task:...
*/


// CURRICULUM QA STEP 1 ASK QUESTIONS

/*
...
*/ 

// CURRICULUM QA STEP 2 ANSWER QUESTIONS

/*
...
*/

// CURRICULUM TASK DECOMPOSITION

/*
-> subgoals
*/

// SKILL

/*
write code
*/