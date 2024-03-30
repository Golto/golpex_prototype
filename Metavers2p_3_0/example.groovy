
Algebrity

Golpex Programming Language

AlGpl

//--------------------------------------------
//method
CLASS_NAME <- method:NAME(ARGS)
let [VARIABLES]
INSTRUCTIONS 
return:RETURN_VALUE

//object
CLASS_NAME:[ARGS]

//object & affectation to variable
CLASS_NAME:[ARGS] <- VAR_NAME
//--------------------------------------------

//--------------------------------------------
#v1 | test

class:Polynom
{
	Polynom->display:(..array)
	
	->display:(begin, end, arg, attach, separator) // en travaux
	// Polynom(1,2,0,-2) => 1+2X-2X^3
	
	// begin = null
	// end = null
	// attach = <msup>//rajouter if
	//				<mi>.text('X')
	//				<mn>.text(i)
	// separator = <mo>.text('+')//rajouter if
	<mrow>
		<begin>
		<mrow>
			<arg:0>
			<attach:0>
			<separator>
			<arg:1>
			<attach:1>
			<separator>
			..
			<arg:MAX>
			<attach:MAX>
		<end>
}

class:Vector
{
	Vector->display:(begin, end, arg, attach, separator) // en travaux
	// Vector(1,2,0,-2) => (1,2,0,-2)

	// begin = <mo>.text('(')
	// end = <mo>.text(')')
	// attach = null
	// separator = <mo>.text(',')
	<mrow>
		<begin>
		<mrow>
			<arg:0>
			<attach:0>
			<separator>
			<arg:1>
			<attach:1>
			<separator>
			..
			<arg:MAX>
			<attach:MAX>
		<end>


	Vector<-method:add(this, other)
	let []
	classic(this, PLUS, other)
	return:this

	Vector:method:add -> display:(..args)
	//this + other
	<mrow>
		<this>
		<mo>.text("+")
		<other>

	Vector <- method:dot(this, other)
	let [value]
	classic(this, TIMES, other)
	value = apply(this, PLUS)
	return:value

	Vector:method:dot -> display:(..args)
	//this . vector
	<mrow>
		<this>
		<mo>.text(".")
		<other>

	Vector <- method:norm(this, q)
	let [value]
	..
	return:value

	Vector:method:norm -> display:(..args)
	//||this||_q
	<mrow>
		<msub>
			<mrow>
				<mo>.text("||")
				<this>
				<mo>.text("||")
			<mrow>
				<mn>.text(q)

	Vector:[8,4] <- u
}

class:Matrix
{
	Matrix <- method:add(this, other)
	let []
	classic(this, PLUS, other)
	return:this
/*
	Matrix<-object:A(line0, line1)
	temp:line0 = Vector(1,2)
	temp:line1 = Vector(0,4)
*/
	//Matrix:[Vector:[1,2], Vector:[3,4]] <- M

	Matrix <- object:[line0, line1] <- M
	temp:line0 = Vector <- object:[1, 2]
	temp:line1 = Vector <- object:[3, 4]
}


/*
1 -> Interprété Int(1)
1.0 -> Interprété Real(1.0)

includes('object')
includes('temp') && includes('object')
multiSplit(['<-', ':', '='])


*/

// ===============================================================================================================================
// ===============================================================================================================================
//													V3
// ===============================================================================================================================
			// PROGRAM
// ------------ general ------------
PROGRAM = {
	name : STRING,
	version : STRING,
	author : STRING,
	license : STRING,
	structures : LIST of CLASSES,
	variables : LIST of {
			name : STRING,
			instanceof : STRING,
		}
}


			// CLASS
// ------------ general ------------
CLASS = {
	class : STRING/Class_name,
	type : "CLASS",
	methods : LIST of METHODS,
	objects : LIST of OBJECTS,
	display : To Be Determined
}


			// METHODS

// ------------ general ------------

//dynamic
CLASS_NAME <- method:this.NAME(ARGS)
let [VARIABLES]
INSTRUCTIONS 
return:RETURN_VALUE

or

//static
CLASS_NAME <- method:NAME(ARGS)
let [VARIABLES]
INSTRUCTIONS 
return:RETURN_VALUE


METHOD = {
	class : STRING/Class_name,
	type : "METHOD",
	name : STRING/Name,
	data : {
		arguments : LIST of STRING/Args,
		variables : LIST of STRING/Variables,
		instructions : LIST of {
				name : STRING,
				arguments : LIST of STRING,
				toVariable : STRING or NULL,
			}/Instructions
		return : STRING/Return_value,
	}
	display : To Be Determined
}

