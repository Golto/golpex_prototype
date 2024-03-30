
const VARIABLES = new Map();
const FORMULAS = new Map();


//	=================================================================================//
//									MATHS OBJECTS

class Integer{
	constructor(n){
		this.isInteger = Number.isInteger(n);
		this.value = n;
	}

	copy(other){
		this.value = other.value;
		return this;
	}

	clone(){
		return new Integer(this.value);
	}

	add(other){
		this.value += other.value;
		return this;
	}

	sub(other){
		this.value -= other.value;
		return this;
	}

	multiply(other){
		this.value *= other.value;
		return this;
	}

	multiplyScalar(other){
		console.warn('Can\'t stricly multiply by a scalar, assuming a classical multiplication');
		this.value *= other.value;
		return this;
	}

	divide(other){
		console.warn('Can\'t stricly divide Integers, assuming euclidean division');
		//const temp = this.value;
		this.value = Math.floor(this.value/other.value);
		//const r = temp - this.value * other.value;
		return this;
	}
}


class Rational {
	constructor(numerator, denominator) {
		//this.isRational = true;
		this.isRational = Number.isInteger(numerator) && Number.isInteger(denominator) && denominator != 0
		this.numerator = numerator;
		this.denominator = denominator;
	}

	clone(){
		return new Rational(this.numerator, this.denominator)
	}

	copy(other){
		this.numerator = other.numerator;
		this.denominator = other.denominator;
	}

	equivalent(otherNumber) {
		return this.numerator * otherNumber.denominator === this.denominator * otherNumber.numerator;
	}

	add(other) {
		const numerator = this.numerator * other.denominator + this.denominator * other.numerator;
		const denominator = this.denominator * other.denominator;
		this.numerator = numerator;
		this.denominator = denominator;
		this.reduce();	//non obligatoire
		return this;
	}

	sub(other) {
		const numerator = this.numerator * other.denominator - this.denominator * other.numerator;
		const denominator = this.denominator * other.denominator;
		this.numerator = numerator;
		this.denominator = denominator;
		this.reduce();	//non obligatoire
		return this;
	}

	multiply(other) {
		this.numerator = this.numerator * other.numerator;
		this.denominator = this.denominator * other.denominator;
		this.reduce();	//non obligatoire
		return this;
	}

	multiplyScalar(other) {
		console.warn('Can\'t stricly multiply by a scalar, assuming a classical multiplication');
		this.numerator = this.numerator * other.numerator;
		this.denominator = this.denominator * other.denominator;
		this.reduce();	//non obligatoire
		return this;
	}

	divide(other) {
		this.numerator = this.numerator * other.denominator;
		this.denominator = this.denominator * other.numerator;
		this.reduce();	//non obligatoire
		return this;
	}


	reduce() {
		// On détermine le plus grand diviseur commun des numérateur et dénominateur
		let gcd = 1;
		let a = Math.abs(this.numerator);
		let b = Math.abs(this.denominator);
		const sign_a = Math.sign(this.numerator);

		while (b !== 0) {
			const t = b;
			b = a % b;
			a = t;
		}
		gcd = sign_a * a;

		// On réduit la fraction en divisant numérateur et dénominateur par le plus grand diviseur commun
		this.numerator = this.numerator / gcd;
		this.denominator = this.denominator / gcd;
		return this
	}
}


class Real{
	constructor(x){
		this.isReal = Number.isFinite(x);
		this.value = x;
	}

	copy(other){
		this.value = other.value;
		return this;
	}

	clone(){
		return new Real(this.value);
	}

	add(other){
		this.value += other.value;
		return this;
	}

	sub(other){
		this.value -= other.value;
		return this;
	}

	multiply(other){
		this.value *= other.value;
		return this;
	}

	multiplyScalar(other){
		console.warn('Can\'t stricly multiply by a scalar, assuming a classical multiplication');
		this.value *= other.value;
		return this;
	}

