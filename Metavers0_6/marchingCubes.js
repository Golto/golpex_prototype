
	
	
const trianglesEdgesIndex = [
	[],
	[ 0, 8, 3,],
	[ 0, 1, 9,],
	[ 1, 8, 3, 9, 8, 1, ],
	[ 1, 2, 10,],
	[ 0, 8, 3, 1, 2, 10, ],
	[ 9, 2, 10, 0, 2, 9, ],
	[ 2, 8, 3, 2, 10, 8, 10, 9, 8,],
	[ 3, 11, 2,],
	[ 0, 11, 2, 8, 11, 0, ],
	[ 1, 9, 0, 2, 3, 11, ],
	[ 1, 11, 2, 1, 9, 11, 9, 8, 11,],
	[ 3, 10, 1, 11, 10, 3, ],
	[ 0, 10, 1, 0, 8, 10, 8, 11, 10,],
	[ 3, 9, 0, 3, 11, 9, 11, 10, 9,],
	[ 9, 8, 10, 10, 8, 11, ],
	[ 4, 7, 8,],
	[ 4, 3, 0, 7, 3, 4, ],
	[ 0, 1, 9, 8, 4, 7, ],
	[ 4, 1, 9, 4, 7, 1, 7, 3, 1,],
	[ 1, 2, 10, 8, 4, 7, ],
	[ 3, 4, 7, 3, 0, 4, 1, 2, 10,],
	[ 9, 2, 10, 9, 0, 2, 8, 4, 7,],
	[ 2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, ],
	[ 8, 4, 7, 3, 11, 2, ],
	[ 11, 4, 7, 11, 2, 4, 2, 0, 4,],
	[ 9, 0, 1, 8, 4, 7, 2, 3, 11,],
	[ 4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, ],
	[ 3, 10, 1, 3, 11, 10, 7, 8, 4,],
	[ 1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, ],
	[ 4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, ],
	[ 4, 7, 11, 4, 11, 9, 9, 11, 10,],
	[ 9, 5, 4,],
	[ 9, 5, 4, 0, 8, 3, ],
	[ 0, 5, 4, 1, 5, 0, ],
	[ 8, 5, 4, 8, 3, 5, 3, 1, 5,],
	[ 1, 2, 10, 9, 5, 4, ],
	[ 3, 0, 8, 1, 2, 10, 4, 9, 5,],
	[ 5, 2, 10, 5, 4, 2, 4, 0, 2,],
	[ 2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, ],
	[ 9, 5, 4, 2, 3, 11, ],
	[ 0, 11, 2, 0, 8, 11, 4, 9, 5,],
	[ 0, 5, 4, 0, 1, 5, 2, 3, 11,],
	[ 2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, ],
	[ 10, 3, 11, 10, 1, 3, 9, 5, 4,],
	[ 4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, ],
	[ 5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, ],
	[ 5, 4, 8, 5, 8, 10, 10, 8, 11,],
	[ 9, 7, 8, 5, 7, 9, ],
	[ 9, 3, 0, 9, 5, 3, 5, 7, 3,],
	[ 0, 7, 8, 0, 1, 7, 1, 5, 7,],
	[ 1, 5, 3, 3, 5, 7, ],
	[ 9, 7, 8, 9, 5, 7, 10, 1, 2,],
	[ 10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, ],
	[ 8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, ],
	[ 2, 10, 5, 2, 5, 3, 3, 5, 7,],
	[ 7, 9, 5, 7, 8, 9, 3, 11, 2,],
	[ 9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, ],
	[ 2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, ],
	[ 11, 2, 1, 11, 1, 7, 7, 1, 5,],
	[ 9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, ],
	[ 5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0,],
	[ 11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0,],
	[ 11, 10, 5, 7, 11, 5, ],
	[ 10, 6, 5,],
	[ 0, 8, 3, 5, 10, 6, ],
	[ 9, 0, 1, 5, 10, 6, ],
	[ 1, 8, 3, 1, 9, 8, 5, 10, 6,],
	[ 1, 6, 5, 2, 6, 1, ],
	[ 1, 6, 5, 1, 2, 6, 3, 0, 8,],
	[ 9, 6, 5, 9, 0, 6, 0, 2, 6,],
	[ 5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, ],
	[ 2, 3, 11, 10, 6, 5, ],
	[ 11, 0, 8, 11, 2, 0, 10, 6, 5,],
	[ 0, 1, 9, 2, 3, 11, 5, 10, 6,],
	[ 5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, ],
	[ 6, 3, 11, 6, 5, 3, 5, 1, 3,],
	[ 0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, ],
	[ 3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, ],
	[ 6, 5, 9, 6, 9, 11, 11, 9, 8,],
	[ 5, 10, 6, 4, 7, 8, ],
	[ 4, 3, 0, 4, 7, 3, 6, 5, 10,],
	[ 1, 9, 0, 5, 10, 6, 8, 4, 7,],
	[ 10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, ],
	[ 6, 1, 2, 6, 5, 1, 4, 7, 8,],
	[ 1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, ],
	[ 8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, ],
	[ 7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9,],
	[ 3, 11, 2, 7, 8, 4, 10, 6, 5,],
	[ 5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, ],
	[ 0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, ],
	[ 9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6,],
	[ 8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, ],
	[ 5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11,],
	[ 0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7,],
	[ 6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, ],
	[ 10, 4, 9, 6, 4, 10, ],
	[ 4, 10, 6, 4, 9, 10, 0, 8, 3,],
	[ 10, 0, 1, 10, 6, 0, 6, 4, 0,],
	[ 8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, ],
	[ 1, 4, 9, 1, 2, 4, 2, 6, 4,],
	[ 3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, ],
	[ 0, 2, 4, 4, 2, 6, ],
	[ 8, 3, 2, 8, 2, 4, 4, 2, 6,],
	[ 10, 4, 9, 10, 6, 4, 11, 2, 3,],
	[ 0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, ],
	[ 3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, ],
	[ 6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1,],
	[ 9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, ],
	[ 8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1,],
	[ 3, 11, 6, 3, 6, 0, 0, 6, 4,],
	[ 6, 4, 8, 11, 6, 8, ],
	[ 7, 10, 6, 7, 8, 10, 8, 9, 10,],
	[ 0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, ],
	[ 10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, ],
	[ 10, 6, 7, 10, 7, 1, 1, 7, 3,],
	[ 1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, ],
	[ 2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9,],
	[ 7, 8, 0, 7, 0, 6, 6, 0, 2,],
	[ 7, 3, 2, 6, 7, 2, ],
	[ 2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, ],
	[ 2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7,],
	[ 1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11,],
	[ 11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, ],
	[ 8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6,],
	[ 0, 9, 1, 11, 6, 7, ],
	[ 7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, ],
	[ 7, 11, 6,],
	[ 7, 6, 11,],
	[ 3, 0, 8, 11, 7, 6, ],
	[ 0, 1, 9, 11, 7, 6, ],
	[ 8, 1, 9, 8, 3, 1, 11, 7, 6,],
	[ 10, 1, 2, 6, 11, 7, ],
	[ 1, 2, 10, 3, 0, 8, 6, 11, 7,],
	[ 2, 9, 0, 2, 10, 9, 6, 11, 7,],
	[ 6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, ],
	[ 7, 2, 3, 6, 2, 7, ],
	[ 7, 0, 8, 7, 6, 0, 6, 2, 0,],
	[ 2, 7, 6, 2, 3, 7, 0, 1, 9,],
	[ 1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, ],
	[ 10, 7, 6, 10, 1, 7, 1, 3, 7,],
	[ 10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, ],
	[ 0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, ],
	[ 7, 6, 10, 7, 10, 8, 8, 10, 9,],
	[ 6, 8, 4, 11, 8, 6, ],
	[ 3, 6, 11, 3, 0, 6, 0, 4, 6,],
	[ 8, 6, 11, 8, 4, 6, 9, 0, 1,],
	[ 9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, ],
	[ 6, 8, 4, 6, 11, 8, 2, 10, 1,],
	[ 1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, ],
	[ 4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, ],
	[ 10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3,],
	[ 8, 2, 3, 8, 4, 2, 4, 6, 2,],
	[ 0, 4, 2, 4, 6, 2, ],
	[ 1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, ],
	[ 1, 9, 4, 1, 4, 2, 2, 4, 6,],
	[ 8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, ],
	[ 10, 1, 0, 10, 0, 6, 6, 0, 4,],
	[ 4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3,],
	[ 10, 9, 4, 6, 10, 4, ],
	[ 4, 9, 5, 7, 6, 11, ],
	[ 0, 8, 3, 4, 9, 5, 11, 7, 6,],
	[ 5, 0, 1, 5, 4, 0, 7, 6, 11,],
	[ 11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, ],
	[ 9, 5, 4, 10, 1, 2, 7, 6, 11,],
	[ 6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, ],
	[ 7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, ],
	[ 3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6,],
	[ 7, 2, 3, 7, 6, 2, 5, 4, 9,],
	[ 9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, ],
	[ 3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, ],
	[ 6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8,],
	[ 9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, ],
	[ 1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4,],
	[ 4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10,],
	[ 7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, ],
	[ 6, 9, 5, 6, 11, 9, 11, 8, 9,],
	[ 3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, ],
	[ 0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, ],
	[ 6, 11, 3, 6, 3, 5, 5, 3, 1,],
	[ 1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, ],
	[ 0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10,],
	[ 11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5,],
	[ 6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, ],
	[ 5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, ],
	[ 9, 5, 6, 9, 6, 0, 0, 6, 2,],
	[ 1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8,],
	[ 1, 5, 6, 2, 1, 6, ],
	[ 1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6,],
	[ 10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, ],
	[ 0, 3, 8, 5, 6, 10, ],
	[ 10, 5, 6,],
	[ 11, 5, 10, 7, 5, 11, ],
	[ 11, 5, 10, 11, 7, 5, 8, 3, 0,],
	[ 5, 11, 7, 5, 10, 11, 1, 9, 0,],
	[ 10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, ],
	[ 11, 1, 2, 11, 7, 1, 7, 5, 1,],
	[ 0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, ],
	[ 9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, ],
	[ 7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2,],
	[ 2, 5, 10, 2, 3, 5, 3, 7, 5,],
	[ 8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, ],
	[ 9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, ],
	[ 9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2,],
	[ 1, 3, 5, 3, 7, 5, ],
	[ 0, 8, 7, 0, 7, 1, 1, 7, 5,],
	[ 9, 0, 3, 9, 3, 5, 5, 3, 7,],
	[ 9, 8, 7, 5, 9, 7, ],
	[ 5, 8, 4, 5, 10, 8, 10, 11, 8,],
	[ 5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, ],
	[ 0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, ],
	[ 10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4,],
	[ 2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, ],
	[ 0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11,],
	[ 0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5,],
	[ 9, 4, 5, 2, 11, 3, ],
	[ 2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, ],
	[ 5, 10, 2, 5, 2, 4, 4, 2, 0,],
	[ 3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9,],
	[ 5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, ],
	[ 8, 4, 5, 8, 5, 3, 3, 5, 1,],
	[ 0, 4, 5, 1, 0, 5, ],
	[ 8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, ],
	[ 9, 4, 5,],
	[ 4, 11, 7, 4, 9, 11, 9, 10, 11,],
	[ 0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, ],
	[ 1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, ],
	[ 3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4,],
	[ 4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, ],
	[ 9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3,],
	[ 11, 7, 4, 11, 4, 2, 2, 4, 0,],
	[ 11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, ],
	[ 2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, ],
	[ 9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7,],
	[ 3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10,],
	[ 1, 10, 2, 8, 7, 4, ],
	[ 4, 9, 1, 4, 1, 7, 7, 1, 3,],
	[ 4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, ],
	[ 4, 0, 3, 7, 4, 3, ],
	[ 4, 8, 7,],
	[ 9, 10, 8, 10, 11, 8, ],
	[ 3, 0, 9, 3, 9, 11, 11, 9, 10,],
	[ 0, 1, 10, 0, 10, 8, 8, 10, 11,],
	[ 3, 1, 10, 11, 3, 10, ],
	[ 1, 2, 11, 1, 11, 9, 9, 11, 8,],
	[ 3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, ],
	[ 0, 2, 11, 8, 0, 11, ],
	[ 3, 2, 11,],
	[ 2, 3, 8, 2, 8, 10, 10, 8, 9,],
	[ 9, 10, 2, 0, 9, 2, ],
	[ 2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, ],
	[ 1, 10, 2,],
	[ 1, 3, 8, 9, 1, 8, ],
	[ 0, 9, 1,],
	[ 0, 3, 8,],
	[]
]


