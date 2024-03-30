

function outputExtractor(prompt, response){
	const output = response.slice(prompt.length)
	return output
}


async function promptLLM(input){
	const res = await query({"inputs": input})
	return res[0].generated_text
}

// -------------------------------------------------------------------------------------------------
//				HIGH LEVEL PROMPT

async function LLM_MathTypeObject(input){
	let prompt = 
`Context : Mathematical thinking and objects.
Mission : Identifying the mathematical nature of the Input's Object.
Example Types : Integer, Rational, Real, Complex, Vector, Matrix, Polynom, Function, Varaiable, Constant, Set, Group, Number, Operator, Equation, Comparaison, Differential Equation.
`
//Number,Double,String,Array,Symbol,Operator
//Expression
	prompt += 'Input : ' + input + '\n';

	prompt += "Type detected :";
	res = await promptLLM(prompt);
	output1 = outputExtractor(prompt, res);

	prompt  = res;

	prompt += "\n2nd Type possible :";
	res = await promptLLM(prompt);
	output2 = outputExtractor(prompt, res);

	prompt  = res;

	prompt += "\n3rd Type possible :";
	res = await promptLLM(prompt);
	output3 = outputExtractor(prompt, res);


	console.log(res)
	
	return [output1,output2,output3]
}



// =====================================================================================
//							HANDLER

const inMathMaker = document.getElementById('inputMathMaker')
const outMathMaker = document.getElementById('outputMathMaker')
const outVariables = document.getElementById('outputMathMakerVariable')

function handle(e){
	let input = inMathMaker.value

	if(e.key === 'Enter'){
		multitasking(input)
	}
}

// =====================================================================================
//							TASK

async function multitasking(input){
	let printed = ''
	//let isMathematics = !!Number( await LLM_isMathematics(input) )

	const topic = await LLM_MathTypeObject(input)

	printLog(topic)
}




function printLog(input){
	outMathMaker.innerText = input;
}

// =====================================================================================
//							INTEGER

class Integer{
	constructor(value){
		this.isInteger = true;
		this.value = value;
	}

	clone(){
		return new Integer(this.value)
	}

	copy(other){
		if (!other.isInteger) {
			console.error('No change since ' + other + ' is not Integer')
			return this
		}
		this.values = other.value
		return this
	}

	add(other){
		if (other.isInteger) {
			this.value += other.value;
			return this
		}

		if (other.isRational) {
			const value = new Rational(this.value, 1)
			return value.add(other)
		}

		if (other.isReal) {
			const value = this.value + other.value
			return new Real(value)
		}

		if (other.isComplex) {
			const value = new Complex(this.value, 0)
			return value.add(other)
		}

		if (other.isPolynom) {
			const value = new Polynom([this.value])
			return value.add(other)
		}

		console.warn(this, other, 'can not be added')
		return 0
		
	}

	sub(other){
		if (other.isInteger) {
			this.value -= other.value;
			return this
		}

		if (other.isRational) {
			const value = new Rational(this.value, 1)
			return value.sub(other)
		}

		if (other.isReal) {
			const value = this.value - other.value
			return new Real(value)
		}

		if (other.isComplex) {
			const value = new Complex(this.value, 0)
			return value.sub(other)
		}

		if (other.isPolynom) {
			const value = new Polynom([this.value])
			return value.sub(other)
		}

		console.warn(this, other, 'can not be substracted')
		return 0
	}

	multiply(other){
		if (other.isInteger) {
			this.value *= other.value;
			return this
		}

		if (other.isRational) {
			const value = new Rational(this.value, 1)
			return value.multiply(other)
			// opti : juste multiplier other.num
		}

		if (other.isReal) {
			const value = this.value * other.value
			return new Real(value)
		}

		if (other.isComplex) {
			const value = new Complex(this.value, 0)
			return value.multiply(other)
		}

		if (other.isPolynom) {
			other.coeffs = other.coeffs.map((val, index) => this.value * val)
			return other
		}

		if (other.isVector) {
			other.array = other.array.map((val, index) => this.value * val)
			return other
		}

		if (other.isMatrix) {
			other.array = other.array.map((val, index) => this.value * val)
			return other
		}

		console.warn(this, other, 'can not be multiplied')
		return 0
	}

