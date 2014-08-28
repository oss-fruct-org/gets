#!/bin/bash

# Params section

# Auth info
GETS_LOGIN="ticrk"
GETS_PASSWORD="ticrkPWD"

# List of data files
DATA_FILES_BASE_URL="http://www.ticrk.ru/maps/ru/"
DATA_FILES="layer_sights 
            layer_rest_31869 
            layer_rest_32359 
            layer_rest_6510 
            layer_rest_6632 
            layer_rest_6509 
            layer_rest_6569 
            layer_rest_6533 
            layer_33445 
            layer_34267 
            layer_34268 
            layer_34269 
            layer_34270"

DEFAULT_LANG="ru_RU"

DEPENDENCIES="xmllint unzip curl wget recode"

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

# Main section

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

echo "----------START----------"

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
    echo $auth_token > "${GETS_LOGIN}_token.txt"
fi

# Create temp folder
# First generate unique folder name
temp_dir_name=`date +".temp_%5N"`
temp_dir_error="" 
temp_dir_error=`mkdir "$temp_dir_name"`
if [ "$temp_dir_error" != "" ]; then
    echo "Can't create temp folder. Probably some permissions issue."
    exit 1
fi
if [ $debug == 1 ]; then
    echo "Temp folder $temp_dir_name successfully created."
fi

