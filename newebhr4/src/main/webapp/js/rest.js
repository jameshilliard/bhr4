var API_BASE_PATH = 'api';

angular.module('devices', ['ngResource']).
  factory('Devices', function($resource) {
    return $resource(API_BASE_PATH + '/devices/:id',
      {id: "@id"}, {"update": {method: "PUT"}});
  });

angular.module('dhcp', ['ngResource'])
  .factory('DhcpSettings', function($resource) {
    return $resource(API_BASE_PATH + '/dhcp',
      {}, {"update": {method: "PUT"}});
  })
  .factory('DhcpOptions', function($resource) {
    return $resource(API_BASE_PATH + '/dhcp/options');
  })
  .factory('DhcpConnections', function($resource) {
    return $resource(API_BASE_PATH + '/dhcp/clients/:clientId',
      {}, {"update": {method: "PUT"}});
  })
  .factory('DhcpAccessControl', function($resource) {
    return $resource(API_BASE_PATH + '/dhcp/accesscontrol',
      {}, {"update": {method: "PUT"}});
  });

angular.module('firmware_upgrade', ['ngResource'])
  .factory('FirmwareUpgrade', function($resource) {
    return $resource(API_BASE_PATH + '/firmware');
  });

angular.module('login', ['ngResource'])
  .factory('Login', function($resource) {
    return $resource(API_BASE_PATH + '/login',{},{"update":{method:"PUT"}});
  })
  .factory('Logout', function($resource) {
    return $resource(API_BASE_PATH + '/logout');
  })
  .factory('GeneralSettings', function($resource) {
    return $resource(API_BASE_PATH + '/generalsettings',{},{"update":{method:"PUT"}});
  });

angular.module('network_connections', ['ngResource'])
  .factory('NetworkConnections', function($resource) {
    return $resource(API_BASE_PATH + '/network/:id',
      {id: "@connectionId"}, { "update": {method: "PUT"}});
  });

angular.module('wireless', ['ngResource'])
  .factory('Wireless', function($resource) {
    return $resource(API_BASE_PATH + '/wireless/:id',
      {id: "@id"}, {"update": {method: "PUT"}});
  })
  .factory('WirelessTransmission', function($resource) {
    return $resource(API_BASE_PATH + '/wireless/:id/transmission',
      {}, {"update": {method: "PUT"}});
  })
  .factory('WirelessWmm', function($resource) {
    return $resource(API_BASE_PATH + '/wireless/:id/qos',
      {}, {"update": {method: "PUT"}});
  })
  .factory('WEP', function($resource) {
    return $resource(API_BASE_PATH + '/wireless/:id/wep',
      {}, {"update": {method: "PUT"}});
  })
  .factory('WPA', function($resource) {
    return $resource(API_BASE_PATH + '/wireless/:id/wpa',
      {}, {"update": {method: "PUT"}});
  })
  .factory('WPS', function($resource) {
    return $resource(API_BASE_PATH + '/wireless/:id/wps',
      {}, {"update": {method: "PUT"}});
  })
  .factory('WirelessMACFilter', function($resource) {
    return $resource(API_BASE_PATH + '/wireless/:id/macfilter',
      {}, {"update": {method: "PUT"}});
  })
  .factory('WifiProtectedSetup', function($resource) {
    return $resource(API_BASE_PATH + '/wireless/wifiSetup',
      {}, {"update": {method: "PUT"}});
  });;

angular.module('advanced', ['ngResource'])
  .factory('LocalAdmin', function($resource) {
    return $resource(API_BASE_PATH + '/settings/localadmin',
      {}, { "update": {method: "PUT"}});
  })
  .factory('RemoteAdmin', function($resource) {
    return $resource(API_BASE_PATH + '/settings/remoteadmin',
      {}, { "update": {method: "PUT"}});
  })
  .factory('SystemSettings', function($resource) {
    return $resource(API_BASE_PATH + '/settings/system',
      {}, { "update": {method: "PUT"}});
  })
  .factory('DateTimeSettings', function($resource) {
    return $resource(API_BASE_PATH + '/settings/datetime',
      {}, { "update": {method: "PUT"}});
  })
  .factory('Diagnostics', function($resource) {
    return $resource(API_BASE_PATH + '/diagnostics',
      {}, { "update": {method: "PUT"}});
  })
   .factory('Defaults', function($resource) {
    return $resource(API_BASE_PATH + '/settings/defaults',
      {}, { "update": {method: "PUT"}});
  })
   .factory('Reboot', function($resource) {
    return $resource(API_BASE_PATH + '/settings/reboot',
      {}, { "update": {method: "PUT"}});
  })
   .factory('MacCloning', function($resource) {
    return $resource(API_BASE_PATH + '/settings/maccloning',
      {}, { "update": {method: "PUT"}});
  })
   .factory('Users', function($resource) {
    return $resource(API_BASE_PATH + '/users/:id',
      {id: "@id"}, { "update": {method: "PUT"}});
  })
   .factory('Schedules', function($resource) {
    return $resource(API_BASE_PATH + '/settings/schedules/:id',
      {id: "@id" }, { "update": {method: "PUT"}});
  })
   .factory('DynDns', function($resource) {
    return $resource(API_BASE_PATH + '/settings/dynamicdns/:id',
      {id: "@id"}, { "update": {method: "PUT"}});
  })
  .factory('IPv6', function($resource) {
    return $resource(API_BASE_PATH + '/settings/ipv6',
      {}, {"update": {method: "PUT"}});
  })
   .factory('DnsServer', function($resource) {
    return $resource(API_BASE_PATH + '/settings/dnsserver/:id',
      {id: "@id"}, { "update": {method: "PUT"}});
  })
  .factory('ARPTable', function($resource) {
    return $resource(API_BASE_PATH + '/settings/arptable');
  })
   .factory('NetworkObjects', function($resource) {
    return $resource(API_BASE_PATH + '/settings/networkobjects/:id',
      {id: "@id"}, { "update": {method: "PUT"}});
  })
   .factory('PortForwardRules', function($resource) {
    return $resource(API_BASE_PATH + '/settings/portforwardrules/:id',
      {id: "@ruleId"}, { "update": {method: "PUT"}});
  })
  .factory('Ethernet', function($resource) {
    return $resource(API_BASE_PATH + '/settings/ethernet',
      {}, { "update": {method: "PUT"}});
  })
  .factory('Routes', function($resource) {
    return $resource(API_BASE_PATH + '/settings/routes/:id',
      {id: "@id"}, {"update": {method: "PUT"}});
  })
  .factory('Log', function($resource) {
    return $resource(API_BASE_PATH + '/settings/log/:id',
      {id: "@id"});
  })
  .factory('UPnP', function($resource) {
    return $resource(API_BASE_PATH + '/settings/upnp',
      {}, { "update": {method: "PUT"}});
  })
  .factory('ConfigInfo', function($resource) {
    return $resource(API_BASE_PATH + '/settings/configfile/info');
  })
  .factory('SetupWizard', function($resource) {
    return $resource(API_BASE_PATH + '/settings/setupwizard',
      {}, { "update": {method: "PUT"}});
  })
  .factory('DynamicDNSProvider', function($resource) {
    return $resource(API_BASE_PATH + '/settings/ddnsproviders');
  })
  .factory('DynamicDNS', function($resource) {
    return $resource(API_BASE_PATH + '/settings/ddns/:id',
    {id: "@id"}, { "update": {method: "PUT"}});
  })



