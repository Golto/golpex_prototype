

function rand() {
  return Math.random() * 2 - 1
}

//https://www.youtube.com/watch?v=KjoqaZ2wwsI
// collisions
class Ball {
  constructor(x, y, mass, radius, color, velocity) {
    this.x = x;
    this.y = y; 
    this.radius = radius;
    this.mass = mass;
    this.color = color;
    this.velocity = velocity;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); 
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    //console.log(this.x)
  }
//https://fr.wikipedia.org/wiki/Collision_in%C3%A9lastique
  collideWith3D(otherBall) {

    const dx = this.x - otherBall.x;
    const dy = this.y - otherBall.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.radius + otherBall.radius) {
      console.log(this.color, otherBall.color, 'collision')
      const angle = Math.atan2(dy, dx);
      const m1 = this.mass;
      const m2 = otherBall.mass;

      // Speed before collision
      const u1 = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
      const u2 = Math.sqrt(otherBall.velocity.x * otherBall.velocity.x + otherBall.velocity.y * otherBall.velocity.y);

      // Angle before collision
      const a1 = Math.atan2(this.velocity.y, this.velocity.x);
      const a2 = Math.atan2(otherBall.velocity.y, otherBall.velocity.x);

      // Compute speed after collision
      const v1 = ((u1 * (m1 - m2) + 2 * m2 * u2) / (m1 + m2)) * Math.cos(a1 - angle);
      const v2 = ((u2 * (m2 - m1) + 2 * m1 * u1) / (m1 + m2)) * Math.cos(a2 - angle);

      // Update velocities
      this.velocity.x = v1 * Math.cos(angle) + u1 * Math.sin(a1 - angle) * Math.cos(angle + Math.PI / 2);
      this.velocity.y = v1 * Math.sin(angle) + u1 * Math.sin(a1 - angle) * Math.sin(angle + Math.PI / 2);

      otherBall.velocity.x = v2 * Math.cos(angle) + u2 * Math.sin(a2 - angle) * Math.cos(angle + Math.PI / 2);
      otherBall.velocity.y = v2 * Math.sin(angle) + u2 * Math.sin(a2 - angle) * Math.sin(angle + Math.PI / 2);
    }
  }

  collideWith2D(otherBall) {

    const dx = this.x - otherBall.x;
    const dy = this.y - otherBall.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < this.radius + otherBall.radius) {

      console.log(this.color, otherBall.color, 'collision')

      const angle = Math.atan2(dy, dx);
      const m1 = this.mass;
      const m2 = otherBall.mass;

      const u1 = Math.sqrt(this.velocity.x**2 + this.velocity.y**2); 
      const u2 = Math.sqrt(otherBall.velocity.x**2 + otherBall.velocity.y**2);

      const v1 = (u1 * (m1 - m2) + 2 * m2 * u2) / (m1 + m2);
      const v2 = (u2 * (m2 - m1) + 2 * m1 * u1) / (m1 + m2);

      this.velocity.x = v1 * Math.cos(angle);
      this.velocity.y = v1 * Math.sin(angle);

      otherBall.velocity.x = -v2 * Math.sin(angle);
      otherBall.velocity.y = v2 * Math.cos(angle);
    }

  }

  collideWith(otherBall) {

    const dx = otherBall.x - this.x;
    const dy = otherBall.y - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const dr = this.radius + otherBall.radius;
    
    if (dist < dr) {

      console.log(this.color, otherBall.color, 'collision')

      const m1 = this.mass;
      const m2 = otherBall.mass;

      const deep = dr - dist;

      const nx = dx / dist;
      const ny = dy / dist;

      const tx = -ny;
      const ty = nx;

      const dpt1 = this.velocity.x * tx + this.velocity.y * ty;
      const dpt2 = otherBall.velocity.x * tx + otherBall.velocity.y * ty;
      
      const dpn1 = this.velocity.x * nx + this.velocity.y * ny;
      const dpn2 = otherBall.velocity.x * nx + otherBall.velocity.y * ny;

      const v1 = (dpn1 * (m1 - m2) + 2 * m2 * dpn2) / (m1 + m2);
      const v2 = (dpn2 * (m2 - m1) + 2 * m1 * dpn1) / (m1 + m2);


      this.x += -nx * deep / 2;
      this.y += -ny * deep / 2;
      otherBall.x += nx * deep / 2;
      otherBall.y += ny * deep / 2;

      this.velocity.x = tx * dpt1 + nx * -Math.abs(v1);
      this.velocity.y = ty * dpt1 + ny * -Math.abs(v1);
      otherBall.velocity.x = tx * dpt2 + nx * Math.abs(v2);
      otherBall.velocity.y = ty * dpt2 + ny * Math.abs(v2);
    }

  }

  collideWith2(otherBall) {
    const dx = this.x - otherBall.x;
    const dy = this.y - otherBall.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.radius + otherBall.radius) {
      // Collision logic here 

      console.log('collide')

      const m1 = this.mass; 
      const m2 = otherBall.mass;

      const angle = Math.atan2(dy, dx);/*
      const speed1 = Math.sqrt(this.velocity.x**2 + this.velocity.y**2);
      const speed2 = Math.sqrt(otherBall.velocity.x**2 + otherBall.velocity.y**2);
*/
      const xu1 = ((m1 - m2) * this.velocity.x + 2 * m2 * otherBall.velocity.x) / (m1 + m2);
      const xu2 = ((m2 - m1) * otherBall.velocity.x + 2 * m1 * this.velocity.x) / (m1 + m2);

      this.velocity.x = xu1 //* Math.cos(angle);
      otherBall.velocity.x = xu2 //* Math.cos(angle);

      const yu1 = ((m1 - m2) * this.velocity.y + 2 * m2 * otherBall.velocity.y) / (m1 + m2);
      const yu2 = ((m2 - m1) * otherBall.velocity.y + 2 * m1 * this.velocity.y) / (m1 + m2);

      this.velocity.y = yu1 //* Math.sin(angle);
      otherBall.velocity.y = yu2 //* Math.sin(angle);
/*
      const vx1 = speed1 * Math.cos(angle);
      const vy1 = speed1 * Math.sin(angle);

      const vx2 = speed2 * Math.cos(angle + Math.PI);
      const vy2 = speed2 * Math.sin(angle + Math.PI);

      this.velocity.x = vx1; 
      this.velocity.y = vy1;

      otherBall.velocity.x = vx2;
      otherBall.velocity.y = vy2;*/
    }
  }
}


