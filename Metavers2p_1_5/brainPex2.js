

function outputExtractor(prompt, response){
	const output = response.slice(prompt.length)
	return output
}


async function promptLLM(input){
	const res = await query({"inputs": input})
	return res[0].generated_text.replace(' ','')
}

// -------------------------------------------------------------------------------------------------
//				HIGH LEVEL PROMPT

async function LLM_whichTopic(input){
	let prompt = "Mission : Indentify the main general topic of the input (example : programming, informatic, mathematics, history, language, geography, biology, fantaisy, etc...)\nInput : ";
	prompt += input;
	prompt += "\nTopic :";
	res = await promptLLM(prompt);
	output = outputExtractor(prompt, res)
	return output
}

async function LLM_typoRemover(input){
	let prompt = "Mission : Remove artefacts like typos or unwanted symbols from Input";
	prompt += "\nInput : ";
	prompt += input;
	prompt += "\nAnswer :";
	res = await promptLLM(prompt);
	let output = outputExtractor(prompt, res);
	return output
}


async function LLM_isMathematics(input){
	let prompt = "Mission : Indentify if the main topic of the input is mathematics or is related to mathematics, if so output 1, if not output 0.";
	prompt += "\nInput : ";
	prompt += input;
	prompt += "\nOutput :";
	res = await promptLLM(prompt);
	let output = outputExtractor(prompt, res);
	return output
}

async function LLM_taskExecuter(input){
	let prompt = "Mission : ";
	prompt += "\nInput : ";
	prompt += input;
	prompt += "\nAnswer :";
	res = await promptLLM(prompt);

	res = await promptLLM(res);
	/*
	res = await promptLLM(res);
	res = await promptLLM(res);
	res = await promptLLM(res);
	res = await promptLLM(res);
	res = await promptLLM(res);
	res = await promptLLM(res);*/

	let output = outputExtractor(prompt, res);
	return output
}

// -------------------------------------------------------------------------------------------------
//				MEDIUM LEVEL PROMPT : MATHS SPECIFIC

async function LLM_mathsObjectInsulator(input){
	//deleting overflow
	let prompt = "Mission : Remove all texts in the input that is not mathematics except parenthesis.";
	prompt += "\nInput : ";
	prompt += input;
	prompt += "\nAnswer :";
	res = await promptLLM(prompt);
	let expression = outputExtractor(prompt, res);

	printLog('Maths Detected ...\nRemoving non-mathematical symbols')
	console.log(expression)

	
	//separating math objects
	prompt = "Mission : Separate all math objects by a coma.";
	prompt += "\nInput : a+bi + c+di\nOutput : a+bi,c+di;"; // complex separation
	prompt += "\nInput : (a b c) * s\nOutput : (a b c),s;"; // vector separation
	prompt += "\nInput : v(a b c)\nOutput : v(a b c);"; // vector separation
	prompt += "\nInput : A+B*C\nOutput : A,B,C;"; // vector separation
	prompt += "\nInput : ";
	prompt += expression;
	prompt += "\nOutput :";//'3+4i * 7+8i'.replace('3+4i','A').replace('7+8i','B') 3+4i * 5+3i + 4+3i
	res = await promptLLM(prompt);
	objects = outputExtractor(prompt, res).
		split(';')[0]. // Supprime le surplus généré;
		split(',');

	printLog('Maths Detected ...\nSeparating & identifying objects')
	console.log(objects)

	output = new Map;
	outputNamed = {};
	for (let index in objects) {
		output.set(objects[index], await LLM_mathObjectIdentifier(objects[index]))

		const varName = 'ABCDEFGHIKLMNOP'[index]
		expression = expression.replaceAll(objects[index],varName);
		outputNamed[varName] = objects[index];

		printLog('Maths Detected ...\nIdentified : ' + varName + ' = ' + objects[index] + ' = ' + output.get(objects[index]).toString())
	}
	expression = expression.replaceAll(' ','')

	// -----------------
	expression = shuntingYard(expression) //      <-------------- a besoin d'être largement amélioré avec LLM_mathActionIdentifier

	output = await objectCreation(output) // map_type2map_obj
	
	result = await evaluatePostfix(expression, output, outputNamed)  //  <-------------- a besoin d'être largement amélioré avec LLM_mathActionIdentifier
	console.log(output, outputNamed, expression)
	console.log(result)

	// -----------------

	return result.toString()
}

