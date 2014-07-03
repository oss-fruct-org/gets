#/usr/bin/env bash

NAME="channel-$(uuidgen)"
./login.sh 2>/dev/null

./create-track.sh ${NAME} description url true 2>/dev/null >/dev/null
psql -U geo2tag geo2tag -c "select count(*) from channel where name='${NAME}'" | head -n 3 | tail -n 1 | grep 1 || echo "Test failed" && echo "Test passed"

./create-track.sh ${NAME} description2 url2 false 2>/dev/null >/dev/null
psql -U geo2tag geo2tag -c "select count(*) from channel where name='${NAME}' and url='url2'" | head -n 3 | tail -n 1 | grep 0 || echo "Test failed" && echo "Test passed"

./create-track.sh ${NAME} description2 url2 true 2>/dev/null >/dev/null
psql -U geo2tag geo2tag -c "select count(*) from channel where name='${NAME}' and url='url2'" | head -n 3 | tail -n 1 | grep 1 || echo "Test failed" && echo "Test passed"
