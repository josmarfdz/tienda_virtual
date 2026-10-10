#!/usr/bin/env bash
set -e

echo "=== [1/4] Instalando PostgreSQL ==="
sudo apt update -y
sudo apt install -y postgresql postgresql-contrib

echo "=== [2/4] Configurando Base de Datos y Usuario ==="
# Idempotente: no elimina ni recrea la base si el script se ejecuta de nuevo.
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'api_usuarios'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE api_usuarios;"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = 'tienda_user'" | grep -q 1 || sudo -u postgres psql -c "CREATE USER tienda_user WITH ENCRYPTED PASSWORD 'admin123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE api_usuarios TO tienda_user;"
sudo -u postgres psql -d api_usuarios -c "GRANT ALL ON SCHEMA public TO tienda_user;"

echo "=== [3/4] Habilitando conexiones remotas ==="
PG_CONF=$(sudo find /etc/postgresql -name "postgresql.conf" | head -n 1)
PG_HBA=$(sudo find /etc/postgresql -name "pg_hba.conf" | head -n 1)

# Habilitar escucha en todas las interfaces
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF"
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF"

# Permitir conexiones remotas
# Restrinja pg_hba.conf y el Security Group para aceptar únicamente la IP privada
# o el Security Group del backend. No se abre PostgreSQL a todo Internet.
if ! sudo grep -q "tienda_user.*scram-sha-256" "$PG_HBA"; then
    echo "# Añade una regla específica para la IP privada del backend, por ejemplo:" | sudo tee -a "$PG_HBA"
    echo "# host api_usuarios tienda_user IP_PRIVADA_BACK/32 scram-sha-256" | sudo tee -a "$PG_HBA"
fi

sudo systemctl restart postgresql

echo "=== [4/4] Ejecutando api_usuarios.sql ==="
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_PATH="$SCRIPT_DIR/../database/api_usuarios.sql"

cat "$SCHEMA_PATH" | sudo -u postgres psql -d api_usuarios

echo "=== Aplicando migración de pedidos/precios ==="
MIGRATION_PATH="$SCRIPT_DIR/../database/migration_pedidos.sql"
sudo -u postgres psql -v ON_ERROR_STOP=1 -d api_usuarios -f "$MIGRATION_PATH"

echo "=== Aplicando migración del dashboard de ventas (estados + índices) ==="
ANALYTICS_PATH="$SCRIPT_DIR/../database/migration_analytics.sql"
sudo -u postgres psql -v ON_ERROR_STOP=1 -d api_usuarios -f "$ANALYTICS_PATH"

echo ""
echo "=========================================================="
echo "Base de datos configurada con éxito."
echo "IP Privada de esta máquina: $(hostname -I | awk '{print $1}')"
echo "=========================================================="
