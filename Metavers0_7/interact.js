
let playerSwitch = 0;
const playerMode = ["destroy", "shoot", "build", "block", "build2","remove"];

/*
"build";
""
*/


function destroyMatter(){
	const intersect = raycastUpdate();
	if (intersect.length > 0) {
		const dataName = intersect[0].object.name.split("/");
		const point = intersect[0].point;
		
		//console.log(dataName)
		if (dataName[0] === "Terrain") {
			const chunkPosition = toArray(dataName[1])
			//console.log("Terrain", chunkPosition)
			//rp = relativePoint
			const rp = new THREE.Vector3( 
				Math.round(point.x) - Chunk.data.chunkSize * chunkPosition[0] + Chunk.data.chunkSize/2, 
				Math.round(point.y) - Chunk.data.chunkSize * chunkPosition[1] + Chunk.data.chunkSize/2, 
				Math.round(point.z) - Chunk.data.chunkSize * chunkPosition[2] + Chunk.data.chunkSize/2
				);
			//console.log(rp)

			const generation = Terrain.data.list[ dataName[1] ].generation;
			
			for (let x = -2; x <= 2; x++) {
			for (let y = -2; y <= 2; y++) {
			for (let z = -2; z <= 2; z++) {

				if (rp.x+x > 0 && rp.x+x < Chunk.data.chunkSize &&
					rp.y+y > 0 && rp.y+y < Chunk.data.chunkSize &&
					rp.z+z > 0 && rp.z+z < Chunk.data.chunkSize) {

					generation[rp.x+x][rp.y+y][rp.z+z] = 0;
				}
				
			}}}

			Terrain.data.list[ dataName[1] ].meshUpdate(generation);
			Terrain.data.list[ dataName[1] ].collisionFunction();

		}
	}
}

function addMatter(){
	const intersect = raycastUpdate();
	if (intersect.length > 0) {
		const dataName = intersect[0].object.name.split("/");
		const point = intersect[0].point;
		
		//console.log(dataName)
		if (dataName[0] === "Terrain") {
			const chunkPosition = toArray(dataName[1])
			//console.log("Terrain", chunkPosition)
			//rp = relativePoint
			const rp = new THREE.Vector3( 
				Math.round(point.x) - Chunk.data.chunkSize * chunkPosition[0] + Chunk.data.chunkSize/2, 
				Math.round(point.y) - Chunk.data.chunkSize * chunkPosition[1] + Chunk.data.chunkSize/2, 
				Math.round(point.z) - Chunk.data.chunkSize * chunkPosition[2] + Chunk.data.chunkSize/2
				);
			//console.log(rp)

			const generation = Terrain.data.list[ dataName[1] ].generation;
			
			//console.log("new test")
			for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
			for (let z = -1; z <= 1; z++) {
				//console.log(rp.x+x,rp.y+y,rp.z+z)

				if (rp.x+x > 0 && rp.x+x < Chunk.data.chunkSize &&
					rp.y+y > 0 && rp.y+y < Chunk.data.chunkSize &&
					rp.z+z > 0 && rp.z+z < Chunk.data.chunkSize) {

					generation[rp.x+x][rp.y+y][rp.z+z] = 1;
				}
				
			}}}

			Terrain.data.list[ dataName[1] ].meshUpdate(generation);
			Terrain.data.list[ dataName[1] ].collisionFunction();

		}
	}
}

function pointInChunk(point){
	return([
		Math.round(point.x/Chunk.data.chunkSize), 
		Math.round(point.y/Chunk.data.chunkSize),
		Math.round(point.z/Chunk.data.chunkSize)
		])
}

function pointInChunk2(x,y,z){
	return([
		Math.round(x/Chunk.data.chunkSize), 
		Math.round(y/Chunk.data.chunkSize),
		Math.round(z/Chunk.data.chunkSize)
		])
}

function equalArray3(arr1,arr2){
	return(arr1[0] === arr2[0] && arr1[1] === arr2[1] && arr1[2] === arr2[2])
}

function arr3InList(arr,list){

	for(let e of list){
		if (equalArray3(e,arr)) {return true} 
	}
	return false
}