class Wall {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2; 
    this.y2 = y2;
    this.color = 'white';
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
    //ctx.fillRect(this.x1, this.y1, this.x2, this.y2); 
  }

  collideWithBall(ball) {
    // Vérifier si la balle touche le segment entre (x1, y1) et (x2, y2)
    const dx = this.x2 - this.x1;
    const dy = this.y2 - this.y1;
    
    const t = ((ball.x - this.x1) * dx + (ball.y - this.y1) * dy) / (dx*dx + dy*dy);
    
    if (t > 0 && t < 1) {
      // Point d'intersection sur le segment
      const px = this.x1 + t * dx;
      const py = this.y1 + t * dy;
      
      // Vecteur normal sortant
      const nx = dy; 
      const ny = -dx;
      
      // Distance au point d'intersection
      const dist = Math.sqrt((px-ball.x)**2 + (py-ball.y)**2);
      
      if (dist < ball.radius) {
        // Collision !
        
        // Calculer angle de réflexion
        const angle = Math.atan2(ny, nx);
        
        const speed = Math.sqrt(ball.velocity.x**2 + ball.velocity.y**2);
        ball.velocity.x = speed * Math.cos(angle);
        ball.velocity.y = speed * Math.sin(angle);
      }
    }
  }
}



console.log('init marble')


const canvas = document.getElementById('marble');
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d')


const scaleX = canvas.width / 2;
const scaleY = canvas.height / 2;
const aspectRatio = canvas.width / canvas.height;

ctx.scale(scaleX / aspectRatio, scaleY);
ctx.translate(1, 1);

// Créer des billes 
const ball1 = new Ball(0.0, 0.0, 2.5, 0.02, 'red', {x: 0.0028, y: 0.003});
const ball2 = new Ball(0.2, 0.3, 2, 0.05, 'blue', {x: 0.0003, y: 0.0000});
const ball3 = new Ball(0.4, -0.3, 5, 0.08, 'green', {x: -0.0005, y: 0.004});
const ball4 = new Ball(-0.4, 0.0, 35, 0.15, 'black', {x: -0.009, y: 0.008});

// Créer les murs 
const wallR = new Wall(0.9, 1, 1, -1);
const wallL = new Wall(-1, -1, -0.9, 1);
const wallT = new Wall(1, -1, -1, -0.9);
const wallB = new Wall(-1, 0.9, 1, 1);

const balls = [ball1, ball2, ball3, ball4]
const walls = [wallR, wallL, wallT, wallB]

for (let i = 0; i < 10; i++) {
  const mass = Math.random() * 3 + 3
  balls.push(new Ball(
    rand(), rand(),
    mass,
    mass * 0.01,
    'white',
    {x: rand() * 0.01, y: rand() * 0.01}
    )
  )
}

function animate() {

  requestAnimationFrame( animate );
  render()

  //if (RENDERERS_RUNNING.get('appMarble')) render()
}

function render() {

  // Effacer le contenu précédent du canvas
  ctx.clearRect(-1,-1,2,2)

  // Dans la boucle d'animation
  /*
  ball1.update();
  ball1.draw(ctx);

  ball2.update();
  ball2.draw(ctx);

  ball3.update();
  ball3.draw(ctx);
  */

  balls.map( ball => {
    ball.update();
    ball.draw(ctx);
  })

  

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      balls[i].collideWith(balls[j]);
    }
  }

  walls.map( wall => {
    wall.draw(ctx);
    balls.map( ball => {
      wall.collideWithBall(ball)
    })
  })

  // Vérifier les collisions
  /*
  ball1.collideWith(ball2);

  ball1.collideWith(ball3);
  ball2.collideWith(ball3);*/
}


//RENDERERS_INIT.set('appMarble', init);

requestAnimationFrame( animate )