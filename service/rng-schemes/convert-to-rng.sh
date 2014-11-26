#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: ${0} <path to trang jar>"
    exit 1
fi

TRANG=$1

java -jar $TRANG deletePoint.rnc deletePoint.rng
java -jar $TRANG publish.rnc publish.rng
java -jar $TRANG unpublish.rnc unpublish.rng