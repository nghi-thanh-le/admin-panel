'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []);

angular.module('myApp.services')
    .service('Auth', function($http, $window) {
        this.login = function (credentials) {
            return $http.post('api/login', credentials);
        };

        this.logout = function () {
            $window.localStorage.removeItem('jwt');
        };
    });
