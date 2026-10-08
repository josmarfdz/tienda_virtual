#!/usr/bin/env bash
set -e

DB_HOST="$1"
if [ -z "$DB_HOST" ]; then
    read -p "Ingresa la IP (Privada) de la máquina de Base de Datos: " DB_HOST
fi

if [ -z "$DB_HOST" ]; then
    echo "Error: La IP de la base de datos es requerida."
    exit 1
fi

echo "=== [1/3] Instalando Node.js 20 ==="
sudo apt update -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "=== [2/3] Instalando dependencias de Backend ==="
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend/user-service"

cd "$BACKEND_DIR"
npm install

echo "=== [3/3] Generando archivo .env ==="
cat <<EOF > .env
DB_HOST=$DB_HOST
DB_USER=tienda_user
DB_PASSWORD=admin123
DB_NAME=api_usuarios
DB_PORT=5432
JWT_SECRET=super_secreto_jwt_2026
PORT=3000
EOF

echo ""
echo "=========================================================="
echo "Backend configurado con éxito apuntando a DB: $DB_HOST"
echo "IP Pública de esta máquina (para el frontend): $(curl -s -m 3 ifconfig.me || hostname -I | awk '{print $1}')"
echo "Iniciando servidor en puerto 3000..."
echo "=========================================================="

node src/server.js
##
