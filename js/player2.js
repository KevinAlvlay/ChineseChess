var player2 = player2||{};

player2.init = function (){
    player2.my			=	1;				//玩家方
    player2.map 			=	rule.arr2Clone (rule.initMap);		//初始化棋盘
    player2.nowManKey		=	false;			//现在要操作的棋子
    player2.pace 			=	[];				//记录每一步
    player2.isPlay 		=	true ;			//是否能走棋
    player2.mans 			=	rule.mans;
    player2.bylaw 		= 	rule.bylaw;
    player2.show 			= 	rule.show;
    player2.showPane 		= 	rule.showPane;
    player2.isOffensive	=	true;			//是否先手
    player2.isFoul	    =	false;	//是否犯规长将

    rule.pane.isShow		=	false;			//隐藏方块

    //初始化棋子
    for (var i=0; i<player2.map.length; i++){
        for (var n=0; n<player2.map[i].length; n++){
            var key = player2.map[i][n];
            if (key){
                rule.mans[key].x=n;
                rule.mans[key].y=i;
                rule.mans[key].isShow = true;
            }
        }
    }
    player2.show();
    //取消eve、pve
    rule.canvas.removeEventListener("click",player1.clickCanvas);
    rule.get("regretBn").removeEventListener("click", function(e) {
        player1.regret();
    });

    //绑定点击事件
    rule.canvas.addEventListener("click",player2.clickCanvas);
    rule.get("regretBn").addEventListener("click", function(e) {
        player2.regret();
    });
}

//悔棋
player2.regret = function (){
    var map  = rule.arr2Clone(rule.initMap);
    //初始化所有棋子
    for (var i=0; i<map.length; i++){
        for (var n=0; n<map[i].length; n++){
            var key = map[i][n];
            if (key){
                rule.mans[key].x=n;
                rule.mans[key].y=i;
                rule.mans[key].isShow = true;
            }
        }
    }
    var pace= player2.pace;
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
        if (cMan) rule.mans[map[newY][newX]].isShow = false;
        rule.mans[key].x = newX;
        rule.mans[key].y = newY;
        map[newY][newX] = key;
        delete map[y][x];
        if (i==pace.length-1){
            rule.showPane(newX ,newY,x,y)
        }
    }
    player2.map = map;
    player2.my=1;
    player2.isPlay=true;
    rule.show();
}

//点击棋盘事件
player2.clickCanvas = function (e){
    if (!player2.isPlay) return false;
    //player2.my = 1;
    var key = player2.getClickMan(e);
    var point = player2.getClickPoint(e);
    console.log(key, point);
    var x = point.x;
    var y = point.y;

    if (key){
        player2.clickMan(key,x,y);
    }else {
        player2.clickPoint(x,y);
    }
    player2.isFoul = player2.checkFoul();//检测是不是长将
}

