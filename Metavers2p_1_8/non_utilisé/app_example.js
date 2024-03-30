import * as bp from './brainPex.js';


const handler = new bp.AppHandler(
	'chatbot',
	'golpexChatbot'
)

handler.output = new bp.Output(
	handler.element,
)

handler.input = new bp.Input(
	handler.element,
	input => {
		//handler.output.printLog(input);
		multiTask(input);
	},
)

//----------------------------------------------------

async function multiTask(input){
	const res = await LLM_Executor(input);
	handler.output.printLog(res)
	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}	

async function LLM_Executor(input){
	let cost = bp.API_Counter.LLM;

	//const prompt = bp.format.PROMPT + input + bp.format.ENDTXT + bp.format.ASSIST;
	const prompt = bp.format.INSTRUCT + input + bp.format.RESPONSE;
	let res = await bp.promptIteratorLLM(prompt, 5);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Executor : ','Coût = ' + cost);
	console.log(res)

	return output.split('#')[0]
}