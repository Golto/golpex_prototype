console.warn("block.js loaded");


class BlockManager{

	static blocksList = new Map;

	//-----------------------------------------
	
	constructor(worldId){
		this.world = World.list[worldId];
		this.preVisual = this.preVisualInit();

		this.blocksType = new Map;
		this.selectedBlock = 'classic';
		//this.blockSelection = undefined;

		this.blocksType.set('classic',new THREE.Mesh(geometries.box,materials.white));
		this.blocksType.set('woodenPole',new THREE.Mesh(geometries.pole,materials.wood));
		this.blocksType.set('woodenBeam',new THREE.Mesh(geometries.beam,materials.wood));
		this.blocksType.set('ball',new THREE.Mesh(geometries.ball,materials.red));
	}

	select(type){
		this.selectedBlock = type;
	}

	preVisualInit(){
		const b = new THREE.Mesh( geometries.box, materials.preVisual );
		b.name = "preVisual";
		b.visible = false;
		this.world.sceneWorld.add(b);
		return b;
	}

	preVisualUpdate(){
		this.preVisual.visible = false;
		const player = this.world.player.get('guest');
		const intersect = raycastUpdate(player.camera, this.world.scenePhysical);

		const selectedMesh = this.blocksType.get(this.selectedBlock);

		if (intersect.length > 0 && selectedMesh) {
			this.preVisual.visible = true;
			//suppose selectedMesh.isMesh === true
			this.preVisual.geometry = selectedMesh.geometry;

			const point = intersect[0].point;
			const normal = intersect[0].face.normal;

			const blockIntersected = intersect[0].object.name === 'block';

			const v = new THREE.Vector3();
			//v.add(point).addScaledVector(normal,.5);	//point + normal/2

			const halfSizeObj = blockIntersected ? point.distanceTo(intersect[0].object.position) : 1.0; // à refaire
			v.add(point).addScaledVector(normal, halfSizeObj);

			this.preVisual.lookAt(v.clone().add(normal));

			if (blockIntersected) {
				this.preVisual.rotation.copy(intersect[0].object.rotation);
			}

			this.preVisual.position.copy(v);

			

		}
	}

	remove(){
		//console.log('remove block here');
		const player = this.world.player.get('guest');
		const intersect = raycastUpdate(player.camera, this.world.scenePhysical);

		if (intersect.length > 0) {
			const obj = intersect[0].object;
			if (obj.name === 'block') {
				obj.parent.remove(obj);//compléter
			}
		}

	}

	place(){
		//console.log('place block here', this.selectedBlock)
		
		//compléter
		
		const player = this.world.player.get('guest');
		const intersect = raycastUpdate(player.camera, this.world.scenePhysical);

		if (intersect.length > 0) {
			this.preVisual.visible = true;
			const point = intersect[0].point;
			const normal = intersect[0].face.normal;

			const newblock = this.blocksType.get(this.selectedBlock).clone();
		
			newblock.position.copy(this.preVisual.position);
			newblock.rotation.copy(this.preVisual.rotation);
			newblock.name = 'block';
			this.world.scenePhysical.add(newblock);


		}
	}
}



class Block{
	constructor(blockType){
		this.mesh = this.blocksType.get(blockType).clone();
		this.scale = new THREE.Vector3();

	}
}


/*
//idée pour les groupes
if type === group
	merge geometries
	-> return mergedMesh
*/

function tempsetblock(type){
	World.list.sandbox.blockManager.selectedBlock = type;
}








function loadObjJson(string/*, position*/){
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

				/*
				//test debug
				World.list.labo.scenePhysical.add(obj);
				obj.material = materials.golpexBlack;
				obj.position.copy(position);
				*/

				if (BlockManager.blocksList.has(string)) {
					console.error(string + " already exists");
					return
				}
				BlockManager.blocksList.set(string, obj);

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

function loadObjectsForBlockManager(){
	loadObjJson('chairMesh');
	loadObjJson('cupboardMesh');
	loadObjJson('roofMesh');
	loadObjJson('roofWallMesh');
	loadObjJson('stairsTestMesh');
	loadObjJson('tableMesh');
	loadObjJson('test1Mesh');
	loadObjJson('treeMesh');
	loadObjJson('wallMesh');
}

BlockManager.blocksList.set(
	'classic',
	new THREE.Mesh(geometries.box,materials.white)
);
BlockManager.blocksList.set(
	'woodenPole',
	new THREE.Mesh(geometries.pole,materials.wood)
);
BlockManager.blocksList.set(
	'woodenBeam',
	new THREE.Mesh(geometries.beam,materials.wood)
);
BlockManager.blocksList.set(
	'ball',
	new THREE.Mesh(geometries.ball,materials.red)
);



function loadObjTest(string, x,y,z){
		loaderObject.load(
			"models/json/"+string+".json",

			// onLoad callback
			function ( obj ) {
				obj.position.set(x,y,z);
				World.list[World.currentId].scenePhysical.add(obj);

				if (World.currentId === "sandbox") {
					Chunk.setInChunk(obj);
				}
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