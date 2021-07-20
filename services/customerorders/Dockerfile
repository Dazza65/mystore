FROM node:10.16.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./src/* ./

EXPOSE 8080

CMD [ "node", "service.js" ]
