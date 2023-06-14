var player1 = player1||{};
//初始化
player1.init = function (){
    player1.my				=	1;				                    //玩家方
    player1.map 			=	rule.arr2Clone (rule.initMap);		//初始化棋盘
    player1.nowManKey		=	false;			                    //现在要操作的棋子
    player1.pace 			=	[];				                    //记录每一步
    player1.isPlay 		    =	true ;			                    //是否能走棋
    player1.mans 			=	rule.mans;                          //棋子集合
    player1.bylaw 			= 	rule.bylaw;                         //规则
    player1.show 			= 	rule.show;
    player1.showPane 		= 	rule.showPane;
    player1.isOffensive	    =	true;			                    //是否先手
    player1.depth			=	player1.depth || 3;				    //搜索深度
    player1.flag            =   false;                              //是否结束EVE
    player1.isFoul			=	false;	                            //是否犯规长将
    rule.pane.isShow		=	false;			                    //隐藏方块
    //初始化棋子
    for (let i=0; i<player1.map.length; i++){
        for (let n=0; n<player1.map[i].length; n++){
            let key = player1.map[i][n];
            if (key){
                rule.mans[key].x=n;
                rule.mans[key].y=i;
                rule.mans[key].isShow = true;
            }
        }
    }
    player1.show();
    //取消pvp
    rule.canvas.removeEventListener("click",player2.clickCanvas);
    rule.get("regretBn").removeEventListener("click", function(e) {
        share.regret(player2);
    });

    //绑定点击事件
    rule.canvas.addEventListener("click",player1.clickCanvas);
    rule.get("regretBn").addEventListener("click", function(e) {
        share.regret(player1);
    });
}

let globlePace=[]
//点击棋盘事件
player1.clickCanvas = function (e){
    console.log("点击棋盘事件");
    if (!player1.isPlay) return false;
    player1.my = 1;
    let key = player1.getClickMan(e);
    let point = player1.getClickPoint(e);

    let x = point.x;
    let y = point.y;

    if (key){
        player1.clickMan(key,x,y);
    }else {
        console.log("调用clickPoint")
        player1.clickPoint(x,y);
    }
    player1.isFoul = player1.checkFoul();//检测是不是长将
}

