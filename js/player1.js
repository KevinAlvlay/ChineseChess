var player1 = player1||{};

//初始化
player1.init = function (){
    player1.my				=	1;				//玩家方
    player1.map 			=	rule.arr2Clone (rule.initMap);		//初始化棋盘
    player1.nowManKey		=	false;			//现在要操作的棋子
    player1.pace 			=	[];				//记录每一步
    player1.isPlay 		=	true ;			//是否能走棋
    player1.mans 			=	rule.mans;  //棋子集合
    player1.bylaw 			= 	rule.bylaw; //规则
    player1.show 			= 	rule.show;
    player1.showPane 		= 	rule.showPane;
    player1.isOffensive	=	true;			//是否先手
    player1.depth			=	player1.depth || 3;				//搜索深度
    player1.flag           =   false;          //是否结束EVE
    player1.isFoul			=	false;	//是否犯规长将

    rule.pane.isShow		=	false;			//隐藏方块
    //初始化棋子
    for (var i=0; i<player1.map.length; i++){
        for (var n=0; n<player1.map[i].length; n++){
            var key = player1.map[i][n];
            if (key){
                rule.mans[key].x=n;
                rule.mans[key].y=i;
                rule.mans[key].isShow = true;
            }
        }
    }
    player1.show();

    /*
    com.get("offensivePlay").addEventListener("click", function(e) {
        player1.isOffensive=true;
        player1.isPlay=true ;
        com.get("chessRight").style.display = "none";
        player1.init();
    })

    com.get("defensivePlay").addEventListener("click", function(e) {
        player1.isOffensive=false;
        player1.isPlay=true ;
        com.get("chessRight").style.display = "none";
        player1.init();
    })
    */

    //取消pvp
    rule.canvas.removeEventListener("click",player2.clickCanvas);
    rule.get("regretBn").removeEventListener("click", function(e) {
        player2.regret();
    });

    //绑定点击事件
    rule.canvas.addEventListener("click",player1.clickCanvas);
    rule.get("regretBn").addEventListener("click", function(e) {
        player1.regret();
    });
}

//悔棋
player1.regret = function (){
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
    var pace= player1.pace;
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
    player1.map = map;
    player1.my=1;
    player1.isPlay=true;
    rule.show();
}

//点击棋盘事件
player1.clickCanvas = function (e){
    if (!player1.isPlay) return false;
    player1.my = 1;
    var key = player1.getClickMan(e);
    var point = player1.getClickPoint(e);

    var x = point.x;
    var y = point.y;

    if (key){
        player1.clickMan(key,x,y);
    }else {
        player1.clickPoint(x,y);
    }
    player1.isFoul = player1.checkFoul();//检测是不是长将
}

//点击棋子，两种情况，选中或者吃子
player1.clickMan = function (key, x, y){
    var man = rule.mans[key];
    //吃子
    if (player1.nowManKey&&player1.nowManKey != key && man.my != rule.mans[player1.nowManKey ].my){
        //man为被吃掉的棋子
        if (player1.indexOfPs(rule.mans[player1.nowManKey].ps,[x,y])){
            man.isShow = false;
            var pace=rule.mans[player1.nowManKey].x+""+rule.mans[player1.nowManKey].y
            delete player1.map[rule.mans[player1.nowManKey].y][rule.mans[player1.nowManKey].x];
            player1.map[y][x] = player1.nowManKey;
            rule.showPane(rule.mans[player1.nowManKey].x ,rule.mans[player1.nowManKey].y,x,y)
            rule.mans[player1.nowManKey].x = x;
            rule.mans[player1.nowManKey].y = y;
            rule.mans[player1.nowManKey].alpha = 1;

            var temp = rule.get("info").textContent;
            var move = rule.createMove(rule.arr2Clone(player1.map),x,y,man.x,man.y);
            rule.get("info").innerHTML = temp + '\n' + '红：' + move;

            player1.pace.push(pace+x+y);
            player1.nowManKey = false;
            rule.pane.isShow = false;
            rule.dot.dots = [];
            rule.show();
            setTimeout("player1.AIPlay()",500);
            if (key == "j0") player1.showWin (-1);
            if (key == "J0") player1.showWin (1);
        }
        // 选中棋子
    }else{
        if (man.my===1){
            if (rule.mans[player1.nowManKey]) rule.mans[player1.nowManKey].alpha = 1 ;
            man.alpha = 0.6;
            rule.pane.isShow = false;
            player1.nowManKey = key;
            rule.mans[key].ps = rule.mans[key].bl(); //获得所有能着点
            rule.dot.dots = rule.mans[key].ps
            rule.show();
        }
    }
}

