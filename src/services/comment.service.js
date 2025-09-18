'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const commentModel = require('../models/comment.model');
const { convertToObjectMongodb } = require('../utils');

/*
    Key features:
        - Add comment [User | Shop]
        - Get list of comments [User | Shop]
        - Delete a comment [User | Shop | Admin]
*/

class CommentService {
    static async createComment({
        productId,
        userId,
        content,
        parentCommentId = null,
    }) {
        const comment = new commentModel({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentCommentId,
        });

        let rightValue;
        if (parentCommentId) {
            // handle reply comment
            const parentComment = await commentModel.findById(parentCommentId);
            if (!parentComment)
                throw new BadRequestError('Parent Comment doest exist');
            rightValue = parentComment.comment_right;
            // update right comment
            await commentModel.updateMany(
                {
                    comment_productId: convertToObjectMongodb(productId),
                    comment_right: { $gte: rightValue },
                },
                {
                    $inc: { comment_right: 2 },
                },
            );
            // update left comment
            await commentModel.updateMany(
                {
                    comment_productId: convertToObjectMongodb(productId),
                    comment_left: { $gt: rightValue },
                },
                {
                    $inc: { comment_left: 2 },
                },
            );
        } else {
            const maxRightValue = await commentModel
                .findOne(
                    {
                        comment_productId: convertToObjectMongodb(productId),
                    },
                    'comment_right',
                    { sort: { comment_right: -1 } },
                )
                .lean();
            if (maxRightValue) {
                rightValue = maxRightValue.comment_right + 1;
            } else {
                rightValue = 1;
            }
        }

        // insert comment
        comment.comment_left = rightValue;
        comment.comment_right = rightValue + 1;

        await comment.save();

        return comment;
    }

    static async getCommentByParentId({
        productId,
        parentCommentId = null,
        limit = 50,
        offset = 0,
    }) {
        if (parentCommentId) {
            const parent = await commentModel.findById(parentCommentId);

            if (!parent) throw new NotFoundError('Not found parent comment');

            const comments = await commentModel
                .find({
                    comment_productId: convertToObjectMongodb(productId),
                    comment_left: { $gt: parent.comment_left },
                    comment_right: { $lte: parent.comment_right },
                })
                .select({
                    comment_left: 1,
                    comment_right: 1,
                    comment_content: 1,
                    comment_parentId: 1,
                })
                .sort({
                    comment_left: 1,
                })
                .lean();

            return comments;
        }

        console.log('productId: ', productId);
        console.log('Parent comment id: ', parentCommentId);

        const comments = await commentModel
            .find({
                comment_productId: convertToObjectMongodb(productId),
                comment_parentId: parentCommentId,
            })
            .select({
                comment_left: 1,
                comment_right: 1,
                comment_content: 1,
                comment_parentId: 1,
            })
            .sort({
                comment_left: 1,
            })
            .lean();

        return comments;
    }
}

module.exports = CommentService;
