import "/src/styles/global.scss";
import Gumshoe from "gumshoejs"
import "/src/fonts/fontawesome/css/fontawesome.css";
import "/src/fonts/fontawesome/css/solid.css";
import "/src/fonts/fontawesome/css/regular.css";


/*!
 * main JS
 */

var Util = {}

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

(function() {
	var Modal = function(element) {
		this.element = element;
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.moveFocusEl = null; // focus will be moved to this element when modal is open
		this.modalFocus = this.element.getAttribute('data-modal-first-focus') ? this.element.querySelector(this.element.getAttribute('data-modal-first-focus')) : null;
		this.selectedTrigger = null;
		this.preventScrollEl = this.getPreventScrollEl();
		this.showClass = "modal--is-visible";
		this.initModal();
	};

	Modal.prototype.getPreventScrollEl = function() {
		var scrollEl = false;
		var querySelector = this.element.getAttribute('data-modal-prevent-scroll');
		if(querySelector) scrollEl = document.querySelector(querySelector);
		return scrollEl;
	};

	Modal.prototype.initModal = function() {
		var self = this;
    const myTimeout = setTimeout(function () {
      Util.addClass(self.element, 'modal--active')
    }, 1);
		//open modal when clicking on trigger buttons
		if ( this.triggers ) {
			for(var i = 0; i < this.triggers.length; i++) {
				this.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					if(Util.hasClass(self.element, self.showClass)) {
						self.closeModal();
						return;
					}
					self.selectedTrigger = event.currentTarget;
					self.showModal();
					self.initModalEvents();
				});
			}
		}

		// listen to the openModal event -> open modal without a trigger button
		this.element.addEventListener('openModal', function(event){
			if(event.detail) self.selectedTrigger = event.detail;
			self.showModal();
			self.initModalEvents();
		});

		// listen to the closeModal event -> close modal without a trigger button
		this.element.addEventListener('closeModal', function(event){
			if(event.detail) self.selectedTrigger = event.detail;
			self.closeModal();
		});

		// if modal is open by default -> initialise modal events
		if(Util.hasClass(this.element, this.showClass)) this.initModalEvents();
	};

	Modal.prototype.showModal = function() {
		var self = this;
		Util.addClass(this.element, this.showClass);
		this.getFocusableElements();
		if(this.moveFocusEl) {
			// this.moveFocusEl.focus();
			// wait for the end of transitions before moving focus
			// this.element.addEventListener("transitionend", function cb(event) {
			// 	self.moveFocusEl.focus();
			// 	self.element.removeEventListener("transitionend", cb);
			// });
		}
		this.emitModalEvents('modalIsOpen');
		// change the overflow of the preventScrollEl
		if(this.preventScrollEl) this.preventScrollEl.style.overflow = 'hidden';
	};

	Modal.prototype.closeModal = function() {
		if(!Util.hasClass(this.element, this.showClass)) return;
		Util.removeClass(this.element, this.showClass);
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.moveFocusEl = null;
		if(this.selectedTrigger) this.selectedTrigger.focus();
		//remove listeners
		this.cancelModalEvents();
		this.emitModalEvents('modalIsClose');
		// change the overflow of the preventScrollEl
		if(this.preventScrollEl) this.preventScrollEl.style.overflow = '';
	};

	Modal.prototype.initModalEvents = function() {
		//add event listeners
		this.element.addEventListener('keydown', this);
		this.element.addEventListener('click', this);
	};

	Modal.prototype.cancelModalEvents = function() {
		//remove event listeners
		this.element.removeEventListener('keydown', this);
		this.element.removeEventListener('click', this);
	};

	Modal.prototype.handleEvent = function (event) {
		switch(event.type) {
			case 'click': {
				this.initClick(event);
			}
			case 'keydown': {
				this.initKeyDown(event);
			}
		}
	};

	Modal.prototype.initKeyDown = function(event) {
		if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
			//trap focus inside modal
			this.trapFocus(event);
		} else if( (event.keyCode && event.keyCode == 13 || event.key && event.key == 'Enter') && event.target.closest('.js-modal__close')) {
			event.preventDefault();
			this.closeModal(); // close modal when pressing Enter on close button
		}	
	};

	Modal.prototype.initClick = function(event) {
		//close modal when clicking on close button or modal bg layer 
		if( !event.target.closest('.js-modal__close') && !Util.hasClass(event.target, 'js-modal') ) return;
		event.preventDefault();
		this.closeModal();
	};

	Modal.prototype.trapFocus = function(event) {
		if( this.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of modal
			event.preventDefault();
			this.lastFocusable.focus();
		}
		if( this.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of modal
			event.preventDefault();
			this.firstFocusable.focus();
		}
	}

	Modal.prototype.getFocusableElements = function() {
		//get all focusable elements inside the modal
		var allFocusable = this.element.querySelectorAll(focusableElString);
		this.getFirstVisible(allFocusable);
		this.getLastVisible(allFocusable);
		this.getFirstFocusable();
	};

	Modal.prototype.getFirstVisible = function(elements) {
		//get first visible focusable element inside the modal
		for(var i = 0; i < elements.length; i++) {
			if( isVisible(elements[i]) ) {
				this.firstFocusable = elements[i];
				break;
			}
		}
	};

	Modal.prototype.getLastVisible = function(elements) {
		//get last visible focusable element inside the modal
		for(var i = elements.length - 1; i >= 0; i--) {
			if( isVisible(elements[i]) ) {
				this.lastFocusable = elements[i];
				break;
			}
		}
	};

	Modal.prototype.getFirstFocusable = function() {
		if(!this.modalFocus || !Element.prototype.matches) {
			this.moveFocusEl = this.firstFocusable;
			return;
		}
		var containerIsFocusable = this.modalFocus.matches(focusableElString);
		if(containerIsFocusable) {
			this.moveFocusEl = this.modalFocus;
		} else {
			this.moveFocusEl = false;
			var elements = this.modalFocus.querySelectorAll(focusableElString);
			for(var i = 0; i < elements.length; i++) {
				if( isVisible(elements[i]) ) {
					this.moveFocusEl = elements[i];
					break;
				}
			}
			if(!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
		}
	};

	Modal.prototype.emitModalEvents = function(eventName) {
		var event = new CustomEvent(eventName, {detail: this.selectedTrigger});
		this.element.dispatchEvent(event);
	};

	function isVisible(element) {
		return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
	};

	window.Modal = Modal;

	//initialize the Modal objects
	var modals = document.getElementsByClassName('js-modal');
	// generic focusable elements string selector
	var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
	if( modals.length > 0 ) {
		var modalArrays = [];
		for( var i = 0; i < modals.length; i++) {
			(function(i){modalArrays.push(new Modal(modals[i]));})(i);
		}

		window.addEventListener('keydown', function(event){ //close modal window on esc
			if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
				for( var i = 0; i < modalArrays.length; i++) {
					(function(i){modalArrays[i].closeModal();})(i);
				};
			}
		});
	}
}());



