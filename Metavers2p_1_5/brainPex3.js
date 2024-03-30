

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
	labelRegex : label => {return "/<context>(.*?)<\/context>/"},
}

async function promptLLM(input){
	const res = await query({"inputs": input})
	if (res.error) return(res);
	return res[0].generated_text
}



const inCalculator = document.getElementById('inputCalculator')
const outCalculator = document.getElementById('outputCalculator')

function handle(e){
	let input = inCalculator.value

	if(e.key === 'Enter'){
		multitasking(input)
	}

}
/*
async function multitasking(input){
	let printed = await LLM_taskExecuter(input);

	printCode(printed)
}
*/
// ------------------------

function printLog(input){
	outCalculator.innerText = input;
}

function printCode(input){
	console.log(input)
	const buffer = input.split('```');
	outCalculator.innerText = '';
	
	for (let i = 0; i < buffer.length; i++) {
		//"123```python456```789".match('```python(.*?)```')
		if (i % 2) {
			newElement = document.createElement('p');
			text = buffer[i];
			
			
			if (text.startsWith('python') || text.startsWith('py')) {
				divElem = document.createElement('pre');
				divElem.innerText = 'Python : Mettre les couleurs';
				divElem.style = "color: red";
				newElement.appendChild(divElem);

				preElem = document.createElement('pre');
				preElem.innerText = text.replace('python', '').replace('py', '');
				newElement.appendChild(preElem);
			}
			else if (text.startsWith('c++') || text.startsWith('cpp')) {
				divElem = document.createElement('pre');
				divElem.innerText = 'C++ : Mettre les couleurs';
				divElem.style = "color: red";
				newElement.appendChild(divElem);

				preElem = document.createElement('pre');
				preElem.innerText = text.replace('c++', '').replace('cpp', '');
				newElement.appendChild(preElem);
			}
			else {
				preElem = document.createElement('pre');
				preElem.innerText = text;
				newElement.appendChild(preElem);
			}
			outCalculator.appendChild(newElement);
		}else{
			newElement = document.createElement('p');
			newElement.innerText = buffer[i];
			outCalculator.appendChild(newElement);
		}
	}
}

// -------------------------------------------------------------------------------------------------
//				HIGH LEVEL PROMPT

async function LLM_taskExecuter(input){
	let prompt = "";
	prompt += format.PROMPT + input + format.ENDTXT + format.ASSIST;
	let res = prompt;
	const MAX = 16;
	
	for (let i = 0; i < MAX; i++) {
		res = await promptLLM(res);
		API_Counter.LLM += 1;
		if (res.error) return res.error
		printLog('LLM_taskExecuter : ' + i/MAX*100 + '%')
	}
	printLog('LLM_taskExecuter : 100%')

	let output = outputExtractor(prompt, res);

	return output
}

/*
async function LLM_taskSubdivider(input){
	let prompt = "";
	prompt += format.build('Mission') + "We have a problem that we want to subdivide in smaller tasks" + format.ENDTXT;
	prompt += format.build('Problem') + input + format.ENDTXT;
	prompt += format.build('list');
	let res = prompt + format.build('step-0');
	const MAX = 8;
	
	for (let i = 0; i < MAX; i++) {
		res = await promptLLM(res);
		if (res.error) return res.error
		printLog(i/MAX*100 + '%')
	}

	let output = outputExtractor(prompt, res);
	console.log(output.split( format.build('list') ))

	return output
}*/

async function LLM_taskSubdivider(input){
	let prompt = "";
	prompt += format.SYSTEM + "Give multiples subtasks to accomplish a certain goal" + format.ENDTXT;
	prompt += format.PROMPT + input + format.ENDTXT;
	prompt += format.ASSIST;
	let res = prompt + format.build('next-step');
	const MAX = 8;
	
	for (let i = 0; i < MAX; i++) {
		res = await promptLLM(res);
		API_Counter.LLM += 1;
		if (res.error) return res.error
		printLog('LLM_taskSubdivider : ' + i/MAX*100 + '%')
	}
	printLog('LLM_taskSubdivider : 100%')

	let output = outputExtractor(prompt, res);
	console.log(output.split( format.build('list') ))

	return output
}


/*
Mission : identify a list of mathematical objects in a text
Text : Addition of two vectors u+v gives another vector
List : [u,v,w]															<-- generated here
Mathematical objects : vectors, matrices

Step 1: Identify the mathematical objects in the text

The mathematical objects in the text are vectors and matrices.

Step 2: Extract the relevant information from the text

The relevant information for identifying vectors and matrices is the name of the vector and the size of the vector.

For example, in the text "u+v gives another vector", the relevant information for identifying vectors is "u" and "v".

Step 3: Convert the relevant information to mathematical objects

The relevant information for identifying vectors and matrices is converted to mathematical objects using the dictionary
*/


