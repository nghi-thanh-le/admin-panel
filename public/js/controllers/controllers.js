'use strict';

/* Controllers */

angular.module('myApp.controllers', []);

angular.module('myApp.controllers')
    .controller('LoginController', function($scope, $state, Auth, $window) {
        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.login = function(credentials) {
            Auth.login(credentials).then(res => {
                $window.localStorage.setItem('jwt', res.data);
                $state.go('admin.dashboard');
            });
        };
    });