//点击着点
player1.clickPoint = function (x, y){
    var key=player1.nowManKey;
    var man=rule.mans[key];
    if (player1.nowManKey){
        if (player1.indexOfPs(rule.mans[key].ps,[x,y])){
            var temp = rule.get("info").textContent;
            var move = rule.createMove(rule.arr2Clone(player1.map),man.x,man.y,x,y);
            rule.get("info").innerHTML = temp + '\n' + '红：' + move;

            var pace=man.x+""+man.y;
            delete player1.map[man.y][man.x];
            player1.map[y][x] = key;
            rule.showPane(man.x,man.y,x,y);

            man.x = x;
            man.y = y;
            man.alpha = 1;
            player1.pace.push(pace+x+y);
            player1.nowManKey = false;
            rule.dot.dots = [];
            rule.show();
            setTimeout("player1.AIPlay()",500);
        }
    }
}

//AI自动走棋
player1.AIPlay = function (){
    player1.my = -player1.my;
    var pace=AI.init(player1.pace.join(""));
    if (!pace) {
        player1.showWin (1);
    }
    player1.pace.push(pace.join(""));
    var key=player1.map[pace[1]][pace[0]]
    player1.nowManKey = key;

    var key=player1.map[pace[3]][pace[2]];
    if (key){
        player1.AIclickMan(key,pace[2],pace[3]);
    }else {
        player1.AIclickPoint(pace[2],pace[3]);
    }
}

//检查是否长将
player1.checkFoul = function(){
    var p=player1.pace;
    var len=parseInt(p.length,10);
    if (len>11&&p[len-1] == p[len-5] &&p[len-5] == p[len-9]){
        return p[len-4].split("");
    }
    return false;
}

//AI点击棋子
player1.AIclickMan = function (key, x, y){
    var man = rule.mans[key];
    //吃子
    man.isShow = false;
    delete player1.map[rule.mans[player1.nowManKey].y][rule.mans[player1.nowManKey].x];
    player1.map[y][x] = player1.nowManKey;
    rule.showPane(rule.mans[player1.nowManKey].x, rule.mans[player1.nowManKey].y,x,y)

    rule.mans[player1.nowManKey].x = x;
    rule.mans[player1.nowManKey].y = y;
    player1.nowManKey = false;
    rule.show();
    if (key == "j0") player1.showWin (-1);  //输
    if (key == "J0") player1.showWin (1);   //赢
}

//AI着点
player1.AIclickPoint = function (x, y){
    var key=player1.nowManKey;
    var man=rule.mans[key];
    if (player1.nowManKey){
        delete player1.map[rule.mans[player1.nowManKey].y][rule.mans[player1.nowManKey].x];
        player1.map[y][x] = key;

        rule.showPane(man.x,man.y,x,y);

        man.x = x;
        man.y = y;
        player1.nowManKey = false;

    }
    rule.show();
}

//获得着点
player1.indexOfPs = function (ps, xy){
    for (var i=0; i<ps.length; i++){
        if (ps[i][0]==xy[0]&&ps[i][1]==xy[1]) return true;
    }
    return false;

}

//获得点击的着点
player1.getClickPoint = function (e){
    var domXY = rule.getDomXY(rule.canvas);
    var x=Math.round((e.pageX-domXY.x-rule.pointStartX-20)/rule.spaceX)
    var y=Math.round((e.pageY-domXY.y-rule.pointStartY-20)/rule.spaceY)
    //console.log(x, y);
    return {"x":x,"y":y}
}

//获得棋子
player1.getClickMan = function (e){
    var clickXY=player1.getClickPoint(e);
    var x=clickXY.x;
    var y=clickXY.y;
    //console.log(x, y);
    if (x < 0 || x > 8 || y < 0 || y > 9) return false;
    return (player1.map[y][x] && player1.map[y][x]!="0") ? player1.map[y][x] : false;
}

//显示游戏结果
player1.showWin = function (my){
    player1.isPlay = false;
    if (my===1){
        alert("胜利");
    }else{
        alert("失败");
    }
    player1.flag=true;
}
