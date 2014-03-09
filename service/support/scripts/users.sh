#!/bin/bash

function addUser {
	LOGIN="$1"
	PASS="$2"
	EMAIL="$3"

    params_add_user="<methodCall><methodName>addUser</methodName><params><param><struct><member><name>login</name><value>$LOGIN</value></member><member><name>password</name><value>$PASS</value></member><member><name>email</name><value>$EMAIL</value></member></struct></param></params></methodCall>"
    response_add_user=`curl -s -d $params_add_user http://geo2tag.cs.prv/gets/geo2tag.php`
    echo "Response (add user): "
    echo "$response_add_user"
}

if { [ $# == 4 ] && [ "$1" == "--add-user" ]; } then
    addUser $2 $3 $4
    exit 0
fi

echo "Usage: "
echo "Add user - ./users.sh --add-user login password email"
exit 0
