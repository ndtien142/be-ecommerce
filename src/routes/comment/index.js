'use strict';

const express = require('express');
const commentController = require('../../controllers/comment.controller');
const asyncHandler = require('../../middleware/handleError');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

router.get('', asyncHandler(commentController.getListCommentByParentId));

router.use(authentication);

router.post('', asyncHandler(commentController.createComment));
router.delete('', asyncHandler(commentController.deleteComment));

module.exports = router;
