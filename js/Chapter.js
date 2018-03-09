var Chapter = {
	init:function(maxheight,lineHeight,body,AryDiv){
		this.Maxheight = maxheight;
		this.MaxLine = Math.round(maxheight / lineHeight);
		this.BookName='';
		this.chapter = '';
		this.AryDiv = AryDiv;
		this.body = body;
		this.lines = 0; //显示的行数
		this.width = window.screen.availWidth - 20 ; //每行宽度
		this.fontSize = 14; //字体大小 14px
		this.len = 0; //每行长度
		this.count = 0;
		this.div = 0;
		
		this.Linelen()
	},
	divWrite(json){
		json.forEach(function(value,index,array){});
	},
	jsonload:function(json){
		json = json || plus.storage.getItem(this.BookName+this.chapter)
//		console.log(JSON.stringify(json));
		var title = "<h4>" + json.chapter.title + "</h4>";
		var body = json.chapter.body.split('\n') //切分
		var html='';
		var length = body.length;
		var self = this
		body.forEach(function(value,index,array){
			if(self.lines > 28){
				self.lines = 0
			}
			var len = self.mathLen(value)
			if(self.lines < self.MaxLine){ //未超出时
				self.create(value)
			}else{
				//超出时切分
				var c = self.MaxLine - (self.lines - len);
				if(c > 1){
					self.lines = 0;
					self.cutstr(value,c)
				}
				return true
			}
		})
		
		//算行数与字数 显示
//		for (var i = 1; i < length; i++){
//			var val = body.shift();
//			var len = this.mathLen(val)  //计算字数需要行数
//			
//			if(this.lines < this.MaxLine){ //未超出时
//				this.create(val)
//			}else{
//				//超出时切分
//				var c = this.MaxLine - (this.lines - len);
//				if(c > 1){
//					this.cutstr(val,c)
//				}
//				break;
//			}
//		}
	},
	getTxt:function(){
		var self = this
		mui.getJSON("../data/book.json",null,function(data){
			plus.storage.clear();
			plus.storage.setItem(self.BookName+data.chapter.title,data);
			self.jsonload(data);
		});
	},
	write(data){
		var para = document.createElement("p");
		para.innerHTML = data;		
		this.body.querySelector(this.AryDiv[this.div]).appendChild(para);
	},
	create:function(data){
		var para = document.createElement("p");
		para.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+data;		
		this.body.querySelector(this.AryDiv[this.div]).appendChild(para);
	},
	first:function(){
		
	},
	betWeen:function(){
		
	},
	last:function(){
		
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
		this.div++
		var txt = str.substr(len,str.length)
		this.mathLen(txt)
		this.write(txt);//剩余的章节文字
	}
};
//var move = Chapter.prototype;