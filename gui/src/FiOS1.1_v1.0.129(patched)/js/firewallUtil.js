
/*|--------------------------------------------------|*
  | START: Network Object Functions                  |
  | init -- apply -- cancel -- edit -- copy -- print |
 *|--------------------------------------------------|*/
function init_networkObjs($scope) {
  init_networkObj($scope);
  init_address($scope);
}
function init_networkObj($scope) {
  $scope.networkObj = {
    name: "Global Object",
    type: 1,
    rules: []
  };
  $scope.editingNetworkObj = -1;
}
function init_address($scope) {
  $scope.rule = {
    networkObjType: 0,
    dhcpType: 0,
    ip: splitIpArr("0.0.0.0"),
    ipTwo: splitIpArr("0.0.0.0"),
    mac: splitMacArr("00:00:00:00:00:00"),
    macMask: splitMacArr("ff:ff:ff:ff:ff:ff"),
    hostname: ""
  };
  $scope.editingAddress = -1;
}
function applyNetworkObj($scope, objArr) {

  /* if this network object is NEW, push it onto objArr */
  if (-1 == $scope.editingNetworkObj) {

    var tempNetworkObj = {};
    copyNetworkObj(tempNetworkObj, $scope.networkObj)
    objArr.push(tempNetworkObj);
  
  /* else, copy the modified obj to objArr[$scope.editingNetworkObj] */
  } else {
    copyNetworkObj(objArr[$scope.editingNetworkObj], $scope.networkObj);
  }

  init_networkObj($scope);
  $scope.togglePage(0);
}
function applyAddress($scope) {

  if (-1 == $scope.editingAddress) {
    var tempAddress = {};
    copyAddress(tempAddress, $scope.rule, 0);
    $scope.networkObj.rules.push(tempAddress);
  
  } else { // Editing
    copyAddress($scope.networkObj.rules[$scope.editingAddress], $scope.rule, 0);
  }

  init_address($scope);
  $scope.togglePage(1);
}
function cancelNetworkObj($scope) {
  init_networkObj($scope);
  $scope.togglePage(0);
}
function cancelAddress($scope) {
  init_address($scope);
  $scope.togglePage(1);
}
function editNetworkObj($scope, objArr, index) {

  copyNetworkObj($scope.networkObj, objArr[index]);

  $scope.editingNetworkObj = index;
  $scope.togglePage(1);
}
function editAddress($scope, index) {

  copyAddress($scope.rule, $scope.networkObj.rules[index], 2);

  $scope.editingAddress = index;
  $scope.togglePage(2);
}
function copyNetworkObjs(newObjs, oldObjs, transform) {
  for (var i = 0; i < oldObjs.length; i++) {
    var tempNetworkObj = {};
    copyNetworkObj(tempNetworkObj, oldObjs[i], transform);
    newObjs.push(tempNetworkObj);
  }
}
function copyNetworkObj(newObj, oldObj, transform) {
  newObj.name = oldObj.name;
  newObj.type = oldObj.type;
  newObj.rules = [];

  if (0 == oldObj.type) {
    // Any
  } else if (2 == oldObj.type) {
    // DNS Entry
    copyDnsEntry(newObj.rules, oldObj.rules);
  } else if (4 == oldObj.type) {
    // Device
    for (var i = 0; i < oldObj.rules.length; i++) {
      var tempEntry = {};
      if(transform) {
        tempEntry.hostname = oldObj.rules[i].name;
        tempEntry.networkObjType = 4;
      } else {
        tempEntry.name = oldObj.rules[i].name;
        tempEntry.networkObjType = 7;
      }
      tempEntry.ipAddress = oldObj.rules[i].ipAddress;
      newObj.rules.push(tempEntry);
    }
  } else {
    // Either user defined or network object from advanced
    copyAddresses(newObj.rules, oldObj.rules);    
  }
}
function copyAddresses(newAddresses, oldAddresses) {

  for (var i = 0; i < oldAddresses.length; i++) {
    var tempAddress = {};
    copyAddress(tempAddress, oldAddresses[i], 1);
    newAddresses.push(tempAddress);
  }
}
function copyAddress(newAddress, oldAddress, num) {

  newAddress.networkObjType = parseInt(oldAddress.networkObjType);

  if (0 == num) {
    // The addresses are in array form, and need to be combined

    switch(newAddress.networkObjType)
    {
    case 0: // Ip Address
      newAddress.ipAddress = getIpString(oldAddress.ip);
      break;
    case 1: // Ip Subnet
      newAddress.ipSubnet = getIpString(oldAddress.ip);
      newAddress.subnetMask = getIpString(oldAddress.ipTwo);
      break;
    case 2: // Ip Range
      newAddress.ipStart = getIpString(oldAddress.ip);
      newAddress.ipEnd = getIpString(oldAddress.ipTwo);
      break;
    case 3: // Mac Address
      newAddress.mac = getMacString(oldAddress.mac);
      newAddress.macMask = getMacString(oldAddress.macMask);
      break;
    case 4: // Hostname
      newAddress.hostname = oldAddress.hostname;
      break;
    case 5: // Dhcp
      newAddress.option = oldAddress.hostname;
      newAddress.dhcpType = oldAddress.dhcpType;
      break;
    case 7:
      newAddress.name = oldAddress.name;
      break;
    }

  } else if (1 == num) {
    // Direct copy

    switch(newAddress.networkObjType)
    {
    case 0: // Ip Address
      newAddress.ipAddress = oldAddress.ipAddress;
      break;
    case 1: // Ip Subnet
      newAddress.ipSubnet = oldAddress.ipSubnet;
      newAddress.subnetMask = oldAddress.subnetMask;
      break;
    case 2: // Ip Range
      newAddress.ipStart = oldAddress.ipStart;
      newAddress.ipEnd = oldAddress.ipEnd;
      break;
    case 3: // Mac Address
      newAddress.mac = oldAddress.mac;
      newAddress.macMask = oldAddress.macMask;
      break;
    case 4: // Hostname
      newAddress.hostname = oldAddress.hostname;
      break;
    case 5: // Dhcp
      newAddress.option = oldAddress.option;
      newAddress.dhcpType = oldAddress.dhcpType;
      break;
    case 7:
      newAddress.name = oldAddress.name;
      break;
    }
  
  } else if (2 == num) {
    // This one is used when copying them to the tempAddress for editing

    switch(newAddress.networkObjType)
    {
    case 0: // Ip Address
      newAddress.ip = splitIpArr(oldAddress.ipAddress);
      break;
    case 1: // Ip Subnet
      newAddress.ip = splitIpArr(oldAddress.ipSubnet);
      newAddress.ipTwo = splitIpArr(oldAddress.subnetMask);
      break;
    case 2: // Ip Range
      newAddress.ip = splitIpArr(oldAddress.ipStart);
      newAddress.ipTwo = splitIpArr(oldAddress.ipEnd);
      break;
    case 3: // Mac Address
      newAddress.mac = splitMacArr(oldAddress.mac);
      newAddress.macMask = splitMacArr(oldAddress.macMask);
      break;
    case 4: // Hostname
      newAddress.hostname = oldAddress.hostname;
      break;
    case 5: // Dhcp
      newAddress.hostname = oldAddress.option;
      newAddress.dhcpType = oldAddress.dhcpType;
      break;
    case 7:
      newAddress.name = oldAddress.name;
      break;
    }
  }
}
function copyDnsEntry(newEntry, oldEntry) {
  for (var i = 0; i < oldEntry.length; i++) {
    var tempEntry = {};
    tempEntry.hostname = oldEntry[i].hostname;
    tempEntry.networkObjType = 6;
    newEntry.push(tempEntry);
  }
}
function printAddressObject(address, toPrint) {
  switch(address.networkObjType)
  {
  case 0: // ipAddress
    toPrint.push(address.ipAddress);
    break;
  case 1: // ipSubnet
    toPrint.push(address.ipSubnet + " / " + address.subnetMask);
    break;
  case 2: // ipRange
    if(address.ipStart == address.ipEnd){
      toPrint.push(address.ipStart);
    }else{
      toPrint.push(address.ipStart + " - " + address.ipEnd);
    }
    break;
  case 3: // macAddress
    toPrint.push(address.mac + " / " + address.macMask);
    break;
  case 4: // hostName
    toPrint.push(address.hostname);
    break;
  case 5: // dhcpType
    switch(address.dhcpType) {
      case 0:
        toPrint.push("DHCP Option: Vendor Class ID = " + address.option);
        break;
      case 1:
        toPrint.push("DHCP Option: Client ID = " + address.option);
        break;
      case 2:
        toPrint.push("DHCP Option: User Class ID = " + address.option);
        break;
    }
    break;
  case 6: // hostname
    toPrint.push(address.hostname);
    break;
  case 7: // Device Name
    toPrint.push(address.name);
    break;
  }
}
function getPrintArrayForAddresses(addressArr, toPrint) {
  for (var ind in addressArr) {
    printAddressObject(addressArr[ind], toPrint);
  }
}
function printAccessControlAddresses(obj, devices, printArr) {
  for (var i in obj) {
    if(!(i >= 0)){
      continue;
    }
    var toPrint = [];

    if (obj[i].networkObjects === undefined || obj[i].networkObjects === null || obj[i].networkObjects.length == 0) {
      obj[i].displayText = ['Any'];
      toPrint.push("Any");
      printArr.push(toPrint);
      continue;
    }
    obj[i].displayText = [];
    for (var j in obj[i].networkObjects) {
      if(!(j >= 0)){
        continue;
      }
      for(var ind in obj[i].networkObjects[j].rules) {
        if(!(ind >= 0)){
          continue;
        }
        var address = obj[i].networkObjects[j].rules[ind];
        switch(address.networkObjType)
        {
        case 0: // ipAddress
          obj[i].displayText.push(address.ipAddress);
          toPrint.push(address.ipAddress);
          break;
        case 1: // ipSubnet
          obj[i].displayText.push(address.ipSubnet + " / " + address.subnetMask);
          toPrint.push(address.ipSubnet + " / " + address.subnetMask);
          break;
        case 2: // ipRange
          obj[i].displayText.push(address.ipStart + " - " + address.ipEnd);
          toPrint.push(address.ipStart + " - " + address.ipEnd);
          break;
        case 3: // macAddress
          obj[i].displayText.push(address.mac);
          toPrint.push(address.mac);
          break;
        case 4: {// hostName
            obj[i].displayText.push(address.hostname);
            var found = false;
            for(var dev = 0; dev < devices.length; dev++) {
              if(devices[dev].name == address.hostname) {
                toPrint.push(devices[dev].ipAddress);
                found = true;
                break;
              }
            }
            if(!found)toPrint.push('');
          }
          break;
        case 5: // dhcpType
          switch(address.dhcpType) {
            case 0:
              toPrint.push("DHCP Option: Vendor Class ID = " + address.option);
              obj[i].displayText.push("DHCP Option: Vendor Class ID = " + address.option);
              break;
            case 1:
              toPrint.push("DHCP Option: Client ID = " + address.option);
              obj[i].displayText.push("DHCP Option: Client ID = " + address.option);
              break;
            case 2:
              toPrint.push("DHCP Option: User Class ID = " + address.option);
              obj[i].displayText.push("DHCP Option: User Class ID = " + address.option);
              break;
          }
          break;
        case 6: // hostname
          toPrint.push(address.hostname);
          obj[i].displayText.push(address.hostname);
          break;
        case 7: {// Device Name
            obj[i].displayText.push(address.name);
            var found = false;
            for(var dev = 0; dev < devices.length; dev++) {
              if(devices[dev].name == address.name
                  && devices[dev].ipAddress === address.ipAddress) {
                toPrint.push(devices[dev].ipAddress);
                found = true;
                break;
              }
            }
            if(!found)toPrint.push('');
            break;
          }
        }
      }
    }
    printArr.push(toPrint);
  }
}

