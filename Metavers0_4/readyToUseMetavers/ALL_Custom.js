/*
perlin.js
maths.js
navigator.js
sceneSetup.js

skeleton.js
collision.js
playerSetup.js

chunk.js
light.js
meshTerrain.js
decoration.js
main.js
*/




//https://github.com/josephg/noisejs/blob/master/demo.html
/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

(function(global){
  var module = global.noise = {};

  function Grad(x, y, z) {
    this.x = x; this.y = y; this.z = z;
  }
  
  Grad.prototype.dot2 = function(x, y) {
    return this.x*x + this.y*y;
  };

  Grad.prototype.dot3 = function(x, y, z) {
    return this.x*x + this.y*y + this.z*z;
  };

  var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
               new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
               new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];

  var p = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  // To remove the need for index wrapping, double the permutation table length
  var perm = new Array(512);
  var gradP = new Array(512);

  // This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.
  module.seed = function(seed) {
    if(seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if(seed < 256) {
      seed |= seed << 8;
    }

    for(var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = p[i] ^ (seed & 255);
      } else {
        v = p[i] ^ ((seed>>8) & 255);
      }

      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
  };

  module.seed(0);

  /*
  for(var i=0; i<256; i++) {
    perm[i] = perm[i + 256] = p[i];
    gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
  }*/

  // Skewing and unskewing factors for 2, 3, and 4 dimensions
  var F2 = 0.5*(Math.sqrt(3)-1);
  var G2 = (3-Math.sqrt(3))/6;

  var F3 = 1/3;
  var G3 = 1/6;

  // 2D simplex noise
  module.simplex2 = function(xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin)*F2; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var t = (i+j)*G2;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if(x0>y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1=1; j1=0;
    } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      i1=0; j1=1;
    }
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1 + 2 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    i &= 255;
    j &= 255;
    var gi0 = gradP[i+perm[j]];
    var gi1 = gradP[i+i1+perm[j+j1]];
    var gi2 = gradP[i+1+perm[j+1]];
    // Calculate the contribution from the three corners
    var t0 = 0.5 - x0*x0-y0*y0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1*x1-y1*y1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2(x1, y1);
    }
    var t2 = 0.5 - x2*x2-y2*y2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2(x2, y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70 * (n0 + n1 + n2);
  };

  // 3D simplex noise
  module.simplex3 = function(xin, yin, zin) {
    var n0, n1, n2, n3; // Noise contributions from the four corners

    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin+zin)*F3; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var k = Math.floor(zin+s);

    var t = (i+j+k)*G3;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    var z0 = zin-k+t;

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if(x0 >= y0) {
      if(y0 >= z0)      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if(x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else              { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if(y0 < z0)      { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if(x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else             { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    var x1 = x0 - i1 + G3; // Offsets for second corner
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;

    var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;

    var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3;

    // Work out the hashed gradient indices of the four simplex corners
    i &= 255;
    j &= 255;
    k &= 255;
    var gi0 = gradP[i+   perm[j+   perm[k   ]]];
    var gi1 = gradP[i+i1+perm[j+j1+perm[k+k1]]];
    var gi2 = gradP[i+i2+perm[j+j2+perm[k+k2]]];
    var gi3 = gradP[i+ 1+perm[j+ 1+perm[k+ 1]]];

    // Calculate the contribution from the four corners
    var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
    }
    var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
    }
    var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if(t3<0) {
      n3 = 0;
    } else {
      t3 *= t3;
      n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 32 * (n0 + n1 + n2 + n3);

  };

  // ##### Perlin noise stuff

  function fade(t) {
    return t*t*t*(t*(t*6-15)+10);
  }

  function lerp(a, b, t) {
    return (1-t)*a + t*b;
  }

  // 2D Perlin Noise
  module.perlin2 = function(x, y) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    x = x - X; y = y - Y;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255;

    // Calculate noise contributions from each of the four corners
    var n00 = gradP[X+perm[Y]].dot2(x, y);
    var n01 = gradP[X+perm[Y+1]].dot2(x, y-1);
    var n10 = gradP[X+1+perm[Y]].dot2(x-1, y);
    var n11 = gradP[X+1+perm[Y+1]].dot2(x-1, y-1);

    // Compute the fade curve value for x
    var u = fade(x);

    // Interpolate the four results
    return lerp(
        lerp(n00, n10, u),
        lerp(n01, n11, u),
       fade(y));
  };

  // 3D Perlin Noise
  module.perlin3 = function(x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    // Get relative xyz coordinates of point within that cell
    x = x - X; y = y - Y; z = z - Z;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255; Z = Z & 255;

    // Calculate noise contributions from each of the eight corners
    var n000 = gradP[X+  perm[Y+  perm[Z  ]]].dot3(x,   y,     z);
    var n001 = gradP[X+  perm[Y+  perm[Z+1]]].dot3(x,   y,   z-1);
    var n010 = gradP[X+  perm[Y+1+perm[Z  ]]].dot3(x,   y-1,   z);
    var n011 = gradP[X+  perm[Y+1+perm[Z+1]]].dot3(x,   y-1, z-1);
    var n100 = gradP[X+1+perm[Y+  perm[Z  ]]].dot3(x-1,   y,   z);
    var n101 = gradP[X+1+perm[Y+  perm[Z+1]]].dot3(x-1,   y, z-1);
    var n110 = gradP[X+1+perm[Y+1+perm[Z  ]]].dot3(x-1, y-1,   z);
    var n111 = gradP[X+1+perm[Y+1+perm[Z+1]]].dot3(x-1, y-1, z-1);

    // Compute the fade curve value for x, y, z
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);

    // Interpolate
    return lerp(
        lerp(
          lerp(n000, n100, u),
          lerp(n001, n101, u), w),
        lerp(
          lerp(n010, n110, u),
          lerp(n011, n111, u), w),
       v);
  };

})(this);

