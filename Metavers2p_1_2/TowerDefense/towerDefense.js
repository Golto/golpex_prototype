const canvas = document.getElementById('renderer')
canvas.width = screen.width //* 0.4
canvas.height = screen.height //* 0.6
let ctx = canvas.getContext('2d')
let ar = canvas.width / canvas.height



class Vector2{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}

	clone(){
		return new Vector2(this.x, this.y)
	}

	copy(other){
		this.x = other.x;
		this.y = other.y;
		return this
	}

	set(x,y){
		this.x = x;
		this.y = y;
		return this
	}

	add(other){
		this.x += other.x;
		this.y += other.y;
		return this
	}

	sub(other){
		this.x -= other.x;
		this.y -= other.y;
		return this
	}

	multiplyScalar(scalar){
		this.x *= scalar;
		this.y *= scalar;
		return this
	}

	divide(scalar){
		this.x /= scalar;
		this.y /= scalar;
		return this
	}

	distanceSquared(other){
		const v = this.clone().sub(other)
		return v.x * v.x + v.y * v.y
	}

	distance(other){
		return Math.sqrt(this.distanceSquared(other))
	}

	normSquared(){
		return this.x * this.x + this.y * this.y
	}
	norm(){
		return Math.sqrt(this.normSquared())
	}

	normalize(){
		if (this.normSquared() === 0) return this
		return this.divide(this.norm())
	}




	giggle(a){
		this.x += a * Math.cos(0.1 * this.x)
		this.y += a * Math.sin(0.1 * this.y)
		return this
	}

	toScreenSize(){
		const x = remapValue(this.x, -1, 1, 0, canvas.width)
		const y = remapValue(this.y, -1, 1, 0, canvas.height)
		return new Vector2(x, y * ar)
	}

	toGameSize(){
		const x = remapValue(this.x, 0, canvas.width, -1, 1)
		const y = remapValue(this.y / ar, 0, canvas.height, -1, 1)
		return new Vector2(x, y)
	}
}

function remapValue(value, a, b, c, d) {
  // Convertir la valeur donnée de l'intervalle a-b à un pourcentage
  const percentage = (value - a) / (b - a);
  
  // Convertir le pourcentage au nouveau domaine c-d
  const remappedValue = percentage * (d - c) + c;
  
  return remappedValue;
}


const CENTER = new Vector2(0,0)

class Tower{
	constructor(position){
		this.position = position
		
		this.hp = 20;
		this.attackSpeed = 150//1500;//1.5s
		this.clock = 0;
		this.size = 0.07;

		this.uuid = crypto.randomUUID()
		Tower.list.set(this.uuid,this)
	}

	findNearestEnemy(){
    let nearestEnemy = null;
    let minDistance = 0.5;
    
    for (let [id,enemy] of Enemy.list) {
      const distance = this.position.distance(enemy.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestEnemy = enemy;
      }
    }
    
    return nearestEnemy;
  }

  shoot(){
  	this.clock += 1;
  	const nearestEnemy = this.findNearestEnemy();
  	if(nearestEnemy && this.clock > this.attackSpeed / timePerFrame) {
  		new Projectile(this.position.clone(), nearestEnemy.position.clone().sub(this.position))
  		this.clock = 0;
  	}

  }

	render(ctx) {
		const screenPosition = player.world2view(this.position).toScreenSize()
		
		const screenPositionDiff = player.world2view(new Vector2(this.size, 0).add(this.position)).toScreenSize()
		const screenSize = screenPositionDiff.distance(screenPosition)

		ctx.beginPath();
		ctx.fillStyle = 'red';
  	ctx.arc(screenPosition.x, screenPosition.y, screenSize, 0, Math.PI*2);//calculer le nouveau rayon
  	ctx.fill();
  
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1; // épaisseur du trait
		ctx.stroke();
	}
}
Tower.list = new Map()




class Projectile{
	constructor(position, direction){
		this.origin = position;
		this.position = position.clone();
		this.direction = direction.normalize();
		this.speed = 0.03;
		this.maxDistance = 1.2;
		this.damage = 1;

		this.size = 0.02;

		this.uuid = crypto.randomUUID();
		if (Projectile.list.size < 200) {
			Projectile.list.set(this.uuid, this)
		}

	}