function printAddresses(type, obj, printArr) {

  if (0 == type) { // obj = an array of networkObjects arrays
    for (var i in obj) {
      if(!(i >= 0)){
        continue;
      }
      var toPrint = [];

      if (0 == obj[i].networkObjects.length) {
        toPrint.push("Any");
        printArr.push(toPrint);
        continue;
      }
      for (var j in obj[i].networkObjects) {
        getPrintArrayForAddresses(obj[i].networkObjects[j].rules, toPrint);
      }
      printArr.push(toPrint);
    }

  } else if (1 == type) { // obj = a networkObjects array
    if (0 == obj.length) {
      var temp = [];
      temp.push("Any");
      printArr.push(temp);
    }
    for (var i in obj) {
      if(!(i >= 0)){
        continue;
      }
      var toPrint = [];
      getPrintArrayForAddresses(obj[i].rules, toPrint);
      printArr.push(toPrint);
    }

  } else if (4 == type) { // obj = filtering array

    for (var i = 0; i < 8; i++) {
      for (var ind in obj[i].filters) {
        printAddresses(1, obj[i].filters[ind].source, printArr[i].sourceArr);
        printAddresses(1, obj[i].filters[ind].dest, printArr[i].destArr);
      }
    }

  } else if (5 == type) { // obj = traffic priority array

    for (var i = 0; i < 8; i++) {
      for (var ind in obj[i].priorities) {
        printAddresses(1, obj[i].priorities[ind].source, printArr[i].sourceArr);
        printAddresses(1, obj[i].priorities[ind].dest, printArr[i].destArr);
      }
    }

  }
}
/* END: Network Object Functions */

/*|--------------------------------------------------|*
  | START: Service Functions                         |
  | init -- apply -- cancel -- edit -- copy -- print |
 *|--------------------------------------------------|*/
function init_services($scope) {
  $scope.protNames = ["Other", "TCP", "UDP", "ICMP", "GRE", "ESP", "AH"];

  $scope.service = {
    name: "Name",
    type: 1,
    protocols: []
  };
  $scope.editingService = -1;
  init_protocols($scope);
  $scope.printPortsArr = [];
}
function init_protocols($scope) {
  $scope.protocols = {
    protocol: 0,
    protocolExclude: false,
    incomingPorts: 0,
    incomingPortStart: 1,
    incomingPortEnd: 65535,
    incomingExclude: false,
    outgoingPorts: 0,
    outgoingPortStart: 1,
    outgoingPortEnd: 65535,
    outgoingExclude: false,
    icmpMessage: 0,
    icmpType: 0,
    icmpCode: 0,
    protocolNumber: 0
  };
  $scope.editingProtocol = -1;
}
function applyService($scope, objArr) {

  if (-1 == $scope.editingService) {
    var tempService = {};
    copyService(tempService, $scope.service);
    objArr.push(tempService);
  
  } else { // Editing
    copyService(objArr[$scope.editingService], $scope.service);
  }

  init_services($scope);
  $scope.togglePage(0);
}
function applyProtocol($scope, dest) {
  if($scope.protocols.protocol == 0) {
    switch($scope.protocols.protocolNumber) {
      case 1:
        $scope.protocols.protocol = 3;
        $scope.protocols.icmpMessage = 0;
        break;
      case 6:
        $scope.protocols.protocol = 1;
        $scope.protocols.incomingPorts=0;
        $scope.protocols.incomingPortStart=0;
        $scope.protocols.incomingPortEnd=65535;
        $scope.protocols.incomingExclude=false;
        $scope.protocols.outgoingPorts=0;
        $scope.protocols.outgoingPortStart=0;
        $scope.protocols.outgoingPortEnd=65535;
        $scope.protocols.outgoingExclude=false;
        break;
      case 17:
        $scope.protocols.protocol = 2;
        $scope.protocols.incomingPorts=0;
        $scope.protocols.incomingPortStart=0;
        $scope.protocols.incomingPortEnd=65535;
        $scope.protocols.incomingExclude=false;
        $scope.protocols.outgoingPorts=0;
        $scope.protocols.outgoingPortStart=0;
        $scope.protocols.outgoingPortEnd=65535;
        $scope.protocols.outgoingExclude=false;
        break;
      case 47:
        $scope.protocols.protocol = 4;
        break;
      case 50:
        $scope.protocols.protocol = 5;
        break;
      case 51:
        $scope.protocols.protocol = 6;
        break;
      default:
        break;
    }
  }
  if (-1 == $scope.editingProtocol) {
    var tempProtocol = {};
    copyProtocol(tempProtocol, $scope.protocols);
    dest.push(tempProtocol);

  } else { // Editing
    copyProtocol(dest[$scope.editingProtocol], $scope.protocols);
  }

  $scope.printPortsArr = [];
  printProtocol(2, $scope.service.protocols, $scope.printPortsArr);

  init_protocols($scope);
  $scope.togglePage(3);
}
function cancelService($scope) {
  init_services($scope);
  $scope.togglePage(0);
}
function cancelProtocol($scope) {
  init_protocols($scope);
  $scope.togglePage(3);
}
function editService($scope, objArr, index) {
  copyService($scope.service, objArr[index]);

  $scope.printPortsArr = [];
  printProtocol(2, $scope.service.protocols, $scope.printPortsArr);

  $scope.editingService = index;
  $scope.togglePage(3);
}
function editProtocol($scope, index, source, togglePageNum) {

  copyProtocol($scope.protocols, source[index]);

  $scope.editingProtocol = index;
  if(undefined != togglePageNum){
    $scope.togglePage(togglePageNum);
  }else{
    $scope.togglePage(4);
  }
 }
