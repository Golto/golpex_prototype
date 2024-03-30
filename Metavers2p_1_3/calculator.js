
async function query(data) {
	const response = await fetch(
		//"https://api-inference.huggingface.co/models/bigscience/bloom",
		//"https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6b", // moins bon que bloom
		"https://api-inference.huggingface.co/models/bigscience/bloomz",
		//"https://api-inference.huggingface.co/models/bigscience/bloom-7b1", // forbidden => need PRO space
		{
			"headers": {
				"Authorization": "Bearer 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",
				"Content-Type": "application/json"
			},
			"method": "POST",
			"body": JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}


/*
const contexts = {
	type : '3+2i --> complex, 5X^2+X+17 --> polynom, -3 --> integer, 5/7 --> fraction, X^3+1 --> polynom, 1 --> integer, 11 --> integer,',
	complex : '3+2i --> {real:3 imag:2}, 17-2i --> {real:17 imag:-2}, 5+7i --> {real:5 imag:7}, 3i --> {real:0 imag:3}, i --> {real:0 imag:1}, 2i --> {real:0 imag:2}, ',
	polynom : 'Coefficients of polynoms : 3X+1 --> { 1 : 1; X : 3 }, 3X2-X+2 --> { 1 : 2; X : -1; X2 :3 }, -X3+X --> { X : 1; X3 : -1 }, ',
	
	letter : 'a --> artist, b --> baby, c --> castor, ',

	french : ' Le chat mange la souris : sujet --> chat, La maison abrite des gens : verbe --> abriter, ',
	frenchContinuation : 'Le chat --> Le chat mange la souris, La maison --> La maison abrite une personne, ',
	translation : 'The beginning of something great --> Le début de quelque chose de grand, On top of your head --> Au dessus de ta tête, '

}

function prompt(input, contextName, callback){
	const inputQuery = contexts[contextName] + input + ' -->'

	query({"inputs": inputQuery}).then((response) => {
		console.log(response[0].generated_text)

		let res = JSON.stringify(response);
		res = res.split(input + ' --> ')[1].split(',')[0];
		callback(res, input);
	});
}*/


/*
idées de balises de séparations :
 #EQUALS#
 #SEPARATE#

exemple :
	type : '3+2i #EQUALS# complex #SEPARATE# 5X^2+X+3 #EQUALS# polynom #SEPARATE# 17-2i #EQUALS# complex #SEPARATE# 5/7 #EQUALS# fraction '
	
	const inputQuery = contexts[contextName] + input + ' #EQUALS# '

	res = res.split(input + ' #EQUALS# ')[1].split(#SEPARATE#)[0].replaceAll(' ','');
*/



const EQUALS = ' =='
const SEPARATOR = ';; '



const jobType =
'We want to distinguish betwwen Language tasks and Mathematical tasks : ' +
'f(x) = 2 + x' + EQUALS + 'Mathematical' + SEPARATOR +
'This cat is awesome' + EQUALS + 'Language' + SEPARATOR +
'Translate this sentence' + EQUALS + 'Language' + SEPARATOR +
'x+iy in C' + EQUALS + 'Mathematical' + SEPARATOR

const objectType =
'We want to identify the type of Mathematical Objects : ' + 
'a+bi' + EQUALS + 'complex' + SEPARATOR +
'aX^2+bX+c' + EQUALS + 'polynom' + SEPARATOR +
'-2' + EQUALS + 'integer' + SEPARATOR +
'a/b' + EQUALS + 'fraction' + SEPARATOR +
'aX^3+b' + EQUALS + 'polynom' + SEPARATOR +
'1' + EQUALS + 'integer' + SEPARATOR +
'f(x)=2x' + EQUALS + 'function' + SEPARATOR +
'd/dx' + EQUALS + 'derivative' + SEPARATOR +
'x\'=ax' + EQUALS + 'differential equation' + SEPARATOR

const complexValues =
'We want to clearly identify the real part and the imaginary part of a complex number : ' +
'3+2i' + EQUALS + '{real:3 imag:2}' + SEPARATOR +
'17-2i' + EQUALS + '{real:17 imag:-2}' + SEPARATOR +
'5-7i' + EQUALS + '{real:5 imag:-7}' + SEPARATOR +
'-x+yi' + EQUALS + '{real:-x imag:y}' + SEPARATOR +
'-3+i' + EQUALS + '{real:-3 imag:1}' + SEPARATOR +
'a+bi' + EQUALS + '{real:a imag:b}' + SEPARATOR +
'i' + EQUALS + '{real:0 imag:1}' + SEPARATOR +
'-i' + EQUALS + '{real:0 imag:-1}' + SEPARATOR +
'x' + EQUALS + '{real:x imag:0}' + SEPARATOR +
'x+yi' + EQUALS + '{real:x imag:y}' + SEPARATOR

const translations =
'We want to translate english to french : ' +
'The beginning of something great' + EQUALS + 'Le début de quelque chose de grand' + SEPARATOR +
'On top of your head' + EQUALS + 'Au dessus de ta tête' + SEPARATOR


// ------------------------------------------------------------------- //
// Golpex - Brain

const taskRecognition =
'We want to identify the type of task the user want to be done and the material to apply the task : ' +
'translate : The cat is flying in the sky' + EQUALS + ' { task : translation, material : The cat is flying in the sky } ' + SEPARATOR +
'give 3 words starting with A' + EQUALS + ' { task : give 3 words, material : starting with A } ' + SEPARATOR

function taskBuilder(taskRecognitionOutput){
	const temp = taskRecognitionOutput.split('{ task :')[1].split(',');
	const task = temp[0];
	const material = temp[1].split('material : ')[1].split('}')[0];
	return {task, material}
}

const taskPrePrompt =
'We want to have whole sentence from a given task : ' +
'translation' + EQUALS + 'We want to translate english to french : ' + SEPARATOR +
'counting' + EQUALS + 'We want to count from 1 to a certain number : ' + SEPARATOR +
'give synonyms' + EQUALS + 'We want to generate synonyms of a certain word : ' + SEPARATOR

const taskCreator =
'We want to make a list of examples from a given task, EQUALS means we apply the task, SEPARATOR means we pass to an other example : ' +
'translation' + EQUALS + 'a cat is playing EQUALS un chat joue SEPARATOR The great house EQUALS La grande maison SEPARATOR' + SEPARATOR +
'count' + EQUALS + '1 to 5 EQUALS 1 2 3 4 5 SEPARATOR the prime numbers EQUALS 2 3 5 7 11 SEPARATOR' + SEPARATOR +
'give synonyms' + EQUALS + 'happy EQUALS joyful SEPARATOR sad EQUALS mournful SEPARATOR' + SEPARATOR +
'continue the sequence' + EQUALS + '1,2,3,4 EQUALS 1,2,3,4,5,6,7 SEPARATOR 1,2,4,8 EQUALS 1,2,4,8,16,32 SEPARATOR' + SEPARATOR +
'solve' + EQUALS + '2+3 EQUALS 5 SEPARATOR x+4=1 EQUALS x=-3 SEPARATOR' + SEPARATOR +
'write a story' + EQUALS + 'cat, ball EQUALS A cat is playing with a ball SEPARATOR house, ugly EQUALS This house was ugly in 1950\'s' + SEPARATOR

// ------------------------------------------------------------------- //
// Little Alchemy

const craft =
'From a list of elements and materials, give the result element : ' +
'air + water' + EQUALS + 'cloud' + SEPARATOR +
'earth + water' + EQUALS + 'plant' + SEPARATOR +
'earth + fire' + EQUALS + 'lava' + SEPARATOR


const contexts = {
	taskType : jobType,
	mathType : objectType,
	complex : complexValues,
	polynom : '',
	translate : translations,

	// Golpex - Brain
	taskRecognition : taskRecognition,

	taskPrePrompt : taskPrePrompt,
	taskCreator : taskCreator,

	// infinite little alchemy
	craft : craft,

}
//console.log(contexts)

function prompt(input, contextName, callback){
	const inputQuery = contexts[contextName] + input + EQUALS

	query({"inputs": inputQuery}).then((response) => {
		//console.log(response[0].generated_text)

		let res = response[0].generated_text
		res = res.split(input + EQUALS)[1].split(SEPARATOR.replaceAll(' ',''))[0];
		console.log(res)
		callback(res, input);
	});
}


function brutPrompt(inputQuery){
	query({"inputs": inputQuery}).then((response)=>{
		console.log(response[0].generated_text)
	})
}


async function directPrompt(input, context){
	const inputQuery = context + input + EQUALS
	response = await query({"inputs": inputQuery})
	let res = response[0].generated_text
	output = res.split(input + EQUALS)[1].split(SEPARATOR.replaceAll(' ',''))[0];

	return output
}





/*
integer
fraction
real
complex
polynom
number
function
derivative
differential
integral
set
interval
differential equation
matrix
factor ??? (prompt : 3!)

inequality
equation


string
bool
boolean
float
tuple
list

*/





// ------------------------------------
// handle => taskType =>(Mathematical) chooseType =>(complex) printLog
//                    =>(Language) printLog


const inCalculator = document.getElementById('inputCalculator')
const outCalculator = document.getElementById('outputCalculator')

function handle(e){
	let input = inCalculator.value
	outCalculator.innerText = '';

	if(e.key === 'Enter'){
		//prompt(input, 'taskType', taskType)
		//prompt(input, 'taskRecognition', printLog)
		//prompt(input, 'craft', printLog)


		multiTasking(input)
	}
}


async function multiTasking(input){
	const res = await directPrompt(input, contexts['taskRecognition']);
	const request = taskBuilder(res);											console.log(request);

	const prePrompt = await directPrompt(request['task'], contexts['taskPrePrompt']);

	inputContext = prePrompt + ' in the format : A' + EQUALS + ' B : ' + SEPARATOR // + exemples

	const output = await directPrompt(request['material'], inputContext)
	printLog(output,'')

}











function taskType(res, input){
	outCalculator.innerText = res;

	if (res === "Mathematical") {
		prompt(input, 'mathType', chooseType)
	}

	if (res === "Language") {
		prompt(input, 'translate', printLog)
	}
}

function chooseType(res, input){
	outCalculator.innerText += '\n' + res;

	if (res === "complex") {
		prompt(input, 'complex', printLog)
	}

	if (res === "polynom") {
		// mauvais taux de réussite
		//prompt(input, 'polynom', printLog)
	}
}

function printLog(res, input){
	outCalculator.innerText += '\n' + res;
}

/*

function printLog2(res, input){
	outCalculator.innerText += '\n' + res;
	const taskRes = taskBuilder(res);
	console.log(taskRes['task'])
	//prompt(taskRes['task'], 'taskCreator1', printLog)
	prompt(taskRes['task'], 'taskPrePrompt', printLog)
	prompt(taskRes['task'], 'taskCreator', printLog)
}*/