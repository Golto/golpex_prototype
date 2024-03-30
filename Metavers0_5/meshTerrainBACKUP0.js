
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
	const Ystart = Math.floor(chunk_coordinates[1]*Chunk.data.chunkSize);
	const Zstart = Math.floor(chunk_coordinates[2]*Chunk.data.chunkSize);
	let verts = [];

	const SIZE = 4;//size of triangle, SIZE>4 : low detail / SIZE < 0.5 : High detail
	//need to be a divisor of Chunk.data.chunkSize

	for (var x = -Chunk.data.chunkSize/2/SIZE; x <= Chunk.data.chunkSize/2/SIZE; x++) {
	for (var z = -Chunk.data.chunkSize/2/SIZE; z <= Chunk.data.chunkSize/2/SIZE; z++) {
		X = Xstart + SIZE*x;
		Z = Zstart + SIZE*z;

		//y = Math.floor(3*Math.sin(X/8)+Math.cos(Z))+5;
		//y = 10+10*noise.perlin2(X/20,Z/20);

		y0 = 30*noise.perlin2(X/500,Z/500);

		//y = 10+10*noise.perlin2(X/y0,Z/y0);
		y1 = y0+20*noise.perlin2(X/200,Z/200);

		y = y1+10*noise.perlin2(X/30,Z/30) + Ystart;

		//( chunk_coordinates[0]===0 && chunk_coordinates[2]===0 )?0:-1;

		//console.log(noise.perlin2(X/30,Z/30));


		const rand = Math.floor(random(0,30));


		if( noise.perlin2(X/25,Z/25) >= 0.1 &&
			Math.abs(X+Z+rand) % 8 === 0 ){

			gen_decoration_arbre(X,y,Z);
		}/*
		if( noise.perlin2(X/10,Z/10) >= 0.3 &&
			Math.abs(X+Z+rand+1) % 30 === 0 ){

			gen_decoration_roche(X,y,Z);
		}*/



		/*
		if ( x === rand1 && z === rand2 ) {
			gen_decoration_arbre(X,y,Z);
		}
		if ( x === rand3 && z === rand4 && y0 >= 45 ) {
			gen_decoration_maison(X,y,Z);

		}*/



		verts.push([SIZE*x,y,SIZE*z]);
	}}
	
	return verts;
}
//=================================================================================
//							vertices to triangles

