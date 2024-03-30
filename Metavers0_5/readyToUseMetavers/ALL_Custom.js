/*
En grande partie de Guillaume Foucaud, 30/04/2022
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
let renderDiv = document.getElementById('renderDiv')
renderDiv.appendChild( renderer.domElement );

const loader = new THREE.GLTFLoader();



//console.log(renderer.domElement)



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

//loadSkeleton('./Xbot.glb',true,console.log);


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

const PLAYER_OOB_Y = - 200;

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

          if(!keyDownList["z"] && !keyDownList["q"] && !keyDownList["s"] && !keyDownList["d"]){
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
    this.mesh = null;//createSkeleton(this.debug);
    this.own_light = null;

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
//loadSkeleton('./Xbot.glb',true,console.log);


player.collider.translate(_vectUP.clone().multiplyScalar(20));



/*
pointer.addEventListener( 'lock', function () {
  console.log("lock");
} );

pointer.addEventListener( 'unlock', function () {
  console.log("unlock");
} );
*/

if (isPhone) {//https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Multi-touch_interaction

  


  /*
  timeStampInit = 0

  function handle_one_touch(e){
    console.log(e)
    //console.log(e.touches[0].clientX/devicePixelRatio,e.touches[0].clientY/devicePixelRatio);
    //console.log(e.touches[0].clientX,e.touches[0].clientY,devicePixelRatio);

    // mauvaise normalisation, le maximum n'est pas 1 (dépend du téléphone)

    const w = 2 * e.touches[0].clientX / screen.width - 1;//[0,1] => [-1,1]
    const h = 2 * e.touches[0].clientY / screen.height - 1;//[0,1] => [-1,1]

    const speedDelta_ = 0.5 * ( player.onFloor ? 25 : 8 );


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
  */
  document.getElementById("forward").addEventListener('touchstart', function(e) {
    keyDownList.touch = true;
  })
  document.getElementById("forward").addEventListener('touchend', function(e) {
    keyDownList.touch = false;
  })
  //-------------------------------------
  document.getElementById("throwball").addEventListener('touchstart', function(e) {
    throwBall();
  })
  //-------------------------------------
  document.getElementById("touchAreaLeft").addEventListener('touchstart', function(e) {
    keyDownList.rotateLeft = true;
  })
  document.getElementById("touchAreaLeft").addEventListener('touchend', function(e) {
    keyDownList.rotateLeft = false;
  })
  //-------------------------------------
  document.getElementById("touchAreaRight").addEventListener('touchstart', function(e) {
    keyDownList.rotateRight = true;
  })
  document.getElementById("touchAreaRight").addEventListener('touchend', function(e) {
    keyDownList.rotateRight = false;
  })
  //-------------------------------------
  document.getElementById("touchAreaMiddle").addEventListener('touchstart', function(e) {
    keyDownList.touchJump = true;
  })
  document.getElementById("touchAreaMiddle").addEventListener('touchend', function(e) {
    keyDownList.touchJump = false;
  })
  //-------------------------------------

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
    "Control" : false,
    "touch" : false,
    "rotateLeft" : false,
    "rotateRight" : false,
    "touchJump" : false,
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
      case 'Control':
        //console.log("bas");
        //player.camera.position.y += -1;
        player.collider.translate(_vectDOWN);
        break;

      case 'touch':
        player.velocity.add( getForwardVector().multiplyScalar( speedDelta ) );
        break;
      case 'rotateLeft':
        player.camera.rotation.y += 0.1;
        break;
      case 'rotateRight':
        player.camera.rotation.y += -0.1;
        break;
      
      case 'touchJump':
        player.collider.translate(_vectUP);
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
    //console.log(e)
  })

  document.addEventListener('keyup' , (e)=>{

    //console.log(e);
    keyDownList[e.key] = false;
  })








const clock = new THREE.Clock();

let lastChunk ;
let newChunk ;

let infoText = document.getElementById("info");

class Chunk{

  static data = {
    debug : false,
    renderDistance : 4,//4
    chunkSize : 20,//21,//64
    xMax : 100,
    xMin : -100,
    yMax : 20,
    yMin : -20,
    zMax : 100,
    zMin : -100,

  //conditions :
  // xMin <= -xInit <= 0 <= xInit <= xMax
  // yMin <= -yInit <= 0 <= yInit <= yMax
  // zMin <= -zInit <= 0 <= zInit <= zMax
    xInit : 8, 
    yInit : 5,//bug ici si /= 0, liée à gen_mesh et generate_vertices_V2,
    zInit : 8,

    list : {},
    lenght : 0,//au delà de 1000 chunks sur la ram => lag
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
    
    this.group.position.x = 0;
    this.group.position.y = 0;
    this.group.position.z = 0;

    scene.add(this.group)
    

    Chunk.data.list[this.chunkPosition] = this;
    Chunk.data.lenght += 1; 
    
  }

  render(){
    this.group.visible = distance1(player.position,this.worldPosition) < Chunk.data.chunkSize*Chunk.data.renderDistance ;

  }



  static get in_chunk(){
    return(in_chunk(player))
  }

