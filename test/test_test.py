#!/usr/bin/env python3

import unittest
import getstest as gt
import getsconfig
import uuid
import xml.etree.ElementTree as ET

class TestTest(unittest.TestCase):

    def setUp(self):
        self.token = None

        gt.do_get("test/resetDatabase.php");
        pass

    def tearDown(self):
        pass

    def sign_in(self):
        self.token = gt.do_get("test/createTestAccount.php")

    def load_points_1(self):
        res = gt.request("loadPoints.php", gt.make_request(
            ("auth_token", self.token),
            ("category_id", "1"),
            ("space", "private")
            ))
        return res


    def make_test_point_request_1(self, suffix):
        return gt.make_request(
            ("auth_token", self.token),
            ("category_id", "1"),
            ("title", "test point " + suffix),
            ("description", "test description " + suffix),
            ("link", "http://example.com"),
            ("latitude", "64"),
            ("longitude", "31"),
            ("altitude", "0"),
            ("time", "01 10 2014 17:33:47.630")
            )
    
    def assert_test_point_1(self, point, suffix):
        self.assertEqual(point.name, "test point " + suffix)
        self.assertEqual(point.description, "test description " + suffix)
        self.assertEqual(point.link, "http://example.com")
        self.assertEqual(point.category_id, 1)
        self.assertAlmostEqual(point.latitude, 64)
        self.assertAlmostEqual(point.longitude, 31)
        self.assertAlmostEqual(point.altitude, 0)

    def test_login(self):
        self.assertTrue(True)
        self.sign_in();
        
        res = gt.request("userInfo.php", gt.make_request(("auth_token", self.token)))
        self.assertEqual(gt.get_code(res), 0)
        
    def test_create_point(self):
        self.sign_in()

        res = gt.request("addPoint.php", self.make_test_point_request_1("1"))
        self.assertEqual(gt.get_code(res), 0)
        point = gt.Point.from_xml(gt.get_content(res))[0]
        self.assert_test_point_1(point, "1")
        self.assertTrue(point.access)

    def test_create_minimal_point(self):
        self.sign_in()

        res = gt.request("addPoint.php", gt.make_request(
                        ("auth_token", self.token),
                        ("category_id", "1"),
                        ("title", "test point"),
                        ("latitude", "64"),
                        ("longitude", "31"),
                        ))
        self.assertEqual(gt.get_code(res), 0)
        point = gt.Point.from_xml(gt.get_content(res))[0]

        self.assertEqual(point.description, None)
        self.assertAlmostEqual(point.altitude, 0)

    def test_load_point(self):
        self.sign_in()
        gt.request("addPoint.php", self.make_test_point_request_1("1"))
        res = self.load_points_1()
        self.assertEqual(gt.get_code(res), 0)
        point = gt.Point.from_xml(gt.get_content(res))[0]
        self.assert_test_point_1(point, "1")
        self.assertTrue(point.access)

    def test_extended_data(self):
        self.sign_in()
        req = gt.make_request(
                        ("auth_token", self.token),
                        ("category_id", "1"),
                        ("title", "test point"),
                        ("latitude", "64"),
                        ("longitude", "31"),
                        ("extended_data", [
                            ("test1", "value1"),
                            ("test2", "value2")
                        ]))

        gt.request("addPoint.php", req)
        res = self.load_points_1()
        point = gt.Point.from_xml(gt.get_content(res))[0]
        self.assertEqual(point.extended_data["test1"], "value1")
        self.assertEqual(point.extended_data["test2"], "value2")

    


if __name__ == "__main__":
    unittest.main()
