# Stage 1 - the build process
FROM node:14-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2 - the production environment
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# new
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5001
CMD ["nginx", "-g", "daemon off;"]

