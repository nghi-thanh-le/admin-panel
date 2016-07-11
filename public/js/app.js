'use strict';
// Declare app level module which depends on filters, and services
angular.module('myApp', [
        'ui.router',
        'ngAnimate',
        'ngSanitize',
        'angular-jwt',
        'ngFileUpload',
        'toastr',
        'ui.bootstrap',
        'myApp.controllers',
        'myApp.services',
        'myApp.filters',
        'myApp.directives'
    ]).config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, jwtInterceptorProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        $urlRouterProvider.otherwise('/login');

        jwtInterceptorProvider.tokenGetter = function($window, $state, jwtHelper) {
            // it will send Authorization: Bearer {jwt}
            if (window.localStorage.getItem('jwt') && jwtHelper.isTokenExpired(window.localStorage.getItem('jwt'))) {
                window.localStorage.removeItem('jwt');
                $state.go('login');
            } else {
                return $window.localStorage.getItem('jwt');
            }
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
                },
                controller: function($scope, $state, $window) {
                    $scope.logout = function() {
                        $window.localStorage.removeItem('jwt');
                        $state.go('login');
                    }
                }
            })
            .state('admin.dashboard', {
                url: '/dashboard',
                templateUrl: 'partials/admin/main.html',
                controller: 'dashboardControllers'
            })
            .state('admin.products', {
                url: '/products',
                templateUrl: 'partials/admin/products/products.html',
                controller: 'productsController'
            })
            .state('admin.product', {
                url: '/product/:_id',
                templateUrl: 'partials/admin/products/product.html',
                controller: 'productController'
            })
            .state('admin.addProduct', {
                url: '/addProduct',
                templateUrl: 'partials/admin/products/addProduct.html',
                controller: 'addProductController'
            })
            .state('admin.references', {
                url: '/references',
                templateUrl: 'partials/admin/references/references.html',
                controller: 'referencesController'
            })
            .state('admin.reference', {
                url: '/reference/:title',
                templateUrl: 'partials/admin/references/reference.html',
                controller: 'referenceController'
            })
            .state('admin.addReference', {
                url: '/addReference',
                templateUrl: 'partials/admin/references/addReference.html',
                controller: 'addReferenceController'
            })
            .state('admin.jobs', {
                url: '/jobs',
                templateUrl: 'partials/admin/jobs/jobs.html',
                controller: 'jobsControllers'
            })
            .state('admin.job', {
                url: '/job/:section_id/:jsonfile',
                templateUrl: 'partials/admin/jobs/job.html',
                controller: 'jobController'
            })
            .state('admin.addJob', {
                url: '/job/add',
                templateUrl: 'partials/admin/jobs/addJob.html',
                controller: 'addJobController'
            });
    })
    .run(function($rootScope, $state, $window, jwtHelper) {
        var localStorage = $window.localStorage;
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            if (toState.data && toState.data.requiresLogin) {
                if (!localStorage.getItem('jwt') || jwtHelper.isTokenExpired(localStorage.getItem('jwt')) || !jwtHelper.decodeToken(localStorage.getItem('jwt'))) {
                    event.preventDefault();
                    if (localStorage.getItem('jwt')) {
                        localStorage.removeItem('jwt');
                    }
                    $state.go('login');
                }
            }
        });
    });
