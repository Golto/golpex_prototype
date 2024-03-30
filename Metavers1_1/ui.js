console.warn("ui.js loaded");


class UI{

	static data = {
		list: [],
		listByName: {}, //may contain duplicate keys, and therefore this list could be not complete
	};

	static buffer = new THREE.Vector3();	//utilisé pour les vecteurs temporaires

	constructor(x,y,sceneCSS3,cameraCSS3,html = '',name = '',){

		this.sceneCSS3 = sceneCSS3;
		this.cameraCSS3 = cameraCSS3;

		this.element = document.createElement('div');
		this.element.innerHTML = html;

		this.profile = new THREE.CSS3DObject(this.element);
		this.sceneCSS3.add(this.profile);

		this.UIposition = new THREE.Vector2(x,y);
		this.UIrotation = new THREE.Vector3(0,0,0);

		UI.data.list.push(this);

		this.name = name;
		UI.data.listByName[this.name] = this;

		this.Func = ()=>{return false};

	}


	update(time){
		const forward = forwardVector(this.cameraCSS3);
		const side = sideVector(this.cameraCSS3);
		const up = upVector(this.cameraCSS3);

		UI.buffer.set(0,0,0);
		UI.buffer.addScaledVector( forward, 1 )
		UI.buffer.addScaledVector( side, this.UIposition.x / window.innerHeight * window.innerWidth * 0.5);  // à changer, mettre aspect sur y et enlever 0.5
		UI.buffer.addScaledVector( up, this.UIposition.y * 0.5); // 0.5 / 1.5 : magic numbers for fov
		UI.buffer.normalize();


		this.profile.position.copy(this.cameraCSS3.position);

		this.profile.position.addScaledVector(UI.buffer, CSS3WorldRatio*10);

		this.profile.rotation.copy(this.cameraCSS3.rotation);

		this.profile.rotateX(this.UIrotation.x);
		this.profile.rotateY(this.UIrotation.y);
		this.profile.rotateZ(this.UIrotation.z);
	}

	setFunc(f){
		this.Func = f;
	}

	updateHTML(){
		this.element.innerHTML = this.Func(arguments);
	}
}


