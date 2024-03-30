//https://github.com/mrdoob/three.js/blob/master/examples/games_fps.html

const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();


let MODE = "SIMPLE"
//"SIMPLE"
//"CREATIVE"
let GRAVITY = 0;

if(MODE === "SIMPLE"){
	GRAVITY = 20;
}

const PLAYER_OOB_Y = - 500;

const NUM_SPHERES = 100;
const SPHERE_RADIUS = 0.2;

const STEPS_PER_FRAME = 3;

const sphereGeometry = new THREE.IcosahedronGeometry( SPHERE_RADIUS, 5 );
const sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xff3300 } );

const spheres = [];
let sphereIdx = 0;

for ( let i = 0; i < NUM_SPHERES; i ++ ) {

	const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	sphere.castShadow = true;
	sphere.receiveShadow = true;

	scene.add( sphere );

	spheres.push( {
		mesh: sphere,
		collider: new THREE.Sphere( new THREE.Vector3( 0, - 100, 0 ), SPHERE_RADIUS ),
		velocity: new THREE.Vector3()
	} );

}


const worldOctree = new THREE.Octree();

//const playerCollider = new THREE.Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 );
//player.collider

//const playerVelocity = new THREE.Vector3();
//player.velocity
//const playerDirection = new THREE.Vector3( );
//player.direction

//let playerOnFloor = false;
//player.onFloor
let mouseTime = 0;

function throwBall() {

				const sphere = spheres[ sphereIdx ];
				//player.camera.getWorldDirection( player.direction );

				sphere.collider.center.copy( player.collider.end ).addScaledVector( player.direction, player.collider.radius * 1.5 );

				// throw the ball with more force if we hold the button longer, and if we move forward

				const impulse = 15 + 30 * ( 1 - Math.exp( ( mouseTime - performance.now() ) * 0.001 ) );

				sphere.velocity.copy( player.direction ).multiplyScalar( impulse );
				sphere.velocity.addScaledVector( player.velocity, 2 );

				sphereIdx = ( sphereIdx + 1 ) % spheres.length;

			}


function playerCollisions() {

				const result = worldOctree.capsuleIntersect( player.collider );

				player.onFloor = false;

				if ( result ) {

					player.onFloor = result.normal.y > 0;

					if ( ! player.onFloor ) {

						player.velocity.addScaledVector( result.normal, - result.normal.dot( player.velocity ) );

					}

					player.collider.translate( result.normal.multiplyScalar( result.depth ) );

				}

			}

function updatePlayer( deltaTime ) {

				let damping = Math.exp( - 4 * deltaTime ) - 1;

				if ( ! player.onFloor ) {

					player.velocity.y -= GRAVITY * deltaTime;

					// small air resistance
					damping *= 0.1;

				}


				let deltaPosition;

				if(MODE === "SIMPLE"){
					player.velocity.addScaledVector( player.velocity, damping );

					deltaPosition = player.velocity.clone().multiplyScalar( deltaTime );
					player.collider.translate( deltaPosition );
				}else{


					deltaPosition = player.velocity.clone().multiplyScalar( 3*deltaTime );
					player.collider.translate( deltaPosition );

					if(!keyDownList["90"] && !keyDownList["81"] && !keyDownList["83"] && !keyDownList["68"]){
						player.velocity.set(0,0,0);
					}
				}

				playerCollisions();

				player.camera.position.copy( player.collider.end );

			}

function playerSphereCollision( sphere ) {

				const center = vector1.addVectors( player.collider.start, player.collider.end ).multiplyScalar( 0.5 );

				const sphere_center = sphere.collider.center;

				const r = player.collider.radius + sphere.collider.radius;
				const r2 = r * r;

				// approximation: player = 3 spheres

				for ( const point of [ player.collider.start, player.collider.end, center ] ) {

					const d2 = point.distanceToSquared( sphere_center );

					if ( d2 < r2 ) {

						const normal = vector1.subVectors( point, sphere_center ).normalize();
						const v1 = vector2.copy( normal ).multiplyScalar( normal.dot( player.velocity ) );
						const v2 = vector3.copy( normal ).multiplyScalar( normal.dot( sphere.velocity ) );

						player.velocity.add( v2 ).sub( v1 );
						sphere.velocity.add( v1 ).sub( v2 );

						const d = ( r - Math.sqrt( d2 ) ) / 2;
						sphere_center.addScaledVector( normal, - d );

					}

				}

			}

function spheresCollisions() {

				for ( let i = 0, length = spheres.length; i < length; i ++ ) {

					const s1 = spheres[ i ];

					for ( let j = i + 1; j < length; j ++ ) {

						const s2 = spheres[ j ];

						const d2 = s1.collider.center.distanceToSquared( s2.collider.center );
						const r = s1.collider.radius + s2.collider.radius;
						const r2 = r * r;

						if ( d2 < r2 ) {

							const normal = vector1.subVectors( s1.collider.center, s2.collider.center ).normalize();
							const v1 = vector2.copy( normal ).multiplyScalar( normal.dot( s1.velocity ) );
							const v2 = vector3.copy( normal ).multiplyScalar( normal.dot( s2.velocity ) );

							s1.velocity.add( v2 ).sub( v1 );
							s2.velocity.add( v1 ).sub( v2 );

							const d = ( r - Math.sqrt( d2 ) ) / 2;

							s1.collider.center.addScaledVector( normal, d );
							s2.collider.center.addScaledVector( normal, - d );

						}

					}

				}

			}

function updateSpheres( deltaTime ) {

				spheres.forEach( sphere => {

					sphere.collider.center.addScaledVector( sphere.velocity, deltaTime );

					const result = worldOctree.sphereIntersect( sphere.collider );

					if ( result ) {

						sphere.velocity.addScaledVector( result.normal, - result.normal.dot( sphere.velocity ) * 1.5*1.3 );
																											//*1.3 pour rebond plus fort
						sphere.collider.center.add( result.normal.multiplyScalar( result.depth ) );

					} else {

						sphere.velocity.y -= GRAVITY * deltaTime;

					}

					const damping = Math.exp( - 1.5*1.6 * deltaTime ) - 1;
													//*1.6 pour résistance air plus forte
					sphere.velocity.addScaledVector( sphere.velocity, damping );

					playerSphereCollision( sphere );

				} );

				spheresCollisions();

				for ( const sphere of spheres ) {

					sphere.mesh.position.copy( sphere.collider.center );

				}

			}

function getForwardVector() {

				player.camera.getWorldDirection( player.direction );
				player.direction.y = 0;
				player.direction.normalize();

				return player.direction;

			}

function getSideVector() {

				player.camera.getWorldDirection( player.direction );
				player.direction.y = 0;
				player.direction.normalize();
				player.direction.cross( player.camera.up );

				return player.direction;

			}

function teleportPlayerIfOob() {
	
				if ( player.camera.position.y <= PLAYER_OOB_Y ) {

					player.collider.start.set( 0, 30.35, 0 );
					player.collider.end.set( 0, 31, 0 );
					player.collider.radius = 0.35;
					player.camera.position.copy( player.collider.end );
					player.camera.rotation.set( 0, 0, 0 );

				}

			}

//cf worldOctree dans ./meshTerrain.js