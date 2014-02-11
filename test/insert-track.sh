#!/usr/bin/env bash

source ./config.sh

psql geo2tag geo2tag -c "insert into channel (name,description,url,owner_id) values ('tr_test', '{\"description\":\"Test track\",\"categoryId\":\"1\"}','http://example.com', 7);"
psql geo2tag geo2tag -c "insert into channel (name,description,url,owner_id) values ('tr_test2', '{\"description\":\"Test track 2\",\"categoryId\":\"2\"}','http://example.com', 7);"
psql geo2tag geo2tag -c "insert into channel (name,description,url,owner_id) values ('tr_test_invalid', 'track 2\",\"categoryId\":\"2\"}','http://example.com', 7);"
psql geo2tag geo2tag -c "insert into channel (name,description,url,owner_id) values ('tr_private', '{\"description\":\"Private track\",\"categoryId\":\"3\"}','http://example.com', 8);"