const indexToVertex = [
	[ 0.5, 0.0, 0.0 ],
	[ 1.0, 0.0, 0.5 ],
	[ 0.5, 0.0, 1.0 ],
	[ 0.0, 0.0, 0.5 ],

	[ 0.5, 1.0, 0.0 ],
	[ 1.0, 1.0, 0.5 ],
	[ 0.5, 1.0, 1.0 ],
	[ 0.0, 1.0, 0.5 ],

	[ 0.0, 0.5, 0.0 ],
	[ 1.0, 0.5, 0.0 ],
	[ 1.0, 0.5, 1.0 ],
	[ 0.0, 0.5, 1.0 ],
]

function addVertex(A,B){
	const C = [
		A[0]+B[0],
		A[1]+B[1],
		A[2]+B[2],
	]
	return(C)
}
function scaleVertex(A,scale){
	const C = [
		A[0]*scale,
		A[1]*scale,
		A[2]*scale,
	]
	return(C)
}

const SIZE = 1;



function genCaveVertex(x0,y0,z0){

	const chksize = Chunk.data.chunkSize;

	const L  = [];

	for (let x = 0; x <= chksize/SIZE; x++) {
		L[x] = [];
	for (let y = 0; y <= chksize/SIZE; y++) {
		L[x][y] = [];
	for (let z = 0; z <= chksize/SIZE; z++) {

		const X = x*SIZE + x0;
		const Y = y*SIZE + y0;
		const Z = z*SIZE + z0;

		const n0 = noise.perlin3(X/100,Y/100,Z/100) * 10 + 30 ; //20, 40
		const n1 = noise.perlin3(X/n0,Y/n0,Z/n0);


		const n = (n1 >= -0.5 - Y/400 ) ? 1 : 0;
		L[x][y][z] = n;
	}}}
	return(L)
}

