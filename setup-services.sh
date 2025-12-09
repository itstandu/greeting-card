#!/bin/bash

set -e

# Load env
set -o allexport
source .env
set +o allexport

APP_NAME="greeting-card"
APP_DIR=$(pwd)
API_DIR="${APP_DIR}/greeting-card-api"
WEB_DIR="${APP_DIR}/greeting-card-web"
USER=$(whoami)

PORT_API=${PORT_API:-8080}
PORT_WEB=${PORT_WEB:-3333}

echo ""
echo "=== Greeting Card Services Setup ==="
echo "API Port: ${PORT_API}"
echo "Web Port: ${PORT_WEB}"
echo ""

# ========== 1. Install dependencies ==========
echo "[1/6] Checking dependencies..."

# Install Node.js if not exists
if ! command -v node >/dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Install PM2 globally
if ! command -v pm2 >/dev/null; then
  echo "Installing PM2..."
  sudo npm install -g pm2
fi

# Install Java 21 if not exists
if ! command -v java >/dev/null; then
  echo "Installing Java 21..."
  sudo apt-get update
  sudo apt-get install -y openjdk-21-jdk
fi

echo "Node: $(node -v)"
echo "PM2: $(pm2 -v)"
echo "Java: $(java -version 2>&1 | head -1)"

# ========== 2. Build Spring Boot ==========
echo ""
echo "[2/6] Building Spring Boot API..."
cd "$API_DIR"
./mvnw clean package -DskipTests
JAR_FILE=$(ls target/*.jar | grep -v original | head -1)
JAR_NAME=$(basename "$JAR_FILE")
echo "Built: $JAR_NAME"

# ========== 3. Build NextJS ==========
echo ""
echo "[3/6] Building NextJS Web..."
cd "$WEB_DIR"
npm install
npm run build
echo "NextJS built successfully"

# ========== 4. Setup systemd for Spring Boot ==========
echo ""
echo "[4/6] Setting up systemd for Spring Boot API..."

sudo tee /etc/systemd/system/${APP_NAME}-api.service > /dev/null << EOF
[Unit]
Description=Greeting Card API (Spring Boot)
After=network.target

[Service]
Type=simple
User=${USER}
WorkingDirectory=${API_DIR}
ExecStart=/usr/bin/java -jar ${API_DIR}/target/${JAR_NAME} --server.port=${PORT_API}
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${APP_NAME}-api

# Environment
Environment=SPRING_PROFILES_ACTIVE=prod
EnvironmentFile=${APP_DIR}/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ${APP_NAME}-api
echo "Created: /etc/systemd/system/${APP_NAME}-api.service"

# ========== 5. Setup PM2 for NextJS ==========
echo ""
echo "[5/6] Setting up PM2 for NextJS Web..."

cd "$WEB_DIR"

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}-web',
    script: 'npm',
    args: 'start',
    cwd: '${WEB_DIR}',
    env: {
      NODE_ENV: 'production',
      PORT: ${PORT_WEB}
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '${WEB_DIR}/logs/pm2-error.log',
    out_file: '${WEB_DIR}/logs/pm2-out.log',
    log_file: '${WEB_DIR}/logs/pm2-combined.log',
    time: true
  }]
};
EOF

mkdir -p "${WEB_DIR}/logs"
echo "Created: ${WEB_DIR}/ecosystem.config.js"

# Setup PM2 startup
pm2 startup systemd -u $USER --hp $HOME | tail -1 | sudo bash || true
echo "PM2 startup configured"

# ========== 6. Create control scripts ==========
echo ""
echo "[6/6] Creating control scripts..."

cd "$APP_DIR"

# Start all services
cat > start-services.sh << 'EOF'
#!/bin/bash
echo "Starting Greeting Card services..."

# Start API (systemd)
sudo systemctl start greeting-card-api
echo "API started (systemd)"

# Start Web (PM2)
cd greeting-card-web
pm2 start ecosystem.config.js
pm2 save
echo "Web started (PM2)"

echo ""
echo "Services started!"
echo "API: http://localhost:${PORT_API:-8080}"
echo "Web: http://localhost:${PORT_WEB:-3000}"
EOF

# Stop all services
cat > stop-services.sh << 'EOF'
#!/bin/bash
echo "Stopping Greeting Card services..."

sudo systemctl stop greeting-card-api
pm2 stop greeting-card-web

echo "Services stopped!"
EOF

# Restart/Deploy all services (with git pull & rebuild)
cat > restart-services.sh << 'EOFR'
#!/bin/bash
set -e

APP_DIR=$(cd "$(dirname "$0")" && pwd)
API_DIR="${APP_DIR}/greeting-card-api"
WEB_DIR="${APP_DIR}/greeting-card-web"

echo ""
echo "=== Greeting Card Deploy ==="
echo ""

# 1. Git pull
echo "[1/5] Pulling latest code..."
cd "$APP_DIR"
git fetch --all
git pull

# 2. Stop services
echo ""
echo "[2/5] Stopping services..."
sudo systemctl stop greeting-card-api || true
pm2 stop greeting-card-web || true

# 3. Build API
echo ""
echo "[3/5] Building API..."
cd "$API_DIR"
./mvnw clean package -DskipTests

# 4. Build Web
echo ""
echo "[4/5] Building Web..."
cd "$WEB_DIR"
npm install
npm run build

# 5. Start services
echo ""
echo "[5/5] Starting services..."
sudo systemctl start greeting-card-api
cd "$WEB_DIR"
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "=== Deploy complete! ==="
echo ""
EOFR

# Status check
cat > status-services.sh << 'EOF'
#!/bin/bash
echo "=== Greeting Card Services Status ==="
echo ""
echo "--- API (systemd) ---"
sudo systemctl status greeting-card-api --no-pager -l
echo ""
echo "--- Web (PM2) ---"
pm2 status
EOF

# View logs
cat > logs-services.sh << 'EOF'
#!/bin/bash
echo "=== Greeting Card Logs ==="
echo ""
echo "--- API Logs (last 50 lines) ---"
sudo journalctl -u greeting-card-api -n 50 --no-pager
echo ""
echo "--- Web Logs ---"
pm2 logs greeting-card-web --lines 50 --nostream
EOF

chmod +x start-services.sh stop-services.sh restart-services.sh status-services.sh logs-services.sh

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "Control scripts created:"
echo "  ./start-services.sh   - Start all services"
echo "  ./stop-services.sh    - Stop all services"
echo "  ./restart-services.sh - Restart all services"
echo "  ./status-services.sh  - Check status"
echo "  ./logs-services.sh    - View logs"
echo ""
echo "To start now, run: ./start-services.sh"
echo ""
