module.exports=[{FILE_NAME:"./tests/test_ifelse.jade",TEMPLATE:function(s,d){var n_0,__FILE__="./tests/test_ifelse.jade";var n_1=d.next("ifelse",[s,function(){return n_0;},[function(s){
var n_2=d.next("tag",[s,function(){return n_1;},function(s){
var n_3=d.next("text",[s,function(){return n_2;}," Test1 True\n",[]]);return [n_3];
},"div",d.util.merge_attrs([{"id": "test1_true"}]),[],[]]);var n_4=d.next("ifelse",[s,function(){return n_1;},[function(s){
var n_5=d.next("tag",[s,function(){return n_4;},function(s){
var n_6=d.next("text",[s,function(){return n_5;}," Test2 True\n",[]]);return [n_6];
},"div",d.util.merge_attrs([{"id": "test1_true-test2_true"}]),[],[]]);var n_7=d.next("ifelse",[s,function(){return n_4;},[function(s){
var n_8=d.next("tag",[s,function(){return n_7;},function(s){
var n_9=d.next("text",[s,function(){return n_8;}," Test3 True\n",[]]);return [n_9];
},"div",d.util.merge_attrs([{"id": "test1_true-test2_true-test3_true"}]),[],[]]);return [n_8];
},function(s){
var n_10=d.next("tag",[s,function(){return n_7;},function(s){
var n_11=d.next("text",[s,function(){return n_10;}," Test3 False\n",[]]);return [n_11];
},"div",d.util.merge_attrs([{"id": "test1_true-test2_true-test3_false"}]),[],[]]);return [n_10];
}],function(s,c){return d.__p(s.test3);},["test3"]]);return [n_5,n_7];
},function(s){
var n_12=d.next("tag",[s,function(){return n_4;},function(s){
var n_13=d.next("text",[s,function(){return n_12;}," Test2 False\n",[]]);return [n_13];
},"div",d.util.merge_attrs([{"id": "test1_true-test2_false"}]),[],[]]);var n_14=d.next("ifelse",[s,function(){return n_4;},[function(s){
var n_15=d.next("tag",[s,function(){return n_14;},function(s){
var n_16=d.next("text",[s,function(){return n_15;}," Test3 True\n",[]]);return [n_16];
},"div",d.util.merge_attrs([{"id": "test1_true-test2_false-test3_true"}]),[],[]]);return [n_15];
},function(s){
var n_17=d.next("tag",[s,function(){return n_14;},function(s){
var n_18=d.next("text",[s,function(){return n_17;}," Test3 False\n",[]]);return [n_18];
},"div",d.util.merge_attrs([{"id": "test1_true-test2_false-test3_false"}]),[],[]]);return [n_17];
}],function(s,c){return d.__p(s.test3);},["test3"]]);return [n_12,n_14];
}],function(s,c){return d.__p(s.test2);},["test2"]]);return [n_2,n_4];
},function(s){
var n_19=d.next("tag",[s,function(){return n_1;},function(s){
var n_20=d.next("text",[s,function(){return n_19;}," Test1 False\n",[]]);return [n_20];
},"div",d.util.merge_attrs([{"id": "test1_false"}]),[],[]]);var n_21=d.next("ifelse",[s,function(){return n_1;},[function(s){
var n_22=d.next("tag",[s,function(){return n_21;},function(s){
var n_23=d.next("text",[s,function(){return n_22;}," Test2 True\n",[]]);return [n_23];
},"div",d.util.merge_attrs([{"id": "test1_false-test2_true"}]),[],[]]);var n_24=d.next("ifelse",[s,function(){return n_21;},[function(s){
var n_25=d.next("tag",[s,function(){return n_24;},function(s){
var n_26=d.next("text",[s,function(){return n_25;}," Test3 True\n",[]]);return [n_26];
},"div",d.util.merge_attrs([{"id": "test1_false-test2_true-test3_true"}]),[],[]]);return [n_25];
},function(s){
var n_27=d.next("tag",[s,function(){return n_24;},function(s){
var n_28=d.next("text",[s,function(){return n_27;}," Test3 False\n",[]]);return [n_28];
},"div",d.util.merge_attrs([{"id": "test1_false-test2_true-test3_false"}]),[],[]]);return [n_27];
}],function(s,c){return d.__p(s.test3);},["test3"]]);return [n_22,n_24];
},function(s){
var n_29=d.next("tag",[s,function(){return n_21;},function(s){
var n_30=d.next("text",[s,function(){return n_29;}," Test2 False\n",[]]);return [n_30];
},"div",d.util.merge_attrs([{"id": "test1_false-test2_false"}]),[],[]]);var n_31=d.next("ifelse",[s,function(){return n_21;},[function(s){
var n_32=d.next("tag",[s,function(){return n_31;},function(s){
var n_33=d.next("text",[s,function(){return n_32;}," Test3 True\n",[]]);return [n_33];
},"div",d.util.merge_attrs([{"id": "test1_false-test2_false-test3_true"}]),[],[]]);return [n_32];
},function(s){
var n_34=d.next("tag",[s,function(){return n_31;},function(s){
var n_35=d.next("text",[s,function(){return n_34;}," Test3 False\n",[]]);return [n_35];
},"div",d.util.merge_attrs([{"id": "test1_false-test2_false-test3_false"}]),[],[]]);return [n_34];
}],function(s,c){return d.__p(s.test3);},["test3"]]);return [n_29,n_31];
}],function(s,c){return d.__p(s.test2);},["test2"]]);return [n_19,n_21];
}],function(s,c){return d.__p(s.test1);},["test1"]]);;n_0=d.generate([n_1]);return n_0;}}]