FROM node:20-alpine3.17 AS development

WORKDIR /app

COPY package.json ./

# Install dependencies with increased network timeout
# Retry once if the first attempt fails
RUN yarn install --network-timeout 300000

COPY . .

EXPOSE 3031

CMD [ "yarn", "dev" ]
