"use strict";

console.table('https://readyplayer.me/fr/developers', 'avatars')
console.warn("sceneSetup.js loaded");

//https://github.com/mrdoob/three.js/tree/master/examples/js

//https://turbulent.ca/game-studio/

//=================================================================================
//							CONSTANTS

let player;

const STEPS_PER_FRAME = 4;
const MAX_NUMBER_PER_BLOCKS = 1000;	//instancedMesh for blocks

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
			testMap : new THREE.PerspectiveCamera(60, World.aspect, 0.1, 1000),
		};
		this.camerasCSS3 = {
			main: new THREE.PerspectiveCamera(60, World.aspect, 0.1, 1000),
			testMap : new THREE.PerspectiveCamera(60, World.aspect, 0.1, 1000),
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
		
		//a suppr
		//this.controls = new THREE.MapControls( this.cameras.main, this.rendererWorld.domElement );

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


		//players
		this.player = new Map(); //pseudo -> player

		/*
		if (this.id === 'gameLand') {
			this.player.set(
				'guest',
				//new Player( this.id, "map"),
				new Player( this.id, "pointer"),
			);
		}else{
			this.player.set(
				'guest',
				new Player( this.id, "pointer"),
			);
			if (!isPhone) {
				document.getElementById(this.id).onclick = ()=>{ this.player.get('guest').controls.lock() };
			}
		}*/
		this.player.set(
			'guest',
			new Player( this.id, "pointer"),
		);
		if (!isPhone) {
			document.getElementById(this.id).onclick = ()=>{ this.player.get('guest').controls.lock() };
		}

		

		//blockManager

		this.blockManager = new BlockManager(this.id);

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

		//init et main
		this.initFunc = function(){};
		this.mainFunc = function(){};
	}

	updateCameras(){	// trouver une solution alternative à World == CSS3 (fusionner les deux si possible)
		this.camerasCSS3.main.position.copy(this.cameras.main.position).multiplyScalar(CSS3WorldRatio);
		this.camerasCSS3.main.rotation.copy(this.cameras.main.rotation);
	}

	//--------------------------
	//Fonction init et main à appeler pour chaque monde dans le init et main de Golpex

	init(){

		document.getElementById(this.id + "InitBtn").onclick = ()=>{World.goTo(this.id)};

		new UI(0,0,this.sceneCSS3,this.camerasCSS3.main,'❌','sandboxCross');
		new UI(-1.0,1.0,
			this.sceneCSS3,
			this.camerasCSS3.main,
			'<a class="blockPost" onclick="goBack(\'' + this.id + '\')"><i class="fa-solid fa-arrow-left"></i></a>',
			this.id + 'Back',
		);

		this.initFunc();
	}

	main(){

		this.rendererWorld.render(this.sceneWorld, this.cameras.main);
		this.rendererCSS3.render(this.sceneCSS3, this.camerasCSS3.main);

		const playerGuest = this.player.get('guest');
		
		if (playerGuest.controlType === 'pointer') {
			playerGuest.activeKeys();
			for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {
				//Player.list[this.id].update( deltaTime );
				playerGuest.update( deltaTime );

			}
		}
		if (playerGuest.controlType === 'map') {
			//playerGuest.controls.update();	//if mapControls & only required if controls.enableDamping = true, or if controls.autoRotate = true
		}
		

		this.mainFunc();

		this.updateCameras();
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
	//--------------------------
	



	
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


/*
function lerp(t ,a ,b){
	return a + t*( b - a );
}*/

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function getState(a, b, c, d, e, f, g, h) {
    return a * 1 + b * 2 + c * 4 + d * 8 + e * 16 + f * 32 + g * 64 + h * 128;
}

function sCurve(t){
	//[0,1] --> [0,1]
	return t*t*(3-2*t);
}

function sCurveR(t){
	//[-oo,+oo] --> [0,1]
	if (x < 0) return 0;
	if (x > 1) return 1;
	return t*t*(3-2*t);
}

function smoothExp(x){
	// R --> [0,1]
	const exp = 1 + Math.exp(-x);
	return 1/exp;
}

console.log("https://www.desmos.com/calculator/eqq1v0gbow")

function ellipsoidNorm(p,m,a,b,c){// p : point in space Vector3 / m : center Vector3 / a : x-length value / b : x-length value / c : x-length value
	
	const v = p.clone().sub(m); // centered

	return (v.x/a)**2 + (v.y/b)**2 + (v.z/c)**2 <= 1;
}

function smoothEllipsoidNorm(p,m,a,b,c){// p : point in space Vector3 / m : center Vector3 / a : x-length value / b : x-length value / c : x-length value
	
	const v = p.clone().sub(m); // centered

	const size = (v.x/a)**2 + (v.y/b)**2 + (v.z/c)**2;

	return smoothExp( 1 - size );
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
	pole : new THREE.BoxGeometry(0.1,1,0.5),
	beam : new THREE.CylinderGeometry( 0.5, 0.5, 0.5, 8 ),
	wall : new THREE.BoxGeometry(1,1,0.25),
	floor : new THREE.BoxGeometry(1,0.25,1),
	ball : new THREE.DodecahedronGeometry(1, 5),

}

const materials = {
	blank : new THREE.MeshStandardMaterial( {vertexColors: true} ),
	//permet de définir geometry.setAttribute('color', ... )

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



	formula : new THREE.MeshPhysicalMaterial( {
		color: 0xff0000,
		transparent : true,
		opacity : 0.4,
		wireframe : false,
	} ),
}


















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



const pageHome = `
<div id="welcome0">

	
		<div class="animationSquare"></div>


	<!-- Header -->
	<div class="header">
		<!--logo.https://www.w3schools.com/html/html5_svg.asp-->
		
		<span>
			<span id="title">Gol</span><img src="./logo.svg" width="150" />
		</span>
		
		
		
		


		<!--<h1>Golpex</h1>-->
		<p><b>Version p1.1</b> by <b>Golto (FOUCAUD Guillaume)</b></p>
		<p>© Tout droit réservé</p>
	</div>

	<!-- Navigation Bar -->
	<div class="navbar">
		<a href="https://hubs.mozilla.com/"><i class="fa-solid fa-link"></i> Salles entre potes</a>
		<a href="https://bruno-simon.com/"><i class="fa-solid fa-link"></i> Jeu de Bruno Simon</a>
		<a href="#" onclick="" >❌ hub</a>
		<a href="#" onclick="" >❌ sandbox</a>
		<a href="#" onclick="" >❌ labo</a>
	</div>

	<div class="infobar">
		<p class="leftAligned"> * Renseignez-vous ci-dessous en ce qui concerne les contrôles sur PC ou interface tactile (mobile/tablette/mac)</p>
	</div>

	<!-- The flexible grid (content) -->
	<div class="row">
		<div class="side">
			<!--
			<i class="fa-solid fa-bars"></i>
			<i class="fa-solid fa-bars-staggered"></i>
			<i class="fa-solid fa-folder"></i>
			<i class="fa-solid fa-folder-open"></i>
			<i class="fa-solid fa-copy"></i>
			<br>
			<i class="fa-solid fa-floppy-disk"></i>
			<i class="fa-solid fa-download"></i>
			<i class="fa-solid fa-upload"></i>
			<i class="fa-solid fa-computer"></i>
			<i class="fa-solid fa-laptop"></i>
			<i class="fa-solid fa-mobile-screen"></i>
			<br>
			<i class="fa-solid fa-trash"></i>
			<i class="fa-solid fa-check"></i>
			<i class="fa-solid fa-xmark"></i>
			<i class="fa-solid fa-crop-simple"></i>
			<i class="fa-solid fa-pen"></i>
			<i class="fa-solid fa-plus"></i>
			<i class="fa-solid fa-minus"></i>
			<i class="fa-solid fa-link"></i>
			<i class="fa-solid fa-angle-down"></i>
			<i class="fa-solid fa-angle-up"></i>
		-->

			<h2>Version prototype 1.1</h2>
			<h2>Actuel</h2>
			<h5>xx septembre 2022</h5>
			<br>
			<p class="leftAligned">
				Golpex version p1.1 : +
			</p>

			<br>

			<h2>Versions antérieures</h2>
			<h5>Depuis Août 2022</h5>
			<br>
			<p><b>Golpex version p1.0 [xx août 2022]</b></p>
			<p class="leftAligned">+</p>
			<br>

			<br>

			<h5>janvier 2022 à juillet 2022</h5>
			<br>
			<p><b>Golpex version p0.1 [janvier 2022]</b></p>
			<p class="leftAligned">Créations d'objets three.js</p>
			<br>
			<p><b>Golpex version p0.2 [février 2022]</b></p>
			<p class="leftAligned">Création/Gestion des chunks (client only)</p>
			<br>
			<p><b>Golpex version p0.3 [mars 2022]</b></p>
			<p class="leftAligned">Lumière + génération d'un 2D-terrain</p>
			<br>
			<p><b>Golpex version p0.4 [avril 2022]</b></p>
			<p class="leftAligned">vue FPS + collision/gravité</p>
			<br>
			<p><b>Golpex version p0.5 [mai 2022]</b></p>
			<p class="leftAligned">génération procédurale (client only)</p>
			<br>
			<p><b>Golpex version p0.6 [juin 2022]</b></p>
			<p class="leftAligned">génération procédurale MarchingCubes, grottes/Lune (client only)</p>
			<br>
			<p><b>Golpex version p0.7 [juillet 2022]</b></p>
			<p>(non publié)</p>
			<p class="leftAligned">Test du build-mode et terraforming</p>
			<br>

		</div> <!--side end-->
		<div class="main">

			<div class="blockPost">

				<div class="blockPost-title" >
					<h1><i class="fa-solid fa-gamepad"></i> "Gameplay"</h1>
				</div>

				<div class="blockPost-content" >

					<h3>Deux modes</h3>
					<br>
					<p>SIMPLE -> utilisateur affecté par la gravité</p>
					<p>CREATIVE -> utilisateur non-affecté par la gravité</p>
					<br>
					<h3>Mode de construction</h3>
					<br>
					<p>Chaque bloc a sa propre grille adapté à la taille du bloc. Par exemple, si un bloc fait 0.5 sur sa largeur, alors vous pouvez placer deux fois ce bloc sur la largeur.</p>
					<br>
					<p>Chaque bloc a sa propre grille rotative. Un bloc peut être placé selon plusieurs rotations différentes (en général 8).</p>
					<br>
					<p>Possibilité d'importer ses propres blocs à condition qu'ils soient au format .json et compatible avec la librairie three.js, pour cela dans la console, tapez <span style="color:red;" class="shadow">Block.loadGeometryJson(<span style="color:orange;font-style: italic;" class="shadow">path</span>)</span> si vous avez un fichier geometry.json, ou <span style="color:red;" class="shadow">Block.loadObjJson(<span style="color:orange;font-style: italic;" class="shadow">path</span>)</span> si vous avez un fichier 3DObject.json</p>
					<br>
					<h3>Accès au monde virtuel</h3>
					<p>Pour accéder au monde virtuel, appuyez sur le bouton <a class="btn"><i class="fa-solid fa-play"></i></a> en haut à gauche dans la barre de navigation</p>

				</div>

			</div>

			<div class="blockPost">


				<div class="blockPost-title" >
					<h1>Contrôles Ordinateur</h1>
					<h1> <i class="fa-solid fa-desktop"></i> <i class="fa-solid fa-laptop"></i> ( PC / Mac / MacBook )</h1>
				</div>

				<div class="blockPost-content" >
				
					<p class="leftAligned">Z Q S D : déplacements avant gauche arrière droite</p>
					<p class="leftAligned">SOURIS : rotations caméra</p>
					<p class="leftAligned">O : séléctionner le bloc suivant (par défaut : aucun bloc)</p>
					<p class="leftAligned">M : séléctionner le mode de jeu suivant (par défaut : 'CREATIVE')</p>
					<p class="leftAligned">CLIC GAUCHE : supprimer le bloc visé</p>
					<p class="leftAligned">CLIC DROIT : placer le bloc séléctionné à l'endroit visé</p>
					<p class="leftAligned">ESPACE : sauter - s'envoler/monter (SIMPLE - CREATIVE)</p>
					<p class="leftAligned">SHIFT : . - descendre (SIMPLE - CREATIVE)</p>

				</div>

			</div>

			<div class="blockPost">
				

				<div class="blockPost-title" >
					<h1>❌ Contrôles Mobile </h1>
					<h1><i class="fa-solid fa-mobile-screen"></i> <i class="fa-solid fa-tablet-screen-button"></i> ( Téléphones / Tablettes )</h1>
				</div>
				<div class="blockPost-content" >indisponible</div>


			</div>
			
			<div class="blockPost">
				

				<div class="blockPost-title" >
					<h1>❌ <i class="fa-solid fa-vr-cardboard"></i> Réalité virtuelle</h1>
				</div>
				<div class="blockPost-content" >indisponible</div>
			</div>

			<div class="blockPost">
				

				<div class="blockPost-title" >
					<h1>❌ <i class="fa-solid fa-video"></i> Cam tracker</h1>
				</div>
				<div class="blockPost-content" >indisponible</div>
			</div>

			<div class="blockPost">
				

				<div class="blockPost-title" >
					<h1>❌ <i class="fa-solid fa-globe"></i> Multijoueur</h1>
				</div>
				<div class="blockPost-content" >indisponible</div>
			</div>

			<div class="blockPost">
				

				<div class="blockPost-title" >
					<h1>❌ Metamask / <i class="fa-brands fa-ethereum"></i> Ethereum / NFT </h1>
				</div>
				<div class="blockPost-content" >indisponible</div>
			</div>

			<div class="blockPost">
				<div class="blockPost-arrow"> <i class="fa-solid fa-angle-down"></i> </div>
				<div class="blockPost-title" >title</div>
				<div class="blockPost-content" >content</div>
			</div>



		</div> <!--main end-->
	</div><!--row end-->

	<!-- Footer -->
	<div class="footer">
		<i class="fa-brands fa-google"></i>
		<a href="https://www.instagram.com/gi_le_spatieux/" target="blank"> <i class="fa-brands fa-instagram"></i> </a>
		<i class="fa-brands fa-discord"></i>
		<i class="fa-brands fa-twitter"></i>
		<i class="fa-brands fa-github"></i>
		<a href="https://www.youtube.com/channel/UC3lRCtBb8ssim8FdTqZ-hug"><i class="fa-brands fa-youtube"></i></a>
	</div>
	
	</div><!--welcome end-->
	`;



//https://threejs.org/examples/#webgl_multiple_elements
//https://threejs.org/examples/#webgl_multiple_canvases_circle

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

//======================================================================================================================================
//======================================================================================================================================
//												INITs ET MAINs DE TOUS LES MONDES
//======================================================================================================================================
//======================================================================================================================================

function setWorldsFunc(){

	const hub = World.list['hub'];
	const sandbox = World.list['sandbox'];
	const labo = World.list['labo'];
	const gameLand = World.list['gameLand'];

	//===================================================================
	//						INIT FUNCTIONS
	//===================================================================

	//-------------------------------------------
	//				init hub
	//-------------------------------------------

	hub.initFunc = function(){

		let cube = new THREE.Mesh(geometries.box, materials.white);
		this.sceneWorld.add(cube);
		cube.position.set(0,0,-20);

		new PortalCSS3(0,0,-10,this.sceneCSS3,'<div class="blockPost"> Portal </div>');
		new PortalCSS3(10,0,-10,this.sceneCSS3,pageHome);
	}

	//-------------------------------------------
	//				init sandbox
	//-------------------------------------------

	let water;

	sandbox.initFunc = function (){

		//blockInit(this.id);


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
					//console.error( ' textures/waternormals.jpg not loaded: ', err );				// à remettre
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
							fog: this.sceneWorld.fog !== undefined,
							alpha: 0.7,
						}
					);

		water.material.transparent = true;
		water.rotation.x = - Math.PI / 2;
		water.position.y -= 4.9;

		this.sceneWorld.add( water );

		//player spawn

		const player = this.player.get('guest');

		//Player.list[this.id].setPosition(new THREE.Vector3(0,0,-20))
		player.setPosition(new THREE.Vector3(0,0,-20))

		//ui

		new UI(0,1.0,this.sceneCSS3,this.camerasCSS3.main,'','sandboxInfo').setFunc( ()=>{

			const html =
			'<div class="blockPost">' +
				'<div class="blockPost-title">' +
					'<h1>Golpex version p1.1</h1>' +
				'</div>' +
				'<div class="blockPost-content">' +
					'Mode actuel : ' + Mode.data.current + '<br>' +
					//'Bloc séléctionné : ' + Block.selection[Block.selected] + '<br>' +
					//'Position : ' + Player.list[this.id].position.clone().floor().toArray() + '<br>' +
					//'Position Chunk : ' + Chunk.inChunk(Player.list[this.id]).toArray() + '<br>' +
					'Position : ' + player.position.clone().floor().toArray() + '<br>' +
					'Position Chunk : ' + Chunk.inChunk(player).toArray() + '<br>' +
					'Chunks chargés : ' + Chunk.data.length + '<br>' +
				'</div>' +
			'</div>';
			return html;

		});

		new UI(0,0.8,this.sceneCSS3,this.camerasCSS3.main,'','updateInfo').setFunc( (a)=>{

			if (a[0] === undefined) {return}

			const html = '<div class="btnFastUpdate updateInfo">' + a[0] + '</div>';

			return html;
		})


		new UI(1.0,1.0,this.sceneCSS3,this.camerasCSS3.main,'','fps').setFunc( ()=>{

			const html = '<div class="btnFastUpdate">' + 'fps : ' + fps + '</div>';
			return html;
		});

		//contrôles mobile

		if (isPhone) {
			new UI(0.9,-1.0,this.sceneCSS3,this.camerasCSS3.main,
				`

				<div class="blockPost" id="mobileForward"><i class="fa-solid fa-angle-up"></i></div>
				<div class="blockPost" id="mobileJump">Sauter</div>
				`,
				'mobilePosition'
				);

			new UI(-0.9,-1.0,this.sceneCSS3,this.camerasCSS3.main,
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

	//-------------------------------------------
	//				init labo
	//-------------------------------------------

	labo.initFunc = function (){

		const floor = new THREE.Mesh(
						new THREE.BoxGeometry( 10, 0.5, 10 ),
						materials.white
					);
		floor.receiveShadow = true;
		this.sceneWorld.add( floor );
		floor.position.set(0,-1,-10);

		const cube = new THREE.Mesh( geometries.box, materials.red );
		cube.receiveShadow = true;
		this.sceneWorld.add( cube );
		cube.position.set(0,10,-10);
		cube.rotation.set(1,2,3);

		//physics.addMesh( floor );
		//physics.addMesh( cube, 1 );

		//marching3();

		//ui

		new UI(0,1.0,this.sceneCSS3,this.camerasCSS3.main,'<div class="blockPost">On test des trucs de fous ici</div>','laboInfo');
		new UI(0.5,1.0,this.sceneCSS3,this.camerasCSS3.main,'<div class="blockPost">regarde je fais<br>tourner cette UI</div>','laboCaTourne');
	/*	
		const game1 = new PortalCSS3(-10,-0.2,-10,this.sceneCSS3,gameHTML1);
		game1.object.rotation.set(-Math.PI/2,0,0);
		
		const support1 = new THREE.Mesh(
						new THREE.BoxGeometry( 1, 1, 1 ),
						materials.white
					);
		this.sceneWorld.add( support1 );
		support1.position.set(-10,-0.2-0.5,-10);

		const game2 = new PortalCSS3(-15,-0.2,-10,this.sceneCSS3,gameHTML2);
		game2.object.rotation.set(-Math.PI/2,0,0);
		
		const support2 = new THREE.Mesh(
						new THREE.BoxGeometry( 1, 1, 2 ),
						materials.white
					);
		this.sceneWorld.add( support2 );
		support2.position.set(-15,-0.2-0.5,-10);

	*/
/*
		const box = new THREE.Mesh( geometries.box, materials.red );
		this.scenePhysical.add(box);
		box.position.set(-20,0,0);
*/

	}

	//-------------------------------------------
	//				init gameLand
	//-------------------------------------------

	gameLand.initFunc = function (){

		new PortalCSS3(20,10,-5,this.sceneCSS3,'<div id="gameTest"></div>');

		setTimeout(()=>{

			{
				let camera, controls, scene, renderer;

				init0();
				animate();

				function init0() {

					scene = new THREE.Scene();
					scene.background = new THREE.Color( 0xcccccc );
					scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

					renderer = new THREE.WebGLRenderer( { antialias: true } );
					renderer.setPixelRatio( window.devicePixelRatio );
					renderer.setSize( window.innerWidth, window.innerHeight );
					//document.body.appendChild( renderer.domElement );
					document.getElementById('gameTest').appendChild( renderer.domElement );

					camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
					camera.position.set( 400, 200, 0 );

					// controls

					controls = new THREE.MapControls( camera, renderer.domElement );

					//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

					controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
					controls.dampingFactor = 0.05;

					controls.screenSpacePanning = false;

					controls.minDistance = 100;
					controls.maxDistance = 500;

					controls.maxPolarAngle = Math.PI / 2;

					// world

					const geometry = new THREE.BoxGeometry( 1, 1, 1 );
					geometry.translate( 0, 0.5, 0 );
					const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );

					for ( let i = 0; i < 500; i ++ ) {

						const mesh = new THREE.Mesh( geometry, material );
						mesh.position.x = Math.random() * 1600 - 800;
						mesh.position.y = 0;
						mesh.position.z = Math.random() * 1600 - 800;
						mesh.scale.x = 20;
						mesh.scale.y = Math.random() * 80 + 10;
						mesh.scale.z = 20;
						mesh.updateMatrix();
						mesh.matrixAutoUpdate = false;
						scene.add( mesh );

					}

					// lights

					const dirLight1 = new THREE.DirectionalLight( 0xffffff );
					dirLight1.position.set( 1, 1, 1 );
					scene.add( dirLight1 );

					const dirLight2 = new THREE.DirectionalLight( 0x002288 );
					dirLight2.position.set( - 1, - 1, - 1 );
					scene.add( dirLight2 );

					const ambientLight = new THREE.AmbientLight( 0x222222 );
					scene.add( ambientLight );

					//

					window.addEventListener( 'resize', onWindowResize );

				}

				function onWindowResize() {

					camera.aspect = window.innerWidth / window.innerHeight;
					camera.updateProjectionMatrix();

					renderer.setSize( window.innerWidth, window.innerHeight );

				}

				function animate() {

					requestAnimationFrame( animate );

					controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

					render();

				}

				function render() {

					renderer.render( scene, camera );

				}
			};


			new PortalCSS3(-20,10,-5,this.sceneCSS3,'<iframe frameBorder="0" width="100%" height="100%" style="min-width: 1000px; min-height:1000px" src="https://www.mathcha.io/editor/QYvPyFM8fqNU29gZ1vf9z8qEPsM157WNswvxNxW?embedded=true" ></iframe>');


		},1000);

		initParticle()
		/*
		const center = new THREE.Mesh( geometries.ball, materials.red );
		center.receiveShadow = true;
		this.sceneWorld.add( center );*/

		const f0 = new THREE.Mesh( geometries.ball, materials.formula );
		f0.receiveShadow = true;
		this.sceneWorld.add( f0 );
		f0.scale.multiplyScalar(0.9);
		f0.position.set(0,0,0);
		new PortalCSS3(0,0,0,this.sceneCSS3,'<p class="formulaName" style="font-size : 30px">0</p>');

		const f1 = new THREE.Mesh( geometries.ball, materials.formula );
		f1.receiveShadow = true;
		this.sceneWorld.add( f1 );
		f1.scale.multiplyScalar(0.9);
		f1.position.set(3,0,0);
		new PortalCSS3(3,0,0,this.sceneCSS3,'<p class="formulaName" style="font-size : 30px">0</p>');

		const f2 = new THREE.Mesh( geometries.ball, materials.formula );
		f2.receiveShadow = true;
		this.sceneWorld.add( f2 );
		f2.scale.multiplyScalar(1.9);
		f2.position.set(3,0,0);
		new PortalCSS3(3,1,0,this.sceneCSS3,'<p class="formulaName" style="font-size : 60px">1</p>');

		const f3 = new THREE.Mesh( geometries.ball, materials.formula );
		f3.receiveShadow = true;
		this.sceneWorld.add( f3 );
		f3.scale.multiplyScalar(3.9);
		f3.position.set(1.5,0,0);
		new PortalCSS3(1.5,2,0,this.sceneCSS3,'<p class="formulaName" style="font-size : 120px">2</p>');

		const f4 = new THREE.Mesh( geometries.ball, materials.formula );
		f4.receiveShadow = true;
		this.sceneWorld.add( f4 );
		f4.scale.multiplyScalar(0.9);
		f4.position.set(7,0,0);
		new PortalCSS3(7,0,0,this.sceneCSS3,'<p class="formulaName" style="font-size : 30px">0</p>');

		const f5 = new THREE.Mesh( geometries.ball, materials.formula );
		f5.receiveShadow = true;
		this.sceneWorld.add( f5 );
		f5.scale.multiplyScalar(0.9);
		f5.position.set(10,0,0);
		new PortalCSS3(10,0,0,this.sceneCSS3,'<p class="formulaName" style="font-size : 30px">0</p>');

		const f6 = new THREE.Mesh( geometries.ball, materials.formula );
		f6.receiveShadow = true;
		this.sceneWorld.add( f6 );
		f6.scale.multiplyScalar(1.9);
		f6.position.set(10,0,0);
		new PortalCSS3(10,1,0,this.sceneCSS3,'<p class="formulaName" style="font-size : 60px">1</p>');

		const f7 = new THREE.Mesh( geometries.ball, materials.formula );
		f7.receiveShadow = true;
		this.sceneWorld.add( f7 );
		f7.scale.multiplyScalar(8.9);
		f7.position.set(5,0,0);
		new PortalCSS3(5,5,0,this.sceneCSS3,'<p class="formulaName" style="font-size : 240px">3</p>');



	}
	//===================================================================
	//						MAIN FUNCTIONS
	//===================================================================

	//-------------------------------------------
	//				main sandbox
	//-------------------------------------------

	sandbox.mainFunc = function (){
	
		water.material.uniforms[ 'time' ].value = time / 200.0;

		Chunk.update(time);
		//const player = Player.list[ World.currentId ];
		const player = this.player.get('guest');

		//preVisualBlock(player.camera, this.scenePhysical);
		this.blockManager.preVisualUpdate();

		UI.data.listByName['fps'].updateHTML();



		//on water
		if (player.position.y < (water.position.y + 0.5) && Mode.data.current === 'SIMPLE') {//pas opti de faire comme ça : penser à créer une update
			
			player.onWater = true;
			if (player.position.y < water.position.y) {
				this.sceneWorld.fog.density = 0.02;
				World.list['sandbox'].sceneWorld.fog.color.setHex(0x0000ff);
			}
			
		}
		else{
			this.sceneWorld.fog.density = 0.005;
			World.list['sandbox'].sceneWorld.fog.color.setHex(0xf59542);
			player.onWater = false;
			
		}

		//player.controls.update();	//if mapControls & only required if controls.enableDamping = true, or if controls.autoRotate = true

	}

	//-------------------------------------------
	//				main labo
	//-------------------------------------------

	labo.mainFunc = function (){

		UI.data.listByName['laboCaTourne'].UIrotation.set(time/600,time/1000,time/700);
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
		//effect.update();
	}

	//-------------------------------------------
	//				gameLand labo
	//-------------------------------------------

	gameLand.mainFunc = function (){
		updateParticles();
	}


}

/*
controls = new MapControls( camera, renderer.domElement );

controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
				controls.dampingFactor = 0.05;

				controls.screenSpacePanning = false;

				controls.minDistance = 100;
				controls.maxDistance = 500;

				controls.maxPolarAngle = Math.PI / 2;

// dans main

controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

*/





//utils pour debug

function vect(x,y,z){
	return new THREE.Vector3(x,y,z);
}