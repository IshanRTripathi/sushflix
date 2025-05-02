# Use an official Node.js runtime as the base image
FROM node:20.18.1

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if using) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code to the working directory
COPY . .

# Expose the port your backend server is listening on (likely 8080 based on your server.js)
EXPOSE 8080

# Define the command to run your application
CMD [ "node", "server.js" ]
