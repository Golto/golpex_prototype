

function mod(x,n){
	return (x % n + n) % n
}

class Rational{
	constructor(num, den){
		this.isRational = true;
		this.num = num;
		this.den = den;
	}

	clone(){
		return new Rational(this.num, this.den)
	}

	copy(other){
		this.num = other.num;
		this.den = other.den;
	}

	toReal(){
		return this.num/this.den
	}


	isEquivalent(other) {
		return this.num * other.den === this.den * other.num;
	}

	add(other){
		const tempDen = this.den * other.den;
		this.num = this.num * other.den + this.den * other.num;
		this.den = tempDen
		this.reduce();
		return this
	}

	sub(other){
		const tempDen = this.den * other.den;
		this.num = this.num * other.den - this.den * other.num;
		this.den = tempDen
		this.reduce();
		return this
	}

	multiply(other){
		this.num *= other.num;
		this.den *= other.den;
		this.reduce();
		return this
	}

	divide(other){
		this.num *= other.den;
		this.den *= other.num;
		this.reduce();
		return this
	}

	reduce() {
		// On détermine le plus grand diviseur commun des numérateur et dénominateur
		let gcd = 1;
		let a = Math.abs(this.num);
		let b = Math.abs(this.den);
		const sign_a = Math.sign(this.num);

		while (b !== 0) {
			const t = b;
			b = a % b;
			a = t;
		}
		gcd = sign_a * a;

		// On réduit la fraction en divisant numérateur et dénominateur par le plus grand diviseur commun
		this.num = this.num / gcd;
		this.den = this.den / gcd;
		return this
	}

	toString(){
		return '' + this.num + '/' + this.den
	}
}

//--------------------------------------------------------------

//							INFINI
class MathSet{
	constructor(has){
		this.has = has;
	}
}


const SET_INTEGERS = new MathSet(Number.isInteger)
const SET_REALS = new MathSet(Number.isFinite)


class Operation {
	constructor(set){
		this.set = set;
	}

	apply(x,y){
		return 0
	}
}

class Group{
	constructor(set, operation){
		this.set = set;
		this.operation = operation;
	}

	has(x){
		return this.set.has(x)
	}

	isClosed(x,y){
		if (!this.has(x) || !this.has(y)) return false
		if (!this.has(this.operation(x,y))) return false
		return true
	}

	isAssociative(x,y,z){
		if (!this.has(x) || !this.has(y) || !this.has(z)) return false
		const xy = this.operation(x,y);
		const yz = this.operation(y,z);
		const A = this.operation(xy,z);
		const B = this.operation(x,yz);
		//if (!A.isEquivalent(B)) return false
		return true
	}

	isNeutral(e,x){
		if (!this.has(e) || !this.has(x)) return false
		//
	}
}


// --------------------------------------------------------------

//							FINI


class MathObject{
	constructor(values, isEquivalent, tags = null){
		this.values = values;
		this.tags = tags; 
		// il ne doit y avoir que des nombres ou des strings dans tags ex: new Map(rows : 5, name : 'abc')
		this.isEquivalent = isEquivalent;
	}

	isEquals(other){
		if (this.constructor.name != other.constructor.name) return false
		if (this.values.length != other.values.length) return false
		for (let i = 0; i < this.values.length; i++) {
			if (this.values[i] != other.values[i]) return false
		}
		// ... Comparer les tags aussi
		return true
	}
}

class Real extends MathObject{
	constructor(value){
		const isEquivalent = other => {
			if (this.values.length != 1) return false
			if (other.values.length != 1) return false
			const x = this.values[0];
			const y = other.values[0];
			if (!Number.isFinite(x)) return false
			if (!Number.isFinite(y)) return false
			if (x != y) return false
			return true
		}
		super([value], isEquivalent);
	}

	get value(){
		return this.values[0]
	}

	get toString(){
		return '' + this.value
	}

	add(other){
		const value = this.value + other.value
		return new Real(value)
	}

