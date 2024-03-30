// =====================================
// --------------- REAL ---------------

real <- object:x[3]

// =====================================
// --------------- VECTOR ---------------
new:vector

vector <- method:this.add(other)
let []
this.operation(PLUS, other)
return:this

vector <- method:this.multiplyScalar(scalar)
let []
this.map(MULT:scalar)
return:this

vector <- method:this.dot(other)
let [value]
value = this.clone()
value.operation(TIMES, other)
value = value.reduceWith(PLUS)
return:value

vector <- object:u[a, b, c]
temp:a = real <- object:[1]
temp:b = real <- object:[2]
temp:c = real <- object:[3]

vector <- object:v[a, b, c]
temp:a = real <- object:[7]
temp:b = real <- object:[4]
temp:c = real <- object:[1]

// =====================================
// --------------- POLYNOM ---------------

new:polynom

polynom <- method:this.add(other)
let []
this.operation(PLUS, other)
return:this

polynom <- method:this.multiply(other)
let []
this.convType1(TIMES, PLUS, other)
return:this

polynom <- method:this.at(scalar)
let [id, value]
id = this.index()
id.map(POW:scalar)
id.operation(TIMES, this)
value = id.reduceWith(PLUS)
return:value

polynom <- method:this.derivate()
let [deg, id]
deg = this.length()
id = this.index()
this.operation(TIMES, id)
this.slice(1,deg)
return:this

polynom <- object:P[a, b, c]
temp:a = real <- object:[1]
temp:b = real <- object:[2]
temp:c = real <- object:[3]

polynom <- object:Q[a, b, c]
temp:a = real <- object:[7]
temp:b = real <- object:[4]
temp:c = real <- object:[1]

// =====================================
// --------------- MATRIX ---------------

new:matrix

matrix <- method:this.add(other)
let []
this.operation(add, other)
return:this

matrix <- method:this.multiplyScalar(scalar)
let []
this.map(multiplyScalar:scalar)
return:this

matrix <- method:this.multiply(other)
let []
// osekour
return:this

matrix <- method:this.trace()
let [value, id]
id = this.index()
this.operation(get, id)
value = this.reduceWith(PLUS)
return:value

matrix <- method:this.det2()
let [value, diag1 , diag2, buffer1, buffer2]
// fabrication des deux diagonales
diag1 = this.index()
diag2 = diag1.clone()
diag2.reverse()
// récupération des diagonales
buffer1 = this.clone()
buffer2 = this.clone()
buffer1.operation(get, diag1)
buffer2.operation(get, diag2)
// calcul a*d - b*c
buffer1 = buffer1.reduceWith(TIMES)
buffer2 = buffer2.reduceWith(TIMES)
buffer1.operation(MINUS, buffer2)
return:buffer1

matrix <- object:M[v0, v1]
temp:v0 = vector <- object:[v00, v01]
temp:v1 = vector <- object:[v10, v11]
temp:v00 = real <- object:[1.0]
temp:v01 = real <- object:[2.0]
temp:v10 = real <- object:[3.0]
temp:v11 = real <- object:[4.0]

matrix <- object:ID[v0, v1]
temp:v0 = vector <- object:[v00, v01]
temp:v1 = vector <- object:[v10, v11]
temp:v00 = real <- object:[1.0]
temp:v01 = real <- object:[0.0]
temp:v10 = real <- object:[0.0]
temp:v11 = real <- object:[1.0]

// =====================================
// --------------- COMPLEX ---------------

new:complex

complex <- method:this.conjugate()
let [imag]
imag = this.get(1)
imag.map(MULT:-1)
return:this

complex <- method:this.add(other)
let []
this.operation(PLUS, other)
return:this

complex <- method:this.multiply(other)
let [real, imag, arr]
// a+bi * c+di
// real = a*c - b*d
real = this.clone()
real.operation(TIMES, other)
real = real.reduceWith(MINUS)
// imag = a*d + b*c
imag = other.clone()
imag.reverse()
imag.operation(TIMES, this)
imag = imag.reduceWith(PLUS)
//
arr = join(real, imag, array)
this.copy(arr)
return:this

complex <- method:this.norm()
let [value]
value = this.reduceWith(HYPOTHENUS)
return:value

complex <- method:this.distanceTo(other)
let [value, temp]
temp = this.clone()
temp.operation(MINUS, other)
value = temp.norm()
return:value

complex <- object:z[a, b]
temp:a = real <- object:[3]
temp:b = real <- object:[4]

complex <- object:i[a, b]
temp:a = real <- object:[0]
temp:b = real <- object:[1]





polynom <- method:static.new(N)
let []
//
return:N

/*

polynom <- method:this.test(N)
// todo :
// remplacer this par static, et modifier lexer/parser
let [value]
value = id(N, array)
value.map(RANDOM)
value.map(MULT:1000)
value.map(ROUND)
value.map(DIV:1000)
return:value


polynom <- method:this.test(N)
let [value]
value = id(N, array)
value.map(RANDOM)
value.map(MULT:1000)
value.map(ROUND)
value.map(DIV:1000)
this.copy(value)
return:this

*/

/*
new:permutation

permutation <- method:this.apply(number)
let []
return:number



// A = (1, 4, 2, 3)
permutation <- object:A[a, b, c, d]
temp:a = integer <- object:[1]
temp:b = integer <- object:[4]
temp:c = integer <- object:[2]
temp:d = integer <- object:[3]
*/