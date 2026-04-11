# Stage 1: Build Phase
FROM node:20-alpine AS build

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies (without lockfile since frontend lockfile is in monorepo root)
RUN pnpm install

# Copy source files
COPY . .

# Define build arguments that map to Vite env variables
ARG VITE_API_BASE_URL
ARG VITE_RAZORPAY_KEY_ID
ARG VITE_PAYMENT_MODE=fake
ARG VITE_ENABLE_QA_TOOLS=true

# Set them as ENV so vite utilizes them during build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_RAZORPAY_KEY_ID=${VITE_RAZORPAY_KEY_ID}
ENV VITE_PAYMENT_MODE=${VITE_PAYMENT_MODE}
ENV VITE_ENABLE_QA_TOOLS=${VITE_ENABLE_QA_TOOLS}

# Build the application
RUN pnpm run build

# Stage 2: Serve Phase
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
