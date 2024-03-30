console.warn("terrain.js loaded");

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
];


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
];

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


let SIZE = 1;

function marchingCube(map,x,y,z){

	const c000 = map[[x,y,z]];
	const c001 = map[[x,y,z+SIZE]];
	const c010 = map[[x,y+SIZE,z]];
	const c011 = map[[x,y+SIZE,z+SIZE]];
	const c100 = map[[x+SIZE,y,z]];
	const c101 = map[[x+SIZE,y,z+SIZE]];
	const c110 = map[[x+SIZE,y+SIZE,z]];
	const c111 = map[[x+SIZE,y+SIZE,z+SIZE]];

	const tri = [];

	const index = c000 + c100 * 2 + c101 * 4 + c001 * 8 + c010 * 16 + c110 * 32 + c111 * 64 + c011 * 128;

	const tei = trianglesEdgesIndex[index];

	for( let i of tei ){
		tri.push( scaleVertex( addVertex( indexToVertex[i], [ x, y, z ] ), SIZE ) );
	}

	return tri

}


function arrayToFloats(array){
	// [[[1,2],[3]],[1,[5,8]]] => [1,2,3,1,5,8]
	const L = [];
	for(let e0 of array){
	for(let e1 of e0){
	for(let e2 of e1){
		L.push(e2)
	}}}
	return(L)
}


function marchingChunk(map){

	const triangles = [];

	for (let x = 0; x < Chunk.data.size/SIZE; x++) {
	for (let y = 0; y < Chunk.data.size/SIZE; y++) {
	for (let z = 0; z < Chunk.data.size/SIZE; z++) {

		triangles.push( marchingCube(map,x,y,z) );
	}}}

	return arrayToFloats(triangles)

}

function caveWide(y){

	/*
	1.0 = vide (grottes infiniment larges)
	0.0 = grottes (moitié vide/moitié plein)
	-1.0 = plein (grottes infiniment fines)
	*/

	if (y >= -50) { return -1.0 }
	if (y >= -90) {
		const t = map(y,-50,-90,0,1);
		return linear(t,-1.0,0.0);
	}
	if (y >= -130) {
		const t = map(y,-90,-130,0,1);
		return linear(t,0.0,0.5);
	}
	if (y >= -160) { return 0.5 }
	if (y >= -200) {
		const t = map(y,-160,-200,0,1);
		return linear(t,0.5,-1.0);
	}
	return -1.0;
}




class Terrain{

	static data = {
		list : {},
		detail : 10,
		length : 0,
	}
	//OBSOLETE
	/*

	static generation(x,y,z){	//interpolation not visible

		//https://www.desmos.com/calculator/cucxkogo6q?lang=fr

		//https://www.desmos.com/calculator/wfubfzuayi
		//montagnes

		//https://www.desmos.com/calculator/hckvesfhle

		const caveNoise = perlin.noise( 3*x/freq, 8*y/freq, 3*z/freq );
		//const surfaceNoise = 20*perlin.noise( 3*x/freq, 0, 3*z/freq );

		const classicNoise = perlin.noise( 5*x/freq, 5*y/freq, 5*z/freq );
		const classicNoise1 = perlin.noise( 1.02 + 5*x/freq, 1.37 + 5*y/freq, 1.12 + 5*z/freq );


		const altitude = 100;
		const altiNoise = map( perlin.noise( x/freq, 0, z/freq ), -1, 1, 0, 1 );
		const altiNoise2 = map( perlin.noise( x/freq*4, 0, z/freq*4 ), -1, 1, 0, 1 );
		const altiNoise4 = map( perlin.noise( x/freq*16, 0, z/freq*16 ), -1, 1, 0, 1 );

		const surfaceBiomeNoise = altitude * altiNoise**2 * ( 1 + 2*altiNoise2 + 4*altiNoise4 * altiNoise )/3


		const p = new THREE.Vector3(x,y,z);
		const m = new THREE.Vector3(0,50,0);
		
		//boule non-parfaitement ronde
		const ballBin = ellipsoidNorm(p,m,
					30 + 4*classicNoise,
					30 + 4*classicNoise,
					30 + 4*classicNoise,
									);


		//const caveBin = caveNoise > 0.0 ? 1 : 0;
		//const classicBin = classicNoise > 0.6 ? 1 : 0;



		const caveBin = caveNoise > caveWide(y) ? 1 : 0;
		const cave0Bin = Math.abs(classicNoise) < 0.1 ? 1 : 0;
		const cave1Bin = Math.abs(classicNoise1) < 0.1 ? 1 : 0;

		const y0_lvl = 0 > y ? 1 : 0;
		const surfaceBin = (surfaceBiomeNoise - 30 > y) ? 1 : 0;

		//return surfaceBin && caveBin || ballBin && caveBin;
		return !(cave0Bin && cave1Bin) && caveBin && (surfaceBin || ballBin);
	}


	*/