function genSurfaceVertex(x0,y0,z0){

	const chksize = Chunk.data.chunkSize;

	const L  = [];

	for (let x = 0; x <= chksize/SIZE; x++) {
		L[x] = [];
	for (let y = 0; y <= chksize/SIZE; y++) {
		L[x][y] = [];
	for (let z = 0; z <= chksize/SIZE; z++) {

		const X = x*SIZE + x0;
		const Y = y*SIZE + y0;
		const Z = z*SIZE + z0;

		const ny0 = noise.perlin2(X/1000,Z/1000) * 200 + 400; // 200, 400
		const ny1 = noise.perlin2(X/ny0,Z/ny0) * 30 + 70; // 40, 110
		const ny2 = noise.perlin2(X/ny1,Z/ny1) * (ny1-30); //-20, 20


		const n = (ny2 - Y >= 0.0) ? 1 : 0;
		L[x][y][z] = n;
	}}}
	return(L)
}

function andVertex(mapA,mapB){

	const map = [];

	for (let x in mapA) {
		map[x] = [];
	for (let y in mapA[x]) {
		map[x][y] = [];
	for (let z in mapA[x][y]) {
		map[x][y][z] = mapA[x][y][z] && mapB[x][y][z];
	}}}
	return(map)
}


//===============================================
//		gen all in one shot

