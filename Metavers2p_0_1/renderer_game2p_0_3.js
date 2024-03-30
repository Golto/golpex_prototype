// https://enable3d.io/examples.html

const GolpexElement = document.getElementById('renderer-game');
const RATIO = 47/50;
/*
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ENABLE3D } from 'https://enable3d.io /lib/enable3d/enable3d.ammoPhysics.0.25.3.min.js';*/
/*
<script src="https://enable3d.io /js/examples.js?ver=1.1.1"></script>
<script src="https://enable3d.io /lib/three.min.js?ver=r130"></script>
<script src="https://enable3d.io /lib/GLTFLoader.js"></script>
<script src="https://enable3d.io /lib/enable3d/enable3d.ammoPhysics.0.25.3.min.js"></script>
<script src="https://enable3d.io /lib/OrbitControls.js"></script>
*/


const { AmmoPhysics, PhysicsLoader } = ENABLE3D

const MainScene = () => {
	const scene = new THREE.Scene()
	scene.background = new THREE.Color(0xf0f0f0)

	const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
	camera.position.set(6, 6, 12)

	const renderer = new THREE.WebGLRenderer()
	renderer.setSize(window.innerWidth * RATIO, window.innerHeight * RATIO)
	GolpexElement.appendChild(renderer.domElement)

	const controls = new THREE.OrbitControls(camera, renderer.domElement)

	scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1))
	scene.add(new THREE.AmbientLight(0x666666))
	const light = new THREE.DirectionalLight(0xdfebff, 1)
	light.position.set(50, 200, 100)
	light.position.multiplyScalar(1.3)

	// initialize physics
	const physics = new AmmoPhysics(scene)
	physics.debug.enable(true)

	// add a ground
	physics.add.ground({ width: 20, height: 20 })

	// add suzanne with physics
	const loader = new THREE.GLTFLoader().load('./model/tree2.glb', function (gltf) {
		const tree2 = gltf.scene.children[2]
		tree2.position.setY(5)

		tree2.traverse(child => {
			if (child.isMesh) {
				child.castShadow = child.receiveShadow = false
				child.material.metalness = 0
				child.material.roughness = 1
			}
		})

		scene.add(tree2)
		physics.add.existing(tree2, { shape: 'convex' })
	})

	const clock = new THREE.Clock()

	const animate = () => {
		// update physics
		physics.update(clock.getDelta() * 1000)
		// update the physics debugger
		physics.updateDebugger()

		renderer.render(scene, camera)
		requestAnimationFrame(animate)
	}
	requestAnimationFrame(animate)
}

PhysicsLoader('https://enable3d.io/lib', () => MainScene())

console.log(`three.js version "${THREE.REVISION}"`)