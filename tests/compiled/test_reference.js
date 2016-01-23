module.exports=[{FILE_NAME:"./tests/test_reference.jade",TEMPLATE:function(s,d){var n_0,__FILE__="./tests/test_reference.jade";var n_1=d.next("tag",[s,function(){return n_0;},function(s){
var n_2=d.next("text",[s,function(){return n_1;},"Hello\n",[]]);return [n_2];
},"div",d.util.merge_attrs([{"id": "main"}]),[],[]]);var n_3=d.next("ifelse",[s,function(){return n_0;},[function(s){
var n_4=d.next("statement",[s,function(){return n_3;},function(s,c){return d.__p(d.__id('main')).innerHTML=d.__p(d.__p(d.__id('main')).innerHTML)+", World!" + d.__p(d.__p(d.__id('test')).innerHTML);},["#main.innerHTML","#test.innerHTML"]]);return [n_4];
}],function(s,c){return d.__p(s.test);},["test"]]);var n_5=d.next("tag",[s,function(){return n_0;},function(s){
var n_6=d.next("text",[s,function(){return n_5;}," Hi\n",[]]);return [n_6];
},"div",d.util.merge_attrs([{"id": "test"}]),[],[]]);;n_0=d.generate([n_1,n_3,n_5]);return n_0;}}]