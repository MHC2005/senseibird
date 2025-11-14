#creamos a partir de una version especifica (NO LATEST)
FROM node:20.10.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

# instalar todas las dependencias (incluyendo dev)
RUN npm install --include=dev

# copiar código y build
COPY . .

RUN npm run build


FROM node:20.10.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup

# copiar standalone (server.js, node_modules necesarios)
COPY --from=builder /app/.next/standalone ./

COPY --from=builder /app/.next/static ./.next/static

COPY public ./public

COPY package*.json ./

RUN npm install --omit=dev

USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
