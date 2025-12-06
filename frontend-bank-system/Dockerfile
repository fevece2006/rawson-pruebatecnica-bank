# Development Dockerfile for Vite frontend
FROM node:18-alpine
WORKDIR /app

# Copy package files and install dependencies
# package-lock.json is optional
COPY package.json ./
COPY package-lock.json* ./
RUN npm install

# Copy application source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite in development mode
CMD ["npm", "run", "dev"]
