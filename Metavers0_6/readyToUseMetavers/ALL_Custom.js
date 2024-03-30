//Monde programmé à 80% par G.F.

//'./jsm/math/ImprovedNoise.js'// a remplacer par ça










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

function distance2(pos1,pos2){
  X = pos2[0]-pos1[0];
  Y = pos2[1]-pos1[1];
  Z = pos2[2]-pos1[2];
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

renderer = new THREE.WebGLRenderer( { alpha : true , antialias: true } );


renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//renderer.shadowMap.type = THREE.VSMShadowMap;

//need import StereoEffect ./jsm/effects/StereoEffect.js
//effect = new THREE.StereoEffect( renderer );
//effect.setSize( window.innerWidth, window.innerHeight );

//document.body.appendChild( renderer.domElement );
let renderDiv = document.getElementById('renderDiv')
renderDiv.appendChild( renderer.domElement );

const loader = new THREE.GLTFLoader();

//Fog( "#555", 0.1, 20 )

//console.log(renderer.domElement)


//=================================================================================
//              raycast
const threshold = 0.1;



raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = threshold;
raycaster.far = 20;

const centerPointer = new THREE.Vector2(0,0);

function raycastUpdate(){
  raycaster.setFromCamera( centerPointer, camera );

  const intersections = raycaster.intersectObjects( scene.children );
  
  return(intersections)
  
}

/*
  // Toggle rotation bool for meshes that we clicked
  if ( intersects.length > 0 ) {

    helper.position.set( 0, 0, 0 );
    helper.lookAt( intersects[ 0 ].face.normal );

    helper.position.copy( intersects[ 0 ].point );

  }
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










//--------------------------------------------------------------------------

function removeObject( object ){ // ne pas utiliser
  //const object = scene.getObjectByProperty( 'uuid', i );

  object.geometry.dispose();
  object.material.dispose();
  
  scene.remove( object );

}


//CSS3DObject ---------------------------------------------------------------

//rendererVideo = new THREE.CSS3DRenderer();
/*
function Element( id, x, y, z, ry ) {

        const div = document.createElement( 'div' );
        div.style.width = '480px';
        div.style.height = '360px';
        div.style.backgroundColor = '#000';

        const iframe = document.createElement( 'iframe' );
        iframe.style.width = '480px';
        iframe.style.height = '360px';
        iframe.style.border = '0px';
        iframe.src = [ 'https://www.youtube.com/embed/', id, '?rel=0' ].join( '' );
        div.appendChild( iframe );

        const object = new THREE.CSS3DObject( div );
        object.position.set( x, y, z );
        object.rotation.y = ry;

        return object;

      }

rendererVideo.setSize( window.innerWidth, window.innerHeight );
renderDiv.appendChild( rendererVideo.domElement );

const youtubeVideo = new Element( 'SJOz3qjfQXU', 0, 0, 240, 0 );
scene.add(youtubeVideo);
*/


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

  if ( document.pointerLockElement !== null && isPhone === false) {
    throwBall();


/*
    const intersect = raycastUpdate();
    if (intersect.length > 0) {

      const dataName = intersect[0].object.name.split("/");
      const point = intersect[0].point;
      
      //console.log(dataName)
      if (dataName[0] === "Terrain") {
        const chunkPosition = toArray(dataName[1])
        //console.log("Terrain", chunkPosition)
        //rp = relativePoint
        const rp = new THREE.Vector3( 
          Math.round(point.x) - Chunk.data.chunkSize * chunkPosition[0] + Chunk.data.chunkSize/2, 
          Math.round(point.y) - Chunk.data.chunkSize * chunkPosition[1] + Chunk.data.chunkSize/2, 
          Math.round(point.z) - Chunk.data.chunkSize * chunkPosition[2] + Chunk.data.chunkSize/2
          );
        //console.log(rp)


        const generation = Terrain.data.list[ dataName[1] ].generation;
        generation[rp.x][rp.y][rp.z] = 0;
        generation[rp.x+1][rp.y][rp.z] = 0;
        generation[rp.x][rp.y+1][rp.z] = 0;
        generation[rp.x][rp.y][rp.z+1] = 0;
        generation[rp.x-1][rp.y][rp.z] = 0;
        generation[rp.x][rp.y-1][rp.z] = 0;
        generation[rp.x][rp.y][rp.z-1] = 0;

        Terrain.data.list[ dataName[1] ].updateMesh(generation);

      }
    }*/



  };

} );

/*
  const keyDownList = {
    "z" : false,
    "q" : false,
    "s" : false,
    "d" : false,
    " " : false,
    "Control" : false,
    "Shift" : false,
    "touch" : false,
    "rotateLeft" : false,
    "rotateRight" : false,
    "touchJump" : false,
  }*/

const keyDownList = {
  "90" : false,//z Z
  "81" : false,//q Q
  "83" : false,//s S
  "68" : false,//d D
  "32" : false,//space
  "17" : false,//ctrl
  "16" : false,//shift
  "touch" : false,
  "rotateLeft" : false,
  "rotateRight" : false,
  "touchJump" : false,
}



  function key_action(key){
    const speedDelta = 0.05/*deltaTime*/ * ( player.onFloor ? 25 : 8 );
    //console.log(key)

    switch (key) {
      //case 'z':
      case '90':
        //console.log("avancer");
        //pointer.moveForward(1);
        player.velocity.add( getForwardVector().multiplyScalar( speedDelta ) );
        break;
      //case 'q':
      case '81':
        //console.log("gauche");
        //pointer.moveRight(-1);
        player.velocity.add( getSideVector().multiplyScalar( - speedDelta ) );
        break;
      //case 's':
      case '83':
        //console.log("reculer");
        //pointer.moveForward(-1);
        player.velocity.add( getForwardVector().multiplyScalar( - speedDelta ) );
        break;
      //case 'd':
      case '68':
        //console.log("droite");
        //pointer.moveRight(1);
        player.velocity.add( getSideVector().multiplyScalar( speedDelta ) );
        break;
      //case ' ':
      case '32':
        //console.log("haut");
        //player.camera.position.y += 1;
        player.collider.translate(_vectUP);

        break;
      //case 'Shift':
      case '16':
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
    //keyDownList[e.key] = true;
    keyDownList[e.keyCode] = true;
    //console.log(e.keyCode)
  })

  document.addEventListener('keyup' , (e)=>{

    //console.log(e);
    //keyDownList[e.key] = false;
    keyDownList[e.keyCode] = false;
  })








