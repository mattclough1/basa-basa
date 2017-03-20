class ComparisonSlider {
	constructor(elem, opts) {
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
		}
		this.options = opts;

		// Bind event handlers
		this.handleSliderDragStart = this.handleSliderDragStart.bind(this);
		this.handleSliderDrag = this.handleSliderDrag.bind(this);
		this.setupDragListeners = this.setupDragListeners.bind(this);
		this.handleSliderDragEnd = this.handleSliderDragEnd.bind(this);
		this.setSliderBounds = this.setSliderBounds.bind(this);
		this.setSliderDimensions = this.setSliderDimensions.bind(this);
		this.handleWindowResize = this.handleWindowResize.bind(this);

		// Store images
		this.overImage = elem.children[0];
		this.underImage = elem.children[1];

		// Create wrapper
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add('basabasa__wrapper');

		// Create slider slider element
		this.elem = document.createElement('div');
		this.elem.classList.add('basabasa__element');

		// Create handle element
		this.handle = document.createElement('div');
		this.handle.classList.add('basabasa__handle');
		this.handle.setAttribute('class', `${this.handle.getAttribute('class')} ${this.options.handleClass}`);

		// Create shade element
		this.shade = document.createElement('div');
		this.shade.classList.add('basabasa__shade');
		this.shade.style.height = '100%';

		// Create shade image wrapper
		this.shadeImageWrapper = document.createElement('div');
		this.shadeImageWrapper.classList.add('basabasa__shade-wrapper');
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
		this.shade.style.width = `${this.state.percent.width}%`;

		if ((this.underImage.complete && this.underImage.naturalWidth) && (this.overImage.complete && this.overImage.naturalWidth)) {
			this.init(elem);
		}
	}

	init(elem) {
		// Replace the original thing
		elem.innerHTML = '';
		elem.appendChild(this.wrapper);
		elem.imageCompare = this;

		// Set underImage to 100% width
		this.underImage.style.cssText = 'display: block; width: 100%;';
		this.overImage.style.cssText = `display: block; width: ${window.getComputedStyle(this.underImage).width}; height: 100%; object-fit: cover;`;

		// Set padding for handle overflow
		const { width: handleWidth } = window.getComputedStyle(this.handle);
		const handlePadding = parseInt(handleWidth)/ 2;
		this.wrapper.style.cssText = `padding-left: ${handlePadding}px; padding-right: ${handlePadding}px`;

		// Setup window resize listeners
		window.addEventListener('resize', this.handleWindowResize);
	}

	setSliderDimensions() {
		const { width, height } = window.getComputedStyle(this.elem);
		this.state.dimensions = {
			width: parseInt(width, 10),
			height: parseInt(height, 10)
		}
	}

	setSliderBounds() {
		const { left, top } = this.elem.getBoundingClientRect();
		const { width, height } = window.getComputedStyle(this.elem);
		const bounds = {
			left,
			right: left + parseInt(width, 10),
			top,
			bottom: top + parseInt(height, 10)
		};
		this.state.sliderBounds = bounds;
	}

	handleWindowResize() {
		this.setSliderBounds();
		// Set underImage to 100% width
		this.overImage.style.width = window.getComputedStyle(this.underImage).width;
	}

	handleSliderDragStart(e) {
		const clientX = e.clientX || e.touches[0].clientX;
		const clientY = e.clientY || e.touches[0].clientY;
		// Set the bounds and dimensions of the slider on the screen
		this.setSliderBounds();
		this.setSliderDimensions();
		// Update state
		this.state.dragging = true;
		this.state.dragOrigin = { x: clientX, y: clientY };
		// Setup drag listeners on document
		this.setupDragListeners();
	}

	setupDragListeners() {
		document.addEventListener('mousemove', this.handleSliderDrag);
		document.addEventListener('touchmove', this.handleSliderDrag);
		document.addEventListener('mouseup', this.handleSliderDragEnd);
		document.addEventListener('touchend', this.handleSliderDragEnd);
	}

	handleSliderDragEnd() {
		this.state.dragging = false;
		this.state.percent = this.state.latestPercent;
		this.state.latestPercent = 0;
		document.removeEventListener('mousemove', this.handleSliderDrag);
		document.removeEventListener('touchmove', this.handleSliderDrag);
		document.removeEventListener('mouseup', this.handleSliderDragEnd);
		document.removeEventListener('touchend', this.handleSliderDragEnd);
	}

	handleSliderDrag(e) {
		e.stopPropagation();
		e.preventDefault();
		const clientX = e.clientX || e.touches[0].clientX;
		const clientY = e.clientY || e.touches[0].clientY;
		const { width, height } = this.state.dimensions;
		const { x: ogX, y: ogY } = this.state.dragOrigin;
		const { width: pWidth, height: pHeight } = this.state.percent;
		const diff = {
			x: ((ogX - clientX) / width) * 100,
			y: ((ogY - clientY) / height) * 100
		}
		const percent = {
			width: Math.max(0, Math.min(pWidth - diff.x, 100)),
			height: Math.max(0, Math.min(pHeight - diff.y))
		};
		this.state.latestPercent = percent;
		this.shade.style.width = `${percent.width}%`;
	}
}

export default function basabasa(selector, options) {
	let elements;
	if (typeof(selector) === 'string') {
		elements = document.querySelectorAll(selector);
	} else if (selector instanceof HTMLElement) {
		elements = [selector];
	} else if (selector instanceof NodeList) {
		elements = Array.from(selector);
	} else {
		console.log(`Argument "${selector}" isn't a valid argument for basabasa`);
	}

	elements.forEach((slider) => {
		new ComparisonSlider(slider, options);
	});
}
