module.exports={FILE_NAME:"./tests/include/test1.jade",template:function(s,d){var n_0,__FILE__="./tests/include/test1.jade";var n_1=d.tag(s,function(){return n_0;},function(s){
var n_2=d.text(s,function(){return n_1;},function(s,c){return s.name;},["name"]);return [n_2];
},"div",null,[],[]);;n_0=d.generate([n_1]);return n_0;}};;module.exports={FILE_NAME:"./tests/test_include.jade",template:function(s,d){var n_0,__FILE__="./tests/test_include.jade";var n_3=d.tag(s,function(){return n_0;},function(s){
var n_4=d.forin(s,function(){return n_3;},function(s){
var n_5=d.include(s,function(){return n_4;},"./tests/include/test1.jade",function(s,c){return {"name": s.v};},__FILE__,[]);return [n_5];
},function(s,c){return s.test;},"v","undefined",true,["test"]);return [n_4];
},"div",d.util.merge_attrs([{"id": "root"}]),[],[]);;n_0=d.generate([n_3]);return n_0;}};