// ------------ exemple ------------
// program
Vector<-method:this.add(other)
let []
this.classic(PLUS, other)
return:this

// json -> object
{
	class : "vector",
	type : "METHOD",
	name : "add",
	data : {
		arguments : ["this", "other"],
		variables : [],
		instructions : [
			{
				name : "classic",
				arguments : ["this", "PLUS", "vector"],
				toVariable : null,
			}
		]
		return : "this",
	}
	display : To Be Determined
}

			// OBJECTS

// ------------ general ------------
CLASS_NAME <- object:VAR_NAME(ARGS)
OBJECTS

// json -> object
OBJECT = {
	class : STRING/Class_name,
	type : "OBJECT",
	toVariable : STRING or NULL/Var_name,
	data : {
		arguments : LIST of STRING/Args,
		objects : LIST of {
				"name" : STRING,
				"object" : OBJECT,
			}/Objects
	}
}


			// built-in
// INTEGER
{
	class : "integer",
	type : "OBJECT",
	toVariable : null,
	data : {
		arguments : [],
		objects : [],
		value : INTEGER
	}
}

// REAL
{
	class : "real",
	type : "OBJECT",
	toVariable : null,
	data : {
		arguments : [],
		objects : [],
		value : FLOAT
	}
}

// ------------ exemple ------------

Matrix <- object:M[line0, line1]
temp:line0 = Vector <- object:[1, 2]
temp:line1 = Vector <- object:[3, 4]


// json -> object
{
	class : "matrix",
	type : "OBJECT",
	toVariable : "M",
	data : {
		arguments : ["line0", "line1"],
		objects : [
			{
				"name" : "line0",
				"object" : Var0,
			},
			{
				"name" : "line1",
				"object" : Var1,
			}
		]
	}
}

Var0 = {
	class : "vector",
	type : "OBJECT",
	toVariable : null,
	data : {
		arguments : ["1", "2"],
		objects : [
			{
				"name" : "1",
				"object" : Var00,
			},
			{
				"name" : "2",
				"object" : Var01,
			}
		]
	}
}

Var1 = {
	class : "vector",
	type : "OBJECT",
	toVariable : null,
	data : {
		arguments : ["3", "4"],
		objects : [
			{
				"name" : "3",
				"object" : Var10,
			},
			{
				"name" : "4",
				"object" : Var11,
			}
		]
	}
}

Var00 = {
	class : "integer",
	type : "OBJECT",
	toVariable : null,
	data : {
		arguments : [],
		objects : [],
		value : 1
	}
}

Var01 = {
	class : "integer",
	type : "OBJECT",
	toVariable : null,
	data : {
		arguments : [],
		objects : [],
		value : 2
	}
}

Var10 = {
	class : "integer",
	type : "OBJECT",
	toVariable : null,
	data : {
		arguments : [],
		objects : [],
		value : 2
	}
}

Var11 = {
	class : "integer",
	type : "OBJECT",
	toVariable : null,
	data : {
		arguments : [],
		objects : [],
		value : 3
	}
}


			// CALCULATOR

// ------------ general ------------
// ------------ exemple ------------
"||x(b)-x(a)||"

x.at(b).sub(x.at(a)).norm() = LLM_PROGRAMIZE("||x(b)-x(a)||")

VAR1 = x.at(b)				= LLM_SUBDIVIDE(x.at(b).sub(x.at(a)).norm())
VAR2 = x.at(a)
VAR3 = VAR1.sub(VAR2)	
VAR4 = VAR3.norm()



//----------------------------------------------------------------------
// SANS DISPLAY

new:Vector

Vector <- method:this.multiplyScalar(scalar)
let []
this.func(MULT:scalar)
return:this

Vector <- method:this.add(other)
let []
this.classic(PLUS, other)
return:this

Vector <- method:this.dot(other)
let [value, this_clone]
this_clone = this.clone()
this_clone.classic(TIMES, other)
value = this_clone.apply(PLUS)
return:this

Vector <- object:u[var0, var1]
temp:var0 = Real <- object:[1.0]
temp:var1 = Real <- object:[2.0]

Vector <- object:v[var0, var1]
temp:var0 = Real <- object:[-5.0]
temp:var1 = Real <- object:[7.0]

Real <- object:x[9.0]

