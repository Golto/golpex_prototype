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
	
/*cf : 
https://github.com/mrdoob/three.js/blob/master/examples/games_fps.html
https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain.html#L104
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
//=================================================================================
//							Animate
let n = 0;

render_chunks([0,0,0],[0,0,1]);
//forcing pour charger les chunks à l'apparition de player : à suppr
//Modif is_chunk_update pour détécter quand undefined != array

function main_update() {
	n += 1;

	requestAnimationFrame( main_update );

	
	//custom updates
	update_chunk()
	update_movement()
	
	player.update()

	
	if (n%300===0){
		//update_chunk()
		
		//console.log(player.position)
		//console.log(player.camera.position)
		//console.log(player.collider.end)

		//console.log("player cam posi",player.camera.position);
		//console.log("player position",player.position);
		//console.log("player collider",player.collider.end);
		//console.log(camera.position, playerCollider.end)
	}
	const deltaTime = Math.min( 0.05, clock.getDelta() ) / STEPS_PER_FRAME;

				// we look for collisions in substeps to mitigate the risk of
				// an object traversing another too quickly for detection.

				for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {

					//controls( deltaTime );

					updatePlayer( deltaTime );

					updateSpheres( deltaTime );

					teleportPlayerIfOob();

				}


	
	renderer.render( scene, camera );
}

main_update();

//console.log(Chunk.data.list[[1,1,0]])
