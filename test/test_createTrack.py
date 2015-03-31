#!/usr/bin/env python3
import unittest
import getstest as gt
import getsconfig
import uuid
import xml.etree.ElementTree as ET

class TestCreateTrack(unittest.TestCase):
    def create_track(self, **args):
        name = gt.make_name()
        description = "test_description"
        url = "http://example.com"
        auth_token = getsconfig.TOKEN;
        update = "false"

        if 'auth_token' in args: auth_token = args['auth_token']
        if 'description' in args: description = args['description']
        if 'url' in args: url = args['url']
        if 'name' in args: name = args['name']
        if 'update' in args: update = args['update']

        req = gt.make_request(
                ('auth_token', auth_token),
                ('name', name),
                ('hname', 'human readable <> name'),
                ('description', description),
                ('url', url),
                ('category_id', '1'),
                ('update', update))
        
        resp = gt.do_request("createTrack.php", req);
        return resp

    def check_track_exists(self, name, description=None):
        req = gt.make_request(('auth_token', getsconfig.TOKEN))
        resp = gt.do_request("loadTracks.php", req)

        xml = gt.get_content(resp)
        arr = xml.findall("./tracks/track")

        for track in arr:
            track_name = track.find('name').text
            track_description = track.find('description').text

            if (track_name == name and (description == None or track_description == description)):
                return True

        return False

    def get_track_id(self, resp):
        xml = ET.fromstring(resp)
        return xml.find("./content/track_id").text

    def test_wrong_token(self):
        resp = self.create_track(auth_token=getsconfig.TOKEN + "q")
        self.assertEqual(1, gt.get_code(resp))

    def test_create_track(self):
        resp = self.create_track()
        self.assertEqual(0, gt.get_code(resp))
        
    def test_create_duplicated_track(self):
        name = gt.make_name()
        resp = self.create_track(name=name)
        self.assertEqual(0, gt.get_code(resp))

        resp = self.create_track(name=name)
        self.assertEqual(2, gt.get_code(resp))
        
    def test_create_check(self):
        name = gt.make_name()
        resp = self.create_track(name=name)
        
        self.assertTrue(self.check_track_exists(name))

    def test_create_check_2(self):
        name = gt.make_name_2()
        resp = self.create_track(name=name)
        self.assertTrue(self.check_track_exists(self.get_track_id(resp)))

    def test_create_check_desc(self):
        name = gt.make_name()
        desc = gt.make_name()
        resp = self.create_track(name=name, description=desc)
        self.assertTrue(self.check_track_exists(name, desc))
        self.assertFalse(self.check_track_exists(name, desc + 'qwe'))
        
    def test_update_track(self):
        name = gt.make_name()
        desc = gt.make_name()
        resp = self.create_track(name=name, description=desc)

        desc2 = gt.make_name()
        resp = self.create_track(name=name, description=desc2)
        self.assertEqual(2, gt.get_code(resp))

        resp = self.create_track(name=name, description=desc2, update='true')
        self.assertEqual(0, gt.get_code(resp))
        self.assertTrue(self.check_track_exists(name, desc2))
        self.assertFalse(self.check_track_exists(name, desc))

    def test_delete_track(self):
        name = gt.make_name()
        self.create_track(name=name)
        
        req = gt.make_request(('auth_token', getsconfig.TOKEN), ('name', name))
        self.assertTrue(self.check_track_exists(name))

        resp = gt.do_request('deleteTrack.php', req)
        self.assertEqual(0, gt.get_code(resp))
        self.assertFalse(self.check_track_exists(name))

    def test_keep_old_tracks(self):
        name = gt.make_name()
        self.create_track(name=name)
        
        name2 = gt.make_name()
        self.create_track(name=name2, update='true')
        self.create_track(name=name2, update='true')

        self.assertTrue(self.check_track_exists(name))
        self.assertTrue(self.check_track_exists(name2))

if __name__ == "__main__":
    unittest.main()
