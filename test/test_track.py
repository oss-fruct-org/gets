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

    def load_private_tracks(self):
        return gt.request("loadTracks.php", gt.make_request(
            ("auth_token", self.token),
            ("space", "private"),
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

        res = self.load_private_tracks();
        self.assert_code(res, 0)

        self.assertEqual(res.find(".//tracks/track/name").text, track_name)

    def test_duplicated_names(self):
        self.sign_in()

        res = gt.request("createTrack.php", self.make_test_track_request("1"))
        self.assert_code(res, 0)

        res = gt.request("createTrack.php", self.make_test_track_request("1"))
        self.assert_code(res, 0)

        res = self.load_private_tracks();
        self.assertEqual(len(res.findall(".//tracks/track")), 2)
        
if __name__ == "__main__":
    unittest.main()