	static advancedGen(x,y,z){	//active interpolation

		const classicNoise = perlin.noise( 5*x/freq, 5*y/freq, 5*z/freq );
		const classicNoise1 = perlin.noise( 1.02 + 5*x/freq, 1.37 + 5*y/freq, 1.12 + 5*z/freq );

		const freqX = freq + 64 * classicNoise;
		const freqY = freq + 128 * classicNoise;
		const noise2 = perlin.noise( 5*x/freqX, 5*y/freqY, 5*z/freq );


		//---- surface ----

		const altitude = 100;
		const altiNoise = map( perlin.noise( x/freq, 0, z/freq ), -1, 1, 0, 1 );
		const altiNoise2 = map( perlin.noise( x/freq*4, 0, z/freq*4 ), -1, 1, 0, 1 );
		const altiNoise4 = map( perlin.noise( x/freq*16, 0, z/freq*16 ), -1, 1, 0, 1 );

		const surfaceBiomeNoise = -30 + altitude * altiNoise**2 * ( 1 + 2*altiNoise2 + 4*altiNoise4 * altiNoise )/3
		const surfaceSmooth = smoothExp(surfaceBiomeNoise - y);

		//---- ball ----

		const p = new THREE.Vector3(x,y,z);
		const m = new THREE.Vector3(0,50,0);
		
		//boule non-parfaitement ronde
		const ballSmooth = smoothEllipsoidNorm(p,m,
					30 + 4*classicNoise,
					30 + 4*classicNoise,
					30 + 4*classicNoise,
									);
		//---- cave ----

		const caveNoise = perlin.noise( 3*x/freq, 8*y/freq, 3*z/freq );
		const caveSmooth = smoothExp(caveNoise - caveWide(y));

		//---- thin cave ----

		const cave0Smooth = smoothExp( 0.1 - Math.abs(classicNoise));
		const cave1Smooth = smoothExp( 0.1 - Math.abs(classicNoise1));
		const thinCaveSmooth = map(
				Math.min(cave0Smooth, cave1Smooth),
				0,1, 1,0,
			)
		

		//---- ----
		//OR = Math.max
		//AND = Math.min
		//NOT = map( ,0,1,1,0)

		const OR = Math.max(surfaceSmooth,ballSmooth)
		const AND = Math.min(thinCaveSmooth,caveSmooth,OR);
		const result = map( AND ,0,1,-1,1);
		return result * 0.99;
		// si result === -1; ==> error
	}


	//------------------------------------


	constructor( x = 0, y = 0, z = 0 ) {
		this.chunkPosition = new THREE.Vector3(x,y,z);
		this.chunkID = Chunk.vectorToString(this.chunkPosition);
		this.worldPosition = this.chunkPosition.clone().multiplyScalar(Chunk.data.size);

/*
		this.generation = this.genVertex();
		this.mesh = this.genMesh();

		this.mesh.name = "Terrain/" + this.chunkID;

		this.collisionFunction = this.collisionInit; // si initialisé, la fonction devient this.collisionUpdate

		Terrain.data.list[this.chunkID] = this;
		Terrain.data.length += 1;

		Chunk.data.list[this.chunkID].collisionFunction();
*/

		this.field = [];
		this.resolution = 1.0;

		//get field
		this.getField();

		//generate mesh
		this.mesh = this.createMesh();
		this.mesh.name = "Terrain/" + this.chunkID;
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;

		this.mesh.position.copy( this.worldPosition );
		Chunk.setInChunk(this.mesh);


		//this.collisionFunction = this.collisionInit; // si initialisé, la fonction devient this.collisionUpdate

		Terrain.data.list[this.chunkID] = this;
		Terrain.data.length += 1;

		//Chunk.data.list[this.chunkID].collisionFunction();




/*
		this.marchingCubeTEST = new THREE.MarchingCubes( Terrain.data.detail, materials.golpexOrange, false, false );
		this.marchingCubeTEST.position.copy(this.worldPosition);
		this.marchingCubeTEST.position.add( new THREE.Vector3(1,1,1).multiplyScalar(Chunk.data.size/2) );
		this.marchingCubeTEST.isolation = 10;
		
		this.marchingCubeTEST.scale.set( Chunk.data.size*0.7, Chunk.data.size*0.7, Chunk.data.size*0.7 );
		this.marchingCubeTEST.init( Math.floor( Terrain.data.detail ) );
		//this.marchingCubeTEST.addBall( 0.5, 0.5, 0.5, 0.1, 0.3 );
		this.genTEST();
		Chunk.setInChunk(this.marchingCubeTEST);
		this.marchingCubeTEST.update(); // à mettre dans update si terrain modifié
*/
	}

