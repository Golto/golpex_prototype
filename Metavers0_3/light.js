function gen_AmbientLight(){
	const color = 0xFFFFFF;
	const intensity = 0.2;
	const light = new THREE.AmbientLight(color, intensity);
	scene.add(light);
}

function gen_PointLight(x,y,z){
	const color = 0xFFFFFF;
	const intensity = 0.6;
	const light = new THREE.PointLight(color, intensity);
	light.position.set( x, y, z );
	light.castShadow = true;
	light.distance = 64;
	//light.distance = 0;
	//scene.add(light);

	const geo_light = new THREE.BoxGeometry( 1,1,1 );
	const mat_light = new THREE.MeshBasicMaterial( { color : 0xffff30 } );

	const lampe = new THREE.Mesh( geo_light, mat_light );
	lampe.position.set(x,y,z);
	put_in_chunk(lampe);


	put_in_chunk(light);
}

function gen_DirectionalLight(x,y,z){
	const color = 0xFFFFFF;
	const intensity = 0.5;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set( x, y, z );

	//résolution ombre
	light.shadow.mapSize.width = 512*4;
	light.shadow.mapSize.height = 512*4;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 500;

	light.shadow.camera = new THREE.OrthographicCamera( -64, 64, 64, -64, 0.1, 500 );
	light.castShadow = true;

	scene.add( light );
	
	const helper = new THREE.DirectionalLightHelper( light, 64 );
	scene.add( helper );
	
}