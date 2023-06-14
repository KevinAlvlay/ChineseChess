var Ai = Ai || {};

Ai.transpositionTable = {};

// /**
//  * 该函数用于初始化AI。
//  * 它进行Alpha-Beta剪枝搜索，找到最佳走法及其值，并在界面上输出搜索结果。
//  * 函数返回找到的最佳走法。
//  *
//  * @paramArray} pace - 当前游戏棋。
//  * @returns {Array|boolean} - 找到的最佳走法，或false。
//  */
// Ai.init = function (pace) {
//     Ai.move;
//     Ai.treeDepth = 5;
//     Ai.number = 0;
//     Ai.setHistoryTable.lenght = 0;
//     var initTime = new Date().getTime();
//     var val = Ai.getAlphaBeta(-99999, 99999, Ai.treeDepth, rule.arr2Clone(player1.map), player1.my);
//     if (!val || val.value == -8888) {
//         Ai.treeDepth = 4;
//         val = Ai.getAlphaBeta(-99999, 99999, Ai.treeDepth, rule.arr2Clone(player1.map), player1.my);
//     }
//     if (val && val.value != -8888) {
//         var man = player1.mans[val.key];
//         var nowTime = new Date().getTime();
//         Ai.move = rule.createMove(rule.arr2Clone(player1.map), man.x, man.y, val.x, val.y);
//         rule.get("moveInfo").innerHTML = '<h3>AI搜索结果：</h3>最佳着法：' +
//             Ai.move +
//             '<br />搜索深度：' + Ai.treeDepth + '<br />搜索分支：' +
//             Ai.number + '个 <br />最佳着法评估：' +
//             val.value + '分' +
//             ' <br />搜索用时：' +
//             (nowTime - initTime) + '毫秒';
//         temp = rule.get("info").textContent;
//         if(player1.my == -1) rule.get("info").innerHTML = temp + '\n' + '黑：' + Ai.move;
//         else rule.get("info").innerHTML = temp + '\n' + '红：' + Ai.move;
//         return [man.x, man.y, val.x, val.y];
//     } else {
//         return false;
//     }
// }


/**
 * 该函数用于初始化AI。
 * 它进行迭代加深搜索，找到最佳走法及其值，并在界面上输出搜索结果。
 * 函数返回找到的最佳走法。
 *
 * @param {Array} pace - 当前游戏棋谱。
 * @returns {Array|boolean} - 找到的最佳走法，或false。
 */
Ai.init = function (pace) {
    Ai.move;
    Ai.number = 0;
    var initTime = new Date().getTime();
    var val = Ai.iterativeSearch(rule.arr2Clone(player1.map), player1.my);
    if (!val || val.value == -8888) {
        Ai.treeDepth = 4;
        val = Ai.iterativeSearch(rule.arr2Clone(player1.map), player1.my);
    }
    if (val && val.value != -8888) {
        var man = player1.mans[val.key];
        var nowTime = new Date().getTime();
        Ai.move = rule.createMove(rule.arr2Clone(player1.map), man.x, man.y, val.x, val.y);//一步棋

        //下面都是在界面上输出
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

        // var data = {
        //     "player": (player1.my === -1 ? "黑" : "红"),
        //     "move": Ai.move
        // };
        //
        // // 将数据追加到本地存储中
        // var log = localStorage.getItem('log') || '';
        // log += data.player + ': ' + data.move + '\n';
        // localStorage.setItem('log', log);

        // // 创建要存储的数据对象
        // var data = {
        //     "player": (player1.my === -1 ? "黑" : "红"),
        //     "move": Ai.move
        // };
        //
        // // 将数据转换为 JSON 字符串
        // var jsonString = JSON.stringify(data);
        //
        // // 使用 FileSaver.js 库将 JSON 字符串写入本地文件
        // var blob = new Blob([jsonString], {type: "application/json;charset=utf-8"});
        // saveAs(blob, "js/lib.json");


        return [man.x, man.y, val.x, val.y];
    } else {
        return false;
    }
}


/**
 * 该函数用于进行迭代加深搜索。
 * 它从初始深度开始，逐步增加深度，直到达到最大深度或超时时间。
 * 函数返回找到的最佳走法及其值。
 *
 * @param {Array} map - 当前游戏棋盘状态。
 * @param {number} my - 玩家方。
 * @returns {Object} - 找到的最佳走法及其值。
 */
Ai.iterativeSearch = function (map, my) {
    var timeOut = 200;//超时时间
    var initDepth = 1;//初始深度
    var maxDepth = 8;//最大深度
    Ai.treeDepth = 0;//当前搜索深度
    var initTime = new Date().getTime();//获取时间
    // var val = {};
    for (var i = initDepth; i <= maxDepth; i++) {
        var nowTime = new Date().getTime();
        Ai.treeDepth = i;//控制搜索深度
        //Ai.autoDepth = i;
        var val = Ai.getAlphaBeta(-99999, 99999, Ai.treeDepth, map, my)//计算下一步最佳位置

        // 将搜索结果存入置换表中
        Ai.transpositionTable[JSON.stringify(map)] = {
            depth: Ai.treeDepth,
            value: val.value,
            flag: 0, // 精确值
        };

        if (nowTime - initTime > timeOut) {
            return val;
        }
    }
    return false;
}


