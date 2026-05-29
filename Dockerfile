FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install --include=dev

COPY server/prisma ./prisma

# Generate Prisma client with a dummy URL (only needs schema, not real DB)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

COPY server/ .
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]