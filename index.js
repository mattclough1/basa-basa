'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = basabasa;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComparisonSlider = function () {
	function ComparisonSlider(elem) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		_classCallCheck(this, ComparisonSlider);

		// Set up state
		this.state = {
			loaded: 0,
			dimensions: {},
			dragging: false,
			dragOrigin: {},
			sliderBounds: {},
			percent: {
				width: 50,
				height: 100
			}
		};
		this.originalElem = elem;
		this.options = opts;

		// Bind event handlers
		this.handleSliderDragStart = this.handleSliderDragStart.bind(this);
		this.handleSliderDrag = this.handleSliderDrag.bind(this);
		this.setupDragListeners = this.setupDragListeners.bind(this);
		this.handleSliderDragEnd = this.handleSliderDragEnd.bind(this);
		this.setSliderBounds = this.setSliderBounds.bind(this);
		this.setSliderDimensions = this.setSliderDimensions.bind(this);
		this.handleWindowResize = this.handleWindowResize.bind(this);
		this.checkLoaded = this.checkLoaded.bind(this);

		// Store images and add onload listeners
		this.overImage = elem.children[0];
		this.underImage = elem.children[1];
		this.overImage.addEventListener('load', this.checkLoaded);
		this.underImage.addEventListener('load', this.checkLoaded);

		// Create wrapper
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add('comparison-slider__wrapper');

		// Create slider slider element
		this.elem = document.createElement('div');
		this.elem.classList.add('comparison-slider');

		// Create handle element
		this.handle = document.createElement('div');
		this.handle.classList.add('comparison-slider__handle');
		this.handle.setAttribute('class', this.handle.getAttribute('class') + ' ' + this.options.handleClass);

		// Create shade element
		this.shade = document.createElement('div');
		this.shade.classList.add('comparison-slider__shade');
		this.shade.style.height = '100%';

		// Create shade image wrapper
		this.shadeImageWrapper = document.createElement('div');
		this.shadeImageWrapper.classList.add('comparison-slider__shade-wrapper');
		this.shadeImageWrapper.style.height = '100%';

		// Put everything together
		this.shadeImageWrapper.appendChild(this.overImage);
		this.shade.appendChild(this.shadeImageWrapper);
		this.shade.appendChild(this.handle);
		this.elem.appendChild(this.underImage);
		this.elem.appendChild(this.shade);
		this.wrapper.appendChild(this.elem);

		// Set up start for non-touch devices
		this.handle.addEventListener('mousedown', this.handleSliderDragStart);

		// Set up start for touch devices
		this.handle.addEventListener('touchstart', this.handleSliderDragStart);

		// Set initial position of shade
		this.shade.style.width = this.state.percent.width + '%';

		// Replace the original thing
		elem.innerHTML = '';
		elem.appendChild(this.wrapper);
		elem.imageCompare = this;
	}

	_createClass(ComparisonSlider, [{
		key: 'checkLoaded',
		value: function checkLoaded() {
			if (this.state.loaded === 1) {
				this.init();
			} else {
				this.state.loaded += 1;
			}
		}
	}, {
		key: 'init',
		value: function init() {
			// Set underImage to 100% width
			this.underImage.style.cssText = 'display: block; width: 100%;';
			this.overImage.style.cssText = 'display: block; width: ' + window.getComputedStyle(this.underImage).width + '; height: 100%; object-fit: cover;';

			// Set padding for handle overflow

			var _window$getComputedSt = window.getComputedStyle(this.handle),
			    handleWidth = _window$getComputedSt.width;

			var handlePadding = parseInt(handleWidth) / 2;
			this.wrapper.style.cssText = 'padding-left: ' + handlePadding + 'px; padding-right: ' + handlePadding + 'px';

			// Setup window resize listeners
			window.addEventListener('resize', this.handleWindowResize);
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
			this.overImage.style.width = window.getComputedStyle(this.underImage).width;
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

	return ComparisonSlider;
}();

function basabasa(selector, options) {
	var elements = void 0;
	if (typeof selector === 'string') {
		elements = document.querySelectorAll(selector);
	} else if (selector instanceof HTMLElement) {
		elements = [selector];
	} else if (selector instanceof NodeList) {
		elements = Array.from(selector);
	} else {
		console.log('Argument "' + selector + '" isn\'t a valid argument for basabasa');
	}

	elements.forEach(function (slider) {
		new ComparisonSlider(slider, options);
	});
}
