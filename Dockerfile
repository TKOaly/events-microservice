FROM node:20-alpine

WORKDIR /app
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
RUN yarn

RUN yarn build

EXPOSE 3001

CMD ["yarn", "start"]
