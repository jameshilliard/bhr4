'use strict';

angular.module('vzui.filters', [])
  .filter('makeRange', function() {
    return function(input) {
      var lowBound, highBound;
      switch (input.length) {
      case 1:
        lowBound = 0;
        highBound = parseInt(input[0]) - 1;
        break;
      case 2:
        lowBound = parseInt(input[0]);
        highBound = parseInt(input[1]);
        break;
      default:
        return input;
      }
      var result = [];
      for (var i = lowBound; i <= highBound; i++)
        result.push(i);
      return result;
    };
  })

  .filter('logsFilter', function() {
      return function(collection, key) {
        var output = [];
        angular.forEach(collection, function(item) {
            if (item.lWeek === key){
               output.push(item);
            }
            if (item.soYday === key){
               output.push(item);
            }
        });
        return output;
      };
  });
