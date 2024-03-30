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

//const index_list = index_generator()

//===========================================================================

function visualizer2(map, chunk_coordinates, l = .3, detail = 1, c0 = "#ffffff", c1 = "#ffffff" ){
	const chksize = Chunk.data.chunkSize;

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;

	const cave = new THREE.Group();

	const geo = new THREE.BoxGeometry( l, l, l );

	for (let x = -chksize/2; x <= chksize/2; x += detail) {
	for (let y = -chksize/2; y <= chksize/2; y += detail) {
	for (let z = -chksize/2; z <= chksize/2; z += detail) {

		if( map[[x,y,z]] === 1 ){
			const mat = new THREE.MeshPhongMaterial( {color : c0});
			const visualBox = new THREE.Mesh( geo, mat );

			visualBox.position.set(x,y,z);
			cave.add( visualBox );
		}
		if( map[[x,y,z]] === 0 ){
		}
		if( map[[x,y,z]] === -1 ){
			const mat = new THREE.MeshPhongMaterial( {color : c1});
			const visualBox = new THREE.Mesh( geo, mat );

			visualBox.position.set(x,y,z);
			cave.add( visualBox );
		}
		
	}}}


	scene.add(cave);
	cave.position.set(Xstart,Ystart,Zstart);

	return(map)
}

//----

function underground_gen(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;
	const map = {};

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;

	for (let x = -chksize/2 - 1; x <= chksize/2 + 1; x++) {
	for (let y = -chksize/2 - 1; y <= chksize/2 + 1; y++) {
	for (let z = -chksize/2 - 1; z <= chksize/2 + 1; z++) {
		//-chksize/2 - 1 et chksize/2 + 1 pour connaître l'état des bords

		const X = Xstart + x;
		const Y = Ystart + y;
		const Z = Zstart + z;

		const pn3 = (noise.perlin3(X/50,Y/50,Z/50) >= 0) ? 1 : 0;
		map[[x,y,z]] = pn3;
	}}}
	return(map)
}


function test_air(map){

	const chksize = Chunk.data.chunkSize;

	const newMap = {};

	for (let x = -chksize/2; x <= chksize/2; x++) {
	for (let y = -chksize/2; y <= chksize/2; y++) {
	for (let z = -chksize/2; z <= chksize/2; z++) {
		if(map[[x,y,z]]){
			if(!map[[x-1,y,z]] || !map[[x+1,y,z]] || !map[[x,y-1,z]] || !map[[x,y+1,z]] || !map[[x,y,z-1]] || !map[[x,y,z+1]]  ){
				newMap[[x,y,z]] = 1;
			}else{
				newMap[[x,y,z]] = 0;
			}
		}else{
			newMap[[x,y,z]] = 0;
		}
		
	}}}
	return(newMap)
}

function d_dx(map){

	const chksize = Chunk.data.chunkSize;

	const newMap = {};

	for (let x = -chksize/2; x <= chksize/2; x++) {
	for (let y = -chksize/2; y <= chksize/2; y++) {
	for (let z = -chksize/2; z <= chksize/2; z++) {
		newMap[[x,y,z]] = map[[x,y,z]] - map[[x+1,y,z]]
		
	}}}
	return(newMap)
}
function d_dy(map){

	const chksize = Chunk.data.chunkSize;

	const newMap = {};

	for (let x = -chksize/2; x <= chksize/2; x++) {
	for (let y = -chksize/2; y <= chksize/2; y++) {
	for (let z = -chksize/2; z <= chksize/2; z++) {
		newMap[[x,y,z]] = map[[x,y,z]] - map[[x,y+1,z]]
		
	}}}
	return(newMap)
}
function d_dz(map){

	const chksize = Chunk.data.chunkSize;

	const newMap = {};

	for (let x = -chksize/2; x <= chksize/2; x++) {
	for (let y = -chksize/2; y <= chksize/2; y++) {
	for (let z = -chksize/2; z <= chksize/2; z++) {
		newMap[[x,y,z]] = map[[x,y,z]] - map[[x,y,z+1]]
		
	}}}
	return(newMap)
}




