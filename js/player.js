var player = player||{};

player.init = function (){
    player.my				=	1;				//玩家方
    player.map 			=	com.arr2Clone (com.initMap);		//初始化棋盘
    player.nowManKey		=	false;			//现在要操作的棋子
    player.pace 			=	[];				//记录每一步
    player.isPlay 		=	true ;			//是否能走棋
    player.mans 			=	com.mans;
    player.bylaw 			= 	com.bylaw;
    player.show 			= 	com.show;
    player.showPane 		= 	com.showPane;
    player.isOffensive	=	true;			//是否先手
    player.depth			=	player.depth || 3;				//搜索深度
    player.flag           =   false;          //是否结束EVE
    player.isFoul			=	false;	//是否犯规长将

    com.pane.isShow		=	false;			//隐藏方块
    //初始化棋子
    for (var i=0; i<player.map.length; i++){
        for (var n=0; n<player.map[i].length; n++){
            var key = player.map[i][n];
            if (key){
                com.mans[key].x=n;
                com.mans[key].y=i;
                com.mans[key].isShow = true;
            }
        }
    }
    player.show();

    /*
    com.get("offensivePlay").addEventListener("click", function(e) {
        player.isOffensive=true;
        player.isPlay=true ;
        com.get("chessRight").style.display = "none";
        player.init();
    })

    com.get("defensivePlay").addEventListener("click", function(e) {
        player.isOffensive=false;
        player.isPlay=true ;
        com.get("chessRight").style.display = "none";
        player.init();
    })
    */

    //取消pvp
    com.canvas.removeEventListener("click",player2.clickCanvas);
    com.get("regretBn").removeEventListener("click", function(e) {
        player2.regret();
    });

    //绑定点击事件
    com.canvas.addEventListener("click",player.clickCanvas);
    com.get("regretBn").addEventListener("click", function(e) {
        player.regret();
    });
}

//悔棋
player.regret = function (){
    var map  = com.arr2Clone(com.initMap);
    //初始化所有棋子
    for (var i=0; i<map.length; i++){
        for (var n=0; n<map[i].length; n++){
            var key = map[i][n];
            if (key){
                com.mans[key].x=n;
                com.mans[key].y=i;
                com.mans[key].isShow = true;
            }
        }
    }
    var pace= player.pace;
    pace.pop();
    pace.pop();

    for (var i=0; i<pace.length; i++){
        var p= pace[i].split("")
        var x = parseInt(p[0], 10);
        var y = parseInt(p[1], 10);
        var newX = parseInt(p[2], 10);
        var newY = parseInt(p[3], 10);
        var key=map[y][x];

        var cMan=map[newY][newX];
        if (cMan) com.mans[map[newY][newX]].isShow = false;
        com.mans[key].x = newX;
        com.mans[key].y = newY;
        map[newY][newX] = key;
        delete map[y][x];
        if (i==pace.length-1){
            com.showPane(newX ,newY,x,y)
        }
    }
    player.map = map;
    player.my=1;
    player.isPlay=true;
    com.show();
}

//点击棋盘事件
player.clickCanvas = function (e){
    if (!player.isPlay) return false;
    player.my = 1;
    var key = player.getClickMan(e);
    var point = player.getClickPoint(e);

    var x = point.x;
    var y = point.y;

    if (key){
        player.clickMan(key,x,y);
    }else {
        player.clickPoint(x,y);
    }
    player.isFoul = player.checkFoul();//检测是不是长将
}

//点击棋子，两种情况，选中或者吃子
player.clickMan = function (key, x, y){
    var man = com.mans[key];
    //吃子
    if (player.nowManKey&&player.nowManKey != key && man.my != com.mans[player.nowManKey ].my){
        //man为被吃掉的棋子
        if (player.indexOfPs(com.mans[player.nowManKey].ps,[x,y])){
            man.isShow = false;
            var pace=com.mans[player.nowManKey].x+""+com.mans[player.nowManKey].y
            delete player.map[com.mans[player.nowManKey].y][com.mans[player.nowManKey].x];
            player.map[y][x] = player.nowManKey;
            com.showPane(com.mans[player.nowManKey].x ,com.mans[player.nowManKey].y,x,y)
            com.mans[player.nowManKey].x = x;
            com.mans[player.nowManKey].y = y;
            com.mans[player.nowManKey].alpha = 1;

            var temp = com.get("info").textContent;
            var move = com.createMove(com.arr2Clone(player.map),x,y,man.x,man.y);
            com.get("info").innerHTML = temp + '\n' + '红：' + move;

            player.pace.push(pace+x+y);
            player.nowManKey = false;
            com.pane.isShow = false;
            com.dot.dots = [];
            com.show();
            setTimeout("player.AIPlay()",500);
            if (key == "j0") player.showWin (-1);
            if (key == "J0") player.showWin (1);
        }
        // 选中棋子
    }else{
        if (man.my===1){
            if (com.mans[player.nowManKey]) com.mans[player.nowManKey].alpha = 1 ;
            man.alpha = 0.6;
            com.pane.isShow = false;
            player.nowManKey = key;
            com.mans[key].ps = com.mans[key].bl(); //获得所有能着点
            com.dot.dots = com.mans[key].ps
            com.show();
        }
    }
}

