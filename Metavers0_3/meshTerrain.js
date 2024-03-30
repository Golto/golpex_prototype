

/*
function meshTerrain_gen(){
	const geometry = new THREE.BufferGeometry();
	// create a simple square shape. We duplicate the top left and bottom right
	// vertices because each vertex needs to appear once per triangle.
	const vertices = new Float32Array( [
		 1.0, 1.0,   1.0,
		 1.0, 1.0,   0.0,
		 0.0,  1.0,  1.0,

		 0.0,  1.0,  0.0,
		 0.0,  1.0,  1.0,
		 1.0, 1.0,   0.0
	] );

	// itemSize = 3 because there are 3 values (components) per vertex
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	
	const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
	const mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(0,3,0);

	put_in_chunk(mesh);
}*/


//=================================================================================
//							surface vertices
function create_vertices(chunk_coordinates){
	const rand1 = Math.floor(random(-15,15));
	const rand2 = Math.floor(random(-15,15));
	const rand3 = Math.floor(random(-15,15));
	const rand4 = Math.floor(random(-15,15));
	const rand5 = Math.floor(random(-15,15));
	const rand6 = Math.floor(random(-15,15));


	const Xstart = Math.floor(chunk_coordinates[0]*Chunk.data.chunkSize);
	const Zstart = Math.floor(chunk_coordinates[2]*Chunk.data.chunkSize);
	let verts = [];
	for (var x = -Chunk.data.chunkSize/2; x <= Chunk.data.chunkSize/2; x++) {
	for (var z = -Chunk.data.chunkSize/2; z <= Chunk.data.chunkSize/2; z++) {
		X = Xstart + x;
		Z = Zstart + z;

		//y = Math.floor(3*Math.sin(X/8)+Math.cos(Z))+5;
		//y = 10+10*noise.perlin2(X/20,Z/20);

		y0 = 40+20*noise.perlin2(X/20,Z/20);

		y = 10+10*noise.perlin2(X/y0,Z/y0);

		
		if ( x === rand1 && z === rand2 ) {
			gen_decoration_arbre(X,y,Z);
		}
		if ( x === rand3 && z === rand4 && y0 >= 45 ) {
			gen_decoration_maison(X,y,Z);
		}



		verts.push([x,y,z]);
	}}
	
	return verts;
}
//=================================================================================
//							vertices to triangles

function vertices_to_square_index(vertices){
	//lenght.vertices need to be an squared interger
	const n = Math.sqrt(vertices.length);
	let L = [];
	for (var j = 0; j <= n-2; j++) {
	for (var i = 0; i <= n-2; i++) {
		const k = n*j;
		//L.push( [ vertices[k+i] , vertices[k+i+1] , vertices[k+n+i] , vertices[k+n+i+1] ] );
		L.push( [ k+i , k+i+1 , k+n+i , k+n+i+1 ])
	}}
	return L;
}

function square_index_to_triangles(vertices,indexList){
	const a = indexList[0];
	const b = indexList[1];
	const c = indexList[2];
	const d = indexList[3];
	const tri = [
	vertices[a] , vertices[b] , vertices[c] ,
	vertices[d] , vertices[c] , vertices[b] ,
	]
	return(tri);
}

function triangles_from_vertices(vertices){
	let L = [];
	const indexes = vertices_to_square_index(vertices);
	for (e in indexes) {
		const points = square_index_to_triangles(vertices,indexes[e]);
		
		for (p in points){
		for (i in points[p]){
			L.push( points[p][i] );
		}}
	}
	return L;
}

//=================================================================================
//							debug
/*
const verts = create_vertices([0,0,0])
//console.log(verts)

verts = [  
	[0,0,0], [1,0,0], [2,0,0],
	[0,0,1], [1,0,1], [2,0,1],
	[0,0,2], [1,0,2], [2,0,2],
	]


console.log("verts",verts)
indexes = vertices_to_square_index(verts)
console.log("indexes",indexes)
triangles = triangles_from_vertices( verts )
console.log("triangles",triangles)
*/

function gen_meshTerrain(chunk_coordinates){


	const triangles = triangles_from_vertices(create_vertices(chunk_coordinates));
	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array( triangles );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

	geometry.computeVertexNormals();
	geometry.normalizeNormals();

	const material = new THREE.MeshPhongMaterial( { color: 0x90d000 , side : THREE.DoubleSide } );

	material.shadowSide = THREE.BackSide;
	//évites que l'on voit les bugs d'ombres dqui sont à l'intérieur des objets
	

	const mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(
		chunk_coordinates[0]*Chunk.data.chunkSize,
		chunk_coordinates[1]*Chunk.data.chunkSize,
		chunk_coordinates[2]*Chunk.data.chunkSize,
		);

	mesh.castShadow = true;
	mesh.receiveShadow = true;


	put_in_chunk(mesh);
}
