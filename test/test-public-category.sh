#!/usr/bin/env bash

./reset-database.sh > /dev/null
source ./config.sh

echo "Executing addCategory extension method"
curl -d@- "${GEO2TAG_SERVER}/gets/geo2tag.php" <<-EOF
<methodCall><methodName>addCategory</methodName>
<params><param>
<struct>
<member><name>name</name><value>shops</value></member>
<member><name>description</name><value>Shops, markets, etc.</value></member>
<member><name>url</name><value>http://en.wikipedia.org/wiki/Market</value></member>
</struct></param></params></methodCall> 
EOF

echo -n "Checking database... "
psql geo2tag geo2tag -c "select * from category;" | grep shops && echo "OK" || echo "Fail"
