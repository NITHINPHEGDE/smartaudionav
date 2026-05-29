FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install --include=dev

COPY server/prisma ./prisma

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

COPY server/ .
RUN npm run build

# Create upload directories
RUN mkdir -p uploads/audio uploads/images

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]