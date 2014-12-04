angular.module('wireless.controllers', [])
  .controller('WirelessCtrl', ['$scope', '$route', 
    'Wireless', '$rootScope', function($scope, $route, Wireless, $rootScope) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;

    $scope.wirelessName = ["2.4 GHz", "5 GHz"];
    $scope.nMode = ["Performance Mode", "N Only Mode"];

    $scope.wirelessInterfaces = Wireless.query(function() {
      for(var i = 0; i < 2; i++) {
        $scope.wirelessInterfaces[i].security.wpa.key = ($scope.wirelessInterfaces[i].security.wpa.key);
        $scope.wirelessInterfaces[i].ssid = ($scope.wirelessInterfaces[i].ssid);
      }
      $scope.wep = [];
      $scope.wep.push($scope.wirelessInterfaces[0].security.wep.settings[$scope.wirelessInterfaces[0].security.wep.activeSetting]);
      $scope.wep.push($scope.wirelessInterfaces[1].security.wep.settings[$scope.wirelessInterfaces[1].security.wep.activeSetting]);

      if(!$scope.wirelessInterfaces[0].radioEnabled && !$scope.wirelessInterfaces[1].radioEnabled){
        $rootScope.wpsLinkEnable = false;
      }else{
        $rootScope.wpsLinkEnable = true;
      }
    });
  }])
  .controller('WirelessAdvanceCtrl', ['$scope', '$route',
    'Wireless', function($scope, $route, Wireless) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
      $scope.wirelessInterfaces = Wireless.query(function() {
        $scope.wirelessA = $scope.wirelessInterfaces[0];
        $scope.w24wType = -1;
        if($scope.wirelessA.security.enabled){
          if($scope.wirelessA.security.type == 0){
            $scope.w24wType = 0;
          }else{
            if($scope.wirelessA.security.wpa.type == 1){
              $scope.w24wType = 1;
            }else{
              $scope.w24wType = 2;
            }
          }
        }
        $scope.wirelessB = $scope.wirelessInterfaces[1];
        $scope.w50wType = -1;
        if($scope.wirelessB.security.enabled){
          if($scope.wirelessB.security.type != 0){
            if($scope.wirelessB.security.wpa.type == 1){
              $scope.w50wType = 1;
            }else{
              $scope.w50wType = 2;
            }
          }
        }
      });
  }])
  .controller('WirelessBasicCtrl', ['$scope', '$route', 
    'Wireless', 'securityTips', '$timeout', '$location', 'WPS', '$rootScope',  function($scope, $route, Wireless, securityTips, $timeout, $location, WPS, $rootScope) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    var whichEnabled ={};

    $scope.errorMessages = [];
    $scope.showErrorPage = false;
    $scope.saveChannel = false;
    $scope.hasApplyChanges = false;
    $scope.isW24WEPOn = false;
    $scope.wpsIsEnabled = false;
    var wireless = Wireless.query(function() {
      $scope.wirelessA = wireless[0];
      $scope.wirelessB = wireless[1];
      $scope.wirelessC = wireless[2];
      $scope.wirelessD = wireless[3];
      $scope.saveChannel = $scope.wirelessA.saveChannel;
      $scope.wepA = {
        keyLength: $scope.wirelessA.security.wep.settings[$scope.wirelessA.security.wep.activeSetting].keyLength,
        entryMethod: $scope.wirelessA.security.wep.settings[$scope.wirelessA.security.wep.activeSetting].entryMethod,
        key: $scope.wirelessA.security.wep.settings[$scope.wirelessA.security.wep.activeSetting].key
      };
      $scope.wepB = {
        keyLength: $scope.wirelessB.security.wep.settings[$scope.wirelessB.security.wep.activeSetting].keyLength,
        entryMethod: $scope.wirelessB.security.wep.settings[$scope.wirelessB.security.wep.activeSetting].entryMethod,
        key: $scope.wirelessB.security.wep.settings[$scope.wirelessB.security.wep.activeSetting].key        
      };
      $scope.wepChanged($scope.wepA);
      $scope.wepChanged($scope.wepB);
      $scope.oldAType = $scope.wirelessA.security.type;
      $scope.oldBType = $scope.wirelessB.security.type;
      $scope.wirelessA.ssid = ($scope.wirelessA.ssid);
      $scope.wirelessB.ssid = ($scope.wirelessB.ssid);

      $scope.wAtype = $scope.wirelessA.security.enabled ? ($scope.wirelessA.security.type == 0 ? 0 : 1) : 1;
      $scope.wBtype = $scope.wirelessB.security.enabled ? ($scope.wirelessB.security.type == 0 ? 0 : 1) : 1;

      $scope.isW24WEPOn = $scope.wAtype;

      if(!$scope.wirelessA.radioEnabled && !$scope.wirelessB.radioEnabled){
        $rootScope.wpsLinkEnable = false;
      }else{
        $rootScope.wpsLinkEnable = true;
      }
      $scope.hasApplyChanges = false;
      var wps = WPS.get({id:0}, function() {
        $scope.wpsIsEnabled = wps.enabled;
        if($scope.wpsIsEnabled){
          $scope.wpsIsEnabled = true;
        }else{
          $scope.wpsIsEnabled = false;
        }
      });
    });

    $scope.wireless = wireless;

    $scope.rdbtnChange = function(value){
      if(value == 1){
        securityTips.showWEPMessage().then(function (result) {
            if (result == 'cancel') {
              /*$scope.wAtype = 0;
              $scope.wirelessA.security.type = 0;
              $scope.wirelessA.security.wep.settings[$scope.wirelessA.security.wep.activeSetting] = $scope.wepA;
              $scope.wirelessA.security.enabled = true;*/
              //$scope.unescapeChars();
            }else{
              $scope.check5GHzEnabled();
            }
          }
        );
      }
    }

    $scope.check5GHzEnabled = function(){
      if(!$scope.wirelessB.radioEnabled){
        securityTips.showAutoConnectMsgBasic('', '').then(function (resultObj) {
          if (resultObj == 'cancel') {
          }else{
            $scope.wirelessUpdate();
          }
        });
      }else{
        $scope.wirelessUpdate();
      }
    }

    $scope.errorPageOk = function() {
      $scope.showErrorPage = false;
      window.scrollTo(0,0);
    }

    $scope.wepChanged = function(wep) {
      var length = 10;
      if(wep.keyLength == 0) {
        if(wep.entryMethod == 0)
          length = 10;
        else
          length = 5;
      } else {
        if(wep.entryMethod == 0)
          length = 26;
        else
          length = 13;
      }
      if(wep.key.length > length)
        wep.key = wep.key.substr(0,length);
      wep.charactersLeft = length - wep.key.length;
    };

    $scope.validateSsid = function(ssid, mess) {  
      //if(ssid.length < 1 || ssid.length > 32 || !/^[0-9A-Z\ \_\-]+$/i.test(ssid))
      if(ssid.length < 1 || ssid.length > 64 || !/^[0-9a-zA-Z\!\"\#\$\%\&\u2019\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~\ ]+$/i.test(ssid))//TODO: Use above line since this change is only being made for the wifi alliance test
        $scope.errorMessages.push(mess + " Service Set Identifier must consist of 1 to 64 characters and must not contain any special character.");
    }
    $scope.wirelessUpdate = function() {
      $scope.wirelessA.ssid = ($scope.wirelessA.ssid);
      $scope.wirelessB.ssid = ($scope.wirelessB.ssid);
      $scope.hasApplyChanges = true;
      var tempRadioValue = $scope.wirelessA.radioEnabled;
      $scope.wirelessA.$update(function() {
        $scope.wirelessB.$update(function() {
          securityTips.showSaving('Save Settings', 'Saving your settings. Please wait...', 15000);
        });
      });
    }
    $scope.checkWEP = function(){
      if($scope.wirelessA.radioEnabled && $scope.wAtype == 0 && ($scope.wpsIsEnabled && $scope.wirelessA.mode == 4)){
        $scope.enableWEP();
      }else if($scope.wirelessA.radioEnabled && $scope.wAtype == 0 && ($scope.wpsIsEnabled || $scope.wirelessA.mode == 1 || $scope.wirelessA.mode == 8)){
        $scope.enableWEP1();
      }else if($scope.wirelessA.radioEnabled && $scope.wAtype == 1 && $scope.isW24WEPOn == 0){
        $scope.rdbtnChange($scope.wAtype);
      }else {
        $scope.check5GHzEnabled();
      }
    }
    $scope.enableWEP = function(){
      securityTips.showCustomMessage('Warning',
        ['If WEP is enabled for the 2.4 GHz wireless network, then WPS will be disabled for the 2.4 GHz wireless network.',
        'Are you sure you want to enable WEP?']).then(function (result) {
        if (result == 'cancel') {
          /*$scope.wAtype = 1;
          if($scope.oldAType == 0){
            $scope.wirelessA.security.enabled = false;
          }else{
            $scope.wirelessA.security.type = $scope.oldAType;
          }*/
          //$scope.unescapeChars();
        }else{
          $scope.check5GHzEnabled();
        }
        }
      );
    };
    $scope.enableWEP1 = function(){
      securityTips.showCustomMessage1('Warning',
        ['Turning on WEP will change your 2.4 GHz wireless mode to Legacy Mode (802.11b/g) and disable Wi-Fi Protected Setup.',
         'Press OK to continue or Cancel.']).then(function (result) {
        if (result == 'cancel') {
          /*$scope.wAtype = 1;
          if($scope.oldAType == 0){
            $scope.wirelessA.security.enabled = false;
          }else{
            $scope.wirelessA.security.type = $scope.oldAType;
          }*/
          //$scope.unescapeChars();
        }else{
          $scope.wirelessA.mode = 4;
          $scope.check5GHzEnabled();
        }
      });
    };
    $scope.save = function() {
      if($scope.hasApplyChanges == false){
        $scope.errorMessages = [];
        $scope.wirelessA.channelDesired = parseInt($scope.wirelessA.channelDesired);
        $scope.wirelessB.channelDesired = parseInt($scope.wirelessB.channelDesired);
        $scope.wepA.keyLength = parseInt($scope.wepA.keyLength);
        $scope.wepA.entryMethod = parseInt($scope.wepA.entryMethod);
        $scope.wepB.keyLength = parseInt($scope.wepB.keyLength);
        $scope.wepB.entryMethod = parseInt($scope.wepB.entryMethod);

        if($scope.wAtype == 0)
          validateWepSettings($scope.wepA, true, "2.4 GHz Wireless", $scope.errorMessages);

        if($scope.wBtype == 0)
          validateWepSettings($scope.wepB, true, "5.0 GHz Wireless", $scope.errorMessages);

        $scope.validateSsid($scope.wirelessA.ssid, "2.4 GHz Wireless");
        $scope.validateSsid($scope.wirelessB.ssid, "5.0 GHz Wireless");
        if($scope.errorMessages.length>0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }

        $scope.wirelessA.saveChannel = $scope.saveChannel;
        $scope.wirelessB.saveChannel = $scope.saveChannel;


        if($scope.wAtype == 0) {
          $scope.wirelessA.security.type = 0;
          $scope.wirelessA.security.wep.settings[$scope.wirelessA.security.wep.activeSetting] = $scope.wepA;
          $scope.wirelessA.security.enabled = true;
        } else if($scope.oldAType == 0){
          $scope.wirelessA.security.enabled = false;
        } else if($scope.wAtype == 1){
          $scope.wirelessA.security.type = $scope.oldAType;
        }

        /*if($scope.wBtype == 0) {
          $scope.wirelessB.security.type = 0;
          $scope.wirelessB.security.enabled = true;
          $scope.wirelessB.security.wep.settings[$scope.wirelessB.security.wep.activeSetting] = $scope.wepB;
        } else if($scope.oldBType == 0)
          $scope.wirelessB.security.enabled = false;*/

        $scope.checkWEP();
      }
    }

    $scope.keyPress = function(keyEvent) {
      if (keyEvent.keyCode == 13){
        if($location.path() == '/wireless/basic'){
          $scope.save();
        }
      }
    };

  }])

  .controller('WirelessSSIDBroadcast', ['$scope', '$route', '$routeParams', '$location',
    'Wireless', 'securityTips', 'WPS', function($scope, $route, $routeParams, $location, Wireless, securityTips, WPS) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.wirelessWpsAreOn = true;

      var wirelessId = $routeParams.id;
      if(wirelessId == 0){
        $scope.wirelessName = "2.4 GHz";
        $scope.wirelessType = 0;
      }else{
        $scope.wirelessName = "5 GHz";
        $scope.wirelessType = 1;
      }

      var wps = WPS.get({id:0}, function() {
        $scope.wpsEnabled = wps.enabled;
        var wirelessAll = Wireless.query(function() {
          $scope.wirelessARadioEnabled = wirelessAll[0].radioEnabled;
          $scope.wirelessAWpsEnabled = wirelessAll[0].wpsEnabled;
          $scope.wirelessBRadioEnabled = wirelessAll[1].radioEnabled;
          $scope.wirelessBWpsEnabled = wirelessAll[1].wpsEnabled;

          if (!$scope.wirelessARadioEnabled && !$scope.wirelessBRadioEnabled){
            $scope.wirelessWpsAreOn = false;
          }
          if(!$scope.wirelessAWpsEnabled && !$scope.wirelessBWpsEnabled){
            $scope.wirelessWpsAreOn = false;
          }
          if($scope.wpsEnabled && !$scope.wirelessWpsAreOn)
            $scope.wpsEnabled = false;
        })
      });

      var wireless = Wireless.get({id: wirelessId}, function() {
        $scope.ssidBroadcast = wireless.ssidBroadcast;
      });

      $scope.wirelessUpdate = function(){
        Wireless.update({id: wirelessId}, {ssidBroadcast: $scope.ssidBroadcast}, function() {
          $location.path("/wireless/advanced");
        })
      }

      $scope.check5GHzBroadcast = function(){
        securityTips.showAutoConnectMsgBroadcast('', '').then(function (resultObj) {
          if (resultObj == 'cancel') {
          }else{
            $scope.wirelessUpdate();
          }
        });
      }

      $scope.save = function() {
        if ($scope.wpsEnabled && !$scope.ssidBroadcast){
          securityTips.showCustomMessage('Warning',
            ['If SSID Broadcast is disabled for the ' + $scope.wirelessName + ' wireless network, then WPS will also be disabled for the ' + $scope.wirelessName + ' wireless network.',
            'Are you sure you want to disable SSID Broadcast?']).then(function (result) {
              if (result == 'cancel') {
                //$scope.ssidBroadcast = true;
              }else{
                if($scope.wirelessType == 0){
                  $scope.wirelessUpdate();
                }else{
                  $scope.check5GHzBroadcast();
                }
              }
            }
          );
        }else{
          if(!$scope.ssidBroadcast){
            if($scope.wirelessType == 0){
              $scope.wirelessUpdate();
            }else{
              $scope.check5GHzBroadcast();
            }
          }else{
            $scope.wirelessUpdate();
          }
        }
      }
    }])
  .controller('WirelessMode', ['$scope', '$route', '$location',
    'Wireless', 'securityTips', function($scope, $route, $location, Wireless, securityTips) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      var wireless = Wireless.query(function() {
        $scope.modeA = wireless[0].mode;
        $scope.modeB = wireless[1].mode;

        $scope.wirelessAEnabled = wireless[0].radioEnabled;
        $scope.wAtype = wireless[0].security.enabled ? (wireless[0].security.type == 0 ? 0 : 1) : 1;
      })
      $scope.wirelessUpdate = function() {
        Wireless.update({id: 0}, {mode: parseInt($scope.modeA)}, function() {
          Wireless.update({id: 1}, {mode: parseInt($scope.modeB)}, function() {
            $location.path("/wireless/advanced");
          })
        })
      }
      $scope.enableWEP = function(){
        if($scope.wAtype == 0 && $scope.wirelessAEnabled && ($scope.modeA == 1 || $scope.modeA == 8)){
          securityTips.showCustomMessage2('Warning',
          ['Compatibility Mode and Performance Mode are not compatible with WEP security. You must first select WPA/WPA2 Mixed Mode or WPA2 security before enabling Compatibility or Performance mode.']);
        }else{
          $scope.wirelessUpdate();
        }
      };

      $scope.save = function() {
        $scope.enableWEP();
      }
    }])
  .controller('WirelessTransmissionCtrl', ['$scope', '$route', '$routeParams', '$location',
    'WirelessTransmission', function($scope, $route, $routeParams, $location, WirelessTransmission) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.errorMessages = [];
      $scope.showErrorPage = false;
      $scope.confirmed = !($routeParams.warn != null && $routeParams.warn == 'true');
      $scope.trans1 = WirelessTransmission.get({id: 0});
      $scope.trans2 = WirelessTransmission.get({id: 1});
      $scope.runFocus = false;
  
      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.isConfirmed = function() {
        $scope.confirmed = true;
        $scope.runFocus = true;
      }

      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if(!$scope.showErrorPage && $scope.confirmed){
            $scope.save();
          }
        }
      };

      $scope.save = function() {
        $scope.errorMessages = [];
        $scope.trans1.ctsProtection = parseInt($scope.trans1.ctsProtection);
        $scope.trans1.ctsProtectionType = parseInt($scope.trans1.ctsProtectionType);
        $scope.trans2.ctsProtection = parseInt($scope.trans2.ctsProtection);
        $scope.trans2.ctsProtectionType = parseInt($scope.trans2.ctsProtectionType);
        validateTransmissionSettings($scope.trans1, "2.4 GHz Wireless", $scope.errorMessages);
        validateTransmissionSettings($scope.trans2, "5.0 GHz Wireless", $scope.errorMessages);

        if($scope.errorMessages.length>0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.trans1.channelWidth = parseInt($scope.trans1.channelWidth);
        $scope.trans2.channelWidth = parseInt($scope.trans2.channelWidth);

        $scope.trans1.beaconInterval = parseInt($scope.trans1.beaconInterval);
        $scope.trans2.beaconInterval = parseInt($scope.trans2.beaconInterval);
        $scope.trans1.dtimInterval = parseInt($scope.trans1.dtimInterval);
        $scope.trans2.dtimInterval = parseInt($scope.trans2.dtimInterval);
        $scope.trans1.fragmentationThreshold = parseInt($scope.trans1.fragmentationThreshold);
        $scope.trans2.fragmentationThreshold = parseInt($scope.trans2.fragmentationThreshold);
        $scope.trans1.rtsThreshold = parseInt($scope.trans1.rtsThreshold);
        $scope.trans2.rtsThreshold = parseInt($scope.trans2.rtsThreshold);
        $scope.trans1.frameBurstMax = parseInt($scope.trans1.frameBurstMax);
        $scope.trans2.frameBurstMax = parseInt($scope.trans2.frameBurstMax);
        $scope.trans1.frameBurstTime = parseInt($scope.trans1.frameBurstTime);
        $scope.trans2.frameBurstTime = parseInt($scope.trans2.frameBurstTime);
        $scope.trans1.power = parseInt($scope.trans1.power);
        $scope.trans2.power = parseInt($scope.trans2.power);
        $scope.trans1.$update({id: 0}, function() {
          $scope.trans2.$update({id: 1}, function() {
            $location.path("/wireless/advanced");
          });
        });
      }
    }])
  .controller('WirelessWmmCtrl', ['$scope', '$route', '$routeParams', '$location', 'WirelessWmm',
    function($scope, $route, $routeParams, $location, WirelessWmm) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      var wirelessId = $routeParams.id;
      if(wirelessId == 0)
        $scope.wirelessName = "2.4 GHz";
      else
        $scope.wirelessName = "5 GHz";

      $scope.qos = WirelessWmm.get({id: $routeParams.id});
    
      $scope.enabledClick = function() {
        if(!$scope.qos.enabled)
          $scope.qos.powerSave = false;
      }
      $scope.save = function() {
        $scope.qos.$update({id: $routeParams.id}, function() {
          location.reload();
        });
      }

      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == ('/wireless/wmm/' + $routeParams.id)){
            $scope.save();
          }
        }
      };

    }])
  .controller('WirelessWEPCtrl', ['$scope', '$route', '$routeParams', '$location', 'WEP', 'securityTips', 'WPS', 'Wireless',
    function($scope, $route, $routeParams, $location, WEP, securityTips, WPS, Wireless) {

      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.showErrorPage = false;
      $scope.errorMessages = [];

      var wirelessId = $routeParams.id;
      if(wirelessId == 0)
        $scope.wirelessName = "2.4 GHz";
      else
        $scope.wirelessName = "5 GHz";

      $scope.wep = WEP.get({id: wirelessId}, function() {
        var wps = WPS.get({id:0}, function() {
          $scope.wpsIsEnabled = wps.enabled;
          $scope.wirelessCmd = Wireless.query(function() {
            $scope.wirelessACmd = $scope.wirelessCmd[0];
            if($scope.wpsIsEnabled){
              $scope.wpsIsEnabled = true;
            }else{
              $scope.wpsIsEnabled = false;
            }
            $scope.ipAddress = splitIpArr($scope.wep.serverIp);
          });
        });
      });

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.wepChanged = function(index) {
      var wep = $scope.wep.settings[index];
      var length = 10;
      if(wep.keyLength == 0) {
        if(wep.entryMethod == 0)
          length = 10;
        else
          length = 5;
      } else {
        if(wep.entryMethod == 0)
          length = 26;
        else
          length = 13;
      }
      if(wep.key.length > length)
        wep.key = wep.key.substr(0,length);
    };

    $scope.wirelessUpdate = function(valueStatus){
      WEP.update({id: wirelessId}, {activeSetting: $scope.wep.activeSetting, mode: $scope.wep.mode, authenticationType: $scope.wep.authenticationType,
        settings: $scope.wep.settings}, function() {
          if(valueStatus == 1){
            Wireless.update({id: 0}, {mode: 4}, function() {
              $location.path("/wireless/advanced");
            })
          }else{
            $location.path("/wireless/advanced");
          }
        }
      );
    }

    $scope.checkWEP = function(){
      if($scope.wirelessACmd.radioEnabled && ($scope.wpsIsEnabled && $scope.wirelessACmd.mode == 4)){
        $scope.enableWEP();
      }else if($scope.wirelessACmd.radioEnabled && ($scope.wpsIsEnabled || $scope.wirelessACmd.mode == 1 || $scope.wirelessACmd.mode == 8)){
        $scope.enableWEP1();
      }else{
        $scope.wirelessUpdate(0);
      }
    }

    $scope.enableWEP = function(){
      securityTips.showCustomMessage('Warning',
        ['If WEP is enabled for the 2.4 GHz wireless network, then WPS will be disabled for the 2.4 GHz wireless network.',
        'Are you sure you want to enable WEP?']).then(function (result) {
        if (result == 'ok') {
          $scope.wirelessUpdate(0);
        }
      });
    };

    $scope.enableWEP1 = function(){
      securityTips.showCustomMessage1('Warning',
        ['Turning on WEP will change your 2.4 GHz wireless mode to Legacy Mode (802.11b/g) and disable Wi-Fi Protected Setup.',
         'Press OK to continue or Cancel.']).then(function (result) {
        if (result == 'ok') {
          $scope.wirelessUpdate(1);
        }
      });
    };

      $scope.save = function() {
        $scope.errorMessages = [];
        $scope.wep.authenticationType = parseInt($scope.wep.authenticationType);
        for(var i = 0; i < $scope.wep.settings.length; i++)
        {
          $scope.wep.settings[i].entryMethod = parseInt($scope.wep.settings[i].entryMethod);
          $scope.wep.settings[i].keyLength = parseInt($scope.wep.settings[i].keyLength);
          validateWepSettings($scope.wep.settings[i], i == $scope.wep.activeSetting, "Key #" + (i+1), $scope.errorMessages);
        }
        if($scope.errorMessages.length>0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.checkWEP();
      }      
    }])
  .controller('WirelessWPACtrl', ['$scope', '$route', '$routeParams', '$location', 'WPA',
    function($scope, $route, $routeParams, $location, WPA) {

      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.whichKey = 1;
      $scope.keyType = 0;
      $scope.errorMessages = [];
      $scope.showErrorPage = false;
      var wirelessId = $routeParams.id;
      if(wirelessId == 0)
        $scope.wirelessName = "2.4 GHz";
      else
        $scope.wirelessName = "5 GHz";
      if($route.current.wpa == 0)
        $scope.wpaType = "WPA2/WPA mixed mode";
      else {
        $scope.wpaType = "WPA2";
      }

      $scope.wpa = WPA.get({id: wirelessId}, function() {
        $scope.wpa.key = ($scope.wpa.key);
        $scope.wpa.type = $route.current.wpa;
      });


      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.validateWpaKey = function(key) {
        //Weird handling to match BHR3
        /*if(key.length == 0 || !/[a-z]{1,}.*[0-9]{1,}?|[0-9]{1,}.*[a-z]{1,}?/i.test(key))
          $scope.errorMessages.push("Pre-Shared Key: You must include at least one letter and at least one number in your Pass-Phrase.");
        else */if(key.length < 8)
          $scope.errorMessages.push("Pre-Shared Key: Pass-Phrase has to be at least 8 characters long.")
      }

      $scope.save = function() {
        $scope.errorMessages = [];
        if($scope.wpa.groupKeyUpdateIntervalEnabled && 
          (isNaN($scope.wpa.groupKeyUpdateInterval) || $scope.wpa.groupKeyUpdateInterval < 900 || $scope.wpa.groupKeyUpdateInterval > 86400 || !checksForDecimalNumber($scope.wpa.groupKeyUpdateInterval))) {
          $scope.errorMessages.push("Group Key Update Interval: Please enter a numeric value between 900 and 86400.")
        }
        $scope.validateWpaKey($scope.wpa.key);
        if($scope.errorMessages.length != 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }   
        if(!$scope.wpa.groupKeyUpdateIntervalEnabled)
          $scope.wpa.groupKeyUpdateInterval = 0;     
        $scope.wpa.encryptionAlgorithm = parseInt($scope.wpa.encryptionAlgorithm);
        WPA.update({id: wirelessId}, {type: $scope.wpa.type, mode: $scope.wpa.mode, encryptionAlgorithm: $scope.wpa.encryptionAlgorithm,
          groupKeyUpdateInterval: $scope.wpa.groupKeyUpdateInterval, groupKeyUpdateIntervalEnabled: 
          $scope.wpa.groupKeyUpdateIntervalEnabled, key: ($scope.wpa.key)}, function() {
            $location.path("/wireless/advanced");
        });
      }
    }])
  .controller('WirelessMACFilterCtrl', ['$scope', '$route', '$location', 'WirelessMACFilter','Wireless','securityTips', 'WPS',
    function($scope, $route, $location, WirelessMACFilter, Wireless,securityTips, WPS) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.warningFlg = false;
      $scope.newMac = '';

      $scope.filter0 = WirelessMACFilter.get({id: 0});
      $scope.filter1 = WirelessMACFilter.get({id: 1});

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.checkFilters = function(macs) {
        for(var i = 0; i < macs.length; i++) {
          if(macs[i].length != 17 || !validateMac(macs[i]) ||
            /[0\:]{17}$/.test(macs[i]) || /[f\:]{17}$/i.test(macs[i]) ||
            parseInt(macs[i].split(':')[0],16) & 1 == 1) {
            $scope.errorMessages.push("Invalid MAC Address format: Please try again.");
            break;
          }
        }
      }

      $scope.save = function() {
        $scope.errorMessages = [];
        $scope.checkFilters($scope.filter0.macs);
        if($scope.errorMessages.length == 0) {
          $scope.checkFilters($scope.filter1.macs);
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.filter0.mode = parseInt($scope.filter0.mode);
        $scope.filter1.mode = parseInt($scope.filter1.mode);
        $scope.filter0.$update({id: 0}, function() {
          $scope.filter1.$update({id: 1}, function() {
            $location.path("/wireless/advanced");
          })
        })
      }

      $scope.chkBeforeSave=function(){
        var wirelessWpsAreOn = true;
        var wireless = Wireless.query(function() {
          var wps = WPS.get({id:0}, function() {
            $scope.wpsEnabled = wps.enabled;
            wirelessWpsAreOn = true;
            $scope.wire0 = wireless[0].radioEnabled;
            $scope.wire1 = wireless[1].radioEnabled;

            var is24WpsEnabled = wireless[0].wpsEnabled;
            var is50WpsEnabled = wireless[1].wpsEnabled;

            if (!$scope.wire0 && !$scope.wire1){
              wirelessWpsAreOn = false;
            }
            if (!is24WpsEnabled && !is50WpsEnabled){
              wirelessWpsAreOn = false;
            }
            if($scope.wpsEnabled && !wirelessWpsAreOn)
              $scope.wpsEnabled = false;
            var has24Issue = false;
            var has50Issue = false;
            var msgSub = "";
            var msgSubNetwork = "";

            if($scope.filter0.enabled && $scope.filter0.mode == 0 && $scope.filter0.macs.length == 0){
              has24Issue = true;
            }
            if($scope.filter1.enabled && $scope.filter1.mode == 0 && $scope.filter1.macs.length == 0){
              has50Issue = true;
            }
            if($scope.wpsEnabled){
              if(!has24Issue && !has50Issue)
                $scope.warningFlg = false;
              else
                $scope.warningFlg = true;
            }else{
              $scope.warningFlg = false;
            }
            if(!$scope.warningFlg)
            {
              $scope.check5GHZList();
            }else{
              if(has24Issue && has50Issue){
                msgSub = "2.4GHz and 5.0GHz";
                msgSubNetwork = "networks";
              }else if(has50Issue){
                msgSub = "5.0GHz";
                msgSubNetwork = "network";
              }else if(has24Issue){
                msgSub = "2.4GHz";
                msgSubNetwork = "network";
              }
              securityTips.showCustomMessage1('Warning',
              ['If Access List (MAC address filter) is enabled with no accepted devices (an empty white list) for the ' + msgSub + ' wireless ' + msgSubNetwork + ', then WPS will be disabled for the ' + msgSub + ' wireless ' + msgSubNetwork + '.',
              'Are you sure you want to enable Access List with no accepted devices?','Press OK to continue or Cancel.']).then(function (result) {
              if (result == 'cancel') {

              }else{
                $scope.check5GHZList();
              }
              });
            }
          });
        });
      }

      $scope.check5GHZList = function(){
        if($scope.filter1.enabled){
          securityTips.showAutoConnectMsgAuth('', '').then(function (resultObj) {
            if (resultObj == 'cancel') {
            }else{
              $scope.save();
            }
          });
        }else{
          $scope.save();
        }
      }

      $scope.removeMac = function(which, index) {
        if(which == 0)
          $scope.filter0.macs.splice(index, 1);
        else
          $scope.filter1.macs.splice(index, 1);
      }

      $scope.addFilter = function(which) {
          $scope.errorMessages = [];
          if(which == 0) {
              if (!angular.isUndefined($scope.newMac0)) {
                  if($scope.errorMessages.length == 0 && (!validateMac($scope.newMac0) || !notAcceptedMac($scope.newMac0) || !(/^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/.test($scope.newMac0)))) {
                      $scope.errorMessages.push("MAC Address: MAC address must consist of 6 fields. Each field's value must be between 00 and FF (in hexadecimal representation), without any spaces. The LSB of the first byte must be zero.");
                  } else {
                      for (var i = 0; i < $scope.filter0.macs.length; i++)
                          if ($scope.newMac0 == $scope.filter0.macs[i])
                              return;
                      $scope.filter0.macs.push($scope.newMac0);
                      $scope.newMac0 = "";
                  }
              } else {
                  $scope.errorMessages.push("MAC Address: MAC address must consist of 6 fields. Each field's value must be between 00 and FF (in hexadecimal representation), without any spaces. The LSB of the first byte must be zero.");
              }
          } else {
              if (!angular.isUndefined($scope.newMac1)) {
                  if($scope.errorMessages.length == 0 && (!validateMac($scope.newMac1) || !notAcceptedMac($scope.newMac1) || !(/^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/.test($scope.newMac1)))) {
                      $scope.errorMessages.push("MAC Address: MAC address must consist of 6 fields. Each field's value must be between 00 and FF (in hexadecimal representation), without any spaces. The LSB of the first byte must be zero.");
                  } else {
                      for (var i = 0; i < $scope.filter1.macs.length; i++)
                          if ($scope.newMac1 == $scope.filter1.macs[i])
                              return;
                      $scope.filter1.macs.push($scope.newMac1);
                      $scope.newMac1 = "";
                  }
              } else {
                  $scope.errorMessages.push("MAC Address: MAC address must consist of 6 fields. Each field's value must be between 00 and FF (in hexadecimal representation), without any spaces. The LSB of the first byte must be zero.");
              }
          }
          if($scope.errorMessages.length > 0) {
              $scope.showErrorPage = true;
              window.scrollTo(0,0);
              return;
          }
      }
    }])
  .controller('WifiSetupCtrl', ['$scope', '$route', '$location', 'WPS', 'Devices', 'Wireless', 'securityTips', 'WirelessMACFilter',
    function($scope, $route, $location, WPS, Devices, Wireless, securityTips, WirelessMACFilter) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.valid = true;

      $scope.apLockDown = false;
      $scope.erEnabled = false;
      $scope.apPin = "";
      $scope.erCanEnabled = true;
      $scope.onlyNumbers = /^\d+$/;
      $scope.wirelessWpsAreOn = true;
      $scope.hasSavePopup = false;

      $scope.$on('$destroy', function() {
        $scope.valid = false;
      })
      var timeStart = 0;
      $scope.refresh = function() {
        var wps = WPS.get({id:0}, function() {
          var wireless = Wireless.query(function() {
            $scope.filter0 = WirelessMACFilter.get({id: 0}, function(){
              $scope.filter1 = WirelessMACFilter.get({id: 1}, function(){
                $scope.wirelessWpsAreOn = true;
                $scope.wire0 = wireless[0].radioEnabled;
                $scope.wire1 = wireless[1].radioEnabled;

                var is24WpsEnabled = wireless[0].wpsEnabled;
                var is50WpsEnabled = wireless[1].wpsEnabled;
                if (!$scope.wire0 && !$scope.wire1){
                  $scope.wirelessWpsAreOn = false;
                }
                if(!is24WpsEnabled && !is50WpsEnabled){
                  $scope.wirelessWpsAreOn = false;
                }
                if(wps.apLockDown == true || wps.apLockDown == false){
                  $scope.apLockDown = wps.apLockDown;
                }
                if(wps.erEnabled == true || wps.erEnabled == false)
                  $scope.erEnabled = wps.erEnabled;
                if(wps.apPin){
                  $scope.apPin = wps.apPin;
                  while(String($scope.apPin).length < 8){
                    $scope.apPin = "0" + String($scope.apPin);
                  }
                }
                if($scope.apPin != ""){
                  $scope.erCanEnabled = false;
                }
                $scope.enabled = wps.enabled;
                if($scope.enabled && !$scope.wirelessWpsAreOn){
                  $scope.enabled = false;
                }
                $scope.trigger = wps.trigger;
                var triggerRefresh = false;
                if ($scope.isCancelled == true){
                  wps.status = 0;
                  $scope.timeString = '';
                  $scope.isCancelled = false;
                }
                if($scope.currentStep == 0) {
                  if(wps.status != 0) {
                    $scope.currentStep = 1;
                    timeStart = new Date().getTime();
                    $scope.timeString = '2 minutes';
                    triggerRefresh = true;
                  }
                } else if($scope.currentStep == 3) {//If wps is pairing
                  if(wps.lastStatus == 3)//Failed
                    $scope.currentStep = 5;
                  else if(wps.lastStatus == 4)//Success
                  {
                    $scope.mac = wps.device;
                    $scope.currentStep = 4;
                  } else if(wps.status == 0 && wps.lastStatus == 1)//Cancelled
                    $scope.currentStep = 0;
                  else
                    triggerRefresh = true;
                } else if($scope.currentStep == 1 || $scope.currentStep == 2) {//If wps is searching for a device
                  if(wps.status == 2) {//pairing
                    $scope.currentStep = 3;
                    triggerRefresh = true;
                  } else if(wps.lastStatus == 3)//Failed
                    $scope.currentStep = 5;
                  else if(wps.lastStatus == 4)//Success
                  {
                    $scope.mac = wps.device;
                    $scope.currentStep = 4;
                  }
                  else if(wps.status == 0 && wps.lastStatus == 1) {//Cancelled
                    $scope.currentStep = 0;
                  } else
                    triggerRefresh = true;
                  if(!triggerRefresh)
                    return;
                  var cur = 120 - Math.floor((new Date().getTime() - timeStart)/1000);
                  if(cur <= 0) {
                    $scope.currentStep = 5;
                    return;
                  }
                  var m = Math.floor(cur / 60);
                  var s = cur % 60;
                  $scope.timeString = '';
                  if(m > 0)
                    $scope.timeString = m + ' minute' + (m>1?'s':'') + (s>0?', ':'');
                  if(s > 0)
                    $scope.timeString += s + ' second' + (s>1?'s':'');
                  triggerRefresh = true;
                }
                if(triggerRefresh && $scope.valid)
                  window.setTimeout($scope.refresh, 1000);

                if($scope.hasSavePopup){
                  $scope.savePopup.close();
                  $scope.hasSavePopup = false;
                }
              });
            });
          })
        });
      }
      $scope.refresh();

      $scope.currentStep = 0;
      $scope.clientWpsPin = "";

      $scope.toggleOnOffSave = function(){
        WPS.update({id: 0}, {enabled: !$scope.enabled}, function() {
          $scope.savePopup = securityTips.showSaving1('Apply Settings', 'Applying your settings. Please wait...');
          $scope.hasSavePopup = true;
          $scope.currentStep = 0;
          window.setTimeout($scope.toggleOnOffSaveRefresh,3000);
        })
      }

      $scope.toggleOnOffSaveRefresh = function(){
        $scope.refresh();
      }

      $scope.toggleOnOff = function() {
        if($scope.enabled){
          $scope.toggleOnOffSave();
        }else{
          if(!$scope.wire0 && !$scope.wire1){
            securityTips.showCustomMessage3('Warning',
              ["Wi-Fi Protected Setup (WPS) is disabled because both Wi-Fi radios(2.4GHz and 5GHz) have been turned off.",
              "Please enable Wi-Fi on one or both radios to enable WPS."]);
          }else if($scope.wirelessWpsAreOn){
            $scope.toggleOnOffSave();
          }else{
            securityTips.showCustomMessage3('Warning',
              ["Wi-Fi Protected Setup (WPS) cannot be used if WEP security is enabled or SSID broadcast is disabled or if MAC address authentication is enabled with an empty white list.",
              "To use WPS, change your wireless security mode and/or enable SSID broadcast and/or add a MAC address to the mac authentication table."]);
          }
        }
      };

      $scope.pushButtonConfig = function() {
        WPS.update({id: 0}, {trigger: !$scope.trigger}, function() {
          timeStart = new Date().getTime();
          $scope.currentStep = 1;
          window.setTimeout($scope.testConnection,3000);
        })
      };
      $scope.testConnection = function() {
        $scope.refresh();
      }

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }


      $scope.register = function() {
        $scope.errorMessages = [];
        var showErr = false;
        if(String($scope.clientWpsPin).indexOf('-') == -1 && String($scope.clientWpsPin).indexOf(' ') == -1){
          if(!(/^[0-9]{8}$/.test($scope.clientWpsPin)) && !(/^[0-9]{4}$/.test($scope.clientWpsPin))){
            showErr = true;
          }
        }else{
          if(!(/^[0-9- ]{9}$/.test($scope.clientWpsPin)) && !(/^[0-9- ]{5}$/.test($scope.clientWpsPin))){
            showErr = true;
          }
        }
        if(showErr){
          $scope.errorMessages.push("Error: Invalid PIN. Please enter a valid WPS PIN, which consists of either four or eight numeric digits, and can typically be found printed on your wireless client device or in its documentation.");
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }

        if($scope.clientWpsPin == '') {
          $scope.pushButtonConfig();
          return;
        }
        var pinString = $scope.clientWpsPin.replace(/ /g,'').replace(/-/g,'');

        var result = WPS.update({id: 0}, {pin: pinString}, function() {
          if(result.pin == "00000000"){
            $scope.errorMessages.push("Error: Invalid PIN. Please enter a valid WPS PIN, which consists of either four or eight numeric digits, and can typically be found printed on your wireless client device or in its documentation.");
            if($scope.errorMessages.length > 0) {
              $scope.showErrorPage = true;
              window.scrollTo(0,0);
            }
          }else{
            timeStart = new Date().getTime();
            $scope.currentStep = 2;
            window.setTimeout($scope.testConnection,3000);
          }
        })
      };

      $scope.cancel = function() {
        WPS.update({id: 0}, {trigger: !$scope.trigger}, function() {
          $scope.currentStep = 0;
          $scope.isCancelled = true;
          timeStart = 0;
        })
      };

      $scope.connect = function() {
        $scope.currentStep = 4;
      };

      $scope.completed = function() {
        $scope.currentStep = 0;
        $scope.clientWpsPin = "";
      }

      $scope.sendErEnabled = function(value){
        WPS.update({id: 0}, {erEnabled: value}, function() {
          $scope.refresh();
        })
      }
    }])

  .controller('GuestWifiSetupTabCtrl', ['$scope', '$route', '$location','Wireless',
    function($scope, $route, $location, Wireless) {
      $scope.pageToShow = 0;
      $scope.currentTab = -1;
      $scope.bothDisabled=false;
      $scope.basicGuestWifiEnabled=false;
      $scope.guestPassWifiEnabled=false;
      $scope.guestWifiEnum = {BASIC_GUEST_WIFI:2};
      $scope.tabsEnum = {1:'partials/wireless/guestDevicesTab.html?v={version_number}',
                         2:'partials/wireless/basicGuestWifiTab.html?v={version_number}'}

      $scope.section = $route.current.section;

      var tempPath = $location.path();
      if(tempPath.indexOf('/wireless/guestWifiSetup/devices') != -1){
        $scope.currentTab = 1;
      }else if(tempPath.indexOf('/wireless/guestWifiSetup/basic') != -1){
        $scope.currentTab = 2;
      }else{
        $scope.wireless1= Wireless.query(function(){
          $scope.wirelessA1 = $scope.wireless1[0];
          $scope.basicGuestWifi1 = $scope.wireless1[$scope.guestWifiEnum.BASIC_GUEST_WIFI];
          if(undefined != $scope.basicGuestWifi1 && null != $scope.basicGuestWifi1 && $scope.basicGuestWifi1.enabled && $scope.wirelessA1.radioEnabled){
            $location.url('/wireless/guestWifiSetup/basic');
          }else{
            $location.url('/wireless/guestWifiSetup/basic');
          }
        });
      }

      $scope.mainRefresh = function() {
        $scope.basicGuestWifiEnabled=false;
        $scope.bothDisabled=false;
        $scope.wireless= Wireless.query(function(){
          $scope.wirelessA = $scope.wireless[0];
          $scope.basicGuestWifi = $scope.wireless[$scope.guestWifiEnum.BASIC_GUEST_WIFI];
          if(undefined != $scope.basicGuestWifi && null != $scope.basicGuestWifi && $scope.basicGuestWifi.enabled && $scope.wirelessA.radioEnabled){
            $scope.basicGuestWifiEnabled=true;
            $scope.bothDisabled=false;
          }else{
            $scope.bothDisabled = true;
          }
        });
        $scope.togglePage(0);
      };


      $scope.togglePage = function(num) {
        $scope.pageToShow = num;
        window.scrollTo(0,0);
      };

      $scope.mainRefresh();


      //Controller for Tabs
      $scope.isActive = function(num) {
        return $scope.currentTab === num;
      }
      $scope.setActive = function(num) {
        switch(num){
        case 1:
          $location.url('/wireless/guestWifiSetup/devices');
          break;
        case 2:
          $location.url('/wireless/guestWifiSetup/basic');
          break;
        default:
          $location.url('/wireless/guestWifiSetup/basic');
          break;
        }
      }
      $scope.getActive = function(){
        return $scope.currentTab;
      }
    }
  ])


  .controller('GuestWifiSetupCtrl', ['$scope', '$route', '$location', 'Wireless', 'GuestDevices', 'GuestPassDevices', 'Devices', '$rootScope', 'securityTips',
    function($scope, $route, $location, Wireless, GuestDevices, GuestPassDevices, Devices, $rootScope, securityTips) {

    $scope.bothDisable=false;
    $scope.pageToShow = 0;
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;

    $scope.refresh = function() {
      $scope.guestDevices = null;
      $scope.wireless= Wireless.query(function(){
        $scope.basicGuestWifi = $scope.wireless[$scope.guestWifiEnum.BASIC_GUEST_WIFI];
        if($scope.basicGuestWifi.enabled){
          $scope.guestDevices = Devices.query(function(){
            for(var i = 0; i < $scope.guestDevices.length; i++) {
              $scope.guestDevices[i].toDisplay = false;
              if($scope.guestDevices[i].connectionType == 6){
                if($scope.basicGuestWifi.enabled){
                  $scope.guestDevices[i].ssid = $scope.basicGuestWifi.ssid;
                }
                $scope.guestDevices[i].toDisplay = true;
                setDeviceStyle($scope.guestDevices[i], '');
              }
            }
          })
        }else{
          $scope.bothDisable = true;
        }
      });
      $scope.togglePage(0);
    };

    $scope.togglePage = function(num) {
      $scope.pageToShow = num;
      window.scrollTo(0,0);
    };

    $scope.refresh();

    $scope.toggleOnOffSave = function(device){
      device.blocked = !device.blocked;
      Devices.update({id:device.id}, device, function() {
        $scope.refresh();
      });
    };
  }])

