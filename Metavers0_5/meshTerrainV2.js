

function airGenerator(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;
	const map = {};

	for (let x = -chksize/2 - 1; x <= chksize/2 + 1; x++) {
	for (let y = -chksize/2 - 1; y <= chksize/2 + 1; y++) {
	for (let z = -chksize/2 - 1; z <= chksize/2 + 1; z++) {
		//-chksize/2 - 1 et chksize/2 + 1 pour connaître l'état des bords

		map[[x,y,z]] = 0;
	}}}
	return(map)
}


function ongroundGenerator(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;
	const map = {};

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;

	for (let x = -chksize/2 - 1; x <= chksize/2 + 1; x++) {
	for (let y = -chksize/2 - 1; y <= chksize/2 + 1; y++) {
	for (let z = -chksize/2 - 1; z <= chksize/2 + 1; z++) {
		//-chksize/2 - 1 et chksize/2 + 1 pour connaître l'état des bords

		const X = Xstart + x;
		const Y = Ystart + y;
		const Z = Zstart + z;

		const pn2 = (chksize/3*noise.perlin2(X/30,Z/30) >= y) ? 1 : 0;
		map[[x,y,z]] = pn2;
	}}}
	return(map)
}


function undergroundGenerator(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;
	const map = {};

	const Xstart = chunk_coordinates[0] * chksize;
	const Ystart = chunk_coordinates[1] * chksize;
	const Zstart = chunk_coordinates[2] * chksize;

	for (let x = -chksize/2 - 1; x <= chksize/2 + 1; x++) {
	for (let y = -chksize/2 - 1; y <= chksize/2 + 1; y++) {
	for (let z = -chksize/2 - 1; z <= chksize/2 + 1; z++) {
		//-chksize/2 - 1 et chksize/2 + 1 pour connaître l'état des bords

		const X = Xstart + x;
		const Y = Ystart + y;
		const Z = Zstart + z;

		const pn3 = (noise.perlin3(X/50,Y/50,Z/50) >= 0) ? 1 : 0;
		map[[x,y,z]] = pn3;
	}}}
	return(map)
}

function mapAND(map1,map2){
	const chksize = Chunk.data.chunkSize;
	const map = {};

	for (let x = -chksize/2 - 1; x <= chksize/2 + 1; x++) {
	for (let y = -chksize/2 - 1; y <= chksize/2 + 1; y++) {
	for (let z = -chksize/2 - 1; z <= chksize/2 + 1; z++) {
		//-chksize/2 - 1 et chksize/2 + 1 pour connaître l'état des bords

		map[[x,y,z]] = map1[[x,y,z]] && map2[[x,y,z]];
	}}}
	return(map)
}




function detectSurface(map){

	const chksize = Chunk.data.chunkSize;

	const newMap = {};

	for (let x = -chksize/2; x <= chksize/2; x++) {
	for (let y = -chksize/2; y <= chksize/2; y++) {
	for (let z = -chksize/2; z <= chksize/2; z++) {
		if(map[[x,y,z]]){
			if(!map[[x-1,y,z]] || !map[[x+1,y,z]] || !map[[x,y-1,z]] || !map[[x,y+1,z]] || !map[[x,y,z-1]] || !map[[x,y,z+1]]  ){
				newMap[[x,y,z]] = 1;
			}else{
				newMap[[x,y,z]] = 0;
			}
		}else{
			newMap[[x,y,z]] = 0;
		}
		
	}}}
	return(newMap)
}


function adjacentPoints(x,y,z,surface){
	const P = [];

	for (let xi = -1; xi <= 1; xi++) {
	for (let yi = -1; yi <= 1; yi++) {
	for (let zi = -1; zi <= 1; zi++) {
		if(xi !== 0 || yi !== 0 || zi !== 0){
			if(surface[[x+xi,y+yi,z+zi]]){
				P.push([x+xi,y+yi,z+zi].toString())
			}
		}
		
	}}}

	return(P)
}



const _map = undergroundGenerator([0,4,0])
const _mapsurf = detectSurface(_map)



