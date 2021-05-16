FROM  registry1-docker-io.repo.lab.pl.alcatel-lucent.com/library/node:12
# set working directory to react
WORKDIR /react
# add `/react/node_modules/.bin` to $PATH
ENV PATH /react/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /react/package.json
COPY public /react/public
COPY src /react/src
COPY .npmrc /react/.npmrc
COPY .env /react/.env
RUN npm install
RUN npm install redux
RUN npm install react-redux
# COPY build /react/build
#COPY package-lock.json /react/package-lock.json
RUN node -v
RUN npm run build
EXPOSE 3000
# start app
CMD ["npm", "start"]