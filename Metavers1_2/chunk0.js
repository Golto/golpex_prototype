console.warn("chunk.js loaded");


class Chunk{

	//===============================
	//Class properties

	static lastChunk;
	static newChunk;

	static data = {
		debug : false,
		renderDistance : 6,//7,
		renderDistanceLoad : 2,//2
		maxLoad : 5,//3
		size : 20,//25,//42,
		// send an update each chunk/Chunk.data.subChunkSize crossed
		subChunkSize : 4,
/*
		max : new THREE.Vector3(100,100,100),
		min : new THREE.Vector3(-100,-100,-100),*/
		max : new THREE.Vector3(3,100,3),
		min : new THREE.Vector3(-3,-100,-3),

		//conditions :
		// min <= -init <= 0 <= init <= max
		init : new THREE.Vector3(0,1,0),

		list : {},
		toLoadList : [],

		worldsList : {
			sandbox : {},
		},
		length : 0,//au delà de 1000 chunks sur la ram => lag
	}

	static new(x,y,z){
		//x,y,z in chunk coordinates system

		//condition à mettre avant
		const player = World.list.sandbox.player.get('guest');
		const inChunk = Chunk.inChunk(player);

		//---
		//si la position du joueur dépasse les limites imposées pour la création des chunks, le chunk n'est pas crée

		if (inChunk.x > Chunk.data.max.x || inChunk.y > Chunk.data.max.y || inChunk.z > Chunk.data.max.z ) return
		if (inChunk.x < Chunk.data.min.x || inChunk.y < Chunk.data.min.y || inChunk.z < Chunk.data.min.z ) return
		//---

		new Chunk(x,y,z);
		new Terrain(x,y,z);
	}

	static inChunk(entity){
		//X = Math.floor( (entity.position.x + Chunk.data.size / 2) / Chunk.data.size ) 	: centré
		//X = Math.floor( entity.position.x / Chunk.data.size ) 		<= choix				: non centré
		const v = entity.position.clone().divideScalar(Chunk.data.size);
		v.floor();
		return v;	// Vector3
	}

	static inDivisedChunk(entity,step){
		//non centré
		const v = entity.position.clone().divideScalar( Chunk.data.size / step );
		v.floor();
		//v.x %= step; v.y %= step; v.z %= step; // fonctionne pas pour les négatifs
		v.x = mod(v.x, step);
		v.y = mod(v.y, step);
		v.z = mod(v.z, step);
		return v;	// Vector3
	}

	static vectorToString(v){
		// vect3(1,2,3) => "1,2,3"
		//Utilisation de l'hypothèse que les composantes soient entières et Vector3
		return [v.x,v.y,v.z].toString();
	}

	static stringToVector(s){
		// "1,2,3" => vect3(1,2,3)
		//Utilisation de l'hypothèse que les composantes soient entières et Vector3
		const v = new THREE.Vector3();
		return v.fromArray(s.split(',')).floor();
	}

	static inChunkObj(entity){
		const chunkID = Chunk.vectorToString(Chunk.inChunk(entity));
		return Chunk.data.list[chunkID];	// Chunk OBJECT
	}

	static setInChunk(entity){
		const inChunk = Chunk.inChunk(entity);
		const chunkID = Chunk.vectorToString(inChunk)

		if (chunkID in Chunk.data.list) {
			Chunk.data.list[ chunkID ].group.add( entity );
			Chunk.data.list[ chunkID ].collisionFunction();
		}
	}

	static rendering(){
		//PLAYER DEPENDANT
		//Système imparfait en cas de téléportation, les anciens chunks ne sont pas déchargés

		
		//charger cube de centre chunk(player)

		//const inChunk = Chunk.inChunk(Player.list['sandbox']);
		const player = World.list.sandbox.player.get('guest');
		const inChunk = Chunk.inChunk(player);

		const min = Chunk.data.min.clone().max( inChunk.clone().addScalar(- Chunk.data.renderDistance - 2) );
		const max = Chunk.data.max.clone().min( inChunk.clone().addScalar(  Chunk.data.renderDistance + 2) );

		for (let x = min.x ; x <= max.x; x++){
		for (let y = min.y ; y <= max.y; y++){
		for (let z = min.z ; z <= max.z; z++){

			const chunkID = [x,y,z].toString()
			
			if( chunkID in Chunk.data.list ){
				Chunk.data.list[chunkID].render();
			}
		}}}
		

		//charger sphere devant player => centre = chunk( player + renderDistance/2 )
		//à prog
	}

