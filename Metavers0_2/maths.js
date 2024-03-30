function distance(entity1,entity2){
	X = entity2.position.x-entity1.position.x;
	Y = entity2.position.y-entity1.position.y;
	Z = entity2.position.z-entity1.position.z;
	dist = Math.sqrt( X * X + Y * Y + Z * Z );
	return(dist);
}