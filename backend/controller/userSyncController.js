const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { clerkClient } = require('@clerk/express');

async function syncUser(req, res) {
    try {        
        const { name, email, imageUrl, clerkUserId } = req.body;    
    
        console.log('Received user sync request:',req.body);
    
        if(clerkUserId !== req.auth.userId){
            return res.status(403).json({ error: 'Forbidden: Clerk user ID mismatch.' });
        }
        /** Finding for existing user */
        let user = await prisma.user.findUnique({
            where: { clerkUserId }
        });
        console.log(`Existing user's record found`, user);
        if(!user){
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    imageUrl,
                    clerkUserId
                }
            });
            res.status(201).json({user});
        };
    } catch (error) {
        console.error('Error in user sync:', error);
        return res.status(500).json({ error: 'Internal server error' });
        
    }
};


async function getOrganization(req, res){
    console.log("HI reached mf atlast ....")
    try {
        console.log("HI reached mf atlast ....")
        const {userId} = req.auth;
        console.log("HI userId ....", userId)
        const { slug } = req.params;
        if(!userId){
            throw new Error('UnAuthorized');
        };
        const user = await prisma.user.findUnique({
            where: {clerkUserId : userId}
        });
        if(!user){
            throw new Error('User not found !');
        };

        /** Organizational checks */
        const organization = await clerkClient.organizations.
        getOrganization({ slug });

        // console.log("Organization backend data :", organization);

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        /** Checking does the user fall under 🏢 organization members or not 
         * by checking of organizationId matches the user's organization.id
        */
        const {data : membership} = await 
        clerkClient.organizations.
        getOrganizationMembershipList({
            organizationId : organization.id
        });

        /** Check if 🗿 user exist in membership array or not  */
        const userMembership = membership.find(
            (member) => member.publicUserData.userId === userId
        );
        // console.log('User Membership :', userMembership);
        if(!userMembership){
            return res.status(403).json({ error: 'User is not a member of this organization' });
        }

        return res.status(200).json({ organization });


    } catch (error) {
        console.error('Error getting organization: 🗿', error);
        return res.status(500).json({ error: 'Error getting organization' });
    }
};

async function getOrganizationUsers(req, res) {
    const { userId, orgId } = req.auth;
    const slug = req.query.slug || req.params.slug;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Missing userId' });
    }

    try {
        // Ensure user exists in your DB
        const user = await prisma.user.findUnique({
            where: { clerkUserId: userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found!' });
        }

        let organizationId = orgId;

        // If orgId is missing, try to get it from slug
        if (!organizationId && slug) {
            try {
                const organization = await clerkClient.organizations.getOrganization({ slug });
                organizationId = organization.id;
            } catch (error) {
                if (
                    error.status === 404 ||
                    (error.errors && error.errors[0]?.code === 'resource_not_found')
                ) {
                    return res.status(404).json({ error: 'Organization not found (invalid slug)' });
                }
                throw error;
            }
        }

        if (!organizationId) {
            return res.status(400).json({ error: 'Organization ID or slug required' });
        }

        // Get organization membership list from Clerk
        let organizationMembership;
        try {
            organizationMembership = await clerkClient.organizations.getOrganizationMembershipList({
                organizationId
            });
        } catch (error) {
            if (
                error.status === 404 ||
                (error.errors && error.errors[0]?.code === 'resource_not_found')
            ) {
                return res.status(404).json({ error: 'Organization not found (invalid orgId)' });
            }
            throw error;
        }

        // Extract user IDs from membership
        const memberIds = organizationMembership.data.map(
            member => member.publicUserData.userId
        );

        // Fetch users from your DB whose clerkUserId is in memberIds
        const members = await prisma.user.findMany({
            where: {
                clerkUserId: { in: memberIds }
            }
        });

        return res.status(200).json({ members });

    } catch (err) {
        // Check for Clerk resource_not_found error in the outer catch as well
        if (
            err.status === 404 ||
            (err.errors && err.errors[0]?.code === 'resource_not_found')
        ) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        console.error('Error getting organization users: 🗿', err);
        return res.status(500).json({ error: 'Error getting organization users' });
    }
}


module.exports = {syncUser, getOrganization, getOrganizationUsers}
