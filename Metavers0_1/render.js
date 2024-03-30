//======================================================
//Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.set( 0, 5, 5 );

const renderer = new THREE.WebGLRenderer( { alpha : true } );

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new THREE.OrbitControls( camera, renderer.domElement );
//======================================================
//Fonctions
function random(min, max) {
    return Math.random() * (max - min) + min;
}
//======================================================
//Scene

const sceneHub = new THREE.Group();

{
const Geo = new THREE.PlaneGeometry(100, 100);
const Mat = new THREE.MeshPhongMaterial( { color : 0x404040, side : THREE.DoubleSide } );
const street = new THREE.Mesh( Geo, Mat );
street.rotation.x = Math.PI * -0.5;
sceneHub.add( street );
}

{
	for (let i = 0; i <= 20; i++) {
		for (let j = 0; j <= 1; j++) {
			const Geo = new THREE.BoxGeometry( 1.0, 0.1, 1.0 );
			const Mat = new THREE.MeshPhongMaterial( { color : 0x808080, side : THREE.DoubleSide } );
			const pad = new THREE.Mesh( Geo, Mat );
			pad.position.set(2*i+9.0, 0.0, 8*j-4.0)
			pad.position.y += 0.05;
			sceneHub.add( pad );
		}
	}
}
{
	for (let j = 0; j <= 1; j++) {
		const Geo = new THREE.BoxGeometry( 42.0, 0.4, 2.0 );
		const Mat = new THREE.MeshPhongMaterial( { color : 0xa0a0a0, side : THREE.DoubleSide } );
		const pad = new THREE.Mesh( Geo, Mat );
		pad.position.set(28.0, 0.0, 11*j-6.0)
		pad.position.y += 0.2;
		pad.position.x += 0.5;
		pad.position.z += 0.5;
		sceneHub.add( pad );
	}
}
{
	for (let k = 0; k <= 1; k++) {
		const nbArbres = random(10,20);
		for (let i = 0; i < nbArbres; i += 1){
			const arbre = new THREE.Group();

			const h = random(2,3);
			const geo = new THREE.CylinderGeometry( 0.12, 0.2, h, 5 );
			const mat = new THREE.MeshPhongMaterial( { color : 0xa19281 } );
			const tronc = new THREE.Mesh( geo, mat );
			arbre.add( tronc );

			const nbFeuilles = random(3,5);
			for (let j = 0; j < nbFeuilles; j += 1){
				const geoF = new THREE.IcosahedronGeometry( random(0.5,0.75) );
				const matF = new THREE.MeshPhongMaterial( { color : 0x8ae8a7 } );
				const feuille = new THREE.Mesh( geoF, matF );
				let xf = random(-.3,.3);
				let yf = random(-.3,.3);
				let zf = random(-.3,.3);
				feuille.position.set( xf, yf + h/2, zf );
				arbre.add( feuille );
			}

			let x = random(10,49);
			let z;
			if (k == 0) {z = random(-6,-5);}
			else {z = random(5,6);}
			arbre.position.set( x, h/2 , z );
			arbre.position.y += 0.4;
			sceneHub.add(arbre);
		}
	}
	
}


{
	const color = 0xFFFFFF;
	const intensity = 0.5;
	const light = new THREE.AmbientLight(color, intensity);
	//light.position.set(-10, -5, -9);
	sceneHub.add(light);
}
{
	const color = 0xFF0000;
	const intensity = 1.0;
	const light = new THREE.PointLight(color, intensity);
	light.position.set(0, 2, 0);
	sceneHub.add(light);
}



	//======================================================
	//Loader
const finalBaseMesh = new THREE.Group();

const loader = new THREE.ObjectLoader();
loader.load( './models/FinalBaseMeshTriangulated.json', onLoad);

function onLoad( obj ) {
	finalBaseMesh.add( obj );
	console.log(obj);
	animate();
}
finalBaseMesh.position.set(-30,0,0);
finalBaseMesh.rotation.y = Math.PI * 0.5;
sceneHub.add(finalBaseMesh);
//======================================================
	//Loader
const interiorTest = new THREE.Group();

const loader1 = new THREE.ObjectLoader();
loader1.load( './models/interiorTest.json', onLoad1);

function onLoad1( obj ) {
	interiorTest.add( obj );
	console.log(obj);
	animate();
}
interiorTest.position.set(30,0.01,20);
interiorTest.scale.set(2,2,2);
interiorTest.rotation.y = Math.PI * 0.2;
sceneHub.add(interiorTest);

	//======================================================
scene.add( sceneHub );


