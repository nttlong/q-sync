var DEASYNC = require("deasync");
function runSync(fn, args, cb) {
    function reject(e) {
        result = {
            error: e
        };
    }
    ;
    function resolve(r) {
        result = {
            result: r
        };
    }
    if (args instanceof Array) {
        var result = undefined;
        var _cb = function (e, r) {
            if (e) {
                result = {
                    error: e
                };
            }
            else {
                result = {
                    result: r
                };
            }
        };
        args.push(_cb);
        try {
            fn.apply(fn, args);
            DEASYNC.loopWhile(function () {
                return result === undefined;
            });
            if (result.error) {
                throw (new Error(result.error));
            }
            else {
                return result.result;
            }
        } catch (error) {
            throw(error);
        }
       
    }
    else {
        var result = undefined;
        fn({
            resolve: resolve,
            reject: reject,
        });
        DEASYNC.loopWhile(function () {
            return result === undefined;
        });
        if (result.error) {
            throw (result.error);
        }
        else {
            return result.result;
        }
    }
};
function caller(fnList){
    this._fnList=fnList;
}
caller.prototype.parallel=function(cb){
    var fnList=this._fnList;
    var promises=[];
    for(var i=0;i<fnList.length;i++){
        if(typeof fnList[i]==="function"){
            var fn=fnList[i];
            var promise = new Promise(function(resolve, reject) {
                var callback=function(err,result){
                    if(err){
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                }
                try {
                    fn(callback);    
                } catch (error) {
                    reject(error);
                }
            });
            promises.push(promise);
        }
    }
    function run(cb){
        Promise.all(promises).then(function(result){
            cb(null,result)
        }).catch(function(err){
            cb(err);
        })
    }
    if(cb){
        run(cb);
    }
    else {
        return runSync(run,[]);
    }
    
}
caller.prototype.promiseParalel=function(cb){
    var fnList=this._fnList;
    var promises=[];
    for(var i=0;i<fnList.length;i++){
        if(typeof fnList[i]==="function"){
            var fn=fnList[i];
            var promise = new Promise(function(resolve, reject) {
                var callback=function(err,result){
                    if(err){
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                }
                try {
                    fn(callback);    
                } catch (error) {
                    reject(error);
                }
            });
            promises.push(promise);
        }
    }
    return Promise.all(promises);
    
    
}
caller.prototype.promiseCall=function(){
    var fnList=this._fnList;
    var result=[];
    function exec(done,index){
        if(!index){
            index=0;
        }
        if(index<fnList.length){
            fnList[index](function(e,r){
                if(e){
                    done(e);
                }
                else {
                    result.push(r);
                    exec(done,index+1);
                }
            })
        }
        else {
            done(null,result);
        }
    }
    function run(cb){
        exec(cb);
    }
    return new Promise(function(resolve,reject){
        run(function(e,r){
            if(e){
                reject(e);
            }
            else {
                resolve(result);
            }
        })
    });
}
caller.prototype.call=function(cb){
    var fnList=this._fnList;
    var result=[];
    function exec(done,index){
        if(!index){
            index=0;
        }
        if(index<fnList.length){
            fnList[index](function(e,r){
                if(e){
                    done(e);
                }
                else {
                    result.push(r);
                    exec(done,index+1);
                }
            })
        }
        else {
            done(null,result);
        }
    }
    function run(cb){
        exec(cb);
    }
    if(cb){
        run(cb);
    }
    else {
        return runSync(run,[]); 
    }
}
caller.prototype.exec=function(fn,cb){
    if(cb){
        fn(cb);
    }
    else {
        return runSync(fn,[]);
    }
}
function main(){
    var fnList=arguments;
    if(arguments.length===1 &&  arguments[0] instanceof Array){
        fnList=arguments[0];
    }
    else if(arguments.length>1){
        fnList=arguments;
        
        
    }
    return new caller(fnList);
}

module.exports = main;