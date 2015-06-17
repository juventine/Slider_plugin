var mySliderPlugin = ( function() {

	var imageWidthOrig = 300;
	var imageHeightOrig = 200;
	var deviceType;
	var countImgs = 5; //general count of image
	var arrVisibleImgs = []; // images in viewport
	var images = []; // array of all the images in container
	var shiftPixels; // size of shift
	var isDisabled = true; // flag: button is disabled or not
	var visibleImgs;// number of visible images in viewport

	var config = {
		visibleImgs : 3, //number of visible images in Viewport
		isButtonsVisible : true, // Flag: buttons visible or invisible
		activeImageNumber : 1 // set active number of Image in Viewport
	};

  function init(options, elementContainer, elemLeftButton, elemRightButton) {

	  	hideContainer(elemLeftButton, elemRightButton);

	  	if ( !options.isButtonsVisible ) {
	  		config.isButtonsVisible = false;
	  		hideButtons(elemLeftButton, elemRightButton);
	  	}
	  	else {
	  		activateButtons(elemLeftButton, elemRightButton); //event handlers for buttons
	  	}

	  	if ( options.visibleImgs) {
	  		visibleImgs = options.visibleImgs;
	  	}

	  	if ( options.activeImageNumber != undefined ) {
	  		config.activeImageNumber = options.activeImageNumber;
  		}

  		window.onresize = buildViewport; // event-handler for onresize event
  		moveMouseImages(); // mouseMove
  		viewInitContainer();

	};

  function hideContainer() {
	  var elemContainer = document.getElementById('container');
	  if (elemContainer) {
	  elemContainer.hidden = 'true';
		}
  }

	function hideButtons(elemLeftButton, elemRightButton) {
  	//hide left button
  	if (elemLeftButton) {
  		elemLeftButton.hidden = 'true';
	}

	//hide right button
		if (elemLeftButton) {
		elemRightButton.hidden = 'true';
		}
  }

	function activateButtons(elemLeftButton, elemRightButton) {

	// event handler for leftButton
	if (elemLeftButton) {
		elemLeftButton.addEventListener("click", shiftLeft );
	}

//event handler for rightButton
	if (elemRightButton){
		elemRightButton.addEventListener("click", shiftRight );
	}
	};

	function viewInitContainer() {

  	buildImageNumbers();
  	buildViewport();
  	initBuildVisibleImgs(); //build array of visible images
  	initBuildDom();
  	showContainer();
	};

	function buildImageNumbers() {
	// set for each image number

  images = document.getElementsByClassName('imagesContainer');

	if(images) {
		for( var i = 0; i < images.length; i++ ) {
			images[i].setAttribute('number', i);
		}
	}
	};

  function buildViewport() {
  	/*
  	For various kind of devices we need to show corresponding maximum number of images in viewport.
  	Criterion is the width of screen of device

  	1) Size of Viewport for tablets is from 481 to 1025px. For tablets maximum images in viewport === 3
  	2) Size of Viewport for mobiles is < 481px ( width of mobile devices < 480 px). For mobiles maximum images in viewport === 1
  	3) Size of Viewport for desctops take >1025px.
	  Summarize:
	  	1)If size of Viewport is = 300px --> we fit maximum one image in Viewport;
	  	2)If size of Viewport is 609px --> we fit maximum three images in viewport;
	  	3)if size of Viewport is > 1025px --> we fit maximum 5 images in Viewport.
    */

  	deviceType = knowDeviceType();
  	checkVisibleImages();

		var imageWidthDyn = ( window.innerWidth - 3 * ( config.visibleImgs - 1 ) - 6 ) /	config.visibleImgs; // size of image in viewport
		var imageRelativePerc = imageWidthDyn / imageWidthOrig;

		for( var i = 0; i < images.length; i++ ) {
			images[i].style.width = imageWidthOrig * imageRelativePerc + 'px';
			images[i].style.height = imageHeightOrig * imageRelativePerc + 'px';
		}

			shiftPixels = imageWidthOrig * imageRelativePerc + 3;
		};


	function initBuildVisibleImgs() {
		var visibleImage = config.activeImageNumber - 1;
		for( var i = 0 ; i < config.visibleImgs; i++ ) {
			arrVisibleImgs[i] = visibleImage; // initial numbers of visible images
			visibleImage =  visibleImage + 1;
			if ( visibleImage == countImgs ) {
				visibleImage = 0;
			}
		}
	};

	function initBuildDom() {
		if ( config.activeImageNumber != 1 ) {
			shiftInit();
		}
	};

	function shiftInit(modeShift) {
		var container = document.getElementById('container');

    //check if we need to rebuild DOM of Container
    // s
    	initRebuidContainer(container);
	};

	function knowDeviceType() {
    if ( window.outerWidth < 481 ) {
    	return 'Mobile';
    }

    if ( window.outerWidth > 481 && window.outerWidth < 1025) {
    	return 'Tablet';
    }

    if ( window.outerWidth > 1025 ) {
    	return 'Desctop';
    }
	}

	function checkVisibleImages() {
		switch( deviceType ) {
			case 'Mobile':
				config.visibleImgs = 1;
				break;
			case 'Tablet':
				if ( visibleImgs > 0 && visibleImgs <= 3 ) {
					config.visibleImgs = visibleImgs;
					break;
				}
				else {
					config.visibleImgs = 3; //maximum 3 images
					break;
				}
			case 'Desctop':
				if ( visibleImgs > 0 ) {
					config.visibleImgs = visibleImgs;
				}
				else {
					config.visibleImgs = 5;
					break;
				}
		}
	}

	function initRebuidContainer () {
		var countElemReposition = config.activeImageNumber - 1;
		var divContainer = [];
		var elemReposition; // divContainer for reposition
 		divContainer = document.getElementsByClassName('div_container');
		for ( i = 0; i < countElemReposition; i++ ) {
			elemReposition = container.removeChild(divContainer[0])
			container.appendChild(elemReposition);
		}
	}

	function showContainer() {
		var containerDom = document.getElementById('container');

  		if (containerDom) {
  			containerDom.hidden = '';
  	}
	}

  	function shiftLeft() {
  		if ( isDisabled ) {
    		isDisabled = false;
			var container = document.getElementById('container');

	// check if we need to rebuild container
  		if( checkContainer('leftShift') ) {
  			rebuildContainer('leftShift', container, shiftPixels);
  		}

    // calculate size of shift of container
			var oldLeftStyle = container.offsetLeft;
			var newLeftStyle = oldLeftStyle - shiftPixels;
			var shiftInterval = shiftPixels / 15; // interval for shift
			var shiftSize = oldLeftStyle - shiftInterval; // value of shift of container
	// function for smooth shift. each 25 ms we displace the container
	// on shiftInterval value
			var count = 0; // count of calling function timerShift
			var timerShift = setInterval( function() {
			count++;
			container.style.left = shiftSize + 'px';
			shiftSize -= shiftInterval;
	// check if it's end of shift of container
			if ( count == 15 ) {
				clearInterval( timerShift );
				isDisabled = true;
			}
			} , 25);
	//visible images in container
			buildVisibleImages('leftShift');
		}
  	};

  	function shiftRight() {
  		if ( isDisabled ) {
			isDisabled = false;
			var container = document.getElementById('container');

			if( checkContainer('rightShift') ) {
    			rebuildContainer('rightShift', container, shiftPixels );
    		}

			var oldLeftStyle = container.offsetLeft;
			var newLeftStyle = oldLeftStyle + shiftPixels;
			var shiftInterval = shiftPixels / 15;
			var shiftSize = oldLeftStyle + shiftInterval;
			var count = 0; // count of calling function timerShift
			var timerShift = setInterval( function() {
			// isDisabled = false;
			count++;
			container.style.left = shiftSize + 'px';

			shiftSize += shiftInterval;

			if ( count == 15 ) {
				clearInterval( timerShift );
				isDisabled = true;
			}
			} , 25);

			buildVisibleImages('rightShift');
		}

  	};

  	function checkContainer(shiftMode) {
		var containerImage = [];
		var containerImage = document.querySelectorAll('img');
		switch (shiftMode) {
			case 'leftShift':
				var lastRightImage = containerImage[countImgs-1];
				// check if we need to rebuid container
				if( arrVisibleImgs[arrVisibleImgs.length - 1] == +lastRightImage.getAttribute('number') ) {
					return true;
				}
				else {
					return false;
				}

			case 'rightShift':
				var lastLeftImage = containerImage[0];
				//check if we need to rebuild container
				if( arrVisibleImgs[0] == +lastLeftImage.getAttribute('number') ) {
					return true;
				}
				else {
				return false;
				}
		}
	};

	function rebuildContainer(shiftMode,container,shiftPixels) {
		var divContainer = []; // div elements with images in container
 		divContainer = document.getElementsByClassName('div_container');
		switch (shiftMode) {
			case 'leftShift':
				var firstDivElemContainer;
				// calculate shift of the container
				var oldLeftStyle = container.offsetLeft;
				var newLeftStyle = oldLeftStyle + shiftPixels;
				//remove first image from container
				firstDivElemContainer = container.removeChild(divContainer[0]);
				//************* shift container to the right*******************************************
				container.style.left = newLeftStyle + 'px';
				//*************************************************************************************
      	container.appendChild(firstDivElemContainer);
      	break;
  		case 'rightShift':
  			var lastDivDom;
		    var lastDivElemContainer = container.removeChild(divContainer[divContainer.length-1]);//remove last image from container
		    console.log('lastDivElemContainer:',lastDivElemContainer);
		//************ shift container to the right *************************************
				var oldLeftStyle = container.offsetLeft;
				var newLeftStyle = oldLeftStyle - shiftPixels;
				container.style.left = newLeftStyle + 'px';
		//*******************************************************************************
  			container.insertBefore(lastDivElemContainer, divContainer[0]); //
  			break;
    	}
	};

	function buildVisibleImages(shiftMode) {
		var divImage = document.getElementsByClassName('imagesContainer');
		var divImageAtr;

		switch (shiftMode) {
			case 'leftShift':

				for( var i = 0; i < config.visibleImgs; i++ ){
					if( i == config.visibleImgs - 1 ) {
						break;
					}
				arrVisibleImgs[i] = arrVisibleImgs[i+1];
				}

				for( var j = 0; j < countImgs; j++) {
					divImageAtr = divImage[j];

					if ( +divImageAtr.getAttribute('number') != arrVisibleImgs[i] ) continue;
					else {
						divImageAtr = divImage[j+1];
						arrVisibleImgs[i] = +divImageAtr.getAttribute('number');
						return true;
					}
				}

			case 'rightShift':
				for( var i = config.visibleImgs - 1; i > 0 ; i-- ){
					arrVisibleImgs[i] = arrVisibleImgs[i-1];
				}

				for( var j = 0; j < countImgs; j++) {
					var divImageAtr = divImage[j];

					if ( +divImageAtr.getAttribute('number') != arrVisibleImgs[i] ) continue;
					else {
						divImageAtr = divImage[j-1];
						arrVisibleImgs[i] = +divImageAtr.getAttribute('number');
						return true;
					}
			  	}
	  	}
	};

	function moveMouseImages() {
		var elementContainer = document.getElementById('container');
		// move container

		elementContainer.onmousedown = function(e) { // 1. mouse click on container

			// turn off ondragstart
		elementContainer.ondragstart = function() {
	    return false;
	  	}

      var startContainerPos = elementContainer.offsetLeft;
			var startCoordinateX = e.clientX;


			document.onmousemove = function(e) {
			  var newLeftStyle = 0;
			  var containerOffset =	checkMoveContainer(e); // check if we need to rebuild container

			  if ( containerOffset ) {
    			startContainerPos = containerOffset;
    			startCoordinateX = e.clientX;
    		}
    		moveContainer(e);
  		}

  		function checkMoveContainer(e) {
  			var elementContainer = document.getElementById('container');
  			var containerOffset = elementContainer.getBoundingClientRect().left;
  			var shiftMode; // shiftMode: leftShift or rightShift
				if ( ( containerOffset <= 0 && containerOffset >= - 25 ) &&  (startCoordinateX - e.clientX) < 0 ) { // shift to right side
					shiftMode = 'rightShift';
					rebuildContainer(shiftMode, elementContainer, shiftPixels);
				    containerOffset = elementContainer.getBoundingClientRect().left;
					return containerOffset;
				}
  		}

	   	function moveContainer(e) {
    		newLeftStyle = startContainerPos + e.clientX - startCoordinateX;
    		elementContainer.style.left = newLeftStyle + 'px';
    	}

    	  // finish of mouseMove
  		elementContainer.onmouseup = function() {
	    	document.onmousemove = null;
	    	elementContainer.onmouseup = null;
	  	}
    }
  }

  return {
  	init: init
  };

}) ();



