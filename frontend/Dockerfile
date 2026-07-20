# Production Dockerfile for frontend (Next.js)
# Path: frontend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
# copy package files
COPY frontend/package*.json ./
RUN npm ci
# copy source
COPY frontend .
# build
RUN npm run build

# production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
RUN npm ci --production
EXPOSE 3000
CMD ["npm","run","start"]
