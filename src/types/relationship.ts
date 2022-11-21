/**
 * Relationship type.
 */
enum RelationshipTypeEnum {
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
     * The ID of the target user.
     */
    id: string;

    /**
     * When this relationship was first introduced.
     */
    when: Date;

    /**
     * The relationship type.
     */
    type: RelationshipTypeEnum;
}