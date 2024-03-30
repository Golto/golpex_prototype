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

/*
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
*/
	// -----------------------------------------------------------------------

	

	send('user', input)

	//const res = await LLM.test(input)
	//const res = await AGENT_THINKING.apply('askQuestions', [input])
	//const res = await AGENT_THINKING.apply('answerQuestion', ['Create a tower defense video game in 2D.', input])
	const res = await AGENT_THINKING.apply('askAnswerQuestions', [input])
	console.log(res)

	let test = '';
	const len = res.questions.length;
	for (let i = 0; i < len; i++) {
		test += `question :\n${res.questions[i]}\nanswer :\n${res.answers[i]}\n\n`
	}




	send('lethis', test)

	

	lds.classList.add('display-none');
	console.log(bp.API_COUNTER)
}


function send(sender, text) {

	const time = 'now';

	//new Memory(sender, time, text);

	new Element('leth-message', { time, sender, text }).attachTo(promptOutput)
}

// ===============================================================================================================================
// ===============================================================================================================================
//													LLM
// ===============================================================================================================================

const LLM = {}

LLM.text2json = async function(input, jsonFormat){
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
		['END #', '\n\n\n\n', '### Assist', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	return JSON.parse(output.replaceAll('\n', ''))
}


LLM.text2text = async function(input, instruction){
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
		['END #', '\n\n\n\n', '### Assist', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	return output
}


LLM.text2bool = async function(input, condition){
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
		['END #', '\n\n\n\n', '### Assist', 'User :', 'USER :', 'BOT : ', 'bot : ', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	return JSON.parse(output.replaceAll('\n', '')).boolean
}


LLM.test = async function(input){
	const STOP_TOKEN = "end of response";
	const MAX_ITERATION = 7;

	const prompt =
`### instructions :
In a conversation with "User", "Lethis" continue the conversation like a tech-enthiousast with a friendly but a familiar ton. Since Lethis is french, he always respond in french with familiarity.
In Lethis's response, some artefacts occur such as hesitations, exclamations and pauses.
Then, write "${STOP_TOKEN}" after Lethis's reply.
### input :
Now, user says : ${input}
### Lethis's response :
Now, Lethis says : `;

	console.log(prompt)

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', '### Assist', 'Now, ', '# Fin de la ré', 'Fin de la répo', 'End of response', 'user :', 'USER :', 'lethis :', 'Lethis :', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);

	console.log(output)

	//console.log(output)

	return output

}



console.log(LLM)

// ===============================================================================================================================
// ===============================================================================================================================
//													AUTONOMOUS AGENTS LIB
// ===============================================================================================================================

class Agent {
	constructor(name, ){
		this.name = name;
		this.methods = new Map();
		Agent.map.set(name, this);
	}

	setMethod(name, method){
		this.methods.set(name, method)
	}

	async apply(method, args){
		return await this.methods.get(method)(...args)
	}
}

Agent.map = new Map();
new Agent('memory');
new Agent('communication');
const AGENT_THINKING = new Agent('thinking');


// ===============================================================================================================================
// ===============================================================================================================================
//													AGENT : Memory
// ===============================================================================================================================



// ===============================================================================================================================
// ===============================================================================================================================
//													AGENT : Thinking
// ===============================================================================================================================

let skills = {};

skills.isAboutMathematics = async function(input){
	const bool = await LLM.text2bool(input, "Le texte parle-il de mathématiques ?")
	return bool
}

skills.translateToEnglish = async function(input){
	const text = await LLM.text2text(input, "Traduis le texte en anglais.")
	return text
}



AGENT_THINKING.setMethod('askQuestions', async function(task){

	const STOP_TOKEN = "end of json";
	const MAX_ITERATION = 4;

	const prompt = `### instructions :
Given a goal or a task given as input, ask a couples of questions (max 5) we ask ourselves to accomplish input. Return as JSON format : { "questions" : LIST of STRING }${STOP_TOKEN}
Then, write "${STOP_TOKEN}" after json format.
### input :
${task}
### response :
{ "questions" : `;

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', '### Assist', 'Now, ', '# Fin de la ré', 'Fin de la répo', 'End of response', 'user :', 'USER :', 'lethis :', 'Lethis :', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);
	output = '{ "questions" : ' + output.replaceAll('\n', '')

	console.log(output)

	return JSON.parse( output )
})


AGENT_THINKING.setMethod('answerQuestion', async function(globalTask, question){

	const STOP_TOKEN = "end of response";
	const MAX_ITERATION = 2;

	const prompt = `### instructions :
Given a global task and a question, answer the question the best way possible. Then, write "${STOP_TOKEN}" after the answer.
### context :
NONE
### global_task :
${globalTask}
### question :
${question}
### response :
`;

	let output = await bp.promptIteratorLLM(
		prompt,
		MAX_ITERATION,
		true,
		['END #', '\n\n\n\n', '### Assist', '# Fin de la ré', 'Fin de la répo', 'End of response', 'user :', 'USER :', 'lethis :', 'Lethis :', '#ars', 'package com', '#this', '#<END', '###', '# 19', 'Tags:', '# END', '# 1.', '### instru', 'END Tags:'],
		STOP_TOKEN
	);
	output = output.replaceAll('\n', ' ')

	console.log(prompt, output)

	return output
})

AGENT_THINKING.setMethod('askAnswerQuestions', async function(task){

	const json = await AGENT_THINKING.apply('askQuestions', [task]);
	const questions = json.questions;
	let answers = [];
	for (let question of questions) {
		answers.push( await AGENT_THINKING.apply('answerQuestion', [task, question]) )
	}
	return {questions, answers}
})


// ===============================================================================================================================
// ===============================================================================================================================
//													INIT
// ===============================================================================================================================


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

	//promptOutput.innerText = Memory.CONVERSATION.map( m => m.toString() ).join('\n');

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
I will give you the following information:
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