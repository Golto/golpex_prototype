console.warn("block.js loaded");


class Block{

	/*
	ATTENTION : Il n y a pas forcément qu'un bloc par coordonnée, utiliser plutôt les uuid des this.mesh
				Block.data.list[ <coordonnées> ]   ====>   Block.data.list[ <uuid> ]

				réglé ✅

				bug : Blocks n'ont pas de collisions lorsqu'on construit dans un chunk sans Terrain (pas initialisé)

				opti : utiliser InstancedMesh au lieu de Mesh pour tous les blocs du même type
	*/
	//static loaded = {};

	static type = {
		none : undefined,
		classic : {
			geometry : geometries.box, material : materials.golpexOrange, scale : new THREE.Vector3( 1.0, 1.0, 1.0 ),
		},
		beam : {
			geometry : geometries.beam, material : materials.wood, scale : new THREE.Vector3( 0.75, 1.0, 0.75 ),
			positionDegree : 1, rotationDegree : 8, // utiliser pour construire la grille de construction
		},
		wall : {
			geometry : geometries.wall, material : materials.wood, scale : new THREE.Vector3( 1.0, 1.0, 0.25 ),
		},
		floor : {
			geometry : geometries.floor, material : materials.wood, scale : new THREE.Vector3( 1.0, 0.25, 1.0 ),
		},
		glass : {
			geometry : geometries.wall, material : materials.glass, scale : new THREE.Vector3( 1.0, 1.0, 0.25 ),
		},
		metal : {
			geometry : geometries.wall, material : materials.metal, scale : new THREE.Vector3( 1.0, 1.0, 0.25 ),
		},
	};

	static data = {
		current : Block.type.none,
		list : {},
		length : 0,
	};

	static new(x,y,z){
		const b = new Block(x,y,z);
		//const v = player.direction.clone().add(b.mesh.position);
   		//b.mesh.lookAt(v.x,v.y,v.z);
   		//b.mesh.rotation.y = Math.PI/2;
   		//b.mesh.rotation.x = 0;
   		//b.mesh.rotation.z = 0;
   		
   		/*
   		b.mesh.quaternion.copy(player.camera.quaternion);
   		b.mesh.quaternion.x = 0;
		b.mesh.quaternion.z = 0;*/

		//rotation à garder

		const player = World.list.sandbox.player.get('guest');

		let v = new THREE.Vector3();
		let q = new THREE.Quaternion();
		q.copy(player.camera.quaternion);
		b.mesh.rotation.setFromQuaternion(q);

		b.mesh.getWorldDirection(v);
		v.y = 0;

		v.normalize()

		v.x = Math.round(v.x * degree) / degree;
		v.z = Math.round(v.z * degree) / degree;

		//console.log(v.x,v.z)

		v.add(b.mesh.position);
		b.mesh.lookAt(v.x,v.y,v.z);
	}

	static put(){
		//PLAYER DEPENDANT
		const intersect = raycastUpdate(
			World.list['sandbox'].cameras.main,
			World.list['sandbox'].scenePhysical
		);

		if (intersect.length > 0 && Block.data.current) {
			const dataName = intersect[0].object.name.split("/");
			const point = intersect[0].point;
			const normal = intersect[0].face.normal;

			if (Block.data.current.isLoaded) {

				point.add( normal.divideScalar(2) );

				point.round();		
			}
			else{

				point.add( normal.multiply( Block.data.current.scale ).divideScalar(2) );

				point.divide( Block.data.current.scale ).round().multiply( Block.data.current.scale );
			}

			Block.new( point.x, point.y, point.z )
			
			


			/*
			let scale = 1;

			Block.new(
				Math.round(  1/scale*(point.x + normal.x * scale/2)  )*scale,
				Math.round(  1/scale*(point.y + normal.y * scale/2)  )*scale,
				Math.round(  1/scale*(point.z + normal.z * scale/2)  )*scale
				)*/



		}
	}

