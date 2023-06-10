var rule = rule||{};

rule.init = function (stype){
    rule.nowStype= stype || rule.getCookie("stype") ||"stype";
    //var stype = rule.stype[rule.nowStype];
    rule.width			=	595;		//画布宽度
    rule.height			=	650; 		//画布高度
    rule.spaceX			=	62;		    //着点X跨度
    rule.spaceY			=	62;		    //着点Y跨度
    rule.pointStartX	=	29; 	    //第一个着点X坐标;
    rule.pointStartY	=	30;	        //第一个着点Y坐标;
    //rule.page			=	"stype";			//图片目录

    rule.get("box").style.width = rule.width+130+"px";

    rule.canvas			=	document.getElementById("chess"); //画布
    rule.ct				=	rule.canvas.getContext("2d") ;
    rule.canvas.width	=	rule.width;
    rule.canvas.height	=	rule.height;
    rule.cho            =   1;                  //对战人数

    rule.childList		=	rule.childList||[]; //所有子元素集合，用于draw

    rule.loadImages();		//载入图片
}

//棋盘样式
/*rule.stype = {
    stype:{
        width:595,		//画布宽度
        height:650, 	//画布高度
        spaceX:62,		//着点X跨度
        spaceY:62,		//着点Y跨度
        pointStartX:29,  //第一个着点X坐标;
        pointStartY:31, //第一个着点Y坐标;
        page:"stype"	//图片目录
    },
}*/

//获取ID
rule.get = function (id){
    return document.getElementById(id);
}


rule.sleep = function (millisecond) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, millisecond)
    })
}

//事件处理函数：在页面加载完成后执行的代码，初始化组件
window.onload = function(){
    rule.bg=new rule.drawclass.Bg();
    rule.dot = new rule.drawclass.Dot();
    rule.pane=new rule.drawclass.Pane();
    rule.pane.isShow=false;

    rule.childList=[rule.bg,rule.dot,rule.pane];
    rule.mans	 ={};		//棋子集合
    rule.createMans(rule.initMap)		//生成棋子
    rule.bg.show();
    rule.get("bnBox").style.display = "block";
    //player1.init();

    rule.get("billBn").addEventListener("click", function(e) {
        if (confirm("是否结束对局，开始棋局研究？")){
            rule.init();
            rule.get("chessRight").style.display = "block";
            rule.get("moveInfo").style.display = "none";
            rule.get("info").style.display = "none";
            bill.init();
        }
    })
    //人机对战
    rule.get("PVE").addEventListener("click", function(e) {
        if (confirm("确认开始人机对弈？")){
            rule.cho = 1;
            player1.flag = true;
            rule.sleep(500);
            rule.get("chessRight").style.display = "none";
            rule.get("moveInfo").innerHTML="";
            rule.get("info").innerHTML="";
            player1.depth = 4;
            player1.init();
            //先手： player1.AIPlay();
        }
    })
    //人人对战
    rule.get("PVP").addEventListener("click", function(e) {
        if (confirm("确认开始人人对弈？")){
            rule.cho = 2;
            player1.flag = true;
            rule.sleep(500);
            player1.init();
            rule.get("chessRight").style.display = "none";
            rule.get("moveInfo").innerHTML="";
            rule.get("info").innerHTML="";
            player2.init();
        }
    })
    //机机对战
    rule.get("EVE").addEventListener("click", function(e) {
        if (confirm("确认开始机机对弈？")){
            rule.cho = 1;
            rule.get("chessRight").style.display = "none";
            rule.get("moveInfo").innerHTML="";
            rule.get("info").innerHTML="";
            player1.depth = parseInt(Math.random()*2+3, 10);
            player1.init();
            player1.my = -1;
            const interval = setInterval(function () {
                player1.AIPlay();
                console.log(player1.flag);
                if (player1.flag) {
                    console.log(1);
                    clearInterval(interval);
                }
            }, 500);
        }
    })

	//com.getData("js/gambit.all.js",
	//	function(data){
	//	com.gambit=data.split(" ");
	//	Ai.historyBill = com.gambit;
	// })
    rule.getData("js/store.json",
        function(data){
            console.log("读取store");
            rule.store=data.split(" ");
        })
}

