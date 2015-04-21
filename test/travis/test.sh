#!/bin/bash

php -S localhost:8000 -t service -c test/travis/php.ini &
sleep 0.1
python3 test/test_test.py || exit 1