	divide(other){
		this.value /= other.value;
		return this;
	}
}

class Complex {
	constructor(x, y) {
		//this.isComplex = true;
		this.isComplex = Number.isFinite(x) && Number.isFinite(y);
		this.real = x;
		this.imag = y;
		this.r = 0;
		this.phi = 0;
		this.toPolar();
	}

	toPolar() {
		this.r = Math.sqrt(this.real * this.real + this.imag * this.imag);
		this.phi = Math.atan2(this.imag, this.real);
		return this
	}

	toCartesian(){
		this.real = this.r * Math.cos(this.phi);
		this.imag = this.r * Math.sin(this.phi);
		return this
	}

	clone(){
		return new Complex(this.real, this.imag);
	}

	copy(other){
		this.real = other.real;
		this.imag = other.imag;
		return this
	}
	
	conjugate(){
		this.imag *= -1;
		return this
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
	
	static fromRealToComplex(real){
		return new Complex(real,0)
	}

	addScalar(x){
		this.real += x;
		this.imag += x;
		return this
	}
	
	multiplyScalar(x){
		this.real *= x;
		this.imag *= x;
		return this
	}

	add(other) {
		this.real += other.real;
		this.imag += other.imag;
		return this
	}

	multiply(other) {
		const real = this.real * other.real - this.imag * other.imag;
		const imag = this.real * other.imag + this.imag * other.real;
		this.real = real;
		this.imag = imag;
		return this
	}
	
	divide(other) {
		const divisor = other.moduleSquared();
		const real = (this.real * other.real + this.imag * other.imag) / divisor;
		const imag = (this.imag * other.real - this.real * other.imag) / divisor;
		this.real = real;
		this.imag = imag;
		return this
	}
	
	// ------ fonctions utiles ------

	powReal(x){
		this.toPolar();
		this.r = Math.pow(this.r, x);
		this.phi = this.phi * x;
		return this.toCartesian()
	}
	
	exp(){
		this.r = Math.exp(this.real);
		this.phi = this.imag;
		return this.toCartesian();
	}
}

//	=================================================================================//
//									MATHS OBJECTS UNKWOWN

class IntegerUnknown{
	constructor(){
		this.isInteger = true;
		this.isUnknwown = true;
	}

	copy(other){
		return this;
	}

	clone(){
		return new IntegerUnknown();
	}

	add(){
		return this
	}

	sub(){
		return this
	}

	multiply(){
		return this
	}

	multiplyScalar(){
		return this
	}

	divide(){
		return this
	}
}

class RealUnknown{
	constructor(){
		this.isReal = true;
		this.isUnknwown = true;
	}

	copy(other){
		return this;
	}

	clone(){
		return new RealUnknown();
	}

	add(){
		return this
	}

	sub(){
		return this
	}

	multiply(){
		return this
	}

	multiplyScalar(){
		return this
	}

	divide(){
		return this
	}
}

//	=================================================================================//
//									DISPLAYER

class Displayer{
	constructor(id){
		this.begin = '<math xmlns="http://www.w3.org/1998/Math/MathML"><mstyle displaystyle="true">';
		this.end = '</mstyle></math>';
		this.element = document.getElementById(id);
		this.id = id;
		this.inner = '';
	}

	debug(){
		this.inner = '<munderover><mo largeop="true" movablelimit="true">∑</mo><mrow><mi>n</mi><mo form="infix">=</mo><mn>1</mn></mrow><mi>∞</mi></munderover><munderover><mo largeop="true" movablelimit="true">∫</mo><mi>𝛾</mi><mrow></mrow></munderover><mfrac><mrow><mi>f</mi><mo fence="true" stretchy="false">(</mo><mi>z</mi><mo fence="true" stretchy="false">)</mo></mrow><mrow><mi>z</mi><mo form="infix">-</mo><msqrt><mrow><mi>ker</mi><mi>𝜇</mi></mrow></msqrt></mrow></mfrac><mi>d</mi><mi>z</mi>'
		return this
	}