  static gen_new_chunk(){

    const chk_p = Chunk.in_chunk;
    const rd = Chunk.data.renderDistance;

    //console.log(chk_p,rd)
    const nxa = Math.max( Chunk.data.xMin, chk_p[0]-rd ) 
    const nxb = Math.min( Chunk.data.xMax, chk_p[0]+rd )

    const nya = Math.max( Chunk.data.yMin, chk_p[1]-rd )
    const nyb = Math.min( Chunk.data.yMax, chk_p[1]+rd )

    const nza = Math.max( Chunk.data.zMin, chk_p[2]-rd )
    const nzb = Math.min( Chunk.data.zMax, chk_p[2]+rd )


    for( var x = nxa; x <= nxb; x++){
    for( var y = nya; y <= nyb; y++){
    for( var z = nza; z <= nzb; z++){
      //      PARTICULIEREMENT LOURD EN PERFORMANCE
      new_chunk([x,y,z]);
      /*
      console.log(distance1(chk_p,[x,y,z]) < rd)
      // Générer dans un cercle plutôt qu'un carré
      if(distance1(chk_p,[x,y,z]) < rd){
        new_chunk([x,y,z]);
        console.log("gen chunk :", [x,y,z])
      }
      */
    }}}
    
  }
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
  //infoText.innerHTML = "chunk : " + newChunk;
  //Système imparfait en cas de téléportation, les anciens chunks ne sont pas déchargés
  if (is_chunk_update(lastChunk,newChunk)){
    
    //console.log(Chunk.in_chunk)
    
    const Xinf = Math.max( Chunk.data.xMin , Math.floor( newChunk[0] - Chunk.data.renderDistance - 2 ) );
    const Xsup = Math.min( Chunk.data.xMax , Math.floor( newChunk[0] + Chunk.data.renderDistance + 2 ) );
    const Yinf = Math.max( Chunk.data.yMin , Math.floor( newChunk[1] - Chunk.data.renderDistance - 2 ) );
    const Ysup = Math.min( Chunk.data.yMax , Math.floor( newChunk[1] + Chunk.data.renderDistance + 2 ) );
    const Zinf = Math.max( Chunk.data.zMin , Math.floor( newChunk[2] - Chunk.data.renderDistance - 2 ) );
    const Zsup = Math.min( Chunk.data.zMax , Math.floor( newChunk[2] + Chunk.data.renderDistance + 2 ) );

    for (var x = Xinf ; x <= Xsup; x++){
    for (var y = Yinf ; y <= Ysup; y++){
    for (var z = Zinf ; z <= Zsup; z++){
      //console.log([x,y,z])
      if( [x,y,z] in Chunk.data.list ){
        Chunk.data.list[[x,y,z]].render();
      }
    }}}

    Chunk.gen_new_chunk();
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

  if( in_chunk(entity) in Chunk.data.list ){
    Chunk.data.list[ in_chunk(entity) ].group.add( entity );
  }
}

function update_chunk(){
  newChunk = in_chunk(camera);//in_chunk(player.object);
  infoText.innerHTML = newChunk + " " + Chunk.data.lenght; // pas obligatoire
  render_chunks(lastChunk,newChunk);
  lastChunk = newChunk;
}







function debug_gen_y0(chunk_coordinates){
  const Xdebug = chunk_coordinates[0];
  const Ydebug = 0;
  const Zdebug = chunk_coordinates[2];

  const geometry = new THREE.BoxGeometry();
  const material = ((Xdebug+Zdebug+100)%2===1)?new THREE.MeshPhongMaterial( { color: 0x00ff00 }):new THREE.MeshPhongMaterial( { color: 0xffff00 });
  const cube = new THREE.Mesh( geometry, material );
      
  cube.position.x = Xdebug*Chunk.data.chunkSize ;
  cube.position.y = Ydebug*Chunk.data.chunkSize ;
  cube.position.z = Zdebug*Chunk.data.chunkSize ;
      
  cube.scale.x = Chunk.data.chunkSize;
  cube.scale.z = Chunk.data.chunkSize;


  cube.receiveShadow = true;


  put_in_chunk(cube);
}


function debug_gen_y1(chunk_coordinates){
  const Xdebug = chunk_coordinates[0];
  const Ydebug = chunk_coordinates[1];
  const Zdebug = chunk_coordinates[2];

  const geometry = new THREE.BoxGeometry();
  const material = ((Xdebug+Zdebug+Ydebug+100)%2===1)?new THREE.MeshPhongMaterial( { color: 0x00ff00 }):new THREE.MeshPhongMaterial( { color: 0xffff00 });
  const cube = new THREE.Mesh( geometry, material );
      
  cube.position.x = Xdebug*Chunk.data.chunkSize ;
  cube.position.y = Ydebug*Chunk.data.chunkSize ;
  cube.position.z = Zdebug*Chunk.data.chunkSize ;
      
  cube.scale.x = 3;
  cube.scale.z = 3;


  cube.receiveShadow = true;


  put_in_chunk(cube);
}




function collision_on_chunk(chunk_coordinates){
  const group = Chunk.data.list[ chunk_coordinates ].group;
  //console.log(worldOctree)
  worldOctree.fromGraphNode( group );
}


function new_chunk(chunk_coordinates){
  if( !(chunk_coordinates in Chunk.data.list) ){
    new Chunk( chunk_coordinates );
    //console.log( "Chunk :", chunk_coordinates, "created" )

    //------------------------------------------------------
    //A CHANGER

    
    

    if( (chunk_coordinates[0] >= 1 && chunk_coordinates[0] <= 5) &&
      (chunk_coordinates[2] >= 1 && chunk_coordinates[2] <= 5)
     ){
      genMesh(chunk_coordinates);
      //collision_on_chunk(chunk_coordinates);

    }else if((chunk_coordinates[0] >= -4 && chunk_coordinates[0] <= 0) &&
      (chunk_coordinates[2] >= 1 && chunk_coordinates[2] <= 5)){
      generable_mesh(chunk_coordinates);
      //collision_on_chunk(chunk_coordinates);

    }else{
      if(chunk_coordinates[1] === 0){
        generable_meshTerrain(chunk_coordinates);
        collision_on_chunk(chunk_coordinates);
      }
    }


    //if( chunk_coordinates[1] === 1 || chunk_coordinates[1] === 0 ){
      //console.log( "chunk terrain :", chunk_coordinates);
      //debug_gen_y0(chunk_coordinates);
      

      //generable_meshTerrain(chunk_coordinates);
      //collision_on_chunk(chunk_coordinates);

      //generable_mesh(chunk_coordinates);
      //collision_on_chunk(chunk_coordinates);
      

    //}else{
      //debug_gen_y1(chunk_coordinates);
      //collision_on_chunk(chunk_coordinates);
    //}

    //------------------------------------------------------
    //generable_mesh(chunk_coordinates);
    //collision_on_chunk(chunk_coordinates);

    
    
    //------------------------------------------------------
  }
  else{
    //console.log( "Chunk :", chunk_coordinates, "already exist" )
  }
}



/*
function chunk_gen(){
  var n = 0;

  for (var x = Chunk.data.xMin ; x <= Chunk.data.xMax; x++){
  for (var y = Chunk.data.yMin ; y <= Chunk.data.yMax; y++){
  for (var z = Chunk.data.zMin ; z <= Chunk.data.zMax; z++){
    new_chunk( [x,y,z] );

    n += 1;
    console.log( "chunk :", Math.floor(n/(-Chunk.data.xMin+Chunk.data.xMax+1)/(-Chunk.data.yMin+Chunk.data.yMax+1)/(-Chunk.data.zMin+Chunk.data.zMax+1)*100) );
  }}}
}*/




//Pour retirer l'erreur, remplacer load_spawn par chunk_gen dans le mainChunk
function load_spawn(){

  const nx = Chunk.data.xInit;
  const ny = Chunk.data.yInit;
  const nz = Chunk.data.zInit;

  
  let pourcent = 0;
  for (let x = -nx ; x <= nx; x++){
  for (let y = -ny ; y <= ny; y++){
  for (let z = -nz ; z <= nz; z++){
    new_chunk( [x,y,z] );
    

    
    pourcent += 1;
    console.log( x,y,z,"generated :", Math.floor(100*pourcent/(2*nx+1)/(2*ny+1)/(2*nz+1)) );
    //infoText.innerHTML = Math.floor(pourcent);

    
    
  }}}
  //requestAnimationFrame( main_update );
  
/*
  function forLoopChunk(){
    new_chunk( [x,y,z] );
    pourcent += 1;
    //console.log( x,y,z,"generated :", Math.floor(100*pourcent/(2*nx+1)/(2*ny+1)/(2*nz+1)) );
    //infoText.innerHTML = Math.floor(100*pourcent/(2*nx+1)/(2*ny+1)/(2*nz+1));//14s//13s

    x += 1;
    if( x > nx ){
      x = -nx;
      y += 1;
    }
    if( y > ny ){
      y = -ny;
      z += 1;
    }
    if( z <= nz ){
      requestAnimationFrame( forLoopChunk );
    }else{
      requestAnimationFrame( main_update );
    }

  }

  let pourcent = 0;
  let x = -nx;
  let y = -ny;
  let z = -nz;

  requestAnimationFrame( forLoopChunk )*/


}

function genChunkInit(){
  load_spawn()
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

function gen_DirectionalLight_object(x,y,z,size_area){
  const color = 0xFFFFFF;
  const intensity = 0.5;
  const light = new THREE.DirectionalLight(color, intensity);
  //const size_area = 8;
  light.position.set( x*size_area, y*size_area, z*size_area );

  //résolution ombre
  light.shadow.mapSize.width = 512*4;
  light.shadow.mapSize.height = 512*4;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 500;

  light.shadow.camera = new THREE.OrthographicCamera( -size_area, size_area, size_area, -size_area, 0.1, 500 );
  light.castShadow = true;

  scene.add( light );
  scene.add( light.target );

  //const helper = new THREE.DirectionalLightHelper( light, size_area );
  //scene.add( helper );

  return(light);
  
}

function move_DirectionalLight_object(light,vect,initVect){
  light.position.set(
    initVect.x +  vect.x,
    initVect.y +  vect.y,
    initVect.z +  vect.z,
    );
  light.target.position.set(
    vect.x,
    vect.y,
    vect.z,
    );
}


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
  const Ystart = Math.floor(chunk_coordinates[1]*Chunk.data.chunkSize);
  const Zstart = Math.floor(chunk_coordinates[2]*Chunk.data.chunkSize);
  let verts = [];

  const SIZE = 4;//size of triangle, SIZE>4 : low detail / SIZE < 0.5 : High detail
  //need to be a divisor of Chunk.data.chunkSize

  for (var x = -Chunk.data.chunkSize/2/SIZE; x <= Chunk.data.chunkSize/2/SIZE; x++) {
  for (var z = -Chunk.data.chunkSize/2/SIZE; z <= Chunk.data.chunkSize/2/SIZE; z++) {
    X = Xstart + SIZE*x;
    Z = Zstart + SIZE*z;

    //y = Math.floor(3*Math.sin(X/8)+Math.cos(Z))+5;
    //y = 10+10*noise.perlin2(X/20,Z/20);

    y0 = 30*noise.perlin2(X/500,Z/500);

    //y = 10+10*noise.perlin2(X/y0,Z/y0);
    y1 = y0+20*noise.perlin2(X/200,Z/200);

    y = y1+10*noise.perlin2(X/30,Z/30) + Ystart;

    //( chunk_coordinates[0]===0 && chunk_coordinates[2]===0 )?0:-1;

    //console.log(noise.perlin2(X/30,Z/30));


    const rand = Math.floor(random(0,30));


    if( noise.perlin2(X/25,Z/25) >= 0.1 &&
      Math.abs(X+Z+rand) % 8 === 0 ){

      gen_decoration_arbre(X,y,Z);
    }/*
    if( noise.perlin2(X/10,Z/10) >= 0.3 &&
      Math.abs(X+Z+rand+1) % 30 === 0 ){

      gen_decoration_roche(X,y,Z);
    }*/



    /*
    if ( x === rand1 && z === rand2 ) {
      gen_decoration_arbre(X,y,Z);
    }
    if ( x === rand3 && z === rand4 && y0 >= 45 ) {
      gen_decoration_maison(X,y,Z);

    }*/



    verts.push([SIZE*x,y,SIZE*z]);
  }}
  
  return verts;
}
//=================================================================================
//              vertices to triangles

function vertices_to_square_index(vertices){
  //lenght.vertices need to be an squared integer
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
//              gen_mesh



function gen_meshTerrain(chunk_coordinates){


  const triangles = triangles_from_vertices(create_vertices(chunk_coordinates));
  /*
  if(chunk_coordinates[0]===0&&chunk_coordinates[1]===0&&chunk_coordinates[2]===0){
    console.log("exemple vertices",create_vertices(chunk_coordinates))
    console.log("exemple triangles",triangles)
  }*/
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array( triangles );
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

  geometry.computeVertexNormals();
  geometry.normalizeNormals();

  const material = new THREE.MeshPhongMaterial( { side : THREE.DoubleSide } );

  material.shadowSide = THREE.BackSide;
  //évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
  

  const mesh = new THREE.Mesh( geometry, material );

  mesh.position.set(
    chunk_coordinates[0]*Chunk.data.chunkSize,
    chunk_coordinates[1]*Chunk.data.chunkSize,
    chunk_coordinates[2]*Chunk.data.chunkSize,
    );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  
  put_in_chunk(mesh);
  
  /*
  mesh.material.color = {
    r: 0.8,
    g: 0.3,
    b: 0.0,
  };*/
  mesh.material.color = {
    r: 0.7,
    g: 0.8,
    b: 0.2,
  };
  
  //const group = Chunk.data.list[ chunk_coordinates ].group;
  //worldOctree.fromGraphNode( group );
}

function generable_meshTerrain(chunk_coordinates){
  if( chunk_coordinates in Chunk.data.list ){
      gen_meshTerrain(chunk_coordinates);
    }
}

function gen_Terrain(listChunks){
  
  for (coords of listChunks) {

    if( coords in Chunk.data.list ){
      gen_meshTerrain(coords);
    }
  }
}
//gen_Terrain( [ [0,0,0], [0,0,1] ] )



function genInit(){
  /*

  var n = 0;

  const max = Math.min(
    4,
    Chunk.data.xMax,
    -Chunk.data.xMin,
    //Chunk.data.yMax,
    //-Chunk.data.yMin,
    Chunk.data.zMax,
    -Chunk.data.zMin,
    );
  for (var x = -max; x <= max; x++) {
  for (var z = -max; z <= max; z++) {

    //generable_meshTerrain([x,0,z]);
    n+=1
    console.log( "terrain :", Math.floor(n/(2*max+1)/(2*max+1)*100) )

  }}*/

}
//=================================================================================
// à terme supprimer la partie du haut
//=================================================================================

//=================================================================================
//              UnderGround generator
/*
1100001111
1000011101  0 : air
1000011001
1100001101  1 : solid
1111111100
*/

function underground(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;
  liste = [];
  /*
  const Xstart = Math.floor(chunk_coordinates[0]*n);
  const Ystart = Math.floor(chunk_coordinates[1]*n);  // pourquoi Math.floor ? (penser à enlever / retrouver la raison)
  const Zstart = Math.floor(chunk_coordinates[2]*n);*/

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  for (let x = 0; x < chksize; x++) {

    liste.push([]);

  for (let y = 0; y < chksize; y++) {

    liste[x].push([])

  for (let z = 0; z < chksize; z++) {
    X = Xstart + x;
    Y = Ystart + y;
    Z = Zstart + z;


    const pn3 = (noise.perlin3(X/7,Y/7,Z/7) >= 0) ? 1 : 0;
    liste[x][y].push(pn3);
  }}}
  return(liste)
}

function surface(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;
  liste = [];

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  for (let x = 0; x < chksize; x++) {

    liste.push([]);

  for (let y = 0; y < chksize; y++) {

    liste[x].push([])

  for (let z = 0; z < chksize; z++) {
    
    X = Xstart + x;
    Z = Zstart + z;

    const pn2 = 10+5*noise.perlin2(X/7,Z/7);

    
    if (y <= pn2){
      liste[x][y].push(1);
    }else{
      liste[x][y].push(0);
    }
  }}}
  return(liste)
}



function visualizer(X,Y,Z,underground,surface){

  const cave = new THREE.Group();

  const lenght = 0.3;

  const geo = new THREE.BoxGeometry( lenght, lenght, lenght );
  
  

  for (let x in underground) {
  for (let y in underground[x]) {
  for (let z in underground[x][y]) {
    x = Math.floor(x) // string to int
    y = Math.floor(y) // string to int
    z = Math.floor(z) // string to int

    if(underground[x][y][z] && surface[x][y][z]){

      const mat = new THREE.MeshPhongMaterial();
      const visualBox = new THREE.Mesh( geo, mat );

      //visualBox.castShadow = true;
      //visualBox.receiveShadow = true;

      visualBox.position.set(x,y,z);
      visualBox.material.color = ( (x+y+z) % 2 ) ? { r:0.3, g:1.0, b:0.0 } : { r:1.0, g:0.0, b:0.7 } ;

      cave.add( visualBox );
    }

    
  }}}

  scene.add(cave);
  //put_in_chunk(cave);


  //worldOctree.fromGraphNode( cave );
  cave.position.set(X,Y,Z);
}







function volume_to_surface(volume){

  surface = []

  for (let x in volume) {

    surface.push([]);

  for (let y in volume[x]) {

    surface[x].push([])

  for (let z in volume[x][y]) {

    x = Math.floor(x); // string to int
    y = Math.floor(y); // string to int
    z = Math.floor(z); // string to int

    /*
    const BX1Y0Z0  = (volume[x+1] === undefined) ? 1 : volume[x+1][y][z];
    const BX_1Y0Z0 = (volume[x-1] === undefined) ? 1 : volume[x-1][y][z];
    const BX0Y1Z0  = (volume[x][y+1] === undefined) ? 1 : volume[x][y+1][z];
    const BX0Y_1Z0 = (volume[x][y-1] === undefined) ? 1 : volume[x][y-1][z];
    const BX0Y0Z1  = (volume[x][y][z+1] === undefined) ? 1 : volume[x][y][z+1];
    const BX0Y0Z_1 = (volume[x][y][z-1] === undefined) ? 1 : volume[x][y][z-1];*/

    const X1Y0Z0  = (volume[x+1] === undefined) ? false : !volume[x+1][y][z];
    const X_1Y0Z0 = (volume[x-1] === undefined) ? false : !volume[x-1][y][z];
    const X0Y1Z0  = (volume[x][y+1] === undefined) ? false : !volume[x][y+1][z];
    const X0Y_1Z0 = (volume[x][y-1] === undefined) ? false : !volume[x][y-1][z];
    const X0Y0Z1  = (volume[x][y][z+1] === undefined) ? false : !volume[x][y][z+1];
    const X0Y0Z_1 = (volume[x][y][z-1] === undefined) ? false : !volume[x][y][z-1];
    

    if(volume[x][y][z] === 1){
      // Si le point de volume est adjacent à de l'air ==> point de surface
      if(/*
        (BX1Y0Z0 === 0) || (BX_1Y0Z0 === 0) || 
        (BX0Y1Z0 === 0) || (BX0Y_1Z0 === 0) || 
        (BX0Y0Z1 === 0) || (BX0Y0Z_1 === 0)*/
        X1Y0Z0 || X_1Y0Z0 || X0Y1Z0 || X0Y_1Z0 || X0Y0Z1 || X0Y0Z_1
      ){
        surface[x][y].push( 1 );
      }else{
        surface[x][y].push( 0 );
      }

    }else{
      surface[x][y].push( 0 );
    }
    

  }}}
  return(surface)
}

/*
const LL = [
      [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],

      [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],

      [[0,0,0,0],[0,0,0,1],[0,1,1,1],[1,1,1,1]],

      [[0,0,0,0],[0,0,0,0],[0,0,1,1],[0,1,1,1]],
    ]

LLL = volume_to_surface(LL)

console.log(LLL)

visualizer(0,3,-15,LL,LL);
visualizer(0,3,-20,LLL,LLL);*/

/*
underL = underground([0,0,0])
surfL = surface([0,0,0])

visualizer(0,0,-10,surfL,surfL);
surfLL = volume_to_surface(surfL)
visualizer(0,0,-30, surfLL ,surfLL);

visualizer(0,0,-50,underL,surfL);
underLL = volume_to_surface(underL)
visualizer(0,0,-70, underLL ,surfL);
*/




//=================================================================================
//              2D Terrain holes

function index_generator(){ // ALL CHUNK
  // dépend de Chunk.data.chunkSize
  const chksize = Chunk.data.chunkSize;
  let L = [];
  let i = 0;
  for (let x = 0; x <= chksize; x++) {
    L.push([]);
  for (let z = 0; z <= chksize; z++) {
    L[x].push(i)
    i += 1;
  }}
  return(L)
}

const index_list = index_generator()

//--------------------------------
/*
function generate_vertices(chunk_coordinates){
  let L = [];

  const chksize = Chunk.data.chunkSize;

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  //for( x = 0; x <= chksize; x++){
  //for( z = 0; z <= chksize; z++){
  for( x = -chksize/2; x <= chksize/2; x++){
  for( z = -chksize/2; z <= chksize/2; z++){
    X = Xstart + x;
    Y = Ystart;
    Z = Zstart + z;


    //y0 = 20+30*noise.perlin2(X/200,Z/200);

    //y1 = y0+30*noise.perlin2(X/80,Z/80);

    y = 10*noise.perlin2(X/30,Z/30)//Math.random();//y1+10*noise.perlin2(X/30,Z/30) + Ystart;

    L.push( [x,y,z] );
  }}
  return(L)
}*/

function generate_vertices_V2(chunk_coordinates){
  let L = [];

  const chksize = Chunk.data.chunkSize;

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;
  //console.log(Xstart,Ystart,Zstart)

  //for( x = 0; x <= chksize; x++){
  //for( z = 0; z <= chksize; z++){
  for( x = -chksize/2; x <= chksize/2; x++){
  for( z = -chksize/2; z <= chksize/2; z++){


    X = Xstart + x;
    Z = Zstart + z;

    //y = -Ystart + Math.floor( 40*noise.perlin2(X/30,Z/30) );//discret
    //y = -Ystart + 40*noise.perlin2(X/30,Z/30) ;//continu

    
    y0 = 5*noise.perlin2(X/300,Z/300);
    y = 20*noise.perlin2(X/30,Z/30) + y0;//continu
    

    const obj = {
      position : [x,y,z],
      exist : false,
    }

    if( y >= 0 && y <= chksize ){
      obj.exist = true;
    }

    L.push( obj )
  }}
  return(L)
}

//--------------------------------
/*
function index_to_triangle(posInChunk,vertices){ // ex : posInChunk = [0,0] ---> [x,y] 0,0 <= x,y <= chkSize,chkSize

  //  a b
  //  c d  --->  [Pa,Pb,Pc, Pd,Pc,Pb] si x + z = pair ou [Pa,Pb,Pd, Pd,Pc,Pa] si x + z = impair

  const X = posInChunk[0];
  const Z = posInChunk[1];

  const a = index_list[X][Z];
  const b = index_list[X][Z+1];
  const c = index_list[X+1][Z];
  const d = index_list[X+1][Z+1];
  //console.log("test :",a,b,c,d)

  let tri;

  if( (X+Z) % 2 === 0 ){
    tri = [
    vertices[a] , vertices[b] , vertices[c] , // Permettre la non génération des triangles
    vertices[d] , vertices[c] , vertices[b] ,
    ]
  }
  if( (X+Z) % 2 === 1 ){
    tri = [
    vertices[a] , vertices[b] , vertices[d] , // Permettre la non génération des triangles
    vertices[d] , vertices[c] , vertices[a] ,
    ]
  }
  //console.log("tri :",tri)
  return(tri);
}*/

/*
function index_to_triangle_hole(posInChunk,vertices){ // ex : posInChunk = [0,0] ---> [x,y] 0,0 <= x,y <= chkSize,chkSize

  //  a b
  //  c d  --->  [Pa,Pb,Pc, Pd,Pc,Pb] si x + z = pair ou [Pa,Pb,Pd, Pd,Pc,Pa] si x + z = impair

  const X = posInChunk[0];
  const Z = posInChunk[1];

  const a = index_list[X][Z];
  const b = index_list[X][Z+1];
  const c = index_list[X+1][Z];
  const d = index_list[X+1][Z+1];
  //console.log("test :",a,b,c,d)

  let tri = [];

  const seuil = -4;
  
  if( (X+Z) % 2 === 0 ){

    if( vertices[a][1] >= seuil && vertices[b][1] >= seuil && vertices[c][1] >= seuil && vertices[d][1] >= seuil){
      tri = [
        vertices[a] , vertices[b] , vertices[c] ,
        vertices[d] , vertices[c] , vertices[b] ,
        ]
      return(tri)
    }
    if(vertices[a][1] >= seuil && vertices[b][1] >= seuil && vertices[c][1] >= seuil){
      tri = [
        vertices[a] , vertices[b] , vertices[c] ,
        ]
      return(tri)
    }
    if(vertices[d][1] >= seuil && vertices[b][1] >= seuil && vertices[c][1] >= seuil){
      tri = [
        vertices[d] , vertices[c] , vertices[b] ,
        ]
      return(tri)
    }

  }
  if( (X+Z) % 2 === 1 ){

    if( vertices[a][1] >= seuil && vertices[b][1] >= seuil && vertices[c][1] >= seuil && vertices[d][1] >= seuil){
      tri = [
        vertices[a] , vertices[b] , vertices[d] ,
        vertices[d] , vertices[c] , vertices[a] ,
        ]
      return(tri)
    }
    if( vertices[a][1] >= seuil && vertices[b][1] >= seuil && vertices[d][1] >= seuil){
      tri = [
        vertices[a] , vertices[b] , vertices[d] ,
        ]
      return(tri)
    }
    if( vertices[a][1] >= seuil && vertices[c][1] >= seuil && vertices[d][1] >= seuil){
      tri = [
        vertices[d] , vertices[c] , vertices[a] ,
        ]
      return(tri)
    }
  }
  //console.log("tri :",tri)
  return(tri);
}*/

function index_to_triangle_V2(posInChunk,vertices){ // ex : posInChunk = [0,0] ---> [x,y] 0,0 <= x,y <= chkSize,chkSize

  //  a b
  //  c d  --->  [Pa,Pb,Pc, Pd,Pc,Pb] si x + z = pair ou [Pa,Pb,Pd, Pd,Pc,Pa] si x + z = impair

  const X = posInChunk[0];
  const Z = posInChunk[1];

  const a = index_list[X][Z];
  const b = index_list[X][Z+1];
  const c = index_list[X+1][Z];
  const d = index_list[X+1][Z+1];
  //console.log("test :",a,b,c,d)

  let tri = [];

  if( (X+Z) % 2 === 0 ){
    /*
    tri = [
    vertices[a].position , vertices[b].position , vertices[c].position ,
    vertices[d].position , vertices[c].position , vertices[b].position ,
    ]*/
    if( vertices[a].exist && vertices[b].exist && vertices[c].exist ){
      tri.push(vertices[a].position);
      tri.push(vertices[b].position);
      tri.push(vertices[c].position);
    }
    if( vertices[d].exist && vertices[c].exist && vertices[b].exist ){
      tri.push(vertices[d].position);
      tri.push(vertices[c].position);
      tri.push(vertices[b].position);
    }

  }
  if( (X+Z) % 2 === 1 ){
    /*
    tri = [
    vertices[a].position , vertices[b].position , vertices[d].position ,
    vertices[d].position , vertices[c].position , vertices[a].position ,
    ]*/
    if( vertices[a].exist && vertices[b].exist && vertices[d].exist ){
      tri.push(vertices[a].position);
      tri.push(vertices[b].position);
      tri.push(vertices[d].position);
    }
    if( vertices[d].exist && vertices[c].exist && vertices[a].exist ){
      tri.push(vertices[d].position);
      tri.push(vertices[c].position);
      tri.push(vertices[a].position);
    }
  }
  //console.log("tri :",tri)
  return(tri);
}

/*
function triangles_to_floats1(triangles,vertices){
  let L = []
  for( tri of triangles ){
  for( index of tri ){
    const p = vertices[index];
  for( i of p ){
    L.push(i);
  }}}
  return(L)
}*/

function triangles_to_floats(triangles){
  let L = []
  for( tri of triangles ){
  for( vect of tri ){
  for( i of vect ){
    L.push(i);
  }}}
  return(L)
}

function generate_triangles(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  //verts = generate_vertices(chunk_coordinates);
  //verts = generate_vertices_V2(chunk_coordinates);
  verts = vertices_surface_gen(chunk_coordinates);

  triangles = [];

  for( x = 0; x < chksize; x++){
  for( z = 0; z < chksize; z++){
    //triangles.push( index_to_triangle( [x,z] ,verts) );
    triangles.push( index_to_triangle_V2( [x,z] ,verts) );
  }}



  return(triangles)
}

/*
function temp_antiundefined(liste){
  let L = [];
  for( e of liste){
    if( e != undefined){
      L.push(e)
    }
  }
  return(L)
}*/

function gen_mesh(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  const tris = generate_triangles( chunk_coordinates );
  const trisfloat = triangles_to_floats(tris);

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array( trisfloat );
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

  geometry.computeVertexNormals();
  geometry.normalizeNormals();

  const material = new THREE.MeshPhongMaterial( {side : THREE.DoubleSide} );

  material.shadowSide = THREE.BackSide;
  //évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
  

  const mesh = new THREE.Mesh( geometry, material );
  //console.log(mesh.geometry.attributes.position)

  mesh.position.set(
    chunk_coordinates[0]*chksize,
    chunk_coordinates[1]*chksize,
    chunk_coordinates[2]*chksize,
    );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.material.color = {
    r: 0.8,
    g: 0.5+0.1*chunk_coordinates[1],
    b: 0.0,
  };

  
  put_in_chunk(mesh);
}


function generable_mesh(chunk_coordinates){
  if( chunk_coordinates in Chunk.data.list ){
      gen_mesh(chunk_coordinates);
    }
}


//new Chunk([1,0,0]);
//gen_mesh( [1,0,0] )





/*

let tris = generate_triangles( [0,0,0] );

trisfloat = triangles_to_floats(tris)






  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array( trisfloat );
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

  geometry.computeVertexNormals();
  geometry.normalizeNormals();

  const material = new THREE.MeshPhongMaterial( { side : THREE.DoubleSide } );

  material.shadowSide = THREE.BackSide;
  //évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
  

  const mesh = new THREE.Mesh( geometry, material );
  //console.log(mesh.geometry.attributes.position)

  mesh.position.set(
    0.0,
    0.1,
    0.0,
    );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  
  put_in_chunk(mesh);
  //scene.add(mesh);
  
  
  mesh.material.color = {
    r: 0.8,
    g: 0.3,
    b: 0.0,
  };



*/











/*
//console.log( create_vertices([0,0,0]) );
//console.log( triangles_from_vertices(create_vertices([0,0,0])) );

{
  const verts = [
    [0.,0.,0.], [1.,0.,0.], [2.,0.,0.], [3.,0.,0.],
    [0.,0.,1.], [1.,0.,1.], [2.,0.,1.], [3.,0.,1.],
    [0.,0.,2.], [1.,0.,2.], [2.,0.,2.], [3.,0.,2.],
    [0.,0.,3.], [1.,0.,3.], [2.,0.,3.], [3.,0.,3.],
    ]


  //console.log("verts",verts)

  const triangles = [ // triangles non-alternés
    [0,1,3], [1,2,4],
    [4,3,1], [5,4,2],

    //[3,4,6], //[4,5,7],
    [7,6,4], //[8,7,5],
    ]
    
  const triangles = [ // triangles alternés
    [0,1,3], [1,2,5],
    [4,3,1], [5,4,1],

    //[3,4,7], //[4,5,7],
    [7,6,3], //[8,7,5],
    ]
  
  for( tri of triangles ){
    console.log("tri",tri)
    for( index of tri ){
      console.log("verts[index]",verts[index])
      for( i of verts[index]){
        console.log("i",i)
      }
    }
  }

  //console.log("triangles",triangles)
  //console.log(triangles_to_floats1(triangles,verts))

  _triangles = triangles_to_floats1(triangles,verts);
  //console.log(_triangles)

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array( _triangles );
  //console.log(vertices)
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

  geometry.computeVertexNormals();
  geometry.normalizeNormals();

  const material = new THREE.MeshPhongMaterial( { side : THREE.DoubleSide } );

  material.shadowSide = THREE.BackSide;
  //évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
  

  const mesh = new THREE.Mesh( geometry, material );
  //console.log(mesh.geometry.attributes.position)

  mesh.position.set(
    0.0,
    -0.1,
    0.0,
    );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  
  //put_in_chunk(mesh);
  scene.add(mesh);
  
  
  mesh.material.color = {
    r: 0.8,
    g: 0.3,
    b: 0.0,
  };
}*/

/*
const verts = [
    [0.,0.,0.], [1.,0.,0.], [2.,0.,0.], [3.,0.,0.],
    [0.,0.,1.], [1.,0.,1.], [2.,0.,1.], [3.,0.,1.],
    [0.,0.,2.], [1.,0.,2.], [2.,0.,2.], [3.,0.,2.],
    [0.,0.,3.], [1.,0.,3.], [2.,0.,3.], [3.,0.,3.],
    ]

const dir = [
    0, -1, 0, 0,
    -1, 0, 0, 1,
    0, 0, 0, 1,
    0, 0, 1, 0,
    ]*/


//==================================

function gen_y(x,Ystart,z){
  let L = [];

  const chksize = Chunk.data.chunkSize;

  for( let y = Ystart - chksize/2 - 1; y <= Ystart + chksize/2; y++ ){
      //taille de la liste chksize+1
      //pour connaître le point hors chunk pour surface_gen_y
    ynoise = noise.perlin3(x/30,y/30,z/30);
    Y = (ynoise >= 0) ? 1 : 0;
    L.push(Y)
  }
  return(L)
}

function surface_gen_y(liste){
  //liste = [1,1,1,0,0,0,1,1,0,1,1,0,...]
  let L = [];

  for( let i = 1; i < liste.length; i++){
    diff = liste[i] - liste[i-1]
    L.push(diff)
  }
  return(L)
}

function surface_gen(chunk_coordinates){
  let L = {};

  const chksize = Chunk.data.chunkSize;

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {
    const ylist = surface_gen_y(gen_y( x + Xstart, Ystart, z + Zstart ))
    L[[x,z]] = ylist;
  }}
  return(L)
}


function visualizer_surface_gen(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  const cave = new THREE.Group();

  const lenght = 0.3;

  const geo = new THREE.BoxGeometry( lenght, lenght, lenght );
  const mat1 = new THREE.MeshPhongMaterial( {color : "#ff0000"} );
  const mat0 = new THREE.MeshPhongMaterial( {color : "#00ff00"} );
  const mat_1 = new THREE.MeshPhongMaterial( {color : "#0000ff"} );
  
  
  const surface = surface_gen(chunk_coordinates);

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let y = 0; y <= chksize; y++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {


    if( surface[[x,z]][y] === 1 ){
      
      const visualBox = new THREE.Mesh( geo, mat1 );
      visualBox.position.set(x,y,z);
      cave.add( visualBox );
    }
    /*
    if( surface[[x,z]][y] === 0 ){
      
      const visualBox = new THREE.Mesh( geo, mat0 );
      visualBox.position.set(x,y,z);
      cave.add( visualBox );
    }*/
    if( surface[[x,z]][y] === -1 ){
      
      const visualBox = new THREE.Mesh( geo, mat_1 );
      visualBox.position.set(x,y,z);
      cave.add( visualBox );
    }

    
    

    
  }}}

  scene.add(cave);
  //put_in_chunk(cave);


  //worldOctree.fromGraphNode( cave );
  cave.position.set(Xstart,Ystart,Zstart);
}