function genVertex(x0,y0,z0){

	const chksize = Chunk.data.chunkSize;

	const L  = [];

	for (let x = 0; x <= chksize/SIZE; x++) {
		L[x] = [];
	for (let y = 0; y <= chksize/SIZE; y++) {
		L[x][y] = [];
	for (let z = 0; z <= chksize/SIZE; z++) {

		const X = x*SIZE + x0;
		const Y = y*SIZE + y0;
		const Z = z*SIZE + z0;

		//cave generator
		
		const n0 = noise.perlin3(X/100,Y/100,Z/100) * 10 + 30 ; //20, 40
		const n1 = noise.perlin3(X/n0,Y/n0,Z/n0);
		


		const nc = (n1 >= -0.5 - Y/400 ) ? 1 : 0;

		//surface generator
		const ny0 = noise.perlin2(X/1000,Z/1000) * 200 + 400; // 200, 400
		const ny1 = noise.perlin2(X/ny0,Z/ny0) * 30 + 70; // 40, 110
		//const ny2 = noise.perlin2(X/ny1,Z/ny1) * (ny1-30);
		
		const ny2 = noise.perlin2(X/150,Z/150)*40 + noise.perlin2(X/11,Z/11)*2;


		const ns = (ny2 - Y >= 0.0) ? 1 : 0;
		
		//boule test

		const nb0 = noise.perlin3(X/20,Y/20,Z/20);
		const nb = (  (nb0 >= -0.5) ? 1 : 0  ) && ((X+30)*(X+30)+(Y-75)*(Y-75)+(Z+50)*(Z+50) + noise.perlin3(X/20,Y/20,Z/20)*10*10 <= 50*50);
		//----------
		//L[x][y][z] = nc && ns;			//grottes et surface
		L[x][y][z] = nc && ns || nb;		//grottes et surface + lune
		//L[x][y][z] = nb;					//lune


	}}}
	return(L)
}









