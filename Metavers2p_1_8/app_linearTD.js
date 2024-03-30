import * as bp from './brainPex.js';

//GO_TO_RENDERER('golpexLinearTD')

const handler = new bp.AppHandler(
	'linearTD',
	'golpexLinearTD'
)

handler.input = new bp.Input(
	handler.element,
	input => {
		multiTask(input);
	},
	'#'
)

handler.input.element.style.position = 'absolute';
handler.input.element.style.bottom = '10px';

const lds = document.getElementById('golpexLinearTD-lds');

// =================================================================================
//									COMMAND PROMPT
// =================================================================================

async function multiTask(input){
	if (input.startsWith('spawn')) {
		const command = input.slice(6);

		for (var i = 0; i < 1; i++) {
			base1.spawnUnit(new THREE.Vector3(-200 + 20 + 1, 2, 0 ), 0xf700ff);
			base2.spawnUnit(new THREE.Vector3(200 - 20 - 1, 2, 0 ), 0xf7ff00);
		}
		
	}

	lds.classList.remove('inactive');
	

	lds.classList.add('inactive');
	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}
//----------------------------------------------------

async function LLM_Command(input){
	let cost = bp.API_Counter.LLM;

	const prompt = 
`### instructions :
When user enters a reference to a specific command, return the contents in the format { "command" : STRING}<END>
Example : je veux passer en mode créatif => {"command" : "GAMEMODE" }<END>;
Write '<END>' after format.
Possibles commands are :
'HELP', 'TELEPORT', 'GAMEMODE', 'CREATE'
### input :
${input}
### response : `;

	let res = await bp.promptIteratorLLM(prompt, 2);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Command : ','Coût = ' + cost);
	console.log(res)

	output = JSON.parse(output.split('#')[0].split('<END>')[0]);

	return output
}

//----------------------------------------------------

let commands = {
	HELP : ()=>{},
	TELEPORT : async function(input){
		const args = await LLM_Teleport(input);
		camera.position.set(args.x, args.y, args.z);
	},
	GAMEMODE : ()=>{},
	CREATE : ()=>{},

}

//----------------------------------------------------

async function LLM_Teleport(input){
	let cost = bp.API_Counter.LLM;

	const prompt = 
`### instructions :
When user enters a reference to the 'teleport' command, return the arguments in the format { "x" : FLOAT, "y" : FLOAT, "z" : FLOAT }<END>
Examples : 'tp moi en 0 50 0' => { "x" : 0, "y" : 50, "z" : 0 }<END>; 'téléportation en 0 0 0' => { "x" : 0, "y" : 0, "z" : 0 }<END>;
Write '<END>' after format.
### input :
${input}
### response : `;
	let res = await bp.promptIteratorLLM(prompt, 3);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Command : ','Coût = ' + cost);
	console.log(res)

	output = JSON.parse(output.split('#')[0].split('<END>')[0]);

	return output
}

// =================================================================================
//										PLAYER
// =================================================================================

class Entity{
	constructor(position, direction, fov){
		this.position = position;
		this.direction = direction;
		this.fov = fov;
	}
}

class Player extends Entity{
	constructor(camera){
		super(
			camera.position,
			new THREE.Vector3(1, 0, 0),
			camera.fov * THREE.MathUtils.DEG2RAD,
		);
		this.camera = camera;
	}

	update(){
		camera.getWorldDirection(this.direction);
		
	}

	setFov(){
		this.fov = this.camera.fov * THREE.MathUtils.DEG2RAD;
		return this.fov
	}
}

function lerp( t, a, b ){
	return a + t*( b - a );
}

function lerp3(pointA, pointB, t) {
  const interpolatedPoint = new THREE.Vector3();
  interpolatedPoint.lerpVectors(pointA, pointB, t);
  return interpolatedPoint;
}

function mapValue(value, a, b, c, d) {
  // Vérifier que la valeur est dans l'intervalle [a, b]
  if (value <= a) return c;
  if (value >= b) return d;

  // Calculer le ratio entre la valeur dans l'intervalle [a, b]
  const ratio = (value - a) / (b - a);

  // Calculer la valeur mappée dans l'intervalle [c, d]
  const mappedValue = c + ratio * (d - c);
  return mappedValue;
}

function smoothstep(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
}

// =================================================================================
//										STRUCTURE
// =================================================================================


class Structure {

