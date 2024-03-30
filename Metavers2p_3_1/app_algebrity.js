// ===============================================================================================================================
// ===============================================================================================================================
//													IMPORT
// ===============================================================================================================================


import * as bp from './brainPex.js';

let app, promptInput, codeInput, codeOutput, lds;
let __program__;

// ===============================================================================================================================
// ===============================================================================================================================
//													MULTI TASK
// ===============================================================================================================================

async function multiTask(input, e, code){
	lds.classList.remove('display-none');

	__program__.run(code);
	const executed = __program__.exec(input);
	
	console.log(executed)

	codeOutput.innerText = `
${executed.variable} = ${executed.value}

${input} = ${executed.result}

Pour vous documenter sur le code Algebrity, tapez dans le chatbot:
"/doc algebrity" pour avoir des exemples
"/doc structure" pour les différentes instructions par défaut
"/doc operations" pour les différentes opérations par défaut
"/doc functions" pour les différentes fonctions par défaut

Chaque méthode que vous codez peut être à son tour utilisée comme instruction, opération ou fonction.
Les variables locales et globales ne peuvent pas être mélangées.
Il est conseillé d'ouvrir la console si l'icon de chargement s'active, vous avez probablement eu une erreur.
Lorsque vous avez des erreurs, merci de m'envoyer une screenshot de votre erreur et de copier coller votre code Algebrity.
L'erreur est soit de votre syntaxe, soit d'un problème de l'Engine Algebrity.

Bonne programmation =)`;

	lds.classList.add('display-none');
}



// ===============================================================================================================================
// ===============================================================================================================================
//													INIT
// ===============================================================================================================================




function init() {
	app = document.getElementById('appAlgebrity');
	promptInput = app.querySelectorAll('input')[0];
	codeInput = app.querySelectorAll('textarea')[0];
	codeOutput = app.querySelectorAll('output')[0];
	promptInput.onExec = (input, e) => multiTask(input, e, codeInput.value);

	const ldsObj = new Element('lds', {})
		.css({
			position : 'absolute',
			background : 'var(--color-white-semi)',
			borderRadius : '100%',
			bottom : '20%',
			right : '10%',
		})
		.class('lds', 'display-none')
		
	ldsObj.attachTo(codeOutput)
	lds = ldsObj.element;

	__program__ = Program.new('Project', '1', 'USER', 'MIT');


	codeOutput.innerText = `Pour vous documenter sur le code Algebrity, tapez dans le chatbot:
"/doc algebrity" pour avoir des exemples
"/doc structure" pour les différentes instructions par défaut
"/doc operations" pour les différentes opérations par défaut
"/doc functions" pour les différentes fonctions par défaut`;
}

RENDERERS_INIT.set('appAlgebrity', init);



