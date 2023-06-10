﻿var Ai = Ai || {};

Ai.historyTable = {};		//历史表

//人工智能初始化
Ai.init = function (pace) {
    Ai.move;
    var initTime = new Date().getTime();
    Ai.treeDepth = 4;

    Ai.number = 0;
    Ai.setHistoryTable.lenght = 0;

    var val = Ai.getAlphaBeta(-99999, 99999, Ai.treeDepth, rule.arr2Clone(player1.map), player1.my);
    //var val = Ai.iterativeSearch(com.arr2Clone(player1.map),player1.my)
    if (!val || val.value == -8888) {
        Ai.treeDepth = 4;
        val = Ai.getAlphaBeta(-99999, 99999, Ai.treeDepth, rule.arr2Clone(player1.map), player1.my);
    }
    //var val = Ai.iterativeSearch(com.arr2Clone(player1.map),player1.my);
    if (val && val.value != -8888) {
        var man = player1.mans[val.key];
        var nowTime = new Date().getTime();
        Ai.move = rule.createMove(rule.arr2Clone(player1.map), man.x, man.y, val.x, val.y);
        rule.get("moveInfo").innerHTML = '<h3>AI搜索结果：</h3>最佳着法：' +
            Ai.move +
            '<br />搜索深度：' + Ai.treeDepth + '<br />搜索分支：' +
            Ai.number + '个 <br />最佳着法评估：' +
            val.value + '分' +
            ' <br />搜索用时：' +
            (nowTime - initTime) + '毫秒';
        temp = rule.get("info").textContent;
        if(player1.my == -1) rule.get("info").innerHTML = temp + '\n' + '黑：' + Ai.move;
        else rule.get("info").innerHTML = temp + '\n' + '红：' + Ai.move;
        return [man.x, man.y, val.x, val.y];
    } else {
        return false;
    }
}

//迭代加深搜索着法
Ai.iterativeSearch = function (map, my) {
    var timeOut = 100;
    var initDepth = 1;
    var maxDepth = 8;
    Ai.treeDepth = 0;
    var initTime = new Date().getTime();
    var val = {};
    for (var i = initDepth; i <= maxDepth; i++) {
        var nowTime = new Date().getTime();
        Ai.treeDepth = i;
        Ai.aotuDepth = i;
        var val = Ai.getAlphaBeta(-99999, 99999, Ai.treeDepth, map, my)
        if (nowTime - initTime > timeOut) {
            return val;
        }
    }
    return false;
}

//取得棋盘上所有棋子
Ai.getMapAllMan = function (map, my) {
    var mans = [];
    for (var i = 0; i < map.length; i++) {
        for (var n = 0; n < map[i].length; n++) {
            var key = map[i][n];
            if (key && player1.mans[key].my == my) {
                player1.mans[key].x = n;
                player1.mans[key].y = i;
                mans.push(player1.mans[key])
            }
        }
    }
    return mans;
}

//取得棋谱所有己方棋子的着法
Ai.getMoves = function (map, my) {
    var manArr = Ai.getMapAllMan(map, my);
    var moves = [];
    var foul = player1.isFoul;
    for (var i = 0; i < manArr.length; i++) {
        var man = manArr[i];
        var val = man.bl(map);

        for (var n = 0; n < val.length; n++) {
            var x = man.x;
            var y = man.y;
            var newX = val[n][0];
            var newY = val[n][1];
            //如果不是长将着法
            if (foul[0] != x || foul[1] != y || foul[2] != newX || foul[3] != newY) {
                moves.push([x, y, newX, newY, man.key])
            }
        }
    }
    return moves;
}
//A:当前棋手value/B:对手value/depth：层级
Ai.getAlphaBeta = function (A, B, depth, map, my) {
    //var txtMap= map.join();
    //var history=Ai.historyTable[txtMap];
    //	if (history && history.depth >= Ai.treeDepth-depth+1){
    //		return 	history.value*my;
    //}
    if (depth == 0) {
        return { "value": Ai.evaluate(map, my) }; //局面评价函数;
    }
    var moves = Ai.getMoves(map, my); //生成全部走法;
    //这里排序以后会增加效率

    for (var i = 0; i < moves.length; i++) {


        //走这个走法;
        var move = moves[i];
        var key = move[4];
        var oldX = move[0];
        var oldY = move[1];
        var newX = move[2];
        var newY = move[3];
        var clearKey = map[newY][newX] || "";

        map[newY][newX] = key;
        delete map[oldY][oldX];
        player1.mans[key].x = newX;
        player1.mans[key].y = newY;

        if (clearKey == "j0" || clearKey == "J0") {//被吃老将,撤消这个走法;
            player1.mans[key].x = oldX;
            player1.mans[key].y = oldY;
            map[oldY][oldX] = key;
            delete map[newY][newX];
            if (clearKey) {
                map[newY][newX] = clearKey;
                // player1.mans[ clearKey ].isShow = false;
            }

            return { "key": key, "x": newX, "y": newY, "value": 8888 };
            //return rootKey;
        } else {
            var val = -Ai.getAlphaBeta(-B, -A, depth - 1, map, -my).value;
            //val = val || val.value;

            //撤消这个走法;　
            player1.mans[key].x = oldX;
            player1.mans[key].y = oldY;
            map[oldY][oldX] = key;
            delete map[newY][newX];
            if (clearKey) {
                map[newY][newX] = clearKey;
                //player1.mans[ clearKey ].isShow = true;
            }
            if (val >= B) {
                //将这个走法记录到历史表中;
                //Ai.setHistoryTable(txtMap,Ai.treeDepth-depth+1,B,my);
                return { "key": key, "x": newX, "y": newY, "value": B };
            }
            if (val > A) {
                A = val; //设置最佳走法;
                if (Ai.treeDepth == depth) var rootKey = { "key": key, "x": newX, "y": newY, "value": A };
            }
        }
    }
    //将这个走法记录到历史表中;
    //Ai.setHistoryTable(txtMap,Ai.treeDepth-depth+1,A,my);
    if (Ai.treeDepth == depth) {//已经递归回根了
        if (!rootKey) {
            //AI没有最佳走法，说明AI被将死了，返回false
            return false;
        } else {
            //这个就是最佳走法;
            return rootKey;
        }
    }
    return { "key": key, "x": newX, "y": newY, "value": A };
}

//奖着法记录到历史表
Ai.setHistoryTable = function (txtMap, depth, value, my) {
    Ai.setHistoryTable.lenght++;
    Ai.historyTable[txtMap] = { depth: depth, value: value }
}

//评估棋局 取得棋盘双方棋子价值差
Ai.evaluate = function (map, my) {
    var val = 0;
    for (var i = 0; i < map.length; i++) {
        for (var n = 0; n < map[i].length; n++) {
            var key = map[i][n];
            if (key) {
                val += player1.mans[key].value[i][n] * player1.mans[key].my;
            }
        }
    }
    //val+=Math.floor(Math.random()*10);  //让AI走棋增加随机元素
    Ai.number++;
    return val * my;
}