function swiper(el) {
	let isDown = false;
	let startX;
	let scrollLeft;
	
	el.addEventListener('mousedown', (e) => {
		isDown = true;
		el.classList.add('active');
		startX = e.pageX - el.offsetLeft;
		scrollLeft = el.scrollLeft;
	});
	
	el.addEventListener('mouseleave', () => {
		isDown = false;
		el.classList.remove('active');
	});
	
	el.addEventListener('mouseup', () => {
		isDown = false;
		el.classList.remove('active');
	});
	
	el.addEventListener('mousemove', (e) => {
		if (!isDown) return;  // stop the fn from running
		e.preventDefault();
		const x = e.pageX - el.offsetLeft;
		const walk = (x - startX) * 2;
		el.scrollLeft = scrollLeft - walk;
	});
	
	el.addEventListener('touchstart', (e) => {
		isDown = true;
		el.classList.add('active');
		startX = e.pageX - el.offsetLeft;
		scrollLeft = el.scrollLeft;
	});
	
	el.addEventListener('touchend', () => {
		isDown = false;
		el.classList.remove('active');
	});
	
	el.addEventListener('touchcancel', () => {
		isDown = false;
		el.classList.remove('active');
	});
	
	el.addEventListener('touchmove', (e) => {
		if (!isDown) return;  // stop the fn from running
		e.preventDefault();
		const x = e.pageX - el.offsetLeft;
		const walk = (x - startX) * 1;
		el.scrollLeft = scrollLeft - walk;
	});
}

var swiper_el = document.querySelectorAll('.overflow-slide > *');
var swiper_els = Array.prototype.slice.call(swiper_el);

for (let i = 0; i < swiper_els.length; i++) {
	swiper(swiper_els[i])
}

var gumshoe_el = document.querySelectorAll('.js-gumshoe')
if (gumshoe_el.length > 0) {
	var scroll_to_spy = new Gumshoe('.js-gumshoe a', {
		navClass: 'is-active',
		offset: 150
	});
}

function stepThrough(el) {
	const activeClass = "active"
	el.setAttribute("data-current-step", 1)
	el.stepEls = el.querySelectorAll("[data-step-number]")
	el.nextBtn = el.querySelectorAll(".js-next-step")
	el.prevBtn = el.querySelectorAll(".js-previous-step")
	el.toBtn = el.querySelectorAll(".js-to-step")

	el.getCurrentStep = function() {
		return parseInt(this.getAttribute("data-current-step"))
	}

	el.setCurrentStep = function(stepInt) {
		this.setAttribute("data-current-step", stepInt)
	}

	el.removeDisplayClasses = function() {
		el.stepEls.forEach((step) => step.classList.remove(activeClass))
	}

	el.addDisplayClass = function() {
		const current = el.querySelectorAll('[data-step-number="'+ el.getCurrentStep() +'"]')
		if (current.length > 0) {
			current[0].classList.add(activeClass)
		}
	}

	el.setStep = function (stepInt) {
		el.setCurrentStep(stepInt)
		el.removeDisplayClasses()
		el.addDisplayClass()
	}

	el.nextBtn.forEach((btn) => btn.addEventListener('click', () => {
		const stepInt = el.getCurrentStep() + 1
		el.setStep(stepInt)
	}))

	el.prevBtn.forEach((btn) => btn.addEventListener('click', () => {
		const stepInt = el.getCurrentStep() - 1
		el.setStep(stepInt)
	}))

	el.toBtn.forEach((btn) => btn.addEventListener('click', () => {
		const stepInt = btn.getAttribute("data-step-to")
		el.setStep(stepInt)
	}))

	el.addDisplayClass()

}

var stepThrough_el = document.querySelectorAll('.js-stepthrough');
var stepThrough_els = Array.prototype.slice.call(stepThrough_el);
for (let i = 0; i < stepThrough_els.length; i++) {
	stepThrough(stepThrough_els[i])
}