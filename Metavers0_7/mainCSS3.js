//scene css3d
let scene = new THREE.Scene();
let aspect = window.innerWidth/window.innerHeight;
let camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
camera.position.set(0,0,1000);

let renderer = new THREE.CSS3DRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//scene classic
let scene2 = new THREE.Scene();
let camera2 = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
camera2.position.set(0,0,1);

let renderer2 = new THREE.WebGLRenderer();
renderer2.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer2.domElement);
//------------------
let boxgeo = new THREE.BoxGeometry(1,1,1);
let boxmat = new THREE.MeshPhongMaterial( {color: 0xff0000} );
let cube = new THREE.Mesh(boxgeo, boxmat);
scene2.add(cube);

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set(2,1,3);
scene2.add( directionalLight );
//------------------
let el = document.createElement('div');
el.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/uKqC5uHjE4g" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
let obj = new THREE.CSS3DObject(el);
obj.position.set(0,0,1000*0.5)
scene.add(obj);

let n = 0;
let speed = 1
function update(){
	n += 1;
	renderer.render(scene, camera);
	renderer2.render(scene2, camera2);
	requestAnimationFrame(update);

	//obj.position.x = -200 + 100*Math.sin(n/100);
	//obj.rotation.y += 0.01;

	//camera2.position.z = 2 + .5*Math.cos(n/1000)
	//camera.position.z = (2 + .5*Math.cos(n/1000))*1000

	//camera2.position.x = 0 + 1*Math.sin(n/1000)
	//camera.position.x = (0 + 1*Math.sin(n/1000))*1000
}
update();