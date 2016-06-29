var express = require('express');
var router = express.Router();
var app = express();
var path = require('path');

var validateToken = require('../lib/helpers').validateToken;

var productJsonApiHandler = require('./jsonApiHandler/productJsonApiHandler');
var categoryApiHandler = require('./jsonApiHandler/categoryApiHandler');
var adminJsonApiHandler = require('./jsonApiHandler/adminJsonApiHandler');
var referenceJsonApiHandler = require('./jsonApiHandler/referenceJsonApiHandler');
var jobJsonApiHandler = require('./jsonApiHandler/jobJsonApiHandler');

/* Products api */
router.get('/products', productJsonApiHandler.getProducts);
router.get('/product/:title', productJsonApiHandler.getProductsByTitle);
router.post('/product/add', productJsonApiHandler.addProduct);
router.post('/product/editWithObject', productJsonApiHandler.editProductWithObjectInput);
router.post('/product/editWithString', productJsonApiHandler.editProductWithStringInput);
router.post('/product/delete', productJsonApiHandler.deleteProduct);

/* Categories api */
router.get('/categories', categoryApiHandler.getCategories);
router.get('/jobsGroup', categoryApiHandler.getJobsGroup);

/* Admin-User api */
router.post('/login', adminJsonApiHandler.login);

/* References api */
router.get('/references', referenceJsonApiHandler.getReferences);
router.get('/reference/:title', referenceJsonApiHandler.getReferenceByTitle);
router.post('/reference/add', referenceJsonApiHandler.addReference);
router.post('/reference/editWithObject', referenceJsonApiHandler.editReferenceWithObjectInput);
router.post('/reference/editWithString', referenceJsonApiHandler.editReferenceWithStringInput);
router.post('/reference/delete', referenceJsonApiHandler.deleteReference);

/* Jobs api*/
router.get('/jobs', jobJsonApiHandler.getJobs);
router.get('/job/:section_id/:position', jobJsonApiHandler.getJobPosition);
router.post('/job/add', jobJsonApiHandler.addJob);
router.post('/job/editWithImg', jobJsonApiHandler.editJobWithImg);
router.post('/job/editWithoutImg', jobJsonApiHandler.editJobWithoutImg);
router.post('/job/delete', jobJsonApiHandler.deleteJob);

/* Download file */
router.get('/download/:section_id/:jsonfile', function (req, res) {
    var section_id = req.params.section_id;
    var jsonfile = req.params.jsonfile;
    var pathToFile = path.join(__dirname, '../assets/jobs/jobPositions', section_id, jsonfile) + '.json'
    var downloadName = jsonfile + '.json';
    res.download(pathToFile, downloadName, function (err) {
        if(err) {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;
