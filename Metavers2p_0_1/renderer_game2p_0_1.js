//===================================================================================================
//===================================================================================================
//											IMPORTS
import * as THREE from 'three';

import { MapControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//===================================================================================================
//===================================================================================================
//											VARIABLES DECLARATION

const GolpexElement = document.getElementById('renderer-game');
let RATIO = 3/5;
//let onFullScreen = false;

let physicsWorld, scene, camera, renderer, clock;
let controls;

let rigidBodies = [], tmpTrans;

//mask et contraintes
let colGroupPlane = 1, colGroupRedBall = 2, colGroupGreenBall = 4

//controls

const keyStates = {};

//loader / gltf

const gltfLoader = new GLTFLoader();
let loadedObjects = new Map;

//Ammojs Initialization
Ammo().then( start )


//cf http://raw.githack.com/Oxynt/AmmoPhysics-extended/master/index.html pour modèle gltf
//https://raw.githubusercontent.com/Oxynt/AmmoPhysics-extended/master/index.html
//https://discourse.threejs.org/t/how-to-add-ammo-js-physic-to-gltf-file/27539/4
//===================================================================================================
//===================================================================================================
//											START

function start(){

	//=========================================================================
	//						CONTROLS / LISTENERS
	document.addEventListener( 'keydown', ( event ) => {

		keyStates[ event.code ] = true;

	} );

	document.addEventListener( 'keyup', ( event ) => {

		keyStates[ event.code ] = false;

	} );

	document.body.onfullscreenchange = ()=>{
/*
		if (onFullScreen) {
			RATIO = 3/5;
			onFullScreen = !onFullScreen;
			onWindowResize();
			return
		}
		RATIO = 1;
		onFullScreen = !onFullScreen;
		onWindowResize();*/


	}
/*
	GolpexElement.addEventListener( 'mousedown', () => {

		document.body.requestPointerLock();

		mouseTime = performance.now();

	} );*/

	document.addEventListener( 'mouseup', () => {

		//GolpexElement.requestFullscreen();
		/*if ( document.pointerLockElement !== null ) {
			GolpexElement.requestFullscreen();
		}*/

	} );
/*
	document.body.addEventListener( 'mousemove', ( event ) => {

		if ( document.pointerLockElement === document.body ) {

			camera.rotation.y -= event.movementX / 500;
			camera.rotation.x -= event.movementY / 500;

		}

	} );*/

	window.addEventListener( 'resize', onWindowResize );

	//=========================================================================
	//						AMMO/THREEjs INIT

	tmpTrans = new Ammo.btTransform();

	setupPhysicsWorld();

	setupGraphics();

	//=========================================================================
	//						SCENE OBJECTS

	loadGLTF('./models/tree2.glb', 'tree',{
        position : new THREE.Vector3(30,20,-30),
        rotation : new THREE.Vector3(0,0,0),
        scale : new THREE.Vector3(10,10,10),
    });
	loadGLTF('./models/room3.glb', 'room',{
        position : new THREE.Vector3(-10,0,0),
        rotation : new THREE.Vector3(0,0,0),
        scale : new THREE.Vector3(5,5,5),
    });
    



	//balls
	
	createBall({x: 0, y: 100, z: 0}, 2, {x: 0, y: 0, z: 0, w: 1}, 1);
	createBall({x: 1, y: 150, z: 1}, 5, {x: 0, y: 0, z: 0, w: 1}, 1);
	createBall({x: 2, y: 200, z: 4}, 1, {x: 0, y: 0, z: 0, w: 1}, 1);
	createBall({x: 1, y: 250, z: 5}, 4, {x: 0, y: 0, z: 0, w: 1}, 1);
	createBall({x: 3, y: 300, z: 2}, 3, {x: 0, y: 0, z: 0, w: 1}, 1);
	createBall({x: 1, y: 350, z: 4}, 3, {x: 0, y: 0, z: 0, w: 1}, 1);
	
	
	//floor
	createBlock({x: 0, y: 0, z: 0}, {x: 50, y: 1, z: 50}, {x: 0, y: 0, z: 0, w: 1}, 0);

	//walls
	createBlock({x: -25, y: 3, z: 0}, {x: 1, y: 6, z: 50}, {x: 0, y: 0, z: 0, w: 1}, 0);
	createBlock({x: 25, y: 3, z: 0}, {x: 1, y: 6, z: 50}, {x: 0, y: 0, z: 0, w: 1}, 0);
	createBlock({x: 0, y: 3, z: 25}, {x: 50, y: 6, z: 1}, {x: 0, y: 0, z: 0, w: 1}, 0);
	createBlock({x: 0, y: 3, z: -25}, {x: 50, y: 6, z: 1}, {x: 0, y: 0, z: 0, w: 1}, 0);

	createJointObjects()

	//=========================================================================
	//						START RENDER LOOP

    renderFrame();

}

//===================================================================================================
//===================================================================================================
//											SETUPS

function setupPhysicsWorld(){

    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -75, 0));

}