function visualizer(L,x0,y0,z0,l = 1,c0 = "#f00"){

	const chksize = Chunk.data.chunkSize;

	const cave = new THREE.Group();

	const geo = new THREE.BoxGeometry( l, l, l );

	for (let x in L) {
	for (let y in L[x]) {
	for (let z in L[x][y]) {

		if( L[x][y][z] ){
			const mat = new THREE.MeshPhongMaterial( {color : c0});
			const visualBox = new THREE.Mesh( geo, mat );

			visualBox.position.set(x-chksize/2, y-chksize/2, z-chksize/2);
			cave.add( visualBox );
		}/*else{
			const mat = new THREE.MeshPhongMaterial( {color : "#000"});
			const visualBox = new THREE.Mesh( geo, mat );

			visualBox.position.set(x,y,z);
			cave.add( visualBox );
		}*/
		
	}}}


	scene.add(cave);
	cave.position.set(x0,y0,z0);
}



function marchingCube(L,x,y,z){

	const c000 = L[x][y][z];
	const c001 = L[x][y][z+1];
	const c010 = L[x][y+1][z];
	const c011 = L[x][y+1][z+1];
	const c100 = L[x+1][y][z];
	const c101 = L[x+1][y][z+1];
	const c110 = L[x+1][y+1][z];
	const c111 = L[x+1][y+1][z+1];

	const tri = [];

	const index = c000 + c100 * 2 + c101 * 4 + c001 * 8 + c010 * 16 + c110 * 32 + c111 * 64 + c011 * 128;

	const tei = trianglesEdgesIndex[index];

	for( let i of tei ){
		//tri.push( indexToVertex[i] );
		//tri.push( addVertex( indexToVertex[i], [ x, y, z ] ) );scaleVertex
		tri.push( scaleVertex( addVertex( indexToVertex[i], [ x, y, z ] ), SIZE ) );
	}

	return tri

}


/*
function marchingCubeDELETE(L,x,y,z){

	const c000 = L[x][y][z];
	const c001 = L[x][y][z+1];
	const c010 = L[x][y+1][z];
	const c011 = L[x][y+1][z+1];
	const c100 = L[x+1][y][z];
	const c101 = L[x+1][y][z+1];
	const c110 = L[x+1][y+1][z];
	const c111 = L[x+1][y+1][z+1];






	if( !c010 && !c110   && !c011 && !c111 && 
		!c000 && !c100   && !c001 && !c101 ){
		
		//0 0 	0 0
		//0 0  	0 0
		//[[]]
		
		return [[]]
	}
	if( c010 && c110   && c011 && c111 && 
		c000 && c100   && c001 && c101 ){
		
		//1 1 	1 1
		//1 1 	1 1
		//[[]]
		
		return [[]]
	}




	if( !c010 && !c110   && !c011 && !c111 && 
		c000 && !c100   && !c001 && !c101 ){
		
		//0 0 	0 0
		//1 0 	0 0

		//p0 = [.5, .0, .0]
		//p1 = [.0, .5, .0]
		//p2 = [.0, .0, .5]
		

		const p0 = [.5+x, .0+y, .0+z];
		const p1 = [.0+x, .5+y, .0+z];
		const p2 = [.0+x, .0+y, .5+z];
		return [p0, p1, p2]
	}



	if( !c010 && !c110   && !c011 && !c111 && 
		c000 && c100   && !c001 && !c101 ){
		
		//0 0 	0 0
		//1 1 	0 0

		//p0 = [1., .0, .5];
		//p1 = [.0, .5, .0];
		//p2 = [.0, .0, .5];
		//p3 = [1., .5, .0];
		

		const p0 = [1.0+x, .0+y, .5+z];
		const p1 = [.0+x, .5+y, .0+z];
		const p2 = [.0+x, .0+y, .5+z];
		const p3 = [1.0+x, .5+y, .0+z];
		return [p0, p1, p2, p3, p1, p0]
	}


	if( !c010 && c110   && !c011 && !c111 && 
		c000 && !c100   && !c001 && !c101 ){
		
		//0 0 	0 0
		//1 1 	0 0

		//p0 = [.5, .0, .0];
		//p1 = [.0, .5, .0];
		//p2 = [.0, .0, .5];
		//p3 = [1., .5, .0];
		//p4 = [.5, 1., .0];
		//p5 = [.0, 1., .5];
		

		const p0 = [.5+x, .0+y, .0+z];
		const p1 = [.0+x, .5+y, .0+z];
		const p2 = [.0+x, .0+y, .5+z];
		const p3 = [1.+x, .5+y, .0+z];
		const p4 = [.5+x, 1.+y, .0+z];
		const p5 = [.0+x, 1.+y, .5+z];

		return [p0, p1, p2, p3, p4, p5]
	}

	else{ // temporaire
		return [[]]
	}
}
*/