//载入图片
rule.loadImages = function(){
    //绘制棋盘
    rule.bgImg = new Image();
    rule.bgImg.src  = "img/stype/map.jpg";

    //提示点
    rule.dotImg = new Image();
    rule.dotImg.src  = "img/stype/dot.png";

    //棋子
    for (var i in rule.args){
        rule[i] = {};
        rule[i].img = new Image();
        rule[i].img.src = "img/stype/" + rule.args[i].img +".png";
    }

    //棋子外框
    rule.paneImg = new Image();
    rule.paneImg.src  = "img/stype/r_box.png";

    //背景
    document.getElementsByTagName("body")[0].style.background= "url(img/stype/bgg.jpg)";

}

//显示列表
rule.show = function (){
    rule.ct.clearRect(0, 0, rule.width, rule.height);
    for (var i=0; i<rule.childList.length ; i++){
        rule.childList[i].show();
    }
}

//显示移动的棋子外框
rule.showPane  = function (x, y, newX, newY){
    rule.pane.isShow=true;
    rule.pane.x= x ;
    rule.pane.y= y ;
    rule.pane.newX= newX ;
    rule.pane.newY= newY ;
}

//生成map里面有的棋子
rule.createMans = function(map){
    for (var i=0; i<map.length; i++){
        for (var n=0; n<map[i].length; n++){
            var key = map[i][n];
            if (key){
                rule.mans[key]=new rule.drawclass.Man(key);
                rule.mans[key].x=n;
                rule.mans[key].y=i;
                rule.childList.push(rule.mans[key])
            }
        }
    }
}

//获取元素距离页面左侧的距离
rule.getDomXY = function (dom){
    var left = dom.offsetLeft;
    var top = dom.offsetTop;
    var current = dom.offsetParent;
    while (current !== null){
        left += current.offsetLeft;
        top += current.offsetTop;
        current = current.offsetParent;
    }
    return {x:left,y:top};
}

//获得cookie
rule.getCookie = function(name){
    if (document.cookie.length>0){
        start=document.cookie.indexOf(name + "=")
        if (start!=-1){
            start=start + name.length+1
            end=document.cookie.indexOf(";",start)
            if (end==-1) end=document.cookie.length
            return unescape(document.cookie.substring(start,end))
        }
    }
    return false;
}

//二维数组克隆
rule.arr2Clone = function (arr){
    var newArr=[];
    for (var i=0; i<arr.length ; i++){
        newArr[i] = arr[i].slice();
    }
    return newArr;
}

//ajax载入数据
rule.getData = function (url, fun){
    var XMLHttpRequestObject=false;
    if(window.XMLHttpRequest){
        XMLHttpRequestObject=new XMLHttpRequest();
    }else if(window.ActiveXObject){
        XMLHttpRequestObject=new ActiveXObject("Microsoft.XMLHTTP");
    }
    if(XMLHttpRequestObject){
        XMLHttpRequestObject.open("GET",url);
        XMLHttpRequestObject.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        XMLHttpRequestObject.onreadystatechange=function (){
            if(XMLHttpRequestObject.readyState==4 && XMLHttpRequestObject.status==200){
                fun (XMLHttpRequestObject.responseText)
                //return XMLHttpRequestObject.responseText;
            }
        }
        XMLHttpRequestObject.send(null);
    }
}

//把坐标生成着法
rule.createMove = function (map, x, y, newX, newY){
    var h="";
    var man = rule.mans[map[y][x]];
    h += man.text;
    map[newY][newX] = map[y][x];
    delete map[y][x];
    if (man.my===1){
        var mumTo=["一","二","三","四","五","六","七","八","九","十"];
        newX=8-newX;
        h += mumTo[8-x];
        if (newY > y) {
            h+= "退";//马士象可以进退
            if (man.pater == "m" || man.pater == "s" || man.pater == "x"){
                h += mumTo[newX];
            }else {
                h += mumTo[newY - y -1];
            }
        }else if (newY < y) {
            h += "进";
            if (man.pater == "m" || man.pater == "s" || man.pater == "x"){
                h += mumTo[newX];
            }else {
                h += mumTo[y - newY -1];
            }
        }else {
            h += "平";
            h += mumTo[newX];
        }
    }else{
        var mumTo=["１","２","３","４","５","６","７","８","９","10"];
        h+= mumTo[x];
        if (newY > y) {
            h += "进";
            if (man.pater == "M" || man.pater == "S" || man.pater == "X"){
                h += mumTo[newX];
            }else {
                h += mumTo[newY - y-1];
            }
        }else if (newY < y) {
            h += "退";
            if (man.pater == "M" || man.pater == "S" || man.pater == "X"){
                h += mumTo[newX];
            }else {
                h += mumTo[y - newY-1];
            }
        }else {
            h += "平";
            h += mumTo[newX];
        }
    }
    return h;
}

