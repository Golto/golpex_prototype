console.warn("playerSetup.js loaded");

class Player{

	static colliderStart = new THREE.Vector3( 0, -1, 0 );
	static colliderEnd = new THREE.Vector3( 0, 0, 0 );

	//static list = {};

	//controlType can be "pointer", "map"
	constructor(id = "none",controlType = "pointer"){
		this.debug = false;

		this.world = World.list[id];
		this.camera = this.world.cameras.main;

		this.position = new THREE.Vector3();
		this.direction = new THREE.Vector3();
		this.velocity = new THREE.Vector3();
		this.gravity = new THREE.Vector3(0,-20,0);
		this.forceJump = 1;
		this.collider = new THREE.Capsule( Player.colliderStart, Player.colliderEnd, 0.35 );
		this.mesh = new THREE.Mesh(geometries.ball, materials.metal);
		this.world.sceneWorld.add(this.mesh);
		this.light = this.setLight();

		this.onFloor = false;
		this.onWater = false;
		this.crouching = false;
		this.mode = "CREATIVE";

		this.controlType = controlType;
		switch (this.controlType) {
			case "pointer":
				this.controls = new THREE.PointerLockControls( this.camera, this.world.rendererWorld.domElement );
			break;

			case "map":
			
				this.controls = new THREE.MapControls( this.camera, this.world.rendererWorld.domElement );
				this.controls.enableDamping = true;
				this.controls.screenSpacePanning = false;
				//this.controls.minDistance = 100;
				//this.controls.maxDistance = 500;

				this.controls.maxPolarAngle = Math.PI / 2;
			break;
		}
		//this.controls = new THREE.PointerLockControls( camera, this.renderer.domElement );
		//this.controls = new THREE.MapControls( camera, this.renderer.domElement );

		this.clickActions = this.clickActionsInit();
		this.instantActions = this.instantActionsInit();
		this.longActions = this.longActionsInit();
	}

	//---------------------------------------------

	//click Actions ---------------------------

	clickActionsInit(){

		const map = new Map();
		//evt.button
		//left click
		map.set(0,()=>{
			//console.log('left click')
			if (World.currentId === 'sandbox') {
				World.list.sandbox.blockManager.remove();
			}
		})
		//middle click
		map.set(1,()=>{
			console.log('middle click')
		})
		//right click
		map.set(2,()=>{
			//console.log('right click')
			if (World.currentId === 'sandbox') {
				World.list.sandbox.blockManager.place();
			}
		})

		return map;

	}

	//instant Actions ---------------------------

	instantActionsInit(){

		const map = new Map();
		//evt.keycode
		//m M
		map.set(77,()=>{
			//console.log('mode');
			Mode.next()
			const html77 = 'nouveau mode : ' + Mode.data.current;
			UI.data.listByName['updateInfo'].updateHTML(html77);

		})
		//o O
		map.set(79,()=>{
			console.log('block');

			const html79 = 'bloc séléctionné : ' + Block.selection[Block.selected];
			UI.data.listByName['updateInfo'].updateHTML(html79);

		})

		return map;
	}

	//long Actions ---------------------------

	longActionsInit(){

		const map = new Map();
		//evt.keycode
		//z Z
		map.set('90', ()=>{
			//console.log('avancer');

			if (Mode.data.isAirControl || this.onFloor || this.onWater) {
				this.moveForward( deltaTime * Mode.data.speed );
			}
		});
		//q Q
		map.set('81', ()=>{
			//console.log('gauche');

			if (Mode.data.isAirControl || this.onFloor || this.onWater) {
				this.moveSideway( -deltaTime * Mode.data.speed );
			}

		});
		//s S
		map.set('83', ()=>{
			//console.log('reculer');

			if (Mode.data.isAirControl || this.onFloor || this.onWater) {
				this.moveForward( -deltaTime * Mode.data.speed );
			}

		});
		//d D
		map.set('68', ()=>{
			//console.log('droite');

			if (Mode.data.isAirControl || this.onFloor || this.onWater) {
				this.moveSideway( deltaTime * Mode.data.speed );
			}

		});
		//space
		map.set('32', ()=>{
			//console.log('monter');

			Mode.data.moveUp(deltaTime);

		});
		//ctrl
		map.set('17', ()=>{
			console.log('ctrl');
		});
		//shift
		map.set('16', ()=>{
			//console.log('descendre');

			Mode.data.moveDown(deltaTime);

		});

		return map;
	}