function setupGraphics(){

    //create clock for timing
    clock = new THREE.Clock();

    //create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xbfd1e5 );

    //create camera
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
    camera.position.set( 0, 30, 70 );
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    //Add hemisphere light
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
    hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
    hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    //Add directional light
    let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 1.75, 1 );
    dirLight.position.multiplyScalar( 100 );
    scene.add( dirLight );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    let d = 50;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 13500;

    //Setup the renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xbfd1e5 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth * RATIO, window.innerHeight * RATIO );
    GolpexElement.appendChild( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;

    controls = new MapControls( camera, renderer.domElement );
	controls.enableRotate = true;
	controls.enableZoom = true;
	controls.screenSpacePanning = true;

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth * RATIO, window.innerHeight * RATIO );

}

function rand(min,max){
	return min + (max - min) * Math.random()
}

//===================================================================================================
//===================================================================================================
//											LOADERS


function loadGLTF(path,name,param){
	gltfLoader.load( path,
		//loaded-------------
		function ( gltf ) {

			const model = gltf.scene;
			scene.add( model );

            model.name = name;
            model.position.copy(param.position);
            model.rotation.copy(param.rotation);
            model.scale.copy(param.scale);

			loadedObjects.set(name,model);
			console.log(loadedObjects)

		},
		//on load------------
		undefined,
		//not loaded---------
		function ( e ) {

			console.error( e );

	} );
}

//===================================================================================================
//===================================================================================================
//											RENDER


function renderFrame(){

    let deltaTime = clock.getDelta();

	updatePhysics( deltaTime );

    renderer.render( scene, camera );

    requestAnimationFrame( renderFrame );

}

//===================================================================================================
//===================================================================================================
//											OBJECTS CREATION


function createBlock(pos, scale, quat, mass){
    
    /*let pos = {x: 0, y: 0, z: 0};
    let scale = {x: 50, y: 2, z: 50};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;*/

    //threeJS Section
    let block = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({color: Math.random() * 0xffffff}));

    block.position.set(pos.x, pos.y, pos.z);
    block.scale.set(scale.x, scale.y, scale.z);

    block.castShadow = true;
    block.receiveShadow = true;

    scene.add(block);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body );
}


function createBall(pos, radius, quat, mass){
    /*
    let pos = {x: 0, y: 20, z: 0};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;*/

    //threeJS Section
    let ball = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({color: Math.random() * 0xffffff}));

    ball.position.set(pos.x, pos.y, pos.z);
    
    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body );
    
    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
}

//===================================================================================================
//===================================================================================================
//											UPDATE PHYSICS

function updatePhysics( deltaTime ){

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    // Update rigid bodies
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if ( ms ) {

            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        }
    }

}



//===================================================================================================
//===================================================================================================
//											CONSTRAINTS

function createJointObjects(){
    
    let pos1 = {x: -1, y: 15, z: 0};
    let pos2 = {x: -1, y: 10, z: 0};

    let radius = 2;
    let scale = {x: 5, y: 5, z: 2};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass1 = 0;
    let mass2 = 1;

    let transform = new Ammo.btTransform();

    //Sphere Graphics
    let ball = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({color: 0xb846db}));

    ball.position.set(pos1.x, pos1.y, pos1.z);

    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Sphere Physics
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos1.x, pos1.y, pos1.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let sphereColShape = new Ammo.btSphereShape( radius );
    sphereColShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    sphereColShape.calculateLocalInertia( mass1, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass1, motionState, sphereColShape, localInertia );
    let sphereBody = new Ammo.btRigidBody( rbInfo );

    physicsWorld.addRigidBody( sphereBody, colGroupGreenBall, colGroupRedBall );

    ball.userData.physicsBody = sphereBody;
    rigidBodies.push(ball);
    

    //Block Graphics
    let block = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({color: 0xf78a1d}));

    block.position.set(pos2.x, pos2.y, pos2.z);
    block.scale.set(scale.x, scale.y, scale.z);

    block.castShadow = true;
    block.receiveShadow = true;

    scene.add(block);


    //Block Physics
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos2.x, pos2.y, pos2.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    motionState = new Ammo.btDefaultMotionState( transform );

    let blockColShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    blockColShape.setMargin( 0.05 );

    localInertia = new Ammo.btVector3( 0, 0, 0 );
    blockColShape.calculateLocalInertia( mass2, localInertia );

    rbInfo = new Ammo.btRigidBodyConstructionInfo( mass2, motionState, blockColShape, localInertia );
    let blockBody = new Ammo.btRigidBody( rbInfo );

    physicsWorld.addRigidBody( blockBody, colGroupGreenBall, colGroupRedBall );
    
    block.userData.physicsBody = blockBody;
    rigidBodies.push(block);



    //Create Joints
    let spherePivot = new Ammo.btVector3( 0, - radius, 0 );
    let blockPivot = new Ammo.btVector3( - scale.x * 0.5, 1, 1 );

    let p2p = new Ammo.btPoint2PointConstraint( sphereBody, blockBody, spherePivot, blockPivot);
    physicsWorld.addConstraint( p2p, false );

}