const clock = new THREE.Clock();

let lastChunk ;
let newChunk ;

let infoText = document.getElementById("info");

class Chunk{

  static data = {
    debug : false,
    renderDistance : 7,//3,
    renderDistanceLoad : 3,
    maxLoad : 1,
    chunkSize : 20,//42,
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
    xInit : 2, 
    yInit : 1,
    zInit : 2,

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

    if (Chunk.data.lenght > 200) {

      //delete Chunk.data.list[this.chunkPosition];
      //Chunk.data.lenght -= 1;
    }
    
  }

  render(){
    this.group.visible = distance1(player.position,this.worldPosition) < Chunk.data.chunkSize*Chunk.data.renderDistance ;

  }



  static get in_chunk(){
    return(in_chunk(player))
  }

  static newChunk(chunkPosition){
    new Chunk( chunkPosition ).render();

    new Terrain( chunkPosition );
    //Terrain.genMesh(chunkPosition);
  }

  static genInitChunks(){
    let loaded = 0;
    const totalLoad = (2*Chunk.data.xInit+1)*(2*Chunk.data.yInit+1)*(2*Chunk.data.zInit+1);

    for (let x = -Chunk.data.xInit ; x <= Chunk.data.xInit; x++){
    for (let y = -Chunk.data.yInit ; y <= Chunk.data.yInit; y++){
    for (let z = -Chunk.data.zInit ; z <= Chunk.data.zInit; z++){
      Chunk.newChunk([x,y,z]);
      loaded += 1;
    }}
    //console.log(Math.round(n/totalLoad*100),"load init");
    infoText.innerText = Math.round(loaded/totalLoad*100) + "load new chunks";
    }
  }

  static genNewChunks(){

    const chk_p = Chunk.in_chunk;
    const rd = Chunk.data.renderDistanceLoad;
    //const rd = Chunk.data.renderDistance;
    const chkList = Chunk.data.list;

    //console.log(chk_p,rd)
    const nxa = Math.max( Chunk.data.xMin, chk_p[0]-rd ) 
    const nxb = Math.min( Chunk.data.xMax, chk_p[0]+rd )

    const nya = Math.max( Chunk.data.yMin, chk_p[1]-rd )
    const nyb = Math.min( Chunk.data.yMax, chk_p[1]+rd )

    const nza = Math.max( Chunk.data.zMin, chk_p[2]-rd )
    const nzb = Math.min( Chunk.data.zMax, chk_p[2]+rd )

    let loaded = 0;
    /*const totalLoad = (-nxa+1+nxb)*(-nya+1+nyb)*(-nza+1+nzb);*/

    /*
    for( let x = nxa; x <= nxb; x++){
    for( let y = nya; y <= nyb; y++){
    for( let z = nza; z <= nzb; z++){
      //      PARTICULIEREMENT LOURD EN PERFORMANCE
      if( !([x,y,z] in chkList ) && (distance2(chk_p,[x,y,z]) < rd) ){
        new_chunk([x,y,z]);
        loaded += 1;
      }

      
      

    }}
    infoText.innerHTML = Math.round(loaded/totalLoad*100) + "load new chunks";
    console.log(Math.round(loaded/totalLoad*100),"load new chunks");
    }*/
    
    /*
    for( let x = nxa; x <= nxb; x++){
    for( let y = nya; y <= nyb; y++){
    for( let z = nza; z <= nzb; z++){
      //      PARTICULIEREMENT LOURD EN PERFORMANCE
      if( !([x,y,z] in chkList ) && (distance2(chk_p,[x,y,z]) < rd) ){
        new_chunk([x,y,z]);
        loaded += 1;
      }
      if (loaded >= 50) {return}

      
      

    }}
    infoText.innerHTML = Math.round(loaded/totalLoad*100) + "load new chunks";
    console.log(Math.round(loaded/totalLoad*100),"load new chunks");
    }*/



    
    const dict = {};
    const distKeys = [];

    for( let x = nxa; x <= nxb; x++){
    for( let y = nya; y <= nyb; y++){
    for( let z = nza; z <= nzb; z++){

      if (!([x,y,z] in chkList)) {
        const dist = distance2(chk_p,[x,y,z]);
        if (dist < rd )  {


          dict[ [x,y,z] ] = dist;
          distKeys.push( dist );
        }
      }
      
      
    }}}
    distKeys.sort();
    
    //console.log(dict)
    //console.log(distKeys)

/*
    for( let i of distKeys ){
      //console.log( toArray(keyOf(dict, i)) )
      new_chunk( toArray(keyOf(dict, i)) );
      console.log('test',i)
      loaded += 1;
      
      if (loaded >= 2) {return}
    }*/
    for( let i of distKeys ){
      //console.log( toArray(keyOf(dict, i)) )
      //new_chunk( toArray(keyOf(dict, i)) );
      const allchks = allKeysOfValue( dict, i );
      for (let chk of allchks) {
        //new_chunk( toArray(chk) );
        Chunk.newChunk(toArray(chk));
        loaded += 1;
        if (loaded >= Chunk.data.maxLoad) {return}
      }
      
    }
  }

  //
}

function keyOf(obj,value){
  for (let i in obj) {
    if (obj[i] === value) {return(i)}
  }
  return(false)
}

function toArray(string){
  // "0,0,0" => [0,0,0]
  const L = string.split(",");
  for( let i in L){
    L[i] = Math.floor(L[i]);
  }
  return(L)
}

function allKeysOfValue(obj,value){
  const L = [];
  for (let i in obj) {
    if (obj[i] === value) {L.push(i)}
  }
  return(L)
}

