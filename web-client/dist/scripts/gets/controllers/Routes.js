/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-12-20          (the version of the package this class was first added to)
 */

/**
 * Constructor for controller "Routes".
 * 
 * @constructor
 */
function Routes() {}

Routes.prototype.makeGoogleDirectionsRoute = function (track, options, callback) {
    if (!track) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, track undefined or null');
    }
    if (!track.hasOwnProperty('points')) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, track has no "points" property');
    }
    if (track.points.length < 1) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, track has empty points array');
    }
    if (track.points.length == 1) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, can\'t request route for just one point');
    }
    if (track.points.length >= 11) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, total number of points in the route must be 10 or less (will be fixed in further updates)');
    }
    
    // Construct url for request
    //origin=Boston,MA&destination=Concord,MA&
    var urlRequest = 'http://maps.googleapis.com/maps/api/directions/json?sensor=false&';
    
    if (options) {
        for (var i = 0, len = options.length; i < len; i++) {
            if (options[i].name !== 'optimize') {
                urlRequest += options[i].name + '=' + options[i].value + '&';
            } else {
                var optimize = options[i];
            }
        }
    }
    
    var coords = track.points[0].coordinates.split(',');
    urlRequest += 'origin=' + String(coords[1] + ',' + coords[0]) + '&';
    
    coords = track.points[track.points.length - 1].coordinates.split(',');
    urlRequest += 'destination=' + String(coords[1] + ',' + coords[0]) + '&';
    
    if (track.points.length >= 3) {
        urlRequest += 'waypoints=';
        for (var i = 1; i < track.points.length - 1; i++) {
            var localCoords = track.points[i].coordinates.split(',');
            urlRequest += String(localCoords[1] + ',' + localCoords[0]) + '|';
        }
        if (optimize) {
            urlRequest += optimize.name + ':' + optimize.value;
        }
    }
    
    var getRouteRequest = $.ajax({
        url: RETRANSLATOR_ACTION,
        type: 'POST',
        async: true,
        dataType: 'json',
        data: JSON.stringify({url: urlRequest})
    });
    
    getRouteRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, getRouteRequest failed ' + textStatus);
    });
    
    getRouteRequest.done(function(data, textStatus, jqXHR) {
        track.serviceRoutes = [];
        track.bounds = jqXHR.responseJSON.routes[0].bounds;
        for (var i = 0, len = jqXHR.responseJSON.routes.length; i < len; i++) {
            track.serviceRoutes.push(jqXHR.responseJSON.routes[i].overview_polyline.points);
        }
            
        if (callback) {
            callback();
        }
    });
    
    
    /*var newRoute = [];
    var legs = getRouteRequest.responseJSON.routes[0].legs;
    for (var j = 0, len = legs.length; j < len; j++) {
        newRoute.push({
            lat: legs[j].start_location.lat,
            lng: legs[j].start_location.lng
        });
    }
    
    newRoute.push({
        lat: legs[legs.length - 1].end_location.lat, 
        lng: legs[legs.length - 1].end_location.lat
    });
    
    Logger.debug(newRoute);
    track.googleRoute = newRoute;*/ 
};

/**
 * Request OSM obstacles over Overpass API
 * @param {type} track
 * @param {type} callback
 * @returns {undefined}
 */
