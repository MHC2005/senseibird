# Etapa 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i
COPY . .
RUN npm run build

# Etapa 2: runtime mínimo
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copiamos el standalone (incluye solo lo necesario de node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
# En standalone, Next expone server.js en la raíz copiada
CMD ["node", "server.js"]
