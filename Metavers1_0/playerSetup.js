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
	for (e in keyDownList) {
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