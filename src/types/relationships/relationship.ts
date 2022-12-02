/**
 * Relationship type.
 */
export enum RelationshipTypeEnum {
    friend = 1,
    block = 2,
    incoming = 3,
    outgoing = 4
}

/**
 * Represents a user relationship.
 */
export interface UserRelationship {
    /**
     * The ID of the user which this relationship belongs to.
     */
    uid: string;
    
    /**
     * The ID of the target user.
     */
    targetId: string;

    /**
     * When this relationship was last updated.
     */
    when: Date;

    /**
     * The relationship type.
     */
    type: RelationshipTypeEnum;
}