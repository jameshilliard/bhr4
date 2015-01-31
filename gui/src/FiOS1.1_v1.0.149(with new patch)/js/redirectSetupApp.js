'use strict';
// Declare app level module which depends on filters, and services
angular.module('vzui', ['ngRoute','ui.bootstrap',

    //controllers
    'redirect.controllers']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

  $routeProvider.when('/redirect', {templateUrl: 'partials/redirect.html?v={version_number}', controller: 'redirectCtrl'});
  $routeProvider.otherwise({redirectTo: '/redirect'});
}])
.run( function($rootScope, $location) {
  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    $rootScope.pre_path = $rootScope.cur_path;
    $rootScope.cur_path = $location.url();
  });
});

var app_previous_path = "";

angular.module(['vzui']).config(function($httpProvider) {
  var interceptor = ['$rootScope','$location', '$q', function($rootScope, $location, $q) {
	var sessionLifetime = undefined;
	var sessionTimeOut;
    function success(response) {
      if(response.data.sessionLifetime != undefined){
        sessionLifetime = response.data.sessionLifetime;
      }
      if(sessionLifetime != undefined){
        window.clearTimeout(sessionTimeOut);
        sessionTimeOut = window.setTimeout(timeOutEvent,(sessionLifetime * 1000) + 1000);
      }
      return response;
    };

    function timeOutEvent(){
      if(window != undefined){
        window.location.reload(true);
      }else{
        location.reload(true);
      }
    }

    function error(response) {
      var status = response.status;
      $rootScope.nextLocation = $location.path();
      $rootScope.loggedIn = false;
      return $q.reject(response);
    };

    return function(promise) {
      return promise.then(success, error);
    };
  }];
  $httpProvider.responseInterceptors.push(interceptor);
});
