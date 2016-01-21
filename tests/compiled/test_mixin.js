module.exports=[{FILE_NAME:"./tests/test_mixin.jade",TEMPLATE:function(s,d){var n_0,__FILE__="./tests/test_mixin.jade";var n_1=d.mixin(s,function(){return n_0;},function(s){
var n_2=d.tag(s,function(){return n_1;},function(s){
var n_3=d.text(s,function(){return n_2;},function(s,c){return s.x;},["x"]);return [n_3];
},"div",null,[],[]);return [n_2];
},"test",["x"],null);var n_4=d.tag(s,function(){return n_0;},function(s){
var n_5=d.forin(s,function(){return n_4;},function(s){
var n_6=d.mixincall(s,function(){return n_5;},[],"test",[{id:"",expr:s.i,deps:["i"]}],{},null,[]);return [n_6];
},function(s,c){return s.test;},"i","undefined",true,["test"]);return [n_5];
},"div",null,[],[]);;n_0=d.generate([n_1,n_4]);return n_0;}}]