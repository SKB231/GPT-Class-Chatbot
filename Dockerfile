FROM node:14


WORKDIR /app

COPY package*.json ./


COPY ./Swift_Backend/. .
RUN npm install

CMD ["npm", "start"]
