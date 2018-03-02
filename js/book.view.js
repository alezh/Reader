var book = {
	init:function(){
		this.book = []
	},
	getTxt:function(){
		let self = this
		var json = ['../data/book.json','../data/book1.json']
		json.forEach(function(v,i,d){
			mui.getJSON(v,null,function(data){
				self.book.push(data)
			});
		})
//		mui.getJSON("../data/book.json",null,function(data){
////			plus.storage.clear();
////			plus.storage.setItem(self.BookName+data.chapter.title,data);
//		});
	},
	loadJson:function(){
		
	},
	prepareJson:function(json){
		
	}
}
