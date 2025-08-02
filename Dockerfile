FROM node:lts-bookworm-slim

# env
ENV DEBIAN_FRONTEND=noninteractive
ARG PORT=3000
ENV PORT=${PORT}

# Install system-wide dependencies (as root)
RUN apt-get update || apt-get update && \
    apt-get install -y --no-install-recommends \
    bash \
    curl \
    wget \
    git \
    unzip \
    procps \
    net-tools \
    iputils-ping \
    ca-certificates \
    python3 \
    python3-pip \
    sudo \
    htop \
    neofetch \
    lsof \
    cron && \
    rm -rf /var/lib/apt/lists/*

# Install sshx (as root)
RUN curl -sSf https://sshx.io/get | sh

# Create the 'user' user. This is done as root during build. 
RUN useradd -m -u 1001 user && \
    usermod -aG sudo user && \
    echo "user ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

WORKDIR /app

# Copy application files into the container at /app
COPY src/ ./src/
COPY package*.json ./
RUN npm ci --only=production

# Copy the entrypoint and start scripts to /app and make them executable
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Ensure /app and its contents are owned by 'user'. This is crucial.
RUN chown -R user:user /app

EXPOSE ${PORT}

# Set the user for subsequent instructions (CMD, ENTRYPOINT)
# By default, run as 'root'. If non-root is needed, user must override with --user user

# Set the entrypoint to our new entrypoint.sh
ENTRYPOINT ["/app/start.sh"]

# CMD will now be the arguments to the ENTRYPOINT (if any, in this case, none needed)
CMD []