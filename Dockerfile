# Use a smaller base image for building
FROM node:20.18 as build

WORKDIR /app

# Copy only package.json and lockfile to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# -------- Production Image --------
FROM node:20.18-alpine as production

WORKDIR /app

# Copy only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built application from the build stage
COPY --from=build /app/dist ./dist

# Copy the .env file (optional, but usually unnecessary for Cloud Run)
# COPY .env .env

# Set environment variables (optional)
ENV NODE_ENV=production

# Expose port (optional, depends on your NestJS configuration)
EXPOSE 8080

# Set environment variable (optional but good practice)
ENV PORT=8080

# Run the app
CMD ["npm", "run", "start:prod"]
