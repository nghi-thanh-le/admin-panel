var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var jsonfile = require('jsonfile');
var helpers = require('../../lib/helpers');
var _ = require('lodash');
var Async = require('async');
var multer = require('multer');
var util = require('util');

jsonfile.spaces = 4;

var pathForUploadPic = path.join(__dirname, '../../../public/img/jobs');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, pathForUploadPic);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({
    storage: storage
}).single('file');

var jobs = path.join(__dirname, '../../assets/jobs/jobs.json');
var jobPositions = path.join(__dirname, '../../assets/jobs/jobPositions/');

var getJobs = function(req, res) {
    jsonfile.readFile(jobs, function(err, value) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        helpers.sendJsonResponse(res, 200, value);
    });
};

var getJobPosition = function(req, res) {
    var jobPath = jobPositions + req.params.section_id + '/' + req.params.position + '.json';
    jobPath = path.normalize(jobPath);
    jsonfile.readFile(jobPath, function(err, job) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        helpers.sendJsonResponse(res, 200, job);
    });
};

var addGroup = function(req, res) {
    // {
    //     "section_name": "Test",
    //     "section_id": "test",
    //     "data": []
    // }
    var newJobSection = {
        section_name: req.body.section_name,
        section_id: req.body.section_name.toLowerCase(),
        isVisible: true,
        data: []
    };

    Async.parallel([
        function(callback) {
            // write to jobs.json
            jsonfile.readFile(jobs, function(err, jobsArr) {
                if (err) {
                    callback(err, null);
                } else {
                    jobsArr.push(newJobSection);
                    jsonfile.writeFile(jobs, jobsArr, function(err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, "write to jobs.json done!");
                        }
                    });
                }
            });
        },
        function(callback) {
            // create new folder in jobsPosition
            var dirToMake = path.join(jobPositions, newJobSection.section_id);
            console.log(dirToMake);
            fse.mkdirs(dirToMake, function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, 'create folder done!');
                }
            })
        }
    ], function(err, results) {
        if (err) {
            return helpers.sendJsonResponse(res, 500, err);
        }
        helpers.sendJsonResponse(res, 200, results);
    });
};

var addJob = function(req, res) {
    upload(req, res, function(err) {
        var post = {
            group: req.body.group,
            title: req.body.title,
            jsonfile: req.body.title.replace(/\s/g, '').toLowerCase(),
            introduction: req.body.introduction,
            person_img: req.file.originalname,
            person_name2: req.body.person_name2,
            person_name: req.body.person_name2.split(' ')[0].toUpperCase(),
            questAndAns: req.body.questAndAns,
            practical_details: req.body.practical_details,
            titleDescription: req.body.titleDescription,
            metaDescription: req.body.metaDescription,
            section_id: req.body.group.toLowerCase()
        };

        Async.parallel([
            function(callback) {
                jsonfile.readFile(jobs, function(err, arrJobs) {
                    var job = arrJobs.find(function(jobInArr) {
                        return jobInArr.section_id == post.section_id;
                    });
                    job.data.push({
                        name: post.title,
                        description: post.introduction,
                        jsonfile: post.jsonfile,
                        isVisible: true
                    });
                    jsonfile.writeFile(jobs, arrJobs, function(err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, 'added to jobs.json');
                        }
                    });
                });
            },
            function(callback) {
                var data = {
                    jsonfile: post.jsonfile,
                    group: post.group,
                    title: post.title,
                    introduction: post.introduction,
                    person_img: post.person_img,
                    person_name: post.person_name,
                    person_name2: post.person_name2,
                    questAndAns: post.questAndAns,
                    practical_details: post.practical_details,
                    titleDescription: post.titleDescription,
                    metaDescription: post.metaDescription,
                    isVisible: true
                };

                var pathForWriting = __dirname + '/../../assets/jobs/jobPositions/' + post.section_id + '/' + post.jsonfile;
                pathForWriting = path.normalize(pathForWriting) + '.json';
                jsonfile.writeFile(pathForWriting, data, function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, 'writed to specific jsonfile');
                    }
                });
            }
        ], function(err, results) {
            if (err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            helpers.sendJsonResponse(res, 200, results);
        });
    });
};