function sort_vertices_by_direction(map){

	const chksize = Chunk.data.chunkSize;

	const obj = {
		"+" : [],
		"-" : [],
	};

	for (let x = -chksize/2; x <= chksize/2; x++) {
	for (let y = -chksize/2; y <= chksize/2; y++) {
	for (let z = -chksize/2; z <= chksize/2; z++) {

		switch(map[[x,y,z]]){
			case 1 :
				//obj["+"][[x,y,z]] = true;
				obj["+"].push([x,y,z].toString());
				break;
			case 0 :
				break;
			case -1 :
				//obj["-"][[x,y,z]] = true;
				obj["-"].push([x,y,z].toString());
				break;
		}
		
	}}}
	return(obj)
}









/*
for(let i = -0; i <= 8; i++){
for(let j = -0; j <= 8; j++){
for(let k = -0; k <= 0; k++){
	const map = underground_gen([i,j,k])
	visualizer2(map,[i,j,k],.3,4,"#000000")
	visualizer2(map,[i+12,j,k],.3,4,"#000000")
	visualizer2(map,[i+12,j+12,k],.3,4,"#000000")
	visualizer2(map,[i,j+12,k],.3,4,"#000000")

	const testair = test_air(map);
	visualizer2(testair,[i,j,k],.5,1,"#ff0000")

	const mapx = d_dx(map);
	visualizer2(mapx,[i+12,j,k],.5,1,"#00ff00","#0000ff")

	const mapy = d_dy(map);
	visualizer2(mapy,[i+12,j+12,k],.5,1,"#00ff00","#0000ff")

	const mapz = d_dz(map);
	visualizer2(mapz,[i,j+12,k],.5,1,"#00ff00","#0000ff")
}}}*/


/*
for(let i = -0; i <= 0; i++){
for(let j = 0; j <= 0; j++){
for(let k = -0; k <= 0; k++){
	const map = underground_gen([i,j,k])
	visualizer2(map,[i,j,k],.3,1,"#000000")

	const mapy = d_dy(map);
	visualizer2(mapy,[i,j,k],.5,1,"#00ff00","#0000ff")
}}}*/



const map0 = underground_gen([0,4,0])
//visualizer2(map0,[0,4,0],.1,1,"#000000")

const map0air = test_air(map0)
visualizer2(map0air,[0,4,0],.3,1,"#00ff00")

/*
const map1 = underground_gen([0,4,2])
visualizer2(map1,[0,4,2],.1,1,"#000000")

const map1air = test_air(map1)
visualizer2(map1air,[0,4,2],.3,1,"#00ff00")


const map2 = underground_gen([0,4,-4])
visualizer2(map2,[0,4,-4],.1,1,"#000000")

const map2air = test_air(map2)
visualizer2(map2air,[0,4,-4],.3,1,"#00ff00")


const map3 = underground_gen([1,3,-4])
visualizer2(map3,[1,3,-4],.1,1,"#000000")

const map3air = test_air(map3)
visualizer2(map3air,[1,3,-4],.3,1,"#00ff00")
*/

/*
for (let x = -3; x <= 3; x++) {
for (let y = 0; y <= 12; y++) {
for (let z = -3; z <= 3; z++) {
	const map = underground_gen([x,y,z])

	const mapair = test_air(map)
	visualizer2(mapair,[x,y,z],.3,1,"#00ff00")
}}}*/



//const mapy0 = d_dy(map0);
//visualizer2(mapy0,[0,4,0],.5,1,"#00ff00","#0000ff")
/*
const map1 = underground_gen([0,3,0])
visualizer2(map1,[0,2,0],.3,1,"#ffffff")

const mapy1 = d_dy(map1);
visualizer2(mapy1,[0,2,0],.5,1,"#ffff00","#0000ff")
*/


