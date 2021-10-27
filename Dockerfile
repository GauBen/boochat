FROM node:lts-alpine AS build
WORKDIR /app
COPY . .
RUN yarn install --immutable
RUN yarn build
EXPOSE 3001
# TODO: use env vars
# ENV PORT=3001
CMD ["yarn", "start"]
