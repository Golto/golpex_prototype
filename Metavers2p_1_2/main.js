


class Element{

	constructor(name = '', parents = []){
		this.name = name
		this.parents = parents;

		for (let parentName of this.parents) {
			const parent = Element.list.get(parentName)
			if (!parent.children.has(this.name)) {
				parent.children.add(this.name)
			}
		}

		this.children = new Set();
		this.isUnlocked = false;
		Element.list.set(this.name, this)
	}

	get rank(){
		//Pas idéal, car peut avoir des ancêtres de rank différents
		//On fera en sorte que le premier parent soit celui avec le plus haut rank
		if (this.parents.length > 0) {
			const firstParent = Element.list.get(this.parents[0])
			return 1 + firstParent.rank
		}
		return 0
	}

	//AI generated
	isEqualParents(otherParents) {
	  // Vérifier si le tableau des parents a la même longueur
	  if (this.parents.length !== otherParents.length) {
		return false;
	  }

	  // Vérifier si chaque élément dans le tableau des parents est présent dans l'autre tableau
	  for (var i = 0; i < this.parents.length; i++) {
		var parent = this.parents[i];
		if (!otherParents.includes(parent)) {
		  return false;
		}
	  }

	  // Vérifier si chaque élément dans l'autre tableau est présent dans le tableau des parents
	  for (var i = 0; i < otherParents.length; i++) {
		var parent = otherParents[i];
		if (!this.parents.includes(parent)) {
		  return false;
		}
	  }

	  // Les deux tableaux ont les mêmes éléments
	  return true;
	}

}

Element.list = new Map()
//------------------------------------------

//AI generated
function intersection(setA, setB) {
  let result = new Set();
  for (let elem of setB) {
    if (setA.has(elem)) {
      result.add(elem);
    }
  }
  return result;
}
//------------------------------------------


//tier 0 elements
const air = new Element('air')
const earth = new Element('earth')
const water = new Element('water')
const fire = new Element('fire')

//tier 1 elements

const wind = new Element('wind', ['air', 'air'])
const plant = new Element('plant', ['air', 'earth'])
const cloud = new Element('cloud', ['air', 'water'])
const heat = new Element('heat', ['air', 'fire'])

const rock = new Element('rock', ['earth', 'earth'])
//const aaa = new Element('aaa', ['earth', 'water'])
const lava = new Element('lava', ['earth', 'fire'])

const lake = new Element('lake', ['water', 'water'])
const steam = new Element('steam', ['water', 'fire'])

//const aaa = new Element('aaa', ['fire', 'fire'])


const sky = new Element('sky', ['air', 'air', 'air'])
const gravity = new Element('gravity', ['earth', 'earth', 'earth'])
const ocean = new Element('ocean', ['water', 'water', 'water'])
//const aaa = new Element('aaa', ['fire', 'fire', 'fire'])

const swamp = new Element('swamp', ['earth', 'water', 'plant']);

//tier 2 elements

//test
const space = new Element('space', ['sky', 'sky'])


//------------------------------------------

//elements dispos

let availableElements = new Set(['air', 'earth', 'water', 'fire'])

//------------------------------------------

function mergeElements(elementsTestedName){

	//N'autorise pas de fusionner des éléments que l'utilisateur ne possède pas
	for (let elem of elementsTestedName) {
		if (!availableElements.has(elem)) return null
	}

	//['air', 'air'] ---> [airObject, airObject]
	let elementsTested = elementsTestedName.map(e => Element.list.get(e))

	// On restreint la quantité d'enfants à tester en prenant que les enfants communs à tous les éléments
	childrenToTest = elementsTested[0].children
	for (let element of elementsTested) {
		//la première itération est A inter A = A
		childrenToTest = intersection(childrenToTest, element.children)
	}

	// On essaye pour tous les enfants si la combinaison correspond à leurs parents
	for (let childName of childrenToTest) {
		const child = Element.list.get(childName)
		if (child.isEqualParents(elementsTestedName)) {
			
			availableElements.add(childName)	// global : optionnel
			return childName
		}
	}
	return null
}


//mergeElements(['air', 'air']) = "wind"