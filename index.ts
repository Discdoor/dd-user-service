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

        sendResponseObject(res, 200, constructResponseObject(true, "", await relMgr.get(req.params.id)));
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
            { name: "block", value: RelationshipTypeEnum.block },
            { name: "friend", value: RelationshipTypeEnum.friend },
            { name: "incoming", value: RelationshipTypeEnum.incoming },
            { name: "outgoing", value: RelationshipTypeEnum.outgoing }
        ];

        const fltr = validFilterMapping.find(x => x.name == req.params.filter);

        if(!fltr)
            throw new Error("Invalid filter.");

        sendResponseObject(res, 200, constructResponseObject(true, "", await relMgr.get(req.params.id, fltr.value)));
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

        await relMgr.block(req.params.id, req.body.target);

        sendResponseObject(res, 200, constructResponseObject(true, "User has been blocked."));
    } catch(e: Error | any) {
        sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
    }
});

/*
Route to request user. This will place an outgoing request in the source user and an incoming request in the target user.
*/
app.post('/relations/:id/request', async (req: Request, res: Response) => {
    try {
        validateSchema({
            id: { type: "string" }
        }, req.params);

        validateSchema({
            target: { type: "string" }
        }, req.body);

        //await relMgr.block(req.params.id, req.params.targetUser);

        sendResponseObject(res, 200, constructResponseObject(true, "User has been blocked."));
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
        console.log("Connecting to database...");
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