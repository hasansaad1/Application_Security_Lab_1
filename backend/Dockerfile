# Simple Express + Nodemon development image
FROM node:25-alpine AS development

# Workdir inside the container
WORKDIR /code

# (Optional) native builds (bcrypt/sharp/etc.) may need these
# RUN apk add --no-cache python3 make g++ libc6-compat

# Copy only package files first for better layer caching
COPY package*.json ./

# Install all deps (including devDependencies)
RUN npm install

# Copy the rest of the app (Compose Watch will keep it in sync)
COPY . .

# Give the 'node' user permission to write to the app directory
RUN chown -R node:node /code
# Switch to non-root user
USER node

# No port exposure here; Nginx will talk to this service internally.
# Your npm script should start Nodemon (see below).
CMD ["npm", "run", "start-watch"]