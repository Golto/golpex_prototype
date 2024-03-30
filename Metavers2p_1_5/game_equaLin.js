// Default canvas commands.
let cv = document.getElementById('equaLinUlysse');
cv.width = 820; cv.height = 430;
let ctx = cv.getContext('2d');

// Draws a rounded rectangle (starting on (x,y) and of size (w,h)) with border-radius s.
function roundedRectangle(x,y,w,h,s) {
	ctx.beginPath();
	ctx.moveTo(x+s,y);
	ctx.lineTo(x+w-s,y);
	ctx.arcTo(x+w,y,x+w,y+s,s);
	ctx.lineTo(x+w,y+h-s);
	ctx.arcTo(x+w,y+h,x+w-s,y+h,s);
	ctx.lineTo(x+s,y+h);
	ctx.arcTo(x,y+h,x,y+h-s,s);
	ctx.lineTo(x,y+s);
	ctx.arcTo(x,y,x+s,y,s);
	ctx.fill();
	ctx.closePath();
}

function UpArrow(bx,by,h) {
	ctx.fillStyle = '#b33';
	ctx.strokeStyle = '#800';
	ctx.lineWidth = 3;
	ctx.lineJoin = 'round';
	ctx.beginPath();
	ctx.moveTo(bx,by);
	ctx.lineTo(bx+h/2,by+h/2);
	ctx.lineTo(bx+h/2,by-h/2);
	ctx.lineTo(bx+h,by-h/2);
	ctx.lineTo(bx,by-1.5*h);
	ctx.lineTo(bx-h,by-h/2);
	ctx.lineTo(bx-h/2,by-h/2);
	ctx.lineTo(bx-h/2,by+h/2);
	ctx.lineTo(bx,by);
	ctx.fill(); ctx.stroke();
	ctx.closePath();
}

function DownArrow(bx,by,h) {
	ctx.fillStyle = '#b33';
	ctx.strokeStyle = '#800';
	ctx.lineWidth = 3;
	ctx.lineJoin = 'round';
	ctx.beginPath();
	ctx.moveTo(bx,by);
	ctx.lineTo(bx+h/2,by-h/2);
	ctx.lineTo(bx+h/2,by+h/2);
	ctx.lineTo(bx+h,by+h/2);
	ctx.lineTo(bx,by+1.5*h);
	ctx.lineTo(bx-h,by+h/2);
	ctx.lineTo(bx-h/2,by+h/2);
	ctx.lineTo(bx-h/2,by-h/2);
	ctx.lineTo(bx,by);
	ctx.fill(); ctx.stroke();
	ctx.closePath();
}

function LinearCounter(x,y,l,pos,val,peq,veq,tune) {
	ctx.strokeStyle = '#444'; ctx.lineWidth = 3; ctx.lineCap = 'round';
	ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+l,y); ctx.stroke(); ctx.closePath();
	for(let i = 0; i<pos.length; i++) {
		ctx.fillStyle = '#444'; ctx.beginPath(); ctx.moveTo(x+pos[i],y-10); ctx.lineTo(x+pos[i]-10,y); ctx.lineTo(x+pos[i],y+10); ctx.lineTo(x+pos[i]+10,y); ctx.fill(); ctx.closePath();
		if(val[i]>0) {
			for(let j = 0; j<val[i]; j++){ UpArrow(x+pos[i],y-j*30*tune-10,20*tune); }
		}
		if(val[i]<0) {
			for(let j = 0; j<-val[i]; j++){ DownArrow(x+pos[i],y+j*30*tune+10,20*tune); }
		}
	}
	if(veq>0){
		for(let i = 0; i<veq; i++) {
			ctx.fillStyle = '#bfe35e'; ctx.strokeStyle = '#84a52c';
			ctx.beginPath();
			ctx.rect(x+peq-20,y-8*(i+1),40,8);
			ctx.fill(); ctx.stroke();
			ctx.closePath();
		}
	}
	if(veq<0){
		for(let i = 0; i<-veq; i++) {
			ctx.fillStyle = '#bfe35e'; ctx.strokeStyle = '#84a52c';
			ctx.beginPath();
			ctx.rect(x+peq-20,y+8*i,40,8);
			ctx.fill(); ctx.stroke();
			ctx.closePath(); 
		}
	}
}

function hits(p,z) { return (p[0]>=z[0])&&(p[1]>=z[1])&&(p[0]<=z[0]+z[2])&&(p[1]<=z[1]+z[3]);}

