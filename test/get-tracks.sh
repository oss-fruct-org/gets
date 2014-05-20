#!/usr/bin/env bash

#./reset-database.sh > /dev/null
source ./config.sh

if [ "$#" -ne 1 ]; then
    echo "Usage: ${0} space"
    exit 1
fi


echo "Executing getTracks method" >&2
curl -d@- "${GETS_SERVER}/loadTracks.php" <<-EOF
<request><params>

<auth_token>$(cat token.txt)</auth_token>
<!--<category_name>audio_tracks</category_name>-->
<space>${1}</space>

</params></request>
EOF