for file in $DATA_FILES
do

    rm -f "./$temp_dir_name/$file.xml" &>/dev/null
    echo "Downloading $file.xml..."
    wget -P "./$temp_dir_name/" "${DATA_FILES_BASE_URL}$file.xml" 

    channel_name=""
    channel_ca_id=""
    channel_url=""
    channel_desc=""

    # Match file name with channel and id
    if [ "$file" == "layer_sights" ]; then
        channel_name="ca_sights_${GETS_LOGIN}_$DEFAULT_LANG"
        channel_ca_id="4"
        channel_url="http://www.ticrk.ru/ru/gallery_17011.html"
        channel_desc="Karelian sights"
    else 
        if [ "$file" == "layer_rest_31869" ]; then
            channel_name="ca_autoturism_${GETS_LOGIN}_$DEFAULT_LANG"
            channel_ca_id="12"
            channel_url="http://www.ticrk.ru/ru/rests.php?type=31869"
            channel_desc="Karelian autocamping places"
        else 
            if [ "$file" == "layer_rest_32359" ]; then
                channel_name="ca_apartments_${GETS_LOGIN}_$DEFAULT_LANG"
                channel_ca_id="13"
                channel_url="http://www.ticrk.ru/ru/rests.php?region=&city=&qnt_from=&qnt_to=&type=32359"
                channel_desc="Karelian apartments"
            else
                if [ "$file" == "layer_rest_6510" ]; then
                    channel_name="ca_recreationcenters_${GETS_LOGIN}_$DEFAULT_LANG"
                    channel_ca_id="3"
                    channel_url="http://www.ticrk.ru/ru/rests.php?region=&city=&qnt_from=&qnt_to=&type=6510"
                    channel_desc="Karelian recreation centers"
                else
                    if [ "$file" == "layer_rest_6632" ]; then
                        channel_name="ca_guesthouses_${GETS_LOGIN}_$DEFAULT_LANG"
                        channel_ca_id="3"
                        channel_url="http://www.ticrk.ru/ru/rests.php?region=&city=&qnt_from=&qnt_to=&type=6632"
                        channel_desc="Karelian guest houses"
                    else
                        if [ "$file" == "layer_rest_6509" ]; then
                            channel_name="ca_hotels_${GETS_LOGIN}_$DEFAULT_LANG"
                            channel_ca_id="14"
                            channel_url="http://www.ticrk.ru/ru/rests.php?region=&city=&qnt_from=&qnt_to=&type=6509"
                            channel_desc="Karelian hotels"
                        else
                            if [ "$file" == "layer_rest_6569" ]; then
                                channel_name="ca_cottages_${GETS_LOGIN}_$DEFAULT_LANG"
                                channel_ca_id="3"
                                channel_url="http://www.ticrk.ru/ru/rests.php?region=&city=&qnt_from=&qnt_to=&type=6569"
                                channel_desc="Karelian cottages"
                            else
                                if [ "$file" == "layer_rest_6533" ]; then
                                    channel_name="ca_sanatoriums_${GETS_LOGIN}_$DEFAULT_LANG"
                                    channel_ca_id="15"
                                    channel_url="http://www.ticrk.ru/ru/rests.php?region=&city=&qnt_from=&qnt_to=&type=6533"
                                    channel_desc="Karelian sanatoriums"
                                else
                                    if [ "$file" == "layer_33445" ]; then
                                        channel_name="ca_monuments_${GETS_LOGIN}_$DEFAULT_LANG"
                                        channel_ca_id="16"
                                        channel_url="http://www.museums.karelia.ru/pam.shtml"
                                        channel_desc="Karelian monuments"
                                    else
                                        if [ "$file" == "layer_34267" ]; then
                                            channel_name="ca_museums_${GETS_LOGIN}_$DEFAULT_LANG"
                                            channel_ca_id="17"
                                            channel_url="http://www.museums.karelia.ru/museums.shtml"
                                            channel_desc="Karelian museums"
                                        else
                                            if [ "$file" == "layer_34268" ]; then
                                                channel_name="ca_historicalcities_${GETS_LOGIN}_$DEFAULT_LANG"
                                                channel_ca_id="18"
                                                channel_url="http://www.ticrk.ru/ru/gallery_30072.html"
                                                channel_desc="Karelian historical cities"
                                            else
                                                if [ "$file" == "layer_34269" ]; then
                                                    channel_name="ca_monasteries_${GETS_LOGIN}_$DEFAULT_LANG"
                                                    channel_ca_id="19"
                                                    channel_url="http://eparhia.karelia.ru/monast.htm"
                                                    channel_desc="Karelian monasteries"
                                                else
                                                    if [ "$file" == "layer_34270" ]; then
                                                        channel_name="ca_naturalmonuments_${GETS_LOGIN}_$DEFAULT_LANG"
                                                        channel_ca_id="20"
                                                        channel_url="http://www.ticrk.ru/ru/gallery_26411.html"
                                                        channel_desc="Karelian natural monuments"
                                                    else                                                        
                                                        echo "Error: unknown input files"
                                                        exit 1
                                                    fi
                                                fi
                                            fi
                                        fi
                                    fi
                                fi
                            fi
                        fi
                    fi
                fi
            fi
        fi
    fi

    echo "Creating channel $channel_name in geo2tag..."    
    params_cities="<request><params><auth_token>$auth_token</auth_token><name>$channel_name</name><description>$channel_desc</description><url><![CDATA[$channel_url]]></url><lang>$DEFAULT_LANG</lang><category_id>$channel_ca_id</category_id><active_radius>100000</active_radius></params></request>"
    response_cities=`curl -s -d "$params_cities" $ADD_CHANNEL_URL`
    code_cities=`echo "$response_cities" | xmllint --xpath '//code/text()' -`
    message_cities=`echo "$response_cities"  | xmllint --xpath '//message/text()' -`
    if [ $code_cities -ne 0 ]; then
        if [[ "$message_cities" ==  "Channel already exist error" ]]; then
            echo "Channel $channel_name already exist in geo2tag..."
        else
            echo "Creating channel $channel_name failed $message_cities"
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
            echo "Creating channel $channel_name failed $message_subs"
            exit 1
        fi
    fi

    echo "Adding data to $channel_name channel..."

    number_of_objects=`xmllint --xpath "count(//*[local-name()='GeoObject'])" "./$temp_dir_name/$file.xml"`

    obj_time=`date +"%d %m %Y %H:%M:%S.%3N"`
    obj_altitude="0.0"

    for i in `seq 1 $number_of_objects`
    do
        obj_name=`xmllint --xpath "//*[local-name()='GeoObject' and position()=$i]/*[local-name()='name']/text()" "./$temp_dir_name/$file.xml" | recode html..UTF-8 2>/dev/null`
        obj_description=`xmllint --noblanks --xpath "//*[local-name()='GeoObject' and position()=$i]/*[local-name()='description']/text()" "./$temp_dir_name/$file.xml" 2>/dev/null | sed "s/^ *//;s/ *$//;s/ \{1,\}/ /g"`
        obj_coordinates_str=`xmllint --xpath "//*[local-name()='GeoObject' and position()=$i]/*[local-name()='Point']/*[local-name()='pos']/text()" "./$temp_dir_name/$file.xml" 2>/dev/null`
        obj_link=`xmllint --xpath "//*[local-name()='GeoObject' and position()=$i]/*[local-name()='metaDataProperty']/*[local-name()='AnyMetaData']/*[local-name()='detail_url']/text()" "./$temp_dir_name/$file.xml" 2>/dev/null`
        eval obj_coordinates_array=($obj_coordinates_str)
        obj_latitude=${obj_coordinates_array[1]}
        obj_longitude=${obj_coordinates_array[0]}

        if [ $debug == 1 ]; then
            echo "Object $i:"
            echo "Name: $obj_name" 
            echo "Desc: $obj_description"  
            echo "Coords: $obj_coordinates_str"
            echo "Link: $obj_link" 
            echo "Lat: $obj_latitude"
        fi

        params_add_tag="<request><params><auth_token>$auth_token</auth_token><channel>$channel_name</channel><title><![CDATA[$obj_name]]></title><description>$obj_description</description><link><![CDATA[$obj_link]]></link><latitude>$obj_latitude</latitude><longitude>$obj_longitude</longitude><altitude>$obj_altitude</altitude><time>$obj_time</time></params></request>"
        response_add_tag=`curl -s -d "$params_add_tag" $ADD_POINT_URL`
        code_add_tag=`echo "$response_add_tag" | xmllint --xpath '//code/text()' -`
        message_add_tag=`echo "$response_add_tag" | xmllint --xpath '//message/text()' -`
        if [ $code_add_tag -ne 0 ]; then
            echo "An error occurred while adding point with title - $obj_name"
            echo "$message_add_tag"
        fi
    done

    echo "Removing duplicates..."
    params_remove_dub="<methodCall><methodName>deleteDupTags</methodName><params><param><struct><member><name>user</name><value>$GETS_LOGIN</value></member><member><name>channel</name><value>$channel_name</value></member></struct></param></params></methodCall>"
    response_remove_dub=`curl -s -d "$params_remove_dub" $GETS_XMLRPC_URL | xmllint --xpath '//string/text()' -`
    echo "$response_remove_dub"
done

# Remove temp directory with all downloaded files
temp_dir_error=""
temp_dir_error=`rm -f -r "$temp_dir_name"`
if [ "$temp_dir_error" != "" ]; then
    echo "Can't remove temp folder. Probably some permissions issue."
fi

echo "----------END----------"