//Route
/*
const streetGeo = new THREE.PlaneGeometry(20, 4);
const streetMat = new THREE.MeshBasicMaterial( { color : 0x202020, side : THREE.DoubleSide } );
const street = new THREE.Mesh( streetGeo, streetMat );
street.rotation.x = Math.PI * -0.5;
scene.add(street);

//trottoir
for (let i = -20/2; i < 20/2; i += 1){
	const geo = new THREE.BoxGeometry( 0.95, 0.1, 1.0 );
	const mat = new THREE.MeshPhongMaterial( { color : 0x828282 } );
	const trottoir = new THREE.Mesh( geo, mat );
	trottoir.position.set( i+.5, 0.05 , -2.5 );
	scene.add(trottoir);
}

//maisons
for (let i = -20/2; i < 20/2; i += 4){
	const w = 3.5;
	const h = random(4,8);
	const geo = new THREE.BoxGeometry( w, h, 5 );
	const mat = new THREE.MeshStandardMaterial( { color : 0xf1d049 } );
	const maison = new THREE.Mesh( geo, mat );
	maison.position.set( i+w/2, h/2 , -5.5 );
	scene.add(maison);
}

//arbres
const nbArbres = random(3,7);
for (let i = 0; i < nbArbres; i += 1){
	const arbre = new THREE.Group();

	const h = random(1,3);
	const geo = new THREE.CylinderGeometry( 0.12, 0.2, h, 5 );
	const mat = new THREE.MeshPhongMaterial( { color : 0xa19281 } );
	const tronc = new THREE.Mesh( geo, mat );
	arbre.add( tronc );

	const nbFeuilles = random(3,5);
	for (let j = 0; j < nbFeuilles; j += 1){
		const geoF = new THREE.IcosahedronGeometry( random(0.5,0.75) );
		const matF = new THREE.MeshPhongMaterial( { color : 0x8ae8a7 } );
		const feuille = new THREE.Mesh( geoF, matF );
		let xf = random(-.3,.3);
		let yf = random(-.3,.3);
		let zf = random(-.3,.3);
		feuille.position.set( xf, yf + h/2, zf );
		arbre.add( feuille );
	}

	let x = random(-20/2,20/2);
	let z = -1.8 + Math.random() * -0.3;
	arbre.position.set( x, h/2 , z );
	scene.add(arbre);
}
{
	//Lampes
	const light = new THREE.PointLight( 0xffffff, 0.5);
	light.position.set(0,2,0);
	scene.add( light );
	const geo = new THREE.CylinderGeometry( 0.2, 0.2, 2, 5 );
	const mat = new THREE.MeshPhongMaterial( { color : 0xf1f2f5 } );
	const lampe = new THREE.Mesh( geo, mat );
	lampe.position.set(0,1,0);
	scene.add( lampe );
}


//test
for (let i = -20; i < 20; i += 4){
	const x = random(-20,20);
	const z = random(-20,20);
	const h = random(6,10);
	const geo = new THREE.IcosahedronGeometry( random(1,2) );
	const mat = new THREE.MeshStandardMaterial( { color : 0xffffff } );
	const bulb = new THREE.Mesh( geo, mat );
	bulb.position.set( x/2, -h/2 , z/2 );
	scene.add(bulb);
}
//test
for (let i = -20; i < 20; i += 20){
	const lightBulb = new THREE.Group();
	const x = random(-20,20);
	const z = random(-20,20);
	const h = random(12,15);
	const geo = new THREE.IcosahedronGeometry( random(0.2,0.4) );
	const mat = new THREE.MeshStandardMaterial( { color : 0xff0000 } );
	const bulb = new THREE.Mesh( geo, mat );
	lightBulb.add(bulb);
	
	const light = new THREE.PointLight( 0xff0000, 0.2);
	lightBulb.add( light );
	lightBulb.position.set( x/2, -h/2 , z/2 );
	scene.add(lightBulb);
}*/
//======================================================
//Light
/*
{
	const color = 0xFFFFFF;
	const intensity = 1;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(4, 5, 3);
	scene.add(light);
}*/
//AmbientLight		: Partout
//DirectionalLight	: Selon une direction
//HemisphereLight	: Selon une direction + opposition
//PointLight		: Selon une position
/*
{
	const color = 0xFFFFFF;
	const intensity = 0.2;
	const light = new THREE.AmbientLight(color, intensity);
	//light.position.set(-10, -5, -9);
	scene.add(light);
}*/
/*
{
	const color0 = 0xFF0000;
	const color1 = 0x00FF00;
	const intensity = 1.0;
	const light = new THREE.HemisphereLight(color0,color1, intensity);
	light.position.set(3, 10, 4);
	scene.add(light);
}*/
/*
{
	const color = 0xFF0000;
	const intensity = 1.0;
	const light = new THREE.PointLight(color, intensity);
	light.position.set(3, 10, 4);
	scene.add(light);
}*/



//======================================================
//Animation
function animate() {

	controls.update();

	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

animate();
//Gestion des touches du clavier
//https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
//
window.addEventListener("keydown", function(event) {
  const p = document.createElement("p");
  console.log(`pressed: key='${event.key}' | code='${event.code}'`);
  document.getElementById("output").appendChild(p);
}, true);

window.addEventListener("keyup", function(event) {
  const p = document.createElement("p");
  console.log(`released: key='${event.key}' | code='${event.code}'`);
  document.getElementById("output").appendChild(p);
}, true);

//console.log(['lol',2].includes('pol')) // tester si un objet est dans un array
/*
key='ArrowDown' | code='ArrowDown'
key='ArrowUp' | code='ArrowUp'
key='ArrowRight' | code='ArrowRight'
key='ArrowLeft' | code='ArrowLeft'
key='Enter' | code='Enter'
key='Backspace' | code='Backspace'
key='Escape' | code='Escape'
key='0' | code='Numpad0'
key='0' | code='Digit0'
key='à' | code='Digit0'
key='Shift' | code='ShiftLeft'
key='Control' | code='ControlLeft'
key='Alt' | code='AltLeft'
key='AltGraph' | code='AltRight'
key='a' | code='KeyQ'
key='A' | code='KeyQ'
key='n' | code='KeyN'
key='N' | code='KeyN'
*/