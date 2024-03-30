console.log("./skeleton.js","loaded")

function createSkeleton(debug = false){

	const bones = [];

	const center = new THREE.Bone();
	const shoulderL = new THREE.Bone();
	const elbowL = new THREE.Bone();
	const handL = new THREE.Bone();
	const shoulderR = new THREE.Bone();
	const elbowR = new THREE.Bone();
	const handR = new THREE.Bone();

	center.add( shoulderL );
	center.add( shoulderR );
	shoulderL.add( elbowL );
	shoulderR.add( elbowR );
	elbowL.add( handL );
	elbowR.add( handR );

	bones.push( center );
	bones.push( shoulderL );
	bones.push( elbowL );
	bones.push( handL );
	bones.push( shoulderR );
	bones.push( elbowR );
	bones.push( handR );

	center.position.set(0,0,0);
	shoulderL.position.set(-2,1,0);
	elbowL.position.set(-1,-2,0);
	handL.position.set(0,-2,0);
	shoulderR.position.set(2,1,0);
	elbowR.position.set(1,-2,0);
	handR.position.set(0,-2,0);

	const arms = new THREE.Skeleton( bones );

	const geometry = new THREE.BoxGeometry( 1, 1, 1 );
	const material = new THREE.MeshBasicMaterial({ color: 0x90d090 , side : THREE.DoubleSide });
	const mesh = new THREE.SkinnedMesh( geometry, material );

	mesh.add( arms.bones[ 0 ] );

	mesh.bind( arms );
	scene.add(mesh);

	if (debug) {
		const helper = new THREE.SkeletonHelper( mesh );
		scene.add( helper );
	}

	return(mesh);
	

}


/*
async function loadSkeleton(debug = false, path = undefined){
	//'./Xbot.glb'
	let success = false;
	
	
	
		const loader = new THREE.GLTFLoader();//			PENSER A DEPLACER DANS UNE INSTANCE PLUS HAUTE
		console.log(loader)

		
		const mesh = loader.load( path , function ( gltf ) {
		
			
			model = gltf.scene;



			model.scale.x *= 2;
			model.scale.y *= 2;
			model.scale.z *= 2;

			model.position.y += 12.5;
			model.position.z += -5;

		

			scene.add( model );
			
			model.traverse( function ( object ) {

				if ( object.isMesh ) {
					object.castShadow = true;
					object.receiveShadow = true;
				}

			} );




			
			if (debug) {
				const helper = new THREE.SkeletonHelper( model );
				scene.add( helper );
			}
			success = true;


			
			return(model);
		});


		return( setTimeout( function (){
			
			if(!success){
				console.log(path,"non chargé : squelette par défaut");
				return( createSkeleton(debug) );
			}
			else{
				console.log(path,"chargé");
				return( mesh );
			}
		} , 10000 ) );



	

}

*/
/*
const testWAit = loadSkeleton(true,'./Xbot.glb');
console.log( testWAit );
*/




/*
function myDisplayer(some) {
  document.getElementById("demo").innerHTML = some;
}

function getFile(myCallback) {
  let req = new XMLHttpRequest();
  req.open('GET', "mycar.html");
  req.onload = function() {
    if (req.status == 200) {
      myCallback(this.responseText);
    } else {
      myCallback("Error: " + req.status);
    }
  }
  req.send();
}

getFile(myDisplayer);
*/




function loadSkeleton(path, debug, callback) {


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

			} );




			
			if (debug) {
				const helper = new THREE.SkeletonHelper( model );
				scene.add( helper );
			}
			success = true;

		});

	loader.manager.onLoad = function() {
		//callback(path,"loaded :",model);
		callback(path,"loaded :");
		removeObject(player.mesh);//problème : ne supprime pas helperSkeleton
		

		player.mesh = model;

	}

}

//loadSkeleton('./Xbot.glb',true,console.log);