function distance(entity1,entity2){
  X = entity2.position.x-entity1.position.x;
  Y = entity2.position.y-entity1.position.y;
  Z = entity2.position.z-entity1.position.z;
  dist = Math.sqrt( X * X + Y * Y + Z * Z );
  return(dist);
}

function distance1(pos1,pos2){
  X = pos2.x-pos1.x;
  Y = pos2.y-pos1.y;
  Z = pos2.z-pos1.z;
  dist = Math.sqrt( X * X + Y * Y + Z * Z );
  return(dist);
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

const nav = window.navigator.userAgent;
let isPhone;

if(nav.search("Mobi") === -1 ){
  isPhone = false;
}else{
  isPhone = true;
}

//=================================================================================
//              Scene creation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer( { alpha : true , antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//renderer.shadowMap.type = THREE.VSMShadowMap;

//document.body.appendChild( renderer.domElement );
var renderDiv = document.getElementById('renderDiv')
renderDiv.appendChild( renderer.domElement );

const loader = new THREE.GLTFLoader();



console.log(renderer.domElement)



function removeObject( object ){
  //const object = scene.getObjectByProperty( 'uuid', i );

  object.geometry.dispose();
  object.material.dispose();
  
  scene.remove( object );

}


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
  
  
  
    const loader = new THREE.GLTFLoader();//      PENSER A DEPLACER DANS UNE INSTANCE PLUS HAUTE
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

//https://github.com/mrdoob/three.js/blob/master/examples/games_fps.html

const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();



const GRAVITY = 30;

const NUM_SPHERES = 100;
const SPHERE_RADIUS = 0.2;

const STEPS_PER_FRAME = 5;

const sphereGeometry = new THREE.IcosahedronGeometry( SPHERE_RADIUS, 5 );
const sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xbbbb44 } );

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

        player.velocity.addScaledVector( player.velocity, damping );

        const deltaPosition = player.velocity.clone().multiplyScalar( deltaTime );
        player.collider.translate( deltaPosition );

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

            sphere.velocity.addScaledVector( result.normal, - result.normal.dot( sphere.velocity ) * 1.5 );
            sphere.collider.center.add( result.normal.multiplyScalar( result.depth ) );

          } else {

            sphere.velocity.y -= GRAVITY * deltaTime;

          }

          const damping = Math.exp( - 1.5 * deltaTime ) - 1;
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
  
        if ( player.camera.position.y <= - 25 ) {

          player.collider.start.set( 0, 30.35, 0 );
          player.collider.end.set( 0, 31, 0 );
          player.collider.radius = 0.35;
          player.camera.position.copy( player.collider.end );
          player.camera.rotation.set( 0, 0, 0 );

        }

      }


