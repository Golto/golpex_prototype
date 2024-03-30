/*
Pour du offline :
Utiliser :
	https://threejs.org/examples/js/controls/FirstPersonControls.js

plutôt que :
	https://threejs.org/examples/jsm/controls/FirstPersonControls.js
*/
//=================================================================================
//							Gen Chunk
chunk_gen();
//=================================================================================
//							Scene Decoration Creation


{
	const color = 0xFFFFFF;
	const intensity = 0.4;
	const light = new THREE.AmbientLight(color, intensity);
	scene.add(light);
}

{
	const color = 0xFFFFFF;
	const intensity = 0.5;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(1, 3, 0);
	//light.castShadow = true;
	light.distance = 120;
	scene.add(light);
}

for (var x = Chunk.data.xMin; x <= Chunk.data.xMax; x++) {
	for (var y = 0; y <= 0; y++) {
		for (var z = Chunk.data.zMin; z <= Chunk.data.zMax; z++) {
			const geometry = new THREE.BoxGeometry();
			const material = ((x+z+100)%2===1)?new THREE.MeshPhongMaterial( { color: 0x00ff00 }):new THREE.MeshPhongMaterial( { color: 0xffff00 });
			const cube = new THREE.Mesh( geometry, material );
			
			cube.position.x = x*Chunk.data.chunkSize ;
			cube.position.y = y*Chunk.data.chunkSize ;
			cube.position.z = z*Chunk.data.chunkSize ;
			
			cube.scale.x = Chunk.data.chunkSize;
			cube.scale.z = Chunk.data.chunkSize;



			//cube.receiveShadow = true;


			put_in_chunk(cube);


			cube.position.x = 0 ;//devient relatif aux chunks
			cube.position.y = 0 ;
			cube.position.z = 0 ;

			


}}}
/*
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

const box0 = new THREE.Mesh( geometry, material );
scene.add( box0 );
box0.position.y += 1;
put_in_chunk(box0)
*/
function random(min, max) {
    return Math.random() * (max - min) + min;
}


{//arbres
	const size = Chunk.data.chunkSize;
	const semi_size = Math.floor(size/2);

	const xMax = Chunk.data.xMax;
	const xMin = Chunk.data.xMin;
	const zMax = Chunk.data.zMax;
	const zMin = Chunk.data.zMin;

	for (let k = 0; k <= 1; k++) {
		//const nbArbres = random(100,150);
		const nbArbres = (xMax-xMin)*(zMax-zMin);
		for (let i = 0; i < nbArbres; i += 1){
			const arbre = new THREE.Group();

			const h = random(2,3);
			const geo = new THREE.CylinderGeometry( 0.12, 0.2, h, 5 );
			const mat = new THREE.MeshPhongMaterial( { color : 0xa19281 } );
			const tronc = new THREE.Mesh( geo, mat );
			arbre.add( tronc );

			const nbFeuilles = random(3,5);
			for (let j = 0; j < nbFeuilles; j += 1){
				const geoF = new THREE.IcosahedronGeometry( random(0.5,0.75) );
				const matF = new THREE.MeshPhongMaterial( { color : 0x8ae8a7 } );
				const feuille = new THREE.Mesh( geoF, matF );
				let xf = random(-.3,.3);
				let yf = random(-.3,.3);
				let zf = random(-.3,.3);
				feuille.position.set( xf, yf + h/2, zf );
				arbre.add( feuille );
			}

			let x = random(2*semi_size*xMin,2*semi_size*xMax);
			let z = random(2*semi_size*zMin,2*semi_size*zMax);
			arbre.position.set( x, h/2 , z );
			arbre.position.y += 0.4;
			//scene.add(arbre);

			//arbre.castShadow = true;
			//arbre.receiveShadow = true;


			put_in_chunk(arbre)

			arbre.position.set( x%semi_size, h/2 %semi_size , z%semi_size );

			
		}
	}
	
}


//==========Tests===============
{
	const geometry = new THREE.BufferGeometry();
	// create a simple square shape. We duplicate the top left and bottom right
	// vertices because each vertex needs to appear once per triangle.
	const vertices = new Float32Array( [
		-1.0, 1.0,  -1.0,
		-1.0, 1.0,   1.0,
		 1.0,  1.0,  1.0,

		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,
		-1.0, 1.0,  -1.0
	] );

	// itemSize = 3 because there are 3 values (components) per vertex
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
	const mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(0,3,0);
	//scene.add(mesh);
	put_in_chunk(mesh);
}


	

/*
const geometry0 = new THREE.BoxGeometry();
const material0 = new THREE.MeshStandardMaterial( { color: 0x555555 } );

const sol = new THREE.Mesh( geometry0, material0 );

sol.position.y += 2;
sol.scale.x = 10;
sol.scale.z = 10;
sol.castShadow = false;
sol.receiveShadow = true;
scene.add(sol);
//-------------
const geometry1 = new THREE.BoxGeometry();
const material1 = new THREE.MeshStandardMaterial( { color: 0x702020 } );

const box1 = new THREE.Mesh( geometry1, material1 );

box1.position.set( 2 , 3 , 2);
sol.castShadow = true;
sol.receiveShadow = true;
scene.add(box1);
//-------------
const geometry2 = new THREE.BoxGeometry();
const material2 = new THREE.MeshStandardMaterial( { color: 0x207020 } );

const box2 = new THREE.Mesh( geometry2, material2 );

box2.position.set( -3 , 3 , 3);
sol.castShadow = true;
sol.receiveShadow = true;
scene.add(box2);
*/
//==========Tests===============


//console.log( Chunk.data.list );
//console.log( in_chunk(cube) );
//console.log( Chunk.data.list[in_chunk(cube)] );

//console.log(scene.children);

//console.log(player.object)
/*cf : 
https://github.com/mrdoob/three.js/blob/master/examples/games_fps.html
https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain.html#L104
*/
//camera.position.z = 2;

/*
document.addEventListener( 'mousedown', () => {

				document.getElementById('renderDiv').requestPointerLock();

				mouseTime = performance.now();

			} );*/

//=================================================================================
//							window resize
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	player.handleResize();
}
window.addEventListener( 'resize', onWindowResize );
//=================================================================================
//							Animate
let n = 0;

player.object.position.y += 5;
render_chunks([0,0,0],[0,0,1]);
//forcing pour charger les chunks à l'apparition de player : à suppr
//Modif is_chunk_update pour détécter quand undefined != array

function main_update() {
	n += 1;

	requestAnimationFrame( main_update );

	
	//custom updates
	//update_chunk()

	
	if (n%2===0){
		update_chunk()
	}
	

	//pre-built updates
	player.update( clock.getDelta() );


	
	renderer.render( scene, camera );
}

main_update();

console.log(Chunk.data.list[[1,1,0]])
