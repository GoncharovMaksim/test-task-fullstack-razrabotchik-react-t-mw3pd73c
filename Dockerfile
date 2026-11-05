FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY package*.json ./
RUN npm ci --only=production || npm install --omit=dev

COPY . .
RUN npm run build || true

EXPOSE 3000

CMD ["npm", "start"]