function marchingChunk(chunkPosition,L){
	const chksize = Chunk.data.chunkSize;

	const x0 = chunkPosition[0] * chksize;
	const y0 = chunkPosition[1] * chksize;
	const z0 = chunkPosition[2] * chksize;

	const triangles = [];

	for (let x = 0; x < chksize/SIZE; x++) {
	for (let y = 0; y < chksize/SIZE; y++) {
	for (let z = 0; z < chksize/SIZE; z++) {

		triangles.push( marchingCube(L,x,y,z) );
	}}}

	return triangles

}


function arrayToFloats(array){
	const L = [];
	for(let e0 of array){
	for(let e1 of e0){
	for(let e2 of e1){
		L.push(e2)
	}}}
	return(L)
}

//OBSOLETE
 function genMesh(chunkPosition,callback=()=>{}){

	const chksize = Chunk.data.chunkSize;

	const x0 = chunkPosition[0] * chksize;
	const y0 = chunkPosition[1] * chksize;
	const z0 = chunkPosition[2] * chksize;

	//const map = undergroundGenerator(chunkPosition)
	
/*
	let map;
	if(chunkPosition[1] < 4){
		map = undergroundGenerator(chunkPosition);
	}else if(chunkPosition[1] === 4){
		const map1 = undergroundGenerator(chunkPosition);
		const map2 = ongroundGenerator(chunkPosition);
		map = mapAND(map1,map2);
	}else{
		map = airGenerator(chunkPosition);
	}

	const surfaceMap = detectSurface(map);
	const tris = surfaceGenerator(surfaceMap);*/

	//const __L = genCaveVertex(x0,y0,z0);
	//const __L =  andVertex( genCaveVertex(x0,y0,z0), genSurfaceVertex(x0,y0,z0) );
	const __L = genVertex(x0,y0,z0);


	const tris =  marchingChunk(chunkPosition,__L);

	const trisfloat =  arrayToFloats(tris);

	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array( trisfloat );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

	geometry.computeVertexNormals();
	geometry.normalizeNormals();

	const material = new THREE.MeshPhongMaterial(  );//{side : THREE.DoubleSide}

	material.shadowSide = THREE.BackSide;
	//évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets
	

	const mesh = new THREE.Mesh( geometry, material );
	//console.log(mesh.geometry.attributes.position)

	mesh.position.set(
		chunkPosition[0]*chksize - chksize/2,
		chunkPosition[1]*chksize - chksize/2,
		chunkPosition[2]*chksize - chksize/2,
		);

	mesh.castShadow = true;
	mesh.receiveShadow = true;

	mesh.material.color = {
		r: 0.8,
		g: 0.5+0.1*(chunkPosition[1]+5),
		b: 0.0,
	};

	put_in_chunk(mesh);
	//callback();
}


//const _L = genCaveVertex(0,20,10)

//visualizer(_L,0,20,10,.1,"#f00")


/*
const _n = marchingChunk([0,1,0],_L)
console.log(_n)*/

//genMesh([0,1,-5])

//------------------------------------------

class Terrain{
	static data = {
		collision : true,
		list : {},
		lenght : 0,
	}

