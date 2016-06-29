'use strict';

/* Filters */

angular.module('myApp.filters', []).
    filter('interpolate', ['version', function(version) {
        return function(text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        };
    }])
    .filter('toNumWord', function () {
        return function (input) {
            if(angular.isNumber(input)) {
                switch (input) {
                    case 1:
                        return 'One';
                        break;
                    case 2:
                        return 'Two';
                        break;
                    case 3:
                        return 'Three';
                        break;
                    case 4:
                        return 'Four';
                        break;
                    case 5:
                        return 'Five';
                        break;
                    case 6:
                        return 'Six';
                        break;
                    case 7:
                        return 'Seven';
                        break;
                    case 8:
                        return 'Eight';
                        break;
                    case 9:
                        return 'Nine';
                        break;
                    default:
                        return 'zero';
                }
            } else {
                return input;
            }
        }
    })
    .filter('unique', function () {
        return function (products, propertyName) {
            // products = products.json;
            // propertyName = ["Ecommerce", "Promotional", "Mobile", "Custom"];
            if(angular.isArray(products) && angular.isString(propertyName)){
                // create empty results array
                // it will return a unique array of category (string type), no duplicate value
                var results = [];
                var keys = {};
                // at default:
                // keys.Ecommerce = undefined
                // keys.Promotional = undefined
                // keys.Mobile = undefined
                // keys.Custom = undefined
                // loop through products then set property of keys object to true and add string value
                // to true and push to arr
                angular.forEach(products, function (product, key) {
                    var category = product[propertyName].name; // for example : category = "eco" or "promo"
                    if(angular.isUndefined(keys[category])) { // if keys.eco is undefined
                        keys[category] = true; // then set it to true
                        results.push(category); // then push to results array
                    }
                });
                return results;
            } else {
                return products;
            }
        }
    })
    .filter('toUpperCaseFirstLetter', function () {
        return function (inputString) {
            return inputString[0].toUpperCase() + inputString.substring(1);
        }
    });
