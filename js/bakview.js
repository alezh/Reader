(function($, window) {
//	var CLASS_PAGE_SHADOW = $.className('page-shadow');
	var CLASS_TRANSITIONING = "transitioning";
	
	var View = $.Class.extend({
		init: function(element, options){
			this.view = this.element = element;
			this.options = $.extend({
				hardwareAccelerated: true
			}, options);
			this.pages = this.view.querySelectorAll(".b-pages");
			this.historys = null; //history
			this.maxScrollX = this.view.offsetWidth;
			this.moved = this.dragging = this.IsAnimation = this.abs = false;
			this.prev = 2;
			this.next = 5;
			this.x = this.y = 0;
			this.translateZ = this.options.hardwareAccelerated ? ' translateZ(0)' : '';
			this.ratio = 0;
			this.book = new Map();
			this.chapterId = '';
			this.activePage = this.previousPage  = null ;		
			this.cacheChapter = new Map();
			this._initPage();
			this._initDefaultPage(this.options.bookId);
			this.initEvent();
		},
		_initDefaultPage:function(bookId){
			
			var listUrl = this.options.ChapterList + bookId + this.options.Site;
			//获取章节列表选择章节
			this._ajax(listUrl,this._ChapterListStorage);
			//TODO::显示一页，翻页时候填充下一页数据
			var chapter = this.options.Chapter + this.chapterId
			//获取章节内容
			this._ajax(chapter,this._Chapter);			
		},
		_initPage:function(){
			this.Maxheight = this.options.Maxheight
			this.MaxLine = Math.round(this.Maxheight / this.options.lineHeight) - 1 ;
			this.lines = 0; //显示的行数
			this.width = window.screen.availWidth - 20 ; //每行宽度
			this.fontSize = 14; //字体大小 14px
			this.len = 0; //每行长度
			this.divHeight = Maxheight + 20 +'px';
			this.divWidth = window.screen.availWidth +'px';
			this.indexPage = 0;
			this.nowDiv = 0
			this.chapter = null;
			this.initLineLen();
		},
		initLineLen:function(fontSize){
			this.fontSize = fontSize || this.fontSize
			this.len = Math.round(this.width / this.fontSize);
		},
		initEvent: function() {
			this.view.addEventListener('click', this);
			this.view.addEventListener('tap', this);
			for(var v of this.pages){
				v.addEventListener('drag', this)
				v.addEventListener('dragend', this)
				v.addEventListener('webkitTransitionEnd', this)
			}			
		},
		handleEvent: function(event) {
			switch (event.type) {
				case 'click':
//				console.log(event.target.offsetParent.className,event.target.offsetParent.id)
//					this._click(event);
					break;
				case 'tap':
//				console.log(document.querySelector("html").innerHTML)
//					this._tap(event);
					break;
				case 'drag':
//				console.log(this.chapterId)
//				console.log(JSON.stringify(event.currentTarget.id,event.currentTarget.id))
					this._drag(event);
					break;
				case 'dragend':
					this._dragend(event);
					break;
				case 'webkitTransitionEnd':
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
				this.abs = detail.deltaX > 0 ? true : (detail.deltaX <0 ? false : 0)
				this.isBack = this.abs;
				this._initPageTransform(event);
				this._paginate(this.abs);
			}
			if(this.isBack != this.abs){
				return
			}
			if (this.dragging){
				var deltaX = 0;				
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
//			for(var div of this.options.AryDiv){
//				if("#" + event.currentTarget.id !== div){
//					this.previousPage = this.view.querySelector(div);
//				}
//			}
			this.previousPage = null;
			this.previousPage = event.currentTarget.nextElementSibling 
			if(this.previousPage == null){
				this.previousPage = event.currentTarget.previousSibling.previousSibling;
			}
			this.activePage = event.currentTarget;
			console.log(this.previousPage.id,this.activePage.id);
			if(this.activePage){
				//添加影子
				this.activePageClassList = this.activePage.classList;
				this.activePageStyle = this.activePage.style;		
				this.activePage.classList.add("shadow");
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
			this.historys = this.activePage;
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
				this.IsAnimation = true;
				this.setTranslate(this.maxScrollX, 0);				
			}else if(this.ratio < -0.2){
				this.IsAnimation = true;
				this.setTranslate(-this.maxScrollX, 0);				
			}else {
				this.IsAnimation = false;
				this._cleanStyle(this.activePage);
				this._cleanStyle(this.previousPage);
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
			if(this.IsAnimation){				
				//动画完成后处理
				this._netherSwap()
			}
		},
		_netherSwap:function(){
			this.previousPage.classList.add("maxZindex");
//			this.previousPage.classList.remove("minZindex");
//			this.activePage.classList.add("minZindex");
			this.activePage.classList.remove("maxZindex");
			this.activePage.style.webkitTransform = ''
//			this.activePage.removeAttribute("style")
//			this.activePage.style.height = this.Maxheight + 40 +'px'
//			this.activePage.style.width = window.screen.availWidth +'px';
		},
		
		
		
		_ajax:function(url,callback){
			var self = this
			mui.ajax(url,{
				dataType:'json',//服务器返回json格式数据
				type:'get',//HTTP请求类型
				timeout:10000,//超时时间设置为10秒；
				async: false,
				headers:{'Content-Type':'application/json'},
				success:function(data){
					//服务器返回响应，根据响应结果，分析是否登录成功；
					if (data.code === 200) {
						if (typeof callback === "function") {
							callback(data.data,self);
						}
					}
				},
				error:function(xhr,type,errorThrown){
					//异常处理；
					console.log(type);
				}
			});
		},
		_ChapterListStorage:function(json,self){
//			plus.storage.setItem(self.options.bookId,JSON.stringify(json))
			var v = window.localStorage.getItem("now"+self.options.bookId)
			if(v != undefined){
				//获取当前阅读的章节
				var i=0;
				var key = 0;
				for (; i < json.length; i++){
					if(json[i]["_id"] === v){
						self.chapterId = v;
						break;
					}
				}
				for(var k=1;k<self.next;k++){
					key = i+k;
					if(json[key]){						
						self.cacheChapter.set(key,json[key]);
					}						
				}
				//TODO::获取其他章节做缓存  上3 中1 下5
				if(i === 0){					
					return;
				}
				for(var k=1;k<self.prev;k++){
					key = i - k;
					if(json[key]){
						self.cacheChapter.set(key,json[key]);
					}
				}
			}else{
				self.chapterId = json[0]._id
				window.localStorage.setItem("now"+self.options.bookId,self.chapterId)
			}
			if(!self.chapterId){
				return
			}
//			window.localStorage.removeItem("now"+self.options.bookId);
		},
		_Chapter:function(json,self){
			//当前章节处理并显示
//			console.log(JSON.stringify(json))
			self.book.set(self.chapterId,self._prepareBody(json));
			//初始化页面
			self._view();
		},
		_view:function(index,page,chapterId){
			//TODO::页码记录！
			this.chapterId = chapterId || this.chapterId ;
			this.indexPage = page || this.indexPage;
			this.nowDiv = index || this.nowDiv
			var ps = this.chapter = this.book.get(this.chapterId);			
			var body = document.querySelector(this.options.AryDiv[0]);
			this.nowDiv++;
			for(var p of ps[this.indexPage]){
				body.appendChild(p);
			}
			this.indexPage++;
			return
		},
		_readJson:function(){
			plus.io.resolveLocalFileSystemURL( "_www/data/book.json", function(entry) {
				// 可通过entry对象操作test.html文件
				entry.file( function(file){
					var fileReader = new plus.io.FileReader();
					alert("getFile:" + JSON.stringify(file));
					fileReader.readAsText(file, 'utf-8');
					fileReader.onloadend = function(evt) {
						alert("11" + evt);
						alert("evt.target" + evt.target);
						alert(evt.target.result);
					}
					alert(file.size + '--' + file.name);
				} );
			}, function ( e ) {
				alert( "Resolve file URL failed: " + e.message );
			});
		},
		_prepareBody:function(value){
			var pages = [];
			let div  = [];
			var title = document.createElement("h6");
			var body = value.body.split('\n'); //切分
			var v = body.shift();
			title.innerText = value.title;
			div.push(title);
			this.lines++;
			for(; v != undefined ; v = body.shift()){
				var page = this._prepareJson(v)
				if(page[1] === 0){
					div.push(this._writeTXT(page[0]));
				}else if(page[1] === 2){
					pages.push(div);
					div = [];
					this.lines = 0 ;
					this.mathLen(page[0]);
					div.push(this._writeTXT(page[0]));
				}else{
					div.push(this._writeTXT(page[0]));
					pages.push(div);
					div = [];
					this.lines = 0 ;
					this.mathLen(page[1]);
					div.push(this._writeTXT(page[1],true));
				}
			}
			pages.push(div);
			return pages;
		},
		_prepareJson:function(value,i){
			var len = this.mathLen(value)
			if(this.lines <= this.MaxLine){
				return [value,0]
			}else{
				//超出时切分				
				var c = this.MaxLine - (this.lines - len);
				if(c <= 0){
					return [value,2]
				}
				return this.cutstr(value,c);
			}
		},
		mathLen:function(str){
			var len = Math.ceil(str.length / this.len);
			this.lines += len;
			return len
		},
		cutstr:function(txt,line){
			var len = line * (this.len) - 4;// -4空格符合
			return [txt.substr(0,len),txt.substr(len,txt.length)]
		},
		_writeTXT:function(txt,a){
			var para = document.createElement("p");
			if(a){
				para.innerHTML = txt;
			}else{
				para.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+ txt;
			}
			return para
		},
		_paginate:function(abs){
			if(abs){
				this._previousDiv();
			}else{
				if(this.indexPage>1){
					return
				}
				this._nextDiv();
			}
		},
		_nextDiv:function(){
			var pages = this.book.get(this.chapterId);
			pages = pages[this.indexPage]
			if(pages != undefined){
				for(var p of pages){
					console.log(p.innerText)
					this.previousPage.appendChild(p);
				}
				if(this.IsAnimation){
					this.indexPage++;
				}
			}
			return
		},
		_previousDiv:function(){
			console.log("o")
		}
		
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
