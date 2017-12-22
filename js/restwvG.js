var restwvG = function(id, options) {
	this.id = id;
	this.options = options;
	this.styles = options.styles;
	this.items = options.items;
	this.onChange = options.onChange
	this.options.index = options.index || 0;
	this.webviews = {};
	this.webviewContexts = {};
	this.currentWebview = false;
	this._init();
};

var protox = restwvG.prototype;

protox._init = function() {
	this._initParent();
	this._initNativeView();
	this._initWebviewContexts(this.options.index);
};
protox._initParent = function() {
	this.parent = plus.webview.getWebviewById(this.id);
	if(!this.parent) {
		//如果没有父类创建新父类
		this.parent = plus.webview.create(this.id, this.id);
		this.parent.show('none');
	}
};
protox._initNativeView = function() {
	// fixed by wmy 因为沉浸式应用，需要额外加上状态栏高度
	var statusbar_H = plus.navigator.getStatusbarHeight(); 
	this.nativeView = new plus.nativeObj.View('__MUI_TAB_NATIVE', {
		'top': statusbar_H +'px', //这个需要根据顶部导航及顶部选项卡高度自动调整
		'height': window.screen.height +"px",
		'left': '100%',
		'width': '100%',
		"backgroundColor":"#ffffff"
	});
	this.nativeView.show();
};