angular.module('myApp.services')
    .service('jobsService', function($http, Upload) {
        return {
            getJobs: function() {
                return $http.get('/api/jobs');
            },
            getJob: function(section_id, jsonfile) {
                var url = '/api/jobs/' + section_id + '/' + jsonfile;
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
                        questAndAns: job.questAndAns,
                        practical_details: job.practical_details,
                        titleDescription: job.titleDescription,
                        metaDescription: job.metaDescription,
                        file: job.person_img
                    }
                });
            },
            editWithImg: function (job) {
                return Upload.upload({
                    url: '/api/job/editWithImg',
                    method: 'POST',
                    data: {
                        group: job.group,
                        title: job.title,
                        introduction: job.introduction,
                        person_name2: job.person_name2,
                        questAndAns: job.questAndAns,
                        practical_details: job.practical_details,
                        titleDescription: job.titleDescription,
                        metaDescription: job.metaDescription,
                        file: job.person_img,
                        old_section_id: job.old_section_id,
                        old_jsonfile: job.jsonfile
                    }
                });
            },
            editWithoutImg: function (job) {
                return $http.post('/api/job/editWithoutImg', {
                    group: job.group,
                    title: job.title,
                    introduction: job.introduction,
                    person_name2: job.person_name2,
                    questAndAns: job.questAndAns,
                    practical_details: job.practical_details,
                    titleDescription: job.titleDescription,
                    metaDescription: job.metaDescription,
                    person_img: job.person_img,
                    old_section_id: job.old_section_id,
                    old_jsonfile: job.jsonfile
                });
            },
            deleteJob: function(section_id, jsonfile) {
                return $http.post('/api/job/delete', {
                    section_id: section_id,
                    jsonfile: jsonfile
                });
            },
            changeVisible: function (arrJobs) {
                return $http.post('/api/job/changeVisible', {
                    arrJobs: arrJobs
                });
            }
        }
    });
