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

  // Speech Recognition
  WHISPER: 'openai/whisper-large-v2',

  // Text-to-Speech
  FASTSPEECH: 'facebook/fastspeech2-en-ljspeech',
  SPEECHBRAIN: 'speechbrain/tts-tacotron2-ljspeech'
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
  T2I: MODELS.OPEN_JOURNEY,
  ASR: MODELS.WHISPER
};

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
  const image = await queryText2Img(
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

function forgetNonFinishedWord(input) {
	const arrayTemp = input.split(' ');
	const lastTemp = arrayTemp[arrayTemp.length-1];
	if (lastTemp != "") {
		// si le dernier mot est un espace, continuer
		const lenTemp = arrayTemp[arrayTemp.length-1].length;
		return input.slice(0, -lenTemp);
	}
	return input
}

function cleanResult(result, cleanList) {
	for (let cleaner of cleanList) {
		result = result.split(cleaner)[0];
	}
	return result
}

async function promptIteratorLLM(prompt, max, isIssueFixed = true, cleanList = [], stopWord = '<END>'){
	let res = prompt;
	let doContinue = true;
	for (let i = 0; i < max; i++) {


		if(isIssueFixed){
			// POUR LE PROBLEME DES MOTS COLLES
			// retirer le dernier mot incomplet (on ne peut pas savoir si le mot est complet)
			res = forgetNonFinishedWord(res);
		}

		[res, doContinue] = await promptLLM(res);

		if (!doContinue) return res

		//res = res.replaceAll(' \n', ' ');

		//let result = res.split('### response :')[1];
		let result = getOutput(prompt, res);

		console.log(i, result)
		if (result.includes(stopWord)) return result.split(stopWord)[0]

		for (let cleaner of cleanList) {
			if (result.includes(cleaner)) {
				// retirer tous les tokens 'cleaner'
				return cleanResult(result, cleanList)
			}
		}

		//
		
		
	}
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
}

// Export
export {
  MODELS, 
  API_KEYS,
  FORMAT,
  API_COUNTER,
  CURRENT_MODELS,
  queryLLM,
  queryText2Img,
  promptLLM,
  promptText2Img,
  promptIteratorLLM,
  AppHandler
};