let lastChunk ;
let newChunk ;

let infoText = document.getElementById("info");

class Chunk{

	static data = {
		debug : false,
		renderDistance : 4,//4
		chunkSize : 20,//21,//64
		xMax : 100,
		xMin : -100,
		yMax : 20,
		yMin : -20,
		zMax : 100,
		zMin : -100,

	//conditions :
	// xMin <= -xInit <= 0 <= xInit <= xMax
	// yMin <= -yInit <= 0 <= yInit <= yMax
	// zMin <= -zInit <= 0 <= zInit <= zMax
		xInit : 8, 
		yInit : 5,//bug ici si /= 0, liée à gen_mesh et generate_vertices_V2,
		zInit : 8,

		list : {},
		lenght : 0,//au delà de 1000 chunks sur la ram => lag
	}

	constructor(position = undefined) {
		this.chunkPosition = position;
		this.worldPosition = {
			x : Chunk.data.chunkSize*this.chunkPosition[0],
			y : Chunk.data.chunkSize*this.chunkPosition[1],
			z : Chunk.data.chunkSize*this.chunkPosition[2],
		}
		this.group = new THREE.Group();
		this.group.visible = false
		
		this.group.position.x = 0;
		this.group.position.y = 0;
		this.group.position.z = 0;

		scene.add(this.group)
		

		Chunk.data.list[this.chunkPosition] = this;
		Chunk.data.lenght += 1; 
		
	}

	render(){
		this.group.visible = distance1(player.position,this.worldPosition) < Chunk.data.chunkSize*Chunk.data.renderDistance ;

	}



	static get in_chunk(){
		return(in_chunk(player))
	}

	static gen_new_chunk(){

		const chk_p = Chunk.in_chunk;
		const rd = Chunk.data.renderDistance;

		//console.log(chk_p,rd)
		const nxa = Math.max( Chunk.data.xMin, chk_p[0]-rd ) 
		const nxb = Math.min( Chunk.data.xMax, chk_p[0]+rd )

		const nya = Math.max( Chunk.data.yMin, chk_p[1]-rd )
		const nyb = Math.min( Chunk.data.yMax, chk_p[1]+rd )

		const nza = Math.max( Chunk.data.zMin, chk_p[2]-rd )
		const nzb = Math.min( Chunk.data.zMax, chk_p[2]+rd )


		for( var x = nxa; x <= nxb; x++){
		for( var y = nya; y <= nyb; y++){
		for( var z = nza; z <= nzb; z++){
			//			PARTICULIEREMENT LOURD EN PERFORMANCE
			new_chunk([x,y,z]);
			/*
			console.log(distance1(chk_p,[x,y,z]) < rd)
			// Générer dans un cercle plutôt qu'un carré
			if(distance1(chk_p,[x,y,z]) < rd){
				new_chunk([x,y,z]);
				console.log("gen chunk :", [x,y,z])
			}
			*/
		}}}
		
	}
}


function is_chunk_update(lastChunk,newChunk){
	//return( !(lastChunk === newChunk) ); //bizarre : [0,0,0] != [0,0,0] en js
	if (lastChunk === undefined || newChunk === undefined){
		return false
	}
	return(
		lastChunk[0] !== newChunk[0] ||
		lastChunk[1] !== newChunk[1] ||
		lastChunk[2] !== newChunk[2]
		);
}

