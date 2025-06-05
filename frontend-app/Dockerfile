FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy rest of the app and build
COPY . .
RUN pnpm run build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm (needed to run preview)
RUN npm install -g pnpm

# Copy only what is needed to run preview
COPY --from=builder /app /app

# Expose Vite preview port
EXPOSE 3000

# Run Vite's production server
CMD ["pnpm", "run", "preview", "--", "--port", "3000", "--host"]
