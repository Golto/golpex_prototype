"use strict";

console.table('https://readyplayer.me/fr/developers', 'avatars')
console.warn("sceneSetup.js loaded");

//https://github.com/mrdoob/three.js/tree/master/examples/js

//=================================================================================
//							CONSTANTS

let player;

const STEPS_PER_FRAME = 4;

const center = new THREE.Vector3();
const centerPointer = new THREE.Vector2();
const CSS3WorldRatio = 100;

const v100 = new THREE.Vector3(1,0,0);
const v010 = new THREE.Vector3(0,1,0);
const v001 = new THREE.Vector3(0,0,1);

const clock = new THREE.Clock();

const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.1;
raycaster.far = 20;


class World{

	static aspect = window.innerWidth/window.innerHeight;

	static currentId = "welcome";

	static list = {
		welcome : null,
	};

	static from(id){
		//cleaners[id]();
		document.getElementById(id).style.display = "none";
		return World;
	};
	static to(id){
		//initers[id]();
		document.getElementById(id).style.display = "block";
		World.currentId = id;
		return World;
	};
	static goTo(id){
		World.from( World.currentId ).to( id );

		//update les fonctions moveUp et moveDown sur le bon player
		Mode.set(Mode.data.current);
	}

	constructor(id){
		this.id = id;
		World.list[id] = this;
		document.getElementById(this.id).style.display = "none";

		this.sceneCSS3 = new THREE.Scene();
		this.sceneWorld = new THREE.Scene();
		this.sceneWorld.name = "globalScene";
		//scene with raycastable objects
		this.scenePhysical = new THREE.Scene();
		this.scenePhysical.name = "physicalScene";
		this.sceneWorld.add(this.scenePhysical);

		this.cameras = {
			main: new THREE.PerspectiveCamera(60, World.aspect, 0.1, 1000),
		};
		this.camerasCSS3 = {
			main: new THREE.PerspectiveCamera(60, World.aspect, 0.1, 1000),
		};

		this.rendererCSS3 = new THREE.CSS3DRenderer( { alpha : true , antialias: true } );
		this.rendererCSS3.setSize(window.innerWidth, window.innerHeight);
		document.getElementById(this.id + "CSS3").appendChild(this.rendererCSS3.domElement);

		this.rendererWorld = new THREE.WebGLRenderer( { alpha : true , antialias: true } );
		this.rendererWorld.setSize(window.innerWidth, window.innerHeight);
		//sky
		this.rendererWorld.outputEncoding = THREE.sRGBEncoding;
		this.rendererWorld.toneMapping = THREE.ACESFilmicToneMapping;
		this.rendererWorld.toneMappingExposure = 0.5;
		//shadow
		this.rendererWorld.shadowMap.enabled = true;
		this.rendererWorld.shadowMap.type = THREE.PCFSoftShadowMap;

		document.getElementById(this.id + "World").appendChild(this.rendererWorld.domElement);

		//this.pmremGenerator = new THREE.PMREMGenerator( this.rendererWorld );

		//fog
		this.sceneWorld.fog = new THREE.FogExp2( 0xf59542, 0.005 );

		//ambient light
		this.light = new THREE.AmbientLight( 0xffffff, 0.2 );
		this.sceneWorld.add( this.light );

		//sun et sky
		this.sun = new THREE.Vector3();
		this.sky = new THREE.Sky();
		this.sky.scale.setScalar( 450000 );
		this.sky.name = "sky";
		this.sceneWorld.add( this.sky );

		this.sky.material.uniforms[ 'turbidity' ].value = 10;
		this.sky.material.uniforms[ 'rayleigh' ].value = 3;
		this.sky.material.uniforms[ 'mieCoefficient' ].value = 0.5;
		this.sky.material.uniforms[ 'mieDirectionalG' ].value = 0.9;

		this.elevation = 0;
		this.azimuth = 180;

		//faire une fonction pour update le soleil

		let t = new Date().getHours()
		this.elevation = map(t, 0, 23, -150, 210);

		const phi = THREE.MathUtils.degToRad( 90 - this.elevation );
		const theta = THREE.MathUtils.degToRad( this.azimuth );
		this.sun.setFromSphericalCoords( 1, phi, theta );

		this.sky.material.uniforms[ 'sunPosition' ].value.copy( this.sun );
		//https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_sky.html

		this.directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
		this.directionalLight.position.copy( this.sun );
		this.directionalLight.castShadow = true;
		this.sceneWorld.add( this.directionalLight );


		this.directionalLightR = new THREE.DirectionalLight( 0xffffff, 0.05 );
		this.directionalLightR.position.copy( this.sun ).multiplyScalar( -1 );
		this.directionalLightR.castShadow = true;
		this.sceneWorld.add( this.directionalLightR );

		//water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

		//collisions
		this.worldOctree = new THREE.Octree();


		//player
		this.player = undefined;

		//resize
		this.onWindowResize = ()=>{
			World.aspect = window.innerWidth / window.innerHeight;

			for (let i in this.cameras) {
				this.cameras[i].aspect = World.aspect;
				this.cameras[i].updateProjectionMatrix();
			}
			this.rendererWorld.setSize( window.innerWidth, window.innerHeight );
			for (let i in this.camerasCSS3) {
				this.cameras[i].aspect = World.aspect;
				this.cameras[i].updateProjectionMatrix();
			}
			this.rendererCSS3.setSize( window.innerWidth, window.innerHeight );
		
		}
		window.addEventListener( 'resize', this.onWindowResize );
	}
/*
	onWindowResize() {
		World.aspect = window.innerWidth / window.innerHeight;

		for (let i in this.cameras) {
			this.cameras[i].aspect = World.aspect;
			this.cameras[i].updateProjectionMatrix();
		}
		console.log(this.rendererWorld)
		this.rendererWorld.setSize( window.innerWidth, window.innerHeight );
		for (let i in this.camerasCSS3) {
			this.cameras[i].aspect = World.aspect;
			this.cameras[i].updateProjectionMatrix();
		}
		this.rendererCSS3.setSize( window.innerWidth, window.innerHeight );
		
	}*/

	updateCameras(){	// trouver une solution alternative à World == CSS3 (fusionner les deux si possible)
		this.camerasCSS3.main.position.copy(this.cameras.main.position).multiplyScalar(CSS3WorldRatio);
		this.camerasCSS3.main.rotation.copy(this.cameras.main.rotation);
	}
	



	
}

//=================================================================================
//							raycast
console.log("sceneSetup.js => raycast")

function raycastUpdate( camera, scene ){
	raycaster.setFromCamera( centerPointer, camera );
	const intersections = raycaster.intersectObjects( scene.children );
	return intersections;
}

//=================================================================================
//							utils
console.log("sceneSetup.js => utils")

function sideVector(camera){
	const direction = new THREE.Vector3();

	camera.getWorldDirection( direction );
	direction.y = 0;
	direction.normalize();
	direction.cross( camera.up );

	return direction;
}

function forwardVector(camera){
	const direction = new THREE.Vector3();

	camera.getWorldDirection( direction );

	return direction;
}

function upVector(camera){
	const direction = new THREE.Vector3();

	direction.crossVectors( sideVector(camera), forwardVector(camera) )

	return direction;
}

//modulo pour nombres négatifs & positifs
let mod = function (n, m) {
	let remain = n % m;
	return Math.floor(remain >= 0 ? remain : remain + m);
};


function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function linear(t, start, end){
	//t in [0,1]
	return start * (1 - t) + end * t;
}

function lerp(t ,a ,b){
	return a + t*( b - a );
}

function sCurve(t){
	return t*t*(3-2*t);
}

console.log("https://www.desmos.com/calculator/eqq1v0gbow")

function ellipsoidNorm(p,m,a,b,c){// p : point in space Vector3 / m : center Vector3 / a : x-length value / b : x-length value / c : x-length value
	
	const v = p.clone().sub(m); // centered

	return (v.x/a)**2 + (v.y/b)**2 + (v.z/c)**2 <= 1;
}

//================================================================================= world dependant
//							worldOctree
console.log("sceneSetup.js => worldOctree")

const worldOctree = new THREE.Octree();

//remplacer par regionOctree, avec 1 region = 16x16x16 chunks, chaque region dépasse sur une autre region de 1 chunk

//=================================================================================
//							device detection
console.log("sceneSetup.js => device detection")

const nav = window.navigator.userAgent;
//let isPhone = !(nav.search("Mobi") === -1);
let isPhone = nav.search("Mobi") > -1;

//=================================================================================
//							loading

console.log("sceneSetup.js => loading")
console.log("https://threejs.org/docs/index.html?q=loader#api/en/loaders/ObjectLoader")
console.log("https://threejs.org/editor/")

const loaderObject = new THREE.ObjectLoader();
const loaderGeometry = new THREE.BufferGeometryLoader();
const loaderTexture = new THREE.TextureLoader();
const loaderCubeTexture = new THREE.CubeTextureLoader();

//=================================================================================
//							Web storage

//https://www.w3schools.com/html/html5_webstorage.asp

if (typeof(Storage) !== "undefined") {
  // Code for localStorage/sessionStorage.
} else {
	console.error('Sorry! No Web Storage support..');
}

//=================================================================================
//							Web workers

//https://www.w3schools.com/html/html5_webworkers.asp

if (typeof(Worker) !== "undefined") {
  // Yes! Web worker support!
  // Some code.....
} else {
	console.error('Sorry! No Web Worker support..');
} 

//=================================================================================
//							sorting

//Array.sort(function(a, b){return a - b});
console.log("sceneSetup.js => sorting")
console.log("https://www.w3schools.com/js/js_array_sort.asp")


//By default, the sort() function sorts values as strings.

const ascending = function(a, b){return a - b}
const descending = function(a, b){return b - a}

//=================================================================================
//							perlin noise
console.log("sceneSetup.js => perlin noise")

const freq = 128;
const perlin = new THREE.ImprovedNoise();

//=================================================================================
//							geometries & materials
console.log("sceneSetup.js => geometries & materials")
console.log("https://threejs.org/docs/index.html?q=geomemetr")

const geometries = {
	box : new THREE.BoxGeometry(),
	//beam : new THREE.BoxGeometry(0.5,1,0.5),
	beam : new THREE.CylinderGeometry( 0.5, 0.5, 1, 8 ),
	wall : new THREE.BoxGeometry(1,1,0.25),
	floor : new THREE.BoxGeometry(1,0.25,1),
	ball : new THREE.DodecahedronGeometry(1, 5),

}

const materials = {
	red : new THREE.MeshPhongMaterial( {color: 0xff0000} ),
	green : new THREE.MeshPhongMaterial( {color: 0x00ff00, transparent: false, opacity: 0.5} ),
	blue : new THREE.MeshPhongMaterial( {color: 0x0000ff} ),
	white : new THREE.MeshPhongMaterial( {color: 0xffffff} ),
	golpexBlack : new THREE.MeshPhongMaterial( {color: 0x202020, shininess: 2} ),
	golpexOrange : new THREE.MeshPhongMaterial( {color: 0xf59542, shininess: 200} ),
	preVisual : new THREE.MeshPhysicalMaterial( {
			color : '#000000',
			emissive : '#ffffff',
			roughness : 1.0,
			metalness : 0.0,
			transparent : true,
			opacity : 1.0,
			wireframe : true,
		} ),

	wood : new THREE.MeshPhysicalMaterial( {
			color : '#bf8040',
			emissive : '#000000',
			emissiveIntensity : 0.2,
			roughness : 1.0,
			metalness : 0.0,
			transparent : false,
			opacity : 1.0,
		} ),

	glass : new THREE.MeshPhysicalMaterial( {
			color : '#000000',
			emissive : '#ffffff',
			emissiveIntensity : 0.7,
			roughness : 0.2,
			metalness : 0.8,
			transparent : true,
			opacity : 0.3,

			transmission : 0.5,
		} ),
	metal : new THREE.MeshPhysicalMaterial( {
			color : '#7575a3',
			emissive : '#ffffff',
			emissiveIntensity : 0.2,
			roughness : 0.2,
			metalness : 1.0,
			transparent : false,
			opacity : 1.0,
		} ),
	other : new THREE.MeshPhysicalMaterial( {
			color : '#7575a3',
			emissive : '#ffffff',
			emissiveIntensity : 0.2,
			roughness : 0.2,
			metalness : 1.0,
			transparent : false,
			opacity : 1.0,
			transmission : 0.5,
			thickness : 20,
		} ),
	plastic : new THREE.MeshPhongMaterial( { specular: 0x888888, shininess: 250 } ),
}


