//----------------------------

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

    for (let x = Xinf ; x <= Xsup; x++){
    for (let y = Yinf ; y <= Ysup; y++){
    for (let z = Zinf ; z <= Zsup; z++){
      //console.log([x,y,z])
      if( [x,y,z] in Chunk.data.list ){
        Chunk.data.list[[x,y,z]].render();
      }
    }}}

    //Chunk.genNewChunks();//à mettre pour s'assurer qu'un chunk se génére
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
  newChunk = in_chunk(player);
  infoText.innerText = newChunk + " " + Chunk.data.lenght; // pas obligatoire
  render_chunks(lastChunk,newChunk);
  lastChunk = newChunk;
}


function collision_on_chunk(chunk_coordinates){
  const group = Chunk.data.list[ chunk_coordinates ].group;
  //console.log(worldOctree)
  worldOctree.fromGraphNode( group );
}


//OBSOLETE
function new_chunk(chunk_coordinates){
  if( !(chunk_coordinates in Chunk.data.list) ){
    new Chunk( chunk_coordinates );
    //console.log( "Chunk :", chunk_coordinates, "created" )

    //------------------------------------------------------
    //A CHANGER
    /*
    genMesh(
      chunk_coordinates,
      ()=>{
        collision_on_chunk(chunk_coordinates)
        }
    );*/


    //collision_on_chunk(chunk_coordinates);
    

    if( (chunk_coordinates[0] >= -5 && chunk_coordinates[0] <= 5) &&
      (chunk_coordinates[2] >= -10 && chunk_coordinates[2] <= -5)
     ){
      //rien
    }else{
      genMesh(
        chunk_coordinates,
        ()=>{
          collision_on_chunk(chunk_coordinates)
          }
      );
    }


    /*
    if( (chunk_coordinates[0] >= -10 && chunk_coordinates[0] <= 10) &&
      (chunk_coordinates[0] >= -3 && chunk_coordinates[0] <= 3) &&
      (chunk_coordinates[2] >= 1 && chunk_coordinates[2] <= 20)
     ){
      genMesh(chunk_coordinates);
      collision_on_chunk(chunk_coordinates);

    }else{
      if(chunk_coordinates[1] === 0){
        generable_meshTerrain(chunk_coordinates);
        collision_on_chunk(chunk_coordinates);
      }
    }
    */
  }
  else{
    //console.log( "Chunk :", chunk_coordinates, "already exist" )
  }
}

