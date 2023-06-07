<!--居中处理 -->
let selfCenter = (id) => {
    let winH = parseInt($('body').height());
    let winW = parseInt($('body').width());

    $('#'+id).css({
        marginTop:(winH-parseInt($('#'+id).height()))/2+'px',
        marginLeft:(winW-parseInt($('#'+id).width()))/2+'px',
    })
}
selfCenter('menuContainer');
selfCenter('container');

<!--页面转换 -->
let jump = (key) =>{
    switch (key){
        case 1:
            $("#menuContainer").css('display','none');
            $("#container").css('display','block');
            $("#tool").css('display','block');
            $("#infor").html('人机对弈');
            break;
        case 2:
            $("#menuContainer").css('display','none');
            $("#container").css('display','block');
            $("#tool").css('display','block');
            $("#infor").html('双人对弈');
            break;
        case 3:
            $("#menuContainer").css('display','none');
            $("#container").css('display','block');
            $("#tool").css('display','block');
            $("#infor").html('机器对弈');
            break;
        case 4:
            $("#tool").css('display','none');
            $("#container").css('display','none');
            $("#menuContainer").css('display','block');
            break;
    }
}
<!--获取位置 -->
$('#container').on('click',function (e){
    console.log('棋盘被点击了');
    e = e||window.event;
    if(e.pageX||e.pageY){
        movex =e.pageX -parseInt($("#container").css('marginLeft'))-74;
        movey =e.pageY -parseInt($("#container").css('marginTop'))-72;
    }
    console.log(movex,movey)
})