FROM node:22-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --production

COPY . .

EXPOSE 8080

CMD ["sh", "-c", "npm start"]
