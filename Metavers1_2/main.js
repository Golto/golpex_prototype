console.warn("main.js loaded");
// https://www.compart.com/fr/unicode/U+2705

let deltaTime = 0.05;
let time = 0;
let fps;


function init(id){

	const hub = new World('hub');
	const sandbox = new World('sandbox');
	const labo = new World('labo');
	const gameLand = new World('gameLand');

	setWorldsFunc();

	hub.init();
	sandbox.init();
	labo.init();
	gameLand.init();

	World.goTo(id);

	//init UI widget

	UI.data.listByName['sandboxInfo'].updateHTML();

	requestAnimationFrame(main);




	
}

function main(){
	time++;

	requestAnimationFrame(main);

	// dt & fps

	deltaTime = Math.min( 0.2/*0.05*/, clock.getDelta() ) / STEPS_PER_FRAME;
	if (time % 20 === 0 ) {
		fps = Math.floor(1/deltaTime/STEPS_PER_FRAME);
	}

	// UI

	for(let el of UI.data.list){
		el.update(time);
	}

	//worlds update

	const id = World.currentId;

	if (id !== 'welcome'){
		World.list[id].main()
	}

	
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

/*
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

	//effect.reset();
	effect.addBall(0.5,0.5,0.5, 0.5,10);

	World.list['labo'].sceneWorld.add( effect );
}
*/