//点击着点
player.clickPoint = function (x, y){
    var key=player.nowManKey;
    var man=com.mans[key];
    if (player.nowManKey){
        if (player.indexOfPs(com.mans[key].ps,[x,y])){
            var temp = com.get("info").textContent;
            var move = com.createMove(com.arr2Clone(player.map),man.x,man.y,x,y);
            com.get("info").innerHTML = temp + '\n' + '红：' + move;

            var pace=man.x+""+man.y;
            delete player.map[man.y][man.x];
            player.map[y][x] = key;
            com.showPane(man.x,man.y,x,y);

            man.x = x;
            man.y = y;
            man.alpha = 1;
            player.pace.push(pace+x+y);
            player.nowManKey = false;
            com.dot.dots = [];
            com.show();
            setTimeout("player.AIPlay()",500);
        }
    }
}

//AI自动走棋
player.AIPlay = function (){
    player.my = -player.my;
    var pace=AI.init(player.pace.join(""));
    if (!pace) {
        player.showWin (1);
    }
    player.pace.push(pace.join(""));
    var key=player.map[pace[1]][pace[0]]
    player.nowManKey = key;

    var key=player.map[pace[3]][pace[2]];
    if (key){
        player.AIclickMan(key,pace[2],pace[3]);
    }else {
        player.AIclickPoint(pace[2],pace[3]);
    }
}

//检查是否长将
player.checkFoul = function(){
    var p=player.pace;
    var len=parseInt(p.length,10);
    if (len>11&&p[len-1] == p[len-5] &&p[len-5] == p[len-9]){
        return p[len-4].split("");
    }
    return false;
}

player.AIclickMan = function (key, x, y){
    var man = com.mans[key];
    //吃子
    man.isShow = false;
    delete player.map[com.mans[player.nowManKey].y][com.mans[player.nowManKey].x];
    player.map[y][x] = player.nowManKey;
    com.showPane(com.mans[player.nowManKey].x, com.mans[player.nowManKey].y,x,y)

    com.mans[player.nowManKey].x = x;
    com.mans[player.nowManKey].y = y;
    player.nowManKey = false;
    com.show();
    if (key == "j0") player.showWin (-1);  //输
    if (key == "J0") player.showWin (1);   //赢
}

player.AIclickPoint = function (x, y){
    var key=player.nowManKey;
    var man=com.mans[key];
    if (player.nowManKey){
        delete player.map[com.mans[player.nowManKey].y][com.mans[player.nowManKey].x];
        player.map[y][x] = key;

        com.showPane(man.x,man.y,x,y);

        man.x = x;
        man.y = y;
        player.nowManKey = false;

    }
    com.show();
}

player.indexOfPs = function (ps, xy){
    for (var i=0; i<ps.length; i++){
        if (ps[i][0]==xy[0]&&ps[i][1]==xy[1]) return true;
    }
    return false;

}

//获得点击的着点
player.getClickPoint = function (e){
    var domXY = com.getDomXY(com.canvas);
    var x=Math.round((e.pageX-domXY.x-com.pointStartX-20)/com.spaceX)
    var y=Math.round((e.pageY-domXY.y-com.pointStartY-20)/com.spaceY)
    //console.log(x, y);
    return {"x":x,"y":y}
}

//获得棋子
player.getClickMan = function (e){
    var clickXY=player.getClickPoint(e);
    var x=clickXY.x;
    var y=clickXY.y;
    //console.log(x, y);
    if (x < 0 || x > 8 || y < 0 || y > 9) return false;
    return (player.map[y][x] && player.map[y][x]!="0") ? player.map[y][x] : false;
}

player.showWin = function (my){
    player.isPlay = false;
    if (my===1){
        alert("恭喜你你赢了🎉🎉🎉");
    }else{
        alert("很遗憾你输了😢😢😢");
    }
    player.flag=true;
}