	static isUpdate(lastChunk,newChunk){

		if (lastChunk === undefined || newChunk === undefined){
			return false
		}
		return( !lastChunk.equals( newChunk ) );
	}

	static generate(){
		//PLAYER DEPENDANT

		/*
		//charger cube de centre chunk(player)

		const inChunk = Chunk.inChunk(player);

		const min = Chunk.data.min.clone().max( inChunk.clone().addScalar(-Chunk.data.renderDistanceLoad) );
		const max = Chunk.data.max.clone().min( inChunk.clone().addScalar( Chunk.data.renderDistanceLoad) );

		for( let x = min.x; x <= max.x; x++){
		for( let y = min.y; y <= max.y; y++){
		for( let z = min.z; z <= max.z; z++){

			const chunkID = [x,y,z].toString()

			if (!(chunkID in Chunk.data.list)) {
				Chunk.new(x,y,z);
			}
			
		}}}//algo primitif : à changer
		*/

		//charger cube devant player => centre = chunk( player.position + renderDistance/2 * player.direction )

		//const player = Player.list['sandbox'];
		const player = World.list.sandbox.player.get('guest');

		let centeredChunk = player.position.clone().divideScalar(Chunk.data.size);
		centeredChunk.addScaledVector( player.direction, Chunk.data.renderDistanceLoad );
		centeredChunk.floor();

		const min = Chunk.data.min.clone().max( centeredChunk.clone().addScalar(-Chunk.data.renderDistanceLoad) );
		const max = Chunk.data.max.clone().min( centeredChunk.clone().addScalar( Chunk.data.renderDistanceLoad) );

		//let loaded = 0;

		//temp : attention on peut sortir du monde et générer des chunks dehors (temp ne passe pas par le test des max et min)
		const v = Chunk.inChunk(player);
		const id = Chunk.vectorToString(v)
		if (!(id in Chunk.data.list || id in Chunk.data.toLoadList)) {Chunk.new(v.x,v.y,v.z);}
		//---
/*
		for( let x = min.x; x <= max.x; x++){
		for( let y = min.y; y <= max.y; y++){
		for( let z = min.z; z <= max.z; z++){

			const chunkID = [x,y,z].toString()

			if (!(chunkID in Chunk.data.list || chunkID in Chunk.data.toLoadList)) {
				//Chunk.new(x,y,z);
				Chunk.data.toLoadList.push(chunkID);

				loaded += 1;
				if (loaded >= Chunk.data.maxLoad) {return}
			}
			
		}}}*/


		const distList = [];

		let bufferVector = new THREE.Vector3();

		for( let x = min.x; x <= max.x; x++){
		for( let y = min.y; y <= max.y; y++){
		for( let z = min.z; z <= max.z; z++){

			const c = [x,y,z].toString()

			if (!(c in Chunk.data.list || c in Chunk.data.toLoadList)) {
				bufferVector.fromArray([x,y,z]);

				const dist = Chunk.inChunk(player).distanceTo(bufferVector);
				if (dist < Chunk.data.renderDistanceLoad )  {

					distList.push( {
						chk : c.toString(),
						distance : dist,
					} );
					
				}
			}
			
			
		}}}

		distList.sort( function(a, b){return a.dist - b.dist} );

		let loaded = 0;

		for( let obj of distList ){

			//const v = Chunk.stringToVector(obj.chk);
			//Chunk.new(v.x,v.y,v.z);

			Chunk.data.toLoadList.push(obj.chk);

			loaded += 1;
			if (loaded >= Chunk.data.maxLoad) {return}
		}

	}

	static update(time){
		//PLAYER DEPENDANT
		//Chunk.newChunk = Chunk.inDivisedChunk( Player.list['sandbox'], Chunk.data.subChunkSize );
		Chunk.newChunk = Chunk.inDivisedChunk( World.list.sandbox.player.get('guest'), Chunk.data.subChunkSize );
		if (Chunk.isUpdate( Chunk.lastChunk, Chunk.newChunk )) {
			Chunk.rendering();
			Chunk.generate();
		}
		Chunk.lastChunk = Chunk.newChunk;

		//load chunks in Chunk.data.toLoadList
		
		if (Chunk.data.toLoadList.length > 0) {
			if (time % 1 === 0) {
				const v = Chunk.stringToVector(Chunk.data.toLoadList[0]);
				Chunk.new(v.x,v.y,v.z);
				Chunk.data.toLoadList.shift();
			}
		}

		if (Chunk.data.toLoadList.length > 50) {//temp
			if (time % 2 === 0) {
				const v = Chunk.stringToVector(Chunk.data.toLoadList[0]);
				Chunk.new(v.x,v.y,v.z);
				Chunk.data.toLoadList.shift();
			}
		}

		//initializing collision on void chunks
/*
		for (let i in Chunk.data.list) {
			const c = Chunk.data.list[i];
			if (c.collisionFunction) {// calculs constants : pas opti
				c.isSetCollision();
			}
		}*/
		
		
	}

