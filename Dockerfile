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

# Copy the custom nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server (documentation only)
EXPOSE 80

# Command to run Nginx, substituting the PORT environment variable using sed (shell form)
CMD sed -i "s|LISTEN_PORT|$PORT|g" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'