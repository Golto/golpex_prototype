class Element {

	constructor(type, ...args) {
		
		this.element = this.createElement(type, ...args);
		this.value = null;
	}

	setValue(s) {
		this.value = s;
		return this
	}

	remove() {
		this.remove();
		return 0
	}

	createElement(type, ...args) {
		const element = Element.customElements.get(type);
		if (element) {
			return element(...args);
		}
		return document.createElement(type); 
	}

	text(text) {
		this.element.textContent = text;
		return this;
	}

	html(html) {
		this.element.innerHTML = html;
		return this; 
	}

	css(styles) {
		Object.assign(this.element.style, styles);
		return this;
	}

	class(...classNames) {
		classNames.map( className => this.element.classList.add(className))
		return this;
	}

	attr(attributes) { // NE PAS UTILISER
		Object.assign(this.element, attributes);
		return this;
	}

	attrFromMap(attributes) {
		for( let [key, value] of attributes) {
			//this.element.setAttribute(key, value); // bugué pour video.muted = true
			this.element[key] = value;
		}
		return this
	}

	addEventListener(event, handler) {
		this.element.addEventListener(event, handler);
		return this
	}

	id(id) {
		this.element.id = id;
		return this
	}

	append(child) {
		this.element.appendChild(child.element);
		return this;
	}

	prepend(child) {
		this.element.insertBefore(child.element, this.element.firstChild);
		return this;
	}

	clear() {
		[...this.element.children].map(e => e.remove())
	}

	// ---

	closeMath() {
		const element = new Element('math')
			.attr({xmlns : "http://www.w3.org/1998/Math/MathML"})
			.append(this)

		return element
	}

	attachTo(DOMElement, needUpdate = false) {
		DOMElement.appendChild(this.element);
		if (needUpdate) {MathJax.typesetPromise()}
		return DOMElement
	}

}


Element.loadComponents = () => {
	const body = document.querySelector('body');
	const keys = [...Element.customElements.keys()]
	let nodeList = [];
	// get all nodes
	keys.map( key => nodeList.push(...body.querySelectorAll(key)));

	// replace all nodes by its Element's equivalent
	nodeList.map( node => {
		const parent = node.parentElement;
		const name = node.nodeName.toLowerCase();

		const attrs = [...node.attributes];

		//console.log(attrs, name)

		let args = {};
		for( let attr of attrs) {
			args[attr.name] = attr.value;
		}

		const newNode = new Element(name, args).element

		parent.replaceChild(newNode, node);
	})

	
}

Element.customElements = new Map();

// function

Element.customElements.set('mfunction', ({functionObject, inner}) => {
	// [functionObject] ( [inner] ) => f(x)
	return new Element('mrow')
		.append(
			functionObject
		)
		.append(
			new Element('mo').text('(')
		)
		.append(
			inner
		)
		.append(
			new Element('mo').text(')')
		).element
})

// integral 

Element.customElements.set('mintegral', ({lower, upper, inner, varName = 'x'}) => {
	// int [lower] [upper] [inner] d[varName] => int 0 x f(t) dt
	return new Element('mrow')
		.append(
			new Element('msubsup')
				.append(
					new Element('mo').text('∫')
						.attrFromMap( new Map([
							['data-mjx-texclass', 'OP']
						]))
				)
				.append(
					lower
				)
				.append(
					upper
				)
		)
		.append(
			inner
		)
		.append(
			new Element('mi').text(`d${varName}`)
		)
		.element
})

// vector

Element.customElements.set('mvector', ({list}) => {
	// (...list) => (x, y, z)
	const vector = new Element('mrow')
		.append(
			new Element('mo').text('(')
		)
		.append(
			list[0]
		)

	for (let i = 1; i < list.length; i++) {
		vector.append(
			new Element('mo').text(',')
		)
		.append(
			list[i]
		)
	}

	vector.append(
			new Element('mo').text(')')
		)
	return vector.element
})

// polynom

Element.customElements.set('mpolynom', ({list, varName = 'X'}) => {
	// (...list) => (x, y, z)
	const polynom = new Element('mrow')
		.append(
			list[0]
		)

	function display(element, i) {
		if (i === 0) return element
		if (i === 1) return element.append(
							new Element('mi').text(varName)
						)
		return element.append(
			new Element('msup')
				.append(
					new Element('mi').text(varName)
				)
				.append(
					new Element('mn').text(i)
				)
		)

	}

	for (let i = 1; i < list.length; i++) {
		if (list[i].value != 0) {

			if (list[i].value < 0) {
				polynom.append(
					new Element('mo').text('-')
				)
			} else {
				polynom.append(
					new Element('mo').text('+')
				)
			}
			
			polynom.append(
				list[i]
			)
			display(polynom, i)
		}
		
	}

	return polynom.element
})

// operation

Element.customElements.set('moperation', ({varA, operation = '+', varB}) => {
	return new Element('mrow')
		.append(
			varA
		)
		.append(
			new Element('mo').text(operation)
		)
		.append(
			varB
		).element
})

// parenthesis

Element.customElements.set('mparenthesis', ({begin = '(', inner, end = ')'}) => {
	return new Element('mrow')
		.append(
			new Element('mo').attr({stretchy : true}).text(begin)
		)
		.append(
			inner
		)
		.append(
			new Element('mo').attr({stretchy : true}).text(end)
		).element
})

