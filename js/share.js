var share=share||{};
share.regret=function(player){
	this.player=player
	console.log(this.player)
	let map  = rule.arr2Clone(rule.initMap);
	// console.log(map)
	//初始化所有棋子
	for (let i=0; i<map.length; i++){
		for (let n=0; n<map[i].length; n++){
			let key = map[i][n];
			if (key){
				rule.mans[key].x=n;
				rule.mans[key].y=i;
				rule.mans[key].isShow = true;
			}
		}
	}
	var pace= this.player.pace;
	pace.pop();
	pace.pop();
	console.log("pace:"+pace)
	//逆向执行棋子的移动，将棋盘和棋子状态恢复到上一步的状态
	//pace是一个数组，每个元素是一个四位数字比如7767，77表示悔棋前的棋子坐标，67表示悔棋后的棋子坐标
	for (let i=0; i<pace.length; i++){
		let p= pace[i].split("");
		console.log("p:"+p);
		let x = parseInt(p[0], 10);
		let y = parseInt(p[1], 10);
		let newX = parseInt(p[2], 10);
		let newY = parseInt(p[3], 10);
		let key=map[y][x];

		let cMan=map[newY][newX];
		if (cMan) rule.mans[map[newY][newX]].isShow = false;
		rule.mans[key].x = newX;
		rule.mans[key].y = newY;
		map[newY][newX] = key;
		delete map[y][x];
		if (i===pace.length-1){
			rule.showPane(newX ,newY,x,y)

		}
	}
	this.player.map = map;
	this.player.my=1;
	this.player.isPlay=true;
	rule.show();
}