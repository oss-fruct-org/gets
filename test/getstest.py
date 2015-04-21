import xml.etree.ElementTree as ET
import urllib.request
import getsconfig
import uuid
import os
import subprocess

idx=0

def make_name():
    global idx
    idx += 1
    return 'tr_' + str(uuid.uuid4()) + str(idx) + "testtrack"

def make_name_2():
    global idx
    idx += 1
    return 'test_' + str(uuid.uuid4()) + str(idx) + "test"

def make_request(*p):
    "Make string GeTS request from tuples' varargs"
        
    request = ET.Element('request')
    params = ET.SubElement(request, 'params')

    for param_tuple in p:
        param = param_tuple[0]
        value = param_tuple[1]

        if (param != "extended_data"):
            child = ET.SubElement(params, param)
            child.text = value
        else:
            extended_data_child = ET.SubElement(params, "extended_data")
            for extended_data_tuple in value:
                extended_data_value = ET.SubElement(extended_data_child, extended_data_tuple[0])
                extended_data_value.text = extended_data_tuple[1]

    return ET.tostring(request, encoding="unicode")


def do_request(method, data):
    url = getsconfig.SERVER + "/" + method
    req = urllib.request.Request(url=url, data=data.encode('utf-8'))

    with urllib.request.urlopen(req) as f:
        response = f.read().decode('utf-8')
        return response

def do_get(method):
    url = getsconfig.SERVER + "/" + method
    req = urllib.request.Request(url=url)
    with urllib.request.urlopen(req) as f:
        response = f.read().decode('utf-8')
        return response

def request(method, data):
    response = do_request(method, data)
    return ET.fromstring(response)

def to_string(xml):
    return ET.tostring(xml, encoding="unicode")

def get_content(xml):
    return xml.find("./content")

def get_code(xml):
    code_elem = xml.find("./status/code")
    if (code_elem is None):
        return None
    else:
        return int(code_elem.text)

def raw_query(sql):
    subprocess.call(["/usr/bin/psql", getsconfig.PG_STRING, "-E", "--quiet", "-c", sql])
    pass

class Point:
    def __init__(self, placemark):
        self.name = None
        self.description = None
        self.uuid = None
        self.category_id = None
        self.link = None
        self.latitude = None
        self.longitude = None
        self.altitude = None
        self.access = False

        self.extended_data = {}

        ns = {"kml":"http://www.opengis.net/kml/2.2"}

        self.name = placemark.find("kml:name", ns).text
        self.description = placemark.find("kml:description", ns).text
        
        coord = placemark.find("kml:Point/kml:coordinates", ns).text

        self.longitude, self.latitude, self.altitude = [float(tok) for tok in coord.split(",")]
        
        ex_arr = placemark.findall('./kml:ExtendedData/kml:Data', ns)
        for data in ex_arr:
            key = data.attrib['name']
            value = data.find('./kml:value', ns).text            

            if key == "uuid":
                self.uuid = value
            elif key == "category_id":
                self.category_id = int(value)
            elif key == "link":
                self.link = value
            elif key == "access":
                self.access = value == "rw"
            else:
                self.extended_data[key] = value

    @classmethod
    def from_xml(cls, xml):
        ns = {"kml":"http://www.opengis.net/kml/2.2"}
        arr = xml.findall("./kml:kml/kml:Document/kml:Placemark", ns)
        return [Point(placemark) for placemark in arr]