/*

<1>air + air</1><r1>wind</r1>
<2>earth+water</1><r2>plant</r2>
<3>photo+motion</3><r3>video</r3>
<4>earth+earth</4><r4>rock</r4>
<5>water+air</5><r5>wave</r5>

str = "<context>prompt</context>..."
const regex = /<context>(.*?)<\/context>/
str.match(regex)



<|system|>Denoise text<|endoftext|><|prompter|>Therre i.s a tree&<|endoftext|><|assistant|>...

<|system|>Give multiples subtasks to accomplish a certain goal<|endoftext|><|prompter|>I want to cook a cake<|endoftext|><|assistant|>...


*/

/*

> Qu'est ce qu'un groupe en mathématique ?


LLM 1 :
<1>Comment signifie "ergos"</1><r1>ergos</r1><s1>définition</s1>
<2>Quand est ce que Louis XIV est-il mort ?</2><r2>Louis XIV</r2><s2>mort</s2>
<3>Comment faire des crêpes ?</3><r3>Crêpes</r3><s3>recette</s3>
<4>Qu'est ce qu'un groupe en mathématiques ?</4>...

search wiki :


*/

/*
function search(input){

	//fetch('https://jsonplaceholder.typicode.com/todos/1')

	const url = 'https://fr.wikipedia.org/wiki/' + input;
	
	const headers = new Headers({
		'User-Agent': 'Mozilla/5.0'
	});

	fetch(url, { headers })
		.then(response => response.text())
		.then(data => {
			console.log(data)
			// Analyser la réponse pour extraire les informations pertinentes
		});

}*/

let API_Counter = {
	LLM : 0,
	Wikipedia : 0,
}

let TASK_TYPE = {
	INFORMATION : search,
	IMAGINATION : LLM_taskExecuter,
}

async function multitasking(input) {
	API_Counter = {
		LLM : 0,
		Wikipedia : 0,
	}

	const type = await LLM_InfoOrImagine(input);
	let result = await TASK_TYPE[type](input);

	result = "API_Counter : \n" + "    par LLM : " + API_Counter.LLM + "\n" +
	"    par Wikipedia : " + API_Counter.Wikipedia + "\n" +
	"\n" + "Réponse :\n" + result;
	printCode(result)
}

async function search(input){
	
	const keys = await LLM_keyElementsFinder(input);
	console.log(keys)

	let keysRelatedJson;
	if (!!keys.main && !!keys.related) {
		keysRelatedJson = await searchWikipedia(keys.main + ' ' + keys.related);
	}
	else {
		keysRelatedJson = await searchWikipedia(keys.main);
	}
	const pageResult = keysRelatedJson.query.search[0]
	console.log(pageResult)

	const pageJson = await extractWikipedia(pageResult.title);
	const content = washWiki(pageJson.query.pages[pageResult.pageid].extract)
	console.log(pageJson)

	return(content)
}
















async function LLM_InfoOrImagine(input){
	let prompt = "";
	prompt += format.SYSTEM + "Identify if the task is an Information task or an Imagination task" + format.ENDTXT;
	prompt += format.labelStart('TASK') + "Write a story about a dragon" + format.labelEnd('TASK');
	prompt += format.labelStart('TYPE') + "IMAGINATION" + format.labelEnd('TYPE');
	prompt += format.labelStart('TASK') + "What is a circle ?" + format.labelEnd('TASK');
	prompt += format.labelStart('TYPE') + "INFORMATION" + format.labelEnd('TYPE');
	prompt += format.labelStart('TASK') + "What if the Eiffel Tower nerver built ?" + format.labelEnd('TASK');
	prompt += format.labelStart('TYPE') + "IMAGINATION" + format.labelEnd('TYPE');
	prompt += format.labelStart('TASK') + "Imagine a story about a licorn ?" + format.labelEnd('TASK');
	prompt += format.labelStart('TYPE') + "IMAGINATION" + format.labelEnd('TYPE');
	prompt += format.labelStart('TASK') + "When did Napoleon Bonaparte died ?" + format.labelEnd('TASK');
	prompt += format.labelStart('TYPE') + "INFORMATION" + format.labelEnd('TYPE');
	prompt += format.labelStart('TASK') + "Why did the phone was invented ?" + format.labelEnd('TASK');
	prompt += format.labelStart('TYPE') + "INFORMATION" + format.labelEnd('TYPE');


	let res = prompt + format.labelStart('TASK') + input + format.labelEnd('TASK') + format.labelStart('TYPE');
	const MAX = 1;

	for (let i = 0; i < MAX; i++) {
		res = await promptLLM(res);
		API_Counter.LLM += 1;
		if (res.error) return res.error
		printLog('LLM_InfoOrImagine : ' + i/MAX*100 + '%')
	}
	printLog('LLM_InfoOrImagine : 100%')

	let output = outputExtractor(prompt, res);
	//console.log(output)

	return output.split('TASK')[2].match('<TYPE>(.*?)</TYPE>')[1]
}



