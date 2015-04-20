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

    def make_test_point_request_ex(self, extended_data):
        return gt.make_request(
            ("auth_token", self.token),
            ("category_id", "1"),
            ("title", "test point"),
            ("description", "test description"),
            ("link", "http://example.com"),
            ("latitude", "64"),
            ("longitude", "31"),
            ("altitude", "0"),
            ("time", "01 10 2014 17:33:47.630"),
            ("extended_data", extended_data)
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

    def test_update_point_by_title(self):
        self.sign_in()

        gt.request("addPoint.php", self.make_test_point_request_1("1"))
        gt.request("addPoint.php", self.make_test_point_request_1("2"))
        res = gt.request("updatePoint.php", gt.make_request(
            ("auth_token", self.token),
            ("name", "test point 1"),

            ("title", "updated point 1")
            ));
        self.assertEqual(gt.get_code(res), 0)

        points = gt.Point.from_xml(gt.get_content(self.load_points_1()))
        self.assertEqual(len(points), 2)
        
        names = [point.name for point in points]
        self.assertTrue("test point 2" in names)
        self.assertTrue("updated point 1" in names)

    def test_update_point_by_uuid_and_name(self):
        self.sign_in()

        res = gt.request("addPoint.php", self.make_test_point_request_1("1"))
        gt.request("addPoint.php", self.make_test_point_request_1("1"))
        gt.request("addPoint.php", self.make_test_point_request_1("2"))
        point = gt.Point.from_xml(gt.get_content(res))[0]
        
        res = gt.request("updatePoint.php", gt.make_request(
            ("auth_token", self.token),
            ("uuid", point.uuid),
            ("name", "test point 1"),

            ("title", "updated point 1")
            ));
        self.assertEqual(gt.get_code(res), 0)

        points = gt.Point.from_xml(gt.get_content(self.load_points_1()))
        self.assertEqual(len(points), 3)

        names = [point.name for point in points]
        self.assertTrue("test point 2" in names)
        self.assertTrue("updated point 1" in names)
        self.assertTrue("test point 1" in names)

    def test_update_extended_data(self):
        self.sign_in()

        res = gt.request("addPoint.php", self.make_test_point_request_ex([("ex1", "data1"), ("ex2", "data2")]))
        point = gt.Point.from_xml(gt.get_content(res))[0]

        res = gt.request("updatePoint.php", gt.make_request(
            ("auth_token", self.token),
            ("name", "test point"),

            ("extended_data", [("ex3", "data3"), ("ex4", "data4")])
            ));
        self.assertEqual(gt.get_code(res), 0)

        xml = gt.get_content(self.load_points_1())
        new_point = gt.Point.from_xml(xml)[0]
        self.assertEqual(new_point.name, "test point")
        self.assertEqual(point.uuid, new_point.uuid)

        self.assertFalse("ex1" in new_point.extended_data)
        self.assertFalse("ex2" in new_point.extended_data)
        self.assertTrue("ex3" in new_point.extended_data)
        self.assertTrue("ex4" in new_point.extended_data)

    def test_update_category_id_uuid(self):
        "There must be impossible to update category id and uuid"
        self.sign_in()
        res = gt.request("addPoint.php", self.make_test_point_request_1("1"))
        point = gt.Point.from_xml(gt.get_content(res))[0]

        res = gt.request("updatePoint.php", gt.make_request(
            ("auth_token", self.token),
            ("name", "test point 1"),

            ("extended_data", [("category_id", "2"), ("uuid", "qweasdzxc")])
            ));

        new_point = gt.Point.from_xml(gt.get_content(self.load_points_1()))[0]
        
        self.assertEqual(point.uuid, new_point.uuid)
        self.assertEqual(point.category_id, new_point.category_id)


if __name__ == "__main__":
    unittest.main()
