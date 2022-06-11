FROM hub.fuxi.netease.com/danlu/node:16-alpine as builder
WORKDIR '/app'
COPY package.json .
RUN yarn install
COPY . .

EXPOSE 3000

CMD ["node", "./app.js"]

