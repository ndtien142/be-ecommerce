'use strict';

const { CREATED, SuccessResponse } = require('../core/success.response');
const commentService = require('../services/comment.service');

class CommentController {
    async createComment(req, res, next) {
        new CREATED({
            message: 'Create comment success!',
            metadata: await commentService.createComment(req.body),
        }).send(res);
    }
    async getListCommentByParentId(req, res, next) {
        new SuccessResponse({
            message: 'Create comment success!',
            metadata: await commentService.getCommentByParentId(req.query),
        }).send(res);
    }

    async deleteComment(req, res, next) {
        new SuccessResponse({
            message: 'Delete comment success!',
            metadata: await commentService.deleteComment(req.body),
        }).send(res);
    }
}

module.exports = new CommentController();
