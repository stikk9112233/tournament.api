# Builder (Node 24 + python for pip)
FROM node:24-alpine AS builder
WORKDIR /app

# install python3 and pip (and build tools if native modules needed)
RUN apk add --no-cache python3 py3-pip build-base

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runner
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# install python in runner too if runtime needs pip
RUN apk add --no-cache python3 py3-pip

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