	// Méthode de détection de collision avec les ennemis
  checkCollision(enemies) {
    for (const [id,enemy] of enemies) {
      const distance = this.position.distance(enemy.position);
      if (distance < (this.size + enemy.size) * 0.5) {
        // Collision détectée, mettre à jour les points de vie de l'ennemi
        enemy.hp -= this.damage;
        if (enemy.hp <= 0) {
          // L'ennemi est mort, le supprimer de la liste des ennemis
          Enemy.list.delete(id);
        }
        // Supprimer le projectile de la liste des projectiles
        Projectile.list.delete(this.uuid);
        return true;
      }
    }
    return false;
  }

	forward(){
    const displacement = this.direction.clone().multiplyScalar(this.speed);
    this.position.add(displacement);
  }

  isMaxDistanceSurpassed(){
  	return this.origin.distanceSquared(this.position) > this.maxDistance * this.maxDistance
  }

  render(ctx) {
		const screenPosition = player.world2view(this.position).toScreenSize()
		
		const screenPositionDiff = player.world2view(new Vector2(this.size, 0).add(this.position)).toScreenSize()
		const screenSize = screenPositionDiff.distance(screenPosition)

		ctx.beginPath();
		ctx.fillStyle = 'yellow';
  	ctx.arc(screenPosition.x, screenPosition.y, screenSize, 0, Math.PI*2);
  	ctx.fill();
  
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.stroke();
	}
}
Projectile.list = new Map()



//faire l'intersection enemy/projectile et faire perdre de la vie à enemy si intersection non vide
class Enemy{
	constructor(position, speed){
		this.position = position;
		

		this.speed = speed;
		this.hp = 7;
		this.attackSpeed = 500;//0.5s
		this.damage = 1;
		this.clock = 0;
		this.size = 0.04;
		this.inRange = false;

		this.uuid = crypto.randomUUID();
		Enemy.list.set(this.uuid, this)
		/*
		
		this.attackPower = attackPower;
		this.attackSpeed = attackSpeed;
		

		this.appearence = null;
		*/
	}
	findNearestTower(){
    let nearestTower = null;
    let minDistance = Infinity;
    
    for (let [id,tower] of Tower.list) {
      const distance = this.position.distance(tower.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestTower = tower;
      }
    }
    
    return nearestTower;
  }

	approachNearestTower(){
    const nearestTower = this.findNearestTower();
    if (nearestTower) {
    	this.checkRange(nearestTower)

    	if (this.inRange) {
    		this.attack(nearestTower)
    	}
    	else{
    		const direction = nearestTower.position.clone().sub(this.position).normalize();
     		const displacement = direction.multiplyScalar(this.speed);
      	this.position.add(displacement).giggle(this.speed * 0.8);
    	}
      
    }
  }

  // Méthode de détection de portée de la tour
  checkRange(tower) {
    const distance = this.position.distance(tower.position);
    this.inRange = distance < (this.size * 4 + tower.size) * 0.5 ;
  }

  // Méthode d'attaque de la tour
  attack(tower) {
  	this.clock += 1;
  	if(this.clock > this.attackSpeed / timePerFrame) {
  		this.clock = 0;

  		// L'ennemi est à portée, effectuer l'attaque
	    tower.hp -= this.damage;
	    if (tower.hp <= 0) {
	      // La tour est détruite, supprimer la tour de la liste des tours
	      Tower.list.delete(tower.uuid);
	    }
  	}

    
    
  }



  render(ctx) {

		const screenPosition = player.world2view(this.position).toScreenSize()
		
		const screenPositionDiff = player.world2view(new Vector2(this.size, 0).add(this.position)).toScreenSize()
		const screenSize = screenPositionDiff.distance(screenPosition)

		ctx.beginPath();
		ctx.fillStyle = 'green';
  	ctx.arc(screenPosition.x, screenPosition.y, screenSize, 0, Math.PI*2);
  	ctx.fill();
  
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1; // épaisseur du trait
		ctx.stroke();
	}

}
Enemy.list = new Map()

class Camera{
	constructor(position){
		this.position = position;
	}

	world2view(objectPosition){
		// view : x,y in [-1,1]x[-1,1]
		return objectPosition.clone().sub(this.position)
	}

	view2world(objectPosition){
		// view : x,y in [-1,1]x[-1,1]
		return objectPosition.clone().add(this.position)
	}
}



