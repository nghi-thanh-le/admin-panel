'use strict';
// Declare app level module which depends on filters, and services
angular.module('myApp', [
        'ui.router',
        'ngAnimate',
        'ngSanitize',
        'angular-jwt',
        'angular-storage',
        'ngFileUpload',
        'toastr',
        'ui.bootstrap',
        'myApp.controllers',
        'myApp.services',
        'myApp.filters'
    ]).config(function($stateProvider, $urlRouterProvider, $locationProvider, jwtInterceptorProvider, $httpProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        $urlRouterProvider.otherwise('/login');

        jwtInterceptorProvider.tokenGetter = function(config, store, jwtHelper) {
            // it will send Authorization: Bearer {jwt}
            return store.get('jwt');
        }

        $httpProvider.interceptors.push('jwtInterceptor');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'partials/login.html',
                controller: 'LoginController'
            })
            .state('admin', {
                abstract: true,
                url: '/admin',
                templateUrl: 'partials/admin/admin.html',
                data: {
                    requiresLogin: true
                }
            })
            .state('admin.products', {
                url: '/products',
                templateUrl: 'partials/admin/products.html',
                controller: 'productsController'
            })
            .state('admin.product', {
                url: '/product/:title',
                templateUrl: 'partials/admin/product.html',
                controller: 'productController'
            })
            .state('admin.addProduct', {
                url: '/addProduct',
                templateUrl: 'partials/admin/addProduct.html',
                controller: 'addProductController'
            });
    })
    .run(function($rootScope, $state, store, jwtHelper) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            if (toState.data && toState.data.requiresLogin) {
                if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
                    event.preventDefault();
                    $state.go('login');
                }
            }
        });
    });
