# Simple Next.js Docker image
FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package*.json ./
COPY mcp-server/package*.json ./mcp-server/

# Install dependencies
RUN npm ci --only=production
RUN cd mcp-server && npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build
RUN cd mcp-server && npm run build

# Create volume for database persistence
VOLUME ["/app/data"]

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["npm", "start"]
