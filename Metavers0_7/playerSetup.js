console.log("./playerSetup.js","loaded")

//=================================================================================
//							Player creation

class Player{

	constructor(cameraPlayer = undefined){
		this.debug = false;
		this.camera = cameraPlayer;
		this.position = this.camera.position;
		this.direction = new THREE.Vector3();
		this.velocity = new THREE.Vector3();
		this.collider = new THREE.Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 );;
		this.mesh = null;//createSkeleton(this.debug);
		this.own_light = null;

		this.onFloor = false;
		this.controls = new THREE.PointerLockControls( cameraPlayer, renderer.domElement );
	}

	update(){
		this.camera.getWorldDirection( this.direction );
		//temporaire
		if(this.mesh){
			this.mesh.position.x = this.position.x + 8*this.direction.x;
			this.mesh.position.y = this.position.y + 8*this.direction.y;
			this.mesh.position.z = this.position.z + 8*this.direction.z;
			

			this.mesh.rotation.x = this.camera.rotation.x;
			this.mesh.rotation.y = this.camera.rotation.y;
			this.mesh.rotation.z = this.camera.rotation.z;
		}
		
	}

	loadSkeleton(path, debug) {

		let model = undefined;
		loader.load( path , function ( gltf ) {
		
			
			model = gltf.scene;

			model.scale.x *= 3;
			model.scale.y *= 3;
			model.scale.z *= 3;

			model.position.y += 0.5;

			scene.add( model );
			
			model.traverse( function ( object ) {

				if ( object.isMesh ) {
					object.castShadow = true;
					object.receiveShadow = true;
				}

			});


			if (debug) {
				const helper = new THREE.SkeletonHelper( model );
				scene.add( helper );
			}
		});

		loader.manager.onLoad = function() {
			//console.log("model :",model);
			//console.log(this.mesh);
			this.mesh = model;
			//console.log(this.mesh);

		}

	}
}




_vectUP = new THREE.Vector3( 0, 1, 0 );
_vectDOWN = new THREE.Vector3( 0, -1, 0 );

//const pointer = new THREE.PointerLockControls( camera, renderer.domElement );

const player = new Player(camera);
const pointer = player.controls;

//player.loadSkeleton('./Xbot.glb',true);
//loadSkeleton('./Xbot.glb',true,console.log);


player.collider.translate(_vectUP.clone().multiplyScalar(20));



/*
pointer.addEventListener( 'lock', function () {
	console.log("lock");
} );

pointer.addEventListener( 'unlock', function () {
	console.log("unlock");
} );
*/

if (isPhone) {//https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Multi-touch_interaction

	document.getElementById("forward").addEventListener('touchstart', function(e) {
		keyDownList.touch = true;
	})
	document.getElementById("forward").addEventListener('touchend', function(e) {
		keyDownList.touch = false;
	})
	//-------------------------------------
	document.getElementById("throwball").addEventListener('touchstart', function(e) {
		throwBall();
	})
	//-------------------------------------
	document.getElementById("touchAreaLeft").addEventListener('touchstart', function(e) {
		keyDownList.rotateLeft = true;
	})
	document.getElementById("touchAreaLeft").addEventListener('touchend', function(e) {
		keyDownList.rotateLeft = false;
	})
	//-------------------------------------
	document.getElementById("touchAreaRight").addEventListener('touchstart', function(e) {
		keyDownList.rotateRight = true;
	})
	document.getElementById("touchAreaRight").addEventListener('touchend', function(e) {
		keyDownList.rotateRight = false;
	})
	//-------------------------------------
	document.getElementById("touchAreaMiddle").addEventListener('touchstart', function(e) {
		keyDownList.touchJump = true;
	})
	document.getElementById("touchAreaMiddle").addEventListener('touchend', function(e) {
		keyDownList.touchJump = false;
	})
	//-------------------------------------

}