/*
for(let x = -3; x <= 3; x++){
for(let y = -1; y <= 1; y++){
for(let z = -3; z <= 3; z++){
  visualizer_surface_gen([x,y,z]);
}}}
*/
/*const obj = {
      position : [x,y,z],
      exist : false,
    }*/

function vertices_surface_gen(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;
  
  let L = [];
  
  const surface = surface_gen(chunk_coordinates);

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let y = 0; y <= chksize; y++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {

    const obj = {
        position : [x,y-chksize/2,z],
        exist : false,
      }

    if( surface[[x,z]][y] === 1 ){
      obj.exist = true;
    }
  }}}
  return(L)
}

function index_generator(){ // ALL CHUNK
  // dépend de Chunk.data.chunkSize
  const chksize = Chunk.data.chunkSize;
  let L = [];
  let i = 0;
  for (let x = 0; x <= chksize; x++) {
    L.push([]);
  for (let z = 0; z <= chksize; z++) {
    L[x].push(i)
    i += 1;
  }}
  return(L)
}

//const index_list = index_generator()

//===========================================================================

function visualizer2(map, chunk_coordinates, l = .3, detail = 1, c0 = "#ffffff", c1 = "#ffffff" ){
  const chksize = Chunk.data.chunkSize;

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  const cave = new THREE.Group();

  const geo = new THREE.BoxGeometry( l, l, l );

  for (let x = -chksize/2; x <= chksize/2; x += detail) {
  for (let y = -chksize/2; y <= chksize/2; y += detail) {
  for (let z = -chksize/2; z <= chksize/2; z += detail) {

    if( map[[x,y,z]] === 1 ){
      const mat = new THREE.MeshPhongMaterial( {color : c0});
      const visualBox = new THREE.Mesh( geo, mat );

      visualBox.position.set(x,y,z);
      cave.add( visualBox );
    }
    if( map[[x,y,z]] === 0 ){
    }
    if( map[[x,y,z]] === -1 ){
      const mat = new THREE.MeshPhongMaterial( {color : c1});
      const visualBox = new THREE.Mesh( geo, mat );

      visualBox.position.set(x,y,z);
      cave.add( visualBox );
    }
    
  }}}


  scene.add(cave);
  cave.position.set(Xstart,Ystart,Zstart);

  return(map)
}

