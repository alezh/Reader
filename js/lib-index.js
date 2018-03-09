var Index = {
	openMenu:function(){
		plus.webview.startAnimation({
			'view': _self,
			'styles': {
				'fromLeft': '0',
				'toLeft': "70%"
			},
			'action': 'show'
		}, {
			'view': menu,
			'styles': {
				'fromLeft': "-70%",
				'toLeft': '0'
			},
			'action': 'show'
		},
		function(e) {
			//console.log(JSON.stringify(e));
			if(e.id == menu.id) { //侧滑菜单打开
			}
		}.bind(this)
	)},
	closeMenu:function() {
		plus.webview.startAnimation({
				'view': _self,
				'styles': {
					'fromLeft': '70%',
					'toLeft': "0"
				},
				'action': 'show'
			}, {
				'view': menu,
				'styles': {
					'fromLeft': "0",
					'toLeft': '-70%'
				},
				'action': 'show'
			},
			function(e) {
				console.log(JSON.stringify(e));
				if(e.id == _self.id) {}
			}.bind(this)
		)
	},
	init:function(){
		var btnArray = ['确认', '取消'];
		mui("#list").on('tap', '.mui-btn', function(event){
			var elem = this;
			var li = elem.parentNode.parentNode;
			mui.confirm('确认删除该条记录？', 'Hello MUI', btnArray, function(e) {
				if (e.index == 0) {
					li.parentNode.removeChild(li);
				}else{
					setTimeout(function() {
						mui.swipeoutClose(li);
					}, 0);
				}
			});
		});
		//主列表点击事件
		mui('#list').on('tap', 'a', function() {
			var href = this.getAttribute('href');
			//非plus环境，直接走href跳转
			if(!mui.os.plus) {
				location.href = href;
				return;
			}
			var id = this.getAttribute("data-wid");
			if(!id) {
				id = href;
			}
			if(href && ~href.indexOf('.html')){
				mui.openWindow({
					id:'Reader',
					url:href,
					show:{
						autoShow:true,
						aniShow:'slide-in-bottom',
//						duration:'200'
					},
					extras:{
						pageId:id
					}
				});
			}
		});
		//安卓退出
		var _toast = false;
	    mui.back = function() {
	    	if(parseInt(_self.getStyle().left) > 0) {
			    closeMenu();
			    return;
		    }
		    if(!_toast || !_toast.isVisible()) {
			    _toast = mui.toast('再按一次返回键退出<br>点此可&nbsp;<span style="border-bottom:1px solid #fff" onclick="openFeedback();">反馈意见</span>', {
			    	duration: 'long',
			    	type: 'div'
			    });
		    } else {
			    plus.runtime.quit();
		    }
	    }	    
	    //重写mui.menu方法，Android版本menu按键按下可自动打开、关闭侧滑菜单；
		mui.menu = function() {
			if(parseInt(_self.getStyle().left) > 0) {
				Index.closeMenu();
			} else {
				Index.openMenu();
			}
		}
	},
	pulldownRefresh:function(){
		console.log("Refresh");
		mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
	}
}
