


/*
const characters = {
	Jarvis : {
		identity : "Name : Jarvis, Likes : Films, History\n",
		job : "Job : Historian\n",
		context : "Context : You have a conversation with Tensa, you don't appreciate Vecto.\n",
		memorySize : 5,
	},
	Tensa : {
		identity : "Name : Tensa, Likes : Books, Animals\n",
		job : "Job : Story writer",
		context : "Context : You have a conversation with Jarvis, you appreciate Vecto.\n",
		memorySize : 10,
	},
	Vecto : {
		identity : "",
		job : "",
		context : "",
		memorySize : 10,
	},
	Polyne : {
		identity : "",
		job : "",
		context : "",
		memorySize : 10,
	},
	Matricia : {
		identity : "",
		job : "",
		context : "",
		memorySize : 10,
	},	
}


async function LLM_Jarvis(input){
	let prompt = characters.Jarvis.identity + characters.Jarvis.job + characters.Jarvis.context;
	prompt += "\nTopic :";
	res = await promptLLM(prompt);
	output = outputExtractor(prompt, res)
	return output
}
*/

/*
Name : Tensa
Likes : Books, Animals
Job : Story writer
Context : You have a conversation with Jarvis, you appreciate Vecto.

Tensa : Hey Jarvis, want to talk ?
Jarvis : No thanks, I'm busy.
Tensa : Oh, okay.
Jarvis : Hey, Tensa.
Tensa : Hey, Jarvis.
Jarvis : What are you doing?
Tensa : I'm writing a story.
Jarvis : Oh, cool.
Tensa : Yeah, it's about a girl who loves animals.
Jarvis : Oh, cool.
Tensa :
Yeah, it's about a girl who loves animals.



Name : Jarvis
Likes : Films, History
Job : Historian
Context : You have a conversation with Tensa, you don't appreciate Vecto.
Tensa : Hey Jarvis, want to talk ?
Jarvis : No thanks, I'm busy.
Tensa : Oh, okay.
Jarvis : Hey, Tensa.
Tensa : Hey, Jarvis.
Jarvis : What are you doing?
Tensa : I'm writing a story.
Jarvis : Oh, cool.
Tensa : Yeah, it's about a girl who loves animals.
Jarvis : Oh, cool.
Tensa :
Yeah, it's about a girl who loves animals.

// Pour éviter les boucles infini de répétitions, rajouter une ligne NAME can't say PREVIOUS_SENTENCE









Name : Jarvis
Likes : Films, History
Job : Historian
Context : You have a conversation with Tensa, you don't appreciate Vecto.
<discussion>Tensa : Hey Jarvis, want to talk ?
Jarvis :
No thanks, I'm busy.   <--------- Faire une fonction d'oubli avec LLM ou simple array.pop
Tensa :
Oh, okay.
Jarvis :
I have a job interview tomorrow.
Tensa :
Good luck.
Jarvis :
Thanks.   <--------- faire un capteur pour savoir si la discussion doit se finir


Name : Tensa
Likes : Books, Animals
Job : Story writer
Context : You have a conversation with Jarvis, you appreciate Vecto.
<discussion>Tensa : Hey Jarvis, want to talk ?
Jarvis :
No thanks, I'm busy.
Tensa :
Oh, okay.
Jarvis :
I have a job interview tomorrow.
Tensa :
Good luck.
Jarvis :
Thanks. 
Tensa :
I have a job interview tomorrow too.











<context start>
Name : Tensa
Likes : Books, Animals
Job : Story writer
Context : You have a conversation with Jarvis, you appreciate Vecto.
<context end>
<discussion start>
Tensa : Hey Jarvis, do you want to talk ?
Jarvis : Yeah why not ?
Tensa :
I like Vecto.
Jarvis :
I don't.
Tensa :
I like him a lot.
Jarvis :
I don't know why.
Tensa :
I think he's very nice.
Jarvis :
I don't know.
Tensa :
I think he's very nice.
Jarvis :
I don't know.


<context start>
Name : Jarvis
Likes : Films, History
Job : Historian
Context : You have a conversation with Tensa, you don't appreciate Vecto.
<context end>
<discussion start>
Tensa : Hey Jarvis, do you want to talk ?
Jarvis : Yeah why not ?
Tensa :
I like Vecto.
Jarvis :
I don't.
Tensa :
I like him a lot.
Jarvis :
I don't know why.
Tensa :
I think he's very nice.
Jarvis :
I don't know.







// urgent need / needy / stable / no need


Mission : Choice between the following tasks (drink, eat, heal, play)
Health : good
Thirst : no need
Hunger : no need
Socialization : needy
Choice : 'play'

// urgent / warning / good

Mission : Choose a task to do, knowing the following state of a human
Health : good
Thirst : urgent
Hunger : good
Socialization : warning
Choice : Thirst

*/
// ====================================================================================================
//										PROMPT