//----world dependant	//OBSOLETE
let sceneCSS3;
let sceneWorld;
let scene;

let cameraCSS3;
let cameraWorld;

let rendererCSS3;
let rendererWorld;

let pmremGenerator;
let sun, sky, water;

//================================================================================= world dependant
//							scenes
console.log("sceneSetup.js => scenes")	//OBSOLETE

function scening(){
	const aspect = window.innerWidth/window.innerHeight;


	//scene css3d
	sceneCSS3 = new THREE.Scene();
	cameraCSS3 = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);

	rendererCSS3 = new THREE.CSS3DRenderer( { alpha : true , antialias: true } );
	rendererCSS3.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('sandbox0CSS3').appendChild(rendererCSS3.domElement);


	//scene classic
	sceneWorld = new THREE.Scene();
	cameraWorld = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);

	sceneWorld.name = "globalScene";
	//scene with raycastable objects
	scene = new THREE.Scene();
	scene.name = "physicalScene";
	sceneWorld.add(scene);

	rendererWorld = new THREE.WebGLRenderer( { alpha : true , antialias: true } );
	rendererWorld.setSize(window.innerWidth, window.innerHeight);
	//sky
	rendererWorld.outputEncoding = THREE.sRGBEncoding;
	rendererWorld.toneMapping = THREE.ACESFilmicToneMapping;
	rendererWorld.toneMappingExposure = 0.5;
	//shadow
	rendererWorld.shadowMap.enabled = true;
	rendererWorld.shadowMap.type = THREE.PCFSoftShadowMap;

	document.getElementById('sandbox0World').appendChild(rendererWorld.domElement);


	pmremGenerator = new THREE.PMREMGenerator( rendererWorld );
}



//=================================================================================
//							temp decorating
console.log("sceneSetup.js => temp decorating")

let youtubePortal;

function decoratingTemp(){

	//------------------
	//fog

	sceneWorld.fog = new THREE.FogExp2( 0xf59542, 0.005 ); 

	//------------------
	//water

	const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );
	const waterNormals = loaderTexture.load(

			"textures/waternormals.jpg",

			// onLoad callback
			function ( texture ) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				
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

	water = new THREE.Water(
					waterGeometry,
					{
						textureWidth: 512,
						textureHeight: 512,
						waterNormals: waterNormals,
						sunDirection: new THREE.Vector3(),
						sunColor: 0xffffff,
						waterColor: 0xf59542,
						distortionScale: 1.0,
						fog: scene.fog !== undefined,
						alpha: 0.7,
					}
				);

	water.material.transparent = true;
	water.rotation.x = - Math.PI / 2;
	water.position.y -= 5;

	sceneWorld.add( water );

	//------------------
	//sun et sky
	sun = new THREE.Vector3();
	sky = new THREE.Sky();
	sky.scale.setScalar( 450000 );
	sky.name = "sky";
	sceneWorld.add( sky );

	const uniforms = sky.material.uniforms;
	uniforms[ 'turbidity' ].value = 10;
	uniforms[ 'rayleigh' ].value = 3//3;
	uniforms[ 'mieCoefficient' ].value = 0.5//0.005;
	uniforms[ 'mieDirectionalG' ].value = 0.9;


	let t = new Date().getHours()
	t = map(t, 0, 23, -150, 210);

	const phi = THREE.MathUtils.degToRad( 90 - t );
	const theta = THREE.MathUtils.degToRad( 180 );
	sun.setFromSphericalCoords( 1, phi, theta );

	uniforms[ 'sunPosition' ].value.copy( sun );
	//https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_sky.html

	//water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();


	sceneWorld.environment = pmremGenerator.fromScene( sky ).texture;
	


	let boxgeo = new THREE.BoxGeometry(1,1,1);
	let boxmat = new THREE.MeshPhysicalMaterial( {color: 0xffffff , emissive: 0xffffff , metalness: 1.0 , transparent: true , opacity: 0.7} );
	let cube = new THREE.Mesh(boxgeo, boxmat);
	sceneWorld.add(cube);

	const light = new THREE.AmbientLight( 0xffffff, 0.2 );
	sceneWorld.add( light );

	const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
	directionalLight.position.copy( sun );
	directionalLight.castShadow = true;
	sceneWorld.add( directionalLight );


	const directionalLightR = new THREE.DirectionalLight( 0xffffff, 0.05 );
	directionalLightR.position.copy( sun ).multiplyScalar( -1 );
	directionalLightR.castShadow = true;
	sceneWorld.add( directionalLightR );


	const pointLight = new THREE.PointLight( 0xffffff, 1.0 );
	pointLight.castShadow = true;
	pointLight.distance = 20;
	sceneWorld.add( pointLight );





/*


	//Boule magique (réfraction et réfléction)
	const textureEquirec = loaderTexture.load( 'textures/2294472375_24a3b8ef46_o.jpg' );
	textureEquirec.mapping = THREE.EquirectangularRefractionMapping;
	textureEquirec.encoding = THREE.sRGBEncoding;

	const textureEquirec0 = loaderTexture.load( 'textures/2294472375_24a3b8ef46_o.jpg' );
	textureEquirec0.mapping = THREE.EquirectangularReflectionMapping;
	textureEquirec0.encoding = THREE.sRGBEncoding;

	let boxgeo0 = new THREE.IcosahedronGeometry( 15, 7 );
	//let boxgeo0 = new THREE.BoxGeometry(10,10,10);
	let boxmat0 = new THREE.MeshLambertMaterial( { envMap: textureEquirec } );//sceneWorld.environment
	let cube0 = new THREE.Mesh(boxgeo0, boxmat0);
	sceneWorld.add(cube0);
	cube0.position.x = -30;
	cube0.position.y = 10;//exterieur

	let boxgeo1 = new THREE.IcosahedronGeometry( 15, 7 );
	//let boxgeo1 = new THREE.BoxGeometry(10,10,10);
	let boxmat1 = new THREE.MeshLambertMaterial( { envMap: textureEquirec0} );
	let cube1 = new THREE.Mesh(boxgeo1, boxmat1);
	cube1.material.side = 1;
	sceneWorld.add(cube1);
	cube1.position.x = -30;
	cube1.position.y = 10;//interieur

	const pointLight0 = new THREE.PointLight( 0xffffff, 1.0 );
	pointLight0.distance = 20;
	pointLight0.position.set(-30,10,0);
	sceneWorld.add( pointLight0 );



*/
	
	//------------------

	//idée : pour cacher les éléments lorsqu'il sont derrière des objets de rendererWorld :
	// utiliser une paire (objCSS3,objWorld) avec objWorld invisible avec les mêmes dimensions que objCSS3,
	// si objWorld caché, alors cacher objCSS3

	//let el = document.createElement('div');
	//el.innerHTML = ''
	//el.innerHTML += '<iframe width="560" height="315" src="https://www.youtube.com/embed/uKqC5uHjE4g" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
	//el.innerHTML += pageHome;
	//fonctionne pas
	//el.innerHTML += '<nft-card contractAddress="0x495f947276749ce646f68ac8c248420045cb7b5e" tokenId="104246162112814850879095807041576635591631295722861128883615941460278881812481"> </nft-card> <script src="https://unpkg.com/embeddable-nfts/dist/nft-card.min.js"></script>';
	
	//el.innerHTML += '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/0YA7kqNuydbhXDDVdmXgzL?utm_source=generator" width="100%" height="380" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>';
	//el.innerHTML += '<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/840322435&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/xavierdang" title="Xavier Dang" target="_blank" style="color: #cccccc; text-decoration: none;">Xavier Dang</a> · <a href="https://soundcloud.com/xavierdang/risen-phoenix-investigation-cover-from-phoenix-wright" title="Risen Phoenix (&quot;Investigation&quot; cover from Phoenix Wright) | 2020" target="_blank" style="color: #cccccc; text-decoration: none;">Risen Phoenix (&quot;Investigation&quot; cover from Phoenix Wright) | 2020</a></div>';
	//el.innerHTML += '<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1079037148&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/melodysheep" title="melodysheep" target="_blank" style="color: #cccccc; text-decoration: none;">melodysheep</a> · <a href="https://soundcloud.com/melodysheep/the-outer-reaches-from-the-sounds-of-space" title="The Outer Reaches (From &quot;The Sounds of Space&quot;)" target="_blank" style="color: #cccccc; text-decoration: none;">The Outer Reaches (From &quot;The Sounds of Space&quot;)</a></div>';

	//el.innerHTML += '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Falcon 9’s first stage has landed on the A Shortfall of Gravitas droneship – marking SpaceX’s first 13th flight of a first stage booster and 100th successful mission with a flight proven orbital class rocket! <a href="https://t.co/6XjfcOPuUh">pic.twitter.com/6XjfcOPuUh</a></p>&mdash; SpaceX (@SpaceX) <a href="https://twitter.com/SpaceX/status/1537832131656753152?ref_src=twsrc%5Etfw">June 17, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> ';
	/* embed possibles :
	youtube ✅
	twitch ❌ à retest
	opensea ✅ script
	spotify ✅
	soundcloud ✅
	twitter ✅ script

	afficher un site (html only)
	fetch + view-source:example.com + filtrer le body
	*/

	//youtubePortal = new THREE.CSS3DObject(el);
	//sceneCSS3.add(youtubePortal);
	//youtubePortal.position.set(0*CSS3WorldRatio,-4.8*CSS3WorldRatio,-8.2*CSS3WorldRatio)
	
	/*
	Trop de requêtes en utilisant Youtube
	=> pour faire la vidéo de présentation au spawn, mettre la vidéo sur googleDrive
	et lire la vidéo via <iframe>, moins de requêtes
	*/



}
/*
function initMP(){
	let el0 = document.createElement('div');
	el0.innerHTML = pageEXTERNE;
	const testPortal = new THREE.CSS3DObject(el0);
	sceneCSS3.add(testPortal);
	testPortal.position.set(-30*CSS3WorldRatio,0*CSS3WorldRatio,-10*CSS3WorldRatio)
}
function initSpaceX(){
	let el0 = document.createElement('div');
	el0.innerHTML = pageEXTERNE0;
	const testPortal = new THREE.CSS3DObject(el0);
	sceneCSS3.add(testPortal);
	testPortal.position.set(-50*CSS3WorldRatio,0*CSS3WorldRatio,-10*CSS3WorldRatio)
}*/