.controller('BasicGuestCtrl', ['$scope', '$route', '$location', 'Wireless', 'GuestDevices', 'WPA', 'securityTips', '$sce', '$rootScope', 'Devices',
    function($scope, $route, $location, Wireless, GuestDevices, WPA, securityTips, $sce, $rootScope, Devices) {

    $scope.warningFlag=false;
    $scope.pageToShow = 0;
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $scope.keySet=false;
    $scope.showPassword=true;
    $rootScope.editingGuest=false;
    $rootScope.guestHasChanges=false;
    //$scope.processGuestWiFi = false;
    $scope.countDownPopup = null;
    $scope.fakeTimer = false;

    $scope.listener = null;

    $scope.tempWPAkey = '';

    $scope.togglePage = function(num) {
      $scope.pageToShow = num;
      window.scrollTo(0,0);
    };

    $scope.refresh = function() {
      $scope.showPassword=true;
      $scope.wireless= Wireless.query(function(){
        $scope.wirelessA = $scope.wireless[0];
        $scope.wirelessB = $scope.wireless[1];
        $scope.basicGuestWifi = $scope.wireless[$scope.guestWifiEnum.BASIC_GUEST_WIFI];
        $scope.basicGuestWifi.ssid = ($scope.basicGuestWifi.ssid);
        $scope.tempWPAkey = '';
        //$scope.processGuestWiFi = false;
        if(undefined != $scope.basicGuestWifi && null != $scope.basicGuestWifi)
        {
          $scope.guestDevices = Devices.query(function() {
            $scope.guestDevices = filterOutNonGuest($scope.guestDevices);
          });
          $scope.wpa = WPA.get({id: $scope.guestWifiEnum.BASIC_GUEST_WIFI}, function() {
            if(undefined != $scope.wpa.key){
              $scope.wpa.key = ($scope.wpa.key);
              $scope.tempWPAkey = $sce.trustAsHtml($scope.convertKey($scope.wpa.key));
              if('' !== $scope.wpa.key)
                $scope.keySet = true;
              else
                $scope.keySet = false;
            }
          });
        }
        if((undefined != $scope.basicGuestWifi && null != $scope.basicGuestWifi && !$scope.basicGuestWifi.enabled))
        {
          $scope.warningFlag = true;
        }else
        {
          $scope.warningFlag = false;
        }
      })
      $scope.mainRefresh();
      $scope.togglePage(0);
    };

    $scope.convertKey = function(val){
      var str = "";
      if(val){
        for(var i = 0; i < val.length; i ++){
          str += "&bull;";
        }
      }
      str = unescape(str);
      return str;
    }

    $scope.refresh();

    $scope.toggleOnOffSave = function(){

      /*if ($scope.processGuestWiFi) {
        return;
      }
      $scope.processGuestWiFi = true;*/

      if(!$scope.wirelessA.radioEnabled){
        securityTips.showWirelease24GPrompt('','').then(function (result) {
          //$scope.processGuestWiFi = false;
        });
      }else{
        if(!$scope.basicGuestWifi.enabled)
        {
          if(!$scope.keySet){
            $scope.showAutoConnectMsg(2, '');
          }else{
            $scope.showAutoConnectMsg(0, '');
          }
        }else{
          $scope.showAutoConnectMsg(1, '');
        }
      }
    };

    $scope.showAutoConnectMsg = function(type, resultObj){
      securityTips.showAutoConnectMsgGuest('', '').then(function (resultObj1) {
        if (resultObj1 == 'cancel') {
          $scope.refresh();
        }else{
          if(type == 0){
            $scope.saveSettings(true);
          }else if(type == 1){
            $scope.basicGuestWifi.enabled = false;
            $scope.saveToggle(true);
          }else if(type == 2){
            $scope.showKeyForm();
          }
        }
      });
    }

    $scope.saveSettings = function(fromDirectPopup){
      $scope.basicGuestWifi.enabled = true;
      $scope.saveToggle(fromDirectPopup);
    }

    $scope.saveToggle = function(fromDirectPopup){
      if($scope.wirelessA.radioEnabled){
        $scope.basicGuestWifi.radioFreq = 1;
      }else{
        $scope.basicGuestWifi.radioFreq = -1;
      }
      clearTimeout($scope.fakeTimer);
      $scope.countDownPopup = securityTips.showSavingNow('Save Settings', 'Saving your settings. Please wait...');
      $scope.countDownPopup.open();
      $scope.fakeTimer = window.setTimeout($scope.closeCountDownPopup1,15000);
      Wireless.update({id: $scope.guestWifiEnum.BASIC_GUEST_WIFI},$scope.basicGuestWifi,function(){
        if(fromDirectPopup){
          $scope.refresh();
        }else{
          $scope.saveWifiKey();
        }
      });
    };

    $scope.showKeyForm = function(){
      securityTips.showCreateGuestWifiPassword('Create Password',
      'Please create a password to activate your Guest Wi-Fi.',
      $scope.wpa).then(function (resultObj) {
        if (resultObj.result == 'cancel') {
          $scope.refresh();
        }else{
          var error = false;
          if(resultObj.returnObj == undefined){
            error = true;
          }else{
            $scope.wpa.key = resultObj.returnObj;
            if(($scope.wpa.key.length < 8 || $scope.wpa.key.length > 63))
            {
              error = true;
            }
          }
          if(error){
            $scope.openValidationPopup();
          }else{
            WPA.update({id: $scope.guestWifiEnum.BASIC_GUEST_WIFI}, {wpaShowKeyInUI: resultObj.wpaShowKeyInUI}, function() {
              $scope.saveSettings(false);
            });
          }
        }
      });
    };

    $scope.openValidationPopup = function(){
      securityTips.showWarningMsgGuestWifi('',
        'Password has to be at least 8 characters long',false,
        ['']).then(function (result) {
          if (result == 'ok') {
            $scope.showKeyForm();
          }else{
            //$scope.processGuestWiFi = false;
          }
        });
    };

    $scope.openValidationPopup1 = function(){
      securityTips.showWarningMsgGuestWifi('',
        'Password has to be at least 8 characters long',false,
        ['']).then(function (result) {
        });
    };

    $scope.openValidationPopup2 = function(){
      securityTips.showWarningMsgGuestWifi('',
        'SSID must be 1 to 64 characters',false,
        ['']).then(function (result) {
        });
    };

    $scope.openValidationPopup3 = function(){
      securityTips.showWarningMsgGuestWifi2('',
        'SSID must be 1 to 64 characters',false,
        ['']).then(function (result) {
        });
    };

    $scope.saveWifiKey = function(){
      $scope.wpa.encryptionAlgorithm = parseInt($scope.wpa.encryptionAlgorithm);
      WPA.update({id: $scope.guestWifiEnum.BASIC_GUEST_WIFI}, {type: $scope.wpa.type, mode: $scope.wpa.mode, encryptionAlgorithm: $scope.wpa.encryptionAlgorithm,
        groupKeyUpdateInterval: $scope.wpa.groupKeyUpdateInterval, groupKeyUpdateIntervalEnabled:
        $scope.wpa.groupKeyUpdateIntervalEnabled, key: ($scope.wpa.key)}, function() {

      });
    }

    $scope.editWifiSettings = function(){
      $rootScope.editingGuest = true;
      $rootScope.guestHasChanges=false;
    };

    $scope.saveWifiSettings = function(){
      var error = false;
      var error1 = false;
      if(($scope.wpa.key.length < 8 || $scope.wpa.key.length > 63)){
        error = true;
      }
      if($scope.basicGuestWifi.ssid.length < 1 || $scope.basicGuestWifi.ssid.length > 64
        || !/^[0-9a-zA-Z\!\"\#\$\%\&\u2019\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~\ ]+$/i.test($scope.basicGuestWifi.ssid)){
        error1 = true;
      }
      if(error1 && error){
        $scope.cancelRedirect();
        $scope.openValidationPopup3();
      }else if(error1){
        $scope.cancelRedirect();
        $scope.openValidationPopup2();
      }else if(error){
        $scope.cancelRedirect();
        $scope.openValidationPopup1();
      }else{
        $scope.basicGuestWifi.ssid = ($scope.basicGuestWifi.ssid);
        clearTimeout($scope.fakeTimer);
        $scope.countDownPopup = securityTips.showSavingNow('Save Settings', 'Saving your settings. Please wait...');
        $scope.countDownPopup.open();
        $scope.fakeTimer = window.setTimeout($scope.closeCountDownPopup,15000);
        Wireless.update({id: $scope.guestWifiEnum.BASIC_GUEST_WIFI},$scope.basicGuestWifi,function(){
          WPA.update({id: $scope.guestWifiEnum.BASIC_GUEST_WIFI}, {wpaShowKeyInUI: $scope.wpa.wpaShowKeyInUI}, function() {
            $scope.saveWifiKey();
          });
        });
      }
    };

    $scope.closeCountDownPopup1 = function(){
      $scope.countDownPopup.close();
      $scope.countDownPopup = null;
      $scope.basicGuestWifi.ssid = '';
      $scope.refresh();
      $rootScope.editingGuest = false;
    }

    $scope.closeCountDownPopup = function(){
      $scope.countDownPopup.close();
      $scope.countDownPopup = null;
      if($rootScope.locationChangeActivate){
        $scope.redirect();
      }else{
        $scope.basicGuestWifi.ssid = '';
        $scope.refresh();
        $rootScope.editingGuest = false;
      }
    }

    $scope.cancel = function(){
      $scope.refresh();
      $rootScope.editingGuest = false;
      $rootScope.guestHasChanges=false;
    };

    $scope.change = function(){
      $rootScope.guestHasChanges=true;
    }

    $scope.saveContents1Function = function(event) {
      $scope.saveWifiSettings();
    }
    $scope.listener = $rootScope.$on('saveContents1', $scope.saveContents1Function);

    $scope.$on('$destroy', function() {
      $scope.listener();
    })

    $scope.redirect = function(){
      $rootScope.locationChangeActivate = false;
      $rootScope.editingGuest = false;
      $rootScope.guestHasChanges = false;
      if(getNextLocationForLocationChangeSub($rootScope.locationChangeNext) == ""){
        $location.path(getNextLocationForLocationChange($rootScope.locationChangeNext));
      }else{
        $location.path(getNextLocationForLocationChange($rootScope.locationChangeNext)).search(getNextLocationForLocationChangeSub($rootScope.locationChangeNext));
      }
    }
    
    $scope.toggleShowPassword = function(){
      WPA.update({id: $scope.guestWifiEnum.BASIC_GUEST_WIFI}, {wpaShowKeyInUI: $scope.wpa.wpaShowKeyInUI}, function() {
      });
    }

    $scope.cancelRedirect = function(){
      $rootScope.locationChangeActivate = false;
    }
  }])

.controller('BasicGuestCtrlPopup', ['$scope', 'WPA','model','dialog',
    function($scope, WPA, model, dialog) {
    $scope.key = model.key;
    $scope.wpaPopup = model.wpa;

    $scope.buttons = model.buttons;
    $scope.title = model.title;
    $scope.message = model.message;

    $scope.close = function (rslt) {
      var resultObj= {result:rslt,returnObj:$scope.key,wpaShowKeyInUI:$scope.wpaPopup.wpaShowKeyInUI};
      dialog.close(resultObj);
    };
}])

.controller('GuestPassWifiCtrl', ['$scope', '$route', '$location', 'Wireless', 'GuestPassDevices', 'securityTips', 'Devices', '$rootScope',
    function($scope, $route, $location, Wireless, GuestPassDevices, securityTips, Devices, $rootScope) {

    $scope.warningFlag=false;
    $scope.pageToShow = 0;
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    $rootScope.editingGuest=false;
    $rootScope.guestHasChanges=false;
    $scope.listener = null;
    //$scope.processGuestPassWiFi = false;
    $scope.countDownPopup = null;
    $scope.fakeTimer = null;

    $scope.togglePage = function(num) {
      $scope.pageToShow = num;
      window.scrollTo(0,0);
    };

    $scope.refresh = function() {
      $scope.wireless= Wireless.query(function(){
        $scope.wirelessA = $scope.wireless[0];
        $scope.wirelessB = $scope.wireless[1];
        $scope.basicGuestWifi = $scope.wireless[$scope.guestWifiEnum.BASIC_GUEST_WIFI];
        $scope.guestPassWifi = $scope.wireless[$scope.guestWifiEnum.GUEST_PASS];
        $scope.guestPassWifi.ssid = ($scope.guestPassWifi.ssid);
        //$scope.processGuestPassWiFi = false;
        if(undefined != $scope.guestPassWifi && null != $scope.guestPassWifi)
        {
          $scope.guestDevices = Devices.query(function() {
            $scope.guestDevices = filterOutNonGuest($scope.guestDevices);
          });
        }
        if((undefined != $scope.guestPassWifi && null != $scope.guestPassWifi && !$scope.guestPassWifi.enabled) &&
          (undefined != $scope.basicGuestWifi && null != $scope.basicGuestWifi && $scope.basicGuestWifi.enabled))
        {
          $scope.warningFlag = true;
        }else
        {
          $scope.warningFlag = false;
        }
      })
      $scope.mainRefresh();
      $scope.togglePage(0);
    };

    $scope.refresh();

    $scope.toggleOnOffSave = function(){
      /*if ($scope.processGuestPassWiFi) {
        return;
      }
      $scope.processGuestPassWiFi = true;*/

      if(!$scope.wirelessA.radioEnabled){
        securityTips.showWirelease24GPrompt('','').then(function (result) {
          //$scope.processGuestPassWiFi = false;
        });
      }else{
        if(!$scope.guestPassWifi.enabled)
        {
          if($scope.basicGuestWifi.enabled)
          {
            securityTips.showWarningMsgGuestWifi3('',
              'This will disable Basic Guest Wi-Fi and open your Wi-Fi to an unsecure security model.',true,
              ['']).then(function (result) {
              if (result == 'cancel') {
                  //$scope.processGuestPassWiFi = true;
              }else{
                $scope.guestPassWifi.enabled = true;
                $scope.basicGuestWifi.enabled = false;
                $scope.saveToggle();
              }
            });
          }else{
            $scope.guestPassWifi.enabled = true;
            $scope.saveToggle();
          }
        }else{
          $scope.guestPassWifi.enabled = false;
          $scope.saveToggle();
        }
      }
    };

    $scope.saveToggle = function(){
      if($scope.wirelessA.radioEnabled){
        $scope.basicGuestWifi.radioFreq = 1;
      }else{
        $scope.basicGuestWifi.radioFreq = -1;
      }
      if($scope.wirelessA.radioEnabled){
        $scope.guestPassWifi.radioFreq = 1;
      }else{
        $scope.guestPassWifi.radioFreq = -1;
      }
      $scope.guestPassWifi.ssid = ($scope.guestPassWifi.ssid);
      clearTimeout($scope.fakeTimer);
      $scope.countDownPopup = securityTips.showSavingNow('Save Settings', 'Saving your settings. Please wait...');
      $scope.countDownPopup.open();
      $scope.fakeTimer = window.setTimeout($scope.closeCountDownPopup,15000);
      Wireless.update({id: $scope.guestWifiEnum.GUEST_PASS},$scope.guestPassWifi,function(){
      });
    };

    $scope.closeCountDownPopup = function(){
      $scope.countDownPopup.close();
      $scope.countDownPopup = null;
      if($rootScope.locationChangeActivate){
        $scope.redirect();
      }else{
        $scope.guestPassWifi.ssid = '';
        $scope.refresh();
        $rootScope.editingGuest = false;
      }
    }

    $scope.editWifiSettings = function(){
      $rootScope.editingGuest = true;
      $rootScope.guestHasChanges=false;
    };

    $scope.openValidationPopup2 = function(){
      securityTips.showWarningMsgGuestWifi('',
        'SSID must be 1 to 64 characters',false,
        ['']).then(function (result) {
        });
    };

    $scope.saveWifiSettings = function(){
      var error = false;
      if($scope.guestPassWifi.ssid.length < 1 || $scope.guestPassWifi.ssid.length > 64
        || !/^[0-9a-zA-Z\!\"\#\$\%\&\u2019\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~\ ]+$/i.test($scope.guestPassWifi.ssid)){
        error = true;
      }
      if(error){
        $scope.cancelRedirect();
        $scope.openValidationPopup2();
      }else{
        $scope.saveToggle();
      }
    };

    $scope.cancel = function(){
      $scope.refresh();
      $rootScope.editingGuest = false;
      $rootScope.guestHasChanges=false;
    };

    $scope.change = function(){
      $rootScope.guestHasChanges=true;
    }

    $scope.saveContents2Function = function(event) {
      $scope.saveWifiSettings();
    }

    $scope.listener = $rootScope.$on('saveContents2', $scope.saveContents2Function);

    $scope.$on('$destroy', function() {
      $scope.listener();
    })

    $scope.redirect = function(){
      $rootScope.locationChangeActivate = false;
      $rootScope.editingGuest = false;
      $rootScope.guestHasChanges = false;
      if(getNextLocationForLocationChangeSub($rootScope.locationChangeNext) == ""){
        $location.path(getNextLocationForLocationChange($rootScope.locationChangeNext));
      }else{
        $location.path(getNextLocationForLocationChange($rootScope.locationChangeNext)).search(getNextLocationForLocationChangeSub($rootScope.locationChangeNext));
      }
    }

    $scope.cancelRedirect = function(){
      $rootScope.locationChangeActivate = false;
    }
}]);

