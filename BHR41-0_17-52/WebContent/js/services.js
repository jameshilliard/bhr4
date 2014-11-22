'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('vzui.services', []).
  value('version', '0.1')
  .service('securityTips', ['$dialog', '$timeout', '$route',
    function ($dialog, $timeout,  $route) {

        var dialogDefaults = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            dialogFade: true,
            templateUrl: 'partials/tips.html'
        };

        var dialogDDNSDefaults = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            dialogFade: true,
            templateUrl: 'partials/ddns.html'
        };

        var dialogOptions = {
            closeButtonText: 'Close',
            actionButtonText: 'OK',
            headerText: 'Proceed?',
            bodyText: 'Perform this action?'
        };
        this.showTips = function (customDialogDefaults, customDialogOptions) {
            if (!customDialogDefaults) customDialogDefaults = {};
            customDialogDefaults.backdropClick = false;
            this.showDialog(customDialogDefaults, customDialogOptions);
        };

        this.showDDNS = function (customDialogDefaults, customDialogOptions) {
          this.showDialog(dialogDDNSDefaults, customDialogOptions);
        };

        this.showDialog = function (customDialogDefaults, customDialogOptions) {

            var tempDialogDefaults = {};
            var tempDialogOptions = {};

            angular.extend(tempDialogDefaults, dialogDefaults, customDialogDefaults);
            angular.extend(tempDialogOptions, dialogOptions, customDialogOptions);

            if (!tempDialogDefaults.controller) {
                tempDialogDefaults.controller = function ($scope, dialog) {
                    $scope.dialogOptions = tempDialogOptions;
                    $scope.dialogOptions.close = function (result) {
                        dialog.close(result);
                    };
                    $scope.dialogOptions.callback = function () {
                        dialog.close();
                        customDialogOptions.callback();
                    };
                }
            }

            var d = $dialog.dialog(tempDialogDefaults);
            d.open();
        };

        this.showMessage = function (title, message, buttons) {
          var defaultButtons = [{result:'ok', label: 'OK', cssClass: 'btn'}];
          var msgBox = new $dialog.dialog({
              dialogFade: true,
              templateUrl: 'partials/basemessage.html',
              //templateUrl: 'partials/tips.html',
              controller: 'MessageBoxController',
              resolve:
                {
                  model: function () {
                    return {
                      title: title,
                      message: message,
                      buttons: buttons == null ? defaultButtons : buttons
                    };
                  }
                }
            });
            return msgBox.open();
        };

        this.showWEPMessage = function (title, message, buttons) {
          var defaultButtons = [{result:'ok', label: 'Confirm', cssClass: 'btn'},{result:'cancel', label: 'Cancel', cssClass: 'btn'}];

          var msgBox = new $dialog.dialog({
              dialogFade: true,
              backdropClick: false,
              templateUrl: 'partials/basemessage1.html',
              //templateUrl: 'partials/tips.html',
              controller: 'MessageBoxController',
              resolve:
                {
                  model: function () {
                    return {
                      title: title,
                      message: message,
                      buttons: buttons == null ? defaultButtons : buttons
                    };
                  }
                }
            });
            return msgBox.open();
        };

        this.showCustomMessage = function (title, message, buttons) {
          var defaultButtons = [{result:'ok', label: 'Confirm', cssClass: 'btn'},{result:'cancel', label: 'Cancel', cssClass: 'btn'}];

          var msgBox = new $dialog.dialog({
              dialogFade: true,
              backdropClick: false,
              templateUrl: 'partials/popmessage.html',
              //templateUrl: 'partials/tips.html',
              controller: 'MessageBoxController',
              resolve:
                {
                  model: function () {
                    return {
                      title: title,
                      message: message,
                      buttons: buttons == null ? defaultButtons : buttons
                    };
                  }
                }
            });
            return msgBox.open();
        };

        this.showCustomMessage1 = function (title, message, buttons) {
          var defaultButtons = [{result:'ok', label: 'OK', cssClass: 'btn'},{result:'cancel', label: 'Cancel', cssClass: 'btn'}];

          var msgBox = new $dialog.dialog({
              dialogFade: true,
              backdropClick: false,
              templateUrl: 'partials/popmessage.html',
              //templateUrl: 'partials/tips.html',
              controller: 'MessageBoxController',
              resolve:
                {
                  model: function () {
                    return {
                      title: title,
                      message: message,
                      buttons: buttons == null ? defaultButtons : buttons
                    };
                  }
                }
            });
            return msgBox.open();
        };

        this.showCustomMessage2 = function (title, message, buttons) {
          var defaultButtons = [{result:'cancel', label: 'Cancel', cssClass: 'btn'}];

          var msgBox = new $dialog.dialog({
              dialogFade: true,
              backdropClick: false,
              templateUrl: 'partials/popmessage.html',
              //templateUrl: 'partials/tips.html',
              controller: 'MessageBoxController',
              resolve:
                {
                  model: function () {
                    return {
                      title: title,
                      message: message,
                      buttons: buttons == null ? defaultButtons : buttons
                    };
                  }
                }
            });
            return msgBox.open();
        };

        this.showCustomMessage3 = function (title, message, buttons) {
          var defaultButtons = [{result:'ok', label: 'OK', cssClass: 'btn'}];

          var msgBox = new $dialog.dialog({
              dialogFade: true,
              backdropClick: false,
              templateUrl: 'partials/popmessage.html',
              //templateUrl: 'partials/tips.html',
              controller: 'MessageBoxController',
              resolve:
                {
                  model: function () {
                    return {
                      title: title,
                      message: message,
                      buttons: buttons == null ? defaultButtons : buttons
                    };
                  }
                }
            });
            return msgBox.open();
        };

        this.showSaving = function (title, message, timer) {
           var msgBox = new $dialog.dialog({
              dialogFade: true,
              backdropClick: false,
              templateUrl: 'partials/basemessage.html',
              controller: 'MessageBoxController',
              resolve:
                {
                model: function () {
                  return {
                    title: title,
                    message: message
                  };
                }
              }
            });
            msgBox.open();
            $timeout(function(){
               msgBox.close();
               $route.reload();
            }, timer);
            return;
        };

        this.showSaving1 = function (title, message) {
           var msgBox = new $dialog.dialog({
              dialogFade: true,
              backdropClick: false,
              templateUrl: 'partials/basemessage.html',
              controller: 'MessageBoxController',
              resolve:
                {
                model: function () {
                  return {
                    title: title,
                    message: message
                  };
                }
              }
            });
            msgBox.open();
            return msgBox;
        };
        
       this.showWarningMsgBeforeSaving = function (title, message, btnLabel) {
            var custBtnLabel = 'OK';
            if(!btnLabel.isEmpty && !angular.isArray(btnLabel))
                custBtnLabel = btnLabel;
            var defaultButtons = [{result:'ok', label: custBtnLabel , cssClass: 'btn'},{result:'cancel', label: 'Cancel', cssClass: 'btn'}];
            var msgBox = new $dialog.dialog({
                dialogFade: true,
                backdropClick: false,
                templateUrl: 'partials/basemessagewarning.html',
                controller: 'MessageBoxController',
                resolve:
                {
                    model: function () {
                        return {
                            title: title,
                            message: message,
                            buttons: defaultButtons
                        };
                    }
                }
            });
            return msgBox.open();
        };

        this.showDmzSaving = function (title, message) {
          var defaultButtons = [{result:'cancel', label: 'Cancel', cssClass: 'btn'},{result:'ok', label: 'Enable DMZ Host', cssClass: 'btn'}];
          var msgBox = new $dialog.dialog({
             dialogFade: true,
             backdropClick: false,
             templateUrl: 'partials/basemessage2.html',
             controller: 'MessageBoxController',
             resolve:
               {
               model: function () {
                 return {
                   title: title,
                   message: message,
                   buttons: defaultButtons
                 };
               }
             }
           });
           return msgBox.open();
        };
    }]);