//=================================================================================
//              Player creation

class Player{

  constructor(cameraPlayer = undefined){
    this.debug = false;
    this.camera = cameraPlayer;
    this.position = this.camera.position;
    this.direction = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.collider = new THREE.Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 );;
    this.mesh = createSkeleton(this.debug);

    this.onFloor = false;
    this.controls = new THREE.PointerLockControls( cameraPlayer, renderer.domElement );
  }

  update(){
    this.camera.getWorldDirection( this.direction );
    //temporaire
    if(this.mesh){
      this.mesh.position.x = this.position.x + 8*this.direction.x;
      this.mesh.position.y = this.position.y + 8*this.direction.y;
      this.mesh.position.z = this.position.z + 8*this.direction.z;
      

      this.mesh.rotation.x = this.camera.rotation.x;
      this.mesh.rotation.y = this.camera.rotation.y;
      this.mesh.rotation.z = this.camera.rotation.z;
    }
    
  }

  loadSkeleton(path, debug) {

    let model = undefined;
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

      });


      if (debug) {
        const helper = new THREE.SkeletonHelper( model );
        scene.add( helper );
      }
    });

    loader.manager.onLoad = function() {
      //console.log("model :",model);
      //console.log(this.mesh);
      this.mesh = model;
      //console.log(this.mesh);

    }

  }
}




_vectUP = new THREE.Vector3( 0, 1, 0 );
_vectDOWN = new THREE.Vector3( 0, -1, 0 );

//const pointer = new THREE.PointerLockControls( camera, renderer.domElement );

const player = new Player(camera);
const pointer = player.controls;

//player.loadSkeleton('./Xbot.glb',true);
loadSkeleton('./Xbot.glb',true,console.log);


player.collider.translate(_vectUP.clone().multiplyScalar(20));



/*
pointer.addEventListener( 'lock', function () {
  console.log("lock");
} );

pointer.addEventListener( 'unlock', function () {
  console.log("unlock");
} );
*/

if (isPhone) {

  document.getElementById("renderDiv").onclick="";
  timeStampInit = 0

  function handle_one_touch(e){
    //console.log(e)
    //console.log(e.touches[0].clientX/devicePixelRatio,e.touches[0].clientY/devicePixelRatio);
    //console.log(e.touches[0].clientX,e.touches[0].clientY,devicePixelRatio);

    // mauvaise normalisation, le maximum n'est pas 1 (dépend du téléphone)

    const w = 2 * e.touches[0].clientX / screen.width - 1;//[0,1] => [-1,1]
    const h = 2 * e.touches[0].clientY / screen.height - 1;//[0,1] => [-1,1]

    const speedDelta_ = 0.5/*deltaTime*/ * ( player.onFloor ? 25 : 8 );


    //console.log( e.timeStamp - timeStampInit );
    //Système temporaire
    if( e.timeStamp - timeStampInit <= 250 ){
      //console.log("dbc");
      //player.camera.rotation.x += h*0.2;
      player.camera.rotation.y += -w*0.2;
      //player.camera.rotation.z += h*0.2;
      //console.log(player.camera.roation);
    }
    else{
      //console.log("sc");
      

      player.velocity.add( getForwardVector().multiplyScalar( -h*speedDelta_ ) );
      player.velocity.add( getSideVector().multiplyScalar( w*speedDelta_ ) );
    }
    timeStampInit  = e.timeStamp;


    
    
  }

  function handle_two_touch(e){
    throwBall();
  }
  function handle_three_touch(e){
    throwBall();
  }

  document.addEventListener('touchstart', function(e) {
      // Invoke the appropriate handler depending on the
      // number of touch points.
      
      switch (e.touches.length) {
        case 1: handle_one_touch(e); break;
        case 2: handle_two_touches(e); break;
        case 3: handle_three_touches(e); break;
        default: console.log("Not supported"); break;
      }
  }, false);


}