//点击棋子，两种情况，选中或者吃子
player1.clickMan = function (key, x, y){
    console.log("点击棋子")
    var man = rule.mans[key];
    console.log(player1.my)
    //吃子
    if (player1.nowManKey&&player1.nowManKey !== key && man.my !== rule.mans[player1.nowManKey ].my){
        console.log(rule.mans[player1.nowManKey].ps)
        //man为被吃掉的棋子
        if (player1.indexOfPs(rule.mans[player1.nowManKey].ps,[x,y])){
            man.isShow = false;
            let pace=rule.mans[player1.nowManKey].x+""+rule.mans[player1.nowManKey].y
            delete player1.map[rule.mans[player1.nowManKey].y][rule.mans[player1.nowManKey].x];
            player1.map[y][x] = player1.nowManKey;
            rule.showPane(rule.mans[player1.nowManKey].x ,rule.mans[player1.nowManKey].y,x,y)
            rule.mans[player1.nowManKey].x = x;
            rule.mans[player1.nowManKey].y = y;
            console.log(player1.pace)
            rule.mans[player1.nowManKey].alpha = 1;
            //产生动态棋谱
            let temp = rule.get("info").textContent;
            let move = rule.createMove(rule.arr2Clone(player1.map),x,y,man.x,man.y);
            rule.get("info").innerHTML = temp + '\n' + '红：' + move;
            player1.pace.push(pace+x+y);
            player1.nowManKey = false;
            rule.pane.isShow = false;
            rule.dot.dots = [];
            rule.show();
            setTimeout("player1.AIPlay()",50);
            if (key === "j0") player1.showWin (-1);
            if (key === "J0") player1.showWin (1);
        }
        // 选中棋子
    }else{
        if (man.my===1){
            console.log("选中棋子")
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

// //悔棋
// player1.regret = function (){
//     console.log("点击悔棋")
//     let map  = rule.arr2Clone(rule.initMap);
//     // console.log(map)
//     //初始化所有棋子
//     for (let i=0; i<map.length; i++){
//         for (let n=0; n<map[i].length; n++){
//             let key = map[i][n];
//             if (key){
//                 rule.mans[key].x=n;
//                 rule.mans[key].y=i;
//                 rule.mans[key].isShow = true;
//             }
//         }
//     }
//     var pace= player1.pace;
//     pace.pop();
//     pace.pop();
//     console.log("pace:"+pace)
//     //逆向执行棋子的移动，将棋盘和棋子状态恢复到上一步的状态
//     //pace是一个数组，每个元素是一个四位数字比如7767，77表示悔棋前的棋子坐标，67表示悔棋后的棋子坐标
//     for (let i=0; i<pace.length; i++){
//         let p= pace[i].split("");
//         console.log("p:"+p);
//         let x = parseInt(p[0], 10);
//         let y = parseInt(p[1], 10);
//         let newX = parseInt(p[2], 10);
//         let newY = parseInt(p[3], 10);
//         let key=map[y][x];
//
//         let cMan=map[newY][newX];
//         if (cMan) rule.mans[map[newY][newX]].isShow = false;
//         rule.mans[key].x = newX;
//         rule.mans[key].y = newY;
//         map[newY][newX] = key;
//         delete map[y][x];
//         if (i===pace.length-1){
//             rule.showPane(newX ,newY,x,y)
//
//         }
//     }
//     player1.map = map;
//     player1.my=1;
//     player1.isPlay=true;
//     rule.show();
// }
//将每一步加入到棋谱
// let moves=[];
// var jsonString
// player1.addToBill=function(move){
//     moves.push(move)
//     jsonString = JSON.stringify(moves);
//     console.log(moves)
//     console.log(jsonString)
// }
//点击着子点
player1.clickPoint = function (x, y){
    console.log("点击着子点")
    let key=player1.nowManKey;
    let man=rule.mans[key];
    if (player1.nowManKey){
        if (player1.indexOfPs(rule.mans[key].ps,[x,y])){
            let temp = rule.get("info").textContent;
            let move = rule.createMove(rule.arr2Clone(player1.map),man.x,man.y,x,y);
            // player1.addToBill(move)
            rule.get("info").innerHTML = temp + '\n' + '红：' + move;
            let pace=man.x+""+man.y;
            delete player1.map[man.y][man.x];
            player1.map[y][x] = key;
            rule.showPane(man.x,man.y,x,y);
            man.x = x;
            man.y = y;
            man.alpha = 1;
            player1.pace.push(pace+x+y);
            console.log(player1.pace)
            player1.nowManKey = false;
            rule.dot.dots = [];
            rule.show();
            setTimeout("player1.AIPlay()",500);
        }
        else{
            console.log("非法目标点")
        }
    }
}

//AI自动走棋
player1.AIPlay = function (){
    player1.my = -player1.my;
    let aiPace=Ai.init(player1.pace.join(""));
    console.log(aiPace)
    if (!aiPace) {
        player1.showWin (1);
    }
    player1.pace.push(aiPace.join(""));
    let key=player1.map[aiPace[1]][aiPace[0]]
    console.log(key)
    player1.nowManKey = key;
    key=player1.map[aiPace[3]][aiPace[2]];
    console.log(player1.pace)
    if (key){
        player1.AIclickMan(key,aiPace[2],aiPace[3]);
    }else {
        player1.AIclickPoint(aiPace[2],aiPace[3]);
    }
}

//检查是否长将
player1.checkFoul = function(){
    let p=player1.pace;
    let len=parseInt(p.length,10);
    if (len>11&&p[len-1] == p[len-5] &&p[len-5] == p[len-9]){
        return p[len-4].split("");
    }
    return false;
}

//AI点击棋子
player1.AIclickMan = function (key, x, y){
    let man = rule.mans[key];
    //吃子
    man.isShow = false;
    delete player1.map[rule.mans[player1.nowManKey].y][rule.mans[player1.nowManKey].x];
    player1.map[y][x] = player1.nowManKey;
    rule.showPane(rule.mans[player1.nowManKey].x, rule.mans[player1.nowManKey].y,x,y)
    rule.mans[player1.nowManKey].x = x;
    rule.mans[player1.nowManKey].y = y;
    player1.nowManKey = false;
    rule.show();
    if (key === "j0") player1.showWin (-1);  //输
    if (key === "J0") player1.showWin (1);   //赢
}

//AI着点
player1.AIclickPoint = function (x, y){
    let key=player1.nowManKey;
    let man=rule.mans[key];
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
    console.log("调用indexOfPs")
    for (let i=0; i<ps.length; i++){
        if (ps[i][0]===xy[0]&&ps[i][1]===xy[1]) return true;
    }
    return false;

}

//获得点击的着点
player1.getClickPoint = function (e){
    console.log("调用getClickPoint")
    let domXY = rule.getDomXY(rule.canvas);
    let x=Math.round((e.pageX-domXY.x-rule.pointStartX-20)/rule.spaceX)
    let y=Math.round((e.pageY-domXY.y-rule.pointStartY-20)/rule.spaceY)
    console.log(x, y);
    return {"x":x,"y":y}
}

//获得棋子
player1.getClickMan = function (e){
    let clickXY=player1.getClickPoint(e);
    let x=clickXY.x;
    let y=clickXY.y;
    //console.log(x, y);
    if (x < 0 || x > 8 || y < 0 || y > 9)
    {
        console.log("点到外面了")
        return false;
    }
    //如果点击位置有棋子返回棋子标识符
    return (player1.map[y][x] && player1.map[y][x]!=="0") ? player1.map[y][x] : false;
}

//显示游戏结果
player1.showWin = function (my){
    player1.isPlay = false;
    if (my===1){
        alert("胜利");
    }else{
        alert("失败");
    }

    // 读取本地存储中的数据并转换为 JSON 格式
    // var log = localStorage.getItem('log') || '';
    // var data =log;
    // var json = JSON.stringify(data);
    //
    // var blob = new Blob([json], {type: "application/json;charset=utf-8"});
    // saveAs(blob, "lib.json");

    let paceString=player1.pace.join("");
    var blob = new Blob([paceString], { type: 'application/json' });
    var downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'store.json';
    downloadLink.click();
    player1.flag=true;
}
