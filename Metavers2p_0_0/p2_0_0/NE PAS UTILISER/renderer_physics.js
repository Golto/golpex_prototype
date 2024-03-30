


const GolpexElement = document.getElementById('renderer-physics');
//NE PAS UTILISER
const RATIO = 3/5

import * as THREE from 'three';
			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { GolpexPhysics } from './GolpexPhysics.js';
			import Stats from 'three/addons/libs/stats.module.js';

			let camera, scene, renderer, stats;
			let physics, position;

			let boxes, spheres;

			init();

			async function init() {

				physics = await GolpexPhysics();
				position = new THREE.Vector3();
				console.log(physics)
				//

				camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100 );
				camera.position.set( - 1, 1.5, 2 );
				camera.lookAt( 0, 0.5, 0 );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x666666 );

				const hemiLight = new THREE.HemisphereLight();
				hemiLight.intensity = 0.35;
				scene.add( hemiLight );

				const dirLight = new THREE.DirectionalLight();
				dirLight.position.set( 5, 5, 5 );
				dirLight.castShadow = true;
				dirLight.shadow.camera.zoom = 2;
				scene.add( dirLight );

				const floor = new THREE.Mesh(
					new THREE.BoxGeometry( 10, 5, 10 ),
					new THREE.MeshPhysicalMaterial( { color: 0xffffff } )
				);
				floor.position.y = - 2.5;
				floor.receiveShadow = true;
				scene.add( floor );

				//

				const material = new THREE.MeshLambertMaterial();

				const matrix = new THREE.Matrix4();
				const color = new THREE.Color();

				// Boxes

				const geometryBox = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
				boxes = new THREE.InstancedMesh( geometryBox, material, 100 );
				boxes.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
				boxes.castShadow = true;
				boxes.receiveShadow = true;
				scene.add( boxes );

				for ( let i = 0; i < boxes.count; i ++ ) {

					matrix.setPosition( Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5 );
					boxes.setMatrixAt( i, matrix );
					boxes.setColorAt( i, color.setHex( 0xffffff * Math.random() ) );

				}

				// Spheres

				const geometrySphere = new THREE.IcosahedronGeometry( 0.075, 3 );
				spheres = new THREE.InstancedMesh( geometrySphere, material, 100 );
				spheres.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
				spheres.castShadow = true;
				spheres.receiveShadow = true;
				scene.add( spheres );

				for ( let i = 0; i < spheres.count; i ++ ) {

					matrix.setPosition( Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5 );
					spheres.setMatrixAt( i, matrix );
					spheres.setColorAt( i, color.setHex( 0xffffff * Math.random() ) );

				}

				//

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth * RATIO, window.innerHeight * RATIO );
				renderer.shadowMap.enabled = true;
				renderer.outputEncoding = THREE.sRGBEncoding;
				GolpexElement.appendChild( renderer.domElement );

				stats = new Stats();
				GolpexElement.appendChild( stats.dom );

				//

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.target.y = 0.5;
				controls.update();

				animate();
				
				setInterval( () => {

					let index = Math.floor( Math.random() * boxes.count );

					position.set( 2*Math.random()-1, Math.random() + 1, 2*Math.random()-1 );

					//

					index = Math.floor( Math.random() * spheres.count );

					position.set( 2*Math.random()-1, Math.random() + 1, 2*Math.random()-1 );

				}, 1000 / 20 );

				window.addEventListener( 'resize', onWindowResize );

			}
			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth * RATIO, window.innerHeight * RATIO );

			}

			function animate() {

				requestAnimationFrame( animate );

				renderer.render( scene, camera );

				stats.update();

			}