document.addEventListener( 'mouseup', () => {

  if ( document.pointerLockElement !== null && isPhone === false) throwBall();

} );


  const keyDownList = {
    "z" : false,
    "q" : false,
    "s" : false,
    "d" : false,
    " " : false,
    "Shift" : false,
  }





  function key_action(key){
    const speedDelta = 0.05/*deltaTime*/ * ( player.onFloor ? 25 : 8 );
    //console.log(key)

    switch (key) {
      case 'z':
        //console.log("avancer");
        //pointer.moveForward(1);
        player.velocity.add( getForwardVector().multiplyScalar( speedDelta ) );
        break;
      case 'q':
        //console.log("gauche");
        //pointer.moveRight(-1);
        player.velocity.add( getSideVector().multiplyScalar( - speedDelta ) );
        break;
      case 's':
        //console.log("reculer");
        //pointer.moveForward(-1);
        player.velocity.add( getForwardVector().multiplyScalar( - speedDelta ) );
        break;
      case 'd':
        //console.log("droite");
        //pointer.moveRight(1);
        player.velocity.add( getSideVector().multiplyScalar( speedDelta ) );
        break;
      case ' ':
        //console.log("haut");
        //player.camera.position.y += 1;
        player.collider.translate(_vectUP);

        break;
      case 'Shift':
        //console.log("bas");
        //player.camera.position.y += -1;
        player.collider.translate(_vectDOWN);
        break;
      default:
        break;
        }
  }

  function update_movement(){
    for (e in keyDownList) {
      if (keyDownList[e]) {
        key_action(e)
      }
    }
  }


  document.addEventListener('keydown' , (e)=>{
    
    //Optimisation de la gestion des touches : Créer une liste de touches
    //Pour pouvoir se déplacer dans deux directions simultanément
    keyDownList[e.key] = true;
  })

  document.addEventListener('keyup' , (e)=>{

    //console.log(e);
    keyDownList[e.key] = false;
  })

const clock = new THREE.Clock();

let lastChunk ;
let newChunk ;



class Chunk{
//class Chunk extends Entity{
  //static pour utiliser la class sans instance : Chunk.data
  //get pour utiliser uen fonction sans () : this.render au lieu de this.render()
  //set pour modifier des valeurs dans this

  static data = {
    debug : false,
    renderDistance : 5,
    chunkSize : 32,
    semi_size : Math.floor(32/2),
    xMax : 10,
    xMin : -10,
    yMax : 2,
    yMin : -2,
    zMax : 10,
    zMin : -10,
    list : {},
    /*
    utiliser new map() pour conserver le type de la clé
    object : { variable : <value> }
    map    : { <value> : <value> }
    */
    //list : new Map()
  }

  constructor(position = undefined) {
    this.chunkPosition = position;
    this.worldPosition = {
      x : Chunk.data.chunkSize*this.chunkPosition[0],
      y : Chunk.data.chunkSize*this.chunkPosition[1],
      z : Chunk.data.chunkSize*this.chunkPosition[2],
    }
    this.group = new THREE.Group();
    this.group.visible = false
    
    this.group.position.x = 0;//this.chunkPosition[0]*Chunk.data.chunkSize;
    this.group.position.y = 0;//this.chunkPosition[1]*Chunk.data.chunkSize;
    this.group.position.z = 0;//this.chunkPosition[2]*Chunk.data.chunkSize;
    
    scene.add(this.group)
    

    Chunk.data.list[this.chunkPosition] = this;
    //Chunk.data.list.set( this.chunkPosition , this )
    
  }