var editJobWithImg = function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return herlpers.sendJsonResponse(res, 500, err);
        }
        var post = {
            group: req.body.group,
            title: req.body.title,
            jsonfile: req.body.title.replace(/\s/g, '').toLowerCase(),
            introduction: req.body.introduction,
            person_img: req.file.originalname,
            person_name2: req.body.person_name2,
            person_name: req.body.person_name2.split(' ')[0].toUpperCase(),
            questAndAns: req.body.questAndAns,
            practical_details: req.body.practical_details,
            titleDescription: req.body.titleDescription,
            metaDescription: req.body.metaDescription,
            old_section_id: req.body.old_section_id, // section_id is used to find where the freak it is in jobs.json,
            old_jsonfile: req.body.old_jsonfile // help where to find where the freak it is in job.data
        };

        var pathForOldJsonFile = jobPositions + post.old_section_id + '/' + post.old_jsonfile + '.json';
        pathForOldJsonFile = path.normalize(pathForOldJsonFile);

        Async.series([
            function(callback) {
                // this function is find the object in jobs.json
                // get the object based on section_id
                // delete it and save
                jsonfile.readFile(jobs, function(err, arrJobs) {
                    if (err) {
                        callback(err, null);
                    }
                    var job = arrJobs.find(function(jobInArr) {
                        return jobInArr.section_id == post.old_section_id;
                    });
                    var indexInDataArr = _.findIndex(job.data, function(jobInData) {
                        return jobInData.jsonfile == post.old_jsonfile;
                    });
                    job.data.splice(indexInDataArr, 1);

                    var editedJob = arrJobs.find(function(jobInArr) {
                        return jobInArr.section_name == post.group;
                    });
                    editedJob.data.push({
                        name: post.title,
                        description: post.introduction,
                        jsonfile: post.jsonfile,
                        isVisible: true
                    });

                    jsonfile.writeFile(jobs, arrJobs, function(err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, 'edited the job in jobs.json done!!!!');
                        }
                    });
                });
            },
            function(callback) {
                jsonfile.readFile(pathForOldJsonFile, function(err, job) {
                    if (err) {
                        return callback(err, null);
                    }
                    var pathForUnlinkPic = pathForUploadPic + '/' + job.person_img;
                    pathForUnlinkPic = path.normalize(pathForUnlinkPic);
                    fs.unlink(pathForUnlinkPic, function(err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, 'delete old image done!');
                        }
                    });
                });
            },
            function(callback) {
                fs.unlink(pathForOldJsonFile, function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, 'delete old jsonfile done!!!!');
                    }
                });
            },
            function(callback) {
                var data = {
                    jsonfile: post.jsonfile,
                    group: post.group,
                    title: post.title,
                    introduction: post.introduction,
                    person_img: post.person_img,
                    person_name: post.person_name,
                    person_name2: post.person_name2,
                    questAndAns: req.body.questAndAns,
                    practical_details: post.practical_details,
                    titleDescription: post.titleDescription,
                    metaDescription: post.metaDescription
                };
                var pathForSpecificJsonfile = jobPositions + post.group.toLowerCase() + '/' + post.jsonfile + '.json';
                pathForSpecificJsonfile = path.normalize(pathForSpecificJsonfile);
                jsonfile.writeFile(pathForSpecificJsonfile, data, function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, 'write the edited the file');
                    }
                });
            }
        ], function(err, results) {
            if (err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            helpers.sendJsonResponse(res, 200, results);
        });
    });
};

