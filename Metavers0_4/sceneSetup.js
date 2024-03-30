//=================================================================================
//							Scene creation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer( { alpha : true , antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//renderer.shadowMap.type = THREE.VSMShadowMap;

//document.body.appendChild( renderer.domElement );
var renderDiv = document.getElementById('renderDiv')
renderDiv.appendChild( renderer.domElement );

const loader = new THREE.GLTFLoader();



console.log(renderer.domElement)



function removeObject( object ){
	//const object = scene.getObjectByProperty( 'uuid', i );

	object.geometry.dispose();
	object.material.dispose();
	
	scene.remove( object );

}