function copyServices(newServices, oldServices) {
  for (var i = 0; i < oldServices.length; i++) {
    var tempService = {};
    copyService(tempService, oldServices[i]);
    newServices.push(tempService);
  }
}
function copyService(newService, oldService) {
  newService.name = oldService.name;
  newService.type = oldService.type;
  if(oldService.description)
    newService.description = oldService.description;
  newService.protocols = [];

  for (var i = 0; i < oldService.protocols.length; i++) {
    var tempProtocol = {};
    copyProtocol(tempProtocol, oldService.protocols[i])
    newService.protocols.push(tempProtocol);
  }
}
function copyProtocol(newProtocol, oldProtocol) {
    
  newProtocol.protocol = parseInt(oldProtocol.protocol);
  newProtocol.protocolExclude = oldProtocol.protocolExclude;

  switch (oldProtocol.protocol) {
    case 1: // TCP
    case 2: // UDP
    {
      newProtocol.incomingPorts = oldProtocol.incomingPorts;
      newProtocol.outgoingPorts = oldProtocol.outgoingPorts;

      if (oldProtocol.incomingPorts > 0) {
        newProtocol.incomingPortStart = oldProtocol.incomingPortStart;

        if (2 == oldProtocol.incomingPorts)
          newProtocol.incomingPortEnd = oldProtocol.incomingPortEnd;
      }

      if (oldProtocol.outgoingPorts > 0) {
        newProtocol.outgoingPortStart = oldProtocol.outgoingPortStart;

        if (2 == oldProtocol.outgoingPorts)
          newProtocol.outgoingPortEnd = oldProtocol.outgoingPortEnd;
        else if(3 == oldProtocol.outgoingPorts) {
          newProtocol.outgoingPortStart = 0;
          newProtocol.outgoingPortEnd = 0;
        }
      }
      newProtocol.incomingExclude = oldProtocol.incomingExclude;
      newProtocol.outgoingExclude = oldProtocol.outgoingExclude;

      break;
    }
    case 3:
    {
      newProtocol.icmpMessage = parseInt(oldProtocol.icmpMessage);
      if (10 == oldProtocol.icmpMessage) {
        newProtocol.icmpType = oldProtocol.icmpType;
        newProtocol.icmpCode = oldProtocol.icmpCode;
      }
    }
      break;
    case 0:
      newProtocol.protocolNumber = oldProtocol.protocolNumber;
      break;
  }
}
/* If type is 1, then it is normal. If type is 2, then don't do any printing for GRE, ESP, and AH */
function printProtocolObject(obj, toPrint, type) {
  var tmpString = "";
  var protocol = obj.protocol;
  switch(protocol) {
  case 1://TCP
  case 2://UDP2
  {
    if(type == 1) {
      if(obj.protocolExclude)
        tmpString += "~";
      tmpString += protocol == 1 ? "TCP " : "UDP ";
    }
    if(obj.incomingExclude)
      tmpString += "~";
    if (0 == obj.incomingPorts) {
      tmpString += "Any -> ";
    } else if (1 == obj.incomingPorts) {
      tmpString += obj.incomingPortStart + " -> ";
    } else if (2 == obj.incomingPorts) {
      tmpString += obj.incomingPortStart + " - " + obj.incomingPortEnd + " -> ";
    }
    if(obj.outgoingExclude)
      tmpString += "~";
    if (0 == obj.outgoingPorts) {
      tmpString = tmpString + "Any";
      if(protocol == 1){
        tmpString += " ~4567";
      }
    } else if (1 == obj.outgoingPorts) {
      tmpString = tmpString + obj.outgoingPortStart;
    } else if (2 == obj.outgoingPorts) {
      tmpString = tmpString + obj.outgoingPortStart + " - " + obj.outgoingPortEnd;
      if(!obj.outgoingExclude){
        if(obj.outgoingPortStart <= 4567 && obj.outgoingPortEnd >= 4567){
          tmpString = tmpString;
          if(protocol == 1){
            tmpString += " ~4567";
          }
        }
      }
    } else if (3 == obj.outgoingPorts) {
      tmpString = tmpString + "Same as Initiating Ports";
    }
    break;
  }
  case 0://Other
    if(type == 1) {
      if(obj.protocolExclude)
        tmpString += "~";
      if (0 == obj.protocolNumber)
        tmpString += "Protocol Any";
      else
        tmpString += "Protocol " + obj.protocolNumber;
    }
    break;
  case 3://ICMP
    var tmpString = "";
    if(type == 1) {
      if(obj.protocolExclude)
        tmpString += "~";
      tmpString += "ICMP ";
    }
    switch(obj.icmpMessage) {
      case 0:
        tmpString += "Echo Reply";
        break;
      case 1:
        tmpString += "Network Unreachable";
        break;
      case 2:
        tmpString += "Host Unreachable";
        break;
      case 3:
        tmpString += "Protocol Unreachable";
        break;
      case 4:
        tmpString += "Port Unreachable";
        break;
      case 5:
        tmpString += "Destination Network Unknown";
        break;
      case 6:
        tmpString += "Destination Host Unknown";
        break;
      case 7:
        tmpString += "Redirect for Network";
        break;
      case 8:
        tmpString += "Redirect for Host";
        break;
      case 9:
        tmpString += "Echo Request";
        break;
      case 10:
        tmpString += "Type " + obj.icmpType + " Code " + obj.icmpCode;
        break;
    }
    break;
  case 4:
    if (1 == type) {
      if(obj.protocolExclude)
        tmpString += "~";
      tmpString += "GRE";
    }
    break;
  case 5:
    if (1 == type) {
      var tmpString = "";
      if(obj.protocolExclude)
        tmpString += "~";
      tmpString += "ESP";
    }
    break;
  case 6:
    if (1 == type) {
    if(obj.protocolExclude)
      tmpString += "~";
      tmpString += "AH";
    }
    break;
  }
  toPrint.push(tmpString);
}
function getPrintArrayForProtocols(protocolArr, toPrint, type) {
  for (var ind in protocolArr) {
    printProtocolObject(protocolArr[ind], toPrint, type);
  }
}
function printProtocolWithName(obj, printArr) {
  for (var i in obj) {
    if(!(i >= 0)){
      continue;
    }
    var toPrint = [];
    if (obj[i].services === undefined || obj[i].services === null || obj[i].services.length == 0) {
      toPrint.push("Any");
      printArr.push(toPrint);
      continue;
    }
    var index = 0;
    for (var j in obj[i].services) {
      getPrintArrayForProtocols(obj[i].services[j].protocols, toPrint, 1);
      toPrint[index] = obj[i].services[j].name + '-' + toPrint[index];
      index = toPrint.length;
    }
    printArr.push(toPrint);
  }
}
function printProtocol(type, obj, printArr, printArrTwo) {
  if (0 == type) { // obj = an array of services arrays
    for (var i in obj) {
      if(!(i >= 0)){
        continue;
      }
      var toPrint = [];
      if (obj[i].services === undefined || obj[i].services === null || obj[i].services.length == 0) {
        toPrint.push("Any");
        printArr.push(toPrint);
        continue;
      }
      for (var j in obj[i].services) {
        getPrintArrayForProtocols(obj[i].services[j].protocols, toPrint, 1);
      }
      printArr.push(toPrint);
    }
  } else if (1 == type) { // obj = a services array
    for (var i in obj) {
      if(i >= 0){
        var toPrint = [];
        getPrintArrayForProtocols(obj[i].protocols, toPrint, 1);
        printArr.push(toPrint);
      }
    }
  } else if (2 == type) { // obj = an array of protocols
    getPrintArrayForProtocols(obj, printArr, 0);
  } else if (6 == type) { // obj = an array of protocols
    getPrintArrayForProtocols(obj, printArr, 1);
  } else if (3 == type) { // obj = an array which contains two arrays or protocols within it (outgoing/incoming)
    for (var i in obj) {
      if (obj[i].id === undefined || obj[i].id === null){
        continue;
      }
      var toPrint = [];
      getPrintArrayForProtocols(obj[i].outgoing, toPrint, 1);
      printArr.push(toPrint);
      toPrint = [];
      getPrintArrayForProtocols(obj[i].incoming, toPrint, 1);
      printArrTwo.push(toPrint);
    }
  } else if (4 == type) { // obj = filtering array
    for (var i = 0; i < 8; i++) {
      for (var ind in obj[i].filters) {
        printProtocol(1, obj[i].filters[ind].services, printArr[i].protArr);
      }
    }
  } else if (5 == type) { // obj = filtering array
    for (var i = 0; i < 8; i++) {
      for (var ind in obj[i].priorities) {
        printProtocol(1, obj[i].priorities[ind].services, printArr[i].protArr);
      }
    }
  }
}
/* END: Service Functions */

