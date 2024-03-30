

function isMathObject(values){
	
	/*
	is MathObject if values are all integers or all MathObjects
	*/

	let isMathObject = true;

	for (let value of values) {
		isMathObject &&= (Number.isInteger(value) || value.isMathObject)
	}

	return isMathObject
}

class Integer{
	constructor(n){
		this.isMathObject = isMathObject([n]);
		this.isInteger = this.isMathObject;
		this.values = [n];
	}

	clone(){
		return new Integer([...this.values])
	}

	copy(other){
		if (!other.isInteger) {
			console.error('No change since other is not Integer')
			return this
		}
		this.values = [...other.values]
		return this
	}

	neutralAdd(){
		return new Integer(0)
	}

	nautralMultiply(){
		return new Integer(1)
	}

	neutralMultiplyScalar(){
		return 1
	}

	absorbingAdd(){
		return false
	}

	absorbingMultiply(){
		return new Integer(0)
	}

	absorbingMultiplyScalar(){
		return 0
	}

	add(other) {
		if (!other.isInteger) {
			console.error('No change since other is not Integer')
			return this
		}
		this.values[0] += other.values[0]
		return this
	}

	sub(other) {
		if (!other.isInteger) {
			console.error('No change since other is not Integer')
			return this
		}
		this.values[0] -= other.values[0]
		return this
	}

	multiply(other) {
		if (!other.isInteger) {
			console.error('No change since other is not Integer')
			return this
		}
		this.values[0] *= other.values[0]
		return this
	}

	multiplyScalar(scalar) {
		if (!Number.isInteger(scalar)) {
			console.error('No change since scalar is not Integer')
			return this
		}
		this.values[0] *= scalar
		return this
	}

	divide(other){
		console.error('No change since Integer do not have dividing property')
		return this
	}

	apply(value){
		return this.values[0]
	}

	derive(){
		console.error('No change since Integer do not have deriving property')
		return this
	}

	Integrate(c){
		console.error('No change since Integer do not have integrating property')
		return this
	}

	exp(){
		console.error('No change since Integer do not have exponentiating property')
		return this
	}

	norm(){
		return Math.abs(this.values[0])
	}

	distanceTo(other){
		return this.norm(this.clone().sub(other))
	}
}



class MathObject{
	constructor(values){
		this.isMathObject = isMathObject(values);
		this.values = values;
	}

	clone(){
		return new MathObject([...this.values])
	}

	copy(other){
		this.values = [...other.values]
		return this
	}

	neutralAdd(){
		// (0,0) => A + (0,0) = A
		return this
	}

	nautralMultiply(){
		// (1,1) => A x (1,1) = A
		return this
	}

	neutralMultiplyScalar(){
		// 1 => A . 1 = A
		return this
	}

	absorbingAdd(){
		// ? => A + ? = ?
		return this
	}

	absorbingMultiply(){
		// (0,0) => A x (0,0) = (0,0)
		return this
	}

	absorbingMultiplyScalar(){
		// 0 => A . 0 = (0,0)
		return this
	}


	add(other) {
		// (1,2) + (4,1) = (5,3)
		return this
	}

	sub(other) {
		// (1,2) - (4,1) = (-3,1)
		return this
	}

	multiply(other) {
		// (1,2) x (4,1) = (4,2)
		return this
	}

	multiplyScalar(scalar) {
		// (1,2) . 4 = (4,8)
		return this
	}

	divide(other){
		// (1,2) / (4,1) = (0.25,2)
		return this
	}

	apply(value){
		// (1,2)(x) = 1+2x
		return this
	}

	derive(){
		// d(1,2) = (2,0)
		return this
	}

	Integrate(c){
		// i(1,2) = (c,1)
		return this
	}

	exp(){
		// e(1,2) = (2,2)
		return this
	}

	norm(){
		return this//Math.sqrt(this.moduleSquared())
	}

	distanceTo(other){
		return this.norm(this.clone().sub(other))
	}
}




class SemiMatrix2 extends MathObject {
	constructor(values){
		super(values);
		this.isSemiMatrix2 = this.isMathObject && values.length === 2
	}

	clone(){
		const values = [...this.values]
		values.map(e => e.clone())
		return new SemiMatrix2(values)
	}

	copy(other){
		if (!other.isSemiMatrix2) {
			console.error('No change since other is not SemiMatrix2')
			return this
		}
		this.values = [...other.values]//à refaire pour copier en profondeur
		return this
	}

	neutralAdd(){
		return new SemiMatrix2([0,0])
	}

	nautralMultiply(){
		return new SemiMatrix2([1,0])
	}

	neutralMultiplyScalar(){
		return 1
	}

	absorbingAdd(){
		return false
	}

	absorbingMultiply(){
		return new SemiMatrix2([0,0])
	}

	absorbingMultiplyScalar(){
		return 0
	}


	add(other) {
		if (!other.isSemiMatrix2) {
			console.error('No change since other is not SemiMatrix2')
			return this
		}
		this.values.map( (e,i) => e.add(other.values[i]))
		return this
	}

	sub(other) {
		if (!other.isSemiMatrix2) {
			console.error('No change since other is not SemiMatrix2')
			return this
		}
		this.values.map( (e,i) => e.sub(other.values[i]))
		return this
	}

	multiply(other) {
		if (!other.isSemiMatrix2) {
			console.error('No change since other is not SemiMatrix2')
			return this
		}
		this.values.map( (e,i) => e.sub(other.values[i]))//à faire à partir de là
		return this
	}

	multiplyScalar(scalar) {
		// (1,2) . 4 = (4,8)
		return this
	}

	divide(other){
		if (!other.isSemiMatrix2) {
			console.error('No change since other is not SemiMatrix2')
			return this
		}
		// (1,2) / (4,1) = (0.25,2)
		return this
	}

	apply(value){

		// (1,2)(x) = 1+2x
		return this
	}

	derive(){
		// d(1,2) = (2,0)
		return this
	}

	Integrate(c){
		// i(1,2) = (c,1)
		return this
	}

	exp(){
		// e(1,2) = (2,2)
		return this
	}

	norm(){
		return this//Math.sqrt(this.moduleSquared())
	}

	distanceTo(other){
		return this.norm(this.clone().sub(other))
	}
}


const e5 = new Integer(5)
const e7 = new Integer(7)
let a = new SemiMatrix2([e5,e7])