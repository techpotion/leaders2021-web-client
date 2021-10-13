### Build ####
FROM node:alpine AS build

WORKDIR /usr/src/app
COPY package.json package-lock.json ./

RUN npm install --loglevel=error

COPY . .
RUN npm run build

### Run ###
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/web-client /usr/share/nginx/html