cv.addEventListener("click", function(e){
	let mx = e.offsetX; let my = e.offsetY; let pm = [mx,my];
	if(objetJeu.actNiv[0] == 5) {return;}
	if(hits(pm,[760,170,30,30])) { envoyer(0,+1); }
	if(hits(pm,[760,240,30,30])) { envoyer(0,-1); }
	if(hits(pm,[760,300,30,30])) { envoyer(1,+1); }
	if(hits(pm,[760,370,30,30])) { envoyer(1,-1); }
	if(hits(pm,[750,20,50,30])) { passer(); }
	dessinerNiveau();
});

// Partie jeu du jeu.
const objetJeu = {actNiv:[0,0],
				  niveaux:[
					  {mat:[[1,1],[1,0]], vec:[3,5], n:2},
					  {mat:[[1,1],[1,-1]], vec:[-7,2], n:2},
					  {mat:[[2,1],[1,1]], vec:[1,4], n:2},
					  {mat:[[1,2],[2,3]], vec:[5,5], n:2},
					  {mat:[[3,4],[4,3]], vec:[6,-2], n:2}
				  ],
				  actSitu:{but:[1,0],actEtat:[0,0,0],correct:false}
				 };

function envoyer(n,s){
	let mat = objetJeu.niveaux[objetJeu.actNiv[0]].mat;
	let vec = objetJeu.niveaux[objetJeu.actNiv[0]].vec;
	objetJeu.actSitu.actEtat[0] += mat[n][0]*s;
	objetJeu.actSitu.actEtat[1] += mat[n][1]*s;
	objetJeu.actSitu.actEtat[2] += vec[n]*s;
	objetJeu.actSitu.correct = false;
	if(objetJeu.actNiv[1] == 0) { if(objetJeu.actSitu.actEtat[1] == 0 && objetJeu.actSitu.actEtat[0] != 0) { objetJeu.actSitu.correct = true; } }
	if(objetJeu.actNiv[1] == 1) { if(objetJeu.actSitu.actEtat[0] == 0 && objetJeu.actSitu.actEtat[1] != 0) { objetJeu.actSitu.correct = true; } }
}

function passer() {
	if(objetJeu.actSitu.correct) {
		objetJeu.actNiv[1]++;
		if(objetJeu.actNiv[1]>1) { objetJeu.actNiv[0]++; objetJeu.actNiv[1] = 0; }
		objetJeu.actSitu.actEtat = [0,0,0]; objetJeu.actSitu.correct = false;
		dessinerNiveau();
	}
}

function nook(x,y,s){
	ctx.fillStyle = '#a3957b';
	ctx.beginPath();
	ctx.moveTo(x-20*s, y);
	ctx.arcTo(x-20*s, y-44.72*s,   x+13.33*s, y-14.09*s,  20*s);
	ctx.arcTo(x+30*s, y,   x+60*s-13.33*s, y-14.09*s,  20*s);
	ctx.arcTo(x+80*s, y-44.72*s,   x+80*s, y,  20*s);
	ctx.arcTo(x+80*s, y+44.72*s,   x+60*s-13.33*s, y+14.09*s,  20*s);
	ctx.arcTo(x+30*s, y,   x+13.33*s, y+14.09*s,  20*s);
	ctx.arcTo(x-20*s, y+44.72*s,   x-20*s, y,  20*s);
	ctx.fill();
	ctx.closePath();
}

