module.exports=[{FILE_NAME:"./tests/test_indexpage.jade",TEMPLATE:function(s,d){var n_0,__FILE__="./tests/test_indexpage.jade";var n_1=d.next("statement",[s,function(){return n_0;},function(s,c){return s.page={"title":"ActiveJade Examples", "scripts":["/js/app.js", "/js/view.js"], "styles":["/css/main.css"]};},["page"]]);var n_2=d.next("doctype",[s,function(){return n_0;},"html"]);var n_3=d.next("tag",[s,function(){return n_0;},function(s){
var n_4=d.next("tag",[s,function(){return n_3;},function(s){
var n_5=d.next("tag",[s,function(){return n_4;},function(s){
var n_6=d.next("text",[s,function(){return n_5;},function(s,c){return d.__p(d.__p(s.page).title);},["page","page.title"]]);return [n_6];
},"title",null,false,[],[]]);var n_7=d.next("forin",[s,function(){return n_4;},function(s){
var n_8=d.next("tag",[s,function(){return n_7;},function(s){
return [];
},"script",function(s,c){return d.util.merge_attrs([{"src": d.__p(s.script)},{"type": "text/javascript"}]);},false,[],["script"]]);return [n_8];
},function(s,c){return d.__p(d.__p(s.page).scripts);},"script","undefined",true,["page","page.scripts"]]);var n_9=d.next("forin",[s,function(){return n_4;},function(s){
var n_10=d.next("tag",[s,function(){return n_9;},function(s){
return [];
},"link",function(s,c){return d.util.merge_attrs([{"href": d.__p(s.style)},{"rel": "stylesheet"}]);},false,[],["style"]]);return [n_10];
},function(s,c){return d.__p(d.__p(s.page).styles);},"style","undefined",true,["page","page.styles"]]);return [n_5,n_7,n_9];
},"head",null,false,[],[]]);var n_11=d.next("tag",[s,function(){return n_3;},function(s){
return [];
},"body",null,false,[],[]]);return [n_4,n_11];
},"html",null,false,[],[]]);;n_0=d.generate([n_1,n_2,n_3]);return n_0;}}]