'use strict';

/* Controllers */

angular.module('myApp.controllers')
    .controller('productsController', function($scope, $state, $window, productsService, toastr, $http) {
        $scope.applyChange = false;
        var selectedCategory = null; // null at default but will be string later

        $scope.products = null;
        productsService.getProducts().then(function(res) {
            $scope.products = res.data;
        });

        $scope.selectCategory = function(newCategory) {
            selectedCategory = newCategory;
        };

        $scope.getCategory = function() {
            return selectedCategory || "All";
        }

        $scope.categoryFilter = function(product) {
            // if(selectedCategory == null) {
            //     return true;
            // } else {
            //     if(product.category == selectedCategory) {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // }
            return selectedCategory == null || product.category.name == selectedCategory;
        };
        $scope.changeVisible = function(_id, isVisible){
            $http.post('api/product/changeVisible', {
                _id: _id,
                isVisible: isVisible
            }).then(res => {
                toastr.success(res.data);
            }, err => {
                console.log(err);
            })
        }
        $scope.delete = function(_id) {
            productsService.deleteProduct(_id).then(value => {
                $window.location.reload();
            });
        };
    })
    .controller('productController', function($scope, $state, $stateParams, productsService, toastr, $window) {
        $scope.previewImg = false;
        $scope.$watch('formInput.imgUrl', function(newValue, oldValue) {
            if (angular.isObject(newValue)) {
                $scope.previewImg = true;
            } else {
                $scope.previewImg = false;
            }
        });

        $scope.popularities = productsService.getPopularities();
        var oldTitle = null;

        $scope.categoryList = null;
        productsService.getCategoryList().then(function(res) {
            $scope.categoryList = res.data;
        });

        $scope.product = null;
        productsService.getProductById($stateParams._id).then(function(res) {
            $scope.product = res.data;
            $scope.formInput = angular.copy($scope.product);
            $scope.formInput.dateAdded = new Date($scope.product.dateAdded);
        });

        $scope.showEditForm = false;

        $scope.toggleForm = function() {
            $scope.showEditForm = !$scope.showEditForm;
        }

        $scope.editProduct = function(product) {
            if (angular.isObject(product.imgUrl)) {
                productsService.editProduct(product).then(function(res) {
                    $window.location.reload();
                }, function(err) {
                    if (angular.isString(err.data)) {
                        toastr.error(err.data);
                    }
                });
            } else if (angular.isString(product.imgUrl)) {
                productsService.editProductV2(product).then(function(res) {
                    $window.location.reload();
                }, function(err) {
                    toastr.error(err);
                });
            }
        }
    })
    .controller('addProductController', function($scope, $state, productsService, toastr) {
        $scope.categoryList = null;
        productsService.getCategoryList().then(function(res) {
            $scope.categoryList = res.data;
        });

        $scope.product = {
            popularity: 0
        };

        $scope.popularities = productsService.getPopularities();

        $scope.submitForm = function(product) {
            productsService.addProduct(product).then(value => {
                toastr.success('Added new product');
                $window.location.reload();
            });
        }
    });