function uiInit(){
	const sandbox = World.list['sandbox'];
	const hub = World.list['hub'];
	const labo = World.list['labo'];
/*
	new UI(0,0,sandbox.sceneCSS3,sandbox.camerasCSS3.main,'❌','sandboxCross');
	new UI(0,0,hub.sceneCSS3,hub.camerasCSS3.main,'❌','hubCross');
	new UI(0,0,labo.sceneCSS3,labo.camerasCSS3.main,'❌','laboCross');
*/
/*
	new UI(0,1.0,sandbox.sceneCSS3,sandbox.camerasCSS3.main,'','sandboxInfo').setFunc( ()=>{

			const html =
			'<div class="blockPost">' +
				'<div class="blockPost-title">' +
					'<h1>Golpex version p1.0</h1>' +
				'</div>' +
				'<div class="blockPost-content">' +
					'Mode actuel : ' + Mode.data.current + '<br>' +
					'Bloc séléctionné : ' + Block.selection[Block.selected] + '<br>' +
					'Position : ' + Player.list['sandbox'].position.clone().floor().toArray() + '<br>' +
					'Position Chunk : ' + Chunk.inChunk(Player.list['sandbox']).toArray() + '<br>' +
					'Chunks chargés : ' + Chunk.data.length + '<br>' +
				'</div>' +
			'</div>';
			return html;

	})
	*/
/*
	new UI(0,0.8,sandbox.sceneCSS3,sandbox.camerasCSS3.main,'','updateInfo').setFunc( (a)=>{

		if (a[0] === undefined) {return}

		const html = '<div class="btnFastUpdate updateInfo">' + a[0] + '</div>';

		return html;
	})


	new UI(1.0,1.0,sandbox.sceneCSS3,sandbox.camerasCSS3.main,'','fps').setFunc( ()=>{

		const html = '<div class="btnFastUpdate">' + 'fps : ' + fps + '</div>';
		return html;
	});
*/
	//const menu = new UI(-1.0,0,'<div class="blockPost">test</div><div class="blockPost">essai</div>');
	//menu.UIrotation.set(0,1.5,0);
	//const inventory = new UI(0,-1.0,sandbox.sceneCSS3,sandbox.camerasCSS3.main,'<div class="blockPost"><i class="fa-solid fa-angle-up"></i></div>');
	//const testUI = new UI(-0.5,0,pageExample);
	//const biomeIMG = new UI(0.5,0, '<img src="http://www.ultimatepronoun.com/images/minecraft/biomes_array.png" />')
	//const biomeIMG = new UI(0.5,0, '<img src="http://www.ultimatepronoun.com/images/minecraft/biomes.png" />')
	//https://preview.redd.it/oq4j2n2r0rs51.png?width=640&crop=smart&auto=webp&s=0b63b6796b91c5a260e804e351bfe87b44654669

/*
	new UI(0,1.0,labo.sceneCSS3,labo.camerasCSS3.main,'<div class="blockPost">On test des trucs de fous ici</div>','laboInfo');
	new UI(0.5,1.0,labo.sceneCSS3,labo.camerasCSS3.main,'<div class="blockPost">regarde je fais<br>tourner cette UI</div>','laboCaTourne');
	*/
/*
	//retour
	new UI(-1.0,1.0,
		sandbox.sceneCSS3,
		sandbox.camerasCSS3.main,
		'<a class="blockPost" onclick="goBack(\'sandbox\')"><i class="fa-solid fa-arrow-left"></i></a>',
		'sandboxBack',
		);
	new UI(-1.0,1.0,
		hub.sceneCSS3,
		hub.camerasCSS3.main,
		'<a class="blockPost" onclick="goBack(\'hub\')"><i class="fa-solid fa-arrow-left"></i></a>',//rajouter un pointer.unlock
		'hubBack',
		);
	new UI(-1.0,1.0,
		labo.sceneCSS3,
		labo.camerasCSS3.main,
		'<a class="blockPost" onclick="goBack(\'labo\')"><i class="fa-solid fa-arrow-left"></i></a>',//rajouter un pointer.unlock
		'laboBack',
		);
*/
	//contrôles mobile
/*
	if (isPhone) {
		new UI(0.9,-1.0,sandbox.sceneCSS3,sandbox.camerasCSS3.main,
			`

			<div class="blockPost" id="mobileForward"><i class="fa-solid fa-angle-up"></i></div>
			<div class="blockPost" id="mobileJump">Sauter</div>
			`,
			'mobilePosition'
			);

		new UI(-0.9,-1.0,sandbox.sceneCSS3,sandbox.camerasCSS3.main,
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
	}*/
}

function goBack(id){
//bricole pour pouvoir unlock 10ms plus tard / sinon controls.unlock() s'éxécute avant le controls.lock() de document.getElementById(id).onclick
//si lag => possibilité de rester en lock()
	setTimeout(()=>{
		Mode.set('CREATIVE');	//temporaire en attendant d'avoir un mode pour chaque player
		World.goTo('welcome');
		//Player.list[id].controls.unlock();
		const player = World.list[id].player.get('guest');
		if( player.controlType === 'pointer'){
			player.controls.unlock();
		}
		
	},10);
}

class PortalCSS3{

	constructor(x,y,z,sceneCSS3,html=''){

		//CSS3Renderer

		this.sceneCSS3 = sceneCSS3;

		this.position = new THREE.Vector3(x,y,z);
		this.element = document.createElement('div');
		this.element.innerHTML = html;
		this.object = new THREE.CSS3DObject(this.element);
		this.sceneCSS3.add(this.object);
		this.object.position.copy(this.position).multiplyScalar(CSS3WorldRatio);

		//worldRenderer
		this.box = this.boxInit(); // pour détecter si utilisateur en contact avec portalcss3 (intersect())
	}

	boxInit(){
		const dim = this.element.getBoundingClientRect();
		//incomplet

	}
	
}
/*
function portalCSS3Init(){
	console.log('test')

	const sandbox = World.list['sandbox'];
	const hub = World.list['hub'];
	const labo = World.list['labo'];
	
	new PortalCSS3(0,0,-10,hub.sceneCSS3,'<div class="blockPost"> Portal </div>');

}*/