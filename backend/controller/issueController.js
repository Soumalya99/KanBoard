const { PrismaClient } = require('@prisma/client');
const { createComments } = require('./services/comments');
const prisma = new PrismaClient();

async function createIssue(req, res){
    const {orgId, userId} = req.auth;
    const { projectId } = req.params;
    if(!userId || !orgId){
        return res.status(401).json({error: 'Unauthorized'});
    };

    let user = await prisma.user.findUnique({
        where: {clerkUserId : userId}
    });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    try {
        
        /** finding last issue */
        const lastIssue = await prisma.issue.findFirst({
            where: {projectId, status: req.body.status},
            orderBy: {order: 'desc'}
        });
    
        const newOrder = lastIssue ? lastIssue.order + 1 : 0;
        
        /**Create issue */
        const issue  = await prisma.issue.create({
            data: {
                title: req.body.title,
                description: req.body.description,
                status: req.body.status,
                priority: req.body.priority,
                projectId: projectId,
                sprintId: req.body.sprintId,
                reporterId: user.id,
                assigneeId: req.body.assigneeId,
                order: newOrder
            },
            include: {
                reporter: true,
                assignee: true
            },
        });

        return res.status(201).json({success: true, issue});
    } catch (error) {
        console.error('Error in creating issue', error);
        return res.status(500).json({error: 'Internal server error'});
    }
};

async function getIssues(req, res){
    const {orgId, userId} = req.auth;
    const { sprintId } = req.params;
    if(!userId || !orgId){
        return res.status(401).json({error: 'Unauthorized'});
    };

    /** find all the issues of the particular sprint */
    try {
      const issues = await prisma.issue.findMany({
        where: {sprintId: sprintId},
        orderBy: [{status: 'asc'}, {order: 'asc'}],
        include: {
            assignee: true,
            reporter: true,
        }
      });
      console.log("Issues of project", issues);
      return res.status(200).json({success: true, issues});
    } catch (error) {
        console.error('Error in getting issues', error);
        return res.status(500).json({error: 'Internal server error'});
    }
};

async function getIssueAcrossMultSprint(req,res){
    const {orgId, userId} = req.auth;
    if(!userId || !orgId){
        return res.status(401).json({error: 'Unauthorized'});
    };

    try {
        const user = await prisma.user.findUnique({
            where: {clerkUserId : userId}
        });
    
        if (!user) return res.status(404).json({ error: 'User not found' });
    
        const issues = await prisma.issue.findMany({
            where: {
                OR: [{assigneeId: user?.id}, {reporterId: user?.id}],
                project: {
                    organizationId: orgId,
                }
            },
            include: {
                project: true,
                assignee: true,
                reporter: true
            },
            orderBy: {updatedAt: 'desc'}
        });
        console.log("Issues of project", issues);
        return res.status(200).json({success: true, issues});
    } catch (error) {
        console.error('Error in getting issues', error);
        return res.status(500).json({error: 'Internal server error'});
    }
};

async function updateIssues(req, res){
    const {orgId, userId} = req.auth;
    const updatedIssue = req.body;
    const updated = [];
    if(!userId || !orgId){
        return res.status(401).json({error: 'Unauthorized'});
    };

    /** Starting a transaction model
     * to ensure that either all the operations
     * are successful or none of them are.
    */
   try {
       const result = await prisma.$transaction(async(prisma) => {
        for(let issue of updatedIssue){
            /** update */
            const updatedIssue = await prisma.issue.update({
                where: {id: issue.id},
                data: {
                    status: issue.status,
                    order: issue.order,
                }
            });
            // console.log("Received for update:", updatedIssue.map(i => i.id));
            console.log("Updated issue: ", updatedIssue);
            /** Pushing the updated issue to the array */
            updated.push(updatedIssue);
        }
        return updated;
       });
       return res.status(200).json({success: true, result});
   } catch (error) {
        console.error('Error in updating issues', error);
        return res.status(500).json({error: 'Internal server error'});
   }
};

