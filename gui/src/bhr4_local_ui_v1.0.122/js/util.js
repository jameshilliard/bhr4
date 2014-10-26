
function getIpString(arr) {
  return arr[0] + '.' + arr[1] + '.'  + arr[2] + '.' + arr[3];
}

function getTimeString(arr) {
  return arr[0] + ':' + arr[1];
}

function getMacString(arr) {
  return arr[0] + ':' + arr[1] + ':' + arr[2] + ':' + arr[3] + ':' + arr[4] + ':' + arr[5];
}

function splitIpArr(arr) {
  var parts = arr.split('.');
  for(var i = 0; i < parts.length; i++)
    parts[i] = parseInt(parts[i], 10);
  return parts;
}

function splitDateArr(arr) {
  var parts = arr.split(':');
  return parts;
}

function splitMacArr(arr) {
  var parts = arr.split(':');
  return parts;
}

function validateIp(ip) {
  if(ip.length != 4)
    return false;
  for(var i = 0; i < ip.length; i++){
    if (String(ip[i]) == '')
      return false;
    if(ip[i] == null || isNaN(ip[i]) || isNotaInt(ip[i]) || ip[i] < 0 || ip[i] > 255)
      return false;
  }
  return true;
}

function isNotaInt(num){
    if(null != num && undefined != num){
      if(Number(num) === parseInt(Number(num)))
        return false;
      else
        return true;
    }else
      return true;
}

