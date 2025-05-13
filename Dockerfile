# Use Node.js image as a build environment
FROM node:22.13-alpine3.20 as node-helper

# Set profile/build environment (default: development)
ARG PROFILE=development
ARG SRCS=target/*

# Install necessary dependencies
RUN apk update

# Set working directory
WORKDIR /app
RUN mkdir -p front
COPY . front
RUN npm cache clean --force

RUN npm install -g @angular/cli
# ./node_modules/@angular/cli/bin/
RUN cd front && yarn install && ng build --configuration=$PROFILE
# RUN node main.js &

FROM nginx:1.20 as ngx

#copying compiled code from dist to nginx folder for serving
COPY --from=node-helper /app/front/dist/pms-ui/browser /usr/share/nginx/html

#copying nginx config from local to image
COPY .gitlab/nginx.conf /etc/nginx/nginx.conf

#exposing internal port
EXPOSE 4200 80

# Set runtime environment variable (will be overridden by docker-compose)
ENV BASE_URL="https://localhost:8080/"

CMD ["/bin/sh", "-c", "envsubst '$BASE_URL' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.tmp && mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]


