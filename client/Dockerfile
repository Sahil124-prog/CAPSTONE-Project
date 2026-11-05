# Use a lightweight Node 22 image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the frontend code and build the React/Vite project
COPY . .
RUN npm run build

# Install a lightweight static server to serve the React application
RUN npm install -g serve

# Expose the frontend port (matching your Vite default)
EXPOSE 5173

# Start the server, routing all requests to index.html (required for React Router)
CMD ["serve", "-s", "dist", "-l", "5173"]