  render(){
    //this.group.visible = distance1(player.object.position,this.worldPosition) < Chunk.data.chunkSize*Chunk.data.renderDistance ;
    this.group.visible = distance1(camera.position,this.worldPosition) < Chunk.data.chunkSize*Chunk.data.renderDistance ;

  }

  get chunk_in(){}
}


function is_chunk_update(lastChunk,newChunk){
  //return( !(lastChunk === newChunk) ); //bizarre : [0,0,0] != [0,0,0] en js
  if (lastChunk === undefined || newChunk === undefined){
    return false
  }
  return(
    lastChunk[0] !== newChunk[0] ||
    lastChunk[1] !== newChunk[1] ||
    lastChunk[2] !== newChunk[2]
    );
}

function render_chunks(lastChunk,newChunk){
  //Système imparfait en cas de téléportation, les anciens chunks ne sont pas déchargés
  if (is_chunk_update(lastChunk,newChunk)){
    
    const Xinf = Math.max( Chunk.data.xMin , Math.floor( newChunk[0] - Chunk.data.renderDistance - 2 ) );
    const Xsup = Math.min( Chunk.data.xMax , Math.floor( newChunk[0] + Chunk.data.renderDistance + 2 ) );
    const Yinf = Math.max( Chunk.data.yMin , Math.floor( newChunk[1] - Chunk.data.renderDistance - 2 ) );
    const Ysup = Math.min( Chunk.data.yMax , Math.floor( newChunk[1] + Chunk.data.renderDistance + 2 ) );
    const Zinf = Math.max( Chunk.data.zMin , Math.floor( newChunk[2] - Chunk.data.renderDistance - 2 ) );
    const Zsup = Math.min( Chunk.data.zMax , Math.floor( newChunk[2] + Chunk.data.renderDistance + 2 ) );

    for (var x = Xinf ; x <= Xsup; x++){
    for (var y = Yinf ; y <= Ysup; y++){
    for (var z = Zinf ; z <= Zsup; z++){
      Chunk.data.list[[x,y,z]].render();
    }}}
  }
  
}

function in_chunk(entity){
  //entity.x à déterminer
  X = Math.floor( (entity.position.x + Chunk.data.chunkSize / 2) / Chunk.data.chunkSize );
  Y = Math.floor( (entity.position.y + Chunk.data.chunkSize / 2) / Chunk.data.chunkSize );
  Z = Math.floor( (entity.position.z + Chunk.data.chunkSize / 2) / Chunk.data.chunkSize );
  return( [X,Y,Z] )//=>A transformer en Vec3
}

function put_in_chunk(entity){

  Chunk.data.list[ in_chunk(entity) ].group.add( entity )


  
  //entity.position.x = entity.position.x % Chunk.data.chunkSize;
  //entity.position.y = entity.position.y % Chunk.data.chunkSize;
  //entity.position.z = entity.position.z % Chunk.data.chunkSize;
}

function update_chunk(){
  newChunk = in_chunk(camera);//in_chunk(player.object);
  render_chunks(lastChunk,newChunk);
  lastChunk = newChunk;
}

function chunk_gen(){

  for (var x = Chunk.data.xMin ; x <= Chunk.data.xMax; x++){
  for (var y = Chunk.data.yMin ; y <= Chunk.data.yMax; y++){
  for (var z = Chunk.data.zMin ; z <= Chunk.data.zMax; z++){
    new Chunk( [x,y,z] );
  }}}
}


function gen_AmbientLight(){
  const color = 0xFFFFFF;
  const intensity = 0.2;
  const light = new THREE.AmbientLight(color, intensity);
  scene.add(light);
}

function gen_PointLight(x,y,z){
  const color = 0xFFFFFF;
  const intensity = 0.6;
  const light = new THREE.PointLight(color, intensity);
  light.position.set( x, y, z );
  light.castShadow = true;
  light.distance = 64;
  //light.distance = 0;
  //scene.add(light);

  const geo_light = new THREE.BoxGeometry( 1,1,1 );
  const mat_light = new THREE.MeshBasicMaterial( { color : 0xffff30 } );

  const lampe = new THREE.Mesh( geo_light, mat_light );
  lampe.position.set(x,y,z);
  put_in_chunk(lampe);


  put_in_chunk(light);
}

