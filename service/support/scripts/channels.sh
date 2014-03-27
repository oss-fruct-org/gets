#!/bin/bash

GETS_LOGIN="gets2"
GETS_PASSWORD="getsPWD"

auth_token=`cat token.txt 2>/dev/null`

function login_gets {
    echo "Login to GeTS..."
    params_login="<request><params><login>$GETS_LOGIN</login><password>$GETS_PASSWORD</password></params></request>"
    response_login=`curl -s -d "$params_login" http://oss.fruct.org/projects/gets/service/login.php`        
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

function addChannel {
    CH_NAME="$1"
    CH_DESC="$2"
    CH_LANG="$3"
    CH_URL="$4"
    CH_CA_ID="$5"
    CH_ACTIV_RAD="$6"

    params_add_ch="<request><params><auth_token>$auth_token</auth_token><name>$CH_NAME</name><description>$CH_DESC</description><url>$CH_URL</url><lang>$CH_LANG</lang><category_id>$CH_CA_ID</category_id><active_radius>$CH_ACTIV_RAD</active_radius></params></request>"
    response_add_ch=`curl -s -d "$params_add_ch" http://oss.fruct.org/projects/gets/service/addChannel.php`
    echo "Response (add channel): "
    echo "$response_add_ch"
}

function getChannels {
    params_get_ch="{\"auth_token\":\"$auth_token\"}"
    response_get_ch=`curl -s -d "$params_get_ch" http://geo2tag.cs.prv/service/channels`
    echo "Response (get channels): "
    echo "$response_get_ch"
}

function removeChannel {
    CH_NAME="$1"
    LOGIN="gets2"
    PASS="getsPWD"

    params_remove_ch="<methodCall><methodName>deleteChannel</methodName><params><param><struct><member><name>user</name><value>$LOGIN</value></member><member><name>channel</name><value>$CH_NAME</value></member><member><name>login</name><value>$LOGIN</value></member><member><name>password</name><value>$PASS</value></member></struct></param></params></methodCall>"
    response_remove_ch=`curl -s -d "$params_remove_ca" http://geo2tag.cs.prv/gets/geo2tag.php`
    echo "Response (remove channel): "
    echo "$response_remove_ch"
}

function removeDuplicates {
    CH_NAME="$1"
    LOGIN="gets2"

    params_remove_dub="<methodCall><methodName>deleteDupTags</methodName><params><param><struct><member><name>user</name><value>$LOGIN</value></member><member><name>channel</name><value>$CH_NAME</value></member></struct></param></params></methodCall>"
    response_remove_dub=`curl -s -d "$params_remove_dub" http://geo2tag.cs.prv/gets/geo2tag.php`
    echo "Response (remove duplicates): "
    echo "$response_remove_dub"
}

function subscribedChannels {
    params_sbed_ch="{\"auth_token\":\"$auth_token\"}"
    response_sbed_ch=`curl -s -d "$params_sbed_ch" http://geo2tag.cs.prv/service/subscribed`
    echo "Response (sbed channels): "
    echo "$response_sbed_ch"
}

function ownedChannels {
    params_owned_ch="{\"auth_token\":\"$auth_token\"}"
    response_owned_ch=`curl -s -d "$params_owned_ch" http://geo2tag.cs.prv/service/owned`
    echo "Response (owned channels): "
    echo "$response_owned_ch"
}

function subscribeChannel {
    CH_NAME="$1"

    params_sb_ch="{\"auth_token\":\"$auth_token\",\"channel\":\"$CH_NAME\"}"
    response_sb_ch=`curl -s -d "$params_sb_ch" http://geo2tag.cs.prv/service/subscribe`
    echo "Response (sb channels): "
    echo "$response_sb_ch"
}

function unsubscribeChannel {
    CH_NAME="$1"

    params_unsb_ch="{\"auth_token\":\"$auth_token\",\"channel\":\"$CH_NAME\"}"
    response_unsb_ch=`curl -s -d "$params_unsb_ch" http://geo2tag.cs.prv/service/unsubscribe`
    echo "Response (unsb channels): "
    echo "$response_unsb_ch"
}

if { [ $# == 1 ] && [ "$1" == "--login" ]; } then
    login_gets
    exit 0
fi

if { [ $# == 7 ] && [ "$1" == "--add-channel" ]; } then
    addChannel $2 $3 $4 $5 $6 $7
    exit 0
fi

if { [ $# == 1 ] && [ "$1" == "--get-channels" ]; } then
    getChannels
    exit 0
fi

if { [ $# == 2 ] && [ "$1" == "--remove-channel" ]; } then
    removeChannel $2
    exit 0
fi

if { [ $# == 2 ] && [ "$1" == "--remove-dubs" ]; } then
    removeDuplicates $2
    exit 0
fi

if { [ $# == 1 ] && [ "$1" == "--subscribed-channels" ]; } then
    subscribedChannels
    exit 0
fi

if { [ $# == 2 ] && [ "$1" == "--subscribe-channel" ]; } then
    subscribeChannel $2
    exit 0
fi

if { [ $# == 2 ] && [ "$1" == "--unsubscribe-channel" ]; } then
    unsubscribeChannel $2
    exit 0
fi

if { [ $# == 1 ] && [ "$1" == "--owned-channels" ]; } then
    ownedChannels
    exit 0
fi

echo "Usage: "
echo "Login - ./channels.sh --login"
echo "Add channel - ./channels.sh --add-channel name description lang url category-id active-radius"
echo "Get channels - ./channels.sh --get-channels"
echo "Remove channel - ./channels.sh --remove-channel name"
echo "Remove duplicates - ./channels.sh --remove-dubs name"
echo "Subscribed channels- ./channels.sh --subscribed-channels"
echo "Subscribe channel - ./channels.sh --subscribe-channel name"
echo "Unsubscribe channel - ./channels.sh --unsubscribe-channel name"
echo "Owned channels - ./channels.sh --owned-channels"
exit 0
