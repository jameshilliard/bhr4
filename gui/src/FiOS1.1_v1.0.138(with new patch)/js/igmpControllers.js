'use strict';

angular.module('igmp.controllers', [])
  .controller('IgmpProxyCtrl', ['$scope', '$route', '$location', 'IGMPProxy',
    function($scope, $route, $location, IGMPProxy) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.showErrorPage = false;

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.igmp = IGMPProxy.get();
      $scope.save = function() {
        $scope.errorMessages = [];
        $scope.igmp.enabled = ('' + $scope.igmp.enabled) === 'true';
        $scope.igmp.fastLeave = ('' + $scope.igmp.fastLeave) === 'true';
        if($scope.igmp.robustness == null || isNaN($scope.igmp.robustness) || $scope.igmp.robustness < 1 || !checksForDecimalNumber($scope.igmp.robustness))
          $scope.errorMessages.push("IGMP Proxy: Invalid IGMP Robustness (>=1)");
        if(isNaN($scope.igmp.queryInterval) || $scope.igmp.queryInterval < 1 || !checksForDecimalNumber($scope.igmp.queryInterval))
          $scope.errorMessages.push("IGMP Proxy: Invalid IGMP Query Interval (>=1)");
        else if(isNaN($scope.igmp.queryResponseInterval) || $scope.igmp.queryResponseInterval < 1 || (parseInt($scope.igmp.queryResponseInterval) >= parseInt($scope.igmp.queryInterval)) || !checksForDecimalNumber($scope.igmp.queryResponseInterval))
          $scope.errorMessages.push("IGMP Proxy: Invalid IGMP Query Response Interval (>=1 and <" + $scope.igmp.queryInterval + ")");
        if(isNaN($scope.igmp.reportInterval) || $scope.igmp.reportInterval < 1 || $scope.igmp.reportInterval > 25 || !checksForDecimalNumber($scope.igmp.reportInterval))
          $scope.errorMessages.push("IGMP Proxy: Invalid IGMP Client Unsolicited Report Interval (>=1 and <=25)");
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0)
          return;
        }
        $scope.igmp.version = parseInt($scope.igmp.version);
        $scope.igmp.robustness = parseInt($scope.igmp.robustness);
        $scope.igmp.queryInterval = parseInt($scope.igmp.queryInterval);
        $scope.igmp.queryResponseInterval = parseInt($scope.igmp.queryResponseInterval);
        $scope.igmp.reportInterval = parseInt($scope.igmp.reportInterval);
        $scope.igmp.$update(function() {
          $location.path("/advanced");
        });
      }
    }])
  .controller('IgmpAclCtrl', ['$scope', '$route', '$location', 'IGMPAcl',
    function($scope, $route, $location, IGMPAcl) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.showErrorPage = false;

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.acl = IGMPAcl.get();
      $scope.whiteListClicked = function() {
        if(!$scope.acl.whiteListEnabled)
          $scope.acl.blackListEnabled = false;
      }
      $scope.blackListClicked = function() {
        if(!$scope.acl.blackListEnabled)
          $scope.acl.whiteListEnabled = false;
      }

      $scope.save = function() {
        $scope.acl.$update();
        IGMPAcl.update({whiteListEnabled: $scope.acl.whiteListEnabled, blackListEnabled: $scope.acl.blackListEnabled}, function() {
          location.reload();
        });
      }

      $scope.saveAddress = function() {
        $scope.errorMessages = [];

        if(!validateMulticastAddr($scope.multicast))
          $scope.errorMessages.push("Multicast Address: The multicast address you input is not valid! It should be from 224.0.0.0 to 239.255.255.255");
        if(!validateSubnetMask($scope.netmask))
          $scope.errorMessages.push("Multicast Address: Subnet mask may not be 0.0.0.0. Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");

        if($scope.errorMessages.length == 0){
          if(!checkSubnetIp($scope.multicast, $scope.netmask)){
            $scope.errorMessages.push("Multicast Address: The subnet definition is invalid.");
          }
          if($scope.editList == 0) {
            if(!checkMulticastVsList($scope.multicast, $scope.acl.whiteList, $scope.editObj, 'ip')){
              $scope.errorMessages.push("Multicast Address: Same multicast address has already put in the filter list!");
            }
          }else{
            if(!checkMulticastVsList($scope.multicast, $scope.acl.blackList, $scope.editObj, 'ip')){
              $scope.errorMessages.push("Multicast Address: Same multicast address has already put in the filter list!");
            }
          }
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.editing = false;
        if($scope.editObj == -1) {
          var newObj = {
            ip: getIpString($scope.multicast),
            netmask: getIpString($scope.netmask)
          }
          if($scope.editList == 0) {
            $scope.acl.whiteList.push(newObj);
            IGMPAcl.update({whiteList:$scope.acl.whiteList});
          } else {
            $scope.acl.blackList.push(newObj);
            IGMPAcl.update({blackList:$scope.acl.blackList});
          }
        } else {
          if($scope.editList == 0) {
            $scope.acl.whiteList[$scope.editObj].ip = getIpString($scope.multicast);
            $scope.acl.whiteList[$scope.editObj].netmask = getIpString($scope.netmask);
            IGMPAcl.update({whiteList:$scope.acl.whiteList});
          } else {
            $scope.acl.blackList[$scope.editObj].ip = getIpString($scope.multicast);
            $scope.acl.blackList[$scope.editObj].netmask = getIpString($scope.netmask);
            IGMPAcl.update({blackList:$scope.acl.blackList});
          }
        }
      }

      $scope.addWhitelist = function() {
        $scope.editObj = -1;
        $scope.editing = true;
        $scope.editList = 0;
        $scope.netmask = [0,0,0,0];
        $scope.multicast = [0,0,0,0];
      }
      $scope.addBlacklist = function() {
        $scope.editObj = -1;
        $scope.editing = true;
        $scope.editList = 1;
        $scope.netmask = [0,0,0,0];
        $scope.multicast = [0,0,0,0];
      }
      $scope.editWhiteList = function(ind) {
        $scope.editing = true;
        $scope.editList = 0;
        $scope.editObj = ind;
        $scope.netmask = splitIpArr($scope.acl.whiteList[ind].netmask);
        $scope.multicast = splitIpArr($scope.acl.whiteList[ind].ip);
      }
      $scope.editBlackList = function(ind) {
        $scope.editing = true;
        $scope.editList = 1;
        $scope.editObj = ind;
        $scope.netmask = splitIpArr($scope.acl.blackList[ind].netmask);
        $scope.multicast = splitIpArr($scope.acl.blackList[ind].ip);
      }
      $scope.removeWhiteList = function(ind) {
        $scope.acl.whiteList.splice(ind,1);
        IGMPAcl.update({whiteList: $scope.acl.whiteList});
      }
      $scope.removeBlackList = function(ind) {
        $scope.acl.blackList.splice(ind,1);
        IGMPAcl.update({blackList: $scope.acl.blackList});
      }
      $scope.cancel = function() {
        $scope.editing = false;
      }
    }])
  .controller('IgmpHostsCtrl', ['$scope', '$route', '$location', 'IGMPHosts',
    function($scope, $route, $location, IGMPHosts) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.hosts = IGMPHosts.query();
      $scope.editHost = function(ind) {
        $scope.editing = true;
        $scope.editDev = {};
        for(var i in $scope.hosts[ind])
          if($scope.hosts[ind].hasOwnProperty(i))
            $scope.editDev[i] = $scope.hosts[ind][i];
        if($scope.editDev.maxConn == -1)
          $scope.editDev.maxConn = 8;
        $scope.editingIndex = ind;
      }
      $scope.applyEdit = function() {
        $scope.errorMessages = [];
        if(isNaN($scope.editDev.maxConn) || $scope.editDev.maxConn === '' || $scope.editDev.maxConn < 0 || $scope.editDev.maxConn > 256 || !checksForDecimalNumber($scope.editDev.maxConn))
          $scope.errorMessages.push("Max Channels: Maximum channel allowed should be in the range of 0 - 256");
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.editDev.maxConn = parseInt($scope.editDev.maxConn);
        $scope.editing = false;
        IGMPHosts.update({id: $scope.editDev.id}, $scope.editDev, function() {
           $scope.hosts = IGMPHosts.query();          
        })
      }
      $scope.cancel = function() {
        $scope.editing = false;
      }
    }])
  .controller('IgmpIntfCtrl', ['$scope', '$route', '$location', 'IGMPInterfaces',
    function($scope, $route, $location, IGMPInterfaces) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.igmpintf = IGMPInterfaces.get(function(){
        for(var i = 0; i < $scope.igmpintf.interfaces.length; i ++){
          $scope.igmpintf.interfaces[i].name = unescape($scope.igmpintf.interfaces[i].name);
        }
      });

      $scope.save = function() {
        $scope.igmpintf.$update(function(){
          location.reload();
        });
      };
      $scope.cancel = function() {
      }
    }])
  .controller('IgmpServCtrl', ['$scope', '$route', '$location', 'IgmpServices',
    function($scope, $route, $location, IgmpServices) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.page = 0;
      $scope.showErrorPage = false;

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }
      $scope.refresh = function() {
        $scope.services = IgmpServices.query(function() {
          for(var i =0; i < $scope.services.length; i++)
            $scope.services[i].service = unescape($scope.services[i].service);
        });
      }
      $scope.refresh();
      $scope.editService = function(ind) {
        $scope.editing = ind;
        var serv;
        for(var i = 0; i < $scope.services.length; i ++){
          if($scope.services[i].id == ind){
            serv = $scope.services[i];
            break;
          }
        }
        $scope.temp = {
          service: serv.service,
          maxStbs: serv.maxStbs,
          maxNonStbs: serv.maxNonStbs,
          ranges: []
        }
        for(var i = 0; i < serv.ranges.length; i++)
          $scope.temp.ranges.push({
            address: serv.ranges[i].address,
            netmask: serv.ranges[i].netmask
          })
        $scope.page = 1;
        window.scrollTo(0,0);
      }
      $scope.deleteService = function(ind) {
        IgmpServices.remove({id: ind}, function() {
          $scope.refresh();
        })
        window.scrollTo(0,0);
      }
      $scope.addService = function() {
        $scope.editing = -1;
        $scope.page = 1;
        window.scrollTo(0,0);
        $scope.temp = {
          service: "",
          maxStbs: 0,
          maxNonStbs: 0,
          ranges: []
        }
      }
      $scope.save = function() {
        $scope.errorMessages = [];
        if($scope.temp.service == '')
          $scope.errorMessages.push("Service: A string must be specified.");
        if($scope.temp.maxStbs === '' || isNaN($scope.temp.maxStbs) || $scope.temp.maxStbs < 0 || $scope.temp.maxStbs>256 || !checksForDecimalNumber($scope.temp.maxStbs))
          $scope.errorMessages.push("Max STBs Allowed: Maximum STBs allowed should be in the range of 0 - 256");
        if($scope.temp.maxNonStbs === '' || isNaN($scope.temp.maxNonStbs) || $scope.temp.maxNonStbs < 0 || $scope.temp.maxNonStbs>256 || !checksForDecimalNumber($scope.temp.maxNonStbs))
          $scope.errorMessages.push("Max Non-STBs Allowed: Maximum Non-STBs allowed should be in the range of 0 - 256");
        if($scope.temp.ranges.length == 0)
          $scope.errorMessages.push("Multicast Address Range:  At least one item entry must be defined.");
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }

        $scope.temp.maxStbs = Number($scope.temp.maxStbs);
        $scope.temp.maxNonStbs = Number($scope.temp.maxNonStbs);
        $scope.temp.service = escape($scope.temp.service);
        if($scope.editing != -1)
          IgmpServices.update({id: $scope.editing}, $scope.temp, function() {
            $scope.refresh();
          })
        else
          IgmpServices.save($scope.temp, function() {
            $scope.refresh();
          })
        $scope.page = 0;
        window.scrollTo(0,0);
      }
      $scope.addMulticast = function() {
        $scope.multicastIndex = -1;
        $scope.page = 2;
        $scope.multicast = [0,0,0,0];
        $scope.netmask = [0,0,0,0];
        window.scrollTo(0,0);
      }
      $scope.editMulticast = function(ind) {
        $scope.multicastIndex = ind;
        $scope.multicast = splitIpArr($scope.temp.ranges[ind].address);
        $scope.netmask = splitIpArr($scope.temp.ranges[ind].netmask);
        $scope.page = 2;
        window.scrollTo(0,0);
      }
      $scope.removeMulticast = function(ind) {
        $scope.multicastIndex = ind;
        $scope.temp.ranges.splice(ind,1);
        window.scrollTo(0,0);
      }
      $scope.saveRange = function() {
        $scope.errorMessages = [];

        if(!validateMulticastAddr($scope.multicast))
          $scope.errorMessages.push("Multicast Address: The multicast address you input is not valid! It should be from 224.0.0.0 to 239.255.255.255");
        if(!validateSubnetMask($scope.netmask))
          $scope.errorMessages.push("Multicast Address: Subnet mask may not be 0.0.0.0. Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");

        if($scope.errorMessages.length == 0){
          if(!checkSubnetIp($scope.multicast, $scope.netmask)){
            $scope.errorMessages.push("Multicast Address: The subnet definition is invalid.");
          }
          if(!checkMulticastVsList($scope.multicast, $scope.temp.ranges, $scope.multicastIndex, 'address')){
            $scope.errorMessages.push("Multicast Address: Same multicast address has already put in the filter list!");
          }
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.page = 1;
        window.scrollTo(0,0);
        if($scope.multicastIndex == -1)
          $scope.temp.ranges.push({address:getIpString($scope.multicast), netmask:getIpString($scope.netmask)})
        else {
          $scope.temp.ranges[$scope.multicastIndex].address = getIpString($scope.multicast);
          $scope.temp.ranges[$scope.multicastIndex].netmask = getIpString($scope.netmask);
        }
      }
      $scope.cancelRange = function() {
        $scope.page = 1;
        window.scrollTo(0,0);
      }
      $scope.cancelAdd = function() {
        $scope.page = 0;
        window.scrollTo(0,0);
      }
    }])
