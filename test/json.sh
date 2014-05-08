#!/bin/bash
python2 -c "import json,sys;obj=json.load(sys.stdin);print obj[\"${1}\"]"
