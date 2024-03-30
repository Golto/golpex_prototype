const apiKey = {
	txt2txt : "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",
	txt2img : "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",
}

const models = {
	//LLM
	bloom : "bigscience/bloom",									// rang 4
	openAssistant : "OpenAssistant/oasst-sft-1-pythia-12b",		// rang 3
	guanaco33b : "timdettmers/guanaco-33b-merged",				// rang 1
	falcon : "tiiuae/falcon-7b-instruct",						// rang 2
	//txt2img
	openJourney : "prompthero/openjourney",
	//ASR (automatic speech recognition)
	whisper : 'openai/whisper-large-v2',
	//TTS (Text To Speech)
	fastSpeech : 'facebook/fastspeech2-en-ljspeech',		// rang 2
	speechBrain : 'speechbrain/tts-tacotron2-ljspeech',		// rang 1 (ne permet pas de longue séquence => Nécessite d'être partitionnée)
};

async function queryLLM(data, modelName, apiKey) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/" + modelName,
		{
			"headers": {
				"Authorization": "Bearer " + apiKey,
				"Content-Type": "application/json"
			},
			"method": "POST",
			"body": JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

async function queryTxt2Img(data, modelName, apiKey) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/",
		{
			headers: { Authorization: "Bearer " + apiKey },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
	return result;
}

const format = {
	SYSTEM : "<|system|>",
	ENDTXT : "<|endoftext|>",
	PROMPT : "<|prompter|>",
	ASSIST : "<|assistant|>",
	PREBEG : "<|prefix_begin|>",
	PREEND : "<|prefix_end|>",
	PADDIN : "<|padding|>",
	INSTRUCT : "### instructions :\n",
	INPUT : "\n### input :\n",
	RESPONSE : "\n### response :\n",
	ENDER : "\nEnd response with ###END",

	build : input => {return "<|" + input + "|>"},
	labelStart : input => {return "<" + input + ">"},
	labelEnd : input => {return "</" + input + ">"},
	labelRegex : label => {return "/<" + label + ">(.*?)<\/" + label + ">/"},
}

let API_Counter = {
	LLM : 0,//Large Language Model
	T2I : 0,//Text to Image
	ASR : 0,//Automatic Speech recognition
}

const currentModels = {
	LLM : models.guanaco33b,
	T2I : models.openJourney,
	ASR : models.whisper,
}

async function promptLLM(input){
	const res = await queryLLM({"inputs": input}, currentModels.LLM, apiKey.txt2txt);
	API_Counter.LLM += 1;
	if (res.error) return [res.error, false]
	return [res[0].generated_text, true]
}

async function promptText2Img(input){
	const res = await queryTxt2Img({"inputs": input}, currentModels.T2I, apiKey.txt2img);
	API_Counter.T2I += 1;
	/*
	const imageUrl = URL.createObjectURL(result);
	const img = document.createElement('img');
	img.src = imageUrl;
	document.body.appendChild(img);
	*/
	return res
}

function outputExtractor(prompt, response){
	const output = response.slice(prompt.length)
	return output
}



async function promptIteratorLLM(prompt, max, isIssueFixed = true){
	let res = prompt;
	let doContinue = true;
	console.log(0,max);
	for (let i = 0; i < max; i++) {


		if(isIssueFixed){
		
			// POUR LE PROBLEME DES MOTS COLLES
			// retirer le dernier mot incomplet (on peut pas savoir si le mot est complet)
			const arrayTemp = res.split(' ');
			const lastTemp = arrayTemp[arrayTemp.length-1];
			
			if (lastTemp != "") {
				// si le dernier mot est un espace, continuer
				const lenTemp = arrayTemp[arrayTemp.length-1].length;
				res = res.slice(0, -lenTemp);
			}
			//
		}

		[res, doContinue] = await promptLLM(res);

		res = res.replaceAll(' \n', ' ');

		console.log(i+1,max);

		let result = res.split('### response :')[1];

		//console.log('res : ',res,'result : ',result)
		console.log(res);
		
		// défaut modèle guanaco33b
		result = result.
			replaceAll('USER:', '<END>').		// détectes pour chatbot : "USER :"
			replaceAll('USER :', '<END>').		// détectes pour chatbot : "USER :"
			replaceAll('# 19', '<END>');		// détectes "# 1999-200..."

		//
		if (result.replaceAll(' ','').includes('<END>')) return res
		if (!doContinue) return res
		
	}
	return res
}

class AppHandler{
	constructor(name, id){
		this.name = name;
		this.id = id;
		this.element = document.getElementById(id);

	}
}

class Input{
	constructor(parentElement, onExec, placeholder = ''){
		this.id = crypto.randomUUID();
		this.parentElement = parentElement;
		this.element = document.createElement('input');

		this.element.setAttribute('type', 'search');
		this.element.setAttribute('id', this.id);
		this.element.setAttribute('placeholder', placeholder);

		this.element.classList.add('search-bar');

		this.parentElement.appendChild(this.element);

		this.handle = e => {
			const input = this.element.value;
			if(e.key === 'Enter'){
				onExec(input);
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


console.warn('import brainPex');
export {queryLLM, queryTxt2Img, format, API_Counter, promptLLM, promptText2Img, promptIteratorLLM,
outputExtractor, AppHandler, Input, Output, currentModels, models, sha256}