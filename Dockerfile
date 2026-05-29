FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install --include=dev

COPY server/prisma ./prisma
RUN npx prisma generate

COPY server/ .
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]