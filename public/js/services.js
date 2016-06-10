'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []);

angular.module('myApp.services')
    .constant('AccessLevels', {
        anon: 0,
        admin: 1
    })
    .service('productsService', function ($http, Upload) {
        var popularities = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        return {
            getProducts: function () {
                return $http.get('/api/products');
            },
            getCategoryList: function () {
                return $http.get('/api/categoryList');
            },
            getProductByTitle: function (title) {
                return $http.get('/api/product/' + title);
            },
            getPopularities: function () {
                return popularities;
            },
            addProduct: function (product) {
                return Upload.upload({
                    url: '/api/addProduct',
                    method: 'POST',
                    data: {
                        title: product.title,
                        framework: product.framework,
                        category: product.category.name,
                        withDomainUrl: product.withDomainUrl,
                        withoutDomainUrl: product.withoutDomainUrl,
                        previewUrl: product.previewUrl,
                        popularity: product.popularity
                    },
                    file: product.imgUrl
                });
            },
            editProduct: function (product) {
                return Upload.upload({
                    url: '/api/editProduct',
                    method: 'POST',
                    data: {
                        _id: product._id,
                        title: product.title,
                        framework: product.framework,
                        category: product.category.name,
                        dateAdded: product.dateAdded.toISOString(),
                        withDomainUrl: product.buyDomainUrl.withDomainUrl,
                        withoutDomainUrl: product.buyDomainUrl.withoutDomainUrl,
                        previewUrl: product.previewUrl,
                        popularity: product.popularity
                    },
                    file: product.imgUrl
                });
            },
            deleteProductById: function (_id) {
                return $http.get('/api/delete/' + _id);
            }
        };
    })
    .service('Auth', function ($http, AccessLevels, $state, localStorageService, jwtHelper) {
        this.authorize = function (access) {
            if(access === AccessLevels.admin) {
                return this.isAuthenticated();
            } else {
                return true;
            }
        };

        this.isAuthenticated = function () {
            return localStorageService.get('auth_token');
        };

        this.login = function (credentials) {
            $http.post('/api/login', credentials).then(function (res) {
                // api return token
                localStorageService.set('auth_token', res.data);
                $state.go('admin.pageContent');
            });
        };

        this.logout = function () {
            // The backend doesn't care about logouts, delete the token and you're good to go.
            delete localStorageService.remove('auth_token');
        };

        this.register = function (formData) {
                delete localStorageService.remove('auth_token');
            var register = $http.post('/api/createUser', formData);
            register.then(function (res) {
                localStorageService.set('auth_token', res.data);
            });
            return register;
        };
});
