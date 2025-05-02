# Stage 1: Build the React application
FROM node:20.18.1 as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Assuming your build script is 'npm run build' and output is in 'dist'
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built React app from the builder stage to the Nginx public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom nginx.conf if needed (optional, but good for SPAs)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for the web server
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