function possibleSquare(adjPoints,x,y,z,xi,yi,zi,xj,yj,zj,xk,yk,zk){

	const L = [];

	const a = [x,y,z]
	const b = [x+xi,y+yi,z+zi] 	// xi=0 yi=0 zi=1
	const c = [x+xj,y+yj,z+zj]	// xj=0 yj=1 zj=0
	const d = [x+xk,y+yk,z+zk]	// xk=0 yk=1 zk=1

	if(	adjPoints.indexOf(b.toString()) !== -1 &&
		adjPoints.indexOf(c.toString()) !== -1 &&
		adjPoints.indexOf(d.toString()) !== -1){
				
		L.push([ a, b, c ]);
		L.push([ d, c, b ]); // Rajouter un test pour inverser l'orientation des triangles

	}else if(	adjPoints.indexOf(b.toString()) !== -1 &&
				adjPoints.indexOf(c.toString()) !== -1){
				
		L.push([ a, b, c ]);
	}
	return(L)
}

function allPossibleSquare(adjPoints,x,y,z){
/*
	//Choix 1 	Choix 2 	Choix 3
	[0,0,1];	
				[1,-1,0];
							[1,-1,1];
							[1,0,1];
				[1,0,0];
							[1,-1,1];
							[1,0,1];
							[1,1,1];
				[1,1,0];
							[1,0,1];
							[1,1,1];
	[0,1,0];
				[1,0,-1];
							[1,0,1];	?
							[1,1,1];	?
							[0,1,1];	?
				[1,0,0];
							[1,1,-1]	?
							[1,1,0]		?
							[1,1,1]		?
				[1,0,1];
							[1,0,0]		?
							[1,1,0]		?
							[1,1,1]		?
				[0,0,1];
							[0,1,1]		?
							[1,1,0]		?
							[1,1,1]		?
	[1,0,0];
				[0,-1,1];
							[1,-1,1];	?
							[1,0,1];	?
				[0,0,1];
							[1,-1,1]; 	doublon
							[1,0,1];  	doublon
							[1,1,1];	doublon
				[0,1,1];
							[1,0,1];	?
							[1,1,1];	?
*/
	const L = [];

	L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,-1,0, 1,-1,1) )
	L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,-1,0, 1,0,1) )

	L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,0,0, 1,-1,1) )
	L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,0,0, 1,0,1) )
	L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,0,0, 1,1,1) )

	L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,1,0, 1,0,1) )
	L.push( possibleSquare(adjPoints,x,y,z, 0,0,1, 1,1,0, 1,1,1) )



	L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,-1, 1,0,1) )
	L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,-1, 1,1,1) )
	L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,-1, 0,1,1) )

	L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,0, 1,1,-1) )
	L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,0, 1,1,0) )
	L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,0, 1,1,1) )

	L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,1, 1,0,0) )
	L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,1, 1,1,0) )
	L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 1,0,1, 1,1,1) )

	L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 0,0,1, 0,1,1) )
	L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 0,0,1, 1,1,0) )
	L.push( possibleSquare(adjPoints,x,y,z, 0,1,0, 0,0,1, 1,1,1) )



	L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,-1,1, 1,-1,1) )
	L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,-1,1, 1,0,1) )

	//L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,0,1, 1,-1,1) )
	//L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,0,1, 1,0,1) )
	//L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,0,1, 1,1,1) )

	L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,1,1, 1,0,1) )
	L.push( possibleSquare(adjPoints,x,y,z, 1,0,0, 0,1,1, 1,1,1) )

	return(L)
}


