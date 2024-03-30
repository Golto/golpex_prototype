/*
Pour du offline :
Utiliser :
	https://threejs.org/examples/js/controls/FirstPersonControls.js

plutôt que :
	https://threejs.org/examples/jsm/controls/FirstPersonControls.js
*/


/*
function salutation(name) {
  alert('Bonjour ' + name);
}

function processUserInput(callback) {
  var name = prompt('Entrez votre nom.');
  callback(name);
}

processUserInput(salutation);
*/

//=================================================================================
//							Scene Decoration Creation
/*cf : 
https://github.com/mrdoob/three.js/blob/master/examples/games_fps.html
https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain.html#L104
*/

//=================================================================================
//							window resize
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	//player.handleResize();
}
window.addEventListener( 'resize', onWindowResize );
//=================================================================================
//							Animate
let n = 0;
let chk_N = 1

const group__init = new THREE.Group();
const geo__init = new THREE.BoxGeometry(1,1,1);
const mat__init = new THREE.MeshPhongMaterial();
const box__init = new THREE.Mesh( geo__init, mat__init );
group__init.add(box__init);
scene.add(group__init);
worldOctree.fromGraphNode( group__init );

const light = gen_DirectionalLight_object(3,10,5,16);
const lightInclin = new THREE.Vector3( 3, 10, 5 );


//=================================================================================
//							MAIN INIT

function main_init() {
	//infoText.innerHTML = 0;


	requestAnimationFrame( main_update );
	
	
	genChunkInit()
	gen_AmbientLight();

	
	//genInit();

	render_chunks([0,0,0],[0,0,1]);

	//forcing pour charger les chunks à l'apparition de player : à suppr
	//Modif is_chunk_update pour détécter quand undefined != array

	if(isPhone){
		drawTriangle();
		document.getElementById("renderDiv").onclick="";

	}else{
		document.getElementById("throwball").remove()
		document.getElementById("forward").remove()

		document.getElementById("touchAreaLeft").remove()
		document.getElementById("touchAreaRight").remove()
		document.getElementById("touchAreaMiddle").remove()
	}
	document.getElementById("loading").remove()
	

}

//=================================================================================
//							MAIN UPDATE

function main_update() {
	n += 1;

	requestAnimationFrame( main_update );

	
	//custom updates
	update_chunk()
	update_movement()
/*
	light.position.set(
		3 + player.position.x,
		10 + player.position.y,
		5 + player.position.z,
		);
	light.target.position.set(
		0.0 + player.position.x,
		0.0 + player.position.y,
		0.0 + player.position.z,
		)*/
	move_DirectionalLight_object(light, player.position, lightInclin)

	//A SUPPR
	//readTextFile("./database.db");
	
	player.update()

	
	if (n%300===0){
		//update_chunk()
		
		//console.log(player.position)
		//console.log(player.camera.position)
		//console.log(player.collider.end)

		//console.log("player cam posi",player.camera.position);
		//console.log("player position",player.position);
		//console.log("player collider",player.collider.end);
		//console.log(camera.position, playerCollider.end)
	}
	const deltaTime = Math.min( 0.05, clock.getDelta() ) / STEPS_PER_FRAME;

				// we look for collisions in substeps to mitigate the risk of
				// an object traversing another too quickly for detection.

				for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {

					//controls( deltaTime );

					updatePlayer( deltaTime );

					updateSpheres( deltaTime );

					teleportPlayerIfOob();

				}


	if(isPhone){
		const test = window.innerWidth / window.innerHeight * 20 + "%";
		document.getElementById("throwball").style.height = test;
		document.getElementById("forward").style.height = test;

		if(window.innerWidth / window.innerHeight >= 1){
			document.getElementById("info").style.fontSize = "calc(100vw / 30)";
		}else{
			document.getElementById("info").style.fontSize = "calc(100vw / 10)";
		}
	}


	
	renderer.render( scene, camera );
}

function drawTriangle() {
  var canevas = document.getElementById('forward');
  if (canevas.getContext) {
    var ctx = canevas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(150, 50);
    ctx.lineTo(110, 100);
    ctx.lineTo(190, 100);
    ctx.fill();
  }
}

//document.getElementById("twrowball").style.width = window.innerWidth / window.innerHeight * 10 + "%";

main_init()