function array_to_triangle_sup(vertices){

	const chksize = Chunk.data.chunkSize;

	const square = [];
		
	//if( vertices.indexOf(["-2,somey,-2"]) !== -1 && array.indexOf(["-2+1,somey,-2"]) && array.indexOf(["-2,somey,-2+1"]) ){console.log("ok0")}
	//if( vertices.indexOf(["1,somey,1"]) && array.indexOf(["1+1,somey,2"]) && array.indexOf(["1,somey,1+1"]) ){console.log("ok0")}

	for(let x = -chksize/2; x < chksize/2; x++){
	for(let z = -chksize/2; z < chksize/2; z++){

		const pointA = [x,0,z]
		const pointB = [x+1,0,z]
		const pointC = [x,0,z+1]
		const pointD = [x+1,0,z+1]

		boolA = vertices.indexOf(pointA.toString()) !== -1;
		boolB = vertices.indexOf(pointB.toString()) !== -1;
		boolC = vertices.indexOf(pointC.toString()) !== -1;
		boolD = vertices.indexOf(pointD.toString()) !== -1;

		if(boolA /*&& boolB && boolC && boolD*/){
			square.push(pointA, pointB, pointC);
			square.push(pointD, pointC, pointB);
		}
	}}

	return(square);
}

function triangles_to_floats2(triangles){
	console.log("trig",triangles)
	let L = []
	for( tri of triangles ){
	for( i of tri ){
		for( j of i ){

		L.push(j);
	}
	}}
	return(L)
}

function gen_mesh2(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;

	const tris = array_to_triangle_sup( sort_vertices_by_direction( d_dy( underground_gen(chunk_coordinates) ) )["+"] );

	const trisfloat1 = triangles_to_floats2(tris);

	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array( trisfloat1 );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

	geometry.computeVertexNormals();
	geometry.normalizeNormals();

	const material = new THREE.MeshPhongMaterial(  );//{side : THREE.DoubleSide}

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

//new_chunk( [0,4,0] );
//gen_mesh2( [0,4,0] );



const map00 = underground_gen([0,4,0]);
const map00y = d_dy(map00);
const objmap00y = sort_vertices_by_direction(map00y);

//console.log("objmap00y[\"+\"]",objmap00y["+"]);
/*
const trimap00y = array_to_triangle_sup(objmap00y["+"]);
console.log("array to triangles", trimap00y );
const floatmap00y = triangles_to_floats2(trimap00y);
console.log("triangle to floats", floatmap00y );*/



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
	let liste = [];
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
	let liste = [];

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
/*
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
*/
//--------------------------------

function generate_vertices(chunk_coordinates){
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

		
		y0 = 100*noise.perlin2(X/300,Z/300);
		y = -Ystart + 20*noise.perlin2(X/30,Z/30) + y0;//continu
		//y = Math.floor(y);
		

		const obj = {
			position : [x,y,z],
			exist : false,
			status : "SUP",
		}

		if( y >= 0 && y <= chksize ){
			obj.exist = true;
		}

		L.push( obj )
	}}
	return(L)
}

//--------------------------------

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
}}}*/

/*
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
		L.push( obj );
	}}}
	return(L)
}*/

function vertices_surface_gen(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;
	
	let L = [];
	
	const surface = surface_gen(chunk_coordinates);

	for (let x = -chksize/2; x <= chksize/2; x++) {
	for (let z = -chksize/2; z <= chksize/2; z++) {
		
		const obj = {
					position : [x,0,z],
					exist : false,
					status : "SUP",
				}

		for (let y in surface[[x,z]] ) {

			

			if( surface[[x,z]][y] === 1 ){
				obj.position = [x,y-chksize/2,z]
				obj.exist = true;
				break
			}
			
		}
		L.push( obj );
	}}
	return(L)
}

