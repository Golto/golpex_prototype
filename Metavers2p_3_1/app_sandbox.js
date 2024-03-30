
// ===============================================================================================================================
// ===============================================================================================================================
//													IMPORT
// ===============================================================================================================================


import * as bp from './brainPex.js';

let app, promptInput, lds;



// ===============================================================================================================================
// ===============================================================================================================================
//													MULTI TASK
// ===============================================================================================================================

async function multiTask(input){

	if (input === 'DEBUG') {
		console.log('---------------- debug ----------------');
		console.log('SCENE : ', scene);
		console.log('CHUNKS : ', Chunk.map, Chunk.position2id);
		console.log('PLAYER : ', player);
		console.log('raycast : ', raycastUpdate(camera, scene), pointer);
		console.log('player in chunk : ', Chunk.entityIn(player));

		return 1
	}
	if (input === 'RAYCAST') {
		console.log('RAYCAST : ', raycastUpdate(camera, scene));
		console.log('POINTER : ', pointer);

		return 1
	}
	if (input === 'PERLIN') {
		console.log('PERLIN : ');
		for(let i = 0; i < 100; i++){
			console.log(i, perlin.noise(i * 4.3,0,0));
		}

		return 1
	}
	if (input === 'MCUBES') {
/*
		for (var x = 0; x < Chunk.size; x++) {
		for (var y = 0; y < Chunk.size; y++) {
		for (var z = 0; z < Chunk.size; z++) {
			const position = new THREE.Vector3( x, y, z );
			const triangles = marchingCube( position, 0.95 );
			triangles2mesh(triangles, position);
		}}}*/
/*
		const position = new THREE.Vector3( 0, 0, 0 );
		const triangles = marchingChunk( position, 0.95 );
		triangles2mesh(triangles, position);*/

		for (var x = -3; x < 3; x++) {
		for (var y = 0; y < 5; y++) {
		for (var z = -3; z < 3; z++) {
			const position = new THREE.Vector3( x, y, z );
			genChunk(position);
		}}}

		// floor geometry and material
		/*
		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		geometry.translate( 0.5, 0.5, 0.5 );
		const material = new THREE.MeshPhongMaterial( { color: 0x00ff00, flatShading: true } );

		// chunk
		for(let chunk of map2values(Chunk.map)){
			
			const mesh = new THREE.Mesh( geometry, material );
			mesh.position.x = chunk.position.x * Chunk.size;
			mesh.position.y = 0;
			mesh.position.z = chunk.position.z * Chunk.size;
			mesh.scale.x = Chunk.size;
			mesh.scale.y = 1;
			mesh.scale.z = Chunk.size;

			mesh.updateMatrix();
			mesh.matrixAutoUpdate = false;

			Chunk.setIn(mesh);
		}
		*/
		// ---


		return 1
	}
	//main
	lds.classList.remove('display-none');
	const res = await LLM_Command(input);
	console.log(res);
	await commands[res.command](input);

	lds.classList.add('display-none');
	console.log('API_COUNTER.LLM = ', bp.API_COUNTER.LLM)
}
// ===============================================================================================================================
// ===============================================================================================================================
//													LLMs
// ===============================================================================================================================

async function LLM_Command(input){
	let cost = bp.API_COUNTER.LLM;

	const prompt = 
`### instructions :
When user enters a reference to a specific command, return the contents in the format { "command" : STRING}<END>
Example : je veux passer en mode créatif => {"command" : "GAMEMODE" }<END>;
Write '<END>' after format.
Possibles commands are :
'HELP', 'TELEPORT', 'GAMEMODE', 'CREATE'
### input :
${input}
### response : `;

	let output = await bp.promptIteratorLLM(prompt, 2);

	cost = bp.API_COUNTER.LLM - cost;

	console.log('LLM_Command : ','Coût = ' + cost);

	output = JSON.parse(output.split('#')[0].split('<END>')[0]);

	return output
}

//----------------------------------------------------

