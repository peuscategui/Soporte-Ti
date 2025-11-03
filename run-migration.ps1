# Script PowerShell para ejecutar migración SQL
$env:PGPASSWORD = "postgres"
psql -h 192.168.40.129 -U postgres -d postgres -f add-ticket-fields.sql




