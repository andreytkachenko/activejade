module.exports=[{FILE_NAME:"./tests/test_while.jade",TEMPLATE:function(s,d){var n_0,__FILE__="./tests/test_while.jade";var n_1=d.ifelse(s,function(){return n_0;},[function(s){
var n_2=d.tag(s,function(){return n_1;},function(s){
var n_3=d.text(s,function(){return n_2;}," Hello, this is a while test\n",[]);return [n_3];
},"h1",function(s,c){return d.util.merge_attrs([{"id": "x1"},d.__p(s.aaa)]);},[],["aaa"]);var n_4=d.statement(s,function(){return n_1;},function(s,c){return s.k=0;},["k"]);var n_5=d.dowhile(s,function(){return n_1;},function(s){
var n_6=d.ifelse(s,function(){return n_5;},[function(s){
var n_7=d.tag(s,function(){return n_6;},function(s){
var n_8=d.text(s,function(){return n_7;},function(s,c){return d.__p((d.__p(s.test))[d.__p(s.k)]);},["k","test","(test)[k]"]);return [n_8];
},"div",d.util.merge_attrs([{"id": "x3"}]),[],[]);return [n_7];
}],function(s,c){return d.__p(s.k) % 2 === 0;},["k"]);var n_9=d.statement(s,function(){return n_5;},function(s,c){return ++s.k;},["k"]);return [n_6,n_9];
},function(s,c){return d.__p(s.k) < d.__p(d.__p(s.test).length);},["k","test","test.length"]);return [n_2,n_4,n_5];
},function(s){
var n_10=d.tag(s,function(){return n_1;},function(s){
var n_11=d.text(s,function(){return n_10;}," No records\n",[]);return [n_11];
},"h1",d.util.merge_attrs([{"id": "x2"}]),[],[]);var n_12=d.statement(s,function(){return n_1;},function(s,c){return d.__p(d.__id('test')).innerHTML="Hi";},["#test.innerHTML"]);return [n_10,n_12];
}],function(s,c){return d.__p(s.test);},["test"]);;n_0=d.generate([n_1]);return n_0;}}]