/*|--------------------------------------------------|*
  | START: Schedule Functions                        |
  | init -- apply -- cancel -- edit -- copy -- print |
 *|--------------------------------------------------|*/
function init_schedules($scope) {
  init_schedule($scope);
  init_timeSegment($scope);
  init_hourRange($scope);
  $scope.printTimeSegArr = [];
}
function init_schedule($scope) {
  $scope.schedule = {
    name: "Scheduler Rule",
    activeDuring: true,
    timeSegments: []
  };
  $scope.editingRuleSchedule = -1;
}
function init_timeSegment($scope) {
  $scope.hourRanges = [];
  $scope.daysOfTheWeek = [false, false, false, false, false, false, false];
  $scope.editingTimeSegment = -1;
}
function init_hourRange($scope) {
  $scope.hourRange = {
    startTimeHour: '00',
    startTimeMinute: '00',
    endTimeHour: '00',
    endTimeMinute: '00'
  };
  $scope.editingHourRange = -1;
}
function applyRuleScheduler($scope, objArr) {
  if (-1 == $scope.editingRuleSchedule) {

    var tempSchedule = {};
    copySchedule(tempSchedule, $scope.schedule);
    objArr.push(tempSchedule);

  } else { // Editing
    copySchedule(objArr[$scope.editingRuleSchedule], $scope.schedule);
  }
  init_schedule($scope);
  $scope.togglePage(0);
}
function applyTimeSegment($scope) {
  if (-1 == $scope.editingTimeSegment) {
    var tempSegment = {
      daysOfTheWeek: [],
      hourRanges: []
    };

    for (var i = 0; i < 7; i++)
      if ($scope.daysOfTheWeek[i]) tempSegment.daysOfTheWeek.push(i);

    for (var i = 0; i < $scope.hourRanges.length; i++) {
      var tempRange = {
        startTimeMinute: $scope.hourRanges[i].startTimeMinute,
        startTimeHour: $scope.hourRanges[i].startTimeHour,
        endTimeHour: $scope.hourRanges[i].endTimeHour,
        endTimeMinute: $scope.hourRanges[i].endTimeMinute
      };
      tempSegment.hourRanges.push(tempRange);
    }
    $scope.schedule.timeSegments.push(tempSegment);

  } else { // Editing
    
    $scope.schedule.timeSegments[$scope.editingTimeSegment].daysOfTheWeek = [];
    $scope.schedule.timeSegments[$scope.editingTimeSegment].hourRanges = [];
    for (var i = 0; i < 7; i++) {
      if($scope.daysOfTheWeek[i]) $scope.schedule.timeSegments[$scope.editingTimeSegment].daysOfTheWeek.push(i);
    }

    for (var i = 0; i < $scope.hourRanges.length; i++) {
      var tempRange = {
        startTimeHour: $scope.hourRanges[i].startTimeHour,
        startTimeMinute: $scope.hourRanges[i].startTimeMinute,
        endTimeHour: $scope.hourRanges[i].endTimeHour,
        endTimeMinute: $scope.hourRanges[i].endTimeMinute
      };
      $scope.schedule.timeSegments[$scope.editingTimeSegment].hourRanges.push(tempRange);
    }
  }

  // Set the array for printing
  $scope.printTimeSegArr = [];
  printSchedule(2, $scope.schedule.timeSegments, $scope.printTimeSegArr);

  init_timeSegment($scope);
  $scope.togglePage(5);
}
function applyHourRange($scope) {
  if (-1 == $scope.editingHourRange) {
    var tmpRange = {
      startTimeHour: $scope.hourRange.startTimeHour,
      startTimeMinute: $scope.hourRange.startTimeMinute,
      endTimeHour: $scope.hourRange.endTimeHour,
      endTimeMinute: $scope.hourRange.endTimeMinute
    };
    $scope.hourRanges.push(tmpRange);

  } else { // Editing
    $scope.hourRanges[$scope.editingHourRange].startTimeHour = $scope.hourRange.startTimeHour;
    $scope.hourRanges[$scope.editingHourRange].startTimeMinute = $scope.hourRange.startTimeMinute;
    $scope.hourRanges[$scope.editingHourRange].endTimeHour = $scope.hourRange.endTimeHour;
    $scope.hourRanges[$scope.editingHourRange].endTimeMinute = $scope.hourRange.endTimeMinute;
  }

  init_hourRange($scope);
  $scope.togglePage(6);
}
function cancelRuleScheduler($scope) {
  init_schedule($scope);
  $scope.togglePage(0);
}
function cancelTimeSegment($scope) {
  init_timeSegment($scope);
  $scope.togglePage(5);
}
function cancelHourRange($scope) {
  init_hourRange($scope);
  $scope.togglePage(6);
}
function editRuleScheduler($scope, objArr, index) {
  copySchedule($scope.schedule, objArr[index]);
  // Set the array for printing
  $scope.printTimeSegArr = [];
  printSchedule(2, $scope.schedule.timeSegments, $scope.printTimeSegArr);
  $scope.editingRuleSchedule = index;
  $scope.togglePage(5);
}
function editTimeSegment($scope, index) {

  for (var i = 0; i < $scope.schedule.timeSegments[index].daysOfTheWeek.length; i++)
    $scope.daysOfTheWeek[$scope.schedule.timeSegments[index].daysOfTheWeek[i]] = true;

  for (var i = 0; i < $scope.schedule.timeSegments[index].hourRanges.length; i++) {
    
    var tempRange = {
      startTimeHour: $scope.schedule.timeSegments[index].hourRanges[i].startTimeHour,
      startTimeMinute: $scope.schedule.timeSegments[index].hourRanges[i].startTimeMinute,
      endTimeHour: $scope.schedule.timeSegments[index].hourRanges[i].endTimeHour,
      endTimeMinute: $scope.schedule.timeSegments[index].hourRanges[i].endTimeMinute
    };
    $scope.hourRanges.push(tempRange);
  };

  $scope.editingTimeSegment = index;
  $scope.togglePage(6);
}

function formatTimeValue(value) {
  return (value<10?'0' + value:value);
}

function editHourRange($scope, index) {
  $scope.hourRange.startTimeHour = formatTimeValue($scope.hourRanges[index].startTimeHour);
  $scope.hourRange.startTimeMinute = formatTimeValue($scope.hourRanges[index].startTimeMinute);
  $scope.hourRange.endTimeHour = formatTimeValue($scope.hourRanges[index].endTimeHour);
  $scope.hourRange.endTimeMinute = formatTimeValue($scope.hourRanges[index].endTimeMinute);
  $scope.editingHourRange = index;
  $scope.togglePage(7);
}
function copySchedules(newRules, oldRules) {
  for (var i = 0; i < oldRules.length; i++) {
    var tempRule = {};
    copySchedule(tempRule, oldRules[i]);
    newRules.push(tempRule);
  }
}
function copySchedule(newRule, oldRule) {
  newRule.name = oldRule.name;
  newRule.activeDuring = oldRule.activeDuring;
  newRule.timeSegments = [];
  copyTimeSegments(newRule.timeSegments, oldRule.timeSegments);
}
function copyTimeSegments(newSegs, oldSegs) {
  for (var i = 0; i < oldSegs.length; i++) {
    var tempSegment = {
      daysOfTheWeek: [],
      hourRanges: []
    };

    for (var j = 0; j < oldSegs[i].daysOfTheWeek.length; j++)
      tempSegment.daysOfTheWeek.push(oldSegs[i].daysOfTheWeek[j]);

    for (var j = 0; j < oldSegs[i].hourRanges.length; j++) {
      var tempRange = {
        startTimeHour: oldSegs[i].hourRanges[j].startTimeHour,
        startTimeMinute: oldSegs[i].hourRanges[j].startTimeMinute,
        endTimeHour: oldSegs[i].hourRanges[j].endTimeHour,
        endTimeMinute: oldSegs[i].hourRanges[j].endTimeMinute
      };
      tempSegment.hourRanges.push(tempRange);
    }
    newSegs.push(tempSegment);
  }
}

