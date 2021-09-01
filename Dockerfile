FROM node:lts-alpine AS build
WORKDIR /app
COPY . .
RUN yarn install --immutable
RUN yarn build
EXPOSE 3000
ENV PORT=3000
CMD ["yarn", "start"]
