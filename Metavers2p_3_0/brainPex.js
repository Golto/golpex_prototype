// Models
const MODELS = {
	// LLM Models
	BLOOM: 'bigscience/bloom',
	BLOOM_3B: 'bigscience/bloomz-3b',
	OPEN_ASSISTANT: 'OpenAssistant/oasst-sft-1-pythia-12b', 
	OPEN_ASSISTANT_4: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
	GUANACO_33B: 'timdettmers/guanaco-33b-merged',
	FALCON: 'tiiuae/falcon-7b-instruct',
	ORCA: 'Open-Orca/OpenOrca-Preview1-13B',
	
	// Text-to-Image
	OPEN_JOURNEY: 'prompthero/openjourney',
	OPEN_JOURNEY_V4 : 'prompthero/openjourney-v4',
	SD_COMPRESSED : 'nota-ai/bk-sdm-small',
	SDXL1_0 : 'stabilityai/stable-diffusion-xl-base-1.0',
	SD1_5 : 'runwayml/stable-diffusion-v1-5',
	SD2_1 : 'stabilityai/stable-diffusion-2-1',

	// Speech Recognition
	WHISPER: 'openai/whisper-large-v2',

	// Text-to-Speech
	FASTSPEECH: 'facebook/fastspeech2-en-ljspeech',
	SPEECHBRAIN: 'speechbrain/tts-tacotron2-ljspeech',
	BARK: 'suno/bark-small',
};

// API Keys
const API_KEYS = {
	TXT2TXT: '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',
	TXT2IMG: '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'
};

// Formatting
const FORMAT = {
	SYSTEM: '<|system|>',
	END_OF_TEXT: '<|endoftext|>',
	PROMPTER: '<|prompter|>',
	ASSISTANT: '<|assistant|>',
	PREFIX_BEGIN: '<|prefix_begin|>',
	PREFIX_END: '<|prefix_end|>',
	PADDING: '<|padding|>',
	INSTRUCTIONS: '### instructions :\n',
	INPUT: '\n### input :\n',
	RESPONSE: '\n### response :\n',
	END: '\nEnd response with ###END',

	build: input => `<|${input}|>`,
	labelStart: input => `<${input}>`,
	labelEnd: input => `</${input}>`,
	labelRegex: label => `/<${label}>(.*?)</<\/${label}>/`  
};

// API Counters
const API_COUNTER = {
	LLM: 0,
	T2I: 0,
	ASR: 0
};

// Current Models
const CURRENT_MODELS = {
	LLM: MODELS.GUANACO_33B,
	T2I: MODELS.OPEN_JOURNEY_V4,
	ASR: MODELS.WHISPER
};

let LOAD_ELEMENT = { progress : '0%', generated_text : '', element : null};