var editJobWithoutImg = function(req, res) {
    var post = {
        group: req.body.group,
        title: req.body.title,
        jsonfile: req.body.title.replace(/\s/g, '').toLowerCase(),
        introduction: req.body.introduction,
        person_img: req.body.person_img,
        person_name2: req.body.person_name2,
        person_name: req.body.person_name2.split(' ')[0].toUpperCase(),
        questAndAns: req.body.questAndAns,
        practical_details: req.body.practical_details,
        titleDescription: req.body.titleDescription,
        metaDescription: req.body.metaDescription,
        old_section_id: req.body.old_section_id, // section_id is used to find where the freak it is in jobs.json,
        old_jsonfile: req.body.old_jsonfile // help where to find where the freak it is in job.data
    };

    var pathForOldJsonFile = jobPositions + post.old_section_id + '/' + post.old_jsonfile + '.json';
    pathForOldJsonFile = path.normalize(pathForOldJsonFile);

    Async.series([
        function(callback) {
            // this function is find the object in jobs.json
            // get the object based on section_id
            // delete it and save
            jsonfile.readFile(jobs, function(err, arrJobs) {
                if (err) {
                    callback(err, null);
                }
                var job = arrJobs.find(function(jobInArr) {
                    return jobInArr.section_id == post.old_section_id;
                });
                var indexInDataArr = _.findIndex(job.data, function(jobInData) {
                    return jobInData.jsonfile == post.old_jsonfile;
                });
                job.data.splice(indexInDataArr, 1);

                var editedJob = arrJobs.find(function(jobInArr) {
                    return jobInArr.section_name == post.group;
                });
                editedJob.data.push({
                    name: post.title,
                    description: post.introduction,
                    jsonfile: post.jsonfile,
                    isVisible: true
                });

                jsonfile.writeFile(jobs, arrJobs, function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, 'edited the job in jobs.json done!!!!');
                    }
                });
            });
        },
        function(callback) {
            fs.unlink(pathForOldJsonFile, function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, 'delete old jsonfile done!!!!');
                }
            });
        },
        function(callback) {
            var data = {
                jsonfile: post.jsonfile,
                group: post.group,
                title: post.title,
                introduction: post.introduction,
                person_img: post.person_img,
                person_name: post.person_name,
                person_name2: post.person_name2,
                questAndAns: req.body.questAndAns,
                practical_details: post.practical_details,
                titleDescription: post.titleDescription,
                metaDescription: post.metaDescription
            };
            var pathForSpecificJsonfile = jobPositions + post.group.toLowerCase() + '/' + post.jsonfile + '.json';
            pathForSpecificJsonfile = path.normalize(pathForSpecificJsonfile);
            jsonfile.writeFile(pathForSpecificJsonfile, data, function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, 'write the edited the file');
                }
            });
        }
    ], function(err, results) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        helpers.sendJsonResponse(res, 200, results);
    });
};

var deleteJob = function(req, res) {
    var section_id = req.body.section_id;
    var jsonfilePath = __dirname + '/../../assets/jobs/jobPositions/' + section_id + '/' + req.body.jsonfile;
    jsonfilePath = path.normalize(jsonfilePath) + '.json';
    jsonfile.readFile(jobs, function(err, value) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        var job = value.find(function(job) {
            return job.section_id == req.body.section_id;
        });
        for (var i = 0; i < job.data.length; i++) {
            if (job.data[i].jsonfile == req.body.jsonfile) {
                job.data.splice(i, 1);
                Async.series([
                    function(callback) {
                        jsonfile.writeFile(jobs, value, function(err) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, 'writeFile done!');
                            }
                        });
                    },
                    function(callback) {
                        jsonfile.readFile(jsonfilePath, function(err, jobFile) {
                            if (err) {
                                callback(err, null);
                            } else {
                                fs.unlink(pathForUploadPic + '\\' + jobFile.person_img, function(err) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        callback(null, 'delete img done!');
                                    }
                                });
                            }
                        });
                    },
                    function(callback) {
                        fs.unlink(jsonfilePath, function(err) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, 'delete json file done!');
                            }
                        });
                    }
                ], function(err, results) {
                    if (err) {
                        return helpers.sendJsonResponse(res, 500, err);
                    }
                    helpers.sendJsonResponse(res, 200, results);
                });
                break;
            }
        }
    });
};