//----

function underground_gen(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;
  const map = {};

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  for (let x = -chksize/2 - 1; x <= chksize/2 + 1; x++) {
  for (let y = -chksize/2 - 1; y <= chksize/2 + 1; y++) {
  for (let z = -chksize/2 - 1; z <= chksize/2 + 1; z++) {
    //-chksize/2 - 1 et chksize/2 + 1 pour connaître l'état des bords

    const X = Xstart + x;
    const Y = Ystart + y;
    const Z = Zstart + z;

    const pn3 = (noise.perlin3(X/50,Y/50,Z/50) >= 0) ? 1 : 0;
    map[[x,y,z]] = pn3;
  }}}
  return(map)
}


function test_air(map){

  const chksize = Chunk.data.chunkSize;

  const newMap = {};

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let y = -chksize/2; y <= chksize/2; y++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {
    if(map[[x,y,z]]){
      if(!map[[x-1,y,z]] || !map[[x+1,y,z]] || !map[[x,y-1,z]] || !map[[x,y+1,z]] || !map[[x,y,z-1]] || !map[[x,y,z+1]]  ){
        newMap[[x,y,z]] = 1;
      }else{
        newMap[[x,y,z]] = 0;
      }
    }else{
      newMap[[x,y,z]] = 0;
    }
    
  }}}
  return(newMap)
}

