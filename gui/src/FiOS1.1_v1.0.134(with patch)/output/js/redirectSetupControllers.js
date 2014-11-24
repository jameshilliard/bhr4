'use strict';

/* Controllers */

angular.module('redirect.controllers', [])
  .controller('redirectCtrl', ['$scope', '$route',
    function ($scope, $route) {
      //window.location="/index.html?v=" + new Date().getTime() + "#/setup";
      var tempArr = String(document.URL).split("/");
      var str = "";
      for(var i = 0; i < tempArr.length; i ++){
        if(tempArr[i].indexOf('#') == -1){
          if(str != ""){
            str += "/";
          }
          str += tempArr[i];
        }else if(tempArr[i].indexOf('#') != -1){
          break;
        }
      }
      window.location= str + "/#/setup";
    }
  ])
