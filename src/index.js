class ComparisonSlider {
	constructor(ogElem, opts = {}) {
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
		this.ogElem = ogElem;
		this.options = opts;

		// Bind event handlers
		this.handleSliderDragStart = this.handleSliderDragStart.bind(this);
		this.handleSliderDrag = this.handleSliderDrag.bind(this);
		this.setupDragListeners = this.setupDragListeners.bind(this);
		this.handleSliderDragEnd = this.handleSliderDragEnd.bind(this);
		this.setSliderBounds = this.setSliderBounds.bind(this);
		this.setSliderDimensions = this.setSliderDimensions.bind(this);
		this.handleWindowResize = this.handleWindowResize.bind(this);
        this.init = this.init.bind(this);

		// Store images
		this.overImage = ogElem.children[0];
		this.underImage = ogElem.children[1];

        // Set image styles
        this.underImage.style.cssText = 'display: block;';
        this.overImage.style.cssText = `display: block; height: 100%; object-fit: cover; max-width: none;`;

		// Create wrapper
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add('comparison-slider__wrapper');
        this.wrapper.style.display = 'inline-block';

		// Create slider slider element
		this.elem = document.createElement('div');
		this.elem.classList.add('comparison-slider');
        this.elem.style.position = 'relative';

		// Create handle element
		this.handle = document.createElement('div');
		this.handle.classList.add('comparison-slider__handle');
        // Set handle class to class in options if it exists
        if (this.options.handleClass) {
            const handleClass = this.handle.getAttribute('class');
            this.handle.setAttribute('class', `${handleClass} ${this.options.handleClass}`);
        }
        this.handle.style.cssText = `
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #fff;
            position: absolute;
            top: 50%;
            right: 0;
            transform: translate(50%, -50%);
            box-shadow: 0 3px 5px rgba(0,0,0,0.15);
            cursor: -webkit-grab;
        `;

        // Set up drag start for non-touch devices
		this.handle.addEventListener('mousedown', this.handleSliderDragStart);

		// Set up drag start for touch devices
		this.handle.addEventListener('touchstart', this.handleSliderDragStart);

		// Create shade element
		this.shade = document.createElement('div');
		this.shade.classList.add('comparison-slider__shade');
		this.shade.style.cssText = 'position: absolute; top: 0; left: 0; height: 100%;';

		// Create shade image wrapper
		this.shadeImageWrapper = document.createElement('div');
		this.shadeImageWrapper.classList.add('comparison-slider__shade-wrapper');
		this.shadeImageWrapper.style.cssText = 'width: 100%; overflow: hidden; height: 100%;';

		// Put everything together
		this.shadeImageWrapper.appendChild(this.overImage);
		this.shade.appendChild(this.shadeImageWrapper);
		this.shade.appendChild(this.handle);
		this.elem.appendChild(this.underImage);
		this.elem.appendChild(this.shade);
		this.wrapper.appendChild(this.elem);

		// Set initial position of shade
		this.shade.style.width = `${this.state.percent.width}%`;

        // Replace the original thing
		this.ogElem.innerHTML = '';
		this.ogElem.appendChild(this.wrapper);
		this.ogElem.imageCompare = this;

        // Init on window load
        window.addEventListener('load', this.init);
	}

	init() {
        this.setSliderBounds();
		// Set underImage to 100% width
		this.overImage.style.width = window.getComputedStyle(this.underImage).width;

		// Set padding for handle overflow
		const { width: handleWidth } = window.getComputedStyle(this.handle);
		const handlePadding = parseInt(handleWidth) / 2;
		this.wrapper.style.paddingLeft = `${handlePadding}px`;
        this.wrapper.style.paddingRight = `${handlePadding}px`;

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