// ----------------------------------

PROGRAM = {
	name : 'demo avec des vecteurs',
	version : 3.14,
	author : 'golto',
	license : 'MIT',
	structures : [
		{
			class : "integer",
			type : "CLASS",
			methods : [],
			objects : [],
			display : To Be Determined
		},
		{
			class : "real",
			type : "CLASS",
			methods : [],
			objects : [
				{
					class : "real",
					type : "OBJECT",
					toVariable : "x",
					data : {
						arguments : [],
						objects : [],
						value : 9.0
					}
				}
			],
			display : To Be Determined
		},
		{
			class : "vector",
			type : "CLASS",
			methods : [
				{
					class : "vector",
					type : "METHOD",
					name : "multiplyScalar",
					data : {
						arguments : ["this", "scalar"],
						variables : [],
						instructions : [
							{
								name : "func",
								arguments : ["this", "MULT:scalar"],
								toVariable : null,
							}
						]
						return : "this",
					}
					display : To Be Determined
				},
				{
					class : "vector",
					type : "METHOD",
					name : "add",
					data : {
						arguments : ["this", "other"],
						variables : [],
						instructions : [
							{
								name : "classic",
								arguments : ["this", "PLUS", "other"],
								toVariable : null,
							}
						]
						return : "this",
					}
					display : To Be Determined
				},
				{
					class : "vector",
					type : "METHOD",
					name : "dot",
					data : {
						arguments : ["this", "other"],
						variables : ["value", "this_clone"],
						instructions : [
							{
								name : "clone",
								arguments : ["this"],
								toVariable : "this_clone",
							},
							{
								name : "classic",
								arguments : ["this_clone", "TIMES", "other"],
								toVariable : null,
							},
							{
								name : "apply",
								arguments : ["this_clone", "PLUS"],
								toVariable : "value",
							}
						]
						return : "value",
					}
					display : To Be Determined
				}
			],
			objects : [
				{
					class : "vector",
					type : "OBJECT",
					toVariable : "u",
					data : {
						arguments : ["1.0", "2.0"],
						objects : [
							{
								class : "real",
								type : "OBJECT",
								toVariable : null,
								data : {
									arguments : ["1.0"],
									objects : [],
									value : 1.0
								},
							},
							{
								class : "real",
								type : "OBJECT",
								toVariable : null,
								data : {
									arguments : ["2.0"],
									objects : [],
									value : 2.0
								},
							}
						]
					}
				},
				{
					class : "vector",
					type : "OBJECT",
					toVariable : "v",
					data : {
						arguments : ["-5.0", "7.0"],
						objects : [
							{
								class : "real",
								type : "OBJECT",
								toVariable : null,
								data : {
									arguments : ["-5.0"],
									objects : [],
									value : -5.0
								},
							},
							{
								class : "real",
								type : "OBJECT",
								toVariable : null,
								data : {
									arguments : ["7.0"],
									objects : [],
									value : 7.0
								},
							}
						]
					}
				}
			],
			display : To Be Determined
		}
	],
	variables : [
		{
			name : "u",
			instanceof : "vector",
		},
		{
			name : "v",
			instanceof : "vector",
		},
		{
			name : "x",
			instanceof : "real",
		}
	]
}

// -----------------------------------------------------