function d_dx(map){

  const chksize = Chunk.data.chunkSize;

  const newMap = {};

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let y = -chksize/2; y <= chksize/2; y++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {
    newMap[[x,y,z]] = map[[x,y,z]] - map[[x+1,y,z]]
    
  }}}
  return(newMap)
}
function d_dy(map){

  const chksize = Chunk.data.chunkSize;

  const newMap = {};

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let y = -chksize/2; y <= chksize/2; y++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {
    newMap[[x,y,z]] = map[[x,y,z]] - map[[x,y+1,z]]
    
  }}}
  return(newMap)
}
function d_dz(map){

  const chksize = Chunk.data.chunkSize;

  const newMap = {};

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let y = -chksize/2; y <= chksize/2; y++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {
    newMap[[x,y,z]] = map[[x,y,z]] - map[[x,y,z+1]]
    
  }}}
  return(newMap)
}




function sort_vertices_by_direction(map){

  const chksize = Chunk.data.chunkSize;

  const obj = {
    "+" : [],
    "-" : [],
  };

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let y = -chksize/2; y <= chksize/2; y++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {

    switch(map[[x,y,z]]){
      case 1 :
        //obj["+"][[x,y,z]] = true;
        obj["+"].push([x,y,z].toString());
        break;
      case 0 :
        break;
      case -1 :
        //obj["-"][[x,y,z]] = true;
        obj["-"].push([x,y,z].toString());
        break;
    }
    
  }}}
  return(obj)
}









/*
for(let i = -0; i <= 8; i++){
for(let j = -0; j <= 8; j++){
for(let k = -0; k <= 0; k++){
  const map = underground_gen([i,j,k])
  visualizer2(map,[i,j,k],.3,4,"#000000")
  visualizer2(map,[i+12,j,k],.3,4,"#000000")
  visualizer2(map,[i+12,j+12,k],.3,4,"#000000")
  visualizer2(map,[i,j+12,k],.3,4,"#000000")

  const testair = test_air(map);
  visualizer2(testair,[i,j,k],.5,1,"#ff0000")

  const mapx = d_dx(map);
  visualizer2(mapx,[i+12,j,k],.5,1,"#00ff00","#0000ff")

  const mapy = d_dy(map);
  visualizer2(mapy,[i+12,j+12,k],.5,1,"#00ff00","#0000ff")

  const mapz = d_dz(map);
  visualizer2(mapz,[i,j+12,k],.5,1,"#00ff00","#0000ff")
}}}*/


/*
for(let i = -0; i <= 0; i++){
for(let j = 0; j <= 0; j++){
for(let k = -0; k <= 0; k++){
  const map = underground_gen([i,j,k])
  visualizer2(map,[i,j,k],.3,1,"#000000")

  const mapy = d_dy(map);
  visualizer2(mapy,[i,j,k],.5,1,"#00ff00","#0000ff")
}}}*/



const map0 = underground_gen([0,4,0])
//visualizer2(map0,[0,4,0],.1,1,"#000000")

const map0air = test_air(map0)
visualizer2(map0air,[0,4,0],.3,1,"#00ff00")

/*
const map1 = underground_gen([0,4,2])
visualizer2(map1,[0,4,2],.1,1,"#000000")

const map1air = test_air(map1)
visualizer2(map1air,[0,4,2],.3,1,"#00ff00")


const map2 = underground_gen([0,4,-4])
visualizer2(map2,[0,4,-4],.1,1,"#000000")

const map2air = test_air(map2)
visualizer2(map2air,[0,4,-4],.3,1,"#00ff00")


const map3 = underground_gen([1,3,-4])
visualizer2(map3,[1,3,-4],.1,1,"#000000")

const map3air = test_air(map3)
visualizer2(map3air,[1,3,-4],.3,1,"#00ff00")
*/

/*
for (let x = -3; x <= 3; x++) {
for (let y = 0; y <= 12; y++) {
for (let z = -3; z <= 3; z++) {
  const map = underground_gen([x,y,z])

  const mapair = test_air(map)
  visualizer2(mapair,[x,y,z],.3,1,"#00ff00")
}}}*/



//const mapy0 = d_dy(map0);
//visualizer2(mapy0,[0,4,0],.5,1,"#00ff00","#0000ff")
/*
const map1 = underground_gen([0,3,0])
visualizer2(map1,[0,2,0],.3,1,"#ffffff")

const mapy1 = d_dy(map1);
visualizer2(mapy1,[0,2,0],.5,1,"#ffff00","#0000ff")
*/


function array_to_triangle_sup(vertices){

  const chksize = Chunk.data.chunkSize;

  const square = [];
    
  //if( vertices.indexOf(["-2,somey,-2"]) !== -1 && array.indexOf(["-2+1,somey,-2"]) && array.indexOf(["-2,somey,-2+1"]) ){console.log("ok0")}
  //if( vertices.indexOf(["1,somey,1"]) && array.indexOf(["1+1,somey,2"]) && array.indexOf(["1,somey,1+1"]) ){console.log("ok0")}

  for(let x = -chksize/2; x < chksize/2; x++){
  for(let z = -chksize/2; z < chksize/2; z++){

    const pointA = [x,0,z]
    const pointB = [x+1,0,z]
    const pointC = [x,0,z+1]
    const pointD = [x+1,0,z+1]

    boolA = vertices.indexOf(pointA.toString()) !== -1;
    boolB = vertices.indexOf(pointB.toString()) !== -1;
    boolC = vertices.indexOf(pointC.toString()) !== -1;
    boolD = vertices.indexOf(pointD.toString()) !== -1;

    if(boolA /*&& boolB && boolC && boolD*/){
      square.push(pointA, pointB, pointC);
      square.push(pointD, pointC, pointB);
    }
  }}

  return(square);
}

function triangles_to_floats2(triangles){
  console.log("trig",triangles)
  let L = []
  for( tri of triangles ){
  for( i of tri ){
    for( j of i ){

    L.push(j);
  }
  }}
  return(L)
}

function gen_mesh2(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  const tris = array_to_triangle_sup( sort_vertices_by_direction( d_dy( underground_gen(chunk_coordinates) ) )["+"] );

  const trisfloat1 = triangles_to_floats2(tris);

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array( trisfloat1 );
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

  geometry.computeVertexNormals();
  geometry.normalizeNormals();

  const material = new THREE.MeshPhongMaterial(  );//{side : THREE.DoubleSide}

  material.shadowSide = THREE.BackSide;
  //évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
  

  const mesh = new THREE.Mesh( geometry, material );
  //console.log(mesh.geometry.attributes.position)

  mesh.position.set(
    chunk_coordinates[0]*chksize,
    chunk_coordinates[1]*chksize,
    chunk_coordinates[2]*chksize,
    );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.material.color = {
    r: 0.8,
    g: 0.5+0.1*chunk_coordinates[1],
    b: 0.0,
  };

  put_in_chunk(mesh);
}

//new_chunk( [0,4,0] );
//gen_mesh2( [0,4,0] );



const map00 = underground_gen([0,4,0]);
const map00y = d_dy(map00);
const objmap00y = sort_vertices_by_direction(map00y);

//console.log("objmap00y[\"+\"]",objmap00y["+"]);
/*
const trimap00y = array_to_triangle_sup(objmap00y["+"]);
console.log("array to triangles", trimap00y );
const floatmap00y = triangles_to_floats2(trimap00y);
console.log("triangle to floats", floatmap00y );*/



//=================================================================================
//              UnderGround generator
/*
1100001111
1000011101  0 : air
1000011001
1100001101  1 : solid
1111111100
*/

function underground(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;
  let liste = [];
  /*
  const Xstart = Math.floor(chunk_coordinates[0]*n);
  const Ystart = Math.floor(chunk_coordinates[1]*n);  // pourquoi Math.floor ? (penser à enlever / retrouver la raison)
  const Zstart = Math.floor(chunk_coordinates[2]*n);*/

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  for (let x = 0; x < chksize; x++) {

    liste.push([]);

  for (let y = 0; y < chksize; y++) {

    liste[x].push([])

  for (let z = 0; z < chksize; z++) {
    X = Xstart + x;
    Y = Ystart + y;
    Z = Zstart + z;


    const pn3 = (noise.perlin3(X/7,Y/7,Z/7) >= 0) ? 1 : 0;
    liste[x][y].push(pn3);
  }}}
  return(liste)
}

function surface(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;
  let liste = [];

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  for (let x = 0; x < chksize; x++) {

    liste.push([]);

  for (let y = 0; y < chksize; y++) {

    liste[x].push([])

  for (let z = 0; z < chksize; z++) {
    
    X = Xstart + x;
    Z = Zstart + z;

    const pn2 = 10+5*noise.perlin2(X/7,Z/7);

    
    if (y <= pn2){
      liste[x][y].push(1);
    }else{
      liste[x][y].push(0);
    }
  }}}
  return(liste)
}



function visualizer(X,Y,Z,underground,surface){

  const cave = new THREE.Group();

  const lenght = 0.3;

  const geo = new THREE.BoxGeometry( lenght, lenght, lenght );
  
  

  for (let x in underground) {
  for (let y in underground[x]) {
  for (let z in underground[x][y]) {
    x = Math.floor(x) // string to int
    y = Math.floor(y) // string to int
    z = Math.floor(z) // string to int

    if(underground[x][y][z] && surface[x][y][z]){

      const mat = new THREE.MeshPhongMaterial();
      const visualBox = new THREE.Mesh( geo, mat );

      //visualBox.castShadow = true;
      //visualBox.receiveShadow = true;

      visualBox.position.set(x,y,z);
      visualBox.material.color = ( (x+y+z) % 2 ) ? { r:0.3, g:1.0, b:0.0 } : { r:1.0, g:0.0, b:0.7 } ;

      cave.add( visualBox );
    }

    
  }}}

  scene.add(cave);
  //put_in_chunk(cave);


  //worldOctree.fromGraphNode( cave );
  cave.position.set(X,Y,Z);
}







