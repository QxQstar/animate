/**
 * Created by Administrator on 2016/11/4.
 */
"use strict";

var loadImage = require('./imageloader.js');
var Timeline = require('./timeline.js');
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
 * ���һ��ͬ������ͼƬԤ����
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
 * ���һ���첽��ʱ����ͨ����ʱ�ı�ͼƬ����λ�ã�ʵ��֡����
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
            }
            //��õ�ǰ����ͼƬ��λ������
            var index = Math.min(time / me.interval | 0,len -1 );
            var position = positions[index].split(" ");
            //�ı�DOM����ͼƬ��λ��
            ele.style.backgroundPosition = position[0] + 'px ' + position[1] + 'px';
            //����Ѿ��������һ֡����ִ����һ������
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
 * ���һ���첽��ʱ����ͨ����ʱ�ı�images��ǩ��src���ԣ�ʵ��֡����
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
            //��õ�ǰͼƬ����
            var index = Math.min(time/me.interval | 0,len-1);
            //�ı�image�����ͼƬ��ַ
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
 * �߼��÷� ���һ���첽��ʱ������
 * �������Զ��嶯��ÿһִ֡�е�����
 * @param taskFn �Զ���ÿִ֡�е�������
 */
Animation.prototype.enterFrame = function(taskFn){
    return this.__add(taskFn,TASK_ASYNC);
};
/**
 *  ���һ��ͬ�����񣬿�������һ�����������ִ�еĻص�����
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
 * ��ʼִ�������첽��ʱ����ִ�е�ʱ����
 * @param interval
 */
Animation.prototype.start = function(interval){
    if(this.state === STATE_START){
        return this
    }
    //����������Ϊ����ֱ�ӷ���
    if(!this.taskQueue.length){
        return this
    }
    this.state = STATE_START;
    this.interval = interval;
    this.__runTask();
    return this;
};
/**
 * ���һ��ͬ�����񣬻��˵���һ��������ʵ���ظ���һ�������Ч�������Զ����ظ��Ĵ���
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
 * ���һ��ͬ�����������repeat()��һ�������ѺõĽӿڣ������ظ���һ������
 */
Animation.prototype.repeatForever = function(){
    return this.repeat();
};
/**
 * ���õ�ǰ����ִ�н�������һ������ʼǰ�ĵȴ�ʱ��
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
 * ���һ�������������
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
    //ִ���������
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
 * @param task ִ�е��������
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
 * @param task ִ�е��������
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
 * �л�����һ������,���������Ҫ�ȴ������ӳ�ִ��
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
