template.add("./tests/test_casewhen.jade", function(s,d){var n_1=d.tag(s,function(){return n_0;},function(s){
var n_2=d.tag(s,function(){return n_1;},function(s){
var n_3=d.text(s,function(){return n_2;},function(s){return (s.test||"").toString();},["test"]);return [n_3];
},"span",null,[],[]);var n_4=d.casewhen(s,function(){return n_1;},[function(s){
var n_5=d.tag(s,function(){return n_undefined;},function(s){
var n_6=d.text(s,function(){return n_5;},[" One", "\n"].join(""),[]);return [n_6];
},"span",null,[],[]);return [n_5];
},function(s){
var n_7=d.tag(s,function(){return n_undefined;},function(s){
var n_8=d.text(s,function(){return n_7;},[" Two", "\n"].join(""),[]);return [n_8];
},"span",null,[],[]);return [n_7];
},function(s){
var n_9=d.tag(s,function(){return n_undefined;},function(s){
var n_10=d.text(s,function(){return n_9;},[" Three", "\n"].join(""),[]);return [n_10];
},"span",null,[],[]);return [n_9];
},function(s){
var n_11=d.tag(s,function(){return n_undefined;},function(s){
var n_12=d.text(s,function(){return n_11;},[" Four", "\n"].join(""),[]);return [n_12];
},"span",null,[],[]);return [n_11];
},function(s){
var n_13=d.tag(s,function(){return n_undefined;},function(s){
var n_14=d.text(s,function(){return n_13;},[" Five or Six", "\n"].join(""),[]);return [n_14];
},"span",null,[],[]);return [n_13];
},function(s){
var n_15=d.tag(s,function(){return n_undefined;},function(s){
var n_16=d.text(s,function(){return n_15;},[" Others", "\n"].join(""),[]);return [n_16];
},"span",null,[],[]);return [n_15];
}],[{children:0,expr:1},{children:1,expr:2},{children:2,expr:3},{children:3,expr:4},{children:4,expr:5},{children:4,expr:6},{children:5,expr:7}],function(s){return (s.test||"").length;},5,["test"]);return [n_2,n_4];
},"div",null,[],[]);; return d.generate([n_1]);});