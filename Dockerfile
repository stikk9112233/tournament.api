# Builder (Node 24 + python for pip)
FROM node:24-alpine AS builder
WORKDIR /app

# install python3 and pip (and build tools if native modules needed)
RUN apk add --no-cache python3 py3-pip build-base
# ensure pip points to pip3
RUN ln -s /usr/bin/pip3 /usr/bin/pip || true

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# install backend python requirements during build so runtime doesn't need to run pip
COPY backend/requirements.txt /app/backend/requirements.txt
RUN python3 -m pip install --no-cache-dir -r /app/backend/requirements.txt || true

# Runner
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# install python in runner too (in case backend uses it at runtime)
RUN apk add --no-cache python3 py3-pip
RUN ln -s /usr/bin/pip3 /usr/bin/pip || true

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
