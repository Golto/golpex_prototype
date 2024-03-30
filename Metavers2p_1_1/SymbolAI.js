/*
Entiers : 5 / -4 / 4 / 8 / 1245 / 1387149 / -4598 / 4364599
Rationnels : 2/5 / 1/9 / -89/12 / 148/48 / -78/47
Variables : x / y / z / A / alpha
RéelsNum : 3.14598 / 4.256 / 154.599 / -458.25
Polynômes : X+2 / X^4+1 / X^4 + 3X
Matrices : (4 5 7, 4 8 5)





Réels : sqrt(2) / 3 + 3^(1/3) / pi / e / ln(3) / 3.12657
Complexes : 3+4i / 1/2+4i / ...

*/










class Matrix {
	// matrice à coefficients dans R
	constructor(values, rows, columns) {
		this.isMatrix = true;
		this.values = values;
		this.rows = rows;
		this.columns = columns;
		this.cell = (i,j) => this.values[ this.columns * i + j ]
	}

	static random(rows, columns){
		let values = [];
		const size = rows * columns
		for (let i = 0; i < size; i++) {
			values[i] = Math.random();
		}
		return new Matrix(values, rows, columns)
	}

	copy(other){
		this.values = [...other.values];
		this.rows = other.rows;
		this.columns = other.columns;
		return this
	}

	clone(){
		return new Matrix([...this.values], this.rows, this.columns);
	}

	addScalar(x){
		this.values = this.values.map( e => e + x )
		return this;
	}

	multiplyScalar(x){
		this.values = this.values.map( e => (e * x) )
		return this;
	}

	add(other) {
		if (this.rows !== other.rows || this.columns !== other.columns) {
			throw new Error("Cannot add matrices with different sizes.");
		}

		this.values = this.values.map( (e,i) => e + other.values[i] )
		return this;
	}

	multiply(other) {
		if (this.columns !== other.rows) {
			console.warn(this.columns,other.rows)
			throw new Error("Cannot multiply matrices with incompatible sizes.");
		}

		const values = [];

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < other.columns; j++) {

				let sum = 0;
				for (let k = 0; k < this.columns; k++) {
					sum += this.cell(i,k) * other.cell(k,j);
				}
				values.push(sum);
			}
		}
		this.columns = other.columns
		this.values = values;
		return this;
	}

	transpose() {
		let result = new Matrix([], this.columns, this.rows);
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.columns; j++) {
				result.values[j * this.rows + i] = this.values[i * this.columns + j];
			}
		}
		return result;
	}

	T(){
		return this.transpose()
	}

	sigmoid(){
		this.values = this.values.map( e => sigmoid(e))
		return this
	}

	relu(){
		this.values = this.values.map( e => relu(e))
		return this
	}
}

function sigmoid(x) {
	return 1 / (1 + Math.exp(-x));
}

function relu(x) {
	return Math.max(0, x);
}



/*
"3X^2+2X+3".split('')
['3', 'X', '^', '2', '+', '2', 'X', '+', '3']

idée 1

Chiffres : '0', '1', '2', '3'
Variables : 'x', 'y', 'z', '𝛼', '𝜖'
Opérations : '+', '*', '/', '-', '×', '⋅'
Formatages : '(', ')', '[', ']', '{', ','


*/


function char_to_vector(char) {
	if (/^[a-zA-Z]$/.test(char)) {
		return new Matrix([1,0,0,0], 4, 1);

	} else if (/^\d$/.test(char)) {
		return new Matrix([0,1,0,0], 4, 1);
	} else if ("+-*/×⋅".includes(char)) {
		return new Matrix([0,0,1,0], 4, 1);
	} else if ("()[]{},;".includes(char)) {
		return new Matrix([0,0,0,1], 4, 1);
	}
	return new Matrix([0,0,0,0], 4, 1);
}

// 'a' = (1,0,0,0)

function string_to_vector_sum(str) {
	let sum = new Matrix([0,0,0,0], 4, 1);
	for (let i = 0; i < str.length; i++) {
		sum = sum.add(char_to_vector(str[i]));
	}

	return sum;
}

// 'a+b+9*z' = (3,1,3,0)




/*

idée 2

'5' => '5' : integer-scalar

'3X^2+1' => 'X' : polynom-variable
			'+' : polynom-operator
			'^' : polynom-power
			'3', '1' : polynom-scalar

'X(X+1)' => 'X' : literalExpression-variable
			'+' : literalExpression-operator
			'(', ')' : literalExpression-priority
			'1' : literalExpression-scalar

'(1 2 3, 4 7 8)' => '1' : matrix-scalar
					'(' : matrix-format

'4/5' => '4' : rational-scalar
		'/' : rational-format


//2 réseaux de neuronnes ? ou 1 avec multi output ?

integer
polynom
literalExpression
matrix
rational

scalar
variable
operator
power
priority
format
*/