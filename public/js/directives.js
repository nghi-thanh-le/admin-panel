'use strict';

/* Directives */


angular.module('myApp.directives', [])
    .directive('jsonExport', function() {
        return {
            restrict: 'E',
            scope: {
                fileName: '@'
            },
            template: '<a ng-href="api/download/{{fileName}}" class="btn btn-default" target="_blank">Export</a>'
        }
    })
    .directive('previewAnchor', function () {
        return {
            restrict: 'E',
            scope: {
                pageName: '@'
            },
            template: '<a ng-href="http://wiredelta.com/#/{{pageName}}/en" class="btn btn-primary" target="_blank">Preview</a>'
        }
    });
