function distance(entity1,entity2){
	X = entity2.position.x-entity1.position.x;
	Y = entity2.position.y-entity1.position.y;
	Z = entity2.position.z-entity1.position.z;
	dist = Math.sqrt( X * X + Y * Y + Z * Z );
	return(dist);
}

function distance1(pos1,pos2){
	X = pos2.x-pos1.x;
	Y = pos2.y-pos1.y;
	Z = pos2.z-pos1.z;
	dist = Math.sqrt( X * X + Y * Y + Z * Z );
	return(dist);
}

function distance2(pos1,pos2){
	X = pos2[0]-pos1[0];
	Y = pos2[1]-pos1[1];
	Z = pos2[2]-pos1[2];
	dist = Math.sqrt( X * X + Y * Y + Z * Z );
	return(dist);
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}