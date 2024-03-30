const GolpexElement = document.getElementById('renderer-game');
const RATIO = 47/50;
//réponses partielles
//https://discourse.threejs.org/t/how-to-add-ammo-js-physic-to-gltf-file/27539/9

//https://github.com/Oxynt/AmmoPhysics-extended
//--------------------------------------------
// view-source:https://raw.githack.com/Oxynt/AmmoPhysics-extended/master/js/physics.js
//Remplacer le code ci-dessous qui nécessite qu'il existe le meshes[10] et qu'on puisse le contrôler

/*
	//force controlled mesh
	const mesh = meshes[10];
	const body = meshMap.get(mesh);
			
	//apply force
	body.applyCentralForce(vectForce);
*/
//--------------------------------------------

import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/OrbitControls.js';
import { AmmoPhysics } from 'https://raw.githack.com/Oxynt/AmmoPhysics-extended/master/js/physics.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader().setPath( './models/' );

let camera, scene, renderer;
let physics;

const bodies = [];
const meshes = [];
const keyStates = {};

const force = new THREE.Vector3();
const velocity = new THREE.Vector3();
const angular = new THREE.Vector3();
const contact = new THREE.Vector3();
let lastTime = 0;
//===================================================================================================
//					MATERIALS & GEOMETRIES
const materials = {
	smooth : new THREE.MeshPhongMaterial({
		color: 0x1f3a70
	}),
	flat : new THREE.MeshPhongMaterial({
		color: 0x1f3a70,
		flatShading: true,
		side: THREE.DoubleSide
	}),
}

const geometries = {
	cylinder : new THREE.CylinderGeometry(0.25, 0.25, 0.4, 24),
	box : new THREE.BoxGeometry(0.2, 0.2, 0.2),
	sphere : new THREE.SphereGeometry(0.23, 24, 24),
	cone : new THREE.ConeGeometry(0.3, 0.5, 24),

	trunkTreeSpruce : new THREE.CylinderGeometry(0.25, 0.25, 0.5, 6),
	leavesTreeSpruce : new THREE.ConeGeometry(0.7, 2.3, 6),
}
//===================================================================================================
//					MESH UTILS

//Meshes indexing & setup
//-----------------------------------------------------------------------------------------------
function addMeshToWorld(mesh,mass){
	const i = meshes.length;
	meshes[i] = mesh;
	meshes[i].mass = mass;
	bodies.push(meshes[i])

	//Physics setup
	physicsSetup(i);
}

function addGroupToWorld(mesh,mass,group){
	const i = meshes.length;
	meshes[i] = mesh;
	meshes[i].mass = mass;
	bodies.push(group)

	//Physics setup
	physicsSetup(i);
}

//Meshes creation
//-----------------------------------------------------------------------------------------------
function floorSetup(){
	const scale = 10
	const mesh = new THREE.Mesh(new THREE.PlaneGeometry(scale, scale, 1), new THREE.MeshPhongMaterial({ color: 0xafafaf }));
	mesh.rotation.x = -Math.PI / 2;
	mesh.receiveShadow = true;

	addMeshToWorld(mesh,0);
}

function sphereSetup(){
	const mesh = new THREE.Mesh(geometries.sphere, materials.smooth);
	mesh.position.set(0,10*Math.random(),0);

	addMeshToWorld(mesh,1);
}

function wallSetup(){
	let rot = [0, 90, 180, -90], scale = 10;
	let geometry = new THREE.PlaneGeometry(scale, scale, 1);
	
	for (let j = 0; j < 4; j++) {
		const mesh = new THREE.Mesh(geometry, materials.smooth);
		mesh.rotateY(rot[j] * Math.PI / 180);
		mesh.translateZ(-1 * scale / 2);
		mesh.visible = true;

		addMeshToWorld(mesh,0)
	}
}

function tempPlayerSetup(){										// à suppr une fois AmmoPhysics-Extended modifié (cf plus haut)
	const mesh = new THREE.Mesh(geometries.sphere, materials.smooth);
	mesh.position.set(0,-100,0);
	mesh.visible = false;
	addMeshToWorld(mesh,0);
}

function tempTreeSetup(){
	loader.load( './tree2.glb', function ( gltf ) {

		const model = gltf.scene.children[2];
		model.name = 'tree2'
		const position = new THREE.Vector3( 0, 5 + 0*10 * Math.random(), 0 );
		model.scale.set( 0.5, 0.5, 0.5 );

		const group = new THREE.Group();
		const tronc = new THREE.Mesh(geometries.trunkTreeSpruce);
		tronc.position.set(0,-0.7,0);
		const feuilles = new THREE.Mesh(geometries.leavesTreeSpruce);
		feuilles.position.set(0,0.5,0);
		group.add(tronc);
		group.add(feuilles);
		//scene.add(group)

		model.position.copy(position);
		group.position.copy(position);

		addGroupToWorld(model,1,group);

	}, undefined, function ( e ) {

		console.error( e );

	} );
	
}