/**
 * 该函数用于获取当前玩家所有棋子的位置信息。
 * 它遍历整个棋盘，找到所有属于当前玩家的棋子，并将它们的位置信息存储在一个数组中。
 * 函数返回包含位置信息的man数组。
 *
 * @param {Array} map - 当前游戏棋盘状态。
 * @param {number} my - 玩家方。
 * @returns {Array} - 包含位置信息的man数组。
 */
Ai.getMapAllMan = function (map, my) {
    var mans = [];
    for (var i = 0; i < map.length; i++) {
        for (var n = 0; n < map[i].length; n++) {
            var key = map[i][n];
            //该位置有棋子且属于player1
            if (key && player1.mans[key].my == my) {
                player1.mans[key].x = n;
                player1.mans[key].y = i;
                mans.push(player1.mans[key])
            }
        }
    }
    return mans;//返回包含位置信息的man数组
}


/**
 * 该函数用于获取当前玩家所有可能的移动。
 * 它首先获取当前玩家所有棋子的位置信息，然后计算每个棋子所有可能的移动。
 * 函数返回包含所有可能移动的数组。
 *
 * @param {Array} map - 当前游戏棋盘状态。
 * @param {number} my - 玩家方。
 * @returns {Array} - 包含所有可能移动的数组。
 */
Ai.getMoves = function (map, my) {
    var manArr = Ai.getMapAllMan(map, my);//获取棋子位置信息
    var moves = [];//包含所有可能移动的数组
    var foul = player1.isFoul;//如果存在长将情况，则会返回一个含有四个坐标值的数组
    for (var i = 0; i < manArr.length; i++) {
        var man = manArr[i];
        var val = man.bl(map);//计算并存储该位置所有可能的移动
        for (var n = 0; n < val.length; n++) {
            var x = man.x;
            var y = man.y;
            var newX = val[n][0];
            var newY = val[n][1];
            //如果不是长将着法，则将该移动数值存入数组
            if (foul[0] != x || foul[1] != y || foul[2] != newX || foul[3] != newY) {
                moves.push([x, y, newX, newY, man.key])
            }
        }
    }
    return moves;
}


/**
 * 该函数实现了Alpha-Beta剪枝算法，用于中国象棋游戏AI。
 * 它以当前游戏棋盘状态、搜索树深度和玩家方为输入。
 * 它生成玩家的所有可能走法，并使用带有Alpha-Beta剪枝的Negamax算法评估每个走法。
 * 该函数返回找到的最佳走法及其值作为对象。
 * 转置表用于存储先前评估的位置，以避免冗余计算。
 * 该函数还实现了移动排序以提高搜索效率。
 *
 * @param {number} A - Alpha-Beta剪枝算法的Alpha值。
 * @param {number} B - Alpha-Beta剪枝算法的Beta值。
 * @param {number} depth - 搜索树的深度。
 * @param {Array} map - 当前游戏棋盘状态。
 * @param {number} my - 玩家方。
 * @returns {Object} - 找到的最佳走法及其值。
 */
Ai.getAlphaBeta = function (A, B, depth, map, my) {

    var transpositionTable = Ai.transpositionTable;
    var hash = JSON.stringify(map);

    // 检查置换表
    if (transpositionTable[hash] && transpositionTable[hash].depth >= depth) {
        var ttEntry = transpositionTable[hash];
        if (ttEntry.flag == 0) { // 精确值
            return { value: ttEntry.value };
        } else if (ttEntry.flag == 1 && ttEntry.value <= A) { // 下限值
            return { value: ttEntry.value };
        } else if (ttEntry.flag == 2 && ttEntry.value >= B) { // 上限值
            return { value: ttEntry.value };
        }
    }


    if (depth == 0) {
        return { "value": Ai.evaluate(map, my) }; //返回当前棋局的评估值
    }
    //生成全部着法
    var moves = Ai.getMoves(map, my);


    for (var i = 0; i < moves.length; i++) {
        var move = moves[i];
        var key = move[4];//man.key
        var oldX = move[0];
        var oldY = move[1];
        var newX = move[2];
        var newY = move[3];
        var clearKey = map[newY][newX] || "";

        map[newY][newX] = key;//移动到新的为位置
        delete map[oldY][oldX];//原位置上的信息被删除

        //更新信息
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
        } else {
            //采用负极大值算法，进行递归调用
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
            //如果值大于beta，则进行beta剪枝
            if (val >= B) {
                //将这个走法记录到历史表中;
                //Ai.setHistoryTable(txtMap,Ai.treeDepth-depth+1,B,my);
                return { "key": key, "x": newX, "y": newY, "value": B };
            }
            //大于alpha，则更新alpha值
            if (val > A) {
                A = val; //设置最佳走法;
                if (Ai.treeDepth == depth)
                    var rootKey = { "key": key, "x": newX, "y": newY, "value": A };
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


/**
 * 该函数用于评估当前棋局的价值。
 * 它遍历整个棋盘，计算每个棋子的价值，并将它们相加。
 * 函数返回当前棋局的总价值，乘以玩家方的数。
 *
 * @param {Array} map - 当前游戏棋盘状态。
 * @param {number} my - 玩家方。
 * @returns {number} - 当前棋局的总价值。
 */
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
    Ai.number++;//记录搜索的节点数
    return val * my;
}