	constructor(chunkPosition = undefined) {
		this.chunkPosition = chunkPosition;

		this.generation = Terrain.genVertex(this.chunkPosition);
		this.mesh = Terrain.genMesh(this.chunkPosition,this.generation);

		Terrain.data.list[this.chunkPosition] = this;
		Terrain.data.lenght += 1;
	}

	static genVertex(chunkPosition){
		const chksize = Chunk.data.chunkSize;

		const x0 = chunkPosition[0] * chksize;
		const y0 = chunkPosition[1] * chksize;
		const z0 = chunkPosition[2] * chksize;

		return genVertex(x0,y0,z0);
	}

	static genMesh(chunkPosition,generation){

		const chksize = Chunk.data.chunkSize;

		const x0 = chunkPosition[0] * chksize;
		const y0 = chunkPosition[1] * chksize;
		const z0 = chunkPosition[2] * chksize;

		const trianglesArray = marchingChunk(chunkPosition,generation);

		const triangles = arrayToFloats(trianglesArray);

		const geometry = new THREE.BufferGeometry();
		const vertices = new Float32Array( triangles );
		geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

		geometry.computeVertexNormals();
		geometry.normalizeNormals();

		let material;
		
		if (chunkPosition[1] >= 1) {
			material = materials.phong;
		}else if(chunkPosition[1] >= 0){
			material = materials.phongs.herbe;
			//material = materials.physical;
		}else if(chunkPosition[1] >= -2){
			material = materials.phongs.herbeTerre;
		}else if(chunkPosition[1] >= -4){
			material = materials.phongs.terre;
		}else if(chunkPosition[1] >= -8){
			material = materials.phongs.terreRoche;
		}else if(chunkPosition[1] >= -13){
			material = materials.phongs.roche;
		}else if(chunkPosition[1] >= -20){
			material = materials.phongs.rocheDur;
		}else{
			material = materials.phong;
		}

		const mesh = new THREE.Mesh( geometry, material );
		//console.log(mesh.geometry.attributes.position)

		//mesh.material.shadowSide = THREE.BackSide;
		//évites que l'on voit les bugs d'ombres qui sont à l'intérieur des objets

		mesh.position.set(
			x0 - chksize/2,
			y0 - chksize/2,
			z0 - chksize/2,
			);

		mesh.castShadow = true;
		mesh.receiveShadow = true;
		mesh.name = "Terrain/" + chunkPosition;

		put_in_chunk(mesh);
		if( Terrain.data.collision ){
			// collisions
			const group = Chunk.data.list[ chunkPosition ].group;
			worldOctree.fromGraphNode( group );
		}

		return(mesh)
	}

	updateMesh(newGen){

		this.generation = newGen;

		this.mesh.geometry.deleteAttribute("position");
		this.mesh.geometry.deleteAttribute("normal");

		const trianglesArray = marchingChunk(this.chunkPosition,this.generation);

		const triangles = arrayToFloats(trianglesArray);

		const vertices = new Float32Array( triangles );

		this.mesh.geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

		this.mesh.geometry.computeVertexNormals();
		this.mesh.geometry.normalizeNormals();


		/*if( Terrain.data.collision ){
			// collisions
			const group = Chunk.data.list[ chunkPosition ].group;

			//delete worldOctree.subTrees
			worldOctree.fromGraphNode( group );
		}*/

		this.mesh.geometry.attributes.position.needsUpdate = true;
	}


	//
}

/*
//à préparer

const position = Terrain.data.list["0,0,0"].mesh.geometry.attributes ;

				for ( let i = 0; i < position.count; i ++ ) {

					const y = 35 * Math.sin( i / 5 + ( time + i ) / 7 );
					position.setY( i, y );

				}

				position.needsUpdate = true;
*/


function testModifMesh(time){
	if ('0,-1,0' in Chunk.data.list) {
		const position = Terrain.data.list["0,-1,0"].mesh.geometry.attributes.position ;

		
		for ( let i = 0; i < position.count; i ++ ) {

			const y0 = 20//Terrain.data.list["0,-1,0"].mesh.geometry.attributes.position.array[ 1 + 3*i]
			const y = Math.sin( i / 30 + ( time + i ) / 40 );
			position.setY( i, y0 + y );

		}

		position.needsUpdate = true;
	}
	
}