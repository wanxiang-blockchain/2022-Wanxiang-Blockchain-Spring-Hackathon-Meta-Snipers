FROM hub.fuxi.netease.com/danlu/node:16-alpine as builder
WORKDIR '/app'
COPY package.json .
RUN yarn install
COPY . .
RUN yarn build

FROM hub.fuxi.netease.com/danlu/nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
