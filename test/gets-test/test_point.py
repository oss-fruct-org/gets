#!/usr/bin/env python3
import unittest
import getstest as gt
import getsconfig
import uuid
import xml.etree.ElementTree as ET

class TestCreatePoint(unittest.TestCase):
    def create_point(self, **args):
        auth_token = getsconfig.TOKEN;

        name = gt.make_name()
        description = "test_description"
        url = "http://example.com"
        time = "01 01 2000 00:00:00.000"

        lat = 61.0
        lon = 34.0
        alt = 0.0
    

        if 'auth_token' in args: auth_token = args['auth_token']
        if 'description' in args: description = args['description']
        if 'link' in args: url = args['link']
        if 'name' in args: name = args['name']
        if 'lat' in args: lat = args['lat']
        if 'lon' in args: lon = args['lon']

        req = gt.make_request(
                ('auth_token', auth_token),
                ('category_id', '1'),
                ('title', name),
                ('description', description),
                ('link', url),
                ('latitude', str(lat)),
                ('longitude', str(lon)),
                ('altitude', str(alt)),
                ('time', time))
        
        resp = gt.do_request("addPoint.php", req);
        return resp

    def check_point_exists(self, name):
        return self.find_point(name) is not None

    def get_extended_data(self, name):
        ns = {"kml":"http://www.opengis.net/kml/2.2"}
        point = self.find_point(name)

        ret = {}
        arr = point.findall('./kml:ExtendedData/kml:Data', ns)
        for data in arr:
            key = data.attrib['name']
            value = data.find('./kml:value', ns).text
            ret[key] = value

        return ret

    def find_point(self, name):
        ns = {"kml":"http://www.opengis.net/kml/2.2"}
        req = gt.make_request(('auth_token', getsconfig.TOKEN), ('latitude', "61"), ('longitude', "34"), ("radius", "10"), ("space", "private"))
        resp = gt.do_request("loadPoints.php", req)

        xml = gt.get_content(resp)
        arr = xml.findall("./kml:kml/kml:Document/kml:Placemark", ns)

        for point in arr:
            point_name = point.find('kml:name', ns).text

            if (point_name == name):
                return point

        return None


    def test_wrong_token(self):
        resp = self.create_point(auth_token=getsconfig.TOKEN + "q")
        self.assertEqual(1, gt.get_code(resp))

    def test_create_point(self):
        resp = self.create_point()
        self.assertEqual(0, gt.get_code(resp))
        
    def test_create_check(self):
        name = gt.make_name()
        resp = self.create_point(name=name)
        self.assertEqual(0, gt.get_code(resp))
        self.assertTrue(self.check_point_exists(name))

    def test_delete_point(self):
        name = gt.make_name()
        resp = self.create_point(name=name)

        name2 = gt.make_name()
        resp = self.create_point(name=name2)

        del_req = gt.make_request(('auth_token', getsconfig.TOKEN), ('category_id', "1"), ('name', name))
        resp = gt.do_request("deletePoint.php", del_req);
        self.assertEqual(0, gt.get_code(resp))

        self.assertFalse(self.check_point_exists(name))
        self.assertTrue(self.check_point_exists(name2))

    def test_delete_by_uuid(self):
        name1 = gt.make_name()
        desc1 = '{"uuid" : "aaa"}'
        self.create_point(description=desc1, name=name1)

        name2 = gt.make_name()
        desc2 = '{"uuid" : "bbb"}'

        self.create_point(description=desc2, name=name2)
        self.assertTrue(self.check_point_exists(name1))
        self.assertTrue(self.check_point_exists(name2))

        del_req = gt.make_request(('auth_token', getsconfig.TOKEN), ('category_id', "1"), ('uuid', 'aaa'))
        resp = gt.do_request("deletePoint.php", del_req);
        self.assertEqual(0, gt.get_code(resp))

        self.assertFalse(self.check_point_exists(name1))
        self.assertTrue(self.check_point_exists(name2))

    def test_delete_by_coordinate(self):
        name1 = gt.make_name()
        self.create_point(name=name1, lat="31", lon="34")

        name2 = gt.make_name()
        self.create_point(name=name2, lat="31", lon="35")

        del_req = gt.make_request(('auth_token', getsconfig.TOKEN), ('category_id', "1"), ('latitude', '31'))
        resp = gt.do_request("deletePoint.php", del_req);
        self.assertEqual(0, gt.get_code(resp))
         
        self.assertFalse(self.check_point_exists(name1))
        self.assertFalse(self.check_point_exists(name2))

    def test_extended_data(self):
        name = gt.make_name()
        desc = '{"uuid" : "aaa"}'
        self.create_point(name=name, description=desc)

        ext = self.get_extended_data(name)
        self.assertFalse('description' in ext, "Ext data was " + str(ext))
        self.assertTrue('uuid' in ext)

if __name__ == "__main__":
    unittest.main()