async function promptLLM(input){
	const res = await query({"inputs": input})
	return res[0].generated_text
}

// ====================================================================================================
//										HANDLER

const inputRendererGame = document.getElementById('inputRendererGame');
const outputRendererGame = document.getElementById('outputRendererGame');// pas plus de : '                       ' en terme d'espace
inputRendererGame.addEventListener('keyup', handleGame);

function handleGame(event){
	const value = inputRendererGame.value;

	if(event.key === 'Enter'){
		//citizen,0;0;0,jack,50
		//console.log(Citizen.list)
		//console.log(Building.list)

		const data = value.split(',');
		if (data[0] === 'citizen') {
			const position = new THREE.Vector3(...data[1].split(';').map(e=>Number(e)));
			const name = data[2];
			const age = Number(data[3]);
			new Citizen(position, name, age);
			//printLog(name + ' : ' + age)
		}
		if (data[0] === 'building') {
			const position = new THREE.Vector3(...data[1].split(';').map(e=>Number(e)));
			const scale = new THREE.Vector3(...data[2].split(';').map(e=>Number(e)));
			
			if (!isOccupied( position, scale )) new Building( position, scale );
			
			//printLog('Batiment')
		}
		
		

	}
}

function printLog(text){
	outputRendererGame.innerText = text;
}


// ====================================================================================================
//										THREEJS IMPORTS

import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';

// --------- geometries & materials -------------

const geometries = {
	plane : new THREE.PlaneGeometry( 1, 1 ),
	planeBottom : new THREE.PlaneGeometry( 1, 1 ).translate( 0, 0.5, 0 ),
	box : new THREE.BoxGeometry( 1, 1, 1 ),
	boxBottom : new THREE.BoxGeometry( 1, 1, 1 ).translate( 0.5, 0.5, 0.5 ),
}

const materials = {
	//basic : new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} ),
	orange : new THREE.MeshPhongMaterial( { color: 0xff8c00, flatShading: true } ),
	red : new THREE.MeshPhongMaterial( { color: 0xff0000, flatShading: true } ),
	green : new THREE.MeshPhongMaterial( { color: 0x00ff00, flatShading: true } ),
	blue : new THREE.MeshPhongMaterial( { color: 0x0000ff, flatShading: true } ),
}

// ====================================================================================================
//										Class Building

/*
Mission : Estimate the cost of a building construction and give a small description of the purpose of it.
Building : Road
Estimated cost : $500,000
Goal : To build a road to connect the town.
*/


function isOccupied(position,scale){
	for (let data of Building.list) {
		const building = data[1]
		if (building.intersectsWith( position, scale )) {
			console.warn('Bâtiment non construit car terrain occupé')
			return true
		}
	}
	return false
}

class Building{
	constructor(position, scale){
		this.uuid = crypto.randomUUID();
		this.position = position;
		this.scale = scale;

		this.mesh = new THREE.Mesh( geometries.boxBottom, materials.orange );
		this.mesh.position.copy(this.position);
		this.mesh.scale.copy(this.scale);
		this.mesh.userData['type'] = 'building';
		scene.add(this.mesh);

		Building.list.set(this.uuid, this);
	}

	isInBuilding(point) {
		const buildingBox = new THREE.Box3().setFromObject(this.mesh);
		return buildingBox.containsPoint(point);
	}

	intersectsWith(buildingPosition, buildingScale) {
	    const box1 = new THREE.Box3().setFromObject(this.mesh);
	    const box2 = new THREE.Box3().set(buildingPosition.clone(), buildingPosition.clone().add(buildingScale));
	    return box1.intersectsBox(box2);
	}


}

Building.list = new Map;

// ====================================================================================================
//										Class Citizen


class Citizen{
	constructor(position, name, age){
		this.uuid = crypto.randomUUID();
		this.position = position;
		this.speed = new THREE.Vector3( 0, 0, 0 );
		this.speedCap = 0.01;
		this.name = name;
		this.age = age;

		this.mesh = new THREE.Mesh( geometries.boxBottom, materials.red );
		this.mesh.position.copy(this.position);
		this.mesh.scale.set( 1, 2, 1 );
		this.mesh.userData['type'] = 'citizen';
		scene.add(this.mesh);

		Citizen.list.set(this.uuid, this)
	}

