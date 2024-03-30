let lastChunk ;
let newChunk ;



class Chunk{
//class Chunk extends Entity{
	//static pour utiliser la class sans instance : Chunk.data
	//get pour utiliser uen fonction sans () : this.render au lieu de this.render()
	//set pour modifier des valeurs dans this

	static data = {
		debug : false,
		renderDistance : 3,
		chunkSize : 32,
		xMax : 10,
		xMin : -10,
		yMax : 2,
		yMin : -2,
		zMax : 10,
		zMin : -10,
		list : {},
		/*
		utiliser new map() pour conserver le type de la clé
		object : { variable : <value> }
		map    : { <value> : <value> }
		*/
		//list : new Map()
	}

	constructor(position = undefined) {
    	this.chunkPosition = position;
    	this.group = new THREE.Group();
    	this.group.visible = false
    	this.group.position.x = this.chunkPosition[0]*Chunk.data.chunkSize;
    	this.group.position.y = this.chunkPosition[1]*Chunk.data.chunkSize;
    	this.group.position.z = this.chunkPosition[2]*Chunk.data.chunkSize;

    	scene.add(this.group)
    	/*
    	super( 
    		position = Chunk.data.chunkSize*this.chunkPosition,
    		enabled = false,
    		visible = false,
    		)
    	*/
    	Chunk.data.list[this.chunkPosition] = this;
    	//Chunk.data.list.set( this.chunkPosition , this )
    	
	}

	render(){
		this.group.visible = distance(player.object,this.group) < Chunk.data.chunkSize*Chunk.data.renderDistance ;
	}

	get chunk_in(){}
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
	//Système imparfait en cas de téléportation, les anciens chunks ne sont pas déchargés
	if (is_chunk_update(lastChunk,newChunk)){
		
		const Xinf = Math.max( Chunk.data.xMin , Math.floor( newChunk[0] - Chunk.data.renderDistance - 2 ) );
		const Xsup = Math.min( Chunk.data.xMax , Math.floor( newChunk[0] + Chunk.data.renderDistance + 2 ) );
		const Yinf = Math.max( Chunk.data.yMin , Math.floor( newChunk[1] - Chunk.data.renderDistance - 2 ) );
		const Ysup = Math.min( Chunk.data.yMax , Math.floor( newChunk[1] + Chunk.data.renderDistance + 2 ) );
		const Zinf = Math.max( Chunk.data.zMin , Math.floor( newChunk[2] - Chunk.data.renderDistance - 2 ) );
		const Zsup = Math.min( Chunk.data.zMax , Math.floor( newChunk[2] + Chunk.data.renderDistance + 2 ) );

		for (var x = Xinf ; x <= Xsup; x++){
			for (var y = Yinf; y <= Ysup; y++){
				for (var z = Zinf; z <= Zsup; z++){
					Chunk.data.list[[x,y,z]].render();
			}}}
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
	Chunk.data.list[ in_chunk(entity) ].group.add( entity )
}

function update_chunk(){
	newChunk = in_chunk(player.object);
	render_chunks(lastChunk,newChunk);
	lastChunk = newChunk;
}

function chunk_gen(){

	for (var x = Chunk.data.xMin ; x <= Chunk.data.xMax; x++){
		for (var y = Chunk.data.yMin; y <= Chunk.data.yMax; y++){
			for (var z = Chunk.data.zMin; z <= Chunk.data.zMax; z++){
				new Chunk( [x,y,z] );
			}}}
}



//console.log(Chunk.data)

//console.log( Chunk.data.list.values() );

//Chunk.data.list.forEach(function (v,i){console.log(i);})
/*
for (let x in Chunk.data.list){
	console.log(Chunk.data.list[x]);
}*/