// toString

Element.customElements.set('mtoString', ({name, display}) => {
	return new Element('mrow')
		.append(
			new Element('mtext').text(name)
		)
		.append(
			display
		).element
})

// quill

function quill(value, event) {
	// Supprime les espaces en début et fin
	value = value.trim();

	if(!value) return new Element('mtext').text('Tapez une formule...').closeMath().css({opacity : 0.3})

	//return new Element('mtext').text(value).closeMath();
	return mathMLfromString(value, event).closeMath();
}

function mathMLfromString(string, event) {
	string = string.replace('*', '⋅').replace('int', '∫').replace('sum', '&#x2211')

	return new Element('mtext').text(string)
}

Element.customElements.set('inputQuill', () => {

	const updateMath = (e) => {
		console.log(e.key)

		div.clear()
		math = quill(input.element.value, e);

		div.append(math);

		//update mathJax
		MathJax.typesetPromise()
	}

	let math = new Element('mtext')
		.text('Tapez une formule...')
		.closeMath()
		.css({opacity : 0.3});


	const div = new Element('div')
		.css({
			backgroundColor : 'rgba(244, 244, 244, 0.8)', 
			borderRadius : '50px', 
			padding : '30px',
			position : 'relative',
			top : '-60px',
		})
		.append(math);

	const input = new Element('input')
		.css({
			//backgroundColor : 'rgba(244, 244, 244, 0.8)',
			border : 'none',
			borderRadius : '50px', 
			padding : '10px',
			position : 'relative',
			left : '20px',
			top : '5px',
			zIndex : '1',
			width : 'calc(100% - 70px)',

			color: 'transparent',
			caretColor: 'black',
			backgroundColor: 'transparent',
			outline: 'none',
			fontSize: '1.13em',
		})
		.attr({onkeydown : updateMath})
		.attr({onkeypress : updateMath})
		.attr({onkeyup : updateMath})

	

	return new Element('div')
		.css({
			position : 'relative',
			top : '50px',
			fontSize: '1.5em',
		})
		.append(
			input
		)
		.append(
			div
		).element
})


// ----------------

/*


const f_x = new Element('mfunction', {
	functionObject : new Element('mi').text('f'),
	inner : new Element('mi').text('x')
})


const g_x = new Element('mfunction', {
	functionObject : new Element('mi').text('g'),
	inner : new Element('mn').text('0')
})


const integral = new Element('mintegral', {
	lower : new Element('mn').text(0),
	upper : new Element('mi').text('x'),
	inner : new Element('mfunction', {
				functionObject : new Element('mi').text('f'),
				inner : new Element('mi').text('t')
			}),
	varName : 't'
})


const vector = new Element('mvector', {
	list : [
		new Element('mi').text('x'),
		new Element('mi').text('y'),
		new Element('mi').text('z'),
	]
})


const _polynom = new Element('mpolynom', {
	list : [
		new Element('mi').text('a').setValue(1),
		new Element('mi').text('b').setValue(1),
		new Element('mi').text('c').setValue(0),
		new Element('mi').text('d').setValue(-1),
		new Element('mi').text('e').setValue(1),
		new Element('mi').text('f').setValue(1),
	]
})

const eq0 = new Element('moperation', {
	varA : integral,
	operation : '⋅',
	varB : new Element('mi').text('Y'),
})

const eq0p = new Element('mparenthesis', {
	begin : '‖',
	end : '}',
	inner : new Element('mfrac')
		.append(eq0)
		.append(vector),
})

const eq1 = new Element('moperation', {
	varA : eq0p,
	operation : '×',
	varB : new Element('msup')
		.append(
			new Element('mi').text('Z')
		)
		.append(
			new Element('mn').text('5')
		),
})

const _class = new Element('mtoString', {
	name : 'Vector',
	display : vector,
})


const div = new Element('div')
	.append(
		_class.closeMath()
	)

function test(){
	const output = document.getElementById('golpexMath').getElementsByClassName('container')[0].getElementsByClassName('output')[0];
	new Element('inputQuill')
		.attachTo(output);
}


*/



















/*
// Exemple d'utilisation :

const div = new Element('div')
	.text('Hello')
	.css({color: 'blue'})
	.append(
		new Element('p').text('World!')
	);

//document.body.appendChild(div.element);

const dropdown = new Element('div')
	.class('dropdown')
	.append(
		new Element('div')
			.class('content')
			.append(
				new Element('span')
					.text(' S ')
			)
			.append(
				new Element('p')
					.text('Settings')
			)
			.append(
				new Element('span')
					.text('M')
			)
	)
	.append(
		new Element('button')
	)
	.append(
		new Element('div')
			.class('menu')
			.append(
				new Element('a')
					.append(
						new Element('span')
							.text(' A ')
					)
					.append(
						new Element('p')
							.text('Account')
					)
			)
			.append(
				new Element('a')
					.append(
						new Element('span')
							.text(' B ')
					)
					.append(
						new Element('p')
							.text('Payments')
					)
			)
			.append(
				new Element('a')
					.append(
						new Element('span')
							.text(' C ')
					)
					.append(
						new Element('p')
							.text('Archive')
					)
			)
	)
*/

//MathJax.typesetPromise() 