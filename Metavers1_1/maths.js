"use strict"

// Théorie Goltienne v1


class objectTheory{

	static list = new Map;

	constructor(id,description){
		this.id = id;
		this.description = description;

		objectTheory.list.set(this.id, this);
	}

	evaluate(){
		if (this.description[0] === 'f'){
			const S = this.description.slice( this.description.search('So') + 2, this.description.search('Sc') );
			const A = this.description.slice( this.description.search('Ao') + 2, this.description.search('Ac') );
			const B = this.description.slice( this.description.search('Bo') + 2, this.description.search('Bc') );
			const X = this.description.slice( this.description.search('Xo') + 2, this.description.search('Xc') );
			const Y = this.description.slice( this.description.search('Yo') + 2, this.description.search('Yc') );
			console.log(S,A,B,X,Y)
		}
		return this.description
	}
}

/*
FFoFFc : () => formule
FSoFSc : [] => formule de séléction
#number : #3 => id
# : . => undefined
f<So selection ScAo fromInnerA AcBo toInnerB BcXo ofObjectX XcYo toObjectY Yc> : f<#0,#4,#5,#7,#8> => action
*/

new objectTheory(0,'FFoFFoFFcFFc');				// (())
new objectTheory(1,'FFoFFc');					// ()
new objectTheory(2,'FFoFFoFFoFFcFFcFFoFFcFFc');	// ((())())
new objectTheory(3,'');							// undefined
new objectTheory(4,'f<So#ScAo#0AcBo#1BcXo#2XcYo#3Yc>');			// ((())())--(())=>()-->


// Théorie Goltienne v2


class Formula{

	static list = new Map();// .list.get('id') = 'formula'

	constructor(children = []){
		this.parent = undefined;	//single id
		this.children = children;	//array of ids
		this.id = Formula.list.size;

		this.children.forEach((id) => {
			const child = Formula.list.get(id);
			child.parent = this.id;
		})

		Formula.list.set(this.id,this);
	}

	clone(){
		if (this.children.length < 1) return new Formula;
		
		const newChildren = [];
		this.children.forEach((id) => {
			const childClone = Formula.list.get(id).clone();
			newChildren.push( childClone.id);
		})
		return new Formula(newChildren);

	}

	represent(){
		if (this.children.length < 1) return '<>';

		let childrenString = '';
		this.children.forEach((id) => {
			childrenString += ' ' + Formula.list.get(id).represent();
		})
		return '<' + childrenString + ' >'
	}
}



new Formula;	//0 ()
new Formula;	//1 ()
new Formula;	//2 ()
new Formula;	//3 ()
new Formula;	//4 ()

new Formula([0,1]);		//5 ( () () )
new Formula([5,2]);		//6 ( (()()) () )
new Formula([6,3,4]);	//7 ( ((()())()) () () )

Formula.list.get(7).clone();	//create 8 to 15





//---------------------------------------------------------------
//				peut être modifié

class Action{

	//without selector

	static list = new Map();

	constructor(fromId){
		this.fromId = fromId;
		this.selectorId = undefined;
		this.fromContentId = undefined;
		this.toContentId = undefined;
		this.id = Action.list.size;

		Action.list.set(this.id,this);
	}

	log(){
		return {
			from : Formula.list.get(this.fromId),
			selector : undefined,
			fromContent : undefined,
			toContent : undefined,
		}
	}

	result(){
		return Formula.list.get(this.fromId).clone() // identity
	}
}

new Action(0) 