/*
let profile;
let profile2;
let profile3;

function tempUIinit(){
	let el = document.createElement('div');
	let el2 = document.createElement('div');
	let el3 = document.createElement('div');
	
	el.innerHTML = '❌';

	profile = new THREE.CSS3DObject(el);
	sceneCSS3.add(profile);


	el2.innerHTML = '<img width=200 src="https://yt3.ggpht.com/ytc/AKedOLRI16uPrkOlmXMxLQtOn2Zvd1RK-iAYyItmNKLR=s900-c-k-c0x00ffffff-no-rj" /> \
	<h1>Golto\'s logo</h1>'
	el2.innerHTML = '';
	
	profile2 = new THREE.CSS3DObject(el2);
	sceneCSS3.add(profile2);


	el3.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/uKqC5uHjE4g" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> \
	<h1>Maths\' video</h1>';
	el3.innerHTML = '';
	
	profile3 = new THREE.CSS3DObject(el3);
	sceneCSS3.add(profile3);

}

function tempUIupdate(){
	const forward = forwardVector(cameraCSS3);
	const side = sideVector(cameraCSS3);


	profile.position.copy(cameraCSS3.position);

	profile.position.addScaledVector(forward, CSS3WorldRatio*10);

	profile.rotation.copy(cameraCSS3.rotation);


	const v = forward.clone().addScaledVector(side,-0.5);
	v.normalize();

	profile2.position.copy(cameraCSS3.position);

	profile2.position.addScaledVector(v, CSS3WorldRatio*10);

	profile2.rotation.copy(cameraCSS3.rotation);
	profile2.rotateY(Math.PI/5)


	const v0 = forward.clone().addScaledVector(side,0.5);
	v0.normalize();

	profile3.position.copy(cameraCSS3.position);

	profile3.position.addScaledVector(v0, CSS3WorldRatio*10);

	profile3.rotation.copy(cameraCSS3.rotation);
	profile3.rotateY(-Math.PI/5)
}*/


//=================================================================================
//							UI
/*
console.log("sceneSetup.js => UI")

function UIinit(){
	let el = document.createElement('div');
	el.innerHTML = "Web";
	el.innerHTML += '<iframe width="560" height="315" src="https://www.youtube.com/embed/uKqC5uHjE4g" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
	

	let obj = new THREE.CSS3DObject(el);
	obj.position.set(0,0,100);

	let obj0 = new THREE.CSS3DObject(el);
	obj0.position.set(0,0,-100);

	sceneUI.add(obj);
}*/


//================================================================================= world dependant
//							window resize
console.log("sceneSetup.js => window resize")

function onWindowResize0() {
	const aspect = window.innerWidth / window.innerHeight;

	cameraWorld.aspect = aspect;
	cameraWorld.updateProjectionMatrix();

	rendererWorld.setSize( window.innerWidth, window.innerHeight );

	cameraCSS3.aspect = aspect;
	cameraCSS3.updateProjectionMatrix();

	rendererCSS3.setSize( window.innerWidth, window.innerHeight );
	
}


//=================================================================================
//							removing

console.log("sceneSetup.js => removing")

function removeFromScene( uuid ) {
	const obj = scene.getObjectByProperty( 'uuid', uuid )
	obj.geometry.dispose( );
	obj.material.dispose( );
	scene.remove( obj );
};

/*
//=================================================================================
//							loading

console.log("sceneSetup.js => loading")
console.log("https://threejs.org/docs/index.html?q=loader#api/en/loaders/ObjectLoader")
console.log("https://threejs.org/editor/")

const loaderObject = new THREE.ObjectLoader();
const loaderGeometry = new THREE.BufferGeometryLoader();
const loaderTexture = new THREE.TextureLoader();
const loaderCubeTexture = new THREE.CubeTextureLoader();

let initLoad = ()=>{}


*/





/*
function initLoad(){
	loaderObject.load(
		// resource URL
		"models/json/table.json",

		// onLoad callback
		// Here the loaded data is assumed to be an object
		function ( obj ) {
			// Add the loaded object to the scene
			scene.add( obj );
			obj.position.x = 6;
			obj.position.z = 8;
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


}*/
































//=================================================================================

/*
//https://www.w3schools.com/howto/howto_js_redirect_webpage.asp
// Simulate a mouse click:
window.location.href = "http://www.w3schools.com";

// Simulate an HTTP redirect:
window.location.replace("http://www.w3schools.com");
*/

//https://www.w3schools.com/howto/howto_css_zoom_hover.asp

//https://www.w3schools.com/howto/howto_css_transition_hover.asp

//https://www.w3schools.com/howto/howto_html_download_link.asp

/*
function download(fileUrl, fileName) {
  var a = document.createElement("a");
  a.href = fileUrl;
  a.setAttribute("download", fileName);
  a.click();
}

download("/static/ad920d8be55b3543cac62c795aa80df5/codesource.png", "Codesource_Logo.png");
*/

//https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_placeholder

//https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_disable_resize_textarea

//https://www.w3schools.com/howto/howto_js_animate_icons.asp

//https://www.w3schools.com/howto/howto_js_draggable.asp

//http://www.voxeljs.com/ <= libraire voxel game
//https://gorescript.github.io/classic/play/
//http://brunoquintela.com/
//https://phoboslab.org/wipeout/
//https://www.nike.com/xp/b/genealogyofthefree/zoetrope.html
//https://cabbi.bo/dawnF2/

//=================================================================================
//							downloaded objects
//https://free3d.com/fr/3d-model/low-poly-isometric-room-1-704614.html
//https://free3d.com/fr/3d-model/low_poly_tree-816203.html


//=================================================================================
//							pages

const testhtml = `
test 
egrgegerg
fze

`

const test2 = "foo \
bar"

const pageExample = '<!-- Header -->\
	<div class="header">\
		<h1>My Website</h1>\
		<p>With a <b>flexible</b> layout.</p>\
	</div>\
\
	<!-- Navigation Bar -->\
	<div class="navbar">\
		<a href="#">Link</a>\
		<a href="#">Link</a>\
		<a href="#">Link</a>\
		<a href="#" onclick="player.velocity.z += 100 ">teFaitReculerHeHeHe()</a>\
	</div>\
\
	<!-- The flexible grid (content) -->\
	<div class="row">\
		<div class="side">\
			<h2>About Me</h2>\
			<h5>Photo of me:</h5>\
			<div class="fakeimg" style="height:200px;">Image</div>\
			<p>Some text about me in culpa qui officia deserunt mollit anim..</p>\
			<h3>More Text</h3>\
			<p>Lorem ipsum dolor sit ame.</p>\
			<div class="fakeimg" style="height:60px;">Image</div><br>\
			<div class="fakeimg" style="height:60px;">Image</div><br>\
			<div class="fakeimg" style="height:60px;">Image</div>\
		</div>\
		<div class="main">\
			<h2>TITLE HEADING</h2>\
			<h5>Title description, Dec 7, 2017</h5>\
			<div class="fakeimg" style="height:200px;">Image</div>\
			<p>Some text..</p>\
			<p>Sunt in culpa qui officia deserunt mollit anim id est laborum consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>\
			<br>\
			<h2>TITLE HEADING</h2>\
			<h5>Title description, Sep 2, 2017</h5>\
			<div class="fakeimg" style="height:200px;">Image</div>\
			<p>Some text..</p>\
			<p>Sunt in culpa qui officia deserunt mollit anim id est laborum consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>\
		</div>\
	</div>\
\
	<!-- Footer -->\
	<div class="footer">\
		<h2>Footer</h2>\
	</div>\ '



const pageHome = '\
<!-- Header -->\
	<div class="header">\
		<h1>Golpex</h1>\
		<p><b>Version p1.0</b> by <b>Golto (FOUCAUD Guillaume)</b></p>\
		<p>© Tout droit réservé</p>\
	</div>\
\
	<!-- Navigation Bar -->\
	<div class="navbar">\
		<!--<a href="#">Link</a>\
		<a href="#">Link</a>\
		<a href="#">Link</a>-->\
		<a href="#" onclick="">init()</a>\
	</div>\
\
	<div style="background-color: #333">\
		<p class="leftAligned"> * Renseignez-vous ci-dessous en ce qui concerne les contrôles sur PC ou interface tactile (mobile/tablette/mac)</p>\
	</div>\
\
	<!-- The flexible grid (content) -->\
	<div class="row">\
		<div class="side">\
\
			<h2>Version prototype 1.0</h2>\
			<h2>Actuel</h2>\
			<h5>xx août 2022</h5>\
			<br>\
			<p class="leftAligned">\
				Golpex version p1.0 : Réécriture totale, Objets de CSS3Renderer pris en charge,  Build-Mode\
			</p>\
\
			<br>\
\
			<h2>Versions antérieures</h2>\
			<h5>janvier 2022 à juillet 2022</h5>\
			<br>\
			<p><b>Golpex version p0.1 [janvier 2022]</b></p>\
			<p class="leftAligned">Créations d\'objets three.js</p>\
			<br>\
			<p><b>Golpex version p0.2 [février 2022]</b></p>\
			<p class="leftAligned">Création/Gestion des chunks (client only)</p>\
			<br>\
			<p><b>Golpex version p0.3 [mars 2022]</b></p>\
			<p class="leftAligned">Lumière + génération d\'un 2D-terrain</p>\
			<br>\
			<p><b>Golpex version p0.4 [avril 2022]</b></p>\
			<p class="leftAligned">vue FPS + collision/gravité</p>\
			<br>\
			<p><b>Golpex version p0.5 [mai 2022]</b></p>\
			<p class="leftAligned">génération procédurale (client only)</p>\
			<br>\
			<p><b>Golpex version p0.6 [juin 2022]</b></p>\
			<p class="leftAligned">génération procédurale MarchingCubes, grottes/Lune (client only)</p>\
			<br>\
			<p><b>Golpex version p0.7 [juillet 2022]</b></p>\
			<p>(non publié)</p>\
			<p class="leftAligned">Test du build-mode et terraforming</p>\
			<br>\
\
		</div>\
		<div class="main">\
\
			<div class="blockPost">\
				<h1>"Gameplay"</h1>\
				<br>\
				<h3>Deux modes</h3>\
				<br>\
				<p>SIMPLE -> utilisateur affecté par la gravité</p>\
				<p>CREATIVE -> utilisateur non-affecté par la gravité</p>\
				<br>\
				<h3>Mode de construction</h3>\
				<br>\
				<p>Chaque bloc a sa propre grille adapté à la taille du bloc. Par exemple, si un bloc fait 0.5 sur sa largeur, alors vous pouvez placer deux fois ce bloc sur la largeur.</p>\
				<br>\
				<p>Chaque bloc a sa propre grille rotative. Un bloc peut être placé selon plusieurs rotations différentes (en général 8).</p>\
				<br>\
				<p>Possibilité d\'importer ses propres blocs à condition qu\'ils soient au format .json et compatible avec la librairie three.js, pour cela dans la console, tapez <span style="color:red;">Block.loadGeometryJson(<span style="color:orange;font-style: italic;">path</span>)</span> si vous avez un fichier geometry, ou <span style="color:red;">Block.loadObjJson(<span style="color:orange;font-style: italic;">path</span>)</span> si vous avez un fichier 3DObject</p>\
\
			</div>\
			<br>\
			<div class="blockPost">\
				<h1>Contrôles Ordinateur (PC/Mac/MacBook)</h1>\
				<br>\
				<p class="leftAligned">Z Q S D : déplacements avant gauche arrière droite</p>\
				<p class="leftAligned">SOURIS : rotations caméra</p>\
				<p class="leftAligned">O : séléctionner le bloc suivant (par défaut : aucun bloc)</p>\
				<p class="leftAligned">M : séléctionner le mode de jeu suivant (par défaut : \'CREATIVE\')</p>\
				<p class="leftAligned">CLIC GAUCHE : supprimer le bloc visé</p>\
				<p class="leftAligned">CLIC DROIT : placer le bloc séléctionné à l\'endroit visé</p>\
				<p class="leftAligned">ESPACE : sauter - s\'envoler/monter (SIMPLE - CREATIVE)</p>\
				<p class="leftAligned">SHIFT : . - descendre (SIMPLE - CREATIVE)</p>\
			</div>\
			<br>\
			<div class="blockPost">\
				<h1>❌Contrôles Mobile (Téléphones/Tablettes)</h1>\
				<p>indisponible</p>\
			</div>\
			<br>\
			<div class="blockPost">\
				<h1>❌Réalité virtuelle</h1>\
				<p>indisponible</p>\
			</div>\
			<br>\
			<div class="blockPost">\
				<h1>❌Cam tracker</h1>\
				<p>indisponible</p>\
			</div>\
			<br>\
			<div class="blockPost">\
				<h1>❌Multijoueur</h1>\
				<p>indisponible</p>\
			</div>\
			<br>\
			<div class="blockPost">\
				<h1>❌Metamask/Ethereum/NFT</h1>\
				<p>indisponible</p>\
			</div>\
\
		</div>\
	</div>\
\
	<!-- Footer -->\
	<div class="footer">\
		<h2>Footer</h2>\
	</div>\
';




