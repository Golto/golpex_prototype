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
	const res = await LLM_Redirect(input);

	promptOutput.innerText = res;

	lds.classList.add('display-none');
}


// ===============================================================================================================================
// ===============================================================================================================================
//													INIT
// ===============================================================================================================================




function init() {
	app = document.getElementById('appPromptChain');
	promptInput = app.querySelectorAll('input')[0];
	promptOutput = app.querySelectorAll('output')[0];
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
		
	ldsObj.attachTo(directionOutput)
	lds = ldsObj.element;
}

RENDERERS_INIT.set('appPromptChain', init);