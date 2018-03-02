(function($, window) {
//	var CLASS_PAGE_SHADOW = $.className('page-shadow');
	var CLASS_TRANSITIONING = "transitioning";
	
	var View = $.Class.extend({
		init: function(element, options){
			this.view = this.element = element;
			this.options = $.extend({
//				animateNavbar: 'ios', //ios
//				beforePageActiveArea: 130,
//				afterPageActiveArea: 130,
				hardwareAccelerated: true
			}, options);
			this.pages = this.view.querySelectorAll(".b-pages");
			this.history = []; //history
			this.maxScrollX = this.view.offsetWidth;
			this.moved = this.dragging = false;
			this.x = this.y = 0;
			this.translateZ = this.options.hardwareAccelerated ? ' translateZ(0)' : '';
			this.ratio = 0;
//			this._initDefaultPage();
			this.initEvent();
			this.activePage = this.previousPage = null;
		},
		initEvent: function() {
			this.view.addEventListener('click', this);
			this.view.addEventListener('tap', this);
			var self = this
			this.pages.forEach(function(v,i){
				
				v.addEventListener('drag', self)
				v.addEventListener('dragend', self)
				v.addEventListener('webkitTransitionEnd', self)
			});
		},
		handleEvent: function(event) {
			switch (event.type) {
				case 'click':
				console.log('click')
//					this._click(event);
					break;
				case 'tap':
				console.log('tap')
//					this._tap(event);
					break;
				case 'drag':
//				console.log(JSON.stringify(event.currentTarget.innerHTML))
					this._drag(event);
					break;
				case 'dragend':
					this._dragend(event);
					break;
				case 'webkitTransitionEnd':
//				console.log(JSON.stringify(event.currentTarget.id))
					this._webkitTransitionEnd(event);
					break;
			}
		},
		_drag: function(event){
			if (this.isInTransition) {
				return;
			}
			var detail = event.detail;
			if (!this.dragging) {
				this.isBack = true;
				this._initPageTransform(event);
			}			
			if (this.dragging){
				var deltaX = 0;
				var abs = detail.deltaX >0 ? true : (detail.deltaX <0 ? false : 0)
				if (!this.moved){
					deltaX = detail.deltaX;
					$.gestures.session.lockDirection = true; //锁定方向
					$.gestures.session.startDirection = detail.direction;
				}else{
					deltaX = detail.deltaX - ($.gestures.session.prevTouch && $.gestures.session.prevTouch.deltaX || 0);
				}
				
				var newX = this.x + deltaX;
				
				if(Math.abs(newX) > this.maxScrollX){
					newX = newX < 0 && newX < - this.maxScrollX ? -this.maxScrollX : (newX>0 && newX > this.maxScrollX?this.maxScrollX:0 ) 					
				}
				
				event.stopPropagation();
				detail.gesture.preventDefault();
				if (!this.requestAnimationFrame){
					this._updateTranslate();
				}
                this.moved = true;
				this.x = newX;
				this.y = 0;
			}
		},
		_initPageTransform: function(event){
			//当前活动页面初始化
//			this.activePage = this.pages.querySelector();
			this.activePage = event.currentTarget;
			if(this.activePage){
				//添加影子
				this.activePage.classList.add("shadow");
				this.activePageClassList = this.activePage.classList;
				this.activePageStyle = this.activePage.style;
				this.x = 0;
				this.dragging = true;
				return true;
			}
			return false;
		},
		_updateTranslate: function() {
			var self = this;
			if (self.x !== self.lastX || self.y !== self.lastY) {
				self.setTranslate(self.x, self.y);
			}
			self.requestAnimationFrame = requestAnimationFrame(function() {
				self._updateTranslate();
			});
		},
		setTranslate: function(x, y) {
			this.x = x;
			this.y = y;
			this.activePage.style['webkitTransform'] = this._getTranslateStr(x, y);
			this.lastX = this.x;
			this.lastY = this.y;
		},
		_getTranslateStr: function(x, y) {
			if (this.options.hardwareAccelerated) {
				return 'translate3d(' + x + 'px,' + y + 'px,0px) ' + this.translateZ;
			}
			return 'translate(' + x + 'px,' + y + 'px) ';
		},
		_dragend: function(event) {
			//结束移动
			if (!this.moved) {
				return;
			}
			event.stopPropagation();
			var detail = event.detail;
			this._clearRequestAnimationFrame();
			this._prepareTransition();
			this.ratio = this.x / this.maxScrollX;
			if (this.ratio === 1 || this.ratio === 0) {
				$.trigger(this.activePage, 'webkitTransitionEnd');
				return;
			}
			//注释:: 全屏代表1   0.4代表移动了2/10
			if (this.ratio > 0.2) {
				this.setTranslate(this.maxScrollX, 0);
			}else if(this.ratio < -0.2){
				this.setTranslate(-this.maxScrollX, 0);
			}else {
				this._cleanStyle(this.activePage);
			}
		},
		_clearRequestAnimationFrame: function() {
			if (this.requestAnimationFrame) {
				cancelAnimationFrame(this.requestAnimationFrame);
				this.requestAnimationFrame = null;
			}
		},
		_prepareTransition: function(){
			//活动页面过渡处理
			this.isInTransition = true;
			this.activePageClassList.add(CLASS_TRANSITIONING);
		},
		_cleanStyle: function(el) {
			if (el) {
				el.style.webkitTransform = '';
				el.style.opacity = '';
			}
		},
		_webkitTransitionEnd: function(event){
			this.dragging = this.moved = false;
			if (this.activePage !== event.currentTarget) {
				return;
			}
			this.isInTransition = false;
			this.activePageClassList.remove(CLASS_TRANSITIONING);
			this.activePage.classList.remove("shadow");
		},
		
		
	});
	
	$.fn.view = function(options) {
		var self = this[0];
		var viewApi = null;
		var id = self.getAttribute('data-view');
		if (!id) {
			id = ++$.uuid;
			$.data[id] = viewApi = new View(self, options);
			self.setAttribute('data-view', id);
		} else {
			viewApi = $.data[id];
		}
		return viewApi;
	}
})(mui, window)