let commands = {
	HELP : ()=>{},
	TELEPORT : async function(input){
		const args = await LLM_Teleport(input);
		camera.position.set(args.x, args.y, args.z);
	},
	GAMEMODE : ()=>{},
	CREATE : ()=>{},

}

//----------------------------------------------------

async function LLM_Teleport(input){
	let cost = bp.API_COUNTER.LLM;

	const prompt = 
`### instructions :
When user enters a reference to the 'teleport' command, return the arguments in the format { "x" : FLOAT, "y" : FLOAT, "z" : FLOAT }<END>
Examples : 'tp moi en 0 50 0' => { "x" : 0, "y" : 50, "z" : 0 }<END>; 'téléportation en 0 0 0' => { "x" : 0, "y" : 0, "z" : 0 }<END>;
Write '<END>' after format.
### input :
${input}
### response : `;
	let output = await bp.promptIteratorLLM(prompt, 3);

	cost = bp.API_COUNTER.LLM - cost;

	console.log('LLM_Teleport : ','Coût = ' + cost);

	output = JSON.parse(output.split('#')[0].split('<END>')[0]);

	return output
}

// ===============================================================================================================================
// ===============================================================================================================================
//													ENTITY & PLAYER
// ===============================================================================================================================

class Entity{
	constructor(position, direction, fov){
		this.position = position;
		this.direction = direction;
		this.fov = fov;
	}
}

class Player extends Entity{
	constructor(camera){
		super(
			camera.position,
			new THREE.Vector3(1, 0, 0),
			camera.fov * THREE.MathUtils.DEG2RAD,
		);
		this.camera = camera;
	}

	update(){
		camera.getWorldDirection(this.direction);
		
	}

	setFov(){
		this.fov = this.camera.fov * THREE.MathUtils.DEG2RAD;
		return this.fov
	}
}

// ===============================================================================================================================
// ===============================================================================================================================
//													CHUNK
// ===============================================================================================================================

class Chunk {
	constructor(x = 0, y = 0, z = 0, scene) {
		this.position = new THREE.Vector3(x, y, z);
		this.worldPosition = this.position.clone().multiplyScalar(Chunk.size);

		this.group = this.createGroup();
		scene.add(this.group);

		this.id = this.group.uuid;

		this.objects = [];

		Chunk.map.set(this.id, this);
		Chunk.position2id.set(this.positionToString(), this.id);
	}

	positionToString() {
		return `${this.position.x},${this.position.y},${this.position.z}`
	}

	//this.id = this.setId(bp.sha256);
	async setId(hash) {
		return await hash(this.positionToString());
	}

	createGroup() {
		const group = new THREE.Group();
		group.visible = false;
		group.name = `Chunk/${this.position.x},${this.position.y},${this.position.z}`;
		return group;
	}

	render(player){
		const distance = player.position.distanceTo(this.worldPosition);

		const isShown = distance < Chunk.renderDistance && Chunk.isChunkInPlayerView(player, this.worldPosition);
		this.show(isShown);
	}

	show(bool) {
		this.group.visible = bool;
		return this.group.visible
	}

	add(object){
		this.objects.push(object);
		this.group.add(object);
	}

	remove(object) {
		const index = this.objects.indexOf(object);
		if (index !== -1) {
			this.objects.splice(index, 1);
			this.group.remove(object);
		}
	}
}
//----------------------------------------------------

Chunk.lastChunk;
Chunk.newChunk;
Chunk.size = 16;
Chunk.renderDistance = 512;
Chunk.map = new Map();
Chunk.position2id = new Map();

Chunk.toLoad = [];

function map2values(map){
	return [...map.values()]
}

function map2keys(map){
	return [...map.keys()]
}

