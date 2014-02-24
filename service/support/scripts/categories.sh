#!/bin/bash

function addCategory {
    CA_NAME="$1"
    CA_DESC="$2"
    CA_URL="$3"

    params_add_ca="<methodCall><methodName>addCategory</methodName><params><param><struct><member><name>name</name><value>$CA_NAME</value></member><member><name>description</name><value>$CA_DESC</value></member><member><name>url</name><value>$CA_URL</value></member></struct></param></params></methodCall>"
    response_add_ca=`curl -s -d "$params_add_ca" http://geo2tag.cs.prv/gets/geo2tag.php`
    echo "Response (add category): "
    echo "$response_add_ca"
}

function getCategories {
    params_get_ca="<methodCall><methodName>getCategories</methodName></methodCall>"
    response_get_ca=`curl -s -d "$params_get_ca" http://geo2tag.cs.prv/gets/geo2tag.php`
    echo "Response (get categories): "
    echo "$response_get_ca"
}

function removeCategory {
    LOGIN="gets2"
    PASS="getsPWD"

    CA_ID="$1"

    params_remove_ca="<methodCall><methodName>deleteCategory</methodName><params><param><struct><member><name>id</name><value>$CA_ID</value></member><member><name>login</name><value>$LOGIN</value></member><member><name>password</name><value>$PASS</value></member></struct></param></params></methodCall>"
    response_remove_ca=`curl -s -d "$params_remove_ca" http://geo2tag.cs.prv/gets/geo2tag.php`
    echo "Response (remove category): "
    echo "$response_remove_ca"
}

if { [ $# == 4 ] && [ "$1" == "--add-category" ]; } then
    addCategory $2 $3 $4
    exit 0
fi

if { [ $# == 1 ] && [ "$1" == "--get-categories" ]; } then
    getCategories
    exit 0
fi

if { [ $# == 2 ] && [ "$1" == "--remove-category" ]; } then
    removeCategory $2
    exit 0
fi

echo "Usage: "
echo "Add category - ./categories.sh --add-category name description url"
echo "Get categories - ./categories.sh --get-categories"
echo "Remove category - ./categories.sh --remove-category id"
exit 0