//初始化棋盘位置
rule.initMap = [
    ['C0','M0','X0','S0','J0','S1','X1','M1','C1'],
    [    ,    ,    ,    ,    ,    ,    ,    ,    ],
    [    ,'P0',    ,    ,    ,    ,    ,'P1',    ],
    ['Z0',    ,'Z1',    ,'Z2',    ,'Z3',    ,'Z4'],
    [    ,    ,    ,    ,    ,    ,    ,    ,    ],
    [    ,    ,    ,    ,    ,    ,    ,    ,    ],
    ['z0',    ,'z1',    ,'z2',    ,'z3',    ,'z4'],
    [    ,'p0',    ,    ,    ,    ,    ,'p1',    ],
    [    ,    ,    ,    ,    ,    ,    ,    ,    ],
    ['c0','m0','x0','s0','j0','s1','x1','m1','c1']
];

//棋子能走的着点
rule.bylaw ={}
//车
rule.bylaw.c = function (x, y, map, my){
    var d=[];
    //左侧检索
    for (var i=x-1; i>= 0; i--){
        if (map[y][i]) {
            if (rule.mans[map[y][i]].my!=my) d.push([i,y]);
            break
        }else{
            d.push([i,y])
        }
    }
    //右侧检索
    for (var i=x+1; i <= 8; i++){
        if (map[y][i]) {
            if (rule.mans[map[y][i]].my!=my) d.push([i,y]);
            break
        }else{
            d.push([i,y])
        }
    }
    //上检索
    for (var i = y-1 ; i >= 0; i--){
        if (map[i][x]) {
            if (rule.mans[map[i][x]].my!=my) d.push([x,i]);
            break
        }else{
            d.push([x,i])
        }
    }
    //下检索
    for (var i = y+1 ; i<= 9; i++){
        if (map[i][x]) {
            if (rule.mans[map[i][x]].my!=my) d.push([x,i]);
            break
        }else{
            d.push([x,i])
        }
    }
    return d;
}

//马
rule.bylaw.m = function (x, y, map, my){
    var d=[];
    //1点
    if ( y-2>= 0 && x+1<= 8 && !player1.map[y-1][x] &&(!rule.mans[map[y-2][x+1]] || rule.mans[map[y-2][x+1]].my!=my)) d.push([x+1,y-2]);
    //2点
    if ( y-1>= 0 && x+2<= 8 && !player1.map[y][x+1] &&(!rule.mans[map[y-1][x+2]] || rule.mans[map[y-1][x+2]].my!=my)) d.push([x+2,y-1]);
    //4点
    if ( y+1<= 9 && x+2<= 8 && !player1.map[y][x+1] &&(!rule.mans[map[y+1][x+2]] || rule.mans[map[y+1][x+2]].my!=my)) d.push([x+2,y+1]);
    //5点
    if ( y+2<= 9 && x+1<= 8 && !player1.map[y+1][x] &&(!rule.mans[map[y+2][x+1]] || rule.mans[map[y+2][x+1]].my!=my)) d.push([x+1,y+2]);
    //7点
    if ( y+2<= 9 && x-1>= 0 && !player1.map[y+1][x] &&(!rule.mans[map[y+2][x-1]] || rule.mans[map[y+2][x-1]].my!=my)) d.push([x-1,y+2]);
    //8点
    if ( y+1<= 9 && x-2>= 0 && !player1.map[y][x-1] &&(!rule.mans[map[y+1][x-2]] || rule.mans[map[y+1][x-2]].my!=my)) d.push([x-2,y+1]);
    //10点
    if ( y-1>= 0 && x-2>= 0 && !player1.map[y][x-1] &&(!rule.mans[map[y-1][x-2]] || rule.mans[map[y-1][x-2]].my!=my)) d.push([x-2,y-1]);
    //11点
    if ( y-2>= 0 && x-1>= 0 && !player1.map[y-1][x] &&(!rule.mans[map[y-2][x-1]] || rule.mans[map[y-2][x-1]].my!=my)) d.push([x-1,y-2]);

    return d;
}

