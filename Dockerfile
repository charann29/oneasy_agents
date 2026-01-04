FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Skip environment validation during build (env vars will be provided at runtime)
ENV SKIP_ENV_VALIDATION=1
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
