# ─────────────────────────────────────────────────────────────────────────────
# Multi-stage Dockerfile for keyfreestay-landing
#   • target=dev      → Vite dev server with hot reload (port 5173)
#   • target=prod     → static build served by nginx (port 80) — default
# ─────────────────────────────────────────────────────────────────────────────

# ── 1. deps: install once, cached separately from app code ───────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# ── 2. dev: hot-reload server ────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ── 3. build: produce static files ───────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── 4. prod: nginx serving /usr/share/nginx/html ─────────────────────────────
FROM nginx:1.27-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