//相
rule.bylaw.x = function (x, y, map, my){
    var d=[];
    if (my===1){ //红方
        //4点半
        if ( y+2<= 9 && x+2<= 8 && !player1.map[y+1][x+1] && (!rule.mans[map[y+2][x+2]] || rule.mans[map[y+2][x+2]].my!=my)) d.push([x+2,y+2]);
        //7点半
        if ( y+2<= 9 && x-2>= 0 && !player1.map[y+1][x-1] && (!rule.mans[map[y+2][x-2]] || rule.mans[map[y+2][x-2]].my!=my)) d.push([x-2,y+2]);
        //1点半
        if ( y-2>= 5 && x+2<= 8 && !player1.map[y-1][x+1] && (!rule.mans[map[y-2][x+2]] || rule.mans[map[y-2][x+2]].my!=my)) d.push([x+2,y-2]);
        //10点半
        if ( y-2>= 5 && x-2>= 0 && !player1.map[y-1][x-1] && (!rule.mans[map[y-2][x-2]] || rule.mans[map[y-2][x-2]].my!=my)) d.push([x-2,y-2]);
    }else{
        //4点半
        if ( y+2<= 4 && x+2<= 8 && !player1.map[y+1][x+1] && (!rule.mans[map[y+2][x+2]] || rule.mans[map[y+2][x+2]].my!=my)) d.push([x+2,y+2]);
        //7点半
        if ( y+2<= 4 && x-2>= 0 && !player1.map[y+1][x-1] && (!rule.mans[map[y+2][x-2]] || rule.mans[map[y+2][x-2]].my!=my)) d.push([x-2,y+2]);
        //1点半
        if ( y-2>= 0 && x+2<= 8 && !player1.map[y-1][x+1] && (!rule.mans[map[y-2][x+2]] || rule.mans[map[y-2][x+2]].my!=my)) d.push([x+2,y-2]);
        //10点半
        if ( y-2>= 0 && x-2>= 0 && !player1.map[y-1][x-1] && (!rule.mans[map[y-2][x-2]] || rule.mans[map[y-2][x-2]].my!=my)) d.push([x-2,y-2]);
    }
    return d;
}

//士
rule.bylaw.s = function (x, y, map, my){
    var d=[];
    if (my===1){ //红方
        //4点半
        if ( y+1<= 9 && x+1<= 5 && (!rule.mans[map[y+1][x+1]] || rule.mans[map[y+1][x+1]].my!=my)) d.push([x+1,y+1]);
        //7点半
        if ( y+1<= 9 && x-1>= 3 && (!rule.mans[map[y+1][x-1]] || rule.mans[map[y+1][x-1]].my!=my)) d.push([x-1,y+1]);
        //1点半
        if ( y-1>= 7 && x+1<= 5 && (!rule.mans[map[y-1][x+1]] || rule.mans[map[y-1][x+1]].my!=my)) d.push([x+1,y-1]);
        //10点半
        if ( y-1>= 7 && x-1>= 3 && (!rule.mans[map[y-1][x-1]] || rule.mans[map[y-1][x-1]].my!=my)) d.push([x-1,y-1]);
    }else{
        //4点半
        if ( y+1<= 2 && x+1<= 5 && (!rule.mans[map[y+1][x+1]] || rule.mans[map[y+1][x+1]].my!=my)) d.push([x+1,y+1]);
        //7点半
        if ( y+1<= 2 && x-1>= 3 && (!rule.mans[map[y+1][x-1]] || rule.mans[map[y+1][x-1]].my!=my)) d.push([x-1,y+1]);
        //1点半
        if ( y-1>= 0 && x+1<= 5 && (!rule.mans[map[y-1][x+1]] || rule.mans[map[y-1][x+1]].my!=my)) d.push([x+1,y-1]);
        //10点半
        if ( y-1>= 0 && x-1>= 3 && (!rule.mans[map[y-1][x-1]] || rule.mans[map[y-1][x-1]].my!=my)) d.push([x-1,y-1]);
    }
    return d;

}

