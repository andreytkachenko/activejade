module.exports=[{FILE_NAME:"./tests/include/main.jade",TEMPLATE:function(s,d){var n_0,__FILE__="./tests/include/main.jade";var n_1=d.next("tag",[s,function(){return n_0;},function(s){
var n_2=d.next("text",[s,function(){return n_1;}," Hello, World!\n",[]]);return [n_2];
},"h1",null,false,[],[]]);;n_0=d.generate([n_1]);return n_0;}},{FILE_NAME:"./tests/test_indexpage.jade",TEMPLATE:function(s,d){var n_0,__FILE__="./tests/test_indexpage.jade";var n_3=d.next("statement",[s,function(){return n_0;},function(s,c){return s.page={"current":"main", "title":"ActiveJade Examples", "scripts":["/js/app.js", "/js/view.js"], "styles":["/css/main.css"]};},["page"]]);var n_4=d.next("doctype",[s,function(){return n_0;},"html"]);var n_5=d.next("tag",[s,function(){return n_0;},function(s){
var n_6=d.next("tag",[s,function(){return n_5;},function(s){
var n_7=d.next("tag",[s,function(){return n_6;},function(s){
var n_8=d.next("text",[s,function(){return n_7;},function(s,c){return d.__p(d.__p(s.page).title);},["page","page.title"]]);return [n_8];
},"title",null,false,[],[]]);var n_9=d.next("forin",[s,function(){return n_6;},function(s){
var n_10=d.next("tag",[s,function(){return n_9;},function(s){
return [];
},"script",function(s,c){return d.util.merge_attrs([{"src": d.__p(s.script)}]);},false,[],["script"]]);return [n_10];
},function(s,c){return d.__p(d.__p(s.page).scripts);},"script","undefined",true,["page","page.scripts"]]);var n_11=d.next("forin",[s,function(){return n_6;},function(s){
var n_12=d.next("tag",[s,function(){return n_11;},function(s){
return [];
},"link",function(s,c){return d.util.merge_attrs([{"href": d.__p(s.style)},{"rel": "stylesheet"}]);},false,[],["style"]]);return [n_12];
},function(s,c){return d.__p(d.__p(s.page).styles);},"style","undefined",true,["page","page.styles"]]);return [n_7,n_9,n_11];
},"head",null,false,[],[]]);var n_13=d.next("tag",[s,function(){return n_5;},function(s){
var n_14=d.next("include",[s,function(){return n_13;},function(s,c){return ["./tests/include/", d.__p(d.__p(d.__p(s.page).current)), ".jade"].join("");},null,__FILE__,["page","page.current"]]);return [n_14];
},"body",null,false,[],[]]);return [n_6,n_13];
},"html",null,false,[],[]]);;n_0=d.generate([n_3,n_4,n_5]);return n_0;}}]