// API Functions
async function queryLLM(data, modelName, apiKey) {
	// Call API

	const url = `https://api-inference.huggingface.co/models/${modelName}`;
	const request = {
			"headers": {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			"method": "POST",
			"body": JSON.stringify(data),
		};
	const response = await fetch(url, request);
	const result = await response.json();
	return result
}

async function queryText2Img(data, modelName, apiKey) {
	// Call API
	const url = `https://api-inference.huggingface.co/models/${modelName}`;
	const request = {
			"headers": {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			"method": "POST",
			"body": JSON.stringify(data),
		};
	const response = await fetch(url, request);

	const result = await response.blob();
	return result;
}

async function queryText2Speech(data, modelName, apiKey) {
	// Call API
	const url = `https://api-inference.huggingface.co/models/${modelName}`;
	const request = {
			"headers": {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			"method": "POST",
			"body": JSON.stringify(data),
		};
	const result = await fetch(url, request);
	return result;
}

// Prompting Functions
async function promptLLM(input) {
	const res = await queryLLM(
		{ inputs: input }, 
		CURRENT_MODELS.LLM, 
		API_KEYS.TXT2TXT
	);
	
	API_COUNTER.LLM++;

	if (res[0].error) return [res[0].error, false]
	
	return [res[0].generated_text, true];
}

async function promptText2Img(input) {
	const res = await queryText2Img(
		{ inputs: input },
		CURRENT_MODELS.T2I,
		API_KEYS.TXT2IMG
	);
	
	API_COUNTER.T2I++;
	
	const imageUrl = URL.createObjectURL(res);
	const img = document.createElement('img');
	img.src = imageUrl;

	return img;
}

// tool-functions
function getOutput(prompt, response){
	const output = response.slice(prompt.length)
	return output
}

function multiSplit(text, separators) {
	// Escape special characters in the separators and join them with the OR operator '|'
	const regex = new RegExp(separators.join('|'), 'g');
	const result = text.split(regex);
	return result;
} 


function forgetNonFinishedWord(input) {
	//const arrayTemp = input.split([' ', '\n', '\t']);
	const arrayTemp = multiSplit(input, [' ', '\n', '\t']);
	const lastTemp = arrayTemp[arrayTemp.length-1];
	/*
	if (lastTemp != "") { // rajouter ['{([etc...']
		// si le dernier mot est un espace, continuer
		const lenTemp = arrayTemp[arrayTemp.length-1].length;
		return input.slice(0, -lenTemp);
	}
	return input
	*/

	const nonForgetableTokens = ['', ' ', '{', '}', '(', ')', '[', ']', '{[', ']}', '{(', ')}', '){', '[{', '}]',
'{\n', '}\n', '(\n', ')\n', '[\n', ']\n',
'/', '*', '-', '+', '.', ',', ';', ':', '!', '?', '=', '<', '>', '<=', '>='];

	if (nonForgetableTokens.includes(lastTemp)) {
		return input
	}
	const lenTemp = arrayTemp[arrayTemp.length-1].length;
	return input.slice(0, -lenTemp);
}

function cleanResult(result, cleanList) {
	for (let cleaner of cleanList) {
		result = result.split(cleaner)[0];
	}
	return result
}

function loadingCalc(iteration, max, precision = 1) {
	const percentage = iteration / max * 100;
	return Math.floor(percentage * precision) / precision
}

async function promptIteratorLLM(prompt, max, isIssueFixed = true, cleanList = [], stopWord = '<END>'){
	let res = prompt;
	let doContinue = true;
	for (let i = 0; i < max; i++) { 

	//console.log(i, getOutput(prompt, res))

		if(isIssueFixed){
			// POUR LE PROBLEME DES MOTS COLLES
			// retirer le dernier mot incomplet (on ne peut pas savoir si le mot est complet)
			res = forgetNonFinishedWord(res);
		}

	//console.log(i, getOutput(prompt, res));

		[res, doContinue] = await promptLLM(res);

		// retirer les sauts à la ligne trop récurrents
		/*
		res = res.replaceAll('\n\n','<TEMP:1c69#*ù9d5>');
		res = res.replaceAll('\n',' ');
		res = res.replaceAll('<TEMP:1c69#*ù9d5>','\n');
		*/
		//

		if (!doContinue) return res


		let result = getOutput(prompt, res);

	//console.log(i, result)

		if (result.includes(stopWord)) return result.split(stopWord)[0]

		for (let cleaner of cleanList) {
			if (result.includes(cleaner)) {
				// retirer tous les tokens 'cleaner'
				return cleanResult(result, cleanList)
			}
		}

		//
		
		console.log(`${loadingCalc(i, max, 100)}%`);

		
		if (LOAD_ELEMENT.element) {
			LOAD_ELEMENT.progress = `${loadingCalc(i, max, 100)}%`;
			LOAD_ELEMENT.generated_text = result;
			LOAD_ELEMENT.element.innerText = `Loaded : ${LOAD_ELEMENT.progress}\nGenerated text :\n${LOAD_ELEMENT.generated_text}`;
		}
		
	}
	console.log(`${loadingCalc(max, max, 100)}%`);

	return getOutput(prompt, res)
}


// UI Classes
class AppHandler {
	constructor(name, element) {
		this.name = name;
		this.element = element;
		this.children = new Map();
	}

	addInput(onExec, placeholder = '', isResettingAfter = false) {
		const input = new Input(this.element, onExec, placeholder, isResettingAfter);
		this.children.set(input.id, input);
		return input
	}

	addOutput() {
		const output = new Output(this.element);
		this.children.set(output.id, output);
		return output
	}
}

class Input{
	constructor(parentElement, onExec, placeholder = '', isResettingAfter = false){
		this.id = crypto.randomUUID();
		this.parentElement = parentElement;
		this.element = document.createElement('input');

		this.element.setAttribute('type', 'text');
		this.element.setAttribute('id', this.id);
		this.element.setAttribute('placeholder', placeholder);

		this.element.classList.add('prompt');

		this.parentElement.appendChild(this.element);

		this.handle = e => {
			const input = this.element.value;
			if(e.key === 'Enter'){
				onExec(input);
				if (isResettingAfter) { this.element.value = '';}
			}
		};
		this.element.addEventListener('keyup', this.handle);
	}
}

class Output{
	constructor(parentElement){
		this.id = crypto.randomUUID();
		this.parentElement = parentElement;
		this.element = document.createElement('div');

		this.element.setAttribute('id', this.id);

		this.element.classList.add('output');

		this.parentElement.appendChild(this.element);
	}

	printLog(input){
		this.element.innerText = input;
	}

	printLogAdd(input){
		this.element.innerText += `\n${input}`;
	}
}

// Export
export {
	MODELS, 
	API_KEYS,
	FORMAT,
	API_COUNTER,
	CURRENT_MODELS,
	LOAD_ELEMENT,
	queryLLM,
	queryText2Img,
	promptLLM,
	promptText2Img,
	promptIteratorLLM,
	AppHandler
};