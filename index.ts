import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';
import { RelationshipManager } from './src/mgmt/relationship-mgr';
import { api } from "../libdd-node";
const { sendResponseObject, constructResponseObject } = api;

// Read .env file
dotenv.config();

const app: Express = express();
let relMgr: RelationshipManager;

// Routes
app.get('/relations/:id/all', async (req: Request, res: Response) => {
    try {

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