#!/usr/bin/env python3

import unittest
import getstest as gt
import getsconfig
import uuid
import xml.etree.ElementTree as ET

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

    def test_share_load_tracks(self):
        token1 = self.sign_in()

        # create track
        res = gt.request("createTrack.php", self.make_test_track_request("1"))
        track_id = res.find(".//track_id").text

        # share this track with 5 limit
        res = gt.request("sharing/shareTrack.php", gt.make_request(
            ("auth_token", token1),
            ("track_id", track_id),
            ("limit", "5")
            ))

        self.assert_code(res, 0)
        key = res.find(".//key").text
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
        res = gt.request("sharing/subscribeTrack.php", gt.make_request(
            ("auth_token", token2),
            ("key", key)
            ))
        self.assert_code(res, 0)

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
        res = gt.request("sharing/unsubscribeTrack.php", gt.make_request(
            ("auth_token", token2),
            ("track_id", track_id)
            ))

        # check user has no tracks
        res = self.load_private_tracks(token2)
        self.assert_track_count(res, 0)

        # check limit is 5
        res = self.load_private_tracks(token1)
        self.assert_track_shared(res, key, 5)


    def test_limit(self):
        token1 = self.sign_in()

        res = gt.request("createTrack.php", self.make_test_track_request("1"))
        track_id = res.find(".//track_id").text
        
        # share this track with 5 limit
        res = gt.request("sharing/shareTrack.php", gt.make_request(
            ("auth_token", token1),
            ("track_id", track_id),
            ("limit", "5")))
        key = res.find(".//key").text

        # 6'th client must fail to subscribe
        for i in range(6):
            token = self.sign_in()

            res = gt.request("sharing/subscribeTrack.php", gt.make_request(
                ("auth_token", token),
                ("key", key)))

            if i < 5:
                self.assert_code(res, 0)
            else:
                self.assert_code(res, 2)

    def test_load_shared_track(self):
        token1 = self.sign_in()

        res = gt.request("createTrack.php", self.make_test_track_request("1"))
        track_id = res.find(".//track_id").text

        res = gt.request("sharing/shareTrack.php", gt.make_request(
            ("auth_token", token1),
            ("track_id", track_id),
            ("limit", "unlimited")))
        key = res.find(".//key").text
            
        token2 = self.sign_in()
        res = self.load_track(track_id, token2);
        self.assert_code(res, 1)
 
        res = gt.request("sharing/subscribeTrack.php", gt.make_request(
             ("auth_token", token2),
             ("key", key)))
        self.assert_code(res, 0)

        res = self.load_track(track_id, token2);
        self.assert_code(res, 0)

    def test_load_shared_track_by_key(self):
        "This test fails because GeTS returns error if track is empty"

        token1 = self.sign_in()

        res = gt.request("createTrack.php", self.make_test_track_request("1"))
        track_id = res.find(".//track_id").text

        res = gt.request("sharing/shareTrack.php", gt.make_request(
            ("auth_token", token1),
            ("track_id", track_id),
            ("limit", "unlimited")))
        key = res.find(".//key").text

        token2 = self.sign_in()

        # Check track can't be loaded by name
        res = self.load_track(track_id, token2);
        self.assert_code(res, 1)

        # Check track can be loaded by key
        res = self.load_track_by_key(key, token2);
        self.assert_code(res, 0)

        res = gt.request("sharing/unshareTrack.php", gt.make_request(
            ("auth_token", token1),
            ("key", key)))

        # Check track can't be loaded by the same key
        res = self.load_track_by_key(key, token2);
        self.assert_code(res, 1)

    def test_cant_share_not_owned_track(self):
        pass
if __name__ == "__main__":
    unittest.main()