	static remove(){
		//PLAYER DEPENDANT
		const intersect = raycastUpdate(
			World.list['sandbox'].cameras.main,
			World.list['sandbox'].scenePhysical
		);
		if (intersect.length > 0) {

			const obj = intersect[0].object;
			const dataName = obj.name.split("/");
			//const id = Chunk.vectorToString(obj.position);

			//console.log(dataName);
			//console.log(obj.parent);

			if (dataName[0] === "Block") {
				Block.data.list[obj.uuid].remove();
			}
		}
	}

	static setType(string){
		Block.data.current = Block.type[string];
	}

	//temp--
	static selected = 0;
	static selection = [ "none", "classic", "beam", "wall", "floor", "glass", "metal", "plastic" ];

	static next(){
		Block.selected ++;
		Block.selected %= Block.selection.length;

		Block.setType( Block.selection[Block.selected] );
		//console.log( "block selected : ", Block.selection[Block.selected] );
	}
	//------

	static loadObjJson(string){
		loaderObject.load(
			"models/json/"+string+".json",

			// onLoad callback
			function ( obj ) {

				if (obj.isGroup) {
					console.error("./models/json/"+string+".json"," is a Group, not supported in the current version of Golpex");
					return
					/*
					Pour éviter de créer un groupe, on prends chaque geometry 
					et on les mets dans bufferGeometry en utilisant bufGeo.fromGeometry(geo) et bufGeoFinal.merge(bufGeo)
					*/
				}

				Block.type[string] = { isLoaded : true, mesh : obj };
				Block.selection.push( string );
			},

			// onProgress callback
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},

			// onError callback
			function ( err ) {
				console.error( 'An error happened : ', err );
			}
		);
	}

	static loadGeometryJson(string){
		loaderGeometry.load(
			"models/json/"+string+".json",

			// onLoad callback
			function ( geo ) {

				Block.type[string] = {
					geometry : geo, material : materials.wood, scale : new THREE.Vector3( 1.0, 1.0, 1.0 ),
				};
				Block.selection.push( string );
			},

			// onProgress callback
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},

			// onError callback
			function ( err ) {
				console.error( 'An error happened : ', err );
			}
		);
	}

	constructor( x = 0, y = 0, z = 0 ){

		this.worldPosition = new THREE.Vector3(x,y,z);
		this.chunkPosition = this.worldPosition.clone().divideScalar(Chunk.data.size).floor();
		this.chunkID = Chunk.vectorToString(this.chunkPosition);

		if (Block.data.current.isLoaded) {
			this.mesh = Block.data.current.mesh.clone();
		}
		else{
			this.mesh = new THREE.Mesh( Block.data.current.geometry, Block.data.current.material );
		}
		
		
		this.mesh.position.copy( this.worldPosition );
		this.mesh.name = "Block";

		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;

		Chunk.setInChunk(this.mesh);

		Block.data.list[ this.mesh.uuid ] = this;
		Block.data.length += 1;

		Chunk.data.list[this.chunkID].collisionFunction();
	}

	remove(){
		
		const uuid = this.mesh.uuid
		this.mesh.parent.remove(this.mesh);
		delete this.mesh;	//utile ?
		delete Block.data.list[ uuid ];
		delete this;
		Chunk.data.list[this.chunkID].collisionFunction();
		Block.data.length -= 1;

	}


}

let visualBlock;

function blockInit(id){
	visualBlock = new THREE.Mesh( geometries.box, materials.preVisual );
	visualBlock.name = "visualBlock";
	World.list[id].sceneWorld.add(visualBlock);
}

let degree = 1;

