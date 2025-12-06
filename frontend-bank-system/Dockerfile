# Development Dockerfile for Vite frontend
FROM node:18-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite in development mode
CMD ["npm", "run", "dev"]