Chunk.update = function(player, chunks) {
	// appeler : Chunk.update(player, map2values(Chunk.map))

	const playerPosition = player.position;

	const chunkDistanceThreshold = Chunk.renderDistance * 1.1; // Distance seuil pour générer de nouveaux chunks

	
	// Afficher le chunk du joueur
	/*
	const playerChunkPosition = Chunk.entityIn(player);
	const id = Chunk.position2id.get(vectorToString(playerChunkPosition));
	const playerChunk = Chunk.map.get(id);
	playerChunk.show(true);*/

	// Génération de nouveaux chunks
	
	const newChunkPositions = Chunk.generateNewChunkPositions(player);

	// mauvaise méthode
	for (const chunkPosition of newChunkPositions) {
		if (!Chunk.exist(chunkPosition)) {
			Chunk.toLoad.push(chunkPosition);
		}
	}


	// Affichage des chunks visibles : 
	for (const chunk of chunks) {
		chunk.render(player);
	}
	
}

Chunk.isUpdate = function(player) {

	Chunk.newChunk = Chunk.entityIn(player);

	if (!Chunk.lastChunk) {
		Chunk.lastChunk = Chunk.newChunk.clone();
		return false
	}

	const tempLastChunk = Chunk.lastChunk.clone();

	Chunk.lastChunk = Chunk.newChunk.clone();

	return( !tempLastChunk.equals( Chunk.newChunk ) );
}

Chunk.exist = function(chunkPosition) {
	const id = Chunk.position2id.get(vectorToString(chunkPosition));
	return !!id
}

Chunk.isChunkInPlayerView = function(player, chunkWorldPosition) {
	const halfSize = 0.5 * Chunk.size;
	

	const playerDirection = player.direction.clone();

	// point de vue de player un peu reculé
	const playerPosition = player.position.clone().addScaledVector( playerDirection, - 2 * Chunk.size );

	const chunkDirection = chunkWorldPosition.clone().addScalar( halfSize ).sub(playerPosition).normalize();
	

	const dotProduct = chunkDirection.dot(playerDirection);
	//const halfFov = player.fov * .5;

	// Vérifier si le chunk est dans l'angle de vue du joueur
	return dotProduct >= Math.cos(player.fov);
}


// à opti
Chunk.generateNewChunkPositions = function(player) {
  const chunkSize = Chunk.size;
  const playerChunkPosition = Chunk.entityIn(player);
  const numChunks = 3; // Nombre de chunks à générer dans chaque direction (total de chunks générés = (2*numChunks + 1)^3)

  const newChunkPositions = [];

  // Boucle pour générer les positions des chunks dans chaque direction (x, y, z)

  console.log(Chunk.toLoad.length)

  for (let dx = -numChunks; dx <= numChunks; dx++) {
    for (let dy = -numChunks; dy <= numChunks; dy++) {
      for (let dz = -numChunks; dz <= numChunks; dz++) {
        const chunkPosition = playerChunkPosition.clone().add(new THREE.Vector3( dx, dy, dz ));

        //console.log(Chunk.exist(chunkPosition), Chunk.toLoad.length)
        if (!Chunk.exist(chunkPosition)) {

        	//console.log( Chunk.isChunkInPlayerView(player, chunkPosition.clone().multiplyScalar(Chunk.size)) )
          if (Chunk.isChunkInPlayerView(player, chunkPosition.clone().multiplyScalar(Chunk.size))) {
          
	          newChunkPositions.push(chunkPosition);
	          
	        }
          
        }

        
      }
    }
  }

  return newChunkPositions;
}


// -----------------------------------

function vectorToString(v){
	// vect3(1,2,3) => "1,2,3"
	//Utilisation de l'hypothèse que les composantes soient entières et Vector3
	return [v.x,v.y,v.z].toString();
}

function stringToVector(s){
	// "1,2,3" => vect3(1,2,3)
	//Utilisation de l'hypothèse que les composantes soient entières et Vector3
	const v = new THREE.Vector3();
	return v.fromArray(s.split(',')).floor();
}

Chunk.objectIn = function(object){
	const chunkPosition = object.position.clone().divideScalar(Chunk.size).floor();
	return chunkPosition;
}

