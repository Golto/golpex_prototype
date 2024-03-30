class Element {

	constructor(type, ...args) {
		
		this.element = this.createElement(type, ...args);
		this.value = null;
	}

	setValue(s) {
		this.value = s;
		return this
	}

	createElement(type, ...args) {
		if (type in Element.customElements) {
			return Element.customElements[type](...args);
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

	class(className) {
		this.element.classList.add(className)
		return this;
	}

	attr(attributes) {
		Object.assign(this.element, attributes);
		return this;
	}

	append(child) {
		this.element.appendChild(child.element);
		return this;
	}

	prepend(child) {
		this.element.insertBefore(child.element, this.element.firstChild);
		return this;
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

Element.customElements = {
	mfunction : ({functionObject, inner}) => {
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
	},
	mintegral : ({lower, upper, inner, varName}) => {
		// int [lower] [upper] [inner] d[varName] => int 0 x f(t) dt
		return new Element('mrow')
			.append(
				new Element('msubsup')
					.append(
						new Element('mo').text('∫')
							.attr({'data-mjx-texclass' : 'OP'})
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
	},
	mvector : ({list}) => {
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
	},
	mpolynom : ({list, varName = 'X'}) => {
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
	},
}
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
	/*
const math = new Element('math')

const X = new Element('math')
	.append(
		new Element('mi').text('X')
	)

const X2 = new Element('math')
	.append(
		new Element('msup')
			.append(
				new Element('mi').text('X')
			)
			.append(
				new Element('mn').text('2')
			)
	)


const X3 = new Element('msup')
	.append(
		new Element('mi').text('X')
	)
	.append(
		new Element('mn').text('3')
	)
	.closeMath()

const _2plus3 = new Element('mrow')
	.append(
		new Element('mn').text(2)
	)
	.append(
		new Element('mo').text('+')
	)
	.append(
		new Element('mn').text(3)
	)
	.closeMath()

*/



const f_x = new Element('mfunction', {
	functionObject : new Element('mi').text('f'),
	inner : new Element('mi').text('x')
}).closeMath()

const g_x = new Element('mfunction', {
	functionObject : new Element('mi').text('g'),
	inner : new Element('mn').text('0')
}).closeMath()

const integral = new Element('mintegral', {
	lower : new Element('mn').text(0),
	upper : new Element('mi').text('x'),
	inner : new Element('mfunction', {
				functionObject : new Element('mi').text('f'),
				inner : new Element('mi').text('t')
			}),
	varName : 't'
}).closeMath()

const vector = new Element('mvector', {
	list : [
		new Element('mi').text('x'),
		new Element('mi').text('y'),
		new Element('mi').text('z'),
	]
}).closeMath()


const _polynom = new Element('mpolynom', {
	list : [
		new Element('mi').text('a').setValue(1),
		new Element('mi').text('b').setValue(1),
		new Element('mi').text('c').setValue(0),
		new Element('mi').text('d').setValue(-1),
		new Element('mi').text('e').setValue(1),
		new Element('mi').text('f').setValue(1),
	]
}).closeMath()