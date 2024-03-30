const cv = document.getElementById('c');
cv.width = 500; cv.height = 500;
const ctx = cv.getContext('2d');

const classement = {
	points:[],
	style:{typefond:0, typepoints:0, axe1:"Axe 1", axe2:"Axe 2", axes:false, divisions:true}
};

function stylePoints() {
	classement.style.typepoints = document.getElementById('points').selectedIndex;
	afficherGraphe();
}

function styleStyle() {
	classement.style.typefond = document.getElementById('style').selectedIndex;
	afficherGraphe();
}

function revAxes() {
	classement.style.axes = document.getElementById('axes').checked;
	afficherGraphe();
}

function chgAxes() {
	classement.style.axe1 = prompt("Nom du premier axe :",classement.style.axe1);
	classement.style.axe2 = prompt("Nom du second axe :",classement.style.axe2);
	afficherGraphe();
}

function revSep() {
	classement.style.divisions = document.getElementById('sep').checked;
	afficherGraphe();
}

const affreuxRegEx = /{"points":\[({"x":[-.0-9]+,"y":[-.0-9]+,"t":"[^"]+","sh":"[^"]+","i":[0-9]+},*)+\],"donnees":\[({"nom":"[^"]+","court":"[^"]+","utilise":(false|true)},*)+\],"style":{"divisions":(true|false),"typefond":[0-9]+,"typepoints":[0-9]+,"axes":(false|true),"axe1":"[^"]+","axe2":"[^"]+"}}/gm;

function imp() { document.getElementById("input").click(); }
function priseencharge() {
	let prom = document.getElementById("input").files[0].text();
	prom.then(function(result){
		let val = JSON.parse(result);
		if(!affreuxRegEx.test(result)) { alert("Fichier dans un format incorrect !"); return; }
		donnees = val.donnees; classement.points = val.points; classement.style = val.style;
		afficherPropositions(); afficherGraphe();
	}, function(){});
}

function exp() {
	let lienVirtuel = document.createElement("a");
	let fichier = new Blob([JSON.stringify({"points":classement.points, "donnees":donnees, "style":classement.style})], {type: 'application/json'});
	lienVirtuel.href = URL.createObjectURL(fichier);
	lienVirtuel.download = 'TierList.json';
	lienVirtuel.click();
}
function rst() { if(confirm("Souhaitez-vous réellement remettre à zéro ?")) { classement.points = []; for(let i = 0; i<donnees.length; i++) { donnees[i].utilise = false; } afficherPropositions(); afficherGraphe(); } }

function pointer(x,y,t,v,s) {
	if(v == 0) { ctx.fillStyle = 'black'; } 
	if(v == 1) { ctx.fillStyle = "red"; }
	if(v == 2) { ctx.fillStyle = "#ccc"; }
	if(s == 0) {
		ctx.beginPath();
		ctx.arc(x,y,5,0,2*Math.PI,false);
		ctx.fill();
		ctx.closePath();
	} else if(s == 1) {
		ctx.beginPath();
		ctx.arc(x,y,10,0,2*Math.PI,false);
		ctx.fill();
		ctx.closePath();
	} else if(s == 2) {
		ctx.strokeStyle = 'black'; ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(x,y,5,0,2*Math.PI,false);
		ctx.stroke();
		ctx.closePath();
	} else if(s == 3) {
		ctx.fillRect(x-5,y-5,10,10);
	} else if(s == 4) {
		ctx.beginPath();
		ctx.moveTo(x,y-10);
		for(let i = 0; i<5; i++) {
			ctx.lineTo(x-5*Math.sin(Math.PI/5*(2*i+1)), y-5*Math.cos(Math.PI/5*(2*i+1)));
			ctx.lineTo(x-10*Math.sin(Math.PI/5*(2*i+2)), y-10*Math.cos(Math.PI/5*(2*i+2)));
		}
		ctx.closePath();
		ctx.fill();
	}
	ctx.font = "bold 16px Arial"; ctx.strokeStyle = 'white'; ctx.lineWidth = 3; ctx.miterLimit = 2;
	if(y < 250) { ctx.textBaseline = 'top'; } else { ctx.textBaseline = 'bottom'; }
	if(x > 250) { ctx.textAlign = 'right'; ctx.strokeText(t, x-10, y); ctx.fillText(t,x-10,y); }
	else { ctx.textAlign = 'left'; ctx.strokeText(t, x+10, y); ctx.fillText(t,x+10,y); }
}

