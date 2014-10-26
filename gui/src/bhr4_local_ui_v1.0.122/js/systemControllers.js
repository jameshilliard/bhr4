'use strict';

/* Controllers */
angular.module('system.controllers', [])
  .controller('MonitoringCtrl', ['$scope', '$route', 'NetworkConnections', 'FirmwareUpgrade', 'SystemSettings', '$timeout', '$location',
    function($scope, $route, NetworkConnections, FirmwareUpgrade, SystemSettings, $timeout, $location) {

    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.bb = null;
    $scope.valid = true;
    $scope.autoRefresh = systemSettings.autoRefreshSystemMonitoring;
    $scope.timer = null;
    $scope.$on('$destroy', function() {
      $scope.valid = false;
      clearTimeout($scope.timer);
    })
    $scope.initialLoad = true;
    $scope.refresh = function() {
      if(!$scope.initialLoad && !$scope.autoRefresh)
        return;
      $scope.initialLoad = false;

      $scope.refreshContents();
      if($scope.autoRefresh && $scope.valid){
        $scope.timer = setTimeout(function() {
            $scope.refresh();
          },10000);
      }
    }

    $scope.refreshContents = function(){
      var stats = SystemSettings.get(function() {
        $scope.stats = stats;
        var arr = $scope.stats.uptime.split(":");
        if(arr.length == 2) {
          $scope.stats.uptime = parseInt(arr[0]) + ' hours, ' + parseInt(arr[1]) + ' minutes';
        }
      });
      var bb = NetworkConnections.get({id: 1}, function(){$scope.bb=bb});
      var fw = FirmwareUpgrade.get(function(){$scope.fw=fw});
    }
    $scope.refreshing = function(){
      location.reload();
    }
    $scope.toggleAutoRefresh = function() {
      clearTimeout($scope.timer);
      $scope.systmSetngs = SystemSettings.get();
      $scope.autoRefresh = !$scope.autoRefresh;
      $scope.systmSetngs.autoRefreshSystemMonitoring=$scope.autoRefresh;
      $scope.systmSetngs.$update(function(){
         systemSettings = $scope.systmSetngs;
         if($scope.autoRefresh)
            $scope.refresh();
      });
    };
    $scope.refresh();
  }])
  .controller('MonitoringAdvCtrl', ['$scope', '$route', '$routeParams', 
    function($scope, $route, $routeParams) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;

    $scope.warning = false;
    if($routeParams.warn != null)
      $scope.warning = true;
  }])
  .controller('FullStatusCtrl', ['$scope', '$route', 'NetworkConnections', '$location', '$timeout', '$routeParams','SystemSettings', 'Login', 'Devices',
    function($scope, $route, NetworkConnections, $location, $timeout, $routeParams, SystemSettings, Login, Devices) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.valid = true;
    $scope.timer = null;
    var timer;

    $scope.autoRefresh = systemSettings.autoRefreshSystemMonitoring;
    $scope.$on('$destroy', function() {
      $scope.valid = false;
      $timeout.cancel(timer);
      clearTimeout($scope.timer);
    })
    $scope.refreshData = function(){
      $scope.initialLoad = true;
      $scope.refresh();
    }
    $scope.checkForDevicesNow = function(devicesList, queryId){
      var result = false;
      var queryId1 = "";
      switch(String(queryId)){
        case "2":
          queryId1 = "4";
          break;
        case "3":
          queryId1 = "5";
          break;
        case "4":
          queryId1 = "0";
          break;
        default:
          return false;
          break;
      }
      if(devicesList.length > 0){
        for(var i = 0; i < devicesList.length; i ++){
          if(String(devicesList[i].connectionType) == String(queryId1)){
            if(devicesList[i].status == true){
              result = true;
              break;
            }
          }
          if(String(devicesList[i].connectionType) == "6" && devicesList[i].approved && String(queryId1) == "5"){
            if(devicesList[i].status == true){
              result = true;
              break;
            }
          }
        }
        return result;
      }
      return false;
    }
    $scope.initialLoad = true;
    $scope.refresh = function() {
      if(!$scope.initialLoad && !$scope.autoRefresh)
        return;
      $scope.initialLoad = false;
      var connections;
      var myListOfDevices = Devices.query(function(){
        connections = NetworkConnections.query(function() {
          $scope.connections = connections;
          for(var i = 0; i < $scope.connections.length; i++) {
            if($scope.connections[i].ipv6Address !== undefined && $scope.connections[i].ipv6Address !== '::' && $scope.connections[i].ipv6Address !== '')
              $scope.showIpv6 = true;
            $scope.connections[i].displayName = unescape($scope.connections[i].name);
            $scope.connections[i].hasConnectedDeviceNow = $scope.checkForDevicesNow(myListOfDevices, $scope.connections[i].connectionId);

            $scope.connections[i].underlyingDevicesTempList = [];
            if($scope.connections[i].underlyingDevices){
              if($scope.connections[i].availableBridges){
                for(var k = 0; k < $scope.connections[i].availableBridges.length; k ++){
                  for(var j = 0; j < $scope.connections[i].underlyingDevices.length; j ++){
                    if($scope.connections[i].availableBridges[k] == $scope.connections[i].underlyingDevices[j]){
                      if($scope.connections[i].bridged[k] == true){
                        $scope.connections[i].underlyingDevicesTempList.push($scope.connections[i].availableBridges[k]);
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
          if($scope.autoRefresh && $scope.valid){
            $scope.timer = setTimeout(function() {
              $scope.refresh();
            }, 10000);
          }
        });
      });
    }
    $scope.toggleAutoRefresh = function() {
      clearTimeout($scope.timer);
      $scope.systmSetngs = SystemSettings.get();
      $scope.autoRefresh = !$scope.autoRefresh;
      $scope.systmSetngs.autoRefreshSystemMonitoring=$scope.autoRefresh;
      $scope.systmSetngs.$update(function(){
        systemSettings = $scope.systmSetngs;
        if($scope.autoRefresh)
          $scope.refresh();
      });
    };
    $scope.close = function() {
      if($routeParams.frommain != null){
        $location.url($location.path('/main'));
      }else{
        $location.path("/monitoring/advanced");
        window.scrollTo(0,0);
      }
    }
    $scope.refresh();
  }])
  .controller('BandwidthCtrl', ['$scope', '$route', 'NetworkConnections','SystemSettings', '$location', function($scope, $route, NetworkConnections,SystemSettings, $location) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.valid = true;
    $scope.timer = null;

    $scope.autoRefresh = systemSettings.autoRefreshSystemMonitoring;
    $scope.$on('$destroy', function() {
      $scope.valid = false;
      clearInterval($scope.timer);
    })
    $scope.initialLoad = true;
    $scope.refresh = function() {
      if(!$scope.initialLoad && !$scope.autoRefresh)
        return;
      $scope.initialLoad = false;
      var bb = NetworkConnections.get({id: 1}, function() {
        $scope.bb = bb;
        if($scope.autoRefresh && $scope.valid){
          $scope.timer = setTimeout(function() {
            $scope.refresh();
          }, 10000);
        }
      });
    }
    $scope.toggleAutoRefresh = function() {
      clearTimeout($scope.timer);
      $scope.systmSetngs = SystemSettings.get();
      $scope.autoRefresh = !$scope.autoRefresh;
      $scope.systmSetngs.autoRefreshSystemMonitoring=$scope.autoRefresh;
      $scope.systmSetngs.$update(function(){
        systemSettings = $scope.systmSetngs;
        if($scope.autoRefresh)
          $scope.refresh();
      });
    };
    $scope.refresh();
  }])
  .controller('SystemLogCtrl', ['$scope', '$route', '$http', 'Log','SystemSettings', function($scope, $route, $http, Log, SystemSettings) {
    $scope.sysSettings = SystemSettings.get();
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.canClearLog = true;
    $scope.logType = "System";
    $scope.enableLogging = systemSettings.enableLogging;
    setupLoggingCtrl($scope, 0, $http, Log);
  }])
  .controller('SecurityLogCtrl', ['$scope', '$route', '$http', 'Log','SystemSettings', function($scope, $route, $http, Log, SystemSettings) {
    $scope.sysSettings = SystemSettings.get();
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.logType = "Security";
    $scope.canClearLog = true;
    $scope.enableLogging = systemSettings.enableLogging;
    setupLoggingCtrl($scope, 1, $http, Log);
  }])
  .controller('AdvancedLogCtrl', ['$scope', '$route', '$http', 'Log', 'SystemSettings', function($scope, $route, $http, Log, SystemSettings) {
    $scope.sysSettings = SystemSettings.get();
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.logType = "Advanced";
    $scope.canClearLog = true;
    $scope.enableLogging = systemSettings.enableLogging;
    setupLoggingCtrl($scope, 2, $http, Log);
  }])
  .controller('FirewallLogCtrl', ['$scope', '$route', '$http', 'Log', 'SystemSettings', function($scope, $route, $http, Log, SystemSettings) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.logType = "Firewall";
    $scope.enableLogging = systemSettings.enableLogging;
    setupLoggingCtrl($scope, 3, $http, Log);
  }])
  .controller('WandhcpLogCtrl', ['$scope', '$route', '$http', 'Log', 'SystemSettings', function($scope, $route, $http, Log, SystemSettings) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.logType = "WAN DHCP";
    $scope.enableLogging = systemSettings.enableLogging;
    setupLoggingCtrl($scope, 4, $http, Log);
  }])
  .controller('LandhcpLogCtrl', ['$scope', '$route', '$http', 'Log', 'SystemSettings', function($scope, $route, $http, Log, SystemSettings) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.logType = "LAN DHCP";
    $scope.enableLogging = systemSettings.enableLogging;
    setupLoggingCtrl($scope, 5, $http, Log);
  }]);
