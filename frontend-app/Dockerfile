FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy rest of the app
COPY . .

# Optional: Type-check only to catch TS errors early
# RUN pnpm run typecheck   # if you have "typecheck" script for `tsc --noEmit`

# 👇 Build fails here if there are TS errors
RUN pnpm run build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm (needed to run preview)
RUN npm install -g pnpm

# Copy built app from builder
COPY --from=builder /app /app

# Expose Vite preview port
EXPOSE 3000

# Start production server
CMD ["pnpm", "run", "preview", "--", "--port", "3000", "--host"]
