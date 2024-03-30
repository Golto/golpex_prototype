

const obj = {
	name : "Guillaume",
	surname : "Foucaud",
	id : function (){
		return(this.name + " " + this.surname)
	}
}


document.getElementById('p_obj').innerHTML = obj.id();

class Rectangle {
  constructor(hauteur, largeur) {
    this.hauteur = hauteur;
    this.largeur = largeur;
  }

  get area(){
  	return this.calcArea();
  }

  calcArea(){
  	return this.hauteur*this.largeur
  }
}

const square = new Rectangle(10, 10);



document.getElementById('p_class').innerHTML = square.area;