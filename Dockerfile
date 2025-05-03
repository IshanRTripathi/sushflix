# Stage 1: Build the React application
FROM node:20.18.1 as builder

WORKDIR /app

# Accept build arguments
ARG VITE_BACKEND_URL
ARG VITE_CLIENT_ID

# Set environment variables for the build process
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID

# Copy package files first for better caching
COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Generate placeholder images
RUN node scripts/generate-placeholders.js

# Build the application
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