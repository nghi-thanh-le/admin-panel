angular.module('myApp.controllers')
    .controller('jobsControllers', function ($scope, jobsService) {
        $scope.isCollapsed = true;

        $scope.jobs;
        jobsService.getJobs().then(res => {
            $scope.jobs = res.data;
        });

        $scope.delete = function(section_id, jsonfile) {
            jobsService.deleteJob(section_id, jsonfile).then(value => {
                window.location.reload();
            });
        };
    })
    .controller('jobController', function($scope, $state, $stateParams, jobsService, toastr) {
        $scope.job = null;
        $scope.questAnsArr = [];

        $scope.jobsGroup;
        jobsService.getJobsGroup().then(res => {
            $scope.jobsGroup = res.data;
        });

        jobsService.getJob($stateParams.section_id, $stateParams.jsonfile).then(function(res) {
            $scope.job = res.data;
            for (var i = 0; i < 3; i++) {
                $scope.questAnsArr.push({
                    question: $scope.job.interview_questions[i],
                    answer: $scope.job.interview_answers[i]
                });
            }
            $scope.formInput = angular.copy($scope.job);
            // oldTitle = angular.copy($scope.job.title);
        });

        $scope.showEditForm = false;
        $scope.toggleForm = function() {
            $scope.showEditForm = !$scope.showEditForm;
        }

        $scope.editJob = function(job) {
            if (angular.isObject(job.imgUrl)) {
                jobsService.editJob(job, oldTitle).then(function(res) {
                    toastr.info('Job edited');
                    $state.go('admin.jobs');
                }, function(err) {
                    console.log('err::::::::', err);
                });
            } else if (angular.isString(job.imgUrl)) {
                jobsService.editJobV2(job, oldTitle).then(function(res) {
                    toastr.info('Job edited');
                    $state.go('admin.jobs');
                }, function(err) {
                    toastr.err(err);
                });
            }
        }
    })
    .controller('addJobController', function($scope, $state, jobsService, toastr) {
        $scope.jobsGroup;
        jobsService.getJobsGroup().then(res => {
            $scope.jobsGroup = res.data;
        });

        $scope.submitForm = function(job) {
            jobsService.addJob(job).then(value => {
                toastr.error('Added new job');
                $state.go('admin.jobs');
            });
        }
    });