function gen_DirectionalLight(x,y,z){
  const color = 0xFFFFFF;
  const intensity = 0.5;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set( x, y, z );

  //résolution ombre
  light.shadow.mapSize.width = 512*4;
  light.shadow.mapSize.height = 512*4;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 500;

  light.shadow.camera = new THREE.OrthographicCamera( -64, 64, 64, -64, 0.1, 500 );
  light.castShadow = true;

  scene.add( light );
  
  const helper = new THREE.DirectionalLightHelper( light, 64 );
  scene.add( helper );
  
}



/*
function meshTerrain_gen(){
  const geometry = new THREE.BufferGeometry();
  // create a simple square shape. We duplicate the top left and bottom right
  // vertices because each vertex needs to appear once per triangle.
  const vertices = new Float32Array( [
     1.0, 1.0,   1.0,
     1.0, 1.0,   0.0,
     0.0,  1.0,  1.0,

     0.0,  1.0,  0.0,
     0.0,  1.0,  1.0,
     1.0, 1.0,   0.0
  ] );

  // itemSize = 3 because there are 3 values (components) per vertex
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  
  const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
  const mesh = new THREE.Mesh( geometry, material );
  mesh.position.set(0,3,0);

  put_in_chunk(mesh);
}*/


//=================================================================================
//              surface vertices
function create_vertices(chunk_coordinates){
  const rand1 = Math.floor(random(-15,15));
  const rand2 = Math.floor(random(-15,15));
  const rand3 = Math.floor(random(-15,15));
  const rand4 = Math.floor(random(-15,15));
  const rand5 = Math.floor(random(-15,15));
  const rand6 = Math.floor(random(-15,15));


  const Xstart = Math.floor(chunk_coordinates[0]*Chunk.data.chunkSize);
  const Zstart = Math.floor(chunk_coordinates[2]*Chunk.data.chunkSize);
  let verts = [];
  for (var x = -Chunk.data.chunkSize/2; x <= Chunk.data.chunkSize/2; x++) {
  for (var z = -Chunk.data.chunkSize/2; z <= Chunk.data.chunkSize/2; z++) {
    X = Xstart + x;
    Z = Zstart + z;

    //y = Math.floor(3*Math.sin(X/8)+Math.cos(Z))+5;
    //y = 10+10*noise.perlin2(X/20,Z/20);

    y0 = 40+20*noise.perlin2(X/20,Z/20);

    y = 10+10*noise.perlin2(X/y0,Z/y0);

    
    if ( x === rand1 && z === rand2 ) {
      gen_decoration_arbre(X,y,Z);
    }
    if ( x === rand3 && z === rand4 && y0 >= 45 ) {
      gen_decoration_maison(X,y,Z);
    }



    verts.push([x,y,z]);
  }}
  
  return verts;
}
//=================================================================================
//              vertices to triangles

function vertices_to_square_index(vertices){
  //lenght.vertices need to be an squared interger
  const n = Math.sqrt(vertices.length);
  let L = [];
  for (var j = 0; j <= n-2; j++) {
  for (var i = 0; i <= n-2; i++) {
    const k = n*j;
    //L.push( [ vertices[k+i] , vertices[k+i+1] , vertices[k+n+i] , vertices[k+n+i+1] ] );
    L.push( [ k+i , k+i+1 , k+n+i , k+n+i+1 ])
  }}
  return L;
}

function square_index_to_triangles(vertices,indexList){
  const a = indexList[0];
  const b = indexList[1];
  const c = indexList[2];
  const d = indexList[3];
  const tri = [
  vertices[a] , vertices[b] , vertices[c] ,
  vertices[d] , vertices[c] , vertices[b] ,
  ]
  return(tri);
}

