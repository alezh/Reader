var Chapter = {
	init:function(maxheight,lineHeight){
		this.Maxheight = maxheight;
		this.MaxLine = Math.round(maxheight / lineHeight);		
	},
	jsonload:function(json){
		console.log(JSON.stringify(json));
		var title = "<h4>" + json.chapter.title + "</h4>";
		var body = json.chapter.body.split('\n')
		var html='';
		for (var i = 0; i < body.length; i++) {
			if(i>this.MaxLine)
            html += "<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + body[i] + "</p>";
//          body.splice(i, 1);
        }
		console.log(html);
	},
	path:function(){
		var self = this
		mui.getJSON("../data/book.json",null,function(data){
			self.jsonload(data);
		});
	},
	create:function(){
		
	}
};
//var _getbook = Chapter.prototype;