	reset(){
		this.inner = '';
		return this
	}

	concatenate(other){
		this.inner = this.inner + other;
		return this
	}

	newLine(){
		this.inner = '<mrow>' + this.inner + '</mrow>';
		return this
	}

	add(other){
		this.inner = this.inner + Displayer.PLUS + other;
		return this
	}

	multiply(other){
		this.inner = this.inner + Displayer.TIMES + other;
		return this
	}

	multiplyScalar(other){
		this.inner = this.inner + Displayer.CDOT + other;
		return this
	}

	parenthesis(braceBegin = '(', braceEnd = ')'){
		this.inner = '<mo fence="true" stretchy="true">' + braceBegin + '</mo>'+ this.inner +'<mo fence="true" stretchy="true">' + braceEnd + '</mo>';
		return this
	}

	display(){
		this.element.innerHTML = this.begin + this.inner + this.end;
		updateMaths(this.id);	//cf index.html section SCRIPT
	}
}
/*
<mtable columnwidth="100%" width="100%" columnalign="left">
	<mtr>
		<mtd><mi>A</mi></mtd><mtd><mi>C</mi></mtd>
	</mtr>
	<mtr>
		<mtd><mi>B</mi></mtd>
	</mtr>
</mtable>
*/


Displayer.PLUS = '<mo form="infix">+</mo>'
Displayer.MINUS = '<mo form="infix">+</mo>'
Displayer.TIMES = '<mo form="infix">×</mo>'
Displayer.CDOT = '<mo form="infix">⋅</mo>'
Displayer.EQUAL = '<mo form="infix">=</mo>'
Displayer.IN = '<mo form="infix">∈</mo>'
Displayer.SUBSET = '<mo form="infix">⊂</mo>'
Displayer.SUBSETEQ = '<mo form="infix">⊆</mo>'
Displayer.FORALL = '<mo form="infix">∀</mo>'
Displayer.EXISTS = '<mo form="infix">∃</mo>'

//all arguments(set,variable,value,etc... are supposed to be strings like 'y' or '+')
Displayer.getSet = set => '<mi mathvariant="double-struck">' + set + '</mi>';
Displayer.getVariable = variable => '<mi>' + variable + '</mi>';
Displayer.getValue = value => '<mn>' + value + '</mn>';
Displayer.getOperation = operation => '<mo>' + operation + '</mo>';
Displayer.getFraction = (num,den) => '<mfrac>'+ num + '' + den +'</mfrac>';//like : <mfrac><mn>1</mn><mn>2</mn></mfrac> => num = <mn>1</mn>

Displayer.getINTEGER = function(integer){
	if (integer.isInteger) {
		return Displayer.getValue(integer.value)
	}
	return Displayer.getVariable('/not an integer/')
}

Displayer.getRATIONAL = function(rational){
	if (rational.isRational) {
		const num = Displayer.getValue(rational.numerator);
		const den = Displayer.getValue(rational.denominator);
		return Displayer.getFraction(num,den);
	}
	return Displayer.getVariable('/not rational/')
}

Displayer.getREAL = function(real){
	if (real.isReal) {
		return Displayer.getValue(real.value)
	}
	return Displayer.getVariable('/not real/')
}

const variableSpot = new Displayer('variableSpotAlgebren');
const formulaSpot = new Displayer('formulaSpotAlgebren');


//tests

variableSpot.debug().parenthesis().add( Displayer.getVariable('x') ).add( Displayer.getValue(2) )
formulaSpot.concatenate(Displayer.getVariable('x')).add(Displayer.getRATIONAL(new Rational(-4,3)))
/*formulaSpot.inner = `
<mtable columnwidth="100%" width="50px" columnalign="left">
	<mtr>
		<mtd><mi>A</mi></mtd><mtd><mi>C</mi></mtd>
	</mtr>
	<mtr>
		<mtd><mi>B</mi></mtd>
	</mtr>
</mtable>`*/
//	=================================================================================//
//									FORMATING

function variableDefinitionValue(expression) {
	expression = expression.replaceAll(' ','');
	let splitEqualIndex = expression.indexOf("=");
	let splitDefIndex = expression.indexOf(":");
	return [expression.slice(0, splitEqualIndex), expression.slice(splitEqualIndex + 1, splitDefIndex), expression.slice(splitDefIndex + 1)];
}

function variableDefinitionDomain(expression) {
	expression = expression.replaceAll(' ','');
	let splitDefIndex = expression.indexOf(":");
	return [expression.slice(0, splitDefIndex), expression.slice(splitDefIndex + 1)];
}

function constructMathObject(value, type){
	if (type === 'integer') {
		const n = Number(value);
		return new Integer(n);
	}
	if (type === 'rational') {
		const [num,den] = value.split('/').map(e => Number(e));
		return new Rational(num,den);
	}
	if (type === 'real') {
		const x = Number(value);
		return new Real(x);
	}
	if (type === 'complex') {
		const [a,b] = value.replaceAll(' ','').split('+');
		const imag = a.includes('i') ? Number(a.replace('i','')) : (b.includes('i') ? Number(b.replace('i','')) : 0);
		const real = !a.includes('i') ? Number(a) : (!b.includes('i') ? Number(b) : 0);
		return new Complex(real,imag);
	}
	return {value : value}
}

function constructMathObjectUnknown(type){
	if (type === 'integer') {
		return new IntegerUnknown();
	}
	if (type === 'rational') {
	}
	if (type === 'real') {
		return new RealUnknown();
	}
	if (type === 'complex') {
	}
	return false
}

function shuntingYard(expression) {
	const maxITER = 1000;

	let outputQueue = "";
	let operatorStack = [];

	const precedence = {
		"+": 1,
		"-": 1,
		"×": 2,
		"⋅": 2,
		"/": 2,
		"^": 3
	};

	for (let i = 0; i < expression.length; i++) {
		let token = expression[i];

		if (token.match(/[a-z]/i)) {
			outputQueue += token;
		} else if (["+", "-", "×", "⋅", "/", "^"].includes(token)) {
			let iter0 = 0;
			while ((operatorStack.length > 0 && precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) && iter0 < maxITER) {
				outputQueue += operatorStack.pop();
				iter0 += 1;
			}
			operatorStack.push(token);
		} else if (token === "(") {
			operatorStack.push(token);
		} else if (token === ")") {
			let iter1 = 0;
			while (operatorStack[operatorStack.length - 1] !== "(" && iter1 < maxITER) {
				outputQueue += operatorStack.pop();
				iter1 += 1;
			}
			operatorStack.pop();
		}
		/*else{
			outputQueue += token;
		}*/
	}
	let iter2 = 0;
	while (operatorStack.length > 0 && iter2 < maxITER) {
		outputQueue += operatorStack.pop();
		iter2 += 1;
	}
	return outputQueue;
}
//console.log(shuntingYard("A+5×(x+y)"));
// Output: "Axy+5×+"

function evaluatePostfix(expression) {
	let stack = [];
	for (let i = 0; i < expression.length; i++) {
		let token = expression.charAt(i);


		const variable = VARIABLES.get(token);

		if (!isNaN(token)) {
			stack.push(parseFloat(token));
		} else if (variable) {
			stack.push(variable);
		} else {
			let v2 = stack.pop();
			let v1 = stack.pop();
			//console.log(v1,v2)
			if (token === "+") {
				stack.push(v1.clone().add(v2));
			} else if (token === "-") {
				stack.push(v1.clone().sub(v2));
			} else if (token === "×") {
				stack.push(v1.clone().multiply(v2));
			} else if (token === "⋅") {
				stack.push(v1.clone().multiplyScalar(v2));
			} else if (token === "/") {
				stack.push(v1.clone().divide(v2));
			} /*else if (token === "^") {
				stack.push(v1.clone().pow(v2));
			}*/
		}
	}
	return stack.pop();
}

//	=================================================================================//
//									VARIABLES MANAGEMENT

function deleteVariablesArray(expression){
	const variablesArray = expression.replaceAll(' ','').split(',')
	for (let _var of variablesArray) {
		VARIABLES.delete(_var);
	}
}

//	=================================================================================//
//									HANDLER

function handler(event){
	document.getElementById('calcText').style.display = 'none';//temp

	const calculator = document.getElementById('inputCalculator')
	let inputValue = calculator.value


	if(event.key === 'Enter'){
		console.log(inputValue);

		if (inputValue.search('=') > -1 && inputValue.search(':') > -1) { // var = value : type (variable's definition by value)
			const [variable, value, type] = variableDefinitionValue(inputValue);
			VARIABLES.set( variable, constructMathObject(value,type) );
			
			displayVariables();
		}
		if (inputValue.search('=') < 0 && inputValue.search(':') < 0) { // sqrt(4+x) - y/z + 4 (calculation)

			let sY = shuntingYard(inputValue);
			console.log(sY)
			const result = evaluatePostfix(sY);
			console.log(result)

			displayCalculations(inputValue,result);
		}
		if (inputValue.search('=') < 0 && inputValue.search(':') > -1) { // var : type (variable's definition by domain)
			const [variable, type] = variableDefinitionDomain(inputValue);
			VARIABLES.set( variable, constructMathObjectUnknown(type) );

			displayVariables();
		}
		if (inputValue.search('delete') > -1) {
			deleteVariablesArray(inputValue.replaceAll('delete', ''))
			
			displayVariables();
		}
	//variableSpot.display();
	//formulaSpot.display();
	console.log(VARIABLES)
	console.log(FORMULAS)

	}

	if(event.key === '*'){
		calculator.value = inputValue.replaceAll('*','×');
	}
	if(event.key === '.'){
		calculator.value = inputValue.replaceAll('×.','⋅');
	}
	if(event.key === 'a'){
		calculator.value = inputValue.replaceAll('alpha','𝛼').replaceAll('beta','𝛽').replaceAll('gamma','𝛾').replaceAll('delta','𝛿').replaceAll('theta','𝜃').replaceAll('omega','𝜔').replaceAll('lambda','𝜆').replaceAll('sigma','𝜎').replaceAll('iota','𝜄').replaceAll('zeta','𝜁').replaceAll('eta','𝜂').replaceAll('kappa','𝜅')
	}
	if(event.key === 'i'){
		calculator.value = inputValue.replaceAll('xi','𝜉').replaceAll('pi','𝜋').replaceAll('phi','𝜙').replaceAll('psi','𝜓').replaceAll('chi','𝜒')
	}
	if(event.key === 'n'){
		calculator.value = inputValue.replaceAll('e𝜓lon','𝜖').replaceAll('u𝜓lon','𝜐')
	}
	if(event.key === 'o'){
		calculator.value = inputValue.replaceAll('rho','𝜌')
	}
	if(event.key === 'u'){
		calculator.value = inputValue.replaceAll('mu','𝜇').replaceAll('nu','𝜈').replaceAll('tau','𝜏')
	}
	if(event.key === 'h'){
		calculator.value = inputValue.replaceAll('aleph','ℵ')
	}
	
}


export {
	handler
}






function isOperator(c) {
	return /[+\-×⋅/]/.test(c);// On peut ne pas mettre ⋅ pour obtenir des expressions xy plutôt que x⋅y
}

function isVariableName(c){
	return /[a-z]/i.test(c);
}

function convertToMathML(expression){
	const symbols = expression.replaceAll(' ','').split('');
	let mathML = '';
	const braceBegin = '(';
	const braceEnd = ')';

	for (let symbol of symbols) {
		if (isOperator(symbol)) {
			mathML += Displayer.getOperation(symbol);
		}
		if (isVariableName(symbol)) {
			mathML += Displayer.getVariable(symbol);
		}
		if (Number.isInteger(Number(symbol))) {
			mathML += Displayer.getValue(symbol);
		}
		if (symbol === '(') {
			mathML += '<mo fence="true" stretchy="true">' + braceBegin + '</mo>';
		}
		if (symbol === ')') {
			mathML += '<mo fence="true" stretchy="true">' + braceEnd + '</mo>';
		}
	}
	return mathML
}

let test = ' x + y × (x+ z  )';
console.log(convertToMathML(test))


function displayCalculations(expression, resultObject){
	//let inner = '<mi>'+expression+'</mi>';// à améliorer en séparant les variables des opérations
	expression = convertToMathML(expression); // ' n + m × k'
	const evaluation = ''; // ' 5 + 6 × 2'
	let inner = expression;
	//inner += Displayer.EQUAL + evaluation;

	if (resultObject.isInteger && resultObject.isUnknwown) {
		inner += Displayer.IN + Displayer.getSet('Z');
	}
	if (resultObject.isReal && resultObject.isUnknwown) {
		inner += Displayer.IN + Displayer.getSet('R');
	}

	if (resultObject.isInteger && !resultObject.isUnknwown) {
		inner += Displayer.EQUAL;
		inner += Displayer.getINTEGER(resultObject) + Displayer.IN + Displayer.getSet('Z');
	}

	if (resultObject.isRational && !resultObject.isUnknwown) {
		inner += Displayer.EQUAL;
		inner += Displayer.getRATIONAL(resultObject) + Displayer.IN + Displayer.getSet('Q');
	}

	if (resultObject.isReal && !resultObject.isUnknwown) {
		inner += Displayer.EQUAL;
		inner += Displayer.getREAL(resultObject) + Displayer.IN + Displayer.getSet('R');
	}

	if (resultObject.isComplex && !resultObject.isUnknwown) {
		inner += Displayer.EQUAL;
		//inner += Displayer.getCOMPLEX(resultObject) + Displayer.IN + Displayer.getSet('C');
	}
	formulaSpot.inner = inner;
	formulaSpot.display();
}

function displayVariables(){
	let inner = '<mtable columnalign="center">';

	for (let _var of VARIABLES) {
		
		
		const name = _var[0];
		const object = _var[1];
		
		inner += '<mtr><mtd>';
		
		if (object.isInteger && object.isUnknwown) {
			inner += '<mi>' + name + '</mi>' + Displayer.IN + Displayer.getSet('Z');
		}
		if (object.isReal && object.isUnknwown) {
			inner += '<mi>' + name + '</mi>' + Displayer.IN + Displayer.getSet('R');
		}


		if (object.isInteger && !object.isUnknwown) {
			inner += '<mi>' + name + '</mi>' + Displayer.EQUAL;
			inner += Displayer.getINTEGER(object) + Displayer.IN + Displayer.getSet('Z');
		}

		if (object.isRational && !object.isUnknwown) {
			inner += '<mi>' + name + '</mi>' + Displayer.EQUAL;
			inner += Displayer.getRATIONAL(object) + Displayer.IN + Displayer.getSet('Q');
		}
		if (object.isReal && !object.isUnknwown) {
			inner += '<mi>' + name + '</mi>' + Displayer.EQUAL;
			inner += Displayer.getREAL(object) + Displayer.IN + Displayer.getSet('R');
		}

		if (object.isComplex && !object.isUnknwown) {

		}
		inner += '</mtd></mtr>';
	}
	inner += '</mtable>';
	variableSpot.inner = inner;
	variableSpot.display();
	return 1
}
