'use strict';

/* Controllers */

angular.module('myApp.controllers', []);

angular.module('myApp.controllers')
    .controller('productsController', function ($scope, $state, $window, productsService, toastr) {
        var selectedCategory = null; // null at default but will be string later

        $scope.products = null;
        productsService.getProducts().then(function(res){
            $scope.products = res.data;
        });

        $scope.selectCategory = function (newCategory) {
            selectedCategory = newCategory;
        };

        $scope.getCategory = function () {
            return selectedCategory || "All";
        }

        $scope.categoryFilter = function (product) {
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

        $scope.delete = function (_id, index) {
            productsService.deleteProductById(_id).then(value => {
                $window.location.reload();
            });
        };
    })
    .controller('productController', function ($scope, $state, $stateParams, productsService, toastr) {
        $scope.popularities = productsService.getPopularities();

        $scope.categoryList = null;
        productsService.getCategoryList().then(function(res){
            $scope.categoryList = res.data;
        });

        $scope.product = null;
        productsService.getProductByTitle($stateParams.title).then(function(res){
            $scope.product = res.data;
            $scope.formInput = angular.copy($scope.product);
            $scope.formInput.dateAdded = new Date($scope.product.dateAdded);
        });

        $scope.showEditForm = false;

        $scope.toggleForm = function () {
            $scope.showEditForm = !$scope.showEditForm;
        }

        $scope.editProduct = function (product) {
            if(angular.isObject(product.imgUrl)) {
                productsService.editProduct(product).then(function (res) {
                    toastr.info('Product edited');
                    $state.go('admin.products');
                }, function (err) {
                    console.log('err::::::::', err);
                });
            } else if(angular.isString(product.imgUrl)) {
                productsService.editProductV2(product).then(function (res) {
                    toastr.info('Product edited');
                    $state.go('admin.products');
                }, function (err) {
                    toastr.err(err);
                })
            }
        }
    })
    .controller('addProductController', function ($scope, $state, productsService, toastr) {
        $scope.categoryList = null;
        productsService.getCategoryList().then(function(res){
            $scope.categoryList = res.data;
        });

        $scope.product = {
            popularity: 0
        };

        $scope.popularities = productsService.getPopularities();

        $scope.submitForm = function (product) {
            productsService.addProduct(product).then(value => {
                toastr.error('Added new product');
                $state.go('admin.products');
            });
        }
    })
    .controller('LoginController', function ($scope, $state, Auth, $window) {
        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.login = function (credentials) {
            Auth.login(credentials).then(res => {
                $window.localStorage.setItem('jwt', res.data);
                $state.go('admin.products');
            });
        };
    });