Routes.prototype.requestOSMObstacles = function (track, callback) {
    if (!track) {
        throw new GetsWebClientException('Routes Error', 'requestOSMObstacles, track undefined or null');
    }
    if (!track.hasOwnProperty('bounds')) {
        //throw new GetsWebClientException('Routes Error', 'requestOSMObstacles, there is no bounds for this track');
        if (!track.hasOwnProperty('points')) {
            throw new GetsWebClientException('Routes Error', 'requestOSMObstacles, track has no "points" property');
        }
        
        track.bounds = this.getBoundBoxForPoints(track.points);
    }
    
    var urlRequest = 'http://overpass-api.de/api/interpreter?data=[out:xml][timeout:1000];(way["building"="yes"](' + track.bounds.southwest.lat + ',' + track.bounds.southwest.lng + ',' + track.bounds.northeast.lat + ',' + track.bounds.northeast.lng + '););(._;>;);out skel qt;';
    urlRequest = urlRequest.split(' ').join('%20').split('"').join('%22');//replace(' ', '%20').replace('"','%22');
    Logger.debug(urlRequest);
  
    /*var getObstaclesRequest = $.ajax({
        url: urlRequest,
        type: 'GET',
        async: true,
        dataType: 'xml'
        //data: JSON.stringify({url: urlRequest})
    });
    
    getObstaclesRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, getObstaclesRequest failed ' + textStatus);
    });*/
    
    //getObstaclesRequest.done(function(data, textStatus, jqXHR) {
        var data = $.parseXML('<?xml version="1.0" encoding="UTF-8"?> <osm version="0.6" generator="Overpass API"> <note>The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.</note> <meta osm_base="2014-12-28T19:35:01Z"/> <node id="393036461" lat="61.8013810" lon="34.3535838"/> <node id="393036462" lat="61.8012938" lon="34.3534538"/> <node id="393036484" lat="61.8014246" lon="34.3534530"/> <node id="393036485" lat="61.8013373" lon="34.3533229"/> <node id="520089406" lat="61.8016678" lon="34.3528534"/> <node id="520089438" lat="61.8016198" lon="34.3534650"/> <node id="520089440" lat="61.8015145" lon="34.3533051"/> <node id="520089451" lat="61.8017730" lon="34.3530133"/> <node id="522689764" lat="61.8011707" lon="34.3500845"/> <node id="522727102" lat="61.8010734" lon="34.3499391"/> <node id="522754478" lat="61.8014305" lon="34.3488690"/> <node id="522782485" lat="61.8015278" lon="34.3490144"/> <node id="1736321470" lat="61.8013818" lon="34.3490149"/> <node id="1736321663" lat="61.8008126" lon="34.3496844"/> <node id="1736321666" lat="61.8008201" lon="34.3497772"/> <node id="1736321674" lat="61.8008932" lon="34.3496554"/> <node id="1736321685" lat="61.8009007" lon="34.3497482"/> <node id="1736321716" lat="61.8010397" lon="34.3510834"/> <node id="1736321718" lat="61.8010551" lon="34.3503762"/> <node id="1736321722" lat="61.8010748" lon="34.3511350"/> <node id="1736321725" lat="61.8010851" lon="34.3505814"/> <node id="1736321726" lat="61.8010920" lon="34.3509237"/> <node id="1736321728" lat="61.8011102" lon="34.3503401"/> <node id="1736321739" lat="61.8011271" lon="34.3509753"/> <node id="1736321741" lat="61.8011366" lon="34.3507574"/> <node id="1736321747" lat="61.8011403" lon="34.3505452"/> <node id="1736321754" lat="61.8011742" lon="34.3508198"/> <node id="1736321756" lat="61.8011889" lon="34.3506159"/> <node id="1736321775" lat="61.8012266" lon="34.3506782"/> <node id="1736321781" lat="61.8012502" lon="34.3508145"/> <node id="1736321802" lat="61.8013603" lon="34.3505004"/> <node id="1736321821" lat="61.8015719" lon="34.3513191"/> <node id="1736321825" lat="61.8015838" lon="34.3511930"/> <node id="1736321830" lat="61.8015971" lon="34.3510230"/> <node id="1736321845" lat="61.8016046" lon="34.3512256"/> <node id="1736321848" lat="61.8016269" lon="34.3510698"/> <node id="1736321851" lat="61.8016312" lon="34.3509255"/> <node id="1737426991" lat="61.8016383" lon="34.3534105"/> <way id="34270154"> <nd ref="393036484"/> <nd ref="393036485"/> <nd ref="393036462"/> <nd ref="393036461"/> <nd ref="393036484"/> </way> <way id="41965859"> <nd ref="520089438"/> <nd ref="520089440"/> <nd ref="520089406"/> <nd ref="520089451"/> <nd ref="1737426991"/> <nd ref="520089438"/> </way> <way id="42078408"> <nd ref="522754478"/> <nd ref="522782485"/> <nd ref="522689764"/> <nd ref="522727102"/> <nd ref="1736321470"/> <nd ref="522754478"/> </way> <way id="161663004"> <nd ref="1736321756"/> <nd ref="1736321775"/> <nd ref="1736321754"/> <nd ref="1736321741"/> <nd ref="1736321756"/> </way> <way id="161663005"> <nd ref="1736321739"/> <nd ref="1736321726"/> <nd ref="1736321716"/> <nd ref="1736321722"/> <nd ref="1736321739"/> </way> <way id="161663008"> <nd ref="1736321718"/> <nd ref="1736321728"/> <nd ref="1736321747"/> <nd ref="1736321725"/> <nd ref="1736321718"/> </way> <way id="161663010"> <nd ref="1736321685"/> <nd ref="1736321674"/> <nd ref="1736321663"/> <nd ref="1736321666"/> <nd ref="1736321685"/> </way> <way id="161663019"> <nd ref="1736321781"/> <nd ref="1736321802"/> <nd ref="1736321851"/> <nd ref="1736321830"/> <nd ref="1736321848"/> <nd ref="1736321825"/> <nd ref="1736321845"/> <nd ref="1736321821"/> <nd ref="1736321781"/> </way> </osm> ');
        
        var obsts = [];
        $(data).find('way').each(function (key, node) {
            var convexHull = new ConvexHullGrahamScan();
            $(node).find('nd').each(function (key, ref) {
                var point = $(data).find("node[id='" + $(ref).attr('ref')+ "']");
                convexHull.addPoint($(point).attr('lat'), $(point).attr('lon'));
            });
            obsts.push(convexHull);
        });
                   
        if (callback) {
            callback(obsts);
        }
    //});   
};

