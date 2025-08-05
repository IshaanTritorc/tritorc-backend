# Use Node.js LTS Alpine version for small image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Expose the server port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
