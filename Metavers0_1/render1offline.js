
import * as THREE from 'three';

//=================================================================================
//							Scene creation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

//document.body.appendChild( renderer.domElement );
document.getElementById('renderDiv').appendChild( renderer.domElement );

//const controls = new THREE.OrbitControls( camera, renderer.domElement );
//const player = new FirstPersonControls( camera, renderer.domElement );
//=================================================================================
//							Scene Decoration Creation
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

//=================================================================================
//							Animate

function main_update() {

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	requestAnimationFrame( main_update );
	renderer.render( scene, camera );
}
main_update();