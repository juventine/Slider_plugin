document.addEventListener('DOMContentLoaded', function() {
	var options = {
		visibleImgs : 4, //number of visible images in Viewport
		isButtonsVisible : true, // Flag: buttons visible or invisible
		activeImageNumber : 3, // set active number of Image in Viewport
	};
	var elementContainer = document.getElementById('container');
	var elemLeftButton = document.getElementById('leftButton');
	var elemRightButton = document.getElementById('rightButton');
		mySliderPlugin.init( options, elementContainer, elemLeftButton, elemRightButton );
});
