/*
class TestClass {

	constructor( a ) {

		this.test = 12;
		this.a = a;

	}

}

export { TestClass };

*/




/*
import {
	Vector3,
	Matrix4,
	InstancedMesh
} from 'three';*/

import * as THREE from 'three';


function getRandomRange(min, max) {
	return Math.random() * (max - min) + min;
}


let MathUtils = {
	getRandomRange : getRandomRange,
}

let Materials = {
	red : new THREE.MeshPhongMaterial( { color: 0xff0000 } ),
	green : new THREE.MeshPhongMaterial( { color: 0x00ff00 } ),
	blue : new THREE.MeshPhongMaterial( { color: 0x0000ff } ),
	darkorange : new THREE.MeshPhongMaterial( { color: 0xff8c00 } ),
	white : new THREE.MeshPhongMaterial( { color: 0xffffff } ),
	black : new THREE.MeshPhongMaterial( { color: 0x000000 } ),

	purpleff0080 : new THREE.MeshPhongMaterial( { color: 0xff0080 } ),

	lines : { // linewidth = 1 on firefox
		red : new THREE.LineBasicMaterial( { color : 0xff0000, linewidth: 5} ),
		blue : new THREE.LineBasicMaterial( { color : 0x00ff00, linewidth: 5} ),
		green : new THREE.LineBasicMaterial( { color : 0x0000ff, linewidth: 5} ),
		white : new THREE.LineBasicMaterial( { color : 0xffffff, linewidth: 5} ),
		black : new THREE.LineBasicMaterial( { color : 0x000000, linewidth: 5} ),
	}

}

let Geometries = {
	box : new THREE.BoxGeometry(),
	largeBox : new THREE.BoxGeometry(10, 10, 10),
	dodecahedron : new THREE.DodecahedronGeometry(10, 0),

}




class Vertex {
	constructor(name, position, velocity, radius){
		this.isVertex = true;
		this.name = name;

		//physics
		this.position = position;
		this.velocity = velocity;
		this.radius = radius;
	}

	clone(){
		return new Vertex(this.name, this.position, this.velocity, this.radius)
	}

	copy(v){
		this.name = v.name;
		this.position = v.position.clone();
		this.velocity = v.velocity.clone();
		this.radius = v.radius;
	}
}



class Graph {
	constructor(vertices, edges) {
		this.isGraph = true;
		this.vertices = vertices;
		this.edges = edges;

		this.G = 1; // Constante de gravitation
		this.r0 = 50; // Distance de répulsion
		this.k = -1; // Constante de force
		this.friction = 0.8 // Coefficient de friction 1 = pas de friction, 0 = décélération infini
	}

	static random(N, p, inBox, velocity = new THREE.Vector3(), radius = 1){
		const vertices = [];
		const edges = [];
		const connectionProbability = p;
		const min = inBox.min;
		const max = inBox.max;

		// Crée N sommets
		for (let i = 0; i < N; i++) {
			const x = getRandomRange(min.x, max.x);
			const y = getRandomRange(min.y, max.y);
			const z = getRandomRange(min.z, max.z);
			vertices.push(new Vertex(`Vertex ${i + 1}`, new THREE.Vector3(x, y, z), velocity.clone(), radius));
		}

		// Connecte chaque sommet de manière aléatoire
		for (let i = 0; i < N; i++) {
			for (let j = i + 1; j < N; j++) {
				if (Math.random() < connectionProbability) {
					edges.push([i, j]);
				}
			}
		}

		return new Graph(vertices, edges);
	}

	addVertex(position, velocity, radius) {
		// Créez un nouveau sommet avec une position donnée
		const vertex = new Vertex('', position, velocity, radius);
		// Ajoutez le sommet au graphe
		this.vertices.push(vertex);
		return this;
	}

	addEdge(index0, index1) {
		// Ajoutez l'arête au graphe
		this.edges.push([index0,index1]);

		return this;
	}

	attract(){
		// Calcule la force de répulsion et d'attraction entre les sommets
		for (let i = 0; i < this.vertices.length; i++) {
			for (let j = i + 1; j < this.vertices.length; j++) {
				const v1 = this.vertices[i];
				const v2 = this.vertices[j];

				const r = Math.sqrt((v2.position.x - v1.position.x) ** 2 + (v2.position.y - v1.position.y) ** 2);
				const f = this.G * this.k * (this.r0 - r) / r;
				const angle = Math.atan2(v2.position.y - v1.position.y, v2.position.x - v1.position.x);
				v1.velocity.x += f * Math.cos(angle);
				v1.velocity.y += f * Math.sin(angle);
				v2.velocity.x -= f * Math.cos(angle);
				v2.velocity.y -= f * Math.sin(angle);
			}
		}

		// Applique la friction à chaque sommet
		for (const v of this.vertices) {
			v.velocity.x *= this.friction;
			v.velocity.y *= this.friction;
		}


		// Met à jour la position des sommets
		for (const v of this.vertices) {
			v.position.x += v.velocity.x;
			v.position.y += v.velocity.y;
		}
	}

