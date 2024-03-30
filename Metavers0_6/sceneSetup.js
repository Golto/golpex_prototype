//=================================================================================
//							Scene creation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

renderer = new THREE.WebGLRenderer( { alpha : true , antialias: true } );


renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//renderer.shadowMap.type = THREE.VSMShadowMap;

//need import StereoEffect ./jsm/effects/StereoEffect.js
//effect = new THREE.StereoEffect( renderer );
//effect.setSize( window.innerWidth, window.innerHeight );

//document.body.appendChild( renderer.domElement );
let renderDiv = document.getElementById('renderDiv')
renderDiv.appendChild( renderer.domElement );

const loader = new THREE.GLTFLoader();

//Fog( "#555", 0.1, 20 )

//console.log(renderer.domElement)


//=================================================================================
//							raycast
const threshold = 0.1;



raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = threshold;
raycaster.far = 20;

const centerPointer = new THREE.Vector2(0,0);

function raycastUpdate(){
	raycaster.setFromCamera( centerPointer, camera );

	const intersections = raycaster.intersectObjects( scene.children );
	
	return(intersections)
	
}

/*
	// Toggle rotation bool for meshes that we clicked
	if ( intersects.length > 0 ) {

		helper.position.set( 0, 0, 0 );
		helper.lookAt( intersects[ 0 ].face.normal );

		helper.position.copy( intersects[ 0 ].point );

	}
	*/

//=================================================================================
//							window resize
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	//player.handleResize();
}
window.addEventListener( 'resize', onWindowResize );










//--------------------------------------------------------------------------

function removeObject( object ){ // ne pas utiliser
	//const object = scene.getObjectByProperty( 'uuid', i );

	object.geometry.dispose();
	object.material.dispose();
	
	scene.remove( object );

}


//CSS3DObject ---------------------------------------------------------------

rendererVideo = new THREE.CSS3DRenderer();
/*
function Element( id, x, y, z, ry ) {

				const div = document.createElement( 'div' );
				div.style.width = '480px';
				div.style.height = '360px';
				div.style.backgroundColor = '#000';

				const iframe = document.createElement( 'iframe' );
				iframe.style.width = '480px';
				iframe.style.height = '360px';
				iframe.style.border = '0px';
				iframe.src = [ 'https://www.youtube.com/embed/', id, '?rel=0' ].join( '' );
				div.appendChild( iframe );

				const object = new THREE.CSS3DObject( div );
				object.position.set( x, y, z );
				object.rotation.y = ry;

				return object;

			}

rendererVideo.setSize( window.innerWidth, window.innerHeight );
renderDiv.appendChild( rendererVideo.domElement );

const youtubeVideo = new Element( 'SJOz3qjfQXU', 0, 0, 240, 0 );
scene.add(youtubeVideo);
*/