	divide(other){

		if (other.isInteger) {
			return new Rational(this.value, other.value)
		}

		if (other.isRational) {
			const value = new Rational(this.value, 1)
			return value.divide(other)
		}

		if (other.isReal) {
			const value = this.value / other.value
			return new Real(value)
		}

		if (other.isComplex) {
			const value = new Complex(this.value, 0)
			return value.divide(other)
		}

		console.warn(this, other, 'can not be divided')
		return 0
	}

	toString(){
		return '' + this.value
	}
}

// =====================================================================================
//							RATIONAL

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


	equivalent(other) {
		return this.num * other.den === this.den * other.num;
	}

	add(other){

		if (other.isInteger) {
			this.num = this.num + this.den * other.value;
			this.reduce();
			return this
		}

		if (other.isRational) {
			const tempDen = this.den * other.den;
			this.num = this.num * other.den + this.den * other.num;
			this.den = tempDen
			this.reduce();
			return this
		}

		if (other.isReal) {
			const value = this.toReal() + other.value
			return new Real(value)
		}

		if (other.isComplex) {
			const value = new Complex(this.toReal(), 0)
			return value.add(other)
		}

		if (other.isPolynom) {
			const value = new Polynom([this.toReal()])
			return value.add(other)
		}

		console.warn(this, other, 'can not be added')
		return 0
	}

	sub(other){
		if (other.isInteger) {
			this.num = this.num - this.den * other.value;
			this.reduce();
			return this
		}

		if (other.isRational) {
			const tempDen = this.den * other.den;
			this.num = this.num * other.den - this.den * other.num;
			this.den = tempDen
			this.reduce();
			return this
		}

		if (other.isReal) {
			const value = this.toReal() - other.value
			return new Real(value)
		}

		if (other.isComplex) {
			const value = new Complex(this.toReal(), 0)
			return value.sub(other)
		}

		if (other.isPolynom) {
			const value = new Polynom([this.toReal()])
			return value.sub(other)
		}

		console.warn(this, other, 'can not be substracted')
		return 0
	}

	multiply(other){

		if (other.isInteger) {
			this.num *= other.value;
			this.reduce();
			return this
		}

		if (other.isRational) {
			this.num *= other.num;
			this.den *= other.den;
			this.reduce();
			return this
		}

		if (other.isReal) {
			const value = this.toReal() * other.value
			return new Real(value)
		}

		if (other.isComplex) {
			const value = new Complex(this.toReal(), 0)
			return value.multiply(other)
		}

		if (other.isPolynom) {
			other.coeffs = other.coeffs.map((val, index) => this.toReal() * val)
			return other
		}

		if (other.isVector) {
			other.array = other.array.map((val, index) => this.toReal() * val)
			return other
		}

		if (other.isMatrix) {
			other.array = other.array.map((val, index) => this.toReal() * val)
			return other
		}

		console.warn(this, other, 'can not be multiplied')
		return 0
	}

	divide(other){
		
		if (other.isInteger) {
			this.den *= other.num;
			this.reduce();
			return this
		}

		if (other.isRational) {
			this.num *= other.den;
			this.den *= other.num;
			this.reduce();
			return this
		}

		if (other.isReal) {
			const value = this.toReal() / other.value
			return new Real(value)
		}

		if (other.isComplex) {
			const value = new Complex(this.toReal(), 0)
			return value.divided(other)
		}

		console.warn(this, other, 'can not be divided')
		return 0
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

// =====================================================================================
//							REAL

class Real{
	constructor(value){
		this.isReal = true;
		this.value = value;
	}

	copy(other){
		this.value = other.value;
		return this;
	}

	clone(){
		return new Real(this.value);
	}

	add(other){

		if (other.isInteger) {
			this.value += other.value;
			return this
		}

		if (other.isRational) {
			this.value += other.toReal();
			return this
		}

		if (other.isReal) {
			this.value += other.value;
			return this
		}

		if (other.isComplex) {
			const value = new Complex(this.value, 0)
			return value.add(other)
		}

		if (other.isPolynom) {
			const value = new Polynom([this.value])
			return value.add(other)
		}

		console.warn(this, other, 'can not be added')
		return 0
	}

	sub(other){
		if (other.isInteger) {
			this.value -= other.value;
			return this
		}

		if (other.isRational) {
			this.value -= other.toReal();
			return this
		}

		if (other.isReal) {
			this.value -= other.value;
			return this
		}

		if (other.isComplex) {
			const value = new Complex(this.value, 0)
			return value.sub(other)
		}

		if (other.isPolynom) {
			const value = new Polynom([this.value])
			return value.sub(other)
		}

		console.warn(this, other, 'can not be substracted')
		return 0
	}

	multiply(other){
		if (other.isInteger) {
			this.value *= other.value;
			return this
		}

		if (other.isRational) {
			this.value *= other.toReal();
			return this
		}

		if (other.isReal) {
			this.value *= other.value;
			return this
		}

		if (other.isComplex) {
			const value = new Complex(this.value, 0)
			return value.multiply(other)
		}

		if (other.isPolynom) {
			other.coeffs = other.coeffs.map((val, index) => this.value * val)
			return other
		}

		if (other.isVector) {
			other.array = other.array.map((val, index) => this.value * val)
			return other
		}

		if (other.isMatrix) {
			other.array = other.array.map((val, index) => this.value * val)
			return other
		}

		console.warn(this, other, 'can not be multiplied')
		return 0
	}

	divide(other){
		if (other.isInteger) {
			this.value /= other.value;
			return this
		}

		if (other.isRational) {
			this.value /= other.toReal();
			return this
		}

		if (other.isReal) {
			this.value /= other.value;
			return this
		}

		if (other.isComplex) {
			const value = new Complex(this.value, 0)
			return value.divide(other)
		}

		console.warn(this, other, 'can not be divided')
		return 0
	}

	toString(){
		return '' + this.value
	}
}

// =====================================================================================
//							COMPLEX

class Complex{
	constructor(x,y){
		this.isComplex = true;
		this.real = x;
		this.imag = y;
	}

	clone(){
		return new Complex(this.real, this.imag);
	}

	copy(other){
		this.real = other.real;
		this.imag = other.imag;
		return this
	}

	add(other){

		if (other.isInteger) {
			this.real += other.value;
			return this
		}
		if (other.isRational) {
			this.real += other.toReal();
			return this
		}
		if (other.isReal) {
			this.real += other.value;
			return this
		}
		if (other.isComplex) {
			this.real += other.real;
			this.imag += other.imag;
			return this
		}
		console.warn(this, other, 'can not be added')
		return 0
	}

	sub(other){
		if (other.isInteger) {
			this.real -= other.value;
			return this
		}
		if (other.isRational) {
			this.real -= other.toReal();
			return this
		}
		if (other.isReal) {
			this.real -= other.value;
			return this
		}
		if (other.isComplex) {
			this.real -= other.real;
			this.imag -= other.imag;
			return this
		}
		console.warn(this, other, 'can not be substracted')
		return 0
	}

	multiply(other){

		if (other.isInteger) {
			this.real *= other.value;
			this.imag *= other.value;
			return this
		}
		if (other.isRational) {
			this.real *= other.toReal();
			this.imag *= other.toReal();
			return this
		}
		if (other.isReal) {
			this.real *= other.value;
			this.imag *= other.value;
			return this
		}
		if (other.isComplex) {
			const tempImag = this.real * other.imag + this.imag * other.real;
			this.real = this.real * other.real - this.imag * other.imag;
			this.imag = tempImag;
			return this
		}

		console.warn(this, other, 'can not be multiplied')
		return 0
	}

	moduleSquared(){
		return this.real * this.real + this.imag * this.imag
	}

	module(){
		return Math.sqrt(this.moduleSquared())
	}

	norm(){
		return Math.sqrt(this.moduleSquared())
	}

	conjugate(){
		this.imag *= -1;
		return this
	}

	divide(other) {

		if (other.isInteger) {
			const divisor = other.moduleSquared();
			this.real = (this.real * other.value) / divisor;
			this.imag = (this.imag * other.value) / divisor;
			return this
		}
		if (other.isRational) {
			const divisor = other.moduleSquared();
			this.real = (this.real * other.toReal()) / divisor;
			this.imag = (this.imag * other.toReal()) / divisor;
			return this
		}
		if (other.isReal) {
			const divisor = other.moduleSquared();
			this.real = (this.real * other.value) / divisor;
			this.imag = (this.imag * other.value) / divisor;
			return this
		}
		if (other.isComplex) {
			const divisor = other.moduleSquared();
			const real = (this.real * other.real + this.imag * other.imag) / divisor;
			const imag = (this.imag * other.real - this.real * other.imag) / divisor;
			this.real = real;
			this.imag = imag;
			return this
		}

		console.warn(this, other, 'can not be divided')
		return 0
	}

	toString(){
		return '' + this.real + '+' + this.imag + 'i'
	}
}

// =====================================================================================
//							POLYNOM

class Polynom{	//pas fait

	/*
	Polynômes dans R exclusivement : R[X]
	*/
	constructor(coeffs){
		this.isPolynom = true;
		this.coeffs = coeffs;
	}

	add(other){	//pas fait
		this.coeffs = this.coeffs.map((val, index) => val + other.coeffs[index])
		return this
	}

	sub(other){	//pas fait
		this.coeffs = this.coeffs.map((val, index) => val - other.coeffs[index])
		return this
	}

	multiply(other){	//pas fait
		return this
	}

	toString(){
		return 'polynom(' + this.coeffs + ')'
	}
}

// =====================================================================================
//							VECTOR

class Vector{
	/*
	Vecteurs dans R exclusivement : R^n
	*/
	constructor(array){
		this.isVector = true;
		this.array = array;
	}

	add(other){

		if (other.isVector) {
			this.array = this.array.map((val, index) => val + other.array[index])
			return this
		}

		if (other.isMatrix) { //pas fait
			if (other.columns === 1 && other.rows === this.array.length) {
				this.array = this.array.map((val, index) => val + other.getCell(index,1))
				return this
			}
		}
		this.array = this.array.map((val, index) => val + other.array[index])
		return this
	}

	sub(other){	//pas fait
		this.array = this.array.map((val, index) => val - other.array[index])
		return this
	}

	multiply(other){	//pas 100% fait
		if (other.isVector) {
			console.warn(this,other,'assuming dot product');
			return this.dotProduct(other)
		}
		if (other.isInteger) {
			this.array = this.array.map((val, index) => val * other.value)
			return this;
		}
		if (other.isRational) {
			//this.array = this.array.map((val, index) => val * other.value)
		}
		console.warn(this,other,'cancelling multiplication');
		
		return this
	}

	divide(other){	//pas 100% fait
		if (other.isInteger) {
			this.array = this.array.map((val, index) => val / other.value)
		}
		if (other.isRational) {
			//this.array = this.array.map((val, index) => val / other.value)
		}
		console.warn(this,other,'cancelling division');
		return this
	}

	dotProduct(other){
		if (this.array.length != other.array.length) {
			console.warn(this,other,'cancelling dotProduct');
			return this
		}
		let sum = 0;
		for (let i = 0; i < this.array.length; i++) {
			sum += this.array[i] * other.array[i];
		}
		return new Integer(sum)
	}

	normSquared(){
		return this.dotProduct(this)
	}

	norm(){
		return Math.sqrt(this.normSquared())
	}

	toString(){
		return 'v(' + this.array + ')'
	}
}

// =====================================================================================
//							MATRIX

class Matrix{
	/*
	Matrices dans R exclusivement : R^r x R^c
	*/
	constructor(array, rows, columns){
		this.isMatrix = true;
		this.array = array;
		this.rows = rows;
		this.columns = columns;
	}

	getCell(i,j){
		if (i < this.rows && j < this.columns) return this.array[i+j]
		console.warn('overflow of indeces')
		return 0
	}

	clone(){
		return new Matrix([...this.array], this.rows, this.columns)
	}

	copy(other){
		this.array = [...other.array];
		this.rows = other.rows;
		this.columns = other.columns;
		return this
	}

	add(other){	//pas fait
		this.array = this.array.map((val, index) => val + other.array[index])
	}

	multiply(other){	//pas fait
		if (other.isInteger) {
			//...
		}
		if (other.isRational) {
			//...
		}
		if (other.isReal) {
			//...
		}
		if (other.isComplex) {
			//...
		}
		if (other.isVector) {
			//...
		}
		if (other.isMatrix) {
			//...
		}
	}

	det(){
		//...
		return 1
	}

	inverse(){
		//...
		return this
	}

	transpose(){
		//...
		return this
	}
}

// =====================================================================================
//							FUNCTION

// =====================================================================================
//							SET

// =====================================================================================
//							GROUP

// =====================================================================================
//							OPERATOR (+, -, *, /, ...)

// =====================================================================================
//							EQUATION