Routes.prototype.getBoundBoxForPoints = function (points) {
    if (points.length < 1) return;
    
    var north = 0.0, east = 0.0, south = 0.0, west = 0.0;
    var localCoords = points[0].coordinates.split(',');
    north = south = parseFloat(localCoords[1]);
    east = west = parseFloat(localCoords[0]);
     
    for (var i = 1; i < points.length; i++) {
        localCoords = points[i].coordinates.split(',');
        if (parseFloat(localCoords[1]) > north) {
            north = parseFloat(localCoords[1]);
        }
        if (parseFloat(localCoords[1]) < south) {
            south = parseFloat(localCoords[1]);
        }
        if (parseFloat(localCoords[0]) > east) {
            east = parseFloat(localCoords[0]);
        }
        if (parseFloat(localCoords[0]) < west) {
            west = parseFloat(localCoords[0]);
        }      
    }
    
    return {
        northeast: {
            lat: north,
            lng: east
        },
        southwest: {
            lat: south,
            lng: west
        }
    };
};

Routes.prototype.addCurvePoints = function (track, type) {
    Logger.debug('type: ' + type);
    
    var curvePoints = null;
    switch (type) {
        case MapClass.ROUTE_TYPE_CURVE_RAW:
            curvePoints = [];
            for (var i = 0, len = track.points.length; i < len; i++) {
                var point = track.points[i].coordinates.split(',').map(parseFloat);
                curvePoints.push(new L.LatLng(point[1], point[0]));
            }
            break;
        case MapClass.ROUTE_TYPE_CURVE_SERVICE:
            Logger.debug(track.serviceRoutes[0]);
            if (!track.serviceRoutes[0]) {
                Logger.error('No service route had been found');
                return;
            }
            var points = L.PolylineUtil.decode(track.serviceRoutes[0]);
            curvePoints = [];
            for (var i = 0, len = points.length; i < len; i++) {
                curvePoints.push(new L.LatLng(points[i][0], points[i][1]));
            }
            Logger.debug(curvePoints);
            break;
        default: 
            Logger.error('Unknown type');
    }
    track.curvePoints = curvePoints;
};

