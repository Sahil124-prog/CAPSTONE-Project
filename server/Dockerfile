# Use a lightweight Node 22 image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci --only=production

# Copy the rest of the backend code
COPY . .

# Expose the API port
EXPOSE 5002

# Start the Node.js server
CMD ["npm", "start"]

