import * as THREE from 'three';

let camera, scene, renderer;

const clock = new THREE.Clock();
const center = new THREE.Vector3( 0, 0, 0 );

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

	document.getElementById('golpexSandbox').appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 400, 200, 0 );

	// world

	const geometry = new THREE.BoxGeometry( 1, 1, 1 );
	geometry.translate( 0, 0.5, 0 );
	const material = new THREE.MeshPhongMaterial( { color: 0xff8c00, flatShading: true } );

	for ( let i = 0; i < 500; i ++ ) {

		const mesh = new THREE.Mesh( geometry, material );
		mesh.position.x = Math.random() * 1600 - 800;
		mesh.position.y = 0;
		mesh.position.z = Math.random() * 1600 - 800;
		mesh.scale.x = 30;
		mesh.scale.y = Math.random() * 80 + 10;
		mesh.scale.z = 20;
		mesh.updateMatrix();
		mesh.matrixAutoUpdate = false;
		scene.add( mesh );

	}

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

function animate() {

	requestAnimationFrame( animate );

	if (RENDERERS_RUNNING.get('golpexSandbox')) {render();}
}

function render() {



	const angle = clock.getElapsedTime() * 0.04;
	camera.position.set(400*Math.cos(angle), 200, 400*Math.sin(angle));
	camera.lookAt(center);

	renderer.render( scene, camera );
}