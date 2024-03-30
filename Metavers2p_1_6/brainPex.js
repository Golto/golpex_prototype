const apiKey = {
	txt2txt : "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",
	txt2img : "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",
}

const models = {
	//LLM
	bloomz : "bigscience/bloomz",
	openAssistant : "OpenAssistant/oasst-sft-1-pythia-12b",
	guanaco33b : "timdettmers/guanaco-33b-merged",
	guanaco65b : "timdettmers/guanaco-65b-merged",//non test
	falcon : "tiiuae/falcon-7b-instruct",
	//txt2img
	openJourney : "prompthero/openjourney",
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
	INSTRUCT : "### Instructions :\n",
	INPUT : "\n### Input :\n",
	RESPONSE : "\n### Response :\n",
	ENDER : "\nEnd response with ###END",

	build : input => {return "<|" + input + "|>"},
	labelStart : input => {return "<" + input + ">"},
	labelEnd : input => {return "</" + input + ">"},
	labelRegex : label => {return "/<" + label + ">(.*?)<\/" + label + ">/"},
}

let API_Counter = {
	LLM : 0,//Large Language Model
	T2I : 0,//Text to Image
}

async function promptLLM(input){
	const res = await queryLLM({"inputs": input}, models.guanaco33b, apiKey.txt2txt);
	API_Counter.LLM += 1;
	if (res.error) return [res.error, false]
	return [res[0].generated_text, true]
}

async function promptText2Img(input){
	const res = await queryTxt2Img({"inputs": input}, models.openJourney, apiKey.txt2img);
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


class Handler{
	constructor(name, idInput, idOutput, onExec){
		this.name = name;
		this.INPUT = document.getElementById(idInput);
		this.OUTPUT = document.getElementById(idOutput);

		this.handle = e => {
			const input = this.INPUT.value;
			if(e.key === 'Enter'){
				onExec(input);
			}
		};

		this.INPUT.addEventListener('keyup', this.handle);
	}

	printLog(input){
		this.OUTPUT.innerText = input;
	}
}


/*
//step 1

const inputRolePlay = document.getElementById('inputRolePlay')
inputRolePlay.addEventListener('keyup', handle);

const outputRolePlay = document.getElementById('outputRolePlay')
const imageRolePlay = document.getElementById('imageRolePlay')

const previousRolePlay = document.getElementById('previousRolePlay')
const stateRolePlay = document.getElementById('stateRolePlay')

//step 2

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



*/


async function promptIteratorLLM(prompt, max){
	let res = prompt;
	let doContinue = true;
	for (let i = 0; i < max; i++) {
		[res, doContinue] = await promptLLM(res);
		
		// défaut modèle guanaco33b
		const isResEnd = res.split('### Response :')[1].includes('#');
		if (isResEnd) return res
		//
		if (res.split('### Response :')[1].replaceAll(' ','').includes('###END')) return res
		if (!doContinue) return res
		console.log(i,max)
	}
	return res
}

console.warn('import brainPex');
export {queryLLM, queryTxt2Img, format, API_Counter, promptLLM, promptText2Img, promptIteratorLLM, outputExtractor, Handler}