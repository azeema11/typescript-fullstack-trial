FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy configuration and source files
COPY tsconfig.json tailwind.config.ts postcss.config.mjs next.config.mjs .eslintrc.json ./
COPY src ./src/

# Copy .env file for build-time environment variables
COPY .env ./

# Build Next.js app
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start Next.js server
CMD ["npm", "start"]
