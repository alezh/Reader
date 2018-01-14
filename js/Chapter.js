var Chapter = {
	init:function(maxheight,lineHeight,body){
		this.Maxheight = maxheight;
		this.MaxLine = Math.round(maxheight / lineHeight);
		this.BookName='';
		this.chapter = '';
		this.body = body;
		this.lines = 0; //显示的行数
		this.width = window.screen.availWidth - 20 ; //每行宽度
		this.fontSize = 14; //字体大小 14px
		this.len = 0; //每行长度
		this.count = 0;
		this.Linelen()
	},
	jsonload:function(json){
		json = json || plus.storage.getItem(this.BookName+this.chapter)
//		console.log(JSON.stringify(json));
		var title = "<h4>" + json.chapter.title + "</h4>";
		var body = json.chapter.body.split('\n') //切分
		var html='';
		var length = body.length;
		//算行数与字数 显示
		for (var i = 0; i < length; i++){
			var val = body.shift();
			var len = this.mathLen(val)
			if(this.lines < this.MaxLine){
				this.create(val)
			}else{				
				var c = this.MaxLine - (this.lines - len);
				console.log(c);
				if(c>1){
					this.cutstr(val,c)
//					console.log(val);
				}
				break;
			}
		}
	},
	getTxt:function(){
		var self = this
		mui.getJSON("../data/book.json",null,function(data){
			plus.storage.clear();
			plus.storage.setItem(self.BookName+data.chapter.title,data);
			self.jsonload(data);
		});
	},
	create:function(data){
		var para = document.createElement("p");
		para.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+data;		
		this.body.appendChild(para);
//		this.Line(para);
	},
	first:function(){
		
	},
	betWeen:function(){
		
	},
	last:function(){
		
	},
	Line(para){
		//废弃
		var styles = window.getComputedStyle(para, null)
		var lh = parseInt(styles.lineHeight);
		var h = parseInt(styles.height);
		var lc = Math.round(h / lh);
		console.log(lc);
		this.lines += lc;
		return lc
	},
	Linelen(){
		//计算 一行等写入多少字符
		this.len = Math.round(this.width / this.fontSize);
	},
	mathLen(str){
		//算计 字数需要多少行
		var len = Math.ceil(str.length / this.len);
		this.lines += len;
		return len
	},
	cutstr(str,line){
		var len = (line - 1 ) * (this.len ) - 3;// -4空格符合
		this.create(str.substr(0,len));
		console.log(str.substr(len,str.length));//剩余的章节文字
	}
};
//var _getbook = Chapter.prototype;