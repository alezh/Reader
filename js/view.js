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
			this.history = []; //history
			this.maxScrollX = this.view.offsetWidth;
			this.moved = this.dragging = this.IsAnimation = this.abs = this.isNext = false;
			this.prev = -2;
			this.next = 5;
			this.x = this.y = this.chapterLen = 0;
			this.translateZ = this.options.hardwareAccelerated ? ' translateZ(0)' : '';
			this.ratio = 0;
			this.book = new Map();
			this.cacheChapter = new Map();
			this.activePage = this.previousPage = this.chapterId =  null ;	
			this._initDefaultPage(this.options.bookId);
			this.initEvent();
					
		},
		_initDefaultPage:function(bookId){
			this._initPage();			
			var listUrl = this.options.ChapterList + bookId + this.options.Site			
			//获取章节列表选择章节
			this._ajax(listUrl,this._ChapterListStorage,false)
			//TODO::显示一页，翻页时候填充下一页数据
			var chapter = this.options.Chapter + this.chapterId
			//获取章节内容
			this._ajax(chapter,this._Chapter,false);
			this._initCache(true);
			
		},
		_initCache:function(async){
			for(var [key,value] of this.cacheChapter){
				let url = this.options.Chapter + value._id
				if(this.book.has(value._id)){
					continue;
				}
				this._ajax(url,this._cacheChapter,async,value._id);
			}
		},
		_initPage:function(){
			this.Maxheight = this.options.Maxheight
			this.MaxLine = Math.round(this.Maxheight / this.options.lineHeight) ;
			this.lines = 0; //显示的行数
			this.width = window.screen.availWidth - 20 ; //每行宽度
			this.fontSize = 14; //字体大小 14px
			this.len = 0; //每行长度
			this.divHeight = Maxheight + 20 +'px';
			this.divWidth = window.screen.availWidth +'px';
			this.indexPage = 0;
			this.cacheKey = 0
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
				console.log(event.target.offsetParent.id,event.target.offsetParent.className)
//					this._click(event);
					break;
				case 'tap':
//				console.log(JSON.stringify(event.currentTarget.id))
//					this._tap(event);
					break;
				case 'drag':
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
			this.abs = detail.deltaX > 0 ? true : (detail.deltaX <0 ? false : 0)
			let paginate = this._isPaginate();
			if(!this._isNext(paginate)){
				return;
			}
			if (!this.dragging) {
				this.isBack = this.abs;
				this._actverPage(event)
				this._initPageTransform();
				this._paginate(this.abs)				
			}
			if(this.isBack != this.abs){
				//锁死
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
		_actverPage:function(event){
			//当前活动页面初始化
			for(var div of this.options.AryDiv){
				if("#" + event.currentTarget.id !== div){
					this.previousPage = this.view.querySelector(div);
				}
			}
			this.activePage = event.currentTarget;
		},
		_initPageTransform: function(){			
			if(this.activePage && this.previousPage){
				//添加影子
				this.previousPageClassList = this.previousPage.classList;
				this.previousPageStyle = this.previousPage.style;
				this.activePageClassList = this.activePage.classList;
				this.activePageStyle = this.activePage.style;
				if(this.abs){
					//TODO::添加前进后退不同的效果					
					this.previousPage.style['webkitTransform'] = this._getTranslateStr(- this.maxScrollX, 0);
					this.previousPage.classList.add("shadow");					
					this.previousPage.classList.add("maxZindex");
					this.activePage.classList.remove("maxZindex");
					
					this.x = - this.maxScrollX;
				}else{
					this.activePage.classList.add("shadow");
					this.x = 0;
				}				
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
			if(this.abs){
				this.previousPage.style['webkitTransform'] = this._getTranslateStr(x, y);
			}else{
				this.activePage.style['webkitTransform'] = this._getTranslateStr(x, y);
			}			
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
				this.IsAnimation = true;
				this.setTranslate(this.maxScrollX, 0);				
			}else if(this.ratio < -0.2){
				this.IsAnimation = true;
				if(this.abs){
					this.setTranslate(0, 0);	
				}else{
					this.setTranslate(-this.maxScrollX, 0);
				}							
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
			this.previousPageClassList.add(CLASS_TRANSITIONING);
		},
		_cleanStyle: function(el) {
			if (el) {
				el.style.webkitTransform = '';
				el.style.opacity = '';
			}
		},
		_webkitTransitionEnd: function(event){
			this.dragging = this.moved = false;
			if(this.abs){
				if (this.previousPage !== event.currentTarget ) {
					return;
				}
			}else{
				if (this.activePage !== event.currentTarget ) {
					return;
				}
			}
			this.isInTransition = false;
			this.activePageClassList.remove(CLASS_TRANSITIONING);
			this.previousPageClassList.remove(CLASS_TRANSITIONING);
			this.previousPage.classList.remove("shadow");
			this.activePage.classList.remove("shadow");
			if(this.IsAnimation){
				//动画完成后处理
				this._netherSwap()
				this.IsAnimation = false
			}
		},
		_netherSwap:function(){
			this.previousPage.classList.add("maxZindex");
			this.activePage.classList.remove("maxZindex");
			this.activePage.style.webkitTransform = '';
			if(!this.abs){
				this.indexPage++;
			}else if(this.abs){
				this.indexPage--;
			}
			window.localStorage.setItem("index"+this.options.bookId,(this.indexPage - 1));//-1 表示 0-9  不减1-9
		},
		_isPaginate:function(){
			if(this.abs && (this.indexPage-1) <= 0){
				return false;
			}else if(!this.abs && (this.indexPage > this.chapterLen)){
				return false;
			}
			return true;
		},
		
		
		
		_ajax:function(url,callback,async,id){
			var self = this
//			var mask=mui.createMask();
			mui.ajax(url,{
				dataType:'json',//服务器返回json格式数据
				type:'OPTIONS',//HTTP请求类型
				timeout:10000,//超时时间设置为10秒；
				async: async,
				headers:{'Content-Type':'application/json'},
				success:function(data){
					//服务器返回响应，根据响应结果
					if (data.code === 200) {
						if (typeof callback === "function") {
							callback(data.data,self,id);
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
			plus.storage.getItem(self.options.bookId,JSON.stringify(json))
            //读取章节ID
			self._ChapterSort(json)
//			window.localStorage.removeItem("now"+self.options.bookId);
		},
		_ChapterSort:function(json,chapterId){
			var v = chapterId || window.localStorage.getItem("now"+this.options.bookId)
			if(v != undefined){
				//获取当前阅读的章节
				var i=0;
				var key = 0;
				for (; i < json.length; i++){
					if(json[i]["_id"] === v){
						this.chapterId = v;
						break;
					}
				}
				for(let k=1;k<=this.next;k++){
					key = i+k;
					if(json[key]){
						this.cacheChapter.set(k,json[key]);
					}
				}
				for(let k= 0;k>=this.prev;k--){
					key = i+k;
					if(json[key]){
						this.cacheChapter.set(k,json[key]);
					}
				}
			}else{
				this.chapterId = json[0]._id
				window.localStorage.setItem("now"+this.options.bookId,this.chapterId)
			}
			if(!this.chapterId){
				return
			}
		},
		_Chapter:function(json,self){
			//当前章节处理并显示
			self.book.set(self.chapterId,self._prepareBody(json));
			//初始化页面
			self._view();
		},
		_setChapterId:function(id){
			this.chapterId = id;
			window.localStorage.setItem("now"+this.options.bookId,id);
		},
		_view:function(index,chapterId){
			//TODO::页码记录！
			this.chapterId = chapterId || this.chapterId ;
			this.indexPage = index || window.localStorage.getItem("index"+this.options.bookId) || this.indexPage;			
			var ps = this.chapter = this.book.get(this.chapterId);
			this.chapterLen = ps.length - 1;
			this.indexPage = parseInt(this.indexPage) > this.chapterLen ? this.chapterLen : parseInt(this.indexPage);
			var body = document.querySelector(this.options.AryDiv[0]);
			body.innerHTML = '';
			for(var p of ps[this.indexPage]){
				body.appendChild(p);
			}
			this.indexPage++;
			return
		},
		_cacheChapter:function(json,self,id){
			self.book.set(id,self._prepareBody(json));
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
			this.lines = 1;
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
			this.lines = 0 ;
			return pages;
		},
		_prepareJson:function(value,i){
			var len = this.mathLen(value)
			if(this.lines <= this.MaxLine){
				return [value,0,len]
			}else{
				//超出时切分				
				var c = this.MaxLine - (this.lines - len);
				if(c <= 0){
					return [value,2,len]
				}
				return this.cutstr(value,c);
			}
		},
		mathLen:function(str){
			var len = Math.ceil((str.length + 3) / this.len);
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
		JmpChapter:function(){
			var chapter = this.book.get(chapterId);
			let self = this;
			if(chapter){				
				this.options.AryDiv.forEach(function(v,i){
					var d = self.view.querySelector(v);
					if(i%2){
						d.classList.remove("maxZindex");						
					}else{
						d.classList.add("maxZindex");
					}
				});
				this._view('0',chapterId);
			}else{
				var json = plus.storage.getItem(this.options.bookId)
				if(json != undefined){
					json = JSON.parse(json);
					this._ChapterSort(json,chapterId);
					this._initCache(false)
					this._view('0',chapterId);
				}				
			}
		},
		_Fliped:function(index,chapterId){
			chapterId = chapterId || this.chapterId
			var json = plus.storage.getItem(this.options.bookId)
			if(json != undefined){
				json = JSON.parse(json);
				let i = 0;
				for (;i<json.length;i++) {
					if(json[i]._id === chapterId){
						this._setChapterId(json[i]._id);
						break;
					}
				}
				if(i===0){
					return false;
				}
				let key = index<0 ? this.next : this.prev ;
				let cacheChapter = new Map()
				for(let k= 0;k<8;k++){
					i = i + index;
					if(json[i]){
						cacheChapter.set(key,json[i]);
						index< 0 ? --key : ++key ;
					}
				}
				this.cacheChapter = cacheChapter.size > 0 ? cacheChapter : this.cacheChapter;
				this._initCache(false)
				this.cacheKey = index<0 ? 6 : -3;
			}
		},
		_isNext:function(paginate){
			if(this.abs){
				if(paginate){
					return true;
				}
				//TODO::前一章
				if(this._previousChapter()){
					return true;
				}else{
					this._Fliped(-1);
					return this._previousChapter();
				}
				return false;
			}else{
				if(paginate){
					return true;
				}
				//TODO::下一章
				if(this._nextChapter()){
					return true;
				}else{
					this._Fliped(1);
					return this._previousChapter();
				}
				return false;
			}
		},
		_paginate:function(abs){
			if(abs){
				this._previousDiv();
			}else{
				this._nextDiv();
			}
			
		},
		_nextDiv:function(){
			this.previousPage.innerHTML = "";
            var pages = this.chapter[this.indexPage]
			if(pages != undefined){
				for(var p of pages){
					this.previousPage.appendChild(p);
				}
			}
		},
		_previousDiv:function(){
			this.previousPage.innerHTML = "";
            var pages = this.chapter[this.indexPage-2];//2: 下一页 + 当前页
			if(pages != undefined){
				for(var p of pages){
					this.previousPage.appendChild(p);
				}
			}	
		},
		_nextChapter:function(){
			//TODO::下一章
			let newChapter = this.cacheChapter.get((this.cacheKey + 1))
			if(newChapter != undefined){
				this._setChapterId(newChapter._id);
				var ps = this.chapter = this.book.get(newChapter._id);
				this.chapterLen = ps.length - 1;
				this.cacheKey++;
				this.indexPage = 0;
				return true;
			}
			return false;
		},
		_previousChapter:function(){
			//TODO::前一章
			let newChapter = this.cacheChapter.get((this.cacheKey - 1))
			if(newChapter != undefined){
				this._setChapterId(newChapter._id);
				var ps = this.chapter = this.book.get(newChapter._id);
				this.cacheKey--;
				this.indexPage= this.chapter.length + 1;
				this.chapterLen = ps.length - 1;
				return true;
			}
			return false;
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