class HexGrid {
	constructor(rows, cols, hexSize) {
		this.rows = rows;
		this.cols = cols;
		this.hexSize = hexSize;
		this.hexagons = [];


		for (let r = 0; r < rows; r++) {
			for (let q = 0; q < cols; q++) {
				const hex = new Hexagon(q, r, hexSize);
				this.hexagons.push(hex);
			}
		}
	}

	getHexagon(q,r){
		return this.hexagons[q + r * this.cols]
	}

	render(ctx) {
		for (const hex of this.hexagons) {
			hex.render(ctx);
		}
	}
}

class Hexagon {
	constructor(q, r, size) {
		this.q = q;
		this.r = r;
		this.size = size;
		this.x = size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
		this.y = size * (3 / 2 * r);

		this.color = 'orange';
		this.status = 'noTower';
		this.towerUUID = '';
	}

	isInside(pos) {
	  const q2x = Math.abs(pos.x - this.x); // transform the test point locally and to quadrant 2
	  const q2y = Math.abs(pos.y - this.y); // transform the test point locally and to quadrant 2
	  if (q2x > this.size || q2y > this.size) return false; // bounding test
	  return this.size * this.size - this.size * q2x - this.size / 2 * q2y >= 0; // dot product test
	}

	render(ctx) {
		// Calculer les points des sommets de l'hexagone
		const points = [];
		for (let i = 0; i < 6; i++) {
			const angle = Math.PI / 3 * (i + .5);
			const x = this.x + this.size * Math.cos(angle);
			const y = this.y + this.size * Math.sin(angle);

			const screenPosition = player.world2view(new Vector2(x, y)).toScreenSize()

			points.push({ x : screenPosition.x, y : screenPosition.y });
		}

		// Commencer un nouveau chemin de dessin
		ctx.beginPath();

		// Déplacer le curseur vers le premier point du premier côté
		ctx.moveTo(points[0].x, points[0].y);

		// Dessiner les côtés de l'hexagone en se déplaçant de point en point
		for (let i = 1; i < 6; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}

		// Fermer le chemin
		ctx.closePath();

		// Remplir ou contourner l'hexagone en utilisant les méthodes fill() ou stroke()
		// Par exemple, pour remplir l'hexagone avec une couleur rouge :
		ctx.fillStyle = this.color;
		ctx.fill();

		// Pour contourner l'hexagone avec une couleur noire :
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2; // épaisseur du trait
		ctx.stroke();
	}
}

const grid = new HexGrid(10,10,0.15)



/*
new Tower(new Vector2(-0.5,0))
new Tower(new Vector2(0.0,-0.4))
new Tower(new Vector2(0.7,-0.7))
new Tower(new Vector2(1.52,-0.4))
new Tower(new Vector2(1.4,0.7))
*/
const player = new Camera(new Vector2(2,1))

/*
new Enemy(new Vector2(0.8,0.3), 0.005)
new Enemy(new Vector2(0.1,0.3), 0.003)
new Enemy(new Vector2(0.3,0.3), 0.004)
new Enemy(new Vector2(0.5,0.3), 0.005)
*/







window.onresize = function () {
	canvas.width = screen.width //* 0.4
	canvas.height = screen.height //* 0.6
	ctx = canvas.getContext('2d')
	ar = canvas.width / canvas.height
};

/*
function showDisc(position, radius, color){
	ctx.beginPath();
	ctx.fillStyle = color;
  ctx.arc(position.x, position.y, radius, 0, Math.PI*2);
  ctx.fill();
  
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2; // épaisseur du trait
		ctx.stroke();
}

function showSquare(position, size, color){
	ctx.fillStyle = color;
	ctx.fillRect(position.x - size , position.y - size , 2*size, 2*size);
	
	//contour marche pas
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2; // épaisseur du trait
		ctx.stroke();
}*/

function animate(){

	// Efface le canvas avant de redessiner
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	grid.render(ctx)
	

	for (let [id,tower] of Tower.list) {
		tower.shoot()
		tower.render(ctx)
	}

	for (let [id,projectile] of Projectile.list) {
		projectile.forward();
		projectile.render(ctx);
		projectile.checkCollision(Enemy.list)

    if (projectile.isMaxDistanceSurpassed()) Projectile.list.delete(id);
	}

	for (let [id,enemy] of Enemy.list) {
		enemy.approachNearestTower();
		enemy.render(ctx);
	}

}

