'use strict';

/* Controllers */

angular.module('myApp.controllers', []);

angular.module('myApp.controllers')
    .controller('productsController', function ($scope, $state, productsService, toastr) {
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
            return selectedCategory == null || product.category == selectedCategory;
        };

        $scope.delete = function (_id, index) {
            productsService.deleteProductById(_id).then(value => {
                toastr.success('Product deleted!!!!');
                $scope.products.splice(index, 1);
            });
        };
    })
    .controller('productController', function ($scope, $state, $stateParams, productsService, toastr) {
        $scope.categoryList = null;
        productsService.getCategoryList().then(function(res){
            $scope.categoryList = res.data;
            console.log($scope.categoryList);
        });

        $scope.product = null;
        productsService.getProductByTitle($stateParams.title).then(function(res){
            $scope.product = res.data;
            console.log($scope.product);
        });

        $scope.editProduct = function (product) {
            productsService.editProduct(product).then(function () {
                toastr.info('Product edited');
                $state.go('admin.products');
            });
        }
    })
    .controller('addProductController', function ($scope, $state, productsService, toastr) {
        $scope.categoryList = null;
        productsService.getCategoryList().then(function(res){
            $scope.categoryList = res.data;
        });

        $scope.product = {};
        $scope.submitForm = function (product) {
            productsService.addProduct(product).then(value => {
                toastr.error('Added new product');
                $state.go('admin.products');
            });
        }
    })
    .controller('LoginController', function ($scope, $state, Auth) {
        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.login = function (credentials) {
            Auth.login(credentials);
        };
    });
