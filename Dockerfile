# Use NODEJS
FROM node:16

# Create app directory
WORKDIR /usr/src/usersvc
COPY package*.json .
COPY . .
RUN npm install
RUN npm install -g typescript
RUN npm run build
EXPOSE ${PORT}
CMD [ "npm", "run", "start" ]