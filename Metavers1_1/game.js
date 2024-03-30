console.warn("game.js loaded");

/*
//const inputFile = document.getElementById('inputFile');
//const inputsFile = document.getElementByClassName('inputFile');
const inputFile = document.getElementsByClassName('inputFile')[0];

//https://codepen.io/dudleystorey/pen/KdybXW
//pour enlever les parcourir... et aucun fichier séléctionné

inputFile.addEventListener('change', function(){

	//console.log(this)
	//this = inputFile

	let fileReader = new FileReader();

	fileReader.readAsText(this.files[0]);

	fileReader.onload = ()=>{
		console.log(fileReader.result)
	}
});
*/



function init0(){
	const inputsFile = document.getElementsByClassName('inputFile');

	for( let inputFile of inputsFile){
		inputFile.addEventListener('change', function(){

			let fileReader = new FileReader();

			fileReader.readAsText(this.files[0]);

			fileReader.onload = ()=>{
				//console.log(fileReader.result)
				inputFile.outerText = fileReader.result;
			}
		});
	}
}



let cells;
// Particles/Cells rejection for graph theory

/*
const thirdRootSize = 2;
const size = thirdRootSize * thirdRootSize * thirdRootSize;
*/
const size = 5;
const invSize = 1/size;

const particlesPosition = [];
const particlesSpeed = [];
const particlesAcceleration = [];

const particlesMass = [];

const matrix = new THREE.Matrix4();
const color = new THREE.Color();

function initParticle(){
	/*
	for (let x = 0; x < thirdRootSize; x++) {
	for (let y = 0; y < thirdRootSize; y++) {
	for (let z = 0; z < thirdRootSize; z++) {

		const pos = new THREE.Vector3(x,y,z);
		//pos.subScalar(thirdRootSize *.5);

		particlesPosition.push(pos.multiplyScalar(100));
		particlesSpeed.push(new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(100));
		particlesAcceleration.push(new THREE.Vector3);

		particlesMass.push(Math.random()*4+0.1);
	}}}*/

	for (let i = 0; i < size; i++) {

		const pos = new THREE.Vector3().random().subScalar(.5);

		particlesPosition.push(pos.multiplyScalar(100));
		particlesSpeed.push(new THREE.Vector3().random().subScalar(.5).multiplyScalar(10));
		particlesAcceleration.push(new THREE.Vector3);

		particlesMass.push(Math.random()*5+1);
	}

	cells = new THREE.InstancedMesh( geometries.ball, materials.white, size );
	cells.receiveShadow = true;
	World.list.gameLand.scenePhysical.add(cells);

	for (let i = 0; i < size; i++) {
		color.setHex( Math.random() * 0xffffff );
		cells.setColorAt( i, color );
		cells.instanceColor.needsUpdate = true;
	}
}

function updateParticles(){

	// calculate each new acceleration

	for (let i = 0; i < size; i++) {
		//gravity (attraction)

		/*
		particlesAcceleration[i] = new THREE.Vector3;

		for (let j = 0; j < size; j++) {
		
			const dp = particlesPosition[i].clone().sub(particlesPosition[j]);

			//coordo sphériques

			const dr = particlesPosition[i].distanceTo(particlesPosition[j]);
			//rayon
			const dth = dr > 0 ? Math.acos(dp.z/dr) : 0;
			//theta
			const dph = Math.atan2(dp.y,dp.x);
			//phi

			particlesAcceleration[i].add(new THREE.Vector3(
				dr * Math.sin(dth) * Math.cos(dph),
				dr * Math.sin(dth) * Math.sin(dph),
				dr * Math.cos(dth),
				).divideScalar(particlesMass[i]) // a = F/m
			);
			*/
		particlesAcceleration[i] = new THREE.Vector3;

		for (let j = 0; j < size; j++) {
		
			const dp = particlesPosition[i].clone().sub(particlesPosition[j]);

			particlesAcceleration[i].add(dp.divideScalar(particlesMass[i]) // a = F/m
			);
		}

	}

	// applying calculations to objects

	for (let k = 0; k < size; k++) {

		
		

		//vecteur d'attraction vers le centre
		const v = particlesPosition[k].clone().normalize().negate();

		//calcul vitesse
		particlesSpeed[k] = particlesSpeed[k].addScaledVector( particlesAcceleration[k], -0.1 * invSize);
		particlesSpeed[k].add(v); // attraction vers (0,0,0)

		//calcul position
		particlesPosition[k] = particlesPosition[k].addScaledVector( particlesSpeed[k], 0.01);

		matrix.makeScale(particlesMass[k],particlesMass[k],particlesMass[k]);
		matrix.setPosition(particlesPosition[k]);

		cells.setMatrixAt( k, matrix );
		cells.instanceMatrix.needsUpdate = true;
	}

}