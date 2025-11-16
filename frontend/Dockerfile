FROM node:25-alpine AS development

WORKDIR /code

# Install system deps needed by Next.js (for sharp, etc.)
RUN apk add --no-cache libc6-compat

# Copy package files first (better caching)
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

# Install all dependencies
RUN npm ci

# Copy the rest of the app
COPY . .

# Run the Next.js dev server
CMD ["npm", "run", "dev"]