function render_chunks(lastChunk,newChunk){
	//infoText.innerHTML = "chunk : " + newChunk;
	//Système imparfait en cas de téléportation, les anciens chunks ne sont pas déchargés
	if (is_chunk_update(lastChunk,newChunk)){
		
		//console.log(Chunk.in_chunk)
		
		const Xinf = Math.max( Chunk.data.xMin , Math.floor( newChunk[0] - Chunk.data.renderDistance - 2 ) );
		const Xsup = Math.min( Chunk.data.xMax , Math.floor( newChunk[0] + Chunk.data.renderDistance + 2 ) );
		const Yinf = Math.max( Chunk.data.yMin , Math.floor( newChunk[1] - Chunk.data.renderDistance - 2 ) );
		const Ysup = Math.min( Chunk.data.yMax , Math.floor( newChunk[1] + Chunk.data.renderDistance + 2 ) );
		const Zinf = Math.max( Chunk.data.zMin , Math.floor( newChunk[2] - Chunk.data.renderDistance - 2 ) );
		const Zsup = Math.min( Chunk.data.zMax , Math.floor( newChunk[2] + Chunk.data.renderDistance + 2 ) );

		for (var x = Xinf ; x <= Xsup; x++){
		for (var y = Yinf ; y <= Ysup; y++){
		for (var z = Zinf ; z <= Zsup; z++){
			//console.log([x,y,z])
			if( [x,y,z] in Chunk.data.list ){
				Chunk.data.list[[x,y,z]].render();
			}
		}}}

		Chunk.gen_new_chunk();
	}
	
}

function in_chunk(entity){
	//entity.x à déterminer
	X = Math.floor( (entity.position.x + Chunk.data.chunkSize / 2) / Chunk.data.chunkSize );
	Y = Math.floor( (entity.position.y + Chunk.data.chunkSize / 2) / Chunk.data.chunkSize );
	Z = Math.floor( (entity.position.z + Chunk.data.chunkSize / 2) / Chunk.data.chunkSize );
	return( [X,Y,Z] )//=>A transformer en Vec3
}

function put_in_chunk(entity){

	if( in_chunk(entity) in Chunk.data.list ){
		Chunk.data.list[ in_chunk(entity) ].group.add( entity );
	}
}

function update_chunk(){
	newChunk = in_chunk(camera);//in_chunk(player.object);
	infoText.innerHTML = newChunk + " " + Chunk.data.lenght; // pas obligatoire
	render_chunks(lastChunk,newChunk);
	lastChunk = newChunk;
}







function debug_gen_y0(chunk_coordinates){
	const Xdebug = chunk_coordinates[0];
	const Ydebug = 0;
	const Zdebug = chunk_coordinates[2];

	const geometry = new THREE.BoxGeometry();
	const material = ((Xdebug+Zdebug+100)%2===1)?new THREE.MeshPhongMaterial( { color: 0x00ff00 }):new THREE.MeshPhongMaterial( { color: 0xffff00 });
	const cube = new THREE.Mesh( geometry, material );
			
	cube.position.x = Xdebug*Chunk.data.chunkSize ;
	cube.position.y = Ydebug*Chunk.data.chunkSize ;
	cube.position.z = Zdebug*Chunk.data.chunkSize ;
			
	cube.scale.x = Chunk.data.chunkSize;
	cube.scale.z = Chunk.data.chunkSize;


	cube.receiveShadow = true;


	put_in_chunk(cube);
}


function debug_gen_y1(chunk_coordinates){
	const Xdebug = chunk_coordinates[0];
	const Ydebug = chunk_coordinates[1];
	const Zdebug = chunk_coordinates[2];

	const geometry = new THREE.BoxGeometry();
	const material = ((Xdebug+Zdebug+Ydebug+100)%2===1)?new THREE.MeshPhongMaterial( { color: 0x00ff00 }):new THREE.MeshPhongMaterial( { color: 0xffff00 });
	const cube = new THREE.Mesh( geometry, material );
			
	cube.position.x = Xdebug*Chunk.data.chunkSize ;
	cube.position.y = Ydebug*Chunk.data.chunkSize ;
	cube.position.z = Zdebug*Chunk.data.chunkSize ;
			
	cube.scale.x = 3;
	cube.scale.z = 3;


	cube.receiveShadow = true;


	put_in_chunk(cube);
}




function collision_on_chunk(chunk_coordinates){
	const group = Chunk.data.list[ chunk_coordinates ].group;
	//console.log(worldOctree)
	worldOctree.fromGraphNode( group );
}


