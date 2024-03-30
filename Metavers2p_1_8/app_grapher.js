import * as bp from './brainPex.js';

//GO_TO_RENDERER('golpexGrapher')

const handler = new bp.AppHandler(
	'chatbot',
	'golpexGrapher'
)

handler.output = new bp.Output(
	handler.element,
)

handler.input = new bp.Input(
	handler.element,
	input => {
		if (input === 'VAR') {
			console.log(variables);
			return 1
		}
		multiTask(input);
	},
	`Exemple : f(x)=2x+1`
)

//----------------------------------------------------

async function multiTask(input){
	const res = await LLM_TypeFinder(input);
	console.log(res)
	handler.output.printLog(res.type + '\n' + res.variables)
	typeRedirect[res.type]( input, res );

	console.log('API_Counter.LLM = ', bp.API_Counter.LLM)
}


let typeRedirect = {
	equation : ()=>{},
	function : functionTask,
	point : ()=>{},
	calculation : ()=>{},
	defintion : ()=>{},
	inequation : ()=>{},
	differential : ()=>{},
}


function functionTask(input, data){

	return 0
}
// PRESENT SUR DESMOS -------------------------------------------

// équation de y par rapport à x
// y = ax+b  /  y + x - xy = 3 (+ possibilité de créer des curseurs pour a et b)

// points
// (2,3)

// calculatrice
// 5.3 - 1.3 : "affiche = 4.0"

// inéquations
// x^2 + y^2 <= 2

// fonctions et constante
// pi, e, ln, cos, sin, tan, ...

// définition de variables/fonctions
// f(x) = 2x+3
// y = 3f(x)-x

// conditionnements (à rendre plus intuitif)
// y < x { y^2 = x}

// coordonnées polaires

// vecteurs (avec [1, 2] comme numpy)

// somme, produit, dérivée, intégrales

//MANQUANT SUR DESMOS -------------------------------------------
// équations différentielle
// x'(t) = f(t,x(t))

// graphique en 3D

// calculs de nombres complexes
// 3+2i + 4+5i

// polynômes, matrices

// perlin.noise + variantes


let variables = new Map();

/*
### instructions :
Given an input, identify of which type it is as format : {{"type" : STRING, "variables" : LIST OF STRING}}
Write "<END>" after format response.
List of possibles types with example input :
"equation" : "x + y = 3x^2",
"function" : "f(x) = expression",
"point" : "(a,b)",
"calculation" : "4+0.3 + sqrt(2)",
"definition" : "a = f(0)+1",
"inequation" : "f(x) < g(x)",
"differential" : "x'=f(t,x)"

### input :
3+2i + 5+6i

### response :
{"type" : "calculation", "variables" : ["3+2i", "5+6i"]}

<END>### Assistant: Given the input "3+2i + 5+6i", the type of the input is "calculation" and the variables are "3+2i" and "5+6i". The responsein the required format is:

```json
{"type": "calculation", "variables": ["3+2i", "5+6i"]}
```

<END
*/

async function LLM_TypeFinder(input){
	let cost = bp.API_Counter.LLM;

	const prompt = `### instructions :
Given an input, identify of which type it is as format : \`\`\`{"type" : STRING, "variables" : LIST OF STRING}\`\`\`
Write "<END>" after format response.
Write "<END>" before ### input :
List of possibles types with example input :
"equation" : "f(x,y) = g(x,y)", // needs to contain '='
"function" : "f(x) = expression",
"point" : "(a,b)",
"calculation" : "4+0.3 + sqrt(2)", // fixed value
"definition" : "a = fixed value", // fixed value assigned to a variable
"inequation" : "f(x,y) < g(x,y)",
"differential" : "x' = f(t,x)" // needs to contain '<' or '>' or '<=' or '>='

### input :
${input}

### response :
`;
	let res = await bp.promptIteratorLLM(prompt, 2);
	let output = bp.outputExtractor(prompt, res);

	cost = bp.API_Counter.LLM - cost;

	console.log('LLM_Executor : ','Coût = ' + cost);
	console.log(res)

	output = output.split('Tags:')[0].split('### ')[0].split('# 19')[0]
	output = output.replaceAll('LIST OF 0 STRING','[]');
	output = output.split('<END>')[0].replaceAll('\n','');
	return JSON.parse(output)
}