Chunk.entityIn = function(entity){
	const chunkPosition = entity.position.clone().divideScalar(Chunk.size).floor();
	return chunkPosition
}

Chunk.setIn = function(object){
	const chunkPosition = Chunk.objectIn(object);
	const id = Chunk.position2id.get(vectorToString(chunkPosition));
	const chunk = Chunk.map.get(id)

	if (chunk) {
		chunk.add( object );
		return 1
	}
	//console.warn(`Aucun chunk n'a été trouvé pour : `, object);
	const newChunk = new Chunk( chunkPosition.x, chunkPosition.y, chunkPosition.z, scene );
	newChunk.add( object );
	console.warn(`TEMP : Création du chunk : `, chunkPosition);
	return 0
}

function lerp( t, a, b ){
	return a + t*( b - a );
}

function lerp3(pointA, pointB, t) {
  const interpolatedPoint = new THREE.Vector3();
  interpolatedPoint.lerpVectors(pointA, pointB, t);
  return interpolatedPoint;
}

function mapValue(value, a, b, c, d) {
  // Vérifier que la valeur est dans l'intervalle [a, b]
  if (value <= a) return c;
  if (value >= b) return d;

  // Calculer le ratio entre la valeur dans l'intervalle [a, b]
  const ratio = (value - a) / (b - a);

  // Calculer la valeur mappée dans l'intervalle [c, d]
  const mappedValue = c + ratio * (d - c);
  return mappedValue;
}

function smoothstep(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
}


// ===============================================================================================================================
// ===============================================================================================================================
//													MARCHING CUBES
// ===============================================================================================================================

// credits : http://paulbourke.net/geometry/polygonise/

