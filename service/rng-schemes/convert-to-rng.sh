#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: ${0} <path to trang jar>"
    exit 1
fi

TRANG=$1

java -jar $TRANG deletePoint.rnc deletePoint.rng
