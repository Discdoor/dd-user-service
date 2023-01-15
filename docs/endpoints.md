# API endpoint documentation

## `GET` /relations/`:id:`
Gets the relationships for the specified user

Parameters:
 - `:id:` - The ID of the user.

Results:
- `200` - If retrieval was successful
- `400` - If retrieval has failed.

Example Request:

`GET /relations/501023025195198`

Example Response:
```json
{
    "success": true,
    "message": "",
    "data": [
        { "uid": "12345", "targetId": "67890", "when": "2022-01-14T04:46:57.991Z", "type": 3 },
        { "uid": "67890", "targetId": "12345", "when": "2022-01-14T04:46:57.991Z", "type": 4 }
    ]
}
```

----

## `GET` /relations/`:id:`/`:filter`
Gets relations by type for the specified user.

Parameters:
 - `:id:` - The ID of the user.
 - `:type:` - The relationship type (`friend`, `incoming`, `outgoing`, `block`)

Results:
 - `200`: If retrieval was successful.
 - `400`: If retrieval has failed.

Example Request:

`GET /relations/501023025195198/friend`

Example Response:
```json
{
    "success": true,
    "message": "",
    "data": [
        { "uid": "12345", "targetId": "67890", "when": "2022-01-14T04:46:57.991Z", "type": 1 },
        { "uid": "67890", "targetId": "12345", "when": "2022-01-14T04:46:57.991Z", "type": 1 }
    ]
}
```

----

## `POST` /relations/`:id:`/block
Blocks the specified user.

Parameters:
 - `:id:` - The ID of the user.

Body Parameters:
 - `target` - The target ID of the user to block.

Results:
- `200` - If retrieval was successful
- `400` - If retrieval has failed.

Example Request:

Request: `POST /relations/501023025195198/block`

Body:
```json
{
    "target": "1237582395723"
}
```

Example Response:
```json
{
    "success": true,
    "message": "User has been blocked",
    "data": null
}
```

-----

## `POST` /relations/`:id:`/friend/`:method:`
Friend request handling method.

Parameters:
 - `:id:` - The ID of the user.
 - `:method:` - The action to take (`accept`, `deny`, `request`, or `retract`)

Body Parameters:
 - `target` - The target ID of the user to take action on.

Results:
- `200` - If the request was successful
- `400` - If the request has failed.

Example Request (adding a friend):

Request: `POST /relations/501023025195198/friend/request`

Body:
```json
{
    "target": "1237582395723"
}
```

Example Response:
```json
{
    "success": true,
    "message": "",
    "data": null
}
```

-----

## `DELETE` /relations/`:id:`/friend/remove/`:target:`
Removes the specified friend.

Parameters:
 - `:id:` - The ID of the user.
- `target` - The target ID of the user to take action on.

Results:
 - `200` - If the request was successful
 - `400` - If the request has failed.

Example Request:

Request: `DELETE /relations/501023025195198/friend/remove/1237582395723`

Example Response:
```json
{
    "success": true,
    "message": "",
    "data": null
}