async function LLM_keyElementsFinder(input){
	let prompt = "";
	prompt += format.labelStart('input_1') + "Que signifie 'ergos' ?" + format.labelEnd('input_1');
	prompt += format.labelStart('main_1') + "ergos" + format.labelEnd('main_1');
	prompt += format.labelStart('related_1') + "définition" + format.labelEnd('related_1');

	prompt += format.labelStart('input_2') + "Quand est ce que Louis XIV est-il mort ?" + format.labelEnd('input_2');
	prompt += format.labelStart('main_2') + "Louis XIV" + format.labelEnd('main_2');
	prompt += format.labelStart('related_2') + "mort" + format.labelEnd('related_2');

	prompt += format.labelStart('input_3') + "Comment faire des crêpes ?" + format.labelEnd('input_3');
	prompt += format.labelStart('main_3') + "Crêpes" + format.labelEnd('main_3');
	prompt += format.labelStart('related_3') + "recette" + format.labelEnd('related_3');

	prompt += format.labelStart('input_4') + "Qu'est ce qu'un groupe en mathématiques ?" + format.labelEnd('input_4');
	prompt += format.labelStart('main_4') + "Groupe" + format.labelEnd('main_4');
	prompt += format.labelStart('related_4') + "mathématiques" + format.labelEnd('related_4');

	let res = prompt + format.labelStart('input_5') + input + format.labelEnd('input_5') + format.labelStart('main_5');
	//console.log(prompt)
	//console.log(res)
	const MAX = 1;

	for (let i = 0; i < MAX; i++) {
		res = await promptLLM(res);
		API_Counter.LLM += 1;
		if (res.error) return res.error
		printLog('LLM_keyElementsFinder : ' + i/MAX*100 + '%')
	}
	printLog('LLM_keyElementsFinder : 100%')

	let output = outputExtractor(prompt, res);
	//console.log(output)
	const regexMain = /<main_5>(.*?)<\/main_5>/;
	const regexRelated = /<related_5>(.*?)<\/related_5>/;

	let main = output.match(regexMain);
	let related = output.match(regexRelated);
	if (main) main = main[0].split('<main_5>')[1].split('</main_5>')[0];
	if (related) related = related[0].split('<related_5>')[1].split('</related_5>')[0];

	return {'main' : main, 'related' : related}
}

async function LLM_answerer(input){ // à faire
	let prompt = "";
	prompt += format.labelStart('A') + "Que signifie 'ergos' ?" + format.labelEnd('A');

	let res = prompt + format.labelStart('B') + input + format.labelEnd('B') + format.labelStart('C');
	//console.log(prompt)
	//console.log(res)
	const MAX = 3;

	for (let i = 0; i < MAX; i++) {
		res = await promptLLM(res);
		API_Counter.LLM += 1;
		if (res.error) return res.error
		printLog('LLM_answerer : ' + i/MAX*100 + '%')
	}
	printLog('LLM_answerer : 100%')

	let output = outputExtractor(prompt, res);

	//<wikipedia>content</wikipedia>
	//<prompter>En t'appuyant exclusivement sur Wikipedia, + prompt</prompter>
	//<assistant>...

	/*
	<wikipedia>L'histoire du chat rejoint celle de l'homo sapiens autour de 7500 à 7000 av. J.-C., par sa domestication. Utilisé dès lors pour protéger les denrées alimentaires des rongeurs, il ne peut pour autant être dressé. Cette indépendance du chat par rapport aux autres espèces domestiquées engendre un rapport particulier entre l'être humain et le chat, oscillant selon les lieux et les époques entre fascination, vénération et crainte.

Étymologie

Bien que le mâle soit appelé Mau dans la Haute-Égypte, en référence à l'onomatopée de son miaulement, les femelles sont appelées techau, mot que l'on retrouve gravé dans de nombreuses tombes funéraires féminines. C'est à partir de ce terme que découle le nom chaus, qui a depuis persisté et désigne maintenant un chat sauvage d'Égypte et d'Asie Felis chaus.</wikipedia>
<prompter>En ne t'appuyant exclusivement que de Wikipedia : à partir de quand le chat s'est fait domestiquer ?</prompter>
<assistant>Le chat s'est fait domestiquer vers 7500 avant Jésus Christ, c'est à dire vers le même moment que l'homo sapiens s'est développé en Europe et en Asie. C'est à cette époque que les chats ont commencé à être utilisés pour protéger les denrées alimentaires des rongeurs, ce qui a entraîné un nouveau type de relation entre l'être humain et le chat, qui est aujourd'hui encore bien vivante.
	*/

	return output
}