function volume_to_surface(volume){

  surface = []

  for (let x in volume) {

    surface.push([]);

  for (let y in volume[x]) {

    surface[x].push([])

  for (let z in volume[x][y]) {

    x = Math.floor(x); // string to int
    y = Math.floor(y); // string to int
    z = Math.floor(z); // string to int

    /*
    const BX1Y0Z0  = (volume[x+1] === undefined) ? 1 : volume[x+1][y][z];
    const BX_1Y0Z0 = (volume[x-1] === undefined) ? 1 : volume[x-1][y][z];
    const BX0Y1Z0  = (volume[x][y+1] === undefined) ? 1 : volume[x][y+1][z];
    const BX0Y_1Z0 = (volume[x][y-1] === undefined) ? 1 : volume[x][y-1][z];
    const BX0Y0Z1  = (volume[x][y][z+1] === undefined) ? 1 : volume[x][y][z+1];
    const BX0Y0Z_1 = (volume[x][y][z-1] === undefined) ? 1 : volume[x][y][z-1];*/

    const X1Y0Z0  = (volume[x+1] === undefined) ? false : !volume[x+1][y][z];
    const X_1Y0Z0 = (volume[x-1] === undefined) ? false : !volume[x-1][y][z];
    const X0Y1Z0  = (volume[x][y+1] === undefined) ? false : !volume[x][y+1][z];
    const X0Y_1Z0 = (volume[x][y-1] === undefined) ? false : !volume[x][y-1][z];
    const X0Y0Z1  = (volume[x][y][z+1] === undefined) ? false : !volume[x][y][z+1];
    const X0Y0Z_1 = (volume[x][y][z-1] === undefined) ? false : !volume[x][y][z-1];
    

    if(volume[x][y][z] === 1){
      // Si le point de volume est adjacent à de l'air ==> point de surface
      if(/*
        (BX1Y0Z0 === 0) || (BX_1Y0Z0 === 0) || 
        (BX0Y1Z0 === 0) || (BX0Y_1Z0 === 0) || 
        (BX0Y0Z1 === 0) || (BX0Y0Z_1 === 0)*/
        X1Y0Z0 || X_1Y0Z0 || X0Y1Z0 || X0Y_1Z0 || X0Y0Z1 || X0Y0Z_1
      ){
        surface[x][y].push( 1 );
      }else{
        surface[x][y].push( 0 );
      }

    }else{
      surface[x][y].push( 0 );
    }
    

  }}}
  return(surface)
}

/*
const LL = [
      [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],

      [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],

      [[0,0,0,0],[0,0,0,1],[0,1,1,1],[1,1,1,1]],

      [[0,0,0,0],[0,0,0,0],[0,0,1,1],[0,1,1,1]],
    ]

LLL = volume_to_surface(LL)

console.log(LLL)

visualizer(0,3,-15,LL,LL);
visualizer(0,3,-20,LLL,LLL);*/

/*
underL = underground([0,0,0])
surfL = surface([0,0,0])

visualizer(0,0,-10,surfL,surfL);
surfLL = volume_to_surface(surfL)
visualizer(0,0,-30, surfLL ,surfLL);

visualizer(0,0,-50,underL,surfL);
underLL = volume_to_surface(underL)
visualizer(0,0,-70, underLL ,surfL);
*/




//=================================================================================
//              2D Terrain holes
/*
function index_generator(){ // ALL CHUNK
  // dépend de Chunk.data.chunkSize
  const chksize = Chunk.data.chunkSize;
  let L = [];
  let i = 0;
  for (let x = 0; x <= chksize; x++) {
    L.push([]);
  for (let z = 0; z <= chksize; z++) {
    L[x].push(i)
    i += 1;
  }}
  return(L)
}

const index_list = index_generator()
*/
//--------------------------------

function generate_vertices(chunk_coordinates){
  let L = [];

  const chksize = Chunk.data.chunkSize;

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;
  //console.log(Xstart,Ystart,Zstart)

  //for( x = 0; x <= chksize; x++){
  //for( z = 0; z <= chksize; z++){
  for( x = -chksize/2; x <= chksize/2; x++){
  for( z = -chksize/2; z <= chksize/2; z++){


    X = Xstart + x;
    Z = Zstart + z;

    //y = -Ystart + Math.floor( 40*noise.perlin2(X/30,Z/30) );//discret
    //y = -Ystart + 40*noise.perlin2(X/30,Z/30) ;//continu

    
    y0 = 100*noise.perlin2(X/300,Z/300);
    y = -Ystart + 20*noise.perlin2(X/30,Z/30) + y0;//continu
    //y = Math.floor(y);
    

    const obj = {
      position : [x,y,z],
      exist : false,
      status : "SUP",
    }

    if( y >= 0 && y <= chksize ){
      obj.exist = true;
    }

    L.push( obj )
  }}
  return(L)
}

//--------------------------------

//==================================

function gen_y(x,Ystart,z){
  let L = [];

  const chksize = Chunk.data.chunkSize;

  for( let y = Ystart - chksize/2 - 1; y <= Ystart + chksize/2; y++ ){
      //taille de la liste chksize+1
      //pour connaître le point hors chunk pour surface_gen_y
    ynoise = noise.perlin3(x/30,y/30,z/30);
    Y = (ynoise >= 0) ? 1 : 0;
    L.push(Y)
  }
  return(L)
}

function surface_gen_y(liste){
  //liste = [1,1,1,0,0,0,1,1,0,1,1,0,...]
  let L = [];

  for( let i = 1; i < liste.length; i++){
    diff = liste[i] - liste[i-1]
    L.push(diff)
  }
  return(L)
}

function surface_gen(chunk_coordinates){
  let L = {};

  const chksize = Chunk.data.chunkSize;

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {
    const ylist = surface_gen_y(gen_y( x + Xstart, Ystart, z + Zstart ))
    L[[x,z]] = ylist;
  }}
  return(L)
}


function visualizer_surface_gen(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  const cave = new THREE.Group();

  const lenght = 0.3;

  const geo = new THREE.BoxGeometry( lenght, lenght, lenght );
  const mat1 = new THREE.MeshPhongMaterial( {color : "#ff0000"} );
  const mat0 = new THREE.MeshPhongMaterial( {color : "#00ff00"} );
  const mat_1 = new THREE.MeshPhongMaterial( {color : "#0000ff"} );
  
  
  const surface = surface_gen(chunk_coordinates);

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let y = 0; y <= chksize; y++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {


    if( surface[[x,z]][y] === 1 ){
      
      const visualBox = new THREE.Mesh( geo, mat1 );
      visualBox.position.set(x,y,z);
      cave.add( visualBox );
    }
    /*
    if( surface[[x,z]][y] === 0 ){
      
      const visualBox = new THREE.Mesh( geo, mat0 );
      visualBox.position.set(x,y,z);
      cave.add( visualBox );
    }*/
    if( surface[[x,z]][y] === -1 ){
      
      const visualBox = new THREE.Mesh( geo, mat_1 );
      visualBox.position.set(x,y,z);
      cave.add( visualBox );
    }

    
    

    
  }}}

  scene.add(cave);
  //put_in_chunk(cave);


  //worldOctree.fromGraphNode( cave );
  cave.position.set(Xstart,Ystart,Zstart);
}

/*
for(let x = -3; x <= 3; x++){
for(let y = -1; y <= 1; y++){
for(let z = -3; z <= 3; z++){
  visualizer_surface_gen([x,y,z]);
}}}*/

/*
function vertices_surface_gen(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;
  
  let L = [];
  
  const surface = surface_gen(chunk_coordinates);

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let y = 0; y <= chksize; y++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {

    const obj = {
        position : [x,y-chksize/2,z],
        exist : false,
      }

    if( surface[[x,z]][y] === 1 ){
      obj.exist = true;
    }
    L.push( obj );
  }}}
  return(L)
}*/

function vertices_surface_gen(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;
  
  let L = [];
  
  const surface = surface_gen(chunk_coordinates);

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {
    
    const obj = {
          position : [x,0,z],
          exist : false,
          status : "SUP",
        }

    for (let y in surface[[x,z]] ) {

      

      if( surface[[x,z]][y] === 1 ){
        obj.position = [x,y-chksize/2,z]
        obj.exist = true;
        break
      }
      
    }
    L.push( obj );
  }}
  return(L)
}

function vertices_sousterrain_gen(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;
  
  let L = [];
  
  const surface = surface_gen(chunk_coordinates);

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {
    
    const obj = {
          position : [x,0,z],
          exist : false,
          status : "SUB",
        }

    for (let y in surface[[x,z]] ) {

      

      if( surface[[x,z]][y] === -1 ){
        obj.position = [x,y-chksize/2,z]
        obj.exist = true;
        break
      }
      
    }
    L.push( obj );
  }}
  return(L)
}

//--------------------------------
/*
function index_to_triangle(posInChunk,vertices){ // ex : posInChunk = [0,0] ---> [x,y] 0,0 <= x,y <= chkSize,chkSize

  //  a b
  //  c d  --->  [Pa,Pb,Pc, Pd,Pc,Pb] si x + z = pair ou [Pa,Pb,Pd, Pd,Pc,Pa] si x + z = impair

  const X = posInChunk[0];
  const Z = posInChunk[1];

  const a = index_list[X][Z];
  const b = index_list[X][Z+1];
  const c = index_list[X+1][Z];
  const d = index_list[X+1][Z+1];
  //console.log("test :",a,b,c,d)

  let tri = [];

  if( (X+Z) % 2 === 0 ){
    
    if( vertices[a].exist && vertices[b].exist && vertices[c].exist ){
      tri.push(vertices[a].position);
      tri.push(vertices[b].position);
      tri.push(vertices[c].position);
    }
    if( vertices[d].exist && vertices[c].exist && vertices[b].exist ){
      tri.push(vertices[d].position);
      tri.push(vertices[c].position);
      tri.push(vertices[b].position);
    }

  }
  if( (X+Z) % 2 === 1 ){
    
    if( vertices[a].exist && vertices[b].exist && vertices[d].exist ){
      tri.push(vertices[a].position);
      tri.push(vertices[b].position);
      tri.push(vertices[d].position);
    }
    if( vertices[d].exist && vertices[c].exist && vertices[a].exist ){
      tri.push(vertices[d].position);
      tri.push(vertices[c].position);
      tri.push(vertices[a].position);
    }
  }
  return(tri);
}*/

function index_to_triangle(posInChunk,vertices){ // ex : posInChunk = [0,0] ---> [x,y] 0,0 <= x,y <= chkSize,chkSize

  //  a b
  //  c d  --->  [Pa,Pb,Pc, Pd,Pc,Pb] si x + z = pair ou [Pa,Pb,Pd, Pd,Pc,Pa] si x + z = impair

  const X = posInChunk[0];
  const Z = posInChunk[1];

  const a = index_list[X][Z];
  const b = index_list[X][Z+1];
  const c = index_list[X+1][Z];
  const d = index_list[X+1][Z+1];
  //console.log("test :",a,b,c,d)

  let tri = [];

  if( (X+Z) % 2 === 0 ){
    
    if( vertices[a].exist && vertices[b].exist && vertices[c].exist ){
      
      tri.push(vertices[a].position);
      if( vertices[a].status === "SUP"){
        tri.push(vertices[b].position);
        tri.push(vertices[c].position);
      }
      if( vertices[a].status === "SUB"){
        tri.push(vertices[c].position);
        tri.push(vertices[b].position);
      }
      
    }
    if( vertices[d].exist && vertices[c].exist && vertices[b].exist ){
      
      tri.push(vertices[d].position);
      if( vertices[d].status === "SUP"){
        tri.push(vertices[c].position);
        tri.push(vertices[b].position);
      }
      if( vertices[d].status === "SUB"){
        tri.push(vertices[b].position);
        tri.push(vertices[c].position);
      }
      
    }

  }
  if( (X+Z) % 2 === 1 ){
    
    if( vertices[a].exist && vertices[b].exist && vertices[d].exist ){

      tri.push(vertices[a].position);
      if( vertices[a].status === "SUP"){
        tri.push(vertices[b].position);
        tri.push(vertices[d].position);
      }
      if( vertices[a].status === "SUB"){
        tri.push(vertices[d].position);
        tri.push(vertices[b].position);
      }
    }
    if( vertices[d].exist && vertices[c].exist && vertices[a].exist ){

      tri.push(vertices[d].position);
      if( vertices[d].status === "SUP"){
        tri.push(vertices[c].position);
        tri.push(vertices[a].position);
      }
      if( vertices[d].status === "SUB"){
        tri.push(vertices[a].position);
        tri.push(vertices[c].position);
      }
    }
  }
  return(tri);
}