//https://threejs.org/examples/#webgl_multiple_elements
//https://threejs.org/examples/#webgl_multiple_canvases_circle
console.warn("playerSetup.js loaded");

class Player{

	static colliderStart = new THREE.Vector3( 0, -1, 0 );
	static colliderEnd = new THREE.Vector3( 0, 0, 0 );

	static buffer = new THREE.Vector3();

	static list = {};

	constructor(camera, scene, renderer, id = "none"){
		this.debug = false;

		this.id = id;
		this.camera = camera;
		this.scene = scene;
		this.renderer = renderer;
		Player.list[id] = this;

		this.position = new THREE.Vector3();
		this.direction = new THREE.Vector3();
		this.velocity = new THREE.Vector3();
		this.gravity = new THREE.Vector3(0,-20,0);
		this.forceJump = 1;
		this.collider = new THREE.Capsule( Player.colliderStart, Player.colliderEnd, 0.35 );
		this.mesh = null;//createSkeleton(this.debug);
		this.light = this.setLight();

		this.onFloor = false;
		this.onWater = false;
		this.crouching = false;
		this.mode = "CREATIVE";
		this.controls = new THREE.PointerLockControls( camera, this.renderer.domElement );
	}

	get forwardVector(){

		this.camera.getWorldDirection( Player.buffer );
		Player.buffer.y = 0;
		Player.buffer.normalize();

		return Player.buffer;
	}

	get sideVector(){

		this.camera.getWorldDirection( Player.buffer );
		Player.buffer.y = 0;
		Player.buffer.normalize();
		Player.buffer.cross( this.camera.up );

		return Player.buffer;
	}

	get upVector(){

		Player.buffer.copy(this.camera.up)

		return Player.buffer;
	}

	updateOnce(){
		this.camera.getWorldPosition( this.position );
		this.collider.start = this.position.clone().add(Player.colliderStart);
		this.collider.end = this.position.clone().add(Player.colliderEnd);
		//this.collider.translate(this.position);
	}

	moveFoward(speed){
		//this.velocity.add( getForwardVector().multiplyScalar( - speed ) );
		//this.camera.position.add( player.forwardVector.multiplyScalar( speed ) );
		const modifier = (this.onWater && Mode.data.current === 'SIMPLE') ? 0.6 : 1;
		this.velocity.add( this.forwardVector.multiplyScalar( speed * modifier ) );
		this.updateOnce();
	}

	moveSideway(speed){
		//player.velocity.add( getSideVector().multiplyScalar( - speedDelta ) );
		//this.camera.position.add( player.sideVector.multiplyScalar( speed ) );
		const modifier = (this.onWater && Mode.data.current === 'SIMPLE') ? 0.6 : 1;
		this.velocity.add( this.sideVector.multiplyScalar( speed * modifier ) );
		this.updateOnce();
	}
	
	moveUp(speed){
		//player.velocity.add( getUpVector().multiplyScalar( - speedDelta ) );
		//this.camera.position.add( player.upVector.multiplyScalar( speed ) );
		this.velocity.add( this.upVector.multiplyScalar( speed ) );
		this.updateOnce();
	}

	jump(forceImpulse, speed){
		if (this.onFloor) {
			this.velocity.add( this.forwardVector.multiplyScalar( forceImpulse/10 ) );
			this.velocity.add( this.upVector.multiplyScalar( forceImpulse/2 ) );
			this.onFloor = false;
		}
		if (this.onWater) {
			this.velocity.add( this.upVector.multiplyScalar( speed * 1.3 ) );//mal codé car n'utilise pas speed
			this.updateOnce();
		}
	}

	crouch(speed){
		if (this.onFloor) {
			;//à compléter
		}
		if (this.onWater) {
			this.velocity.add( this.upVector.multiplyScalar( speed * 0.2 ) );
			this.updateOnce();
		}
	}

	setPosition(v){
		this.camera.position.set( v.x, v.y, v.z );
		//this.camera.position.copy(v);
		this.updateOnce()
	}

	setVelocity(v){
		this.velocity.set( v.x, v.y, v.z );
	}

	lookAt(v){
		this.camera.lookAt( v.x, v.y, v.z );
		this.updateOnce()
	}
	//----------------LIGHTS-----------------

	setLight(){
		const light = new THREE.SpotLight( 0xff88ff );
		light.castShadow = true;

		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 1024;

		light.shadow.camera.near = 500;
		light.shadow.camera.far = 4000;
		light.shadow.camera.fov = 60;

		light.distance = 15;
		light.intensity = 0.5;
		light.penumbra = 0.2;

		light.angle = Math.PI/6;
		light.castShadow = true;

		this.scene.add( light );

		light.target = new THREE.Object3D();
		this.scene.add(light.target);

		return light
	}

	updateLight(){
		if (this.light) {

			this.light.position.copy(this.position);
			this.light.target.position.copy(this.position).add(this.direction);
		}
	}


	//--------------COLLISIONS---------------

	collision(){

		const result = World.list[this.id].worldOctree.capsuleIntersect( this.collider );

		this.onFloor = false;

		if ( result ) {

			this.onFloor = result.normal.y > 0;

			if ( ! Player.list['sandbox'].onFloor ) {
				
				this.velocity.addScaledVector( result.normal, - result.normal.dot( this.velocity ) );

			}

			this.camera.position.add( result.normal.multiplyScalar( result.depth ) )
		}
	}

	update(dt){
		this.camera.getWorldDirection( this.direction );
		// this.direction <-- camera.direction

		

		if ( ! this.onFloor ) {
	
			if (Mode.data.isGravity) {
				this.velocity.y += this.gravity.y * dt;
			}
		}

		let deltaPosition;

		

		let damping = Math.exp( - Mode.data.forceDamping * dt ) - 1;

		if (!Mode.data.isAirControl) {
			damping = (this.onFloor || this.onWater) ? damping : damping*0.1;
		}
		

		this.velocity.addScaledVector( this.velocity, damping );	//optionnel

		deltaPosition = this.velocity.clone().multiplyScalar( dt );
		this.camera.position.add( deltaPosition );
		
		if (World.list[this.id].worldOctree.subTrees.length > 0) {
			this.collision();
		}
		

		this.updateOnce();
		this.updateLight()
	}
}


function playerInit(id){
	//player = new Player(cameraWorld, sceneWorld, rendererWorld); //'sandbox0'
	new Player(
		World.list[id].cameras.main,
		World.list[id].scenePhysical,
		World.list[id].rendererWorld,
		id,
	);
	if (!isPhone) {
		document.getElementById(id).onclick = function(){ Player.list[id].controls.lock() };
		//document.getElementById("renderCSS3").innerHTML = '<p id="cross">❌</p>';
	}
}

const keyDownList = {
	"90" : false,//z Z
	"81" : false,//q Q
	"83" : false,//s S
	"68" : false,//d D
	"32" : false,//space
	"17" : false,//ctrl
	"16" : false,//shift
	"79" : false,//o O
	"touchForward" : false,
	"touchJump" : false,
	"rotateLeft" : false,
	"rotateRight" : false,
	"rotateUp" : false,
	"rotateDown" : false,
}


function keyAction(key){

	const player = Player.list[ World.currentId ];

	switch (key) {
		//case 'z':
		case '90':

			if (Mode.data.isAirControl || player.onFloor || player.onWater) {
				player.moveFoward( deltaTime * Mode.data.speed );
			}
			
			break;
		//case 'q':
		case '81':

			if (Mode.data.isAirControl || player.onFloor || player.onWater) {
				player.moveSideway( -deltaTime * Mode.data.speed );
			}
			
			break;
		//case 's':
		case '83':

			if (Mode.data.isAirControl || player.onFloor || player.onWater) {
				player.moveFoward( -deltaTime * Mode.data.speed );
			}
			
			break;
		//case 'd':
		case '68':

			if (Mode.data.isAirControl || player.onFloor || player.onWater) {
				player.moveSideway( deltaTime * Mode.data.speed );
			}
			
			break;
		//case ' ':
		case '32':

			Mode.data.moveUp(deltaTime);

			break;
		//case 'Shift':
		case '16':
			
			Mode.data.moveDown(deltaTime);

			break;

		//case 'm':
		/*
		case '77':
			Mode.next();
			break;

		//case 'o':
		case '79':
			Block.next();
			break;
		*/

		case 'touchForward':

			if (Mode.data.isAirControl || player.onFloor || player.onWater) {
				player.moveFoward( deltaTime * Mode.data.speed );
			}

			break;

		case 'touchJump':

			Mode.data.moveUp(deltaTime);

			break;

		case 'rotateUp':

			//player.camera.rotation.x += 0.1;

			break;

		case 'rotateLeft':

			player.camera.rotation.y += 0.1;

			break;

		case 'rotateRight':

			player.camera.rotation.y -= 0.1;

			break;

		case 'rotateDown':

			//player.camera.rotation.x += 0.1;

			break;
			


		default:
			break;
	}
}

function updateActiveKeys(){
	for (let e in keyDownList) {
		if (keyDownList[e]) {
			keyAction(e);
		}
	}
}



document.addEventListener( 'mouseup', (e) => {

	if ( document.pointerLockElement !== null && !isPhone) {
		//console.log(e.button)
		switch (e.button) {
			case 0:
				Block.remove()
				break;
			case 2:
				Block.put()
				break;

			default:
				break;
		};
	}

});


document.addEventListener('keydown' , (e)=>{
	keyDownList[e.keyCode] = true;
	//console.log(e.keyCode)

	if (e.keyCode === 77) {
		Mode.next();
		const html77 = 'nouveau mode : ' + Mode.data.current;
		UI.data.listByName['updateInfo'].updateHTML(html77);
	}
	
	if (e.keyCode === 79) {//à changer
		Block.next();
		const html79 = 'bloc séléctionné : ' + Block.selection[Block.selected];
		UI.data.listByName['updateInfo'].updateHTML(html79);
	}

	const info = UI.data.listByName['info'];

	if (info) { info.updateHTML() }

	
});

document.addEventListener('keyup' , (e)=>{
	keyDownList[e.keyCode] = false;
});



class Mode{
	//player mode

