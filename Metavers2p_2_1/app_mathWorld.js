import * as bp from './brainPex.js';

//GO_TO_RENDERER('golpexSandbox')

const container = document.getElementById('golpexMathWorld').getElementsByClassName('container')[0];
const backButton = container.getElementsByClassName('back')[0];

const handler = new bp.AppHandler(
	'mathWorld',
	container
)

handler.input = handler.addInput(
	input => {
		//multiTask(input);
	},
	'Tapez une commande'
)

handler.input.element.style.position = 'relative';
handler.input.element.style.zIndex = 1;

backButton.style.position = 'relative';
backButton.style.zIndex = 1;

const lds = document.getElementById('global-lds');

// =================================================================================
//									COMMAND PROMPT
// =================================================================================


// =================================================================================
//									ELEMENTS
// =================================================================================

const createElement = {

	//fontawesome
	fa : (iconName) => {
		const element = document.createElement('i');
		element.classList.add(`fa-solid`);
		element.classList.add(`fa-${iconName}`);
		return element
	},

	//MathML
	math : (innerElement) => {
		const element = document.createElement('math');
		element.setAttribute('xmlns', "http://www.w3.org/1998/Math/MathML");
		element.appendChild(innerElement);
		return element
	},
	row : (...elements) => {
		const row = document.createElement('mrow');
		for(let element of elements) {
			row.appendChild(element);
		}
		return row
	},
	fraction : (overElement, underElement) => {
		const frac = document.createElement('mfrac');
		frac.appendChild(overElement);
		frac.appendChild(underElement);
		return frac
	},
	sqrt : (innerElement) => {
		const element = document.createElement('msqrt');
		element.appendChild(innerElement);
		return element
	},
	root : () => {
		//
	},
	sub : (element, subElement) => {
		const sub = document.createElement('msub');
		sub.appendChild(element);
		sub.appendChild(subElement);
		return sub
	},
	sup : (element, supElement) => {
		const sup = document.createElement('msup');
		sup.appendChild(element);
		sup.appendChild(supElement);
		return sup
	},
	subsup : (element, subElement, supElement) => {
		const subsup = document.createElement('msubsup');
		subsup.appendChild(element);
		subsup.appendChild(subElement);
		subsup.appendChild(supElement);
		return subsup
	},
	under : (element, underElement) => {
		const under = document.createElement('munder');
		under.appendChild(element);
		under.appendChild(underElement);
		return under
	},
	over : (element, overElement) => {
		const mover = document.createElement('mover');
		mover.appendChild(element);
		mover.appendChild(overElement);
		return mover
	},
	underover : (element, underElement, overElement) => {
		const underover = document.createElement('munderover');
		underover.appendChild(element);
		underover.appendChild(underElement);
		underover.appendChild(overElement);
		return underover
	},
	table : () => {
		//
	},
	tablerow : () => {
		//
	},
	tablecell : () => {
		//
	},
	text : (text) => {
		const element = document.createElement('mtext');
		element.innerText = text;
		return element
	},
	operator : (operator) => {
		const element = document.createElement('mo');
		element.innerText = operator;
		return element
	},
	variable : (variable) => {
		const element = document.createElement('mi');
		element.innerText = variable;
		return element
	},
	number : (number) => {
		const element = document.createElement('mn');
		element.innerText = number;
		return element
	},
	unit : (unit) => {
		const element = document.createElement('ms');
		element.innerText = unit;
		return element
	},
	error : () => {
		//
	},
	
	integral : (a, b, innerElement, variableName) => {
		// intagrel(a,b) inner dx
		const integral = createElement.operator('∫');
		//integral.setAttribute('data-mjx-texclass', "OP");

		const definiteIntegral = createElement.subsup(integral, a, b);
		const intergrand = innerElement;
		const differential = createElement.variable('d');
		const variable = createElement.variable(variableName);

		const element = createElement.row(definiteIntegral, intergrand, differential, variable);
		
		return element
	},

	function : (functionName, ...argsElements) => { // pas fait
		// f(x,y,z...)
		const _function = createElement.variable(functionName);
		//
	},

	parenthesis : (innerElement, isStretchy = true, inSymbol = '(', outSymbol = ')') => {
		// (inner)
		const inElement = createElement.operator(inSymbol);
		inElement.setAttribute('stretchy', isStretchy);
		const outElement = createElement.operator(outSymbol);
		outElement.setAttribute('stretchy', isStretchy);
		const element = createElement.row(inElement, innerElement, outElement);
		return element
	},

	array : (...argsElements) => {
		// [a,b,c,...]

		// [a,b,c] => [a,virgule,b,virgule,c]
		let newArr = [];

		for (let i = 0; i < argsElements.length; i++) {
			newArr.push(argsElements[i]); // Ajouter l'élément original
			if (i !== argsElements.length - 1) {
			newArr.push( createElement.operator(',') ); // Ne pas ajouter 'virgule' après le dernier élément
			}
		}

		const row = createElement.row(...newArr)
		// ---
		
		const vector = createElement.parenthesis(row, true, '[', ']');
		return vector
	}
}

