const cv = document.getElementById('rayTracerCtx')
cv.width = screen.width
cv.height = screen.height
const ctx = cv.getContext('2d')

ctx.fillStyle = 'rgba(30,30,30,1)'
ctx.fillRect(0, 0, cv.width, cv.height)




class Vector{
	constructor(x ,y ,z){
		this.x = x;
		this.y = y;
		this.z = z;
	}

	clone(){
		return new Vector(this.x, this.y, this.z)
	}

	copy(other){
		this.x = other.x;
		this.y = other.y; 
		this.z = other.z;
		return this
	}

	scale(scalar) {
  	this.x *= scalar;
		this.y *= scalar; 
		this.z *= scalar;
		return this  
  }

	add(other){
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		return this
	}

	sub(other){
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		return this
	}

	multiplyScalar(scalar){
		this.x *= scalar;
		this.y *= scalar; 
		this.z *= scalar;
		return this
	}

	normSquared(){
		return this.x * this.x + this.y * this.y + this.z * this.z
	}

	norm(){
		return Math.sqrt(this.normSquared())
	}

	normalize(){
		if (this.norm() === 0) return this // debug
		this.multiplyScalar(1/this.norm())
		return this
	}

	cross(other){
		this.x = this.y * other.z - this.z * other.y
    this.y = this.z * other.x - this.x * other.z
    this.z = this.x * other.y - this.y * other.x
		return this
	}

	getComponent(i){
		return [this.x, this.y, this.z][i]
	}

	setComponent(i,value){
		if (i === 0) {
			this.x = value;
		}
		if (i === 1){
			this.y = value;
		}
		if (i === 2) {
			this.z = value;
		}
		return this
	}
}

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  add(other) {
    return new Color(this.r + other.r, this.g + other.g, this.b + other.b);
  }

  scale(factor) {
    return new Color(this.r * factor, this.g * factor, this.b * factor);
  }

  toCSSColor() {
    const toHex = (c) => Math.round(Math.min(Math.max(0, c), 1) * 255).toString(16).padStart(2, '0');
    return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
  }

  static black() {
    return new Color(0, 0, 0);
  }

  static white() {
    return new Color(1, 1, 1);
  }
}


class Scene {
  constructor() {
    this.objects = []; // Liste des objets dans la scène
    this.lights = []; // Liste des sources lumineuses dans la scène
    this.camera = null; // Caméra utilisée pour faire le rendu
  }

  addObject(object) {
    this.objects.push(object); // Ajoute un objet à la scène
  }

  addLight(light) {
    this.lights.push(light); // Ajoute une source lumineuse à la scène
  }

  setCamera(camera) {
    this.camera = camera; // Définit la caméra à utiliser pour faire le rendu
  }

  trace(ray, depth) {
  	const MAX_DEPTH = 100
    if (depth > MAX_DEPTH) {
      return new Color(0, 0, 0);
    }

    let closestObject = null;
    let closestDistance = Infinity;

    for (const object of this.objects) {
      const intersection = object.intersect(ray);
      //console.log(intersection)
      if (intersection && intersection.distance < closestDistance) {
        closestObject = object;
        closestDistance = intersection.distance;
      }
    }

    if (!closestObject) {
      return new Color(0, 0, 0);
    }

    const intersection = closestObject.intersect(ray);
    const surfaceColor = closestObject.material.getColor(intersection);

    let color = new Color(0, 0, 0);

    for (const light of this.lights) {
      const shadowRay = new Ray(intersection.point, light.position.subtract(intersection.point).normalize());
      let isInShadow = false;

      for (const object of this.objects) {
        if (object === closestObject) {
          continue;
        }

        if (object.isIntersecting(shadowRay)) {
          isInShadow = true;
          break;
        }
      }

      if (!isInShadow) {
        const diffuse = Math.max(intersection.normal.dot(shadowRay.direction), 0);
        const specular = Math.pow(Math.max(ray.direction.reflect(intersection.normal).dot(shadowRay.direction), 0), closestObject.material.specularExponent);
        color = color.add(surfaceColor.scale(light.intensity).scale(diffuse).add(new Color(1, 1, 1).scale(specular)));
      }
    }

    const reflectionRay = new Ray(intersection.point, ray.direction.reflect(intersection.normal));
    const reflectionColor = this.trace(reflectionRay, depth + 1);

    color = color.add(reflectionColor.scale(closestObject.material.reflection));

    return color;
  }
}