function fondTierList(m,n,p) {
	ctx.fillStyle = '#333'; ctx.fillRect(0,0,500,500);
	let rect = {x:0,y:0,w:500,h:500}; if(p) { rect = {x:30,y:30,w:470,h:470}; }
	for(let i = 0; i<m; i++) {
		for(let j = 0; j<n; j++) {
			let [r,g,b] = [255,255,255];
			if(classement.style.typefond == 0) {
				let [u,v] = [(i+0.5)/m,(j+0.5)/n];
				[r,g,b] = [150+100*v,150+100*u,150+100*Math.abs(u+v-1)];
			} else if(classement.style.typefond == 1) {
				let [u,v] = [(i+0.5)/m,(j+0.5)/n];
				[r,g,b] = [150+100*u*u,150+100*(u+v)/2,150+100*v*v];
			}
			ctx.fillStyle = 'rgb('+String(r)+','+String(g)+','+String(b)+')';
			ctx.fillRect(Math.round(rect.x+rect.w/m*i), Math.round(rect.y+rect.h/n*j),
						 Math.round(rect.x+rect.w/m*(i+1))-Math.round(rect.x+rect.w/m*i),
						 Math.round(rect.y+rect.h/n*(j+1))-Math.round(rect.y+rect.h/n*j));
		}
	}
	
	if(classement.style.divisions) {
		ctx.strokeStyle = '#aaa';
		ctx.lineWidth = 2;
		ctx.setLineDash([3,3]);

		for(let i = 1; i<m; i++) {
			ctx.beginPath();
			ctx.moveTo(rect.x+rect.w/m*i,rect.y);
			ctx.lineTo(rect.x+rect.w/m*i,rect.y+rect.h);
			ctx.stroke();
			ctx.closePath();
		}

		for(let j = 1; j<n; j++) {
			ctx.beginPath();
			ctx.moveTo(rect.x,       rect.y+rect.h/m*j);
			ctx.lineTo(rect.x+rect.w,rect.y+rect.h/m*j);
			ctx.stroke();
			ctx.closePath();
		}

		ctx.setLineDash([]);
	}
}

fondTierList(7,7,classement.style.axes);

function afficherGraphe() {
	ctx.clearRect(0,0,500,500);
	fondTierList(7,7,classement.style.axes);
	if(classement.style.axes) {
		ctx.font = 'bold 24px Arial'; ctx.fillStyle = 'white';
		ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
		ctx.fillText(classement.style.axe1,265,15);
		ctx.save();
		ctx.translate(15, 265);
		ctx.rotate(-Math.PI/2);
		ctx.textAlign = "center";
		ctx.fillText(classement.style.axe2,0,0);
		ctx.restore();
	}
	let dec = {x:250,y:250,w:250,h:250};
	if(classement.style.axes) { dec = {x:265, y:265, w:235, h:235}; }
	for(let i = 0; i<classement.points.length; i++) {
		let col = 0; if(classement.points[i].i == clicActif) { col = 2; }
		pointer(dec.x+dec.w*classement.points[i].x, dec.y+dec.h*classement.points[i].y, classement.points[i].sh, col, classement.style.typepoints);
	}
}

function dernierNom(n) { let m = n.split(" "); return m[m.length-1]; }

let donnees = []; let clicActif = -1;

function afficherPropositions() {
	let l = '<ul>';
	for(let i = 0; i<donnees.length; i++) {
		if(!donnees[i].utilise) {
			if(i == clicActif) { l += '<li class="click" onclick="selectionner('+String(i)+')">'+donnees[i].nom+'</li>'; }
			else { l += '<li onclick="selectionner('+String(i)+')">'+donnees[i].nom+'</li>'; }
		}
	}
	l += '</ul>';
	document.getElementById('propositions').innerHTML = l;
}

function ajt() {
	let val = document.getElementById('ajout').value;
	let court = prompt("Quel nom court donnez vous à \""+val+"\" ?",dernierNom(val));
	donnees.push({nom:val, court:court, utilise:false});
	afficherPropositions();
}

function selectionner(i) {
	clicActif = i;
	afficherPropositions();
}

function trouverClassementDe(numero) {
	let cl = -1;
	for(let i = 0; i<classement.points.length; i++) { if(classement.points[i].i == numero) { cl = i; break; } }
	return cl;
}

cv.addEventListener("mousedown", (event) => {
	if(classement.style.axes) { return ; }
	let [x,y] = [event.offsetX,event.offsetY];
	if(clicActif != -1) {
		if(!donnees[clicActif].utilise) {
			classement.points.push({x:(x-250)/250, y:(y-250)/250, t:donnees[clicActif].nom, sh:donnees[clicActif].court, i:clicActif});
		} else {
			let ix = trouverClassementDe(clicActif);
			classement.points[ix].x = (x-250)/250;
			classement.points[ix].y = (y-250)/250;
		}
		donnees[clicActif].utilise = true;
		clicActif = -1;
		afficherGraphe();
		afficherPropositions();
	} else {
		let index = -1;
		for(let i = 0; i<classement.points.length; i++) {
			let [px,py] = [classement.points[i].x*250+250,classement.points[i].y*250+250];
			if((x-px)*(x-px)+(y-py)*(y-py) <= 25) { index = i; }
		}
		if(index != -1) { clicActif = classement.points[index].i; }
	}
}, false);

cv.addEventListener("mousemove", (event) => {
	if(classement.style.axes) { return ; }
	if(clicActif != -1) {
		let [x,y] = [event.offsetX,event.offsetY];
		afficherGraphe();
		pointer(x,y,donnees[clicActif].nom,1,classement.style.typepoints);
	}
}, false);

function tele() {
	let lienVirtuel = document.createElement('a');
	lienVirtuel.setAttribute('download', 'TierList.png');
	lienVirtuel.setAttribute('href', cv.toDataURL("image/png").replace("image/png", "image/octet-stream"));
	lienVirtuel.click();
}