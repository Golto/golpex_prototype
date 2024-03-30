let lastChunk ;
let newChunk ;

let infoText = document.getElementById("info");

class Chunk{

	static data = {
		debug : false,
		renderDistance : 7,//3,
		renderDistanceLoad : 3,
		maxLoad : 1,
		chunkSize : 20,//42,
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
		xInit : 2, 
		yInit : 1,
		zInit : 2,

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

		if (Chunk.data.lenght > 200) {

			//delete Chunk.data.list[this.chunkPosition];
			//Chunk.data.lenght -= 1;
		}
		
	}

	render(){
		this.group.visible = distance1(player.position,this.worldPosition) < Chunk.data.chunkSize*Chunk.data.renderDistance ;

	}



	static get in_chunk(){
		return(in_chunk(player))
	}

	static newChunk(chunkPosition){
		new Chunk( chunkPosition ).render();

		new Terrain( chunkPosition );
		//Terrain.genMesh(chunkPosition);
	}

	static genInitChunks(){
		let loaded = 0;
		const totalLoad = (2*Chunk.data.xInit+1)*(2*Chunk.data.yInit+1)*(2*Chunk.data.zInit+1);

		for (let x = -Chunk.data.xInit ; x <= Chunk.data.xInit; x++){
		for (let y = -Chunk.data.yInit ; y <= Chunk.data.yInit; y++){
		for (let z = -Chunk.data.zInit ; z <= Chunk.data.zInit; z++){
			Chunk.newChunk([x,y,z]);
			loaded += 1;
		}}
		//console.log(Math.round(n/totalLoad*100),"load init");
		infoText.innerText = Math.round(loaded/totalLoad*100) + "load new chunks";
		}
	}

	static genNewChunks(){

		const chk_p = Chunk.in_chunk;
		const rd = Chunk.data.renderDistanceLoad;
		//const rd = Chunk.data.renderDistance;
		const chkList = Chunk.data.list;

		//console.log(chk_p,rd)
		const nxa = Math.max( Chunk.data.xMin, chk_p[0]-rd ) 
		const nxb = Math.min( Chunk.data.xMax, chk_p[0]+rd )

		const nya = Math.max( Chunk.data.yMin, chk_p[1]-rd )
		const nyb = Math.min( Chunk.data.yMax, chk_p[1]+rd )

		const nza = Math.max( Chunk.data.zMin, chk_p[2]-rd )
		const nzb = Math.min( Chunk.data.zMax, chk_p[2]+rd )

		let loaded = 0;
		/*const totalLoad = (-nxa+1+nxb)*(-nya+1+nyb)*(-nza+1+nzb);*/

		/*
		for( let x = nxa; x <= nxb; x++){
		for( let y = nya; y <= nyb; y++){
		for( let z = nza; z <= nzb; z++){
			//			PARTICULIEREMENT LOURD EN PERFORMANCE
			if( !([x,y,z] in chkList ) && (distance2(chk_p,[x,y,z]) < rd) ){
				new_chunk([x,y,z]);
				loaded += 1;
			}

			
			

		}}
		infoText.innerHTML = Math.round(loaded/totalLoad*100) + "load new chunks";
		console.log(Math.round(loaded/totalLoad*100),"load new chunks");
		}*/
		
		/*
		for( let x = nxa; x <= nxb; x++){
		for( let y = nya; y <= nyb; y++){
		for( let z = nza; z <= nzb; z++){
			//			PARTICULIEREMENT LOURD EN PERFORMANCE
			if( !([x,y,z] in chkList ) && (distance2(chk_p,[x,y,z]) < rd) ){
				new_chunk([x,y,z]);
				loaded += 1;
			}
			if (loaded >= 50) {return}

			
			

		}}
		infoText.innerHTML = Math.round(loaded/totalLoad*100) + "load new chunks";
		console.log(Math.round(loaded/totalLoad*100),"load new chunks");
		}*/



		
		const dict = {};
		const distKeys = [];

		for( let x = nxa; x <= nxb; x++){
		for( let y = nya; y <= nyb; y++){
		for( let z = nza; z <= nzb; z++){

			if (!([x,y,z] in chkList)) {
				const dist = distance2(chk_p,[x,y,z]);
				if (dist < rd )  {


					dict[ [x,y,z] ] = dist;
					distKeys.push( dist );
				}
			}
			
			
		}}}
		distKeys.sort();
		
		//console.log(dict)
		//console.log(distKeys)

/*
		for( let i of distKeys ){
			//console.log( toArray(keyOf(dict, i)) )
			new_chunk( toArray(keyOf(dict, i)) );
			console.log('test',i)
			loaded += 1;
			
			if (loaded >= 2) {return}
		}*/
		for( let i of distKeys ){
			//console.log( toArray(keyOf(dict, i)) )
			//new_chunk( toArray(keyOf(dict, i)) );
			const allchks = allKeysOfValue( dict, i );
			for (let chk of allchks) {
				//new_chunk( toArray(chk) );
				Chunk.newChunk(toArray(chk));
				loaded += 1;
				if (loaded >= Chunk.data.maxLoad) {return}
			}
			
		}
	}