	static data = {
		current : "CREATIVE",
		speed : 500,
		forceImpulse : 30,
		forceDamping : 10,
		isGravity : false,
		isAirControl : true,

		moveUp : (dt)=>{Player.list['sandbox'].moveUp( dt * Mode.data.speed )},
		moveDown : (dt)=>{Player.list['sandbox'].moveUp( -dt * Mode.data.speed )},
	}

	static set(newMode){
		Mode.data.current = newMode;
		Player.list['sandbox'].mode = newMode;
		const player = Player.list[ World.currentId ];

		if (Mode.data.current === "CREATIVE") {
			Mode.data.speed = 500;
			Mode.data.forceImpulse = 0;
			Mode.data.forceDamping = 10;
			Mode.data.isGravity = false;
			Mode.data.isAirControl = true;
			Mode.data.moveUp = (dt)=>{player.moveUp( dt * Mode.data.speed )};
			Mode.data.moveDown = (dt)=>{player.moveUp( -dt * Mode.data.speed )};

		}
		if (Mode.data.current === "SIMPLE") {
			Mode.data.speed = 100;
			Mode.data.forceImpulse = 10;
			Mode.data.forceDamping = 4;
			Mode.data.isGravity = true;
			Mode.data.isAirControl = false;
			Mode.data.moveUp = (dt)=>{player.jump( Mode.data.forceImpulse, dt * Mode.data.speed )};
			Mode.data.moveDown = (dt)=>{player.crouch( -dt * Mode.data.speed )};
		}
	}

	static selected = 0;
	static selection = ['CREATIVE', 'SIMPLE'];

	static next(){
		Mode.selected ++;
		Mode.selected %= Mode.selection.length;

		Mode.set( Mode.selection[Mode.selected] );

		console.log( "mode selected : ", Mode.selected );
	}
}
console.warn("chunk.js loaded");


class Chunk{

	//===============================
	//Class properties

	static lastChunk;
	static newChunk;