function new_chunk(chunk_coordinates){
	if( !(chunk_coordinates in Chunk.data.list) ){
		new Chunk( chunk_coordinates );
		//console.log( "Chunk :", chunk_coordinates, "created" )

		//------------------------------------------------------
		//A CHANGER

		
		

		if( (chunk_coordinates[0] >= 1 && chunk_coordinates[0] <= 5) &&
			(chunk_coordinates[2] >= 1 && chunk_coordinates[2] <= 5)
		 ){
		 	genMesh(chunk_coordinates);
		 	//collision_on_chunk(chunk_coordinates);

		}else if((chunk_coordinates[0] >= -4 && chunk_coordinates[0] <= 0) &&
			(chunk_coordinates[2] >= 1 && chunk_coordinates[2] <= 5)){
			generable_mesh(chunk_coordinates);
			//collision_on_chunk(chunk_coordinates);

		}else{
			if(chunk_coordinates[1] === 0){
				generable_meshTerrain(chunk_coordinates);
				collision_on_chunk(chunk_coordinates);
			}
		}


		//if( chunk_coordinates[1] === 1 || chunk_coordinates[1] === 0 ){
			//console.log( "chunk terrain :", chunk_coordinates);
			//debug_gen_y0(chunk_coordinates);
			

			//generable_meshTerrain(chunk_coordinates);
			//collision_on_chunk(chunk_coordinates);

			//generable_mesh(chunk_coordinates);
			//collision_on_chunk(chunk_coordinates);
			

		//}else{
			//debug_gen_y1(chunk_coordinates);
			//collision_on_chunk(chunk_coordinates);
		//}

		//------------------------------------------------------
		//generable_mesh(chunk_coordinates);
		//collision_on_chunk(chunk_coordinates);

		
		
		//------------------------------------------------------
	}
	else{
		//console.log( "Chunk :", chunk_coordinates, "already exist" )
	}
}



/*
function chunk_gen(){
	var n = 0;

	for (var x = Chunk.data.xMin ; x <= Chunk.data.xMax; x++){
	for (var y = Chunk.data.yMin ; y <= Chunk.data.yMax; y++){
	for (var z = Chunk.data.zMin ; z <= Chunk.data.zMax; z++){
		new_chunk( [x,y,z] );

		n += 1;
		console.log( "chunk :", Math.floor(n/(-Chunk.data.xMin+Chunk.data.xMax+1)/(-Chunk.data.yMin+Chunk.data.yMax+1)/(-Chunk.data.zMin+Chunk.data.zMax+1)*100) );
	}}}
}*/




//Pour retirer l'erreur, remplacer load_spawn par chunk_gen dans le mainChunk
function load_spawn(){

	const nx = Chunk.data.xInit;
	const ny = Chunk.data.yInit;
	const nz = Chunk.data.zInit;

	
	let pourcent = 0;
	for (let x = -nx ; x <= nx; x++){
	for (let y = -ny ; y <= ny; y++){
	for (let z = -nz ; z <= nz; z++){
		new_chunk( [x,y,z] );
		

		
		pourcent += 1;
		console.log( x,y,z,"generated :", Math.floor(100*pourcent/(2*nx+1)/(2*ny+1)/(2*nz+1)) );
		//infoText.innerHTML = Math.floor(pourcent);

		
		
	}}}
	//requestAnimationFrame( main_update );
	
/*
	function forLoopChunk(){
		new_chunk( [x,y,z] );
		pourcent += 1;
		//console.log( x,y,z,"generated :", Math.floor(100*pourcent/(2*nx+1)/(2*ny+1)/(2*nz+1)) );
		//infoText.innerHTML = Math.floor(100*pourcent/(2*nx+1)/(2*ny+1)/(2*nz+1));//14s//13s

		x += 1;
		if( x > nx ){
			x = -nx;
			y += 1;
		}
		if( y > ny ){
			y = -ny;
			z += 1;
		}
		if( z <= nz ){
			requestAnimationFrame( forLoopChunk );
		}else{
			requestAnimationFrame( main_update );
		}

	}

	let pourcent = 0;
	let x = -nx;
	let y = -ny;
	let z = -nz;

	requestAnimationFrame( forLoopChunk )*/


}

function genChunkInit(){
	load_spawn()
}