	attract3D_old(){
		// Calcule la force de répulsion et d'attraction entre les sommets

		for (let i = 0; i < this.vertices.length; i++) {
			for (let j = i + 1; j < this.vertices.length; j++) {
				const v1 = this.vertices[i];
				const v2 = this.vertices[j];

				const r = Math.sqrt((v2.position.x - v1.position.x) ** 2 + (v2.position.y - v1.position.y) ** 2 + (v2.position.z - v1.position.z) ** 2);
				//console.log('r',r)
				const f = this.G * this.k * (this.r0 - r) / r;
				//console.log('r',f)
				const angleX = Math.atan2(v2.position.y - v1.position.y, v2.position.x - v1.position.x);
				const angleY = Math.atan2(v2.position.z - v1.position.z, v2.position.y - v1.position.y);
				const angleZ = Math.atan2(v2.position.x - v1.position.x, v2.position.z - v1.position.z);

				v1.velocity.x += f * Math.cos(angleX);
				v1.velocity.y += f * Math.cos(angleY);
				v1.velocity.z += f * Math.cos(angleZ);//erreur dans les cos/sin
				v2.velocity.x -= f * Math.cos(angleX);
				v2.velocity.y -= f * Math.cos(angleY);
				v2.velocity.z -= f * Math.cos(angleZ);
			}
		}

		// Applique la friction à chaque sommet
		for (const v of this.vertices) {
			v.velocity.x *= this.friction;
			v.velocity.y *= this.friction;
			v.velocity.z *= this.friction;
		}


		// Met à jour la position des sommets
		for (const v of this.vertices) {
			v.position.x += v.velocity.x;
			v.position.y += v.velocity.y;
			v.position.z += v.velocity.z;
		}
	}

	attract3D(){
		// Calcule la force de répulsion et d'attraction entre les sommets

		for (let i = 0; i < this.vertices.length; i++) {
			for (let j = i + 1; j < this.vertices.length; j++) {
				const v1 = this.vertices[i];
				const v2 = this.vertices[j];

				const r = Math.sqrt((v2.position.x - v1.position.x) ** 2 + (v2.position.y - v1.position.y) ** 2 + (v2.position.z - v1.position.z) ** 2);
				const theta = Math.atan2(v2.position.y - v1.position.y, v2.position.x - v1.position.x);
				const phi = Math.acos((v2.position.z - v1.position.z) / r);
				const f = this.G * this.k * (this.r0 - r) / r;

				const fx = f * Math.sin(phi) * Math.cos(theta);
				const fy = f * Math.sin(phi) * Math.sin(theta);
				const fz = f * Math.cos(phi);

				v1.velocity.x += fx;
				v1.velocity.y += fy;
				v1.velocity.z += fz;
				v2.velocity.x -= fx;
				v2.velocity.y -= fy;
				v2.velocity.z -= fz;
			}
		}

		// Applique la friction à chaque sommet
		for (const v of this.vertices) {
			v.velocity.x *= this.friction;
			v.velocity.y *= this.friction;
			v.velocity.z *= this.friction;
		}


		// Met à jour la position des sommets
		for (const v of this.vertices) {
			v.position.x += v.velocity.x;
			v.position.y += v.velocity.y;
			v.position.z += v.velocity.z;
		}
	}

	centroid(){//barycentre (fr)
		const sum = new THREE.Vector3();
		for (const vertex of this.vertices) {
			sum.add(vertex.position)
		}
		return sum.multiplyScalar( 1/this.vertices.length )
	}

	moveFrom(d){//déplacement relatif
		for (const v of this.vertices) {
			v.position.add(d)
		}
	}//graphList[0].moveFrom(new Vector(10,0,0)) : décalé de 10 en x

	moveTo(position){//déplacement absolu
		const diff = position.clone().sub(this.centroid());
		this.moveFrom(diff);
	}
}















class MeshGraph extends Graph{
	constructor(vertices, edges, geometry, material){
		super(vertices,edges);
		this.mesh = this.initVertices(geometry, material);
		this.lines = this.initEdges( Materials.lines.black );

		this.kernel /* noyau */ = this.initKernel(Geometries.dodecahedron, Materials.black); 
		this.kernel.scale.set(0.4,0.4,0.4);
	}

	initVertices(geometry, material){
		let instancesCount = this.vertices.length;
		let matrix = new THREE.Matrix4();
		let instancedMesh = new THREE.InstancedMesh( geometry, material, instancesCount );

		for( let i = 0; i < instancesCount; i ++ ) {
			// Set the position of instance
			matrix.setPosition( this.vertices[i].position );
			instancedMesh.setMatrixAt( i, matrix );
		}

		return instancedMesh
	}

