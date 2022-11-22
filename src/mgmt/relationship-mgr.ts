import { Collection } from 'mongodb';
import { UserRelationship } from '../types/relationships/relationship';

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
    async getAll(uid: string) {
        const doc = await this.col.find<UserRelationship>({ id: uid }).toArray();

        if(!doc)
            throw new Error(`Error finding relationships.`);

        return doc;
    }
}