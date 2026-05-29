FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install

COPY server/prisma ./prisma
RUN npx prisma generate

COPY server/ .
RUN npm run build

EXPOSE 3000

CMD npx prisma migrate deploy && npm start