import * as THREE from 'three';

const GolpexElement = document.getElementById('renderer-physics');
const RATIO = 3/5;

let physicsWorld;
let rigidBody_List = new Array();
let tmpTransformation;

let collisionConfiguration
let dispatcher
let overlappingPairCache
let solver

let scene;
let camera;
let renderer;
let clock;

// ------ Ammo.js Init ------
//https://threejs-university.com/2021/08/17/comprendre-et-utiliser-la-physique-dans-three-js-avec-ammo-js/


Ammo().then( AmmoStart );

function AmmoStart(){

	tmpTransformation = new Ammo.btTransform();

	initPhysicsUniverse();
	initGraphicsUniverse();
	

	// base
    createCube(40 , new THREE.Vector3(10, -30, 10) , 0 );
    
    // falling cubes
    createCube(4 , new THREE.Vector3(0, 10, 0) , 1, null );
    createCube(2 , new THREE.Vector3(10, 30, 0) , 1, null );
    createCube(4 , new THREE.Vector3(10, 20, 10) , 1, null );
    createCube(6 , new THREE.Vector3(5, 40, 20) , 1, null );
    createCube(8 , new THREE.Vector3(25, 100, 5) , 1, null );
    createCube(8 , new THREE.Vector3(20, 60, 25) , 1, null );
    createCube(4 , new THREE.Vector3(20, 100, 25) , 1, null );
    createCube(2 , new THREE.Vector3(20, 200, 25) , 1, null );


	render();
}



function initPhysicsUniverse(){

	collisionConfiguration	= new Ammo.btDefaultCollisionConfiguration();
	dispatcher				= new Ammo.btCollisionDispatcher(collisionConfiguration);
	overlappingPairCache	= new Ammo.btDbvtBroadphase();
	solver					= new Ammo.btSequentialImpulseConstraintSolver();
	physicsWorld			= new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
	physicsWorld.setGravity(new Ammo.btVector3(0, -75, 0));
}

function initGraphicsUniverse(){

	clock = new THREE.Clock();
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( -25, 20, -25 );
	camera.lookAt(new THREE.Vector3(0, 6, 0));

	//renderer
	renderer = new THREE.WebGLRenderer({antialias : true, alpha : true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth * RATIO, window.innerHeight * RATIO);
	GolpexElement.appendChild(renderer.domElement) ;

	//light
	var ambientLight = new THREE.AmbientLight(0xcccccc, 0.2);
	scene.add(ambientLight);
	var directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
	directionalLight.position.set(-1, 0.9, 0.4);
	scene.add(directionalLight);


}


function createCube(scale , position, mass, rot_quaternion){
		
	let quaternion = undefined;
	if(rot_quaternion == null)
	{
		quaternion = {x: 0, y: 0, z: 0, w:  1};
	}
	else
	{
	  quaternion = rot_quaternion;
	}
	// ------ Graphics Universe - Three.JS ------
	let newcube = new THREE.Mesh(new THREE.BoxGeometry(scale, scale, scale), new THREE.MeshPhongMaterial({color: Math.random() * 0xffffff}));
	newcube.position.set(position.x, position.y, position.z);
	scene.add(newcube);

	// ------ Physics Universe - Ammo.js ------
	let transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin( new Ammo.btVector3( position.x, position.y, position.z ) );
	transform.setRotation( new Ammo.btQuaternion( quaternion.x, quaternion.y, quaternion.z, quaternion.w ) );
	let defaultMotionState = new Ammo.btDefaultMotionState( transform );
		
		//shape
	let structColShape = new Ammo.btBoxShape( new Ammo.btVector3( scale*0.5, scale*0.5, scale*0.5 ) );
	structColShape.setMargin( 0.05 );

		//inertie
	let localInertia = new Ammo.btVector3( 0, 0, 0 );
	structColShape.calculateLocalInertia( mass, localInertia );

		//rigid body (mass/velocity/collision)
	let RBody_Info = new Ammo.btRigidBodyConstructionInfo( mass, defaultMotionState, structColShape, localInertia );
	let RBody = new Ammo.btRigidBody( RBody_Info );

	newcube.userData.physicsBody = RBody;
	rigidBody_List.push(newcube);

	console.log(rigidBody_List)

}

function updatePhysicsUniverse( deltaTime ){

	physicsWorld.stepSimulation( deltaTime, 10 );


	for ( let i = 0; i < rigidBody_List.length; i++ ){
		let Graphics_Obj = rigidBody_List[ i ];
		let Physics_Obj = Graphics_Obj.userData.physicsBody;

		let motionState = Physics_Obj.getMotionState();
		if ( motionState ){

			motionState.getWorldTransform( tmpTransformation );
			let new_pos = tmpTransformation.getOrigin();
			let new_qua = tmpTransformation.getRotation();
			Graphics_Obj.position.set( new_pos.x(), new_pos.y(), new_pos.z() );
			Graphics_Obj.quaternion.set( new_qua.x(), new_qua.y(), new_qua.z(), new_qua.w() );
		}
	}
}


function render(){

	let deltaTime = clock.getDelta();
	updatePhysicsUniverse( deltaTime );
					
	renderer.render( scene, camera );
	requestAnimationFrame( render );
}

