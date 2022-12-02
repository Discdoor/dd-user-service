import { api, schema } from 'libdd-node';
import { Collection } from 'mongodb';
import { RelationshipTypeEnum, UserRelationship } from '../types/relationships/relationship';

/**
 * A management object for managing user relationships.
 */
export class RelationshipManager {
    /**
     * The collection which stores relations.
     */
    private col: Collection;

    /**
     * Creates a relationships manager.
     * @param col The collection to store relations in.
     */
    constructor(col: Collection) {
        this.col = col;
    }

    /**
     * Gets all relations for the specified user.
     * @param uid The user ID to get relations for. 
     */
    async get(uid: string, filter: number = -1) {
        const doc = await this.col.find<UserRelationship>({
            ...{ id: uid },
            ...(filter !== -1 ? {
                type: filter
            } : {})
        }).toArray();

        if(!doc)
            throw new Error(`Error finding relationships.`);

        return doc;
    }

    /**
     * Adds or updates an existing relationship.
     * @param uid The user to update relations for.
     * @param targetUserId The target user to add a relation definition for.
     * @param targetRelation The relation to define.
     */
    async put(uid: string, targetUserId: string, targetRelation: RelationshipTypeEnum) {
        const existingRelation = await this.col.findOne<UserRelationship>({ id: uid, targetId: targetUserId });
        let dbRes;

        if(existingRelation) {
            // Update existing relation
            dbRes = await this.col.updateOne({ id: uid, targetId: targetUserId }, { $set: { type: targetRelation, when: new Date() } });
        } else {
            // Create new relation
            dbRes = await this.col.insertOne({
                id: uid,
                targetId: targetUserId,
                type: targetRelation,
                when: new Date()
            });
        }

        if(!dbRes.acknowledged)  
            throw new Error("Relationship update failure: DB Error");
    }

    /**
     * Blocks the specified user.
     * @param uid The user to block a user for.
     * @param targetUserId The user to block.
     */
    async block(uid: string, targetUserId: string) {
        if(uid == targetUserId)
            throw new Error("You cannot block yourself.");

        await this.put(uid, targetUserId, RelationshipTypeEnum.block);
    }

    /**
     * Sends a friend request.
     * @param uid The user to act for.
     * @param targetUserId The friend to send a request for.
     */
    async sendFriendRequest(uid: string, targetUserId: string) {
        if(uid == targetUserId)
            throw new Error("You cannot friend yourself.");
    }
}