function printTimeSegObject(timeSeg, toPrint) {
  var days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
  var tmpString = "";
  for (var ind = 0; ind < timeSeg.daysOfTheWeek.length - 1; ind ++)
    tmpString += days[timeSeg.daysOfTheWeek[ind]] + ", ";

  if (timeSeg.daysOfTheWeek.length != 0) {
    if(timeSeg.daysOfTheWeek.length > 1)
      tmpString +=  "and ";
    tmpString += days[timeSeg.daysOfTheWeek[timeSeg.daysOfTheWeek.length-1]];
    tmpString += " between ";
    if(timeSeg.daysOfTheWeek.length === 7){
      tmpString = " ";
      tmpString +=  "All week between ";
    }
  }

  for (var ind = 0; ind < timeSeg.hourRanges.length - 1; ind ++) {
	if(timeSeg.hourRanges[ind].startTimeHour<10)
	  tmpString += "0";	  
    tmpString += timeSeg.hourRanges[ind].startTimeHour + ":";
    if(timeSeg.hourRanges[ind].startTimeMinute<10)
      tmpString += "0";
    tmpString += timeSeg.hourRanges[ind].startTimeMinute + "-";
    if(timeSeg.hourRanges[ind].endTimeHour<10)
	  tmpString += "0";    
    tmpString += timeSeg.hourRanges[ind].endTimeHour + ":";
    if(timeSeg.hourRanges[ind].endTimeMinute<10)
      tmpString += "0";
    tmpString += timeSeg.hourRanges[ind].endTimeMinute;
    if((timeSeg.hourRanges[ind].startTimeHour > timeSeg.hourRanges[ind].endTimeHour)
      || (timeSeg.hourRanges[ind].startTimeHour == timeSeg.hourRanges[ind].endTimeHour &&
        timeSeg.hourRanges[ind].startTimeMinute >= timeSeg.hourRanges[ind].endTimeMinute))
      tmpString += " on the next day";
    tmpString += ", ";
  }
  if (timeSeg.hourRanges.length != 0) {
    if(timeSeg.hourRanges.length > 1)
      tmpString += "and ";
    if(timeSeg.hourRanges[timeSeg.hourRanges.length-1].startTimeHour<10)
	  tmpString += "0";    
    tmpString += timeSeg.hourRanges[timeSeg.hourRanges.length-1].startTimeHour + ":";
    if(timeSeg.hourRanges[timeSeg.hourRanges.length-1].startTimeMinute<10)
      tmpString += "0";
    tmpString += timeSeg.hourRanges[timeSeg.hourRanges.length-1].startTimeMinute + "-";
    if(timeSeg.hourRanges[timeSeg.hourRanges.length-1].endTimeHour<10)
  	  tmpString += "0";
    tmpString += timeSeg.hourRanges[timeSeg.hourRanges.length-1].endTimeHour + ":";
    if(timeSeg.hourRanges[timeSeg.hourRanges.length-1].endTimeMinute<10)
      tmpString += "0";
    tmpString += timeSeg.hourRanges[timeSeg.hourRanges.length-1].endTimeMinute;
    if((timeSeg.hourRanges[timeSeg.hourRanges.length-1].startTimeHour > timeSeg.hourRanges[timeSeg.hourRanges.length-1].endTimeHour)
      || (timeSeg.hourRanges[timeSeg.hourRanges.length-1].startTimeHour == timeSeg.hourRanges[timeSeg.hourRanges.length-1].endTimeHour &&
        timeSeg.hourRanges[timeSeg.hourRanges.length-1].startTimeMinute >= timeSeg.hourRanges[timeSeg.hourRanges.length-1].endTimeMinute))
      tmpString += " on the next day";
  }
  tmpString = tmpString.replace(', and' ,' and')
  toPrint.push(tmpString);
}
function getPrintArrForTimeSegs(timeSegArr, toPrint) {
  for (var i = 0; i < timeSegArr.length; i++)
    printTimeSegObject(timeSegArr[i], toPrint);
}
function printSchedule(type, obj, printArr) {
  var days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
  if (0 == type) {
    // obj = an array of schedules

    for (var i in obj) {
      if(!(i >= 0)){
        continue;
      }
      if(obj[i].timeSegments === undefined)
        continue;
      var toPrint = [];
      for (var j = 0; j < obj[i].timeSegments.length; j++) {

        var tmpString = "";
        for (var ind = 0; ind < obj[i].timeSegments[j].daysOfTheWeek.length - 1; ind ++)
          tmpString += days[obj[i].timeSegments[j].daysOfTheWeek[ind]] + ", ";

        if (0 != obj[i].timeSegments[j].daysOfTheWeek.length) {
          if(obj[i].timeSegments[j].daysOfTheWeek.length > 1)
            tmpString +=  "and ";
          tmpString += days[obj[i].timeSegments[j].daysOfTheWeek[obj[i].timeSegments[j].daysOfTheWeek.length-1]];
          tmpString += " between ";
        }
  
        for (var ind = 0; ind < obj[i].timeSegments[j].hourRanges.length - 1; ind ++) {
          if(obj[i].timeSegments[j].hourRanges[ind].startTimeHour<10)
            tmpString += "0";
          tmpString += obj[i].timeSegments[j].hourRanges[ind].startTimeHour + ":";
          if(obj[i].timeSegments[j].hourRanges[ind].startTimeMinute<10)
            tmpString += "0";
          tmpString += obj[i].timeSegments[j].hourRanges[ind].startTimeMinute + "-";
          if(obj[i].timeSegments[j].hourRanges[ind].endTimeHour<10)
            tmpString += "0";
          tmpString += obj[i].timeSegments[j].hourRanges[ind].endTimeHour + ":";
          if(obj[i].timeSegments[j].hourRanges[ind].endTimeMinute<10)
            tmpString += "0";
          tmpString += obj[i].timeSegments[j].hourRanges[ind].endTimeMinute;
          if((obj[i].timeSegments[j].hourRanges[ind].startTimeHour > obj[i].timeSegments[j].hourRanges[ind].endTimeHour)
            || (obj[i].timeSegments[j].hourRanges[ind].startTimeHour == obj[i].timeSegments[j].hourRanges[ind].endTimeHour &&
              obj[i].timeSegments[j].hourRanges[ind].startTimeMinute >= obj[i].timeSegments[j].hourRanges[ind].endTimeMinute))
            tmpString += " on the next day";
          tmpString += ", ";
        }

        if(0 != obj[i].timeSegments[j].hourRanges.length) {
          if(obj[i].timeSegments[j].hourRanges.length>1)
            tmpString += "and ";
          if(obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].startTimeHour<10)
            tmpString += "0";
          tmpString += obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].startTimeHour + ":";
          if(obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].startTimeMinute<10)
            tmpString += "0";
          tmpString += obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].startTimeMinute + "-";
          if(obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].endTimeHour<10)
            tmpString += "0";          
          tmpString += obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].endTimeHour + ":";
          if(obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].endTimeMinute<10)
            tmpString += "0";
          tmpString += obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].endTimeMinute;
          if((obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].startTimeHour > obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].endTimeHour)
            || (obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].startTimeHour == obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].endTimeHour &&
              obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].startTimeMinute >= obj[i].timeSegments[j].hourRanges[obj[i].timeSegments[j].hourRanges.length-1].endTimeMinute))
            tmpString += " on the next day";
        }

        toPrint.push(tmpString);
      }

      printArr.push(toPrint);
    }

  }  else if (1 == type) {
    for (var j = 0; j < obj[0].timeSegments.length; j++) {
      var tmpString = "";
      for (var ind = 0; ind < obj[0].timeSegments[j].daysOfTheWeek.length - 1; ind ++)
        tmpString += days[obj[0].timeSegments[j].daysOfTheWeek[ind]] + ", ";

      if (0 != obj[0].timeSegments[j].daysOfTheWeek.length) {
        if(obj[0].timeSegments[j].daysOfTheWeek.length > 1)
          tmpString +=  "and ";
        tmpString += days[obj[0].timeSegments[j].daysOfTheWeek[obj[0].timeSegments[j].daysOfTheWeek.length-1]];
        tmpString += " between ";

        if(obj[0].timeSegments[j].daysOfTheWeek.length === 7){
             tmpString = " ";
             tmpString +=  "All week between ";
        }
      }

      for (var ind = 0; ind < obj[0].timeSegments[j].hourRanges.length - 1; ind ++) {
          if(obj[0].timeSegments[j].hourRanges[ind].startTimeHour<10)
            tmpString += "0";
          tmpString += obj[0].timeSegments[j].hourRanges[ind].startTimeHour + ":";
          if(obj[0].timeSegments[j].hourRanges[ind].startTimeMinute<10)
            tmpString += "0";
          tmpString += obj[0].timeSegments[j].hourRanges[ind].startTimeMinute + "-";
          if(obj[0].timeSegments[j].hourRanges[ind].endTimeHour<10)
            tmpString += "0";
          tmpString += obj[0].timeSegments[j].hourRanges[ind].endTimeHour + ":";
          if(obj[0].timeSegments[j].hourRanges[ind].endTimeMinute<10)
            tmpString += "0";
          tmpString += obj[0].timeSegments[j].hourRanges[ind].endTimeMinute + ", ";
      }

      if(0 != obj[0].timeSegments[j].hourRanges.length) {
        if(obj[0].timeSegments[j].hourRanges.length>1)
          tmpString += "and ";
        if(obj[0].timeSegments[j].hourRanges[obj[0].timeSegments[j].hourRanges.length-1].startTimeHour<10)
          tmpString += "0";
        tmpString += obj[0].timeSegments[j].hourRanges[obj[0].timeSegments[j].hourRanges.length-1].startTimeHour + ":";
        if(obj[0].timeSegments[j].hourRanges[obj[0].timeSegments[j].hourRanges.length-1].startTimeMinute<10)
          tmpString += "0";
        tmpString += obj[0].timeSegments[j].hourRanges[obj[0].timeSegments[j].hourRanges.length-1].startTimeMinute + "-";
        if(obj[0].timeSegments[j].hourRanges[obj[0].timeSegments[j].hourRanges.length-1].endTimeHour<10)
          tmpString += "0";        
        tmpString += obj[0].timeSegments[j].hourRanges[obj[0].timeSegments[j].hourRanges.length-1].endTimeHour + ":";
        if(obj[0].timeSegments[j].hourRanges[obj[0].timeSegments[j].hourRanges.length-1].endTimeMinute<10)
          tmpString += "0";
        tmpString += obj[0].timeSegments[j].hourRanges[obj[0].timeSegments[j].hourRanges.length-1].endTimeMinute;
      }

      tmpString = tmpString.replace(', and' ,' and')
      printArr.push(tmpString);
    }
  } else if (2 == type) {
    // obj = an array of time segments
    getPrintArrForTimeSegs(obj, printArr);
  }
}
/* END: Schedule Functions */


