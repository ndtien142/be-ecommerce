'use strict';

const { CREATED } = require('../core/success.response');
const commentService = require('../services/comment.service');

class CommentController {
    async createComment(req, res, next) {
        new CREATED({
            message: 'Create comment success!',
            metadata: await commentService.createComment(req.body),
        }).send(res);
    }
    async getListCommentByParentId(req, res, next) {
        new CREATED({
            message: 'Create comment success!',
            metadata: await commentService.getCommentByParentId(req.query),
        }).send(res);
    }
}

module.exports = new CommentController();