async function LLM_mathObjectIdentifier(input){
	let prompt = "Mission : Identify the type of a mathematical object, either it a complex number, a polynom, an integer, a vector, a matrix, etc.";
	
	prompt += "\na+bi = complex;\nsqrt(a) = irrational;\npi = real number;\n4 = integer;\n2i = imaginary;\naX+b = polynom;\nmat(a b, c d) = matrix;\n";
	prompt += "\n(a, b, c) = vector;\naX2+bX+c = polynom;\na/b = fraction;\n1/a = fraction;\n";
	prompt += input;
	prompt += " =";
	res = await promptLLM(prompt);
	let output = outputExtractor(prompt, res).
		split(';')[0].replaceAll(' ',''); // Supprime le surplus généré;
	return output
}

async function LLM_mathActionIdentifier(input){
	let prompt = "Mission : In a mathematical expression, name the mathematical action from Input.";
	prompt += "\nInput : ";
	prompt += input;
	prompt += ".Answer :";
	res = await promptLLM(prompt);
	let output = outputExtractor(prompt, res).replace('.','');
	return output
}

// -------------------------------------------------------------------------------------------------
//				LOW LEVEL PROMPT : MATHS SPECIFIC : COMPLEX NUMBERS SPECIFIC
async function LLM_complexNumberIdentifier(input){
	let prompt = "Mission : Identify the real part and the imaginary part of a complex number in the format a,b where i is the imaginary unit.";
	prompt += "\na+bi = a,b ;\na = a,0 ;\nbi = 0,b ;\ni = 0,1 ;\n-bi = 0,-b ;\n";
	prompt += input;
	prompt += " =";
	res = await promptLLM(prompt);
	let output = outputExtractor(prompt, res).
		split(';')[0].replaceAll(' ',''); // Supprime le surplus généré
	output = output.split(',').map(Number);
	output = new Complex(output[0], output[1]);
	return output
}

// -------------------------------------------------------------------------------------------------
//				LOW LEVEL PROMPT : MATHS SPECIFIC : POLYNOMS SPECIFIC
async function LLM_polynomsIdentifier(input){
	let prompt = "Mission : Rewrite each polynom in ascending order of degree of monom.";
	prompt += "\naX+b = b+aX;\naX^2+bX+c = c+bX+aX^2;\na+bX+cX^2 = a+bX+cX^2;\npol(3X+2) = 2+3X;\npolynom(4X2+1) = 1+4X2;\n;p(1+X) = 1+1X;\n";
	prompt += input;
	prompt += " =";
	res = await promptLLM(prompt);
	let output = outputExtractor(prompt, res).
		split(';')[0].replaceAll(' ',''); // Supprime le surplus généré   'a+bX+cX2'.split('+').map(s=>Number(s[0])) = [a,b,c]
	
	output = output.split('+').map(s=>Number(s[0]))
	output = new Polynom(output);
	return output
}

// -------------------------------------------------------------------------------------------------
//				LOW LEVEL PROMPT : MATHS SPECIFIC : VECTORS SPECIFIC

async function LLM_vectorsIdentifier(input){
	let prompt = "Mission : Identify vectors coefficients and seprate them by a coma.";
	prompt += "\nv(1 2 3) = 1,2,3;\n( a b c d ) = a,b,c,d;\nv(a b c) = a,b,c;\n";
	prompt += input;
	prompt += " =";
	res = await promptLLM(prompt);
	let output = outputExtractor(prompt, res).
		split(';')[0].replaceAll(' ',''); // Supprime le surplus généré
	
	output = output.split(',').map(s=>Number(s))
	output = new Vector(output);
	return output
}

