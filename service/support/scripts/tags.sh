#!/bin/bash

GETS_LOGIN="gets2"
GETS_PASSWORD="getsPWD"

auth_token=`cat token.txt 2>/dev/null`

function login_gets {
    echo "Login to GeTS..."
    params_login="<request><params><login>$GETS_LOGIN</login><password>$GETS_PASSWORD</password></params></request>"
    response_login=`curl -s -d $params_login http://oss.fruct.org/projects/gets/service/login.php`        
    code_login=`echo $response_login | xmllint --xpath '//code/text()' -`
    if [ $code_login -ne 0 ]; then
        message_login=`echo $response_login | xmllint --xpath '//message/text()' -`
        echo "Login failed $message_login"
        exit 1
    fi
    auth_token=`echo $response_login | xmllint --xpath '//auth_token/text()' -`
    echo "Auth_token: $auth_token"
	echo $auth_token > token.txt
}

function addTag {
	CH_NAME="$1"
    TAG_NAME="$2"
    TAG_DESC="$3"
    TAG_LINK="$4"
    TAG_LAT="$5"
    TAG_LONG="$6"
	TAG_ALT="$7"
	
	TAG_TIME=`date +"%d %m %Y %H:%M:%S.%3N"`

    params_add_tag="<request><params><auth_token>$auth_token</auth_token><channel>$CH_NAME</channel><title>$TAG_NAME</title><description>$TAG_DESC</description><link>$TAG_LINK</link><latitude>$TAG_LAT</latitude><longitude>$TAG_LONG</longitude><altitude>$TAG_ALT</altitude><time>$TAG_TIME</time></params></request>"
    response_add_tag=`curl -s -d "$params_add_tag" http://kappa.cs.karelia.ru/~davydovs/gets/addPoint.php`
    echo "Response (add tag): "
    echo "$response_add_tag"
}

function getTags {
	CH_NAME="$1"
	AMOUNT=10000

    params_get_tags="{\"auth_token\":\"$auth_token\",\"channel\":\"$CH_NAME\", \"amount\":$AMOUNT}"
    response_get_tags=`curl -s -d "$params_get_tags" http://geo2tag.cs.prv/service/filterChannel`
    echo "Response (get tags: "
    echo "$response_get_tags"
}

if { [ $# == 8 ] && [ "$1" == "--add-tag" ]; } then
    addTag $2 $3 $4 $5 $6 $7 $8
    exit 0
fi

if { [ $# == 2 ] && [ "$1" == "--get-tags" ]; } then
    getTags $2
    exit 0
fi

echo "Usage: "
echo "Login ./tags.sh --login"
echo "Add tag - ./tags.sh --add-tag channel title description link latitude longitude altitude"
echo "Get tags - ./tags.sh --get-tags channel"
exit 0