function vertices_sousterrain_gen(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;
	
	let L = [];
	
	const surface = surface_gen(chunk_coordinates);

	for (let x = -chksize/2; x <= chksize/2; x++) {
	for (let z = -chksize/2; z <= chksize/2; z++) {
		
		const obj = {
					position : [x,0,z],
					exist : false,
					status : "SUB",
				}

		for (let y in surface[[x,z]] ) {

			

			if( surface[[x,z]][y] === -1 ){
				obj.position = [x,y-chksize/2,z]
				obj.exist = true;
				break
			}
			
		}
		L.push( obj );
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

	let tri = [];

	if( (X+Z) % 2 === 0 ){
		
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
	return(tri);
}*/

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

	let tri = [];

	if( (X+Z) % 2 === 0 ){
		
		if( vertices[a].exist && vertices[b].exist && vertices[c].exist ){
			
			tri.push(vertices[a].position);
			if( vertices[a].status === "SUP"){
				tri.push(vertices[b].position);
				tri.push(vertices[c].position);
			}
			if( vertices[a].status === "SUB"){
				tri.push(vertices[c].position);
				tri.push(vertices[b].position);
			}
			
		}
		if( vertices[d].exist && vertices[c].exist && vertices[b].exist ){
			
			tri.push(vertices[d].position);
			if( vertices[d].status === "SUP"){
				tri.push(vertices[c].position);
				tri.push(vertices[b].position);
			}
			if( vertices[d].status === "SUB"){
				tri.push(vertices[b].position);
				tri.push(vertices[c].position);
			}
			
		}

	}
	if( (X+Z) % 2 === 1 ){
		
		if( vertices[a].exist && vertices[b].exist && vertices[d].exist ){

			tri.push(vertices[a].position);
			if( vertices[a].status === "SUP"){
				tri.push(vertices[b].position);
				tri.push(vertices[d].position);
			}
			if( vertices[a].status === "SUB"){
				tri.push(vertices[d].position);
				tri.push(vertices[b].position);
			}
		}
		if( vertices[d].exist && vertices[c].exist && vertices[a].exist ){

			tri.push(vertices[d].position);
			if( vertices[d].status === "SUP"){
				tri.push(vertices[c].position);
				tri.push(vertices[a].position);
			}
			if( vertices[d].status === "SUB"){
				tri.push(vertices[a].position);
				tri.push(vertices[c].position);
			}
		}
	}
	return(tri);
}


function triangles_to_floats(triangles){
	let L = []
	for( tri of triangles ){
	for( vect of tri ){
	for( i of vect ){
		L.push(i);
	}}}
	return(L)
}

function generate_triangles1(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;

	const verts = generate_vertices(chunk_coordinates);//1

	let triangles = [];

	for( x = 0; x < chksize; x++){
	for( z = 0; z < chksize; z++){
		triangles.push( index_to_triangle( [x,z] ,verts) );
	}}
	return(triangles)
}


function generate_triangles2(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;

	const verts = vertices_surface_gen(chunk_coordinates);//2

	let triangles = [];

	for( x = 0; x < chksize; x++){
	for( z = 0; z < chksize; z++){
		triangles.push( index_to_triangle( [x,z] ,verts) );
	}}
	return(triangles)
}

function generate_triangles3(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;

	const verts = vertices_sousterrain_gen(chunk_coordinates);//3

	let triangles = [];

	for( x = 0; x < chksize; x++){
	for( z = 0; z < chksize; z++){
		triangles.push( index_to_triangle( [x,z] ,verts) );
	}}
	return(triangles)
}







function gen_mesh(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;

	const tris1 = generate_triangles1( chunk_coordinates );
	const tris2 = generate_triangles2( chunk_coordinates );
	const tris3 = generate_triangles3( chunk_coordinates );
	/*
	let trisfloat2 = triangles_to_floats(tris2);
	let trisfloat3 = triangles_to_floats(tris3);
	for( let e of trisfloat3){
		trisfloat2.push( e );
	}*/
	let trisfloat1 = triangles_to_floats(tris1);

	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array( trisfloat1 );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

	geometry.computeVertexNormals();
	geometry.normalizeNormals();

	const material = new THREE.MeshPhongMaterial(  );//{side : THREE.DoubleSide}

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

