#!/bin/bash

php -S localhost:8000 -t service -c test/travis/php.ini &
sleep 0.1
python3 test/test_point.py || exit 1
python3 test/test_track.py || exit 1
