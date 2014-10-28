'use strict';

var from = "#/advanced";

angular.module('advanced.controllers', [])
  .controller('basicAdvancedCtrl', ['$scope', '$route', '$routeParams', '$location',
    function($scope, $route, $routeParams, $location) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.warning = false;
      if($routeParams.warn != null) {
        $scope.warning = true;
      }
      $scope.acceptWarning = function() {
        $location.search({});
        $location.replace();
      }
    }])
  .controller('dhcpCtrl', ['$scope', '$route', '$routeParams', 'DhcpSettings', 'NetworkConnections', '$location',
    function($scope, $route, $routeParams, DhcpSettings, NetworkConnections, $location) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      if($routeParams.from != null)
        from = "#/" + $routeParams.from.replace(new RegExp('_', 'g'), '/');      
      $scope.returnLink = from;
      $scope.dhcpSettings = DhcpSettings.get(function() {
        $scope.dhcpSettings.connection = NetworkConnections.get({id: 0}, function() {
          $scope.dhcpSettings.connection.displayName = unescape($scope.dhcpSettings.connection.name);
        });
      });
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/dhcp'){
            window.history.back();
          }
        }
      };
    }])
  .controller('dhcpEditCtrl', ['$scope', '$route', '$routeParams', '$location', 'DhcpSettings', 'DhcpOptions', 'NetworkConnections',
    function($scope, $route, $routeParams, $location, DhcpSettings, DhcpOptions, NetworkConnections) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.runFocus = false;

      $scope.dhcpOptions = DhcpOptions.query();

      $scope.dhcpSettings = DhcpSettings.get(function() {
        $scope.connection = NetworkConnections.get({id: 0}, function() {
          $scope.connection.name = unescape($scope.connection.name);
        });
        $scope.dhcpStartIpAddress = splitIpArr($scope.dhcpSettings.startIpAddress);
        $scope.dhcpEndIpAddress = splitIpArr($scope.dhcpSettings.endIpAddress);
        var wins = $scope.dhcpSettings.winsServer;
        if(wins.length==0)
          wins = "0.0.0.0";
        $scope.dhcpWinsServer = splitIpArr(wins);
      });

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.save = function() {
        $scope.dhcpSettings.mode = parseInt($scope.dhcpSettings.mode);

        if($scope.dhcpSettings.mode == 2) {
          $scope.errorMessages = validateIPv4DhcpSettings(splitIpArr($scope.connection.ipAddress),
            $scope.dhcpStartIpAddress, $scope.dhcpEndIpAddress, splitIpArr($scope.connection.subnetMask),
            $scope.dhcpWinsServer, $scope.dhcpSettings.leaseTime, null, null, null, null);
          if($scope.errorMessages.length != 0) {
            $scope.showErrorPage = true;
            window.scrollTo(0,0);
            return;
          }
        }
        var ip = getIpString($scope.dhcpWinsServer);
        if(ip != "0.0.0.0" && $scope.dhcpSettings.mode != 0)
          $scope.dhcpSettings.winsServer = ip;
        else
          $scope.dhcpSettings.winsServer = "";
        
        $scope.dhcpSettings.startIpAddress = getIpString($scope.dhcpStartIpAddress);
        $scope.dhcpSettings.endIpAddress = getIpString($scope.dhcpEndIpAddress);
        $scope.dhcpSettings.$update(function() {
          $location.path('/advanced/dhcp');
        });
      };
      $scope.selectOpt= function() {
        $scope.runFocus = true;
      }
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/dhcp/edit'){
            $scope.save();
          }
        }
      };
    }])
  .controller('dhcpConnectionsCtrl', ['$scope', '$route', '$location', 'DhcpConnections', 
    'NetworkConnections', 'Diagnostics', 'DhcpSettings','securityTips',
    function($scope, $route, $location, DhcpConnections, NetworkConnections, Diagnostics, DhcpSettings,securityTips) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.showErrorPage = false;
      $scope.adding = false;
      $scope.showSettings = false;
      $scope.lanIp = '0.0.0.0';
      $scope.runFocus = false;

      $scope.addStaticConnection = function() {
        $scope.name = "new-host";
        $scope.ipAddress = [0,0,0,0];
        $scope.macAddress = ["00","00","00","00","00","00"];
        $scope.adding = true;
        $scope.editing = false;
        $scope.showSettings = true;
        $scope.useStaticIp = true;
        $scope.runFocus = true;
      };

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.saveStaticConnection = function() {
        $scope.errorMessages = [];
        $scope.runFocus = true;
        var showErrorMsg = false;
        if($scope.name.length != 0){
          if (!validateHostNameDHCPConnections($scope.name))
            showErrorMsg = true;
        }else{
          showErrorMsg = true;
        }
        if(showErrorMsg){
          $scope.errorMessages.push("Host Name: Name may not contain spaces. Only letters, digits and the special characters dash (-), underscore (_) and dot (.) may be used. These special characters may not appear at the beginning or at the end of a name. The maximum length of a label (text between two dots) is 63.");
        }

        var mac = getMacString($scope.macAddress);
        var ip = getIpString($scope.ipAddress);
        var lanIpAddr = splitIpArr($scope.lanIp);
        for(var i = 0; i < $scope.devices.length; i++) {
          if($scope.editIndex == i && $scope.editing)
            continue;
          if(ip === $scope.devices[i].ipAddress) {
            $scope.errorMessages.push("IP Address: IP address already exists in Wireless Broadband Router's database.");
            break;
          }
        }
        if(mac == '00:00:00:00:00:00')
          $scope.errorMessages.push("MAC Address: MAC address must consist of 6 fields. Each field's value must be between 00 and FF (in hexadecimal representation), without any spaces. The LSB of the first byte must be zero.");
        checkMacAddress($scope, $scope.macAddress);

        if('0.0.0.0' == ip)
          $scope.errorMessages.push("IP Address: IP address may not be 0.0.0.0. IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces. At least one of the values must be greater than 0.")
        else if(!validateIp($scope.ipAddress))
          $scope.errorMessages.push("IP Address: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
        if($scope.lanIp == ip)
          $scope.errorMessages.push("IP Address: The IP address " + ip + " conflicts with Subnet connection's IP.");
        if($scope.errorMessages.length == 0) {
          var valid = true;
          if(($scope.ipAddress[0] & $scope.subnetMask[0]) != (lanIpAddr[0] & $scope.subnetMask[0]) ||
            ($scope.ipAddress[1] & $scope.subnetMask[1]) != (lanIpAddr[1] & $scope.subnetMask[1]) ||
            ($scope.ipAddress[2] & $scope.subnetMask[2]) != (lanIpAddr[2] & $scope.subnetMask[2]) ||
            ($scope.ipAddress[3] & $scope.subnetMask[3]) != (lanIpAddr[3] & $scope.subnetMask[3]))
            valid = false;
          if(!valid)
            $scope.errorMessages.push("IP Address: The IP address " + ip + " is illegal for any of the connections subnets.");
        }

        if($scope.errorMessages.length == 0 && !validateMac(mac))
          $scope.errorMessages.push("MAC Address: MAC address must consist of 6 fields. Each field's value must be between 00 and FF (in hexadecimal representation), without any spaces. The LSB of the first byte must be zero.");
        if($scope.errorMessages.length == 0) {
          //Check for duplicate name or mac
          for(var i = 0; i < $scope.devices.length; i++) {
            if($scope.editing && i == $scope.editIndex)
              continue;
            if($scope.name === $scope.devices[i].name) {
              $scope.errorMessages.push("Name: Name already exists in Wireless Broadband Router's database.");
              $scope.errorMessages.push('If you are trying to make changes to the lease type on this interface, please edit the host name to make it unique (e.g. "Hostname-Ethernet" or "Hostname-WiFi")');
              break;
            }
          }
          for(var i = 0; i < $scope.devices.length; i++) {
            if($scope.editing && i == $scope.editIndex)
              continue;
            if(mac === $scope.devices[i].mac) {
              $scope.errorMessages.push("MAC Address: MAC Address already exists in Wireless Broadband Router's database.");
              break;
            }
          }
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }

        if($scope.useStaticIp && $scope.showSettings && $scope.ipAdd != ip && !$scope.useStaticIp) {
          securityTips.showMessage('DHCP Connection Update Warning','Changes to the DHCP connections table IP addresses won’t take effect on the actual host table until the client device renews its DHCP lease. You can either wait until the lease expires and is renewed by the client, or you can manually renew the lease on the client.');
        }
        if($scope.editing && mac != $scope.devices[$scope.editIndex].mac) {
          //Mac changed and with how ssm works we need to remove old then add new
          DhcpConnections.remove({clientId: $scope.editIndex}, function() {
            DhcpConnections.save({}, {name: $scope.name,
              ipAddress: ip, mac: mac,
              staticAddress: $scope.useStaticIp},
              function() {
                $scope.adding = false;
                $scope.refresh();
              }
            );
          });
        } else {
          DhcpConnections.save({}, {name: $scope.name,
            ipAddress: ip, mac: mac,
            staticAddress: $scope.useStaticIp},
            function() {
              $scope.adding = false;
              $scope.refresh();
            }
          );
        }
      };

      $scope.doPingTest = function(ind) {
        Diagnostics.save({destination:$scope.devices[ind].ipAddress,count:4}, function() {
          $location.path('/advanced/diagnostics');
        });
      };

      $scope.editConnection = function(ind) {
        $scope.adding = true;
        $scope.editing = true;
        $scope.editIndex = ind;
        var dev = $scope.devices[ind];
        $scope.name = dev.name;
        $scope.ipAddress = splitIpArr(dev.ipAddress);
        $scope.ipAdd = dev.ipAddress;
        $scope.macAddress = splitMacArr(dev.mac);
        $scope.macAdd = dev.mac;
        $scope.useStaticIp = dev.staticCheckbox;
        $scope.showSettings = dev.staticCheckbox;
      };

      $scope.cancelStaticConnection = function() {
        $scope.adding = false;
        $scope.showSettings = false;
      };

      $scope.deleteConnection = function(ind) {
        DhcpConnections.remove({id: 0, clientId: ind}, function() {
          $scope.refresh();
        });
      };

      $scope.refresh = function() {
        var dhcpSettings = DhcpSettings.get(function() {
          $scope.startAddress = splitIpArr(dhcpSettings.startIpAddress);
          $scope.endAddress = splitIpArr(dhcpSettings.endIpAddress);
        });
        $scope.conn = NetworkConnections.get({id: 0}, function() {
            $scope.lanIp = $scope.conn.ipAddress;
            $scope.subnetMask = splitIpArr($scope.conn.subnetMask);
            $scope.conn.displayName = unescape($scope.conn.name);
        })
        $scope.devices = DhcpConnections.query(function() {
          $scope.devices = filterOutGuest($scope.devices);
        });
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/dhcp/connections'){
            if(!$scope.adding && !$scope.showErrorPage){
              $location.path('/advanced/dhcp');
            }else if($scope.adding && !$scope.showErrorPage){
              $scope.saveStaticConnection();
            }
          }
        }
      };
      $scope.refresh();
    }])
  .controller('fwUpgradeCtrl', ['$scope', '$route', 'FirmwareUpgrade', 'Reboot', 'SystemSettings', '$location', '$templateCache', '$timeout',
    function($scope, $route, FirmwareUpgrade, Reboot, SystemSettings, $location, $templateCache, $timeout) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.page = 0;
      $scope.restarting = false;
      $scope.inputfile = null;
      $scope.runFocus = false;


      $scope.fakeTimer = null;
      $scope.fakeCount = 0;
      $scope.fake_percent = 0;

      $scope.$on('$destroy', function() {
        clearTimeout($scope.fakeTimer);
      })

      $scope.fakeTimerFunction = function(){
        clearTimeout($scope.fakeTimer);
        $scope.fakeCount ++;
        if($scope.fakeCount > 60){
          $scope.fakeCount = 0;
        }
        $scope.fake_percent = ($scope.fakeCount / 60) * 100;
        $scope.fake_percent = Math.round($scope.fake_percent);
        $scope.fakeTimer = window.setTimeout($scope.fakeTimerFunction,1000);
        $scope.$apply();
      };

      $scope.refresh = function() {
        $scope.stats = FirmwareUpgrade.get();
      }
      $scope.refresh();

      $scope.errorPageOk = function() {
        $scope.runFocus = true;
        $scope.showErrorPage = false;
        $scope.page = 0;
        window.scrollTo(0,0);
      }

      //I Really hate doing it like this but I've been unable to find
      //a better solution without including a bunch of other libs.
      //TODO: FIXIT
      window.uploadDone = function() {
        if(!$scope.isFileSubmitted)
          return;
        $scope.stats = FirmwareUpgrade.get(function() {
          if($scope.stats.standbyVersion == '' || $scope.stats.standbyVersion == null) {
            $scope.errorMessages = ["Invalid Firmware"];
            $scope.showErrorPage = true;
            window.scrollTo(0,0);
            return;
          }
          $scope.page = 2;
          window.scrollTo(0,0);
        });
      }

      $scope.applyFirmware = function() {
        FirmwareUpgrade.save({executeUpdate: true});
        Reboot.save(function() {
          window.setTimeout($scope.testConnection,0);
        });
        $scope.page = 3;
        $scope.fakeTimerFunction();
        window.scrollTo(0,0);
      }

      $scope.cancelFirmwareUpdate = function() {
        $scope.page = 0;
        window.scrollTo(0,0);
      }

      $scope.submittingFile = function() {
        $scope.isFileSubmitted = true;
      }
      $scope.fileUpgradePage = function() {
        $timeout(function(){
          document.getElementById('submitting').focus()
        },1000);
        $scope.inputfile = null;
        $scope.page = 1;
        window.scrollTo(0,0);
      }
      $scope.testConnection = function() {
        //This should return a 401 if it fails
        //Which auto redirects to /login
        SystemSettings.get(function() {
          window.setTimeout($scope.testConnection,3000);
        }, function(response) {
          if(response.status == 401){
            $scope.restarting = true;
            $templateCache.removeAll();
            clearTimeout($scope.fakeTimer);
            //$location.path('/login').search({rebooting: 'true'});
            window.location = '/redirect.html?v={version_number}';
          }else{
            window.setTimeout($scope.testConnection,3000);
          }
        });
      }
      $scope.chooseFile = function() {
        $timeout(function(){
          document.getElementById('submitting').focus()
        },1000);
      }
      $scope.setFocus = function() {
        $timeout(function(){
            document.getElementById('submitting').focus();
        },500);
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/fwupgrade'){
            if ($scope.page == 0){
              $scope.fileUpgradePage();
            }
          }
        }
      };
    }])
  .controller('fwRestoreCtrl', ['$scope', '$route', 'FirmwareUpgrade', 'Reboot', 'SystemSettings', '$location', '$templateCache',
    function($scope, $route, FirmwareUpgrade, Reboot, SystemSettings, $location, $templateCache) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.valid = false;
      $scope.restarting = false;
      $scope.stats = FirmwareUpgrade.get(function() {
        $scope.valid = $scope.stats.restoreVersion !== '';
      });
      $scope.apply = function() {
        FirmwareUpgrade.save({executeRestore: true});
        Reboot.save(function() {
          window.setTimeout($scope.testConnection,0);
        });
        $scope.page = 3;
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
    }])
  .controller('localAdminCtrl', ['$scope', '$route', '$location', 'LocalAdmin', 'SystemSettings',
    function($scope, $route, $location, LocalAdmin, SystemSettings) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.sysSettings = SystemSettings.get();
      $scope.locAdmin = LocalAdmin.get();
      $scope.save = function() {
        $scope.locAdmin.$update(function() {
          $location.path('/advanced');
        });
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/localadmin'){
            $scope.save();
          }
        }
      };
    }])
  .controller('remoteAdminCtrl', ['$scope', '$route', '$routeParams', '$location', 'RemoteAdmin', 'SystemSettings',
    function($scope, $route, $routeParams, $location, RemoteAdmin, SystemSettings) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.sysSettings = SystemSettings.get();
      $scope.remAdmin = RemoteAdmin.get();

      $scope.fromString = '?from=ad';
      var oldFrom = '';
      $scope.prev = '';
      $scope.back = '/advanced'
      $scope.comingFrom = '';
      if($routeParams.from != null) {
        $scope.comingFrom = $routeParams.from;
        $scope.fromString = '?from=' + $routeParams.from + '-ad';
        $scope.back = '/advanced/settings';
        var back = $routeParams.from.split('-');
        for(var i = 0; i < back.length-1; i++) {
          if(i != 0)
            oldFrom += '-';
          oldFrom += back[i];
        }
        if(oldFrom !== '')
          $scope.prev = '?from=' + oldFrom;
      } else {
        $scope.back = '/advanced';
      }
      $scope.save = function() {
        $scope.remAdmin.$update(function(){
          if($scope.oldFrom == '')
            $location.path($scope.back).search({});
          else{
            if($scope.comingFrom == "settings"){
              location.reload();
            }else{
              $location.path($scope.back).search({from: $scope.oldFrom});
            }
          }
        });
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/remoteadmin'){
            $scope.save();
          }
        }
      };
    }])
  .controller('systemSettingsCtrl', ['$scope', '$route', '$routeParams', '$location', 'SystemSettings', 'securityTips',
    function($scope, $route, $routeParams, $location, SystemSettings, securityTips) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.showErrorPage = false;
      
      $scope.fromString = '?from=settings';
      $scope.oldFrom = '';
      $scope.prev = '';
      $scope.oldDomainName = '';
      if($routeParams.from != null) {
        $scope.fromString = '?from=' + $routeParams.from + '-settings';
        var back = $routeParams.from.split('-');
        if(back[back.length-1] == 'fw') {
          $scope.back = '/firewall/remoteadmin';
        } else if(back[back.length-1] == 'ad') {
          $scope.back = '/advanced/remoteadmin';
        } 
        for(var i = 0; i < back.length-1; i++) {
          if(i != 0)
            $scope.oldFrom += '-';
          $scope.oldFrom += back[i];
        }
        if($scope.oldFrom !== '')
          $scope.prev = '?from=' + $scope.oldFrom;
      } else {
        $scope.back = '/advanced';
      }
      $scope.sysSettings = SystemSettings.get(function(){
        $scope.systemIpAddress = splitIpArr($scope.sysSettings.systemRemoteHost);
        $scope.securityIpAddress = splitIpArr($scope.sysSettings.securityRemoteHost);

        $scope.oldDomainName = $scope.sysSettings.localDomain;
      });

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.save = function() {
        $scope.errorMessages = [];
        if(!validateLocalDomains($scope.sysSettings.localDomain))
          $scope.errorMessages.push("Domain Name: Name may not contain spaces. Only letters, digits and the special characters dash (-), underscore (_) and dot (.) may be used. These special characters may not appear at the beginning or at the end of a name. The maximum length of a label (text between two dots) is 63");
        if(!/^[a-z0-9]$|^[a-z0-9][a-z0-9\-\_]{0,}[a-z0-9]$/i.test($scope.sysSettings.routerHostname))
          $scope.errorMessages.push("Wireless Broadband Router's Hostname: Host name may contain only letters, digits and the special characters dash (-) and underscore (_), without any spaces. The special characters cannot appear at the beginning or the end of the name.");

        if(isNaN($scope.sysSettings.sessionLifetime) || $scope.sysSettings.sessionLifetime < 60 || $scope.sysSettings.sessionLifetime > 7200)
          $scope.errorMessages.push("Session Lifetime: Please enter a numeric value between 60 and 7200.");
        var ports = [
          {title:"Primary HTTPS Management Port", port: parseInt($scope.sysSettings.primaryHttpsPort)},
          {title:"Secondary HTTPS Management Port", port: parseInt($scope.sysSettings.secondaryHttpsPort)},
          {title:"Primary ssh Port", port: parseInt($scope.sysSettings.primarySshPort)},
          {title:"Secondary ssh Port", port: parseInt($scope.sysSettings.secondarySshPort)}
        ];
        for(var i = 0; i < ports.length; i++) {
          if(isNaN(ports[i].port) || ports[i].port < 1 || ports[i].port > 65535)
            $scope.errorMessages.push(ports[i].title + ": Please enter a numeric value between 1 and 65535.");
        }
        if($scope.errorMessages.length == 0) {
          for(var i = 0; i < ports.length; i++)
            for(var k = i+1; k < ports.length; k++)
              if(ports[i].port == ports[k].port)
                $scope.errorMessages.push("Remote Administration: Port " + ports[i].port + " cannot be used for both \"" + ports[i].title + "\" and \"" + ports[k].title + "\".");
        }
        if($scope.sysSettings.systemRemoteNotifyLevel != 0 && !validateIp($scope.systemIpAddress))
          $scope.errorMessages.push("Remote System Host IP Address: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
        else if($scope.sysSettings.systemRemoteNotifyLevel != 0 && getIpString($scope.systemIpAddress)==='0.0.0.0')
          $scope.errorMessages.push("Remote System Host IP Address: IP address may not be 0.0.0.0. IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces. At least one of the values must be greater than 0.");
        if($scope.sysSettings.securityRemoteNotifyLevel != 0 && !validateIp($scope.securityIpAddress))
          $scope.errorMessages.push("Remote Security Host IP Address: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
        else if($scope.sysSettings.securityRemoteNotifyLevel != 0 && getIpString($scope.securityIpAddress)==='0.0.0.0')
          $scope.errorMessages.push("Remote Security Host IP Address: IP address may not be 0.0.0.0. IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces. At least one of the values must be greater than 0.");

        var toErr = !/^[0-9]+$/.test($scope.sysSettings.autoWanDhcpTimeout);
        var to = parseInt($scope.sysSettings.autoWanDhcpTimeout);

        if(to === '' || isNaN(to) || to < 0 || toErr)
          $scope.errorMessages.push("DHCP Timeout: Please enter a numeric value between 0 and 4294967295.");
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }

        $scope.sysSettings.autoWanDhcpTimeout = parseInt($scope.sysSettings.autoWanDhcpTimeout);

        $scope.sysSettings.concurrentUsers = parseInt($scope.sysSettings.concurrentUsers);
        $scope.sysSettings.securityRemoteNotifyLevel = parseInt($scope.sysSettings.securityRemoteNotifyLevel);
        $scope.sysSettings.systemRemoteNotifyLevel = parseInt($scope.sysSettings.systemRemoteNotifyLevel);

        if($scope.sysSettings.systemRemoteNotifyLevel != 0)
          $scope.sysSettings.systemRemoteHost = getIpString($scope.systemIpAddress);
        if($scope.sysSettings.securityRemoteNotifyLevel != 0)
          $scope.sysSettings.securityRemoteHost = getIpString($scope.securityIpAddress);
        $scope.sysSettings.$update(function() {
          systemSettings = $scope.sysSettings;
          if($scope.oldDomainName == $scope.sysSettings.localDomain){
            $scope.redirect();
          }else{
            securityTips.showCustomMessage3('Warning',
              ["You have changed the gateway's Local Domain Name. It may take several minutes for all of the clients on your network to be updated with the new domain name, and during that time they may not be able to communicate with each other by hostname.",
              "If you desire immediate resolution, you can perform an ip address release and renew on each of your networked client devices or restart them."]).then(function (result) {
              if (result == 'ok') {
                $scope.redirect();
              }
            });
          }
        });
      };

      $scope.redirect = function(){
        if($scope.oldFrom == '')
          $location.path($scope.back).search({});
        else
          $location.path($scope.back).search({from: $scope.oldFrom});
      };

      $scope.systemLowCapacityChanged = function() {
        if (!$scope.sysSettings.systemLowCapacityNotificationEnabled) {
          $scope.sysSettings.securityLowCapacityNotificationEnabled = true;
        }
      };

      $scope.securityLowCapacityChanged = function() {
        if (!$scope.sysSettings.securityLowCapacityNotificationEnabled) {
          $scope.sysSettings.systemLowCapacityNotificationEnabled = true;
        }
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/settings'){
            $scope.save();
          }
        }
      };

    }])

  .controller('dateTimeCtrl', ['$scope', '$route', '$routeParams', '$location', 'DateTimeSettings',
    function($scope, $route, $routeParams, $location, DateTimeSettings) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      var reloadData = function (){
        $scope.dateTimeSettings = DateTimeSettings.get(function() {
          $scope.checkTime();
          $scope.checkTempDateObj();
          for(var i = 0; i < $scope.dateTimeSettings.servers.length; i ++){
            var tempObj = new Object();
            tempObj.name = $scope.dateTimeSettings.servers[i];
            tempObj.id = i;
            $scope.dateTimeSettings.servers[i] = tempObj;
          }
          $scope.timezone = parseInt($scope.dateTimeSettings.timeZone);
        });

      }

      reloadData();

      // Init Variables
      $scope.pageToShow = 0;
      $scope.serverName = "Name";
      $scope.showErrorPage = false;

      $scope.tempDateObj = null;

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      /* Functions */
      $scope.syncNow = function() {
        // TODO tell ntp to do sync
      };
      $scope.refresh = function() {
        if(window != undefined){
          window.location.reload(true);
        }else{
          location.reload(true);
        }
      };
      $scope.togglePage = function(num) {
        $scope.pageToShow = num;
        window.scrollTo(0,0);
      };
      $scope.save = function() {
        for(var i = 0; i < $scope.dateTimeSettings.servers.length; i ++){
          if($scope.dateTimeSettings.servers[i].hasOwnProperty("name")){
            $scope.dateTimeSettings.servers[i] = $scope.dateTimeSettings.servers[i].name;
          }
        }

        $scope.dateTimeSettings.timeZone = parseInt($scope.dateTimeSettings.timeZone);

          var timeObj = {
            autoTimeUpdate: $scope.dateTimeSettings.autoTimeUpdate,
            localTime: $scope.dateTimeSettings.localTime,
            timeZone: parseInt($scope.dateTimeSettings.timeZone),
            offset: parseInt($scope.dateTimeSettings.offset),
            servers: $scope.dateTimeSettings.servers
          };

          DateTimeSettings.update(timeObj, function() {
            $scope.dateTimeSettings = DateTimeSettings.get(function() {
              for(var i = 0; i < $scope.dateTimeSettings.servers.length; i ++){
                var tempObj = new Object();
                tempObj.name = $scope.dateTimeSettings.servers[i];
                tempObj.id = i;
                $scope.dateTimeSettings.servers[i] = tempObj;
              }
            });
          });
      };
      $scope.offsetToZone = function() {
        var hourOffset = $scope.offset / 60;
        if (0 == hourOffset)
          $scope.dateTimeSettings.timeZone = 0;
        else if (-5 >= hourOffset && -10 <= hourOffset)
          $scope.dateTimeSettings.timeZone = hourOffset;
      };
      $scope.checkTime = function() {
        if($routeParams.tz != null)
          $scope.dateTimeSettings.timeZone = $routeParams.tz;
        $scope.offset = 0;
        $scope.localTimeMoment = findTimeNow($scope.dateTimeSettings);
        $scope.localTimeFormatted = $scope.localTimeMoment.format("MMM DD, YYYY HH:mm:ss");
      };

      $scope.checkTempDateObj = function(){
        if($routeParams.tmplocalTime != null){
          $scope.tempDateObj = {localTime: $routeParams.tmplocalTime};
          $scope.tempDateObj.timeZone = $scope.dateTimeSettings.timeZone;
          $scope.dateTimeSettings.autoTimeUpdate = false;

          $scope.localTimeMoment = findTimeNow($scope.tempDateObj);
          $scope.localTimeFormatted = $scope.localTimeMoment.format("MMM DD, YYYY HH:mm:ss");

          $scope.tempDateObj.month = $scope.localTimeMoment.month();
          $scope.tempDateObj.day = $scope.localTimeMoment.date();
          $scope.tempDateObj.year = $scope.localTimeMoment.year();
          $scope.tempDateObj.hours = $scope.localTimeMoment.hour();
          $scope.tempDateObj.minutes = $scope.localTimeMoment.minute();
          $scope.tempDateObj.seconds = $scope.localTimeMoment.second();
        }
      }

      $scope.checkTempObj = function(){
        if($scope.dateTimeSettings.autoTimeUpdate)
          $scope.tempDateObj = null;
      }

      $scope.setTimeZone = function() {
        if($scope.tempDateObj == null){
          $location.path('/advanced/datetime').search({tz: $scope.dateTimeSettings.timeZone});
        }else{
          $location.path('/advanced/datetime').search({tz: $scope.dateTimeSettings.timeZone,
            tmplocalTime: $scope.tempDateObj.localTime});
        }
        $location.replace();
        $scope.checkTime();
        $scope.checkTempDateObj();
      }

      $scope.setClock = function() {
        if($scope.tempDateObj == null){
          $scope.tempDateObj = {
            month: $scope.localTimeMoment.month(),
            day: $scope.localTimeMoment.date(),
            year: $scope.localTimeMoment.year(),
            hours: $scope.localTimeMoment.hour(),
            minutes: $scope.localTimeMoment.minute(),
            seconds: $scope.localTimeMoment.second(),
            timeZone: $scope.dateTimeSettings.timeZone
          };
        }
        if($scope.tempDateObj.hours < 10 && $scope.tempDateObj.hours.toString().length < 2)
          $scope.tempDateObj.hours = '0' + $scope.tempDateObj.hours;
        if($scope.tempDateObj.minutes < 10 && $scope.tempDateObj.minutes.toString().length < 2)
          $scope.tempDateObj.minutes = '0' + $scope.tempDateObj.minutes;
        if($scope.tempDateObj.seconds < 10 && $scope.tempDateObj.seconds.toString().length < 2)
          $scope.tempDateObj.seconds = '0' + $scope.tempDateObj.seconds;
        $scope.togglePage(2);
      };

      $scope.calDate = function(){
        var hrs = $scope.tempDateObj.hours;
        var mns = $scope.tempDateObj.minutes;
        var scs = $scope.tempDateObj.seconds;
        var tmpString = $scope.tempDateObj.year + "-" + (parseInt($scope.tempDateObj.month)+1) + "-" + $scope.tempDateObj.day + "-" + $scope.tempDateObj.hours + "-" + $scope.tempDateObj.minutes + "-" + $scope.tempDateObj.seconds;
        var tzToApply = $scope.tempDateObj.timeZone == -11 ? -7 : $scope.tempDateObj.timeZone;
        var tmpTime = moment.unix(moment.utc(moment(tmpString, "YYYY-MM-DD-HH-mm-ss")).unix() - (60 * new Date().getTimezoneOffset()) - (60*60*tzToApply));

        var finalDateTime = new Object();
        finalDateTime.localTime = tmpTime.unix();
        finalDateTime.timeZone = $scope.tempDateObj.timeZone;
        finalDateTime = findTimeNow(finalDateTime);

        var tempHour = finalDateTime.format("HH");
        var tempMin = finalDateTime.format("mm");

        var hasDST = false;
        var diff = 0;
        var tempDiff = 0;
        if(Number(tempHour) == Number(hrs) && Number(tempMin) == Number(mns)){
          hasDST = false;
        }else{
          hasDST = true;
        }
        if(hasDST){
          tempDiff = 0;
          if(hrs < 4 && tempHour > 20){
            tempDiff = Number(hrs) - Number(tempHour - 24);
          }else if(hrs > 20 && tempHour < 4){
            tempDiff = Number(hrs - 24) - Number(tempHour);
          }else{
            tempDiff = Number(hrs) - Number(tempHour);
          }
          if(tempDiff != 0){
            diff = tempDiff * 60 * 60;
          }
          tempDiff = 0;
          tempDiff = Number(mns) - Number(tempMin);
          if(tempDiff != 0){
            diff += tempDiff * 60;
          }
        }
        $scope.tempDateObj.localTime = tmpTime.unix() + diff;
        $scope.localTimeMoment = findTimeNow($scope.tempDateObj);
        $scope.localTimeFormatted = $scope.localTimeMoment.format("MMM DD, YYYY HH:mm:ss");
      };

      $scope.applySetClock = function() {
        $scope.errorMessages = [];
        var hrs = $scope.tempDateObj.hours;
        var mns = $scope.tempDateObj.minutes;
        var scs = $scope.tempDateObj.seconds;
        var tmpDate = moment($scope.tempDateObj.year + "-" + (parseInt($scope.tempDateObj.month)+1) + "-" + $scope.tempDateObj.day, "YYYY-MM-DD");
        if(hrs === '' || isNaN(hrs) || hrs < 0 || hrs > 23)
          $scope.errorMessages.push("Hours: Please enter a numeric value between 0 and 23.");
        if(mns === '' || isNaN(mns) || mns < 0 || mns > 59)
          $scope.errorMessages.push("Minutes: Please enter a numeric value between 0 and 59.");
        if(scs === '' || isNaN(scs) || scs < 0 || scs > 59)
          $scope.errorMessages.push("Seconds: Please enter a numeric value between 0 and 59.");
        if (!tmpDate.isValid())
          $scope.errorMessages.push("Local Date and Time:  Entered time or date value are incorrect.");

        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.calDate();

        var timeObj = {
          localTime: $scope.tempDateObj.localTime
        };

        DateTimeSettings.update(timeObj, function() {
          $scope.togglePage(0);
        });
      };

      $scope.cancelSetClock = function(){
        $scope.tempDateObj = null;
        $scope.togglePage(0);
      }

      $scope.saveServer = function() {
        $scope.errorMessages = [];
        $scope.showError = false;

        if(!validateIpDomainDatetime($scope.serverName)){
          if(!isAddressValidIPPattern($scope.serverName)){
            $scope.showError = true;
          }
        }
        if ($scope.showError) {
          $scope.errorMessages.push("Server Address: The value must be a valid IP address or a valid domain name.");
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }

        for(var i = 0; i < $scope.dateTimeSettings.servers.length; i ++){
          $scope.dateTimeSettings.servers[i] = $scope.dateTimeSettings.servers[i].name;
        }
        if (-1 == $scope.editing){
          $scope.dateTimeSettings.servers.push($scope.serverName);
        }else{
          $scope.dateTimeSettings.servers[$scope.editing] = $scope.serverName;
        }
        var timeObj = {
            autoTimeUpdate: $scope.dateTimeSettings.autoTimeUpdate,
            servers: $scope.dateTimeSettings.servers
          };
        DateTimeSettings.update(timeObj, function() {
          reloadData();
        });

        $scope.togglePage(0);
      };

      $scope.addServer = function() {
        $scope.serverName = "";
        $scope.editing = -1;
        $scope.togglePage(1);
        window.scrollTo(0,0);
      };
      $scope.editServer = function(index) {
        $scope.serverName = $scope.dateTimeSettings.servers[index].name;
        $scope.editing = index;
        $scope.togglePage(1);
        window.scrollTo(0,0);
      };
      $scope.removeServer = function(index) {
        for(var i = 0; i < $scope.dateTimeSettings.servers.length; i ++){
          $scope.dateTimeSettings.servers[i] = $scope.dateTimeSettings.servers[i].name;
        }
        $scope.dateTimeSettings.servers.splice(index, 1);
        var timeObj = {
            autoTimeUpdate: $scope.dateTimeSettings.autoTimeUpdate,
            servers: $scope.dateTimeSettings.servers
          };
        DateTimeSettings.update(timeObj, function() {
          reloadData();
        });
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/datetime'){
            if($scope.pageToShow == 0 && !$scope.showErrorPage){
              $scope.save();
            }else if ($scope.pageToShow == 1 && !$scope.showErrorPage){
              $scope.saveServer();
            }
          }
        }
      };

    }])
  .controller('configFileCtrl', ['$scope', '$route', '$location', 'ConfigInfo', 'Reboot', 'Login', 'SystemSettings', '$templateCache', '$timeout',
    function($scope, $route, $location, ConfigInfo, Reboot, Login, SystemSettings, $templateCache, $timeout) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.loadFile = false;
      $scope.completed = false;
      $scope.showErrorPage = false;
      $scope.inputFile = null;
      $scope.restarting = false;

      //I Really hate doing it like this but I've been unable to find
      //a better solution without including a bunch of other libs.
      //TODO: FIXIT
      window.uploadDone = function() {
        if(!$scope.loadFile)
          return;
        var info = ConfigInfo.get(function() {
          if(info.successful) {
            Reboot.save(function() {
              window.setTimeout($scope.testConnection,0);
            });
            $scope.completed = true;
          } else {
            $scope.errorMessages = ["Configuration File: Bad format of configuration file."];
            $scope.showErrorPage = true;
          }
        })
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

      $scope.toggleShow = function(num){
        $timeout(function(){
          document.getElementById('submitting').focus()
        },1000);
        $scope.loadFile = !$scope.loadFile;
        if(num == 0){
          $scope.inputFile = null;
        }
      }
      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        $scope.loadFile = false;
        $scope.completed = false;
        $scope.isFileSubmitted = false;
        window.scrollTo(0,0);
      }
      $scope.submittingFile = function() {
        $scope.isFileSubmitted = true;
      }
      $scope.saving = function(){
        Login.get(function(response) {
          window.location="api/settings/configfile";
        });
      };
      $scope.loadConfig = function(){
        document.getElementById('submitting').focus();
      };
      $scope.setFocus = function() {
        $timeout(function(){
            document.getElementById('submitting').focus();
        },500);
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/configfile'){
            if (!$scope.loadFile){
              $location.path('/advanced');
            }
          }
        }
      };
    }])
  .controller('diagnosticsCtrl', ['$scope', '$route', '$rootScope', 'Diagnostics', '$location',
    function($scope, $route, $rootScope, Diagnostics, $location) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.destination = "";
      $scope.pingCount = 4;
      $scope.showErrorPage = false;
      $scope.previousPath = $rootScope.pre_path;
      $scope.isCancelled = false;

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.refresh = function() {
        var stats = Diagnostics.get(function() {
          $scope.destination = stats.destination;
          $scope.pingCount = stats.count;
          $scope.total = stats.count;
          $scope.status = stats.running? 1 : 0;
          $scope.testRan = true;
          if(stats.transmitted == null) {
            if(stats.running)
              window.setTimeout($scope.refresh, 1000);
            else 
              $scope.testRan = false;
            return;
          }
          $scope.sent = stats.transmitted;
          $scope.received = stats.received;

          if($scope.received == 0 && $scope.sent == 0 && $scope.status == 0)
            $scope.status = 5;
          if($scope.status == 0 && $scope.sent != $scope.total)
            $scope.status = 4;//If it's stopped and sent != total then the test was cancelled
          if($scope.status == 0 && $scope.sent == $scope.total && $scope.received != $scope.sent)
            $scope.status = 2;
          if($scope.sent > 0) {
            $scope.loss = Math.floor((($scope.sent-$scope.received)/$scope.sent) * 100);
          } else
            $scope.loss = 0;
          if($scope.isCancelled){
            $scope.status = 4;
          }
          if($scope.received > 0) {
            $scope.min = stats.min.toFixed(2);
            $scope.max = stats.max.toFixed(2);
            $scope.average = stats.average.toFixed(2);
            $scope.hasResults = true;
          } else
            $scope.hasResults = false;
          if($scope.status == 1 && stats.transmitted != stats.count)
            window.setTimeout($scope.refresh,1000);
        });
      };

      $scope.goButton = function() {
        $scope.isCancelled = false;
        $scope.errorMessages = [];
        var ip = $scope.destination.split('.');
        var isCorrectIP = false;
        isCorrectIP = validateIp(ip);
        if(!isCorrectIP)
          isCorrectIP = validateIPv6($scope.destination);
        var isValidateHostname = validateGivenHostName($scope.destination);
        if(isCorrectIP || isValidateHostname) {
        } else {
            $scope.errorMessages.push("Server Address: The value must be a valid IP address or a valid domain name.");
        }
        if (isNaN($scope.pingCount) || $scope.pingCount < 1 || $scope.pingCount > 999) {
          $scope.errorMessages.push("Number of pings: Please enter a numeric value between 1 and 999.");
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }

        $scope.status = -1;
        $scope.total = 4;
        $scope.sent = 0;
        $scope.received = 0;
        $scope.loss = 0;
        $scope.hasResults = false;
        Diagnostics.save({destination:$scope.destination,count:parseInt($scope.pingCount)}, function() {
          $scope.status = -1;
          $scope.refresh();
        });
      };

      $scope.cancel = function() {
        $scope.isCancelled = true;
        Diagnostics.remove({});
      };

      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/diagnostics'){
            $scope.goButton();
          }
        }
      };

      $scope.refresh();
    }])
  .controller('defaultsCtrl', ['$scope', '$route', 'Defaults', 'Login', 'Reboot','SystemSettings', '$location', '$templateCache',
    function($scope, $route, Defaults, Login, Reboot , SystemSettings, $location, $templateCache) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.restDefaults = 0;
      $scope.resetType = 0;
      $scope.restarting = false;

      $scope.defaults = function() {
        $scope.restDefaults = 1;
      };
      $scope.cancel = function() {
        $scope.restDefaults = 0;
      };
      $scope.restoreDefaults = function() {
        $scope.restDefaults = 2;

        Defaults.save({resetType: parseInt($scope.resetType)}, function() {
          Reboot.save(function() {
            window.setTimeout($scope.testConnection,0);
          });
        });
      };
      $scope.saving = function(){
        Login.get(function(response) {
          window.location="api/settings/configfile";
        });
      };
      $scope.testConnection = function() {
        SystemSettings.get(function() {
          window.setTimeout($scope.testConnection,3000);
        }, function(response) {
          if(response.status == 401){
            $scope.restarting = true;
            $templateCache.removeAll();
            if($scope.resetType == 0){
              //$location.path('/setup');
              window.location = '/redirectSetup.html?v={version_number}';
            }else{
              //$location.path('/login').search({rebooting: 'true'});
              window.location = '/redirect.html?v={version_number}';
            }
          }else
            window.setTimeout($scope.testConnection,3000);
        });
      }
    }])
  .controller('rebootCtrl', ['$scope', '$route', 'Reboot', 'SystemSettings', 'Login', '$location', '$templateCache',
    function($scope, $route, Reboot, SystemSettings, Login, $location, $templateCache) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.sysSettings = SystemSettings.get();
      $scope.rebooting = false;
      $scope.restarting = false;

      $scope.reboot = function() {
        $scope.rebooting = true;
        Reboot.save(function() {
          window.setTimeout($scope.testConnection,0);
        });
      };
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
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/reboot'){
            $scope.reboot();
          }
        }
      };

    }])
  .controller('macCloningCtrl', ['$scope', '$route', '$location', 'MacCloning',
    function($scope, $route, $location, MacCloning) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.showErrorPage = false;
      $scope.macCloning = MacCloning.get(function(){
        $scope.macAddress = splitMacArr($scope.macCloning.mac);
      });

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.save = function() {
        $scope.errorMessages = [];
        $scope.macCloning.mac = getMacString($scope.macAddress);
        if(!validateMac($scope.macCloning.mac))
          $scope.errorMessages = ["MAC Address: MAC address must consist of 6 fields. Each field's value must be between 00 and FF (in hexadecimal representation), without any spaces. The LSB of the first byte must be zero."];
        else if(/[f\:]{17}$/i.test($scope.macCloning.mac))
          $scope.errorMessages.push("MAC Address: MAC FF:FF:FF:FF:FF:FF is reserved for broadcast.");
        else if(!validateMac($scope.macCloning.mac) || /[0\:]{17}$/i.test($scope.macCloning.mac) || (parseInt($scope.macAddress[0], 16) & 1) == 1)
          $scope.errorMessages = ["MAC Address: MAC address must consist of 6 fields. Each field's value must be between 00 and FF (in hexadecimal representation), without any spaces. The LSB of the first byte must be zero."];

        if($scope.errorMessages.length>0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.macCloning.$update(function() {
          $location.path('/advanced');
        });
      };
      $scope.restore = function() {
        $scope.macAddress = splitMacArr($scope.macCloning.defaultMac);
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/maccloning'){
            $scope.save();
          }
        }
      };
    }])
  .controller('usersCtrl', ['$scope', '$route', '$routeParams', '$location', 'Users','SystemSettings',
    function($scope, $route, $routeParams, $location, Users, SystemSettings) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.sysSettings = SystemSettings.get();
      $scope.updateContent = function() {
        $scope.userObj = Users.get(function() {
          $scope.user = $scope.userObj.users[0];
          $scope.userObj.users[0].fullName = unescape($scope.userObj.users[0].fullName);
          if($routeParams.edit != null)
            $scope.edit(0);
        });
      };
      $scope.updateContent();
      
      $scope.pageToShow = 0;
      $scope.editing = -1;
      $scope.showErrorPage = false;
      $scope.setPassword = false;
      $scope.showPassword = false;
      $scope.userObjs = null;
      $scope.newPass = false;

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.save = function() {
        $scope.errorMessages = [];
        var att = Number($scope.userObj.maxLoginAttempts);
        if(isNaN(att) || att < 1 || att > 99)
          $scope.errorMessages.push("Maximum Unsuccessful Login Attempts: Please enter a numeric value between 1 and 99.");

        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        Users.update({maxLoginAttempts: att}, function() {
          if(window != undefined){
            window.location.reload(true);
          }else{
            location.reload(true);
          }
        });
      };
      $scope.togglePage = function(num) {
        if(num == 0){
          if($routeParams.frommain != null){
            $location.url($location.path('/main'));
          }else{
            $scope.pageToShow = num;
            $scope.updateContent();
          }
        }else{
          $scope.pageToShow = num;
        }
        window.scrollTo(0,0);
      };
      $scope.edit = function(index) {
        $scope.newName = $scope.userObj.users[0].fullName;
        $scope.newPassword = "";
        $scope.rtNewPassword = "";
        $scope.setPassword = false;
        $scope.editing = index;
        $scope.togglePage(1);
      };
      $scope.saveUserCfm = function() {
        Users.update({users:[$scope.userObjs]}, function() {
          $scope.userObj.users[0].fullName = unescape($scope.userObj.users[0].fullName);
          if($scope.newPass)
            $location.path('/logout');
          else
            $scope.togglePage(0);
        });
      };
      $scope.saveUser = function() {
        $scope.userObjs = {
          id: 0
        };
        $scope.errorMessages = [];
        if($scope.newName == '')
          $scope.errorMessages.push("Full Name: A string must be specified.");
        $scope.newPass = false;
        if($scope.setPassword) {
          if($scope.newPassword.length == 0 && $scope.rtNewPassword.length == 0)
            $scope.errorMessages.push("New Password: A password must be specified.")
          if($scope.newPassword != $scope.rtNewPassword)
            $scope.errorMessages.push("Incorrect New Password: Entered passwords mismatch.");
          if($scope.errorMessages.length == 0)
            $scope.user.password = $scope.newPassword;
          $scope.userObjs.salt = uuid();
          $scope.userObjs.password = CryptoJS.SHA512($scope.newPassword + $scope.userObjs.salt).toString();
          $scope.newPass = true;
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.userObjs.fullName = escape($scope.newName).replace(/\+/g,'%2B');

        if($scope.newPass){
          if($scope.sysSettings.warnBeforeChanges == true) {
            $scope.togglePage(2);
          }else{
            $scope.saveUserCfm();
          }
        }else{
          $scope.saveUserCfm();
        }
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/users'){
            if($scope.pageToShow == 1 && !$scope.showErrorPage){
              $scope.saveUser();
            }else{
              $scope.save();
            }
          }
        }
      };
    }])
  .controller('schedulerCtrl', ['$scope', '$route', 'Schedules', 'DateTimeSettings', '$location', 'AccessControl', 'PortForward',
    function($scope, $route, Schedules, DateTimeSettings, $location, AccessControl, PortForward) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.runFocus = false;
      /* Init temporary objects */
      init_schedules($scope);

      /* Temporary variables */
      $scope.pageToShow = 0;
      $scope.editing = false;
      $scope.showErrorPage = false;

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      /* Functions */
      $scope.save = function(){ // TODO: Is this needed in here?
        $scope.schedules.$update(function(){
          if(window != undefined){
            window.location.reload(true);
          }else{
            location.reload(true);
          }
        });
      };
      $scope.refresh = function(){
        $scope.schedules = Schedules.query(function() {
          for(var i = 0; i < $scope.schedules.length; i++)
            $scope.schedules[i].name = unescape($scope.schedules[i].name);
          $scope.printSchedArr = [];
          printSchedule(0, $scope.schedules, $scope.printSchedArr);
          $scope.dateTimeSettings = DateTimeSettings.get(function() {
            $scope.localTimeMoment = findTimeNow($scope.dateTimeSettings);
            for(var i = 0 ; i < $scope.schedules.length; i++) {
              $scope.schedules[i].status = isScheduleActive($scope.schedules[i], $scope.localTimeMoment);
            }
          });
        });
      };
      $scope.refresh();
      $scope.togglePage = function(num){
        $scope.pageToShow = num;
        window.scrollTo(0,0);
      };
      $scope.removeSchedule = function(index) {
        var showAttention = false;
        $scope.toDeleteIndex = index;
        $scope.portForward = PortForward.query(function() {
          $scope.accessControl = AccessControl.query(function () {
            for(var i = 0; i < $scope.accessControl.length; i++) {
              if($scope.accessControl[i].schedule != null){
                if(unescape($scope.accessControl[i].schedule.name) == $scope.schedules[$scope.toDeleteIndex].name){
                  showAttention = true;
                  break;
                }
              }
            }
            for(var i = 0; i < $scope.portForward.length; i++) {
              if($scope.portForward[i].schedule != null){
                if(unescape($scope.portForward[i].schedule) == $scope.schedules[$scope.toDeleteIndex].name){
                  showAttention = true;
                  break;
                }
              }
            }
            if(showAttention){
              $scope.togglePage(8);
            }else{
              $scope.removeScheduleNow($scope.toDeleteIndex);
            }
          });
        });
      };
      $scope.updateAccessControlBeforeRemove = function(){
        var canDelete = true;
        $scope.portForward = PortForward.query(function() {
          $scope.accessControl = AccessControl.query(function () {
            for(var i = 0; i < $scope.accessControl.length; i++) {
              if($scope.accessControl[i].schedule != null){
                if(unescape($scope.accessControl[i].schedule.name) == $scope.schedules[$scope.toDeleteIndex].name){
                  $scope.accessControl[i].schedule = "";
                  $scope.accessControl[i].schedule1 = {};
                  AccessControl.update({id: $scope.accessControl[i].id}, $scope.accessControl[i], function() {
                    $scope.updateAccessControlBeforeRemove();
                  });
                  canDelete = false;
                  break;
                }
              }
            }
            if(canDelete){
              for(var i = 0; i < $scope.portForward.length; i++) {
                if($scope.portForward[i].schedule != null){
                  if(unescape($scope.portForward[i].schedule) == $scope.schedules[$scope.toDeleteIndex].name){
                    $scope.portForward[i].schedule = "Always";
                    PortForward.remove({id: $scope.portForward[i].id}, function() {
                      $scope.portForward[i].id = "";
                      PortForward.save($scope.portForward[i], function() {
                        $scope.updateAccessControlBeforeRemove();
                      });
                    });
                    canDelete = false;
                    break;
                  }
                }
              }
            }
            if(canDelete){
              $scope.removeScheduleNow($scope.toDeleteIndex);
            }
          });
        });
      }
      $scope.removeScheduleNow = function(index){
        Schedules.remove({id: $scope.schedules[index].id}, function() {
          $scope.togglePage(0);
          $scope.refresh();
        });
      }
      $scope.applyRuleScheduler = function() {
        $scope.errorMessages = [];
        if($scope.schedule.name === '')
          $scope.errorMessages.push("Description: A string must be specified.");
        for(var i = 0; i < $scope.schedules.length; i++) {
          if(i == $scope.editingRuleSchedule)
            continue;
          if($scope.schedules[i].name == $scope.schedule.name) {
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
        tempSchedule.name = escape($scope.schedule.name).replace(/\+/g,'%2B');
        if (-1 == $scope.editingRuleSchedule) {
          Schedules.save(tempSchedule, function(){
            $scope.refresh();
          });
        } else // Editing
        {
          tempSchedule.id = $scope.schedules[$scope.editingRuleSchedule].id;
          Schedules.update(tempSchedule, function() {
            $scope.refresh();
          });
        }

        $scope.togglePage(0);
        init_schedules($scope);
      };

      $scope.formatTimeString = function(hour, minute) {
       return (hour<10?'0' + hour:hour) + ":" + (minute<10?'0' + minute:minute);
      }

      /* START: Functions from firewallUtil.js */
      /* APPLY*/
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
      $scope.applyHourRange = function() {
        $scope.runFocus = true;
        $scope.errorMessages = [];
        var sh = $scope.hourRange.startTimeHour;
        var eh = $scope.hourRange.endTimeHour;
        var sm = $scope.hourRange.startTimeMinute;
        var em = $scope.hourRange.endTimeMinute;
        if(sh === '' || isNaN(sh) || sh < 0 || sh > 23 || !checksForWholeNumber(sh))
          $scope.errorMessages.push("Start Time Hour: Please enter a numeric value between 0 and 23.");
        if(eh === '' || isNaN(eh) || eh < 0 || eh > 23 || !checksForWholeNumber(eh))
          $scope.errorMessages.push("End Time Hour: Please enter a numeric value between 0 and 23.");
        if(sm === '' || isNaN(sm) || sm < 0 || sm > 59 || !checksForWholeNumber(sm))
          $scope.errorMessages.push("Start Time Minutes: Please enter a numeric value between 0 and 59.");
        if(em === '' || isNaN(em) || em < 0 || em > 59 || !checksForWholeNumber(em))
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
      /* CANCEL */
      $scope.cancelRuleScheduler = function() {
        cancelRuleScheduler($scope);
      };
      $scope.cancelTimeSegment = function() {
        cancelTimeSegment($scope);
      };
      $scope.cancelHourRange = function() {
        cancelHourRange($scope);
      };
      /* EDIT */
      $scope.editSchedule = function(index) {
        editRuleScheduler($scope, $scope.schedules, index);
      };
      $scope.editTimeSegment = function(index) {
        editTimeSegment($scope, index);
      };
      $scope.editHourRange = function(index) {
        editHourRange($scope, index);
      };
      /* REMOVE */
      $scope.removeTimeSegment = function(index) {
        removeObject($scope.schedule.timeSegments, index);
      };
      $scope.removeHourRange = function(index) {
        removeObject($scope.hourRanges, index);
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/scheduler'){
            if ($scope.pageToShow == 0){
              $location.path('/advanced');
            }else if($scope.pageToShow == 5 && !$scope.showErrorPage){
              $scope.applyRuleScheduler();
            }else if($scope.pageToShow == 6 && !$scope.showErrorPage){
              $scope.applyTimeSegment();
            }else if($scope.pageToShow == 7 && !$scope.showErrorPage){
              $scope.applyHourRange();
            }
          }
        }
      };
      /* END: Functions from firewallUtil.js */

    }])
  .controller('networkObjectCtrl', ['$scope', '$route', 'NetworkObjects','Devices', '$location', 'AccessControl',
    function($scope, $route, NetworkObjects,Devices, $location, AccessControl) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.runFocus = false;

      $scope.networkObjects = NetworkObjects.query(function() {
        for(var i = 0; i < $scope.networkObjects.length; i++)
          $scope.networkObjects[i].name = unescape($scope.networkObjects[i].name);
        $scope.printAddArr = [];
        printAddresses(1, $scope.networkObjects, $scope.printAddArr);
      });

      /* Init temporary objects */
      init_networkObjs($scope);

      /* Temporary variables */
      $scope.pageToShow = 0;
      $scope.editing = -1;
      
      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      /* START: Functions */
      $scope.togglePage = function(num) {
        $scope.pageToShow = num;
      };

      $scope.addNetworkObject = function() {
        init_networkObjs($scope);
        $scope.togglePage(1);
        $scope.editing = -1;
      }

      $scope.loadDeviceData = function(num){
        $scope.devices = Devices.query();
        $scope.macSelect = -1;
        $scope.togglePage(2);
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
      /* APPLY */
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
        var newNetworkObj = {};
        copyNetworkObj(newNetworkObj, $scope.networkObj);
        $scope.networkObj.name = escape($scope.networkObj.name);
        if (-1 == $scope.editingNetworkObj) {
          NetworkObjects.save(newNetworkObj, function(){
            $scope.networkObjects = NetworkObjects.query(function() {
              $scope.printAddArr = [];
              printAddresses(1, $scope.networkObjects, $scope.printAddArr);
            });
          });
        } else // Editing
        {
          NetworkObjects.update({id: $scope.networkObjects[$scope.editing].id}, newNetworkObj, function(){
            $scope.networkObjects = NetworkObjects.query(function() {
              $scope.printAddArr = [];
              printAddresses(1, $scope.networkObjects, $scope.printAddArr);
            });
          });
        }
        $scope.togglePage(0);
        init_schedules($scope);
      };
      $scope.applyAddress = function() {
        $scope.runFocus = true;
        applyAddressCheck($scope);
        if($scope.errorMessages ==0) {
          applyAddress($scope);
        }
      };
      /* CANCEL */
      $scope.cancelNetworkObj = function() {
        cancelNetworkObj($scope);
        $scope.editing = -1;
      };
      $scope.cancelAddress = function() {
        cancelAddress($scope);
      };
      /* EDIT */
      $scope.editNetworkObj = function(index) {
        editNetworkObj($scope, $scope.networkObjects, index);
        $scope.editing = index;
      };
      $scope.editAddress = function(index) {
        editAddress($scope, index);
      };
      /* REMOVE */
      $scope.removeNetworkObj = function(index) {
        var canDelete = true;
        $scope.accessControl = AccessControl.query(function () {
          for(var i = 0; i < $scope.accessControl.length; i++) {
            if($scope.accessControl[i].networkObjects != null){
              for(var j = 0; j < $scope.accessControl[i].networkObjects.length; j++) {
                if($scope.accessControl[i].networkObjects[j].id == $scope.networkObjects[index].id){
                  canDelete = false;
                  break;
                }
              }
            }
          }
          if(canDelete){
            NetworkObjects.remove({id: $scope.networkObjects[index].id}, function() {
              $scope.networkObjects = NetworkObjects.query(function() {
                $scope.printAddArr = [];
                printAddresses(1, $scope.networkObjects, $scope.printAddArr);
              });
            });
          }else{
            $scope.errorMessages = [];
            $scope.errorMessages.push("Network Object: Network object is in use.");
            $scope.showErrorPage = true;
            window.scrollTo(0,0);
            return;
          }
        });
      };
      $scope.removeAddress = function(index) {
        removeObject($scope.networkObj.rules, index);
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/networkobjects'){
            if ($scope.pageToShow == 0 && !$scope.showErrorPage){
              $location.path('/advanced');
            }else if (($scope.pageToShow == 1 || $scope.pageToShow == 2) && !$scope.showErrorPage){
              if ($scope.pageToShow == 2){
                $scope.applyAddress();
              }else{
                $scope.applyNetworkObj();
              }
            }
          }
        }
      };
      /* END: Functions */

    }])
  .controller('portForwardRuleCtrl', ['$scope', '$route', 'PortForwardRules', 'StaticNAT', 'PortForward', '$location',
    function($scope, $route, PortForwardRules, StaticNAT, PortForward, $location) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.showErrorPage = false;
      $scope.runFocus = false;

      /* Init temporary objects */
      init_services($scope);
      $scope.tempPortForward = {
        name: "Global Application",
        description: "",
        servType: 1,
        protocols: []
      };

      /* Temporary variables */
      $scope.pageToShow = 0;
      $scope.editing = -1;
      $scope.showBasic = false;

      /* START: Functions */
      $scope.togglePage = function(num) {
        $scope.runFocus = true;
        $scope.pageToShow = num;
        window.scrollTo(0,0);
      };
      $scope.toggleBasic = function() {
        $scope.showBasic = !$scope.showBasic;
        window.scrollTo(0,0);
      };
      $scope.refresh = function() {
        $scope.nat = StaticNAT.query();
        $scope.forwards = PortForward.query();
        $scope.portForwardRules = PortForwardRules.query(function() {
          $scope.portForwardRules = sortListItems($scope.portForwardRules);
          $scope.printProtArr = [];
          printProtocol(1, $scope.portForwardRules, $scope.printProtArr);
        });
      }
      $scope.refresh();
      
      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      /* APPLY*/
      $scope.applyPortForwardRule = function() {
        $scope.errorMessages = [];
        if($scope.tempPortForward.name == '')
          $scope.errorMessages.push("Service Name: A name must be specified.");
        else if(!/^[0-9A-Z\!\-\_]+$/i.test($scope.tempPortForward.name))
          $scope.errorMessages.push("Service Name: Rule name should consist of standard characters only (ASCII 32-126) excluding the special character space and any of :@\"|\\/=+<>()[]{}&%^$*?,;")
        for(var i = 0; i < $scope.portForwardRules.length; i++) {
          if(i != $scope.editing && $scope.portForwardRules[i].name == $scope.tempPortForward.name)
            $scope.errorMessages.push("Service Name: This name is already used by another protocol.");
        }
        if($scope.tempPortForward.protocols.length == 0)
          $scope.errorMessages.push("Server Ports: At least one server ports entry must be defined.")
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        var newPortForward = {};
        newPortForward.name = escape($scope.tempPortForward.name).replace(/\+/g,'%2B');
        newPortForward.description = escape($scope.tempPortForward.description).replace(/\+/g,'%2B');
        newPortForward.servType = $scope.tempPortForward.servType;
        newPortForward.protocols = [];
        for (var i = 0; i < $scope.tempPortForward.protocols.length; i++) {
          var tmpProtocol = {};
          copyProtocol(tmpProtocol, $scope.tempPortForward.protocols[i]);
          newPortForward.protocols.push(tmpProtocol);
        }

        if (-1 == $scope.editing) {
          PortForwardRules.save(newPortForward, function() {
            $scope.refresh();
          });

        } else {
          PortForwardRules.update({id: $scope.portForwardRules[$scope.editing].id}, newPortForward, function() {
            $scope.refresh();
          });
        }

        init_services($scope);
        $scope.tempPortForward = {
          name: "Global Application",
          description: "",
          servType: 1,
          protocols: []
        };
        $scope.editing = -1;
        $scope.togglePage(0);
      };
      $scope.applyProtocol = function() {
        $scope.errorMessages = [];
        $scope.protocols.protocol = parseInt($scope.protocols.protocol);
        $scope.protocols.incomingPorts = parseInt($scope.protocols.incomingPorts);
        $scope.protocols.outgoingPorts = parseInt($scope.protocols.outgoingPorts);
        $scope.protocols.icmpMessage = parseInt($scope.protocols.icmpMessage);
        var sstart = $scope.protocols.incomingPortStart;
        var send = $scope.protocols.incomingPortEnd;
        var dstart = $scope.protocols.outgoingPortStart;
        var dend = $scope.protocols.outgoingPortEnd;
        switch($scope.protocols.protocol) {
          case 0: {
            var pro = $scope.protocols.protocolNumber;
            if(pro == null || pro === '' || isNaN(pro) || pro < 0 || pro > 255 || isNotaInt(pro) || !checksForWholeNumber(pro))
            {
              $scope.errorMessages.push("Protocol Number: Please enter a numeric value between 0 and 255.");
            }
          }
            break;
          case 1:
          case 2: {
            switch($scope.protocols.incomingPorts) {
              case 1: {
                if(sstart == null || sstart === '' || sstart < 1 || sstart > 65535 || isNotaInt(sstart))
                  $scope.errorMessages.push("Source Port: Please enter a numeric value between 1 and 65535.");
              }
                break;
              case 2: {
                if(sstart == null || sstart === '' || sstart < 1 || sstart > 65535 || isNotaInt(sstart))
                  $scope.errorMessages.push("Start Source Port: Please enter a numeric value between 1 and 65535.");
                if(send == null || send === '' || send < 1 || send > 65535 || isNotaInt(send))
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
                if(dstart == null || dstart === '' || dstart < 1 || dstart > 65535 || isNotaInt(dstart))
                  $scope.errorMessages.push("Destination Port: Please enter a numeric value between 1 and 65535.");
                if(dstart == 4567 && $scope.protocols.outgoingExclude == false && $scope.protocols.protocol == 1){
                  $scope.errorMessages.push("Invalid rule: Port 4567 cannot be blocked");
                }
              }
                break;
              case 2: {
                if(dstart == null || dstart === '' || dstart < 1 || dstart > 65535 || isNotaInt(dstart))
                  $scope.errorMessages.push("Start Destination Port: Please enter a numeric value between 1 and 65535.");
                if(dend == null || dend === '' || dend < 1 || dend > 65535 ||isNotaInt(dend))
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
              if(t == null || t === '' || t < 0 || t > 255 || isNotaInt(t))
                $scope.errorMessages.push("ICMP Type:  Please enter a numeric value between 0 and 255.");
              if(c == null || c === '' || c < 0 || c > 255 || isNotaInt(c))
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
        if($scope.errorMessages.length == 0) {
          var tempObject = getTempObjectContent($scope.protocols);
          $scope.errorMessages = compareNewCondAndCurrentList($scope.tempPortForward.protocols, tempObject, $scope.editingProtocol);
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.protocols.protocolNumber = parseInt($scope.protocols.protocolNumber);
        $scope.protocols.icmpType = parseInt($scope.protocols.icmpType);
        $scope.protocols.icmpCode = parseInt($scope.protocols.icmpCode);
        applyProtocol($scope, $scope.tempPortForward.protocols);
        printProtocol(2, $scope.tempPortForward.protocols, $scope.printPortsArr);
      };
      /* CANCEL */
      $scope.cancelPortForwardRule = function() {
        cancelService($scope);
        $scope.tempPortForward = {
          name: "Global Application",
          description: "",
          protocols: []
        };
      };
      $scope.cancelProtocol = function() {
        cancelProtocol($scope);
      };
      /* EDIT */
      $scope.editPortForwardRule = function(index) {
        $scope.tempPortForward.name = $scope.portForwardRules[index].name;
        $scope.tempPortForward.description = $scope.portForwardRules[index].description;
        $scope.tempPortForward.servType = $scope.portForwardRules[index].servType;
        $scope.tempPortForward.protocols = [];
        for (var i = 0; i < $scope.portForwardRules[index].protocols.length; i++) {
          var tmpProtocol = {};
          copyProtocol(tmpProtocol, $scope.portForwardRules[index].protocols[i]);
          $scope.tempPortForward.protocols.push(tmpProtocol);
        }

        $scope.printPortsArr = [];
        printProtocol(2, $scope.tempPortForward.protocols, $scope.printPortsArr);

        $scope.editing = index;
        $scope.togglePage(3);
      };
      $scope.editProtocol = function(index) {
        editProtocol($scope, index, $scope.tempPortForward.protocols);
      };
      /* REMOVE */
      $scope.removePortForwardRule = function(index) {
        $scope.errorMessages = [];
        var name = $scope.portForwardRules[index].name;
        for(var i = 0; i < $scope.nat.length; i++) {
          for(var k = 0; k < $scope.nat[i].services.length; k++) {
            if(name === $scope.nat[i].services[k].name) {
              $scope.errorMessages.push("Protocol: Protocol is in use.");
              break;
            }
          }
        }
        if($scope.errorMessages.length == 0) {
          for(var i = 0; i < $scope.forwards.length; i++) {
            for(var k = 0; k < $scope.forwards[i].protocols.length; k++) {
              if(name === $scope.forwards[i].name) {
                $scope.errorMessages.push("Protocol: Protocol is in use.");
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
        PortForwardRules.remove({id: $scope.portForwardRules[index].id}, function() {
          $scope.portForwardRules = PortForwardRules.query(function() {
            $scope.portForwardRules = sortListItems($scope.portForwardRules);
            $scope.printProtArr = [];
            printProtocol(1, $scope.portForwardRules, $scope.printProtArr);
          });
        });
      };
      $scope.removeProtocol = function(index) {
        removeObject($scope.tempPortForward.protocols, index);
        $scope.printPortsArr = [];
        printProtocol(2, $scope.tempPortForward.protocols, $scope.printPortsArr);
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/portforward'){
            if ($scope.pageToShow == 0 && !$scope.showErrorPage){
              $location.path('/advanced');
            }else if ($scope.pageToShow == 3 && !$scope.showErrorPage){
              $scope.applyPortForwardRule();
            }else if ($scope.pageToShow == 4 && !$scope.showErrorPage){
              $scope.applyProtocol();
            }
          }
        }
      };
      /* END: Functions */

    }])
  .controller('dnsServerCtrl', ['$scope', '$route', 'DnsServer','securityTips', '$location',
    function($scope, $route, DnsServer,securityTips, $location) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.dnsServer = DnsServer.query();

      $scope.showErrorPage = false;
      $scope.showAdd = false;
      $scope.editing = -1;
      $scope.runFocus = false;
            
      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.validateBeforeSave = function() {
        $scope.errorMessages = [];
        if(!validateHostname($scope.tempDnsServer.hostname))
          $scope.errorMessages.push("Host Name: Name may not contain spaces. Only letters, digits and the special characters dash (-), underscore (_) and dot (.) may be used. These special characters may not appear at the beginning or at the end of a name. The maximum length of a label (text between two dots) is 63.");
        if(!validateIp($scope.tempDnsServer.ipAddress))
          $scope.errorMessages.push("IP Address: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
        else if(getIpString($scope.tempDnsServer.ipAddress) === '0.0.0.0')
          $scope.errorMessages.push("IP Address: IP address may not be 0.0.0.0. IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces. At least one of the values must be greater than 0.");
        else if(getIpString($scope.tempDnsServer.ipAddress) === '255.255.255.255' || (Number($scope.tempDnsServer.ipAddress[0]) >= 224 && Number($scope.tempDnsServer.ipAddress[0]) <= 239))
          $scope.errorMessages.push("Invalid IP address.");
        for(var i = 0; i < $scope.dnsServer.length; i++) {
          if($scope.editing == i)
            continue;
          if($scope.tempDnsServer.hostname == $scope.dnsServer[i].hostname) {
            $scope.errorMessages.push("Host Name: This name is already used by another DNS object.");
          }
          if(getIpString($scope.tempDnsServer.ipAddress) == $scope.dnsServer[i].ipAddress) {
            $scope.errorMessages.push("IP Address:You have entered an IP address that already exists. Please enter new IP address.");
          }
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }

      if(hasADot($scope.tempDnsServer.hostname)){
        securityTips.showWarningMsgBeforeSaving('DNS Entry',
          'Hostnames including a period (.) may not resolve correctly.',
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

      $scope.save = function(){
        var newDnsServer = {
          hostname: $scope.tempDnsServer.hostname,
          type: $scope.tempDnsServer.type
        };
        if (1 == newDnsServer.type)
          newDnsServer.ipAddress = getIpString($scope.tempDnsServer.ipAddress);

        if(-1 == $scope.editing) {
          DnsServer.save(newDnsServer, function() {
            $scope.dnsServer = DnsServer.query();
          });

        } else {
          DnsServer.update({id: $scope.dnsServer[$scope.editing].id}, newDnsServer, function() {
            $scope.dnsServer = DnsServer.query();
          });
       }

        $scope.tempDnsServer = {};
        $scope.toggleShow();
      };

      $scope.toggleShow = function() {
        $scope.showAdd = !$scope.showAdd;
      };
      $scope.addDnsEntry = function() {
        $scope.tempDnsServer = {
          hostname: "new-host",
          type: 1,
          ipAddress: [0,0,0,0]
        };
        $scope.runFocus = true;
        $scope.editing = -1;
        $scope.toggleShow();
      };
      $scope.editDnsEntry = function(index) {
        $scope.editing = index;
        $scope.tempDnsServer = {
          hostname: $scope.dnsServer[$scope.editing].hostname,
          type: $scope.dnsServer[$scope.editing].type
        };
        if (1 == $scope.tempDnsServer.type)
          $scope.tempDnsServer.ipAddress = splitIpArr($scope.dnsServer[$scope.editing].ipAddress);
        $scope.showAdd = !$scope.showAdd;
      };
      $scope.removeDnsEntry = function(index) {
        DnsServer.remove({id: $scope.dnsServer[index].id}, function(){
          $scope.dnsServer = DnsServer.query();
        });
      };
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/dnsserver'){
            if (!$scope.showAdd){
              $location.path('/advanced')
            }else if($scope.showAdd && !$scope.showErrorPage){
              $scope.save();
            }
          }
        }
      };
    }])
  .controller('ipv6Ctrl', ['$scope', '$route', '$location', 'IPv6',
    function($scope, $route, $location, IPv6) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.ipv6 = IPv6.get(function() {
        $scope.ipv6.addressStart = $scope.ipv6.addressStart.toString(16);
        $scope.ipv6.addressEnd = $scope.ipv6.addressEnd.toString(16);
        for(var i = 0; i < $scope.ipv6.interfaces.length; i++)
          $scope.ipv6.interfaces[i].name = unescape($scope.ipv6.interfaces[i].name);
        if($scope.ipv6.mode == 1)
          $scope.autoDns = $scope.ipv6.autoDns;
        else
          $scope.autoDns = 0;
      });

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.save = function() {
        if(!$scope.ipv6.enabled) {
          IPv6.update({enabled: false}, function() {
            $location.path('/advanced');
          });
        } else {
          $scope.errorMessages = [];
          $scope.ipv6.autoDns = $scope.autoDns;
          if($scope.ipv6.mode == 2) {
            $scope.ipv6.staticAddress = $scope.ipv6.staticAddress.replace(/^\s+|\s+$/g, '');
            $scope.ipv6.staticDefaultGateway = $scope.ipv6.staticDefaultGateway.replace(/^\s+|\s+$/g, '');
            $scope.ipv6.staticPrimaryDns = $scope.ipv6.staticPrimaryDns.replace(/^\s+|\s+$/g, '');
            $scope.ipv6.staticSecondaryDns = $scope.ipv6.staticSecondaryDns.replace(/^\s+|\s+$/g, '');

            if(!validateIPv6($scope.ipv6.staticAddress))
              $scope.errorMessages.push("IPv6 WAN Address: Invalid IP Address.");
            if(isNaN($scope.ipv6.staticPrefixLength) || $scope.ipv6.staticPrefixLength < 16 || $scope.ipv6.staticPrefixLength > 128)
              $scope.errorMessages.push("Prefix Length: Please enter a numeric value between 16 and 128.");
            if(!validateIPv6($scope.ipv6.staticDefaultGateway))
              $scope.errorMessages.push("IPv6 Default Gateway: Invalid IP Address.");
            if(!validateIPv6($scope.ipv6.staticPrimaryDns))
              if (!($scope.ipv6.staticPrimaryDns == ''))
                $scope.errorMessages.push("Primary DNS Server: Invalid IP Address.");
            if(!validateIPv6($scope.ipv6.staticSecondaryDns))
              if (!($scope.ipv6.staticSecondaryDns == ''))
                $scope.errorMessages.push("Secondary DNS Server: Invalid IP Address.");
            if($scope.ipv6.staticPrimaryDns != ''){
              if($scope.ipv6.staticPrimaryDns == $scope.ipv6.staticSecondaryDns)
                $scope.errorMessages.push("Secondary DNS Server: Same As DNS1.");
            }
            if(validateIPv6($scope.ipv6.lanPrefix)) {
              var len = getPrefixLength($scope.ipv6.lanPrefix);
              if(len < 16 || len == 128)
                $scope.errorMessages.push("LAN Prefix: Invalid LAN prefix.");
              else
                $scope.ipv6.lanPrefix = $scope.ipv6.lanPrefix + '/' + len;
            } else if(!validatePrefixLength($scope.ipv6.lanPrefix))
                $scope.errorMessages.push("LAN Prefix: Invalid LAN prefix.");
          } else if($scope.ipv6.mode == 1 && $scope.ipv6.autoDns==1) {
            $scope.ipv6.staticPrimaryDns = $scope.ipv6.staticPrimaryDns.replace(/^\s+|\s+$/g, '');
            $scope.ipv6.staticSecondaryDns = $scope.ipv6.staticSecondaryDns.replace(/^\s+|\s+$/g, '');
            if(!validateIPv6($scope.ipv6.staticPrimaryDns))
              $scope.errorMessages.push("Primary DNS Server: Invalid IP Address.");
            if(!validateIPv6($scope.ipv6.staticSecondaryDns))
              $scope.errorMessages.push("Secondary DNS Server: Invalid IP Address.");              
          }

          if($scope.ipv6.lanMode == 1) {
            if($scope.ipv6.addressStart === '' || $scope.ipv6.addressEnd === '')
              $scope.errorMessages.push("LAN IPv6 Address Range: Please enter a numeric value between 2 and ffff");
            else if(!/^[0-9A-F]+$/i.test($scope.ipv6.addressStart) || !/^[0-9A-F]+$/i.test($scope.ipv6.addressEnd))
              $scope.errorMessages.push("LAN IPv6 Address Range: Please enter hex digit as LAN range.");
            else {
              var start = parseInt($scope.ipv6.addressStart, 16);
              var end = parseInt($scope.ipv6.addressEnd, 16);
              if(start < 2 || start > 65535 || end < 2 || end > 65535)
                $scope.errorMessages.push("LAN IPv6 Address Range: Please enter a numeric value between 2 and ffff");
              else if(start > end)
                $scope.errorMessages.push("LAN IPv6 Address Range: Start addr must be little or equal to end addr.");
            }
          }

          if($scope.ipv6.advertisementLifetime === '' || isNaN($scope.ipv6.advertisementLifetime) || $scope.ipv6.advertisementLifetime < 0 || $scope.ipv6.advertisementLifetime > 150 || !checksForDecimalNumber($scope.ipv6.advertisementLifetime) || !checksForWholeNumber($scope.ipv6.advertisementLifetime))
            $scope.errorMessages.push("Router Advertisement Lifetime: Please enter a numeric value between 0 and 150.");
          if($scope.ipv6.mode != 0 && $scope.ipv6.lanMode == 1) {
            if($scope.ipv6.addressLifetime === '' || isNaN($scope.ipv6.addressLifetime) || $scope.ipv6.addressLifetime < 3 || $scope.ipv6.addressLifetime > 150 || !checksForDecimalNumber($scope.ipv6.addressLifetime) || !checksForWholeNumber($scope.ipv6.addressLifetime))
              $scope.errorMessages.push("IPv6 Address Lifetime: Please enter a numeric value between 3 and 150.");
          }
          if($scope.errorMessages.length > 0) {
            $scope.showErrorPage = true;
            window.scrollTo(0,0);
            return;
          }
          $scope.ipv6.mode = parseInt($scope.ipv6.mode);
          switch($scope.ipv6.mode) {
            case 0:
              $scope.ipv6.autoDns = 2;
              break;
            case 1:
              $scope.ipv6.autoDns = parseInt($scope.autoDns);
              break;
            case 2:
              $scope.ipv6.autoDns = 1;
              break;
          }
          $scope.ipv6.staticPrefixLength = parseInt($scope.ipv6.staticPrefixLength);
          $scope.ipv6.lanMode = parseInt($scope.ipv6.lanMode);
          $scope.ipv6.advertisementLifetime = parseInt($scope.ipv6.advertisementLifetime);
          $scope.ipv6.addressLifetime = parseInt($scope.ipv6.addressLifetime);
          $scope.ipv6.addressStart = start;
          $scope.ipv6.addressEnd = end;
          for(var i = 0; i < $scope.ipv6.interfaces.length; i++)
            $scope.ipv6.interfaces[i].name = escape($scope.ipv6.interfaces[i].name).replace(/\+/g,'%2B');
          $scope.ipv6.$update(function() {
            $scope.ipv6.addressStart = $scope.ipv6.addressStart.toString(16);
            $scope.ipv6.addressEnd = $scope.ipv6.addressEnd.toString(16);
            for(var i = 0; i < $scope.ipv6.interfaces.length; i++)
              $scope.ipv6.interfaces[i].name = unescape($scope.ipv6.interfaces[i].name);
            $location.path('/advanced');
          });
        }
      }

      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/ipv6'){
            $scope.save();
          }
        }
      };

    }])
  .controller('ArpCtrl', ['$scope', '$route', 'ARPTable', 'NetworkConnections', '$location',
    function($scope, $route, ARPTable, NetworkConnections, $location) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.interfaces = NetworkConnections.query(function() {
        for(var i = 0; i < $scope.interfaces.length; i++)
          $scope.interfaces[i].name = unescape($scope.interfaces[i].name);
      });
      
      $scope.refresh = function() {
        $scope.connections = ARPTable.query();
      }

      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/arptable'){
            $location.path('/advanced');
          }
        }
      };
      $scope.refresh();
    }])
  .controller('PortConfigCtrl', ['$scope', '$route', '$location', 'Ethernet',
    function($scope, $route, $location, Ethernet) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.runFocus = false;

      var ethernet = Ethernet.get(function() {
        $scope.ports = [];
        $scope.ports.push({name:'WAN Port', currentMode: ethernet.wan.currentMode, 
          desiredMode: ethernet.wan.desiredMode, status: ethernet.wan.status});
        $scope.ports.push({name:'LAN Port 1', currentMode: ethernet.lan1.currentMode, 
          desiredMode: ethernet.lan1.desiredMode, status: ethernet.lan1.status});
        $scope.ports.push({name:'LAN Port 2', currentMode: ethernet.lan2.currentMode, 
          desiredMode: ethernet.lan2.desiredMode, status: ethernet.lan2.status});
        $scope.ports.push({name:'LAN Port 3', currentMode: ethernet.lan3.currentMode, 
          desiredMode: ethernet.lan3.desiredMode, status: ethernet.lan3.status});
        $scope.ports.push({name:'LAN Port 4', currentMode: ethernet.lan4.currentMode, 
          desiredMode: ethernet.lan4.desiredMode, status: ethernet.lan4.status});
      });

      $scope.checkSave= function() {
        if(systemSettings.warnBeforeChanges) {
          $scope.isOK = true;
        }
        else {
          $scope.isOK = false;
          $scope.save();
        }
      }

      $scope.cancelOK= function() {
        $scope.isOK = false;
        $location.path("/advanced");
      }

      $scope.save = function() {
        Ethernet.update(
          {
            wan:{desiredMode: parseInt($scope.ports[0].desiredMode)},
            lan1:{desiredMode: parseInt($scope.ports[1].desiredMode)},
            lan2:{desiredMode: parseInt($scope.ports[2].desiredMode)},
            lan3:{desiredMode: parseInt($scope.ports[3].desiredMode)},
            lan4:{desiredMode: parseInt($scope.ports[4].desiredMode)}
          }, function() {
            $location.path("/advanced");
          });
      }
      $scope.selectOpt= function() {
        $scope.runFocus = true;
      }
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/portconfig'){
            if ($scope.isOK){
              $scope.save();
            }else{
              $scope.checkSave();
            }
          }
        }
      };

    }])
    .controller('RoutesCtrl', ['$scope', '$route', '$location', 
      'Routes', 'NetworkConnections', 'SystemSettings',
    function($scope, $route, $location, Routes, NetworkConnections, SystemSettings) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.runFocus = false;

      $scope.editingRoute = false;
      $scope.showErrorPage = false;
      $scope.routesConnections=[];

      $scope.routingObject = Routes.get(function() {
        $scope.routes = $scope.routingObject.routes;
      });
      
      $scope.sysSettings = SystemSettings.get(function(){});
      $scope.connections = NetworkConnections.query(function() {
        var iRouteCnt=0;
        for(var i = 0; i < $scope.connections.length; i++) {
          if($scope.connections[i].bridged != null)
            for(var j = 0; j < $scope.connections[i].bridged.length; j++)
              if($scope.connections[i].bridged[j]) {
                if($scope.connections[i].availableBridges[j] == 2)
                  $scope.connections[$scope.connections[i].availableBridges[j]].name = unescape($scope.connections[i].name) + ' Wireless 802.11 2.4GHz Access Point';
                else if($scope.connections[i].availableBridges[j] == 3)
                  $scope.connections[$scope.connections[i].availableBridges[j]].name = unescape($scope.connections[i].name) + ' Wireless 802.11 5.0GHz Access Point';
                else
                  $scope.connections[$scope.connections[i].availableBridges[j]].name = unescape($scope.connections[i].name + ' ' + $scope.connections[$scope.connections[i].availableBridges[j]].name);
              }
          $scope.connections[i].name = unescape($scope.connections[i].name);
          if(!$scope.connections[i].hasOwnProperty('connectionUsed')){
            $scope.routesConnections[iRouteCnt]= $scope.connections[i];
            iRouteCnt++;
          }
        }
      });
      
  	  $scope.errorIGMPPageOk = function() {
	    $scope.showIGMPwarning = false;
	    window.scrollTo(0,0);

	    Routes.update({domainRouting: $scope.routingObject.domainRouting, igmpRouting: $scope.routingObject.igmpRouting}, function() {
		  $location.path('/advanced');
	    });
	  }
  	
	  $scope.errorIGMPPageNo= function() {
	    $scope.showIGMPwarning = false;
	  }       

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.addNewRoute = function() {
        $scope.runFocus = true;
        $scope.routeIndex = -1;

        $scope.routeEditing = {
          type: 0,
          destination: [0,0,0,0],
          netmask: [255,255,255,255],
          gateway: [0,0,0,0],
          metric: 0
        }
        $scope.editingRoute = true;
      }


      $scope.save = function(isIgmp) {
    	if (!isIgmp && $scope.sysSettings.warnBeforeChanges === true){
    	  $scope.errorMessages = [];
    	  $scope.errorMessages.push("Internet Group Management Protocol (IGMP): You are attempting to disable Internet Group Management Protocol (IGMP). Please note that Internet Group Management Protocol (IGMP) will be disabled for the following connections:");
    	  $scope.showIGMPwarning = true;
    	  window.scrollTo(0,0);
    	}else{
    		Routes.update({domainRouting: $scope.routingObject.domainRouting, igmpRouting: $scope.routingObject.igmpRouting}, function() {
    		  $location.path('/advanced');
    		});
        }
      }

      $scope.warningMsgGen = function() {
        var warnMsg;
        if(null!=$scope.routes && $scope.routes.length > 0){
          warnMsg = $scope.connections[$scope.routes[0].type].name;
        }else{
          warnMsg = $scope.connections[0].name;
        }
        return warnMsg;
      }
      
      $scope.editRoute = function(ind) {
        $scope.editingRoute = true;
        var ro = $scope.routes[ind];
        $scope.routeIndex = ro.id;
        $scope.routeEditing = {
          type: parseInt($scope.translateRouteEnum(ro.type,true)),
          destination: splitIpArr(ro.destination),
          netmask: splitIpArr(ro.netmask),
          gateway: splitIpArr(ro.gateway),
          metric: ro.metric
        };
      }

      $scope.deleteRoute = function(ind) {
        var ro = $scope.routes[ind];
        Routes.remove({id: ro.id}, function() {
          $scope.routingObject = Routes.get(function() {
            $scope.routes = $scope.routingObject.routes;
          });
        })
      }

      $scope.cancelRouteEdit = function() {
        $scope.editingRoute = false;
      }

      $scope.saveRoute = function() {
        $scope.runFocus = true;
        $scope.errorMessages = [];
        if(!validateIp($scope.routeEditing.destination))
          $scope.errorMessages.push("Destination: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
        if(!validateIp($scope.routeEditing.netmask))
          $scope.errorMessages.push("Netmask: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
        if(getIpString($scope.routeEditing.netmask) == '0.0.0.0')
          $scope.errorMessages.push("Netmask: Subnet mask may not be 0.0.0.0. Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
        if($scope.routeEditing.metric == null || $scope.routeEditing.metric === '' || isNaN($scope.routeEditing.metric) || $scope.routeEditing.metric < 0 || $scope.routeEditing.metric > 255 || isNotaInt($scope.routeEditing.metric) || !checksForWholeNumber($scope.routeEditing.metric))
          $scope.errorMessages.push("Metric: Please enter a numeric value between 0 and 255.");
        if(getIpString($scope.routeEditing.gateway) == '0.0.0.0')
          $scope.errorMessages.push("Gateway: IP Address may not be 0.0.0.0.");
        if(!validateIp($scope.routeEditing.gateway))
          $scope.errorMessages.push("Gateway : IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");

        var valid = true;
        var zeroFound = false;
        for(var i = 0; i < 4; i++) {
          for(var k = 7; k > -1; k--) {
            var one = (($scope.routeEditing.netmask[i]>>k) & 1) == 1;
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
        if(!valid)
          $scope.errorMessages.push("Netmask: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        $scope.editingRoute = false;
        $scope.routeEditing.type = parseInt($scope.translateRouteEnum($scope.routeEditing.type,false));
        $scope.routeEditing.destination = getIpString($scope.routeEditing.destination);
        $scope.routeEditing.netmask = getIpString($scope.routeEditing.netmask);
        $scope.routeEditing.gateway = getIpString($scope.routeEditing.gateway);
        $scope.routeEditing.metric = parseInt($scope.routeEditing.metric);
        if($scope.routeIndex != -1) {
          Routes.update({id: $scope.routeIndex}, $scope.routeEditing, function() {
            $scope.routingObject = Routes.get(function() {
              $scope.routes = $scope.routingObject.routes;
            });
          });
        } else {
          Routes.save($scope.routeEditing, function() {
            $scope.routingObject = Routes.get(function() {
              $scope.routes = $scope.routingObject.routes;
            });
          })
        }
      };

      $scope.translateRouteEnum = function(routeType,reverse){
        //Adding Translated Enum
        if(!reverse)
        {
          switch(parseInt(routeType)){
            case 0:
                return 0;
            case 1://2.4 G
                return 2;
            case 2://5.0 G
                return 3;
          }
        }else
        {
          switch(parseInt(routeType)){
            case 0:
                return 0;
            case 2://2.4 G
                return 1;
            case 3://5.0 G
                return 2;
          }
        }

      };

      $scope.selectOpt= function() {
        $scope.runFocus = true;
      }
      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/advanced/routing'){
            if (!$scope.editingRoute && !$scope.showErrorPage && !$scope.showIGMPwarning){
              $scope.save($scope.routingObject.igmpRouting);
            }else if ($scope.editingRoute && !$scope.showErrorPage){
              $scope.saveRoute();
            }
          }
        }
      };

    }])
  .controller('UPnPCtrl', ['$scope', '$route', '$location', 'UPnP',
    function($scope, $route, $location, UPnP) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;

      $scope.upnpSettings = UPnP.get();

      $scope.save = function() {
        $scope.upnpSettings.$update(function() {
          $location.path('/advanced')
        })
      };



    }])

    .controller('dynamicDnsCtrl', ['$scope', '$route','$location','DynamicDNS','DynamicDNSProvider', '$window', 'securityTips','SystemSettings',
        function($scope, $route,$location,DynamicDNS,DynamicDNSProvider, $window, securityTips, SystemSettings) {

            $scope.sysSettings = SystemSettings.get();
            $scope.pageToShow = 0;
            $scope.toggleWarningPage = function(num) {
                $scope.pageToShow = num;
                window.scrollTo(0,0);
            };

            $scope.tab = $route.current.tab;
            $scope.section = $route.current.section;

            $scope.showErrorPage = false;
            $scope.showAddEdit = false;
            $scope.editing = -1;
            $scope.ddnsObjects=[];
            $scope.ddnsObject={};
            $scope.runFocus = false;

            $scope.getTitle = function(status){
              return getStatusTitle(status);
            }

            $scope.show = function(val){
              securityTips.showMessage(getStatusTitle(val.status),val.errorMessage);
            }

            $scope.init_DDNSObject = function()
            {
                $scope.ddnsObject= {
                    hostname: "",
                    provider:"",
                    username:"",
                    password:"",
                    useSsl:true,
                    status: "",
                    lastUpdate: ""
                };
            }

            /* LOAD PROVIDERS */
            $scope.loadProviders = function(){
              $scope.ddnsProviders = DynamicDNSProvider.query(function() {
                if($scope.ddnsProviders.length > 0){
                  $scope.ddnsObject.provider = $scope.ddnsProviders[0];
                }
              })
            }

            $scope.refresh = function(){
              $scope.ddnsObjects = [];
              $scope.dynamicDNSObjects = DynamicDNS.query(function() {
                var tempDDNSObject;
                for(var i = 0; i < $scope.dynamicDNSObjects.length; i++){
                  tempDDNSObject = {};
                  tempDDNSObject.id = $scope.dynamicDNSObjects[i].id;
                  tempDDNSObject.hostname = unescape($scope.dynamicDNSObjects[i].hostname);
                  tempDDNSObject.lastUpdate = unescape($scope.dynamicDNSObjects[i].updateTime);
                  tempDDNSObject.status = unescape($scope.dynamicDNSObjects[i].status);
                  tempDDNSObject.errorMessage = unescape($scope.dynamicDNSObjects[i].errorMessage);
                  if($scope.dynamicDNSObjects[i].status === 0 || $scope.dynamicDNSObjects[i].status === 1){
                      tempDDNSObject.hyperLink = false;
                    }else{
                      tempDDNSObject.hyperLink = true;
                    }
                  if(undefined != tempDDNSObject || tempDDNSObject.hostname != tempDDNSObject)
                    $scope.ddnsObjects.push(tempDDNSObject);
                }
              });

              $scope.loadProviders();
            }

            $scope.refresh();

            /* START: Functions */
            $scope.togglePage = function(num) {
              $scope.showAddEdit = false;
            };

            /* ERROR */
            $scope.errorPageOk = function () {
                $scope.showErrorPage = false;
                window.scrollTo(0, 0);
            }

            /* ADD */
            $scope.addDDNS = function() {
                $scope.loadProviders();
                $scope.showErrorPage = false;
                $scope.showAddEdit = true;
                $scope.editing = -1;
                $scope.init_DDNSObject();
                $scope.runFocus = true;
            }

            $scope.openSub = function() {
              if ($scope.ddnsObject.provider == '')
                return;
              $scope.DnsLink = $scope.ddnsObject.provider.url;
              $window.open($scope.DnsLink);
            }

            /* EDIT */
            $scope.editDDNSObj = function(index) {
                $scope.showAddEdit = true;
                $scope.showErrorPage = false;
                $scope.editing = index;
                $scope.ddnsObject = $scope.dynamicDNSObjects[index];
                for(var i = 0; i < $scope.ddnsProviders.length; i ++){
                  if($scope.ddnsProviders[i].name == $scope.ddnsObject.provider){
                    $scope.ddnsObject.provider = $scope.ddnsProviders[i];
                    break;
                  }
                }
            };

            /* Validations */
            $scope.saveDynamicDnsObj = function(){
              $scope.errorMessages = [];

              if($scope.ddnsObject.hostname.length !== 0){
                  for(var i = 0; i < $scope.dynamicDNSObjects.length; i++) {
                    if($scope.editing == i)
                      continue;
                    if($scope.dynamicDNSObjects[i].hostname === $scope.ddnsObject.hostname) {
                      $scope.errorMessages.push("Duplicate Hostname: An identical hostname already exists in the system.");
                      break;
                    }
                  }

                if (!validateLocalDomains($scope.ddnsObject.hostname))
                  $scope.errorMessages.push("Host Name: Name may not contain spaces. Only letters, digits and the special characters dash (-), underscore (_) and dot (.) may be used. These special characters may not appear at the beginning or at the end of a name. The maximum length of a label (text between two dots) is 63.");
              }else{
                $scope.errorMessages.push("Host Name: Name may not contain spaces. Only letters, digits and the special characters dash (-), underscore (_) and dot (.) may be used. These special characters may not appear at the beginning or at the end of a name. The maximum length of a label (text between two dots) is 63.");
              }
              if($scope.ddnsObject.provider.length == 0){
                $scope.errorMessages.push("Please Select DNS provider");
              }
              if($scope.ddnsObject.username.length == 0)
                $scope.errorMessages.push("Please enter a User Name.");

              if($scope.errorMessages.length > 0) {
                $scope.showErrorPage = true;
                window.scrollTo(0,0);
                return;
              }

              if(!$scope.ddnsObject.useSsl){
                securityTips.showWarningMsgBeforeSaving('DDNS Unsecured Mode',
                  'Disabling SSL will make your communications less secure. Without SSL your password will be sent over the Internet in plain text, which carries the risk of allowing your password to be exposed to a malicious user. To disable SSL, click "Apply".',
                  'Apply',
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

            /*SAVE*/
            $scope.save = function(){
              var ddnsObject = {};
              ddnsObject = $scope.ddnsObject;
              ddnsObject.provider = ddnsObject.provider.name;
              if (-1 == $scope.editing) {
                DynamicDNS.save(ddnsObject, function(){
                  $scope.refresh();
                  });
              } else { // Editing
                 delete ddnsObject.updateTime;
                 delete ddnsObject.status;
                 DynamicDNS.update({id: $scope.dynamicDNSObjects[$scope.editing].id}, ddnsObject, function(){
                   $scope.refresh();
                 });
              }
              $scope.togglePage(0);
              $scope.init_DDNSObject($scope);
            }

            /* CANCEL */
            $scope.cancelDynamicDnsObj = function() {
                $scope.togglePage(0);
                $scope.refresh();
            };

            /* REMOVE/DELETE*/
            $scope.cfmDeleteControl = function(){
              DynamicDNS.remove({id: $scope.selectedIndex}, function() {
                $scope.toggleWarningPage(0);
                $scope.refresh();
              });
            }

            $scope.removeDDNSEntry = function(index) {
                $scope.selectedIndex = index;
                if($scope.sysSettings.warnBeforeChanges == true) {
                    $scope.toggleWarningPage(1);
                }else{
                    $scope.cfmDeleteControl();
                }
            }

            /* REFRESH */
            $scope.refreshDDNS = function(){
              $scope.refresh();
            }
            $scope.keyPress = function(keyEvent) {
              if (keyEvent.keyCode == 13){
                if($location.path() == '/advanced/dynamicdns'){
                  if(!$scope.showAddEdit  && !$scope.showErrorPage){
                    $location.path('/advanced');
                  }else if ($scope.showAddEdit && !$scope.showErrorPage){
                    $scope.saveDynamicDnsObj();
                  }
                }
              }
            };

        }])
