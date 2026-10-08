#!/usr/bin/env bash
set -e

BACKEND_IP="$1"
if [ -z "$BACKEND_IP" ]; then
    read -p "Ingresa la IP Pública de la máquina de Backend: " BACKEND_IP
fi

if [ -z "$BACKEND_IP" ]; then
    echo "Error: La IP del backend es requerida."
    exit 1
fi

echo "=== [1/3] Instalando Node.js 20 ==="
sudo apt update -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "=== [2/3] Instalando dependencias de Frontend ==="
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/../frontend/user-client"

cd "$FRONTEND_DIR"
npm install

echo "=== [3/3] Generando archivo .env ==="
cat <<EOF > .env
VITE_API_URL=http://$BACKEND_IP:3000
EOF

echo ""
echo "=========================================================="
echo "Frontend configurado con éxito apuntando a Backend: $BACKEND_IP:3000"
echo "Iniciando Vite en puerto 5173..."
echo "Abre en tu navegador: http://$(curl -s -m 3 ifconfig.me || hostname -I | awk '{print $1}'):5173"
echo "=========================================================="

npm run dev
