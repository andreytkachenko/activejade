module.exports={FILE_NAME:"./tests/test_statements.jade", template: function(s,d){var __FILE__="./tests/test_statements.jade";var n_1=d.tag(s,function(){return n_0;},function(s){
var n_2=d.statement(s,function(){return n_1;},function(s){return s.xxx = "./test_tag.jade";},["xxx"]);var n_3=d.text(s,function(){return n_1;},1 + 2 + 3 + 4 + 5 + 6,[]);var n_4=d.statement(s,function(){return n_1;},function(s){return s.ttt = 5;},["ttt"]);var n_5=d.dowhile(s,function(){return n_1;},function(s){
var n_6=d.tag(s,function(){return n_5;},function(s){
var n_7=d.text(s,function(){return n_6;},function(s){return s.ttt;},["ttt"]);return [n_7];
},"ll",null,[],[]);var n_8=d.statement(s,function(){return n_5;},function(s){return --s.ttt;},["ttt"]);return [n_6,n_8];
},function(s){return s.ttt;},["ttt"]);var n_9=d.ifelse(s,function(){return n_1;},[function(s){
var n_10=d.ifelse(s,function(){return n_9;},[function(s){
var n_11=d.ifelse(s,function(){return n_10;},[function(s){
var n_12=d.forin(s,function(){return n_11;},function(s){
var n_13=d.include(s,function(){return n_12;},function(s){return s.xxx;},function(s){return {"i": s.test5};},__FILE__,["xxx"]);return [n_13];
},function(s){return s.test4;},"test5","null",["test4"]);return [n_12];
}],function(s){return s.test3;},["test3"]);return [n_11];
},function(s){
var n_14=d.tag(s,function(){return n_10;},function(s){
var n_15=d.text(s,function(){return n_14;}," Ooops\n",[]);return [n_15];
},"span",null,[],[]);return [n_14];
}],function(s){return s.test2;},["test2"]);return [n_10];
},function(s){
var n_16=d.tag(s,function(){return n_9;},function(s){
var n_17=d.text(s,function(){return n_16;}," Nothing\n",[]);return [n_17];
},"span",null,[],[]);return [n_16];
}],function(s){return s.test1;},["test1"]);return [n_2,n_3,n_4,n_5,n_9];
},null,d.util.merge_attrs([{"id": "test"}]),[],[]);; return [n_1];}};