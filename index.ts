import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';
import { RelationshipManager } from './src/mgmt/relationship-mgr';
import { api, schema } from "libdd-node";
import { RelationshipTypeEnum } from './src/types/relationships/relationship';
const { sendResponseObject, constructResponseObject } = api;
const { validateSchema } = schema;

// Read .env file
dotenv.config();

const app: Express = express();
let relMgr: RelationshipManager;

// Use json
app.use(express.json());

// Routes
/*
Gets all relations for the specified user.
*/
app.get('/relations/:id', async (req: Request, res: Response) => {
    try {
        // Get user relations
        validateSchema({
            id: { type: "string" },
        }, req.params);

        sendResponseObject(res, 200, constructResponseObject(true, "", await relMgr.getRelations(req.params.id)));
    } catch(e: Error | any) {
        sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
    }
});

/*
Gets specific relations for the specified user.
*/
app.get('/relations/:id/:filter', async (req: Request, res: Response) => {
    try {
        // Get user relations
        validateSchema({
            id: { type: "string" },
            filter: { type: "string" }
        }, req.params);

        const validFilterMapping = [
            { name: "all", value: -1 },
            { name: "pending", value: -2 },
            { name: "block", value: RelationshipTypeEnum.block },
            { name: "friend", value: RelationshipTypeEnum.friend },
            { name: "incoming", value: RelationshipTypeEnum.incoming },
            { name: "outgoing", value: RelationshipTypeEnum.outgoing }
        ];

        const fltr = validFilterMapping.find(x => x.name == req.params.filter);

        if(!fltr)
            throw new Error("Invalid filter.");

        // Custom pending filter
        if(fltr.value == -2)
            sendResponseObject(res, 200, constructResponseObject(true, "", [
                ...await relMgr.getRelations(req.params.id, RelationshipTypeEnum.incoming),
                ...await relMgr.getRelations(req.params.id, RelationshipTypeEnum.outgoing)
            ]));
        else
            sendResponseObject(res, 200, constructResponseObject(true, "", await relMgr.getRelations(req.params.id, fltr.value)));
    } catch(e: Error | any) {
        sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
    }
});

/*
Route to block user
*/
app.post('/relations/:id/block', async (req: Request, res: Response) => {
    try {
        // Get user relations
        validateSchema({
            id: { type: "string" }
        }, req.params);

        validateSchema({
            target: { type: "string" }
        }, req.body);

        await relMgr.blockUser(req.params.id, req.body.target);

        sendResponseObject(res, 200, constructResponseObject(true, "User has been blocked."));
    } catch(e: Error | any) {
        sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
    }
});

/*
Friend request methods.
*/
app.post('/relations/:id/friend/:method', async (req: Request, res: Response) => {
    try {
        validateSchema({
            id: { type: "string" },
            method: { type: "string" }
        }, req.params);

        validateSchema({
            target: { type: "string" }
        }, req.body);

        switch(req.params.method) {
            default:
                throw new Error("Unknown method.");
            case "request":
                // Put a friend request
                await relMgr.sendFriendRequest(req.params.id, req.body.target);
                break;
            case "accept":
                await relMgr.acceptFriendRequest(req.params.id, req.body.target);
                break;
            case "deny":
                await relMgr.denyFriendRequest(req.params.id, req.body.target);
                break;
            case "retract":
                // Only do this if there is an outgoing request
                if((await relMgr.getRelation(req.params.id, req.body.target))?.type == RelationshipTypeEnum.outgoing) {
                    await relMgr.removeRelation(req.params.id, req.body.target);
                    await relMgr.removeRelation(req.body.target, req.params.id);
                }
                else
                    throw new Error("Acting user does not have outgoing relationship with target user.")
                
                break;
        }

        sendResponseObject(res, 200, constructResponseObject(true, ""));
    } catch(e: Error | any) {
        sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
    }
});

/*
Friend remove method.
*/
app.delete('/relations/:id/friend/remove/:target', async(req: Request, res: Response) => {
    try {
        validateSchema({
            id: { type: "string" },
            target: { type: "string" }
        }, req.params);

        await relMgr.removeFriend(req.params.id, req.params.target);

        sendResponseObject(res, 200, constructResponseObject(true, ""));
    } catch(e: Error | any) {
        sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
    }
});

/**
 * Program entry point.
 */
async function main() {
    // Setup and connect to db
    let mclient = new MongoClient(process.env.DB_URL as string);
    
    try {
        console.log(`Connecting to database at ${process.env.DB_URL}...`);
        await mclient.connect();
        console.log("Database connection successful!");
    } catch(e) {
        console.error("Error: cannot connect to database!");
        process.exit(1);
    }

    let db = mclient.db(process.env.DB_NAME);
    relMgr = new RelationshipManager(db.collection('relationships'));
    
    // Listen app
    app.listen(process.env.PORT, () => {
        console.log(`User service available at :${process.env.PORT}`);
    });
}

main();