#/usr/bin/env bash

NAME_PRIVATE="tr_channel-$(uuidgen)"
NAME_PUBLIC="tr_channel-$(uuidgen)"
./login.sh test_user test_user_password 2>/dev/null
./create-track.sh ${NAME_PRIVATE} description url false 2>/dev/null >/dev/null

./login.sh gets_user gets_user_password 2>/dev/null
./create-track.sh ${NAME_PUBLIC} description2 url2 false 2>/dev/null >/dev/null

./login.sh test_user test_user_password 2>/dev/null
[ 1 -eq $(./get-tracks.sh all 2>/dev/null | xmllint --xpath "count(//name[.='${NAME_PRIVATE}'])" -) ] && echo "Test passed" || echo "Test failed"
[ 1 -eq $(./get-tracks.sh all 2>/dev/null | xmllint --xpath "count(//name[.='${NAME_PUBLIC}'])" -) ] && echo "Test passed" || echo "Test failed"
[ 1 -eq $(./get-tracks.sh private 2>/dev/null | xmllint --xpath "count(//name[.='${NAME_PRIVATE}'])" -) ] && echo "Test passed" || echo "Test failed"
[ 1 -eq $(./get-tracks.sh public 2>/dev/null | xmllint --xpath "count(//name[.='${NAME_PUBLIC}'])" -) ] && echo "Test passed" || echo "Test failed"
[ 1 -eq $(./get-tracks.sh all 2>/dev/null | xmllint --xpath "count(//name[.='${NAME_PUBLIC}']/../access[.='r'])" -) ] && echo "Test passed" || echo "Test failed"
[ 1 -eq $(./get-tracks.sh all 2>/dev/null | xmllint --xpath "count(//name[.='${NAME_PRIVATE}']/../access[.='rw'])" -) ] && echo "Test passed" || echo "Test failed"


#psql -U geo2tag geo2tag -c "select count(*) from channel where name='${NAME}' and url='url2'" | head -n 3 | tail -n 1 | grep 1 || echo "Test failed" && echo "Test passed"