function triangles_from_vertices(vertices){
  let L = [];
  const indexes = vertices_to_square_index(vertices);
  for (e in indexes) {
    const points = square_index_to_triangles(vertices,indexes[e]);
    
    for (p in points){
    for (i in points[p]){
      L.push( points[p][i] );
    }}
  }
  return L;
}

//=================================================================================
//              debug
/*
const verts = create_vertices([0,0,0])
//console.log(verts)

verts = [  
  [0,0,0], [1,0,0], [2,0,0],
  [0,0,1], [1,0,1], [2,0,1],
  [0,0,2], [1,0,2], [2,0,2],
  ]


console.log("verts",verts)
indexes = vertices_to_square_index(verts)
console.log("indexes",indexes)
triangles = triangles_from_vertices( verts )
console.log("triangles",triangles)
*/

function gen_meshTerrain(chunk_coordinates){


  const triangles = triangles_from_vertices(create_vertices(chunk_coordinates));
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array( triangles );
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

  geometry.computeVertexNormals();
  geometry.normalizeNormals();

  const material = new THREE.MeshPhongMaterial( { color: 0x90d000 , side : THREE.DoubleSide } );

  material.shadowSide = THREE.BackSide;
  //évites que l'on voit les bugs d'ombres dqui sont à l'intérieur des objets
  

  const mesh = new THREE.Mesh( geometry, material );
  mesh.position.set(
    chunk_coordinates[0]*Chunk.data.chunkSize,
    chunk_coordinates[1]*Chunk.data.chunkSize,
    chunk_coordinates[2]*Chunk.data.chunkSize,
    );

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  

  //suppr worldOctree
  
  if (Math.abs(chunk_coordinates[0]) <= 2 && Math.abs(chunk_coordinates[2]) <= 2) {
    const group = new THREE.Group();
    //console.log(mesh.material.color)
    mesh.material.color = {
      r: 0.8,
      g: 0.3,
      b: 0.0,
    };
    group.add(mesh);
    worldOctree.fromGraphNode( group );
  }
  
  
  //*----


  put_in_chunk(mesh);
}

function gen_decoration(){
  //gen_decoration_arbre(0,20,0);
}

function gen_decoration_arbre(x,y,z){
  const arbre = new THREE.Group();

  const h = random(2,3);
  const geo = new THREE.CylinderGeometry( 0.12, 0.2, h, 5 );
  const mat = new THREE.MeshPhongMaterial( { color : 0xa19281 } );
  const tronc = new THREE.Mesh( geo, mat );

  tronc.castShadow = true;
  tronc.receiveShadow = true;

  arbre.add( tronc );

  const nbFeuilles = random(2,4);
  for (let j = 0; j < nbFeuilles; j += 1){
    const geoF = new THREE.IcosahedronGeometry( random(0.5,0.75) );
    const matF = new THREE.MeshPhongMaterial( { color : 0x8ae8a7 } );
    const feuille = new THREE.Mesh( geoF, matF );
    let xf = random(-.3,.3);
    let yf = random(-.3,.3);
    let zf = random(-.3,.3);
    feuille.position.set( xf, yf + h/2, zf );

    feuille.castShadow = true;
    feuille.receiveShadow = true;

    arbre.add( feuille );
  }

  //let x = random(2*semi_size*xMin,2*semi_size*xMax);
  //let z = random(2*semi_size*zMin,2*semi_size*zMax);
  //arbre.position.set( x , 0 , z );
  arbre.position.set( x, y, z );
  arbre.position.y += h/2 - 0.2 ;


  put_in_chunk(arbre);
}