document.addEventListener( 'mouseup', () => {

	if ( document.pointerLockElement !== null && isPhone === false) {
		
		//console.log(playerSwitch,playerMode[playerSwitch])

		switch(playerMode[playerSwitch]){
			case 'destroy':
				destroyMatter();
				break;
			case 'shoot':
				throwBall();
				break;
			case 'build':
				addMatter();
				break;
			case 'build2' :
				addMatter2();
				break;
			case 'block' :
				buildBlock();
				break;
			case 'remove':
			//temp
				raycastUpdate()[0].object.removeFromParent();//purement visuel // collision non suppr et mesh existant
				break;
			default :
				break;
		}
	};

} );

/*
	const keyDownList = {
		"z" : false,
		"q" : false,
		"s" : false,
		"d" : false,
		" " : false,
		"Control" : false,
		"Shift" : false,
		"touch" : false,
		"rotateLeft" : false,
		"rotateRight" : false,
		"touchJump" : false,
	}*/

const keyDownList = {
	"90" : false,//z Z
	"81" : false,//q Q
	"83" : false,//s S
	"68" : false,//d D
	"32" : false,//space
	"17" : false,//ctrl
	"16" : false,//shift
	"79" : false,//o O
	"touch" : false,
	"rotateLeft" : false,
	"rotateRight" : false,
	"touchJump" : false,
}



	function key_action(key){
		const speedDelta = 0.05/*deltaTime*/ * ( player.onFloor ? 25 : 8 );
		//console.log(key)

		switch (key) {
			//case 'z':
			case '90':
				//console.log("avancer");
				//pointer.moveForward(1);
				player.velocity.add( getForwardVector().multiplyScalar( speedDelta ) );
				break;
			//case 'q':
			case '81':
				//console.log("gauche");
				//pointer.moveRight(-1);
				player.velocity.add( getSideVector().multiplyScalar( - speedDelta ) );
				break;
			//case 's':
			case '83':
				//console.log("reculer");
				//pointer.moveForward(-1);
				player.velocity.add( getForwardVector().multiplyScalar( - speedDelta ) );
				break;
			//case 'd':
			case '68':
				//console.log("droite");
				//pointer.moveRight(1);
				player.velocity.add( getSideVector().multiplyScalar( speedDelta ) );
				break;
			//case ' ':
			case '32':
				//console.log("haut");
				//player.camera.position.y += 1;
				player.collider.translate(_vectUP);

				break;
			//case 'Shift':
			case '16':
				//console.log("bas");
				//player.camera.position.y += -1;
				player.collider.translate(_vectDOWN);
				break;
			/*case '79':
				console.log(playerSwitch)
				playerSwitch = (playerSwitch + 1) % playerMode.length;
				break;*/

			case 'touch':
				player.velocity.add( getForwardVector().multiplyScalar( speedDelta ) );
				break;
			case 'rotateLeft':
				player.camera.rotation.y += 0.1;
				break;
			case 'rotateRight':
				player.camera.rotation.y += -0.1;
				break;
			
			case 'touchJump':
				player.collider.translate(_vectUP);
				break;
			


			default:
				break;
				}
	}

	function update_movement(){
		for (e in keyDownList) {
			if (keyDownList[e]) {
				key_action(e)
			}
		}
	}


	document.addEventListener('keydown' , (e)=>{
		
		//Optimisation de la gestion des touches : Créer une liste de touches
		//Pour pouvoir se déplacer dans deux directions simultanément
		//keyDownList[e.key] = true;
		keyDownList[e.keyCode] = true; // permet l'appui touche long
		//console.log(e.keyCode)

		if (e.keyCode === 79) { // permet l'appui touche unique
			playerSwitch = (playerSwitch + 1) % playerMode.length;
		}
	})

	document.addEventListener('keyup' , (e)=>{

		//console.log(e);
		//keyDownList[e.key] = false;
		keyDownList[e.keyCode] = false;
	})








const clock = new THREE.Clock();