function surfaceGenerator(surface){

	const tri = [];

	const chksize = Chunk.data.chunkSize;

	for (let x = -chksize/2; x <= chksize/2; x++) {
	for (let y = -chksize/2; y <= chksize/2; y++) {
	for (let z = -chksize/2; z <= chksize/2; z++) {
		if(surface[[x,y,z]]){
			const adjPoints = adjacentPoints(x,y,z,surface);
			/*
			//V1
			console.log("connect",x,y,z)

			if(adjPoints.indexOf([x,y+1,z].toString()) !== -1 ){
				console.log(x,y+1,z," avec ",x,y,z)
			}
			*/




			/*
			//V2
			if(adjPoints.indexOf([x,y+1,z].toString()) !== -1 &&
				adjPoints.indexOf([x,y,z+1].toString()) !== -1 &&
				adjPoints.indexOf([x,y+1,z+1].toString()) !== -1){
				
				tri.push([ [x,y,z], [x,y,z+1], [x,y+1,z] ])
				tri.push([ [x,y+1,z+1], [x,y+1,z], [x,y,z+1] ])
			}

			if(adjPoints.indexOf([x+1,y,z].toString()) !== -1 &&
				adjPoints.indexOf([x,y,z+1].toString()) !== -1 &&
				adjPoints.indexOf([x+1,y,z+1].toString()) !== -1){
				
				tri.push([ [x,y,z], [x,y,z+1], [x+1,y,z] ])
				tri.push([ [x+1,y,z+1], [x+1,y,z], [x,y,z+1] ])
			}


			if(adjPoints.indexOf([x+1,y+1,z].toString()) !== -1 &&
				adjPoints.indexOf([x,y,z+1].toString()) !== -1 &&
				adjPoints.indexOf([x+1,y+1,z+1].toString()) !== -1){
				
				tri.push([ [x,y,z], [x,y,z+1], [x+1,y+1,z] ])
				tri.push([ [x+1,y+1,z+1], [x+1,y+1,z], [x,y,z+1] ])
			}


			if(adjPoints.indexOf([x,y+1,z].toString()) !== -1 &&
				adjPoints.indexOf([x-1,y,z+1].toString()) !== -1 &&
				adjPoints.indexOf([x,y+1,z+1].toString()) !== -1){
				
				tri.push([ [x,y,z], [x-1,y,z+1], [x,y+1,z] ])
				tri.push([ [x,y+1,z+1], [x,y+1,z], [x-1,y,z+1] ])
			}

		
			if(adjPoints.indexOf([x,y+1,z].toString()) !== -1 &&
				adjPoints.indexOf([x,y,z+1].toString()) !== -1 &&
				adjPoints.indexOf([x+1,y+1,z+1].toString()) !== -1){
				
				tri.push([ [x,y,z], [x,y,z+1], [x,y+1,z] ])
				tri.push([ [x+1,y+1,z+1], [x,y+1,z], [x,y,z+1] ])
			}


			if(adjPoints.indexOf([x+1,y+1,z].toString()) !== -1 &&
				adjPoints.indexOf([x+1,y,z+1].toString()) !== -1){
				
				tri.push([ [x,y,z], [x+1,y,z+1], [x+1,y+1,z] ])
			}*/

			/*
			let possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,0,1,0,0,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+1x
			possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,0,1,0,0,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,1,1,0,0,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,0,1,0,1,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+2x
			possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,1,1,0,0,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,0,1,0,1,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,1,1,0,1,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+3x
			possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,1,1,0,1,1,1);
			for(let e of possSquare){
				tri.push(e);
			}



			possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,1,0,0,1,0,1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+1y
			possSquare = possibleSquare(adjPoints,x,y,z,0,1,1,1,0,0,1,0,1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,1,1,0,1,0,1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,1,0,0,1,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+2y
			possSquare = possibleSquare(adjPoints,x,y,z,0,1,1,1,1,0,1,0,1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,1,1,1,0,0,1,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,0,1,1,1,0,1,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+3y
			possSquare = possibleSquare(adjPoints,x,y,z,0,1,1,1,1,0,1,1,1);
			for(let e of possSquare){
				tri.push(e);
			}



			possSquare = possibleSquare(adjPoints,x,y,z,1,0,0,0,1,0,1,1,0);
			for(let e of possSquare){
				tri.push(e);
			}
			//+1z
			possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,0,1,0,1,1,0);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,1,0,0,0,1,1,1,1,0);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,1,0,0,0,1,0,1,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+2z
			possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,0,1,1,1,1,0);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,0,1,0,1,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,1,0,0,0,1,1,1,1,1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+3z
			possSquare = possibleSquare(adjPoints,x,y,z,1,0,1,0,1,1,1,1,1);
			for(let e of possSquare){
				tri.push(e);
			}







			possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,0,-1,0,0,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+1x
			possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,0,-1,0,0,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,-1,-1,0,0,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,0,-1,0,-1,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+2x
			possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,-1,-1,0,0,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,0,-1,0,-1,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,-1,-1,0,-1,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+3x
			possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,-1,-1,0,-1,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}



			possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,-1,0,0,-1,0,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+1y
			possSquare = possibleSquare(adjPoints,x,y,z,0,-1,-1,-1,0,0,-1,0,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,-1,-1,0,-1,0,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,-1,0,0,-1,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+2y
			possSquare = possibleSquare(adjPoints,x,y,z,0,-1,-1,-1,-1,0,-1,0,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,-1,-1,-1,0,0,-1,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,0,0,-1,-1,-1,0,-1,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+3y
			possSquare = possibleSquare(adjPoints,x,y,z,0,-1,-1,-1,-1,0,-1,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}



			possSquare = possibleSquare(adjPoints,x,y,z,-1,0,0,0,-1,0,-1,-1,0);
			for(let e of possSquare){
				tri.push(e);
			}
			//+1z
			possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,0,-1,0,-1,-1,0);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,-1,0,0,0,-1,-1,-1,-1,0);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,-1,0,0,0,-1,0,-1,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+2z
			possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,0,-1,-1,-1,-1,0);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,0,-1,0,-1,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			possSquare = possibleSquare(adjPoints,x,y,z,-1,0,0,0,-1,-1,-1,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}
			//+3z
			possSquare = possibleSquare(adjPoints,x,y,z,-1,0,-1,0,-1,-1,-1,-1,-1);
			for(let e of possSquare){
				tri.push(e);
			}









			possSquare = possibleSquare(adjPoints,x,y,z,1,-1,0,0,0,1,1,-1,1);
			for(let e of possSquare){
				tri.push(e);
			}*/
			const aPS = allPossibleSquare(adjPoints,x,y,z);
			for(let e0 of aPS){
			for(let e1 of e0){
				tri.push(e1);
			}}

			
		
		}
	}}}
	return(tri)
}