	//------------------------------------

	getField(){

		const v0 = this.worldPosition;

		for (let x = 0; x <= Chunk.data.size; x ++) {

			this.field[x] = [];
		for (let y = 0; y <= Chunk.data.size; y ++) {
			
			this.field[x][y] = [];
		for (let z = 0; z <= Chunk.data.size; z ++) {

			//this.field[x][y][z] = Terrain.generation( v0.x + x, v0.y + y, v0.z + z );
			this.field[x][y][z] = Terrain.advancedGen( v0.x + x, v0.y + y, v0.z + z );
		}}}
	}

	createMesh(){
		let vertices = [];
		let color = [];

		const v0 = this.worldPosition;

		for (let i = 0; i < Chunk.data.size; i ++) {
			let x = i * this.resolution;
			for (let j = 0; j < Chunk.data.size; j ++) {
				let y = j * this.resolution;
				for (let k = 0; k < Chunk.data.size; k ++) {
					let z = k * this.resolution;

					let values = [
						this.field[i][j][k] + 1,
						this.field[i + 1][j][k] + 1,
						this.field[i + 1][j][k + 1] + 1,
						this.field[i][j][k + 1] + 1,
						this.field[i][j + 1][k] + 1,
						this.field[i + 1][j + 1][k] + 1,
						this.field[i + 1][j + 1][k + 1] + 1,
						this.field[i][j + 1][k + 1] + 1,
					];

					let edges = [
						new THREE.Vector3(
							lerp(x, x + this.resolution, (1 - values[0]) / (values[1] - values[0])),
							y,
							z
						),
						new THREE.Vector3(
							x + this.resolution,
							y,
							lerp(z, z + this.resolution, (1 - values[1]) / (values[2] - values[1]))
						),
						new THREE.Vector3(
							lerp(x, x + this.resolution, (1 - values[3]) / (values[2] - values[3])),
							y,
							z + this.resolution
						),
						new THREE.Vector3(
							x,
							y,
							lerp(z, z + this.resolution, (1 - values[0]) / (values[3] - values[0]))
						),
						new THREE.Vector3(
							lerp(x, x + this.resolution, (1 - values[4]) / (values[5] - values[4])),
							y + this.resolution,
							z
						),
						new THREE.Vector3(
							x + this.resolution,
							y + this.resolution,
							lerp(z, z + this.resolution, (1 - values[5]) / (values[6] - values[5]))
						),
						new THREE.Vector3(
							lerp(x, x + this.resolution, (1 - values[7]) / (values[6] - values[7])),
							y + this.resolution,
							z + this.resolution
						),
						new THREE.Vector3(
							x,
							y + this.resolution,
							lerp(z, z + this.resolution, (1 - values[4]) / (values[7] - values[4]))
						),
						new THREE.Vector3(
							x,
							lerp(y, y + this.resolution, (1 - values[0]) / (values[4] - values[0])),
							z
						),
						new THREE.Vector3(
							x + this.resolution,
							lerp(y, y + this.resolution, (1 - values[1]) / (values[5] - values[1])),
							z
						),
						new THREE.Vector3(
							x + this.resolution,
							lerp(y, y + this.resolution, (1 - values[2]) / (values[6] - values[2])),
							z + this.resolution
						),
						new THREE.Vector3(
							x,
							lerp(y, y + this.resolution, (1 - values[3]) / (values[7] - values[3])),
							z + this.resolution
						),
					];

					let state = getState(
						Math.ceil(this.field[i][j][k]),
						Math.ceil(this.field[i + 1][j][k]),
						Math.ceil(this.field[i + 1][j][k + 1]),
						Math.ceil(this.field[i][j][k + 1]),
						Math.ceil(this.field[i][j + 1][k]),
						Math.ceil(this.field[i + 1][j + 1][k]),
						Math.ceil(this.field[i + 1][j + 1][k + 1]),
						Math.ceil(this.field[i][j + 1][k + 1])
					);
/*
					for (let edgeIndex of triangulationTable[state]) {
						if (edgeIndex !== -1) {
							vertices.push(edges[edgeIndex].x, edges[edgeIndex].y, edges[edgeIndex].z);
						}
					}*/

					//---
					//penser à supprimer le debug
					try {
						for (let edgeIndex of triangulationTable[state]) {
							if (edgeIndex !== -1) {
								vertices.push(edges[edgeIndex].x, edges[edgeIndex].y, edges[edgeIndex].z);

								// ---définir color---
								//test 1
								color.push(1,smoothExp((v0.y + y)*.1),0);

								/*
								//test 2
								const X = v0.x + x;
								const Y = v0.y + y;
								const Z = v0.z + z;

								const altitude = 100;
								const altiNoise = map( perlin.noise( X/freq, 0, Z/freq ), -1, 1, 0, 1 );
								const altiNoise2 = map( perlin.noise( X/freq*4, 0, Z/freq*4 ), -1, 1, 0, 1 );
								const altiNoise4 = map( perlin.noise( X/freq*16, 0, Z/freq*16 ), -1, 1, 0, 1 );

								const surfaceBiomeNoise = -30 + altitude * altiNoise**2 * ( 1 + 2*altiNoise2 + 4*altiNoise4 * altiNoise )/3
								const surfaceSmooth = smoothExp( 0.1 * (surfaceBiomeNoise - Y));

								color.push(1,1 - surfaceSmooth,0);
								*/

								// --- ---
							}
						}
					} catch (error) {
						console.error('xyz = ',x,y,z);
						console.error('this.field[xyz] = ',this.field[x][y][z])
						console.error(error);
					}
					//---
				}
			}
		}
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(vertices), 3));
		geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(color), 3));
		geometry.computeVertexNormals();

		return new THREE.Mesh(geometry, materials.blank);
	}
	//------------------------------------