	multiply(other){
		const value = this.value * other.value
		return new Real(value)
	}

	
}

class Integer extends MathObject{
	constructor(value){
		const isEquivalent = other => {
			if (this.values.length != 1) return false
			if (other.values.length != 1) return false
			const x = this.values[0];
			const y = other.values[0];
			if (!Number.isInteger(x)) return false
			if (!Number.isInteger(y)) return false
			if (x != y) return false
			return true
		}
		super([value], isEquivalent);
	}

	get value(){
		return this.values[0]
	}

	get toString(){
		return '' + this.value
	}

	add(other){
		const value = this.value + other.value
		return new Integer(value)
	}

	multiply(other){
		const value = this.value * other.value
		return new Integer(value)
	}

	mod(n){
		return new Integer(mod(this.value,n))
	}

	
}

class Permutation extends MathObject{	// à faire
	/*
	new Permutation([1,3,4,2]) = [1->1;2->3;3->4;4->2] = (2 3 4)
	*/
	constructor(array, n){
		const isEquivalent = other => {
			if (this.values.length != other.values.length) return false
			const x = this.values[0];
			const y = other.values[0];
			if (!Number.isInteger(x)) return false
			if (!Number.isInteger(y)) return false
			if (x != y) return false
			return true
		}
		super(array, isEquivalent, {size : n});
	}

	get value(){
		return 0
	}

	get toString(){
		return '' + 0
	}

	compose(other){
		return 0
	}

	
}






class FiniteSet{
	constructor(elements){
		this.elements = new Set(elements);
	}

	has(x){
		//return this.elements.has(x) // par référence

		if (!x instanceof MathObject) return false
		for(let elem of this.elements){
			if (x.isEquals(elem)) return true
		}
		return false
	}
}

class FiniteGroup{
	constructor(finiteSet, operation){
		this.set = finiteSet;
		this.operation = operation;
	}

	has(x){
		return this.set.has(x)
	}

	isClosed(){
		for(let a of this.set.elements){
			for(let b of this.set.elements){
				if (!this.has(this.operation(a,b))) return false
			}
		}
		return true
	}

	isAssociative(){
		for(let a of this.set.elements){
			for(let b of this.set.elements){
				for(let c of this.set.elements){
					const ab = this.operation(a,b);
					const bc = this.operation(b,c);
					const A = this.operation(ab,c);
					const B = this.operation(a,bc);

					if (!A.isEquivalent(B)) return false
				}
			}
		}
		return true
	}
	findNeutral(){
		//peut trouver l'élément absorbant au lieu du neutre
		let neutral;
		const elem = this.set.elements.values().next().value;	//shlaguito
		for(let a of this.set.elements){
			if (elem.isEquivalent(this.operation(elem,a))) neutral = a;
		}
		return neutral
	}

	hasNeutral(){
		
		//peut échouer si il y a un élément absorbant, même si il y a un neutre
		const neutral = this.findNeutral()
		if (!neutral) return false

		//check if it is for all elements
		for(let a of this.set.elements){
			if (!a.isEquivalent(this.operation(a,neutral))) return false
		}
	return true
	}

	hasInverse(a,neutral){

		for (let b of this.set.elements) {
			if (!neutral.isEquivalent(this.operation(a,b))) return true
		}
		return false
	}

	isInversible(){
		const neutral = this.findNeutral()
		if (!neutral) return false

		for(let a of this.set.elements){
			if (!this.hasInverse(a,neutral)) return false
		}
		return true

	}

	isGroup(){
		if (!this.isClosed()) return false
		if (!this.isAssociative()) return false
		if (!this.hasNeutral()) return false
		if (!this.isInversible()) return false
		return true
	}

}

_0 = new Integer(0);
_1 = new Integer(1);
_2 = new Integer(2);

const SET_012 = new FiniteSet([_0,_1,_2])

const GROUP_012 = new FiniteGroup(SET_012, (x,y)=>{return x.add(y).mod(3)})