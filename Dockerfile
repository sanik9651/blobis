# Use official Python runtime as base image
FROM python:3.11-slim

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install dependencies
RUN npm install
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 10000

# Start command
CMD ["uvicorn", "backend:app", "--host", "0.0.0.0", "--port", "10000"]
