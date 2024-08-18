FROM node:latest

WORKDIR /project

COPY package.json .

RUN npm install 

COPY . .

CMD ["node" ,"server.js"]