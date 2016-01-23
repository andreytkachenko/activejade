module.exports=[{FILE_NAME:"./tests/test_async.jade",TEMPLATE:function(s,d){var n_0,__FILE__="./tests/test_async.jade";var n_1=d.next("tag",[s,function(){return n_0;},function(s){
var n_2=d.next("ifelse",[s,function(){return n_1;},[function(s){
var n_3=d.next("tag",[s,function(){return n_2;},function(s){
var n_4=d.next("text",[s,function(){return n_3;}," Test ready!\n",[]]);return [n_4];
},"span",null,false,[],[]]);return [n_3];
},function(s){
var n_5=d.next("tag",[s,function(){return n_2;},function(s){
var n_6=d.next("text",[s,function(){return n_5;}," Test not ready!\n",[]]);return [n_6];
},"span",null,false,[],[]]);return [n_5];
}],function(s,c){return d.__p(s.test);},["test"]]);return [n_2];
},"div",null,false,[],[]]);var n_7=d.next("tag",[s,function(){return n_0;},function(s){
var n_8=d.next("forin",[s,function(){return n_7;},function(s){
var n_9=d.next("tag",[s,function(){return n_8;},function(s){
var n_10=d.next("text",[s,function(){return n_9;},function(s,c){return d.__p(s.x);},["x"]]);return [n_10];
},"a",function(s,c){return d.util.merge_attrs([{"href": d.__p(d.__p(s.h))}]);},false,[],["h"]]);return [n_9];
},function(s,c){return d.__p(s.test);},"x","h",true,["test"]]);return [n_8];
},"div",null,false,[],[]]);;n_0=d.generate([n_1,n_7]);return n_0;}}]