function triangles_to_floats(triangles){
  let L = []
  for( tri of triangles ){
  for( vect of tri ){
  for( i of vect ){
    L.push(i);
  }}}
  return(L)
}

function generate_triangles1(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  const verts = generate_vertices(chunk_coordinates);//1

  let triangles = [];

  for( x = 0; x < chksize; x++){
  for( z = 0; z < chksize; z++){
    triangles.push( index_to_triangle( [x,z] ,verts) );
  }}
  return(triangles)
}


function generate_triangles2(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  const verts = vertices_surface_gen(chunk_coordinates);//2

  let triangles = [];

  for( x = 0; x < chksize; x++){
  for( z = 0; z < chksize; z++){
    triangles.push( index_to_triangle( [x,z] ,verts) );
  }}
  return(triangles)
}

function generate_triangles3(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  const verts = vertices_sousterrain_gen(chunk_coordinates);//3

  let triangles = [];

  for( x = 0; x < chksize; x++){
  for( z = 0; z < chksize; z++){
    triangles.push( index_to_triangle( [x,z] ,verts) );
  }}
  return(triangles)
}







function gen_mesh(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  const tris1 = generate_triangles1( chunk_coordinates );
  const tris2 = generate_triangles2( chunk_coordinates );
  const tris3 = generate_triangles3( chunk_coordinates );
  /*
  let trisfloat2 = triangles_to_floats(tris2);
  let trisfloat3 = triangles_to_floats(tris3);
  for( let e of trisfloat3){
    trisfloat2.push( e );
  }*/
  let trisfloat1 = triangles_to_floats(tris1);

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array( trisfloat1 );
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

  geometry.computeVertexNormals();
  geometry.normalizeNormals();

  const material = new THREE.MeshPhongMaterial(  );//{side : THREE.DoubleSide}

  material.shadowSide = THREE.BackSide;
  //évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
  

  const mesh = new THREE.Mesh( geometry, material );
  //console.log(mesh.geometry.attributes.position)

  mesh.position.set(
    chunk_coordinates[0]*chksize,
    chunk_coordinates[1]*chksize,
    chunk_coordinates[2]*chksize,
    );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.material.color = {
    r: 0.8,
    g: 0.5+0.1*chunk_coordinates[1],
    b: 0.0,
  };

  
  put_in_chunk(mesh);
}


function generable_mesh(chunk_coordinates){
  if( chunk_coordinates in Chunk.data.list ){
      gen_mesh(chunk_coordinates);
    }
}


//new Chunk([1,0,0]);
//gen_mesh( [1,0,0] )




function airGenerator(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;
  const map = {};

  for (let x = -chksize/2 - 1; x <= chksize/2 + 1; x++) {
  for (let y = -chksize/2 - 1; y <= chksize/2 + 1; y++) {
  for (let z = -chksize/2 - 1; z <= chksize/2 + 1; z++) {
    //-chksize/2 - 1 et chksize/2 + 1 pour connaître l'état des bords

    map[[x,y,z]] = 0;
  }}}
  return(map)
}


function ongroundGenerator(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;
  const map = {};

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  for (let x = -chksize/2 - 1; x <= chksize/2 + 1; x++) {
  for (let y = -chksize/2 - 1; y <= chksize/2 + 1; y++) {
  for (let z = -chksize/2 - 1; z <= chksize/2 + 1; z++) {
    //-chksize/2 - 1 et chksize/2 + 1 pour connaître l'état des bords

    const X = Xstart + x;
    const Y = Ystart + y;
    const Z = Zstart + z;

    const pn2 = (chksize/3*noise.perlin2(X/30,Z/30) >= y) ? 1 : 0;
    map[[x,y,z]] = pn2;
  }}}
  return(map)
}


function undergroundGenerator(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;
  const map = {};

  const Xstart = chunk_coordinates[0] * chksize;
  const Ystart = chunk_coordinates[1] * chksize;
  const Zstart = chunk_coordinates[2] * chksize;

  for (let x = -chksize/2 - 1; x <= chksize/2 + 1; x++) {
  for (let y = -chksize/2 - 1; y <= chksize/2 + 1; y++) {
  for (let z = -chksize/2 - 1; z <= chksize/2 + 1; z++) {
    //-chksize/2 - 1 et chksize/2 + 1 pour connaître l'état des bords

    const X = Xstart + x;
    const Y = Ystart + y;
    const Z = Zstart + z;

    const pn3 = (noise.perlin3(X/50,Y/50,Z/50) >= 0) ? 1 : 0;
    map[[x,y,z]] = pn3;
  }}}
  return(map)
}

function mapAND(map1,map2){
  const chksize = Chunk.data.chunkSize;
  const map = {};

  for (let x = -chksize/2 - 1; x <= chksize/2 + 1; x++) {
  for (let y = -chksize/2 - 1; y <= chksize/2 + 1; y++) {
  for (let z = -chksize/2 - 1; z <= chksize/2 + 1; z++) {
    //-chksize/2 - 1 et chksize/2 + 1 pour connaître l'état des bords

    map[[x,y,z]] = map1[[x,y,z]] && map2[[x,y,z]];
  }}}
  return(map)
}




function detectSurface(map){

  const chksize = Chunk.data.chunkSize;

  const newMap = {};

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let y = -chksize/2; y <= chksize/2; y++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {
    if(map[[x,y,z]]){
      if(!map[[x-1,y,z]] || !map[[x+1,y,z]] || !map[[x,y-1,z]] || !map[[x,y+1,z]] || !map[[x,y,z-1]] || !map[[x,y,z+1]]  ){
        newMap[[x,y,z]] = 1;
      }else{
        newMap[[x,y,z]] = 0;
      }
    }else{
      newMap[[x,y,z]] = 0;
    }
    
  }}}
  return(newMap)
}


function adjacentPoints(x,y,z,surface){
  const P = [];

  for (let xi = -1; xi <= 1; xi++) {
  for (let yi = -1; yi <= 1; yi++) {
  for (let zi = -1; zi <= 1; zi++) {
    if(xi !== 0 || yi !== 0 || zi !== 0){
      if(surface[[x+xi,y+yi,z+zi]]){
        P.push([x+xi,y+yi,z+zi].toString())
      }
    }
    
  }}}

  return(P)
}



const _map = undergroundGenerator([0,4,0])
const _mapsurf = detectSurface(_map)



function possibleSquare(adjPoints,x,y,z,xi,yi,zi,xj,yj,zj,xk,yk,zk){

  const L = [];

  const a = [x,y,z]
  const b = [x+xi,y+yi,z+zi]  // xi=0 yi=0 zi=1
  const c = [x+xj,y+yj,z+zj]  // xj=0 yj=1 zj=0
  const d = [x+xk,y+yk,z+zk]  // xk=0 yk=1 zk=1

  if( adjPoints.indexOf(b.toString()) !== -1 &&
    adjPoints.indexOf(c.toString()) !== -1 &&
    adjPoints.indexOf(d.toString()) !== -1){
        
    L.push([ a, b, c ]);
    L.push([ d, c, b ]); // Rajouter un test pour inverser l'orientation des triangles

  }else if( adjPoints.indexOf(b.toString()) !== -1 &&
        adjPoints.indexOf(c.toString()) !== -1){
        
    L.push([ a, b, c ]);
  }
  return(L)
}

function allPossibleSquare(adjPoints,x,y,z){
/*
  //Choix 1   Choix 2   Choix 3
  [0,0,1];  
        [1,-1,0];
              [1,-1,1];
              [1,0,1];
        [1,0,0];
              [1,-1,1];
              [1,0,1];
              [1,1,1];
        [1,1,0];
              [1,0,1];
              [1,1,1];
  [0,1,0];
        [1,0,-1];
              [1,0,1];  ?
              [1,1,1];  ?
              [0,1,1];  ?
        [1,0,0];
              [1,1,-1]  ?
              [1,1,0]   ?
              [1,1,1]   ?
        [1,0,1];
              [1,0,0]   ?
              [1,1,0]   ?
              [1,1,1]   ?
        [0,0,1];
              [0,1,1]   ?
              [1,1,0]   ?
              [1,1,1]   ?
  [1,0,0];
        [0,-1,1];
              [1,-1,1]; ?
              [1,0,1];  ?
        [0,0,1];
              [1,-1,1];   doublon
              [1,0,1];    doublon
              [1,1,1];  doublon
        [0,1,1];
              [1,0,1];  ?
              [1,1,1];  ?
*/
  const L = [];

  L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,-1,0, 1,-1,1) )
  L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,-1,0, 1,0,1) )

  L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,0,0, 1,-1,1) )
  L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,0,0, 1,0,1) )
  L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,0,0, 1,1,1) )

  L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,1,0, 1,0,1) )
  L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,1,0, 1,1,1) )



  L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,-1, 1,0,1) )
  L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,-1, 1,1,1) )
  L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,-1, 0,1,1) )

  L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,0, 1,1,-1) )
  L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,0, 1,1,0) )
  L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,0, 1,1,1) )

  L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,1, 1,0,0) )
  L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,1, 1,1,0) )
  L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,1, 1,1,1) )

  L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 0,0,1, 0,1,1) )
  L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 0,0,1, 1,1,0) )
  L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 0,0,1, 1,1,1) )



  L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,-1,1, 1,-1,1) )
  L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,-1,1, 1,0,1) )

  //L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,0,1, 1,-1,1) )
  //L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,0,1, 1,0,1) )
  //L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,0,1, 1,1,1) )

  L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,1,1, 1,0,1) )
  L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,1,1, 1,1,1) )

  return(L)
}


