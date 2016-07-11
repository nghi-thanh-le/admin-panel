//        .==.        .==.
//       //`^\\      //^`\\
//      // ^ ^\(\__/)/^ ^^\\
//     //^ ^^ ^/6  6\ ^^ ^ \\
//    //^ ^^ ^/( .. )\^ ^ ^ \\
//   // ^^ ^/\| v""v |/\^ ^ ^\\
//  // ^^/\/ /  `~~`  \ \/\^ ^\\
//  -----------------------------
/// HERE BE THE DRAGON

var express = require('express');
var router = express.Router();
var app = express();
var path = require('path');

var validateToken = require('../lib/helpers').validateToken;

var productDbApiHandler = require('./dbApiHandler/productApiHandler');
var categoryApiHandler = require('./jsonApiHandler/categoryApiHandler');
var adminJsonApiHandler = require('./jsonApiHandler/adminJsonApiHandler');
var referenceJsonApiHandler = require('./jsonApiHandler/referenceJsonApiHandler');
var jobJsonApiHandler = require('./jsonApiHandler/jobJsonApiHandler');
var downloadApiHanlder = require('./download/downloadApiHanlder');
var dashboardJsonApiHandler = require('./jsonApiHandler/dashboardJsonApiHandler');

/* Products api */
router.get('/products', productDbApiHandler.getProducts);
router.get('/product/:_id', productDbApiHandler.getProductById);
router.post('/product/add', productDbApiHandler.addProduct);
router.post('/product/editWithObject', productDbApiHandler.editProductWithObjectInput);
router.post('/product/editWithString', productDbApiHandler.editProductWithStringInput);
router.post('/product/delete', productDbApiHandler.deleteProduct);
router.post('/product/changeVisible', productDbApiHandler.changeVisible);

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
router.post('/reference/changeVisible', referenceJsonApiHandler.changeVisible);

/* Jobs api*/
router.get('/jobs', jobJsonApiHandler.getJobs);
router.get('/jobs/:section_id/:position', jobJsonApiHandler.getJobPosition);
router.post('/job/add', jobJsonApiHandler.addJob);
router.post('/job/addGroup', jobJsonApiHandler.addGroup);
router.post('/job/editWithImg', jobJsonApiHandler.editJobWithImg);
router.post('/job/editWithoutImg', jobJsonApiHandler.editJobWithoutImg);
router.post('/job/editJobGroup', jobJsonApiHandler.editJobGroup);
router.post('/job/delete', jobJsonApiHandler.deleteJob);
router.post('/job/deleteJobGroup', jobJsonApiHandler.deleteJobGroup);
router.post('/job/changeVisible', jobJsonApiHandler.changeVisible);

/* Download file */
router.get('/download/products', downloadApiHanlder.downloadProducts);
router.get('/download/references', downloadApiHanlder.downloadReferences);
router.get('/download/jobs', downloadApiHanlder.downloadJobs);
router.get('/download/jobs/:section_id/:jsonfile', downloadApiHanlder.downloadSpecificJob);

/* Managing dashboard */
router.get('/dashboard', dashboardJsonApiHandler.getDashboard);
router.post('/dashboard', dashboardJsonApiHandler.addToDashboard);
router.post('/dashboard/edit', dashboardJsonApiHandler.editDashboard);
router.post('/dashboard/delete', dashboardJsonApiHandler.deleteFromDashBoard);

module.exports = router;