PROGRAM = {
	name : 'demo avec des vecteurs',
	version : '3.14',
	author : 'golto',
	license : 'MIT',
	structures : [
		{
			class : "integer",
			type : "CLASS",
			methods : [],
			objects : [],
			display : To Be Determined
		},
		{
			class : "real",
			type : "CLASS",
			methods : [],
			objects : [
				{
					class : "real",
					type : "OBJECT",
					toVariable : "x",
					data : {
						arguments : [],
						objects : [],
						value : 9.0
					}
				}
			],
			display : To Be Determined
		},
		{
			class : "vector",
			type : "CLASS",
			methods : [
				{
					class : "vector",
					type : "METHOD",
					name : "multiplyScalar",
					data : {
						arguments : ["this", "scalar"],
						variables : [],
						instructions : [
							{
								name : "map",
								arguments : ["this", "MULT:scalar"],
								toVariable : null,
							}
						]
						return : "this",
					}
					display : To Be Determined
				},
				{
					class : "vector",
					type : "METHOD",
					name : "add",
					data : {
						arguments : ["this", "other"],
						variables : [],
						instructions : [
							{
								name : "operation",
								arguments : ["this", "PLUS", "other"],
								toVariable : null,
							}
						]
						return : "this",
					}
					display : To Be Determined
				},
				{
					class : "vector",
					type : "METHOD",
					name : "dot",
					data : {
						arguments : ["this", "other"],
						variables : ["value", "this_clone"],
						instructions : [
							{
								name : "clone",
								arguments : ["this"],
								toVariable : "this_clone",
							},
							{
								name : "operation",
								arguments : ["this_clone", "TIMES", "other"],
								toVariable : null,
							},
							{
								name : "reduceWith",
								arguments : ["this_clone", "PLUS"],
								toVariable : "value",
							}
						]
						return : "value",
					}
					display : To Be Determined
				}
			],
			objects : [
//Vector <- object:u[var0, var1]
//temp:var0 = Real <- object:[1.0]
//temp:var1 = Real <- object:[2.0]
				{
					class : "vector",
					type : "OBJECT",
					toVariable : "u",
					data : {
						arguments : ["var0", "var1"],
						objects : [
							{
								class : "real",
								type : "OBJECT",
								toVariable : null,
								fromVariable : "var0",
								data : {
									arguments : ["1.0"],
									objects : [],
									value : 1.0
								},
							},
							{
								class : "real",
								type : "OBJECT",
								toVariable : null,
								data : {
									arguments : ["2.0"],
									objects : [],
									value : 2.0
								},
							}
						]
					}
				},
				{
					class : "vector",
					type : "OBJECT",
					toVariable : "v",
					data : {
						arguments : ["-5.0", "7.0"],
						objects : [
							{
								class : "real",
								type : "OBJECT",
								toVariable : null,
								data : {
									arguments : ["-5.0"],
									objects : [],
									value : -5.0
								},
							},
							{
								class : "real",
								type : "OBJECT",
								toVariable : null,
								data : {
									arguments : ["7.0"],
									objects : [],
									value : 7.0
								},
							}
						]
					}
				}
			],
			display : To Be Determined
		}
	],
	variables : [
		{
			name : "u",
			instanceof : "vector",
		},
		{
			name : "v",
			instanceof : "vector",
		},
		{
			name : "x",
			instanceof : "real",
		}
	]
}
///////////
// displayer

Vector <- object:u[1.0, 2.0]

displayRaw = "(1.0, 2.0)"
displayVar = "u"
displayDefault = "vector[1.0, 2.0]"

displayEqual = mrow(displayVar, mo(:=), displayRaw)

mrow(VAR0, VAR1, VAR2)
VAR0 = displayVar
VAR1 = mo(VAR3)
VAR2 = displayRaw
VAR3 = ":="

Vector <- display()



// -------------------------------------------


new:Vector

Vector <- method:this.multiplyScalar(scalar)
let []
this.map(MULT:scalar)
return:this

Vector <- method:this.add(other)
let []
this.operation(PLUS, other)
return:this

Vector <- method:this.dot(other)
let [value, this_clone]
this_clone = this.clone()
this_clone.operation(TIMES, other)
value = this_clone.reduceWith(PLUS)
return:value

Vector <- method:this.testVect(other)
let []
this.add(other)
return:this

Vector <- method:this.sum()
let [value]
value = this.reduceWith(PLUS)
return:value

Vector <- object:u[v0, v1]
temp:v0 = Real <- object:[1.0]
temp:v1 = Real <- object:[2.0]

Vector <- object:v[v0, v1]
temp:v0 = Real <- object:[-5.0]
temp:v1 = Real <- object:[7.0]

new:Matrix

Matrix <- method:this.add(other)
let []
this.operation(add, other)
return:this

Matrix <- method:this.innerSum(other)
let [value]
value = this.clone()
value.map(sum)
value = value.cloneToClass(Vector)
return:this

Matrix <- object:M[v0, v1]
temp:v0 = Vector <- object:[v00, v01]
temp:v1 = Vector <- object:[v10, v11]
temp:v00 = Real <- object:[1.0]
temp:v01 = Real <- object:[2.0]
temp:v10 = Real <- object:[3.0]
temp:v11 = Real <- object:[4.0]

Matrix <- object:ID[v0, v1]
temp:v0 = Vector <- object:[v00, v01]
temp:v1 = Vector <- object:[v10, v11]
temp:v00 = Real <- object:[1.0]
temp:v01 = Real <- object:[0.0]
temp:v10 = Real <- object:[0.0]
temp:v11 = Real <- object:[1.0]