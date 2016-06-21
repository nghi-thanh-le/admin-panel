'use strict';

angular.module('myApp.services')
    .service('referencesService', function($http, Upload) {
        return {
            getReferences: function() {
                return $http({
                    url: '/api/references',
                    method: 'GET'
                });
            },
            getCategoryList: function() {
                return $http({
                    url: '/api/categories',
                    method: 'GET'
                });
            },
            getReferenceById: function(_id) {
                return $http({
                    url: '/api/reference/' + _id,
                    method: 'GET'
                });
            },
            addReference: function(reference) {
                return Upload.upload({
                    url: '/api/reference/add',
                    method: 'POST',
                    data: {
                        title: reference.title,
                        name: reference.name,
                        file: reference.picture,
                        legend: reference.legend,
                        description: reference.description,
                        technology: reference.technology,
                        framework: reference.framework,
                        link: reference.link,
                        category: reference.category.name
                    }
                });
            },
            editReference: function(reference) {
                return Upload.upload({
                    url: '/api/reference/editWithObject',
                    method: 'POST',
                    data: {
                        _id: reference._id,
                        title: reference.title,
                        name: reference.name,
                        file: reference.picture,
                        legend: reference.legend,
                        description: reference.description,
                        technology: reference.technology,
                        framework: reference.framework,
                        link: reference.link,
                        category: reference.category.name
                    }
                });
            },
            editReferenceV2: function (reference) {
                return $http.post('/api/reference/editWithString', {
                    _id: reference._id,
                    title: reference.title,
                    name: reference.name,
                    file: reference.picture,
                    legend: reference.legend,
                    description: reference.description,
                    technology: reference.technology,
                    framework: reference.framework,
                    link: reference.link,
                    category: reference.category.name
                });
            },
            deleteReferenceById: function(id) {
                return $http.post('/api/reference/delete',{
                    _id: id
                });
            }
        };
    });