	//
}

function keyOf(obj,value){
	for (let i in obj) {
		if (obj[i] === value) {return(i)}
	}
	return(false)
}

function toArray(string){
	// "0,0,0" => [0,0,0]
	const L = string.split(",");
	for( let i in L){
		L[i] = Math.floor(L[i]);
	}
	return(L)
}

function allKeysOfValue(obj,value){
	const L = [];
	for (let i in obj) {
		if (obj[i] === value) {L.push(i)}
	}
	return(L)
}

//----------------------------

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

		for (let x = Xinf ; x <= Xsup; x++){
		for (let y = Yinf ; y <= Ysup; y++){
		for (let z = Zinf ; z <= Zsup; z++){
			//console.log([x,y,z])
			if( [x,y,z] in Chunk.data.list ){
				Chunk.data.list[[x,y,z]].render();
			}
		}}}

		//Chunk.genNewChunks();//à mettre pour s'assurer qu'un chunk se génére
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
	newChunk = in_chunk(player);
	infoText.innerText = newChunk + " " + Chunk.data.lenght; // pas obligatoire
	render_chunks(lastChunk,newChunk);
	lastChunk = newChunk;
}


function collision_on_chunk(chunk_coordinates){
	const group = Chunk.data.list[ chunk_coordinates ].group;
	//console.log(worldOctree)
	worldOctree.fromGraphNode( group );
}


//OBSOLETE
function new_chunk(chunk_coordinates){
	if( !(chunk_coordinates in Chunk.data.list) ){
		new Chunk( chunk_coordinates );
		//console.log( "Chunk :", chunk_coordinates, "created" )

		//------------------------------------------------------
		//A CHANGER
		/*
		genMesh(
			chunk_coordinates,
			()=>{
				collision_on_chunk(chunk_coordinates)
				}
		);*/


		//collision_on_chunk(chunk_coordinates);
		

		if( (chunk_coordinates[0] >= -5 && chunk_coordinates[0] <= 5) &&
			(chunk_coordinates[2] >= -10 && chunk_coordinates[2] <= -5)
		 ){
			//rien
		}else{
			genMesh(
				chunk_coordinates,
				()=>{
					collision_on_chunk(chunk_coordinates)
					}
			);
		}


		/*
		if( (chunk_coordinates[0] >= -10 && chunk_coordinates[0] <= 10) &&
			(chunk_coordinates[0] >= -3 && chunk_coordinates[0] <= 3) &&
			(chunk_coordinates[2] >= 1 && chunk_coordinates[2] <= 20)
		 ){
		 	genMesh(chunk_coordinates);
		 	collision_on_chunk(chunk_coordinates);

		}else{
			if(chunk_coordinates[1] === 0){
				generable_meshTerrain(chunk_coordinates);
				collision_on_chunk(chunk_coordinates);
			}
		}
		*/
	}
	else{
		//console.log( "Chunk :", chunk_coordinates, "already exist" )
	}
}

//OBSOLETE
function genInitChunks(){
	let n = 0;
	const totalLoad = (2*Chunk.data.xInit+1)*(2*Chunk.data.yInit+1)*(2*Chunk.data.zInit+1);

	for (let x = -Chunk.data.xInit ; x <= Chunk.data.xInit; x++){
	for (let y = -Chunk.data.yInit ; y <= Chunk.data.yInit; y++){
	for (let z = -Chunk.data.zInit ; z <= Chunk.data.zInit; z++){
		new_chunk([x,y,z]);
		n += 1;
	}}
	console.log(Math.round(n/totalLoad*100),"load init");
	}
}

