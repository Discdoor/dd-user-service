# Relationships Deep Dive

User relationships are known connections a user has to other users. In the context of Discdoor, they can be the following:

 - User A is a friend of user B. User A has a friendly relation to user B and user B has a friendly relation to user A.
 - User A has blocked user B. User A has a blocked relationship with user B. If an existing relationship was found with user B, this relationship is removed. User B will not be able to send requests to user A.
 - User A has sent a friend request to user B, but user B has no relation to user A because the request was denied. This leaves user A with an outgoing relationship to user B, which user A can retract at any time.
 - User A has sent an outgoing request to user B, but user B has not reacted. An outgoing relationship is maintained for user A, and an incoming relationship from user A is present for user B.

By default, users have no relations. In the context of Discdoor, relations can be added via the client. If an unknown user is trying to reach another user without a prior relationship or shared community, the private message is blocked automatically. Community connections are managed by the messaging service.

## Relationship Model

User relationships are stored as objects in the Discdoor database under a collection named `relationships`.

A relationship object looks as follows:

| Property    | Type                 | Description                                            |
| ----------- | -------------------- | ------------------------------------------------------ |
| uid         | string               | The ID of the user which this relationship belongs to. |
| targetId    | string               | The user affected by this relationship.                |
| when        | Date                 | When this relationship was last updated                |
| type        | [RelationshipTypeEnum](#relationship-type) | The type of relationship                               |

An implementation of this model can be found [here](https://github.com/Discdoor/dd-user-service/blob/main/src/types/relationships/relationship.ts).

## Relationship Type

The relationship type is an enum with the following values:

- `friend` (1) - A friendly relationship. If user A is friends with user B, this relationship will exist for both users, referring to eachother.
- `block` (2) - A blocked relationship. This relation will only exist for the acting user, but the target user is still affected.
- `incoming` (3) - An incoming relationship. Part of a friend request.
- `outgoing` (4) - An outgoing relationship. Part of a friend request.