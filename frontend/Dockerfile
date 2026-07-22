# Production Dockerfile for frontend (Next.js)
# Path: frontend/Dockerfile

FROM node:18-alpine AS builder
WORKDIR /app

# copy package files (from the current build context)
COPY package*.json ./
RUN npm ci

# copy source (the entire frontend folder contents when build context is frontend)
COPY . .

# build the Next.js app
RUN npm run build

# production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# copy built artifacts from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# install production deps
RUN npm ci --production

EXPOSE 3000

# Start using the PORT that Railway sets
CMD ["sh","-c","npm run start -- -p $PORT"]
