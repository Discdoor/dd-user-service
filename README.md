# dd-user-service
DiscDoor user service.

This user service manages keeps client user settings synchronized and manages user relations.

## Requirements
- NodeJS
- TypeScript
- MongoDB

## Installing dependencies
To install all project dependencies, run `npm install` inside the project folder.

You may need to install TypeScript. To do so, run `npm install -g typescript`. Then, check if `tsc` is recognized as a valid system command. If this command succeeds, TypeScript is successfully installed.

## Running
Below are instructions to help you run `dd-user-service`.

### Development
To run a development server, execute the following commands.
- `npm run dev`

### Production (local)
To run this for production locally, run the following commands.
- `npm run build`
- `npm run start`

### Production (dockerized, preferred)
Simply create an image from the Dockerfile included here.

To do this, run `docker build -t dd-user-service .` in the repository root.

Then you can create a container based on this image.

## Testing
To run the unit tests for this project, run `npm test`. A successful pass is required before making any commits to this project.