function addMatter2(){
	const intersect = raycastUpdate();
	//console.log("intersect",intersect);

	if (intersect.length > 0) {
		const dataName = intersect[0].object.name.split("/");
		const point = intersect[0].point;
		
		//console.log(dataName)
		if (dataName[0] === "Terrain") {
			const chunkPosition = toArray(dataName[1])
			const brushSize = 2;
			//console.log("Terrain", chunkPosition)

			//ap = absolutePoint
			const ap = new THREE.Vector3( 
				Math.round(point.x), 
				Math.round(point.y), 
				Math.round(point.z)
				);

		
			const chunksToUpdate = []
			
			
			for (let x = -brushSize; x <= brushSize; x++) {
			for (let y = -brushSize; y <= brushSize; y++) {
			for (let z = -brushSize; z <= brushSize; z++) {


				const chk = pointInChunk2(ap.x+x,ap.y+y,ap.z+z);

				if (!arr3InList(chk,chunksToUpdate)) {
					chunksToUpdate.push(chk);
				}

				const rp = new THREE.Vector3( 
					Math.round(point.x) - Chunk.data.chunkSize * chk[0] + Chunk.data.chunkSize/2, 
					Math.round(point.y) - Chunk.data.chunkSize * chk[1] + Chunk.data.chunkSize/2, 
					Math.round(point.z) - Chunk.data.chunkSize * chk[2] + Chunk.data.chunkSize/2
				);

				
				Terrain.data.list[ chk ].generation[rp.x+x][rp.y+y][rp.z+z] = 1;

				//copier les bords des chunks
				//à suppr/remplacer
				if (rp.x+x === 0 && !equalArray3(chk, chunkPosition)) {
					Terrain.data.list[ chunkPosition ].generation[Chunk.data.chunkSize][rp.y+y][rp.z+z] = 1;
				}
				if (rp.x+x === Chunk.data.chunkSize && !equalArray3(chk, chunkPosition)) {
					Terrain.data.list[ chunkPosition ].generation[0][rp.y+y][rp.z+z] = 1;
				}
				if (rp.y+y === 0 && !equalArray3(chk, chunkPosition)) {
					Terrain.data.list[ chunkPosition ].generation[rp.x+x][Chunk.data.chunkSize][rp.z+z] = 1;
				}
				if (rp.y+y === Chunk.data.chunkSize && !equalArray3(chk, chunkPosition)) {
					Terrain.data.list[ chunkPosition ].generation[rp.x+x][0][rp.z+z] = 1;
				}
				if (rp.z+z === 0 && !equalArray3(chk, chunkPosition)) {
					Terrain.data.list[ chunkPosition ].generation[rp.x+x][rp.y+y][Chunk.data.chunkSize] = 1;
				}
				if (rp.z+z === Chunk.data.chunkSize && !equalArray3(chk, chunkPosition)) {
					Terrain.data.list[ chunkPosition ].generation[rp.x+x][rp.y+y][0] = 1;
				}
				
				
			}}}
			//console.log(chunksToUpdate)

			for (let c of chunksToUpdate) {
				Terrain.data.list[ c ].meshUpdate( Terrain.data.list[ c ].generation );
				Terrain.data.list[ c ].collisionFunction();
				Terrain.data.list[ c ].mesh.geometry.computeBoundingSphere()
			}

		}
	}
}

//=================================================================================
//							MATERIAUX

const materials = {
	phong : new THREE.MeshPhongMaterial(),
	phongs : {
			herbe : new THREE.MeshPhongMaterial( { color : '#ffffff'/*'#52be80'*/} ),//vert pâle
			herbeTerre : new THREE.MeshPhongMaterial( { color : '#22ff33'/*'#9e9d24'*/} ),//vert proche de terre
			terre : new THREE.MeshPhongMaterial( { color : '#ef6c00'} ),//orange terreux
			terreRoche : new THREE.MeshPhongMaterial( { color : '#922b21'} ),//bordeaux
			roche : new THREE.MeshPhongMaterial( { color : '#8d6e63'} ),//marron terre
			rocheDur : new THREE.MeshPhongMaterial( { color : '#273746'} ),//gris foncé
		},
	physical : new THREE.MeshPhysicalMaterial( {
			color : '#ffffff',
			emissive : '#451213',
			roughness : 0.5,
			metalness : 1.0,
			flatShading : false,

			transparent : true,
			opacity : 0.8,
		} ),
	moon : new THREE.MeshPhysicalMaterial( {
			color : '#ffffff',
			emissive : '#445566',
			roughness : 0.5,
			metalness : 1.0,
			flatShading : false,

			transparent : true,
			opacity : 0.8,
		} ),
	wood : new THREE.MeshPhysicalMaterial( {
			color : '#cc8888',
			emissive : '#000000',
			roughness : 0.8,
			metalness : 0.0,
			flatShading : false,

			transparent : false,
			opacity : 1.0,
		} ),
	wood1 : new THREE.MeshPhysicalMaterial( {
			color : '#cc6688',
			emissive : '#000000',
			roughness : 0.8,
			metalness : 0.0,
			flatShading : false,

			transparent : false,
			opacity : 1.0,
		} ),
	wood2 : new THREE.MeshPhysicalMaterial( {
			color : '#ee8888',
			emissive : '#000000',
			roughness : 0.8,
			metalness : 0.0,
			flatShading : false,

			transparent : false,
			opacity : 1.0,
		} ),
	glass : new THREE.MeshPhysicalMaterial( {
			color : '#8888cc',
			emissive : '#111122',
			roughness : 0.8,
			metalness : 0.0,
			flatShading : false,

			transparent : true,
			opacity : 0.2,
		} ),
	preVisual : new THREE.MeshPhysicalMaterial( {
			color : '#000000',
			emissive : '#ffffff',
			roughness : 1.0,
			metalness : 0.0,
			flatShading : false,

			transparent : true,
			opacity : 0.1,
		} ),
}

