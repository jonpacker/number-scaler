FROM node:8
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm i 
EXPOSE 3001
CMD node server
