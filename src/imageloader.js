/**
 * Created by Administrator on 2016/11/4.
 */
'use strict';

/**
 * 预加载图片的函数
 * @param images 加载图片的数组或者对象
 * @param callback 全部图片加载完毕后调用的回调函数
 * @param timeout 加载超时的时长
 */
function loadImage(images,callback,timeout){
    //遍历出图片的计数器
    var count = 0;
    //默认全部图片都能成功加载
    var success = true;
    //超时timer的id
    var timerId = 0;
    //默认不会加载超时
    var isTimeout = false;
    //已经加载完成的长度
    var loaded = 0;

    //对图片数组（或对象）进行遍历
    for(var key in images){
        //过滤掉prototype上的属性
        if(!images.hasOwnProperty(key)){
            continue;
        }
        //获得每个图片元素
        //期望每个图片元素是一个object：{src:XXX}
        var item = images[key];
        if(typeof item === "string"){
            item = images[key] = {
                src:item
            }
        }
        //如果格式不满足期望，则进行下一次遍历
        if(!item || !item.src){
            continue;
        }
       //计算+1
         ++ count;
        //设置图片元素的id
        item.id = '__img__' + key + getId();
        //设置图片元素的image，它是一个image对象
        item.image = window[item.id] = new Image();

        doLoad(item);
    }
    //如果计数为0，则直接调用callback
    if(!count){
       callback(success);
    }else if(timeout){//如果设置了最长加载时间
        timerId = setTimeout(onTimeout,timeout)
    }
    /**
     * 真正进行图片预加载的函数
     * @param item 图片元素的对象
     */
    function doLoad(item){
        item.state = 'loading';

        var img = item.image;
        //图片加载成功的一个回调函数
        img.onload = function(){
            //只要有一张出现加载失败，success就会为false
            success = success & true;
            item.state = 'load';
            loaded ++;
            done();

        };
        //图片加载失败的回调函数
        img.onerror = function(){
            success = false;
            item.state = 'error';
            loaded ++;
            done();
        };
        //加载图片
        img.src = item.src;
        /**
         * 每张图片加载完成的回调函数，不论成功还是失败
         */
        function done(){
            //清除绑定的事件
            img.onload = null;
            img.onerror = null;
            try{
               delete window[item.id]
            }catch (e){

            }
            //当所有图片加载完成并且没有超时的情况，清除定时器，且执行回调函数
            if(count === loaded && !isTimeout){
                clearTimeout(timerId);
                callback(success);
            }
        }
    }

    /**
     * 超时函数
     */
    function onTimeout(){
        isTimeout = true;
        success = false;
        callback(success);
    }

}

var __id = 0;
function getId(){
   return ++ __id;
}
module.exports = loadImage;