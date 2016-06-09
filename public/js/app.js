'use strict';
// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ui.router',
    'ngAnimate',
    'angular-jwt',
    'LocalStorageModule',
    'ngSanitize',
    'ngFileUpload',
    'toastr',
    'ui.bootstrap',
    'myApp.controllers',
    'myApp.services',
    'myApp.filters'
]).config(function($stateProvider, $urlRouterProvider, $locationProvider, AccessLevels) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    //$urlRouterProvider.otherwise('/login');

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'partials/login.html'
        })
        .state('admin', {
            abstract: true,
            url: '/admin',
            templateUrl: 'partials/admin/admin.html'
        })
        .state('admin.login', {
            url: '/login',
            templateUrl: 'partials/admin/login.html',
            controller: 'LoginController'
        })
        .state('admin.products', {
            url: '/products',
            templateUrl: 'partials/admin/products.html',
            controller: 'productsController'
            // data: {
            //     access: AccessLevels.admin
            // }
        })
        .state('admin.product', {
            url: '/product/:title',
            templateUrl: 'partials/admin/product.html',
            controller: 'productController'
        })
        .state('admin.editProduct', {
            url: '/editProduct/:title',
            templateUrl: 'partials/admin/editProduct.html',
            controller: 'productController'
        })
        .state('admin.addProduct', {
            url: '/addProduct',
            templateUrl: 'partials/admin/addProduct.html',
            controller: 'addProductController'
        });
    })
    .run(function($rootScope, $state, Auth) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            // if (!Auth.authorize(toState.data.access)) {
            //     event.preventDefault();
            //     $state.go('admin.login');
            // }

            // console.log('toState::::', toState);
            // console.log('toParams::::', toParams);
        });
    });
