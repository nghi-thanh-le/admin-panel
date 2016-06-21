var express = require('express');
var router = express.Router();
var app = express();

var validateToken = require('../lib/helpers').validateToken;

var productApiHandler = require('./productApiHandler');
var categoryApiHandler = require('./categoryApiHandler');
var adminApiHandler = require('./adminApiHandler');
var referenceApiHandler = require('./referenceApiHandler');
//var jobApiHandler = require('./jobApiHandler');

/* Define middleware for api , just sercurity purpose*/
// router.get('*', validateToken);
// router.post('/product/*', validateToken);

/* Products api */
router.get('/products', productApiHandler.getProducts);
router.get('/product/:productTitle', productApiHandler.getProductsByTitle);
router.post('/product/add', productApiHandler.addProduct);
// V1 is receiving the input form with image
// req.file is an object containing information about image
router.post('/product/editWithObject', productApiHandler.editProductWithObjectInput);
// V1 is receiving the input form without image
router.post('/product/editWithString', productApiHandler.editProductWithStringInput);
router.post('/product/delete', productApiHandler.deleteProduct);

/* Categories api */
router.get('/categories', categoryApiHandler.getCategories);

/* Admin-User api */
router.post('/login', adminApiHandler.login);

/* References api */
router.get('/references', referenceApiHandler.getReferences);
router.get('/references/:category', referenceApiHandler.getReferencesByCategory);
router.get('/reference/:_id', referenceApiHandler.getReferenceById);
router.post('/reference/add', referenceApiHandler.addReference);
router.post('/reference/editWithObject', referenceApiHandler.editReferenceWithObjectInput);
router.post('/reference/editWithString', referenceApiHandler.editReferenceWithStringInput);
router.post('/reference/delete', referenceApiHandler.deleteReference);

/* Jobs api*/
// router.get('/jobsPage', jobApiHandler.getJobsPage);
// router.get('/job/:position', jobApiHandler.getJobPosition);

module.exports = router;
