# Use NODEJS
FROM node:16

# Create app directory
WORKDIR /usr/src/usersvc
COPY package*.json ./
RUN npm install
RUN npm install -g typescript
COPY . .
EXPOSE ${PORT}
CMD [ "npm", "run", "start" ]