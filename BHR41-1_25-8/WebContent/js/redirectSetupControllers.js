'use strict';

/* Controllers */

angular.module('redirect.controllers', [])
  .controller('redirectCtrl', ['$scope', '$route',
    function ($scope, $route) {
      //window.location="/index.html?v=" + new Date().getTime() + "#/setup";
      window.location="/#/setup";
    }
  ])
