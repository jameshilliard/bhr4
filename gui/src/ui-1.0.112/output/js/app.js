'use strict';
// Declare app level module which depends on filters, and services
angular.module('vzui', ['ngRoute', 'vzui.filters', 'vzui.services',
  'vzui.directives','ui.bootstrap',

    //controllers
    'main.controllers', 'network.controllers', 'advanced.controllers', 'wireless.controllers', 'firewall.controllers',
    'parental.controllers', 'system.controllers', 'igmp.controllers',

    //Objects
    'devices', 'network_connections', 'firmware_upgrade', 'dhcp', 'login',
    'wireless', 'advanced', 'firewall', 'parental', 'igmp']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

  $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginCtrl'});
  $routeProvider.when('/logout', {templateUrl: 'partials/logout.html', controller: 'LogoutCtrl'});

  $routeProvider.when('/main', {templateUrl: 'partials/main.html', controller: 'MainCtrl', tab: 'main'});

  $routeProvider.when('/wireless', {templateUrl: 'partials/wireless/main.html', controller: 'WirelessCtrl',
    tab: 'wireless', section: 'status'});
  $routeProvider.when('/wireless/basic', {templateUrl: 'partials/wireless/basic.html', controller: 'WirelessBasicCtrl',
    tab: 'wireless', section: 'basic'});
  $routeProvider.when('/wireless/advanced', {templateUrl: 'partials/wireless/advanced.html', controller: 'WirelessAdvanceCtrl',
    tab: 'wireless', section: 'advanced'});
  $routeProvider.when('/wireless/wep/:id', {templateUrl: 'partials/wireless/wep.html', controller: 'WirelessWEPCtrl',
    tab: 'wireless', section: 'advanced'});
  $routeProvider.when('/wireless/wpa/:id', {templateUrl: 'partials/wireless/wpa.html', controller: 'WirelessWPACtrl',
    tab: 'wireless', section: 'advanced', wpa: 0});
  $routeProvider.when('/wireless/wpa2/:id', {templateUrl: 'partials/wireless/wpa.html', controller: 'WirelessWPACtrl',
    tab: 'wireless', section: 'advanced', wpa: 1});
  $routeProvider.when('/wireless/ssidbroadcast/:id', {templateUrl: 'partials/wireless/ssidbroadcast.html', controller: 'WirelessSSIDBroadcast',
    tab: 'wireless', section: 'advanced'});
  $routeProvider.when('/wireless/mode', {templateUrl: 'partials/wireless/mode.html', controller: 'WirelessMode',
    tab: 'wireless', section: 'advanced'});
  $routeProvider.when('/wireless/macauth', {templateUrl: 'partials/wireless/macauth.html', controller: 'WirelessMACFilterCtrl',
    tab: 'wireless', section: 'advanced'});
  $routeProvider.when('/wireless/transmission', {templateUrl: 'partials/wireless/transmission.html', controller: 'WirelessTransmissionCtrl',
    tab: 'wireless', section: 'advanced'});
  $routeProvider.when('/wireless/wmm/:id', {templateUrl: 'partials/wireless/wmm.html', controller: 'WirelessWmmCtrl',
    tab: 'wireless', section: 'advanced'});
  $routeProvider.when('/wireless/wifiSetup', {templateUrl: 'partials/wireless/wifiSetup.html', controller: 'WifiSetupCtrl',
    tab: 'wireless', section: 'wifiSetup'});


  $routeProvider.when('/network', {templateUrl: 'partials/network/network.html', controller: 'NetworkCtrl',
    tab: 'network', section: 'status'});
  $routeProvider.when('/network/connections', {templateUrl: 'partials/network/networkConnections.html', controller: 'NetworkConnectionsCtrl',
    tab: 'network', section: 'connections'});
  $routeProvider.when('/network/connections/:id', {templateUrl: 'partials/network/connection.html', controller: 'NetworkConnectionCtrl',
    tab: 'network', section: 'connections'});
  $routeProvider.when('/network/connections/:id/edit', {templateUrl: 'partials/network/connectionEditBase.html', controller: 'NetworkConnectionEditCtrl',
    tab: 'network', section: 'connections'});
  $routeProvider.when('/network/connections/:id/wancoaxstats', {templateUrl: 'partials/network/wanCoaxStats.html', controller: 'WanCoaxStatsCtrl',
    tab: 'network', section: 'connections'});
  $routeProvider.when('/network/connections/:id/lancoaxstats', {templateUrl: 'partials/network/lanCoaxStats.html', controller: 'LanCoaxStatsCtrl',
    tab: 'network', section: 'connections'});
  $routeProvider.when('/network/device/details/:id', {templateUrl: 'partials/network/deviceDetails.html', controller: 'DeviceDetailsCtrl',
    tab: 'network', section: 'status'});
  $routeProvider.when('/network/device/rename/:id', {templateUrl: 'partials/network/deviceRename.html', controller: 'DeviceDetailsCtrl',
    tab: 'network', section: 'status'});
  $routeProvider.when('/network/full', {templateUrl: 'partials/network/fullStatus.html', controller: 'FullStatusCtrl',
    tab: 'network', section: 'connections'});


  $routeProvider.when('/firewall', {templateUrl: 'partials/firewall/main.html', controller: 'GeneralCtrl',
   tab: 'firewall', section: 'general'});
  $routeProvider.when('/firewall/accesscontrol', {templateUrl: 'partials/firewall/accessControl.html', controller: 'AccessControlCtrl',
   tab: 'firewall', section: 'access'});
  $routeProvider.when('/firewall/portforward', {templateUrl: 'partials/firewall/portForward.html', controller: 'PortForwardCtrl',
   tab: 'firewall', section: 'portforward'});
  $routeProvider.when('/firewall/porttrigger', {templateUrl: 'partials/firewall/portTrigger.html', controller: 'PortTriggerCtrl',
   tab: 'firewall', section: 'porttrigger'});
  $routeProvider.when('/firewall/remoteadmin', {templateUrl: 'partials/firewall/remoteAdmin.html', controller: 'RemoteAdminCtrl',
   tab: 'firewall', section: 'remoteadmin'});
  $routeProvider.when('/firewall/staticnat', {templateUrl: 'partials/firewall/staticNAT.html', controller: 'StaticNATCtrl',
   tab: 'firewall', section: 'staticnat'});
  $routeProvider.when('/firewall/log', {templateUrl: 'partials/firewall/securityLog.html', controller: 'FirewallSecurityLogCtrl',
   tab: 'firewall', section: 'securitylog'});


  $routeProvider.when('/parental', {templateUrl: 'partials/parental/main.html', controller: 'ParentalAddCtrl',
   tab: 'parental', section: 'parental'});
  $routeProvider.when('/parental/summary', {templateUrl: 'partials/parental/summary.html', controller: 'ParentalSummaryCtrl',
   tab: 'parental', section: 'summary'});


  $routeProvider.when('/advanced', {templateUrl: 'partials/advanced/advanced.html', controller: 'basicAdvancedCtrl',
   tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/fwupgrade', {templateUrl: 'partials/advanced/fwupgrade.html', controller: 'fwUpgradeCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/fwrestore', {templateUrl: 'partials/advanced/fwrestore.html', controller: 'fwRestoreCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/dhcp', {templateUrl: 'partials/advanced/dhcpMain.html', controller: 'dhcpCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/dhcp/edit', {templateUrl: 'partials/advanced/dhcpSettings.html', controller: 'dhcpEditCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/dhcp/connections', {templateUrl: 'partials/advanced/dhcpConnections.html', controller: 'dhcpConnectionsCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/routing', {templateUrl: 'partials/advanced/routing.html', controller: 'RoutesCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/datetime', {templateUrl: 'partials/advanced/datetime.html', controller: 'dateTimeCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/scheduler', {templateUrl: 'partials/advanced/scheduler.html', controller: 'schedulerCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/portconfig', {templateUrl: 'partials/advanced/portconfig.html', controller: 'PortConfigCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/settings', {templateUrl: 'partials/advanced/settings.html', controller: 'systemSettingsCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/configfile', {templateUrl: 'partials/advanced/configfile.html', controller: 'configFileCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/portforward', {templateUrl: 'partials/advanced/portforward.html', controller: 'portForwardRuleCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/networkobjects', {templateUrl: 'partials/advanced/networkobjects.html', controller: 'networkObjectCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/dnsserver', {templateUrl: 'partials/advanced/dnsserver.html', controller: 'dnsServerCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/remoteadmin', {templateUrl: 'partials/advanced/remoteadmin.html', controller: 'remoteAdminCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/localadmin', {templateUrl: 'partials/advanced/localadmin.html', controller: 'localAdminCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/users', {templateUrl: 'partials/advanced/users.html', controller: 'usersCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/arptable', {templateUrl: 'partials/advanced/arptable.html', controller: 'ArpCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/maccloning', {templateUrl: 'partials/advanced/maccloning.html', controller: 'macCloningCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/reboot', {templateUrl: 'partials/advanced/reboot.html', controller: 'rebootCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/defaults', {templateUrl: 'partials/advanced/defaults.html', controller: 'defaultsCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/diagnostics', {templateUrl: 'partials/advanced/diagnostics.html', controller: 'diagnosticsCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/ipv6', {templateUrl: 'partials/advanced/ipv6.html', controller: 'ipv6Ctrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/upnp', {templateUrl: 'partials/advanced/upnp.html', controller: 'UPnPCtrl',
    tab: 'advanced', section: 'advanced'});
  $routeProvider.when('/advanced/dynamicdns', {templateUrl: 'partials/advanced/dynamicdns.html', controller: 'dynamicDnsCtrl',
    tab: 'advanced', section: 'advanced'});

  $routeProvider.when('/igmp/igmpproxy', {templateUrl: 'partials/igmp/igmpProxy.html', controller: 'IgmpProxyCtrl',
    tab: 'advanced', section: 'igmp'});
  $routeProvider.when('/igmp/intmulti', {templateUrl: 'partials/igmp/intMulticast.html', controller: 'IgmpIntfCtrl',
    tab: 'advanced', section: 'intmulti'});
  $routeProvider.when('/igmp/hostmulti', {templateUrl: 'partials/igmp/hostMulticast.html', controller: 'IgmpHostsCtrl',
    tab: 'advanced', section: 'hostmulti'});
  $routeProvider.when('/igmp/aclmulti', {templateUrl: 'partials/igmp/aclMulticast.html', controller: 'IgmpAclCtrl',
    tab: 'advanced', section: 'aclmulti'});
  $routeProvider.when('/igmp/servmulti', {templateUrl: 'partials/igmp/servMulticast.html', controller: 'IgmpServCtrl',
    tab: 'advanced', section: 'servmulti'});

  $routeProvider.when('/monitoring', {templateUrl: 'partials/system/main.html', controller: 'MonitoringCtrl',
   tab: 'monitoring', section: 'router'});
  $routeProvider.when('/monitoring/advanced', {templateUrl: 'partials/system/advanced.html', controller: 'MonitoringAdvCtrl',
   tab: 'monitoring', section: 'advanced'});
  $routeProvider.when('/monitoring/systemlog', {templateUrl: 'partials/system/log.html', controller: 'SystemLogCtrl',
   tab: 'monitoring', section: 'system'});
  $routeProvider.when('/monitoring/securitylog', {templateUrl: 'partials/system/log.html', controller: 'SecurityLogCtrl',
   tab: 'monitoring', section: 'security'});
  $routeProvider.when('/monitoring/advancedlog', {templateUrl: 'partials/system/log.html', controller: 'AdvancedLogCtrl',
   tab: 'monitoring', section: 'advanced'});
  $routeProvider.when('/monitoring/firewalllog', {templateUrl: 'partials/system/log.html', controller: 'FirewallLogCtrl',
   tab: 'monitoring', section: 'firewall'});
  $routeProvider.when('/monitoring/wandhcplog', {templateUrl: 'partials/system/log.html', controller: 'WandhcpLogCtrl',
   tab: 'monitoring', section: 'wandhcp'});
  $routeProvider.when('/monitoring/landhcplog', {templateUrl: 'partials/system/log.html', controller: 'LandhcpLogCtrl',
   tab: 'monitoring', section: 'landhcp'});
  $routeProvider.when('/monitoring/fullstatus', {templateUrl: 'partials/system/fullstatus.html', controller: 'FullStatusCtrl',
   tab: 'monitoring', section: 'advanced'});
  $routeProvider.when('/monitoring/traffic', {templateUrl: 'partials/system/traffic.html', controller: 'FullStatusCtrl',
   tab: 'monitoring', section: 'advanced'});
  $routeProvider.when('/monitoring/bandwidth', {templateUrl: 'partials/system/bandwidth.html', controller: 'BandwidthCtrl',
   tab: 'monitoring', section: 'advanced'});


  $routeProvider.when('/setup', {templateUrl: 'partials/setup/main.html', controller: 'SetupCtrl'});

  $routeProvider.otherwise({redirectTo: '/login'});
}])
.run( function($rootScope, $location, SystemSettings) {
  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    $rootScope.pre_path = $rootScope.cur_path;
    $rootScope.cur_path = $location.url();
    if (!$rootScope.loggedIn && $location.path() != "/login" && $location.path() != '/setup') {
      $rootScope.nextLocation = $location.path();
      $location.path( "/login" );
    }
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
      if(status==401 && $location.path() !== '/setup'){
        sessionLifetime = undefined;
        window.clearTimeout(sessionTimeOut);
        $location.path('/login');
      }
      return $q.reject(response);
    };

    return function(promise) {
      return promise.then(success, error);
    };
  }];
  $httpProvider.responseInterceptors.push(interceptor);
});
