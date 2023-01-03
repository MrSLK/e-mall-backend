FROM node:16-alpine
WORKDIR /
COPY package.json yarn-lock.json ./
RUN npm i --frozen-lockfile
COPY . .
EXPOSE 4000
CMD npm start