#!/usr/bin/env bash

#./reset-database.sh > /dev/null

if [ "$#" -ne 4 ]; then
    echo "Usage: ${0} channel name key value"
    exit 1
fi


source ./config.sh

echo "Executing updatePoint method"
curl -d@- "${GETS_SERVER}/updatePoint.php" <<-EOF
<request><params>

<auth_token>$(cat token.txt)</auth_token>
<channel>${1}</channel>
<name>${2}</name>

<${3}>${4}</${3}>

</params></request>
EOF

cat <<- EOF > /tmp/qwe.txt
<request><params>

<auth_token>$(cat token.txt)</auth_token>
<channel>${1}</channel>
<name>${2}</name>

<${3}>${4}</${3}>

</params></request>
EOF
