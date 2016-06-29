angular.module('myApp.services')
    .service('jobsService', function($http, Upload) {
        return {
            getJobs: function() {
                return $http.get('/api/jobs');
            },
            getJob: function(section_id, jsonfile) {
                var url = '/api/job/' + section_id + '/' + jsonfile;
                return $http.get(url);
            },
            getJobsGroup: function () {
                return $http.get('/api/jobsGroup');
            },
            addJob: function(job) {
                return Upload.upload({
                    url: '/api/job/add',
                    method: 'POST',
                    data: {
                        group: job.group,
                        title: job.title,
                        introduction: job.introduction,
                        person_name2: job.person_name2,
                        interview_question1: job.interview_question1,
                        interview_question2: job.interview_question2,
                        interview_question3: job.interview_question3,
                        interview_answer1: job.interview_answer1,
                        interview_answer2: job.interview_answer2,
                        interview_answer3: job.interview_answer3,
                        practical_detail1: job.practical_detail1,
                        practical_detail2: job.practical_detail2,
                        practical_detail3: job.practical_detail3,
                        titleDescription: job.titleDescription,
                        metaDescription: job.metaDescription,
                        file: job.person_image
                    }
                });
            },
            deleteJob: function(section_id, jsonfile) {
                return $http.post('/api/job/delete', {
                    section_id: section_id,
                    jsonfile: jsonfile
                });
            }
        }
    });



    // editProduct: function(job, oldTitle) {
    //     var data = {
    //         title: job.title,
    //         framework: job.framework,
    //         category: job.category.name,
    //         dateAdded: job.dateAdded.toISOString(),
    //         withDomainUrl: job.buyDomainUrl.withDomainUrl,
    //         withoutDomainUrl: job.buyDomainUrl.withoutDomainUrl,
    //         previewUrl: job.previewUrl,
    //         popularity: job.popularity,
    //         file: job.imgUrl
    //     };
    //     if (angular.isDefined(oldTitle)) {
    //         data.oldTitle = oldTitle;
    //     }
    //     return Upload.upload({
    //         url: '/api/job/editWithObject',
    //         method: 'POST',
    //         data: data
    //     });
    // },
    // editProductV2: function(job, oldTitle) {
    //     var data = {
    //         title: job.title,
    //         framework: job.framework,
    //         category: job.category.name,
    //         dateAdded: job.dateAdded.toISOString(),
    //         withDomainUrl: job.buyDomainUrl.withDomainUrl,
    //         withoutDomainUrl: job.buyDomainUrl.withoutDomainUrl,
    //         previewUrl: job.previewUrl,
    //         popularity: job.popularity,
    //         imgUrl: job.imgUrl
    //     };
    //     if (angular.isDefined(oldTitle)) {
    //         data.oldTitle = oldTitle;
    //     }
    //     return $http.post('/api/job/editWithString', data);
    // },