/*
	genTEST(){
		const v0 = this.worldPosition;

		for (let x = 0; x <= Chunk.data.size; x += 4) {
		for (let y = 0; y <= Chunk.data.size; y += 4) {
		for (let z = 0; z <= Chunk.data.size; z += 4) {

			const X = map(x,0,Chunk.data.size,0,1);
			const Y = map(y,0,Chunk.data.size,0,1);
			const Z = map(z,0,Chunk.data.size,0,1);

			if (Terrain.generation( v0.x + x, v0.y + y, v0.z + z )) {
				this.marchingCubeTEST.addBall( X, Y, Z, 1, 1 );
			}
			
		}}}
	}*/

	genVertex(){

		const L = {};

		const v0 = this.worldPosition;

		for (let x = 0; x <= Chunk.data.size; x++) {
		for (let y = 0; y <= Chunk.data.size; y++) {
		for (let z = 0; z <= Chunk.data.size; z++) {
			L[[x,y,z]] = Terrain.generation( v0.x + x, v0.y + y, v0.z + z ) ;
		}}}
		return(L)
	}

	genMesh(){

		const triangles = marchingChunk( this.generation );

		const geometry = new THREE.BufferGeometry();
		const vertices = new Float32Array( triangles );
		geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

		geometry.computeVertexNormals();
		geometry.normalizeNormals();

		const mesh = new THREE.Mesh( geometry, materials.golpexBlack );

		mesh.castShadow = true;
		mesh.receiveShadow = true;

		mesh.position.copy( this.worldPosition );
		Chunk.setInChunk(mesh);

		return mesh;
	}

	meshUpdate(){
		//ATTENTION : penser à update les bords des autres chunks quand changement de this.genration aux points 0 ou Chunk.data.size
		// à la manière de la fonction Chunk.nearUser()
	}
}


class Biome{

	static type = {

	}
/*
	temperature	: -1.0 = cold 	/	1.0 = hot
	humidity	: -1.0 = wet	/	1.0 = dry
	altitude	: -1.0 = flat 	/	1.0 = high
	smoothness	: -1.0 = rought	/	1.0 = soft
*/
/*
	static temperature = perlin.noise(0,0,0);
	static altitude = perlin.noise();
	*/
}


//https://threejs.org/examples/#webgl_buffergeometry_indexed


function surface(noise,y){
	const MAX = .99;
	const MID = 0.0;
	const MIN = -.99;

	if (y < -20) return 0;
	if (y > 20) return MAX;
	
/*
	if ( y < 0 ){
		const max = map(y,-20,0,MID,MAX)
		return map(noise, -1,1, MIN,max)
	}
	if ( y >= 0 ){
		const min = map(y,0,20,MIN,MAX)
		return map(noise, -1,1, min,MAX)
	}*/
	return 0.5;
}