var editJobGroup = function(req, res) {
    var section_name = req.body.section_name;
    var old_section_id = req.body.old_section_id;

    jsonfile.readFile(jobs, function(err, jobsArr) {
        if (err) {
            return helpers.sendJsonResponse(res, 500, err);
        }

        var index = _.findIndex(jobsArr, function(jobInArr) {
            return jobInArr.section_id == old_section_id;
        });

        // obviously index has to be >= 0 -> no need for extra validate :/
        // I hope so....
        jobsArr[index].section_name = section_name;
        jobsArr[index].section_id = section_name.toLowerCase();

        Async.series([
            function(callback) {
                jsonfile.writeFile(jobs, jobsArr, function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, 'rename in jobs.json done!');
                    }
                });
            },
            function(callback) {
                Async.each(jobsArr[index].data, function(item, eachCallback) {
                        var pathToRead = jobPositions + old_section_id + '\\' + item.jsonfile + '.json';
                        pathToRead = path.normalize(pathToRead);
                        jsonfile.readFile(pathToRead, function(err, job) {
                            if (err) {
                                eachCallback(err);
                            } else {
                                job.group = section_name;
                                jsonfile.writeFile(pathToRead, job, function(err) {
                                    if (err) {
                                        eachCallback(err);
                                    } else {
                                        eachCallback();
                                    }
                                });
                            }
                        });
                    },
                    function(err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, 'change group of job in jobPositions folder done!!!');
                        }
                    });
            },
            function(callback) {
                var oldPath = path.join(jobPositions, old_section_id);
                var newPath = path.join(jobPositions, section_name.toLowerCase());
                fs.rename(oldPath, newPath, function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, 'rename folder done!');
                    }
                });
            }
        ], function(err, results) {
            if (err) {
                return helpers.sendJsonResponse(res, 500, err);
            }
            helpers.sendJsonResponse(res, 200, results);
        });
    });
}

var deleteJobGroup = function(req, res) {
    var section_id = req.body.section_id;
    jsonfile.readFile(jobs, function(err, jobsArr) {
        if (err) {
            return helpers.sendJsonResponse(res, 500, err);
        }
        var index = _.findIndex(jobsArr, function(jobInArr) {
            return jobInArr.section_id == section_id;
        });
        if (index < 0) {
            return helpers.sendJsonResponse(res, 404, 'section not found! check section id');
        }
        var jobData = jobsArr[index];
        if (util.isArray(jobData.data)) {
            if (jobData.data.length > 0) {
                helpers.sendJsonResponse(res, 500, 'User has to empty job\'s category before deleting');
            } else {
                Async.parallel([
                    function(callback) {
                        jobsArr.splice(index, 1);
                        jsonfile.writeFile(jobs, jobsArr, function(err) {
                            if (err) {
                                callback(err, null)
                            }
                            callback(null, 'Delete job\'s group done!');
                        });
                    },
                    function(callback) {
                        var pathForRemoveDir = path.join(jobPositions, section_id);
                        fse.remove(pathForRemoveDir, function(err) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, 'remove folder done!');
                            }
                        });
                    }
                ], function(err, results) {
                    if (err) {
                        return helpers.sendJsonResponse(res, 500, err);
                    }
                    helpers.sendJsonResponse(res, 200, results);
                });
            }
        }
    });
}

var changeVisible = function(req, res) {
    var arrVisible = req.body.arrVisible;
    jsonfile.readFile(jobs, function(err, jobsJson) {
        if (err) {
            return helpers.sendJsonResponse(res, 500, err);
        }
        Async.map(arrVisible,
            function(item, callback) {
                var index = _.findIndex(jobsJson, function(job) {
                    return job.section_id == item.section_id;
                });
                if (index < 0) {
                    callback('not found', null);
                } else {
                    var job = jobsJson[index];
                    job.isVisible = item.isVisible;
                    console.log('item:::', item);
                    Async.each(job.data,
                        function(data, eachCallback) {
                            var indexInItemData = _.findIndex(item.data, function(idontknow) {
                                return idontknow.jsonfile == data.jsonfile;
                            });
                            if (indexInItemData < 0) {
                                eachCallback('not found in each loop');
                            } else {
                                data.isVisible = item.data[indexInItemData].isVisible;
                                eachCallback();
                            }
                        },
                        function(err) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, job);
                            }
                        });
                }
            },
            function(err, results) {
                if (err) {
                    return helpers.sendJsonResponse(res, 500, 'err');
                }
                // write back to jobs.json and send results to client
                jsonfile.writeFile(jobs, results, function(err) {
                    if (err) {
                        return helpers.sendJsonResponse(res, 500, err);
                    }
                    helpers.sendJsonResponse(res, 200, 'Change visibility done!');
                })
            });
    });
};

module.exports = {
    getJobs: getJobs,
    getJobPosition: getJobPosition,
    addGroup: addGroup,
    addJob: addJob,
    editJobWithImg: editJobWithImg,
    editJobWithoutImg: editJobWithoutImg,
    editJobGroup: editJobGroup,
    deleteJob: deleteJob,
    deleteJobGroup: deleteJobGroup,
    changeVisible: changeVisible
}
