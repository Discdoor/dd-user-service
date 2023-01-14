import { RelationshipManager } from './relationship-mgr';
import { MongoClient, Db, Collection, MongoClientOptions } from 'mongodb';
import { RelationshipTypeEnum } from '../types/relationships/relationship';

// Typescript declarations
declare global {
    /**
     * Jest mongoDB library global.
     */
    var __MONGO_URI__: string;
}

describe('Relationship manager', () => {
    /**
     * Relationship manager instance.
     */
    let relMgr: RelationshipManager;

    /**
     * DB connection.
     */
    let connection: MongoClient;

    // Test suite prereqs
    beforeAll(async () => {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        connection = await MongoClient.connect(global.__MONGO_URI__ as string, options as MongoClientOptions);
        
        let db: Db = await connection.db('discdoor');
        let col: Collection = db.collection('relationships');
        relMgr = new RelationshipManager(col);
    });

    /**
     * Test user 1. This user is friendly to user 2.
     */
    const testUser1 = "Test User ID";

    /**
     * Test user 2. This user is friendly to user 1.
     */
    const testUser2 = "Test User ID 2";

    /**
     * Test user 3. This user is not friendly.
     */
    const testUser3 = "Test User ID 3";

    // Case: user 1 must not have any relation to user 2
    test('check existing relation of user 1 to user 2', async() => {
        const relation = await relMgr.getRelation(testUser1, testUser2);
        expect(relation).toBeNull();
    });

    // Case: send request from user 1 to user 2
    test('send friend request from u1 to u2', async() => {
        const result = await relMgr.sendFriendRequest(testUser1, testUser2);
        expect(result).toBe(true);
    });

    // Case: user 2 should be able to accept user 1's friend request.
    test('user 2 accepts request from user 1', async() => {
        const result = await relMgr.acceptFriendRequest(testUser2, testUser1);
        expect(result).toBe(true);
    });

    // Case: verify above case
    test('check if both users have a friendly relationship', async() =>{
        // Check if user 1 has a friendly relation to user 2
        const u1Rel = await relMgr.getRelation(testUser1, testUser2);
        expect(u1Rel).not.toBeNull();
        expect(u1Rel?.type).toBe(RelationshipTypeEnum.friend);

        // Check if user 2 has a friendly relation to user 1
        const u2Rel = await relMgr.getRelation(testUser2, testUser1);
        expect(u2Rel).not.toBeNull();
        expect(u2Rel?.type).toBe(RelationshipTypeEnum.friend);
    });

    // Case: user 1 should not be able to send user 2 a new request.
    // This is because user 1 is already friends with user 2.
    test('user 1 should not be able to send user 2 a new request', async() => {
        try {
            const result = await relMgr.sendFriendRequest(testUser1, testUser2);
            expect(result).not.toBe(true);
        } catch(e) {
            expect((e as Error).message).toBe("This user is already your friend.");
        }
    });

    // Case: test user 3 is added as a friend
    test('block user 3 who is not a friend', async() => {
        const blockResult = await relMgr.blockUser(testUser1, testUser3);
        expect(blockResult).toBe(true);

        // Verify block
        const blockRelation = await relMgr.getRelation(testUser1, testUser3);
        expect(blockRelation).not.toBeNull();
        expect(blockRelation?.type).toBe(RelationshipTypeEnum.block);
    });

    // Case: user 1 should not be able to send a request to blocked user 3
    test('user 1 should not be able to send a request to blocked user 3', async() => {
        try {
            const result = await relMgr.sendFriendRequest(testUser1, testUser3);
            expect(result).not.toBe(true);
        } catch(e) {
            expect((e as Error).message).toBe("You have blocked this user - please unblock them before sending a request.");
        }
    });

    // Case: user 3 should not be able to send a request to user 1 because they've been blocked
    test("user 3 should not be able to send a request to user 1 because they've been blocked", async() =>{
        try {
            const result = await relMgr.sendFriendRequest(testUser3, testUser1);
            expect(result).not.toBe(true);
        } catch(e) {
            expect((e as Error).message).toBe("You have been blocked by this user.");
        }
    });

    // Case: user 3 gets unblocked by user 1
    test("user 3 gets unblocked by user 1", async() => {
        const result = await relMgr.unblockUser(testUser1, testUser3);
        expect(result).toBe(true);

        // Verify that the relation does not exist
        const relation = await relMgr.getRelation(testUser1, testUser3);
        expect(relation).toBeNull();
    });

    // Case: user 1 sends request to user 3 but gets ignored
    //       the incoming relationship for user 3 should be gone
    //       the outgoing relationship to user 3 should remain
    test("user 1 sends request to user 3 but gets ignored", async() => {
        const reqResult = await relMgr.sendFriendRequest(testUser1, testUser3);
        expect(reqResult).toBe(true);

        // User 3 ignores user 1
        const denyResult = await relMgr.denyFriendRequest(testUser3, testUser1);
        expect(denyResult).toBe(true);

        // Check if incoming request is removed
        const incomingRelation = await relMgr.getRelation(testUser3, testUser1);
        expect(incomingRelation).toBeNull();

        // Outgoing request must exist
        const outgoingRelation = await relMgr.getRelation(testUser1, testUser3);
        expect(outgoingRelation).not.toBeNull();
        expect(outgoingRelation?.type).toBe(RelationshipTypeEnum.outgoing);
    });

    // Cleanup
    afterAll(async () => {
        await connection.close();
    });
});