	static data = {
		debug : false,
		renderDistance : 6,//7,
		renderDistanceLoad : 2,//3
		maxLoad : 3,
		size : 24,//25,//42,
		// send an update each chunk/Chunk.data.subChunkSize crossed
		subChunkSize : 4,

		max : new THREE.Vector3(1000,1000,1000),
		min : new THREE.Vector3(-1000,-1000,-1000),

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
		}
	}

	static rendering(){
		//PLAYER DEPENDANT
		//Système imparfait en cas de téléportation, les anciens chunks ne sont pas déchargés

		
		//charger cube de centre chunk(player)

		const inChunk = Chunk.inChunk(Player.list['sandbox']);

		const min = Chunk.data.min.clone().max( inChunk.clone().addScalar(- Chunk.data.renderDistance - 2).floor() );
		const max = Chunk.data.max.clone().min( inChunk.clone().addScalar(  Chunk.data.renderDistance + 2).floor() );//besoin de floor() ?

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

		let centeredChunk = Player.list['sandbox'].position.clone().divideScalar(Chunk.data.size);
		centeredChunk.addScaledVector( Player.list['sandbox'].direction, Chunk.data.renderDistanceLoad );
		centeredChunk.floor();

		const min = Chunk.data.min.clone().max( centeredChunk.clone().addScalar(-Chunk.data.renderDistanceLoad) );
		const max = Chunk.data.max.clone().min( centeredChunk.clone().addScalar( Chunk.data.renderDistanceLoad) );

		//let loaded = 0;

		//temp : attention on peut sortir du monde et générer des chunks dehors (temp ne passe pas par le test des max et min)
		const v = Chunk.inChunk(Player.list['sandbox']);
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

				const dist = Chunk.inChunk(Player.list['sandbox']).distanceTo(bufferVector);
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
		Chunk.newChunk = Chunk.inDivisedChunk( Player.list['sandbox'], Chunk.data.subChunkSize );
		if (Chunk.isUpdate( Chunk.lastChunk, Chunk.newChunk )) {
			Chunk.rendering();
			Chunk.generate();
		}
		Chunk.lastChunk = Chunk.newChunk;

		//load chunks in Chunk.data.toLoadList
		
		if (Chunk.data.toLoadList.length > 0) {
			if (time % 3 === 0) {
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

		const idc = Chunk.inDivisedChunk( Player.list['sandbox'], Chunk.data.subChunkSize );
		const inChunk = Chunk.inChunk(Player.list['sandbox']);

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

		this.player = Player.list['sandbox'];
		this.chunkPosition = new THREE.Vector3(x,y,z);
		this.chunkID = Chunk.vectorToString(this.chunkPosition);
		this.worldPosition = this.chunkPosition.clone().multiplyScalar(Chunk.data.size);
		
		this.group = new THREE.Group();
		this.group.visible = false;
		this.group.name = "Chunk/" + this.chunkID;

		this.player.scene.add(this.group);

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
		this.collisionFunction();
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
				this.parentCollision( World.list[this.player.id].worldOctree );

				this.collisionFunction = this.collisionUpdate;

				this.parentCollision( World.list[this.player.id].worldOctree );
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

		
/*
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
		b.mesh.lookAt(v.x,v.y,v.z);*/
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
		/*
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
		visualBlock.lookAt(v.x,v.y,v.z);*/


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
console.warn("terrain.js loaded");

const trianglesEdgesIndex = [
	[],
	[ 0, 8, 3,],
	[ 0, 1, 9,],
	[ 1, 8, 3, 9, 8, 1, ],
	[ 1, 2, 10,],
	[ 0, 8, 3, 1, 2, 10, ],
	[ 9, 2, 10, 0, 2, 9, ],
	[ 2, 8, 3, 2, 10, 8, 10, 9, 8,],
	[ 3, 11, 2,],
	[ 0, 11, 2, 8, 11, 0, ],
	[ 1, 9, 0, 2, 3, 11, ],
	[ 1, 11, 2, 1, 9, 11, 9, 8, 11,],
	[ 3, 10, 1, 11, 10, 3, ],
	[ 0, 10, 1, 0, 8, 10, 8, 11, 10,],
	[ 3, 9, 0, 3, 11, 9, 11, 10, 9,],
	[ 9, 8, 10, 10, 8, 11, ],
	[ 4, 7, 8,],
	[ 4, 3, 0, 7, 3, 4, ],
	[ 0, 1, 9, 8, 4, 7, ],
	[ 4, 1, 9, 4, 7, 1, 7, 3, 1,],
	[ 1, 2, 10, 8, 4, 7, ],
	[ 3, 4, 7, 3, 0, 4, 1, 2, 10,],
	[ 9, 2, 10, 9, 0, 2, 8, 4, 7,],
	[ 2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, ],
	[ 8, 4, 7, 3, 11, 2, ],
	[ 11, 4, 7, 11, 2, 4, 2, 0, 4,],
	[ 9, 0, 1, 8, 4, 7, 2, 3, 11,],
	[ 4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, ],
	[ 3, 10, 1, 3, 11, 10, 7, 8, 4,],
	[ 1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, ],
	[ 4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, ],
	[ 4, 7, 11, 4, 11, 9, 9, 11, 10,],
	[ 9, 5, 4,],
	[ 9, 5, 4, 0, 8, 3, ],
	[ 0, 5, 4, 1, 5, 0, ],
	[ 8, 5, 4, 8, 3, 5, 3, 1, 5,],
	[ 1, 2, 10, 9, 5, 4, ],
	[ 3, 0, 8, 1, 2, 10, 4, 9, 5,],
	[ 5, 2, 10, 5, 4, 2, 4, 0, 2,],
	[ 2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, ],
	[ 9, 5, 4, 2, 3, 11, ],
	[ 0, 11, 2, 0, 8, 11, 4, 9, 5,],
	[ 0, 5, 4, 0, 1, 5, 2, 3, 11,],
	[ 2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, ],
	[ 10, 3, 11, 10, 1, 3, 9, 5, 4,],
	[ 4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, ],
	[ 5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, ],
	[ 5, 4, 8, 5, 8, 10, 10, 8, 11,],
	[ 9, 7, 8, 5, 7, 9, ],
	[ 9, 3, 0, 9, 5, 3, 5, 7, 3,],
	[ 0, 7, 8, 0, 1, 7, 1, 5, 7,],
	[ 1, 5, 3, 3, 5, 7, ],
	[ 9, 7, 8, 9, 5, 7, 10, 1, 2,],
	[ 10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, ],
	[ 8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, ],
	[ 2, 10, 5, 2, 5, 3, 3, 5, 7,],
	[ 7, 9, 5, 7, 8, 9, 3, 11, 2,],
	[ 9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, ],
	[ 2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, ],
	[ 11, 2, 1, 11, 1, 7, 7, 1, 5,],
	[ 9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, ],
	[ 5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0,],
	[ 11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0,],
	[ 11, 10, 5, 7, 11, 5, ],
	[ 10, 6, 5,],
	[ 0, 8, 3, 5, 10, 6, ],
	[ 9, 0, 1, 5, 10, 6, ],
	[ 1, 8, 3, 1, 9, 8, 5, 10, 6,],
	[ 1, 6, 5, 2, 6, 1, ],
	[ 1, 6, 5, 1, 2, 6, 3, 0, 8,],
	[ 9, 6, 5, 9, 0, 6, 0, 2, 6,],
	[ 5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, ],
	[ 2, 3, 11, 10, 6, 5, ],
	[ 11, 0, 8, 11, 2, 0, 10, 6, 5,],
	[ 0, 1, 9, 2, 3, 11, 5, 10, 6,],
	[ 5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, ],
	[ 6, 3, 11, 6, 5, 3, 5, 1, 3,],
	[ 0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, ],
	[ 3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, ],
	[ 6, 5, 9, 6, 9, 11, 11, 9, 8,],
	[ 5, 10, 6, 4, 7, 8, ],
	[ 4, 3, 0, 4, 7, 3, 6, 5, 10,],
	[ 1, 9, 0, 5, 10, 6, 8, 4, 7,],
	[ 10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, ],
	[ 6, 1, 2, 6, 5, 1, 4, 7, 8,],
	[ 1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, ],
	[ 8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, ],
	[ 7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9,],
	[ 3, 11, 2, 7, 8, 4, 10, 6, 5,],
	[ 5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, ],
	[ 0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, ],
	[ 9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6,],
	[ 8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, ],
	[ 5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11,],
	[ 0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7,],
	[ 6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, ],
	[ 10, 4, 9, 6, 4, 10, ],
	[ 4, 10, 6, 4, 9, 10, 0, 8, 3,],
	[ 10, 0, 1, 10, 6, 0, 6, 4, 0,],
	[ 8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, ],
	[ 1, 4, 9, 1, 2, 4, 2, 6, 4,],
	[ 3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, ],
	[ 0, 2, 4, 4, 2, 6, ],
	[ 8, 3, 2, 8, 2, 4, 4, 2, 6,],
	[ 10, 4, 9, 10, 6, 4, 11, 2, 3,],
	[ 0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, ],
	[ 3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, ],
	[ 6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1,],
	[ 9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, ],
	[ 8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1,],
	[ 3, 11, 6, 3, 6, 0, 0, 6, 4,],
	[ 6, 4, 8, 11, 6, 8, ],
	[ 7, 10, 6, 7, 8, 10, 8, 9, 10,],
	[ 0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, ],
	[ 10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, ],
	[ 10, 6, 7, 10, 7, 1, 1, 7, 3,],
	[ 1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, ],
	[ 2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9,],
	[ 7, 8, 0, 7, 0, 6, 6, 0, 2,],
	[ 7, 3, 2, 6, 7, 2, ],
	[ 2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, ],
	[ 2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7,],
	[ 1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11,],
	[ 11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, ],
	[ 8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6,],
	[ 0, 9, 1, 11, 6, 7, ],
	[ 7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, ],
	[ 7, 11, 6,],
	[ 7, 6, 11,],
	[ 3, 0, 8, 11, 7, 6, ],
	[ 0, 1, 9, 11, 7, 6, ],
	[ 8, 1, 9, 8, 3, 1, 11, 7, 6,],
	[ 10, 1, 2, 6, 11, 7, ],
	[ 1, 2, 10, 3, 0, 8, 6, 11, 7,],
	[ 2, 9, 0, 2, 10, 9, 6, 11, 7,],
	[ 6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, ],
	[ 7, 2, 3, 6, 2, 7, ],
	[ 7, 0, 8, 7, 6, 0, 6, 2, 0,],
	[ 2, 7, 6, 2, 3, 7, 0, 1, 9,],
	[ 1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, ],
	[ 10, 7, 6, 10, 1, 7, 1, 3, 7,],
	[ 10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, ],
	[ 0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, ],
	[ 7, 6, 10, 7, 10, 8, 8, 10, 9,],
	[ 6, 8, 4, 11, 8, 6, ],
	[ 3, 6, 11, 3, 0, 6, 0, 4, 6,],
	[ 8, 6, 11, 8, 4, 6, 9, 0, 1,],
	[ 9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, ],
	[ 6, 8, 4, 6, 11, 8, 2, 10, 1,],
	[ 1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, ],
	[ 4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, ],
	[ 10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3,],
	[ 8, 2, 3, 8, 4, 2, 4, 6, 2,],
	[ 0, 4, 2, 4, 6, 2, ],
	[ 1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, ],
	[ 1, 9, 4, 1, 4, 2, 2, 4, 6,],
	[ 8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, ],
	[ 10, 1, 0, 10, 0, 6, 6, 0, 4,],
	[ 4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3,],
	[ 10, 9, 4, 6, 10, 4, ],
	[ 4, 9, 5, 7, 6, 11, ],
	[ 0, 8, 3, 4, 9, 5, 11, 7, 6,],
	[ 5, 0, 1, 5, 4, 0, 7, 6, 11,],
	[ 11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, ],
	[ 9, 5, 4, 10, 1, 2, 7, 6, 11,],
	[ 6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, ],
	[ 7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, ],
	[ 3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6,],
	[ 7, 2, 3, 7, 6, 2, 5, 4, 9,],
	[ 9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, ],
	[ 3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, ],
	[ 6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8,],
	[ 9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, ],
	[ 1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4,],
	[ 4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10,],
	[ 7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, ],
	[ 6, 9, 5, 6, 11, 9, 11, 8, 9,],
	[ 3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, ],
	[ 0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, ],
	[ 6, 11, 3, 6, 3, 5, 5, 3, 1,],
	[ 1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, ],
	[ 0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10,],
	[ 11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5,],
	[ 6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, ],
	[ 5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, ],
	[ 9, 5, 6, 9, 6, 0, 0, 6, 2,],
	[ 1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8,],
	[ 1, 5, 6, 2, 1, 6, ],
	[ 1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6,],
	[ 10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, ],
	[ 0, 3, 8, 5, 6, 10, ],
	[ 10, 5, 6,],
	[ 11, 5, 10, 7, 5, 11, ],
	[ 11, 5, 10, 11, 7, 5, 8, 3, 0,],
	[ 5, 11, 7, 5, 10, 11, 1, 9, 0,],
	[ 10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, ],
	[ 11, 1, 2, 11, 7, 1, 7, 5, 1,],
	[ 0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, ],
	[ 9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, ],
	[ 7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2,],
	[ 2, 5, 10, 2, 3, 5, 3, 7, 5,],
	[ 8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, ],
	[ 9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, ],
	[ 9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2,],
	[ 1, 3, 5, 3, 7, 5, ],
	[ 0, 8, 7, 0, 7, 1, 1, 7, 5,],
	[ 9, 0, 3, 9, 3, 5, 5, 3, 7,],
	[ 9, 8, 7, 5, 9, 7, ],
	[ 5, 8, 4, 5, 10, 8, 10, 11, 8,],
	[ 5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, ],
	[ 0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, ],
	[ 10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4,],
	[ 2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, ],
	[ 0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11,],
	[ 0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5,],
	[ 9, 4, 5, 2, 11, 3, ],
	[ 2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, ],
	[ 5, 10, 2, 5, 2, 4, 4, 2, 0,],
	[ 3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9,],
	[ 5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, ],
	[ 8, 4, 5, 8, 5, 3, 3, 5, 1,],
	[ 0, 4, 5, 1, 0, 5, ],
	[ 8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, ],
	[ 9, 4, 5,],
	[ 4, 11, 7, 4, 9, 11, 9, 10, 11,],
	[ 0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, ],
	[ 1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, ],
	[ 3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4,],
	[ 4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, ],
	[ 9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3,],
	[ 11, 7, 4, 11, 4, 2, 2, 4, 0,],
	[ 11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, ],
	[ 2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, ],
	[ 9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7,],
	[ 3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10,],
	[ 1, 10, 2, 8, 7, 4, ],
	[ 4, 9, 1, 4, 1, 7, 7, 1, 3,],
	[ 4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, ],
	[ 4, 0, 3, 7, 4, 3, ],
	[ 4, 8, 7,],
	[ 9, 10, 8, 10, 11, 8, ],
	[ 3, 0, 9, 3, 9, 11, 11, 9, 10,],
	[ 0, 1, 10, 0, 10, 8, 8, 10, 11,],
	[ 3, 1, 10, 11, 3, 10, ],
	[ 1, 2, 11, 1, 11, 9, 9, 11, 8,],
	[ 3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, ],
	[ 0, 2, 11, 8, 0, 11, ],
	[ 3, 2, 11,],
	[ 2, 3, 8, 2, 8, 10, 10, 8, 9,],
	[ 9, 10, 2, 0, 9, 2, ],
	[ 2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, ],
	[ 1, 10, 2,],
	[ 1, 3, 8, 9, 1, 8, ],
	[ 0, 9, 1,],
	[ 0, 3, 8,],
	[]
];


const indexToVertex = [
	[ 0.5, 0.0, 0.0 ],
	[ 1.0, 0.0, 0.5 ],
	[ 0.5, 0.0, 1.0 ],
	[ 0.0, 0.0, 0.5 ],

	[ 0.5, 1.0, 0.0 ],
	[ 1.0, 1.0, 0.5 ],
	[ 0.5, 1.0, 1.0 ],
	[ 0.0, 1.0, 0.5 ],

	[ 0.0, 0.5, 0.0 ],
	[ 1.0, 0.5, 0.0 ],
	[ 1.0, 0.5, 1.0 ],
	[ 0.0, 0.5, 1.0 ],
];

function addVertex(A,B){
	const C = [
		A[0]+B[0],
		A[1]+B[1],
		A[2]+B[2],
	]
	return(C)
}
function scaleVertex(A,scale){
	const C = [
		A[0]*scale,
		A[1]*scale,
		A[2]*scale,
	]
	return(C)
}


let SIZE = 1;

function marchingCube(map,x,y,z){

	const c000 = map[[x,y,z]];
	const c001 = map[[x,y,z+SIZE]];
	const c010 = map[[x,y+SIZE,z]];
	const c011 = map[[x,y+SIZE,z+SIZE]];
	const c100 = map[[x+SIZE,y,z]];
	const c101 = map[[x+SIZE,y,z+SIZE]];
	const c110 = map[[x+SIZE,y+SIZE,z]];
	const c111 = map[[x+SIZE,y+SIZE,z+SIZE]];

	const tri = [];

	const index = c000 + c100 * 2 + c101 * 4 + c001 * 8 + c010 * 16 + c110 * 32 + c111 * 64 + c011 * 128;

	const tei = trianglesEdgesIndex[index];

	for( let i of tei ){
		tri.push( scaleVertex( addVertex( indexToVertex[i], [ x, y, z ] ), SIZE ) );
	}

	return tri

}


function arrayToFloats(array){
	// [[[1,2],[3]],[1,[5,8]]] => [1,2,3,1,5,8]
	const L = [];
	for(let e0 of array){
	for(let e1 of e0){
	for(let e2 of e1){
		L.push(e2)
	}}}
	return(L)
}


function marchingChunk(map){

	const triangles = [];

	for (let x = 0; x < Chunk.data.size/SIZE; x++) {
	for (let y = 0; y < Chunk.data.size/SIZE; y++) {
	for (let z = 0; z < Chunk.data.size/SIZE; z++) {

		triangles.push( marchingCube(map,x,y,z) );
	}}}

	return arrayToFloats(triangles)

}

function caveWide(y){

	/*
	1.0 = vide (grottes infiniment larges)
	0.0 = grottes (moitié vide/moitié plein)
	-1.0 = plein (grottes infiniment fines)
	*/

	if (y >= -50) { return -1.0 }
	if (y >= -90) {
		const t = map(y,-50,-90,0,1);
		return linear(t,-1.0,0.0);
	}
	if (y >= -130) {
		const t = map(y,-90,-130,0,1);
		return linear(t,0.0,0.5);
	}
	if (y >= -160) { return 0.5 }
	if (y >= -200) {
		const t = map(y,-160,-200,0,1);
		return linear(t,0.5,-1.0);
	}
	return -1.0;
}


class Terrain{

	static data = {
		list : {},
		length : 0,
	}

	static generation(x,y,z){	//à compléter

		//https://www.desmos.com/calculator/cucxkogo6q?lang=fr

		//https://www.desmos.com/calculator/wfubfzuayi
		//montagnes

		//https://www.desmos.com/calculator/hckvesfhle

		const caveNoise = perlin.noise( 3*x/freq, 8*y/freq, 3*z/freq );
		//const surfaceNoise = 20*perlin.noise( 3*x/freq, 0, 3*z/freq );

		const classicNoise = perlin.noise( 5*x/freq, 5*y/freq, 5*z/freq );
		const classicNoise1 = perlin.noise( 1.02 + 5*x/freq, 1.37 + 5*y/freq, 1.12 + 5*z/freq );


		const altitude = 100;
		const altiNoise = map( perlin.noise( x/freq, 0, z/freq ), -1, 1, 0, 1 );
		const altiNoise2 = map( perlin.noise( x/freq*4, 0, z/freq*4 ), -1, 1, 0, 1 );
		const altiNoise4 = map( perlin.noise( x/freq*16, 0, z/freq*16 ), -1, 1, 0, 1 );

		const surfaceBiomeNoise = altitude * altiNoise**2 * ( 1 + 2*altiNoise2 + 4*altiNoise4 * altiNoise )/3


		const p = new THREE.Vector3(x,y,z);
		const m = new THREE.Vector3(0,50,0);
		
		//boule non-parfaitement ronde
		const ballBin = ellipsoidNorm(p,m,
					30 + 4*classicNoise,
					30 + 4*classicNoise,
					30 + 4*classicNoise,
									);


		//const caveBin = caveNoise > 0.0 ? 1 : 0;
		//const classicBin = classicNoise > 0.6 ? 1 : 0;



		const caveBin = caveNoise > caveWide(y) ? 1 : 0;
		const cave0Bin = Math.abs(classicNoise) < 0.1 ? 1 : 0;
		const cave1Bin = Math.abs(classicNoise1) < 0.1 ? 1 : 0;

		const y0_lvl = 0 > y ? 1 : 0;
		const surfaceBin = (surfaceBiomeNoise > y+30) ? 1 : 0;

		//return surfaceBin && caveBin || ballBin && caveBin;
		return !(cave0Bin && cave1Bin) && caveBin && (surfaceBin || ballBin);
	}

	constructor( x = 0, y = 0, z = 0 ) {
		this.chunkPosition = new THREE.Vector3(x,y,z);
		this.chunkID = Chunk.vectorToString(this.chunkPosition);
		this.worldPosition = this.chunkPosition.clone().multiplyScalar(Chunk.data.size);

		this.generation = this.genVertex();
		this.mesh = this.genMesh();

		this.mesh.name = "Terrain/" + this.chunkID;

		//this.collisionFunction = this.collisionInit; // si initialisé, la fonction devient this.collisionUpdate

		Terrain.data.list[this.chunkPosition] = this;
		Terrain.data.length += 1;

		Chunk.data.list[this.chunkID].collisionFunction();
	}

	//------------------------------------

	genVertex(){

		const L = {};

		const v0 = this.worldPosition;

		for (let x = 0; x <= Chunk.data.size/SIZE; x++) {
		for (let y = 0; y <= Chunk.data.size/SIZE; y++) {
		for (let z = 0; z <= Chunk.data.size/SIZE; z++) {
			L[[x,y,z]] = Terrain.generation( v0.x + x, v0.y + y, v0.z + z ) ;
		}}}
		return(L)
	}

	genMesh(){

		const triangles = marchingChunk( this.generation );

		const geometry = new THREE.BufferGeometry();
		const vertices = new Float32Array( triangles );
		geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

		geometry.computeVertexNormals();
		geometry.normalizeNormals();

		const mesh = new THREE.Mesh( geometry, materials.golpexBlack );

		mesh.castShadow = true;
		mesh.receiveShadow = true;

		mesh.position.copy( this.worldPosition );
		Chunk.setInChunk(mesh);

		return mesh;
	}

	meshUpdate(){
		//ATTENTION : penser à update les bords des autres chunks quand changement de this.genration aux points 0 ou Chunk.data.size
		// à la manière de la fonction Chunk.nearUser()
	}
}












class Biome{

	static type = {

	}
/*
	temperature	: -1.0 = cold 	/	1.0 = hot
	humidity	: -1.0 = wet	/	1.0 = dry
	altitude	: -1.0 = flat 	/	1.0 = high
	smoothness	: -1.0 = rought	/	1.0 = soft
*/
/*
	static temperature = perlin.noise(0,0,0);
	static altitude = perlin.noise();
	*/
}


//https://threejs.org/examples/#webgl_buffergeometry_indexed
console.warn("ui.js loaded");


class UI{

	static data = {
		list: [],
		listByName: {}, //may contain duplicate keys, and therefore this list can be not complete
	};

	static buffer = new THREE.Vector3();	//utilisé pour les vecteurs temporaires

	constructor(x,y,sceneCSS3,cameraCSS3,html = '',name = '',){

		this.sceneCSS3 = sceneCSS3;
		this.cameraCSS3 = cameraCSS3;

		this.element = document.createElement('div');
		this.element.innerHTML = html;

		this.profile = new THREE.CSS3DObject(this.element);
		this.sceneCSS3.add(this.profile);

		this.UIposition = new THREE.Vector2(x,y);
		this.UIrotation = new THREE.Vector3(0,0,0);

		UI.data.list.push(this);

		this.name = name;
		UI.data.listByName[this.name] = this;

		this.Func = ()=>{return false};

	}


	update(time){
		const forward = forwardVector(this.cameraCSS3);
		const side = sideVector(this.cameraCSS3);
		const up = upVector(this.cameraCSS3);

		UI.buffer.set(0,0,0);
		UI.buffer.addScaledVector( forward, 1 )
		UI.buffer.addScaledVector( side, this.UIposition.x / window.innerHeight * window.innerWidth * 0.5);  // à changer, mettre aspect sur y et enlever 0.5
		UI.buffer.addScaledVector( up, this.UIposition.y * 0.5); // 0.5 / 1.5 : magic numbers for fov
		UI.buffer.normalize();


		this.profile.position.copy(this.cameraCSS3.position);

		this.profile.position.addScaledVector(UI.buffer, CSS3WorldRatio*10);

		this.profile.rotation.copy(this.cameraCSS3.rotation);

		this.profile.rotateX(this.UIrotation.x);
		this.profile.rotateY(this.UIrotation.y);
		this.profile.rotateZ(this.UIrotation.z);
	}

	setFunc(f){
		this.Func = f;
	}

	updateHTML(){
		this.element.innerHTML = this.Func(arguments);
	}
}


function uiInit(){
	const sandbox = World.list['sandbox'];
	const hub = World.list['hub'];
	const labo = World.list['labo'];

	new UI(0,0,sandbox.sceneCSS3,sandbox.camerasCSS3.main,'❌','sandboxCross');
	new UI(0,0,hub.sceneCSS3,hub.camerasCSS3.main,'❌','hubCross');
	new UI(0,0,labo.sceneCSS3,labo.camerasCSS3.main,'❌','laboCross');

	new UI(0,1.0,sandbox.sceneCSS3,sandbox.camerasCSS3.main,'','info').setFunc( ()=>{
/*
			const html = '<div class="blockPost">' +
						'Mode actuel : ' + Mode.data.current + '<br>' +
						'Bloc séléctionné : ' + Block.selection[Block.selected] + '</div>';*/

			const html =
			'<div class="blockPost">' +
				'<div class="blockPost-title">' +
					'<h1>Golpex version p1.0</h1>' +
				'</div>' +
				'<div class="blockPost-content">' +
					'Mode actuel : ' + Mode.data.current + '<br>' +
					'Bloc séléctionné : ' + Block.selection[Block.selected] + '<br>' +
					'Position : ' + Player.list['sandbox'].position.clone().floor().toArray() + '<br>' +
					'Position Chunk : ' + Chunk.inChunk(Player.list['sandbox']).toArray() + '<br>' +
					'Chunks chargés : ' + Chunk.data.length + '<br>' +
				'</div>' +
			'</div>';
			return html;

	})

	new UI(0,0.8,sandbox.sceneCSS3,sandbox.camerasCSS3.main,'','updateInfo').setFunc( (a)=>{

		if (a[0] === undefined) {return}

		const html = '<div class="btnFastUpdate updateInfo">' + a[0] + '</div>';

		return html;
	})


	new UI(1.0,1.0,sandbox.sceneCSS3,sandbox.camerasCSS3.main,'','fps').setFunc( ()=>{

		const html = '<div class="btnFastUpdate">' + 'fps : ' + fps + '</div>';
		return html;
	});

	new UI(0,1.0,labo.sceneCSS3,labo.camerasCSS3.main,'<div class="blockPost">On test des trucs de fous ici</div>','laboInfo');
	new UI(0.5,1.0,labo.sceneCSS3,labo.camerasCSS3.main,'<div class="blockPost">regarde je fais<br>tourner cette UI</div>','laboCaTourne');
	

	//retour
	new UI(-1.0,1.0,
		sandbox.sceneCSS3,
		sandbox.camerasCSS3.main,
		'<a class="blockPost" onclick="goBack(\'sandbox\')"><i class="fa-solid fa-arrow-left"></i></a>',
		'sandboxBack',
		);
	new UI(-1.0,1.0,
		hub.sceneCSS3,
		hub.camerasCSS3.main,
		'<a class="blockPost" onclick="goBack(\'hub\')"><i class="fa-solid fa-arrow-left"></i></a>',//rajouter un pointer.unlock
		'hubBack',
		);
	new UI(-1.0,1.0,
		labo.sceneCSS3,
		labo.camerasCSS3.main,
		'<a class="blockPost" onclick="goBack(\'labo\')"><i class="fa-solid fa-arrow-left"></i></a>',//rajouter un pointer.unlock
		'laboBack',
		);

	//contrôles mobile

	if (isPhone) {
		new UI(0.9,-1.0,sandbox.sceneCSS3,sandbox.camerasCSS3.main,
			`

			<div class="blockPost" id="mobileForward"><i class="fa-solid fa-angle-up"></i></div>
			<div class="blockPost" id="mobileJump">Sauter</div>
			`,
			'mobilePosition'
			);

		new UI(-0.9,-1.0,sandbox.sceneCSS3,sandbox.camerasCSS3.main,
			`
			<span class="blockPost" id="mobileUp" style="display:none;"><i class="fa-solid fa-angle-up"></i></span><br>
			<span class="blockPost" id="mobileLeft"><i class="fa-solid fa-angle-left"></i></span>
			<span class="blockPost" id="mobileRight"><i class="fa-solid fa-angle-right"></i></span><br>
			<span class="blockPost" id="mobileDown" style="display:none;"><i class="fa-solid fa-angle-down"></i></span>

			`,
			'mobileRotation'
			);

		const mobileForward = UI.data.listByName.mobilePosition.element.children[0];
		const mobileJump = UI.data.listByName.mobilePosition.element.children[1];

		const mobileUp = UI.data.listByName.mobileRotation.element.children[0];
		const mobileLeft = UI.data.listByName.mobileRotation.element.children[2];
		const mobileRight = UI.data.listByName.mobileRotation.element.children[3];
		const mobileDown = UI.data.listByName.mobileRotation.element.children[5];


		mobileForward.addEventListener('touchstart', ()=>{
			keyDownList['touchForward'] = true;
		});
		mobileForward.addEventListener('touchend', ()=>{
			keyDownList['touchForward'] = false;
		});
			
		mobileJump.addEventListener('touchstart', ()=>{
			keyDownList['touchJump'] = true;
		});
		mobileJump.addEventListener('touchend', ()=>{
			keyDownList['touchJump'] = false;
		});

		mobileUp.addEventListener('touchstart', ()=>{
			keyDownList['rotateUp'] = true;
		});
		mobileUp.addEventListener('touchend', ()=>{
			keyDownList['rotateUp'] = false;
		});

		mobileLeft.addEventListener('touchstart', ()=>{
			keyDownList['rotateLeft'] = true;
		});
		mobileLeft.addEventListener('touchend', ()=>{
			keyDownList['rotateLeft'] = false;
		});

		mobileRight.addEventListener('touchstart', ()=>{
			keyDownList['rotateRight'] = true;
		});
		mobileRight.addEventListener('touchend', ()=>{
			keyDownList['rotateRight'] = false;
		});

		mobileDown.addEventListener('touchstart', ()=>{
			keyDownList['rotateDown'] = true;
		});
		mobileDown.addEventListener('touchend', ()=>{
			keyDownList['rotateDown'] = false;
		});
	}
	
}

function goBack(id){
//bricole pour pouvoir unlock 10ms plus tard / sinon controls.unlock() s'éxécute avant le controls.lock() de document.getElementById(id).onclick
//si lag => possibilité de rester en lock()
	setTimeout(()=>{
		Mode.set('CREATIVE');	//temporaire en attendant d'avoir un mode pour chaque player
		World.goTo('welcome');
		Player.list[id].controls.unlock();
	},10);
}

class PortalCSS3{

	constructor(x,y,z,html=''){

		//CSS3Renderer
		this.position = new THREE.Vector3(x,y,z);
		this.element = document.createElement('div');
		this.element.innerHTML = html;
		this.object = new THREE.CSS3DObject(this.element);
		sceneCSS3.add(this.object);
		this.object.position.copy(this.position).multiplyScalar(CSS3WorldRatio);

		//worldRenderer
		this.box = this.boxInit(); // pour détecter si utilisateur en contact avec portalcss3 (intersect())
	}

	boxInit(){
		const dim = this.element.getBoundingClientRect();

	}
	
}

let spacex;

function portalCSS3Init(){
	
	//spacex = new PortalCSS3(-20,0,0,pageEXTERNE0);
	/*
	mp = new PortalCSS3(-30,0,0,pageEXTERNE);

	let boxgeo1 = new THREE.BoxGeometry(5,5,5);
	let cube1 = new THREE.Mesh(boxgeo1, materials.blue);

	sceneWorld.add(cube1);
	cube1.position.set(-20,10,10)

	*/

}
console.warn("main.js loaded");
// https://www.compart.com/fr/unicode/U+2705



function sandBoxInit(){		//OBESOLETE
	//document.getElementById("welcome").outerHTML = "";
	//document.querySelector("body").style.overflow = "hidden";

	document.getElementById("welcome").style.display = "none";
	document.getElementById("initButton").onclick = "";

	scening()

	//initLoad()//test

	window.addEventListener( 'resize', onWindowResize0 );
	decoratingTemp()
	playerInit()
	blockInit()

	chunkInit()
	
	uiInit()
	UI.data.listByName['info'].updateHTML();
	portalCSS3Init()


	cameraWorld.position.z = 0;
	cameraWorld.position.y = 0;
	cameraWorld.position.x = 0;


	requestAnimationFrame(main0);
}

let deltaTime = 0.05;
let time = 0;
let fps;

function main0(){	//OBSOLETE
	time ++;
		//RENDERING

	water.material.uniforms[ 'time' ].value = time / 200.0;

	cameraCSS3.position.copy(cameraWorld.position).multiplyScalar(CSS3WorldRatio);
	cameraCSS3.rotation.copy(cameraWorld.rotation);

	for(let el of UI.data.list){
		el.update(time);
	}
	deltaTime = Math.min( 0.2/*0.05*/, clock.getDelta() ) / STEPS_PER_FRAME;
	if (time % 20 === 0 ) {
		fps = Math.floor(1/deltaTime/STEPS_PER_FRAME);
		UI.data.listByName['fps'].updateHTML();
	}
	

	rendererCSS3.render(sceneCSS3, cameraCSS3);
	rendererWorld.render(sceneWorld, cameraWorld);
	requestAnimationFrame(main0);

		//UPDATING

	updateActiveKeys();
	

	
	
	for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {

					//controls( deltaTime );

					player.update( deltaTime );

					//updateSpheres( deltaTime );

					//teleportPlayerIfOob();

				}
	Chunk.update(time);
	preVisualBlock();
	//if (time % 10 === 0) {console.log(Chunk.data.toLoadList)}
	
/*
	cameraCSS3.position.set(
		cameraWorld.position.x * CSS3WorldRatio,
		cameraWorld.position.y * CSS3WorldRatio,
		cameraWorld.position.z * CSS3WorldRatio,
		)*/
	
/*
	cameraCSS3.rotation.set(
		cameraWorld.rotation.x,
		cameraWorld.rotation.y,
		cameraWorld.rotation.z,
		)*/

	//tempUIupdate()



	//portail youtube car c'est rigolo
	/*
	if (player.position.distanceTo( youtubePortal.position.clone().divideScalar(CSS3WorldRatio) ) <= 1  ) {
		window.location.href = "https://www.youtube.com/embed/uKqC5uHjE4g";
		//window.location.replace("https://www.youtube.com/embed/uKqC5uHjE4g");
		player.setPosition(center);
	}*/

	
}

//init()
/*
console.log(window.document.getElementById('renderEnv'))

console.log(window.document.getElementById('renderWorld'))
console.log(window.document.getElementById('renderCSS3'))
*/


//retour page acceuil : document.getElementById('renderEnv').style.display = "none";
//						document.getElementById('welcome').style.display = "block";







































//let water;
function sandboxInit(){

	const _this = World.list['sandbox'];

	//------------------
	//water

	const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );
	const waterNormals = loaderTexture.load(

			"textures/waternormals.jpg",

			// onLoad callback
			function ( texture ) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				
			},

			// onProgress callback
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},

			// onError callback
			function ( err ) {
				console.error( ' textures/waternormals.jpg not loaded: ', err );
			}
		);

	water = new THREE.Water(
					waterGeometry,
					{
						textureWidth: 512,
						textureHeight: 512,
						waterNormals: waterNormals,
						sunDirection: new THREE.Vector3(),
						sunColor: 0xffffff,
						waterColor: 0xf59542,
						distortionScale: 1.0,
						fog: _this.sceneWorld.fog !== undefined,
						alpha: 0.7,
					}
				);

	water.material.transparent = true;
	water.rotation.x = - Math.PI / 2;
	water.position.y -= 5;

	_this.sceneWorld.add( water );

	Player.list['sandbox'].setPosition(new THREE.Vector3(14,0,-10))
	Mode.set('SIMPLE');
}

