'use strict';

/* Directives */


angular.module('vzui.directives', [])
  .directive('onKeyup', function($parse) {
    return function(scope, elm, attrs) {
      var keyupFn = $parse(attrs.onKeyup);
      elm.bind('keyup', function(evt) {
        keyupFn(scope, {$key: evt.which});
      });
    };
  })

  .directive('securityTip', function() {
    return {
     restrict: "E",
      template: "<p class='iTipBtn' ng-click='showTip()'>Tips for creating secure passwords:</p>",
      replace: true,
        controller: function($scope, securityTips) {
          $scope.showTip = function() {
            securityTips.showTips();
          }
        }
    };
  })

  .directive('myDirective', function () {
       return {
          template: '<select class="lMonth" ng-model="sMonth" ng-options="m for m in months"></select>' +
              '<select class="lYear" ng-model="sYear" ng-options="y for y in years"></select>' +
              '<select class="lDay" ng-model="sDay" ng-options="d for d in days"></select>'+
              '<select class="lHour" ng-model="sHour" ng-options="h for h in hours"></select>'+
              '<select class="lMinute" ng-model="sMinute" ng-options="h for h in minutes"></select>' +
              '<select class="lAmpm" ng-model="sAmpm" ng-options="h for h in ampm"></select>',
          restrict: 'A',
          scope: {
              sMonth: '=',
              sYear: '=',
              sDay: '=',
              sHour: '=',
              sMinute: '=',
              sAmpm:'='
          },
          link:function(scope,elem,attrs){
                var today=new Date();
                var monthtext=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

                scope.months =[];
                scope.years = [];
                scope.days = [];
                scope.hours = [];
                scope.minutes=[];
                scope.ampm=['AM','PM'];
                for (var m=0; m<12; m++){
                    scope.months.push(monthtext[m]);
                    if (m < 5){
                        scope.years.push(moment().subtract('years', [m - 1]).format('YYYY'));
                    }
                }
                for (var m=1; m<32; m++){
                   scope.days.push(m);
                }
                for (var m=0; m<13; m++){
                   if (m < 10){
                       scope.hours.push('0' + m);
                    }else{
                       scope.hours.push(m);
                   }
                }
                for (var m=0; m<61; m++){
                   if (m < 10){
                       scope.minutes.push('0' + m);
                   }else{
                       scope.minutes.push(m);
                   }
                }
                scope.years.splice(0, 1);
                scope.sMonth=scope.months[1];
                scope.sYear=scope.years[0];
                scope.sDay= scope.days[0];
                scope.sHour = scope.hours[0];
                scope.sMinute = scope.minutes[0];
                scope.sAmpm = scope.ampm[0];
          }
      };
  })

  .directive("altStyle", ['$timeout',
    function($timeout) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          scope.$watch('connection' , function() {
            $timeout(function() {
              var rows = element.find('tr');
              var rowsObj,
                  count = 0;
              for(var i = 0; i < rows.length; i ++){
                rowsObj = angular.element(rows[i]);
                if (!rowsObj.hasClass('ng-hide')){
                  if(count % 2 == 0){
                    rowsObj.removeClass('alt-1').addClass('alt-2')
                  }else{
                    rowsObj.removeClass("alt-2").addClass('alt-1')
                  }
                  count ++;
                }
              }
            });
          }, true);
        }
      };
    }
  ])

 .directive('focusMe', function ($timeout) {
    return function(scope, element, attrs) {
      var focusElement = function () {
        $timeout(function(){
          element[0].focus();
        },0);
      };
    scope.$watch(attrs.focusMe, function () {
      focusElement();
    },true);
  };
})

.directive('numbersWps', function(){
   return {
     require: 'ngModel',
     restrict: 'A',
     link: function(scope, element, attrs, modelCtrl) {
       modelCtrl.$parsers.push(function (inputValue) {
         if (inputValue == undefined) return '';
         var transformedInput = inputValue.replace(/[^0-9- ]/g, '');
         if (transformedInput!=inputValue) {
           modelCtrl.$setViewValue(transformedInput);
           modelCtrl.$render();
         }
         return transformedInput;
       });
     }
   };
});