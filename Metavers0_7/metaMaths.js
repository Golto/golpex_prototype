console.log("./metaMaths.js","loaded")


class MetaMaths{
	constructor(){

	}
}

//class Slot{}
class SuperPosition{}

class Formula{
	constructor(name = "", children = {}, slots = [], time = 0, totalTime = 1000, ){
		this.name = name;
		this.type = "Formula";
		this.children = children;	//object : non-ordered
		this.slots = slots;			//array : identify each slot
		this.time = time;
		this.innerTime = 0;
		this.totalTime = totalTime;
		// au bout de totalTime étapes, le nombre d'étapes de la formule parent rajoute 1 étape


		//this.parent = this.getParent;
	}

	innerNextBuffer(){
		for (let i in this.children) {
			this.children[i].nextBuffer();
			console.log(this.children[i].name, "buffer")
		}
	}

	innerNext(){
		for (let i in this.children) {
			this.children[i].next();
			console.log(this.children[i].name, "next")
		}
		this.innerTime += 1;
	}

	nextBuffer(){
		//children.forEach( e => e.nextBuffer())

	}
	next(){
		this.time += 1;
	}
}

class ValueAffect{
	constructor(name = "", children = [{},{}], time = 0, ){
		this.name = name;
		this.type = "ValueAffect";
		this.children = children;	//array of 2 : ordered
		this.time = time;
		this.buffer = null;
		//this.parent = this.getParent;
	}

	nextBuffer(){
		this.buffer = spCopy(this.children[0]);
		//children.forEach( e=> e.nextBuffer())

	}
	next(){
		this.children[1] = spCopy(this.buffer);
		this.buffer = null;
		this.time += 1;
		//children.forEach( e=> e.next())
	}
}

class ReffAffect{
	constructor(name = "", ){
		this.name = name;
		this.type = "ReffAffect";

	}
}

//=========================================================================

class Name{}
class ValueReader{}

//=========================================================================
//							UTILS
//=========================================================================


function sp(){
	//création d'une superposition
	const L = Object.entries(arguments);
	return(Object.fromEntries(L));
}

function spCopy(sp){
	//copie des superposisitions
	//évites les définitions par référence
	const copy = Object.entries(sp);
	return( Object.fromEntries(copy) )
}

function arCopy(sp){
	//copy des Arrays
	//évites les définitions par référence
	const copy = Object.values(sp);
	return(	copy )
}

function inList(x,list){
	//x in <Array> ?
	let inList = false;
	list.forEach(value => {  inList ||= x === value  });
	return(inList);
}

function csp(superPos0,superPos1){
	//csp = compare Superposition, réduit car utilisé souvent (code moins lourd)
	//test d'égalité entre deux superpositions
	let inclusion01 = true;
	let inclusion10 = true;
	const values0 = Object.values(superPos0);
	const values1 = Object.values(superPos1);
	values0.forEach(value => {inclusion01 &&= inList(value,values1)} )
	values1.forEach(value => {inclusion10 &&= inList(value,values0)} )

	return(inclusion01 && inclusion10);
}

function dsp(app,sp){
	//dsp = distributive Superposition, réduit car utilisé souvent (code moins lourd)
	//toute application est distributive sur une superposition
	// ex : f(sp(1,2)) = sp(f(1),f(2))
	let l = Object.values(sp);
	let n = 0;
	l.forEach( value => { 	
							l[n] = [n,app(value)];
							n += 1;
						} );
	return(Object.fromEntries(l))
}

function selectSlotsByIndex(slots = [],){
	let newSlots = []
	for (var i = 1; i <= arguments.length - 1; i++) {
		newSlots[i-1] = sp(slots[arguments[i]]);
	}
	return(newSlots)
}

//=========================================================================
//							TEST
//=========================================================================

/*
const f00 = new Formula();										//{}
const f01 = new Formula();										//{}
const va0 = new ValueAffect(children = [sp(f00),sp()]);			//{}-->.
//const f1 = new Formula(children = sp(f00,f01),);				//{{},{}}
const f1 = new Formula(children = sp(va0,f01),);				//{{}-->. , {}}
*/

const f00a = new Formula(""); // {}
const f01a = new Formula(name = "2", children = sp(f00a)); // {{}}

const f00b = new Formula(name = "1"); // {}

const va0 = new ValueAffect("va0",children = [ sp(f01a), sp(f00b) ]); // { {{}}-->{} }
const va1 = new ValueAffect("va1",children = [ sp(f00b), sp(f01a) ]); // { {}-->{{}} }

const f1 = new Formula(name = "Formula", children = sp(va0,va1));

function nextg(){
	f1.innerNext()
	const vaChildren = f1.children[0].children
	console.log(vaChildren[0].name);
	console.log(vaChildren[0].name);
}

//A REFAIRE