/* START: Common Functions */
function removeObject(objArr, index, extra, $scope) {
  objArr.splice(index, 1);

  /* Set the array to be printed out to the screen */
  if (2 == extra) { // removing protocol
    $scope.printPortsArr = [];
    printProtocol(2, $scope.service.protocols, $scope.printPortsArr);
  }
}

function copyArrayFromSource(inputArray) {
   var tempArray = [];
   for(var j = 0; j < inputArray.length; j++) {
       tempArray.push(inputArray[j]);
   }
   return tempArray;
}
/* END: Common Functions */


/* START: Misc Functions */
function copyTrigger(newTrigger, oldTrigger) {
  newTrigger.name = oldTrigger.name;
  newTrigger.enabled = oldTrigger.enabled;

  for (var i = 0; i < oldTrigger.outgoing.length; i++) {
    var tempProtocol = {};
    copyProtocol(tempProtocol, oldTrigger.outgoing[i])
    newTrigger.outgoing.push(tempProtocol);
  }
  for (var i = 0; i < oldTrigger.incoming.length; i++) {
    var tempProtocol = {};
    copyProtocol(tempProtocol, oldTrigger.incoming[i])
    newTrigger.incoming.push(tempProtocol);
  }
}

function applyAddressCheck($scope){
  $scope.rule.networkObjType = parseInt($scope.rule.networkObjType);
  $scope.rule.dhcpType = parseInt($scope.rule.dhcpType);

  $scope.errorMessages = [];
  switch($scope.rule.networkObjType) {
    case 0:
      if(!validateIp($scope.rule.ip))
        $scope.errorMessages.push("IP Address: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
      break;
    case 1:
     if(!validateIp($scope.rule.ip))
       $scope.errorMessages.push("IP Address and Subnet Mask combination: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
     else if (!validateIp($scope.rule.ipTwo))
       $scope.errorMessages.push("IP Address and Subnet Mask combination: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
     else if(getIpString($scope.rule.ipTwo) === '0.0.0.0')
       $scope.errorMessages.push("IP Address and Subnet Mask combination: Subnet mask may not be 0.0.0.0. Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
     else if(!validateSubnetMask($scope.rule.ipTwo))
       $scope.errorMessages.push("IP Address and Subnet Mask combination:  Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
     else if(!checkSubnetIp($scope.rule.ip, $scope.rule.ipTwo)){
       $scope.errorMessages.push("IP Address and Subnet Mask combination: The subnet definition is invalid.");
     }
     break;
    case 2:
      if(!validateIp($scope.rule.ip) || !validateIp($scope.rule.ipTwo))
        $scope.errorMessages.push("IP Range: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
      else {
        for(var i = 0; i < 4; i++) {
          if($scope.rule.ip[i] < $scope.rule.ipTwo[i])
          break;
          if($scope.rule.ip[i] == $scope.rule.ipTwo[i])
          continue;
          $scope.errorMessages.push("IP Range: Start IP address is greater than End IP address.");
          break;
        }
      }
      break;
    case 3:
      checkMacAddress($scope, $scope.rule.mac);
      if(getMacString($scope.rule.mac) == "00:00:00:00:00:00"){
        $scope.errorMessages.push("MAC Address: MAC address must consist of 6 fields. Each field's value must be between 00 and FF (in hexadecimal representation), without any spaces. The LSB of the first byte must be zero.");
      }
      if(!getMacString($scope.rule.macMask) || /^[0\:]{17}$/.test(getMacString($scope.rule.macMask)) || !validateMac(getMacString($scope.rule.macMask)))
        $scope.errorMessages.push("MAC Mask: MAC address mask must consist of 6 fields. Each field's value must be between 00 and FF (in hexadecimal representation).");
      break;
    case 4:
      if(!validateLocalDomains($scope.rule.hostname))
        $scope.errorMessages.push("Host Name: Name may not contain spaces. Only letters, digits and the special characters dash (-), underscore (_) and dot (.) may be used. These special characters may not appear at the beginning or at the end of a name. The maximum length of a label (text between two dots) is 63.");
      break;
    case 5:
      if($scope.rule.hostname === '')
        $scope.errorMessages.push("DHCP Option: A string must be specified.");
    default:
      break;
    }
  if($scope.errorMessages.length > 0) {
    $scope.showErrorPage = true;
    window.scrollTo(0,0);
    return;
  }
}

function checkMacAddress($scope, value){
  if(!validateMac(getMacString(value)))
    $scope.errorMessages = ["MAC Address: MAC address must consist of 6 fields. Each field's value must be between 00 and FF (in hexadecimal representation), without any spaces. The LSB of the first byte must be zero."];
  else if(/[f\:]{17}$/i.test(getMacString(value)))
    $scope.errorMessages.push("MAC Address: MAC FF:FF:FF:FF:FF:FF is reserved for broadcast.");
  else if(!validateMac(getMacString(value)) || /[0\:]{17}$/i.test(value) || (parseInt(value[0], 16) & 1) == 1)
    $scope.errorMessages = ["MAC Address: MAC address must consist of 6 fields. Each field's value must be between 00 and FF (in hexadecimal representation), without any spaces. The LSB of the first byte must be zero."];
}

function checkAndFindNetworkObject(netObj, tempName, ipAddr){
  var insert = true;
  if(netObj.length > 0){
    for(var i = 0; i < netObj.length; i ++){
      if(netObj[i].name == "DHCP" && netObj[i].type == 4 && netObj[i].rules[0].name == tempName && netObj[i].rules[0].networkObjType == 7){
        insert = false;
      }
    }
  }
  if(insert){
    netObj.push({
      name: "DHCP",
      type: 4,
      rules: [{name: tempName, networkObjType: 7, ipAddress: ipAddr}]
    });
  }
}

function compareHosts(obj1, obj2){
  var result = true;
  var sameCheck = false;
  if(obj1.length == obj2.length && obj1.length == 0){
    result = true;
  }else if(obj1.length > 0 && obj2.length > 0){
    for(var j = 0; j < obj1.length; j ++){
      sameCheck = false;
      for(var k = 0; k < obj2.length; k ++){
        if(obj1[j] == obj2[j]){
          sameCheck = true;
          break;
        }
      }
      if(sameCheck == false){
        result = false;
        break;
      }
    }
  }else if(obj1.length == 0){
	result = true;
  }else{
	result = false;
  }
  return result;
}

function compareNetworkObjects(obj1, obj2){
  var result = true;
  var sameCheck = false;
  if(obj1.length == obj2.length && obj1.length == 0){
	result = true;
  }else if(obj1.length > 0 && obj2.length > 0){
    for(var j = 0; j < obj1.length; j ++){
      sameCheck = false;
      for(var k = 0; k < obj2.length; k ++){
        if(compareNetObjects(obj1[j], obj2[k])){
          sameCheck = true;
          break;
        }
      }
      if(sameCheck == false){
        result = false;
        break;
      }
    }
  }else{
	result = false;
  }
  return result;
}

function compareNetObjects(obj1, obj2){
  var result = true;
  if(obj1.name != obj2.name){
	result = false;
  }
  if(obj1.rules.length == obj2.rules.length){
	if(obj1.rules[0].ipAddress != obj2.rules[0].ipAddress){
	  result = false;
	}
  }else{
	result = false;
  }
  return result;
}

function compareServices(obj1, obj2){
  var result = true;
  var sameCheck = false;
  if(obj1.length == obj2.length && obj1.length == 0){
	result = true;
  }else if(obj1.length > 0 && obj2.length > 0){
	for(var j = 0; j < obj1.length; j ++){
	  sameCheck = false;
	  for(var k = 0; k < obj2.length; k ++){
	    if(compareService(obj1[j], obj2[k])){
	      sameCheck = true;
	      break;
	    }
	  }
	  if(sameCheck == false){
        result = false;
	    break;
	  }
    }
  }else{
	result = false;
  }
  return result;
}

function compareService(obj1, obj2){
  var result = true;
  if(obj1.name != obj2.name){
	result = false;
  }
  if(obj1.description != obj2.description){
	result = false;
  }
  if(result == true){
	result = compareProtocols(obj1.protocols, obj2.protocols);
  }
  return result;
}

function compareProtocols(obj1, obj2){
  var result = true;
  var sameObj = false;
  if(obj1.length == 0 && obj2.length == 0){
	result = true;
  }else if(obj1.length > 0 && obj2.length > 0){
	for(var i = 0; i < obj1.length; i ++){
	  sameObj = false;
	  for(var j = 0; j < obj2.length; j ++){
		if(compareProtocol(obj1[i], obj2[j])){
		  sameObj = true;
		}
	  }
	  if(sameObj == false){
		result = false;
	    break;
	  }
    }
  }else{
	result = false;
  }
  return result;
}

function compareProtocol(obj1, obj2){
  var result = true;
  if(obj1.incomingExclude != obj2.incomingExclude){
	result = false;
  }
  if(obj1.incomingPorts != obj2.incomingPorts){
	result = false;
  }
  if(obj1.outgoingExclude != obj2.outgoingExclude){
	result = false;
  }
  if(obj1.outgoingPortStart != obj2.outgoingPortStart){
	result = false;
  }
  if(obj1.outgoingPorts != obj2.outgoingPorts){
	result = false;
  }
  if(obj1.protocol != obj2.protocol){
	result = false;
  }
  if(obj1.protocolExclude != obj2.protocolExclude){
	result = false;
  }
  return result;
}

function compareAllSchedules(obj1, obj2, sched){
  var result = true;
  if((obj1 == undefined || (obj1 != undefined && !obj1.hasOwnProperty("name"))) &&
	(obj2 == undefined || (obj2 != undefined && !obj2.hasOwnProperty("name")))){
	result = true;
  }else if(!(obj1 == undefined || (obj1 != undefined && !obj1.hasOwnProperty("name"))) &&
		!(obj2 == undefined || (obj2 != undefined && !obj2.hasOwnProperty("name")))){
	result = compareSchedules(obj1, obj2, sched);
  }else{
    result = false;
  }
  return result;
}

function compareSchedules(obj1, obj2, sched){
  var result = true;
  if(sched == -2){
	if(obj1.name != obj2.name){
	  result = false;
	}
  }else if(sched != -1){
	if(escape(obj1.name) != obj2.name){
	  result = false;
	}
  }else if(sched == -1){
	if(escape(obj1.name).replace(/\+/g,'%2B') != obj2.name){
	  result = false;
	}
  }
  if(obj1.activeDuring != obj2.activeDuring){
	result = false;
  }
  if(result == true){
	result = compareSchedule(obj1.timeSegments, obj2.timeSegments);
  }
  return result;
}

function compareSchedule(obj1, obj2){
  var result = true;
  var sameObj = false;
  if(obj1.length == 0 && obj2.length == 0){
	result = true;
  }else if(obj1.length > 0 && obj2.length > 0){
	for(var i = 0; i < obj1.length; i ++){
	  sameObj = false;
	  for(var j = 0; j < obj2.length; j ++){
		if(compareTimeSegments(obj1[i], obj2[j])){
		  sameObj = true;
		}
	  }
	  if(sameObj == false){
		result = false;
	    break;
	  }
    }
  }else{
	result = false;
  }
  return result;
}

function compareTimeSegments(obj1, obj2){
  var result = true;
  result = compareDates(obj1.daysOfTheWeek, obj2.daysOfTheWeek);
  if(result == true){
	result = compareHourRanges(obj1.hourRanges, obj2.hourRanges);
  }
  return result;
}

function compareHourRanges(obj1, obj2){
  var result = true;
  var sameObj = false;
  if(obj1.length == 0 && obj2.length == 0){
  }else if(obj1.length > 0 && obj2.length > 0){
	for(var i = 0; i < obj1.length; i ++){
	  sameObj = false;
	  for(var j = 0; j < obj2.length; j ++){
		if(compareHourRange(obj1[i], obj2[j])){
		  sameObj = true;
		}
	  }
	  if(sameObj == false){
		result = false;
	    break;
	  }
	}
  }else{
	result = false;
  }
  return result;
}

function compareHourRange(obj1, obj2){
  var result = true;
  if(obj1.endTimeHour != obj2.endTimeHour){
	result = false;
  }
  if(obj1.endTimeMinute != obj2.endTimeMinute){
	result = false;
  }
  if(obj1.startTimeHour != obj2.startTimeHour){
	result = false;
  }
  if(obj1.startTimeMinute != obj2.startTimeMinute){
	result = false;
  }
  return result;
}

function compareDates(obj1, obj2){
  var result = true;
  var sameObj = false;
  for(var i = 0; i < obj1.length; i ++){
	sameObj = false;
	for(var j = 0; j < obj2.length; j ++){
	  if(compareDate(obj1[i], obj2[j])){
		sameObj = true;
	  }
	}
	if(sameObj == false){
	  result = false;
	  break;
	}
  }
  return result;
}

function compareDate(obj1, obj2){
  var result = true;
  if(obj1 != obj2){
	result = false;
  }
  return result;
}

function getTempObjectContent(obj){
  var result = {
    protocol: 0,
    protocolExclude: false,
    incomingPorts: 0,
    incomingPortStart: 1,
    incomingPortEnd: 65535,
    incomingExclude: false,
    outgoingPorts: 0,
    outgoingPortStart: 1,
    outgoingPortEnd: 65535,
    outgoingExclude: false,
    icmpMessage: 0,
    icmpType: 0,
    icmpCode: 0,
    protocolNumber: 0
  };
  if(obj.protocol == 0){
    switch(obj.protocolNumber) {
      case 1:
        result.protocol = 3;
        result.icmpMessage = 0;
        break;
      case 6:
        result.protocol = 1;
        result.incomingPorts=0;
        result.incomingPortStart=0;
        result.incomingPortEnd=65535;
        result.incomingExclude=false;
        result.outgoingPorts=0;
        result.outgoingPortStart=0;
        result.outgoingPortEnd=65535;
        result.outgoingExclude=false;
        break;
      case 17:
        result.protocol = 2;
        result.incomingPorts=0;
        result.incomingPortStart=0;
        result.incomingPortEnd=65535;
        result.incomingExclude=false;
        result.outgoingPorts=0;
        result.outgoingPortStart=0;
        result.outgoingPortEnd=65535;
        result.outgoingExclude=false;
        break;
      case 47:
        result.protocol = 4;
        break;
      case 50:
        result.protocol = 5;
        break;
      case 51:
        result.protocol = 6;
        break;
      default:
        result.protocolNumber = obj.protocolNumber;
        break;
    }
  }else if(obj.protocol == 4 || obj.protocol == 5 || obj.protocol == 6){
    result.protocol = obj.protocol;
    result.protocolExclude = obj.protocolExclude;
  }else if(obj.protocol == 3){
    result.protocol = obj.protocol;
    result.icmpMessage = obj.icmpMessage;
    if(obj.icmpMessage == 10){
      result.icmpType = obj.icmpType;
      result.icmpCode = obj.icmpCode;
    }
  }else{
    result.protocol = obj.protocol;
    result.incomingPorts = obj.incomingPorts;
    result.incomingPortStart = obj.incomingPortStart;
    result.incomingPortEnd = obj.incomingPortEnd;
    result.incomingExclude = obj.incomingExclude;
    result.outgoingPorts = obj.outgoingPorts;
    result.outgoingPortStart = obj.outgoingPortStart;
    result.outgoingPortEnd = obj.outgoingPortEnd;
    result.outgoingExclude = obj.outgoingExclude;
  }
  return result;
}

function compareNewCondAndCurrentList(list, obj, num){
  var msg = [];
  var tempStr = "";
  var hasError = false;
  if(list.length != 0){
    for(var i = 0; i < list.length; i ++){
      if(num != i){
        if(list[i].protocol == obj.protocol){
          if(obj.protocol == 4 || obj.protocol == 5 || obj.protocol == 6){
            if(obj.protocol == 4){
              tempStr = "GRE";
            }else if(obj.protocol == 5){
              tempStr = "ESP";
            }else if(obj.protocol == 6){
              tempStr = "AH";
            }
            msg.push('Existing Protocol: The '+tempStr+' protocol is already used by the user-defined service.');
          }else if(obj.protocol == 3){
            if(obj.icmpMessage == list[i].icmpMessage){
              if(obj.icmpMessage == 10){
                if(obj.icmpType == list[i].icmpType && obj.icmpCode == list[i].icmpCode){
                  hasError = true;
                  tempStr = "Type " + obj.icmpType + " Code " + obj.icmpCode;
                }
              }else{
                hasError = true;
                if(obj.icmpMessage == 0){
                  tempStr = "Echo Reply";
                }else if(obj.icmpMessage == 1){
                  tempStr = "Network Unreachable";
                }else if(obj.icmpMessage == 2){
                  tempStr = "Host Unreachable";
                }else if(obj.icmpMessage == 3){
                  tempStr = "Protocol Unreachable";
                }else if(obj.icmpMessage == 4){
                  tempStr = "Port Unreachable";
                }else if(obj.icmpMessage == 5){
                  tempStr = "Destination Network Unknown";
                }else if(obj.icmpMessage == 6){
                  tempStr = "Destination Host Unknown";
                }else if(obj.icmpMessage == 7){
                  tempStr = "Redirect for Network";
                }else if(obj.icmpMessage == 8){
                  tempStr = "Redirect for Host";
                }else if(obj.icmpMessage == 9){
                  tempStr = "Echo Request";
                }
              }
            }
            if(hasError){
              msg.push('Existing ICMP Message: The '+tempStr+' ICMP message is already used by the user defined service.');
            }
          }else if(obj.protocol == 0){
            if(obj.protocolNumber == list[i].protocolNumber){
              if(obj.protocolNumber == 0){
                tempStr = "Any";
              }else{
                tempStr = obj.protocolNumber;
              }
              msg.push('Existing Protocol: The Protocol ' +tempStr+ ' protocol is already used by the user-defined service.');
            }
          }else{
            tempStr = overlapsPort(obj.outgoingPorts, obj.outgoingPortStart, obj.outgoingPortEnd, list[i].outgoingPorts, list[i].outgoingPortStart, list[i].outgoingPortEnd, obj.protocol);
            if(tempStr != ""){
              msg.push(tempStr);
            }
          }
        }
      }
      if(msg != ""){
        break;
      }
    }
  }
  return msg;
}

function overlapsPort(outPort1, outPortStart1, outPortEnd1, outPort2, outPortStart2, outPortEnd2, protocol){
  var result = "";
  var tempStr = "";
  var tempStr1 = "";
  var tempStr2 = "";
  if(protocol == 1){
    if(outPort1 == 0){
      outPort1 = 1;
      outPortStart1 = 4567;
    }
    if(outPort2 == 0){
      outPort2 = 1;
      outPortStart2 = 4567;
    }
  }
  if(protocol == 1){
    tempStr = "TCP";
    result = overlapsSubPort(outPort1, outPortStart1, outPortEnd1, outPort2, outPortStart2, outPortEnd2, tempStr);
  }else{
    tempStr = "UDP";
    if(outPort1 == 0 || outPort2 == 0){
      if(outPort1 == 0){
        tempStr1 = "Any";
      }else if(outPort1 == 1){
        tempStr1 = outPortStart1;
      }else if(outPort1 == 2){
        tempStr1 = outPortStart1 + "-" + outPortEnd1;
      }
      if(outPort2 == 0){
        tempStr2 = "Any";
      }else if(outPort2 == 1){
        tempStr2 = outPortStart2;
      }else if(outPort2 == 2){
        tempStr2 = outPortStart2 + "-" + outPortEnd2;
      }
      result = "Overlapping Port Ranges: The UDP destination ports ("+tempStr1+") is overlapping with already defined UDP destination ports ("+tempStr2+").";
    }else{
      result = overlapsSubPort(outPort1, outPortStart1, outPortEnd1, outPort2, outPortStart2, outPortEnd2, tempStr);
    }
  }
  return result;
}

function overlapsSubPort(outPort1, outPortStart1, outPortEnd1, outPort2, outPortStart2, outPortEnd2, protocol){
  var result = "";
  var tempStr1 = "";
  var tempStr2 = "";
  var hasError = false;
  if(outPort1 == 1){
    if(outPort2 == 1){
      if(Number(outPortStart1) == Number(outPortStart2)){
        tempStr1 = outPortStart1;
        tempStr2 = outPortStart2;
        hasError = true;
      }
    }else{
      if(Number(outPortEnd2) >= Number(outPortStart1) && Number(outPortStart2) <= Number(outPortStart1)){
        tempStr1 = outPortStart1;
        tempStr2 = outPortStart2 + "-" + outPortEnd2;
        hasError = true;
      }
    }
  }else{
    if(outPort2 == 1){
      if(Number(outPortEnd1) >= Number(outPortStart2) && Number(outPortStart1) <= Number(outPortStart2)){
        tempStr1 = outPortStart1 + "-" + outPortEnd1;
        tempStr2 = outPortStart2;
        hasError = true;
      }
    }else{
      if(Number(outPortEnd1) >= Number(outPortStart2) && Number(outPortStart1) <= Number(outPortStart2)){
        tempStr1 = outPortStart1 + "-" + outPortEnd1;
        tempStr2 = outPortStart2 + "-" + outPortEnd2;
        hasError = true;
      }else if(Number(outPortEnd1) >= Number(outPortEnd2) && Number(outPortStart1) <= Number(outPortEnd2)){
        tempStr1 = outPortStart1 + "-" + outPortEnd1;
        tempStr2 = outPortStart2 + "-" + outPortEnd2;
        hasError = true;
      }else if(Number(outPortEnd2) >= Number(outPortEnd1) && Number(outPortStart2) <= Number(outPortEnd1)){
        tempStr1 = outPortStart1 + "-" + outPortEnd1;
        tempStr2 = outPortStart2 + "-" + outPortEnd2;
        hasError = true;
      }else if(Number(outPortEnd2) >= Number(outPortEnd1) && Number(outPortStart2) <= Number(outPortEnd1)){
        tempStr1 = outPortStart1 + "-" + outPortEnd1;
        tempStr2 = outPortStart2 + "-" + outPortEnd2;
        hasError = true;
      }
    }
  }
  if(hasError){
    result = "Overlapping Port Ranges: The "+protocol+" destination ports ("+tempStr1+") is overlapping with already defined "+protocol+" destination ports ("+tempStr2+").";;
  }
  return result;
}
/* END: Misc Functions */