	//---------------------------------------------

	get forwardVector(){

		const v = new THREE.Vector3();
		this.camera.getWorldDirection( v );
		v.y = 0;
		v.normalize();

		return v;
	}

	get sideVector(){

		const v = new THREE.Vector3();
		this.camera.getWorldDirection( v );
		v.y = 0;
		v.normalize();
		v.cross( this.camera.up );

		return v;
	}

	get upVector(){

		const v = new THREE.Vector3();
		v.copy(this.camera.up)

		return v;
	}

	updateOnce(){
		this.camera.getWorldPosition( this.position );
		this.mesh.position.copy(this.position);
		this.collider.start = this.position.clone().add(Player.colliderStart);
		this.collider.end = this.position.clone().add(Player.colliderEnd);
		//this.collider.translate(this.position);
	}

	moveForward(speed){
		const modifier = (this.onWater && Mode.data.current === 'SIMPLE') ? 0.4 : 1;
		this.velocity.add( this.forwardVector.multiplyScalar( speed * modifier ) );
		this.updateOnce();
	}

	moveSideway(speed){
		const modifier = (this.onWater && Mode.data.current === 'SIMPLE') ? 0.4 : 1;
		this.velocity.add( this.sideVector.multiplyScalar( speed * modifier ) );
		this.updateOnce();
	}
	
	moveUp(speed){
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

		this.world.sceneWorld.add( light );

		light.target = new THREE.Object3D();
		this.world.sceneWorld.add(light.target);

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

		//const player = Player.list['sandbox']
		const player = World.list[World.currentId].player.get('guest');

		const result = this.world.worldOctree.capsuleIntersect( this.collider );

		this.onFloor = false;

		if ( result ) {

			this.onFloor = result.normal.y > 0;

			if ( ! player.onFloor ) {
				
				this.velocity.addScaledVector( result.normal, - result.normal.dot( this.velocity ) );

			}

			this.camera.position.add( result.normal.multiplyScalar( result.depth ) )
		}
	}

	activeKeys(){
		for (let e in keyDownList) {
			if (keyDownList[e] && this.longActions.has(e)) {
				this.longActions.get(e)();
			}
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
		
		if (this.world.worldOctree.subTrees.length > 0) {
			this.collision();
		}
		

		this.updateOnce();
		this.updateLight()
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

//OBSOLETE
function keyAction(key){

	//const player = Player.list[ World.currentId ];
	const player = World.list[ World.currentId ].player.get('guest');

	switch (key) {
		//case 'z':
		case '90':

			if (Mode.data.isAirControl || player.onFloor || player.onWater) {
				player.moveForward( deltaTime * Mode.data.speed );
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
				player.moveForward( -deltaTime * Mode.data.speed );
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
				player.moveForward( deltaTime * Mode.data.speed );
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

//OBSOLETE
function updateActiveKeys(){
	for (e in keyDownList) {
		if (keyDownList[e]) {
			keyAction(e);

			//World.list[ World.currentId ].player.get('guest').keyAction(e);
		}
	}
}



document.addEventListener( 'mousedown', (e) => {

	if ( document.pointerLockElement !== null && !isPhone) {
		World.list[World.currentId].player.get('guest').clickActions.get(e.button)();
		/*
		switch (e.button) {
			case 0:
				World.list[World.currentId].player.get('guest').
				//Block.remove()
				if (World.currentId === 'sandbox') {
					World.list.sandbox.blockManager.remove();
				}
				break;
			case 2:
				//Block.put()
				if (World.currentId === 'sandbox') {
					World.list.sandbox.blockManager.place();
				}
				break;

			default:
				break;
		};*/
	}
});


document.addEventListener('keydown' , (e)=>{
	keyDownList[e.keyCode] = true;

	const instantActions = World.list[World.currentId].player.get('guest').instantActions
	if (instantActions.has(e.keyCode)) {
		instantActions.get(e.keyCode)();
	}

	const info = UI.data.listByName['sandboxInfo'];
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

		//Player.list['sandbox'].mode = newMode;
		//World.list.sandbox.player.get('guest').mode = newMode;

		//const player = Player.list[ World.currentId ];
		if (World.currentId === 'welcome') {return}
		const player = World.list[ World.currentId ].player.get('guest');
		player.mode = newMode;

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


class ControlsManager{
	constructor(){
		;
	}
}