// =================================================================================
//										MAIN
// =================================================================================

import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

let camera, controls, scene, renderer;

const clock = new THREE.Clock();
const center = new THREE.Vector3( 0, 0, 0 );

init();
animate();

function Element( id, x, y, z, ry ) {

	// Faire des objets maths + svg pour chats vs maths + font awesome décor
/*
	const div = document.createElement( 'div' );
	div.style.width = '480px';
	div.style.height = '360px';
	div.style.backgroundColor = '#000';

	const iframe = document.createElement( 'iframe' );
	iframe.style.width = '480px';
	iframe.style.height = '360px';
	iframe.style.border = '0px';
	iframe.src = [ 'https://www.youtube.com/embed/', id, '?rel=0' ].join( '' );
	div.appendChild( iframe );

	const object = new CSS3DObject( div );
	object.position.set( x, y, z );
	object.rotation.y = ry;*/


	const div = document.createElement( 'div' );

	const inner = createElement.variable('t');
	inner.innerHTML = '<msup><mi>t</mi><mn>2<mn></msup>';
	const integral = createElement.integral(createElement.number(0), createElement.variable('x'), inner, 't');
	const math = createElement.math(integral);
	div.appendChild(math)

	div.style.fontSize = '8rem';
	


	const object = new CSS3DObject( div );
	object.position.set( x, y, z );
	object.rotation.y = ry;

	return object;

}


function ElementFA( id, x, y, z, ry ) {


	const div = document.createElement( 'div' );

	const inner = createElement.fa('pencil');
	const inner2 = createElement.fa('tree');
	inner2.style.color = "darkgreen";
	inner2.style.fontSize = '24rem';
	div.appendChild(inner);
	div.appendChild(inner2);

	div.style.fontSize = '8rem';
	


	const object = new CSS3DObject( div );
	object.position.set( x, y, z );
	object.rotation.y = ry;

	return object;

}

function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x1f1f1f );
	scene.fog = new THREE.FogExp2( 0x1f1f1f, 0.002 );//0xf4f4f4 si fond blanc // 0xfaa7a7 si fond coloré

	renderer = new CSS3DRenderer();
	RENDERERS_COUNT ++
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.style.position = 'absolute';
	document.getElementById('golpexMathWorld').appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 4, 2, 2 );

	// controls

	controls = new MapControls( camera, renderer.domElement );

	controls.enableDamping = true;
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = false;

	controls.minDistance = 20;
	controls.maxDistance = 5000;

	controls.maxPolarAngle = Math.PI / 2;


	// world

	const group = new THREE.Group();
	group.add( new Element( 'SJOz3qjfQXU', 0, 0, 240, 0 ) );
	group.add( new Element( 'Y2-xZ-1HE-Q', 240, 0, 0, Math.PI / 2 ) );
	group.add( new Element( 'IrydklNpcFI', 0, 0, - 240, Math.PI ) );
	group.add( new ElementFA( '9ubytEsCaS0', - 240, 0, 0, - Math.PI / 2 ) );
	scene.add( group );

	
	setTimeout(()=>{
		MathJax.typesetPromise();
	}, 5000);

	//

	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	if (RENDERERS_RUNNING.get('golpexMathWorld')) render()
}

function render() {


	controls.update();

	renderer.render( scene, camera );
}