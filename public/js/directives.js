'use strict';

/* Directives */


angular.module('myApp.directives', [])
    .directive('myDownload', function($compile) {
        return {
            restrict: 'E',
            scope: {
                getUrlData: '&getData'
            },
            link: function(scope, element, attr) {
                var myURL = window.URL || window.webkitURL;
                var url = myURL.createObjectURL(scope.getUrlData);
                element.append($compile(
                    '<a class="btn btn-default" download="products.json" href="' + url + '">' + Export + '</a>'
                )(scope));
            }
        }
    });
