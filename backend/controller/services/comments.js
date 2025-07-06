const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/** 
 * Create a comment for an issue
 * @param {Object} params
 * @param {string} params.issueId - The ID of the issue to comment on
 * @param {string} params.userId - The ID of the user making the comment
 * @param {string} params.content - The content of the comment
 * @return {Promise<Object>} The created comment object
 * @throws {Error} If the comment creation fails    
*/

/** Comment service handler to allow using the same central logic
 * in both socket and http communication.  */

async function createComments({issueId, userId, content}) {
    console.log('Creating comment for issue:', issueId, 'by user:', userId, 'with content:', content);
    if(!userId){
        throw new Error('UnAuthorized : User ID is must required to create a comment');
    };
    if(!issueId){
        throw new Error('Invalid issue ID: Issue ID is required to create a comment');
    }
    if(!content || typeof content !== 'string' || content.trim() === ''){
        throw new Error('Invalid content: Content must be a non-empty string');
    }
    
    try {
        const issue = await prisma.issue.findUnique({
            where: {id: issueId},
            include: {
                project: true,
            }
        });
        if(!issue) throw new Error('Issue not found');
        // Check if the user is part of the project
        const user = await prisma.user.findUnique({
            where: {clerkUserId: userId},
        });
        if(!user) throw new Error('User not found');

        const comment = await prisma.comments.create({
            data: {
                content,
                issueId: issue.id,
                authorId: user.id,
            },
            include: {
                author: true,
            }
        });
        return comment;
    } catch (error) {
        console.error('Error creating comment:', error);
        throw new Error('Failed to create comment');
    }
};

module.exports = { createComments };