//OBSOLETE
function genInitChunks(){
  let n = 0;
  const totalLoad = (2*Chunk.data.xInit+1)*(2*Chunk.data.yInit+1)*(2*Chunk.data.zInit+1);

  for (let x = -Chunk.data.xInit ; x <= Chunk.data.xInit; x++){
  for (let y = -Chunk.data.yInit ; y <= Chunk.data.yInit; y++){
  for (let z = -Chunk.data.zInit ; z <= Chunk.data.zInit; z++){
    new_chunk([x,y,z]);
    n += 1;
  }}
  console.log(Math.round(n/totalLoad*100),"load init");
  }
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

function gen_DirectionalLight_object(x,y,z,size_area,intensity = 0.4){
  const color = 0xFFFFFF;
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


function gen_PointLight_object(x,y,z,size_area,intensity = 0.1){
  const color = 0xFFFFFF;
  const light = new THREE.PointLight(color, intensity);
  //const size_area = 8;
  light.position.set( x*size_area, y*size_area, z*size_area );

  //résolution ombre
  light.shadow.mapSize.width = 512*4;
  light.shadow.mapSize.height = 512*4;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 500;

  //light.shadow.camera = new THREE.OrthographicCamera( -size_area, size_area, size_area, -size_area, 0.1, 500 );
  light.castShadow = true;

  scene.add( light );

  //const helper = new THREE.DirectionalLightHelper( light, size_area );
  //scene.add( helper );

  return(light);
  
}

function move_PointLight_object(light,vect){
  light.position.set(
    vect.x,
    vect.y+2,
    vect.z,
    );
}


  
  
const trianglesEdgesIndex = [
  [],
  [ 0, 8, 3,],
  [ 0, 1, 9,],
  [ 1, 8, 3, 9, 8, 1, ],
  [ 1, 2, 10,],
  [ 0, 8, 3, 1, 2, 10, ],
  [ 9, 2, 10, 0, 2, 9, ],
  [ 2, 8, 3, 2, 10, 8, 10, 9, 8,],
  [ 3, 11, 2,],
  [ 0, 11, 2, 8, 11, 0, ],
  [ 1, 9, 0, 2, 3, 11, ],
  [ 1, 11, 2, 1, 9, 11, 9, 8, 11,],
  [ 3, 10, 1, 11, 10, 3, ],
  [ 0, 10, 1, 0, 8, 10, 8, 11, 10,],
  [ 3, 9, 0, 3, 11, 9, 11, 10, 9,],
  [ 9, 8, 10, 10, 8, 11, ],
  [ 4, 7, 8,],
  [ 4, 3, 0, 7, 3, 4, ],
  [ 0, 1, 9, 8, 4, 7, ],
  [ 4, 1, 9, 4, 7, 1, 7, 3, 1,],
  [ 1, 2, 10, 8, 4, 7, ],
  [ 3, 4, 7, 3, 0, 4, 1, 2, 10,],
  [ 9, 2, 10, 9, 0, 2, 8, 4, 7,],
  [ 2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, ],
  [ 8, 4, 7, 3, 11, 2, ],
  [ 11, 4, 7, 11, 2, 4, 2, 0, 4,],
  [ 9, 0, 1, 8, 4, 7, 2, 3, 11,],
  [ 4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, ],
  [ 3, 10, 1, 3, 11, 10, 7, 8, 4,],
  [ 1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, ],
  [ 4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, ],
  [ 4, 7, 11, 4, 11, 9, 9, 11, 10,],
  [ 9, 5, 4,],
  [ 9, 5, 4, 0, 8, 3, ],
  [ 0, 5, 4, 1, 5, 0, ],
  [ 8, 5, 4, 8, 3, 5, 3, 1, 5,],
  [ 1, 2, 10, 9, 5, 4, ],
  [ 3, 0, 8, 1, 2, 10, 4, 9, 5,],
  [ 5, 2, 10, 5, 4, 2, 4, 0, 2,],
  [ 2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, ],
  [ 9, 5, 4, 2, 3, 11, ],
  [ 0, 11, 2, 0, 8, 11, 4, 9, 5,],
  [ 0, 5, 4, 0, 1, 5, 2, 3, 11,],
  [ 2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, ],
  [ 10, 3, 11, 10, 1, 3, 9, 5, 4,],
  [ 4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, ],
  [ 5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, ],
  [ 5, 4, 8, 5, 8, 10, 10, 8, 11,],
  [ 9, 7, 8, 5, 7, 9, ],
  [ 9, 3, 0, 9, 5, 3, 5, 7, 3,],
  [ 0, 7, 8, 0, 1, 7, 1, 5, 7,],
  [ 1, 5, 3, 3, 5, 7, ],
  [ 9, 7, 8, 9, 5, 7, 10, 1, 2,],
  [ 10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, ],
  [ 8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, ],
  [ 2, 10, 5, 2, 5, 3, 3, 5, 7,],
  [ 7, 9, 5, 7, 8, 9, 3, 11, 2,],
  [ 9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, ],
  [ 2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, ],
  [ 11, 2, 1, 11, 1, 7, 7, 1, 5,],
  [ 9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, ],
  [ 5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0,],
  [ 11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0,],
  [ 11, 10, 5, 7, 11, 5, ],
  [ 10, 6, 5,],
  [ 0, 8, 3, 5, 10, 6, ],
  [ 9, 0, 1, 5, 10, 6, ],
  [ 1, 8, 3, 1, 9, 8, 5, 10, 6,],
  [ 1, 6, 5, 2, 6, 1, ],
  [ 1, 6, 5, 1, 2, 6, 3, 0, 8,],
  [ 9, 6, 5, 9, 0, 6, 0, 2, 6,],
  [ 5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, ],
  [ 2, 3, 11, 10, 6, 5, ],
  [ 11, 0, 8, 11, 2, 0, 10, 6, 5,],
  [ 0, 1, 9, 2, 3, 11, 5, 10, 6,],
  [ 5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, ],
  [ 6, 3, 11, 6, 5, 3, 5, 1, 3,],
  [ 0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, ],
  [ 3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, ],
  [ 6, 5, 9, 6, 9, 11, 11, 9, 8,],
  [ 5, 10, 6, 4, 7, 8, ],
  [ 4, 3, 0, 4, 7, 3, 6, 5, 10,],
  [ 1, 9, 0, 5, 10, 6, 8, 4, 7,],
  [ 10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, ],
  [ 6, 1, 2, 6, 5, 1, 4, 7, 8,],
  [ 1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, ],
  [ 8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, ],
  [ 7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9,],
  [ 3, 11, 2, 7, 8, 4, 10, 6, 5,],
  [ 5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, ],
  [ 0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, ],
  [ 9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6,],
  [ 8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, ],
  [ 5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11,],
  [ 0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7,],
  [ 6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, ],
  [ 10, 4, 9, 6, 4, 10, ],
  [ 4, 10, 6, 4, 9, 10, 0, 8, 3,],
  [ 10, 0, 1, 10, 6, 0, 6, 4, 0,],
  [ 8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, ],
  [ 1, 4, 9, 1, 2, 4, 2, 6, 4,],
  [ 3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, ],
  [ 0, 2, 4, 4, 2, 6, ],
  [ 8, 3, 2, 8, 2, 4, 4, 2, 6,],
  [ 10, 4, 9, 10, 6, 4, 11, 2, 3,],
  [ 0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, ],
  [ 3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, ],
  [ 6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1,],
  [ 9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, ],
  [ 8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1,],
  [ 3, 11, 6, 3, 6, 0, 0, 6, 4,],
  [ 6, 4, 8, 11, 6, 8, ],
  [ 7, 10, 6, 7, 8, 10, 8, 9, 10,],
  [ 0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, ],
  [ 10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, ],
  [ 10, 6, 7, 10, 7, 1, 1, 7, 3,],
  [ 1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, ],
  [ 2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9,],
  [ 7, 8, 0, 7, 0, 6, 6, 0, 2,],
  [ 7, 3, 2, 6, 7, 2, ],
  [ 2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, ],
  [ 2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7,],
  [ 1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11,],
  [ 11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, ],
  [ 8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6,],
  [ 0, 9, 1, 11, 6, 7, ],
  [ 7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, ],
  [ 7, 11, 6,],
  [ 7, 6, 11,],
  [ 3, 0, 8, 11, 7, 6, ],
  [ 0, 1, 9, 11, 7, 6, ],
  [ 8, 1, 9, 8, 3, 1, 11, 7, 6,],
  [ 10, 1, 2, 6, 11, 7, ],
  [ 1, 2, 10, 3, 0, 8, 6, 11, 7,],
  [ 2, 9, 0, 2, 10, 9, 6, 11, 7,],
  [ 6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, ],
  [ 7, 2, 3, 6, 2, 7, ],
  [ 7, 0, 8, 7, 6, 0, 6, 2, 0,],
  [ 2, 7, 6, 2, 3, 7, 0, 1, 9,],
  [ 1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, ],
  [ 10, 7, 6, 10, 1, 7, 1, 3, 7,],
  [ 10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, ],
  [ 0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, ],
  [ 7, 6, 10, 7, 10, 8, 8, 10, 9,],
  [ 6, 8, 4, 11, 8, 6, ],
  [ 3, 6, 11, 3, 0, 6, 0, 4, 6,],
  [ 8, 6, 11, 8, 4, 6, 9, 0, 1,],
  [ 9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, ],
  [ 6, 8, 4, 6, 11, 8, 2, 10, 1,],
  [ 1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, ],
  [ 4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, ],
  [ 10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3,],
  [ 8, 2, 3, 8, 4, 2, 4, 6, 2,],
  [ 0, 4, 2, 4, 6, 2, ],
  [ 1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, ],
  [ 1, 9, 4, 1, 4, 2, 2, 4, 6,],
  [ 8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, ],
  [ 10, 1, 0, 10, 0, 6, 6, 0, 4,],
  [ 4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3,],
  [ 10, 9, 4, 6, 10, 4, ],
  [ 4, 9, 5, 7, 6, 11, ],
  [ 0, 8, 3, 4, 9, 5, 11, 7, 6,],
  [ 5, 0, 1, 5, 4, 0, 7, 6, 11,],
  [ 11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, ],
  [ 9, 5, 4, 10, 1, 2, 7, 6, 11,],
  [ 6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, ],
  [ 7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, ],
  [ 3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6,],
  [ 7, 2, 3, 7, 6, 2, 5, 4, 9,],
  [ 9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, ],
  [ 3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, ],
  [ 6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8,],
  [ 9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, ],
  [ 1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4,],
  [ 4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10,],
  [ 7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, ],
  [ 6, 9, 5, 6, 11, 9, 11, 8, 9,],
  [ 3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, ],
  [ 0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, ],
  [ 6, 11, 3, 6, 3, 5, 5, 3, 1,],
  [ 1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, ],
  [ 0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10,],
  [ 11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5,],
  [ 6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, ],
  [ 5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, ],
  [ 9, 5, 6, 9, 6, 0, 0, 6, 2,],
  [ 1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8,],
  [ 1, 5, 6, 2, 1, 6, ],
  [ 1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6,],
  [ 10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, ],
  [ 0, 3, 8, 5, 6, 10, ],
  [ 10, 5, 6,],
  [ 11, 5, 10, 7, 5, 11, ],
  [ 11, 5, 10, 11, 7, 5, 8, 3, 0,],
  [ 5, 11, 7, 5, 10, 11, 1, 9, 0,],
  [ 10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, ],
  [ 11, 1, 2, 11, 7, 1, 7, 5, 1,],
  [ 0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, ],
  [ 9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, ],
  [ 7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2,],
  [ 2, 5, 10, 2, 3, 5, 3, 7, 5,],
  [ 8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, ],
  [ 9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, ],
  [ 9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2,],
  [ 1, 3, 5, 3, 7, 5, ],
  [ 0, 8, 7, 0, 7, 1, 1, 7, 5,],
  [ 9, 0, 3, 9, 3, 5, 5, 3, 7,],
  [ 9, 8, 7, 5, 9, 7, ],
  [ 5, 8, 4, 5, 10, 8, 10, 11, 8,],
  [ 5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, ],
  [ 0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, ],
  [ 10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4,],
  [ 2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, ],
  [ 0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11,],
  [ 0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5,],
  [ 9, 4, 5, 2, 11, 3, ],
  [ 2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, ],
  [ 5, 10, 2, 5, 2, 4, 4, 2, 0,],
  [ 3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9,],
  [ 5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, ],
  [ 8, 4, 5, 8, 5, 3, 3, 5, 1,],
  [ 0, 4, 5, 1, 0, 5, ],
  [ 8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, ],
  [ 9, 4, 5,],
  [ 4, 11, 7, 4, 9, 11, 9, 10, 11,],
  [ 0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, ],
  [ 1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, ],
  [ 3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4,],
  [ 4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, ],
  [ 9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3,],
  [ 11, 7, 4, 11, 4, 2, 2, 4, 0,],
  [ 11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, ],
  [ 2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, ],
  [ 9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7,],
  [ 3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10,],
  [ 1, 10, 2, 8, 7, 4, ],
  [ 4, 9, 1, 4, 1, 7, 7, 1, 3,],
  [ 4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, ],
  [ 4, 0, 3, 7, 4, 3, ],
  [ 4, 8, 7,],
  [ 9, 10, 8, 10, 11, 8, ],
  [ 3, 0, 9, 3, 9, 11, 11, 9, 10,],
  [ 0, 1, 10, 0, 10, 8, 8, 10, 11,],
  [ 3, 1, 10, 11, 3, 10, ],
  [ 1, 2, 11, 1, 11, 9, 9, 11, 8,],
  [ 3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, ],
  [ 0, 2, 11, 8, 0, 11, ],
  [ 3, 2, 11,],
  [ 2, 3, 8, 2, 8, 10, 10, 8, 9,],
  [ 9, 10, 2, 0, 9, 2, ],
  [ 2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, ],
  [ 1, 10, 2,],
  [ 1, 3, 8, 9, 1, 8, ],
  [ 0, 9, 1,],
  [ 0, 3, 8,],
  []
]


const indexToVertex = [
  [ 0.5, 0.0, 0.0 ],
  [ 1.0, 0.0, 0.5 ],
  [ 0.5, 0.0, 1.0 ],
  [ 0.0, 0.0, 0.5 ],

  [ 0.5, 1.0, 0.0 ],
  [ 1.0, 1.0, 0.5 ],
  [ 0.5, 1.0, 1.0 ],
  [ 0.0, 1.0, 0.5 ],

  [ 0.0, 0.5, 0.0 ],
  [ 1.0, 0.5, 0.0 ],
  [ 1.0, 0.5, 1.0 ],
  [ 0.0, 0.5, 1.0 ],
]

function addVertex(A,B){
  const C = [
    A[0]+B[0],
    A[1]+B[1],
    A[2]+B[2],
  ]
  return(C)
}
function scaleVertex(A,scale){
  const C = [
    A[0]*scale,
    A[1]*scale,
    A[2]*scale,
  ]
  return(C)
}

const SIZE = 1;



function genCaveVertex(x0,y0,z0){

  const chksize = Chunk.data.chunkSize;

  const L  = [];

  for (let x = 0; x <= chksize/SIZE; x++) {
    L[x] = [];
  for (let y = 0; y <= chksize/SIZE; y++) {
    L[x][y] = [];
  for (let z = 0; z <= chksize/SIZE; z++) {

    const X = x*SIZE + x0;
    const Y = y*SIZE + y0;
    const Z = z*SIZE + z0;

    const n0 = noise.perlin3(X/100,Y/100,Z/100) * 10 + 30 ; //20, 40
    const n1 = noise.perlin3(X/n0,Y/n0,Z/n0);


    const n = (n1 >= -0.5 - Y/400 ) ? 1 : 0;
    L[x][y][z] = n;
  }}}
  return(L)
}

function genSurfaceVertex(x0,y0,z0){

  const chksize = Chunk.data.chunkSize;

  const L  = [];

  for (let x = 0; x <= chksize/SIZE; x++) {
    L[x] = [];
  for (let y = 0; y <= chksize/SIZE; y++) {
    L[x][y] = [];
  for (let z = 0; z <= chksize/SIZE; z++) {

    const X = x*SIZE + x0;
    const Y = y*SIZE + y0;
    const Z = z*SIZE + z0;

    const ny0 = noise.perlin2(X/1000,Z/1000) * 200 + 400; // 200, 400
    const ny1 = noise.perlin2(X/ny0,Z/ny0) * 30 + 70; // 40, 110
    const ny2 = noise.perlin2(X/ny1,Z/ny1) * (ny1-30); //-20, 20


    const n = (ny2 - Y >= 0.0) ? 1 : 0;
    L[x][y][z] = n;
  }}}
  return(L)
}

function andVertex(mapA,mapB){

  const map = [];

  for (let x in mapA) {
    map[x] = [];
  for (let y in mapA[x]) {
    map[x][y] = [];
  for (let z in mapA[x][y]) {
    map[x][y][z] = mapA[x][y][z] && mapB[x][y][z];
  }}}
  return(map)
}


//===============================================
//    gen all in one shot

function genVertex(x0,y0,z0){

  const chksize = Chunk.data.chunkSize;

  const L  = [];

  for (let x = 0; x <= chksize/SIZE; x++) {
    L[x] = [];
  for (let y = 0; y <= chksize/SIZE; y++) {
    L[x][y] = [];
  for (let z = 0; z <= chksize/SIZE; z++) {

    const X = x*SIZE + x0;
    const Y = y*SIZE + y0;
    const Z = z*SIZE + z0;

    //cave generator
    
    const n0 = noise.perlin3(X/100,Y/100,Z/100) * 10 + 30 ; //20, 40
    const n1 = noise.perlin3(X/n0,Y/n0,Z/n0);
    


    const nc = (n1 >= -0.5 - Y/400 ) ? 1 : 0;

    //surface generator
    const ny0 = noise.perlin2(X/1000,Z/1000) * 200 + 400; // 200, 400
    const ny1 = noise.perlin2(X/ny0,Z/ny0) * 30 + 70; // 40, 110
    //const ny2 = noise.perlin2(X/ny1,Z/ny1) * (ny1-30);
    
    const ny2 = noise.perlin2(X/150,Z/150)*40 + noise.perlin2(X/11,Z/11)*2;


    const ns = (ny2 - Y >= 0.0) ? 1 : 0;
    
    //boule test

    const nb0 = noise.perlin3(X/20,Y/20,Z/20);
    const nb = (  (nb0 >= -0.5) ? 1 : 0  ) && ((X+30)*(X+30)+(Y-75)*(Y-75)+(Z+50)*(Z+50) + noise.perlin3(X/20,Y/20,Z/20)*10*10 <= 50*50);
    //----------
    //L[x][y][z] = nc && ns;      //grottes et surface
    L[x][y][z] = nc && ns || nb;    //grottes et surface + lune
    //L[x][y][z] = nb;          //lune


  }}}
  return(L)
}









function visualizer(L,x0,y0,z0,l = 1,c0 = "#f00"){

  const chksize = Chunk.data.chunkSize;

  const cave = new THREE.Group();

  const geo = new THREE.BoxGeometry( l, l, l );

  for (let x in L) {
  for (let y in L[x]) {
  for (let z in L[x][y]) {

    if( L[x][y][z] ){
      const mat = new THREE.MeshPhongMaterial( {color : c0});
      const visualBox = new THREE.Mesh( geo, mat );

      visualBox.position.set(x-chksize/2, y-chksize/2, z-chksize/2);
      cave.add( visualBox );
    }/*else{
      const mat = new THREE.MeshPhongMaterial( {color : "#000"});
      const visualBox = new THREE.Mesh( geo, mat );

      visualBox.position.set(x,y,z);
      cave.add( visualBox );
    }*/
    
  }}}


  scene.add(cave);
  cave.position.set(x0,y0,z0);
}



function marchingCube(L,x,y,z){

  const c000 = L[x][y][z];
  const c001 = L[x][y][z+1];
  const c010 = L[x][y+1][z];
  const c011 = L[x][y+1][z+1];
  const c100 = L[x+1][y][z];
  const c101 = L[x+1][y][z+1];
  const c110 = L[x+1][y+1][z];
  const c111 = L[x+1][y+1][z+1];

  const tri = [];

  const index = c000 + c100 * 2 + c101 * 4 + c001 * 8 + c010 * 16 + c110 * 32 + c111 * 64 + c011 * 128;

  const tei = trianglesEdgesIndex[index];

  for( let i of tei ){
    //tri.push( indexToVertex[i] );
    //tri.push( addVertex( indexToVertex[i], [ x, y, z ] ) );scaleVertex
    tri.push( scaleVertex( addVertex( indexToVertex[i], [ x, y, z ] ), SIZE ) );
  }

  return tri

}


/*
function marchingCubeDELETE(L,x,y,z){

  const c000 = L[x][y][z];
  const c001 = L[x][y][z+1];
  const c010 = L[x][y+1][z];
  const c011 = L[x][y+1][z+1];
  const c100 = L[x+1][y][z];
  const c101 = L[x+1][y][z+1];
  const c110 = L[x+1][y+1][z];
  const c111 = L[x+1][y+1][z+1];






  if( !c010 && !c110   && !c011 && !c111 && 
    !c000 && !c100   && !c001 && !c101 ){
    
    //0 0   0 0
    //0 0   0 0
    //[[]]
    
    return [[]]
  }
  if( c010 && c110   && c011 && c111 && 
    c000 && c100   && c001 && c101 ){
    
    //1 1   1 1
    //1 1   1 1
    //[[]]
    
    return [[]]
  }




  if( !c010 && !c110   && !c011 && !c111 && 
    c000 && !c100   && !c001 && !c101 ){
    
    //0 0   0 0
    //1 0   0 0

    //p0 = [.5, .0, .0]
    //p1 = [.0, .5, .0]
    //p2 = [.0, .0, .5]
    

    const p0 = [.5+x, .0+y, .0+z];
    const p1 = [.0+x, .5+y, .0+z];
    const p2 = [.0+x, .0+y, .5+z];
    return [p0, p1, p2]
  }



  if( !c010 && !c110   && !c011 && !c111 && 
    c000 && c100   && !c001 && !c101 ){
    
    //0 0   0 0
    //1 1   0 0

    //p0 = [1., .0, .5];
    //p1 = [.0, .5, .0];
    //p2 = [.0, .0, .5];
    //p3 = [1., .5, .0];
    

    const p0 = [1.0+x, .0+y, .5+z];
    const p1 = [.0+x, .5+y, .0+z];
    const p2 = [.0+x, .0+y, .5+z];
    const p3 = [1.0+x, .5+y, .0+z];
    return [p0, p1, p2, p3, p1, p0]
  }


  if( !c010 && c110   && !c011 && !c111 && 
    c000 && !c100   && !c001 && !c101 ){
    
    //0 0   0 0
    //1 1   0 0

    //p0 = [.5, .0, .0];
    //p1 = [.0, .5, .0];
    //p2 = [.0, .0, .5];
    //p3 = [1., .5, .0];
    //p4 = [.5, 1., .0];
    //p5 = [.0, 1., .5];
    

    const p0 = [.5+x, .0+y, .0+z];
    const p1 = [.0+x, .5+y, .0+z];
    const p2 = [.0+x, .0+y, .5+z];
    const p3 = [1.+x, .5+y, .0+z];
    const p4 = [.5+x, 1.+y, .0+z];
    const p5 = [.0+x, 1.+y, .5+z];

    return [p0, p1, p2, p3, p4, p5]
  }

  else{ // temporaire
    return [[]]
  }
}
*/


function marchingChunk(chunkPosition,L){
  const chksize = Chunk.data.chunkSize;

  const x0 = chunkPosition[0] * chksize;
  const y0 = chunkPosition[1] * chksize;
  const z0 = chunkPosition[2] * chksize;

  const triangles = [];

  for (let x = 0; x < chksize/SIZE; x++) {
  for (let y = 0; y < chksize/SIZE; y++) {
  for (let z = 0; z < chksize/SIZE; z++) {

    triangles.push( marchingCube(L,x,y,z) );
  }}}

  return triangles

}


function arrayToFloats(array){
  const L = [];
  for(let e0 of array){
  for(let e1 of e0){
  for(let e2 of e1){
    L.push(e2)
  }}}
  return(L)
}

//OBSOLETE
 function genMesh(chunkPosition,callback=()=>{}){

  const chksize = Chunk.data.chunkSize;

  const x0 = chunkPosition[0] * chksize;
  const y0 = chunkPosition[1] * chksize;
  const z0 = chunkPosition[2] * chksize;

  //const map = undergroundGenerator(chunkPosition)
  
/*
  let map;
  if(chunkPosition[1] < 4){
    map = undergroundGenerator(chunkPosition);
  }else if(chunkPosition[1] === 4){
    const map1 = undergroundGenerator(chunkPosition);
    const map2 = ongroundGenerator(chunkPosition);
    map = mapAND(map1,map2);
  }else{
    map = airGenerator(chunkPosition);
  }

  const surfaceMap = detectSurface(map);
  const tris = surfaceGenerator(surfaceMap);*/

  //const __L = genCaveVertex(x0,y0,z0);
  //const __L =  andVertex( genCaveVertex(x0,y0,z0), genSurfaceVertex(x0,y0,z0) );
  const __L = genVertex(x0,y0,z0);


  const tris =  marchingChunk(chunkPosition,__L);

  const trisfloat =  arrayToFloats(tris);

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array( trisfloat );
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

  geometry.computeVertexNormals();
  geometry.normalizeNormals();

  const material = new THREE.MeshPhongMaterial(  );//{side : THREE.DoubleSide}

  material.shadowSide = THREE.BackSide;
  //évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
  

  const mesh = new THREE.Mesh( geometry, material );
  //console.log(mesh.geometry.attributes.position)

  mesh.position.set(
    chunkPosition[0]*chksize - chksize/2,
    chunkPosition[1]*chksize - chksize/2,
    chunkPosition[2]*chksize - chksize/2,
    );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.material.color = {
    r: 0.8,
    g: 0.5+0.1*(chunkPosition[1]+5),
    b: 0.0,
  };

  put_in_chunk(mesh);
  //callback();
}


//const _L = genCaveVertex(0,20,10)

//visualizer(_L,0,20,10,.1,"#f00")


/*
const _n = marchingChunk([0,1,0],_L)
console.log(_n)*/

//genMesh([0,1,-5])

//------------------------------------------

class Terrain{
  static data = {
    collision : true,
    list : {},
    lenght : 0,
  }

  constructor(chunkPosition = undefined) {
    this.chunkPosition = chunkPosition;

    this.generation = Terrain.genVertex(this.chunkPosition);
    this.mesh = Terrain.genMesh(this.chunkPosition,this.generation);

    Terrain.data.list[this.chunkPosition] = this;
    Terrain.data.lenght += 1;
  }

  static genVertex(chunkPosition){
    const chksize = Chunk.data.chunkSize;

    const x0 = chunkPosition[0] * chksize;
    const y0 = chunkPosition[1] * chksize;
    const z0 = chunkPosition[2] * chksize;

    return genVertex(x0,y0,z0);
  }

  static genMesh(chunkPosition,generation){

    const chksize = Chunk.data.chunkSize;

    const x0 = chunkPosition[0] * chksize;
    const y0 = chunkPosition[1] * chksize;
    const z0 = chunkPosition[2] * chksize;

    const trianglesArray = marchingChunk(chunkPosition,generation);

    const triangles = arrayToFloats(trianglesArray);

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array( triangles );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    geometry.computeVertexNormals();
    geometry.normalizeNormals();

    let material;
    
    if (chunkPosition[1] >= 1) {
      material = materials.phong;
    }else if(chunkPosition[1] >= 0){
      material = materials.phongs.herbe;
      //material = materials.physical;
    }else if(chunkPosition[1] >= -2){
      material = materials.phongs.herbeTerre;
    }else if(chunkPosition[1] >= -4){
      material = materials.phongs.terre;
    }else if(chunkPosition[1] >= -8){
      material = materials.phongs.terreRoche;
    }else if(chunkPosition[1] >= -13){
      material = materials.phongs.roche;
    }else if(chunkPosition[1] >= -20){
      material = materials.phongs.rocheDur;
    }else{
      material = materials.phong;
    }

    const mesh = new THREE.Mesh( geometry, material );
    //console.log(mesh.geometry.attributes.position)

    //mesh.material.shadowSide = THREE.BackSide;
    //évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets

    mesh.position.set(
      x0 - chksize/2,
      y0 - chksize/2,
      z0 - chksize/2,
      );

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = "Terrain/" + chunkPosition;

    put_in_chunk(mesh);
    if( Terrain.data.collision ){
      // collisions
      const group = Chunk.data.list[ chunkPosition ].group;
      worldOctree.fromGraphNode( group );
    }

    return(mesh)
  }

  updateMesh(newGen){

    this.generation = newGen;

    this.mesh.geometry.deleteAttribute("position");
    this.mesh.geometry.deleteAttribute("normal");

    const trianglesArray = marchingChunk(this.chunkPosition,this.generation);

    const triangles = arrayToFloats(trianglesArray);

    const vertices = new Float32Array( triangles );

    this.mesh.geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    this.mesh.geometry.computeVertexNormals();
    this.mesh.geometry.normalizeNormals();


    /*if( Terrain.data.collision ){
      // collisions
      const group = Chunk.data.list[ chunkPosition ].group;

      //delete worldOctree.subTrees
      worldOctree.fromGraphNode( group );
    }*/

    this.mesh.geometry.attributes.position.needsUpdate = true;
  }


  //
}

/*
//à préparer

const position = Terrain.data.list["0,0,0"].mesh.geometry.attributes ;

        for ( let i = 0; i < position.count; i ++ ) {

          const y = 35 * Math.sin( i / 5 + ( time + i ) / 7 );
          position.setY( i, y );

        }

        position.needsUpdate = true;
*/


function testModifMesh(time){
  if ('0,-1,0' in Chunk.data.list) {
    const position = Terrain.data.list["0,-1,0"].mesh.geometry.attributes.position ;

    
    for ( let i = 0; i < position.count; i ++ ) {

      const y0 = 20//Terrain.data.list["0,-1,0"].mesh.geometry.attributes.position.array[ 1 + 3*i]
      const y = Math.sin( i / 30 + ( time + i ) / 40 );
      position.setY( i, y0 + y );

    }

    position.needsUpdate = true;
  }
  
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
//https://github.com/mrdoob/three.js/blob/master/examples/js/renderers/CSS3DRenderer.js

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
//              MATERIAUX

const materials = {
  phong : new THREE.MeshPhongMaterial(),
  phongs : {
      herbe : new THREE.MeshPhongMaterial( { color : '#52be80'} ),//vert pâle
      herbeTerre : new THREE.MeshPhongMaterial( { color : '#9e9d24'} ),//vert proche de terre
      terre : new THREE.MeshPhongMaterial( { color : '#ef6c00'} ),//orange terreux
      terreRoche : new THREE.MeshPhongMaterial( { color : '#922b21'} ),//bordeaux
      roche : new THREE.MeshPhongMaterial( { color : '#8d6e63'} ),//marron terre
      rocheDur : new THREE.MeshPhongMaterial( { color : '#273746'} ),//gris foncé
    },
  physical : new THREE.MeshPhysicalMaterial( {
      color : '#ffffff',
      emissive : '#451213',
      roughness : 0.5,
      metalness : 1.0,
      flatShading : false,

      transparent : true,
      opacity : 0.8,
    } ),
  moon : new THREE.MeshPhysicalMaterial( {
      color : '#ffffff',
      emissive : '#451213',
      roughness : 0.5,
      metalness : 1.0,
      flatShading : false,

      transparent : true,
      opacity : 0.8,
    } ),
}

//test à suppr

materials.phongs.herbeTerre.transparent = false;
materials.phongs.herbeTerre.opacity = 1.0;

//=================================================================================
//              GEOMETRIES

const geometries = {
  box : new THREE.BoxGeometry(1,1,1),
}

//=================================================================================
//              CONSTANTS INIT

const group__init = new THREE.Group();
//const geo__init = new THREE.BoxGeometry(1,1,1);
//const mat__init = new THREE.MeshPhongMaterial();
const box__init = new THREE.Mesh( geometries.box, materials.physical );
box__init.scale.set(5,1,5);
box__init.name = "initBlock"
group__init.add(box__init);
scene.add(group__init);
worldOctree.fromGraphNode( group__init );

const light = gen_DirectionalLight_object(3,100,5,128,0.1);
const lightInclin = new THREE.Vector3( 3, 100, 5 );

const light0 = gen_PointLight_object(0,0,0,4,0.05);


//=================================================================================
//              MAIN INIT

function main_init() {


  requestAnimationFrame( main_update );
  
  
  Chunk.genInitChunks()
  gen_AmbientLight();

  
  //genInit();

  //render_chunks([0,0,0],[0,0,1]);
  new_chunk([0,0,0])

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

let n = 0;
let time = 0;

function main_update() {

  
  


  requestAnimationFrame( main_update );
  
  n += 1;
  time += 1;
  if (n >= 5) {
    Chunk.genNewChunks()

    n = 0;
  }
  if (time % 3 === 0 ) {
    //testModifMesh(time);
  }
  

  
  //custom updates
  update_chunk()
  update_movement()

  move_DirectionalLight_object(light, player.position, lightInclin);
  move_PointLight_object(light0, player.position);
  
  player.update()

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

//main_init()
window.onload = main_init;

/*
Faire une liste exhaustive de tous les materials et geometry utilisés, pour éviter d'en créer des identiques (performance)

Faire une liste de N chunks, quand un chunk est chargé et que la liste est pleine, le nouveau chunk remplace le chunk le plus éloigné
*/

