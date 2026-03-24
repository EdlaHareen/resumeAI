# Use Node 20 slim for better compatibility with native bindings (like Tailwind v4)
FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port Vite runs on (default 5173)
EXPOSE 5173

# Reinstall node_modules at startup so host volume mounts don't overwrite
# Linux-native bindings (e.g. @tailwindcss/oxide).
CMD ["sh", "-c", "npm install && npm run dev -- --host"]
