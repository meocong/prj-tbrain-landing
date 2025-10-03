FROM node:20-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Install git (and any other dependencies)
RUN apk add --no-cache git

# Sao chép file package.json và yarn.lock vào thư mục làm việc
COPY package.json yarn.lock* package-lock.json* ./

# Cài đặt dependencies của dự án
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Cấu hình biến môi trường cho prod
ENV NODE_ENV=production

# Expose cổng mà ứng dụng Next.js sẽ chạy

CMD ["npm","run","start"]


