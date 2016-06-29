'use strict';

angular.module('myApp.services')
    .service('productsService', function($http, Upload) {
        var popularities = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        return {
            getProducts: function() {
                return $http({
                    url: '/api/products',
                    method: 'GET'
                });
            },
            getCategoryList: function() {
                return $http({
                    url: '/api/categories',
                    method: 'GET'
                });
            },
            getProductByTitle: function(title) {
                return $http({
                    url: '/api/product/' + title,
                    method: 'GET'
                });
            },
            getPopularities: function() {
                return popularities;
            },
            addProduct: function(product) {
                return Upload.upload({
                    url: '/api/product/add',
                    method: 'POST',
                    data: {
                        title: product.title,
                        framework: product.framework,
                        category: product.category.name,
                        withDomainUrl: product.withDomainUrl,
                        withoutDomainUrl: product.withoutDomainUrl,
                        previewUrl: product.previewUrl,
                        popularity: product.popularity,
                        file: product.imgUrl
                    }
                });
            },
            editProduct: function(product, oldTitle) {
                var data = {
                    title: product.title,
                    framework: product.framework,
                    category: product.category.name,
                    dateAdded: product.dateAdded.toISOString(),
                    withDomainUrl: product.buyDomainUrl.withDomainUrl,
                    withoutDomainUrl: product.buyDomainUrl.withoutDomainUrl,
                    previewUrl: product.previewUrl,
                    popularity: product.popularity,
                    file: product.imgUrl
                };
                if(angular.isDefined(oldTitle)) {
                    data.oldTitle = oldTitle;
                }
                return Upload.upload({
                    url: '/api/product/editWithObject',
                    method: 'POST',
                    data: data
                });
            },
            editProductV2: function (product, oldTitle) {
                var data = {
                    title: product.title,
                    framework: product.framework,
                    category: product.category.name,
                    dateAdded: product.dateAdded.toISOString(),
                    withDomainUrl: product.buyDomainUrl.withDomainUrl,
                    withoutDomainUrl: product.buyDomainUrl.withoutDomainUrl,
                    previewUrl: product.previewUrl,
                    popularity: product.popularity,
                    imgUrl: product.imgUrl
                };
                if(angular.isDefined(oldTitle)) {
                    data.oldTitle = oldTitle;
                }
                return $http.post('/api/product/editWithString', data);
            },
            deleteProductByTitle: function(title) {
                return $http.post('/api/product/delete',{
                    title: title
                });
            }
        };
    });