angular.module('igmp', ['ngResource'])
  .factory('IGMPProxy', function($resource) {
    return $resource(API_BASE_PATH + '/settings/igmpproxy',
      {}, { "update": {method: "PUT"}});
  })
  .factory('IGMPAcl', function($resource) {
    return $resource(API_BASE_PATH + '/settings/igmpacl',
      {}, { "update": {method: "PUT"}});
  })
  .factory('IGMPHosts', function($resource) {
    return $resource(API_BASE_PATH + '/settings/igmphosts/:id',
      {id: "@id"}, { "update": {method: "PUT"}});
  })
  .factory('IGMPInterfaces', function($resource) {
    return $resource(API_BASE_PATH + '/settings/igmpintf',
      {}, { "update": {method: "PUT"}});
  })
  .factory('IgmpServices', function($resource) {
    return $resource(API_BASE_PATH + '/settings/igmpservices/:id',
      {id: "@id"}, { "update": {method: "PUT"}});
  })
  ;

angular.module('firewall', ['ngResource'])
  .factory('General', function($resource) {
    return $resource(API_BASE_PATH + '/firewall',
      {}, { "update": {method: "PUT"}});
  })
  .factory('FirewallDMZ', function($resource) {
    return $resource(API_BASE_PATH + '/firewall/dmzhost',
      {}, { "update": {method: "PUT"}});
  })
  .factory('AccessControl', function($resource) {
    return $resource(API_BASE_PATH + '/firewall/accesscontrol/:id',
      {id: "@id"}, { "update": {method: "PUT"}});
  })
  .factory('PortForward', function($resource) {
    return $resource(API_BASE_PATH + '/firewall/portforward/:id',
      {id: "@id"}, { "update": {method: "PUT"}});
  })
  .factory('PortTrigger', function($resource) {
    return $resource(API_BASE_PATH + '/firewall/porttrigger/:id',
      {id: "@id"}, { "update": {method: "PUT"}});
  })
  .factory('StaticNAT', function($resource) {
    return $resource(API_BASE_PATH + '/firewall/staticnat/:id',
      {id: "@id"}, { "update": {method: "PUT"}});
  })
  .factory('Filtering', function($resource) {
    return $resource(API_BASE_PATH + '/firewall/advanced/:id',
      {id: "@id"}, { "update": {method: "PUT"}});
  })
  .factory('SecurityLog', function($resource) {
    return $resource(API_BASE_PATH + '/firewall/log',
      {}, { "update": {method: "PUT"}});
  })
  .factory('SecuritySettings', function($resource) {
    return $resource(API_BASE_PATH + '/firewall/log/settings',
      {}, { "update": {method: "PUT"}});
  })
  .factory('SecurityCsv', function($resource) {
    return $resource(API_BASE_PATH + '/firewall/log/csv',
      {}, { "update": {method: "PUT"}});
  })
  .factory('SecurityHazard', function($resource) {
    return $resource(API_BASE_PATH + '/firewall/log/hazard',
      {}, { "update": {method: "PUT"}});
  });

angular.module('parental', ['ngResource'])
  .factory('Parental', function($resource) {
    return $resource(API_BASE_PATH + '/parental/:id',
      {id: "@id"}, { "update": {method: "PUT"}});
  });

angular.module('guestWifi',['ngResource'])
  .factory('GuestDevices',function($resource){
    return $resource(API_BASE_PATH+'/wireless/2/devices/:id',
      {id: "@id"},{"update": {method: "PUT"}})
  })
  .factory('GuestPassDevices', function($resource) {
    return $resource(API_BASE_PATH + '/wireless/3/devices/:id',
    {id: "@id"}, {"update": {method: "PUT"}})
  });
