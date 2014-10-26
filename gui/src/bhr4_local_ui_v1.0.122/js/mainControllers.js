'use strict';

/* Controllers */

var systemSettings = null;

angular.module('main.controllers', [])
  .controller('MainCtrl', ['$scope', '$route', 'Devices', 'NetworkConnections', 'FirmwareUpgrade', 'Logout', '$location', 'SystemSettings', 'securityTips',
                           function($scope, $route, Devices, NetworkConnections, FirmwareUpgrade, Logout, $location, SystemSettings, securityTips) {
    $scope.tab = $route.current.tab;
    $scope.hasFailedLogin = false;
    $scope.failedLogin = 0;
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
        setDeviceStyle($scope.devices[i], '');
        $scope.devices[i] = checkDeviceIP($scope.devices[i]);
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

    $scope.fwInfo = FirmwareUpgrade.get();
    var ipString ='';
    $scope.ipString2 ='';
    $scope.ArrStr = [];
    $scope.broadband = null;
    $scope.hasMoreLen = false;
    var connections = NetworkConnections.query(function() {
      for(var i = 0; i < connections.length; i++) {
        if(connections[i].type==1) {
          $scope.hasMoreLen = false;
          $scope.broadband = connections[i];
          var tmpArr=$scope.broadband.ipv6Address.split(":");
          for (var x =0; x < tmpArr.length; x++){
            ipString = ipString + tmpArr[x] + ":";
            if (x < 4){
              $scope.ArrStr.push(ipString);
            }
          }
          if(tmpArr.length > 4){
            $scope.hasMoreLen = true;
          }
          for (var y = 4; y < tmpArr.length; y++){
            $scope.ipString2 = $scope.ipString2 + tmpArr[y] + ":";
          }
          $scope.ipString2 = $scope.ipString2.substring(0, $scope.ipString2.length - 1);
          return;
        }
      }
    });

    $scope.systemSettings = SystemSettings.get(function() {
      $scope.hasFailedLogin = false;
      $scope.failedLogin = $scope.systemSettings.previousFailedLogins;
      if($scope.failedLogin > 0){
        $scope.hasFailedLogin = true;
      }
    });

    $scope.noConnection = function() {
      securityTips.showCustomMessage3('Warning',
        ["You need to be connected to the internet to view the User Guide"]);
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
  .controller('empty', ['$scope', '$route', 'Login', 
    function ($scope, $route, Login) {
    $scope.tab = $route.current.tab;
    $scope.section = $route.current.section;
    //This is supposed to be EMPTY, HENCE THE NAME
    //TODO:This should be handled by the cherokee server on the board but until then ping login to verify credentials still valid
    Login.get();
  }])
  .controller('LoginCtrl', ['$scope', '$rootScope', '$location', '$routeParams', 'Login', 'SystemSettings', '$timeout',
    function($scope, $rootScope, $location, $routeParams, Login, SystemSettings, $timeout) {
    $scope.cookiesEnabled = ("cookie" in document && (document.cookie.length > 0 ||
    (document.cookie = "test").indexOf.call(document.cookie, "test") > -1))
    if (!$scope.cookiesEnabled && detectIE())
    {
        checkhostUrl($location.$$host) ? $scope.isUrlError = true : $scope.isUrlError = false;
    }
    function checkhostUrl(url) {
        if (url.indexOf('_') != -1) {
            return true
        } else {
            return false;
        }
    }
    function detectIE() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        var trident = ua.indexOf('Trident/');

        if (msie > 0) {
        // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }
        if (trident > 0) {
           // IE 11 (or newer) => return version number
           var rv = ua.indexOf('rv:');
             return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        // other browser
        return false;
      }
    if(!$scope.cookiesEnabled) {
        $scope.retry = function() {
            location.reload();
        };
        return;
    }
    $scope.username = 'admin';
    $scope.password = '';
    $scope.showError = false;
    $scope.showTimeout = false;
    $scope.loggingIn = false;
    $scope.showPassword = false;
    $scope.setupRedirect = true;
    $scope.requirePassword = true;
    $scope.isWireless = false;
    $scope.showPasswordForm = true;
    if($routeParams.setup)
      $scope.setupRedirect = $routeParams.setup;
    //Check if already logged in
    if($routeParams.fromlogout != null){
      $scope.showError = true;
      $scope.errorMessage = "User has logged out, please login again.";
    }
    Login.get(function() {
      if(systemSettings == null) {
        systemSettings = SystemSettings.get(function() {
          $rootScope.loggedIn = true;
          if(!$rootScope.nextLocation || $rootScope.nextLocation == '/login')
            $location.path('/main');
          else
            $location.path($rootScope.nextLocation);
          $location.replace();
        });
      } else {
        $rootScope.loggedIn = true;
        if(!$rootScope.nextLocation || $rootScope.nextLocation == '/login')
          $location.path('/main');
        else
          $location.path($rootScope.nextLocation);
        $location.replace();
      }
    }, function(response) {
      $scope.loggingIn = true;
      $scope.timeout1 = false;
      $scope.timeout24 = false;
      switch(response.data.error) {
      case 1:
        $scope.showError = true;
        if($routeParams.rebooting != null){
          $scope.errorMessage = "Wireless Broadband Router is up again, please login:";
        }else{
          $scope.errorMessage = "Connection has expired, please login again:";
        }
      default:
        {
          $scope.passwordSalt = response.data.passwordSalt;
          if(response.data.requirePassword == true || response.data.requirePassword == false)
            $scope.requirePassword = response.data.requirePassword;
          if(response.data.isWireless == true || response.data.isWireless == false)
            $scope.isWireless = response.data.isWireless;
          if(!$scope.isWireless && !$scope.requirePassword){
            $scope.showPasswordForm = false;
          }else{
            $scope.showPasswordForm = true;
          }
          if(response.data.doSetupWizard && $scope.setupRedirect !== 'false') {
            $location.path('/setup');
            return;
          }else{
            switch(response.data.denyState) {
            case 1:
                $scope.timeout1 = true;
                $timeout(function(){
                  $scope.timeout1 = false;
                  $scope.showError = false;
                },(Number(response.data.denyTimeout) * 60000));
                $scope.showError = true;
                $scope.errorMessage = "Login has been disabled for 1 minute. If you have not changed your password, you can find it on the router’s sticker.";
                $scope.password = "";
                break;
              case 2:
                $scope.timeout24 = true;
                $timeout(function(){
                  $scope.timeout24 = false;
                  $scope.showError = false;
                },(Number(response.data.denyTimeout) * 60000));
                $scope.showError = true;
                $scope.errorMessage = "Login has been disabled for 24 hours. Please wait 24 hours before trying again, or call Verizon for a password reset";
                $scope.password = "";
                break;
            }
          }
        }
        break;
      }          
    });

    $scope.handleKeyPress = function(key) {
      if(key==13)
        $scope.login();
    };

    $scope.login = function() {
      var loginInfo = new Object();
      loginInfo.password = CryptoJS.SHA512($scope.password + $scope.passwordSalt).toString();
      Login.save({}, loginInfo, function() {
        //SUCCESS
        systemSettings = SystemSettings.get(function() {
          $rootScope.loggedIn = true;
          if(!$rootScope.nextLocation || $rootScope.nextLocation == '/login')
            $location.path('/main');
          else
            $location.path($rootScope.nextLocation);
          $location.search({});
          $location.replace();
        });
      }, function(response) {
        //ERROR
        $scope.showError = true;
        $scope.timeout24 = false;
        $scope.timeout1 = false;
        switch(response.data.denyState) {
          case 1:
            $scope.timeout1 = true;
            $timeout(function(){
              $scope.timeout1 = false;
              $scope.showError = false;
            },(Number(response.data.denyTimeout) * 60000));
            $scope.errorMessage = "Login has been disabled for 1 minute. If you have not changed your password, you can find it on the router’s sticker.";
            $scope.password = "";
            break;
          case 2:
            $scope.timeout24 = true;
            $timeout(function(){
              $scope.timeout24 = false;
              $scope.showError = false;
            },(Number(response.data.denyTimeout) * 60000));
            $scope.errorMessage = "Login has been disabled for 24 hours. Please wait 24 hours before trying again, or call Verizon for a password reset";
            $scope.password = "";
            break;
          default:
            if(response.data.error == 2){
              $scope.errorMessage = "Sessions Number: No more than " + response.data.maxUsers + " sessions at a time are allowed. Please wait until open sessions expire.";
            }else{
              $scope.errorMessage = "Login failed, please try again:";
            }
            $scope.password = "";
            break;
        }
      });
    }
  }])
  .controller('LogoutCtrl', ['$scope', '$location', 'Logout', 
    function($scope, $location, Logout) {
      Logout.get(function() {
        $location.path('/login').search({fromlogout: 'true'});
        $location.replace();
      });
    }])
  .controller('SetupCtrl', ['$scope', '$location', 'Login', 'Logout', 'Users', 'Wireless', 'SetupWizard', 'SystemSettings', '$timeout',
    function($scope, $location, Login, Logout, Users, Wireless, SetupWizard, SystemSettings, $timeout) {
      $scope.page = 0;
      $scope.dontShowAgain = false;
      $scope.notConnected = false;
      var tmpTime = 0;

      Logout.get(function() {
        Login.get(function() {
        }, function(response) {
          $scope.passwordSalt = response.data.passwordSalt;
          $scope.isWireless = response.data.isWireless;
          $scope.timeout1 = false;
          $scope.timeout24 = false;
          switch(response.data.denyState) {
            case 1:
              $scope.timeout1 = true;
              $timeout(function(){
                $scope.timeout1 = false;
                $scope.errorMessage = "";
              },(Number(response.data.denyTimeout) * 60000));
              break;
            case 2:
              $scope.timeout24 = true;
              $timeout(function(){
                $scope.timeout24 = false;
                $scope.errorMessage = "";
              },(Number(response.data.denyTimeout) * 60000));
              break;
          }
        });
      })
      $scope.print = function() {
        window.print();
      }
      
      $scope.handlePassKeyUp = function(key) {
        if(key==13)
          $scope.login();
      };

      $scope.doLater = function() {
        if($scope.dontShowAgain) {
          Login.update({doSetupWizard: false}, function() {
            $location.path('/login');
          });
        } else {
          $location.path('/login').search({setup: 'false'});
        }
      }

      $scope.getStarted = function() {
        $scope.setLoginSection();
      };

      $scope.loginCancelSetup = function(){
        $location.path('/login').search({setup: 'false'});
      }

      //Login
      $scope.setLoginSection = function() {
        $scope.page = 1;
        $scope.password = '';
        $scope.showPassword = false;
        $scope.errorMessage = "";
        if($scope.timeout24){
          $scope.errorMessage = "Login has been disabled for 24 hours. Please wait 24 hours before trying again, or call Verizon for a password reset";
        }
        if($scope.timeout1){
          $scope.errorMessage = "Login has been disabled for 1 minute. If you have not changed your password, you can find it on the router’s sticker.";
        }
      }

      $scope.login = function() {
        var loginInfo = new Object();
        loginInfo.password = CryptoJS.SHA512($scope.password + $scope.passwordSalt).toString();
        Login.save({}, loginInfo, function() {
          //SUCCESS
          systemSettings = SystemSettings.get(function() {
            $scope.setEditSection();
          })
        }, function(response) {
          //ERROR
          $scope.timeout1 = false;
          $scope.timeout24 = false;
          switch(response.data.denyState) {
            case 1:
              $scope.timeout1 = true;
              $timeout(function(){
                $scope.timeout1 = false;
                $scope.errorMessage = "";
              },(Number(response.data.denyTimeout) * 60000));
              $scope.errorMessage = "Login has been disabled for 1 minute. If you have not changed your password, you can find it on the router’s sticker.";
              $scope.password = "";
              break;
            case 2:
              $scope.timeout24 = true;
              $timeout(function(){
                $scope.timeout24 = false;
                $scope.errorMessage = "";
              },(Number(response.data.denyTimeout) * 60000));
              $scope.errorMessage = "Login has been disabled for 24 hours. Please wait 24 hours before trying again, or call Verizon for a password reset";
              $scope.password = "";
              break;
            default:
              if(response.data.error == 2){
                $scope.errorMessage = "Sessions Number: No more than " + response.data.maxUsers + " sessions at a time are allowed. Please wait until open sessions expire.";
              }else{
                $scope.errorMessage = "Login failed, please try again:";
              }
              $scope.password = "";
              break;
          }
        });
      }
      //End login

      //Editing Section
      $scope.setEditSection = function() {
        $timeout(function() {
          $scope.showErrorPage = false;
          $scope.page = 2;
          $scope.isNewPassword = false;
          $scope.isNewSsid = false;
          $scope.isNewWifiPw = false;
          $scope.newPassword = $scope.password;
          $scope.rePassword = "";
          $scope.wireless = Wireless.get({id: 0}, function() {
            $scope.wireless.ssid = unescape($scope.wireless.ssid);
            $scope.oldSsid = $scope.wireless.ssid;
            $scope.dispSecurity = "WPA2 Key";
            $scope.secKey = $scope.wireless.security.wpa.key;
            $scope.oldKey = $scope.secKey;
          });
          $scope.modifyWifi = false;
        $scope.secType = 3;
        }, 200);
      }

      $scope.setMaxlength = function(val) {
        if (Number(val) === 1)
          return 13;
        else
          return 63;
      }

      $scope.secChanged = function() {
        if($scope.secType == 0) {
          $scope.dispSecurity = "WPA2 Key";
          $scope.secKey = $scope.wireless.security.wpa.key;
        } else if($scope.secType == 1) {
          $scope.dispSecurity = "WEP Key";
          $scope.secKey = $scope.wireless.security.wep.settings[0].key;
        } else if($scope.secType == 3) {
          $scope.dispSecurity = "WPA2 Key";
          $scope.secKey = $scope.wireless.security.wpa.key;
        } else {
          $scope.dispSecurity = "None";
          $scope.secKey = '';
        }
        $scope.oldKey = $scope.secKey;
        $scope.isNewWifiPw = false;
      }

      $scope.handleKeyPress = function() {
        $scope.isNewPassword = $scope.password !== $scope.newPassword;
      };
      $scope.handleSsidChange = function() {
        $scope.isNewSsid = $scope.oldSsid !== $scope.wireless.ssid;
      };
      $scope.handleWifiPwChange = function() {
        $scope.isNewWifiPw = $scope.oldKey !== $scope.secKey;
      };
      $scope.editWifi = function() {
        $scope.modifyWifi = true;
      }
      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }
      $scope.acceptSettings = function() {
        $scope.errorMessages = [];

        var secObj = {security:{}};
        if($scope.isNewSsid) {
          secObj.ssid = escape($scope.wireless.ssid);
          //if($scope.wireless.ssid.length < 1 || $scope.wireless.ssid.length > 32 || !/^[0-9A-Z\ \_\-]+$/i.test($scope.wireless.ssid))
          if($scope.wireless.ssid.length < 1 || $scope.wireless.ssid.length > 64 || !/^[0-9a-zA-Z\!\"\#\$\%\&\u2019\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~\ ]+$/i.test($scope.wireless.ssid))//TODO: Use above line since this change is only being made for the wifi alliance test
            $scope.errorMessages.push("Service Set Identifier must consist of 1 to 64 characters and must not contain any special character.");
        }
        secObj.security.enabled = $scope.secType != 2;
        if(secObj.security.enabled) {
          if($scope.secType == 1){
            secObj.security.type = 0;
          }else if($scope.secType == 0){
            secObj.security.type = 1;
          }else if($scope.secType == 3){
            secObj.security.type = 2;
          }//WPA2 = 2, WEP = 0
          if($scope.secType==0 || $scope.secType==3) {
            secObj.security.wpa = {key: $scope.secKey};
            /*if($scope.secKey == 0 || !/[a-z]{1,}.*[0-9]{1,}?|[0-9]{1,}.*[a-z]{1,}?/i.test($scope.secKey))
              $scope.errorMessages.push("Pre-Shared Key: You must include at least one letter and at least one number in your Pass-Phrase.");
            else*/ if($scope.secKey.length < 8)
              $scope.errorMessages.push("Pre-Shared Key: Pass-Phrase has to be at least 8 characters long.")
          } else {
            secObj.security.wep = {activeSetting: 0, settings:[{key:$scope.secKey, keyLength: 1, entryMethod: 1}]};
            if($scope.secKey.length != 13){
              $scope.errorMessages.push("The WEP key must be a string of 13 characters.");
            }else{
              if(!/[\x21-\x7E]{13}$/i.test($scope.secKey)){
                $scope.errorMessages.push("Invalid WEP Key. Only ASCII characters are allowed.");
              }
            }
          }
        }
        if($scope.isNewPassword) {
          if($scope.newPassword != $scope.rePassword)
            $scope.errorMessages.push("Passwords do not match.")
          else if($scope.newPassword.length == 0)
            $scope.errorMessages.push("A password must be specified.")
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          return;
        }
        if($scope.isNewPassword) {
          var salt = uuid();
          var newPass = CryptoJS.SHA512($scope.newPassword + salt).toString();
          SetupWizard.update({}, {wifi:secObj, password: newPass, salt: salt})
        } else
          SetupWizard.update({}, {wifi:secObj})
        $scope.page=4;
      }

      //Confirmation page
      $scope.confirmSettings = function() {
        if(!$scope.isWireless){
          $location.path('/main');
        }else{
          if($scope.isNewSsid === false && $scope.isNewWifiPw === false)
            $location.path('/main');
          else
            $scope.page = 5;
        }
      }

      $scope.checkConnection = function() {
        $scope.page = 5;
        $scope.notConnected = true;
        SystemSettings.get(function() {
          $timeout(function(){
            $scope.page = 7;
          },2000);
        }, function(response) {
          if(response.status != 200){
            tmpTime++;
            if (tmpTime == 3){
              $scope.page = 6;
              tmpTime = 0;
            }else{
              window.setTimeout($scope.checkConnection,2000);
            }
          }
        });
      }

      $scope.keyPress = function(keyEvent) {

        if (keyEvent.keyCode == 13){
          switch($scope.page) {
            case 0:
              $scope.getStarted();
              break;
            case 1:
              $scope.login();
              break;
            case 2:
              $scope.acceptSettings();
              break;
            case 3:
              //
              break;
            case 4:
              $scope.confirmSettings();
              break;
            case 5:
              $scope.checkConnection();
              break;
            case 6:
              $scope.checkConnection();
              break;
            case 7:
              $location.path('/main');
              break;
            default:
              break;
          }
        }
      };

    }]);
