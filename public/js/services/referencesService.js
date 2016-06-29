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
            getReferenceByTitle: function(title) {
                return $http({
                    url: '/api/reference/' + title,
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
            editReference: function(reference, oldTitle) {
                var data = {
                    title: reference.title,
                    name: reference.name,
                    file: reference.picture,
                    legend: reference.legend,
                    description: reference.description,
                    technology: reference.technology,
                    framework: reference.framework,
                    link: reference.link,
                    category: reference.category.name
                };
                if(angular.isDefined(oldTitle)) {
                    data.oldTitle = oldTitle;
                }
                return Upload.upload({
                    url: '/api/reference/editWithObject',
                    method: 'POST',
                    data: data
                });
            },
            editReferenceV2: function (reference, oldTitle) {
                var data = {
                    title: reference.title,
                    name: reference.name,
                    picture: reference.picture,
                    legend: reference.legend,
                    description: reference.description,
                    technology: reference.technology,
                    framework: reference.framework,
                    link: reference.link,
                    category: reference.category.name
                }
                if(angular.isDefined(oldTitle)) {
                    data.oldTitle = oldTitle;
                }
                return $http.post('/api/reference/editWithString', data);
            },
            deleteReference: function(title) {
                return $http.post('/api/reference/delete',{
                    title: title
                });
            }
        };
    });
