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