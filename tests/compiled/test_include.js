module.exports=[{FILE_NAME:"./tests/include/test1.jade",TEMPLATE:function(s,d){var n_0,__FILE__="./tests/include/test1.jade";var n_1=d.next("tag",[s,function(){return n_0;},function(s){
var n_2=d.next("text",[s,function(){return n_1;},function(s,c){return d.__p(s.name);},["name"]]);return [n_2];
},"div",null,false,[],[]]);;n_0=d.generate([n_1]);return n_0;}},{FILE_NAME:"./tests/test_include.jade",TEMPLATE:function(s,d){var n_0,__FILE__="./tests/test_include.jade";var n_3=d.next("statement",[s,function(){return n_0;},function(s,c){return s.test1="test1";},["test1"]]);var n_4=d.next("tag",[s,function(){return n_0;},function(s){
var n_5=d.next("forin",[s,function(){return n_4;},function(s){
var n_6=d.next("include",[s,function(){return n_5;},function(s,c){return ["./tests/include/", d.__p(d.__p(s.test1)), ".jade"].join("");},function(s,c){return {"name":d.__p(s.v)};},__FILE__,["test1"]]);return [n_6];
},function(s,c){return d.__p(s.test);},"v","undefined",true,["test"]]);return [n_5];
},"div",d.util.merge_attrs([{"id": "root"}]),false,[],[]]);;n_0=d.generate([n_3,n_4]);return n_0;}}]