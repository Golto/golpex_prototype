function gen_decoration(){
	//gen_decoration_arbre(0,20,0);
}

function gen_decoration_arbre(x,y,z){
	const arbre = new THREE.Group();

	const h = random(2,3);
	const geo = new THREE.CylinderGeometry( 0.12, 0.2, h, 5 );
	const mat = new THREE.MeshPhongMaterial( { color : 0xa19281 } );
	const tronc = new THREE.Mesh( geo, mat );

	tronc.castShadow = true;
	tronc.receiveShadow = true;

	arbre.add( tronc );

	const nbFeuilles = random(2,4);
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

	//let x = random(2*semi_size*xMin,2*semi_size*xMax);
	//let z = random(2*semi_size*zMin,2*semi_size*zMax);
	//arbre.position.set( x , 0 , z );
	arbre.position.set( x, y, z );
	arbre.position.y += h/2 - 0.2 ;


	put_in_chunk(arbre);
}

function gen_decoration_maison(x,y,z){
	const maison = new THREE.Group();

	const h_mur = random(3,4);
	const L_mur = random(4,5);

	const geo_mur = new THREE.BoxGeometry( L_mur, h_mur, L_mur );
	const mat_mur = new THREE.MeshPhongMaterial( { color : 0xeac187 } );

	const mur = new THREE.Mesh( geo_mur, mat_mur );

	mur.castShadow = true;
	mur.receiveShadow = true;

	maison.add( mur );

	const points = [
		new THREE.Vector2(0,0),
		new THREE.Vector2(L_mur/1.3,3),
	];

	const geometry = new THREE.LatheGeometry( points , 4 );
	const material = new THREE.MeshPhongMaterial( { color: 0xf5abbe } );
	const toit = new THREE.Mesh( geometry, material );
	toit.position.y += h_mur+1;

	toit.rotation.y += 0.7854;
	toit.rotation.x += 3.1415;

	toit.castShadow = true;
	toit.receiveShadow = true;

	maison.add( toit );

	maison.position.set( x, y, z );
	maison.position.y += h_mur/2 - 0.3
	put_in_chunk(maison);
}