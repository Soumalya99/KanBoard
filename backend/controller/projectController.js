const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { clerkClient } = require('@clerk/express');

async function createProject(req, res) {
    console.log("createProject endpoint hit!");
    const {userId, orgId} = req.auth;
    console.log('/project endpoint hit with userId: and orgId:', userId, orgId);
    if(!userId){
        res.status(401).json({error: 'UnAuthorized' });
        return;
    };
    if(!orgId){
        res.status(402).json({error: 'No organization selected' });
        return
    }

    try {       
    const {data : membership} = await clerkClient.organizations.
    getOrganizationMembershipList({
        organizationId : orgId
    });

    const userMembership = membership.find(member => member.publicUserData.userId === userId);

    if(!userMembership || userMembership.role !== 'org:admin'){
        return res.status(403).json({error: 'Forbidden: User is not an organization admin.' });
        
    }

    const project = await prisma.project.create({
        /** need to pass data object while entrying data in database */
        data: {
            name: req.body.name,
            key: req.body.key,
            description: req.body.description,
            organizationId: orgId
        }
    });

    return res.status(201).json({project});

    } catch (error) {
        console.error('Error in creating project', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getProjects(req,res){
    console.log("getProjects endpoint hit!");
    const {userId} = req.auth;
    const {orgId} = req.params;
    if(!userId){
        res.status(401).json({error: 'UnAuthorized' });
        return;
    };

    try {
        const user = prisma.user.findUnique({
            where: {clerkUserId : userId}
        })
        if(!user){
            res.status(402).json({error: 'No such user exists' });
            return
        }
        
        /** Fetch projects */
        const projects = await prisma.project.findMany({
            where: {organizationId: orgId},
            orderBy: {createdAt: 'desc'},
            include: {sprints: true},
        })
        console.log("Projects :",projects);
        return res.status(200).json({projects});
    } catch (error) {
        console.error('Error in fetching projects', error);
        return res.status(500).json({ error: "Internal server error project can't be fetched" });
    }
};

async function deleteProject(req, res){
    console.log("deleteProject endpoint hit!");
    const {userId, orgId, orgRole} = req.auth;
    const {projectId} = req.params;

    if(!userId){
        res.status(401).json({error: 'UnAuthorized' });
        return;
    };
    if(orgRole !== 'org:admin'){
        res.status(403).json({error: 'Forbidden' });
        return;
    }

    try {
       const project = await prisma.project.findUnique({
        where: {id: projectId}
       });
       if(!project || project.organizationId !== orgId){
        res.status(402).json({error: "No such project exists or U don't have the permission to delete it" });
        return;
       }
       await prisma.project.delete({
        where: {id: projectId}
       })
       res.status(200).json({message: "Project deleted successfully", success: true });
    } catch (error) {
        console.error('Error in deleting project', error);
        return res.status(500).json({ error: "Internal server error project can't be deleted" });
    }

}

module.exports = { createProject, getProjects , deleteProject}