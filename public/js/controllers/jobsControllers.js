angular.module('myApp.controllers')
    .controller('jobsControllers', function($scope, jobsService, $uibModal, $http, toastr, $window) {
        $scope.applyChange = false;
        $scope.isCollapsed = true;

        $scope.jobs;
        jobsService.getJobs().then(res => {
            $scope.jobs = res.data;
        });

        $scope.delete = function(section_id, jsonfile) {
            jobsService.deleteJob(section_id, jsonfile).then(value => {
                $window.location.reload();
            }, function(err) {
                console.log('err:::::', err);
            });
        };

        $scope.deleteJobGroup = function(section_id) {
            $http.post('api/job/deleteJobGroup', {
                section_id: section_id
            }).then(value => {
                $window.location.reload();
            }, err => {
                var errMessage = err.data;
                toastr.error(errMessage);
            });
        };

        $scope.addNewJobGroup = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'addNewJobGroup.html',
                size: 'md',
                controller: 'addNewJobGroupCtrl'
            });
        }

        $scope.editJobGroup = function(section_id, section_name) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'editJobGroup.html',
                size: 'md',
                controller: 'editJobGroupCtrl',
                resolve: {
                    old_section: function() {
                        return {
                            section_id: section_id,
                            section_name: section_name
                        };
                    }
                }
            });
        };

        // i have no idea why i wrote this code .....
        // i hate that i can't optimize everything
        // the next guy, you will see a lot of DRY (Don't Repeat Yourself)
        // that's annoying right?????
        $scope.$watch('jobs', function(newValue, oldValue) {
            // to handling the case right after getting all data
            if (!angular.isDefined(oldValue) && !angular.isDefined(newValue)) {
                $scope.applyChange = false;
            } else if (!angular.isDefined(oldValue) && angular.isDefined(newValue)) {
                $scope.applyChange = false;
            } else {
                $scope.applyChange = true;
            }
        }, true);

        $scope.changeVisible = function() {
            var arr = [];
            angular.forEach($scope.jobs, function(arrObjs) {
                var obj = {
                    section_id: arrObjs.section_id,
                    isVisible: arrObjs.isVisible,
                    data: []
                }
                angular.forEach(arrObjs.data, function(something) {
                    obj.data.push({
                        jsonfile: something.jsonfile,
                        isVisible: something.isVisible
                    });
                });
                arr.push(obj);
            });
            $http.post('api/job/changeVisible', {
                arrVisible: arr
            }).then(res => {
                toastr.success(res.data);
                $scope.applyChange = false;
            }, err => {
                console.log(err);
            });
        }
    })
    .controller('jobController', function($scope, $state, $stateParams, jobsService, toastr) {
        $scope.previewImg = false;
        $scope.$watch('formInput.person_img', function(newValue, oldValue) {
            if (angular.isObject(newValue)) {
                $scope.previewImg = true;
            } else {
                $scope.previewImg = false;
            }
        });

        $scope.job = null;

        $scope.jobsGroup;
        jobsService.getJobsGroup().then(res => {
            $scope.jobsGroup = res.data;
        });

        jobsService.getJob($stateParams.section_id, $stateParams.jsonfile).then(function(res) {
            $scope.job = res.data;
            $scope.formInput = angular.copy($scope.job);
            $scope.formInput.old_section_id = $scope.job.group.toLowerCase();
        });

        $scope.showEditForm = false;
        $scope.toggleForm = function() {
            $scope.showEditForm = !$scope.showEditForm;
        };

        $scope.addNew = function(type) {
            if (type == 1) {
                $scope.formInput.questAndAns.push({
                    question: '',
                    answer: ''
                });
            } else if (type == 2) {
                $scope.formInput.practical_details.push("");
            }
        };
        $scope.remove = function(index, type) {
            if (type == 1) {
                $scope.formInput.questAndAns.splice(index, 1);
            } else if (type == 2) {
                $scope.formInput.practical_details.splice(index, 1);
            }
        };

        $scope.editJob = function(job) {
            angular.forEach(job.questAndAns, function(questAndAns) {
                delete questAndAns['$$hashKey'];
            });
            if (angular.isObject(job.person_img)) {
                jobsService.editWithImg(job).then(function(res) {
                    toastr.info('Job edited');
                    $state.go('admin.jobs');
                }, function(err) {
                    console.log('err::::::::', err);
                });
            } else if (angular.isString(job.person_img)) {
                jobsService.editWithoutImg(job).then(function(res) {
                    toastr.info('Job edited');
                    $state.go('admin.jobs');
                }, function(err) {
                    toastr.err(err);
                });
            }
        }
    })
    .controller('addJobController', function($scope, $state, jobsService, toastr) {
        $scope.job = {
            title: '',
            group: '',
            introduction: '',
            person_img: {},
            person_name2: '',
            titleDescription: '',
            metaDescription: '',
            questAndAns: [{
                question: '',
                answer: ''
            }],
            practical_details: ['']
        };

        $scope.jobsGroup;
        jobsService.getJobsGroup().then(res => {
            $scope.jobsGroup = res.data;
        });

        $scope.addNew = function(type) {
            if (type == 1) {
                $scope.job.questAndAns.push({
                    question: '',
                    answer: ''
                });
            } else if (type == 2) {
                $scope.job.practical_details.push("");
            }
        };
        $scope.remove = function(index, type) {
            if (type == 1) {
                $scope.job.questAndAns.splice(index, 1);
            } else if (type == 2) {
                $scope.job.practical_details.splice(index, 1);
            }
        };

        $scope.submitForm = function(job) {
            angular.forEach(job.questAndAns, function(questAndAns) {
                delete questAndAns['$$hashKey'];
            });
            jobsService.addJob(job).then(res => {
                toastr.success('Added new job');
                $state.go('admin.jobs');
            });
        }
    })
    .controller('addNewJobGroupCtrl', function($scope, $uibModalInstance, $http, $window) {
        $scope.jobGroup;

        $scope.ok = function() {
            if (angular.isString($scope.jobGroup) && $scope.jobGroup.length > 0) {
                $http.post('api/job/addGroup', {
                    section_name: $scope.jobGroup
                }).then(res => {
                    $window.location.reload();
                }, err => {
                    console.log('err:::::::::', err);
                });
            }
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    })
    .controller('editJobGroupCtrl', function($scope, $uibModalInstance, $http, $window, old_section) {
        $scope.jobGroup = old_section.section_name;

        $scope.ok = function() {
            if (angular.isString($scope.jobGroup) && $scope.jobGroup.length > 0) {
                $http.post('api/job/editJobGroup', {
                    section_name: $scope.jobGroup,
                    old_section_id: old_section.section_id
                }).then(res => {
                    $window.location.reload();
                }, err => {
                    console.log('err:::::::::', err);
                });
            }
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    });
