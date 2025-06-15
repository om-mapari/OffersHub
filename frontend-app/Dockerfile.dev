FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only package.json & lock for install
COPY package.json pnpm-lock.yaml ./

# Install deps
RUN pnpm install

# Don't copy project files here — volumes will mount them

# Expose Vite dev port
EXPOSE 3000

# Start the dev server
CMD ["pnpm", "run", "dev"]
