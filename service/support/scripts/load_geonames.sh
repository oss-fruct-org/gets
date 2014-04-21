#!/bin/bash

# PARAMS SECTION

# Auth info
GETS_LOGIN="geonames"
GETS_PASSWORD="geonamesPWD"

# List of data files
DATA_FILES="cities1000 cities5000 cities15000"

DEFAULT_LANG="en_US"
POPULATION_LIMIT=250000

DEPENDENCIES="xmllint unzip curl wget"

#Methods urls
LOG_IN_URL=http://oss.fruct.org/projects/gets/service/login.php
ADD_CHANNEL_URL=http://oss.fruct.org/projects/gets/service/addChannel.php
SUBSCRIBE_CHANNEL_URL=http://oss.fruct.org/projects/gets/service/subscribe.php
ADD_POINT_URL=http://oss.fruct.org/projects/gets/service/addPoint.php
GETS_XMLRPC_URL=http://kappa.cs.karelia.ru/~davydovs/retr/checkUser.php

auth_token=`cat "${GETS_LOGIN}_token.txt" 2>/dev/null`
debug=0

if { [ $# == 1 ] && [ "$1" == "--debug" ]; } then
    debug=1
fi

# MAIN SECTION

# Check for dependences 
deps_ok=YES
for dep in $DEPENDENCIES 
do
    if ! which $dep &>/dev/null;  then
        echo "This script requires - \"$dep\" to run but it is not installed"                     
        deps_ok=NO
    fi
done
if [[ "$deps_ok" == "NO" ]]; then
    echo "Unmet dependencies"
    echo "Aborting"
    exit 1
fi

for file in $DATA_FILES
do
    rm -f "$file.zip" &>/dev/null
    rm -f "$file.txt" &>/dev/null
    echo ""
    echo ""
    echo "Downloading $file.zip..."
    echo ""
    echo ""
    wget "http://download.geonames.org/export/dump/$file.zip" 
    unzip "$file.zip"
    rm -f "$file.zip" &>/dev/null
    
    echo ""
    echo ""

    if [ "$auth_token" == "" ]; then
        echo "Loging in to GeTS..."
        params_login="<request><params><login>$GETS_LOGIN</login><password>$GETS_PASSWORD</password></params></request>"
        response_login=`curl -s -d "$params_login" $LOG_IN_URL`        
        code_login=`echo "$response_login" | xmllint --xpath '//code/text()' -`
        if [ $code_login -ne 0 ]; then
            message_login=`echo "$response_login" | xmllint --xpath '//message/text()' -`
            echo "Login failed $message_login"
            exit 1
        fi
        auth_token=`echo "$response_login" | xmllint --xpath '//auth_token/text()' -`
        echo "Auth_token: $auth_token"
        echo $auth_token > token.txt
    fi

    channel_name=""
    channel_ca_id=""
    channel_url="http://en.wikipedia.org/wiki/City"
    channel_desc=""
    
    # Match file name with channel and id
    if [ "$file" == "cities15000" ]; then
        channel_name="ca_city.large-${GETS_LOGIN}-$DEFAULT_LANG"
        channel_ca_id="8"
        channel_desc="Large cities with population over 15000"
    else 
        if [ "$file" == "cities5000" ]; then
            channel_name="ca_city.medium-${GETS_LOGIN}-$DEFAULT_LANG"
            channel_ca_id="9"
            channel_desc="Medium cities with population over 5000"
        else 
            if [ "$file" == "cities1000" ]; then
                channel_name="ca_city.small-${GETS_LOGIN}-$DEFAULT_LANG"
                channel_ca_id="10"
                channel_desc="Small cities with population over 1000"
            else
                echo "Error: unknown input files"
                exit 1
            fi
        fi
    fi

    echo "Creating channel $channel_name in geo2tag..."    
    params_cities="<request><params><auth_token>$auth_token</auth_token><name>$channel_name</name><description>$channel_desc</description><url>$channel_url</url><lang>$DEFAULT_LANG</lang><category_id>$channel_ca_id</category_id><active_radius>100000</active_radius></params></request>"
    response_cities=`curl -s -d "$params_cities" $ADD_CHANNEL_URL`
    code_cities=`echo "$response_cities" | xmllint --xpath '//code/text()' -`
    message_cities=`echo "$response_cities"  | xmllint --xpath '//message/text()' -`
    if [ $code_cities -ne 0 ]; then
        if [[ "$message_cities" ==  "Channel already exist error" ]]; then
            echo "Channel $channel_name already exist in geo2tag..."
        else
            echo "Creating channel $file failed $message_cities"
            exit 1
        fi
    fi

    echo "Subscribing to $channel_name channel..."
    params_subs="<request><params><auth_token>$auth_token</auth_token><channel>$channel_name</channel></params></request>"
    response_subs=`curl -s -d "$params_subs" $SUBSCRIBE_CHANNEL_URL`
    code_subs=`echo "$response_subs" | xmllint --xpath '//code/text()' -`
    message_subs=`echo "$response_subs"  | xmllint --xpath '//message/text()' -`
    if [ $code_subs -ne 0 ]; then
        if [[ "$message_subs" ==  "Channel already subscribed error" ]]; then
            echo "Channel $channel_name already subscribed..."
        else
            echo "Creating channel $file failed $message_subs"
            exit 1
        fi
    fi

    echo "Adding data to $channel_name channel..."
    city_time=`date +"%d %m %Y %H:%M:%S.%3N"`
    city_altitude="0.0"
    city_desc=""
    city_link=""

    
    cat "$file.txt" | while IFS= read -r line
    do
        # Read only important fields 
        city_title=`printf "%s" "$line" | awk -F'\t' '{print $2}'`
        city_latitude=`printf "%s" "$line" | awk -F'\t' '{print $5}'`
        city_longitude=`printf "%s" "$line" | awk -F'\t' '{print $6}'`
        city_population=`printf "%s" "$line" | awk -F'\t' '{print $15}'`

        # Search for information in wikipedia only for "significant" cities
        # Significance, in this case, is defined by population
        if [ $city_population -gt $POPULATION_LIMIT ]; then           
            # Replace spaces with "%20" character sequences
            title_for_wiki=`echo "$city_title" | sed 's/ /%20/g'`
        
            # Make request to English wikipedia in order to get a link from it
            response_wiki=`curl -s "http://en.wikipedia.org/w/api.php?action=opensearch&search=$title_for_wiki&limit=1&namespace=0&format=xml"`
            city_link=`echo "$response_wiki" | xmllint --xpath "//*[local-name()='Url']/text()" -`
        else 
            city_link=""
        fi
        
        if [ $debug == 1 ]; then
            echo "City population: $city_population"
            echo "Title: $city_title"
            echo "Desc: $city_desc"
            echo "Lat: $city_latitude"
            echo "Long: $city_longitude"
            echo "Alt: $city_altitude"
            echo "Link: $city_link"
            echo "Time: $city_time"
            echo "-----------------------------------------------------------"
        fi

        params_add_tag="<request><params><auth_token>$auth_token</auth_token><channel>$channel_name</channel><title>$city_title</title><description>$city_desc</description><link><![CDATA[$city_link]]></link><latitude>$city_latitude</latitude><longitude>$city_longitude</longitude><altitude>$city_altitude</altitude><time>$city_time</time></params></request>"
        response_add_tag=`curl -s -d "$params_add_tag" $ADD_POINT_URL`
        code_add_tag=`echo "$response_add_tag" | xmllint --xpath '//code/text()' -`
        message_add_tag=`echo "$response_add_tag" | xmllint --xpath '//message/text()' -`
        if [ $code_add_tag -ne 0 ]; then
            echo "An error occurred while adding point with title - $city_title"
            echo "$message_add_tag"
        fi
    done

    echo "Removing duplicates..."
    params_remove_dub="<methodCall><methodName>deleteDupTags</methodName><params><param><struct><member><name>user</name><value>$GETS_LOGIN</value></member><member><name>channel</name><value>$channel_name</value></member></struct></param></params></methodCall>"
    response_remove_dub=`curl -s -d "$params_remove_dub" $GETS_XMLRPC_URL | xmllint --xpath '//string/text()' -`
    echo "$response_remove_dub"
done

