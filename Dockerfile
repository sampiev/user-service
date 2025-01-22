FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./ 

RUN yarn install --frozen-lockfile

COPY prisma ./prisma
RUN yarn prisma generate

COPY . .

RUN yarn build

CMD ["yarn", "start:dev"]