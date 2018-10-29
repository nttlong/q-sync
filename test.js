var x=require("./index")
var ret=x(function(cb){
    setTimeout(function(){
        console.log("F1");
        cb();
    },1000);
},function(cb){
    setTimeout(function(){
        console.log("F2");
        cb();
    },100);
}).promiseParalel().then(function(r){
    console.log(r);
}).catch(function(ex){
    console.log(ex);
})
