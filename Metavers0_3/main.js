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
//meshTerrain_gen();
/*
gen_debug([0,0,0]);
gen_debug([1,0,0]);
gen_debug([1,0,1]);*/
gen_AmbientLight();
/*
gen_PointLight(-50,30,-50);

gen_PointLight(-50,30,50);
gen_PointLight(50,30,-50);
gen_PointLight(50,30,50);
*/
gen_DirectionalLight(-20,30,5);

gen_decoration();
for (var x = -5; x <= 5; x++) {
for (var z = -5; z <= 5; z++) {
	gen_meshTerrain([x,0,z]);
}}	


//=================================================================================
//							Scene Decoration Creation

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
}}}
/*
for (var x = -10; x <= 10; x++) {
for (var z = -10; z <= 10; z++) {
	{
		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshPhongMaterial( { color: 0x0010a0 } );
		const mesh = new THREE.Mesh( geometry, material );
		mesh.position.y += 1;

		mesh.position.x += 10*x;
		mesh.position.z += 10*z;
		//scene.add(mesh);
		put_in_chunk( mesh );

		mesh.castShadow = true;
		mesh.receiveShadow = true;
	}
}}*/
/*
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

			tronc.castShadow = true;
			tronc.receiveShadow = true;

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

				feuille.castShadow = true;
				feuille.receiveShadow = true;

				arbre.add( feuille );
			}

			let x = random(2*semi_size*xMin,2*semi_size*xMax);
			let z = random(2*semi_size*zMin,2*semi_size*zMax);
			arbre.position.set( x, h/2 , z );
			arbre.position.y += 0.4;
			//scene.add(arbre);


			put_in_chunk(arbre)
			
		}
	}
}*/
/*
{
	const chunk_coordinates = [0,0,0];
	const triangles = triangles_from_vertices(create_vertices(chunk_coordinates));
	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array( triangles );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

	geometry.computeVertexNormals();
	geometry.normalizeNormals ()
	const material = new THREE.MeshPhongMaterial( { color: 0xff0000 , side : THREE.DoubleSide } );

	const mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(
		chunk_coordinates[0]*Chunk.data.chunkSize,
		chunk_coordinates[1]*Chunk.data.chunkSize,
		chunk_coordinates[2]*Chunk.data.chunkSize,
		);

	put_in_chunk(mesh);
}*/
	
/*cf : 
https://github.com/mrdoob/three.js/blob/master/examples/games_fps.html
https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain.html#L104
*/

/*
document.addEventListener( 'mousedown', () => {

				document.getElementById('renderDiv').requestPointerLock();

				mouseTime = performance.now();

			} );*/
//=================================================================================
//							pointer
/*
const pointer = new THREE.Vector2();

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	console.log(pointer.x," ",pointer.y)

}
window.addEventListener( 'pointermove', onPointerMove );
*/
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


player.object.position.y += 20;
render_chunks([0,0,0],[0,0,1]);
//forcing pour charger les chunks à l'apparition de player : à suppr
//Modif is_chunk_update pour détécter quand undefined != array

function main_update() {
	n += 1;

	requestAnimationFrame( main_update );

	
	//custom updates
	//update_chunk()

	
	if (n%5===0){
		update_chunk()
	}
	

	//pre-built updates
	player.update( clock.getDelta() );


	
	renderer.render( scene, camera );
}

main_update();

//console.log(Chunk.data.list[[1,1,0]])