function preVisualBlock(camera, scene){
	visualBlock.visible = false;
	const intersect = raycastUpdate(camera, scene);

	//console.log('intersect',intersect)

	if (intersect.length > 0 && Block.data.current) {
		visualBlock.visible = true;
		const dataName = intersect[0].object.name.split("/");
		const point = intersect[0].point;
		const normal = intersect[0].face.normal;


		if (Block.data.current.isLoaded) {

			visualBlock.geometry = geometries.box;
			visualBlock.position.set(
				Math.round( point.x + normal.x/2 ),
				Math.round( point.y + normal.y/2 ),
				Math.round( point.z + normal.z/2 ),
				);
		}
		else{

			/*

			Block.data.current.scale dépend de la rotation !

			*/

			visualBlock.geometry = Block.data.current.geometry;
			visualBlock.position.set(
				Math.round(  1/Block.data.current.scale.x*(point.x + normal.x * Block.data.current.scale.x/2)  )*Block.data.current.scale.x,
				Math.round(  1/Block.data.current.scale.y*(point.y + normal.y * Block.data.current.scale.y/2)  )*Block.data.current.scale.y,
				Math.round(  1/Block.data.current.scale.z*(point.z + normal.z * Block.data.current.scale.z/2)  )*Block.data.current.scale.z
				);
		}
		

		/*
		visualBlock.quaternion.copy(player.camera.quaternion);
		visualBlock.quaternion.x = 0;
		visualBlock.quaternion.z = 0;*/


		//rotation à garder

		const player = World.list.sandbox.player.get('guest');
		
		let v = new THREE.Vector3();
		let q = new THREE.Quaternion();
		q.copy(player.camera.quaternion);

		visualBlock.rotation.setFromQuaternion(q);

		visualBlock.getWorldDirection(v);
		v.y = 0;

		v.normalize()

		v.x = Math.round(v.x * degree) / degree;
		v.z = Math.round(v.z * degree) / degree;

		v.add(visualBlock.position);
		visualBlock.lookAt(v.x,v.y,v.z);


		//const v = player.direction.clone().add(visualBlock.position);
   		//visualBlock.lookAt(v.x,v.y,v.z);
   		//visualBlock.rotation.y = Math.PI/2;
   		//visualBlock.rotation.x = 0;
   		//visualBlock.rotation.z = 0;
	}
}


/*

b = Block.data.list[ #remplir ]
debugfunction = ()=>{
	const v = player.direction.clone().add(b.mesh.position);
    b.mesh.lookAt(v.x,v.y,v.z)
} 

*/

function objFromGroup(group){
	//A REFAIRE AVANT UTILISATION

	const geoList = [];
	for(let c of group.children){

		const v = c.position;
		geoList.push( c.geometry.clone().translate( v.x, v.y, v.z ) );
	}

	const geoFinal = THREE.BufferGeometryUtils.mergeBufferGeometries( geoList );

	for(let g of geoList){
		g.dispose();
	}

	return geoFinal

}

/*
geo1.translate(x,y,z)
geo2.translate(x,y,z)


const geoFinal = THREE.BufferGeometryUtils.mergeBufferGeometries( [geo1, geo2] )

*/


//ammo.js pour physique





//------------------------------------------------------------------------------V2 blocks



class Block2{

	static gridDetail = 8;

	static selectedId = 'classic';
	static selection = ['none', 'classic',
	'woodenBeam', 'woodenFloor', 'woodenWall',
	'metalicBeam', 'metalicFloor', 'metalicWall', 
	'glass', 'plasticBall',
	];

	static meshes = {
		classic : {
			type : new THREE.InstancedMesh( geometries.box, materials.white, MAX_NUMBER_PER_BLOCKS ),
			nextInstance : 0,
		},


		woodenBeam : {
			type : new THREE.InstancedMesh( geometries.beam, materials.wood, MAX_NUMBER_PER_BLOCKS ),
			nextInstance : 0,
		},
		metalicBeam : {
			type : new THREE.InstancedMesh( geometries.beam, materials.metal, MAX_NUMBER_PER_BLOCKS ),
			nextInstance : 0,
		},

		woodenFloor : {
			type : new THREE.InstancedMesh( geometries.floor, materials.wood, MAX_NUMBER_PER_BLOCKS ),
			nextInstance : 0,
		},
		metalicFloor : {
			type : new THREE.InstancedMesh( geometries.floor, materials.metal, MAX_NUMBER_PER_BLOCKS ),
			nextInstance : 0,
		},

		woodenWall : {
			type : new THREE.InstancedMesh( geometries.wall, materials.wood, MAX_NUMBER_PER_BLOCKS ),
			nextInstance : 0,
		},
		metalicWall : {
			type : new THREE.InstancedMesh( geometries.wall, materials.metal, MAX_NUMBER_PER_BLOCKS ),
			nextInstance : 0,
		},

		glass : {
			type : new THREE.InstancedMesh( geometries.wall, materials.glass, MAX_NUMBER_PER_BLOCKS ),
			nextInstance : 0,
		},

		plasticBall : {
			type : new THREE.InstancedMesh( geometries.ball, materials.plastic, MAX_NUMBER_PER_BLOCKS ),
			nextInstance : 0,
		},
	}

