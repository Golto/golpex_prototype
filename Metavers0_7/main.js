console.log("./main.js","loaded")

/*
Pour du offline :
Utiliser :
	https://threejs.org/examples/js/controls/FirstPersonControls.js

plutôt que :
	https://threejs.org/examples/jsm/controls/FirstPersonControls.js
*/
//https://github.com/mrdoob/three.js/blob/master/examples/js/renderers/CSS3DRenderer.js

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
//							CONSTANTS INIT

const boxOctree = new THREE.Octree();


const group__init = new THREE.Group();
//const geo__init = new THREE.BoxGeometry(1,1,1);
//const mat__init = new THREE.MeshPhongMaterial();
const box__init = new THREE.Mesh( geometries.box, materials.physical );
box__init.scale.set(5,1,5);
box__init.name = "initBlock"
box__init.position.set(5,10,0)
group__init.add(box__init);
scene.add(group__init);
boxOctree.fromGraphNode( group__init );


newCollisionArea(worldOctree,boxOctree)


const light = gen_DirectionalLight_object(3,100,5,128,0.1);
const lightInclin = new THREE.Vector3( 3, 100, 5 );

const light0 = gen_PointLight_object(0,0,0,4,0.05);


//=================================================================================
//							MAIN INIT

function main_init() {


	requestAnimationFrame( main_update );
	
	
	Chunk.genInitChunks()
	gen_AmbientLight();

	
	//genInit();
	

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

let n = 0;
let time = 0;

function main_update() {

	
	


	requestAnimationFrame( main_update );
	
	n += 1;
	time += 1;
	if (n >= 5) {
		Chunk.genNewChunks()

		n = 0;
	}
	if (time % 3 === 0 ) {
		//testModifMesh(time);

		switch(playerMode[playerSwitch]){
			
			case 'block' :
				//console.log("ee")
				visualBlock.visible = true;
				preVisualBlock();
				break;
			default :
				visualBlock.visible = false;	
				break;
		}
	}
	

	
	//custom updates
	update_chunk()
	update_movement()

	move_DirectionalLight_object(light, player.position, lightInclin);
	move_PointLight_object(light0, player.position);
	
	player.update()

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


	
	renderer.render( globalScene, camera );
	//rendererVideo.render( sceneVideo, camera2)
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

//main_init()
window.onload = main_init;

/*
Faire une liste exhaustive de tous les materials et geometry utilisés, pour éviter d'en créer des identiques (performance)

Faire une liste de N chunks, quand un chunk est chargé et que la liste est pleine, le nouveau chunk remplace le chunk le plus éloigné
*/