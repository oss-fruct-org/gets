#!/usr/bin/env python3

import unittest
import getstest as gt
import getsconfig
import uuid
import xml.etree.ElementTree as ET
import itertools

class TestTrack(unittest.TestCase):

    def setUp(self):
        self.token = None

        gt.do_get("test/resetDatabase.php");
        pass

    def tearDown(self):
        pass

    def sign_in(self):
        self.token = gt.do_get("test/createTestAccount.php")
        return self.token

    def assert_code(self, res, expected_code):
        self.assertEqual(gt.get_code(res), expected_code)

    def assert_track_shared(self, tracks_res, ex_key, ex_remain = -1):
        shared_xml = tracks_res.find(".//tracks/track/shares/share")

        for share in shared_xml:
            if shared_xml.find("./key").text == ex_key and shared_xml.find("./remain").text == str(ex_remain):
                return

        self.fail("Share with key " + ex_key + " and remain " + str(ex_remain) + " not found")

    def assert_track_count(self, tracks_res, ex_count):
        self.assertEqual(len(tracks_res.findall(".//tracks/track")), ex_count)

    def load_private_tracks(self, token = None):
        if (token is None):
            token = self.token

        return gt.request("loadTracks.php", gt.make_request(
            ("auth_token", token),
            ("space", "private"),
            ))

    def load_track(self, track_id, token = None):
        if (token is None):
            token = self.token

        return gt.request("loadTrack.php", gt.make_request(
            ("auth_token", token),
            ("track_id", track_id),
            ))

    def load_track_by_key(self, key, token = None):
        if (token is None):
            token = self.token

        return gt.request("loadTrack.php", gt.make_request(
            ("auth_token", token),
            ("key", key),
            ))


    def make_test_track_request(self, suffix):
        return gt.make_request(
                ("auth_token", self.token),
                ("name", "test track " + suffix),
                ("description", "test description " + suffix),
                ("url", "http://example.com"),
                ("category_id", "1"),
                ("lang", "ru_RU"))

    def create_track(self, suffix, token=None, code=0):
        if (token is None):
            token = self.token

        res = gt.request("createTrack.php", self.make_test_track_request(suffix))
        self.assert_code(res, code)
        track_id = res.find(".//track_id").text
        return track_id


    def share_track(self, track_id, limit, token=None, code=0):
        if (token is None):
            token = self.token

        res = gt.request("sharing/shareTrack.php", gt.make_request(
            ("auth_token", token),
            ("track_id", track_id),
            ("limit", str(limit))))
        self.assert_code(res, code)

        # code equals result code
        if (code == 0):
            key = res.find(".//key").text
        else:
            key = None
        return key

    def unshare_track(self, key, token=None, code=0):
        if (token is None):
            token = self.token

        res = gt.request("sharing/unshareTrack.php", gt.make_request(
            ("auth_token", token),
            ("key", key)
            ))
        self.assert_code(res, code)

    def subscribe_track(self, key, token=None, code=0):
        if (token is None):
            token = self.token

        res = gt.request("sharing/subscribeTrack.php", gt.make_request(
            ("auth_token", token),
            ("key", key)
            ))
        self.assert_code(res, code)

    def unsubscribe_track(self, track_id, token=None, code=0):
        if (token is None):
            token = self.token

        res = gt.request("sharing/unsubscribeTrack.php", gt.make_request(
            ("auth_token", token),
            ("track_id", track_id)
            ))
        self.assert_code(res, code)

    def test_create_track(self):
        self.sign_in()

        res = gt.request("createTrack.php", gt.make_request(
                ("auth_token", self.token),
                ("name", "test track 1"),
                ("description", "test description 1"),
                ("url", "http://example.com"),
                ("category_id", "1"),
                ("lang", "ru_RU")))

        self.assert_code(res, 0)
        track_name = res.find(".//track_id").text

        res = self.load_private_tracks()
        self.assert_code(res, 0)

        self.assertEqual(res.find(".//tracks/track/name").text, track_name)
        self.assertEqual(res.find(".//tracks/track/access").text, "rw")

    def test_create_track_photo_url(self):
        self.sign_in()
        res = gt.request("createTrack.php", gt.make_request(
                ("auth_token", self.token),
                ("name", "test track 1"),
                ("description", "test description 1"),
                ("url", "http://example.com"),
                ("category_id", "1"),
                ("lang", "ru_RU"),
                ("photoUrl", "http://example.com/1.png")))
        self.assert_code(res, 0)

        res = self.load_private_tracks()
        self.assertEqual(res.find(".//tracks/track/photoUrl").text, "http://example.com/1.png")

    def do_test_update_track(self, fields):
        gt.do_get("test/resetDatabase.php");
        self.sign_in()

        def_values = {
                "description" : "test description 1",
                "url" : "http://example.com/1",
                "name" : "test track 1",

                "category_id" : "1",
                "lang" : "ru_RU",
                "photoUrl" : "http://example.com/1.png"
                }
        
        values = {
                "description" : "test track desc 1",
                "url" : "http://example.com/11",
                "name" : "test track 2",

                "category_id" : "1",
                "lang" : "en_GB",
                "photoUrl" : "http://example.com/2.png"
                }

        res = gt.request("createTrack.php", gt.make_request(
                ("auth_token", self.token),
                ("name", "test track 1"),

                ("description", "test description 1"),
                ("url", "http://example.com/1"),
                ("category_id", "1"),
                ("lang", "ru_RU"),
                ("photoUrl", "http://example.com/1.png")))

        track_id = res.find(".//track_id").text

        parm = []
        parm.append( ("auth_token", self.token) )
        parm.append( ("track_id", track_id) )
        
        for field in fields:
            parm.append( (field, values[field]) )

        res = gt.request("updateTrack.php", gt.make_request(*parm))
        self.assert_code(res, 0)

        res = self.load_private_tracks()

        for key in values:
            if (key in fields):
                ex_value = values[key]
            else:
                ex_value = def_values[key]

            if key == "name":
                key = "hname"
            
            self.assertEqual(res.find(".//tracks/track/" + key).text, ex_value, "For key " + key + " " + str(fields))

    def test_update_track(self):
        all_fields = ["description", "url", "name", "category_id", "lang", "photoUrl"]
        for fields in itertools.combinations(all_fields, 3):
            self.do_test_update_track(fields)

    def test_duplicated_names(self):
        self.sign_in()

        res = gt.request("createTrack.php", self.make_test_track_request("1"))
        self.assert_code(res, 0)

        res = gt.request("createTrack.php", self.make_test_track_request("1"))
        self.assert_code(res, 0)

        res = self.load_private_tracks();
        self.assert_track_count(res, 2)

    def test_create_track_minimal_attrs(self):
        self.sign_in()

        res = gt.request("createTrack.php", gt.make_request(
            ("auth_token", self.token),
            ("name", "test track 1"),
            ))

        self.assert_code(res, 0)

        res = self.load_private_tracks()
        self.assert_track_count(res, 1)

        self.assertEqual(res.find(".//tracks/track/hname").text, "test track 1")

        self.assertIsNotNone(res.find(".//tracks/track/description"))
        self.assertIsNone(res.find(".//tracks/track/description").text)

        self.assertIsNone(res.find(".//tracks/track/url"))
        self.assertIsNotNone(res.find(".//tracks/track/lang"))
        self.assertEqual(res.find(".//tracks/track/category_id").text, "1")

    def test_create_track_with_points(self):
        self.sign_in()

        track_id = self.create_track("1")
        res = gt.request("addPoint.php", gt.make_request(
            ("auth_token", self.token),
            ("channel", track_id),
            ("title", "test point"),
            ("description", "test description"),
            ("link", "http://example.com"),
            ("latitude", "64"),
            ("longitude", "31"),
            ("altitude", "0"),
            ))


    def test_share_load_tracks(self):
        token1 = self.sign_in()

        # create track
        track_id = self.create_track("1")

        # share this track with 5 limit
        key = self.share_track(track_id, 5, token1)
        self.assertTrue(len(key) > 0)

        # check loadTracks returns share
        res = self.load_private_tracks()
        self.assert_track_shared(res, key, 5)

        # login as other user
        token2 = self.sign_in()
        res = self.load_private_tracks()
        
        # check user has no tracks
        self.assert_track_count(res, 0)

        # subscribe track
        self.subscribe_track(key, token2)

        # check user has one track
        res = self.load_private_tracks()
        self.assert_track_count(res, 1)
        self.assertEqual(res.find(".//tracks/track/hname").text, "test track 1")
        self.assertEqual(res.find(".//tracks/track/access").text, "r")
        self.assertEqual(res.find(".//tracks/track/name").text, track_id)

        # check limit is 4
        res = self.load_private_tracks(token1)
        self.assert_track_shared(res, key, 4)

        # unsubscribe track
        self.unsubscribe_track(track_id, token2)

        # check user has no tracks
        res = self.load_private_tracks(token2)
        self.assert_track_count(res, 0)

        # check limit is 5
        res = self.load_private_tracks(token1)
        self.assert_track_shared(res, key, 5)


    def test_limit(self):
        token1 = self.sign_in()

        track_id = self.create_track("1")
        
        # share this track with 5 limit
        key = self.share_track(track_id, 5, token1)

        # 6'th client must fail to subscribe
        for i in range(6):
            token = self.sign_in()

            if i < 5: 
                ex_code = 0 
            else: 
                ex_code = 2

            self.subscribe_track(key, token, ex_code)

    def test_load_shared_track(self):
        token1 = self.sign_in()

        track_id = self.create_track("1")
        key = self.share_track(track_id, "unlimited", token1)
            
        token2 = self.sign_in()
        res = self.load_track(track_id, token2);
        self.assert_code(res, 1)
 
        self.subscribe_track(key, token2)

        res = self.load_track(track_id, token2);
        self.assert_code(res, 0)

    def test_load_shared_track_by_key(self):
        token1 = self.sign_in()

        track_id = self.create_track("1")
        key = self.share_track(track_id, "unlimited", token1)

        token2 = self.sign_in()

        # Check track can't be loaded by name
        res = self.load_track(track_id, token2);
        self.assert_code(res, 1)

        # Check track can be loaded by key
        res = self.load_track_by_key(key, token2);
        self.assert_code(res, 0)

        self.unshare_track(key, token1)

        # Check track can't be loaded by the same key
        res = self.load_track_by_key(key, token2);
        self.assert_code(res, 1)

    def test_cant_share_not_owned_track(self):
        token1 = self.sign_in()
        track_id = self.create_track("1")

        token2 = self.sign_in()
        self.share_track(track_id, 5, token2, 1)

if __name__ == "__main__":
    unittest.main()