	constructor(array){
		this.array = array;
	}

	toString() {
		return `[${this.array.toString()}]`
	}

	id() {
		return this
	}

	copy(struct) {
		this.array = [...struct.array];
		return this
	}

	clone() {
		return new Structure([...this.array])
	}

	classic(operation, struct) {
		// classic(+)[(1, 2, 3), (4, 5, 6)] = (5, 7, 9) 
		this.array = this.array.map( (e,i) => operation(e, struct.array[i]) );
		return this
	}

	slice(start, end) {
		// slice(1,2)[(1, 2, 3, 4)] = (2, 3)
		this.array = this.array.slice( start, end + 1 ); // end inclus !!!
		return this
	}

	apply(operation) {
		// apply(+)[(1, 2, 3)] = 1 + 2 + 3
		let value = this.array[0];
		for( let i = 1; i < this.array.length; i++){
			value = operation( value, this.array[i] );
		}

		return value
	}


	reverse() {
		// reverse[(1, 2, 3)] = (3, 2, 1)
		const temp = [...this.array];
		const N = this.array.length;
		this.array = this.array.map( (e,i) => temp[N-1-i] );
		return this
	}

	func(_function) {
		// func(f)[(1, 2, 3)] = (f(1), f(2), f(3))
		this.array = this.array.map( e => _function(e));
		return this
	}

	get index() {
		// index[(1, 2, 3)] = [0, 1, 2]
		const array = Array.from(this.array.keys());
		return new Int8Array(array);  //opti nécessaire ?
	}

	get length() {
		return this.array.length;
	}


	// méthodes non-élémentaires combinaison de celles ci-dessus

	convType1(innerOperation, outerOperation, struct) {
		//(a0, a1) x (b0, b1) = (a0*b0, a1*b0+a0*b1, a1*b1)
		const N = this.length - 1;
		const f = i => {
			const start = Math.max(0, i-N);
			const end = Math.min(N, i);

			const tempA = this.clone().slice(start, end).reverse();
			
			const tempB = struct.clone().slice(start, end);

			tempA.classic(innerOperation, tempB);

			return tempA.apply(outerOperation)
		}

		const id = Structure.id( 2 * N + 1 );
		this.copy(id.func(f));
		return this
	}

	convType2(innerOperation, outerOperation, struct) {
		//(a0, a1) x (b0, b1) = (a0*b1, a1*b0+a0*b1, a1*b0)
		
		const temp = struct.clone();
		temp.reverse();
		this.convType1(innerOperation, outerOperation, temp);

		return this
	}
}

Structure.join = (...args) => new Structure(args);    // join(a,b) = (a,b)
Structure.id = n => new Structure(Array.from(new Array(n).keys())); // id(3) = (0,1,2)

// =================================================================================
//										POLYNOM
// =================================================================================

class Polynom extends Structure{
	constructor(array) {
		super(array);

	}

	clone() {
		return new Polynom([...this.array])
	}

	at(x) {
		const deg = this.length;
		let id = Structure.id(deg);
		id.func( i => x**i );
		id.classic( (a,b)=>a*b , this);
		const value = id.apply( (a,b)=>a+b );
		return value
	}

	isZero() {
		return this.norm(1) === 0
	}

	isEquivalent(polynom) {
		return true // a modif
	}

	add(polynom) {
		this.classic( (a,b)=>a+b, polynom);
		return this
	}

	multiply(polynom) {
		this.convType1( (a,b)=>a*b, (a,b)=>a+b, polynom);
		return this
	}

	norm(p) {
		const temp = this.clone();
		temp.func( x => Math.abs(x) );

		if (p === Infinity) {
			return Math.max(...temp.array)
		}

		temp.func( x => x**p)
		let value = temp.apply( (a,b) => a+b );
		value = value ** (1/p);
		return value
	}

	derivate() {
		const deg = this.length + 1;
		const id = Structure.id(deg);
		this.classic( (a,b) => a*b, id);
		this.slice(1,deg);
		return this
	}
}

// =================================================================================
//										BASE
// =================================================================================


class Base {
	constructor() {
		this.hp = 100;
		this.level = 1;
		this.gold = 10;
		this.units = new Map();
	}

