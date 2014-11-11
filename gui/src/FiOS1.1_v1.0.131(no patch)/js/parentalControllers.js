'use strict';

angular.module('parental.controllers', [])
  .controller('ParentalAddCtrl', ['$scope', '$route', '$routeParams', '$location', 'Parental', 'Devices','SystemSettings','GuestDevices',
    function($scope, $route, $routeParams, $location, Parental, Devices, SystemSettings,GuestDevices) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.showErrorPage = false;
      //Scheduling
      $scope.days = [false,false,false,false,false,false,false];
      $scope.activeType = 0;
      $scope.startHour = 1;
      $scope.startMinute = 0;
      $scope.startTime = 0;
      $scope.endHour = 1;
      $scope.endMinute = 0;
      $scope.endTime = 0;
      //Scheduling end
      $scope.selectedAvailable = [];
      $scope.selectedUsed = [];
      $scope.availableDevices = [];
      $scope.usedDevices = [];
      $scope.embeddedKeyword = "";
      $scope.website = "";
      $scope.blocks = [];
      $scope.blockedItems = [];

      $scope.pageToShow = 0;
      $scope.hasParentalRules = false;

      $scope.sysSettings = SystemSettings.get();
      $scope.togglePage = function(num) {
        $scope.pageToShow = num;
        window.scrollTo(0,0);
      };

      $scope.changeDisplayNum = function(num){
        if(String(num).length > 1){
          return num;
        }
        return "0" + num;
      };

      var name1 = "Block_Selected";
      var desc1 = "Block only websites with any of the listed words in their URLs.";
      var name2 = "Allow_Only_Selected";
      var desc2 = "Allow only websites with any of the listed words in their URLs.";
      var name3 = "Block_All";
      var desc3 = "Block access to all Internet services and websites.";
      $scope.$watch('parentalControl.accessType', function() {
    	$scope.checkAccessValue();
      });
      $scope.checkAccessValue = function(){
        if($scope.parentalControl.name == name1 || $scope.parentalControl.name == name2 || $scope.parentalControl.name == name3){
          if($scope.parentalControl.accessType == 0){
            $scope.parentalControl.name = name1;
          }else if($scope.parentalControl.accessType == 1){
            $scope.parentalControl.name = name2;
          }else if($scope.parentalControl.accessType == 2){
            $scope.parentalControl.name = name3;
          }
      	}
        if($scope.parentalControl.description == desc1 || $scope.parentalControl.description == desc2 || $scope.parentalControl.description == desc3){
          if($scope.parentalControl.accessType == 0){
            $scope.parentalControl.description = desc1;
          }else if($scope.parentalControl.accessType == 1){
            $scope.parentalControl.description = desc2;
          }else if($scope.parentalControl.accessType == 2){
            $scope.parentalControl.description = desc3;
          }
        }
      };
      $scope.parentalControl = {
        name: name1,
        enabled:true,
        description: desc1,
        schedule: {
          name: "",
          activeDuring: true,
          timeSegments:[
          {
            daysOfTheWeek: [],
            hourRanges:[{startTimeHour: 0, startTimeMinute: 0, endTimeHour: 0, endTimeMinute: 0}]
          }
          ]
        },
        accessType: 0,
        restrictions: [],
        hosts: [],
        status: true
      }

      var guestDevices = [];
      var devices = [];
      var controls = Parental.query(function() {
        devices = Devices.query(function() {
          for(var k = 0; k < devices.length; k++) {
            if(devices[k].connectionType != 6){
              var devFound = false;
              for(var j = 0; j < controls.length; j++) {
                var control = controls[j];
                for(var i = 0; i < control.hosts.length; i++) {
                  if(control.hosts[i] == devices[k].mac) {
                    devFound = true;
                    break;
                  }
                }
              }
              if(!devFound && !(devices[k].isStb))
                $scope.availableDevices.push(devices[k].name);
            }
          }
          for(var k = 0; k < devices.length; k++) {
            if(devices[k].connectionType == 6 && devices[k].approved){
              var devFound = false;
              for(var j = 0; j < controls.length; j++) {
                var control = controls[j];
                for(var i = 0; i < control.hosts.length; i++) {
                  if(control.hosts[i] == devices[k].mac) {
                    devFound = true;
                    break;
                  }
                }
              }
              if(!devFound && !(devices[k].isStb))
                $scope.availableDevices.push(devices[k].name);
            }
          }
          if($routeParams.id !== undefined) {
            if(controls.length > $routeParams.id) {
              var control = controls[$routeParams.id];
              $scope.parentalControl.accessType = control.accessType;
              $scope.parentalControl.name = control.name;
              $scope.parentalControl.description = control.description;
              $scope.parentalControl.schedule.activeDuring = control.schedule.activeDuring;
              for(var i = 0; i < control.schedule.timeSegments[0].daysOfTheWeek.length; i++)
                $scope.days[control.schedule.timeSegments[0].daysOfTheWeek[i]] = true;
              var sh = control.schedule.timeSegments[0].hourRanges[0].startTimeHour;
              var sm = control.schedule.timeSegments[0].hourRanges[0].startTimeMinute;
              var eh = control.schedule.timeSegments[0].hourRanges[0].endTimeHour;
              var em = control.schedule.timeSegments[0].hourRanges[0].endTimeMinute;
              $scope.startHour = sh == 0 ? 12 : (sh > 12 ? sh - 12: sh);
              if(String($scope.startHour).length > 1){
                $scope.startHour = $scope.startHour;
              }else{
                $scope.startHour = "0" + $scope.startHour;
              }
              $scope.startTime = sh >= 12 ? 1 : 0;
              $scope.startMinute = sm == 45 ? 3 : (sm == 30 ? 2 : (sm == 15 ? 1 : 0));
              $scope.endHour = eh == 0 ? 12 : (eh > 12 ? eh - 12: eh);
              if(String($scope.endHour).length > 1){
                $scope.endHour = $scope.endHour;
              }else{
                $scope.endHour = "0" + $scope.endHour;
              }
              $scope.endTime = eh >= 12 ? 1 : 0;
              $scope.endMinute = em == 45 ? 3 : (em == 30 ? 2 : (em == 15 ? 1 : 0));
              for(var i = 0; i < control.hosts.length; i++) {
                for(var k = 0; k < devices.length; k++) {
                  if(control.hosts[i] == devices[k].mac) {
                    $scope.usedDevices.push(devices[k].name);
                  }
                }
              }
              $scope.addDevices();
              for(var i = 0; i < control.restrictions.length; i++) {
                $scope.parentalControl.restrictions.push(control.restrictions[i]);
                if(control.restrictions[i].type == 0)
                  $scope.blockedItems.push('Website: ' + control.restrictions[i].value);
                else
                  $scope.blockedItems.push('Keyword: ' + control.restrictions[i].value);                  
              }
            }
          }
        });
      });

      $scope.errorPageOk = function() {
        $scope.showErrorPage = false;
        window.scrollTo(0,0);
      }

      $scope.addDevices = function() {
        for(var item = 0; item < $scope.selectedAvailable.length; item++) {
          for(var i = 0; i < $scope.availableDevices.length; i++) {
            if($scope.selectedAvailable[item] == $scope.availableDevices[i]){
              $scope.availableDevices.splice(i,1);
              $scope.usedDevices.push($scope.selectedAvailable[item]);
              break;
            }
          }
        }
        $scope.selectedAvailable = [];
      };

      $scope.removeDevices = function() {
        for(var item = 0; item < $scope.selectedUsed.length; item++) {
          for(var i = 0; i < $scope.usedDevices.length; i++) {
            if($scope.selectedUsed[item]==$scope.usedDevices[i]) {
              $scope.usedDevices.splice(i,1);
              $scope.availableDevices.push($scope.selectedUsed[item]);
              break;
            }
          }
        }
      }
      $scope.addControls = function() {
        $scope.errorMessages = [];
        $scope.blockedWebsites = [];
        $scope.blockedKeywords = [];
        for(var k=0; k< $scope.blockedItems.length; k++) {
           var blkItem=$scope.blockedItems[k];
           var itemType=blkItem.toString().split(":",1)[0];
           if( itemType.toLowerCase()=="website")
             $scope.blockedWebsites.push(blkItem);
           else
             $scope.blockedKeywords.push(blkItem);
          }
          if($scope.blockedWebsites.length >= 50 && $scope.website !="")
              $scope.errorMessages.push("Blacklist Websites must not exceed 50 entries.");
          else if($scope.blockedKeywords.length >= 50 && $scope.embeddedKeyword !="")
              $scope.errorMessages.push("Blacklist Keywords must not exceed 50 entries.");
          else {
          if($scope.embeddedKeyword != "") {
            if(!/^[0-9A-Z]+$/i.test($scope.embeddedKeyword))
              $scope.errorMessages.push("Keyword cannot contain special characters");
            else {
              var add = true;
              for(var i = 0; i < $scope.parentalControl.restrictions.length; i++) {
                if($scope.parentalControl.restrictions[i].type == 1 && $scope.embeddedKeyword == $scope.parentalControl.restrictions[i].value) {
                  add = false;
                  break;
                }
              }
              if(add) {
                $scope.parentalControl.restrictions.push({type:1, value: $scope.embeddedKeyword})
                $scope.blockedItems.push('Keyword: ' + $scope.embeddedKeyword);
              }
            }
          }
          if($scope.website != "") {
            if(!/^[0-9A-Z\*][0-9A-Z\.\-\*]+[0-9A-Z\*]$/i.test($scope.website))
              $scope.errorMessages.push("Please input website only, not webpage address");
            else {
              var add = true;
              for(var i = 0; i < $scope.parentalControl.restrictions.length; i++) {
                if($scope.parentalControl.restrictions[i].type == 0 && $scope.website == $scope.parentalControl.restrictions[i].value) {
                  add = false;
                  break;
                }
              }
              if(add) {
                $scope.parentalControl.restrictions.push({type:0, value: $scope.website})
                $scope.blockedItems.push('Website: ' + $scope.website);
              }
            }
          }
        }
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
        }
      }
      $scope.removeControls = function() {
        for(var item = 0; item < $scope.blocks.length; item++) {
          for(var i = 0; i < $scope.blockedItems.length; i++) {
            if($scope.blocks[item]==$scope.blockedItems[i]) {
              $scope.blockedItems.splice(i,1);
              $scope.parentalControl.restrictions.splice(i,1);
              break;
            }
          }
        }
      }

      $scope.cfmApplySettings = function(){
        Parental.save($scope.parentalControl, function() {
          $location.path('/parental/summary');
          window.scrollTo(0,0);
        });
      };

      $scope.applySettings = function(){
        $scope.errorMessages = [];
        $scope.checkAccessValue();
        var count = 0;
        if($scope.parentalControl.name == '')
          $scope.errorMessages.push("Policy: Rule name must be specified.");
        angular.forEach(controls, function(control) {
          if(control.name === $scope.parentalControl.name && count != $routeParams.id) {
            $scope.errorMessages.push("Policy: This name is already used by another rule.");
          }
          count ++;
        });
        if(!/^[0-9A-Z\!\-\_\.#']+$/i.test($scope.parentalControl.name) && $scope.parentalControl.name  !== "")
          $scope.errorMessages.push("Policy: Rule name should consist of standard characters only (ASCII 32-126) excluding the special character space and any of :@\"|\\/=+<>()[]{}&%^$*?,;");
        /*Remove UI rule that prevents saving a rule with no devices --TK-05154
        if($scope.usedDevices.length == 0)
          $scope.errorMessages.push("Selected Devices: List cannot be empty.")*/
        if($scope.parentalControl.accessType != 2 && $scope.parentalControl.restrictions.length == 0)
          $scope.errorMessages.push("Filter Websites or Keywords: List cannot be empty.");
        var hasDay = false;
        for(var i = 0; i < $scope.days.length; i++)
          if($scope.days[i])
            hasDay = true;
        if(!hasDay)
          $scope.errorMessages.push("Days of Week: At least one day must be selected.");
        if($scope.errorMessages.length > 0) {
          $scope.showErrorPage = true;
          window.scrollTo(0,0);
          return;
        }
        for(var i = 0; i < $scope.usedDevices.length; i++) {
          for(var k = 0; k < devices.length; k++) {
            if(devices[k].name == $scope.usedDevices[i]) {
              $scope.parentalControl.hosts.push(devices[k].mac);
              break;
            }
          }
        }
        for(var i = 0; i < $scope.days.length; i++)
          if($scope.days[i])
            $scope.parentalControl.schedule.timeSegments[0].daysOfTheWeek.push(i);
        var shour = parseInt($scope.startHour) + ($scope.startTime * 12);
        if(shour % 12 == 0)
          shour -= 12;
        $scope.parentalControl.schedule.timeSegments[0].hourRanges[0].startTimeHour = shour;
        var ehour = parseInt($scope.endHour) + ($scope.endTime * 12);
        if(ehour % 12 == 0)
          ehour -= 12;
        $scope.parentalControl.schedule.timeSegments[0].hourRanges[0].endTimeHour = ehour;
        $scope.parentalControl.schedule.timeSegments[0].hourRanges[0].startTimeMinute = $scope.startMinute * 15;
        $scope.parentalControl.schedule.timeSegments[0].hourRanges[0].endTimeMinute = $scope.endMinute * 15;

        if($routeParams.id !== undefined) {
          Parental.update({id: $routeParams.id}, $scope.parentalControl, function() {
            $location.search({});
            $location.path('/parental/summary');
            window.scrollTo(0,0);
          })
        } else {
          if(!$scope.hasParentalRules){
            if($scope.sysSettings.warnBeforeChanges == true) {
              $scope.togglePage(1);
            }else{
              $scope.cfmApplySettings();
            }
          }else{
            $scope.cfmApplySettings();
          }
        }
      };

      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/parental'){
            $scope.applySettings();
          }
        }
      };
    }])
  .controller('ParentalSummaryCtrl', ['$scope', '$route', '$location', 'Devices', 'Parental','SystemSettings',
    function($scope, $route, $location, Devices, Parental, SystemSettings) {
      $scope.tab = $route.current.tab;
      $scope.section = $route.current.section;
      $scope.viewingRule = -1;
      $scope.pageToShow = 0;
      $scope.selectedIndex = -1;
      $scope.enableRuleList =[];

      $scope.sysSettings = SystemSettings.get();
      $scope.togglePage = function(num) {
        $scope.pageToShow = num;
        window.scrollTo(0,0);
      };
      $scope.refresh = function() {
        $scope.enableRuleList=[];
        $scope.devices = Devices.query(function() {
          $scope.rules = Parental.query(function() {
            for(var i = 0; i < $scope.rules.length; i++) {
              for(var k = 0; k < $scope.rules[i].hosts.length; k++) {
                var host = $scope.rules[i].hosts[k];
                for(var dev = 0; dev < $scope.devices.length; dev++) {
                  if(host == $scope.devices[dev].mac) {
                    $scope.rules[i].hosts[k] = $scope.devices[dev].name;
                    break;
                  }
                }
              }
              $scope.rules[i].selected = $scope.rules[i].hosts[0];
            }
          });
        })
      };

      $scope.togglePage = function(num) {
        $scope.pageToShow = num;
        window.scrollTo(0,0);
      };

      $scope.refresh();

      $scope.editRule = function(ind) {
        $location.path('/parental').search({id: ind});
      };

      $scope.viewRule = function(ind) {
        $scope.viewingRule = ind;
        $scope.selected = $scope.rules[ind];
        $scope.selectedRestrictions = [];
        for(var i = 0; i < $scope.selected.restrictions.length; i++) {
          var res = $scope.selected.restrictions[i];
          switch(res.type) {
            case 0:
              $scope.selectedRestrictions.push('Website:' + res.value);
              break;
            default:
              $scope.selectedRestrictions.push('Keyword:' + res.value);
              break;
          }
        }
        var printArr = [];
        printSchedule(0, [$scope.selected.schedule], printArr);
        $scope.scheduleString = printArr[0][0];//This is pretty awful
      };

      $scope.cfmDeleteControl = function(){
        Parental.remove({id: $scope.selectedIndex}, function() {
          $scope.togglePage(0);
          $scope.refresh();
        });
      }

      $scope.deleteRule = function(ind) {
        $scope.selectedIndex = ind;
        if($scope.sysSettings.warnBeforeChanges == true) {
          $scope.togglePage(1);
        }else{
          $scope.cfmDeleteControl();
        }
      };

      $scope.close = function() {
        $scope.viewingRule = -1;
      };


      $scope.setSelected = function(ind){
        var bFound=false;
        if($scope.rules[ind].enabled)
        {
          $scope.rules[ind].enabled = false;
        }else{
          $scope.rules[ind].enabled = true;
        }
        if(null == $scope.enableRuleList || undefined ==  $scope.enableRuleList || 0 == $scope.enableRuleList.length){
          $scope.enableRuleList.push({id:ind,rule:$scope.getMacHostsRule($scope.rules[ind])});
        }else{
          for(var iCnt=0; iCnt < $scope.enableRuleList.length ; iCnt++)
          {
            if($scope.enableRuleList[iCnt].id == ind)
            {
              $scope.enableRuleList[iCnt].rule = $scope.getMacHostsRule($scope.rules[ind]);
              bFound = true;
              break;
            }
          }
          if(!bFound)
          {
            $scope.enableRuleList.push({id:ind,rule:$scope.getMacHostsRule($scope.rules[ind])});
          }
        }
      };

      $scope.getMacHostsRule = function(rule){
        var modRule= angular.copy(rule);
        var host;
        for(var k = 0; k < modRule.hosts.length; k++) {
          host = modRule.hosts[k];
          for(var dev = 0; dev < $scope.devices.length; dev++) {
            if(host == $scope.devices[dev].name || host == $scope.devices[dev].mac) {
              modRule.hosts[k] = $scope.devices[dev].mac;
              break;
            }
          }
        }
        return modRule;
      };

      $scope.restSelection = function(){
        $scope.refresh();
        $scope.togglePage(0);
      };

      $scope.applySettings = function(){
        if(null!=$scope.enableRuleList && 0 != $scope.enableRuleList.length)
        {
          for(var iCnt=0; iCnt < $scope.enableRuleList.length ; iCnt++)
          {
            Parental.update({id:$scope.enableRuleList[iCnt].id},$scope.enableRuleList[iCnt].rule);
          }
          $scope.refresh();
          $scope.togglePage(0);
        }
      };

      $scope.keyPress = function(keyEvent) {
        if (keyEvent.keyCode == 13){
          if($location.path() == '/parental/summary'){
            $scope.applySettings();
          }
        }
      };

    }]);