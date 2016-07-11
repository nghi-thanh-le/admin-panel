angular.module('myApp.services')
    .service('dashboardService', function($http) {
        return {
            getDashboard: function() {
                return $http.get('/api/dashboard');
            },
            addToDashboard: function (dashboard) {
                return $http.post('/api/dashboard', {
                    section: dashboard.section,
                    text: dashboard.text
                });
            },
            editDashboard: function (dashboard, old_section) {
                return $http.post('/api/dashboard/edit', {
                    old_section: old_section,
                    section: dashboard.section,
                    text: dashboard.text
                });
            },
            deleteFromDashboard: function (section) {
                return $http.post('/api/dashboard/delete', {
                    section: section
                });
            }
        }
    });