function tempgroup(){
	const group = new THREE.Group();
	group.position.set(0,10,0);

	const tronc = new THREE.Mesh(geometries.trunkTreeSpruce);
	tronc.position.set(0,-0.7,0);
	const feuilles = new THREE.Mesh(geometries.leavesTreeSpruce);
	feuilles.position.set(0,0.5,0);
	group.add(tronc);
	group.add(feuilles);
	addGroupToWorld(group,1,group);
}
//===================================================================================================
//					INIT

init();

async function init() {

	physics = await AmmoPhysics();
	//Scene
	//-----------------------------------------------------------------------------------------------
	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 50);
	camera.position.set(0, 3, -3);
	camera.lookAt(0, 0.5, 0);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x5e5e5e);

	let light = new THREE.HemisphereLight();
	light.intensity = 0.35;
	scene.add(light);

	light = new THREE.DirectionalLight();
	light.position.set(5, 5, 5);
	light.castShadow = true;
	light.shadow.camera.zoom = 2;
	scene.add(light);
	//meshes & bodies
	//-----------------------------------------------------------------------------------------------

	floorSetup()

	wallSetup()

	sphereSetup()
	sphereSetup()
	sphereSetup()
	sphereSetup()
	sphereSetup()
	tempPlayerSetup()

 	tempTreeSetup()
 	tempTreeSetup()
 	tempTreeSetup()




	
	//Physics setup
	//-----------------------------------------------------------------------------------------------
	/*for (let i in meshes) {
	
		//save index
		meshes[i].index = i;
	
		//shadows
		meshes[i].traverse(function(child) {
			console.log(meshes[i])
			if (meshes[i].visible == true && child.isMesh) {
				child.castShadow = true;
			}
		});
		
		physics.addMesh(meshes[i], bodies[i], meshes[i].mass);
		
		//instance positions
		if (meshes[i].isInstancedMesh) {
			for (let j = 0; j < meshes[i].count; j++) {
				physics.setMeshPosition(meshes[i], meshes[i].userData.pos[j], meshes[i].quaternion, j);
			}
		//meshes positions
		} else {
			physics.setMeshPosition(meshes[i], meshes[i].position, meshes[i].quaternion, 0);
		}
		
		if (meshes[i].visible == true) {
			scene.add(meshes[i]);
		}
	}*/

	//keyboard
	//-----------------------------------------------------------------------------------------------
	/*
	document.addEventListener( 'keydown', ( event ) => {
		keyStates[ event.code ] = true;
	});

	document.addEventListener( 'keyup', ( event ) => {
		keyStates[ event.code ] = false;
		physics.setForce(force.set(0,0,0))
	});*/

	//init Renderer
	//-----------------------------------------------------------------------------------------------
	
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth * RATIO, window.innerHeight * RATIO);
	renderer.shadowMap.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;
	GolpexElement.appendChild(renderer.domElement);

	const controls = new MapControls(camera, renderer.domElement);
	controls.target.y = 0.5;
	controls.update();
	animate();


}
//===================================================================================================
//					PHYSICS SETUP FUNCTION

function physicsSetup(i){
	//save index
	meshes[i].index = i;

	//shadows
	meshes[i].traverse(function(child) {
		if (meshes[i].visible == true && child.isMesh) {
			child.castShadow = true;
		}
	});

	physics.addMesh(meshes[i], bodies[i], meshes[i].mass);

	//instance positions
	if (meshes[i].isInstancedMesh) {
		for (let j = 0; j < meshes[i].count; j++) {
			physics.setMeshPosition(meshes[i], meshes[i].userData.pos[j], meshes[i].quaternion, j);
		}
	//meshes positions
	} else {
		physics.setMeshPosition(meshes[i], meshes[i].position, meshes[i].quaternion, 0);
	}
		
	if (meshes[i].visible == true) {
		scene.add(meshes[i]);
	}
}

//===================================================================================================
//					RENDER AND CONTROLS

//keyboard controls
//-----------------------------------------------------------------------------------------------
/*	
function controls() {
	if ( keyStates[ 'KeyW' ] ) {physics.setForce(force.set(0,0,100))}
	if ( keyStates[ 'KeyS' ] ) {physics.setForce(force.set(0,0,-100))}
	if ( keyStates[ 'KeyA' ] ) {physics.setForce(force.set(100,0,0))}
	if ( keyStates[ 'KeyD' ] ) {physics.setForce(force.set(-100,0,0))}
}*/


//render
//-----------------------------------------------------------------------------------------------
	
function animate() {

	requestAnimationFrame(animate);
	
	renderer.render(scene, camera);

	//verticesNeedUpdate = true //fonctionne pas
	
	//controls();
	
		
	const now = performance.now();
	let timesince = now - lastTime;
	
	//velocity and angular rotation change every 5 seconds
	
	if (timesince > 5000) {
	
		for (let i = 0; i < meshes.length-1; i++) {
			velocity.set(Math.random() * 2 - 1, 3.5, Math.random() * 2 - 1);
			angular.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
			if (meshes[i].isInstancedMesh) {
				for (let j = 0; j < meshes[i].count; j++) {
					physics.setMeshVelocity(meshes[i], velocity, angular, j);
				}
			} else {
				physics.setMeshVelocity(meshes[i], velocity, angular, i);
			}
		}
	}

	if (timesince > 5200) {
		lastTime = performance.now();
	}
}