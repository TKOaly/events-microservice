FROM node:12-alpine

WORKDIR /app
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
RUN yarn --dev

EXPOSE 3001

CMD ["yarn", "start"]
