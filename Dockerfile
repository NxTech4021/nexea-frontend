FROM node:20-alpine3.17 as development

WORKDIR /app

COPY package.json ./

# Install esbuild

RUN yarn install

COPY . .

EXPOSE 3031

CMD [ "yarn", "dev" ]
