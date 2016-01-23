module.exports=[{FILE_NAME:"./tests/test_mixin.jade",TEMPLATE:function(s,d){var n_0,__FILE__="./tests/test_mixin.jade";var n_1=d.mixin(s,function(){return n_0;},function(s){
var n_2=d.tag(s,function(){return n_1;},function(s){
var n_3=d.text(s,function(){return n_2;},function(s,c){return d.__p(s.x);},["x"]);return [n_3];
},"div",null,[],[]);return [n_2];
},"test0",["x"],null);var n_4=d.mixin(s,function(){return n_0;},function(s){
var n_5=d.tag(s,function(){return n_4;},function(s){
var n_6=d.text(s,function(){return n_5;},function(s,c){return d.__p(s.x);},["x"]);var n_7=d.mixinblock(s,function(){return n_5;});return [n_6,n_7];
},"div",null,[],[]);return [n_5];
},"test1",["x"],null);var n_8=d.tag(s,function(){return n_0;},function(s){
var n_9=d.forin(s,function(){return n_8;},function(s){
var n_10=d.mixincall(s,function(){return n_9;},[],"test0",[{id:"",expr:d.__p(s.i),deps:["i"]}],{},null,[]);var n_11=d.mixincall(s,function(){return n_9;},function(s){
var n_12=d.text(s,function(){return n_11;}," Bob\n",[]);return [n_12];
},"test1",[{id:"",expr:d.__p(s.i),deps:["i"]}],{},null,[]);var n_13=d.mixincall(s,function(){return n_9;},function(s){
var n_14=d.tag(s,function(){return n_13;},function(s){
var n_15=d.text(s,function(){return n_14;}," Bob\n",[]);return [n_15];
},"span",null,[],[]);return [n_14];
},"test1",[{id:"",expr:d.__p(s.i),deps:["i"]}],{},null,[]);return [n_10,n_11,n_13];
},function(s,c){return d.__p(s.test);},"i","undefined",true,["test"]);return [n_9];
},"div",null,[],[]);;n_0=d.generate([n_1,n_4,n_8]);return n_0;}}]