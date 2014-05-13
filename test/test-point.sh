#/usr/bin/env bash

NAME="channel-$(uuidgen)"
PNAME="point-${NAME}"
./login.sh 2>/dev/null

./create-track.sh ${NAME} description url true 2>/dev/null >/dev/null
./add-point.sh ${NAME} ${PNAME} description1 url1 60 30

psql -U geo2tag geo2tag -c "select count(*) from tag where label='${PNAME}'" | head -n 3 | tail -n 1 | grep 1 && echo "Test passed" || echo "Test failed"

./delete-point.sh ${NAME} ${PNAME} 2>/dev/null >/dev/null
psql -U geo2tag geo2tag -c "select count(*) from tag where label='${PNAME}'" | head -n 3 | tail -n 1 | grep 0 && echo "Test passed" || echo "Test failed"
