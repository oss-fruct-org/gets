# Скрипт создания пользователя admin и категории с id=1

psql geo2tag -U geo2tag <<< "insert into users (login, email, password) values('admin', 'admin@localhost', 'admin');"

psql geo2tag -U geo2tag <<< "insert into category (id, name, owner_id) select 1, 'default', id from users where login='admin';"
