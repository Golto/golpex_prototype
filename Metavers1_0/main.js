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

	Player.list['sandbox'].setPosition(new THREE.Vector3(0,0,-20))
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
	resolution = 10;

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