let t0 = 0;
let running = false;
let requestId = null;
let timePerFrame = 10;

function render(t){
	
	let dt = t - t0
	//console.log(t0,t,dt)
	if (dt > timePerFrame && running) {
		spawnEnemy()
		animate();
		
		t0 = t
	}

	requestId = requestAnimationFrame(render)
	
}

function start(){
  if (!running) {
    running = true;
    requestId = requestAnimationFrame(render);
  }
}

function pause(){
  if (running) {
    running = false;
    cancelAnimationFrame(requestId);
  }
}



canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const mouseVect = new Vector2(mouseX, mouseY);
  const mouseGamePosition = player.view2world(mouseVect.toGameSize());

  const hexagon = findClickedHexagon(mouseGamePosition)
  if (hexagon) {

  	if (hexagon.status === 'noTower') {
  		hexagon.color = 'lightgreen'
  		const tower = new Tower(new Vector2(hexagon.x, hexagon.y))
  		hexagon.towerUUID = tower.uuid
  		hexagon.status = 'tower'
  		return 0
  	}
  	if (hexagon.status === 'tower') {
  		hexagon.color = 'grey'
  		Tower.list.delete(hexagon.towerUUID)
  		hexagon.towerUUID = ''
  		hexagon.status = 'noTower'
  		return 0
  	}
  	
  	
  }
});

function findClickedHexagon(pos){
	// Parcourir les hexagones de votre grille et vérifier si le clic de souris se trouve à l'intérieur de l'un d'entre eux
  for (let hexagon of grid.hexagons) {
    // Comparer les coordonnées du clic de souris avec les coordonnées de l'hexagone
    if (hexagon.isInside(pos)) {
      // Le clic de souris se trouve à l'intérieur de l'hexagone
      return hexagon
    }

  }
  return null
}

function spawnEnemy() {
  const radius = 4 + Math.random() * 3; // Rayon aléatoire entre 4 et 7
  const angle = Math.random() * 2 * Math.PI; // Angle aléatoire entre 0 et 2 * PI

  // Calcul des coordonnées x et y à partir du rayon et de l'angle
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);

  // Création d'un nouvel ennemi à la position générée
  if (Math.random() < 0.05) new Enemy(new Vector2(x, y), 0.005);
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

class Polynom{
	constructor(coefficients, dimensions){
		//coeffs = [1,2,3,4] dims = [2,2] => P = 1 + 2X + 3Y + 4XY
		//coeffs = [1,2,3,4] dims = [4] => P = 1 + 2X + 3XX + 4XXX
		this.coefficients = coefficients;
		this.dimensions = dimensions;
	}
/*
	getCell(i,j){
		return this.coefficients[ i + j * this.dimensions[0]]
	}
getCell(i,j,k){
		return this.coefficients[ i + this.dimensions[0] * (j  + this.dimensions[1] * k) ]
	}

	*/
	getCell(array){
		const len = array.length
		let index = array[len - 1];
		for (let i = 1; i < len; i++) {
			index = array[len - i - 1] + this.dimensions[len - i - 1] * index;
		}
		return this.coefficients[ index ]
	}

	clone(){
		return new Polynom([...this.coefficients], [...this.dimensions])
	}

	derive(index){
		//derive(0) : dérive par rapport à X
		//derive(1) : dérive par rapport à Y
		const coefficients = []
		const dimensions = [...this.dimensions]
		dimensions[index] -= 1;

		//coefficients.push( this.getCell([]) )


	}

	print(){
		//coeffs = [1,2,3,4] dims = [2,2] => "1 + 2X + 3Y + 4XY"
	}
}

// Exemple d'utilisation
const coefficients = [1, 2, 3, 4, 5, 6];
const dimensions = [2, 3];
const polynom = new Polynom(coefficients, dimensions);

console.log("Polynôme initial :", polynom);

const derivedPolynom = polynom.derive(0); // Dérivation par rapport à X
console.log("Polynôme dérivé par rapport à X :", derivedPolynom);

const derivedPolynom2 = polynom.derive(1); // Dérivation par rapport à Y
console.log("Polynôme dérivé par rapport à Y :", derivedPolynom2);