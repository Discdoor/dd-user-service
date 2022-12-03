import { api, schema } from 'libdd-node';
import { Collection } from 'mongodb';
import { RelationshipTypeEnum, UserRelationship } from '../types/relationships/relationship';
import { reflect } from 'libdd-node';
const { createShallowView } = reflect;

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
    async getRelations(uid: string, filter: number = -1) {
        const doc = await this.col.find<UserRelationship>({
            ...{ id: uid },
            ...(filter !== -1 ? {
                type: filter
            } : {})
        }).toArray();

        if(!doc)
            throw new Error(`Error finding relationships.`);

        return doc.map(x => createShallowView(x, []));
    }

    /**
     * Gets the relation for the specified user.
     * @param uid The ID of the user to check relations for.
     * @param targetId The target user to get the relation for.
     */
    async getRelation(uid: string, targetId: string) {
        return await this.col.findOne<UserRelationship>({
            id: uid,
            targetId
        });
    }

    /**
     * Removes a user relation.
     * @param uid The acting user.
     * @param targetId The Id of the target user to remove the relation of.
     */
    async removeRelation(uid: string, targetId: string) {
        return await this.col.deleteOne({ id: uid, targetId });
    }

    /**
     * Adds or updates an existing relationship.
     * @param uid The user to update relations for.
     * @param targetUserId The target user to add a relation definition for.
     * @param targetRelation The relation to define.
     */
    async updateRelation(uid: string, targetUserId: string, targetRelation: RelationshipTypeEnum) {
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
    async blockUser(uid: string, targetUserId: string) {
        if(uid == targetUserId)
            throw new Error("You cannot block yourself.");

        await this.updateRelation(uid, targetUserId, RelationshipTypeEnum.block);
    }

    /**
     * Sends a friend request.
     * @param uid The user to act for.
     * @param targetUserId The friend to send a request for.
     */
    async sendFriendRequest(uid: string, targetUserId: string) {
        if(uid == targetUserId)
            throw new Error("You cannot friend yourself.");

        // Case 1. Check if a request is already pending
        const existingRelation = await this.getRelation(uid, targetUserId);

        // There is a relation present - give error message based on what it is
        if(existingRelation) {
            switch(existingRelation.type) {
                default:
                    return true;
                case RelationshipTypeEnum.outgoing:
                    throw new Error("User is already being requested.");
                case RelationshipTypeEnum.block:
                    throw new Error("You have blocked this user - please unblock them before sending a request.");
                case RelationshipTypeEnum.friend:
                    throw new Error("This user is already your friend.")
            }
        }

        // Check target relation to requesting user
        const targetRelation = await this.getRelation(targetUserId, uid);

        if(targetRelation) {
            switch(targetRelation.type) {
                default:
                    return true;
                case RelationshipTypeEnum.block:
                    throw new Error("You have been blocked by this user.");
            }
        }

        // Finally put the request.
        await this.updateRelation(uid, targetUserId, RelationshipTypeEnum.outgoing);
        await this.updateRelation(targetUserId, uid, RelationshipTypeEnum.incoming);
        return true;
    }

    /**
     * Accepts the specified friend request.
     * @param uid The acting user.
     * @param targetUserId The target user to accept.
     */
    async acceptFriendRequest(uid: string, targetUserId: string) {
        // Check for incoming request
        const incomingRel = await this.getRelation(uid, targetUserId);

        if(!incomingRel)
            return true; // Nothing to do.

        // Accept the request - update the relations.
        await this.updateRelation(uid, targetUserId, RelationshipTypeEnum.friend);
        await this.updateRelation(targetUserId, uid, RelationshipTypeEnum.friend);
        return true;
    }

    /**
     * Denies the specified request.
     * @param uid The acting user.
     * @param targetUserId The target user to deny.
     */
    async denyFriendRequest(uid: string, targetUserId: string) {
        // Check for incoming request
        const incomingRel = await this.getRelation(uid, targetUserId);

        if(!incomingRel)
            return true; // Nothing to do.

        // Deny the request - remove relation for target user only. Source user should have no idea.
        await this.updateRelation(targetUserId, uid, RelationshipTypeEnum.incoming);
    }

    /**
     * Removes the specified friend.
     * @param uid The acting user.
     * @param targetUserId The target user to unfriend.
     */
    async removeFriend(uid: string, targetUserId: string) {
        // Check for existing relation
        const existingRel = await this.getRelation(uid, targetUserId);

        if(!existingRel)
            return true; // Nothing to do - fail successfully.

        // Remove relation
        await this.removeRelation(uid, targetUserId);
        await this.removeFriend(targetUserId, uid);
        return true;
    }
}