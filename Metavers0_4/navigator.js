

const nav = window.navigator.userAgent;
let isPhone;

if(nav.search("Mobi") === -1 ){
	isPhone = false;
}else{
	isPhone = true;
}