async function searchWikipedia(searchQuery) {
	const endpoint = `https://fr.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`;
	printLog(`searchWikipedia for "${searchQuery}": start`)
	const response = await fetch(endpoint);
	API_Counter.Wikipedia += 1;
	if (!response.ok) {
		throw Error(response.statusText);
	}
	const json = await response.json();
	//console.log(json.query.search)
	//console.log(json.query.search[0].title)
	printLog(`searchWikipedia for "${searchQuery}": done`)
	return json;
}

async function extractWikipedia(title){

	const endpoint = "https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&titles=" + title + "&format=json&origin=*";
	printLog(`extractWikipedia for "${title}": start`)
	const response = await fetch(endpoint);
	API_Counter.Wikipedia += 1;
	if (!response.ok) {
		throw Error(response.statusText);
	}
	const json = await response.json();

	//console.log(json);
	//console.log(json.query.pages[pageid]);
	printLog(`extractWikipedia for "${title}": done`)
	return json
}

async function extractLinksWikipedia(title){

	const endpoint = "https://fr.wikipedia.org/w/api.php?action=query&prop=links&titles=" + title + "&format=json&origin=*";
	printLog(`extractLinksWikipedia for "${title}": start`)
	const response = await fetch(endpoint);
	API_Counter.Wikipedia += 1;
	if (!response.ok) {
		throw Error(response.statusText);
	}
	const json = await response.json();

	console.log(json);
	console.log(json.query.pages);
	printLog(`extractLinksWikipedia for "${title}": done`)
	return json
}

function washWiki(wikiContent){
	function deleteLabelFrom(string,label){
		return string.replaceAll(format.labelStart(label),'').replaceAll(format.labelEnd(label),'')
		
	}
	let str = deleteLabelFrom(wikiContent,'p');
	
	str = deleteLabelFrom(str,'b');
	str = deleteLabelFrom(str,'i');
	str = deleteLabelFrom(str,'span');
	str = deleteLabelFrom(str,'h2');
	str = deleteLabelFrom(str,'h3');
	str = deleteLabelFrom(str,'br');
	str = deleteLabelFrom(str,'ul');
	str = deleteLabelFrom(str,'li');
	str = deleteLabelFrom(str,'abbr');
	str = deleteLabelFrom(str,'small');
	str = deleteLabelFrom(str,'dt');
	/*
	for (var i = 0; i <= 10; i++) {
		if (str.match('<(.*?)>')) {
			str = str.replaceAll(str.match('<(.*?)>')[0],'')
		}
		if (str.match('<!--(.*?)-->')) {
			str = str.replaceAll(str.match('<!--(.*?)-->')[0],'')
		}
	}
	console.log(str)
	*/

	if (str.match('<span id="Note3.A9f.C3.A9rences">') ) {
		str = str.split('<span id="Note3.A9f.C3.A9rences">')[0];
	}
	if (str.match('<span id="Notes_et_r.C3.A9f.C3.A9rences">') ) {
		str = str.split('<span id="Notes_et_r.C3.A9f.C3.A9rences">')[0];
	}
	return str
}
//extractWikipedia('groupe') => isThisPageRelatedTo(topic) ? LLM_resume : extractLink
//extractLinksWikipedia('groupe') => LLM_RelatedTo(topic) = 'Groupe (mathématiques)'
//extractWikipedia('Groupe (mathématiques)') => isThisPageRelatedTo(topic) ? LLM_resume : extractLink

/*
<|system|>Identify the nature of the given task<|endoftext|><|prompter|>task= "What is the definition of a circle ?"<|endoftext|><|assistant|>The task can be seen as a request for information. The user wants to know what the definition of a circle is. The information needed to answer this task could be found in a dictionary, a textbook, or another source.

<|system|>Identify if the task is an Information task or an Imagination task<|endoftext|>
<TASK>Write a story about a dragon</TASK><TYPE>IMAGINATION</TYPE>
<TASK>What it a circle ?</TASK><TYPE>INFORMATION</TYPE>
<TASK>What if the Eiffel Tower was nerver built ?</TASK><TYPE>IMAGINATION</TYPE>






<|prompter|>Given a prompt, choose the best response that correctly answer the prompt.
Prompt : What is Paris ?
Response A : This is the capital city of Spain.
Response B : This is a city of France.
<|assistant|> Correct and best response : Paris is the capital city of France.
*/