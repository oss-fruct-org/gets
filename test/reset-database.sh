#!/usr/bin/env bash

source ./config.sh

psql geo2tag geo2tag <<-EOF
DROP TABLE category;
DROP SEQUENCE category_seq;

DROP TABLE reset_password_tokens;

DROP TABLE sessions;
DROP SEQUENCE sessions_seq;

DROP TABLE signups;
DROP SEQUENCE signup_seq cascade;

DROP TABLE subscribe;

DROP TABLE tag;
DROP SEQUENCE tags_seq;

DROP TABLE tmp_users;

DROP TABLE track;
DROP SEQUENCE track_seq;

DROP TABLE channel;
DROP SEQUENCE channels_seq;

DROP TABLE users;
DROP SEQUENCE users_seq;
EOF

#psql geo2tag geo2tag -c "\i ${GEO2TAG_HOME}/scripts/base.sql"
#psql geo2tag geo2tag -c "\i ${GETS_HOME}/db/category.pg"
#psql geo2tag geo2tag -c "delete from users;"

#psql geo2tag geo2tag -c "insert into users (email, login, password) values ('gets_user@example.com', 'gets_user', 'gets_user_password');"
#psql geo2tag geo2tag -c "insert into users (email, login, password) values ('test_user@example.com', 'test_user', 'test_user_password');"
psql geo2tag geo2tag < testdb3.sql