function sandboxMain(){
	
	water.material.uniforms[ 'time' ].value = time / 200.0;

	const _this = World.list['sandbox'];

	_this.rendererCSS3.render(_this.sceneCSS3, _this.camerasCSS3.main);
	_this.rendererWorld.render(_this.sceneWorld, _this.cameras.main);

	updateActiveKeys();
	for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {
		Player.list['sandbox'].update( deltaTime );
	}
	Chunk.update(time);
	const player = Player.list[ World.currentId ];

	preVisualBlock(player.camera, _this.scenePhysical);





	//on water
	if (player.position.y < (water.position.y + 0.5) && Mode.data.current === 'SIMPLE') {//pas opti de faire comme ça : penser à créer une update
		
		player.onWater = true;
		if (player.position.y < water.position.y) {
			_this.sceneWorld.fog.density = 0.02;
			World.list['sandbox'].sceneWorld.fog.color.setHex(0x0000ff);
		}
		
	}
	else{
		_this.sceneWorld.fog.density = 0.005;
		World.list['sandbox'].sceneWorld.fog.color.setHex(0xf59542);
		player.onWater = false;
		
	}

}






function hubInit(){

	const _this = World.list['hub'];

	let boxgeo = new THREE.BoxGeometry(1,1,1);
	let boxmat = new THREE.MeshPhysicalMaterial( {color: 0xff0000 , emissive: 0xffffff , metalness: 1.0 , transparent: false , opacity: 0.7} );
	let cube = new THREE.Mesh(boxgeo, boxmat);
	_this.sceneWorld.add(cube);
	cube.position.set(0,0,-20);
}


