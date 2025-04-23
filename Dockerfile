# ---------- Build React client ----------
FROM node:20 AS client-build

WORKDIR /app/client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---------- Build server ----------
FROM node:20 AS server-build

WORKDIR /app/server
COPY server/package.json ./
RUN npm install --production
COPY server/ ./

# ---------- Final image ----------
FROM node:20-slim

WORKDIR /app

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Copy server code
COPY --from=server-build /app/server ./

# Copy built React app to /app/build (adjust if your server expects static elsewhere)
COPY --from=client-build /app/client/build ./build

# Copy Python scripts and models
COPY server/scripts ./scripts
COPY server/models ./models

# Install Python dependencies (you must create server/scripts/requirements.txt)
COPY server/scripts/requirements.txt ./scripts/requirements.txt
RUN pip3 install --no-cache-dir -r ./scripts/requirements.txt

# Expose port (change if your server uses a different port)
EXPOSE 5000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "index.js"]