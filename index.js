'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = basaBasa;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BasaBasa = function () {
	function BasaBasa(ogElem) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		_classCallCheck(this, BasaBasa);

		// Set up state
		this.state = {
			dimensions: {},
			dragging: false,
			dragOrigin: {},
			sliderBounds: {},
			percent: {
				width: 50,
				height: 100
			}
		};
		this.ogElem = ogElem;
		this.options = opts;

		// If JS doesn't receive an options arg, check if there's a basa-basa data attr in the html
		// Also ensure that the JSON format is correct. User could potentially use single quotes inside double quotes
		var dataset = this.ogElem.dataset['basaBasa'] && this.ogElem.dataset['basaBasa'].replace(/([^\\])'/g, '$1"');
		if (Object.keys(this.options).length <= 0 && dataset && JSON.parse(dataset) && Object.keys(JSON.parse(dataset)).length > 0) {
			this.options = JSON.parse(dataset);
		}

		// Bind event handlers
		this.handleSliderDragStart = this.handleSliderDragStart.bind(this);
		this.handleSliderDrag = this.handleSliderDrag.bind(this);
		this.setupDragListeners = this.setupDragListeners.bind(this);
		this.handleSliderDragEnd = this.handleSliderDragEnd.bind(this);
		this.setSliderBounds = this.setSliderBounds.bind(this);
		this.setSliderDimensions = this.setSliderDimensions.bind(this);
		this.handleWindowResize = this.handleWindowResize.bind(this);
		this.handleImageLoad = this.handleImageLoad.bind(this);
		this.init = this.init.bind(this);

		// Store images
		this.overImage = ogElem.children[0];
		this.overImage.addEventListener('load', this.handleImageLoad);
		this.underImage = ogElem.children[1];
		this.underImage.addEventListener('load', this.handleImageLoad);

		// Create wrapper
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add('basa');
		this.wrapper.style.display = 'inline-block';

		// Create slider slider element
		this.elem = document.createElement('div');
		this.elem.classList.add('basa__contents');
		this.elem.style.position = 'relative';

		// Create handle element
		this.handle = document.createElement('div');
		this.handle.classList.add('basa__handle');
		// Set handle class to class in options if it exists
		if (this.options.handleClass) {
			var handleClass = this.handle.getAttribute('class');
			this.handle.setAttribute('class', handleClass + ' ' + this.options.handleClass);
		}
		// Default absolute right position
		this.handle.style.position = 'absolute';
		this.handle.style.right = '0';

		// Set up drag start for non-touch devices
		this.handle.addEventListener('mousedown', this.handleSliderDragStart);

		// Set up drag start for touch devices
		this.handle.addEventListener('touchstart', this.handleSliderDragStart);

		// Create shade element
		this.shade = document.createElement('div');
		this.shade.classList.add('basa__shade');
		this.shade.style.cssText = 'position: absolute; top: 0; left: 0; height: 100%;';

		// Create shade image wrapper
		this.shadeContainer = document.createElement('div');
		this.shadeContainer.classList.add('basa__shade-container');
		this.shadeContainer.style.cssText = 'width: 100%; overflow: hidden; height: 100%;';

		// Create inner shade area
		this.innerShade = document.createElement('div');
		this.innerShade.classList.add('basa__inner-shade');
		this.innerShade.style.cssText = 'height: 100%; position: relative;';

		// Create labels if necessary
		if (this.options.leftLabel) {
			this.leftLabel = document.createElement('div');
			this.leftLabel.classList.add('basa__label');
			this.leftLabel.classList.add('basa__label--left');
			this.leftLabel.innerText = this.options.leftLabel;
		}

		if (this.options.rightLabel) {
			this.rightLabel = document.createElement('div');
			this.rightLabel.classList.add('basa__label');
			this.rightLabel.classList.add('basa__label--right');
			this.rightLabel.innerText = this.options.rightLabel;
		}

		// Alternative setup for browswers that don't support object-fit
		if (!('objectFit' in document.createElement('img').style)) {
			this.ogElem.classList.add('no-basa');
			this.ogElem.innerHTML = '';

			var topImage = this.overImage;
			var bottomImage = this.underImage;
			if (this.leftLabel) {
				topImage = document.createElement('div');
				topImage.classList.add('no-basa__image-wrapper');
				topImage.appendChild(this.overImage);
				topImage.appendChild(this.leftLabel);
			}
			if (this.rightLabel) {
				bottomImage = document.createElement('div');
				bottomImage.classList.add('no-basa__image-wrapper');
				bottomImage.appendChild(this.underImage);
				bottomImage.appendChild(this.rightLabel);
			}
			this.ogElem.appendChild(topImage);
			this.ogElem.appendChild(bottomImage);
			return;
		}

		// Set image styles
		this.underImage.style.cssText = 'display: block;';
		this.overImage.style.cssText = 'display: block; height: 100%; object-fit: cover; max-width: none;';

		// Put everything together
		this.innerShade.appendChild(this.overImage);
		if (this.leftLabel) this.innerShade.appendChild(this.leftLabel);
		this.shadeContainer.appendChild(this.innerShade);
		this.shade.appendChild(this.shadeContainer);
		this.shade.appendChild(this.handle);
		this.elem.appendChild(this.underImage);
		this.elem.appendChild(this.shade);
		if (this.rightLabel) this.elem.appendChild(this.rightLabel);
		this.wrapper.appendChild(this.elem);

		// Set initial position of shade
		this.shade.style.width = this.state.percent.width + '%';

		// Replace the original thing
		this.ogElem.innerHTML = '';
		this.ogElem.appendChild(this.wrapper);
		this.ogElem.Basa = this;

		// Init on window load
		window.addEventListener('load', this.init);
	}

	_createClass(BasaBasa, [{
		key: 'handleImageLoad',
		value: function handleImageLoad() {
			this.setSliderBounds();
			// Set underImage to 100% width
			this.innerShade.style.width = window.getComputedStyle(this.underImage).width;
		}
	}, {
		key: 'init',
		value: function init() {
			if (this.options.handlePadding) {
				// Set padding for handle overflow
				var _window$getComputedSt = window.getComputedStyle(this.handle),
				    handleWidth = _window$getComputedSt.width;

				var handlePadding = parseInt(handleWidth) / 2;
				this.wrapper.style.paddingLeft = handlePadding + 'px';
				this.wrapper.style.paddingRight = handlePadding + 'px';
			}

			// Setup window resize listeners
			window.addEventListener('resize', this.handleWindowResize);

			this.setSliderBounds();
			// Set underImage to 100% width
			this.innerShade.style.width = window.getComputedStyle(this.underImage).width;
		}
	}, {
		key: 'setSliderDimensions',
		value: function setSliderDimensions() {
			var _window$getComputedSt2 = window.getComputedStyle(this.elem),
			    width = _window$getComputedSt2.width,
			    height = _window$getComputedSt2.height;

			this.state.dimensions = {
				width: parseInt(width, 10),
				height: parseInt(height, 10)
			};
		}
	}, {
		key: 'setSliderBounds',
		value: function setSliderBounds() {
			var _elem$getBoundingClie = this.elem.getBoundingClientRect(),
			    left = _elem$getBoundingClie.left,
			    top = _elem$getBoundingClie.top;

			var _window$getComputedSt3 = window.getComputedStyle(this.elem),
			    width = _window$getComputedSt3.width,
			    height = _window$getComputedSt3.height;

			var bounds = {
				left: left,
				right: left + parseInt(width, 10),
				top: top,
				bottom: top + parseInt(height, 10)
			};
			this.state.sliderBounds = bounds;
		}
	}, {
		key: 'handleWindowResize',
		value: function handleWindowResize() {
			this.setSliderBounds();
			// Set underImage to 100% width
			this.innerShade.style.width = window.getComputedStyle(this.underImage).width;
		}
	}, {
		key: 'handleSliderDragStart',
		value: function handleSliderDragStart(e) {
			var clientX = e.clientX || e.touches[0].clientX;
			var clientY = e.clientY || e.touches[0].clientY;
			// Set the bounds and dimensions of the slider on the screen
			this.setSliderBounds();
			this.setSliderDimensions();
			// Update state
			this.state.dragging = true;
			this.state.dragOrigin = { x: clientX, y: clientY };
			// Setup drag listeners on document
			this.setupDragListeners();
		}
	}, {
		key: 'setupDragListeners',
		value: function setupDragListeners() {
			document.addEventListener('mousemove', this.handleSliderDrag);
			document.addEventListener('touchmove', this.handleSliderDrag);
			document.addEventListener('mouseup', this.handleSliderDragEnd);
			document.addEventListener('touchend', this.handleSliderDragEnd);
		}
	}, {
		key: 'handleSliderDragEnd',
		value: function handleSliderDragEnd() {
			this.state.dragging = false;
			this.state.percent = this.state.latestPercent;
			this.state.latestPercent = 0;
			document.removeEventListener('mousemove', this.handleSliderDrag);
			document.removeEventListener('touchmove', this.handleSliderDrag);
			document.removeEventListener('mouseup', this.handleSliderDragEnd);
			document.removeEventListener('touchend', this.handleSliderDragEnd);
		}
	}, {
		key: 'handleSliderDrag',
		value: function handleSliderDrag(e) {
			e.stopPropagation();
			e.preventDefault();
			var clientX = e.clientX || e.touches[0].clientX;
			var clientY = e.clientY || e.touches[0].clientY;
			var _state$dimensions = this.state.dimensions,
			    width = _state$dimensions.width,
			    height = _state$dimensions.height;
			var _state$dragOrigin = this.state.dragOrigin,
			    ogX = _state$dragOrigin.x,
			    ogY = _state$dragOrigin.y;
			var _state$percent = this.state.percent,
			    pWidth = _state$percent.width,
			    pHeight = _state$percent.height;

			var diff = {
				x: (ogX - clientX) / width * 100,
				y: (ogY - clientY) / height * 100
			};
			var percent = {
				width: Math.max(0, Math.min(pWidth - diff.x, 100)),
				height: Math.max(0, Math.min(pHeight - diff.y))
			};
			this.state.latestPercent = percent;
			this.shade.style.width = percent.width + '%';
		}
	}]);

	return BasaBasa;
}();

function basaBasa(selector, options) {
	var elements = void 0;
	if (typeof selector === 'string') {
		elements = Array.from(document.querySelectorAll(selector));
	} else if (selector instanceof HTMLElement) {
		elements = [selector];
	} else if (selector instanceof NodeList) {
		elements = Array.from(selector);
	} else if (!selector) {
		elements = Array.from(document.querySelectorAll('.basa-basa'));
	} else {
		console.log('Argument "' + selector + '" isn\'t a valid argument for basabasa');
	}

	var instances = elements.map(function (slider) {
		new BasaBasa(slider, options);
	});

	return instances;
}
