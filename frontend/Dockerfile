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

# Give the 'node' user permission to write to the app directory
RUN chown -R node:node /code
# Switch to non-root user
USER node


# Run the Next.js dev server
CMD ["npm", "run", "dev"]