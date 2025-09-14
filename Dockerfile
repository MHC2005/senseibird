# Etapa 1: build
FROM node:20-alpine AS builder
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_APP_TITLE=${NEXT_PUBLIC_APP_TITLE}
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
