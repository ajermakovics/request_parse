# define from what image we want to build from
FROM node:10.6.0
# create a directory to hold the application code inside the docker container, 
# this will be the working directory for your application
WORKDIR /app
# line 3, 4, 5 we are telling to copy our local files to the container working directory
# and run npm to install any dependencies
# Install app dependencies: package-lock.json and package.json files
COPY package*.json ./
# If you are building your code for production
# RUN npm install --only=production
# for installing dependencies
RUN npm install
# Bundle app source
COPY . ./
CMD [ "node", "json.js" ]
EXPOSE 3001

