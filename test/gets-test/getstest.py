import xml.etree.ElementTree as ET
import urllib.request
import getsconfig
import uuid

idx=0

def make_name():
    global idx
    idx += 1
    return 'tr_' + str(uuid.uuid4()) + str(idx) + "testtrack"

def make_request(*p):
    "Make string GeTS request from tuples' varargs"
        
    request = ET.Element('request')
    params = ET.SubElement(request, 'params')

    for param_tuple in p:
        param = param_tuple[0]
        value = param_tuple[1]

        child = ET.SubElement(params, param)
        child.text = value

    return ET.tostring(request, encoding="unicode")

def do_request(method, data):
    url = getsconfig.SERVER + "/" + method
    req = urllib.request.Request(url=url, data=data.encode('utf-8'))

    with urllib.request.urlopen(req) as f:
        response = f.read().decode('utf-8')
        return response

def get_content(string):
    return ET.fromstring(string).find("./content")

def get_code(string):
    xml = ET.fromstring(string)

    return int(xml.findall("./status/code")[0].text)
