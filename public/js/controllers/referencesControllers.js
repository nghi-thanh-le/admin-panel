'use strict';

/* Controllers */

angular.module('myApp.controllers')
    .controller('referencesController', function ($scope, $state, $window, referencesService, toastr, $http) {
        var selectedCategory = null; // null at default but will be string later

        $scope.references = null;
        referencesService.getReferences().then(res => {
            $scope.references = res.data;
        });

        $scope.selectCategory = function (newCategory) {
            selectedCategory = newCategory;
        };

        $scope.getCategory = function () {
            return selectedCategory || "All";
        };

        $scope.categoryFilter = function (reference) {
            // if(selectedCategory == null) {
            //     return true;
            // } else {
            //     if(reference.category == selectedCategory) {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // }
            return selectedCategory == null || reference.category.name == selectedCategory;
        };

        $scope.delete = function (title) {
            referencesService.deleteReference(title).then(value => {
                $window.location.reload();
            });
        };
    })
    .controller('referenceController', function ($scope, $state, $stateParams, referencesService, toastr) {
        $scope.categoryList = null;
        var oldTitle = null;
        referencesService.getCategoryList().then(function(res){
            $scope.categoryList = res.data;
        });

        $scope.reference = null;
        referencesService.getReferenceByTitle($stateParams.title).then(function(res){
            $scope.reference = res.data;
            $scope.formInput = angular.copy($scope.reference);
            oldTitle = angular.copy($scope.reference.title);
        });

        $scope.showEditForm = false;

        $scope.toggleForm = function () {
            $scope.showEditForm = !$scope.showEditForm;
        };

        $scope.editReference = function (reference) {
            if(angular.isObject(reference.picture)) {
                referencesService.editReference(reference, oldTitle).then(function (res) {
                    toastr.info('Reference edited');
                    $state.go('admin.references');
                }, function (err) {
                    toastr.err(err);
                });
            } else if(angular.isString(reference.picture)) {
                referencesService.editReferenceV2(reference, oldTitle).then(function (res) {
                    toastr.info('Reference edited');
                    $state.go('admin.references');
                }, function (err) {
                    toastr.err(err);
                });
            }
        };
    })
    .controller('addReferenceController', function ($scope, $state, referencesService, toastr) {
        $scope.categoryList = null;
        referencesService.getCategoryList().then(function(res){
            $scope.categoryList = res.data;
        });

        $scope.submitForm = function (reference) {
            referencesService.addReference(reference).then(value => {
                toastr.success('Added new reference');
                $state.go('admin.references');
            });
        };
    });
