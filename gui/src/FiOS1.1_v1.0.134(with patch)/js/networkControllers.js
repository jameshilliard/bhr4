'use strict';

function Route(id) {
  var route = new Object();
  route.type = id;
  route.destination = "0.0.0.0";
  route.netmask = "0.0.0.0";
  route.gateway = "0.0.0.0";
  route.metric = 3;
  return route;
}

function setDeviceStyle(dev, section) {
  var styleName;
  switch(dev.icon) {
    case 0:
      styleName = 'computer';
      break;
    case 1:
      styleName = 'tablet';
      break;
    case 2:
      styleName = 'camera';
      break;
    case 3:
      styleName = 'printer';
      break;
    case 4:
      styleName = 'ip-stb';
      break;
    case 5:
      styleName = 'phone';
      break;
    case 6:
      styleName = 'nas';
      break;
    default:
      styleName = 'unknown';
      break;
  }
  styleName += "-image";
  if(!dev.status)
	styleName += ' inact';
  if(dev.blocked)
    styleName += ' blocked';
  if(section != '')
	styleName += ' ' + section;
  dev.styleName = styleName;
}

angular.module('network.controllers', [])
  .controller('NetworkCtrl', ['$scope', '$route', 'Devices', '$location', 'IPv6',
    function($scope, $route, Devices, $location, IPv6) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;

    $scope.hasList0 = false;
    $scope.hasList1 = false;
    $scope.showList0 = false;
    $scope.showList1 = false;
    $scope.list0Count = 0;
    $scope.list1Count = 0;

    $scope.devices = Devices.query(function() {
      $scope.list0Count = 0;
      $scope.list1Count = 0;
      $scope.hasList0 = false;
      $scope.hasList1 = false;
      for(var i = 0; i < $scope.devices.length; i++) {
        if($scope.devices[i].connectionType != 6){
          $scope.list0Count ++;
        }else if($scope.devices[i].connectionType == 6 && $scope.devices[i].approved){
          $scope.list1Count ++;
        }
      }
      if($scope.list0Count > 3){
        $scope.hasList0 = true;
      }
      if($scope.list1Count > 3){
        $scope.hasList1 = true;
      }
    });
    $scope.showDevice = function(list, num){
      if(list == 0){
        if($scope.showList0){
          return true;
        }else{
          if(num < 3){
            return true;
          }else{
            return false;
          }
        }
      }else{
        if($scope.showList1){
          return true;
        }else{
          if(num < 3){
            return true;
          }else{
            return false;
          }
        }
      }
    }
    $scope.toggleList = function(list, num){
      if(list == 0){
        if(num == 0){
          $scope.showList0 = false;
        }else{
          $scope.showList0 = true;
        }
      }else{
        if(num == 0){
          $scope.showList1 = false;
        }else{
          $scope.showList1 = true;
        }
      }
    };
    $scope.ipv6 = IPv6.get();

    $scope.deviceTypes = function(type) {
      var count = 0;
      angular.forEach($scope.devices, function(device) {
          if(device.connectionType==type){
            count += 1;
          }else if(type == 5 && device.connectionType == 6){
            count += 1;
          }else if(type == 4 && device.connectionType == 7){
            count += 1;
          }
          setDeviceStyle(device, 'device');
          device = checkDeviceIP(device);
        });
      return count;
    };

    $scope.checkNetworkConnections = function(){
      $location.path('/network/connections');
    };

    $scope.blockDevice = function(deviceIndx){
      for(var i = 0; i < $scope.devices.length; i++) {
        if($scope.devices[i].id == deviceIndx){
          if($scope.devices[i].blocked)
            $scope.devices[i].blocked = false;
          else
            $scope.devices[i].blocked = true;
        }
      }
      Devices.update({id:deviceIndx},$scope.devices[deviceIndx], function() {
        $location.path('/network');
        window.scrollTo(0,0);
      });
    };

    $scope.nonGuestDevice = function(device){
      if(Number(device.connectionType) == 6){
        return false;
      }
      return true;
    };

    $scope.guestDevice = function(device){
      if(Number(device.connectionType) != 6){
        return false;
      }
      if(!(device.approved)){
        return false;
      }
      return true;
    };
  }])
  .controller('NetworkConnectionsCtrl', ['$scope', '$route', '$location', 'NetworkConnections', '$routeParams', 'SystemSettings', '$templateCache', 'Devices', '$rootScope',
    function($scope, $route, $location, NetworkConnections, $routeParams, SystemSettings, $templateCache, Devices, $rootScope) {

    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.detectBroadband = false;
    $scope.restarting = false;
    $scope.rebootingPage = false;

    $scope.getStyleName = function(id) {
      switch(id) {
        case 0:
          return "Network";
        case 1:
          return "Network";
        case 2:
          return "Wireless";
        case 3:
          return "Wireless";
        case 4:
          return "Ethernet";
        case 5:
          return "Coax";
        default:
          return "Network";
      }
    }

    if($routeParams.fromdevicenetwork != null){
      $location.path('/network/connections/0');
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
          if(String(devicesList[i].connectionType) == "7" && String(queryId1) == "4"){
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
    var connections;
    var myListOfDevices = Devices.query(function(){
    connections = NetworkConnections.query(function() {
      $scope.names = [];
      var connArray = [];
      for(var i = 0; i < connections.length; i++) {
        if(connections[i].done)
          continue;
        connections[i].done = true;
        connections[i].isChild = false;
        connections[i].styleName = $scope.getStyleName(connections[i].connectionId);
        connections[i].hasConnectedDeviceNow = $scope.checkForDevicesNow(myListOfDevices, connections[i].connectionId);
        connArray.push(connections[i]);
        $scope.names.push(unescape(connections[i].name));
        if(connections[i].availableBridges) {
          for(var k = 0; k < connections[i].availableBridges.length; k++) {
            var con = connections[i].availableBridges[k];
            //Check for broadband as we never want it put under Home/Network even if bridged
            if(con == 1)
              continue;
            if(connections[i].bridged[k]){
              connections[con].isChild = true;
              if(connections[con].done)
                continue;
              connections[con].styleName = 'BridgedItem ' + $scope.getStyleName(connections[con].connectionId);
              connArray.push(connections[con]);
              $scope.names.push(unescape(connections[con].name));
              connections[con].done = true;
              connections[con].hasConnectedDeviceNow = $scope.checkForDevicesNow(myListOfDevices, connections[con].connectionId);
            }
          }
        }
      }
      $scope.connections = connArray;
    });
    });

    $scope.showChildren = $rootScope.connectionListIsAdvanced;

    $scope.detectConfirm = function() {
      if(!systemSettings.warnBeforeChanges)
        $scope.doDetectBroadband();
      else
        $scope.detectBroadband = true;
    }

    $scope.detectCancel = function() {
      $scope.detectBroadband = false;
    }

    $scope.doDetectBroadband = function() {
      NetworkConnections.update({id: 1}, {detectBroadband: true}, function() {
        $scope.rebootingPage = true;
        window.setTimeout($scope.testConnection,0);
      });
    }

    $scope.testConnection = function() {
      SystemSettings.get(function() {
        window.setTimeout($scope.testConnection,3000);
      }, function(response) {
        if(response.status == 401){
          $scope.restarting = true;
          $templateCache.removeAll();
          //$location.path('/login').search({rebooting: 'true'});
          window.location = '/redirect.html?v={version_number}';
        }else
          window.setTimeout($scope.testConnection,3000);
      });
    }

    $scope.toggleChildren = function() {
      $scope.showChildren = !$scope.showChildren;
      if($scope.showChildren == true){
        $rootScope.connectionListIsAdvanced = true;
      }else{
        $rootScope.connectionListIsAdvanced = false;
      }
    }

    $scope.checkNetworkConnections = function(){
      $location.path('/network/connections');
    }
  }])
  .controller('NetworkConnectionCtrl', ['$scope', '$route', '$routeParams', '$location', 'NetworkConnections', 'Devices', 'securityTips',
      function($scope, $route, $routeParams, $location, NetworkConnections, Devices, securityTips) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.fromString = '';
    $scope.oldFrom = '';
    $scope.prev = '';
    $scope.deviceBridge = [];
    if($routeParams.from != null) {
      $scope.fromString = '?from=' + $routeParams.from;
      var back = $routeParams.from.split('-');
      if(back[back.length-1] == 'arptable') {
        $scope.back = '/advanced/arptable';
      } else if(back[back.length-1] == 'connlist') {
        $scope.back = '/advanced/dhcp/connections';
      } else if(back[back.length-1] == 'edit') {
        $scope.back = '/network/connections/0/edit';
      } else if(back[back.length-1].indexOf("dev_") != -1) {
        $scope.back = '/network/device/details/' + back[back.length-1].substr(4);
      } else if(back[back.length-1] !== '' && !isNaN(back[back.length-1])) {
        $scope.back = '/network/connections/' + back[back.length-1];
      }
      for(var i = 0; i < back.length-1; i++) {
        if(i != 0)
          $scope.oldFrom += '-';
        $scope.oldFrom += back[i];
      }
      if($scope.oldFrom !== '')
        $scope.prev = '?from=' + $scope.oldFrom;
    } else {
      $scope.back = '/network/connections';
    }
    //Filled in with underlying device names
    $scope.deviceNames = [];

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
          if(String(devicesList[i].connectionType) == "7" && String(queryId1) == "4"){
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

    $scope.showBridgeDeviceList = function(obj){
      for(var i = 0; i < $scope.deviceBridge.length; i ++){
        if($scope.deviceBridge[i].name == obj){
          return $scope.deviceBridge[i].toShowOut;
          break;
        }
      }
      return true;
    }

    $scope.findDeviceNames = function(obj){
      for(var i = 0; i < $scope.deviceBridge.length; i ++){
        if($scope.deviceBridge[i].name == obj){
          return $scope.deviceBridge[i].realDeviceName;
          break;
        }
      }
    }

    var connection;
    var myListOfDevices = Devices.query(function(){
    connection = NetworkConnections.get({id: $routeParams.id}, function() {
      $scope.name = unescape(connection.name);
      $scope.deviceBridge = [];
      if(connection.availableBridges){
        for(var i = 0; i < connection.availableBridges.length; i ++){
          var tempObj = new Object();
          tempObj.name = connection.availableBridges[i];
          tempObj.toShowOut = connection.bridged[i];
          $scope.deviceBridge.push(tempObj);
        }
      }
      connection.hasConnectedDeviceNow = $scope.checkForDevicesNow(myListOfDevices, connection.connectionId);
      //Fill in underlying device array
      $scope.connections = NetworkConnections.query(function() {
        for(var i = 0; i < $scope.connections.length; i++) {

        }
        if(connection.underlyingDevices) {
          angular.forEach(connection.underlyingDevices, function(device) {
            var id = device;
            angular.forEach($scope.connections, function(conn) {
              if(conn.connectionId == id) {
                $scope.deviceNames.push(unescape(conn.name));
              }
            });
          });
          for(var i = 0; i < $scope.deviceBridge.length; i ++){
            for(var j = 0; j < $scope.connections.length; j ++){
              if($scope.connections[j].connectionId == $scope.deviceBridge[i].name) {
                $scope.deviceBridge[i].realDeviceName = unescape($scope.connections[j].name);
                break;
              }
            }
          }
        }
        //add connection to scope after device names array is filled
        $scope.connection = connection;
        if($scope.fromString === '')
          $scope.connFromString = '?from=' + $scope.connection.connectionId;
        else
          $scope.connFromString = $scope.fromString + '-' + $scope.connection.connectionId;
        $scope.showIpv6 = false;
        if(connection.ipv6Address !== undefined && connection.ipv6Address !== '::' && connection.ipv6Address !== '')
          $scope.showIpv6 = true;
      });
    });
    });
    
    $scope.errorPageOk = function() {
      $scope.showErrorPage = false;
      window.scrollTo(0,0);
    }

    $scope.refreshContentsNow = function(){
      location.reload();
    }

    $scope.toggleEnabled = function() {
      NetworkConnections.update({id: connection.connectionId}, {enabled: !connection.enabled}, function() {
        if(connection.connectionId == 3 || connection.connectionId == 2){
          $scope.savePopup = securityTips.showSaving1('Save Settings', 'Saving your settings. Please wait...');
          window.setTimeout($scope.refreshContentsNow,15000);
        }else{
          $scope.refreshContentsNow();
        }
      })
    };

    $scope.toggleCoaxEnabled = function() {
      NetworkConnections.update({id: connection.connectionId}, {coaxEnabled: !connection.coaxEnabled}, function() {
        if(connection.connectionId == 3 || connection.connectionId == 2){
          $scope.savePopup = securityTips.showSaving1('Save Settings', 'Saving your settings. Please wait...');
          window.setTimeout($scope.refreshContentsNow,15000);
        }else{
          $scope.refreshContentsNow();
        }
      })
    };

    $scope.cancelBtn = function() {
      window.scrollTo(0,0);
      if($routeParams.fromsystemtraffic != null){
        $location.url('/monitoring/traffic');
      }else if($routeParams.fromsystemfullstatus != null){
        $location.url('/monitoring/fullstatus');
      }else if($routeParams.fromdevicenetwork != null){
        $location.url('/network/device/details/' + $routeParams.devicenum + '?fromdevicenetwork=true&devicenum=' + $routeParams.devicenum);
      }else if($routeParams.connEdit != null){
        $location.url('/network/connections/' + $routeParams.connEdit + '/edit');
      }else{
        $location.url($scope.back + $scope.prev);
      }
    };

    $scope.saveName = function(connection) {
      $scope.errorMessages = [];
      $scope.connection.name = escape($scope.name.replace(/^\s+|\s+$/g, '')).replace(/\+/g,'%2B');
      if($scope.connection.name.length == 0)
        $scope.errorMessages.push("Connection Name: Connection Name cannot be empty.");
      else {
        for(var i = 0; i < $scope.connections.length; i++) {
          if(i != $scope.connection.connectionId && unescape($scope.connection.name) == unescape($scope.connections[i].name))
            $scope.errorMessages.push("Connection Name:  Connection Name already in use.");
        }
      }
      if($scope.errorMessages.length > 0) {
        $scope.showErrorPage = true;
        window.scrollTo(0,0);
        return;
      }
      NetworkConnections.update({id: connection.connectionId}, {name: $scope.connection.name}, function() {
        window.scrollTo(0,0);
        if($routeParams.fromsystemtraffic != null){
          $location.url('/monitoring/traffic');
        }else if($routeParams.fromsystemfullstatus != null){
          $location.url('/monitoring/fullstatus');
        }else if($routeParams.fromdevicenetwork != null){
          $location.url('/network/device/details/' + $routeParams.devicenum + '?fromdevicenetwork=true&devicenum=' + $routeParams.devicenum);
        }else if($routeParams.connEdit != null){
          $location.url('/network/connections/' + $routeParams.connEdit + '/edit');
        }else if($scope.oldFrom == '')
          $location.path($scope.back).search({});
        else
          $location.path($scope.back).search({from: $scope.oldFrom});
      });
    };

    $scope.checkNetworkConnections = function(){
      $location.path('/network/connections');
    }

    $scope.keyPress = function(keyEvent) {
      if (keyEvent.keyCode == 13){
        if($location.path() == ('/network/connections/' + $routeParams.id)){
          $scope.saveName($scope.connection);
        }
      }
    };

  }])
  .controller('NetworkConnectionEditCtrl', ['$scope', '$route', '$routeParams', '$location', 'DhcpOptions',
    'NetworkConnections', 'DhcpConnections', 'Routes', 'Devices', 'FirewallDMZ',
      function($scope, $route, $routeParams, $location, DhcpOptions, 
        NetworkConnections, DhcpConnections, Routes, Devices, FirewallDMZ) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.confirm = false;
    $scope.messages = [];
    $scope.staticConnections = [];
    $scope.routesConnections=[];
    $scope.oldCoaxPassword = "";

    $scope.coTempIPAddress = "";
    $scope.coTempHomeName = "";
    $scope.tempStatic = {};

    $scope.listOfNetworkIPAddress = [];

    if($routeParams.from)
      $scope.fromString = "?from=" + $routeParams.from + "&connectionEdit=" + $routeParams.id;
    else
      $scope.fromString = "?connectionEdit=" + $routeParams.id;

    $scope.getStyleName = function(id) {
      switch(id) {
        case 0:
          return "Network";
        case 1:
          return "Network";
        case 2:
          return "Wireless";
        case 3:
          return "Wireless";
        case 4:
          return "Ethernet";
        case 5:
          return "Coax";
        default:
          return "Network";
      }
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
          if(String(devicesList[i].connectionType) == "7" && String(queryId1) == "4"){
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
    var myListOfDevices = Devices.query(function(){
    $scope.connection = NetworkConnections.get({id: $routeParams.id}, function() {
      $scope.connection.styleName = $scope.getStyleName($routeParams.id);
      if($scope.connection.dhcpExpires) {
        var expires = $scope.connection.dhcpExpires;
        if(expires != 0)
          $scope.connection.dhcpExpireTime = Math.ceil(expires/60) + " minutes";
        else
          $scope.connection.dhcpExpireTime = "Expired";
      }

      $scope.name = unescape($scope.connection.name);
      $scope.connection.name = unescape($scope.connection.name);
      $scope.connection.hasConnectedDeviceNow = $scope.checkForDevicesNow(myListOfDevices, $scope.connection.connectionId);
      $scope.oldsubnet = $scope.connection.subnetMask;
      $scope.oldProtocolUsed = $scope.connection.protocolUsed;
      //$scope.connectionType determines which Edit html file to load
      switch($scope.connection.type) {
        case 3:
          $scope.connectionType = "Ethernet";
          break;
        case 5:
          $scope.connectionType = "Coax";
          break;
        case 4:
          $scope.connectionType = "AP";
          break;
        default:
          $scope.connectionType = "Basic";
          break;
      }

      if ($scope.connection.connectionId == 1){
        $scope.tempStatic = {
          ipAddress : $scope.connection.ipAddress,
          defaultGateway : $scope.connection.defaultGateway,
          primaryDnsServer : $scope.connection.primaryDnsServer,
          secondaryDnsServer : $scope.connection.secondaryDnsServer,
          subnetMask : $scope.connection.subnetMask
        }
        $scope.connection.ipAddress = ($scope.connection.staticIpAddress != undefined ? $scope.connection.staticIpAddress : $scope.connection.ipAddress);
        $scope.connection.defaultGateway = ($scope.connection.staticDefaultGateway != undefined ? $scope.connection.staticDefaultGateway : $scope.connection.defaultGateway);
        $scope.connection.primaryDnsServer = ($scope.connection.staticPrimaryDnsServer != undefined ? $scope.connection.staticPrimaryDnsServer : $scope.connection.primaryDnsServer);
        $scope.connection.secondaryDnsServer = ($scope.connection.staticSecondaryDnsServer != undefined ? $scope.connection.staticSecondaryDnsServer : $scope.connection.secondaryDnsServer);
        $scope.connection.subnetMask = ($scope.connection.staticSubnetMask != undefined ? $scope.connection.staticSubnetMask : $scope.connection.subnetMask);
      }

      //IPAddress info for connection
      if($scope.connection.ipAddress) {
        $scope.initialIpAddress = $scope.connection.ipAddress;
        $scope.ipAddress = splitIpArr($scope.connection.ipAddress);
        $scope.subnetMask = splitIpArr($scope.connection.subnetMask);
        if($scope.connection.defaultGateway != null)
          $scope.defaultGateway = splitIpArr($scope.connection.defaultGateway);

        //DNS
        if($scope.connection.primaryDnsServer) {
          $scope.primaryDnsServer = splitIpArr($scope.connection.primaryDnsServer);
          $scope.secondaryDnsServer = splitIpArr($scope.connection.secondaryDnsServer);
        }
      }

      if($scope.connection.connectionId == 1){
        $scope.oldCoaxPassword = $scope.connection.coaxPassword;
      }

      $scope.bridges = null;
      if($scope.connection.availableBridges) {
        $scope.bridges = [];
        $scope.allConnections = NetworkConnections.query(function() {
          //Add to bridged array
          for(var i  = 0; i < $scope.connection.availableBridges.length; i++) {
            for(var con = 0; con < $scope.allConnections.length; con++) {
              if($scope.allConnections[con].connectionId == $scope.connection.availableBridges[i]) {
                $scope.bridges.push($scope.allConnections[con]);
                if($scope.fromString === '')
                  $scope.bridges[i].fromString = "?from=edit&connEdit=" + $scope.connection.connectionId;
                else
                  $scope.bridges[i].fromString = $scope.fromString + "-edit&connEdit=" + $scope.connection.connectionId;
                $scope.bridges[i].styleName = $scope.getStyleName($scope.bridges[i].connectionId);
                $scope.bridges[i].bridged = $scope.connection.bridged[i];
                $scope.bridges[i].name = unescape($scope.bridges[i].name);
                $scope.bridges[i].hasConnectedDeviceNow = $scope.checkForDevicesNow(myListOfDevices, $scope.bridges[i].connectionId);
                break;
              }
            }
          }
        });
      }

      $scope.dmz = FirewallDMZ.get(function() {});

      //DHCP Settings
      $scope.connections = NetworkConnections.query(function() {
        var iRouteCnt=0;
        $scope.listOfNetworkIPAddress = [];
        for(var i = 0; i < $scope.connections.length; i++) {
          if($scope.connections[i].bridged != null)
            for(var j = 0; j < $scope.connections[i].bridged.length; j++){
              if($scope.connections[i].bridged[j]) {
                if($scope.connections[i].availableBridges[j] == 2)
                  $scope.connections[$scope.connections[i].availableBridges[j]].name = unescape($scope.connections[i].name) + ' Wireless 802.11 2.4GHz Access Point';
                else if($scope.connections[i].availableBridges[j] == 3)
                  $scope.connections[$scope.connections[i].availableBridges[j]].name = unescape($scope.connections[i].name) + ' Wireless 802.11 5.0GHz Access Point';
                else
                  $scope.connections[$scope.connections[i].availableBridges[j]].name = unescape($scope.connections[i].name + ' ' + $scope.connections[$scope.connections[i].availableBridges[j]].name);
              }
            }
          $scope.connections[i].name = unescape($scope.connections[i].name);

          if($scope.connections[i].connectionId == 0){
            $scope.coTempHomeName = unescape($scope.connections[i].name);
            $scope.coTempIPAddress = $scope.connections[i].ipAddress;
          }
          if($scope.connections[i].connectionId == 0 || $scope.connections[i].connectionId == 1){
            var tempObject = new Object();
            tempObject.id = $scope.connections[i].connectionId;
            tempObject.ip = $scope.connections[i].ipAddress;
            tempObject.name = unescape($scope.connections[i].name);
            $scope.listOfNetworkIPAddress.push(tempObject);
          }

          if(!$scope.connections[i].hasOwnProperty('connectionUsed')){
            $scope.routesConnections[iRouteCnt]= $scope.connections[i];
            iRouteCnt++;
          }
        }
        if($scope.connection.dhcpSettings) {
          $scope.dhcpOptions = DhcpOptions.query();
          $scope.dhcpStartIpAddress = splitIpArr($scope.connection.dhcpSettings.startIpAddress);
          $scope.dhcpEndIpAddress = splitIpArr($scope.connection.dhcpSettings.endIpAddress);
          $scope.initialDhcpEndAddress = $scope.connection.dhcpSettings.endIpAddress;
          var wins = $scope.connection.dhcpSettings.winsServer;
          if(wins.length==0)
            wins = "0.0.0.0";
          $scope.dhcpWinsServer = splitIpArr(wins);
          var dhcpConnections = DhcpConnections.query({id: $routeParams.id}, function() {
            for(var i = 0; i < dhcpConnections.length; i++) {
              if(dhcpConnections[i].ipAddressSource==1) {
                $scope.staticConnections.push(dhcpConnections[i].ipAddress);
              }
            }
          });
        }
        if($routeParams.id == 0 || $routeParams.id == 1) {
          $scope.refreshRoutes();
        }
      });
    });
    });

    $scope.enableCoax = function() {
      NetworkConnections.update({id: $routeParams.id}, {coaxEnabled: true}, function() {
        $scope.connection = NetworkConnections.get({id: $routeParams.id});
      })
    }

    $scope.disableCoax = function() {
      NetworkConnections.update({id: $routeParams.id}, {coaxEnabled: false}, function() {
        $scope.connection = NetworkConnections.get({id: $routeParams.id});
      })
    }

    $scope.dhcpRelease = function() {
      NetworkConnections.save({id: $routeParams.id}, {dhcpRelease: true}, function() {
        $scope.connection = NetworkConnections.get({id: $routeParams.id});
      })
    }

    $scope.dhcpRenew = function () {
      NetworkConnections.save({id: $routeParams.id}, {dhcpRenew: true}, function() {
        $scope.connection = NetworkConnections.get({id: $routeParams.id});
      })
    }

    $scope.errorPageOk = function() {
      $scope.showErrorPage = false;
      window.scrollTo(0,0);
    }

    $scope.checkMsg = function(errMsgs, msg){
      var result = false;
      for(var i = 0; i < errMsgs.length; i ++){
        if(errMsgs[i] == msg){
          result = true;
          break;
        }
      }
      return result;
    }

    $scope.checkMsg = function(errMsgs, msg){
      var result = false;
      for(var i = 0; i < errMsgs.length; i ++){
        if(errMsgs[i] == msg){
          result = true;
          break;
        }
      }
      return result;
    }

     $scope.save = function() {
      $scope.errorMessages = [];
      $scope.messages = [];
      //Error handling is odd to match errors on BHR3 exactly

      if($scope.connection.mtuType == 2) {
        var showMtuError = false;
        if(!validRange($scope.connection.mtu,68,1500)){
          showMtuError = true;
        }else if(checkForWholeNumbers($scope.connection.mtu)){
          showMtuError = true;
        }
        if(showMtuError){
          $scope.errorMessages.push("MTU: The maximum transfer unit of " + $scope.connection.name + " should be between 68 and 1500. ");
        }
     }

      var showIPError2 = false;
      var showIPError3 = false;
      var showIPError4 = false;
      var showIPError5 = false;
      var showIPError6 = false;
      var showDefaultGatewayError = false;
      var showIPMaskError = false;
      var incorrectGatewayMatchStr = "";
      var hasValidGateway = true;
      if($scope.connection.ipAddress) {
        if($scope.connection.protocolUsed == 2) {
          var showIPError = false;
          var showIPError1 = false;
          if(!validateIp($scope.ipAddress)){
            $scope.errorMessages.push("IP Address: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
            showIPError = true;
            showIPError1 = true;
          }else if(getNumIpString($scope.ipAddress) == '0.0.0.0') {
            $scope.errorMessages.push("IP address may not be 0.0.0.0. IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces. At least one of the values must be greater than 0.");
            showIPError = true;
            showIPError1 = true;
          }
          if(($scope.ipAddress[0] > 223 || $scope.ipAddress[0] == 0) || showIPError){
            $scope.errorMessages.push("IP Address: Device IP address should start with a value between 1-223.");
            showIPError2 = true;
          }
          if($scope.connection.connectionId == 0){
            if(showIPError1){
              $scope.errorMessages.push("IP Address already in use: IP address item is already in use by Port Forwarding.");
            }
          }
          if(validateIp($scope.ipAddress)){
            if(checkAllNetworks($scope.listOfNetworkIPAddress, $scope.ipAddress, $scope.connection.connectionId)){
              $scope.errorMessages.push("IP Address Already Exists: IP Address address " + getNumIpString($scope.ipAddress) + " is already in use by " + checkAllNetworks4Name($scope.listOfNetworkIPAddress, $scope.ipAddress, $scope.connection.connectionId) + ".");
              showIPError3 = true;
            }
          }
          if(!showIPError2 && !showIPError3){
            if(checkFor127($scope.ipAddress)){
              $scope.errorMessages.push("IP Address: IP addresses starting with 127 are not valid because they are reserved for loopback addresses.");
              showIPError6 = true;
            }
          }
        }

        var subNetMaskError = false;
        var hasToCheckFullMaskRange = false;
        if($scope.connection.protocolUsed == 2 || $scope.connection.protocolUsed == 1){
          hasToCheckFullMaskRange = true;
          if($scope.connection.protocolUsed == 1 && !$scope.connection.overrideSubnetMask){
            hasToCheckFullMaskRange = false;
          }
          if(hasToCheckFullMaskRange){
            if((!validateIp($scope.subnetMask) || checkFullListOfSubnetMaskRange($scope.subnetMask))){
              if(getIpString($scope.subnetMask) != '0.0.0.0'){
                var msg1 = true;
                if($scope.connection.connectionId == 1){
                  if($scope.connection.overrideSubnetMask){
                    msg1 = false;
                  }
                }
                if(msg1){
                  $scope.errorMessages.push("Subnet Mask: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
                }else{
                  $scope.errorMessages.push("Override Subnet Mask: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
                }
              }
              subNetMaskError = true;
            }
          }else{
            if((!validateIp($scope.subnetMask))){
              if(getIpString($scope.subnetMask) != '0.0.0.0'){
                var msg1 = true;
                if($scope.connection.connectionId == 1){
                  if($scope.connection.overrideSubnetMask){
                    msg1 = false;
                  }
                }
                if(msg1){
                  $scope.errorMessages.push("Subnet Mask: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
                }else{
                  $scope.errorMessages.push("Override Subnet Mask: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
                }
              }
              subNetMaskError = true;
            }
          }
        }
        if($scope.connection.connectionId == 0){
          if(checkForValidSubnetMaskRange($scope.subnetMask) || subNetMaskError){
            $scope.errorMessages.push("Subnet Mask: Subnet mask must be between 255.0.0.0 and 255.255.255.252.");
            subNetMaskError = true;
          }
        }
        /*else if($scope.connection.connectionId == 1){
          if(checkForValidSubnetMaskRangeBroadband($scope.subnetMask) || subNetMaskError){
            $scope.errorMessages.push("Subnet Mask: Subnet mask must be between 240.0.0.0 and 255.255.255.252.");
            subNetMaskError = true;
          }
        }*/
        if($scope.connection.protocolUsed == 2){
          if($scope.defaultGateway){
            if(!validateIp($scope.defaultGateway)){
              $scope.errorMessages.push("Default Gateway: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
              hasValidGateway = false;
              showDefaultGatewayError = true;
            }
          }
        }
        if(!showIPError2 && subNetMaskError == false && $scope.connection.protocolUsed == 2){
          if(validateIp($scope.ipAddress)){
            if(getNumIpString($scope.ipAddress) != '0.0.0.0') {
              if(checkHostVsSubmask($scope.ipAddress, $scope.subnetMask)){
                incorrectGatewayMatchStr = "IP Address and Subnet Mask combination: The combination of IP address and subnet mask is invalid. All of the bits in the host address portion of the IP address are set to "+ checkBits($scope.ipAddress) +".";
                $scope.errorMessages.push(incorrectGatewayMatchStr);
                showIPMaskError = true;
              }else{
                var networkSubnetMaskCheck = compareIpMaskNetwork($scope.ipAddress, $scope.subnetMask);
                if(networkSubnetMaskCheck != "2"){
                  incorrectGatewayMatchStr = "IP Address and Subnet Mask combination: The combination of IP address and subnet mask is invalid. All of the bits in the network address portion of the IP address are set to " + networkSubnetMaskCheck + ".";
                  $scope.errorMessages.push(incorrectGatewayMatchStr);
                  showIPMaskError = true;
                }
              }
            }
          }
        }
        if($scope.connection.protocolUsed == 2){
          if($scope.defaultGateway){
            if(hasValidGateway && !showIPMaskError){
              if(validateIp($scope.ipAddress)){
                if(getNumIpString($scope.ipAddress) == getNumIpString($scope.defaultGateway)){
                  if(incorrectGatewayMatchStr != ""){
                    var tempErrorMessage = [];
                    for(var i = 0; i < $scope.errorMessages.length; i ++){
                      if(incorrectGatewayMatchStr != $scope.errorMessages[i]){
                        tempErrorMessage.push($scope.errorMessages[i]);
                      }
                    }
                    $scope.errorMessages = tempErrorMessage;
                  }
                  $scope.errorMessages.push("Incorrect Gateway IP: The Gateway cannot have the same IP address as the specified Wireless Broadband Router IP address.");
                  showIPError4 = true;
                }
              }
            }
          }
        }

        if($scope.connection.primaryDnsServer) {
          if($scope.connection.dnsMode == 1) {
            if(!validateIp($scope.primaryDnsServer) && $scope.connection.connectionId == 1)
              $scope.errorMessages.push("Primary DNS Server: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
            if(!validateIp($scope.secondaryDnsServer) && $scope.connection.connectionId == 1)
              $scope.errorMessages.push("Secondary DNS Server: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
          }
        }
        if($scope.connection.deviceMetric == null || $scope.connection.deviceMetric === '' || isNaN($scope.connection.deviceMetric) || 
          $scope.connection.deviceMetric < 0 || $scope.connection.deviceMetric > 255)
          $scope.errorMessages.push("Device Metric: Please enter a numeric value between 0 and 255.");


        var tempIpaddress = getIpString($scope.ipAddress);
        $scope.connection.dnsMode = parseInt($scope.connection.dnsMode);
        var tempPriDns = "";
        var tempSecDns = "";
        if($scope.connection.primaryDnsServer) {
          var tempPriDns = getIpString($scope.primaryDnsServer);
          var tempSecDns = getIpString($scope.secondaryDnsServer);
        }
        var tempProtUsed = parseInt($scope.connection.protocolUsed);
        var tempSubMask = $scope.connection.subnetMask;
        if(tempProtUsed == 2 || tempProtUsed == 1)
          tempSubMask = getIpString($scope.subnetMask);
        var tempDefGateway = $scope.connection.defaultGateway;
        if($scope.defaultGateway)
          tempDefGateway = getIpString($scope.defaultGateway);

        if($scope.connection.type == 1) {
          if($scope.connection.coaxPrivacy) {
            if(!$scope.connection.coaxAutoDetection){
              if($scope.connection.coaxPasswordManual.length < 12 || $scope.connection.coaxPasswordManual.length>17)
                $scope.errorMessages.push("Coax Link Password: Password length should be between 12 and 17 characters.");
              if($scope.connection.coaxPasswordManual.length == 0)
                $scope.errorMessages.push("Coax Link Password: A number must be specified.");
              else if(!(/^[0-9]+$/i.test($scope.connection.coaxPasswordManual)))
                $scope.errorMessages.push("Coax Link Password:  Only digits can be used for the number.");
            }else{
              $scope.connection.coaxPasswordManual = $scope.oldCoaxPassword;
            }
          }else{
            $scope.connection.coaxPasswordManual = $scope.oldCoaxPassword;
          }
        }
        if($scope.connection.type == 0) {
          if(tempSubMask == '0.0.0.0')
            $scope.errorMessages.push(((tempProtUsed == 1 && $scope.connection.overrideSubnetMask) ? "Override " : "Subnet Mask: " ) + "Subnet mask may not be 0.0.0.0. Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.")
        } else if($scope.connection.type == 1) {
          var sub = $scope.subnetMask;
          if(!$scope.connection.overrideSubnetMask && tempProtUsed==1)
            sub = splitIpArr(tempSubMask);
          if((tempProtUsed == 2 || (tempProtUsed == 1 && $scope.connection.overrideSubnetMask)) && validateIp(sub)) {
            var valid = true;
            var zeroFound = false;
            for(var i = 0; i < 4; i++) {
              for(var k = 7; k > -1; k--) {
                var one = ((sub[i]>>k) & 1) == 1;
                if(one && zeroFound) {
                  valid = false;
                  break;
                }
                if(!one) {
                  zeroFound = true;
                }
              }
              if(!valid)
                break;
            }
            if(!valid){
              var msg1 = true;
              if($scope.connection.connectionId == 1){
                if($scope.connection.overrideSubnetMask){
                  msg1 = false;
                }
              }
              var tempMsg = "";
              if(msg1){
                tempMsg = "Subnet Mask: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.";
              }else{
                tempMsg = "Override Subnet Mask: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.";
              }
              if(!$scope.checkMsg($scope.errorMessages, tempMsg)){
                $scope.errorMessages.push(tempMsg);
              }
            }
            else if(tempProtUsed==2 && $scope.connection.defaultRoute && tempDefGateway=='0.0.0.0')
              $scope.errorMessages.push("Default Gateway: The Default Gateway must not be 0.0.0.0 while the Default Route is set.");
            else if(tempProtUsed==2 && tempDefGateway!='0.0.0.0') {
              if(validateIp($scope.ipAddress) && !showIPError2 && !showIPError3 && !showIPError6 && !showIPMaskError && !showDefaultGatewayError){
                for(var i = 0; i < 4; i++) {
                  if((sub[i] & $scope.defaultGateway[i]) != ($scope.subnetMask[i] & $scope.ipAddress[i])) {
                    $scope.errorMessages.push("Wireless Broadband Router and Default Gateway Are Not on the Same Subnet: Under the given Netmask, the IP Address does not belong to the same Subnet as the Default Gateway.")
                    showIPError5 = true;
                    break;
                  }
                }
                if(!showIPError5){
                  if(checkHostVsSubmask($scope.defaultGateway, $scope.subnetMask)){
                    incorrectGatewayMatchStr = "Wireless Broadband Router and Default Gateway Are Not on the Same Subnet: Under the given Netmask, the IP Address does not belong to the same Subnet as the Default Gateway.";
                    $scope.errorMessages.push(incorrectGatewayMatchStr);
                    showIPError5 = true;
                  }else{
                    var networkSubnetMaskCheck = compareIpMaskNetwork($scope.defaultGateway, $scope.subnetMask);
                    if(networkSubnetMaskCheck != "2"){
                      incorrectGatewayMatchStr = "Wireless Broadband Router and Default Gateway Are Not on the Same Subnet: Under the given Netmask, the IP Address does not belong to the same Subnet as the Default Gateway.";
                      $scope.errorMessages.push(incorrectGatewayMatchStr);
                      showIPError5 = true;
                    }
                  }
                }
              }
            }
            if(tempSubMask == '0.0.0.0'){
              var msg1 = true;
              if($scope.connection.connectionId == 1){
                if($scope.connection.overrideSubnetMask){
                  msg1 = false;
                }
              }
              if(msg1){
                $scope.errorMessages.push("Subnet Mask: Subnet mask may not be 0.0.0.0. Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
              }else{
                $scope.errorMessages.push("Override Subnet Mask: Subnet mask may not be 0.0.0.0. Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
              }
            }
          }
        }
        if($scope.connection.protocolUsed != 0){
          if($scope.connection.dnsMode == 1 && $scope.connection.connectionId == 1 && $scope.connection.primaryDnsServer) {
            if(!showIPError2 && !showIPError3 && !showIPError4 && !showIPError5 && !showIPError6){
              if(tempIpaddress == tempPriDns && $scope.connection.protocolUsed != 1){
                $scope.errorMessages.push("Primary DNS Server: DNS Server cannot have the IP address of Wireless Broadband Router " + unescape($scope.connection.name) + ".");
              }else if(tempPriDns ==  $scope.coTempIPAddress){
                $scope.errorMessages.push("Primary DNS Server: DNS Server cannot have the IP address of Wireless Broadband Router " + $scope.coTempHomeName + ".");
              }
              if(tempIpaddress == tempSecDns && $scope.connection.protocolUsed != 1){
                $scope.errorMessages.push("Secondary DNS Server: DNS Server cannot have the IP address of Wireless Broadband Router " + unescape($scope.connection.name) + ".");
              }else if(tempSecDns ==  $scope.coTempIPAddress){
                $scope.errorMessages.push("Secondary DNS Server: DNS Server cannot have the IP address of Wireless Broadband Router " + $scope.coTempHomeName + ".");
              }
              if(tempPriDns !='0.0.0.0' &&
                tempPriDns == tempSecDns){
                $scope.errorMessages.push("Redundant DNS Entries: 'Primary' and 'Secondary' values may not point to the same DNS server.");
              }
              if(tempPriDns == '255.255.255.255')
                $scope.errorMessages.push("Primary DNS Server: " + tempPriDns + " is invalid.");
              if(tempSecDns == '255.255.255.255')
                $scope.errorMessages.push("Secondary DNS Server: " + tempSecDns + " is invalid.");
            }
          }
        }
        if($scope.errorMessages.length != 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }

        if($scope.connection.protocolUsed == 2) {
          $scope.connection.ipAddress = tempIpaddress;
          if($scope.defaultGateway)
            $scope.connection.defaultGateway = tempDefGateway;
        }else{
          if($scope.defaultGateway)
            $scope.connection.defaultGateway = null;
        }
        if($scope.connection.routingMode !== undefined)
          $scope.connection.routingMode = parseInt($scope.connection.routingMode);
        $scope.connection.primaryDnsServer = tempPriDns;
        $scope.connection.secondaryDnsServer = tempSecDns;
        $scope.connection.protocolUsed = tempProtUsed;
        if($scope.connection.protocolUsed == 2 || ($scope.connection.protocolUsed == 1 && $scope.connection.overrideSubnetMask)){
          $scope.connection.subnetMask = tempSubMask;
        }else{
          $scope.connection.subnetMask = tempSubMask;
        }


        //Display warnings if LAN is set to obtain IP Automatically
        if($routeParams.id == 0 && $scope.connection.protocolUsed == 1 && $scope.oldProtocolUsed == 2) {
          $scope.messages.push({type:"DHCP Client:", data: "Configuring an internal connection to obtain an IP address automatically might make the connection inaccessible in case no IP address is obtained."});
          if($scope.connection.dhcpSettings.mode == 2)
            $scope.messages.push({type:"IP Address Distribution:",data:"IP addresses cannot be distributed until the connection obtains its IP address."});
        }

        //If ip changed need to pop up confirmation window
        if($scope.connection.ipAddress != $scope.initialIpAddress) {
          $scope.waitOnConfirm = true;
          if($scope.connection.connectionId == 0){
            $scope.messages.push({type:"Bridge IP Changed:", data: "  Please open a new browser with new address(" +
              $scope.connection.ipAddress + ") to access GUI"});
          }
          //Message about dhcp if it's enabled
          if($scope.connection.dhcpSettings && $scope.connection.dhcpSettings.mode != 0) {
            $scope.messages.push({type: "DHCP Leases:", data: "There are dynamic DHCP leases outside the DHCP IP address range."
              + " All connected DHCP clients will need to request new IP addresses."});
          }
          if($scope.connection.connectionId == 0){
            if($scope.dmz.enabled){
              if(!checkIf2IPAreInTheSameSubnetRange($scope.ipAddress, splitIpArr($scope.dmz.ip), $scope.subnetMask)){
                $scope.messages.push({type: "DMZ Host:", data: "DMZ Host will be disabled because the IP address currently assigned " +
                  "as the DMZ Host will be outside the valid IP address range. To enable DMZ Host please assign a valid IP address as the DMZ Host."});
              }
            }
          }
        }
        //Message for DNS resolution if the servers may be invalid
        if($scope.connection.connectionId == 1 && ($scope.connection.dnsMode == 1 && $scope.connection.primaryDnsServer=="0.0.0.0" &&
          $scope.connection.secondaryDnsServer=="0.0.0.0") && $scope.connection.protocolUsed != 0) {
          $scope.messages.push({type: "DNS Servers:", data: "No DNS Servers entered for this connection. This might cause name resolution problems."})
        }
      }

      if($scope.connection.type == 3 || $scope.connection.type == 5) {
        if($scope.connection.coaxPrivacy) {
          if($scope.connection.coaxPasswordManual.length < 12 || $scope.connection.coaxPasswordManual.length>17)
            $scope.errorMessages.push("Coax Link Password: Password length should be between 12 and 17 characters.");
          if($scope.connection.coaxPasswordManual.length == 0)
            $scope.errorMessages.push("Coax Link Password: A number must be specified.");
          else if(!(/^[0-9]+$/i.test($scope.connection.coaxPasswordManual)))
            $scope.errorMessages.push("Coax Link Password: Only digits can be used for the number.");
        }
      }

      if($scope.connection.protocolUsed != 2){
        $scope.connection.ipAddress = null;
      }
      if($scope.connection.dnsMode != 1){
        $scope.connection.primaryDnsServer = null;
        $scope.connection.secondaryDnsServer = null;
      }

      if($scope.errorMessages.length != 0) {
            $scope.showErrorPage = true;
            window.scrollTo(0,0);
            return;
      }

      //Convert arrays back into ip strings for saving
      if($scope.connection.dhcpSettings) {
        var ipAddr = splitIpArr($scope.connection.ipAddress);
        var submask = splitIpArr($scope.connection.subnetMask);
        $scope.connection.dhcpSettings.mode = parseInt($scope.connection.dhcpSettings.mode);
        if($scope.connection.dhcpSettings.mode == 2) {
          if($scope.connection.ipAddress != $scope.initialIpAddress && 
            getIpString($scope.dhcpEndIpAddress) == $scope.initialDhcpEndAddress) {
            for(var i =0; i < 4; i++) {
              $scope.dhcpStartIpAddress[i] = (ipAddr[i] & submask[i]) | ($scope.dhcpStartIpAddress[i] & ~submask[i]);
              $scope.dhcpEndIpAddress[i] = (ipAddr[i] & submask[i]) | ($scope.dhcpEndIpAddress[i] & ~submask[i]);
            }
          }
          /*if($scope.oldsubnet != getIpString(submask)) {
            for(var i =0; i < 4; i++) {
              if($scope.dhcpStartIpAddress[i] != $scope.dhcpEndIpAddress[i] && submask[i] != 255 && 255 - submask[i] < $scope.dhcpEndIpAddress[i]) {
                $scope.dhcpEndIpAddress[i] = 254 - submask[i];
              }
            }
          }*/
          for(var i = 0; i < $scope.staticConnections.length; i++) {
            if(!isInRange($scope.dhcpStartIpAddress, $scope.dhcpEndIpAddress, splitIpArr($scope.staticConnections[i]))) {
              $scope.messages.push({type: "Static Leases:", data: "The Static lease configured IP's are no longer valid and requires manual UI updating to reflect the new IP configuration."});
              break;
            }
          }
          $scope.errorMessages = validateIPv4DhcpSettings(ipAddr,
            $scope.dhcpStartIpAddress, $scope.dhcpEndIpAddress, submask,
            $scope.dhcpWinsServer, $scope.connection.dhcpSettings.leaseTime,
            $scope.connection.connectionId, $scope.connection.protocolUsed,
            $scope.connection.overrideSubnetMask, $scope.listOfNetworkIPAddress);
          if($scope.errorMessages.length != 0) {
            $scope.showErrorPage = true;
            window.scrollTo(0,0);
            return;
          }
        }
        $scope.connection.dhcpSettings.mode = parseInt($scope.connection.dhcpSettings.mode);
        $scope.connection.dhcpSettings.startIpAddress = getIpString($scope.dhcpStartIpAddress);
        $scope.connection.dhcpSettings.endIpAddress = getIpString($scope.dhcpEndIpAddress);
        if(validateIp($scope.dhcpWinsServer)) {
          var ip = getIpString($scope.dhcpWinsServer);
          if(ip != "0.0.0.0")
            $scope.connection.dhcpSettings.winsServer = ip;
          else
            $scope.connection.dhcpSettings.winsServer = "";
        } else
          $scope.connection.dhcpSettings.winsServer = "";
      }
      if($scope.bridges) {
        var newWanBridge = !$scope.connection.bridged[0] && $scope.bridges[0].bridged;
        if(newWanBridge) {
          $scope.messages.push({type:"Warning:", data:"Changing this configuration setting will impact router performance, and negatively impact video services and features.When in the 'bridge mode', the router and broadband service cannot be supported by the Service provider. Proceed with caution."});
        }
        for(var i = 0; i < $scope.bridges.length; i++) {
          $scope.connection.bridged[i] = $scope.bridges[i].bridged;
        }
      }

      $scope.connection.mtuType = parseInt($scope.connection.mtuType);
      if ($scope.connection.connectionId == 1){
        if($scope.connection.protocolUsed == 0 ){
          $scope.connection.staticIpAddress = "";
          $scope.connection.staticDefaultGateway = "";
          $scope.connection.staticPrimaryDnsServer = "";
          $scope.connection.staticSecondaryDnsServer = "";
          $scope.connection.staticSubnetMask = "";
        }else if($scope.connection.protocolUsed == 1){
          if ($scope.connection.dnsMode == 1){
            $scope.connection.staticIpAddress = "";
            $scope.connection.staticDefaultGateway = "";
            $scope.connection.staticPrimaryDnsServer = $scope.connection.primaryDnsServer;
            $scope.connection.staticSecondaryDnsServer = $scope.connection.secondaryDnsServer;
            $scope.connection.staticSubnetMask = $scope.connection.subnetMask;
          }else{
            $scope.connection.staticIpAddress = "";
            $scope.connection.staticDefaultGateway = "";
            $scope.connection.staticPrimaryDnsServer = "";
            $scope.connection.staticSecondaryDnsServer = "";
            $scope.connection.staticSubnetMask = $scope.connection.subnetMask;
          }
        }else{
          if ($scope.connection.dnsMode == 2){
            $scope.connection.staticIpAddress = $scope.connection.ipAddress;
            $scope.connection.staticDefaultGateway = $scope.connection.defaultGateway;
            $scope.connection.staticPrimaryDnsServer = "";
            $scope.connection.staticSecondaryDnsServer = "";
            $scope.connection.staticSubnetMask = $scope.connection.subnetMask;
          }else{
            $scope.connection.staticIpAddress = $scope.connection.ipAddress;
            $scope.connection.staticDefaultGateway = $scope.connection.defaultGateway;
            $scope.connection.staticPrimaryDnsServer = $scope.connection.primaryDnsServer;
            $scope.connection.staticSecondaryDnsServer = $scope.connection.secondaryDnsServer;
            $scope.connection.staticSubnetMask = $scope.connection.subnetMask;
          }
        }

        $scope.connection.ipAddress = $scope.tempStatic.ipAddress;
        $scope.connection.defaultGateway = $scope.tempStatic.defaultGateway;
        if ($scope.connection.dnsMode != 1){
          $scope.connection.primaryDnsServer = $scope.tempStatic.primaryDnsServer;
          $scope.connection.secondaryDnsServer = $scope.tempStatic.secondaryDnsServer;
        }
        $scope.connection.subnetMask = $scope.tempStatic.subnetMask;
      }
      //Send the put to set the data and redirect to base connection page on success
      if($scope.messages.length == 0 || !systemSettings.warnBeforeChanges) {
        var id = $scope.connection.connectionId;
        $scope.connection.$update(function() {
          $location.path('/network/connections/' + id);
        });
      } else {
        $scope.confirm = true;
        window.scrollTo(0,0);
      }
    }

    $scope.changePrivacy = function(value){
      $scope.connection.coaxAutoDetection = true;
    }

    $scope.confirmChanges = function() {
      var id = $scope.connection.connectionId;
      $scope.connection.$update(function() {
        $location.path('/network/connections/' + id);
      });
    }

    $scope.toggleEnabled = function() {
      //TODO: DUNNO
    }

    $scope.mtuTypeChanged = function() {
      $scope.connection.mtu = 1500;
    }

    $scope.protocolChanged = function() {
      if($scope.connection.protocolUsed == 1)
        $scope.connection.dnsMode = 0;
      else if($scope.connection.dnsMode == 0)
        $scope.connection.dnsMode = 1;
    }

    $scope.refreshRoutes = function() {
      var routes = Routes.get(function() {
        $scope.routes = [];
        for(var i = 0; i < routes.routes.length; i++) {
          if(routes.routes[i].type == $scope.connection.connectionId) {
            $scope.routes.push(routes.routes[i]);
          }
        }
      });
    }

    //Route Specific section
    if($routeParams.id == 0 || $routeParams.id == 1) {
      $scope.connections = NetworkConnections.query(function() {
        for(var i = 0; i < $scope.connections.length; i++) {
          if($scope.connections[i].bridged != null)
            for(var j = 0; j < $scope.connections[i].bridged.length; j++)
              $scope.connections[$scope.connections[i].availableBridges[j]].name = unescape($scope.connections[i].name + $scope.connections[$scope.connections[i].availableBridges[j]].name);
          $scope.connections[i].name = unescape($scope.connections[i].name);
        }
      });
      $scope.editingRoute = false;

      $scope.addNewRoute = function() {
        $scope.routeIndex = -1;
        $scope.routeEditing = {
          type: $scope.connection.connectionId,
          destination: [0,0,0,0],
          netmask: [255,255,255,255],
          gateway: [0,0,0,0],
          metric: 0
        }
        $scope.editingRoute = true;
      }
      
      $scope.editRoute = function(ind) {
        $scope.editingRoute = true;
        var ro = $scope.routes[ind];
        $scope.routeIndex = ind;
        $scope.routeEditing = {
          type: ro.type,
          destination: splitIpArr(ro.destination),
          netmask: splitIpArr(ro.netmask),
          gateway: splitIpArr(ro.gateway),
          metric: ro.metric
        };
      }

      $scope.deleteRoute = function(ind) {
        Routes.remove({id: $scope.routes[ind].id}, function() {
          $scope.refreshRoutes();
        })
      }

      $scope.cancelRouteEdit = function() {
        $scope.editingRoute = false;
      }

      $scope.saveRoute = function() {
        $scope.errorMessages = [];
        if(!validateIp($scope.routeEditing.destination))
          $scope.errorMessages.push("Destination: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
        if(!validateIp($scope.routeEditing.netmask))
          $scope.errorMessages.push("Netmask: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
        if(getIpString($scope.routeEditing.netmask) == '0.0.0.0')
          $scope.errorMessages.push("Netmask: Subnet mask may not be 0.0.0.0. Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
        if(getIpString($scope.routeEditing.gateway) == '0.0.0.0')
          $scope.errorMessages.push("Gateway: IP Address may not be 0.0.0.0.");
        if(!validateIp($scope.routeEditing.gateway))
          $scope.errorMessages.push("Gateway: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
        if($scope.routeEditing.metric == null || $scope.routeEditing.metric === '' || isNaN($scope.routeEditing.metric) || $scope.routeEditing.metric < 0 || $scope.routeEditing.metric > 255)
          $scope.errorMessages.push("Metric: Please enter a numeric value between 0 and 255.")
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.editingRoute = false;
        $scope.routeEditing.type = parseInt($scope.routeEditing.type);
        $scope.routeEditing.destination = getIpString($scope.routeEditing.destination);
        $scope.routeEditing.netmask = getIpString($scope.routeEditing.netmask);
        $scope.routeEditing.gateway = getIpString($scope.routeEditing.gateway);
        $scope.routeEditing.metric = parseInt($scope.routeEditing.metric);
        if($scope.routeIndex != -1) {
          Routes.update({id: $scope.routes[$scope.routeIndex].id}, $scope.routeEditing, function() {
            $scope.refreshRoutes();
          });
        } else {
          Routes.save($scope.routeEditing, function() {
            $scope.refreshRoutes();
          })
        }
      }
    }

    $scope.checkNetworkConnections = function(){
      $location.path('/network/connections');
    }

    $scope.keyPress = function(keyEvent) {
      if (keyEvent.keyCode == 13){
        if($location.path() == ('/network/connections/' + $routeParams.id + '/edit')){
          if (!$scope.editingRoute){
            $scope.save();
          }
        }
      }
    };

    //End Route Section
  }])
  .controller('DeviceDetailsCtrl', ['$scope', '$route', '$routeParams', 
    '$location', 'Devices', 'NetworkConnections', 'Diagnostics', 'PortForward',
      function($scope, $route, $routeParams, $location, Devices, NetworkConnections, Diagnostics, PortForward) {
    
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.close = '#/network';
    $scope.forwards = ["None"];
    $scope.showErrorPage = false;
    $scope.devices = Devices.query();

    if($routeParams.from != null)
      $scope.close = '#/' + from;
    var subcon = NetworkConnections.get({id: 0}, function() {
      $scope.subnetMask = subcon.subnetMask;
    })

    $scope.device = Devices.get({id: $routeParams.id}, function() {
      setDeviceStyle($scope.device, '');
      $scope.device = checkDeviceIP($scope.device);
      $scope.oldName = $scope.device.name;

      $scope.connection = NetworkConnections.get({id: $scope.device.networkConnection}, function() {
        $scope.connection.name = unescape($scope.connection.name);
      });

      var portForward = PortForward.query(function() {
        var forwards = [];
        for(var i = 0; i < portForward.length; i++) {
          if(portForward[i].deviceIp != $scope.device.ipAddress)
            continue;
          if(/^PortForward\_.*$/.test(portForward[i].name)) {
            portForward[i].displayName = "Destination Ports "
            var ports = [];
            for(var k = 0; k < portForward[i].protocols.length; k++) {
              var prot = portForward[i].protocols[k];
              if(prot.outgoingPorts == 1) {
                if($scope.contains(ports, prot.outgoingPortStart))
                  continue;
              } else if(prot.outgoingPorts == 2) {
                if($scope.contains(ports, prot.outgoingPortStart + "-" + prot.outgoingPortEnd))
                  continue;
              }
              if(k > 0)
                portForward[i].displayName += ',';
              if(prot.outgoingPorts == 0)
                portForward[i].displayName += "Any";
              else if(prot.outgoingPorts == 1) {
                portForward[i].displayName += prot.outgoingPortStart;
              } else {
                portForward[i].displayName += prot.outgoingPortStart + "-" + prot.outgoingPortEnd;
              }
            }
          } else
            portForward[i].displayName = portForward[i].name;
          forwards.push(portForward[i].displayName);
        }
        if(forwards.length != 0)
          $scope.forwards = forwards;
      });
    });

    $scope.contains = function(arr, val) {
      for(var i = 0; i < arr.length; i++)
        if(arr[i] === val)
          return true;
      return false;
    }

    $scope.pingTest = function() {
      Diagnostics.save({destination:$scope.device.ipAddress,count:4}, function() {
        $location.path('/advanced/diagnostics');
      });
    }

    $scope.errorPageOk = function() {
      $scope.showErrorPage = false;
      window.scrollTo(0,0);
    }

    $scope.iconChanged = function () {
      $scope.device.icon = parseInt($scope.device.icon);
      setDeviceStyle($scope.device, '');
    }

    $scope.save = function () {
      $scope.errorMessages = [];
      for (var idevice=0 ; idevice<$scope.devices.length ; idevice++) {
        if($scope.device.id != idevice){
          if (String($scope.device.name).toLowerCase() == String($scope.devices[idevice].name).toLowerCase()) {
            $scope.errorMessages.push("Name: Name already exists in Wireless Broadband Router's database.");
            break;
          }
        }
      }
      if($scope.device.name.length >  63)
        $scope.errorMessages.push("New Name: Name may not contain spaces. Only letters, digits and the special characters dash (-), underscore (_) and dot (.) may be used. These special characters may not appear at the beginning or at the end of a name. The maximum length of a label (text between two dots) is 63.");
      else if(!validateHostname($scope.device.name) && !/^\d+$/.test($scope.device.name))
        $scope.errorMessages.push("New Name: Name may not contain spaces. Only letters, digits and the special characters dash (-), underscore (_) and dot (.) may be used. These special characters may not appear at the beginning or at the end of a name. The maximum length of a label (text between two dots) is 63.");
      if($scope.errorMessages.length > 0) {
        $scope.showErrorPage = true;
        window.scrollTo(0,0);
        return;
      }
      $scope.device.$update(function() {
        $location.path('/network');
      });
    }

    $scope.checkNetworkConnections = function(){
      $location.path('/network/connections');
    }

    $scope.keyPress = function(keyEvent) {
      if (keyEvent.keyCode == 13){
        if($location.path() == ('/network/device/details/' + $routeParams.id)){
          if ($routeParams.fromdevicenetwork){
            $location.path('/network');
          }else{
            $location.path('/main');
          }
        }
      }
    };

  }])
  .controller('WanCoaxStatsCtrl', ['$scope', '$route', '$routeParams', '$location', 
    'NetworkConnections', 
      function($scope, $route, $routeParams, $location, NetworkConnections) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;

    $scope.checkNetworkConnections = function(){
      $location.path('/network/connections');
    }
    $scope.coax = NetworkConnections.get({id: 1});

    $scope.close = function(){
      if ($routeParams.fromdevicenetwork){
        $location.path('/network').search({});
      }else{
        $location.path('/network/connections/1/edit')
      }
    }
  }])
  .controller('LanCoaxStatsCtrl', ['$scope', '$route', '$routeParams', '$location', 
    'NetworkConnections', 
      function($scope, $route, $routeParams, $location, NetworkConnections) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;

    $scope.checkNetworkConnections = function(){
      $location.path('/network/connections');
    }
    $scope.coax = NetworkConnections.get({id: 5});

    $scope.close = function(){
      if ($routeParams.fromdevicenetwork){
        $location.path('/network').search({});
      }else{
        $location.path('/network/connections/5/edit')
      }
    }
  }]);
