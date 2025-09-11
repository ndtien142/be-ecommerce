'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const asyncHandler = require('../../middleware/handleError');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

// signup
router.post('/signup', asyncHandler(accessController.signUp));
router.post('/login', asyncHandler(accessController.login));

// Authentication - handle check user can access to resource or not
router.use(authentication);

router.post('/logout', asyncHandler(accessController.logout));

module.exports = router;
