
function outputExtractor(prompt, response){
	//console.log('prompt :\n', prompt)
	//console.log('response :\n', response)
	const output = response.slice(prompt.length)
	//console.log('output :\n', output,'\n\n')
	return output
}

async function prompt(input, overPrompt){
	const prompt = overPrompt.preprompt + input + overPrompt.postprompt
	const response = await query({"inputs": prompt})
	const res = response[0].generated_text
	const output = outputExtractor(prompt, res)
	return output
}

async function prompt3(input, overPrompt){
	const prompt = overPrompt.preprompt + input + overPrompt.postprompt

	let response = await query({"inputs": prompt})
	response = await query({"inputs": response[0].generated_text})
	response = await query({"inputs": response[0].generated_text})
	const res = response[0].generated_text

	const output = outputExtractor(prompt, res)
	return output
}

const prepromptEnhancer = 'Identify the task and reformulate it by adding more words like "The goal is to ..." : '//'The goal is to enhance prompts by addind more words like "The goal is to ...": '
const prepromptControler = 'Mission : Count from 1 to 6.\nConditions : in reverse order.\n Answer : '

const overPrompt = {
	missionExecutor : {
		preprompt : "Mission : ",
		postprompt : "\nAnwser :",
	},

	missionIdentifier : {
		preprompt : "Mission : Identify the main task of the sentence.\nConditions : answer in english, short answer.\nSentence : ",
		postprompt : "\nTask : ",
	},
	purposeIdentifier : {
		preprompt : "Mission : Identify the goal of the task in the sentence.\nConditions : precised, specific and long answer in english.\nSentence : ",
		postprompt : "\nGoal : ",
	},

	complexNumber : {
		preprompt : "Mission : Identify the real part and the complex part of a complex number.\nConditions : in the format { real : a, imag : b }\nComplex Number : ",
		postprompt : "\nResult : ",
	},
}

//idées :

/*
Mission : Count from 1 to 5.
Conditions : in reverse order.
Answer :
*/

/*
Mission : Indentify the main task of the sentence.
Sentence : Find trees to get apples
Task : Find trees	<-- answer 1
Purpose : Get apples <-- answer 2
*/

// =====================================================================================
//							HANDLER

const inCalculator = document.getElementById('inputCalculator')
const outCalculator = document.getElementById('outputCalculator')

function handle(e){
	let input = inCalculator.value
	outCalculator.innerText = '';

	if(e.key === 'Enter'){
		multitasking(input)
	}
}

// =====================================================================================
//							TASK

async function multitasking(input){
	//const task = await prompt(input, overPrompt.missionIdentifier);
	//const goal = await prompt(input, overPrompt.purposeIdentifier);

	//let answer1 = await prompt(input, overPrompt.missionExecutor);
	let answer2 = await prompt3(input, overPrompt.missionExecutor);


	printLog('' + '\n' + answer2)
}

function printLog(input){
	outCalculator.innerText = input;
}