Routes.prototype.addCShape = function (track) { 
    //sign( (Bx-Ax)*(Y-Ay) - (By-Ay)*(X-Ax) )
    var calculateSign = function (A, B, C) {
        return (B.lat - A.lat) * (C.lng - A.lng) - (B.lng - A.lng) * (C.lat - A.lat);
    };
    
    var cShapePolyline = [];
    
    cShapePolyline.push({point: track.curvePoints[0], isInflection: false});
    
    for (var i = 1, len = track.curvePoints.length; i < len - 2; i++) {
        var b_0 = track.curvePoints[i - 1], 
            b_1 = track.curvePoints[i], 
            b_2 = track.curvePoints[i + 1], 
            b_3 = track.curvePoints[i + 2];
        
        cShapePolyline.push({point: b_1, isInflection: false});
               
        Logger.debug('i = ' + i + ' sign1 = ' + calculateSign(b_1, b_0, b_2) + ' sign2 = ' + calculateSign(b_2, b_1, b_3));
        if ((calculateSign(b_1, b_0, b_2) * calculateSign(b_2, b_1, b_3)) <= 0) {
            cShapePolyline.push({point: new L.LatLng((b_1.lat + b_2.lat) / 2, (b_1.lng + b_2.lng) / 2), isInflection: true});
        }       
    }
    
    cShapePolyline.push({point: track.curvePoints[track.curvePoints.length - 2], isInflection: false});
    cShapePolyline.push({point: track.curvePoints[track.curvePoints.length - 1], isInflection: false});
    
    Logger.debug(cShapePolyline);
    
    track.cShapePolyline = cShapePolyline;
    
    var cShapeSections = [];
    var section = [];
    for (var i = 0, len = cShapePolyline.length; i < len; i++) {
        section.push(cShapePolyline[i].point);
        if (cShapePolyline[i].isInflection || (section.length >= 4)) {
            if (cShapePolyline[i].isInflection && (section.length < 4)) {
                section.push(cShapePolyline[i].point);
            }
            cShapeSections.push(section);
            section = [];
            section.push(cShapePolyline[i].point);           
        }
        if (i >= len - 1) {
            if (section.length < 4) {
                section.push(cShapePolyline[i].point);
                cShapeSections.push(section);
            }
        }
    }  
    //cShapeSections.push(section);
    
    Logger.debug(cShapeSections);
    
    track.cShapeSections = cShapeSections;
};