function gen_decoration_maison(x,y,z){
  const maison = new THREE.Group();

  const h_mur = random(3,4);
  const L_mur = random(4,5);

  const geo_mur = new THREE.BoxGeometry( L_mur, h_mur, L_mur );
  const mat_mur = new THREE.MeshPhongMaterial( { color : 0xeac187 } );

  const mur = new THREE.Mesh( geo_mur, mat_mur );

  mur.castShadow = true;
  mur.receiveShadow = true;

  maison.add( mur );

  const points = [
    new THREE.Vector2(0,0),
    new THREE.Vector2(L_mur/1.3,3),
  ];

  const geometry = new THREE.LatheGeometry( points , 4 );
  const material = new THREE.MeshPhongMaterial( { color: 0xf5abbe } );
  const toit = new THREE.Mesh( geometry, material );
  toit.position.y += h_mur+1;

  toit.rotation.y += 0.7854;
  toit.rotation.x += 3.1415;

  toit.castShadow = true;
  toit.receiveShadow = true;

  maison.add( toit );

  maison.position.set( x, y, z );
  maison.position.y += h_mur/2 - 0.3
  put_in_chunk(maison);
}

/*
Pour du offline :
Utiliser :
  https://threejs.org/examples/js/controls/FirstPersonControls.js

plutôt que :
  https://threejs.org/examples/jsm/controls/FirstPersonControls.js
*/



//=================================================================================
//              Gen Chunk
chunk_gen();

/*
gen_debug([0,0,0]);
gen_debug([1,0,0]);
gen_debug([1,0,1]);*/
gen_AmbientLight();
/*
gen_PointLight(-50,30,-50);

gen_PointLight(-50,30,50);
gen_PointLight(50,30,-50);
gen_PointLight(50,30,50);
*/
gen_DirectionalLight(-20,30,5);

gen_decoration();
for (var x = -5; x <= 5; x++) {
for (var z = -5; z <= 5; z++) {
  gen_meshTerrain([x,0,z]);
}}  


//=================================================================================
//              Scene Decoration Creation

for (var x = Chunk.data.xMin; x <= Chunk.data.xMax; x++) {
for (var y = 0; y <= 0; y++) {
for (var z = Chunk.data.zMin; z <= Chunk.data.zMax; z++) {
      const geometry = new THREE.BoxGeometry();
      const material = ((x+z+100)%2===1)?new THREE.MeshPhongMaterial( { color: 0x00ff00 }):new THREE.MeshPhongMaterial( { color: 0xffff00 });
      const cube = new THREE.Mesh( geometry, material );
      
      cube.position.x = x*Chunk.data.chunkSize ;
      cube.position.y = y*Chunk.data.chunkSize ;
      cube.position.z = z*Chunk.data.chunkSize ;
      
      cube.scale.x = Chunk.data.chunkSize;
      cube.scale.z = Chunk.data.chunkSize;



      //cube.receiveShadow = true;


      put_in_chunk(cube);
}}}
  
/*cf : 
https://github.com/mrdoob/three.js/blob/master/examples/games_fps.html
https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain.html#L104
*/

//=================================================================================
//              window resize
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  //player.handleResize();
}
window.addEventListener( 'resize', onWindowResize );
//=================================================================================
//              Animate
let n = 0;

render_chunks([0,0,0],[0,0,1]);
//forcing pour charger les chunks à l'apparition de player : à suppr
//Modif is_chunk_update pour détécter quand undefined != array

function main_update() {
  n += 1;

  requestAnimationFrame( main_update );

  
  //custom updates
  update_chunk()
  update_movement()
  
  player.update()

  
  if (n%300===0){
    //update_chunk()
    
    //console.log(player.position)
    //console.log(player.camera.position)
    //console.log(player.collider.end)

    //console.log("player cam posi",player.camera.position);
    //console.log("player position",player.position);
    //console.log("player collider",player.collider.end);
    //console.log(camera.position, playerCollider.end)
  }
  const deltaTime = Math.min( 0.05, clock.getDelta() ) / STEPS_PER_FRAME;

        // we look for collisions in substeps to mitigate the risk of
        // an object traversing another too quickly for detection.

        for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {

          //controls( deltaTime );

          updatePlayer( deltaTime );

          updateSpheres( deltaTime );

          teleportPlayerIfOob();

        }


  
  renderer.render( scene, camera );
}

main_update();

//console.log(Chunk.data.list[[1,1,0]])