function validateMulticastAddr(ip) {
  if(!validateIp(ip))
    return false;
  return ip[0] >= 224 && ip[0] <= 239;
}
function validateSubnetMask(subnet) {
  if(!validateIp(subnet))
    return false;
  if(subnet[0] == 0)
    return false;
  var valid = true;
  var zeroFound = false;
  for(var i = 0; i < 4; i++) {
    for(var k = 7; k > -1; k--) {
      var one = ((subnet[i]>>k) & 1) == 1;
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
  return valid;
}


function validateMac(mac) {
  return /^[0-9A-F]{12}$/i.test(mac.replace(new RegExp(':', 'g'), ''));
}

function validateWepSettings(wep, activeSetting, wifiName, errors) {
  if(!activeSetting && wep.key === '')
    return;
  switch(wep.keyLength) {
    case 0:
      switch(wep.entryMethod) {
        case 0:
          if(wep.key.length == 10) {
            if(!(/[0-9A-F]{10}$/i.test(wep.key))) {
              errors.push(wifiName + ": Invalid WEP Key. Allowable values are 0-9 and a-f.");
            }
          } else {
            errors.push(wifiName + ": The WEP key must be a hexadecimal number of 10 digits.");
          }
          break;
        case 1:
          if(wep.key.length != 5)
            errors.push(wifiName + ": The WEP key must be a string of 5 characters.");
          else if(!(/[\x21-\x7E]{5}$/i.test(wep.key))){
            errors.push(wifiName + ": Invalid WEP Key. Only ASCII characters are allowed.");
          }
          break;
      }
      break;
    case 1:
      switch(wep.entryMethod) {
        case 0:
          if(wep.key.length == 26) {
            if(!(/[0-9A-F]{26}$/i.test(wep.key))) {
              errors.push(wifiName + ": Invalid WEP Key. Allowable values are 0-9 and a-f.");
            }
          } else {
            errors.push(wifiName + ": The WEP key must be a hexadecimal number of 26 digits.");
          }
          break;
        case 1:
          if(wep.key.length != 13)
            errors.push(wifiName + ": The WEP key must be a string of 13 characters.");
          else if(!(/[\x21-\x7E]{13}$/i.test(wep.key))){
            errors.push(wifiName + ": Invalid WEP Key. Only ASCII characters are allowed.");
          }
          break;
      }
      break;
  }
}

function validRange(val, min, max) {
  return !(isNaN(val) || val < min || val > max);
}

function validateTransmissionSettings(trans, wifiName, errors) {
  if(isNaN(trans.beaconInterval) || trans.beaconInterval == null || !checksForDecimalNumber(trans.beaconInterval))
    errors.push(wifiName + " Beacon Interval: Please enter a numeric value.");
  else if(trans.beaconInterval < 20 || trans.beaconInterval > 1000)
    errors.push(wifiName + " Beacon Interval:  Beacon interval out of range (from=20, to=1000)");

  if(isNaN(trans.dtimInterval) || trans.dtimInterval == null || !checksForDecimalNumber(trans.dtimInterval))
    errors.push(wifiName + " DTIM Interval: Please enter a numeric value.");
  else if(trans.dtimInterval < 1 || trans.dtimInterval > 255)
    errors.push(wifiName + " DTIM Interval:  DTIM interval out of range (from=1, to=255)");

  if(isNaN(trans.fragmentationThreshold) || trans.fragmentationThreshold == null || !checksForDecimalNumber(trans.fragmentationThreshold))
    errors.push(wifiName + " Fragmentation Threshold: Please enter a numeric value.");
  else if(trans.fragmentationThreshold < 256 || trans.fragmentationThreshold > 2346)
    errors.push(wifiName + " Fragmentation Threshold:  Fragmentation threshold out of range (from=256, to=2346)");

  if(trans.rtsThreshold == null || trans.rtsThreshold === '' || isNaN(trans.rtsThreshold) || !checksForDecimalNumber(trans.rtsThreshold))
	errors.push(wifiName + " RTS Threshold: Please enter a numeric value.");
  else if(trans.rtsThreshold < 0 || trans.rtsThreshold > 2347)
    errors.push(wifiName + " RTS Threshold:  RTS Threshold out of range (from=0, to=2347)");

  if(isNaN(trans.frameBurstMax) || !checksForDecimalNumber(trans.frameBurstMax))
	errors.push(wifiName + " Frame Burst - Max Number: Please enter a numeric value.");
  else if(trans.frameBurstMax < 2 || trans.frameBurstMax > 255)
    errors.push(wifiName + " Frame Burst - Max Number: Max number of frames in a burst is out of range (from=2, to=255)");

  if(trans.frameBurstTime == null || trans.frameBurstTime === '' || isNaN(trans.frameBurstTime) || !checksForDecimalNumber(trans.frameBurstTime))
	errors.push(wifiName + " Frame Burst - Burst Time: Please enter a numeric value.");
  else if(trans.frameBurstTime < 0 || trans.frameBurstTime > 1023)
    errors.push(wifiName + " Frame Burst - Burst Time: Burst time out of range (from=0, to=1023)");

  if(isNaN(trans.power) || !checksForDecimalNumber(trans.power))
	errors.push(wifiName + " Transmit Power: Please enter a numeric value.");
  else if(trans.power < 1 || trans.power > 100)
    errors.push(wifiName + " Transmit Power: Please enter a numeric value between 1 and 100.");
}

function isInRange(startAddress, endAddress, ip) {
  for(var i = 0; i < 4; i++)
    if(startAddress[i]>ip[i] || endAddress[i]<ip[i])
      return false;
  return true;
}

//Used in the following pages:
//My Network / Network Connections
//Advanced / IP Distribution
function validateIPv4DhcpSettings(ip, startAddress, endAddress, subnetMask, winsServer, leaseTime, connectionId, protocolUsed, overrideSubnetMask, listOfNetworkIPAddress) {
  var errors = [];
  var subNetID = getSubnetID(ip,subnetMask);
  var reservedFiOSTVStartAddrs = angular.copy(subNetID);
    reservedFiOSTVStartAddrs[3]=100;
  var reservedFiOSTVEndAddrs = angular.copy(subNetID);
    reservedFiOSTVEndAddrs[3]=150;

  if(!validateIp(ip))
    errors.push("Invalid IP Address provided. Values must be between 0 and 255");
  if(!validateIp(startAddress))
    errors.push("Start IP Address: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
  if(!validateIp(endAddress))
    errors.push("End IP Address: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");

  if(validateIp(ip)){
    if(listOfNetworkIPAddress != null){
      if(checkAllNetworks(listOfNetworkIPAddress, ip, connectionId)){
        $scope.errorMessages.push("IP Address Already Exists: IP Address address " + getNumIpString(ip) + " is already in use by " + checkAllNetworks4Name(listOfNetworkIPAddress, ip, connectionId) + ".");
      }
    }
  }
  var subNetMaskError = false;
  var hasToCheckFullMaskRange = false;
  if(protocolUsed == 2 || protocolUsed == 1){
    hasToCheckFullMaskRange = true;
    if(protocolUsed == 1 && !overrideSubnetMask){
      hasToCheckFullMaskRange = false;
    }
    if(hasToCheckFullMaskRange){
      if((!validateIp(subnetMask) || checkFullListOfSubnetMaskRange(subnetMask))){
        if(getIpString(subnetMask) != '0.0.0.0'){
          errors.push("Subnet Mask: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
        }
        subNetMaskError = true;
      }
    }else{
      if(!validateIp(subnetMask)){
        if(getIpString(subnetMask) != '0.0.0.0'){
          errors.push("Subnet Mask: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
        }
        subNetMaskError = true;
      }
    }
  }
  if(isIPWithinRange(startAddress,reservedFiOSTVStartAddrs,reservedFiOSTVEndAddrs)
    && isIPWithinRange(endAddress,reservedFiOSTVStartAddrs,reservedFiOSTVEndAddrs)){
    errors.push("Start IP Address, End IP Address: IP addresses between "+getIpString(reservedFiOSTVStartAddrs)+" and "+getIpString(reservedFiOSTVEndAddrs)+" are used for FiOS TV. Please select a start and/or end IP address outside of this reserved range.");
  }
  if(connectionId == 0){
    if(checkForValidSubnetMaskRange(subnetMask) || (subNetMaskError == true)){
      errors.push("Subnet Mask: Subnet mask must be between 255.0.0.0 and 255.255.255.252.");
      subNetMaskError = true;
    }
  }
  /*else if(connectionId == 1){
    if(checkForValidSubnetMaskRangeBroadband(subnetMask) || (subNetMaskError == true)){
      errors.push("Subnet Mask: Subnet mask must be between 240.0.0.0 and 255.255.255.252.");
      subNetMaskError = true;
    }
  }*/
  if(subNetMaskError == false && protocolUsed == 2){
    if(validateIp(ip)){
      if(getNumIpString(ip) != '0.0.0.0') {
        if(checkHostVsSubmask(ip, subnetMask)){
          errors.push("IP Address and Subnet Mask combination: The combination of IP address and subnet mask is invalid. All of the bits in the host address portion of the IP address are set to " + checkBits(ip) + ".");
        }else{
          var networkSubnetMaskCheck = compareIpMaskNetwork(ip, subnetMask);
          if(networkSubnetMaskCheck != "2"){
            errors.push("IP Address and Subnet Mask combination: The combination of IP address and subnet mask is invalid. All of the bits in the network address portion of the IP address are set to " + networkSubnetMaskCheck + ".");
          }
        }
      }
    }
  }
  if(!validateIp(winsServer) || winsServer[0] > 255 || winsServer[1] > 255 || winsServer[2] > 255 || winsServer[3] > 255)
    errors.push("WINS Server: IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces.");
  if(isNaN(leaseTime) || leaseTime < 1 || leaseTime > 43200 || !(leaseTime % 1 === 0))
    errors.push("Lease Time in Minutes: Please enter a numeric value between 1 and 43200.");
  if(getIpString(startAddress) == '0.0.0.0')
    errors.push("Start IP Address: IP address may not be 0.0.0.0. IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces. At least one of the values must be greater than 0.");
  else if(checkHostVsSubmask(startAddress, subnetMask)){
    if(checkBits(startAddress) == "1"){
      errors.push("Start IP Address: " + startAddress[0] + "." + startAddress[1] + "." + startAddress[2] + "." + startAddress[3] + " isn't a valid address");
    }
  }
  if(getIpString(endAddress) == '0.0.0.0')
    errors.push("End IP Address:  IP address may not be 0.0.0.0. IP address must consist of 4 fields. Each field's value must be between 0 and 255, without any spaces. At least one of the values must be greater than 0.");
  else if(checkHostVsSubmask(endAddress, subnetMask)){
    if(checkBits(endAddress) == "1"){
      errors.push("End IP Address: " + endAddress[0] + "." + endAddress[1] + "." + endAddress[2] + "." + endAddress[3] + " isn't a valid address");
    }
  }
  if(errors.length > 0)
    return errors;

  var valid = true;
  var startValid = true;
  var endValid = true;
  var hasError = false;
  if((ip[0] & subnetMask[0]) != (startAddress[0] & subnetMask[0]) ||
    (ip[1] & subnetMask[1]) != (startAddress[1] & subnetMask[1]) ||
    (ip[2] & subnetMask[2]) != (startAddress[2] & subnetMask[2]) ||
    (ip[3] & subnetMask[3]) != (startAddress[3] & subnetMask[3]))
    startValid = false;
  if((ip[0] & subnetMask[0]) != (endAddress[0] & subnetMask[0]) ||
    (ip[1] & subnetMask[1]) != (endAddress[1] & subnetMask[1]) ||
    (ip[2] & subnetMask[2]) != (endAddress[2] & subnetMask[2]) ||
    (ip[3] & subnetMask[3]) != (endAddress[3] & subnetMask[3]))
    endValid = false;
  if(!startValid || !endValid)
    errors.push((!startValid?"Start IP Address":"") + (!startValid&&!endValid?", ":"") + (!endValid?"End IP Address":"") + ":  The DHCP IP address range does not conform to the connection IP address and the DHCP subnet mask.");
  else{
    if(!(validateDHCPRange(startAddress, endAddress, ip, subnetMask))){
      errors.push("Start IP Address, End IP Address: The DHCP IP address range does not conform to the connection IP address and the DHCP subnet mask.");
    }
  }
  if((subnetMask[0] == 255 && subnetMask[1] == 255 && subnetMask[2] == 255 && subnetMask[3] == 255) ||
    (subnetMask[0] < subnetMask[1] || subnetMask[1] < subnetMask[2] || subnetMask[2] < subnetMask[3]))
    valid = false;
  var zeroFound = false;
  for(var i = 0; i < 4; i++) {
    for(var k = 7; k > -1; k--) {
      var one = ((subnetMask[i]>>k) & 1) == 1;
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
    errors.push("Subnet Mask: Subnet mask must consist of 4 fields. Each field's value must be between 0 and 255, constructing a contiguous string of binary ones. The default mask value is 255.255.255.0.");
  else {
    //validate start is before end ip
    //validate ip is not in range between start and end ip addresses
    var validRange = false;
    var validIp = false;
    var dontBreak = false;
    for(var index = 0; index < 4; index++) {
      var s = startAddress[index];
      var e = endAddress[index];
      var i = ip[index];
      s = Number(s);
      e = Number(e);
      i = Number(i);
      if(e > s)
        dontBreak = true;
      if(i < s || i > e)
        validIp = true;
      if(s > e && !dontBreak)
        break;
      if(s == e)
        continue;
      validRange = true;
      continue;
    }
    if(getIpString(startAddress) === getIpString(endAddress))
      validRange = true;
    if(!validRange){
      hasError = true;
      errors.push("IP Addresses: Start IP address is greater than End IP address.");
    }
    validIp = isIPWithinRange(ip, startAddress, endAddress);
    if(validIp){
      hasError = true;
      errors.push("IP Addresses: The Device's IP address should not be in the range of the IP pool");
    }
    if(!hasError){
      if(!checkIPRange(startAddress, endAddress)){
        errors.push("The number of IP Addresses in the DHCP IP address range must not be more than 256.");
      }
    }
  }
  return errors;
}

function validateIPv6(str) {
  var parts = str.split(':');
  if(parts.length<3 || parts.length > 8)
    return false;

  var emptyCount = 0;
  for(var i = 0; i < parts.length; i++) {
    if(parts[i] === '') {
      emptyCount++;
      continue;
    }
    if(!/^[a-f0-9]{1,4}$/i.test(parts[i]))
      return false;
  }
  if(emptyCount == 1)
    return parts[parts.length-1] !== '' && parts[0] !== '';
  if(emptyCount == 2)
    return (parts[parts.length-1] === '' && parts[parts.length-2] === '') || (parts[1] === '' && parts[0] === '');
  if(emptyCount == 3 && parts.length == 3)
    return true;
  if(emptyCount > 2)
    return false;
  return parts.length == 8;
}

function getPrefixLength(str) {
  if(!validateIPv6(str))
    return -1;
  var arr = str.split(':');
  var lastOne = 0;
  var index = 0;
  var numFound = false;
  for(index = arr.length-1; index >= 0; index--) {
    if(arr[index] === '')
      continue;
    var num = parseInt(arr[index], 16);
    if(num === 0)
      continue;
    for(lastOne = 0; lastOne < 16; lastOne++) {
      if(((num>>lastOne)&1)==1) {
        numFound = true;
        break;
      }
    }
    if(numFound)
      break;
  }
  if(!numFound)
    return -1;
  return (16-lastOne) + 16*index;
}

function validatePrefixLength(str) {
  var parts = str.split('/');
  if(parts.length!=2 || !validateIPv6(parts[0]))
    return false;
  if(parts[1] === '' || isNaN(parts[1]))
    return false;
  var pl = getPrefixLength(parts[0]);
  return pl != -1 && pl != 128 && pl <= parseInt(parts[1]) && parseInt(parts[1]) >= 16;
}

function validateHostname(str) {
  if(!/[a-z0-9]/i.test(str))
    return false;
  if(!/^[a-z0-9]$|^[a-z0-9][a-z0-9\_\-]{0,}[a-z0-9]$|^[a-z0-9][a-z0-9]{0,}[\.]{1}[a-z0-9]{0,}$|^[a-z0-9][a-z0-9]{0,}[\.]{1}[a-z0-9]{0,}[\.]{1}$|^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/i.test(str))
    return false;
  var arr = str.split('.');
  for(var i = 0; i < arr.length; i++)
    if(arr[i].length>63)
      return false;
  return true;
}

function validateHostnameDatetime(str) {
  var regexMultiDec = /r?\.{2}?/g;
  var regexInvalidCombination = /((\.\-|\-\.)|(\.\_|\_\.))/g;//Invalid Spl. Char Combinations
  var regexAllowed = "^[a-z0-9][a-z0-9\-\_\.]{0,}$";
  var regexAtleastOneAplhabet = "^.*[a-z][0-9]{0,}[^a-z0-9]*$";

  var bStringPartFound = false;
  if(!/[a-z0-9]/i.test(str) || !(new RegExp(regexAllowed,"i")).test(str))
    return false;
  if(str.search(regexMultiDec)!=-1 //Search For Multiple Decimal Points
   || str.search(regexInvalidCombination)!=-1)// Search For Invalid Char Combination
    return false;
  var hostArr = str.split('.');
  for(var i = 0; i < hostArr.length; i++){
    if(hostArr[i].length>63)
      return false;
    if(hostArr.length !=4 && (new RegExp(regexAtleastOneAplhabet,"i")).test(hostArr[i]))
      bStringPartFound = true;
  }
  if(hostArr.length !=4 && !bStringPartFound)
    return false;
  return true;
}

function validateLocalDomain(str) {
    if(!/[a-z0-9]/i.test(str))
        return false;
    if(!/^[a-z0-9]$|^[a-z0-9][a-z0-9\-\_\.]{0,}[a-z0-9]$/i.test(str))
        return false;
    var arr = str.split('.');
    for(var i = 0; i < arr.length; i++)
        if(arr[i].length>63 )
            return false;
    return true;
}

function validateLocalDomains(str) {
    if(!/[a-z0-9]/i.test(str))
        return false;
    if(!/^[a-z0-9]$|^[a-z0-9][a-z0-9\-\_\.]{0,}[a-z0-9]$/i.test(str))
        return false;
    var arr = str.split('.');
    for(var i = 0; i < arr.length; i++)
        if(arr[i].length>63 || arr[i].length==0)
            return false;
    return str.indexOf('--') == -1 && str.indexOf('-.') == -1 &&
           str.indexOf('.-') == -1 && str.indexOf('_-') == -1 &&
           str.indexOf('__') == -1 && str.indexOf('_.') == -1 &&
           str.indexOf('._') == -1;
}

function hasADot(str) {
    if(null != str && undefined != str && str.indexOf('.') != -1){
      return true;
    }else{
      return false;
    }
};

/*
 * Numbers, letters, '-', and '_'.
 * 1 <= length <= 64
 */
function validateIpDomain(str) {
  var ip = splitIpArr(str);
  if (validateIp(ip))
    return true;
  if(validateIPv6(str))
    return true;
  return validateHostname(str);
}

/*
 * Numbers, letters, '-', and '_'.
 * 1 <= length <= 64
 * Slightly different from Function: validateIpDomain because time server allows a different format. (e.g. host-time_server.com).
 */
function validateIpDomainDatetime(str) {
  var ip = splitIpArr(str);
  if(validateIPv6(str))
    return true;
  return validateHostnameDatetime(str);
}

function isScheduleActive(schedule, curMoment) {
  if(schedule === null || schedule === 'Always' || schedule === '')
    return "Active";
  var responses = ['Active','Inactive'];
  if(!schedule.activeDuring)
    responses = ['Inactive', 'Active'];
  var curDay = curMoment.day();
  if(curDay == 0)
    curDay = 7;
  curDay -= 1;
  var hour = curMoment.hour();
  var minute = curMoment.minute();
  for(var i = 0; i < schedule.timeSegments.length; i++) {
    if(String(schedule.timeSegments[i].daysOfTheWeek).indexOf(curDay) == -1)
     continue;
    for(var k = 0; k < schedule.timeSegments[i].hourRanges.length; k++) {
      var sh = schedule.timeSegments[i].hourRanges[k].startTimeHour;
      var eh = schedule.timeSegments[i].hourRanges[k].endTimeHour;
      var sm = schedule.timeSegments[i].hourRanges[k].startTimeMinute;
      var em = schedule.timeSegments[i].hourRanges[k].endTimeMinute;
      if(sh == eh && sm <= em){
        if(sh == hour && eh == hour && sm <= minute && em > minute){
          return responses[0];
        }
      }else if(sh < eh) {
        if((hour > sh && hour < eh) ||
           (sh == hour && minute >= sm) ||
           (eh == hour && minute < em))
            return responses[0];
      } else {
        if((sh < hour) || (sh == hour && sm <= minute) ||
          (eh > hour) || (eh == hour && em > minute))
          return responses[0];
      }
    }
  }
  return responses[1];
}

function parsePartial(items, log, index) {
  var count = 0;
  do {
    var item = {};
    item.time = log.substring(index, index+20);

    var lastDay = moment().subtract('days', 1);
    var lastWeek = moment().subtract('weeks', 1);
    var timeLog = moment(log.substring(index, index+20), "MMM DD hh:mm:ss YYYY");
    item.soYday = (timeLog > lastDay)? 'yes' : 'no';
    item.lWeek = (timeLog > lastWeek)? 1 : 0;

    var endOfLog = log.indexOf('\n', index);
    if(endOfLog == -1)
      endOfLog = log.length;
    var logLine = log.substring(index+20, endOfLog);
    if(logLine.indexOf(':')==-1) {
      index = endOfLog+1;
      continue;
    }
    var frontParts = logLine.substring(0, logLine.indexOf(':')).split(' ');
    item.event = frontParts[2];
    item.type = frontParts[1].split('.')[1];
    item.details = logLine.substring(logLine.indexOf(':')+1);
    items.push(item);
    index = endOfLog+1;
    count++;
  } while(count < 100 && index < log.length)
  return index;
}

function validateGivenHostName(str) {
  var flagValue = true;
  var pattern = new RegExp(/^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/);
  flagValue = pattern.test(str);
  return flagValue;
}

function setupLoggingCtrl($scope, id, $http, Log) {
  $scope.valid = true;
  $scope.logId = id;
  $scope.DisplayNum = 50;
  $scope.logOpts  ='op1';
  $scope.refresh = function() {
    $scope.FDisplayNum = 50;
    if($scope.enableLogging){
      $http.get('/api/settings/log/' + $scope.logId).success(function(data, status, headers, config) {
        $scope.items = [];
        $scope.log = data;
        $scope.index = 0;
        $scope.parseLog();
      });
    }
  }
  $scope.$on('$destroy', function() {
    $scope.valid = false;
  })

  $scope.dateConvert = function(hr, min, amp){
      var time = hr + ':' + min;
      if ((hr !== undefined) && (min !== undefined) && (amp !== undefined)){
        var hours = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        if (amp == "PM" && hours < 12) hours = hours + 12;
        if (amp == "AM" && hours == 12) hours = hours - 12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        return (sHours +':'+sMinutes+ ':00');
      }
  }

  $scope.viewOpts = function() {
    $scope.showOpts = true;
  };

  $scope.showFiltered = function(dataStart, dataEnd, dataArray) {
    $scope.showOpts = false;
    $scope.filterItems = [];
    var timeStart = moment(dataStart, "MMM DD hh:mm:ss YYYY");
    var timeEnd = moment(dataEnd, "MMM DD hh:mm:ss YYYY");
    if (dataArray instanceof Array){
       for (var m=0; m<dataArray.length; m++){
         if (moment(dataArray[m].time, "MMM DD hh:mm:ss YYYY") > timeStart  &&  moment(dataArray[m].time, "MMM DD hh:mm:ss YYYY") < timeEnd){
            $scope.filterItems.push(dataArray[m]);
         }
        }
    }
  };
  $scope.showNewLog = function(data) {
    $scope.showOpts = false;
  }
  $scope.clearLogger = function(val) {
    if (val){
      $scope.isOK = true;
    }
  }
  $scope.loadMore = function(max) {
    $scope.DisplayNum += 50;
  }

  $scope.cancelOK = function() {
    $scope.isOK = false;
    $scope.showOpts = false;
  }
  $scope.clearLog = function() {
    $scope.isOK = false; 
    Log.remove({id: $scope.logId},function() {
      $scope.refresh();
    })
  }
  $scope.parseLog = function() {
    window.setTimeout(function() {
      $scope.index = parsePartial($scope.items, $scope.log, $scope.index);
      $scope.$apply();
      if($scope.valid && $scope.index < $scope.log.length)
        $scope.parseLog();
    }, 1);
  }
  $scope.refresh();
}

function compare(a,b){
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}

function sortListItems(arr){
  var tempNameArray = [];
  for(var i = 0; i < arr.length; i++) {
    arr[i].name = unescape(arr[i].name);
    arr[i].description = unescape(arr[i].description);
    arr[i].displayLabel = arr[i].name;
    if(arr[i].description != ""){
      arr[i].displayLabel += " (" + arr[i].description + ")";
    }
    var obj = new Object();
    obj.name = arr[i].name.toLowerCase();
    obj.oldName = arr[i].name;
    tempNameArray.push(obj);
  }
  tempNameArray.sort(compare);
  var tempObjArray = [];
  var tempObj;
  for(var i = 0; i < tempNameArray.length; i++){
    for(var j = 0; j < arr.length; j++) {
      if(arr[j].name === tempNameArray[i].oldName)
      {
        tempObj = arr[j];
        tempObjArray.push(tempObj);
        arr.splice(j, 1 );
        break;
      }
    }
  }
  return tempObjArray;
}

//UUID Generator taken from https://gist.github.com/jcxplorer/823878#file-uuid-js
//http://blog.snowfinch.net/post/3254029029/uuid-v4-js
function uuid() {
  var uuid = "", i, random;
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;
 
    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
}

function checkDeviceIP(device){
  device.shownIPAddress = device.ipAddress;
  device.shownIP6Address = device.ipv6Address;
  if(device.status == false){
    if(device.ipAddress == "0.0.0.0"){
      device.shownIPAddress = "n/a";
    }
    if(device.ipv6Address == "::"){
      device.shownIP6Address = "n/a";
    }
  }
  return device;
}

function filterOutStb(devices){
  for(var i = 0; i < devices.length; i++){
    if(devices[i].isStb){
      devices.splice(i,1);
      i--;
    }
  }
  return devices;
}

function validateEmail(email) {
    var filter =  /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
    if (!filter.test(email)) {
      return false;
    }else{
      return true;
    }
 }

function findTimeNow(timeObj){
  var tz = parseInt(timeObj.timeZone)
  switch(parseInt(timeObj.timeZone)) {
    case -5:
      tz = "EST5EDT";
      break;
    case -6:
      tz = "CST6CDT";
      break;
    case -7:
      tz = "MST7MDT";
      break;
    case -8:
      tz = "PST8PDT";
      break;
    case -9:
      tz = "America/Anchorage";
      break;
    case -10:
      tz = "HST";
      break;
    case -11:
      tz = "MST";
      break;
    default:
      tz = "WET";
      break;
  }

  var tempTzDate;
  if(moment.tz == undefined){
    tempTzDate = window.moment.unix(timeObj.localTime).tz(tz);
    return window.moment(tempTzDate);
  }else{
    tempTzDate = moment.unix(timeObj.localTime).tz(tz);
    return moment(tempTzDate);
  }
}

function getStatusTitle(status){
  switch(Number(status)) {
    case 0:
      return 'Updated';
      break;
    case 1:
      return 'In progress...';
      break;
    case 2:
      return 'Router offline';
      break;
    case 3:
      return 'DDNS server offline';
      break;
    case 4:
      return 'Failed - Settings';
      break;
    case 5:
      return 'Failed - Other';
      break;
    case 6:
      return 'DDNS Server Error';
      break;
  }
}

function validateSubMask(ip){
  if(ip[0] < 255 || ip[1] < 255 || ip[2] < 254){
	return false;
  }
  return true;
}

function checkHostVsSubmask(ip, submask){
  var error = false;
  if(submask[0] == '255' && submask[1] == '255' && submask[2] == '255' && submask[3] == '255'){
    error = true;
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '255' && submask[3] == '254'){
    error = true;
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '255' && submask[3] == '252'){
    error = checkHostVsSubmaskRange(ip, 4);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '255' && submask[3] == '248'){
    error = checkHostVsSubmaskRange(ip, 8);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '255' && submask[3] == '240'){
    error = checkHostVsSubmaskRange(ip, 16);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '255' && submask[3] == '224'){
    error = checkHostVsSubmaskRange(ip, 32);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '255' && submask[3] == '192'){
    error = checkHostVsSubmaskRange(ip, 64);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '255' && submask[3] == '128'){
    error = checkHostVsSubmaskRange(ip, 128);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '255' && submask[3] == '0'){
    error = checkHostVsSubmaskRange(ip, 256);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '254' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges(ip, 256, 2);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '252' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges(ip, 256, 4);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '248' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges(ip, 256, 8);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '240' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges(ip, 256, 16);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '224' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges(ip, 256, 32);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '192' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges(ip, 256, 64);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '128' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges(ip, 256, 128);
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges(ip, 256, 256);
  }else if(submask[0] == '255' && submask[1] == '254' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges1(ip, 256, 2);
  }else if(submask[0] == '255' && submask[1] == '252' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges1(ip, 256, 4);
  }else if(submask[0] == '255' && submask[1] == '248' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges1(ip, 256, 8);
  }else if(submask[0] == '255' && submask[1] == '240' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges1(ip, 256, 16);
  }else if(submask[0] == '255' && submask[1] == '224' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges1(ip, 256, 32);
  }else if(submask[0] == '255' && submask[1] == '192' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges1(ip, 256, 64);
  }else if(submask[0] == '255' && submask[1] == '128' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges1(ip, 256, 128);
  }else if(submask[0] == '255' && submask[1] == '0' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges1(ip, 256, 256);
  }else if(submask[0] == '254' && submask[1] == '0' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges2(ip, 256, 2);
  }else if(submask[0] == '252' && submask[1] == '0' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges2(ip, 256, 4);
  }else if(submask[0] == '248' && submask[1] == '0' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges2(ip, 256, 8);
  }else if(submask[0] == '240' && submask[1] == '0' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges2(ip, 256, 16);
  }else if(submask[0] == '224' && submask[1] == '0' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges2(ip, 256, 32);
  }else if(submask[0] == '192' && submask[1] == '0' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges2(ip, 256, 64);
  }else if(submask[0] == '128' && submask[1] == '0' && submask[2] == '0' && submask[3] == '0'){
    error = checkHostVsSubmaskRanges2(ip, 256, 128);
  }else{
    error = true;
  }
  return error;
}

function checkHostVsSubmaskRange(ip, range){
  var error = false;
  if(String(ip[3]) == ''){
    error = true;
  }
  if(ip[3] > 255 || ip[3] < 0){
    error = true;
  }
  if(((ip[3] % range) == 0) || ((ip[3] % range) == (range - 1))){
	error = true;
  }
  return error;
}

function checkHostVsSubmaskRanges(ip, range, thirdCol){
  var error = false;
  if(String(ip[3]) == ''){
    error = true;
  }
  if(ip[3] > 255 || ip[3] < 0){
    error = true;
  }
  if(ip[2] % thirdCol == 0){
    if((ip[3] % range) == 0){
      error = true;
    }
  }
  if((ip[2] % thirdCol) == (thirdCol -1)){
    if((ip[3] % range) == (range - 1)){
      error = true;
    }
  }
  return error;
}

function checkHostVsSubmaskRanges1(ip, range, thirdCol){
  var error = false;
  if(String(ip[3]) == ''){
    error = true;
  }
  if(ip[3] > 255 || ip[3] < 0){
    error = true;
  }
  if(ip[1] % thirdCol == 0){
    if(ip[3] == 0 && ip[2] == 0){
      error = true;
    }
  }
  if((ip[1] % thirdCol) == (thirdCol -1)){
    if(ip[3] == 255 && ip[2] == 255){
      error = true;
    }
  }
  return error;
}

function checkHostVsSubmaskRanges2(ip, range, thirdCol){
  var error = false;
  if(String(ip[3]) == ''){
    error = true;
  }
  if(ip[3] > 255 || ip[3] < 0){
    error = true;
  }
  if(ip[0] % thirdCol == 0){
    if(ip[3] == 0 && ip[2] == 0 && ip[1] == 0){
      error = true;
    }
  }
  if((ip[0] % thirdCol) == (thirdCol -1)){
    if(ip[3] == 255 && ip[2] == 255 && ip[1] == 255){
      error = true;
    }
  }
  return error;
}

function checkForValidSubnetMaskRange(submask){
  var error = false;
  if(submask[0] == '255' && submask[1] == '255' && submask[2] == '255'){
    switch(String(submask[3])){
      case '252':
      case '248':
      case '240':
      case '224':
      case '192':
      case '128':
      case '0':
        error = false;
        break;
      default:
        error = true;
        break;
    }
  }else if(submask[0] == '255' && submask[1] == '255' && submask[3] == '0'){
    switch(String(submask[2])){
      case '255':
      case '254':
      case '252':
      case '248':
      case '240':
      case '224':
      case '192':
      case '128':
      case '0':
        error = false;
        break;
      default:
        error = true;
        break;
    }
  }else if(submask[0] == '255' && submask[2] == '0' && submask[3] == '0'){
    switch(String(submask[1])){
      case '255':
      case '254':
      case '252':
      case '248':
      case '240':
      case '224':
      case '192':
      case '128':
      case '0':
        error = false;
        break;
      default:
        error = true;
        break;
    }
  }else{
    error = true;
  }
  return error;
}

function checkForValidSubnetMaskRangeBroadband(submask){
  var error = false;
  if(submask[0] == '255' && submask[1] == '255' && submask[2] == '255'){
    switch(String(submask[3])){
      case '252':
      case '248':
      case '240':
      case '224':
      case '192':
      case '128':
      case '0':
        error = false;
        break;
      default:
        error = true;
        break;
	}
  }else if(submask[0] == '255' && submask[1] == '255' && submask[3] == '0'){
    switch(String(submask[2])){
      case '255':
      case '254':
      case '252':
      case '248':
      case '240':
      case '224':
      case '192':
      case '128':
      case '0':
        error = false;
        break;
      default:
        error = true;
        break;
    }
  }else if(submask[0] == '255' && submask[2] == '0' && submask[3] == '0'){
    switch(String(submask[1])){
      case '255':
      case '254':
      case '252':
      case '248':
      case '240':
      case '224':
      case '192':
      case '128':
      case '0':
        error = false;
        break;
      default:
        error = true;
        break;
    }
  }else if(submask[1] == '0' && submask[2] == '0' && submask[3] == '0'){
    switch(String(submask[0])){
      case '255':
      case '254':
      case '252':
      case '248':
      case '240':
        error = false;
        break;
      default:
        error = true;
        break;
    }
  }else{
    error = true;
  }
  return error;
}

function checkFullListOfSubnetMaskRange(submask){
  var error = false;
  if(submask[0] == '0' && submask[1] == '0' && submask[2] == '0' && submask[3] == '0'){
    error = true;
  }else if(submask[0] == '255' && submask[1] == '255' && submask[2] == '255' && !checkSubListOfSubnetMaskRange(submask[3])){
    error = false;
  }else if(submask[0] == '255' && submask[1] == '255' && !checkSubListOfSubnetMaskRange(submask[2]) && String(submask[3]) == '0'){
    error = false;
  }else if(submask[0] == '255' && !checkSubListOfSubnetMaskRange(submask[1]) && String(submask[2]) == '0' && String(submask[3]) == '0'){
    error = false;
  }else if(!checkSubListOfSubnetMaskRange(submask[0]) && String(submask[1]) == '0' && String(submask[2]) == '0' && String(submask[3]) == '0'){
    error = false;
  }else{
    error = true;
  }
  return error;
}

function checkSubListOfSubnetMaskRange(value){
  var error = false;
  switch(String(value)){
    case '255':
    case '254':
    case '252':
    case '248':
    case '240':
    case '224':
    case '192':
    case '128':
    case '0':
      error = false;
      break;
    default:
      error = true;
      break;
  }
  return error;
}
function checkBits(ip){
  if(ip[3] % 2 == 0){
    return "0";
  }
  return '1';
}

function getNumIpString(arr) {
  return Number(arr[0]) + '.' + Number(arr[1]) + '.'  + Number(arr[2]) + '.' + Number(arr[3]);
}

function checkPortForwarding(listOfIP, ip){
    for(var i = 0; i < listOfIP.length; i ++){
      if(listOfIP[i].deviceIp == getNumIpString(ip))
        return true;
    }
    return false;
}

function checkAllNetworks(listOfIP, ip, id){
  for(var i = 0; i < listOfIP.length; i ++){
    if(listOfIP[i].id != id){
      if(listOfIP[i].ip == getNumIpString(ip)){
        return true;
        break;
      }
    }
  }
  return false;
}

function checkAllNetworks4Name(listOfIP, ip, id){
  for(var i = 0; i < listOfIP.length; i ++){
    if(listOfIP[i].id != id){
      if(listOfIP[i].ip == getNumIpString(ip)){
        return listOfIP[i].name;
        break;
      }
    }
  }
  return '';
}

function checkForWholeNumbers(value){
  if(value != Math.round(value)){
	return true;
  }
  return false;
}

function checkFor127(ip){
  if(ip[0] == 127){
    return true;
  }
  return false;
}


function compareIpMaskNetwork(ip, mask){
  var ipStr = convertValueto8Bits(ip);
  var maskStr = convertValueto8Bits(mask);
  var ipStrArr = ipStr.split("");
  var maskStrArr = maskStr.split("");
  var result = "";
  var curr = "";
  for(var i = 0; i < maskStrArr.length; i ++){
    if(maskStrArr[i] == "1"){
      if(curr == ""){
        curr = ipStrArr[i];
        result = ipStrArr[i];
      }else{
        if(ipStrArr[i] != curr){
          result = "2";
          break;
        }
      }
    }else{
      break;
    }
  }
  return result;
}

function convertValueto8Bits(value){
  var str = "";
  for(var i = 0; i < value.length; i ++){
    str += convertIPto8Bits(value[i]);
  }
  return str;
}

function convertIPto8Bits(value){
  var val = Number(value);
  var str = "";
  if(val >= 128){
    val -= 128;
    str += "1";
  }else{
    str += "0";
  }
  if(val >= 64){
    val -= 64;
    str += "1";
  }else{
    str += "0";
  }
  if(val >= 32){
    val -= 32;
    str += "1";
  }else{
    str += "0";
  }
  if(val >= 16){
    val -= 16;
    str += "1";
  }else{
    str += "0";
  }
  if(val >= 8){
    val -= 8;
    str += "1";
  }else{
    str += "0";
  }
  if(val >= 4){
    val -= 4;
    str += "1";
  }else{
    str += "0";
  }
  if(val >= 2){
    val -= 2;
    str += "1";
  }else{
    str += "0";
  }
  if(val >= 1){
    val -= 1;
    str += "1";
  }else{
    str += "0";
  }
  return str;
}

function checksForDecimalNumber(value){
  var result = true;
  if(parseInt(value) != value){
	result = false;
  }
  return result;
}

function checksForWholeNumber(value){
  var result = true;
  if(!(/^[0-9]*$/i.test(value))){
    result = false;
  }
  return result;
}

function checkSubnetIp(ip, submask){
  var ipStr = convertValueto8Bits(ip);
  var maskStr = convertValueto8Bits(submask);
  var ipStrArr = ipStr.split("");
  var maskStrArr = maskStr.split("");
  var result = true;
  for(var i = 0; i < maskStrArr.length; i ++){
    if(maskStrArr[i] == "0"){
      if(ipStrArr[i] == "1"){
        result = false;
        break;
      }
    }
  }
  return result;
}

function checkMulticastVsList(ip, list, index, type){
  var result = true;
  if(list.length > 0){
    for(var i = 0; i < list.length; i ++){
      if(i != index){
        if(type == "ip"){
          if(isIpTheSame(ip, list[i].ip)){
            result = false;
            break;
          }
        }else if(type == "address"){
          if(isIpTheSame(ip, list[i].address)){
            result = false;
            break;
          }
        }
      }
    }
  }
  return result;
}

function isIpTheSame(ip, listIp){
  var result = false;
  var tempIp = splitIpArr(listIp);
  if(Number(ip[0]) == Number(tempIp[0]) &&
     Number(ip[1]) == Number(tempIp[1]) &&
     Number(ip[2]) == Number(tempIp[2]) &&
     Number(ip[3]) == Number(tempIp[3])){
    result = true;
  }
  return result;
}

function isIPWithinRange(ip, startIp, endIp){
  var result = false;
  var ipNum = calDevices(ip);
  var startIpNum = calDevices(startIp);
  var endIpNum = calDevices(endIp);
  if(startIpNum <= ipNum && ipNum <= endIpNum){
    result = true;
  }
  return result;
}

function calDevices(ip){
  var count = 0;
  if(Number(ip[0]) != 0){
    count += Number(ip[0]) * 256 * 256 * 256;
  }
  if(Number(ip[1]) != 0){
    count += Number(ip[1]) * 256 * 256;
  }
  if(Number(ip[2]) != 0){
    count += Number(ip[2]) * 256;
  }
  if(Number(ip[3]) != 0){
    count += Number(ip[3]);
  }
  return count;
}

function checkIPRange(startIP, endIP){
  var result = true;
  var num = calDevices(endIP) - calDevices(startIP) + 1;
  if(num > 256){
    result = false;
  }
  return result;
}

function checkIf2IPAreInTheSameSubnetRange(ip1, ip2, subnetMask){
  var valid = true;
  if((Number(ip1[0]) & Number(subnetMask[0])) != (Number(ip2[0]) & Number(subnetMask[0])) ||
    (Number(ip1[1]) & Number(subnetMask[1])) != (Number(ip2[1]) & Number(subnetMask[1])) ||
    (Number(ip1[2]) & Number(subnetMask[2])) != (Number(ip2[2]) & Number(subnetMask[2])) ||
    (Number(ip1[3]) & Number(subnetMask[3])) != (Number(ip2[3]) & Number(subnetMask[3])))
      valid = false;
  return valid;
  }

function getSubnetID(ipAddress,subNetMask){
  var binaryIPAdd = getBinary(ipAddress);
  var binarySubNetMask = getBinary(subNetMask);
  var binarySubNet = [];
  var subNetID = [];

  for(var i = 0; i < 4; i++) {
    binarySubNet[i] = (addBinary(binarySubNetMask[i], binaryIPAdd[i])).toString(10);
    subNetID[i] = toDecimal(binarySubNet[i]);
  }
  return subNetID;
}

function validateDHCPRange(startIPAddr, endIPAddr, ipAddr, subnetMask){
  var dhcpRange = null;

  dhcpRange = getDHCPRange(ipAddr, subnetMask);
  if(undefined != dhcpRange && null != dhcpRange
     && isIPWithinRange(startIPAddr,dhcpRange.START_ADDR,dhcpRange.END_ADDR)
     && isIPWithinRange(endIPAddr,dhcpRange.START_ADDR,dhcpRange.END_ADDR)){
    return true;
  }
  return false;
}

function getDHCPRange(ipAddress,subNetMask){
 var startDHCPIPAddr = null;
 var endDHCPIPAddr = null;
 var broadCastIP = null;
 var subNetID = null;
 var dhcpRange = {};

 subNetID = getSubnetID(ipAddress,subNetMask);
 startDHCPIPAddr = angular.copy(subNetID);
 startDHCPIPAddr[3] = parseInt(startDHCPIPAddr[3]) + 1;

 broadCastIP = getBroadCastAddress(subNetMask,subNetID);
 endDHCPIPAddr = angular.copy(broadCastIP);
 endDHCPIPAddr[3] = parseInt(endDHCPIPAddr[3]) - 1;

 dhcpRange = {START_ADDR:startDHCPIPAddr,END_ADDR:endDHCPIPAddr};
 return dhcpRange;
}

function getBroadCastAddress(subNetMask,subNetID){
 var binarySubNetMask = getBinary(subNetMask);
 var binarySubNetID = getBinary(subNetID);

 var binaryWildCardAdd = getInverseBinary(subNetMask);
 var binaryBroadCastAdd = [];
 var broadCastIP = []
 for(var i = 0; i < 4; i++) {
   binaryBroadCastAdd[i] = (orBinary(binaryWildCardAdd[i],binarySubNetID[i])).toString(10);
   broadCastIP[i] = toDecimal(binaryBroadCastAdd[i]);
 }
 return broadCastIP;
}

function orBinary(bNum1,bNum2){
 var broadcastAdd = [];
 var binaryStr;
 for(var i = 0; i < 8; i++) {
   broadcastAdd[i] = (parseInt(bNum1[i]) | parseInt(bNum2[i])).toString(10);
   if(i==0){
     binaryStr = broadcastAdd[i];
   }else{
     binaryStr = binaryStr + broadcastAdd[i];
   }
 }

 return binaryStr;
}


function getInverseBinary(add){
  var binaryArr = [];
  for(var i = 0; i < 4; i++) {
    binaryArr[i] = toInverseBinary(add[i]);
  }
  return binaryArr;
}

function toInverseBinary(iNum){
  var convertedBinary = (parseInt(iNum,10)).toString(2);
  var finalBinary;
  var inverseBinary = [1,1,1,1,1,1,1,1];
  for(var i = 0; i < 8; i++) {
    if(i==0)
      finalBinary =  (parseInt(parseInt(inverseBinary[i]) ^ parseInt(convertedBinary[i]))).toString(10);//XOR
    else
      finalBinary =  finalBinary + (parseInt(parseInt(inverseBinary[i]) ^ parseInt(convertedBinary[i]))).toString(10);//XOR
    }
  return finalBinary;
}


function addBinary(num1,num2){
  var binaryNum = [];
  var binaryStr;
  for(var i = 0; i < 8; i++) {
    binaryNum[i] = (parseInt(num1[i]) & parseInt(num2[i])).toString(10);
    if(i==0){
      binaryStr = binaryNum[i];
    }else{
      binaryStr = binaryStr + binaryNum[i];
    }
  }
  return binaryStr;
}

function getBinary(add){
  var binaryArr = [];
  for(var i = 0; i < 4; i++) {
    binaryArr[i] = toBinary(add[i]);
  }
  return binaryArr;
}

function toBinary(dNum){
  var convertedBinary = parseInt(dNum,10).toString(2);
  var finalBinary = null;
  if(convertedBinary.length<8)
  {
    finalBinary = '0';
    for(var iAdditionalBits = 8-convertedBinary.length; iAdditionalBits > 1; iAdditionalBits--){
      finalBinary = finalBinary + '0';
    }
     finalBinary = (finalBinary + convertedBinary);
  }
  if(finalBinary == null)
    finalBinary = convertedBinary;
  return finalBinary;
}

var toDecimal = function(bNum) {
  return parseInt(bNum,2).toString(10);
}

function validateHostNameDHCPConnections(str) {
  var error = true;
  if(str.length < 1){
    error = false;
  }else{
    var arr = String(str).split("");
    if(!/[a-zA-Z0-9]/i.test(arr[0]))
      error = false;
    if(error){
      if(str.length > 1){
        if(!/[a-z0-9]/i.test(arr[arr.length - 1]))
          error = false;
        if(error){
          if(str.length > 2){
            for(var i = 1; i < (arr.length - 1); i ++){
              if(!/[a-z0-9\-\_\.]/i.test(arr[i])){
                error = false;
                break;
              }
            }
          }
        }
        if(error){
          var arr1 = str.split('.');
          for(var i = 0; i < arr1.length; i++){
            if(arr1[i].length>63 || arr1[i].length==0)
              error = false;
          }
        }
        if(error){
          if(str.indexOf('-.') != -1 || str.indexOf('.-') != -1 || str.indexOf('_.') != -1 || str.indexOf('._') != -1){
            error = false;
          }
        }
      }
    }
  }
  return error;
}

function isAddressValidIPPattern(str){
  var error = true;
  if(/^[0-9\.]/i.test(str)){
    var ip = splitIpArr(str);
    if (!validateIp(ip)){
      error = false;
    }
  }else{
	error = false;
  }
  return error;
}

function filterOutGuest(devices){
  for(var i = 0; i < devices.length; i++){
    if(Number(devices[i].connectionType) == 6){
      devices.splice(i,1);
      i--;
    }
  }
  return devices;
}

function filterOutNonGuest(devices){
  for(var i = 0; i < devices.length; i++){
    if(Number(devices[i].connectionType) != 6){
      devices.splice(i,1);
      i--;
    }else if(!(devices[i].approved)){
      devices.splice(i,1);
      i--;
    }
  }
  return devices;
}

function getNextLocationForLocationChange(urlStr){
  var tempArr = String(urlStr).split('#');
  return tempArr[1];
}

function notAcceptedMac(value){
  var str = value.toLowerCase();
  switch(str){
    case "00:00:00:00:00:00":
    case "ff:ff:ff:ff:ff:ff":
    case "01:00:00:00:00:00":
    case "03:00:00:00:00:00":
    case "05:00:00:00:00:00":
    case "07:00:00:00:00:00":
    case "09:00:00:00:00:00":
    case "0b:00:00:00:00:00":
    case "0d:00:00:00:00:00":
    case "0f:00:00:00:00:00":
      return false;
      break;
    default:
      return true;
      break;
  }
}