async function updateSingleIssue(req,res) {
    const {orgId, userId} = req.auth;
    const { issueId } = req.params;
    const data = req.body;
    if(!userId || !orgId){
        return res.status(401).json({error: 'Unauthorized'});
    };
    try {
        const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        /** finding issue */
        const issue = await prisma.issue.findUnique({
            where: {id: issueId},
            include: {
                project: true
            },
        });
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        /** If reporter or admin can only update the issue */
        const isReporter = issue.reporterId && issue.reporterId === user.id;
        const isAdmin = issue.project?.adminIds && issue.project?.adminIds.includes(user.id);

        if (!isReporter && !isAdmin) {
            return res.status(403).json({ error: 'You do not have permission to update this issue' });
        }

        /* Update Issue */
        const updatedIssue = await prisma.issue.update({
            where: {id: issueId},
            data: {
                title: data?.title,
                description: data?.description,
                status: data?.status,
                priority: data?.priority,
                assigneeId: data?.assigneeId,
            },
            include: {
                reporter: true,
                assignee: true
            }
        });
        console.log('UpdatedIssue after update: ', updatedIssue);
        return res.status(200).json({success: true, issue: updatedIssue});
    } catch (error) {
        console.error('Error updating issue:', error);
        return res.status(500).json({ error: 'Internal server error while updating issue.' });
    }
}

async function deleteIssue(req,res){
    const {orgId, userId} = req.auth;
    const { issueId } = req.params;
    if(!userId || !orgId){
        return res.status(401).json({error: 'Unauthorized'});
    };

    const user = await prisma.user.findUnique({
        where: {clerkUserId: userId}
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    try {
        const issue = await prisma.issue.findUnique({
            where: {id: issueId},
            include: {
                project: true
            },
        });
        if(!issue){
            return res.status(404).json({error: 'Issue not found'});
        }

        if(issue.reporterId !== user.id &&
            !issue.project.adminIds.includes(user.id)
        ){
            return res.status(403).json({error: 'You do not have permission to delete this issue'});
        };

        await prisma.issue.delete({
            where: {id: issueId}
        });

        return res.status(200).json({success: true, message: 'Issue deleted successfully'});       
    } catch (error) {
        console.error('Error in deleting issue', error);
        return res.status(500).json({error: 'Internal server error while deleting issue.'});
    }
};

async function createissueComments(req, res){
    const {orgId, userId} = req.auth;
    const { issueId } = req.params;
    const data = req.body;
    if(!userId || !orgId){
        return res.status(401).json({error: 'Unauthorized'});
    };


    if(!data.content || typeof data.content !== 'string'|| !data.content.trim()){
        return res.status(400).json({error: 'Content is required'});
    }

    try {
        /** Call the service commentCreation function */
        const comment = await createComments({
            issueId, userId, content: data?.content
        });       
        return res.status(201).json({success: true, comment});
    } catch (error) {
        if(error?.message === 'Invalid content: Content must be a non-empty string'){
           return res.status(400).json({ error: error.message }); 
        }else if(error?.message === 'Invalid issue ID: Issue ID is required to create a comment'){
            return res.status(400).json({ error: error.message });
        }else if(error?.message === 'UnAuthorized : User ID is must required to create a comment'){
            return res.status(401).json({ error: error.message });
        };
        console.error('Error in creating issue comments', error);
        return res.status(500).json({ error: 'Internal server error while creating issue comments.' });
    }
};

async function getComments(req, res){
    const {orgId, userId} = req.auth;
    const { issueId } = req.params;
    const currentPage = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 30;
     
    
    if(!userId || !orgId){
        return res.status(401).json({error: 'Unauthorized'});
    }
    try {
        const issue = await prisma.issue.findUnique({
            where: {id: issueId},
        });
        console.log('Getcomments ***************************************************Issue found: ', issue);
        if(!issue){
            return res.status(404).json({error: 'Issue not found'});
        };
        /** Getting total comment count from comment model
         * for this issue
         * Usually for pagination
        */
        const totalComments = await prisma.comments.count({
            where: {issueId: issueId}
        });
        console.log(`Total comments for issue ${issueId}: `, totalComments);
        /** Computing pagination value */
        const totalPages = Math.ceil(totalComments/perPage)
        const offset = (currentPage - 1) * perPage;

        /** Fetching the filtered comments */
        const comments = await prisma.comments.findMany({
            where: {issueId},
            orderBy: {createdAt: 'asc'},
            include: {
                author: true
            },
            skip: offset,
            take: perPage
        });
        

        return res.status(200).json({
            success: true,
            comments,
            pagination: {
                totalComments,
                totalPages,
                currentPage,
                perPage
            }
        });
    } catch (error) {
        console.error('Error in getting comments', error);
        return res.status(500).json({
            error: 'Internal server error while getting comments.'
        })
    }
};

module.exports = { 
    createIssue, getIssues, getIssueAcrossMultSprint,
    updateIssues, deleteIssue, 
    createissueComments, updateSingleIssue,
    getComments
}