const triTable =  [ [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1],
 [3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1],
 [3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1],
 [3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1],
 [9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1],
 [1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1],
 [9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
 [2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1],
 [8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1],
 [9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1],
 [4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1],
 [3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1],
 [1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1],
 [4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1],
 [4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1],
 [9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1],
 [1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
 [5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1],
 [2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1],
 [9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
 [0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1],
 [2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1],
 [10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1],
 [4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1],
 [5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1],
 [5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1],
 [9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1],
 [0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1],
 [1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1],
 [10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1],
 [8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1],
 [2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1],
 [7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1],
 [9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1],
 [2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1],
 [11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1],
 [9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1],
 [5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1],
 [11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1],
 [11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
 [1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1],
 [9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1],
 [5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1],
 [2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
 [0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
 [5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1],
 [6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1],
 [0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1],
 [3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1],
 [6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1],
 [5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1],
 [1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
 [10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1],
 [6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1],
 [1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1],
 [8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1],
 [7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1],
 [3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
 [5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1],
 [0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1],
 [9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1],
 [8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1],
 [5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1],
 [0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1],
 [6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1],
 [10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1],
 [10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1],
 [8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1],
 [1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1],
 [3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1],
 [0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1],
 [10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1],
 [0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1],
 [3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1],
 [6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1],
 [9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1],
 [8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1],
 [3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1],
 [6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1],
 [0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1],
 [10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1],
 [10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1],
 [1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1],
 [2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1],
 [7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1],
 [7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1],
 [2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1],
 [1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1],
 [11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1],
 [8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1],
 [0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1],
 [7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
 [10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
 [2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
 [6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1],
 [7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1],
 [2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1],
 [1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1],
 [10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1],
 [10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1],
 [0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1],
 [7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1],
 [6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1],
 [8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1],
 [9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1],
 [6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1],
 [1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1],
 [4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1],
 [10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1],
 [8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1],
 [0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1],
 [1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1],
 [8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1],
 [10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1],
 [4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1],
 [10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
 [5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
 [11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1],
 [9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
 [6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1],
 [7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1],
 [3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1],
 [7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1],
 [9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1],
 [3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1],
 [6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1],
 [9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1],
 [1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1],
 [4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1],
 [7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1],
 [6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1],
 [3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1],
 [0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1],
 [6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1],
 [1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1],
 [0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1],
 [11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1],
 [6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1],
 [5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1],
 [9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1],
 [1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1],
 [1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1],
 [10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1],
 [0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1],
 [5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1],
 [10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1],
 [11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1],
 [0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1],
 [9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1],
 [7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1],
 [2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1],
 [8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1],
 [9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1],
 [9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1],
 [1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1],
 [9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1],
 [9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1],
 [5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1],
 [0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1],
 [10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1],
 [2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1],
 [0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1],
 [0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1],
 [9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1],
 [5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1],
 [3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1],
 [5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1],
 [8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1],
 [0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1],
 [9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1],
 [0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1],
 [1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1],
 [3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1],
 [4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1],
 [9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1],
 [11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1],
 [11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1],
 [2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1],
 [9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1],
 [3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1],
 [1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1],
 [4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1],
 [4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1],
 [0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1],
 [3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1],
 [3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1],
 [0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1],
 [9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1],
 [1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
 [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]];

// Création du tableau edgeTable
const edgeTable = [
  0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c, // Tableau des arêtes
  0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
  0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
  0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
  0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c,
  0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
  0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac,
  0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
  0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c,
  0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
  0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc,
  0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
  0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c,
  0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
  0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc,
  0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
  0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
  0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
  0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
  0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
  0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
  0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
  0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
  0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
  0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
  0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
  0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
  0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
  0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
  0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
  0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
  0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
];

class Triangle {
	constructor(p = []) {
		this.p = p;
	}

	toArray() {
		return [
			this.p[0].x, this.p[0].y, this.p[0].z,
			this.p[1].x, this.p[1].y, this.p[1].z,
			this.p[2].x, this.p[2].y, this.p[2].z
		]
	}

	translate(position) {

		this.p[0].x += position.x;
		this.p[0].y += position.y;
		this.p[0].z += position.z;

		this.p[1].x += position.x;
		this.p[1].y += position.y;
		this.p[1].z += position.z;

		this.p[2].x += position.x;
		this.p[2].y += position.y;
		this.p[2].z += position.z;

		return this
	}
}

class GridCell {
	constructor(p = [], val = []) {
		this.p = p;
		this.val = val;
	}
}

function polygonise(grid, isolevel) {
  const vertlist = new Array(12);

  const triangles = [];

  let cubeindex = 0;
  if (grid.val[0] < isolevel) cubeindex |= 1;
  if (grid.val[1] < isolevel) cubeindex |= 2;
  if (grid.val[2] < isolevel) cubeindex |= 4;
  if (grid.val[3] < isolevel) cubeindex |= 8;
  if (grid.val[4] < isolevel) cubeindex |= 16;
  if (grid.val[5] < isolevel) cubeindex |= 32;
  if (grid.val[6] < isolevel) cubeindex |= 64;
  if (grid.val[7] < isolevel) cubeindex |= 128;

  if (edgeTable[cubeindex] === 0) {
	return [];
  }

  if (edgeTable[cubeindex] & 1)
	vertlist[0] = vertexInterp(isolevel, grid.p[0], grid.p[1], grid.val[0], grid.val[1]);
  if (edgeTable[cubeindex] & 2)
	vertlist[1] = vertexInterp(isolevel, grid.p[1], grid.p[2], grid.val[1], grid.val[2]);
  if (edgeTable[cubeindex] & 4)
	vertlist[2] = vertexInterp(isolevel, grid.p[2], grid.p[3], grid.val[2], grid.val[3]);
  if (edgeTable[cubeindex] & 8)
	vertlist[3] = vertexInterp(isolevel, grid.p[3], grid.p[0], grid.val[3], grid.val[0]);
  if (edgeTable[cubeindex] & 16)
	vertlist[4] = vertexInterp(isolevel, grid.p[4], grid.p[5], grid.val[4], grid.val[5]);
  if (edgeTable[cubeindex] & 32)
	vertlist[5] = vertexInterp(isolevel, grid.p[5], grid.p[6], grid.val[5], grid.val[6]);
  if (edgeTable[cubeindex] & 64)
	vertlist[6] = vertexInterp(isolevel, grid.p[6], grid.p[7], grid.val[6], grid.val[7]);
  if (edgeTable[cubeindex] & 128)
	vertlist[7] = vertexInterp(isolevel, grid.p[7], grid.p[4], grid.val[7], grid.val[4]);
  if (edgeTable[cubeindex] & 256)
	vertlist[8] = vertexInterp(isolevel, grid.p[0], grid.p[4], grid.val[0], grid.val[4]);
  if (edgeTable[cubeindex] & 512)
	vertlist[9] = vertexInterp(isolevel, grid.p[1], grid.p[5], grid.val[1], grid.val[5]);
  if (edgeTable[cubeindex] & 1024)
	vertlist[10] = vertexInterp(isolevel, grid.p[2], grid.p[6], grid.val[2], grid.val[6]);
  if (edgeTable[cubeindex] & 2048)
	vertlist[11] = vertexInterp(isolevel, grid.p[3], grid.p[7], grid.val[3], grid.val[7]);

  let ntriang = 0;
  for (let i = 0; triTable[cubeindex][i] > -1; i += 3) {
	const triangle = new Triangle();
	triangle.p[0] = vertlist[triTable[cubeindex][i]];
	triangle.p[1] = vertlist[triTable[cubeindex][i + 1]];
	triangle.p[2] = vertlist[triTable[cubeindex][i + 2]];
	triangles[ntriang] = triangle;
	ntriang++;
  }

  return triangles;
}

function vertexInterp(isolevel, p1, p2, valp1, valp2) {
  const mu = (isolevel - valp1) / (valp2 - valp1);
  const p = {
	x: p1.x + mu * (p2.x - p1.x),
	y: p1.y + mu * (p2.y - p1.y),
	z: p1.z + mu * (p2.z - p1.z)
  };
  return p;
}

// ------------------------------------------------
/*
const grid = new GridCell(
  [
	new THREE.Vector3(0, 0, 0),
	new THREE.Vector3(1, 0, 0),
	new THREE.Vector3(1, 1, 0),
	new THREE.Vector3(0, 1, 0),
	new THREE.Vector3(0, 0, 1),
	new THREE.Vector3(1, 0, 1),
	new THREE.Vector3(1, 1, 1),
	new THREE.Vector3(0, 1, 1)
  ],
  [0.2, 0.8, 0.5, 0.3, 0.7, 0.9, 0.4, 0.6]
);
const isolevel = 0.5;


const triangles = polygonise(grid, isolevel)
*/
/*
const CORNERS = [
	new THREE.Vector3(0, 0, 0),
	new THREE.Vector3(1, 0, 0),
	new THREE.Vector3(1, 1, 0),
	new THREE.Vector3(0, 1, 0),
	new THREE.Vector3(0, 0, 1),
	new THREE.Vector3(1, 0, 1),
	new THREE.Vector3(1, 1, 1),
	new THREE.Vector3(0, 1, 1)
];*/

function getCorners(position) {
	const corners = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(1, 1, 0),
		new THREE.Vector3(0, 1, 0),
		new THREE.Vector3(0, 0, 1),
		new THREE.Vector3(1, 0, 1),
		new THREE.Vector3(1, 1, 1),
		new THREE.Vector3(0, 1, 1)
	];
	corners.map( p => p.add(position))
	return corners
}

function marchingCube( position, isolevel = 0.0 ){
	// créer tous les triangles d'un chunk entier => moins optimisé, mais matériau indépendant au bloc près
	

	const corners = getCorners(position);

	let values = [];
	for(let i = 0; i < 8; i++){
		const v = corners[i];
		//temp
		let value = perlin.noise( v.x * perlinFreq, v.y * perlinFreq, v.z * perlinFreq );
		const valueY4 = 0.5 * perlin.noise( v.x * perlinFreq * 3, 0.0, v.z * perlinFreq * 3 );
		const valueY = perlin.noise( v.x * perlinFreq, 0.0, v.z * perlinFreq );

		const height = 40 + 30 * value + 20 * valueY4;
		value += v.y < height ? 0 : -mapValue( v.y, height, height + 20, 0.0, 1.0 ) ;


		worldGrid.setCell( v.x, v.y, v.z, value );
		//
		values.push(worldGrid.getCell( v.x, v.y, v.z ));
	}



	const grid = new GridCell(corners, values);
	const triangles = polygonise(grid, isolevel, position);

	const trianglesArray = triangles2array(triangles);

	
	return trianglesArray
}


function marchingChunk( chunkPosition, isolevel = 0.0 ){
	// créer tous les triangles d'un chunk entier => plus optimisé, mais matériau plus dépendant

	let triangles = [];
	
	const worldPosition = chunkPosition.clone().multiplyScalar(Chunk.size);

	for (var x = 0; x < Chunk.size; x++) {
	for (var y = 0; y < Chunk.size; y++) {
	for (var z = 0; z < Chunk.size; z++) {
		const position = new THREE.Vector3( x, y, z );
		position.add(worldPosition);
		triangles.push(...marchingCube( position, isolevel ));
	}}}
	
	return triangles
}

function triangles2array(triangles){
	let array = [];
	for(let triangle of triangles){
		array.push(...triangle.toArray());
	}
	return array
}


// ------------------------------------------------

function triangles2mesh(triangles, position){
	//triangles = [ 0.5, 0.3, 0.1, 0.6, 0.7, 0.6, 11.3, 11.2, 11.7, ...]
	/*
	La géométrie est translaté mais pas le mesh !!
	Solution à ce problème :
		geometry.translate( - position );
		mesh.position.set(position);
	*/

	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array( triangles );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

	geometry.computeVertexNormals();
	geometry.normalizeNormals();
	geometry.translate( -position.x, -position.y, -position.z );

	const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );

	const mesh = new THREE.Mesh( geometry, material );

	mesh.castShadow = true;
	mesh.receiveShadow = true;

	mesh.position.copy( position );

	Chunk.setIn(mesh);

	return mesh;
}


function genChunk(position) {
	const triangles = marchingChunk( position, 0.0 );
	const worldPosition = position.clone().multiplyScalar(Chunk.size);
	triangles2mesh(triangles, worldPosition);
}

function updateChunk(position) {
	const triangles = marchingChunk( position, 0.0 );
	//mesh attributes.triangles <-- triangles
}

// ===============================================================================================================================
// ===============================================================================================================================
//													GRID
// ===============================================================================================================================

class Grid {

	/*
	Grille du monde : stocke les valeurs utilisées pour MarchingCubes, valeur entre [-1,1]
	*/

	constructor(size){
		this.size = size;
		this.size2 = size * size;
		this.size3 = this.size2 * size;
		this.array = new Float32Array( new ArrayBuffer( 4 * this.size3 ), 0, this.size3 );
	}

	getIndex( x, y, z ){
		const halfSize = this.size * 0.5;
		/*
		if ( -halfSize <= x || halfSize > x || -halfSize <= y || halfSize > y || -halfSize <= z || halfSize > z) {
			console.warn(x,y,z,' est hors grille');
			return 0
		}*/
		return (x + halfSize) + (y + halfSize) * this.size + (z + halfSize) * this.size2
	}

	getCell( x, y, z ){
		return this.array[this.getIndex( x, y, z )];
	}

	setCell( x, y, z, value ){
		const index = this.getIndex(x, y, z);
		this.array[index] = value;
	}
}

const worldGrid = new Grid(Chunk.size * 16);
console.warn(`Taille du monde : ${worldGrid.size} x ${worldGrid.size} x ${worldGrid.size} (${worldGrid.size3})`);


// ===============================================================================================================================
// ===============================================================================================================================
//													MAIN
// ===============================================================================================================================

import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

let camera, controls, scene, renderer;
let player;

const clock = new THREE.Clock();
const center = new THREE.Vector3( 0, 0, 0 );
const pointer = new THREE.Vector2( 0, 0 );// rajouter un addEventListener('click/mouseMove/touch')

const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.1;
raycaster.far = 200;

const perlin = new ImprovedNoise();
const perlinFreq = 0.03;

//init();
animate();


function init() {

	app = document.getElementById('appSandbox');

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x1f1f1f );
	scene.fog = new THREE.FogExp2( 0x1f1f1f, 0.002 );//0xf4f4f4 si fond blanc // 0xfaa7a7 si fond coloré

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
	RENDERERS_COUNT ++
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	app.appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 40, 0, 0 );
	

	// controls

	controls = new MapControls( camera, renderer.domElement );

	controls.enableDamping = true;
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = false;

	controls.minDistance = 20;
	controls.maxDistance = 5000;

	controls.maxPolarAngle = Math.PI / 2;

	// player

	player = new Player(camera);

	// world

	const geometry = new THREE.BoxGeometry( 1, 1, 1 );
	const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	const cube = new THREE.Mesh( geometry, material );
	scene.add( cube );

	camera.lookAt(cube)

	//https://market.pmnd.rs/

	//https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-lime/model.gltf
	//https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-beech/model.gltf
	//https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-spruce/model.gltf


	// lights

	const dirLight1 = new THREE.DirectionalLight( 0xf4f4f4 );
	dirLight1.position.set( 1, 1, 3 );
	scene.add( dirLight1 );

	const dirLight2 = new THREE.DirectionalLight( 0x1f1f1f );
	dirLight2.position.set( - 1, - 1, - 1 );
	scene.add( dirLight2 );

	const ambientLight = new THREE.AmbientLight( 0x222222 );
	scene.add( ambientLight );

	//

	window.addEventListener( 'resize', onWindowResize );

	// générer au démarrage
	
	setTimeout(() => {
		GO_TO_RENDERER('appSandbox')
		multiTask('MCUBES');

	}, 2000)

	

	// -------------------------------------------------------

	promptInput = app.querySelectorAll('input')[0];
	promptInput.onExec = (input, e) => multiTask(input, e);

	const ldsObj = new Element('lds', {})
		.css({
			position : 'absolute',
			background : 'var(--color-white-semi)',
			borderRadius : '100%',
			bottom : '20%',
			right : '10%',
		})
		.class('lds', 'display-none')
		
	ldsObj.attachTo(app)
	lds = ldsObj.element;

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	//renderer.setSize( window.innerWidth * 0.98, window.innerHeight * 0.98 );
}

function raycastUpdate( camera, scene ){
	raycaster.setFromCamera( pointer, camera );
	const intersections = raycaster.intersectObjects( scene.children );
	return intersections;
}

function animate() {

	requestAnimationFrame( animate );

	if (RENDERERS_RUNNING.get('appSandbox')) render()
}

function render() {


/*
	const angle = clock.getElapsedTime() * 0.04;
	camera.position.set(400*Math.cos(angle), 200, 400*Math.sin(angle));*/
	//camera.lookAt(center);

	controls.update();
	player.update();


	if (Chunk.toLoad.length > 0) {
		genChunk(Chunk.toLoad[0]);
		Chunk.toLoad.shift();
	}
	if (Chunk.isUpdate(player)) {
		Chunk.update(player, map2values(Chunk.map));
		//console.log(Chunk.newChunk);
	}
	
	/*
	isUpdate(lastChunk,newChunk){

		if (lastChunk === undefined || newChunk === undefined){
			return false
		}
		return( !lastChunk.equals( newChunk ) );
	}
	*/

	renderer.render( scene, camera );
}




RENDERERS_INIT.set('appSandbox', init);


