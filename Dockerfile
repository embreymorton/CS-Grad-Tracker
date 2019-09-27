
#Define node version to pull
#test others using docker ignore or commenting out a connection stuff
FROM node:latest

# Directory to hold app code
WORKDIR /CS-Grad-Tracking

#Dupe the dependency file
COPY package.json /CS-Grad-Tracking

#Install from package
RUN npm install

#Bundle into docker image
COPY . .

#Exposed port
EXPOSE 8080:8080

#Commands to run
CMD [ "npm", "start" ]

