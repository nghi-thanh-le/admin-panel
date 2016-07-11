angular.module('myApp.controllers')
    .controller('dashboardControllers', function($scope, dashboardService, $uibModal, $state, toastr) {
        $scope.dashboard;

        dashboardService.getDashboard().then(res => {
            $scope.dashboard = res.data;
        }, err => {
            console.log(err);
        });

        $scope.open = function(item) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'editDashboard.html',
                controller: 'ModalInstanceCtrl',
                size: 'md',
                resolve: {
                    itemToModal: function() {
                        return angular.copy(item);
                    }
                }
            });
        };

        $scope.add = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'addToDashboard.html',
                controller: 'addToDashboardCtrl',
                size: 'md'
            });
        }

        $scope.remove = function (section) {
            dashboardService.deleteFromDashboard(section).then(res => {
                $state.go('admin.dashboard', {}, {reload: true}).then(function() {
                    toastr.success(res.data);
                });
            }, err => {
                console.log(err);
            });
        };

        $scope.submitForm = function(section, text) {
            dashboardService.editDashboard(section, text).then(res => {
                $scope.editing = false;
                toastr.success('Editing done!!!');
            }, err => {
                console.log(err);
            });
        }
    })
    .controller('ModalInstanceCtrl', function($scope, $uibModalInstance, itemToModal, dashboardService, $state, toastr) {
        $scope.dashboard = itemToModal;
        var old_section = angular.copy(itemToModal.section);

        $scope.ok = function() {
            dashboardService.editDashboard($scope.dashboard, old_section).then(res => {
                $state.go('admin.dashboard', {}, {reload: true}).then(function() {
                    $uibModalInstance.close();
                    toastr.success(res.data);
                });
            }, err => {
                console.log('errr:::::', err);
            });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    })
    .controller('addToDashboardCtrl', function ($scope, $uibModalInstance, dashboardService, $state, toastr) {
        $scope.dashboard;

        $scope.ok = function() {
            dashboardService.addToDashboard($scope.dashboard).then(res => {
                $state.go('admin.dashboard', {}, {reload: true}).then(function() {
                    $uibModalInstance.close();
                    toastr.success(res.data);
                });
            }, err => {
                console.log('errr:::::', err);
            });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    });