//将
rule.bylaw.j = function (x, y, map, my){
    var d=[];
    var isNull=(function (y1,y2){
        var y1=rule.mans["j0"].y;//y坐标
        var x1=rule.mans["J0"].x;//帅的x坐标，两者一致
        var y2=rule.mans["J0"].y;//y坐标
        for (var i=y1-1; i>y2; i--){
            if (map[i][x1]) return false;
        }
        return true;
    })();

    if (my===1){ //红方
        //下
        if ( y+1<= 9  && (!rule.mans[map[y+1][x]] || rule.mans[map[y+1][x]].my!=my)) d.push([x,y+1]);
        //上
        if ( y-1>= 7 && (!rule.mans[map[y-1][x]] || rule.mans[map[y-1][x]].my!=my)) d.push([x,y-1]);
        //老将对老将的情况
        if ( rule.mans["j0"].x == rule.mans["J0"].x &&isNull) d.push([rule.mans["J0"].x,rule.mans["J0"].y]);

    }else{       //黑方
        //下
        if ( y+1<= 2  && (!rule.mans[map[y+1][x]] || rule.mans[map[y+1][x]].my!=my)) d.push([x,y+1]);
        //上
        if ( y-1>= 0 && (!rule.mans[map[y-1][x]] || rule.mans[map[y-1][x]].my!=my)) d.push([x,y-1]);
        //老将对老将的情况
        if ( rule.mans["j0"].x == rule.mans["J0"].x &&isNull) d.push([rule.mans["j0"].x,rule.mans["j0"].y]);
    }
    //右
    if ( x+1<= 5  && (!rule.mans[map[y][x+1]] || rule.mans[map[y][x+1]].my!=my)) d.push([x+1,y]);
    //左
    if ( x-1>= 3 && (!rule.mans[map[y][x-1]] || rule.mans[map[y][x-1]].my!=my))d.push([x-1,y]);
    return d;
}

//炮
rule.bylaw.p = function (x, y, map, my){
    var d=[];
    //左侧检索
    var n=0;
    for (var i=x-1; i>= 0; i--){
        if (map[y][i]) {
            if (n==0){
                n++;
                continue;
            }else{
                if (rule.mans[map[y][i]].my!=my) d.push([i,y]);
                break;
            }
        }else{
            if(n==0) d.push([i,y])
        }
    }
    //右侧检索
    var n=0;
    for (var i=x+1; i <= 8; i++){
        if (map[y][i]) {
            if (n==0){
                n++;
                continue;
            }else{
                if (rule.mans[map[y][i]].my!=my) d.push([i,y]);
                break
            }
        }else{
            if(n==0) d.push([i,y])
        }
    }
    //上检索
    var n=0;
    for (var i = y-1 ; i >= 0; i--){
        if (map[i][x]) {
            if (n==0){
                n++;
                continue;
            }else{
                if (rule.mans[map[i][x]].my!=my) d.push([x,i]);
                break
            }
        }else{
            if(n==0) d.push([x,i])
        }
    }
    //下检索
    var n=0;
    for (var i = y+1 ; i<= 9; i++){
        if (map[i][x]) {
            if (n==0){
                n++;
                continue;
            }else{
                if (rule.mans[map[i][x]].my!=my) d.push([x,i]);
                break
            }
        }else{
            if(n==0) d.push([x,i])
        }
    }
    return d;
}

//卒
rule.bylaw.z = function (x, y, map, my){
    var d=[];
    if (my===1){ //红方
        //上
        if ( y-1>= 0 && (!rule.mans[map[y-1][x]] || rule.mans[map[y-1][x]].my!=my)) d.push([x,y-1]);
        //右，过河情况下才能右走
        if ( x+1<= 8 && y<=4  && (!rule.mans[map[y][x+1]] || rule.mans[map[y][x+1]].my!=my)) d.push([x+1,y]);
        //左，过河情况下才能左走
        if ( x-1>= 0 && y<=4 && (!rule.mans[map[y][x-1]] || rule.mans[map[y][x-1]].my!=my))d.push([x-1,y]);
    }else{
        //下
        if ( y+1<= 9  && (!rule.mans[map[y+1][x]] || rule.mans[map[y+1][x]].my!=my)) d.push([x,y+1]);
        //右，过河情况下才能右走
        if ( x+1<= 8 && y>=6  && (!rule.mans[map[y][x+1]] || rule.mans[map[y][x+1]].my!=my)) d.push([x+1,y]);
        //左，过河情况下才能左走
        if ( x-1>= 0 && y>=6 && (!rule.mans[map[y][x-1]] || rule.mans[map[y][x-1]].my!=my))d.push([x-1,y]);
    }

    return d;
}