//const surfGen = surfaceGenerator(_mapsurf);
//console.log(surfGen)

function arrayToFloats(array){
	const L = [];
	for(let e0 of array){
	for(let e1 of e0){
	for(let e2 of e1){
		L.push(e2)
	}}}
	return(L)
}

//const fsurfGen = arrayToFloats(surfGen);
//console.log(fsurfGen)
















function genMesh(chunk_coordinates){

	const chksize = Chunk.data.chunkSize;

	//const map = undergroundGenerator(chunk_coordinates)
	

	let map;
	if(chunk_coordinates[1] < 4){
		map = undergroundGenerator(chunk_coordinates);
	}else if(chunk_coordinates[1] === 4){
		const map1 = undergroundGenerator(chunk_coordinates);
		const map2 = ongroundGenerator(chunk_coordinates);
		map = mapAND(map1,map2);
	}else{
		map = airGenerator(chunk_coordinates);
	}

	const surfaceMap = detectSurface(map);
	const tris = surfaceGenerator(surfaceMap);

	const trisfloat = arrayToFloats(tris);

	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array( trisfloat );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

	geometry.computeVertexNormals();
	geometry.normalizeNormals();

	const material = new THREE.MeshPhongMaterial( {side : THREE.DoubleSide} );//

	material.shadowSide = THREE.BackSide;
	//évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
	

	const mesh = new THREE.Mesh( geometry, material );
	//console.log(mesh.geometry.attributes.position)

	mesh.position.set(
		chunk_coordinates[0]*chksize,
		chunk_coordinates[1]*chksize,
		chunk_coordinates[2]*chksize,
		);

	mesh.castShadow = true;
	mesh.receiveShadow = true;

	mesh.material.color = {
		r: 0.8,
		g: 0.5+0.1*chunk_coordinates[1],
		b: 0.0,
	};

	//scene.add(mesh);
	put_in_chunk(mesh);
}


//genMesh([0,4,0])
/*
for (let x = 1; x <= 3; x++) {
for (let y = 0; y <= 12; y++) {
for (let z = 1; z <= 3; z++) {
	new_chunk([x,y,z])
	genMesh([x,y,z])
	//collision_on_chunk([x,y,z]);
}}}
*/