//点击棋子，两种情况，选中或者吃子
player2.clickMan = function (key, x, y){
    var man = rule.mans[key];
    //吃子
    if (player2.nowManKey&&player2.nowManKey != key && man.my != rule.mans[player2.nowManKey].my){
        //man为被吃掉的棋子
        if (player2.indexOfPs(rule.mans[player2.nowManKey].ps,[x,y])){
            man.isShow = false;
            var pace=rule.mans[player2.nowManKey].x+""+rule.mans[player2.nowManKey].y
            delete player2.map[rule.mans[player2.nowManKey].y][rule.mans[player2.nowManKey].x];
            player2.map[y][x] = player2.nowManKey;
            rule.showPane(rule.mans[player2.nowManKey].x ,rule.mans[player2.nowManKey].y,x,y)
            rule.mans[player2.nowManKey].x = x;
            rule.mans[player2.nowManKey].y = y;
            rule.mans[player2.nowManKey].alpha = 1;

            var temp = rule.get("info").textContent;
            var move = rule.createMove(rule.arr2Clone(player2.map),x,y,man.x,man.y);
            if(player2.my == 1) rule.get("info").innerHTML = temp + '\n' + '红：' + move;
            else rule.get("info").innerHTML = temp + '\n' + '黑：' + move;

            player2.pace.push(pace+x+y);
            player2.nowManKey = false;
            rule.pane.isShow = false;
            rule.dot.dots = [];
            rule.show();
            player2.my = -player2.my;
            if (key == "j0") player2.showWin (-1);
            if (key == "J0") player2.showWin (1);
        }
        // 选中棋子
    }else{
        if (man.my == 1 && player2.my == 1){
            if (rule.mans[player2.nowManKey]) rule.mans[player2.nowManKey].alpha = 1 ;
            console.log("红方");
            man.alpha = 0.6;
            rule.pane.isShow = false;
            player2.nowManKey = key;
            rule.mans[key].ps = rule.mans[key].bl(); //获得所有能着点
            rule.dot.dots = rule.mans[key].ps;
            rule.show();
        }else if(man.my == -1 && player2.my == -1){
            if (rule.mans[player2.nowManKey]) rule.mans[player2.nowManKey].alpha = 1 ;
            console.log("黑方");
            man.alpha = 0.6;
            rule.pane.isShow = false;
            player2.nowManKey = key;
            rule.mans[key].ps = rule.mans[key].bl(); //获得所有能着点
            rule.dot.dots = rule.mans[key].ps;
            rule.show();
        }
    }
}

//点击着点
player2.clickPoint = function (x, y){
    var key=player2.nowManKey;
    var man=rule.mans[key];
    if (player2.nowManKey){
        if (player2.indexOfPs(rule.mans[key].ps,[x,y])){
            var temp = rule.get("info").textContent;
            var move = rule.createMove(rule.arr2Clone(player2.map),man.x,man.y,x,y);
            if(player2.my == 1) rule.get("info").innerHTML = temp + '\n' + '红：' + move;
            else rule.get("info").innerHTML = temp + '\n' + '黑：' + move;

            var pace=man.x+""+man.y;
            delete player2.map[man.y][man.x];
            player2.map[y][x] = key;
            rule.showPane(man.x,man.y,x,y);

            man.x = x;
            man.y = y;
            man.alpha = 1;
            player2.pace.push(pace+x+y);
            player2.nowManKey = false;
            rule.dot.dots = [];
            rule.show();
            player2.my = -player2.my;
        }
    }
}

//检查是否长将
player2.checkFoul = function(){
    var p=player2.pace;
    var len=parseInt(p.length,10);
    if (len>11&&p[len-1] == p[len-5] &&p[len-5] == p[len-9]){
        return p[len-4].split("");
    }
    return false;
}


player2.indexOfPs = function (ps, xy){
    for (var i=0; i<ps.length; i++){
        if (ps[i][0]==xy[0]&&ps[i][1]==xy[1]) return true;
    }
    return false;

}

//获得点击的着点
player2.getClickPoint = function (e){
    var domXY = rule.getDomXY(rule.canvas);
    var x=Math.round((e.pageX-domXY.x-rule.pointStartX-20)/rule.spaceX)
    var y=Math.round((e.pageY-domXY.y-rule.pointStartY-20)/rule.spaceY)
    return {"x":x,"y":y}
}

//获得棋子
player2.getClickMan = function (e){
    var clickXY=player2.getClickPoint(e);
    var x=clickXY.x;
    var y=clickXY.y;
    console.log(x, y);
    if (x < 0 || x > 8 || y < 0 || y > 9) return false;
    return (player2.map[y][x] && player2.map[y][x]!="0") ? player2.map[y][x] : false;
}

player2.showWin = function (my){
    player2.isPlay = false;
    if (my===1){
        alert("恭喜红方赢了");
    }else{
        alert("恭喜黑方赢了");
    }
    player2.flag = true;
}