/*

<math xmlns="http://www.w3.org/1998/Math/MathML">...</math>

<mi>a</mi> <mi>cos</mi>
<mn>4</mn>
<mo>=</mo> <mo>+</mo> 
<msup> <mi>x</mi><mn>2</mn> </msup> (x^2)
<msub> <mi>x</mi><mn>2</mn> </msub> (x_2)

<mrow></mrow> (regrouper en 1 ligne)
<mfrac></mfrac> => <mfrac> <mrow>EXPR_A</mrow> <mrow>EXPR_B</mrow> </mfrac>
<mover></mover> => <mover> <mrow>EXPR_A</mrow> <mrow>EXPR_B</mrow> </mover>


<msqrt></msqrt>

<mo stretchy="false">(</mo>
	INNER EXPRESSION
<mo stretchy="false">)</mo>

<mtext></mtext>

<mo>&#xD7;</mo> (cross x)
<mo>&#x2260;</mo> (=/=)
<mo>&#x2212;</mo> (long -)
<mo>&#x00B1;</mo> (+-)
<mo>&#x22C5;</mo> (.)
<mo stretchy="false">&#x2192;</mo> (flèche de vecteur)
<mi>&#x3C0;</mi> (pi)
<mi>&#x3B8;</mi> (theta)
<mi>&#x3D5;</mi> (phi)
<mi>&#x2202;</mi> (partial derivative)
<mi>&#x2207;</mi> (inv delta)
<mi>A</mi> 						(italic par défaut)
<mi mathvariant="normal">A</mi>	(non-italic)
<mi mathvariant="bold">A</mi> 	(gras)
<mo data-mjx-texclass="OP">&#x222B;</mo> (intégrale)
<mo data-mjx-texclass="OP">&#x222E;</mo> (intégrale de contour)
*/

// ----------------------------------------------------------------------------------------------------------------------------------

function convertToMathML(text) {
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString('<math xmlns="http://www.w3.org/1998/Math/MathML"></math>', 'text/xml');

	let numbers = [];//{value, start and end position in text}

	for (let char of text) {
		if (char.match(/[0-9.]/)) {}
	}


	return xmlDoc.documentElement.outerHTML;
}


const text = '3+2=';
const mathML = convertToMathML(text);
console.log(mathML);

/*
Il me faudrait une fonction qui prend en entrée une input STRING comme '33+x=y' et qui retourne une liste de chaque objet, ici : 
[
    {type : "number", value : "33"},
    {type : "operation", value : "+"},
    {type : "variable", value : "x"},
    {type : "operation", value : "="},
    {type : "variable", value : "y"},
]
*/

function parseInputString(inputString) {
  const tokens = [];
  let currentToken = '';

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];

    if (char.match(/[0-9]/)) {
      // Digits (numbers)
      currentToken += char;
    } else if (char.match(/[+\-*/^=]/)) {
      // Operators (+, -, *, /, ^, =)
      if (currentToken !== '') {
        tokens.push({ type: 'number', value: currentToken });
        currentToken = '';
      }
      tokens.push({ type: 'operation', value: char });
    } else if (char.match(/[a-zA-Z]/)) {
      // Variables (letters)
      if (currentToken !== '') {
        tokens.push({ type: 'number', value: currentToken });
        currentToken = '';
      }
      tokens.push({ type: 'variable', value: char });
    }
  }

  // Push the last token if there is one
  if (currentToken !== '') {
    tokens.push({ type: 'number', value: currentToken });
  }

  return tokens;
}