function vertices_to_square_index(vertices){
	//lenght.vertices need to be an squared integer
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
//							gen_mesh



function gen_meshTerrain(chunk_coordinates){


	const triangles = triangles_from_vertices(create_vertices(chunk_coordinates));
	/*
	if(chunk_coordinates[0]===0&&chunk_coordinates[1]===0&&chunk_coordinates[2]===0){
		console.log("exemple vertices",create_vertices(chunk_coordinates))
		console.log("exemple triangles",triangles)
	}*/
	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array( triangles );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

	geometry.computeVertexNormals();
	geometry.normalizeNormals();

	const material = new THREE.MeshPhongMaterial( { side : THREE.DoubleSide } );

	material.shadowSide = THREE.BackSide;
	//évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
	

	const mesh = new THREE.Mesh( geometry, material );

	mesh.position.set(
		chunk_coordinates[0]*Chunk.data.chunkSize,
		chunk_coordinates[1]*Chunk.data.chunkSize,
		chunk_coordinates[2]*Chunk.data.chunkSize,
		);

	mesh.castShadow = true;
	mesh.receiveShadow = true;

	
	put_in_chunk(mesh);
	
	/*
	mesh.material.color = {
		r: 0.8,
		g: 0.3,
		b: 0.0,
	};*/
	mesh.material.color = {
		r: 0.7,
		g: 0.8,
		b: 0.2,
	};
	
	//const group = Chunk.data.list[ chunk_coordinates ].group;
	//worldOctree.fromGraphNode( group );
}

function generable_meshTerrain(chunk_coordinates){
	if( chunk_coordinates in Chunk.data.list ){
			gen_meshTerrain(chunk_coordinates);
		}
}

function gen_Terrain(listChunks){
	
	for (coords of listChunks) {

		if( coords in Chunk.data.list ){
			gen_meshTerrain(coords);
		}
	}
}
//gen_Terrain( [ [0,0,0], [0,0,1] ] )



function genInit(){
	/*

	var n = 0;

	const max = Math.min(
		4,
		Chunk.data.xMax,
		-Chunk.data.xMin,
		//Chunk.data.yMax,
		//-Chunk.data.yMin,
		Chunk.data.zMax,
		-Chunk.data.zMin,
		);
	for (var x = -max; x <= max; x++) {
	for (var z = -max; z <= max; z++) {

		//generable_meshTerrain([x,0,z]);
		n+=1
		console.log( "terrain :", Math.floor(n/(2*max+1)/(2*max+1)*100) )

	}}*/

}
//=================================================================================
// à terme supprimer la partie du haut
//=================================================================================

//=================================================================================
//							UnderGround generator
/*
1100001111
1000011101	0 : air
1000011001
1100001101	1 : solid
1111111100
*/

function underground(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;
	liste = [];
	/*
	const Xstart = Math.floor(chunk_coordinates[0]*n);
	const Ystart = Math.floor(chunk_coordinates[1]*n);  // pourquoi Math.floor ? (penser à enlever / retrouver la raison)
	const Zstart = Math.floor(chunk_coordinates[2]*n);*/

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;

	for (let x = 0; x < chksize; x++) {

		liste.push([]);

	for (let y = 0; y < chksize; y++) {

		liste[x].push([])

	for (let z = 0; z < chksize; z++) {
		X = Xstart + x;
		Y = Ystart + y;
		Z = Zstart + z;


		const pn3 = (noise.perlin3(X/7,Y/7,Z/7) >= 0) ? 1 : 0;
		liste[x][y].push(pn3);
	}}}
	return(liste)
}

function surface(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;
	liste = [];

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;

	for (let x = 0; x < chksize; x++) {

		liste.push([]);

	for (let y = 0; y < chksize; y++) {

		liste[x].push([])

	for (let z = 0; z < chksize; z++) {
		
		X = Xstart + x;
		Z = Zstart + z;

		const pn2 = 10+5*noise.perlin2(X/7,Z/7);

		
		if (y <= pn2){
			liste[x][y].push(1);
		}else{
			liste[x][y].push(0);
		}
	}}}
	return(liste)
}



function visualizer(X,Y,Z,underground,surface){

	const cave = new THREE.Group();

	const lenght = 0.3;

	const geo = new THREE.BoxGeometry( lenght, lenght, lenght );
	
	

	for (let x in underground) {
	for (let y in underground[x]) {
	for (let z in underground[x][y]) {
		x = Math.floor(x) // string to int
		y = Math.floor(y) // string to int
		z = Math.floor(z) // string to int

		if(underground[x][y][z] && surface[x][y][z]){

			const mat = new THREE.MeshPhongMaterial();
			const visualBox = new THREE.Mesh( geo, mat );

			//visualBox.castShadow = true;
			//visualBox.receiveShadow = true;

			visualBox.position.set(x,y,z);
			visualBox.material.color = ( (x+y+z) % 2 ) ? { r:0.3, g:1.0, b:0.0 } : { r:1.0, g:0.0, b:0.7 } ;

			cave.add( visualBox );
		}

		
	}}}

	scene.add(cave);
	//put_in_chunk(cave);


	//worldOctree.fromGraphNode( cave );
	cave.position.set(X,Y,Z);
}







function volume_to_surface(volume){

	surface = []

	for (let x in volume) {

		surface.push([]);

	for (let y in volume[x]) {

		surface[x].push([])

	for (let z in volume[x][y]) {

		x = Math.floor(x); // string to int
		y = Math.floor(y); // string to int
		z = Math.floor(z); // string to int

		/*
		const BX1Y0Z0  = (volume[x+1] === undefined) ? 1 : volume[x+1][y][z];
		const BX_1Y0Z0 = (volume[x-1] === undefined) ? 1 : volume[x-1][y][z];
		const BX0Y1Z0  = (volume[x][y+1] === undefined) ? 1 : volume[x][y+1][z];
		const BX0Y_1Z0 = (volume[x][y-1] === undefined) ? 1 : volume[x][y-1][z];
		const BX0Y0Z1  = (volume[x][y][z+1] === undefined) ? 1 : volume[x][y][z+1];
		const BX0Y0Z_1 = (volume[x][y][z-1] === undefined) ? 1 : volume[x][y][z-1];*/

		const X1Y0Z0  = (volume[x+1] === undefined) ? false : !volume[x+1][y][z];
		const X_1Y0Z0 = (volume[x-1] === undefined) ? false : !volume[x-1][y][z];
		const X0Y1Z0  = (volume[x][y+1] === undefined) ? false : !volume[x][y+1][z];
		const X0Y_1Z0 = (volume[x][y-1] === undefined) ? false : !volume[x][y-1][z];
		const X0Y0Z1  = (volume[x][y][z+1] === undefined) ? false : !volume[x][y][z+1];
		const X0Y0Z_1 = (volume[x][y][z-1] === undefined) ? false : !volume[x][y][z-1];
		

		if(volume[x][y][z] === 1){
			// Si le point de volume est adjacent à de l'air ==> point de surface
			if(/*
				(BX1Y0Z0 === 0) || (BX_1Y0Z0 === 0) || 
				(BX0Y1Z0 === 0) || (BX0Y_1Z0 === 0) || 
				(BX0Y0Z1 === 0) || (BX0Y0Z_1 === 0)*/
				X1Y0Z0 || X_1Y0Z0 || X0Y1Z0 || X0Y_1Z0 || X0Y0Z1 || X0Y0Z_1
			){
				surface[x][y].push( 1 );
			}else{
				surface[x][y].push( 0 );
			}

		}else{
			surface[x][y].push( 0 );
		}
		

	}}}
	return(surface)
}

/*
const LL = [
			[[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],

			[[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],

			[[0,0,0,0],[0,0,0,1],[0,1,1,1],[1,1,1,1]],

			[[0,0,0,0],[0,0,0,0],[0,0,1,1],[0,1,1,1]],
		]

LLL = volume_to_surface(LL)

console.log(LLL)

visualizer(0,3,-15,LL,LL);
visualizer(0,3,-20,LLL,LLL);*/

/*
underL = underground([0,0,0])
surfL = surface([0,0,0])

visualizer(0,0,-10,surfL,surfL);
surfLL = volume_to_surface(surfL)
visualizer(0,0,-30, surfLL ,surfLL);

visualizer(0,0,-50,underL,surfL);
underLL = volume_to_surface(underL)
visualizer(0,0,-70, underLL ,surfL);
*/




//=================================================================================
//							2D Terrain holes

function index_generator(){ // ALL CHUNK
	// dépend de Chunk.data.chunkSize
	const chksize = Chunk.data.chunkSize;
	let L = [];
	let i = 0;
	for (let x = 0; x <= chksize; x++) {
		L.push([]);
	for (let z = 0; z <= chksize; z++) {
		L[x].push(i)
		i += 1;
	}}
	return(L)
}

const index_list = index_generator()

//--------------------------------
/*
function generate_vertices(chunk_coordinates){
	let L = [];

	const chksize = Chunk.data.chunkSize;

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;

	//for( x = 0; x <= chksize; x++){
	//for( z = 0; z <= chksize; z++){
	for( x = -chksize/2; x <= chksize/2; x++){
	for( z = -chksize/2; z <= chksize/2; z++){
		X = Xstart + x;
		Y = Ystart;
		Z = Zstart + z;


		//y0 = 20+30*noise.perlin2(X/200,Z/200);

		//y1 = y0+30*noise.perlin2(X/80,Z/80);

		y = 10*noise.perlin2(X/30,Z/30)//Math.random();//y1+10*noise.perlin2(X/30,Z/30) + Ystart;

		L.push( [x,y,z] );
	}}
	return(L)
}*/

function generate_vertices_V2(chunk_coordinates){
	let L = [];

	const chksize = Chunk.data.chunkSize;

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;
	//console.log(Xstart,Ystart,Zstart)

	//for( x = 0; x <= chksize; x++){
	//for( z = 0; z <= chksize; z++){
	for( x = -chksize/2; x <= chksize/2; x++){
	for( z = -chksize/2; z <= chksize/2; z++){


		X = Xstart + x;
		Z = Zstart + z;

		//y = -Ystart + Math.floor( 40*noise.perlin2(X/30,Z/30) );//discret
		//y = -Ystart + 40*noise.perlin2(X/30,Z/30) ;//continu

		
		y0 = 5*noise.perlin2(X/300,Z/300);
		y = 20*noise.perlin2(X/30,Z/30) + y0;//continu
		

		const obj = {
			position : [x,y,z],
			exist : false,
		}

		if( y >= 0 && y <= chksize ){
			obj.exist = true;
		}

		L.push( obj )
	}}
	return(L)
}

//--------------------------------
/*
function index_to_triangle(posInChunk,vertices){ // ex : posInChunk = [0,0] ---> [x,y] 0,0 <= x,y <= chkSize,chkSize

	//  a b
	//  c d  --->  [Pa,Pb,Pc, Pd,Pc,Pb] si x + z = pair ou [Pa,Pb,Pd, Pd,Pc,Pa] si x + z = impair

	const X = posInChunk[0];
	const Z = posInChunk[1];

	const a = index_list[X][Z];
	const b = index_list[X][Z+1];
	const c = index_list[X+1][Z];
	const d = index_list[X+1][Z+1];
	//console.log("test :",a,b,c,d)

	let tri;

	if( (X+Z) % 2 === 0 ){
		tri = [
		vertices[a] , vertices[b] , vertices[c] , // Permettre la non génération des triangles
		vertices[d] , vertices[c] , vertices[b] ,
		]
	}
	if( (X+Z) % 2 === 1 ){
		tri = [
		vertices[a] , vertices[b] , vertices[d] , // Permettre la non génération des triangles
		vertices[d] , vertices[c] , vertices[a] ,
		]
	}
	//console.log("tri :",tri)
	return(tri);
}*/

/*
function index_to_triangle_hole(posInChunk,vertices){ // ex : posInChunk = [0,0] ---> [x,y] 0,0 <= x,y <= chkSize,chkSize

	//  a b
	//  c d  --->  [Pa,Pb,Pc, Pd,Pc,Pb] si x + z = pair ou [Pa,Pb,Pd, Pd,Pc,Pa] si x + z = impair

	const X = posInChunk[0];
	const Z = posInChunk[1];

	const a = index_list[X][Z];
	const b = index_list[X][Z+1];
	const c = index_list[X+1][Z];
	const d = index_list[X+1][Z+1];
	//console.log("test :",a,b,c,d)

	let tri = [];

	const seuil = -4;
	
	if( (X+Z) % 2 === 0 ){

		if( vertices[a][1] >= seuil && vertices[b][1] >= seuil && vertices[c][1] >= seuil && vertices[d][1] >= seuil){
			tri = [
				vertices[a] , vertices[b] , vertices[c] ,
				vertices[d] , vertices[c] , vertices[b] ,
				]
			return(tri)
		}
		if(vertices[a][1] >= seuil && vertices[b][1] >= seuil && vertices[c][1] >= seuil){
			tri = [
				vertices[a] , vertices[b] , vertices[c] ,
				]
			return(tri)
		}
		if(vertices[d][1] >= seuil && vertices[b][1] >= seuil && vertices[c][1] >= seuil){
			tri = [
				vertices[d] , vertices[c] , vertices[b] ,
				]
			return(tri)
		}

	}
	if( (X+Z) % 2 === 1 ){

		if( vertices[a][1] >= seuil && vertices[b][1] >= seuil && vertices[c][1] >= seuil && vertices[d][1] >= seuil){
			tri = [
				vertices[a] , vertices[b] , vertices[d] ,
				vertices[d] , vertices[c] , vertices[a] ,
				]
			return(tri)
		}
		if( vertices[a][1] >= seuil && vertices[b][1] >= seuil && vertices[d][1] >= seuil){
			tri = [
				vertices[a] , vertices[b] , vertices[d] ,
				]
			return(tri)
		}
		if( vertices[a][1] >= seuil && vertices[c][1] >= seuil && vertices[d][1] >= seuil){
			tri = [
				vertices[d] , vertices[c] , vertices[a] ,
				]
			return(tri)
		}
	}
	//console.log("tri :",tri)
	return(tri);
}*/

function index_to_triangle_V2(posInChunk,vertices){ // ex : posInChunk = [0,0] ---> [x,y] 0,0 <= x,y <= chkSize,chkSize

	//  a b
	//  c d  --->  [Pa,Pb,Pc, Pd,Pc,Pb] si x + z = pair ou [Pa,Pb,Pd, Pd,Pc,Pa] si x + z = impair

	const X = posInChunk[0];
	const Z = posInChunk[1];

	const a = index_list[X][Z];
	const b = index_list[X][Z+1];
	const c = index_list[X+1][Z];
	const d = index_list[X+1][Z+1];
	//console.log("test :",a,b,c,d)

	let tri = [];

	if( (X+Z) % 2 === 0 ){
		/*
		tri = [
		vertices[a].position , vertices[b].position , vertices[c].position ,
		vertices[d].position , vertices[c].position , vertices[b].position ,
		]*/
		if( vertices[a].exist && vertices[b].exist && vertices[c].exist ){
			tri.push(vertices[a].position);
			tri.push(vertices[b].position);
			tri.push(vertices[c].position);
		}
		if( vertices[d].exist && vertices[c].exist && vertices[b].exist ){
			tri.push(vertices[d].position);
			tri.push(vertices[c].position);
			tri.push(vertices[b].position);
		}

	}
	if( (X+Z) % 2 === 1 ){
		/*
		tri = [
		vertices[a].position , vertices[b].position , vertices[d].position ,
		vertices[d].position , vertices[c].position , vertices[a].position ,
		]*/
		if( vertices[a].exist && vertices[b].exist && vertices[d].exist ){
			tri.push(vertices[a].position);
			tri.push(vertices[b].position);
			tri.push(vertices[d].position);
		}
		if( vertices[d].exist && vertices[c].exist && vertices[a].exist ){
			tri.push(vertices[d].position);
			tri.push(vertices[c].position);
			tri.push(vertices[a].position);
		}
	}
	//console.log("tri :",tri)
	return(tri);
}

/*
function triangles_to_floats1(triangles,vertices){
	let L = []
	for( tri of triangles ){
	for( index of tri ){
		const p = vertices[index];
	for( i of p ){
		L.push(i);
	}}}
	return(L)
}*/

function triangles_to_floats(triangles){
	let L = []
	for( tri of triangles ){
	for( vect of tri ){
	for( i of vect ){
		L.push(i);
	}}}
	return(L)
}

function generate_triangles(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;

	//verts = generate_vertices(chunk_coordinates);
	//verts = generate_vertices_V2(chunk_coordinates);
	verts = vertices_surface_gen(chunk_coordinates);

	triangles = [];

	for( x = 0; x < chksize; x++){
	for( z = 0; z < chksize; z++){
		//triangles.push( index_to_triangle( [x,z] ,verts) );
		triangles.push( index_to_triangle_V2( [x,z] ,verts) );
	}}



	return(triangles)
}

/*
function temp_antiundefined(liste){
	let L = [];
	for( e of liste){
		if( e != undefined){
			L.push(e)
		}
	}
	return(L)
}*/

function gen_mesh(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;

	const tris = generate_triangles( chunk_coordinates );
	const trisfloat = triangles_to_floats(tris);

	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array( trisfloat );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

	geometry.computeVertexNormals();
	geometry.normalizeNormals();

	const material = new THREE.MeshPhongMaterial( {side : THREE.DoubleSide} );

	material.shadowSide = THREE.BackSide;
	//évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
	

	const mesh = new THREE.Mesh( geometry, material );
	//console.log(mesh.geometry.attributes.position)

	mesh.position.set(
		chunk_coordinates[0]*chksize,
		chunk_coordinates[1]*chksize,
		chunk_coordinates[2]*chksize,
		);

	mesh.castShadow = true;
	mesh.receiveShadow = true;

	mesh.material.color = {
		r: 0.8,
		g: 0.5+0.1*chunk_coordinates[1],
		b: 0.0,
	};

	
	put_in_chunk(mesh);
}


function generable_mesh(chunk_coordinates){
	if( chunk_coordinates in Chunk.data.list ){
			gen_mesh(chunk_coordinates);
		}
}


//new Chunk([1,0,0]);
//gen_mesh( [1,0,0] )





/*

let tris = generate_triangles( [0,0,0] );

trisfloat = triangles_to_floats(tris)






	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array( trisfloat );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

	geometry.computeVertexNormals();
	geometry.normalizeNormals();

	const material = new THREE.MeshPhongMaterial( { side : THREE.DoubleSide } );

	material.shadowSide = THREE.BackSide;
	//évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
	

	const mesh = new THREE.Mesh( geometry, material );
	//console.log(mesh.geometry.attributes.position)

	mesh.position.set(
		0.0,
		0.1,
		0.0,
		);

	mesh.castShadow = true;
	mesh.receiveShadow = true;

	
	put_in_chunk(mesh);
	//scene.add(mesh);
	
	
	mesh.material.color = {
		r: 0.8,
		g: 0.3,
		b: 0.0,
	};



*/











/*
//console.log( create_vertices([0,0,0]) );
//console.log( triangles_from_vertices(create_vertices([0,0,0])) );

{
	const verts = [
		[0.,0.,0.], [1.,0.,0.], [2.,0.,0.], [3.,0.,0.],
		[0.,0.,1.], [1.,0.,1.], [2.,0.,1.], [3.,0.,1.],
		[0.,0.,2.], [1.,0.,2.], [2.,0.,2.], [3.,0.,2.],
		[0.,0.,3.], [1.,0.,3.], [2.,0.,3.], [3.,0.,3.],
		]


	//console.log("verts",verts)

	const triangles = [ // triangles non-alternés
		[0,1,3], [1,2,4],
		[4,3,1], [5,4,2],

		//[3,4,6], //[4,5,7],
		[7,6,4], //[8,7,5],
		]
		
	const triangles = [ // triangles alternés
		[0,1,3], [1,2,5],
		[4,3,1], [5,4,1],

		//[3,4,7], //[4,5,7],
		[7,6,3], //[8,7,5],
		]
	
	for( tri of triangles ){
		console.log("tri",tri)
		for( index of tri ){
			console.log("verts[index]",verts[index])
			for( i of verts[index]){
				console.log("i",i)
			}
		}
	}

	//console.log("triangles",triangles)
	//console.log(triangles_to_floats1(triangles,verts))

	_triangles = triangles_to_floats1(triangles,verts);
	//console.log(_triangles)

	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array( _triangles );
	//console.log(vertices)
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

	geometry.computeVertexNormals();
	geometry.normalizeNormals();

	const material = new THREE.MeshPhongMaterial( { side : THREE.DoubleSide } );

	material.shadowSide = THREE.BackSide;
	//évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
	

	const mesh = new THREE.Mesh( geometry, material );
	//console.log(mesh.geometry.attributes.position)

	mesh.position.set(
		0.0,
		-0.1,
		0.0,
		);

	mesh.castShadow = true;
	mesh.receiveShadow = true;

	
	//put_in_chunk(mesh);
	scene.add(mesh);
	
	
	mesh.material.color = {
		r: 0.8,
		g: 0.3,
		b: 0.0,
	};
}*/

/*
const verts = [
		[0.,0.,0.], [1.,0.,0.], [2.,0.,0.], [3.,0.,0.],
		[0.,0.,1.], [1.,0.,1.], [2.,0.,1.], [3.,0.,1.],
		[0.,0.,2.], [1.,0.,2.], [2.,0.,2.], [3.,0.,2.],
		[0.,0.,3.], [1.,0.,3.], [2.,0.,3.], [3.,0.,3.],
		]

const dir = [
		0, -1, 0, 0,
		-1, 0, 0, 1,
		0, 0, 0, 1,
		0, 0, 1, 0,
		]*/


//==================================

function gen_y(x,Ystart,z){
	let L = [];

	const chksize = Chunk.data.chunkSize;

	for( let y = Ystart - chksize/2 - 1; y <= Ystart + chksize/2; y++ ){
			//taille de la liste chksize+1
			//pour connaître le point hors chunk pour surface_gen_y
		ynoise = noise.perlin3(x/30,y/30,z/30);
		Y = (ynoise >= 0) ? 1 : 0;
		L.push(Y)
	}
	return(L)
}

function surface_gen_y(liste){
	//liste = [1,1,1,0,0,0,1,1,0,1,1,0,...]
	let L = [];

	for( let i = 1; i < liste.length; i++){
		diff = liste[i] - liste[i-1]
		L.push(diff)
	}
	return(L)
}

function surface_gen(chunk_coordinates){
	let L = {};

	const chksize = Chunk.data.chunkSize;

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;

	for (let x = -chksize/2; x <= chksize/2; x++) {
	for (let z = -chksize/2; z <= chksize/2; z++) {
		const ylist = surface_gen_y(gen_y( x + Xstart, Ystart, z + Zstart ))
		L[[x,z]] = ylist;
	}}
	return(L)
}


function visualizer_surface_gen(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;

	const cave = new THREE.Group();

	const lenght = 0.3;

	const geo = new THREE.BoxGeometry( lenght, lenght, lenght );
	const mat1 = new THREE.MeshPhongMaterial( {color : "#ff0000"} );
	const mat0 = new THREE.MeshPhongMaterial( {color : "#00ff00"} );
	const mat_1 = new THREE.MeshPhongMaterial( {color : "#0000ff"} );
	
	
	const surface = surface_gen(chunk_coordinates);

	for (let x = -chksize/2; x <= chksize/2; x++) {
	for (let y = 0; y <= chksize; y++) {
	for (let z = -chksize/2; z <= chksize/2; z++) {


		if( surface[[x,z]][y] === 1 ){
			
			const visualBox = new THREE.Mesh( geo, mat1 );
			visualBox.position.set(x,y,z);
			cave.add( visualBox );
		}
		/*
		if( surface[[x,z]][y] === 0 ){
			
			const visualBox = new THREE.Mesh( geo, mat0 );
			visualBox.position.set(x,y,z);
			cave.add( visualBox );
		}*/
		if( surface[[x,z]][y] === -1 ){
			
			const visualBox = new THREE.Mesh( geo, mat_1 );
			visualBox.position.set(x,y,z);
			cave.add( visualBox );
		}

		
		

		
	}}}

	scene.add(cave);
	//put_in_chunk(cave);


	//worldOctree.fromGraphNode( cave );
	cave.position.set(Xstart,Ystart,Zstart);
}

/*
for(let x = -3; x <= 3; x++){
for(let y = -1; y <= 1; y++){
for(let z = -3; z <= 3; z++){
	visualizer_surface_gen([x,y,z]);
}}}
*/
/*const obj = {
			position : [x,y,z],
			exist : false,
		}*/

function vertices_surface_gen(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;
	
	let L = [];
	
	const surface = surface_gen(chunk_coordinates);

	for (let x = -chksize/2; x <= chksize/2; x++) {
	for (let y = 0; y <= chksize; y++) {
	for (let z = -chksize/2; z <= chksize/2; z++) {

		const obj = {
				position : [x,y-chksize/2,z],
				exist : false,
			}

		if( surface[[x,z]][y] === 1 ){
			obj.exist = true;
		}
	}}}
	return(L)
}