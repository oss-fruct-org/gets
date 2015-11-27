sudo -u postgres createuser -s geo2tag
sudo -u postgres psql --command="ALTER USER geo2tag WITH PASSWORD 'geo2tag';"
sudo -u postgres createdb -O geo2tag geo2tag
sudo -u postgres psql --command="GRANT ALL privileges on database geo2tag to geo2tag;"
psql geo2tag -U geo2tag <create_the_tables.sql