function dessinerNiveau () {
	ctx.clearRect(0,0,cv.width,cv.height);

	// Banderole en marron.
	ctx.fillStyle = '#cbbca0';
	roundedRectangle(10,10,800,50,10);
	ctx.fillStyle = '#a3957b';
	roundedRectangle(10,10,170,50,10);
	ctx.fillStyle = 'black';
	ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = 'bold 34px Arial';
	ctx.fillText("Progress",20,35);

	// Fond de la zone de jeu (gris).
	ctx.fillStyle = '#ccc';
	roundedRectangle(13,63,800,360,10);
	ctx.fillStyle = '#eee';
	roundedRectangle(10,60,800,360,10);

	if(objetJeu.actNiv[0] == 5) {
		ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = 'bold 28px Arial'; ctx.fillStyle = '#555';
		ctx.fillText("DONE!",700,35);
		return;
	}

	// Zone d'explications (mauve).
	ctx.fillStyle = '#cfb3e6';
	roundedRectangle(20,70,780,80,10);
	ctx.fillStyle = 'black';
	ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = 'bold 38px Arial';
	ctx.fillText("Goal :",30,110);
	let estP = objetJeu.actNiv[1]==0; let aTr = (estP?0:40); let cTr = (estP?0:-40);
	ctx.fillStyle = '#b33';
	ctx.beginPath();
	ctx.moveTo(170+aTr,80); ctx.lineTo(180+aTr,90); ctx.lineTo(175+aTr,90); ctx.lineTo(175+aTr,130);
	ctx.lineTo(180+aTr,130); ctx.lineTo(170+aTr,140); ctx.lineTo(160+aTr,130); ctx.lineTo(165+aTr,130);
	ctx.lineTo(165+aTr,90); ctx.lineTo(160+aTr,90); ctx.lineTo(170+aTr,80); ctx.fill(); ctx.closePath();
	ctx.fillStyle = '#bfe35e'; ctx.fillRect(280,90,30,40);
	ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
	ctx.beginPath(); ctx.arc(210+cTr,110,10,0,2*Math.PI); ctx.stroke(); ctx.closePath();
	ctx.beginPath(); ctx.moveTo(150,110); ctx.lineTo(320,110); ctx.stroke(); ctx.closePath();
	ctx.font = 'bold 24px Arial'; ctx.fillStyle = '#333';
	if(estP) { ctx.fillText("Arrows on the first ⬥ slot,", 360, 95); ctx.fillText("nothing on the second ⬥ slot.", 360, 125); }
	if(!estP) { ctx.fillText("Nothing on the first ⬥ slot,", 360, 95); ctx.fillText("arrows on the second ⬥ slot.", 360, 125); }

	// Les plateaux (endroits où s'affichent les lignes à flèches).
	ctx.fillStyle = '#999';
	roundedRectangle(20,160,390,250,11);
	roundedRectangle(420,160,380,120,11);
	roundedRectangle(420,290,380,120,11);
	ctx.fillStyle = '#ccc';
	roundedRectangle(20+3,160+3,390-3,250-3,10);
	roundedRectangle(420+3,160+3,380-3,120-3,10);
	roundedRectangle(420+3,290+3,380-3,120-3,10);

	// Les formes et cercles qui indiquent le progrès en haut.
	for(let i = 0; i<objetJeu.niveaux.length; i++) { nook(220+100*i,35,0.8); }
	let mx = objetJeu.actNiv[0]+((objetJeu.actNiv[1]>0)?1:0);
	ctx.fillStyle = '#726a5c';
	for(let i = 0; i<mx; i++){
		ctx.beginPath(); ctx.arc(220+100*i,35,10,0,2*Math.PI); ctx.fill(); ctx.closePath();
		if(i < mx-1 || objetJeu.actNiv[1] == 0) { ctx.beginPath(); ctx.arc(220+100*i+48,35,10,0,2*Math.PI); ctx.fill(); ctx.closePath(); }
	}

	let nombs = objetJeu.actSitu.actEtat;
	let mat = objetJeu.niveaux[objetJeu.actNiv[0]].mat;
	let vec = objetJeu.niveaux[objetJeu.actNiv[0]].vec;

	// Les 3 "lignes à flèches".
	let sc = Math.min(1,1.5/Math.max(1,mat[0][0],mat[0][1],mat[1][0],mat[1][1]));
	let sc2 = Math.min(1,2/Math.max(1,mat[0][0],mat[0][1],mat[1][0],mat[1][1]));
	LinearCounter(30,290,320,[40,120],[nombs[0],nombs[1]],280,nombs[2],sc2);
	LinearCounter(440,220,320,[40,120],mat[0],280,vec[0],sc);
	LinearCounter(440,360,320,[40,120],mat[1],280,vec[1],sc);

	// Les boutons [+] ou [-].
	ctx.fillStyle = '#d77878';
	roundedRectangle(760,170,30,30,5);
	roundedRectangle(760,300,30,30,5);
	ctx.fillStyle = '#787dd7';
	roundedRectangle(760,240,30,30,5);
	roundedRectangle(760,370,30,30,5);
	ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.font = 'bold 28px Arial'; ctx.fillStyle = 'white';
	ctx.fillText("+",775,188); ctx.fillText("+",775,318);
	ctx.fillText("-",775,255); ctx.fillText("-",775,385);

	// Dessin de la flèche pour passer au niveau suivant.
	if(objetJeu.actSitu.correct) {
		ctx.fillStyle = 'seagreen';
		roundedRectangle(750,20,50,30,5);
		ctx.fillStyle = 'white';
		ctx.beginPath(); 
		ctx.moveTo(760,30); ctx.lineTo(780,30);
		ctx.lineTo(780,25); ctx.lineTo(790,35);
		ctx.lineTo(780,45); ctx.lineTo(780,40);
		ctx.lineTo(760,40); ctx.lineTo(760,30);
		ctx.fill(); ctx.closePath();
	}
}

dessinerNiveau();