var bill = bill || {};

/**
 * 初始化bill对象。
 * 本函数用于检查是否存在棋谱。如果存在棋谱，则停止计时器，并将棋谱写入棋谱列表。
 * 如果不存在棋谱，则每隔一秒调用自身进行检查。
 */
bill.init = function (){
    //如果有棋谱，则调用
    if (rule.store){
        console.log("棋谱go");
        clearInterval(bill.timer);
        bill.setBillList(rule.arr2Clone(rule.initMap)); //写入棋谱列表
        player2.isPlay=false;
        player1.isPlay=false;
        rule.show();
    }else {
        console.log("棋谱out");
        bill.timer = setInterval("bill.init()",1000);//每隔一秒调用自身
    }
}

/**
 * 该函数为棋谱列表添加选项
 * 并为每个选项添加事件监听器
 * 当选项改变时，在界面上显示对应的棋谱。
 *
 * @param {Array} map - 当前游戏棋盘状态。
 * @returns null
 */
bill.setBillList = function (map){
    var list=rule.get("billList");
    console.log(list)
    //为每个棋谱创建一个option元素，并加入棋谱列表
    for (var i=0; i < rule.store.length; i++){
        var option = document.createElement('option');
        option.text='棋谱'+(i+1);
        option.value=i;
        list.add(option, null);
    }

    list.addEventListener("change", function(e) {
        bill.setBox (rule.store[this.value], map)
    })
    bill.setBox (rule.store[0], map)
}


/**
 * 该函数根据棋谱中的移动信息
 * 更新棋盘上的棋子位置
 * 并在界面上显示移动过程。
 *
 * @param {Array} bl - 棋谱中的移动信息数组
 * @param {number} inx - 当前移动的步数
 * @param {Array} map - 当前游戏棋
 * @returns {Array} - 更新后的棋盘
 */
bill.setMove = function (bl,inx,map){
    var map = rule.arr2Clone(map);
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

    //解析字符串，使棋谱棋盘棋子移动
    for (var i=0; i<= inx ; i++){
        var n = i*4;
        var x = bl[n+0];
        var y = bl[n+1];
        var newX = bl[n+2];
        var newY = bl[n+3];
        if (rule.mans[map[newY][newX]]) {
            rule.mans[map[newY][newX]].isShow = false;
        }

        rule.mans[map[y][x]].x = newX;
        rule.mans[map[y][x]].y = newY;

        if (i === inx) {
            rule.showPane(x,y,newX,newY);
        }
        map[newY][newX] = map[y][x];
        delete map[y][x];

    }
    return map;
}

//写入棋谱
bill.setBox = function (bl,initMap){
    var map = rule.arr2Clone(initMap);
    var bl= bl.split("");
    var h='';
    for (var i=0; i< bl.length; i+=4){
        h +='<li id="move_'+(i/4)+'">';
        var x = bl[i+0];
        var y = bl[i+1];
        var newX = bl[i+2];
        var newY = bl[i+3];
        h += rule.createMove(map,x,y,newX,newY);
        h +='</li>\n\r';
    }
    rule.get("billBox").innerHTML = h;
    let doms=rule.get("billBox").getElementsByTagName("li");
    let index=[],step=-1;
    for (let i=0;i<doms.length; i++) index[i]=doms[i].getAttribute("id").split("_")[1]
    let nextB=document.getElementById("nextBn")
    let lastB=document.getElementById("lastBn")
    nextB.addEventListener("click",function (){
        bill.setMove(bl,index[++step],initMap)
        rule.show();
    })
    lastB.addEventListener("click",function (){
        if(!(step<=-1)) {
            bill.setMove(bl, index[--step], initMap)
            rule.show();
        }else{
            console.log("已经是第一步")
        }

    })
    console.log(doms)
    for (let i=0; i<doms.length; i++){
        doms[i].addEventListener("click", function(e) {
            step=index[i];
            bill.setMove (bl , index[step] , initMap)
            rule.show();
        })
    }
}