function hubMain(){

	const _this = World.list['hub'];

	_this.rendererCSS3.render(_this.sceneCSS3, _this.camerasCSS3.main);
	_this.rendererWorld.render(_this.sceneWorld, _this.cameras.main);


	updateActiveKeys();
	for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {
		Player.list['hub'].update( deltaTime );
	}
}



function laboInit(){

	const _this = World.list['labo'];

	const floor = new THREE.Mesh(
					new THREE.BoxGeometry( 10, 0.5, 10 ),
					//new THREE.ShadowMaterial( { color: 0x007777 } )
					materials.white
				);
	floor.receiveShadow = true;
	_this.sceneWorld.add( floor );
	floor.position.set(0,-1,-10);

	const cube = new THREE.Mesh( geometries.box, materials.red );
	cube.receiveShadow = true;
	_this.sceneWorld.add( cube );
	cube.position.set(0,10,-10);
	cube.rotation.set(1,2,3);

	//physics.addMesh( floor );
	//physics.addMesh( cube, 1 );

	marching3();
}


function laboMain(){

	const _this = World.list['labo'];

	_this.rendererCSS3.render(_this.sceneCSS3, _this.camerasCSS3.main);
	_this.rendererWorld.render(_this.sceneWorld, _this.cameras.main);


	updateActiveKeys();
	for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {
		Player.list['labo'].update( deltaTime );
	}
	UI.data.listByName['laboCaTourne'].UIrotation.set(time/600,time/100,time/700);
/*
	effect.reset();
	for ( let i = 0; i < 3; i ++ ) {

				const ballx = Math.sin( i + 1.26 * time/20 * ( 1.03 + 0.5 * Math.cos( 0.21 * i ) ) ) * 0.27 + 0.5;
				const bally = Math.abs( Math.cos( i + 1.12 * time/20 * Math.cos( 1.22 + 0.1424 * i ) ) ) * 0.77; // dip into the floor
				const ballz = Math.cos( i + 1.32 * time/20 * 0.1 * Math.sin( ( 0.92 + 0.53 * i ) ) ) * 0.27 + 0.5;

				effect.addBall( ballx, bally, ballz, 1, 12 );


			}
	effect.update();*/

	//effect.reset();
	//effect.addBall( 0.5, time/300%1, 0.5, 1, 12 );
	effect.update();
}

/*
function nameInit(){

	const _this = World.list['labo'];

}


function nameMain(){

	const _this = World.list['name'];

	_this.rendererCSS3.render(_this.sceneCSS3, _this.camerasCSS3.main);
	_this.rendererWorld.render(_this.sceneWorld, _this.cameras.main);


	updateActiveKeys();
	for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {
		Player.list['name'].update( deltaTime );
	}
}
*/



function init(id){

	new World('hub');
	new World('sandbox');
	new World('labo');

	document.getElementById("hubInitBtn").onclick = ()=>{World.goTo('hub')};
	document.getElementById("sandboxInitBtn").onclick = ()=>{World.goTo('sandbox')};
	document.getElementById("laboInitBtn").onclick = ()=>{World.goTo('labo')};

	playerInit('sandbox');
	playerInit('hub');
	playerInit('labo');

	World.goTo(id);

	uiInit();
	//init UI widget
	UI.data.listByName['info'].updateHTML();
/*
	UI.data.listByName['info'].updateHTML();
	UI.data.listByName['info'].updateHTML();
	UI.data.listByName['info'].updateHTML();*/

	sandboxInit();
	hubInit();
	laboInit();

	blockInit('sandbox');

	requestAnimationFrame(main);
	
}

function main(){
	time++;

	deltaTime = Math.min( 0.2/*0.05*/, clock.getDelta() ) / STEPS_PER_FRAME;
	if (time % 20 === 0 ) {
		fps = Math.floor(1/deltaTime/STEPS_PER_FRAME);
		//UI.data.listByName['fps'].updateHTML();
	}
	for(let el of UI.data.list){
		el.update(time);
	}

	const id = World.currentId;
	if (id === 'welcome') {}
	if (id === 'sandbox') {
		sandboxMain();
		World.list['sandbox'].updateCameras()
	}
	if (id === 'hub') {
		hubMain();
		World.list['hub'].updateCameras()
	}
	if (id === 'labo') {
		laboMain();
		World.list['labo'].updateCameras()
	}

	requestAnimationFrame(main);
}


/*
let physics;
async function test(){
	physics = await THREE.AmmoPhysics();	//ne pas utiliser AmmoPhysics() si on veut plus de possibilités et utiliser Ammo() directement
}
//https://github.com/mrdoob/three.js/blob/master/examples/physics_ammo_break.html





//https://threejs-university.com/2021/08/17/comprendre-et-utiliser-la-physique-dans-three-js-avec-ammo-js/
//https://github.com/kripken/ammo.js/
test()

*/
let effect;
function marching3(){
	const resolution = 10;

	effect = new THREE.MarchingCubes( resolution, materials.golpexOrange, false, false );
	effect.position.set( 0, 5, -10 );
	effect.scale.set( 10, 10, 10 );
	effect.init( Math.floor( resolution ) );

	effect.addBall( 0.5, 0.5, 0.5, 1, 10 );
	effect.addPlaneX(1,10);
	effect.addPlaneY(1,10);
	effect.addPlaneZ(1,10);

	effect.reset();
	effect.addBall(0.5,0.5,0.5, 0.5,10);

	World.list['labo'].sceneWorld.add( effect );
}