	initEdges(material){

		const linesGroup = new THREE.Group()

		for (let edge of this.edges) {

			const geometry = new THREE.BufferGeometry().setFromPoints( [this.vertices[edge[0]].position, this.vertices[edge[1]].position] );
			linesGroup.add(new THREE.Line( geometry, material ));
		}
		return linesGroup;
	}

	initKernel(geometry, material){
		return new THREE.Mesh(geometry, material);
	}

	moveKernelTo(v){
		this.kernel.position.copy(v);
		this.moveTo(v);
	}

	moveKernelFrom(v){
		this.kernel.position.add(v);
		this.moveFrom(v);
	}

	render(){

		this.attract3D_old();

		//update les sommets
		let matrix = new THREE.Matrix4();
		for( let i = 0; i < this.vertices.length; i ++ ) {

			matrix.setPosition( this.vertices[i].position );
			this.mesh.setMatrixAt( i, matrix );
		}
		this.mesh.instanceMatrix.needsUpdate = true;

		//update les arêtes
		for (let index in this.edges) {
			const edge = this.edges[ index ]
			this.lines.children[ index ].geometry.setFromPoints( [this.vertices[edge[0]].position, this.vertices[edge[1]].position] )
		}

		if (this.vertices.length < 1) return
		this.kernel.position.copy( this.centroid() )
	}


}




class NaturalInteger {
	constructor(number){
		this.isNaturalInteger = true;
		this.number = number;
		this.graph = this.getGraph(
				Geometries.largeBox,
				Materials.purpleff0080
			);
	}

	getGraph(geometry, material){

		const vertices = [];
		const edges = [];

		// Crée this.number sommets
		for (let i = 0; i < this.number; i++) {
			const x = getRandomRange(-50,50);
			const y = getRandomRange(-50,50);
			const z = getRandomRange(-50,50);
			vertices.push(new Vertex(`Vertex ${i + 1}`, new THREE.Vector3(x, y, z), new THREE.Vector3(), 1));
		}

		// Connecte chaque sommet par succésseur
		for (let i = 1; i < this.number; i++) {
			edges.push([i-1,i])
		}

		return new MeshGraph(vertices, edges, geometry, material)
	}
}



class Integer {
	constructor(number){
		this.isInteger = true;
		this.number = number;
		this.graph = this.getGraph(
				Geometries.largeBox,
				number < 0 ? Materials.blue : Materials.purpleff0080,
			);
	}

	getGraph(geometry, material){

		const vertices = [];
		const edges = [];

		// Crée this.number sommets
		for (let i = 0; i < Math.abs(this.number); i++) {
			const x = getRandomRange(-50,50);
			const y = getRandomRange(-50,50);
			const z = getRandomRange(-50,50);
			vertices.push(new Vertex(`Vertex ${i + 1}`, new THREE.Vector3(x, y, z), new THREE.Vector3(), 1));
		}

		// Connecte chaque sommet par succésseur
		for (let i = 1; i < Math.abs(this.number); i++) {
			edges.push([i-1,i])
		}

		return new MeshGraph(vertices, edges, geometry, material)
	}
}




export {MathUtils, Materials, Geometries,
 Vertex, Graph, MeshGraph,
 NaturalInteger, Integer,
}








/*
const g01 = createRandomGraphicalGraph(5,'red',0.5);	//ne marche plus sur un serveur local car en dehors du script !!
let g01Mesh;



//init
g01Mesh = graph3Dinit(g01);
	scene.add( g01Mesh );

function graph3Dinit(graph){

	let instancesCount = graph.vertices.length;
	let matrix = new THREE.Matrix4();
	let instancedMesh = new THREE.InstancedMesh( geometryGraph, materialGraph, instancesCount );

	for( let i = 0; i < instancesCount; i ++ ) {
		// Set the position of instance
		matrix.setPosition( new THREE.Vector3(
			graph.vertices[i].position.x,
			graph.vertices[i].position.y,
			graph.vertices[i].position.z
		) );
		instancedMesh.setMatrixAt( i, matrix.clone() );
	}
	return instancedMesh
}


//animate

g01.attract3D();
	let matrix = new THREE.Matrix4();
	for( let i = 0; i < g01.vertices.length; i ++ ) {
		// Set the position of instance
		
		matrix.setPosition( new THREE.Vector3(
			
			g01.vertices[i].position.x,
			g01.vertices[i].position.y,
			g01.vertices[i].position.z
		) );
		g01Mesh.setMatrixAt( i, matrix.clone() );
	}
	g01Mesh.instanceMatrix.needsUpdate = true;*/