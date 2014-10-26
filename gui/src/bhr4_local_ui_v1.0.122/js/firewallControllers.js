'use strict';

angular.module('firewall.controllers', [])

  .controller('GeneralCtrl', ['$scope', '$route', '$routeParams', '$location', 'General', 'IPv6',
    function($scope, $route, $routeParams, $location, General, IPv6) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.general = General.get();
      $scope.ipv6 = IPv6.get();
      $scope.warning = false;
      if($routeParams.warn != null) {
        $scope.warning = true;
      }
      $scope.cancel = function() {
        //$location.search({warn: true});
        if($routeParams.connectionEdit != null){
          $location.url('/network/connections/' + $routeParams.connectionEdit + '/edit');
        }else{
          location.reload();
          $location.replace();
        }
      }
      $scope.save = function() {
        $scope.general.$update(function() {
          location.reload();
        });
      };
      $scope.acceptWarning = function() {
        $location.search({});
        $location.replace();
      }

      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/firewall'){
            $scope.save();
          }
        }
      };

    }])
  .controller('AccessControlCtrl', ['$scope', '$route', 'AccessControl', 'NetworkObjects', 
    'DnsServer', 'PortForwardRules', 'Schedules', 'Devices', '$routeParams', '$location', 'DateTimeSettings', 'General', 'SystemSettings',
    function($scope, $route, AccessControl, NetworkObjects, DnsServer, PortForwardRules, 
      Schedules, Devices, $routeParams, $location, DateTimeSettings, General, SystemSettings) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      var gen = General.get(function() {
        $scope.showAllow = gen.ipv4SecurityLevel == 2;
      })
      /* temporary variables that should only be init once */
      $scope.showAdd = false;
      $scope.isSame = false;
      $scope.pageToShow = 0;
      $scope.netObj = -2;
      $scope.prot = -2;
      $scope.sched = -2;
      $scope.showNetObj = [];
      $scope.runFocus = false;

      $scope.sysSettings = SystemSettings.get();

      $scope.initVars = function() {
        /* temporary objects */
        init_networkObjs($scope);
        init_services($scope);
        init_schedules($scope);
        $scope.networkObjects = [];
        $scope.services = [];
        $scope.editing = -1;
      };
      
      $scope.errorPageOk = function() {
        if($scope.pageToShow == 0 && !$scope.showAdd){
          $scope.refresh();
        }
        $scope.isSame = false;
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.cancel = function() {
        window.scrollTo(0,0);
        if($routeParams.fromnetwork != null){
          $location.url('/network');
        }else{
          $location.url('/firewall');
        }
      }

      $scope.setPrintArr = function(type) {
        $scope.printAddArr = [];
        $scope.printProtArr = [];
        $scope.netObjShowArr = [];
        switch(type) {
          case 0:
            printAccessControlAddresses($scope.accessControl, $scope.devices, $scope.printAddArr);
            printProtocolWithName($scope.accessControl, $scope.printProtArr);
            break;
          case 1:
            printAddresses(1, $scope.networkObjects, $scope.printAddArr);
            printProtocol(1, $scope.services, $scope.printProtArr);
          case 2:
            break;
        }
      };

      /* START: Functions */
      $scope.save = function() {
        var changed = 0;
        var finished = 0;
        for(var i = 0; i < $scope.accessControl.length; i++) {
          if($scope.active[i] != $scope.accessControl[i].enabled) {
            changed++;
            AccessControl.update({id: $scope.accessControl[i].id}, {active: $scope.active[i]}, function() {
              finished++;
              if(finished==changed)
                $scope.refresh();
            });        
          }
        }
      }
      $scope.resolveNow = function() {
        // TODO
      };
      $scope.getDeviceName = function(ip) {
        for (var i = 0; i < $scope.devices.length; i++) {
          if(ip == $scope.devices[i].ipAddress)
            return $scope.devices[i].name;
        }
        return ip;
      }
      $scope.getDeviceIp = function(name,ipAddress) {
        for (var i = 0; i < $scope.devices.length; i++) {
          if(name == $scope.devices[i].name
              && ipAddress === $scope.devices[i].ipAddress)
            return $scope.devices[i].ipAddress;
        }
        return name;
      }
      $scope.netObjsIPArr = [];
      $scope.showNetObj = [];
      /* init net objects array */
      $scope.netObjsArr = [];
      $scope.refresh = function() {
        $scope.active = [];
        $scope.dateTimeSettings = DateTimeSettings.get(function() {
          $scope.localTimeMoment = findTimeNow($scope.dateTimeSettings);
          $scope.devices = Devices.query(function() {
            $scope.devices = filterOutGuest($scope.devices);
            $scope.accessControl = AccessControl.query(function () {
              $scope.netObjs = NetworkObjects.query(function() {
                $scope.netObjsIPArr = [];
                $scope.showNetObj = [];
                /* init net objects array */
                $scope.netObjsArr = [];
                var tempArr = [];
                for (var i = 0; i < $scope.netObjs.length; i++) {
                  var tmp = {type: 1, name: $scope.netObjs[i].name, index: i,ipAddress: $scope.netObjs[i].ipAddress};
                  if(tmp.ipAddress != undefined && tmp.ipAddress != ""){
                    tmp.deviceDisplayName = tmp.ipAddress + " - " + tmp.name;
                  }else{
                    tmp.deviceDisplayName = tmp.name;
                  }
                  $scope.netObjsArr.push(tmp);
                  $scope.showNetObj.push(true);
                  tempArr = [];
                  for (var j = 0; j < $scope.netObjs[i].rules.length; j++) {
                    tempArr.push($scope.netObjs[i].rules[j].ipAddress);
                  }
                  $scope.netObjsIPArr.push(tempArr);
                }
                for (var i = 0; i < $scope.devices.length; i++) {
                  if (!($scope.devices[i].isStb)){
                    var tmp = {type: 2, name: $scope.devices[i].name, ipAddress: $scope.devices[i].ipAddress};
                    if(tmp.ipAddress != undefined && tmp.ipAddress != ""){
                      tmp.deviceDisplayName = tmp.ipAddress + " - " + tmp.name;
                    }else{
                      tmp.deviceDisplayName = tmp.name;
                    }
                    $scope.netObjsArr.push(tmp);
                    $scope.showNetObj.push(true);
                    $scope.netObjsIPArr.push([]);
                  }
                }
                for(var i = 0; i < $scope.accessControl.length; i++) {
                  $scope.active.push($scope.accessControl[i].active);
                  for(var k = 0; k < $scope.accessControl[i].hosts.length; k++) {
                    checkAndFindNetworkObject($scope.accessControl[i].networkObjects, $scope.getDeviceName($scope.accessControl[i].hosts[k]), $scope.accessControl[i].hosts[k]);
                  }
                  $scope.accessControl[i].schedActive = 'Active';
                  if($scope.accessControl[i].schedule != null){
                    $scope.accessControl[i].schedActive = isScheduleActive($scope.accessControl[i].schedule, $scope.localTimeMoment);
                  }
                  var tempStr = [];
                  for(var j = 0; j < $scope.accessControl[i].networkObjects.length; j ++){
                    for(var k = 0; k < $scope.accessControl[i].networkObjects[j].rules.length; k ++){
                      for(var l = 0; l < $scope.netObjsArr.length; l ++){
                        if($scope.netObjsIPArr[l].length > 0){
                          for(var m = 0; m < $scope.netObjsIPArr[l].length; m ++){
                            tempStr = $scope.netObjsIPArr[l][m];
                            if(tempStr == $scope.accessControl[i].networkObjects[j].rules[k].ipAddress){
                              $scope.showNetObj.splice(l, 1);
                              $scope.netObjsArr.splice(l, 1);
                              $scope.netObjsIPArr.splice(l, 1);
                              l --;
                            }
                            if($scope.netObjsIPArr[l] == null){
                              break;
                            }
                          }
                        }else{
                          tempStr = $scope.netObjsArr[l].name;
                          if(tempStr == $scope.accessControl[i].networkObjects[j].rules[k].name){
                            $scope.showNetObj.splice(l, 1);
                            $scope.netObjsArr.splice(l, 1);
                            $scope.netObjsIPArr.splice(l, 1);
                            l --;
                          }
                        }
                      }
                    }
                  }
                }
                $scope.setPrintArr(0);
                $scope.initVars();
              });
            });
          });
        });
        /* init scheduler array */
        $scope.schedArrLen = 1;
        $scope.schedArr = Schedules.query(function() {
          for(var i = 0; i < $scope.schedArr.length; i++)
            $scope.schedArr[i].name = unescape($scope.schedArr[i].name);
          $scope.schedArrLen = $scope.schedArr.length-1;
        });
        /* init port forward rules array */
        $scope.pfRulesLen = 1;
        $scope.pfRules = PortForwardRules.query(function() {
          $scope.pfRulesLen = $scope.pfRules.length + 1;
          $scope.pfRules = sortListItems($scope.pfRules);
          $scope.pfRulesCopy = copyArrayFromSource($scope.pfRules);
        });
      };
      $scope.refresh();
      $scope.toggleMain = function(blocked) {
        $scope.runFocus = true;
        $scope.showAdd = !$scope.showAdd;
        $scope.pageToShow = 0;
        $scope.netObj = -2;
        $scope.prot = -2;
        $scope.sched = -2;
        $scope.editIndex = -1;
        if ($scope.showAdd) {
          $scope.ruleType = blocked;
          $scope.pageTitle = "Add";
          for(var i = 0; i < $scope.showNetObj.length; i++){
            $scope.showNetObj[i] = true;
          }
          $scope.setPrintArr(1);
          $scope.calculateShowingNetObjects();
        } else {
          $scope.refresh();
        }
        window.scrollTo(0,0);
      };

      $scope.loadDeviceData = function(num){
        $scope.devices = Devices.query(function() {
          $scope.devices = filterOutGuest($scope.devices);
        });
        $scope.macSelect = -1;
        $scope.togglePage(2);
      }
      $scope.togglePage = function(num) {
        $scope.runFocus = true;
        $scope.pageToShow = num;
        $scope.netObj = -2;
        $scope.prot = -2;

        if (0 == num) {
          $scope.showAdd = true;
          $scope.setPrintArr(1);
        }

        if (num == 7){
          $scope.runFocus = true;
        }

        window.scrollTo(0,0);
      };

      $scope.checkSimilarAccessControl = function(newAccessControl){
        if ($scope.sched == -2)
          newAccessControl.schedule1 = {};
        else if($scope.sched != -1) {
          for(var i = 0; i < $scope.schedArr.length; i ++){
            if($scope.sched == $scope.schedArr[i].name){
              newAccessControl.schedule1 = {};
              copySchedule(newAccessControl.schedule1, $scope.schedArr[i]);
              break;
            }
          }
        } else if($scope.sched == -1) {
          newAccessControl.schedule1 = {};
          copySchedule(newAccessControl.schedule1, $scope.schedule);
        }
        var sameHost = true;
        var sameNetObjs = true;
        var sameService = true;
        var sameSchedule = true;
        var isBlockRule = false;
        var hasSimilar = false;
        if($scope.accessControl.length > 0){
          for(var i = 0; i < $scope.accessControl.length; i ++){
            sameHost = true;
            sameNetObjs = true;
            sameService = true;
            sameSchedule = true;
            isBlockRule = false;
            if($scope.accessControl[i].blockRule == true){
              isBlockRule = true;
            }
            if(i != $scope.editing && isBlockRule == $scope.ruleType){
              sameSchedule = compareAllSchedules(newAccessControl.schedule1, $scope.accessControl[i].schedule, $scope.sched);
              if(sameSchedule == true){
                sameService = compareServices(newAccessControl.services, $scope.accessControl[i].services);
                if(sameService == true){
                  sameNetObjs = compareNetworkObjects(newAccessControl.networkObjects, $scope.accessControl[i].networkObjects);
                  if(sameNetObjs == true){
                    sameHost = compareHosts(newAccessControl.hosts, $scope.accessControl[i].hosts);
                  }
                }
              }
              if(sameHost && sameNetObjs && sameService && sameSchedule){
                hasSimilar = true;
                break;
              }
            }
          }
        }
        return hasSimilar;
      };

      $scope.createAccessControl = function(newAccessControl){
        if(newAccessControl == null){
          newAccessControl = {
            networkObjects: [],
            services: [],
            schedule:[],
            hosts: [],
            enabled: true
          };
          newAccessControl.networkObjects = [];
          copyNetworkObjs(newAccessControl.networkObjects, $scope.networkObjects, true);
          copyServices(newAccessControl.services, $scope.services);
          if($scope.sched !== -2){
            copySchedule(newAccessControl.schedule,$scope.schedule);
          }
          for(var i = 0; i < newAccessControl.networkObjects.length; i++) {
            if(newAccessControl.networkObjects[i].rules.length > 0 &&
              newAccessControl.networkObjects[i].rules[0].networkObjType == 4 &&
              newAccessControl.networkObjects[i].name == "DHCP") {
              newAccessControl.hosts.push($scope.getDeviceIp(newAccessControl.networkObjects[i].rules[0].hostname,newAccessControl.networkObjects[i].rules[0].ipAddress));
            }
          }
        }

        for(var i = 0; i < newAccessControl.networkObjects.length; i++) {
          if(newAccessControl.networkObjects[i].rules.length > 0 &&
            newAccessControl.networkObjects[i].rules[0].networkObjType == 4 &&
            newAccessControl.networkObjects[i].name == "DHCP") {
              newAccessControl.networkObjects.splice(i, 1);
              i--;
          }
        }

        if ($scope.sched == -2)
          newAccessControl.schedule = '';
        else if($scope.sched != -1) {
          newAccessControl.schedule = escape($scope.sched);
        } else if($scope.sched == -1) {
          newAccessControl.schedule = {};
          newAccessControl.scheduleEditable = true;
          $scope.schedule.name = escape($scope.schedule.name).replace(/\+/g,'%2B');
          copySchedule(newAccessControl.schedule, $scope.schedule);
        }
        newAccessControl.blockRule = $scope.ruleType;
        if (-1 == $scope.editing) {
          AccessControl.save(newAccessControl, function() {
            $scope.accessControl = [];
            $scope.initVars();
            $scope.toggleMain();
          });
        } else {
          AccessControl.update({id: $scope.accessControl[$scope.editing].id}, newAccessControl, function() {
            $scope.accessControl = [];
            $scope.initVars();
            $scope.toggleMain();
          });
        }
      };

      /* START: Main Page */
      $scope.applyMain = function() {
        $scope.errorMessages = [];
        var newAccessControl = {
          networkObjects: [],
          services: [],
          schedule:[],
          hosts: [],
          enabled: true
        };
        newAccessControl.networkObjects = [];
        copyNetworkObjs(newAccessControl.networkObjects, $scope.networkObjects, true);
        copyServices(newAccessControl.services, $scope.services);
        if(newAccessControl.services.length > 0){
          for(var i = 0; i < newAccessControl.services.length; i++) {
            for(var j = 0; j < $scope.pfRulesCopy.length; j++) {
              if(newAccessControl.services[i].name == $scope.pfRulesCopy[j].name) {
                newAccessControl.services[i].id = $scope.pfRulesCopy[j].id;
                newAccessControl.services[i].serviceType = $scope.pfRulesCopy[j].serviceType;
                break;
              }
            }
          }
        }
        if($scope.sched !== -2){
          copySchedule(newAccessControl.schedule,$scope.schedule);
        }

        for(var i = 0; i < newAccessControl.networkObjects.length; i++) {
          if(newAccessControl.networkObjects[i].rules.length > 0 &&
            newAccessControl.networkObjects[i].rules[0].networkObjType == 4 &&
            newAccessControl.networkObjects[i].name == "DHCP") {
              newAccessControl.hosts.push($scope.getDeviceIp(newAccessControl.networkObjects[i].rules[0].hostname,newAccessControl.networkObjects[i].rules[0].ipAddress));
          }
        }
        if ($scope.sched == -2)
          newAccessControl.schedule1 = {};
        else if($scope.sched != -1) {
          for(var i = 0; i < $scope.schedArr.length; i ++){
            if($scope.sched == $scope.schedArr[i].name){
              newAccessControl.schedule1 = {};
              copySchedule(newAccessControl.schedule1, $scope.schedArr[i]);
              break;
            }
          }
        } else if($scope.sched == -1) {
          newAccessControl.schedule1 = {};
          copySchedule(newAccessControl.schedule1, $scope.schedule);
        }

        if($scope.sysSettings.warnBeforeChanges){
          if($scope.checkSimilarAccessControl(newAccessControl) == true){
            $scope.togglePage(8);
          }else{
            $scope.createAccessControl(newAccessControl);
          }
        }else{
          $scope.createAccessControl(newAccessControl);
        }
      };
      $scope.cancelMain = function() {
        $scope.accessControl = [];
        $scope.initVars();
        $scope.toggleMain();
      };
      $scope.editAccessControl = function(index) {
        $scope.toggleMain();
        $scope.pageTitle = "Edit";
        $scope.editIndex = index;
        $scope.ruleType = $scope.accessControl[index].blockRule;

        copyNetworkObjs($scope.networkObjects, $scope.accessControl[index].networkObjects);
        copyServices($scope.services, $scope.accessControl[index].services);
        if($scope.accessControl[index].schedule != undefined && $scope.accessControl[index] !== '') {
          if($scope.accessControl[index].scheduleEditable) {
            $scope.sched = -1;
            copySchedule($scope.schedule, $scope.accessControl[index].schedule);
            $scope.printSchedArr = [];
            printSchedule(1, [$scope.schedule], $scope.printSchedArr);
            $scope.schedule.name = unescape($scope.schedule.name);
          } else
            $scope.sched = unescape($scope.accessControl[index].schedule.name);
        } else
          $scope.sched = -2;
        var tempArr = [];
        for(var i = 0; i < $scope.services.length; i++) {
          for(var j = 0; j < $scope.pfRules.length; j++) {
            if($scope.services[i].name == $scope.pfRules[j].name) {
              $scope.services[i].id = $scope.pfRules[j].id;
              $scope.services[i].serviceType = $scope.pfRules[j].serviceType;
              $scope.pfRules.splice(j,1);
              break;
            }
          }
          $scope.services[i].name = unescape($scope.services[i].name);
          $scope.services[i].description = unescape($scope.services[i].description);
          $scope.services[i].displayName = $scope.services[i].name;
          if($scope.services[i].description != undefined && $scope.services[i].description != "undefined"){
            if($scope.services[i].description && $scope.services[i].description.length > 0){
              $scope.services[i].displayName += " - " + $scope.services[i].description;
            }
          }
        }
        $scope.editing = index;
        $scope.calculateShowingNetObjects();
        $scope.setPrintArr(1);
      };

      $scope.calculateShowingNetObjects = function() {
        $scope.devices = Devices.query(function() {
          $scope.devices = filterOutGuest($scope.devices);
          $scope.netObjs = NetworkObjects.query(function() {
            $scope.netObjsIPArr = [];
            $scope.showNetObj = [];
            /* init net objects array */
            $scope.netObjsArr = [];
            var tempArr = [];
            for (var i = 0; i < $scope.netObjs.length; i++) {
              tempArr = [];
              for (var j = 0; j < $scope.netObjs[i].rules.length; j++) {
                tempArr.push($scope.netObjs[i].rules[j].ipAddress);
                var tmp = {type: 1, name: $scope.netObjs[i].name, index: i, ipAddress:$scope.netObjs[i].rules[j].ipAddress};
                if(tmp.ipAddress != undefined && tmp.ipAddress != ""){
                  tmp.deviceDisplayName = tmp.ipAddress + " - " + tmp.name;
                }else{
                  tmp.deviceDisplayName = tmp.name;
                }
              }
              $scope.netObjsIPArr.push(tempArr);
              $scope.netObjsArr.push(tmp);
              $scope.showNetObj.push(true);
            }
            for (var i = 0; i < $scope.devices.length; i++) {
              if (!($scope.devices[i].isStb)){
                var tmp = {type: 2, name: $scope.devices[i].name, ipAddress: $scope.devices[i].ipAddress};
                if(tmp.ipAddress != undefined && tmp.ipAddress != ""){
                  tmp.deviceDisplayName = tmp.ipAddress + " - " + tmp.name;
                }else{
                  tmp.deviceDisplayName = tmp.name;
                }
                $scope.netObjsArr.push(tmp);
                $scope.showNetObj.push(true);
                $scope.netObjsIPArr.push([]);
              }
            }
            for(var i = 0; i < $scope.netObjsArr.length; i++) {
              var found = false;
              if($scope.netObjsArr[i] != undefined){
                if($scope.netObjsArr[i].type == 0) {
                  for(var k = 0; k < $scope.networkObjects.length; k++) {
                    var obj = $scope.networkObjects[k];
                    if(obj.rules[0].networkObjType == 6 && obj.rules[0].hostname == $scope.netObjsArr[i].name) {
                      found = true;
                      break;
                    }
                  }
                } else if($scope.netObjsArr[i].type == 1) {
                  for(var k = 0; k < $scope.networkObjects.length; k++) {
                    var obj = $scope.networkObjects[k];
                    if(obj.type === undefined && obj.rules[0].networkObjType == 0 && obj.name == $scope.netObjsArr[i].name) {
                      found = true;
                      break;
                    }
                  }
                } else if($scope.netObjsArr[i].type == 2) {
                  for(var k = 0; k < $scope.networkObjects.length; k++) {
                    var obj = $scope.networkObjects[k];
                    if((obj.type === undefined || obj.type == 4)
                        && obj.rules[0].networkObjType == 7 && obj.rules[0].name == $scope.netObjsArr[i].name
                        && obj.rules[0].ipAddress === $scope.netObjsArr[i].ipAddress ) {
                      found = true;
                      break;
                    }
                  }
                }else {
                  if($scope.netObjsArr[i].id !== undefined) {
                    for(var k = 0; k < $scope.networkObjects.length; k++) {
                      if($scope.netObjsArr[i].id === $scope.networkObjects[k].id) {
                        found = true;
                        break;
                      }
                    }
                  }
                }
                $scope.showNetObj[i] = !found;
              }
            }
          })
        });
      };
      $scope.removeAccessControl = function(index) {
        AccessControl.remove({id: $scope.accessControl[index].id}, function() {
          $scope.refresh();
        });
      };
      /* END: Main Page */

      /* START: Net Obj */
      $scope.netObjChanged = function() {
        $scope.runFocus = true;
        if($scope.netObj == -2)
          return;
        if($scope.netObj == -1) {
          $scope.togglePage(1);
          return;
        }
        $scope.addNetObj($scope.netObj);
      };

      $scope.addNetObj = function(index) {
        var j=-1;
        var realIndex = 0;
        for(var i = 0; i < $scope.showNetObj.length; i ++){
          if($scope.showNetObj[i]){
            j ++;
            if(j == index){
              realIndex = i;
            }
          }
        }
        index = realIndex;
        $scope.showNetObj[index] = false;
        var tmpObj = {
          rules: []
        };

        if (0 == $scope.netObjsArr[index].type) {
          tmpObj.name = "DNS";
          tmpObj.type = 2;
          var tmpAdd = {hostname: $scope.netObjsArr[index].name, networkObjType: 6, ipAddress: $scope.netObjsArr[index].ipAddress};
          tmpObj.rules.push(tmpAdd);
        } else if($scope.netObjsArr[index].type == 2) {
          tmpObj.name = "DHCP";
          tmpObj.type = 4;
          var tmpAdd = {name: $scope.netObjsArr[index].name, networkObjType: 7, ipAddress: $scope.netObjsArr[index].ipAddress};
          tmpObj.rules.push(tmpAdd);
        } else {
          tmpObj.name = $scope.netObjsArr[index].name;
          tmpObj.type = 3;
          copyAddresses(tmpObj.rules, $scope.netObjs[$scope.netObjsArr[index].index].rules);
        }
        $scope.networkObjects.push(tmpObj);
        $scope.setPrintArr(1);
        $scope.netObj = -2;
      };

      $scope.applyNetworkObj = function() {
        $scope.errorMessages = [];
        if($scope.networkObj.name === '')
          $scope.errorMessages.push("Description: A string must be specified.");
        else {
          for(var i = 0; i < $scope.networkObjects.length; i++) {
            if($scope.editingNetworkObj == i)
              continue;
            if($scope.networkObj.name === $scope.networkObjects[i].name)
              $scope.errorMessages.push("Description: This name is already used by another network object.");
          }
        }
        if($scope.networkObj.rules.length == 0)
          $scope.errorMessages.push("Items: At least one item entry must be defined.");
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        applyNetworkObj($scope, $scope.networkObjects);
      };
      $scope.cancelNetworkObj = function() {
        cancelNetworkObj($scope);
      };
      $scope.editNetworkObj = function(index) {
        editNetworkObj($scope, $scope.networkObjects, index);
      };
      $scope.removeNetworkObj = function(index) {
        removeObject($scope.networkObjects, index);
        $scope.removeNetObj(index);
        $scope.setPrintArr(1);
        $scope.calculateShowingNetObjects();
      };

      $scope.removeNetObj = function(index) {
            $scope.showNetObj[index] = true;
      }

      $scope.copyMacAddress = function(){
        var selected = macSelecter.value;
        if(-1 != selected){
          $scope.rule.mac = splitMacArr($scope.devices[selected].mac);
        }else{
          $scope.rule.mac =  splitMacArr("00:00:00:00:00:00");
        }
        $scope.rule.macMask =  splitMacArr("ff:ff:ff:ff:ff:ff");
      }
      $scope.applyAddress = function() {
        $scope.runFocus = true;
        applyAddressCheck($scope);
        if($scope.errorMessages ==0) {
          applyAddress($scope);
        }
      };
      $scope.cancelAddress = function() {
        cancelAddress($scope);
      };
      $scope.editAddress = function(index) {
        editAddress($scope, index);
      };
      $scope.removeAddress = function(index) {
        removeObject($scope.networkObj.rules, index);
      };
      /* END: Net Obj */

      /* START: Services */
      $scope.protocolChange = function() {
        $scope.runFocus = true;
        if($scope.prot == -2)
          return;
        if($scope.prot == -1) {
          $scope.togglePage(3);
          return;
        }
        $scope.addPfProt($scope.findRuleIndex($scope.prot));
      }

      $scope.findRuleIndex = function(id){
        for(var i = 0; i < $scope.pfRules.length; i ++){
          if($scope.pfRules[i].id == id){
            return i;
          }
        }
      }

      $scope.filterDevice = function(obj){
        for(var i = 0; i < $scope.netObjsArr.length; i ++){
          if($scope.netObjsArr[i] == obj){
            return $scope.showNetObj[i];
          }
        }
        return true;
      }

      $scope.filterFn = function(obj){
        if(/^PortForward\_.*$/.test(obj.name)) {
          return false;
        }
        return true;
      }

      $scope.addPfProt = function(index) {
        var tmpServ = {
          name: "",
          type: 2,
          protocols: []
        };
        copyService(tmpServ, $scope.pfRules[index]);
        tmpServ.displayName = $scope.pfRules[index].name;
        tmpServ.id = $scope.pfRules[index].id;
        tmpServ.serviceType = $scope.pfRules[index].serviceType;
        if($scope.pfRules[index].description !== undefined && $scope.pfRules[index].description.length > 0)
          tmpServ.displayName += " - " + $scope.pfRules[index].description;
        $scope.services.push(tmpServ);

        $scope.setPrintArr(1);
        $scope.prot = -2;
        var tempArr = [];
        for(var i = 0; i < $scope.pfRules.length; i++) {
          if(tmpServ.id != $scope.pfRules[i].id) {
            tempArr.push($scope.pfRules[i]);
          }
        }
        $scope.pfRules = tempArr;
      };

      $scope.applyPortForwardRule = function() {
        $scope.errorMessages = [];
        if($scope.service.name == '')
          $scope.errorMessages.push("Service Name: A name must be specified.");
        else if(!/^[0-9A-Z\!\-\_]+$/i.test($scope.service.name))
          $scope.errorMessages.push("Service Name: Rule name should consist of standard characters only (ASCII 32-126) excluding the special character space and any of :@\"|\\/=+<>()[]{}&%^$*?,;")
        for(var i = 0; i < $scope.pfRules.length; i++) {
          if(i != $scope.editing && $scope.pfRules[i].name == $scope.service.name)
            $scope.errorMessages.push("Service Name: This name is already used by another protocol.");
        }
        if($scope.service.protocols.length == 0)
          $scope.errorMessages.push("Server Ports: At least one server ports entry must be defined.")
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }

        applyService($scope, $scope.services);
        var ind = $scope.services.length-1;
        $scope.services[ind].displayName = $scope.services[ind].name;
      };
      $scope.cancelPortForwardRule = function() {
        cancelService($scope);
      };
      $scope.editService = function(index) {
        editService($scope, $scope.services, index);
      };
      $scope.removeService = function(index) {
        for(var i = 0; i < $scope.pfRulesCopy.length; i++) {
            if($scope.pfRulesCopy[i].id == $scope.services[index].id) {
              $scope.pfRules.push($scope.pfRulesCopy[i]);
              break;
            }
          }
        $scope.pfRules = sortListItems($scope.pfRules);
        removeObject($scope.services, index);
      };

      $scope.applyProtocol = function() {
        $scope.errorMessages = [];
        $scope.protocols.protocol = parseInt($scope.protocols.protocol);
        $scope.protocols.incomingPorts = parseInt($scope.protocols.incomingPorts);
        $scope.protocols.outgoingPorts = parseInt($scope.protocols.outgoingPorts);
        $scope.protocols.icmpMessage = parseInt($scope.protocols.icmpMessage);
        $scope.protocols.protocolNumber = parseInt($scope.protocols.protocolNumber);
        var sstart = $scope.protocols.incomingPortStart;
        var send = $scope.protocols.incomingPortEnd;
        var dstart = $scope.protocols.outgoingPortStart;
        var dend = $scope.protocols.outgoingPortEnd;
        switch($scope.protocols.protocol) {
          case 0: {
            var pro = $scope.protocols.protocolNumber;
            if(pro == null || pro === '' || isNaN(pro) || pro < 0 || pro > 255)
              $scope.errorMessages.push("Protocol Number: Please enter a numeric value between 0 and 255.");
          }
            break;
          case 1:
          case 2: {
            switch($scope.protocols.incomingPorts) {
              case 1: {
                if(sstart == null || sstart === '' || sstart < 1 || sstart > 65535)
                  $scope.errorMessages.push("Source Port: Please enter a numeric value between 1 and 65535.");
              }
                break;
              case 2: {
                if(sstart == null || sstart === '' || sstart < 1 || sstart > 65535)
                  $scope.errorMessages.push("Start Source Port: Please enter a numeric value between 1 and 65535.");
                if(send == null || send === '' || send < 1 || send > 65535)
                  $scope.errorMessages.push("End Source Port: Please enter a numeric value between 1 and 65535.");
                if($scope.errorMessages.length == 0 && sstart >= send)
                  $scope.errorMessages.push("Source Ports: The From value must be lower than the To value in a range of ports (from=" + sstart + ", to=" + send + ").");
              }
                break;
              default:
                break;
            }
            switch($scope.protocols.outgoingPorts) {
              case 1: {
                if(dstart == null || dstart === '' || dstart < 1 || dstart > 65535)
                  $scope.errorMessages.push("Destination Port: Please enter a numeric value between 1 and 65535.");
                if(dstart == 4567 && $scope.protocols.outgoingExclude == false && $scope.protocols.protocol == 1){
                  $scope.errorMessages.push("Invalid rule: Port 4567 cannot be blocked");
                }
              }
                break;
              case 2: {
                if(dstart == null || dstart === '' || dstart < 1 || dstart > 65535)
                  $scope.errorMessages.push("Start Destination Port: Please enter a numeric value between 1 and 65535.");
                if(dend == null || dend === '' || dend < 1 || dend > 65535)
                  $scope.errorMessages.push("End Destination Port: Please enter a numeric value between 1 and 65535.");
                if($scope.errorMessages.length == 0 && dstart >= dend)
                  $scope.errorMessages.push("Destination Ports: The From value must be lower than the To value in a range of ports (from=" + dstart + ", to=" + dend + ").");
              }
                break;
              default:
                break;
            }
          }
            break;
          case 3: {
            if($scope.protocols.icmpMessage == 10) {
              var t = $scope.protocols.icmpType;
              var c = $scope.protocols.icmpCode;
              if(t == null || t === '' || t < 0 || t > 255)
                $scope.errorMessages.push("ICMP Type:  Please enter a numeric value between 0 and 255.");
              if(c == null || c === '' || c < 0 || c > 255)
                $scope.errorMessages.push("ICMP Code:  Please enter a numeric value between 0 and 255.");
            }
          }
            break;
          default:
            break;
        }

        if($scope.errorMessages.length == 0){
          if($scope.protocols.incomingPorts == 0){
            $scope.protocols.incomingExclude = false;
          }
          if($scope.protocols.outgoingPorts == 0){
            $scope.protocols.outgoingExclude = false;
          }
          if($scope.protocols.protocol == 1 || $scope.protocols.protocol == 2){
            var sourceNotValid = false;
            var destNotValid = false;
            if($scope.protocols.incomingPorts == 0) {
              sourceNotValid = true;
            }else if($scope.protocols.incomingPorts == 2 && $scope.protocols.incomingExclude == false){
              if(sstart == 1 && send == 65535){
                sourceNotValid = true;
              }
            }
            if($scope.protocols.outgoingPorts == 0) {
              destNotValid = true;
            }else if($scope.protocols.outgoingPorts == 2 && $scope.protocols.outgoingExclude == false){
              if(dstart == 1 && dend == 65535){
                destNotValid = true;
              }
            }
            if(sourceNotValid && destNotValid){
              $scope.errorMessages.push('Port forwarding rules can not be Any-to-Any (or "source: 1-65535" with "destination: 1-65535").');
            }
          }
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.protocols.icmpType = parseInt($scope.protocols.icmpType);
        $scope.protocols.icmpCode = parseInt($scope.protocols.icmpCode);
        applyProtocol($scope, $scope.service.protocols);
      };
      $scope.cancelProtocol = function() {
        cancelProtocol($scope);
      };
      $scope.editProtocol = function(index) {
        editProtocol($scope, index, $scope.service.protocols);
      };
      $scope.removeProtocol = function(index) {
        removeObject($scope.service.protocols, index);
        $scope.setPrintArr(1);
      };
      /* END: Services */

      /* START: Schedule */
      $scope.scheduleChange = function() {
        $scope.runFocus = true;
        if($scope.sched == -2)
          return;
        if($scope.sched == -1)
          $scope.addSchedule();
      }
      $scope.addSchedule = function() {
        init_schedule($scope);
        $scope.editingSchedule = false;
        $scope.togglePage(5);
      }

      /* APPLY*/
      $scope.applyRuleScheduler = function() {
        $scope.runFocus = true;
        $scope.errorMessages = [];
        if($scope.schedule.name === '')
          $scope.errorMessages.push("Description: A string must be specified.");
        for(var i = 0; i < $scope.schedArr.length; i++) {
          if(i == $scope.editingRuleSchedule)
            continue;
          if($scope.schedArr[i].name == $scope.schedule.name) {
            $scope.errorMessages.push("Name: This name is already used by another scheduler rule.");
            break;
          }
        }
        if($scope.schedule.timeSegments.length == 0)
          $scope.errorMessages.push("Rule Schedule: At least one time segment should be defined.");
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        var tempSchedule = {};
        copySchedule(tempSchedule, $scope.schedule);
        for(var i = 0; i < tempSchedule.timeSegments.length; i++) {
          for(var k = 0; k < tempSchedule.timeSegments[i].hourRanges.length; k++) {
            tempSchedule.timeSegments[i].hourRanges[k].startTimeHour = parseInt(tempSchedule.timeSegments[i].hourRanges[k].startTimeHour);
            tempSchedule.timeSegments[i].hourRanges[k].startTimeMinute = parseInt(tempSchedule.timeSegments[i].hourRanges[k].startTimeMinute);
            tempSchedule.timeSegments[i].hourRanges[k].endTimeHour = parseInt(tempSchedule.timeSegments[i].hourRanges[k].endTimeHour);
            tempSchedule.timeSegments[i].hourRanges[k].endTimeMinute = parseInt(tempSchedule.timeSegments[i].hourRanges[k].endTimeMinute);
          }
        }
        $scope.schedule = tempSchedule;
        $scope.schedule.name = unescape($scope.schedule.name);
        //var scheds = [$scope.schedule];
        //applyRuleScheduler($scope, scheds);
        //$scope.schedule = scheds[scheds.length-1];
        $scope.togglePage(0);
        $scope.printSchedArr = [];
        printSchedule(1, [$scope.schedule], $scope.printSchedArr);
      };
      $scope.cancelRuleScheduler = function() {
        cancelRuleScheduler($scope);
        if($scope.editingSchedule)
          return;
        $scope.sched = -2;
      };
      $scope.editRuleScheduler = function() {
        $scope.editingSchedule = true;
        var aSched = {};
        copySchedule(aSched, $scope.schedule);//make a copy as $scope.schedule is set in editRuleScheduler which deletes some properties
        editRuleScheduler($scope, [aSched], 0);
      };
      $scope.removeRuleScheduler = function(index) {
        $scope.sched = -2;
        $scope.printSchedArr = [];
      };

      $scope.applyTimeSegment = function() {
        $scope.errorMessages = [];
        var valid = false;
        for(var i =0; i < $scope.daysOfTheWeek.length; i++)
          if($scope.daysOfTheWeek[i])
            valid = true;
        if(!valid)
          $scope.errorMessages.push("Days of Week: At least one day must be selected.");
        if($scope.hourRanges.length == 0)
          $scope.errorMessages.push("Hours Range: At least one hour range must be set.");
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        applyTimeSegment($scope);
        window.scrollTo(0,0);
      };
      $scope.cancelTimeSegment = function() {
        cancelTimeSegment($scope);
      };
      $scope.editTimeSegment = function(index) {
        editTimeSegment($scope, index);
      };
      $scope.removeTimeSegment = function(index) {
        removeObject($scope.schedule.timeSegments, index);
      };

      $scope.applyHourRange = function() {
        $scope.runFocus = true;
        $scope.errorMessages = [];
        var sh = $scope.hourRange.startTimeHour;
        var eh = $scope.hourRange.endTimeHour;
        var sm = $scope.hourRange.startTimeMinute;
        var em = $scope.hourRange.endTimeMinute;
        if(sh === '' || isNaN(sh) || sh < 0 || sh > 23)
          $scope.errorMessages.push("Start Time Hour: Please enter a numeric value between 0 and 23.");
        if(eh === '' || isNaN(eh) || eh < 0 || eh > 23)
          $scope.errorMessages.push("End Time Hour: Please enter a numeric value between 0 and 23.");
        if(sm === '' || isNaN(sm) || sm < 0 || sm > 59)
          $scope.errorMessages.push("Start Time Minutes: Please enter a numeric value between 0 and 59.");
        if(em === '' || isNaN(em) || em < 0 || em > 59)
          $scope.errorMessages.push("End Time Minutes: Please enter a numeric value between 0 and 59.");
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.hourRange.startTimeHour = parseInt($scope.hourRange.startTimeHour);
        $scope.hourRange.startTimeMinute = parseInt($scope.hourRange.startTimeMinute);
        $scope.hourRange.endTimeHour = parseInt($scope.hourRange.endTimeHour);
        $scope.hourRange.endTimeMinute = parseInt($scope.hourRange.endTimeMinute);
        applyHourRange($scope);
      };
      $scope.cancelHourRange = function() {
        cancelHourRange($scope);
      };
      $scope.editHourRange = function(index) {
        editHourRange($scope, index);
      };
      $scope.removeHourRange = function(index) {
        removeObject($scope.hourRanges, index);
      };
      $scope.formatTimeString = function(hour, minute) {
    	hour = hour < 10? '0' + hour : hour;
        return hour + ":" + (minute<10?'0' + minute:minute);
      }
      /* END: Schedule */

      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/firewall/accesscontrol'){
            if($scope.showAdd && $scope.pageToShow == 0 && !$scope.isSame){
              $scope.applyMain();
            }else if(($scope.pageToShow == 8) && !$scope.showErrorPage){
              $scope.createAccessControl(null);
            }else if (($scope.pageToShow == 1 || $scope.pageToShow == 2) && !$scope.showErrorPage){
              if ($scope.pageToShow == 2){
                $scope.applyAddress();
              }else{
                $scope.applyNetworkObj();
              }
            }else if(($scope.pageToShow == 5 || $scope.pageToShow == 6 || $scope.pageToShow == 7) && !$scope.showErrorPage){
              if ($scope.pageToShow == 6 && !$scope.showErrorPage){
                $scope.applyTimeSegment();
              }else if ($scope.pageToShow == 7 && !$scope.showErrorPage){
                $scope.applyHourRange();
              }else if (!$scope.showErrorPage){
                $scope.applyRuleScheduler();
              }
            }else if ($scope.pageToShow == 3 && !$scope.showErrorPage){
              $scope.applyPortForwardRule();
            }else if ($scope.pageToShow == 4 && !$scope.showErrorPage){
              $scope.applyProtocol();
            }else if (!$scope.showAdd && $scope.pageToShow == 0){
              $scope.save();
            }
          }
        }
      };

    }])
  .controller('PortForwardCtrl', ['$scope', '$route', 'PortForward', 'Devices', 'PortForwardRules', 'Schedules', 'DateTimeSettings',
    function($scope, $route, PortForward, Devices, PortForwardRules, Schedules, DateTimeSettings) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.sourcePortType = 0;
      $scope.destPortType = 0;

      $scope.showAdvanced = false;
      
      $scope.ipSelect = -2;
      $scope.appToForward = -2;
      $scope.showErrorPage = false;
      $scope.portsUsed = [];

      $scope.hasPrevValue = null;

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.pf = {
        specifiedIp: [0,0,0,0],
        servicePortType: 0,
        servicePort: 0,
        schedule: "Always",
        protocol: {
          protocol: 1,
          incomingPorts: 0,
          incomingPortStart: 65535,
          incomingPortEnd: 0,
          outgoingPorts: 0,
          outgoingPortStart: 65535,
          outgoingPortEnd: 0
        }
      };

      $scope.removeBox = [];
      
      for (var i = 0; i < $scope.numItems; i++) {
        $scope.removeBox.push(false);
      }

      /* Functions */
      $scope.isScheduleActive = isScheduleActive;
      
      $scope.appForward = function() {
        if($scope.appToForward>=0) {
          $scope.portsUsed = [];
          var app = null;
          for(var i = 0; i < $scope.pfRules.length; i++) {
            if($scope.pfRules[i].id == $scope.appToForward) {
              app = $scope.pfRules[i];
              break;
            }
          }
          if(app != null)
            printProtocol(6, app.protocols, $scope.portsUsed);
        }
      }

      $scope.save = function() {
        var changed = 0;
        var finished = 0;
        for(var i = 0; i < $scope.portForward.length; i++) {
          if($scope.active[i] != $scope.portForward[i].enabled) {
            changed++;
            PortForward.update({id: $scope.portForward[i].id}, {enabled: $scope.active[i]}, function() {
              finished++;
              if(finished==changed)
                $scope.refresh();
            });        
          }
        }
      }
      $scope.toggleShow = function() {
        $scope.showAdvanced = !$scope.showAdvanced;
      };
      $scope.contains = function(arr, val) {
        for(var i = 0; i < arr.length; i++)
          if(arr[i] === val)
            return true;
        return false;
      }
      $scope.refresh = function() {
        $scope.portForward = PortForward.query(function() {
          $scope.numItems = $scope.portForward.length;
          $scope.printPortsArr = [];
          printProtocol(1, $scope.portForward, $scope.printPortsArr);
          $scope.active = [];
          for(var i = 0; i < $scope.portForward.length; i++) {
            $scope.active.push($scope.portForward[i].enabled);
            if(/^PortForward\_.*$/.test($scope.portForward[i].name)) {
              $scope.portForward[i].displayName = "Destination Ports "
              var ports = [];
              for(var k = 0; k < $scope.portForward[i].protocols.length; k++) {
                var prot = $scope.portForward[i].protocols[k];
                if(prot.outgoingPorts == 1) {
                  if($scope.contains(ports, prot.outgoingPortStart))
                    continue;
                } else if(prot.outgoingPorts == 2) {
                  if($scope.contains(ports, prot.outgoingPortStart + "-" + prot.outgoingPortEnd))
                    continue;
                }
                if(k > 0)
                  $scope.portForward[i].displayName += ',';
                if(prot.outgoingPorts == 0)
                  $scope.portForward[i].displayName += "Any";
                else if(prot.outgoingPorts == 1) {
                  $scope.portForward[i].displayName += prot.outgoingPortStart;
                  ports.push(prot.outgoingPortStart);
                } else {
                  $scope.portForward[i].displayName += prot.outgoingPortStart + "-" + prot.outgoingPortEnd;
                  ports.push(prot.outgoingPortStart + "-" + prot.outgoingPortEnd);
                }
              }
            } else
              $scope.portForward[i].displayName = unescape($scope.portForward[i].name);
          }

          $scope.dateTimeSettings = DateTimeSettings.get(function() {
            $scope.localTimeMoment = findTimeNow($scope.dateTimeSettings);
            $scope.schedules = Schedules.query(function() {
              for(var i = 0; i < $scope.portForward.length; i++) {
                $scope.portForward[i].schedActive = 'Active';
                for(var k = 0; k < $scope.schedules.length; k++) {
                  if($scope.portForward[i].schedule == $scope.schedules[k].name) {
                    $scope.portForward[i].schedActive = isScheduleActive($scope.schedules[k], $scope.localTimeMoment);
                    break;
                  }
                }
              }
              for(var k = 0; k < $scope.schedules.length; k++) {
                $scope.schedules[k].name = unescape($scope.schedules[k].name);
              }
            });
          });
          if($scope.hasPrevValue == null){
            $scope.devices = Devices.query(function() {
              for(var i = 0; i < $scope.devices.length; i++)
                if($scope.devices[i].ipAddress != $scope.devices[i].name)
                  $scope.devices[i].displayName = $scope.devices[i].ipAddress + ' - ' + $scope.devices[i].name;
                else
                  $scope.devices[i].displayName = $scope.devices[i].name;
              for(var i = 0 ; i < $scope.portForward.length; i++) {
                for(var k = 0; k < $scope.devices.length; k++) {
                  if($scope.portForward[i].deviceIp == $scope.devices[k].ipAddress && $scope.devices[k].name !== $scope.devices[k].ipAddress) {
                    $scope.portForward[i].hostname = $scope.devices[k].name;
                    $scope.portForward[i].showIp = true;
                    break;
                  }
                }
                if($scope.portForward[i].hostname == null || $scope.portForward[i].hosname === '') {
                  $scope.portForward[i].showIp = false;
                  $scope.portForward[i].hostname = $scope.portForward[i].deviceIp;
                }
              }
              $scope.devices = filterOutStb($scope.devices);
              $scope.devices = filterOutGuest($scope.devices);
              $scope.pfRules = PortForwardRules.query(function() {
                $scope.pfRules = sortListItems($scope.pfRules);
                $scope.pfRulesCopy = copyArrayFromSource($scope.pfRules);
              });
            });
          }else if($scope.hasPrevValue == true){
            $scope.hasPrevValue = null;
            $scope.devices1 = Devices.query(function() {
              for(var i = 0; i < $scope.devices1.length; i++)
                if($scope.devices1[i].ipAddress != $scope.devices1[i].name)
                  $scope.devices1[i].displayName = $scope.devices1[i].ipAddress + ' - ' + $scope.devices1[i].name;
                else
                  $scope.devices1[i].displayName = $scope.devices1[i].name;
              for(var i = 0 ; i < $scope.portForward.length; i++) {
                for(var k = 0; k < $scope.devices1.length; k++) {
                  if($scope.portForward[i].deviceIp == $scope.devices1[k].ipAddress && $scope.devices1[k].name !== $scope.devices1[k].ipAddress) {
                    $scope.portForward[i].hostname = $scope.devices1[k].name;
                    $scope.portForward[i].showIp = true;
                    break;
                  }
                }
                if($scope.portForward[i].hostname == null || $scope.portForward[i].hosname === '') {
                  $scope.portForward[i].showIp = false;
                  $scope.portForward[i].hostname = $scope.portForward[i].deviceIp;
                }
              }
            });
          }
        });
      };
      $scope.refresh();

      $scope.resolveNow = function() {
        // TODO
      };
      $scope.reset = function() {
        $scope.ipSelect = -2;
        $scope.appToForward = -2;
        $scope.showAdvanced = false;

        $scope.pf = {
          specifiedIp: [0,0,0,0],
          servicePortType: 0,
          servicePort: 0,
          schedule: "Always",
          protocol: {
            protocol: 1,
            incomingPorts: 0,
            incomingPortStart: 65535,
            incomingPortEnd: 0,
            outgoingPorts: 0,
            outgoingPortStart: 65535,
            outgoingPortEnd: 0
          }
        };
      };

      $scope.add = function() {
        $scope.errorMessages = [];
        if($scope.ipSelect == -2) {
          $scope.errorMessages.push("Error: Please select the IP Address you want to forward to, or select an already connected item from the list");
        } else if($scope.ipSelect == -1) {
          if(!validateIp($scope.pf.specifiedIp) || getIpString($scope.pf.specifiedIp)=='0.0.0.0' || getIpString($scope.pf.specifiedIp)=='255.255.255.255')
            $scope.errorMessages.push("Error: The IP address specified is invalid");
        }
        $scope.pf.protocol.protocol = parseInt($scope.pf.protocol.protocol);
        var outgoingPortsArr = [];
        var outgoingPortStartArr = [];
        var outgoingPortEndArr = [];
        var incomingPorts = 0;
        var incomingPortStart = 0;
        var incomingPortEnd = 65535;
        var outgoingPorts = 0;
        var outgoingPortStart = 0;
        var outgoingPortEnd = 65535;
        if($scope.appToForward==-2) {
          $scope.errorMessages.push("Error: Please select a pre-configured application or choose the option Custom ports to create a new appliction for port forwarding");
        } else if($scope.appToForward==-1) {
          if(!$scope.showAdvanced && $scope.errorMessages.length == 0) {
            var parts = ('' + $scope.pf.protocol.outgoingPortStart).split(",");
            for(var p = 0; p < parts.length; p++) {
              var field = (parts[p]).split("-");
              if(field.length > 2) {
                $scope.errorMessages.push("Error: The input of port has illegal characters. Source port should be 111 or 111-222; Destination port should be 111, or 111-222, or 111,222-333 and so on.");
              } else {
                for(var i = 0; i < field.length; i++) {
                  if(field[i] === '' || isNaN(field[i]) || checkForWholeNumbers(field[i]))
                    $scope.errorMessages.push("Error: The input of port has illegal characters. Source port should be 111 or 111-222; Destination port should be 111, or 111-222, or 111,222-333 and so on.");
                  else if(field[i] < 1 || field[i] > 65535)
                    $scope.errorMessages.push("Error: Port range should be between [1-65535]");              
                }
              }
              if(field.length == 1) {
                outgoingPorts = 1;
                outgoingPortStart = outgoingPortEnd = parseInt(field[0]);
              } else if(field.length == 2) {
                outgoingPorts = 2;
                outgoingPortStart = parseInt(field[0]);
                outgoingPortEnd = parseInt(field[1]);
              }
              outgoingPortsArr.push(outgoingPorts);
              outgoingPortStartArr.push(outgoingPortStart);
              outgoingPortEndArr.push(outgoingPortEnd);
            }
          } else if($scope.errorMessages.length == 0) {
            if($scope.sourcePortType == 1) {
              var field = ('' + $scope.pf.incomingPortStart).split("-");
              if(field.length > 2) {
                $scope.errorMessages.push("Error: The input of port has illegal characters. Source port should be 111 or 111-222; Destination port should be 111, or 111-222, or 111,222-333 and so on.");
              } else {
                for(var i = 0; i < field.length; i++) {
                  if(field[i] === '' || isNaN(field[i]) || checkForWholeNumbers(field[i]))
                    $scope.errorMessages.push("Error: The input of port has illegal characters. Source port should be 111 or 111-222; Destination port should be 111, or 111-222, or 111,222-333 and so on.");
                  else if(field[i] < 1 || field[i] > 65535)
                    $scope.errorMessages.push("Error: Port range should be between [1-65535]");                
                }
              }
              if(field.length == 1) {
                incomingPorts = 1;
                incomingPortStart = incomingPortEnd = parseInt(field[0]);
              } else if(field.length == 2) {
                incomingPorts = 2;
                incomingPortStart = parseInt(field[0]);
                incomingPortEnd = parseInt(field[1]);
              }
            }
            if($scope.destPortType == 1 && $scope.errorMessages.length == 0) {
              var parts = ('' + $scope.pf.outgoingPortStart).split(",");
              for(var p = 0; p < parts.length; p++) {
                var field = (parts[p]).split("-");
                if(field.length > 2) {
                  $scope.errorMessages.push("Error: The input of port has illegal characters. Destination port should be 111 or 111-222; Destination port should be 111, or 111-222, or 111,222-333 and so on.");
                } else {
                  for(var i = 0; i < field.length; i++) {
                    if(field[i] === '' || isNaN(field[i]) || checkForWholeNumbers(field[i]))
                      $scope.errorMessages.push("Error: The input of port has illegal characters. Destination port should be 111 or 111-222; Destination port should be 111, or 111-222, or 111,222-333 and so on.");
                    else if(field[i] < 1 || field[i] > 65535)
                      $scope.errorMessages.push("Error: Port range should be between [1-65535]");   
                  }
                }
                if(field.length == 1) {
                  outgoingPorts = 1;
                  outgoingPortStart = outgoingPortEnd = parseInt(field[0]);
                } else if(field.length == 2) {
                  outgoingPorts = 2;
                  outgoingPortStart = parseInt(field[0]);
                  outgoingPortEnd = parseInt(field[1]);
                }            
                outgoingPortsArr.push(outgoingPorts);
                outgoingPortStartArr.push(outgoingPortStart);
                outgoingPortEndArr.push(outgoingPortEnd);
              }
            }
          }
        }
        if($scope.showAdvanced && $scope.pf.servicePortType == 1 && $scope.errorMessages.length == 0) {
          if($scope.pf.servicePort === '' || isNaN($scope.pf.servicePort) || $scope.pf.servicePort < 0 || $scope.pf.servicePort > 65535)
            $scope.errorMessages.push("Forward to Port: Please enter a numeric value between 0 and 65535.");
        }
        if(outgoingPortsArr.length ==0) {
          outgoingPortsArr.push(outgoingPorts);
          outgoingPortStartArr.push(outgoingPortStart);
          outgoingPortEndArr.push(outgoingPortEnd);
        }
        if($scope.errorMessages.length == 0){
          if($scope.appToForward == -1){
            var cfield;
            var sourceNotValid = false;
            var destNotValid = false;
            if($scope.showAdvanced == true){
              if($scope.sourcePortType == 0) {
                sourceNotValid = true;
              }else if($scope.sourcePortType == 1){
                cfield = ('' + $scope.pf.incomingPortStart).split("-");
                if(cfield.length == 2) {
                  if(cfield[0] == 1 && cfield[1] == 65535){
                    sourceNotValid = true;
                  }
                }
              }
            }else{
              sourceNotValid = true;
            }
            if($scope.showAdvanced == true){
              if($scope.destPortType == 0) {
                destNotValid = true;
              }else if($scope.destPortType == 1){
                cfield = ('' + $scope.pf.outgoingPortStart).split("-");
                if(cfield.length == 2) {
                  if(cfield[0] == 1 && cfield[1] == 65535){
                    destNotValid = true;
                  }
                }
              }
            }else{
              cfield = ('' + $scope.pf.protocol.outgoingPortStart).split("-");
              if(cfield.length == 2) {
                if(cfield[0] == 1 && cfield[1] == 65535){
                  destNotValid = true;
                }
              }
            }
            if(sourceNotValid && destNotValid){
              $scope.errorMessages.push('Port forwarding rules can not be Any-to-Any (or "source: 1-65535" with "destination: 1-65535").');
            }
          }
        }
        if($scope.errorMessages.length == 0 && $scope.appToForward>=0) {
          var service = null;
          for(var i = 0; i < $scope.pfRules.length; i++)
            if($scope.pfRules[i].id == $scope.appToForward) {
              service = $scope.pfRules[i];
              break;
            }
          if(service == null)
            return;
          for(var i = 0; i < service.protocols.length; i++) {
            if(service.protocols[i].protocolExclude || service.protocols[i].outgoingExclude)
              continue;
            var s = service.protocols[i].outgoingPortStart;
            var e = service.protocols[i].outgoingPortEnd;
            var protocolName = service.name;
            var destPorts = s;
            var protocolUsed = service.protocols[i].protocol;
            var nonTCPnUDP = false;
            if(e !== undefined && s != e)
                destPorts += '-' + e;
            if(e === undefined)
              e = s;
            //removed since protocolUsed == 7 will only be available when port forward is custom
            //if(protocolUsed == 1 || protocolUsed == 7){
            //  if(s <= 4567 && 4567 <= e)
            //    $scope.errorMessages.push("Invalid rule: Port 4567 cannot be blocked")
            //}
            for(var j = 0; j < $scope.portForward.length; j++) {
              for(var k = 0; k < $scope.portForward[j].protocols.length; k++) {
                var prot = $scope.portForward[j].protocols[k];
                if(protocolUsed == 7 && (prot.protocol <1 || prot.protocol>2))
                  continue;
                else if(protocolUsed != 7 && protocolUsed != prot.protocol)
                  continue;
                else if(undefined == s && protocolUsed == prot.protocol && (protocolUsed == 0 || protocolUsed == 3 || protocolUsed == 4 || protocolUsed == 5|| protocolUsed == 6))
                  nonTCPnUDP = true;
                var range = '';
                if(prot.outgoingPorts == 0)
                  range = 'Any';
                else if(prot.outgoingPorts == 1 && s <= prot.outgoingPortStart && e >= prot.outgoingPortStart)
                  range = prot.outgoingPortStart;
                else if(prot.outgoingPorts == 2 && 
                  (s <= prot.outgoingPortStart && e >= prot.outgoingPortStart) ||
                  (s <= prot.outgoingPortEnd && e >= prot.outgoingPortEnd) ||
                  (s >= prot.outgoingPortStart && e <= prot.outgoingPortEnd))
                  range = prot.outgoingPortStart + ' -> ' + prot.outgoingPortEnd;
                if(range != '' || nonTCPnUDP)
                  $scope.errorMessages.push("Conflicting Port Forwarding Rules: The " + protocolName + " service conflict with an existing port forwarding rule offering " + protocolName + " service.");
              }
            }
          }
        }
        if($scope.errorMessages.length == 0 && $scope.appToForward==-1) {
          for(var p = 0; p < outgoingPortsArr.length; p++) {
            outgoingPorts = outgoingPortsArr[p];
            outgoingPortStart = outgoingPortStartArr[p];
            outgoingPortEnd = outgoingPortEndArr[p];
            var protocolUsed = parseInt($scope.pf.protocol.protocol);
            if(protocolUsed == 1 || protocolUsed == 7){
              if(outgoingPortStart == 4567 && outgoingPortEnd == 4567)
                $scope.errorMessages.push("Invalid rule: Port 4567 cannot be blocked");
            }
            if(outgoingPorts == 0) {
              for(var i = 0; i < $scope.portForward.length; i++) {
                for(var k = 0; k < $scope.portForward[i].protocols.length; k++) {
                  var prot = $scope.portForward[i].protocols[k];
                  if(protocolUsed == 7 && (prot.protocol <1 || prot.protocol>2))
                    continue;
                  else if(protocolUsed != 7 && protocolUsed != prot.protocol)
                    continue;
                  var range = '';
                  if(prot.outgoingPorts == 0)
                    range = 'Any';
                  else if(prot.outgoingPorts == 1)
                    range = prot.outgoingPortStart;
                  else
                    range = prot.outgoingPortStart + ' -> ' + prot.outgoingPortEnd;
                  $scope.errorMessages.push("Conflicting Port Forwarding Rules: The Destination Ports Any service conflict with an existing port forwarding rule offering Destination Ports " + range + " service.");
                }
              }
            } else {
              var s = outgoingPortStart;
              var e = outgoingPortEnd;
              var destPorts = s;
              var protocolUsed = $scope.pf.protocol.protocol;
              if(s != e)
                destPorts += '-' + e;
              for(var i = 0; i < $scope.portForward.length; i++) {
                for(var k = 0; k < $scope.portForward[i].protocols.length; k++) {
                  var prot = $scope.portForward[i].protocols[k];
                  var protocolName = $scope.portForward[i].name;
                  if(protocolUsed == 7 && (prot.protocol <1 || prot.protocol>2))
                    continue;
                  else if(protocolUsed != 7 && protocolUsed != prot.protocol)
                    continue;
                  var range = '';
                  if(prot.outgoingPorts == 0)
                    range = 'Any';
                  else if(prot.outgoingPorts == 1 && s <= prot.outgoingPortStart && e >= prot.outgoingPortStart)
                    range = prot.outgoingPortStart;
                  else if(prot.outgoingPorts == 2 && 
                    (s <= prot.outgoingPortStart && e >= prot.outgoingPortStart) ||
                    (s <= prot.outgoingPortEnd && e >= prot.outgoingPortEnd) ||
                    (s >= prot.outgoingPortStart && e <= prot.outgoingPortEnd))
                    range = prot.outgoingPortStart + ' -> ' + prot.outgoingPortEnd;
                  if(range != '')
                  {
                   if(protocolName.indexOf("_")>=0)
                   {
                       $scope.errorMessages.push("Conflicting Port Forwarding Rules: The Destination Ports " + destPorts + " service conflict with an existing port forwarding rule offering  Destination Ports " + range + " service.");
                   }
                   else
                   {
                       $scope.errorMessages.push("Conflicting Port Forwarding Rules: The Destination Ports " + destPorts + " service conflict with an existing port forwarding rule offering " + protocolName + " service.");
                   }
                  }
                }
              }
            }
          }
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }

        var incomingExclude = false;
        var outgoingExclude = false;
        var incomingExcludeObj = false;
        var outgoingExcludeObj = false;
        var obj;
        var proto = parseInt($scope.pf.protocol.protocol);

        var newPF = {enabled:true};

        if (-1 == $scope.ipSelect)
          newPF.deviceIp = getIpString($scope.pf.specifiedIp);
        else if (0 <= $scope.ipSelect)
          newPF.deviceIp = $scope.devices[$scope.ipSelect].ipAddress;

        if (-1 == $scope.appToForward) {
          newPF.name = "PortForward_" + new Date().getTime();
          newPF.protocols = [];
          if(proto == 7) {//BOTH
            for(var i = 0; i < outgoingPortsArr.length; i++) {

              incomingExclude = false;
              outgoingExclude = false;
              incomingExcludeObj = false;
              outgoingExcludeObj = false;

              obj = new Object();
              obj.protocol= 1;//TCP
              obj.incomingPorts = incomingPorts;
              obj.incomingPortStart = incomingPortStart;
              if(incomingExcludeObj == false)
                obj.incomingPortEnd = incomingPortEnd;
              obj.incomingExclude = incomingExclude;
              obj.outgoingPorts = outgoingPortsArr[i];
              obj.outgoingPortStart = outgoingPortStartArr[i];
              if(outgoingExcludeObj == false)
                obj.outgoingPortEnd = outgoingPortEndArr[i];
              obj.outgoingExclude = outgoingExclude;
              newPF.protocols.push(obj);
              obj = new Object();
              obj.protocol= 2;//TCP
              obj.incomingPorts = incomingPorts;
              obj.incomingPortStart = incomingPortStart;
              if(incomingExcludeObj == false)
                obj.incomingPortEnd = incomingPortEnd;
              obj.incomingExclude = incomingExclude;
              obj.outgoingPorts = outgoingPortsArr[i];
              obj.outgoingPortStart = outgoingPortStartArr[i];
              if(outgoingExcludeObj == false)
                obj.outgoingPortEnd = outgoingPortEndArr[i];
              obj.outgoingExclude = outgoingExclude;
              newPF.protocols.push(obj);
            }
          } else {
            for(var i = 0; i < outgoingPortsArr.length; i++) {

              incomingExclude = false;
              outgoingExclude = false;
              incomingExcludeObj = false;
              outgoingExcludeObj = false;

              obj = new Object();
              obj.protocol= $scope.pf.protocol.protocol;//TCP
              obj.incomingPorts = incomingPorts;
              obj.incomingPortStart = incomingPortStart;
              if(incomingExcludeObj == false)
                obj.incomingPortEnd = incomingPortEnd;
              obj.incomingExclude = incomingExclude;
              obj.outgoingPorts = outgoingPortsArr[i];
              obj.outgoingPortStart = outgoingPortStartArr[i];
              if(outgoingExcludeObj == false)
                obj.outgoingPortEnd = outgoingPortEndArr[i];
              obj.outgoingExclude = outgoingExclude;
              newPF.protocols.push(obj);
            }
          }
        } else if ( 0 <= $scope.appToForward) {
          var app = null;
          for(var i = 0; i < $scope.pfRules.length; i++) {
            if($scope.pfRules[i].id == $scope.appToForward) {
              app = $scope.pfRules[i];
              break;
            }
          }
          if(app!=null) {
            newPF.protocols = app.protocols;
            newPF.name = escape(app.name).replace(/\+/g,'%2B');
          }
        }

        if (!$scope.showAdvanced) {
          newPF.servicePort = 0;
          newPF.schedule = "Always";
        } else { // Advanced settings
          newPF.schedule = $scope.pf.schedule;
          newPF.schedule = escape(newPF.schedule).replace(/\+/g,'%2B');
          newPF.servicePort = $scope.pf.servicePortType == 0 ? 0 : parseInt($scope.pf.servicePort);
        }
        PortForward.save(newPF, function() {
          $scope.refresh();
        });
        $scope.reset();
      };
      $scope.remove = function() {
        var toRemove = [];
        for (var i = 0; i < $scope.portForward.length; i++) {
          if ($scope.removeBox[i])
            toRemove.push($scope.portForward[i].id);
        }
        if(toRemove.length > 0){
          for (var i = 0; i < toRemove.length; i++) {
            //Subtract i since removing previous lowers order for following entries
            //TODO: change delete call to accept an array of items to delete
            toRemove[i] = toRemove[i] - i;
          }
          $scope.removeListItems(toRemove);
        }
        $scope.removeBox = [];
        for (var i = 0; i < $scope.portForward.length; i++) {
          $scope.removeBox.push(false);
        }
      };

      $scope.removeListItems = function(toRemove){
        if(toRemove.length > 0){
          PortForward.remove({id: toRemove[i]}, function() {
            toRemove.splice(0,1);
            $scope.removeListItems(toRemove);
          });
        }else{
          $scope.hasPrevValue = true;
          $scope.refresh();
        }
      }

      $scope.filterFn = function(obj){
        if(/^PortForward\_.*$/.test(obj.name)) {
          return false;
        }
        return true;
      }
    }])
  .controller('PortTriggerCtrl', ['$scope', '$route', 'PortTrigger', '$location',
    function($scope, $route, PortTrigger, $location) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      /* temporary variables that should only be init once */
      $scope.pageToShow = 0;
      $scope.protNameArr = ["Other", "TCP", "UDP", "ICMP", "GRE", "ESP", "AH"];
      $scope.prot = 0;
      $scope.incoming = false; // false == outgoing, true = incoming
      $scope.runFocus = false;
      $scope.initVars = function() {
        /* temporary objects */
        init_services($scope);
        $scope.tempTrigger = {
          enabled: true,
          name: "Application",
          outgoing: [],
          incoming: []
        };

        $scope.editing = -1;
      };

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.setPrintArr = function(type) {
        $scope.printOutArr = [];
        $scope.printInArr = [];
        switch(type) {
          case 3:
            printProtocol(3, $scope.portTrigger, $scope.printOutArr, $scope.printInArr);
            break;
          case 2:
            printProtocol(2, $scope.tempTrigger.outgoing, $scope.printOutArr);
            printProtocol(2, $scope.tempTrigger.incoming, $scope.printInArr);
            break;
        }
      };

      $scope.refresh = function() {
        $scope.portTrigger = PortTrigger.query(function() {
          $scope.active = [];
          for(var i = 0; i < $scope.portTrigger.length; i++) {
            $scope.active.push($scope.portTrigger[i].enabled);
          }
          $scope.setPrintArr(3);
          $scope.initVars();
        });
      }
      $scope.refresh();

      $scope.save = function() {
        var changed = 0;
        var finished = 0;
        for(var i = 0; i < $scope.portTrigger.length; i++) {
          if($scope.active[i] != $scope.portTrigger[i].active) {
            changed++;
            PortTrigger.update({id: $scope.portTrigger[i].id}, {enabled: $scope.active[i]}, function() {
              finished++;
              if(finished==changed)
                $scope.refresh();
            });        
          }
        }
      }

      /* START: Functions */
      $scope.togglePage = function(num) {
        $scope.pageToShow = num;
        if (3 == num) {
          $scope.setPrintArr(2);
        } else if (4 == num)
          $scope.incoming = false;
        else if (5 == num)
          $scope.incoming = true;
        $scope.prot = 0;
        window.scrollTo(0,0);
      };
      /* APPLY */
      $scope.applyTrigger = function() {
        $scope.errorMessages = [];

        var newPortTrigger = {
          outgoing: [],
          incoming: []
        };
        copyTrigger(newPortTrigger, $scope.tempTrigger);
        if(newPortTrigger.name == ''){
          $scope.errorMessages.push("Service Name: A name must be specified.");
        }else if(!/^[0-9A-Z\!\-\_]+$/i.test(newPortTrigger.name))
          $scope.errorMessages.push("Service Name: Rule name should consist of standard characters only (ASCII 32-126) excluding the special character space and any of :@\"|\\/=+<>()[]{}&%^$*?,;");
        if(newPortTrigger.outgoing.length == 0)
          $scope.errorMessages.push("Server Ports: At least one server ports entry must be defined.");
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        if (-1 === $scope.editing) {
          PortTrigger.save(newPortTrigger, function() {
            $scope.refresh();
          });

        } else {
          PortTrigger.update({id: $scope.portTrigger[$scope.editing].id}, newPortTrigger, function() {
            $scope.refresh();
          });
        }

        $scope.initVars();
        $scope.togglePage(0);
      };
      $scope.applyProtocol = function() {
        $scope.runFocus = true;
        $scope.errorMessages = [];
        $scope.protocols.protocol = parseInt($scope.protocols.protocol);
        $scope.protocols.incomingPorts = parseInt($scope.protocols.incomingPorts);
        $scope.protocols.outgoingPorts = parseInt($scope.protocols.outgoingPorts);
        $scope.protocols.icmpMessage = parseInt($scope.protocols.icmpMessage);
        $scope.protocols.protocolNumber = parseInt($scope.protocols.protocolNumber);
        var sstart = $scope.protocols.incomingPortStart;
        var send = $scope.protocols.incomingPortEnd;
        var dstart = $scope.protocols.outgoingPortStart;
        var dend = $scope.protocols.outgoingPortEnd;
        switch($scope.protocols.protocol) {
          case 0: {
            var pro = $scope.protocols.protocolNumber;
            if(pro == null || pro === '' || isNaN(pro) || pro < 0 || pro > 255)
              $scope.errorMessages.push("Protocol Number: Please enter a numeric value between 0 and 255.");
          }
            break;
          case 1:
          case 2: {
            switch($scope.protocols.incomingPorts) {
              case 1: {
                if(sstart == null || sstart === '' || sstart < 1 || sstart > 65535)
                  $scope.errorMessages.push("Source Port: Please enter a numeric value between 1 and 65535.");
              }
                break;
              case 2: {
                if(sstart == null || sstart === '' || sstart < 1 || sstart > 65535)
                  $scope.errorMessages.push("Start Source Port: Please enter a numeric value between 1 and 65535.");
                if(send == null || send === '' || send < 1 || send > 65535)
                  $scope.errorMessages.push("End Source Port: Please enter a numeric value between 1 and 65535.");
                if($scope.errorMessages.length == 0 && sstart >= send)
                  $scope.errorMessages.push("Source Ports: The From value must be lower than the To value in a range of ports (from=" + sstart + ", to=" + send + ").");
              }
                break;
              default:
                break;
            }
            switch($scope.protocols.outgoingPorts) {
              case 1: {
                if(dstart == null || dstart === '' || dstart < 1 || dstart > 65535)
                  $scope.errorMessages.push("Destination Port: Please enter a numeric value between 1 and 65535.");
                if(dstart == 4567 && $scope.protocols.outgoingExclude == false && $scope.protocols.protocol == 1){
                  $scope.errorMessages.push("Invalid rule: Port 4567 cannot be blocked");
                }
              }
                break;
              case 2: {
                if(dstart == null || dstart === '' || dstart < 1 || dstart > 65535)
                  $scope.errorMessages.push("Start Destination Port: Please enter a numeric value between 1 and 65535.");
                if(dend == null || dend === '' || dend < 1 || dend > 65535)
                  $scope.errorMessages.push("End Destination Port: Please enter a numeric value between 1 and 65535.");
                if($scope.errorMessages.length == 0 && dstart >= dend)
                  $scope.errorMessages.push("Destination Ports: The From value must be lower than the To value in a range of ports (from=" + dstart + ", to=" + dend + ").");
              }
                break;
              default:
                break;
            }
          }
            break;
          case 3: {
            if($scope.protocols.icmpMessage == 10) {
              var t = $scope.protocols.icmpType;
              var c = $scope.protocols.icmpCode;
              if(t == null || t === '' || t < 0 || t > 255)
                $scope.errorMessages.push("ICMP Type:  Please enter a numeric value between 0 and 255.");
              if(c == null || c === '' || c < 0 || c > 255)
                $scope.errorMessages.push("ICMP Code:  Please enter a numeric value between 0 and 255.");
            }
          }
            break;
          default:
            break;
        }

        if($scope.errorMessages.length == 0){
          if($scope.protocols.incomingPorts == 0){
            $scope.protocols.incomingExclude = false;
          }
          if($scope.protocols.outgoingPorts == 0){
            $scope.protocols.outgoingExclude = false;
          }
          if($scope.protocols.protocol == 1 || $scope.protocols.protocol == 2){
            var sourceNotValid = false;
            var destNotValid = false;
            if($scope.protocols.incomingPorts == 0) {
              sourceNotValid = true;
            }else if($scope.protocols.incomingPorts == 2 && $scope.protocols.incomingExclude == false){
              if(sstart == 1 && send == 65535){
                sourceNotValid = true;
              }
            }
            if($scope.protocols.outgoingPorts == 0) {
              destNotValid = true;
            }else if($scope.protocols.outgoingPorts == 2 && $scope.protocols.outgoingExclude == false){
              if(dstart == 1 && dend == 65535){
                destNotValid = true;
              }
            }
            if(sourceNotValid && destNotValid){
              $scope.errorMessages.push('Port forwarding rules can not be Any-to-Any (or "source: 1-65535" with "destination: 1-65535").');
            }
          }
        }

        var newPortTrigger = {
          outgoing: [],
          incoming: []
        };
        copyTrigger(newPortTrigger, $scope.tempTrigger);

        var protocolTypeStr = "";
        var portCompareStr = "";
        var portStr = "";
        var hasRange = false;
        var hasRangeCompare = false;
        var dend;
        var dstart;
        var dendCompare;
        var dstartCompare;
        var hasMsg = false;
        var sportCompareStr = "";
        var sportStr = "";
        var shasRange = false;
        var shasRangeCompare = false;
        var send;
        var sstart;
        var sendCompare;
        var sstartCompare;
        var shasMsg = false;
        if($scope.protocols.protocol == 1 || $scope.protocols.protocol == 2){
          if($scope.protocols.protocol == 1){
            protocolTypeStr = "TCP";
          }else if($scope.protocols.protocol == 2){
            protocolTypeStr = "UDP";
          }
          send = $scope.protocols.incomingPortEnd;
          sstart = $scope.protocols.incomingPortStart;
          dend = $scope.protocols.outgoingPortEnd;
          dstart = $scope.protocols.outgoingPortStart;
          if($scope.protocols.incomingPorts == 2){
            shasRange = true;
          }else{
            shasRange = false;
          }
          if($scope.protocols.outgoingPorts == 2){
            hasRange = true;
          }else{
            hasRange = false;
          }
          var tempInOutArray;
          if($scope.incoming == false){
            tempInOutArray = newPortTrigger.outgoing;
          }else{
            tempInOutArray = newPortTrigger.incoming;
          }
          for(var j = 0; j < tempInOutArray.length; j ++){
            if($scope.protocols.protocol == tempInOutArray[j].protocol && $scope.tempIndex != j){
              sendCompare = tempInOutArray[j].incomingPortEnd;
              sstartCompare = tempInOutArray[j].incomingPortStart;
              if(sendCompare == null || sendCompare === ''){
                shasRangeCompare = false;
              }else{
                shasRangeCompare = true;
              }
              shasMsg = false;
              if(shasRange){
                if(shasRangeCompare){
                  if(Number(sstart) >= Number(sstartCompare) && Number(sstart) <= Number(sendCompare)){
                    sportCompareStr = sstartCompare + "-" + sendCompare;
                    sportStr = sstart + "-" + send;
                    shasMsg = true;
                  }else if(Number(send) >= Number(sstartCompare) && Number(send) <= Number(sendCompare)){
                    sportCompareStr = sstartCompare + "-" + sendCompare;
                    sportStr = sstart + "-" + send;
                    shasMsg = true;
                  }else if(Number(sstartCompare) >= Number(sstart) && Number(sstartCompare) <= Number(send)){
                    sportCompareStr = sstartCompare + "-" + sendCompare;
                    sportStr = sstart + "-" + send;
                    shasMsg = true;
                  }else if(Number(sendCompare) >= Number(sstart) && Number(sendCompare) <= Number(send)){
                    sportCompareStr = sstartCompare + "-" + sendCompare;
                    sportStr = sstart + "-" + send;
                    shasMsg = true;
                  }
                }else{
                  if(Number(sstartCompare) >= Number(sstart) && Number(sstartCompare) <= Number(send)){
                    sportCompareStr = sstartCompare;
                    sportStr = sstart + "-" + send;
                    shasMsg = true;
                  }
                }
              }else{
                if(shasRangeCompare){
                  if(Number(sstart) >= Number(sstartCompare) && Number(sstart) <= Number(sendCompare)){
                    sportCompareStr = sstartCompare + "-" + sendCompare;
                    sportStr = dstart;
                    shasMsg = true;
                  }
                }else{
                  if(Number(sstart) == Number(sstartCompare)){
                    sportCompareStr = sstartCompare;
                    sportStr = sstart;
                    shasMsg = true;
                  }
                }
              }
              if(shasMsg){
                $scope.errorMessages.push("Overlapping Port Ranges: The " + protocolTypeStr + " source ports (" + sportStr + ") is overlapping with already defined " + protocolTypeStr + " source ports (" + sportCompareStr + ").");
                break;
              }
            }
          }
          for(var j = 0; j < tempInOutArray.length; j ++){
            if($scope.protocols.protocol == tempInOutArray[j].protocol && $scope.tempIndex != j){
              dendCompare = tempInOutArray[j].outgoingPortEnd;
              dstartCompare = tempInOutArray[j].outgoingPortStart;
              if(dendCompare == null || dendCompare === ''){
                hasRangeCompare = false;
              }else{
                hasRangeCompare = true;
              }
              hasMsg = false;
              if(hasRange){
                if(hasRangeCompare){
                  if(Number(dstart) >= Number(dstartCompare) && Number(dstart) <= Number(dendCompare)){
                    portCompareStr = dstartCompare + "-" + dendCompare;
                    portStr = dstart + "-" + dend;
                    hasMsg = true;
                  }else if(Number(dend) >= Number(dstartCompare) && Number(dend) <= Number(dendCompare)){
                    portCompareStr = dstartCompare + "-" + dendCompare;
                    portStr = dstart + "-" + dend;
                    hasMsg = true;
                  }else if(Number(dstartCompare) >= Number(dstart) && Number(dstartCompare) <= Number(dend)){
                    portCompareStr = dstartCompare + "-" + dendCompare;
                    portStr = dstart + "-" + dend;
                    hasMsg = true;
                  }else if(Number(dendCompare) >= Number(dstart) && Number(dendCompare) <= Number(dend)){
                    portCompareStr = dstartCompare + "-" + dendCompare;
                    portStr = dstart + "-" + dend;
                    hasMsg = true;
                  }
                }else{
                  if(Number(dstartCompare) >= Number(dstart) && Number(dstartCompare) <= Number(dend)){
                    portCompareStr = dstartCompare;
                    portStr = dstart + "-" + dend;
                    hasMsg = true;
                  }
                }
              }else{
                if(hasRangeCompare){
                  if(Number(dstart) >= Number(dstartCompare) && Number(dstart) <= Number(dendCompare)){
                    portCompareStr = dstartCompare + "-" + dendCompare;
                    portStr = dstart;
                    hasMsg = true;
                  }
                }else{
                  if(Number(dstart) == Number(dstartCompare)){
                    portCompareStr = dstartCompare;
                    portStr = dstart;
                    hasMsg = true;
                  }
                }
              }
              if(hasMsg){
                $scope.errorMessages.push("Overlapping Port Ranges: The " + protocolTypeStr + " destination ports (" + portStr + ") is overlapping with already defined " + protocolTypeStr + " destination ports (" + portCompareStr + ").");
                break;
              }
            }
          }
        }

        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.protocols.icmpType = parseInt($scope.protocols.icmpType);
        $scope.protocols.icmpCode = parseInt($scope.protocols.icmpCode);
        if (!$scope.incoming)
          applyProtocol($scope, $scope.tempTrigger.outgoing);
        else
          applyProtocol($scope, $scope.tempTrigger.incoming);
      };
      /* CANCEL */
      $scope.cancelTrigger = function() {
        $scope.refresh();
        $scope.togglePage(0);
      };
      $scope.cancelProtocol = function() {
        cancelProtocol($scope);
      };
      /* EDIT */
      $scope.editTrigger = function(index) {
        $scope.editing = index;
        $scope.tempTrigger = {
          enabled: $scope.portTrigger[index].enabled,
          name: $scope.portTrigger[index].name,
          outgoing: [],
          incoming: []
        };
        copyTrigger($scope.tempTrigger, $scope.portTrigger[index]);
        $scope.togglePage(3);
      };
      $scope.editOutgoingProtocol = function(index) {
        editProtocol($scope, index, $scope.tempTrigger.outgoing);
        $scope.incoming = false;
        $scope.tempIndex = index;
      };
      $scope.editIncomingProtocol = function(index) {
        editProtocol($scope, index, $scope.tempTrigger.incoming,5);
        $scope.incoming = true;
        $scope.tempIndex = index;
      };
      /* REMOVE */
      $scope.removeTrigger = function(index) {
        PortTrigger.remove({id: $scope.portTrigger[index].id}, function() {
          $scope.refresh();
        });
      };
      $scope.removeOutgoingProtocol = function(index) {
        removeObject($scope.tempTrigger.outgoing, index);
      };
      $scope.removeIncomingProtocol = function(index) {
        removeObject($scope.tempTrigger.incoming, index);
      };

      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/firewall/porttrigger'){
            if (($scope.pageToShow == 4 || $scope.pageToShow == 5) && !$scope.showErrorPage){
              $scope.applyProtocol();
            }else if($scope.pageToShow == 3 && !$scope.showErrorPage){
              $scope.applyTrigger();
            }else if ($scope.pageToShow == 0){
              $scope.save();
            }
          }
        }
      };

      /* END: Functions */

    }])
  .controller('RemoteAdminCtrl', ['$scope', '$route', '$routeParams', '$location', 'RemoteAdmin', 'SystemSettings',
    function($scope, $route, $routeParams, $location, RemoteAdmin, SystemSettings) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.sysSettings = SystemSettings.get();
      $scope.remAdmin = RemoteAdmin.get();
      
      $scope.fromString = '?from=fw';
      $scope.prev = '';
      $scope.oldFrom = '';
      $scope.back = '/firewall'
      if($routeParams.from != null) {
        $scope.fromString = '?from=' + $routeParams.from + '-fw';
        $scope.back = '/advanced/settings';
        var back = $routeParams.from.split('-');
        var oldFrom = '';
        for(var i = 0; i < back.length-1; i++) {
          if(i != 0)
            oldFrom += '-';
          oldFrom += back[i];
        }
        if(oldFrom !== '')
          $scope.prev = '?from=' + oldFrom;
      } else {
        $scope.back = '/firewall';
      }
      $scope.save = function() {
        $scope.remAdmin.$update(function(){
          if($scope.oldFrom == '')
            location.reload();
          else
            $location.path($scope.back).search({from: $scope.oldFrom});
        });
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/firewall/remoteadmin'){
            $scope.save();
          }
        }
      };

    }])
  .controller('StaticNATCtrl', ['$scope', '$route', 'StaticNAT', 'Devices', 'PortForwardRules', '$location',
    function($scope, $route, StaticNAT, Devices, PortForwardRules, $location) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.showErrorPage = false;
      $scope.runFocus = false;

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      /* temporary variables that should only be init once */
      $scope.pageToShow = 0;
      $scope.prot = -2;
      $scope.initVars = function() {
        /* temporary objects */
        init_services($scope);
        $scope.statNat = {
          localHost: -1,
          host: '192.168.1.0',
          publicIp: splitIpArr("0.0.0.0"),
          portForwarding: false,
          services: []
        };

        $scope.editing = -1;
        $scope.checkEdit = -1;
      };
      $scope.initVars();

      $scope.setPrintArr = function(type) {
        $scope.printProtArr = [];
        switch(type) {
          case 1:
            printProtocol(1, $scope.statNat.services, $scope.printProtArr);
            break;
        }
      };

      $scope.devices = Devices.query(function() {
          $scope.devices = filterOutStb($scope.devices);
          $scope.devices = filterOutGuest($scope.devices);
        }
      );

      $scope.save = function() {
        var changed = 0;
        var finished = 0;
        for(var i = 0; i < $scope.staticNAT.length; i++) {
          if($scope.enabled[i] != $scope.staticNAT[i].active) {
            changed++;
            StaticNAT.update({id: $scope.staticNAT[i].id}, {active: $scope.enabled[i]}, function() {
              finished++;
              if(finished==changed)
                $scope.refresh();
            });        
          }
        }
      };
      $scope.togglePage = function(num) {
        $scope.runFocus = true;
        $scope.pageName = "Add";
        $scope.pageToShow = num;
        if (1 == num) {
          $scope.prot = -2;
          $scope.setPrintArr(1);
        }
        window.scrollTo(0,0);
      };

      /* START: Main */
      $scope.saveRule = function() {
        $scope.errorMessages = [];
        var ipVal = $scope.statNat.host.split('.');
        if($scope.statNat.localHost == -1) {
          if(!validateIpDomain($scope.statNat.host) || !validateIp(ipVal))
            $scope.errorMessages.push("Local Host: The value must be a valid IP address.");
        }
        if(!validateIp($scope.statNat.publicIp))
          $scope.errorMessages.push("Public IP Address: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
        else if($scope.statNat.publicIp[0] >= 240)
          $scope.errorMessages.push("Public IP Address: IP Address must be within the range of 0.0.0.0 to 239.255.255.255.");
        else {
          var ip = getIpString($scope.statNat.publicIp);
          if('0.0.0.0' === ip)
            $scope.errorMessages.push("NAT/NAPT configuration: IP conflicts between this rule and previous NAT/NAPT rules");
          else {
            for(var i = 0; i < $scope.staticNAT.length; i++) {
              if($scope.checkEdit == i)
                continue;
              if($scope.staticNAT[i].publicIp === ip) {
                $scope.errorMessages.push("NAT/NAPT configuration: IP conflicts between this rule and previous NAT/NAPT rules");
                break;
              }
            }
          }
        }
        if($scope.errorMessages.length>0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        if($scope.statNat.localHost != -1)
          $scope.statNat.host = $scope.statNat.localHost;
        var tempStaticNat = {
          host: $scope.statNat.host,
          publicIp: getIpString($scope.statNat.publicIp),
          portForwarding: $scope.statNat.portForwarding,
          services: [],
          active: true
        };
        if (-1 == $scope.statNat.localHost) {
          tempStaticNat.host = $scope.statNat.host;
        } else {
          for(var i = 0; i < $scope.devices.length; i++)
            if($scope.statNat.localHost == $scope.devices[i].id)
              tempStaticNat.host = $scope.devices[i].ipAddress;
        }
        copyServices(tempStaticNat.services, $scope.statNat.services);
        if(tempStaticNat.services.length > 0){
          for(var i = 0; i < tempStaticNat.services.length; i++) {
            for(var j = 0; j < $scope.pfRulesCopy.length; j++) {
              if(tempStaticNat.services[i].name == $scope.pfRulesCopy[j].name) {
                tempStaticNat.services[i].id = $scope.pfRulesCopy[j].id;
                tempStaticNat.services[i].serviceType = $scope.pfRulesCopy[j].serviceType;
              }
            }
          }
        }
        if(!tempStaticNat.portForwarding)
          tempStaticNat.services = [];
        for(var i = 0; i < tempStaticNat.services.length; i++) {
          tempStaticNat.services[i].name = escape(tempStaticNat.services[i].name).replace(/\+/g,'%2B');
        }
        if ($scope.checkEdit != -1){
          StaticNAT.update({id: $scope.staticNAT[$scope.checkEdit].id}, tempStaticNat, function() {
            $scope.refresh();
          });
        }else{
          StaticNAT.save(tempStaticNat, function() {
            $scope.refresh();
          });
        }

        $scope.initVars();
        $scope.togglePage(0);
      };
      $scope.refresh = function() {
        $scope.staticNAT = StaticNAT.query(function() {
          $scope.enabled = [];
          for(var i = 0; i < $scope.staticNAT.length; i++) {
            $scope.enabled.push($scope.staticNAT[i].active);
            for(var j = 0; j < $scope.staticNAT[i].services.length; j++) {
              $scope.staticNAT[i].services[j].name = unescape($scope.staticNAT[i].services[j].name);
              $scope.staticNAT[i].services[j].description = unescape($scope.staticNAT[i].services[j].description);
            }
          }
        });
        $scope.pfRules = PortForwardRules.query(function() {
          $scope.pfRules = sortListItems($scope.pfRules);
          $scope.pfRulesCopy = copyArrayFromSource($scope.pfRules);
        });
      }
      $scope.cancelRule = function() {
        $scope.refresh();
        $scope.initVars();
        $scope.togglePage(0);
      };
      $scope.editRule = function(index) {
        $scope.statNat = {
          localHost: -1,
          host: $scope.staticNAT[index].host,
          publicIp: splitIpArr($scope.staticNAT[index].publicIp),
          portForwarding: $scope.staticNAT[index].portForwarding,
          services: []
        };
        copyServices($scope.statNat.services, $scope.staticNAT[index].services);
        for(var i = 0; i < $scope.statNat.services.length; i++) {
          $scope.statNat.services[i].displayName = $scope.statNat.services[i].name;
          if($scope.statNat.services[i].description && $scope.statNat.services[i].description.length > 0)
           $scope.statNat.services[i].displayName += " - " + $scope.statNat.services[i].description;

          for(var j = 0; j < $scope.pfRules.length; j++) {
            if($scope.statNat.services[i].name == $scope.pfRules[j].name) {
              $scope.statNat.services[i].id = $scope.pfRules[j].id;
              $scope.statNat.services[i].serviceType = $scope.pfRules[j].serviceType;
              $scope.pfRules.splice(j,1);
            }
          }
        }
        $scope.editing = index;
        $scope.checkEdit = index;
        $scope.togglePage(1);
        $scope.pageName = "Edit";
      };
      $scope.removeRule = function(index) {
        StaticNAT.remove({id: $scope.staticNAT[index].id}, function() {
          $scope.refresh();
        });
      };
      /* END: Main */

      /* START: Services */
      $scope.ruleChanged = function() {
        if($scope.prot == -2)
          return;
        if($scope.prot == -1) {
          $scope.addService();
          return;
        }
        $scope.addPfProt($scope.findRuleIndex($scope.prot));
      }

      $scope.findRuleIndex = function(id){
        for(var i = 0; i < $scope.pfRules.length; i ++){
          if($scope.pfRules[i].id == id){
            return i;
          }
        }
      }

      $scope.filterFn = function(obj){
        if(/^PortForward\_.*$/.test(obj.name)) {
          return false;
        }
        return true;
      }

      $scope.addPfProt = function(index) {
        var tmpServ = {
          name: "",
          type: 2,
          protocols: []
        };
        copyService(tmpServ, $scope.pfRules[index]);
        tmpServ.displayName = $scope.pfRules[index].name;
        tmpServ.id = $scope.pfRules[index].id;
        tmpServ.serviceType = $scope.pfRules[index].serviceType;
        if($scope.pfRules[index].description && $scope.pfRules[index].description.length > 0)
          tmpServ.displayName += " - " + $scope.pfRules[index].description;
        $scope.statNat.services.push(tmpServ);

        $scope.setPrintArr(1);
        $scope.prot = -2;
        var tempArr = [];
        for(var i = 0; i < $scope.pfRules.length; i++) {
          if(tmpServ.id != $scope.pfRules[i].id) {
            tempArr.push($scope.pfRules[i]);
          }
        }
        $scope.pfRules = tempArr;
      };

      $scope.applyPortForwardRule = function() {
        $scope.errorMessages = [];
        if($scope.service.name == '')
          $scope.errorMessages.push("Service Name: A name must be specified.");
        else if(!/^[0-9A-Z\!\-\_]+$/i.test($scope.service.name))
          $scope.errorMessages.push("Service Name: Rule name should consist of standard characters only (ASCII 32-126) excluding the special character space and any of :@\"|\\/=+<>()[]{}&%^$*?,;")
        for(var i = 0; i < $scope.pfRules.length; i++) {
          if(i != $scope.editing && $scope.pfRules[i].name == $scope.service.name)
            $scope.errorMessages.push("Service Name: This name is already used by another protocol.");
        }
        if($scope.service.protocols.length == 0)
          $scope.errorMessages.push("Server Ports: At least one server ports entry must be defined.")
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        applyService($scope, $scope.statNat.services);
        for(var i = 0; i < $scope.statNat.services.length; i++) {
          $scope.statNat.services[i].displayName = $scope.statNat.services[i].name;
          if($scope.statNat.services[i].description && $scope.statNat.services[i].description.length > 0)
           $scope.statNat.services[i].displayName += " - " + $scope.statNat.services[i].description;
        }
        $scope.setPrintArr(1);
        $scope.togglePage(1);
      };
      $scope.cancelPortForwardRule = function() {
        cancelService($scope);
        $scope.togglePage(1);
      };
      $scope.addService = function() {
        $scope.editing = -1;
        $scope.togglePage(3);
      }
      $scope.editService = function(index) {
        $scope.editing = index;
        editService($scope, $scope.statNat.services, index);
      };
      $scope.removeService = function(index) {
        for(var i = 0; i < $scope.pfRulesCopy.length; i++) {
          if($scope.pfRulesCopy[i].id == $scope.statNat.services[index].id) {
            $scope.pfRules.push($scope.pfRulesCopy[i]);
            break;
          }
        }
        $scope.pfRules = sortListItems($scope.pfRules);
        removeObject($scope.statNat.services, index);
      };

      $scope.applyProtocol = function() {
        $scope.errorMessages = [];

        $scope.protocols.protocol = parseInt($scope.protocols.protocol);
        $scope.protocols.incomingPorts = parseInt($scope.protocols.incomingPorts);
        $scope.protocols.outgoingPorts = parseInt($scope.protocols.outgoingPorts);
        $scope.protocols.icmpMessage = parseInt($scope.protocols.icmpMessage);
        $scope.protocols.protocolNumber = parseInt($scope.protocols.protocolNumber);

        var sstart = $scope.protocols.incomingPortStart;
        var send = $scope.protocols.incomingPortEnd;
        var dstart = $scope.protocols.outgoingPortStart;
        var dend = $scope.protocols.outgoingPortEnd;
        switch($scope.protocols.protocol) {
          case 0: {
            var pro = $scope.protocols.protocolNumber;
            if(pro == null || pro === '' || isNaN(pro) || pro < 0 || pro > 255)
              $scope.errorMessages.push("Protocol Number: Please enter a numeric value between 0 and 255.");
          }
            break;
          case 1:
          case 2: {
            switch($scope.protocols.incomingPorts) {
              case 1: {
                if(sstart == null || sstart === '' || sstart < 1 || sstart > 65535)
                  $scope.errorMessages.push("Source Port: Please enter a numeric value between 1 and 65535.");
              }
                break;
              case 2: {
                if(sstart == null || sstart === '' || sstart < 1 || sstart > 65535)
                  $scope.errorMessages.push("Start Source Port: Please enter a numeric value between 1 and 65535.");
                if(send == null || send === '' || send < 1 || send > 65535)
                  $scope.errorMessages.push("End Source Port: Please enter a numeric value between 1 and 65535.");
                if($scope.errorMessages.length == 0 && sstart >= send)
                  $scope.errorMessages.push("Source Ports: The From value must be lower than the To value in a range of ports (from=" + sstart + ", to=" + send + ").");
              }
                break;
              default:
                break;
            }
            switch($scope.protocols.outgoingPorts) {
              case 1: {
                if(dstart == null || dstart === '' || dstart < 1 || dstart > 65535)
                  $scope.errorMessages.push("Destination Port: Please enter a numeric value between 1 and 65535.");
                if(dstart == 4567 && $scope.protocols.outgoingExclude == false && $scope.protocols.protocol == 1){
                  $scope.errorMessages.push("Invalid rule: Port 4567 cannot be blocked");
                }
              }
                break;
              case 2: {
                if(dstart == null || dstart === '' || dstart < 1 || dstart > 65535)
                  $scope.errorMessages.push("Start Destination Port: Please enter a numeric value between 1 and 65535.");
                if(dend == null || dend === '' || dend < 1 || dend > 65535)
                  $scope.errorMessages.push("End Destination Port: Please enter a numeric value between 1 and 65535.");
                if($scope.errorMessages.length == 0 && dstart >= dend)
                  $scope.errorMessages.push("Destination Ports: The From value must be lower than the To value in a range of ports (from=" + dstart + ", to=" + dend + ").");
              }
                break;
              default:
                break;
            }
          }
            break;
          case 3: {
            if($scope.protocols.icmpMessage == 10) {
              var t = $scope.protocols.icmpType;
              var c = $scope.protocols.icmpCode;
              if(t == null || t === '' || t < 0 || t > 255)
                $scope.errorMessages.push("ICMP Type:  Please enter a numeric value between 0 and 255.");
              if(c == null || c === '' || c < 0 || c > 255)
                $scope.errorMessages.push("ICMP Code:  Please enter a numeric value between 0 and 255.");
            }
          }
            break;
          default:
            break;
        }
        if($scope.errorMessages.length == 0){
          if($scope.protocols.incomingPorts == 0){
            $scope.protocols.incomingExclude = false;
          }
          if($scope.protocols.outgoingPorts == 0){
            $scope.protocols.outgoingExclude = false;
          }
          if($scope.protocols.protocol == 1 || $scope.protocols.protocol == 2){
            var sourceNotValid = false;
            var destNotValid = false;
            if($scope.protocols.incomingPorts == 0) {
              sourceNotValid = true;
            }else if($scope.protocols.incomingPorts == 2 && $scope.protocols.incomingExclude == false){
              if(sstart == 1 && send == 65535){
                sourceNotValid = true;
              }
            }
            if($scope.protocols.outgoingPorts == 0) {
              destNotValid = true;
            }else if($scope.protocols.outgoingPorts == 2 && $scope.protocols.outgoingExclude == false){
              if(dstart == 1 && dend == 65535){
                destNotValid = true;
              }
            }
            if(sourceNotValid && destNotValid){
              $scope.errorMessages.push('Port forwarding rules can not be Any-to-Any (or "source: 1-65535" with "destination: 1-65535").');
            }
          }
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        applyProtocol($scope, $scope.service.protocols);
      };
      $scope.cancelProtocol = function() {
        cancelProtocol($scope);
        $scope.togglePage(3);
      };
      $scope.editProtocol = function(index) {
        editProtocol($scope, index, $scope.service.protocols);
      };
      $scope.removeProtocol = function(index) {
        removeObject($scope.service.protocols, index, 2, $scope);
      };

      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/firewall/staticnat'){
            if (0 == $scope.pageToShow && !$scope.showErrorPage){
              $scope.save();
            }else if (1 == $scope.pageToShow && !$scope.showErrorPage){
              $scope.saveRule();
            }else if ($scope.pageToShow == 3 && !$scope.showErrorPage){
              $scope.applyPortForwardRule();
            }else if($scope.pageToShow == 4 && !$scope.showErrorPage){
              $scope.applyProtocol();
            }
          }
        }
      };
      /* END: Services */
      $scope.refresh();
    }])
  .controller('FirewallSecurityLogCtrl', ['$scope', '$route', '$http', 'SecuritySettings', 'SecurityCsv', 'SecurityHazard', 'Log', '$location',
    function($scope, $route, $http, SecuritySettings, SecurityCsv, SecurityHazard, Log, $location) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      // 0 = securityLog, 1 = securityHazard, 2 = securitySettings
      $scope.showSettings = 0;
      $scope.FDisplayNum =50;

      $scope.securitySettings = SecuritySettings.get();
      $scope.enableLogging = systemSettings.enableLogging;
      setupLoggingCtrl($scope, 1, $http, Log);

      $scope.loadMore = function(max) {
        $scope.FDisplayNum += 50;
      }

      $scope.clearSecLog = function() {
        $scope.clearLog();
        $scope.showSettings = 0;
      }

      $scope.clearLogScreen = function() {
        if(systemSettings.warnBeforeChanges)
          $scope.showSettings = 3
        else
          $scope.clearLog();
      }
      $scope.getTime = function(time) {
        return moment.unix(time).format("MMM DD HH:mm:ss YYYY");
      };

      $scope.save = function(){
        $scope.securitySettings.$update(function(){
          $scope.showSettings = 0;
          $scope.securitySettings = SecuritySettings.get();
        });
      };
      $scope.togglePage = function(num){
        if(num == 0)
          $scope.securitySettings = SecuritySettings.get();
        $scope.showSettings = num;
        window.scrollTo(0,0);
      };
      $scope.markViewed = function(){
        SecurityHazard.update(function() {
          location.reload();
        });
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/firewall/log'){
            $location.path('/firewall');
          }
        }
      };
    }])
  .controller('dmzHostCtrl', ['$scope', '$route', 'securityTips', 'FirewallDMZ', '$location', 'NetworkConnections','PortForward',
    function($scope, $route, securityTips, FirewallDMZ, $location, NetworkConnections, PortForward) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.portForwardingDisabled = false;
      $scope.ipAddrDisabled = [false,false,false,false];
      $scope.subNetID = [];

      $scope.refresh = function() {
        $scope.connection = NetworkConnections.get({id: 0}, function() {
          $scope.dmz = FirewallDMZ.get(function() {
            $scope.listOfNetworkIPAddress = [];
            var tempObject = new Object();
            tempObject.id = $scope.connection.connectionId;
            tempObject.ip = $scope.connection.ipAddress;
            tempObject.name = unescape($scope.connection.name);
            $scope.listOfNetworkIPAddress.push(tempObject);
            $scope.subNetID = splitIpArr($scope.connection.subnetMask);
            for(var iCnt=0; iCnt < $scope.subNetID.length; iCnt++){
              if($scope.subNetID[iCnt] == '255' || parseInt($scope.subNetID[iCnt]) == 255)
                $scope.ipAddrDisabled[iCnt] = true;
              else
                $scope.ipAddrDisabled[iCnt] = false;
            }
            if($scope.dmz.ip == "" || $scope.dmz.ip == "0.0.0.0"){
              $scope.ipAddr = splitIpArr(angular.copy($scope.connection.ipAddress));

              $scope.ipAddr[3] = "";
            }else{
              $scope.ipAddr = splitIpArr($scope.dmz.ip);
            }
            $scope.enabled = $scope.dmz.enabled;
          });
          $scope.portForward = PortForward.query();
        });
      }
      $scope.refresh();

      $scope.toggleOnOff = function(){
        $scope.enabled = !$scope.enabled;
      };

      $scope.save = function(){
        var tempObj = new Object();
        tempObj.enabled = $scope.enabled;
        if(tempObj.enabled){
          tempObj.ip = getIpString($scope.ipAddr);
        }
        FirewallDMZ.update(tempObj, function() {
          $scope.refresh();
        });
      };

      $scope.checkThenSave = function(){
        $scope.errorMessages = [];
        if($scope.enabled){
          if(!validateIp($scope.ipAddr)){
            $scope.errorMessages.push("IP Address: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
          }else{
            var ipAddr0 = splitIpArr($scope.connection.ipAddress);
            var submask0 = splitIpArr($scope.connection.subnetMask);
            if(checkAllNetworks($scope.listOfNetworkIPAddress, $scope.ipAddr, 1)){
              $scope.errorMessages.push("Local IP Address: The FiOS Quantum Gateway's own IP address("+$scope.listOfNetworkIPAddress[0].ip+") cannot be used as a DMZ host");
            }
            if(checkHostVsSubmask($scope.ipAddr, submask0)){
              if(checkBits($scope.ipAddr) == "0"){
                $scope.errorMessages.push("The DMZ Host address must not match the network address of the subnet (.0 if the netmask is 255.255.255.0).");
              }else{
                $scope.errorMessages.push("The DMZ Host address must not match the broadcast address (.255 if the netmask is 255.255.255.0).");
              }
            }
            if(!checkIf2IPAreInTheSameSubnetRange($scope.ipAddr, ipAddr0, submask0)){
              $scope.errorMessages.push("The DMZ Host address must be in the same subnet as the router's LAN address.");
            }
          }
        }
        if($scope.errorMessages.length != 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }

        var portForwardingMsg;
        if($scope.enabled){
           $scope.portForwardingDisabled = false;
           if(checkPortForwarding($scope.portForward,$scope.ipAddr)){
             $scope.portForwardingDisabled = true;
             portForwardingMsg = "The device with IP address "+getNumIpString($scope.ipAddr)+" has an existing port forwarding rule. That port forwarding rule will become redundant with DMZ Host enabled for that IP address.";
           }
        }

        if($scope.enabled && $scope.portForwardingDisabled){
          securityTips.showDmzSaving('', portForwardingMsg,
            ['']).then(function (result) {
              if (result == 'cancel') {
              }else{
                $scope.save();
              }
            }
          );
        }else if($scope.enabled){
            securityTips.showDmzSaving1('',
                    ['']).then(function (result) {
                    if (result == 'cancel') {
                    }else{
                        $scope.save();
                    }
                }
            );
        }else{
          $scope.save();
        }
      };

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      };

      $scope.cancel = function() {
        window.scrollTo(0,0);
        $location.url('/firewall');
      };
    }]);
