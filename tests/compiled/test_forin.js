module.exports=[{FILE_NAME:"./tests/test_forin.jade",TEMPLATE:function(s,d){var n_0,__FILE__="./tests/test_forin.jade";var n_1=d.next("ifelse",[s,function(){return n_0;},[function(s){
var n_2=d.next("tag",[s,function(){return n_1;},function(s){
var n_3=d.next("text",[s,function(){return n_2;}," Hello, this is a for-in test\n",[]]);return [n_3];
},"h1",d.util.merge_attrs([{"id": "x1"}]),[],[]]);var n_4=d.next("forin",[s,function(){return n_1;},function(s){
var n_5=d.next("tag",[s,function(){return n_4;},function(s){
var n_6=d.next("text",[s,function(){return n_5;},function(s,c){return d.__p(s.v);},["v"]]);return [n_6];
},"div",d.util.merge_attrs([{"id": "x3"}]),[],[]]);return [n_5];
},function(s,c){return d.__p(s.test);},"v","k",function(s,c){return d.__p(s.k) % 2 === 0;},["test"]]);return [n_2,n_4];
},function(s){
var n_7=d.next("tag",[s,function(){return n_1;},function(s){
var n_8=d.next("text",[s,function(){return n_7;}," No records\n",[]]);return [n_8];
},"h1",d.util.merge_attrs([{"id": "x2"}]),[],[]]);return [n_7];
}],function(s,c){return d.__p(s.test);},["test"]]);;n_0=d.generate([n_1]);return n_0;}}]