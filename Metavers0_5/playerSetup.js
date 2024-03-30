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

	


	/*
	timeStampInit = 0

	function handle_one_touch(e){
		console.log(e)
		//console.log(e.touches[0].clientX/devicePixelRatio,e.touches[0].clientY/devicePixelRatio);
		//console.log(e.touches[0].clientX,e.touches[0].clientY,devicePixelRatio);

		// mauvaise normalisation, le maximum n'est pas 1 (dépend du téléphone)

		const w = 2 * e.touches[0].clientX / screen.width - 1;//[0,1] => [-1,1]
		const h = 2 * e.touches[0].clientY / screen.height - 1;//[0,1] => [-1,1]

		const speedDelta_ = 0.5 * ( player.onFloor ? 25 : 8 );


		//console.log( e.timeStamp - timeStampInit );
		//Système temporaire
		if( e.timeStamp - timeStampInit <= 250 ){
			//console.log("dbc");
			//player.camera.rotation.x += h*0.2;
			player.camera.rotation.y += -w*0.2;
			//player.camera.rotation.z += h*0.2;
			//console.log(player.camera.roation);
		}
		else{
			//console.log("sc");
			

			player.velocity.add( getForwardVector().multiplyScalar( -h*speedDelta_ ) );
			player.velocity.add( getSideVector().multiplyScalar( w*speedDelta_ ) );
		}
		timeStampInit  = e.timeStamp;


		
		
	}

	function handle_two_touch(e){
		throwBall();
	}
	function handle_three_touch(e){
		throwBall();
	}

	document.addEventListener('touchstart', function(e) {
			// Invoke the appropriate handler depending on the
			// number of touch points.
			
			switch (e.touches.length) {
				case 1: handle_one_touch(e); break;
				case 2: handle_two_touches(e); break;
				case 3: handle_three_touches(e); break;
				default: console.log("Not supported"); break;
			}
	}, false);
	*/
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

	if ( document.pointerLockElement !== null && isPhone === false) throwBall();

} );


	const keyDownList = {
		"z" : false,
		"q" : false,
		"s" : false,
		"d" : false,
		" " : false,
		"Control" : false,
		"touch" : false,
		"rotateLeft" : false,
		"rotateRight" : false,
		"touchJump" : false,
	}





	function key_action(key){
		const speedDelta = 0.05/*deltaTime*/ * ( player.onFloor ? 25 : 8 );
		//console.log(key)

		switch (key) {
			case 'z':
				//console.log("avancer");
				//pointer.moveForward(1);
				player.velocity.add( getForwardVector().multiplyScalar( speedDelta ) );
				break;
			case 'q':
				//console.log("gauche");
				//pointer.moveRight(-1);
				player.velocity.add( getSideVector().multiplyScalar( - speedDelta ) );
				break;
			case 's':
				//console.log("reculer");
				//pointer.moveForward(-1);
				player.velocity.add( getForwardVector().multiplyScalar( - speedDelta ) );
				break;
			case 'd':
				//console.log("droite");
				//pointer.moveRight(1);
				player.velocity.add( getSideVector().multiplyScalar( speedDelta ) );
				break;
			case ' ':
				//console.log("haut");
				//player.camera.position.y += 1;
				player.collider.translate(_vectUP);

				break;
			case 'Control':
				//console.log("bas");
				//player.camera.position.y += -1;
				player.collider.translate(_vectDOWN);
				break;

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
		keyDownList[e.key] = true;
		//console.log(e)
	})

	document.addEventListener('keyup' , (e)=>{

		//console.log(e);
		keyDownList[e.key] = false;
	})








const clock = new THREE.Clock();