	static nearUser(){
		//PLAYER DEPENDANT
		//condition : Chunk.data.subChunkSize > 2
		//not optimal

		const player = World.list.sandbox.player.get('guest');

		//const idc = Chunk.inDivisedChunk( Player.list['sandbox'], Chunk.data.subChunkSize );
		//const inChunk = Chunk.inChunk(Player.list['sandbox']);

		const idc = Chunk.inDivisedChunk( player, Chunk.data.subChunkSize );
		const inChunk = Chunk.inChunk( player );

		const chunkList = [inChunk];

		const border = Chunk.data.subChunkSize - 1;

		//player in Chunk's center (1 center)
		if (idc.x > 0 && idc.x < Chunk.data.subChunkSize &&
			idc.y > 0 && idc.y < Chunk.data.subChunkSize &&
			idc.z > 0 && idc.z < Chunk.data.subChunkSize) {
			return chunkList;
		}

		//player in Chunk's edges (6 faces)
		if (idc.x === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v100, -1 ) )
		}
		if (idc.x === border) {
			chunkList.push( inChunk.clone().addScaledVector( v100, 1 ) )
		}
		if (idc.y === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v010, -1 ) )
		}
		if (idc.y === border) {
			chunkList.push( inChunk.clone().addScaledVector( v010, 1 ) )
		}
		if (idc.z === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v001, -1 ) )
		}
		if (idc.z === border) {
			chunkList.push( inChunk.clone().addScaledVector( v001, 1 ) )
		}

		//player in Chunk's corners (12 edges)
		if (idc.x === 0 && idc.y === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v100, -1 ).addScaledVector( v010, -1 ) )
		}
		if (idc.x === 0 && idc.z === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v100, -1 ).addScaledVector( v001, -1 ) )
		}
		if (idc.y === 0 && idc.z === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v010, -1 ).addScaledVector( v001, -1 ) )
		}

		if (idc.x === 0 && idc.y === border) {
			chunkList.push( inChunk.clone().addScaledVector( v100, -1 ).addScaledVector( v010, 1 ) )
		}
		if (idc.x === 0 && idc.z === border) {
			chunkList.push( inChunk.clone().addScaledVector( v100, -1 ).addScaledVector( v001, 1 ) )
		}
		if (idc.y === 0 && idc.z === border) {
			chunkList.push( inChunk.clone().addScaledVector( v010, -1 ).addScaledVector( v001, 1 ) )
		}

		if (idc.x === border && idc.y === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v100, 1 ).addScaledVector( v010, -1 ) )
		}
		if (idc.x === border && idc.z === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v100, 1 ).addScaledVector( v001, -1 ) )
		}
		if (idc.y === border && idc.z === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v010, 1 ).addScaledVector( v001, -1 ) )
		}

		if (idc.x === border && idc.y === border) {
			chunkList.push( inChunk.clone().addScaledVector( v100, 1 ).addScaledVector( v010, 1 ) )
		}
		if (idc.x === border && idc.z === border) {
			chunkList.push( inChunk.clone().addScaledVector( v100, 1 ).addScaledVector( v001, 1 ) )
		}
		if (idc.y === border && idc.z === border) {
			chunkList.push( inChunk.clone().addScaledVector( v010, 1 ).addScaledVector( v001, 1 ) )
		}

		//player in Chunk's corners (8 vertices)
		if (idc.x === 0 && idc.y === 0 && idc.z === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v100, -1 ).addScaledVector( v010, -1 ).addScaledVector( v001, -1 ) )
		}
		if (idc.x === 0 && idc.y === 0 && idc.z === border) {
			chunkList.push( inChunk.clone().addScaledVector( v100, -1 ).addScaledVector( v010, -1 ).addScaledVector( v001, 1 ) )
		}
		if (idc.x === 0 && idc.y === border && idc.z === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v100, -1 ).addScaledVector( v010, 1 ).addScaledVector( v001, -1 ) )
		}
		if (idc.x === 0 && idc.y === border && idc.z === border) {
			chunkList.push( inChunk.clone().addScaledVector( v100, -1 ).addScaledVector( v010, 1 ).addScaledVector( v001, 1 ) )
		}
		if (idc.x === border && idc.y === 0 && idc.z === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v100, 1 ).addScaledVector( v010, -1 ).addScaledVector( v001, -1 ) )
		}
		if (idc.x === border && idc.y === 0 && idc.z === border) {
			chunkList.push( inChunk.clone().addScaledVector( v100, 1 ).addScaledVector( v010, -1 ).addScaledVector( v001, 1 ) )
		}
		if (idc.x === border && idc.y === border && idc.z === 0) {
			chunkList.push( inChunk.clone().addScaledVector( v100, 1 ).addScaledVector( v010, 1 ).addScaledVector( v001, -1 ) )
		}
		if (idc.x === border && idc.y === border && idc.z === border) {
			chunkList.push( inChunk.clone().addScaledVector( v100, 1 ).addScaledVector( v010, 1 ).addScaledVector( v001, 1 ) )
		}


		return chunkList; // [chunk1, chunk2, ... ]

	}

	//===============================
	//Class Object properties

	constructor( x = 0, y = 0, z = 0 ) {

		//this.player = Player.list['sandbox'];
		this.player = World.list.sandbox.player.get('guest');
		this.chunkPosition = new THREE.Vector3(x,y,z);
		this.chunkID = Chunk.vectorToString(this.chunkPosition);
		this.worldPosition = this.chunkPosition.clone().multiplyScalar(Chunk.data.size);
		
		this.group = new THREE.Group();
		this.group.visible = false;
		this.group.name = "Chunk/" + this.chunkID;

		this.player.world.sceneWorld.add(this.group);

		this.octree = new THREE.Octree();

		Chunk.data.list[ this.chunkID ] = this;
		Chunk.data.length += 1;

		//const d = a.distanceTo( b );//a,b vect3
		//new THREE.Vector3(1,2,5).max(new THREE.Vector3(2,2,4)) = 2,2,5

		if (Chunk.data.debug) {
			const box = new THREE.Mesh( geometries.box , materials.blue );
			box.position.copy(this.worldPosition);
			box.scale.set(0.1,0.1,0.1);
			box.name = "DebugChunk";

			Chunk.setInChunk(box);
		}
			
		
		this.collisionFunction = this.collisionInit;

		this.render();
		//this.collisionFunction();
	}

	render(){
		//PLAYER DEPENDANT
		const d = this.player.position.distanceTo( this.worldPosition )
		this.group.visible = d < Chunk.data.size * Chunk.data.renderDistance ;
	}

	//---------------------------------------------------
	// init collision for new chunks or void chunks


	collisionInit(){
		if (this.group.children.length > 0) {
			if (this.group.children[0].geometry.attributes.position.count > 0) {
				this.octree.fromGraphNode( this.group );
				this.parentCollision( this.player.world.worldOctree );

				this.collisionFunction = this.collisionUpdate;

				this.parentCollision( this.player.world.worldOctree );
				return
			}
		}
		this.collisionFunction = this.collisionInit;
	}
	

	parentCollision(parentOctree){
		if(parentOctree.bounds && this.octree.bounds){

			parentOctree.bounds.min.copy( parentOctree.bounds.min.min(this.octree.bounds.min) )
			parentOctree.bounds.max.copy( parentOctree.bounds.max.max(this.octree.bounds.max) )
		}
		
		if(parentOctree.box && this.octree.box){

			parentOctree.box.min.copy( parentOctree.box.min.min(this.octree.box.min) )
			parentOctree.box.max.copy( parentOctree.box.max.max(this.octree.box.max) )
		}
		

		parentOctree.subTrees.push(this.octree);
	}

	//---------------------------------------------------

	collisionUpdate(){
		this.octree.subTrees = [];
		this.octree.triangles = [];

		this.octree.fromGraphNode( this.group );
	}
	//---------------------------------------------------
	
}


function chunkInit(){
	
	for(let x = -Chunk.data.init.x; x <= Chunk.data.init.x; x++){
	for(let y = -Chunk.data.init.y; y <= Chunk.data.init.y; y++){
	for(let z = -Chunk.data.init.z; z <= Chunk.data.init.z; z++){
		Chunk.new(x,y,z);
	}}}

}