	setMesh(position, color) {
		const geometry = new THREE.BoxGeometry( 20, 30, 20 );
		geometry.translate( 0.5, 0.5, 0.5 );
		const material = new THREE.MeshPhongMaterial( { color: color, flatShading: true } );
		const mesh = new THREE.Mesh( geometry, material );
		mesh.position.copy(position);
		scene.add(mesh);
		return mesh
	}

	spawnUnit(position, color) {
		const geometry = new THREE.BoxGeometry( 2, 3, 2 );
		geometry.translate( 0.5, 0.5, 0.5 );
		const material = new THREE.MeshPhongMaterial( { color: color, flatShading: true } );
		const mesh = new THREE.Mesh( geometry, material );
		mesh.position.copy(position);
		scene.add(mesh);

		const unit = new Unit(new Polynom([1]), this, position, mesh)
		this.units.set(mesh.uuid, unit)
		return unit
	}

	
}

// =================================================================================
//										UNITS
// =================================================================================

class Unit {
	constructor(polynom, base, position, mesh) {
		this.polynom = polynom;
		this.base = base;
		this.position = position;

		this.mesh = mesh;

		this.hp = 10; // en vie tant que polynom != 0
		this.damage = 2; // polynom.at(1)
		this.attackSpeed = 1; // polynom.norm(1)
		this.range = 1; // polynom.norm(2)
		this.speed = 10; // polynom.norm(infinity)
	}

	isDead() {
		return this.polynom.isZero()
	}

	getDamage() {
		return this.polynom.at(1)
	}

	getAttackSpeed() {
		return 1 // a modif
	}

	getRange() {
		return 1
	}

	getSpeed() {
		return 1
	}

	move(direction) {
		this.position.add(direction.multiplyScalar(this.speed));
		this.mesh.position.copy(this.position);
	}

	kill() {
		scene.remove(this.mesh);
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();

		this.base.units.delete(this.mesh.uuid);
		this.mesh = null;
		return this.units

	}
}

/*

Unit :

1 : lvl 0
1+X : lvl 1
5+X+3X^2 : lvl 2


Upgrades Unit :

+1
+X
+X^2
...

*2
*3
*X
*X^2
...

integrate



Pour créer un début de jeu inspiré de Age of War, voici une proposition de structure et de fonctionnalités que vous pouvez mettre en place :

    Création des bases et des unités :
        Créez des classes ou des objets pour représenter les bases et les unités.
        Chaque base peut avoir des attributs tels que des points de vie, des ressources, un niveau, etc.
        Les unités peuvent avoir des attributs tels que des points de vie, des dégâts, une portée, une vitesse, etc.

    Gestion des ressources :
        Définissez un système de ressources pour les bases.
        Les bases peuvent générer des ressources au fil du temps ou en détruisant des unités ennemies.
        Utilisez ces ressources pour acheter et améliorer des unités ou des défenses.

    Gestion des vagues d'ennemis :
        Définissez une structure de données pour représenter les vagues d'ennemis.
        Programmez un mécanisme pour lancer des vagues d'ennemis à des intervalles réguliers.
        Chaque vague peut avoir des caractéristiques spécifiques telles que le nombre d'unités, leur type, leur force, etc.

    Logique du jeu :
        Mettez en place une boucle de jeu principale qui met à jour l'état du jeu à chaque frame.
        Vérifiez les interactions entre les unités ennemies et les bases, par exemple, les attaques et les dégâts infligés.
        Gérez les actions du joueur, telles que le placement d'unités ou l'amélioration de bases.
        Définissez des conditions de victoire et de défaite, par exemple, la destruction de la base ennemie ou la perte de toutes les bases du joueur.

    Interface utilisateur :
        Créez une interface utilisateur pour afficher les informations importantes du jeu, telles que les points de vie, les ressources, les vagues d'ennemis, etc.
        Ajoutez des boutons ou des interactions pour permettre au joueur de prendre des décisions, par exemple, acheter des unités ou améliorer des bases.

Ces étapes fournissent une base solide pour commencer à programmer un début de jeu Age of War. Vous pouvez les adapter en fonction de vos préférences et de la complexité souhaitée pour votre jeu. N'oubliez pas de gérer les événements de souris ou de clavier pour les interactions du joueur avec le jeu.

Bon développement de votre jeu Age of War !

*/

// =================================================================================
//										MAIN
// =================================================================================

import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';

let camera, controls, scene, renderer;
let player;

