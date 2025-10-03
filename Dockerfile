
FROM node:18-alpine

# กำหนด working directory
WORKDIR /app

# copy package.json + lock file
COPY package*.json ./

# install dependencies
RUN npm install --production

# copy source code ทั้งหมด
COPY . .

# backend ใช้ port 5000
EXPOSE 5000

# run express app
CMD ["node", "server.js"]
