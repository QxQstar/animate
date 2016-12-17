(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["animation"] = factory();
	else
		root["animation"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by Administrator on 2016/11/4.
	 */
	"use strict";

	var loadImage = __webpack_require__(1);
	var Timeline = __webpack_require__(2);
	//��ʼ��״̬
	var STATE_INITIAL = 0;
	//��ʼ״̬
	var STATE_START = 1;
	//ֹͣ״̬
	var STATE_STOP = 2;
	//ͬ������
	var TASK_SYNC = 0;
	//�첽����
	var TASK_ASYNC = 1;
	/**
	 * �򵥵ĺ�����װ��ִ��callback
	 * @param callback ִ�еĻص�
	 */
	function next(callback){
	    callback && callback();
	}
	/**
	 * ֡��������
	 * @constructor
	 */
	function Animation() {
	    this.taskQueue = [];
	    this.index = 0;
	    this.state = STATE_INITIAL;
	    this.timeline = new Timeline();
	}

	/**
	 * ����һ��ͬ��������ͼƬԤ����
	 * @param imagelist ͼƬ����
	 */
	Animation.prototype.loadImage = function(imagelist){
	    var taskFn = function(next){
	        loadImage(imagelist.slice(0),next);
	    };
	    var type = TASK_SYNC;

	    return this.__add(taskFn,type);

	};
	/**
	 * ����һ���첽��ʱ������ͨ����ʱ�ı�ͼƬ����λ�ã�ʵ��֡����
	 * @param ele DOM����
	 * @param positions ����λ������
	 * @param imageUrl ͼƬ�ĵ�ַ
	 */
	Animation.prototype.changePosition = function(ele,positions,imageUrl){
	    var len = positions.length;
	    var type;
	    var taskFn;
	    var me = this;
	    if(len){
	        taskFn = function(next,time){
	            if(imageUrl && !ele.style.backgroundImage){
	                ele.style.backgroundImage = 'url(' + imageUrl + ')';
	                console.log('kk');
	            }
	            //���õ�ǰ����ͼƬ��λ������
	            var index = Math.min(time / me.interval | 0,len -1 );
	            var position = positions[index].split(" ");
	            //�ı�DOM����ͼƬ��λ��
	            ele.style.backgroundPosition = position[0] + 'px ' + position[1] + 'px';
	            //�����Ѿ���������һ֡����ִ����һ������
	            if(index === len -1){
	                next();
	            }

	        };
	        type = TASK_ASYNC;
	    }else{
	        taskFn = next;
	        type = TASK_ASYNC;
	    }
	    return this.__add(taskFn,type);
	};
	/**
	 * ����һ���첽��ʱ������ͨ����ʱ�ı�images��ǩ��src���ԣ�ʵ��֡����
	 * @param ele image��ǩ
	 * @param imagelist ͼƬ����
	 */
	Animation.prototype.changeSrc  = function(ele,imagelist){
	    var len = imagelist.length;
	    var type;
	    var taskFn;
	    var me = this;
	    if(len){
	        taskFn = function(next,time){
	            //���õ�ǰͼƬ����
	            var index = Math.min(time/me.interval | 0,len-1);
	            //�ı�image������ͼƬ��ַ
	            ele.src = imagelist[index];
	            if(index === len-1){
	                next();
	            }
	        };
	        type = TASK_ASYNC;
	    }else{
	        taskFn = next;
	        type = TASK_ASYNC;
	    }
	    return this.__add(taskFn,type);
	};
	/**
	 * �߼��÷� ����һ���첽��ʱ��������
	 * �������Զ��嶯��ÿһִ֡�е�����
	 * @param taskFn �Զ���ÿִ֡�е���������
	 */
	Animation.prototype.enterFrame = function(taskFn){
	    return this.__add(taskFn,TASK_ASYNC);
	};
	/**
	 *  ����һ��ͬ�����񣬿�������һ������������ִ�еĻص�����
	 * @param callback �ص�����
	 */
	Animation.prototype.then = function(callback){
	    var taskFn = function(next){
	        callback();
	        next();
	    };
	    var type = TASK_SYNC;
	    return this.__add(taskFn,type);
	};
	/**
	 * ��ʼִ���������첽��ʱ����ִ�е�ʱ������
	 * @param interval
	 */
	Animation.prototype.start = function(interval){
	    if(this.state === STATE_START){
	        return this
	    }
	    //������������Ϊ����ֱ�ӷ���
	    if(!this.taskQueue.length){
	        return this
	    }
	    this.state = STATE_START;
	    this.interval = interval;
	    this.__runTask();
	    return this;
	};
	/**
	 * ����һ��ͬ�����񣬻��˵���һ��������ʵ���ظ���һ��������Ч�������Զ����ظ��Ĵ���
	 * @param times �ظ��Ĵ���
	 */
	Animation.prototype.repeat = function(times){
	    var me = this;
	    var taskFn = function(next){
	        if(typeof times === 'undefined'){
	            //���޴��ظ�
	            me.index -- ;
	            me.__runTask();
	            return;
	        }
	        if(times){
	            times --;
	            me.index --;
	            me.__runTask();
	        }else{
	            //�����ظ��Ĵ�������ת����һ������
	            next();
	        }
	    };
	    var type = TASK_SYNC;
	   return this.__add(taskFn,type);
	};
	/**
	 * ����һ��ͬ��������������repeat()��һ�������ѺõĽӿڣ������ظ���һ������
	 */
	Animation.prototype.repeatForever = function(){
	    return this.repeat();
	};
	/**
	 * ���õ�ǰ����ִ�н�������һ��������ʼǰ�ĵȴ�ʱ��
	 * @param time �ȴ�ʱ��
	 */
	Animation.prototype.wait = function(time){
	    if(this.taskQueue && this.taskQueue.length >0){
	        this.taskQueue[this.taskQueue.length - 1].wait = time;
	    }
	    return this;
	};
	/**
	 * ��ͣ��ǰ���첽��ʱ����
	 */
	Animation.prototype.pause = function(){
	    if(this.state === STATE_START){
	        this.state = STATE_STOP;
	        this.timeline.stop();
	        return this;
	    }
	    return this;
	};
	/**
	 * ����ִ����һ����ͣ���첽����
	 */
	Animation.prototype.restart = function(){
	    if(this.state === STATE_STOP){
	        this.state = STATE_START;
	        this.timeline.restart();
	        return this;
	    }
	    return this;
	};
	/**
	 * �ͷ���Դ
	 */
	Animation.prototype.dispose = function(){
	    if(this.state !== STATE_INITIAL){
	        this.state = STATE_INITIAL;
	        this.timeline.stop = null;
	        this.timeline  = null;
	        this.taskQueue = null;
	        return this;
	    }
	    return this;
	};
	/**
	 * ����һ����������������
	 * @param taskFn ���񷽷�
	 * @param type ��������
	 * @private
	 */
	Animation.prototype.__add = function(taskFn,type){
	    this.taskQueue.push({
	        taskFn:taskFn,
	        type:type
	    });
	    return this;
	};
	/**
	 * ִ������
	 * @private
	 */
	Animation.prototype.__runTask = function(){
	    if(!this.taskQueue || this.state !== STATE_START){
	       return;
	    }
	    //ִ����������
	    if(this.index === this.taskQueue.length){
	        this.dispose();
	        return;
	    }
	    var task = this.taskQueue[this.index];
	    if(task.type === TASK_SYNC){
	        this.syncTask(task);
	    }else{
	        this.asnycTask(task);
	    }
	};
	/**
	 * һ��ͬ������
	 * @param task ִ�е���������
	 */
	Animation.prototype.syncTask = function(task){
	    var me = this;
	    var next = function(){
	        //ִ����һ������
	        me.__next(task);
	    };
	    var taskFn = task.taskFn;
	    taskFn(next);
	};
	/**
	 * һ���첽����
	 * @param task ִ�е���������
	 */
	Animation.prototype.asnycTask = function (task) {
	    var me = this;
	    var enterFrame = function(time){
	        var taskFn = task.taskFn;
	        var next = function(){
	            //ֹͣ��ǰ����
	            me.timeline.stop();
	            //ִ����һ����
	            me.__next(task);
	        };
	        taskFn(next,time);
	    };
	    this.timeline.onenterFrame = enterFrame;
	    this.timeline.start(this.interval);
	};
	/**
	 * �л�����һ������,����������Ҫ�ȴ������ӳ�ִ��
	 * @param task ��ǰ����
	 * @private
	 */
	Animation.prototype.__next = function(task){
	    var me = this;
	    this.index ++;
	    task.wait?setTimeout(function(){
	        me.__runTask();
	    },task.wait):this.__runTask();
	};
	module.exports = function(){
	    return new Animation();
	};


/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * Created by Administrator on 2016/11/4.
	 */
	'use strict';

	/**
	 * Ԥ����ͼƬ�ĺ���
	 * @param images ����ͼƬ���������߶���
	 * @param callback ȫ��ͼƬ�������Ϻ����õĻص�����
	 * @param timeout ���س�ʱ��ʱ��
	 */
	function loadImage(images,callback,timeout){
	    //������ͼƬ�ļ�����
	    var count = 0;
	    //ȫ��ͼƬ���سɹ���һ����־λ
	    var success = true;
	    //��ʱtimer��id
	    var timerId = 0;
	    //�Ƿ����س�ʱ�ı�־λ
	    var isTimeout = false;
	    //�Ѿ��������ɵĳ���
	    var loaded = 0;

	    //��ͼƬ���飨�����󣩽��б���
	    for(var key in images){
	        //���˵�prototype�ϵ�����
	        if(!images.hasOwnProperty(key)){
	            continue;
	        }
	        //����ÿ��ͼƬԪ��
	        //����item��һ��object��{src:XXX}
	        var item = images[key];
	        if(typeof item === "string"){
	            item = images[key] = {
	                src:item
	            }
	        }
	        //������ʽ��������������������һ�α���
	        if(!item || !item.src){
	            continue;
	        }
	       //����+1
	         ++ count;
	        //����ͼƬԪ�ص�id
	        item.id = '__img__' + key + getId();
	        //����ͼƬԪ�ص�image������һ��image����
	        item.image = window[item.id] = new Image();

	        doLoad(item);
	    }
	    //��������Ϊ0����ֱ�ӵ���callback
	    if(!count){
	       callback(success);
	    }else if(timeout){
	        timerId = setTimeout(onTimeout,timeout)
	    }
	    /**
	     * ��������ͼƬԤ���صĺ���
	     * @param item ͼƬԪ�صĶ���
	     */
	    function doLoad(item){
	        item.state = 'loading';

	        var img = item.image;
	        //ͼƬ���سɹ���һ���ص�����
	        img.onload = function(){
	            //ֻҪ��һ�ų��ּ���ʧ�ܣ�success�ͻ�Ϊfalse
	            success = success & true;
	            item.state = 'load';
	            loaded ++;
	            done();

	        };
	        //ͼƬ����ʧ�ܵĻص�����
	        img.onerror = function(){
	            success = false;
	            item.state = 'error';
	            loaded ++;
	            done();
	        };
	        //����ͼƬ
	        img.src = item.src;
	        /**
	         * ÿ��ͼƬ�������ɵĻص����������۳ɹ�����ʧ��
	         */
	        function done(){
	            img.onload = null;
	            img.onerror = null;
	            try{
	               delete window[item.id]
	            }catch (e){

	            }
	            //ÿ��ͼƬ�������ɣ���������һ��������ͼƬ��������û�г�ʱ��������������ʱ������ִ�лص�����
	            if(count === loaded && !isTimeout){
	                clearTimeout(timerId);
	                callback(success);
	            }
	        }
	    }

	    /**
	     * ��ʱ����
	     */
	    function onTimeout(){
	        isTimeout = true;
	        callback(false);
	    }

	}

	var __id = 0;
	function getId(){
	   return ++ __id;
	}
	module.exports = loadImage;

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Created by Administrator on 2016/11/4.
	 */
	'use strict';
	var DEFAULT_INTERVAL = 1000/60;
	/**
	 * raf
	 */
	var requestAnimationFrame = (function(){
	    return window.requestAnimationFrame ||
	            window.webkitCancelRequestAnimationFrame ||
	            window.mozRequestAnimationFrame ||
	            window.oRequestAnimationFrame ||
	            function(callback){
	                return window.setTimeout(callback,callback.interval || DEFAULT_INTERVAL);
	            }
	})();

	var cancelRequestAnimationFrame = (function(){
	    return window.cancelRequestAnimationFrame ||
	            window.webkitCancelRequestAnimationFrame ||
	            window.mozCancelRequestAnimationFrame ||
	            window.oCancelRequestAnimationFrame ||
	            function(id){
	               return window.clearTimeout(id);
	            }
	})();
	//��ʼ��״̬
	var STATE_INITIAL = 0;
	//��ʼ״̬
	var STATE_START = 1;
	//ֹͣ״̬
	var STATE_STOP = 2;
	/**
	 * ʱ������
	 * @constructor
	 */
	function Timeline(){
	    this.state = STATE_INITIAL;
	    this.animationHandler = 0;

	}
	/**
	 * ʱ������ÿһ�λص�ִ�еĺ���
	 * @param time �Ӷ�����ʼ����ǰִ�е�ʱ��
	 */
	Timeline.prototype.onenterFrame = function(time){

	};
	/**
	 * ������ʼ
	 * @param interval ÿһ�λص���ʱ������
	 */
	Timeline.prototype.start = function(interval){
	    if(this.state === STATE_START){
	        return;
	    }
	    this.state = STATE_START;
	    this.interval = interval || DEFAULT_INTERVAL;
	    startTimeline(this,+new Date());
	};
	/**
	 * �ö���ֹͣ
	 */
	Timeline.prototype.stop = function(){
	    var me = this;
	    if(this.state !== STATE_START){
	        return;
	    }
	    this.state = STATE_STOP;
	    //����������ʼ��������¼�����ӿ�ʼ��������������ʱ��
	    if(this.startTime){
	        this.dur = +new Date() - this.startTime;
	    }
	    cancelRequestAnimationFrame(me.animationHandler);

	};
	/**
	 * ���¿�ʼ����
	 */
	Timeline.prototype.restart = function(){
	    if(this.state === STATE_START){
	        return;
	    }
	    if(!this.dur || !this.interval){
	        return;
	    }
	    this.state = STATE_START;
	    startTimeline(this,+new Date() - this.dur);
	};
	/**
	 * ʱ���ᶯ����������
	 * @param timeline ʱ����ʵ��
	 * @param startTime ������ʼʱ����
	 */
	function startTimeline(timeline,startTime){
	    timeline.startTime = startTime;
	    nextTick.interval = timeline.interval;
	    //��һ�λص���ʱ����
	    var lastTick = +new Date();
	    nextTick();

	    /**
	     * ÿһִ֡�еĺ���
	     */
	    function nextTick(){
	        var now = +new Date();

	        timeline.animationHandler = requestAnimationFrame(nextTick);

	        //��ǰʱ������һ�λص���ʱ�����������õ�ʱ����������ʾ���ο���ִ�лص�����
	        if(now - lastTick >= timeline.interval){
	            timeline.onenterFrame(now - startTime);
	            lastTick = now;
	        }
	    }
	}
	module.exports = Timeline;

/***/ }
/******/ ])
});
;