// -------------------------------------------------------------------------------------------------
//				LOW LEVEL PROMPT : MATHS SPECIFIC : VECTORS SPECIFIC

async function LLM_rationalIdentifier(input){
	let prompt = "Mission : Identify numerator and denominator of a fraction and seprate them by a coma.";
	prompt += "\nfrac(a/b) = a,b;\na/b = a,b;\na = a,1;\n-a/b = -a,b;\n1/a = 1,a;\n";
	prompt += input;
	prompt += " =";
	res = await promptLLM(prompt);
	let output = outputExtractor(prompt, res).
		split(';')[0].replaceAll(' ',''); // Supprime le surplus généré
	
	output = output.split(',').map(s=>Number(s))
	output = new Rational(output[0],output[1]);
	return output
}











/*
inputTEST = {
	Mission : "Indentify the main task of the sentence.",
	Sentence : "Find trees to get apples",
	Task : undefined,
	Purpose : undefined,
}

Solve 3+2i + z = 5-i
Solve A + z = B / A = 3+2i / B = 5-i
z = B - A / A = 3+2i / B = 5-i
Calculate 3+2i - (5-i)


3+4i = complex,
sqrt(2) = irrational,
pi = real number,
4 = integer,
i = imaginary unit,
X+3 = polynom,
mat(2 3, 4 8) = matrix
*/
// =====================================================================================
//							HANDLER

const inCalculator = document.getElementById('inputCalculator')
const outCalculator = document.getElementById('outputCalculator')

function handle(e){
	let input = inCalculator.value

	if(e.key === 'Enter'){
		multitasking(input)
	}
}

// =====================================================================================
//							TASK

async function multitasking(input){
	let printed = ''
	let isMathematics = !!Number( await LLM_isMathematics(input) )

	if (isMathematics) {
		//mathematics
		printed += 'Mention : Golpex Maths' + '\n';
		printed += 'Golpex result :\n';
		printLog('Maths Detected ...')
		printed += await LLM_mathsObjectInsulator(input) + '\n';
		printed += '\n';
	}

	const topic = await LLM_whichTopic(input)
	const result = await LLM_taskExecuter(input)
	printed += 'Detected Topic : ' + topic;
	printed += '\nRaw TaskExecuter result :\n' + result;

	printLog(printed)
}




function printLog(input){
	outCalculator.innerText = input;
}


class Integer{
	constructor(value){
		this.isInteger = true;
		this.value = value;
	}

	add(other){
		this.value += other.value;
		return this
	}

	sub(other){
		this.value -= other.value;
		return this
	}

	multiply(other){
		this.value *= other.value;
		return this
	}

	divide(other){
		return new Rational(this.value, other.value)
	}

	toString(){
		return '' + this.value
	}
}

class Rational{
	constructor(num, den){
		this.isRational = true;
		this.num = num;
		this.den = den;
	}

	add(other){
		//console.log(this,other)
		const tempDen = this.den * other.den;
		this.num = this.num * other.den + this.den * other.num;
		this.den = tempDen
		this.reduce();
		return this
	}

