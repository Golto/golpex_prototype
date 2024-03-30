const GolpexElement = document.getElementById('renderer-physics');
const RATIO = 47/50;

//https://github.com/Oxynt/AmmoPhysics-extended

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AmmoPhysics } from 'https://raw.githack.com/Oxynt/AmmoPhysics-extended/master/js/physics.js'
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';
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

init();

async function init() {
	//Scene
	//-----------------------------------------------------------------------------------------------
	physics = await AmmoPhysics();
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
	
	//Meshes and bodies
	//-----------------------------------------------------------------------------------------------
	const smooth = new THREE.MeshPhongMaterial({
		color: 0x1f3a70
	});
	const flat = new THREE.MeshPhongMaterial({
		color: 0x1f3a70,
		flatShading: true,
		side: THREE.DoubleSide
	});
	//0-3 Invisibles walls
	let rot = [0, 90, 180, -90], scale = 3;
	let geometry = new THREE.PlaneGeometry(scale, scale, 1);
	
	for (let j = 0; j < 4; j++) {
		meshes[j]=new THREE.Mesh(geometry);
		meshes[j].rotateY(rot[j] * Math.PI / 180);
		meshes[j].translateZ(-1 * scale / 2);
		meshes[j].visible = false;
		meshes[j].mass = 0;
		bodies.push(meshes[j]);
	}
	
	let i = 3; //index count

	//4 floor
	i++
	meshes[i] = new THREE.Mesh(new THREE.PlaneGeometry(scale, scale, 1), new THREE.MeshPhongMaterial({ color: 0xafafaf }));
	meshes[i].rotation.x = -Math.PI / 2;
	meshes[i].receiveShadow = true;
	meshes[i].mass = 0;
	bodies.push(meshes[i]);
	
	//5 Teapot using a Compound Shape body
	
	i++
	meshes[i] = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), smooth);
	meshes[i].position.set(-1, 0.5, 1);
	meshes[i].scale.set(0.04, 0.04, 0.04);
	meshes[i].mass = 2;
	bodies.push(new THREE.Group());
	const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.4, 24));
	const handle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.03));

	bodies[i].add(tank);
	bodies[i].add(handle);
	
	//6 Sphere
	i++	
	meshes[i] = new THREE.Mesh(new THREE.SphereGeometry(0.23, 24, 24), smooth);
	meshes[i].position.set(1, 0.5, 1);
	meshes[i].mass = 2;
	bodies.push(meshes[i]);
	
	//7 Cylinder
	i++
	meshes[i] = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 24), smooth);
	meshes[i].position.set(0, 0.5, 0);
	meshes[i].mass = 2;
	bodies.push(meshes[i]);
	
	//8 Cone
	i++
	meshes[i] = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 24), smooth);
	meshes[i].position.set(1, 0.5, -1);
	meshes[i].mass = 2;
	bodies.push(meshes[i]);
	
	//9 Instanced boxes
	i++
	meshes[i] = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), flat, 10);
	meshes[i].mass = 2;
	meshes[i].userData.pos = [];
	for (let j = 0; j < meshes[i].count; j++) {
		meshes[i].userData.pos[j] = new THREE.Vector3();
		meshes[i].userData.pos[j].set(1, 0.5, 0);
	}
	bodies.push(meshes[i]);
	
	//10 Convex hull shape (controled by central force)
	i++
	meshes[i] = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.3, 5), new THREE.MeshPhongMaterial({ color: 0xff0000, flatShading: true }));
	meshes[i].geometry.name = 'hull';
	meshes[i].position.set(0, 0.5, -1);
	meshes[i].mass = 10;
	bodies.push(meshes[i]);
	
	//Physics setup
	//-----------------------------------------------------------------------------------------------
	for (let i in meshes) {
	
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
	
	
	//keyboard
	//-----------------------------------------------------------------------------------------------
	
	document.addEventListener( 'keydown', ( event ) => {
		keyStates[ event.code ] = true;
	});

	document.addEventListener( 'keyup', ( event ) => {
		keyStates[ event.code ] = false;
		physics.setForce(force.set(0,0,0))
	});
	
	
	//init Renderer
	//-----------------------------------------------------------------------------------------------
	
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth * RATIO, window.innerHeight * RATIO);
	renderer.shadowMap.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;
	GolpexElement.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.y = 0.5;
	controls.update();
	animate();
}
	//keyboard controls
	//-----------------------------------------------------------------------------------------------
	
	function controls() {
		if ( keyStates[ 'KeyW' ] ) {physics.setForce(force.set(0,0,100))}
		if ( keyStates[ 'KeyS' ] ) {physics.setForce(force.set(0,0,-100))}
		if ( keyStates[ 'KeyA' ] ) {physics.setForce(force.set(100,0,0))}
		if ( keyStates[ 'KeyD' ] ) {physics.setForce(force.set(-100,0,0))}
	}
	
	//render
	//-----------------------------------------------------------------------------------------------
	
	function animate() {

		requestAnimationFrame(animate);
		
		renderer.render(scene, camera);
	
		controls();
		
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