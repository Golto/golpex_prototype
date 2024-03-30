//=================================================================================
//							Player creation

//const controls = new THREE.OrbitControls( camera, renderer.domElement );
const player = new THREE.FirstPersonControls( camera, renderer.domElement );

player.movementSpeed = 30;
player.lookSpeed = 0.3;

const clock = new THREE.Clock();