//棋子价值
rule.value = {

    //车价值
    c:[
        [206, 208, 207, 213, 214, 213, 207, 208, 206],
        [206, 212, 209, 216, 233, 216, 209, 212, 206],
        [206, 208, 207, 214, 216, 214, 207, 208, 206],
        [206, 213, 213, 216, 216, 216, 213, 213, 206],
        [208, 211, 211, 214, 215, 214, 211, 211, 208],

        [208, 212, 212, 214, 215, 214, 212, 212, 208],
        [204, 209, 204, 212, 214, 212, 204, 209, 204],
        [198, 208, 204, 212, 212, 212, 204, 208, 198],
        [200, 208, 206, 212, 200, 212, 206, 208, 200],
        [194, 206, 204, 212, 200, 212, 204, 206, 194]
    ],

    //马价值
    m:[
        [90, 90, 90, 96, 90, 96, 90, 90, 90],
        [90, 96,103, 97, 94, 97,103, 96, 90],
        [92, 98, 99,103, 99,103, 99, 98, 92],
        [93,108,100,107,100,107,100,108, 93],
        [90,100, 99,103,104,103, 99,100, 90],

        [90, 98,101,102,103,102,101, 98, 90],
        [92, 94, 98, 95, 98, 95, 98, 94, 92],
        [93, 92, 94, 95, 92, 95, 94, 92, 93],
        [85, 90, 92, 93, 78, 93, 92, 90, 85],
        [88, 85, 90, 88, 90, 88, 90, 85, 88]
    ],

    //相价值
    x:[
        [0, 0,20, 0, 0, 0,20, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0,23, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0,20, 0, 0, 0,20, 0, 0],

        [0, 0,20, 0, 0, 0,20, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [18,0, 0, 0,23, 0, 0, 0,18],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0,20, 0, 0, 0,20, 0, 0]
    ],

    //士价值
    s:[
        [0, 0, 0,20, 0,20, 0, 0, 0],
        [0, 0, 0, 0,23, 0, 0, 0, 0],
        [0, 0, 0,20, 0,20, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],

        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0,20, 0,20, 0, 0, 0],
        [0, 0, 0, 0,23, 0, 0, 0, 0],
        [0, 0, 0,20, 0,20, 0, 0, 0]
    ],

    //奖价值
    j:[
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],

        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0]
    ],

    //炮价值
    p:[

        [100, 100,  96, 91,  90, 91,  96, 100, 100],
        [ 98,  98,  96, 92,  89, 92,  96,  98,  98],
        [ 97,  97,  96, 91,  92, 91,  96,  97,  97],
        [ 96,  99,  99, 98, 100, 98,  99,  99,  96],
        [ 96,  96,  96, 96, 100, 96,  96,  96,  96],

        [ 95,  96,  99, 96, 100, 96,  99,  96,  95],
        [ 96,  96,  96, 96,  96, 96,  96,  96,  96],
        [ 97,  96, 100, 99, 101, 99, 100,  96,  97],
        [ 96,  97,  98, 98,  98, 98,  98,  97,  96],
        [ 96,  96,  97, 99,  99, 99,  97,  96,  96]
    ],

    //卒价值
    z:[
        [ 9,  9,  9, 11, 13, 11,  9,  9,  9],
        [19, 24, 34, 42, 44, 42, 34, 24, 19],
        [19, 24, 32, 37, 37, 37, 32, 24, 19],
        [19, 23, 27, 29, 30, 29, 27, 23, 19],
        [14, 18, 20, 27, 29, 27, 20, 18, 14],

        [ 7,  0, 13,  0, 16,  0, 13,  0,  7],
        [ 7,  0,  7,  0, 15,  0,  7,  0,  7],
        [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
        [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
        [ 0,  0,  0,  0,  0,  0,  0,  0,  0]
    ]
}

//黑子为红字价值位置的倒置
rule.value.C = rule.arr2Clone(rule.value.c).reverse();
rule.value.M = rule.arr2Clone(rule.value.m).reverse();
rule.value.X = rule.value.x;
rule.value.S = rule.value.s;
rule.value.J = rule.value.j;
rule.value.P = rule.arr2Clone(rule.value.p).reverse();
rule.value.Z = rule.arr2Clone(rule.value.z).reverse();

//绑定棋子
rule.args={
    //红子 中文/图片地址/阵营/权重
    'c':{text:"车", img:'r_c', my:1 ,bl:"c", value:rule.value.c},
    'm':{text:"马", img:'r_m', my:1 ,bl:"m", value:rule.value.m},
    'x':{text:"相", img:'r_x', my:1 ,bl:"x", value:rule.value.x},
    's':{text:"仕", img:'r_s', my:1 ,bl:"s", value:rule.value.s},
    'j':{text:"将", img:'r_j', my:1 ,bl:"j", value:rule.value.j},
    'p':{text:"炮", img:'r_p', my:1 ,bl:"p", value:rule.value.p},
    'z':{text:"兵", img:'r_z', my:1 ,bl:"z", value:rule.value.z},

    //黑子
    'C':{text:"車", img:'b_c', my:-1 ,bl:"c", value:rule.value.C},
    'M':{text:"馬", img:'b_m', my:-1 ,bl:"m", value:rule.value.M},
    'X':{text:"象", img:'b_x', my:-1 ,bl:"x", value:rule.value.X},
    'S':{text:"士", img:'b_s', my:-1 ,bl:"s", value:rule.value.S},
    'J':{text:"帅", img:'b_j', my:-1 ,bl:"j", value:rule.value.J},
    'P':{text:"炮", img:'b_p', my:-1 ,bl:"p", value:rule.value.P},
    'Z':{text:"卒", img:'b_z', my:-1 ,bl:"z", value:rule.value.Z}
};

rule.drawclass = rule.drawclass || {} //draw类
rule.drawclass.Man = function (key, x, y){
    this.pater = key.slice(0,1);
    var o=rule.args[this.pater]
    this.x = x||0;
    this.y = y||0;
    this.key = key ;
    this.my = o.my;
    this.text = o.text;
    this.value = o.value;
    this.isShow = true;
    this.alpha = 1;
    this.ps = []; //着点

    this.show = function (){
        if (this.isShow) {
            rule.ct.save();
            rule.ct.globalAlpha = this.alpha;
            rule.ct.drawImage(rule[this.pater].img,rule.spaceX * this.x + rule.pointStartX , rule.spaceY *  this.y +rule.pointStartY);
            rule.ct.restore();
        }
    }

    this.bl = function (map){
        var map;
        if(rule.cho == 1) map = map || player1.map;
        else map = map || player2.map;
        return rule.bylaw[o.bl](this.x,this.y,map,this.my);
    }
}

rule.drawclass.Bg = function (img, x, y){
    this.x = x||0;
    this.y = y||0;
    this.isShow = true;

    this.show = function (){
        if (this.isShow) rule.ct.drawImage(rule.bgImg, rule.spaceX * this.x,rule.spaceY *  this.y);
    }
}

rule.drawclass.Pane = function (img, x, y){
    this.x = x||0;
    this.y = y||0;
    this.newX = x||0;
    this.newY = y||0;
    this.isShow = true;

    this.show = function (){
        if (this.isShow) {
            rule.ct.drawImage(rule.paneImg, rule.spaceX * this.x + rule.pointStartX , rule.spaceY *  this.y + rule.pointStartY)
            rule.ct.drawImage(rule.paneImg, rule.spaceX * this.newX + rule.pointStartX  , rule.spaceY *  this.newY + rule.pointStartY)
        }
    }
}

rule.drawclass.Dot = function (img, x, y){
    this.x = x||0;
    this.y = y||0;
    this.isShow = true;
    this.dots=[]

    this.show = function (){
        for (var i=0; i<this.dots.length;i++){
            if (this.isShow) rule.ct.drawImage(rule.dotImg, rule.spaceX * this.dots[i][0]+10  + rule.pointStartX ,rule.spaceY *  this.dots[i][1]+10 + rule.pointStartY)
        }
    }
}

rule.init();