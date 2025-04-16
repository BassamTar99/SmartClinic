# Build frontend
FROM node:18-alpine as frontend-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Build backend
FROM node:18-alpine as backend-builder

WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/client/build ./client/build

# Copy backend
COPY --from=backend-builder /app/server ./server
WORKDIR /app/server

# Install production dependencies
RUN npm install --production

# Expose ports
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["node", "index.js"] 