	static initiateInWorld(worldId){			// se renseigner sur les scenes des instancedMesh
		World.list[worldId].scenePhysical.add(
			Block2.meshes.classic.type
		)
		World.list[worldId].scenePhysical.add(
			Block2.meshes.woodenBeam.type
		)
		World.list[worldId].scenePhysical.add(
			Block2.meshes.metalicBeam.type
		)
		World.list[worldId].scenePhysical.add(
			Block2.meshes.woodenWall.type
		)
		World.list[worldId].scenePhysical.add(
			Block2.meshes.metalicWall.type
		)
		World.list[worldId].scenePhysical.add(
			Block2.meshes.woodenFloor.type
		)
		World.list[worldId].scenePhysical.add(
			Block2.meshes.metalicFloor.type
		)
		/*World.list[worldId].scenePhysical.add(
			Block2.meshes.glass.type
		)*/
		World.list[worldId].scenePhysical.add(
			Block2.meshes.plasticBall.type
		)
	}

	static setInstance(blockType, index, position, quaternion, scale, worldId){

		const matrix = new THREE.Matrix4();

		matrix.compose(position, quaternion, scale);

		blockType.setMatrixAt(index, matrix);

		//update scene
		/*
		if (blockType.parent) {
			blockType.parent.remove(blockType);
		}

		World.list[worldId].scenePhysical.add(blockType)*/


		//World.list.labo.scenePhysical.add(Block2.meshes.classic.type)
		//World.list.labo.scenePhysical.remove(Block2.meshes.classic.type) 
	}

	static new( x = 0, y = 0, z = 0 ){
		const selectedBlock = Block2.meshes[ Block2.selectedId ];
		if (!selectedBlock) {return}
		if (selectedBlock.nextInstance < MAX_NUMBER_PER_BLOCKS) {
			new Block2(x,y,z);
		}else{
			console.error('Nombre d\'instances maximum dépassé pour : ' + Block2.selectedId);
		}

	}

	static created = new Map();
	//key -> value
	//map.has(kay) = false/true
	//map.get(key) = value
	//map.set(key,value)
	//map.delete(key)

	//key, value = "block/worldId/position*Block2.gridDetail", this

	//=============================================

	constructor( x = 0, y = 0, z = 0 ){

		this.worldPosition = new THREE.Vector3(x,y,z);
		this.chunkPosition = this.worldPosition.clone().divideScalar(Chunk.data.size).floor();
		this.chunkID = Chunk.vectorToString(this.chunkPosition);

		this.quaternion = new THREE.Quaternion();
		this.scale = new THREE.Vector3(1,1,1);

		this.worldId = 'labo';
		this.type = Block2.selectedId;

		const selectedBlock = Block2.meshes[ Block2.selectedId ];
		Block2.setInstance( selectedBlock.type, selectedBlock.nextInstance, this.worldPosition, this.quaternion, this.scale, this.worldId);
		selectedBlock.nextInstance += 1;
		
		Block2.created.set('block/' + this.worldId + '/' + x+y+z,this);//refaire position
		

		//this.mesh.castShadow = true;
		//this.mesh.receiveShadow = true;
	}
}


/*
function makeMerged( geometry ) {

			const geometries = [];
			const matrix = new THREE.Matrix4();

			for ( let i = 0; i < api.count; i ++ ) {

				randomizeMatrix( matrix );

				const instanceGeometry = geometry.clone();
				instanceGeometry.applyMatrix4( matrix );

				geometries.push( instanceGeometry );

			}

			const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries( geometries );

			scene.add( new THREE.Mesh( mergedGeometry, material ) );
			*/