	sub(other){
		const tempDen = this.den * other.den;
		this.num += this.num * other.den - this.den * other.num;
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


class Polynom{
	constructor(coeffs){
		this.isPolynom = true;
		this.coeffs = coeffs;
	}

	add(other){
		this.coeffs = this.coeffs.map((val, index) => val + other.coeffs[index])
		return this
	}

	sub(other){
		this.coeffs = this.coeffs.map((val, index) => val - other.coeffs[index])
		return this
	}

	multiply(other){
		return this
	}

	toString(){
		return 'polynom(' + this.coeffs + ')'
	}
}



class Complex{
	constructor(x,y){
		this.isComplex = true;
		this.real = x;
		this.imag = y;
	}

	add(other){
		this.real += other.real;
		this.imag += other.imag;
		return this
	}

	sub(other){
		this.real -= other.real;
		this.imag -= other.imag;
		return this
	}

	multiply(other){
		const tempImag = this.real * other.imag + this.imag * other.real;
		this.real = this.real * other.real - this.imag * other.imag;
		this.imag = tempImag;
		return this
	}

	divide(other){//à faire
		this.real = other.real;
		this.imag = other.imag;
		return this
	}

	toString(){
		return '' + this.real + '+' + this.imag + 'i'
	}
}

class Vector{
	constructor(array){
		this.isVector = true;
		this.array = array;
	}

	add(other){
		this.array = this.array.map((val, index) => val + other.array[index])
		return this
	}

	sub(other){
		this.array = this.array.map((val, index) => val - other.array[index])
		return this
	}



	multiply(other){
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

	divide(other){
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

	toString(){
		return 'v(' + this.array + ')'
	}
}












builder = {
	integer : label => {
		const value = Number(label);
		return Number.isInteger(value) ? new Integer(value) : label
	},
	rational : label => LLM_rationalIdentifier(label),
	fraction : label => LLM_rationalIdentifier(label),
	complex : label => LLM_complexNumberIdentifier(label),
	imaginary : label => LLM_complexNumberIdentifier(label),
	polynom : label => LLM_polynomsIdentifier(label),
	vector : label => LLM_vectorsIdentifier(label)
}

async function objectCreation(inputMap){
	let createdElements = new Map;
	for(let elem of inputMap){
		const label = elem[0];
		const type = elem[1].toLowerCase();
		let element = label + ',' + type;
		
		if (builder[type]) {
			element = await builder[type](label);
		}

		createdElements.set(label,element);
	}
	return createdElements
}







function shuntingYard(expression) {
	let outputQueue = "";
	let operatorStack = [];

	const precedence = {
		"+": 1,
		"-": 1,
		"*": 2,
		"×": 2,
		"⋅": 2,
		"/": 2,
		"^": 3
	};

	for (let i = 0; i < expression.length; i++) {
		let token = expression[i];

		if (token.match(/[a-z]/i)) {
			outputQueue += token;
		} else if (["+", "-", "×", "*", "⋅", "/", "^"].includes(token)) {
			while (operatorStack.length > 0 && precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
				outputQueue += operatorStack.pop();
			}
			operatorStack.push(token);
		} else if (token === "(") {
			operatorStack.push(token);
		} else if (token === ")") {
			while (operatorStack[operatorStack.length - 1] !== "(") {
				outputQueue += operatorStack.pop();
			}
			operatorStack.pop();
		}
	}
	while (operatorStack.length > 0) {
		outputQueue += operatorStack.pop();
	}
	return outputQueue;
}
//console.log(shuntingYard("A+5×(x+y)"));
// Output: "Axy+5×+"

async function evaluatePostfix(expression, output, outputNamed) {
	console.log(expression,output)
	let stack = [];
	for (let i = 0; i < expression.length; i++) {
		let token = expression.charAt(i);

		console.log(token,outputNamed[token],)

		if (outputNamed[token]) {
			stack.push(output.get(outputNamed[token]));
		} else {
			let v2 = stack.pop();
			let v1 = stack.pop();
			console.log(v1,v2)
			console.log(await LLM_mathActionIdentifier(token))

			if (token === "+") {
				stack.push(v1.add(v2));
			} else if (token === "-") {
				stack.push(v1.sub(v2));
			} else if (token === "×") {
				stack.push(v1.multiply(v2));
			} else if (token === "*") {
				stack.push(v1.multiply(v2));
			} else if (token === "⋅") {
				stack.push(v1.multiplyScalar(v2));
			} else if (token === "/") {
				stack.push(v1.divide(v2));
			} else if (token === "^") {
				stack.push(v1.pow(v2));
			}
		}
	}
	return stack.pop();
}