//test à suppr

materials.phongs.herbeTerre.transparent = false;
materials.phongs.herbeTerre.opacity = 1.0;

//=================================================================================
//							GEOMETRIES

const geometries = {
	box : new THREE.BoxGeometry(),//bloc
}
//=================================================================================
//							BUILD
let blockMode = "beam";

const blocksScale = {
	box : new THREE.Vector3(1,1,1),
	beam : new THREE.Vector3(.75,2,.75),
	wallx : new THREE.Vector3(2,2,.5),
	wallz : new THREE.Vector3(.5,2,2),
	floor : new THREE.Vector3(2,.5,2),
	glassx : new THREE.Vector3(1,1,.5),
}

const blocks = {
	box : {
		scale : new THREE.Vector3(1,1,1),
		material : materials.wood,
		},
	beam : {
		scale : new THREE.Vector3(.5,2,.5),
		material : materials.wood,
		},
	wallx : {
		scale : new THREE.Vector3(2,2,.25),
		material : materials.wood1,
		},
	wallz : {
		scale : new THREE.Vector3(.25,2,2),
		material : materials.wood1,
		},
	floor : {
		scale : new THREE.Vector3(2,.25,2),
		material : materials.wood2,
		},
	glassx : {
		scale : new THREE.Vector3(1,1,.25),
		material : materials.glass,
		},
}

function buildBlock(){
	const intersect = raycastUpdate();
	//console.log("intersect",intersect);

	if (intersect.length > 0) {
		const dataName = intersect[0].object.name.split("/");
		const point = intersect[0].point;
		const normal = intersect[0].face.normal;
		//console.log(normal)

		const chk = [
					Math.round(point.x/Chunk.data.chunkSize), 
					Math.round(point.y/Chunk.data.chunkSize), 
					Math.round(point.z/Chunk.data.chunkSize)
				]

		//console.log(dataName, point);

		/*
		const box = new THREE.Mesh( geometries.box, materials.wood );
		box.name = "buildingBlock";

		//box.scale.set(0.5,2,0.5)
		box.scale.set(
			blocksScale[blockMode].x,
			blocksScale[blockMode].y,
			blocksScale[blockMode].z,
			);
		*/
		const box = new THREE.Mesh( geometries.box, blocks[blockMode].material );
		box.name = "buildingBlock";

		box.scale.set(
			blocks[blockMode].scale.x,
			blocks[blockMode].scale.y,
			blocks[blockMode].scale.z,
			);

		box.position.set(
			Math.round(  1/box.scale.x*(point.x + normal.x * box.scale.x/2)  )*box.scale.x,
			Math.round(  1/box.scale.y*(point.y + normal.y * box.scale.y/2)  )*box.scale.y,
			Math.round(  1/box.scale.z*(point.z + normal.z * box.scale.z/2)  )*box.scale.z
			);
		//calculer la normale entre le player et raycast et mettre + ou - devant box.scale.x

		put_in_chunk(box);

		Terrain.data.list[ chk ].collisionFunction();

	}
}


const visualBlock = new THREE.Mesh( geometries.box, materials.preVisual );
visualBlock.name = "visualBlock";
globalScene.add(visualBlock);

function preVisualBlock(){
	const intersect = raycastUpdate();
	//console.log("intersect",intersect);

	if (intersect.length > 0) {
		const dataName = intersect[0].object.name.split("/");
		const point = intersect[0].point;
		const normal = intersect[0].face.normal;
		//console.log(normal)

		visualBlock.scale.set(
			blocks[blockMode].scale.x,
			blocks[blockMode].scale.y,
			blocks[blockMode].scale.z,
			);

		visualBlock.position.set(
			Math.round(  1/visualBlock.scale.x*(point.x + normal.x * visualBlock.scale.x/2)  )*visualBlock.scale.x,
			Math.round(  1/visualBlock.scale.y*(point.y + normal.y * visualBlock.scale.y/2)  )*visualBlock.scale.y,
			Math.round(  1/visualBlock.scale.z*(point.z + normal.z * visualBlock.scale.z/2)  )*visualBlock.scale.z
			);
		
	}
}
/*

class Block{
	static data = {
		list : {};
		length : 0,
	}

	constructor(position = undefined) {
		this.scale = new THREE.Vector3();
		this.geometry = geometries.box;
		this.material = materials.wood;

		this.mesh = new THREE.Mesh(this.geometry, this.material);
		
	}
}*/