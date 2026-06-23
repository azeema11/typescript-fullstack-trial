FROM node:20-alpine

# Install OpenSSL for Prisma client compatibility in Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and Prisma schema
COPY prisma ./prisma/
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Apply database migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
