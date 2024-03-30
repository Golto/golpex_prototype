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





//poids et biais importé de neuronNetwork.py avec la fonction
/*
def f(X):
	x = X[0,0]
	y = X[1,0]
	return np.array([[x*x + y], [y*x + 1]])
*/

w1 = new Matrix([
	-1.0780782,  -0.76637113,-0.65975747, -0.59029534,0.51267404, -0.32269107,-0.65122895,  0.23692162,-0.71951726, -1.13479412,-0.56539265,  0.23787484,-0.80186067,  0.59408477,-0.40881896, -0.81094193,-1.65208998, -0.11860372,-1.22195771, -1.16046372
	],10, 2)

w2 = new Matrix([
	0.1205422,0.14605843,1.21009854,1.14966777,-0.98246792,0.42389648,-1.15380477,0.54255294,0.20834003,0.24594956,1.84315566,0.13583626,1.06709492,1.74032602,0.51432142,0.37501864,-2.24201457,1.20465141,1.22507378,-0.605358,-0.80109137,-1.48105847,0.38411926,-1.01812105,0.64323618,-0.62613278,1.16595358,-0.12295255,1.04479031,1.53328668,-0.22454438,1.02328827,0.07665446,-0.66130332,0.92497991,0.64533,1.37776238,0.80654086,1.41906725,-0.07812993,0.60067741,1.84253472,-1.19191515,1.6381273,-0.6255633,1.16722977,-1.19124791,0.66918859,0.00960127,0.78800333,0.09029456,-1.86255286,-0.9090561,-1.43242132,0.69321679,0.21980438,-0.15851616,-0.46566624,-0.69442395,-0.04456799,0.01902201,-3.14936261,-1.14252898,1.06303822,-0.16526429,0.59223833,-0.07171202,0.56394822,-0.16811097,2.31937741,0.17447745,-0.45101852,-0.83407082,0.26057717,1.37237243,-0.90947488,-1.07098265,0.19792249,-0.0431578,0.68060301,-0.23702371,0.6799239,-0.56607281,0.0498716,0.7955412,-0.36278874,-1.09481859,0.3043102,1.28766073,-0.04247328,-0.07967972,2.06122197,-1.05349965,2.21429466,-0.63901742,-0.71801542,-1.08817494,0.93459394,1.85014836,-0.5
	],10, 10)
//.replaceAll('[',' ').replaceAll(']',' ').replaceAll(' ',',').replaceAll(',,',',').replaceAll(',,',',').replaceAll(',,',',')

w3 = new Matrix([
	0.99062839,-1.3792657,-1.61338595,-0.66893478,-1.16573696,0.68801251,0.0184871,0.99436093,-2.00218521,0.20385288,1.09586314,-1.16351814,-0.38019634,0.01793822,-0.88181004,-0.23621976,0.30574766,0.65406815,0.35594398,0.38005203
	], 2, 10)

b1 = new Matrix( [
	0.0,1.10431807,-0.5659671 ,-1.05995643,-2.2105172 ,-1.19135987,-0.77995887,0.,-1.65007109,0.0
	], 10, 1)

b2 = new Matrix([
	1.13496306,-0.27257029,-0.16769676,-0.93574134,-0.00630315,-0.54160374,-0.10722273,-0.69661537,-0.73138227,-0.70102186
	], 10, 1)
b3 = new Matrix([
	0.67275302,0.6114283
	], 2, 1)

for (let i = 0; i < w3.rows; i++) {
			for (let j = 0; j < w3.columns; j++) {

				console.log(w3.cell(i,j))
			}
		}

function forward_propagationReLU(X, w1, w2, w3, b1, b2, b3){
	// Propagation avant de la première couche
	
    z1 = w1.clone().multiply(X).add(b1)
    a1 = z1.relu()
    // Propagation avant de la deuxième couche
    z2 = w2.clone().multiply(a1).add(b2)
    a2 = z2.relu()
    // Propagation avant de la troisième couche
    z3 = w3.clone().multiply(a2).add(b3)
    a3 = z3.relu()
    return a3
}

function f(X){
	const x = X.cell(0,0)
	const y = X.cell(1,0)
	return new Matrix([x*x+y, y*x+1],2,1)
}


X = Matrix.random(2,1)

y = f(X)
ypred = forward_propagationReLU(X, w1, w2, w3, b1, b2, b3)

console.log(y,ypred)