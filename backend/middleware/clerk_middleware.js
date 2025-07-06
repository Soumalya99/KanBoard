const { verifyToken } = require('@clerk/clerk-sdk-node');

const clerkMiddleware = async (req, res, next) => {
    //KNOCK KNOCK who's there Dollar sign to me laga tha ye bhul gaye !

    try {
        const authHeader = req.headers.authorization || ''; //not matter bro if authorization in lower or upper case at last converted into lowercase
        const sessionToken = authHeader.startsWith('Bearer') ? authHeader.slice(7) : null;
        console.log('Session token:', sessionToken);

        if (!sessionToken) {
            return res.status(401).json({ error: 'No session token provided' });
        };

        /** Verifying session token */
        const session = await verifyToken(sessionToken);

        if (!session || !session.userId) {
            return res.status(401).json({ error: 'Invalid session token' });
        };

        /** Atrtaching user's info for downloadstream handlers*/
        req.clerkUserId = session.userId;
        req.clerkSession = session;
        next();
    } catch (error) {
        console.error('Error in clerkMiddleware:', error);
        return res.status(500).json({ error: 'Internal server error' });

    }

};

module.exports = clerkMiddleware;