	move(direction){
		this.position.addScaledVector(direction.normalize(), 0.1);
		this.mesh.position.copy(this.position);
	}


}

Citizen.list = new Map;


// ====================================================================================================
//										GAME SETUP

let camera, controls, scene, renderer, raycaster;

const clock = new THREE.Clock();
const center = new THREE.Vector3( 0, 0, 0 );
const pointer = new THREE.Vector2();

let raycastIntersected;

// --------- start -------------

init();
animate();

// ------------------------------- INIT -----------------------------------

function init() {

	// --------- Scene Setup -------------

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x0000ff); //bleu
	scene.fog = new THREE.FogExp2( 0xfaa7a7, 0.002 );//0xf4f4f4 si fond blanc // 0xfaa7a7 si fond coloré

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
	RENDERERS_COUNT ++
	SWITCH_OFF('renderer-game');
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.getElementById('renderer-game').appendChild( renderer.domElement );

	// --------- Camera -------------

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 40, 20, 0 );
	camera.lookAt(center)

	// --------- Controls -------------

	controls = new MapControls( camera, renderer.domElement );

	controls.enableDamping = true;
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = false;

	controls.minDistance = 10;
	controls.maxDistance = 200;

	controls.maxPolarAngle = Math.PI / 2 - 0.1;

	// --------- Raycaster -------------

	raycaster = new THREE.Raycaster();


	// --------- Scenery -------------

	const floor = new THREE.Mesh( geometries.plane, materials.green );
	floor.rotation.x = -Math.PI/2;
	floor.scale.set(1000,1000,1);
	floor.userData['type'] = 'floor'
	scene.add(floor)

	for ( let i = 0; i < 100; i ++ ) {

		const position = new THREE.Vector3( Math.random() * 1000 - 500, 0, Math.random() * 1000 - 500 )
		const scale = new THREE.Vector3( Math.random() * 15 + 5, Math.random() * 10 + 20, Math.random() * 15 + 5 )

		new Building( position, scale )

	}



	const dirLight1 = new THREE.DirectionalLight( 0xf4f4f4 );
	dirLight1.position.set( 1, 1, 3 );
	scene.add( dirLight1 );

	const dirLight2 = new THREE.DirectionalLight( 0x1f1f1f );
	dirLight2.position.set( - 1, - 1, - 1 );
	scene.add( dirLight2 );

	const ambientLight = new THREE.AmbientLight( 0x222222 );
	scene.add( ambientLight );

	// --------- EventsListeners -------------
	window.addEventListener( 'resize', onWindowResize );
	document.addEventListener( 'mousemove', onPointerMove );
}

// ------------------------------- pointer coordinates -----------------------------------

function onPointerMove( event ) {

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

// ------------------------------- auto-resize -----------------------------------

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

// ------------------------------- RENDERING -----------------------------------

function animate() {

	requestAnimationFrame( animate );
	controls.update();

	if (RENDERERS_RUNNING.get('renderer-game')) render();
}

function render() {


	clock.getElapsedTime()

	raycaster.setFromCamera( pointer, camera );
	/*
	const intersects = raycaster.intersectObjects( scene.children, false );
	if (intersects.length > 0) { // ne fonctionne pas bien car chaque classe a le même material => la couleur change pour chaque object avec ce material

		//console.log(intersects[0].object.userData.type)
		//console.log(raycastIntersected,intersects[ 0 ].object)

		if ( raycastIntersected != intersects[ 0 ].object ) {

			if ( raycastIntersected ) raycastIntersected.material.emissive.setHex( raycastIntersected.currentHex );

			raycastIntersected = intersects[ 0 ].object;
			raycastIntersected.currentHex = raycastIntersected.material.emissive.getHex();
			raycastIntersected.material.emissive.setHex( 0x00ff00 );

		}

	} else {

		if ( raycastIntersected ) raycastIntersected.material.emissive.setHex( raycastIntersected.currentHex );

		raycastIntersected = null;

	}*/





	for (let data of Citizen.list) {
		const citizen = data[1];
		citizen.move(new THREE.Vector3( Math.random() -.5 , 0, Math.random() -.5 ))
	}




	renderer.render( scene, camera );
}

// ------------------------------- EXPORT -----------------------------------

export {}