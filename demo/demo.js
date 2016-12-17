/**
 * Created by star on 2016/11/5.
 */
var imgUrl = './../img/rabbit-big.png';
var positions = ['0 -854','-174 -852','-349 -852','-524 -852','-698 -852'
    ,'-873 -848'];
var ele = document.getElementById('rabbit');
var animation = window.animation;
var repeatAnimation = animation()
                                .loadImage([imgUrl])
                                .changePosition(ele,positions,imgUrl)
                                .repeatForever();
repeatAnimation.start(80);
