# Use Node 18 for compatibility
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port Vite runs on (default 5173)
EXPOSE 5173

# Start Vite in host mode so it's accessible from the host machine
CMD ["npm", "run", "dev", "--", "--host"]