function surfaceGenerator(surface){

  const tri = [];

  const chksize = Chunk.data.chunkSize;

  for (let x = -chksize/2; x <= chksize/2; x++) {
  for (let y = -chksize/2; y <= chksize/2; y++) {
  for (let z = -chksize/2; z <= chksize/2; z++) {
    if(surface[[x,y,z]]){
      const adjPoints = adjacentPoints(x,y,z,surface);
      /*
      //V1
      console.log("connect",x,y,z)

      if(adjPoints.indexOf([x,y+1,z].toString()) !== -1 ){
        console.log(x,y+1,z," avec ",x,y,z)
      }
      */




      /*
      //V2
      if(adjPoints.indexOf([x,y+1,z].toString()) !== -1 &&
        adjPoints.indexOf([x,y,z+1].toString()) !== -1 &&
        adjPoints.indexOf([x,y+1,z+1].toString()) !== -1){
        
        tri.push([ [x,y,z], [x,y,z+1], [x,y+1,z] ])
        tri.push([ [x,y+1,z+1], [x,y+1,z], [x,y,z+1] ])
      }

      if(adjPoints.indexOf([x+1,y,z].toString()) !== -1 &&
        adjPoints.indexOf([x,y,z+1].toString()) !== -1 &&
        adjPoints.indexOf([x+1,y,z+1].toString()) !== -1){
        
        tri.push([ [x,y,z], [x,y,z+1], [x+1,y,z] ])
        tri.push([ [x+1,y,z+1], [x+1,y,z], [x,y,z+1] ])
      }


      if(adjPoints.indexOf([x+1,y+1,z].toString()) !== -1 &&
        adjPoints.indexOf([x,y,z+1].toString()) !== -1 &&
        adjPoints.indexOf([x+1,y+1,z+1].toString()) !== -1){
        
        tri.push([ [x,y,z], [x,y,z+1], [x+1,y+1,z] ])
        tri.push([ [x+1,y+1,z+1], [x+1,y+1,z], [x,y,z+1] ])
      }


      if(adjPoints.indexOf([x,y+1,z].toString()) !== -1 &&
        adjPoints.indexOf([x-1,y,z+1].toString()) !== -1 &&
        adjPoints.indexOf([x,y+1,z+1].toString()) !== -1){
        
        tri.push([ [x,y,z], [x-1,y,z+1], [x,y+1,z] ])
        tri.push([ [x,y+1,z+1], [x,y+1,z], [x-1,y,z+1] ])
      }

    
      if(adjPoints.indexOf([x,y+1,z].toString()) !== -1 &&
        adjPoints.indexOf([x,y,z+1].toString()) !== -1 &&
        adjPoints.indexOf([x+1,y+1,z+1].toString()) !== -1){
        
        tri.push([ [x,y,z], [x,y,z+1], [x,y+1,z] ])
        tri.push([ [x+1,y+1,z+1], [x,y+1,z], [x,y,z+1] ])
      }


      if(adjPoints.indexOf([x+1,y+1,z].toString()) !== -1 &&
        adjPoints.indexOf([x+1,y,z+1].toString()) !== -1){
        
        tri.push([ [x,y,z], [x+1,y,z+1], [x+1,y+1,z] ])
      }*/

      /*
      let possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,0,1,0,0,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+1x
      possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,0,1,0,0,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,1,1,0,0,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,0,1,0,1,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+2x
      possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,1,1,0,0,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,0,1,0,1,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,1,1,0,1,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+3x
      possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,1,1,0,1,1,1);
      for(let e of possSquare){
        tri.push(e);
      }



      possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,1,0,0,1,0,1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+1y
      possSquare = possibleSquare(adjPoints,x,y,z,0,1,1,1,0,0,1,0,1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,1,1,0,1,0,1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,1,0,0,1,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+2y
      possSquare = possibleSquare(adjPoints,x,y,z,0,1,1,1,1,0,1,0,1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,1,1,1,0,0,1,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,1,1,0,1,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+3y
      possSquare = possibleSquare(adjPoints,x,y,z,0,1,1,1,1,0,1,1,1);
      for(let e of possSquare){
        tri.push(e);
      }



      possSquare = possibleSquare(adjPoints,x,y,z,1,0,0,0,1,0,1,1,0);
      for(let e of possSquare){
        tri.push(e);
      }
      //+1z
      possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,0,1,0,1,1,0);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,1,0,0,0,1,1,1,1,0);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,1,0,0,0,1,0,1,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+2z
      possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,0,1,1,1,1,0);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,0,1,0,1,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,1,0,0,0,1,1,1,1,1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+3z
      possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,0,1,1,1,1,1);
      for(let e of possSquare){
        tri.push(e);
      }







      possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,0,-1,0,0,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+1x
      possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,0,-1,0,0,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,-1,-1,0,0,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,0,-1,0,-1,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+2x
      possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,-1,-1,0,0,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,0,-1,0,-1,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,-1,-1,0,-1,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+3x
      possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,-1,-1,0,-1,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }



      possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,-1,0,0,-1,0,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+1y
      possSquare = possibleSquare(adjPoints,x,y,z,0,-1,-1,-1,0,0,-1,0,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,-1,-1,0,-1,0,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,-1,0,0,-1,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+2y
      possSquare = possibleSquare(adjPoints,x,y,z,0,-1,-1,-1,-1,0,-1,0,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,-1,-1,-1,0,0,-1,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,-1,-1,0,-1,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+3y
      possSquare = possibleSquare(adjPoints,x,y,z,0,-1,-1,-1,-1,0,-1,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }



      possSquare = possibleSquare(adjPoints,x,y,z,-1,0,0,0,-1,0,-1,-1,0);
      for(let e of possSquare){
        tri.push(e);
      }
      //+1z
      possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,0,-1,0,-1,-1,0);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,-1,0,0,0,-1,-1,-1,-1,0);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,-1,0,0,0,-1,0,-1,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+2z
      possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,0,-1,-1,-1,-1,0);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,0,-1,0,-1,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      possSquare = possibleSquare(adjPoints,x,y,z,-1,0,0,0,-1,-1,-1,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }
      //+3z
      possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,0,-1,-1,-1,-1,-1);
      for(let e of possSquare){
        tri.push(e);
      }









      possSquare = possibleSquare(adjPoints,x,y,z,1,-1,0,0,0,1,1,-1,1);
      for(let e of possSquare){
        tri.push(e);
      }*/
      const aPS = allPossibleSquare(adjPoints,x,y,z);
      for(let e0 of aPS){
      for(let e1 of e0){
        tri.push(e1);
      }}

      
    
    }
  }}}
  return(tri)
}

//const surfGen = surfaceGenerator(_mapsurf);
//console.log(surfGen)

function arrayToFloats(array){
  const L = [];
  for(let e0 of array){
  for(let e1 of e0){
  for(let e2 of e1){
    L.push(e2)
  }}}
  return(L)
}

//const fsurfGen = arrayToFloats(surfGen);
//console.log(fsurfGen)
















function genMesh(chunk_coordinates){

  const chksize = Chunk.data.chunkSize;

  //const map = undergroundGenerator(chunk_coordinates)
  

  let map;
  if(chunk_coordinates[1] < 4){
    map = undergroundGenerator(chunk_coordinates);
  }else if(chunk_coordinates[1] === 4){
    const map1 = undergroundGenerator(chunk_coordinates);
    const map2 = ongroundGenerator(chunk_coordinates);
    map = mapAND(map1,map2);
  }else{
    map = airGenerator(chunk_coordinates);
  }

  const surfaceMap = detectSurface(map);
  const tris = surfaceGenerator(surfaceMap);

  const trisfloat = arrayToFloats(tris);

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array( trisfloat );
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

  geometry.computeVertexNormals();
  geometry.normalizeNormals();

  const material = new THREE.MeshPhongMaterial( {side : THREE.DoubleSide} );//

  material.shadowSide = THREE.BackSide;
  //évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
  

  const mesh = new THREE.Mesh( geometry, material );
  //console.log(mesh.geometry.attributes.position)

  mesh.position.set(
    chunk_coordinates[0]*chksize,
    chunk_coordinates[1]*chksize,
    chunk_coordinates[2]*chksize,
    );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.material.color = {
    r: 0.8,
    g: 0.5+0.1*chunk_coordinates[1],
    b: 0.0,
  };

  //scene.add(mesh);
  put_in_chunk(mesh);
}


//genMesh([0,4,0])
/*
for (let x = 1; x <= 3; x++) {
for (let y = 0; y <= 12; y++) {
for (let z = 1; z <= 3; z++) {
  new_chunk([x,y,z])
  genMesh([x,y,z])
  //collision_on_chunk([x,y,z]);
}}}
*/


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

function gen_decoration_roche(x,y,z){

  const detail = Math.floor(random(2,3));
  const size = random(0.2,4);
  const geo = new THREE.TetrahedronGeometry( size, detail );
  const mat = new THREE.MeshPhongMaterial( { color : 0x93a0b5 } );
  const roche = new THREE.Mesh( geo, mat );

  roche.castShadow = true;
  roche.receiveShadow = true;

  roche.position.set( x, y, z );

  put_in_chunk(roche);
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


/*
function salutation(name) {
  alert('Bonjour ' + name);
}

function processUserInput(callback) {
  var name = prompt('Entrez votre nom.');
  callback(name);
}

processUserInput(salutation);
*/

//=================================================================================
//              Scene Decoration Creation
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
let chk_N = 1

const group__init = new THREE.Group();
const geo__init = new THREE.BoxGeometry(1,1,1);
const mat__init = new THREE.MeshPhongMaterial();
const box__init = new THREE.Mesh( geo__init, mat__init );
group__init.add(box__init);
scene.add(group__init);
worldOctree.fromGraphNode( group__init );

const light = gen_DirectionalLight_object(3,10,5,16);
const lightInclin = new THREE.Vector3( 3, 10, 5 );


//=================================================================================
//              MAIN INIT

function main_init() {
  //infoText.innerHTML = 0;


  requestAnimationFrame( main_update );
  
  
  genChunkInit()
  gen_AmbientLight();

  
  //genInit();

  render_chunks([0,0,0],[0,0,1]);

  //forcing pour charger les chunks à l'apparition de player : à suppr
  //Modif is_chunk_update pour détécter quand undefined != array

  if(isPhone){
    drawTriangle();
    document.getElementById("renderDiv").onclick="";

  }else{
    document.getElementById("throwball").remove()
    document.getElementById("forward").remove()

    document.getElementById("touchAreaLeft").remove()
    document.getElementById("touchAreaRight").remove()
    document.getElementById("touchAreaMiddle").remove()
  }
  document.getElementById("loading").remove()
  

}

//=================================================================================
//              MAIN UPDATE

function main_update() {
  n += 1;

  requestAnimationFrame( main_update );

  
  //custom updates
  update_chunk()
  update_movement()
/*
  light.position.set(
    3 + player.position.x,
    10 + player.position.y,
    5 + player.position.z,
    );
  light.target.position.set(
    0.0 + player.position.x,
    0.0 + player.position.y,
    0.0 + player.position.z,
    )*/
  move_DirectionalLight_object(light, player.position, lightInclin)

  //A SUPPR
  //readTextFile("./database.db");
  
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


  if(isPhone){
    const test = window.innerWidth / window.innerHeight * 20 + "%";
    document.getElementById("throwball").style.height = test;
    document.getElementById("forward").style.height = test;

    if(window.innerWidth / window.innerHeight >= 1){
      document.getElementById("info").style.fontSize = "calc(100vw / 30)";
    }else{
      document.getElementById("info").style.fontSize = "calc(100vw / 10)";
    }
  }


  
  renderer.render( scene, camera );
}

function drawTriangle() {
  var canevas = document.getElementById('forward');
  if (canevas.getContext) {
    var ctx = canevas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(150, 50);
    ctx.lineTo(110, 100);
    ctx.lineTo(190, 100);
    ctx.fill();
  }
}

//document.getElementById("twrowball").style.width = window.innerWidth / window.innerHeight * 10 + "%";

main_init()