const clock = new THREE.Clock();
const center = new THREE.Vector3( 0, 0, 0 );
const pointer = new THREE.Vector2( 0, 0 );// rajouter un addEventListener('click/mouseMove/touch')

const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.1;
raycaster.far = 200;

// --------------------

let base1, base2;

// --------------------

init();
animate();


function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x1f1f1f );
	scene.fog = new THREE.FogExp2( 0x1f1f1f, 0.002 );//0xf4f4f4 si fond blanc // 0xfaa7a7 si fond coloré

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
	RENDERERS_COUNT ++
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.getElementById('golpexLinearTD').appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 0, 50, 100 );

	// controls

	controls = new MapControls(camera, renderer.domElement);

	controls.enableDamping = true;
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = false;

	controls.minDistance = 20;
	controls.maxDistance = 500;

	controls.maxPolarAngle = Math.PI / 2;

	// Mouvement vertical
	controls.enableRotate = true; // remettre false

	// Mouvement horizontal
	controls.enablePan = true;


	// player

	player = new Player(camera);

	// world

	const geometry = new THREE.BoxGeometry( 1, 1, 1 );
	geometry.translate( 0.5, 0.5, 0.5 );
	const material = new THREE.MeshPhongMaterial( { color: 0xff8c00, flatShading: true } );
	
	

	for ( let i = 0; i < 10; i ++ ) {

		const mesh = new THREE.Mesh( geometry, material );
		mesh.position.x = Math.random() * 32 - 16;
		mesh.position.y = 0;
		mesh.position.z = Math.random() * 32 - 16 + 200 ;
		mesh.scale.x = 3;
		mesh.scale.y = Math.random() * 6 + 2;
		mesh.scale.z = 3;

		mesh.updateMatrix();
		mesh.matrixAutoUpdate = false;

		scene.add(mesh);


	}

	// sol
	const geometryfloor = new THREE.BoxGeometry( 400, 1, 100 );
	geometryfloor.translate( 0.5, 0.5, 0.5 );
	const materialGreen = new THREE.MeshPhongMaterial( { color: 0x00ff00, flatShading: true } );
	const meshfloor = new THREE.Mesh( geometryfloor, materialGreen );
	scene.add(meshfloor);

	// mur
	const geometryB = new THREE.BoxGeometry( 400, 20, 1 );
	geometryB.translate( 0.5, 0.5, 0.5 );
	const materialGRAY = new THREE.MeshPhongMaterial( { color: 0xffff00, flatShading: true } );
	const meshB = new THREE.Mesh( geometryB, materialGRAY );
	meshB.position.set( 0, 10, -50);
	scene.add(meshB);

	// base 1

	base1 = new Base();
	base1.setMesh(new THREE.Vector3(-200 + 10, 15, 0), 0xff0000);
	

	// base 2

	base2 = new Base();
	base2.setMesh(new THREE.Vector3( 200 - 10, 15, 0), 0x0000ff)



	// lights

	const dirLight1 = new THREE.DirectionalLight( 0xf4f4f4 );
	dirLight1.position.set( 1, 1, 3 );
	scene.add( dirLight1 );

	const dirLight2 = new THREE.DirectionalLight( 0x1f1f1f );
	dirLight2.position.set( - 1, - 1, - 1 );
	scene.add( dirLight2 );

	const ambientLight = new THREE.AmbientLight( 0x222222 );
	scene.add( ambientLight );

	//

	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function raycastUpdate( camera, scene ){
	raycaster.setFromCamera( pointer, camera );
	const intersections = raycaster.intersectObjects( scene.children );
	return intersections;
}

function animate() {

	requestAnimationFrame( animate );

	if (RENDERERS_RUNNING.get('golpexLinearTD')) render()
}

function render() {


/*
	const angle = clock.getElapsedTime() * 0.04;
	camera.position.set(400*Math.cos(angle), 200, 400*Math.sin(angle));*/
	camera.lookAt(center);

	for (let [uuid, unit] of base1.units) {
		const direction = new THREE.Vector3(0.05, 0, 0);
		unit.move(direction);

		if (unit.position.x > 200) {
			unit.kill()
		}
	}
	for (let [uuid, unit] of base2.units) {
		const direction = new THREE.Vector3(-0.05, 0, 0);
		unit.move(direction);

		if (unit.position.x < -200) {
			unit.kill()
		}
	}

	controls.update();
	player.update();

	renderer.render( scene, camera );
}



