Routes.prototype.obstacleAvoidingCurve = function (track, type) { 
    var u = 0.8;
    var accuracy = 0.1;
    
    if (track.points.length < 2) {
        throw new GetsWebClientException('Routes Error', 'obstacleAvoidingCurve, total number of points in the route must be 2 or more');
    }
    
    this.addCurvePoints(track, type);
    this.addCShape(track);
    
    var oACurve = [];
    
    // Calculate N*p
    var pointsMult = function (p, N) {
        return new L.LatLng(N * p.lat, N * p.lng);
    };
    
    // Calculate p1 + p0
    var pointsAdd = function (p0, p1) {
        return new L.LatLng(p1.lat + p0.lat, p1.lng + p0.lng);
    };
    
    // Calculate p0 - p1
    var pointsSubs = function (p0, p1) {
        return new L.LatLng(p0.lat - p1.lat, p0.lng - p1.lng);
    };
    
    var bezier = function (t, p0, p1, p2, p3) {        
        var lat = Math.pow(1 - t, 3) * p0.lat + 3 * Math.pow(1 - t, 2) * t * p1.lat + 3 * (1 - t) * Math.pow(t, 2) * p2.lat + Math.pow(t, 3) * p3.lat;
        var lng = Math.pow(1 - t, 3) * p0.lng + 3 * Math.pow(1 - t, 2) * t * p1.lng + 3 * (1 - t) * Math.pow(t, 2) * p2.lng + Math.pow(t, 3) * p3.lng;
        
        return new L.LatLng(lat, lng);
    };
    
    //var p_0 = track.cShapePolyline[0];
    //var p_1 = section[1];
    //var p_2 = section[2];
    //var p_3 = section[3];
    
    var b0 = track.cShapePolyline[0].point,
        b1 = pointsAdd(track.cShapePolyline[0].point, pointsMult(pointsSubs(track.cShapePolyline[1].point, track.cShapePolyline[0].point), u / 2)),
        b2 = pointsAdd(track.cShapePolyline[0].point, pointsSubs(pointsSubs(track.cShapePolyline[1].point, track.cShapePolyline[0].point), pointsMult(pointsSubs(track.cShapePolyline[1].point, track.cShapePolyline[0].point), u / 2))),
        b3 = pointsAdd(track.cShapePolyline[0].point, pointsAdd(pointsSubs(track.cShapePolyline[1].point, track.cShapePolyline[0].point), pointsMult(pointsSubs(pointsSubs(track.cShapePolyline[2].point, track.cShapePolyline[1].point), pointsSubs(track.cShapePolyline[1].point, track.cShapePolyline[0].point)), u / 4)));
    for (var j = 0; j <= 1; j += accuracy) {
        oACurve.push(bezier(j, b0, b1, b2, b3));
        //oACurve.push(bezier(j, p_0, p_1, p_2, p_3));
    }
    
    for (var i = 1, len = track.cShapePolyline.length; i < len - 2; i++) {
        /*switch (i) {
            case 10:
                u = 0.1;
                break;
            default:
                u = 0.8;
        }*/
        
        
        b0 = pointsAdd(track.cShapePolyline[i].point, pointsMult(pointsSubs(pointsSubs(track.cShapePolyline[i + 1].point, track.cShapePolyline[i].point), pointsSubs(track.cShapePolyline[i].point, track.cShapePolyline[i - 1].point)), u / 4));
        b1 = pointsAdd(track.cShapePolyline[i].point, pointsMult(pointsSubs(track.cShapePolyline[i + 1].point, track.cShapePolyline[i].point), u / 2));
        b2 = pointsAdd(track.cShapePolyline[i].point, pointsSubs(pointsSubs(track.cShapePolyline[i + 1].point, track.cShapePolyline[i].point), pointsMult(pointsSubs(track.cShapePolyline[i + 1].point, track.cShapePolyline[i].point), u / 2)));
        b3 = pointsAdd(track.cShapePolyline[i].point, pointsAdd(pointsSubs(track.cShapePolyline[i + 1].point, track.cShapePolyline[i].point), pointsMult(pointsSubs(pointsSubs(track.cShapePolyline[i + 2].point, track.cShapePolyline[i + 1].point), pointsSubs(track.cShapePolyline[i + 1].point, track.cShapePolyline[i].point)), u / 4)));
        
        for (var j = 0; j <= 1; j += accuracy) {
            oACurve.push(bezier(j, b0, b1, b2, b3));
            //oACurve.push(bezier(j, p_0, p_1, p_2, p_3));
        }
    }
    
    var len = track.cShapePolyline.length;
    b0 = pointsAdd(track.cShapePolyline[len - 2].point, pointsMult(pointsSubs(pointsSubs(track.cShapePolyline[len - 1].point, track.cShapePolyline[len - 2].point), pointsSubs(track.cShapePolyline[len - 2].point, track.cShapePolyline[len - 3].point)), u / 4));
    b1 = pointsAdd(track.cShapePolyline[len - 2].point, pointsMult(pointsSubs(track.cShapePolyline[len - 1].point, track.cShapePolyline[len - 2].point), u / 2));
    b2 = pointsAdd(track.cShapePolyline[len - 2].point, pointsSubs(pointsSubs(track.cShapePolyline[len - 1].point, track.cShapePolyline[len - 2].point), pointsMult(pointsSubs(track.cShapePolyline[len - 1].point, track.cShapePolyline[len - 2].point), u / 2)));
    b3 = track.cShapePolyline[len - 1].point;
    for (var j = 0; j <= 1; j += accuracy) {
        oACurve.push(bezier(j, b0, b1, b2, b3));
        //oACurve.push(bezier(j, p_0, p_1, p_2, p_3));
    }
    
    /*for (var i = 1, len = track.cShapeSections.length; i < len; i++) {
        var section = track.cShapeSections[i];
        
        if (section.length != 4) {
            Logger.error('Some of the sections has more or less than 4 points');
            break;
        }
        var p_0 = section[0];
        var p_1 = section[1];
        var p_2 = section[2];
        var p_3 = section[3];
        
        var b0 = pointsAdd(p_1, pointsMult(pointsSubs(pointsSubs(p_2, p_1), pointsSubs(p_1, p_0)), u / 4));
        var b1 = pointsAdd(p_1, pointsMult(pointsSubs(p_2, p_1), u / 2));
        var b2 = pointsAdd(p_1, pointsSubs(pointsSubs(p_2, p_1), pointsMult(pointsSubs(p_2, p_1), u / 2)));
        var b3 = pointsAdd(p_1, pointsAdd(pointsSubs(p_2, p_1), pointsMult(pointsSubs(pointsSubs(p_3, p_2), pointsSubs(p_2, p_1)), u / 4)));
              
        for (var j = 0; j < 1; j += accuracy) {
            oACurve.push(bezier(j, b0, b1, b2, b3));
            //oACurve.push(bezier(j, p_0, p_1, p_2, p_3));
        }
        
        break;
    }*/
    
    
    track.oACurve = L.PolylineUtil.encode(oACurve);
};


