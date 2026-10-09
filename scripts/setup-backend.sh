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

echo "=== [3/3] Configuración de entorno ==="
# Los valores SMTP se pueden exportar antes de ejecutar este script.
# Si se dejan vacíos, la API funcionará pero los correos se omitirán con una advertencia.
SMTP_HOST_VALUE="${SMTP_HOST:-}"
SMTP_PORT_VALUE="${SMTP_PORT:-2525}"
SMTP_USER_VALUE="${SMTP_USER:-}"
SMTP_PASS_VALUE="${SMTP_PASS:-}"
EMAIL_FROM_VALUE="${EMAIL_FROM:-$SMTP_USER_VALUE}"
ADMIN_EMAIL_VALUE="${ADMIN_EMAIL:-}"
PAYMENT_INSTRUCTIONS_VALUE="${PAYMENT_INSTRUCTIONS:-Transferencia de prueba: solicita al administrador los datos de pago de E-Tienda. No realices pagos reales en este entorno académico.}"

cat <<EOF > .env
DB_HOST=$DB_HOST
DB_USER=tienda_user
DB_PASSWORD=admin123
DB_NAME=api_usuarios
DB_PORT=5432
JWT_SECRET=super_secreto_jwt_2026
PORT=3000
SMTP_HOST=$SMTP_HOST_VALUE
SMTP_PORT=$SMTP_PORT_VALUE
SMTP_SECURE=${SMTP_SECURE:-false}
SMTP_USER=$SMTP_USER_VALUE
SMTP_PASS=$SMTP_PASS_VALUE
EMAIL_FROM=$EMAIL_FROM_VALUE
ADMIN_EMAIL=$ADMIN_EMAIL_VALUE
PAYMENT_INSTRUCTIONS=$PAYMENT_INSTRUCTIONS_VALUE
EOF
chmod 600 .env
echo "Archivo .env creado. SMTP configurado: $([ -n "$SMTP_HOST_VALUE" ] && echo sí || echo no)"

echo ""
echo "=========================================================="
echo "Backend configurado con éxito apuntando a DB: $DB_HOST"
echo "IP Pública de esta máquina (para el frontend): $(curl -s -m 3 ifconfig.me || hostname -I | awk '{print $1}')"
echo "Iniciando servidor en puerto 3000..."
echo "=========================================================="

node src/server.js
