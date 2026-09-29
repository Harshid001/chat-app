const express = require('express');

const router = express.Router();
const checkAuth = require('../controllers/auth.controller');
const protectRoute = require('../middleware/auth.middleware');
//api/auth/check
router.get('/check',protectRoute,checkAuth);

module.exports=router; 