class Ray {
  constructor(origin, direction) {
    this.origin = origin; // Point d'origine du rayon
    this.direction = direction; // Direction du rayon (doit être normalisée)
  }

  at(t) {
    return this.origin.clone().add(this.direction.clone().multiplyScalar(t));
  }
}


class Camera {
  constructor(position, direction, up, fov, aspectRatio) {
    this.position = position;
    this.direction = direction.normalize();
    this.right = this.direction.cross(up).normalize();
    this.up = this.right.cross(this.direction).normalize();
    this.fov = fov;
    this.aspectRatio = aspectRatio;
  }

  castRay(x, y, width, height) {
    const fovRadians = this.fov * Math.PI / 180;
    const halfWidth = Math.tan(fovRadians / 2);
    const halfHeight = halfWidth / this.aspectRatio;
    const xNormalized = (x + 0.5) / width;
    const yNormalized = (y + 0.5) / height;
    const xView = (2 * xNormalized - 1) * halfWidth;
    const yView = (1 - 2 * yNormalized) * halfHeight;

    const direction = this.direction.
    	add(this.right.scale(xView)).
    	add(this.up.scale(yView)).
    	normalize();

    return new Ray(this.position, direction);
  }
}



class Material {
  constructor(diffuseColor, specularColor, shininess) {
    this.diffuseColor = diffuseColor;
    this.specularColor = specularColor;
    this.shininess = shininess;
  }

  getColor(intersection) {
  	return new Color(1,0,0)
  }
}



class Cube {
  constructor(center, size, material) {
    this.center = center; // Centre du cube
    this.size = size; // Taille du cube
    this.material = material; // Matériau du cube
  }

  intersect(ray) {

    const tMin = new Vector(-Infinity, -Infinity, -Infinity);
    const tMax = new Vector(Infinity, Infinity, Infinity);
    
    const dir = ray.direction;
    const orig = ray.origin.sub(this.center);
    
    for (let i = 0; i < 3; i++) {
      const invD = 1 / dir.getComponent(i);
      let t0 = (orig.getComponent(i) - this.size / 2) * invD;
      let t1 = (orig.getComponent(i) + this.size / 2) * invD;
      
      if (invD < 0) {
        [t0, t1] = [t1, t0];
      }
      
      tMin.setComponent(i, Math.max(t0, tMin.getComponent(i)));
      tMax.setComponent(i, Math.min(t1, tMax.getComponent(i)));
      
      if (tMax.getComponent(i) <= tMin.getComponent(i)) {
        return null;
      }
    }
    
    const tHit = Math.min(tMax.getComponent(2), Math.max(tMin.getComponent(0), Math.max(tMin.getComponent(1), tMin.getComponent(2))));
    const hitPoint = ray.at(tHit);
    const normal = new Vector(
      hitPoint.x - this.center.x,
      hitPoint.y - this.center.y,
      hitPoint.z - this.center.z
    ).normalize();
    
    return {
      distance: tHit,
      point: hitPoint,
      normal: normal,
      material: this.material
    };
  }
}















const player = new Camera(new Vector(0,0,0), new Vector(2,0,0), new Vector(0,1,0), 60, 16/9)

console.log(player)
const cube = new Cube(new Vector(2,0,0), 0.5, new Material(
		new Color(1,1,1),
		new Color(1,0,0),
		1
	))
const scene = new Scene()
scene.setCamera(player)
scene.addObject(cube)





function render(scene, ctx) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  for (let y = 0; y < height; y += 100) {
    for (let x = 0; x < width; x += 100) {
      const ray = scene.camera.castRay(x, y, width, height);
      const color = scene.trace(ray, 0);

      ctx.fillStyle = color.toCSSColor();
      ctx.fillRect(x, y, 1, 1);
    }
  }
}



function animate() {
  //requestAnimationFrame(animate);
  render(scene, ctx);
}

animate();
