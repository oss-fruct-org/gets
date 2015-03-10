/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-31          (the version of the package this class was first added to)
 */

/**
 * Constructor for class "Map". This class is suppoused to contain all map 
 * data and methods to operate on it. Actual map is provided by LeafletJS 
 * http://leafletjs.com/ .
 * 
 * @constructor
 */
function MapClass() {
    this.map = null;
    this.baseMapLayer = null;
    this.layersControl = null;
    this.tempMarker = null;
    this.mapRoutes = [];
    this.searchArea = null;
    this.userMarker = null;
    this.pointsLayer = null;
}

// Route types
MapClass.ROUTE_TYPE_MARKERS = 'markers';
MapClass.ROUTE_TYPE_RAW = 'raw';
MapClass.ROUTE_TYPE_SERVICE = 'service';
MapClass.ROUTE_TYPE_CURVE_RAW = 'curve-raw';
MapClass.ROUTE_TYPE_CURVE_SERVICE = 'curve-service';

// Route colors
MapClass.ROUTE_TYPE_RAW_COLOR = '#8B8B8B';
MapClass.ROUTE_TYPE_SERVICE_COLOR = '#4c4cff';
MapClass.ROUTE_TYPE_CURVE_RAW_COLOR = '#00AA00';
MapClass.ROUTE_TYPE_CURVE_SERVICE_COLOR = '#00AA00';

/**
 * Init map with base tile layer.
 */
MapClass.prototype.initMap = function() {
    if (!this.baseMapLayer) {
        this.baseMapLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        });
    } 
    
    if (!this.map) {
        this.map = L.map('map', {
            center: [61.7830, 34.350],
            zoom: 10,
            layers: [this.baseMapLayer],
            contextmenu: true,
            contextmenuWidth: 140,
            contextmenuItems: [{
                text: 'Add marker',
                callback: function () { alert('click add marker') }
            }]
        });
    }
      
    if (!this.layersControl) {
        this.layersControl = L.control.layers({
            "Base map": this.baseMapLayer
        }, null, {position: 'topleft'}).addTo(this.map);
    }
};

L.NumberedDivIcon = L.Icon.extend({
    options: {
        iconUrl: MARKER_HOLE_IMAGE,
        number: '',
        shadowUrl: null,
        iconSize: new L.Point(25, 41),
        iconAnchor: new L.Point(13, 41),
        popupAnchor: new L.Point(0, -33),
        className: 'leaflet-div-icon-num'
    },
    createIcon: function () {
        var div = document.createElement('div');
        var img = this._createImg(this.options['iconUrl']);
        var numdiv = document.createElement('div');
        numdiv.setAttribute('class', 'number');
        numdiv.innerHTML = this.options['number'] || '';
        div.appendChild(img);
        div.appendChild(numdiv);
        this._setIconStyles(div, 'icon');
        return div;
    },
//you could change this to add a shadow like in the normal marker if you really wanted
    createShadow: function () {
        return null;
    }
});


/* L.EditableCircleMarker is a marker with a radius
 * The marker can be moved and the radius can be changed
 * Source from: https://gist.github.com/glenrobertson/3630960
 */
 
L.EditableCircleMarker = L.Class.extend({
    includes: L.Mixin.Events,
    options: {
        weight: 1,
        clickable: false
    },
    initialize: function(latlng, radius, options) {
        L.Util.setOptions(this, options);

        this._latlng = L.latLng(latlng);
        this._radius = radius;

        this._marker = new L.Marker(latlng, {
            icon: new L.Icon({
                iconSize: new L.Point(25, 41),
                iconAnchor: new L.Point(13, 41),
                popupAnchor: new L.Point(0, -33),
                iconUrl: MARKER_HOLE_IMAGE,
                className: 'leaflet-div-icon-num'
            }),
            draggable: true
        });

        this._circle = new L.Circle(latlng, radius, this.options);

        // move circle when marker is dragged
        var me = this;
        this._marker.on('dragstart', function() {
            me.fire('dragstart');
        });
        this._marker.on('drag', function(e) {
            me._latlng = e.target.getLatLng();
            me._marker.setLatLng(me._latlng);
            me._circle.setLatLng(me._latlng);
            me.fire('drag');
        });
        this._marker.on('dragend', function() {
            me.fire('dragend');
        });
    },
    onAdd: function(map) {
        this._map = map;
        this._marker.addTo(map);
        this._circle.addTo(map);
        this.fire('loaded');
    },
    onRemove: function(map) {
        map.removeLayer(this._marker);
        map.removeLayer(this._circle);
        this.fire('unloaded');
    },
    getBounds: function() {
        return this._circle.getBounds();
    },
    getLatLng: function() {
        return this._latlng;
    },
    setLatLng: function(latlng) {
        this._marker.fire('movestart');
        this._latlng = L.latLng(latlng);
        this._marker.setLatLng(this._latlng);
        this._circle.setLatLng(this._latlng);
        this._marker.fire('moveend');
    },
    getRadius: function() {
        return this._radius;
    },
    setRadius: function(meters) {
        this._marker.fire('movestart');
        this._radius = meters;
        this._circle.setRadius(meters);
        this._marker.fire('moveend');
    },
    getCircleOptions: function() {
        return this._circle.options;
    },
    setCircleStyle: function(style) {
        this._circle.setStyle(style);
    }
});

/**
 * Get index of a route in a route array.
 * 
 * @param {Object} route Given route, format: 
 * {id: "someID", layerGroup: "someLayerGroup", polyLineLayerId: "somepolyLineLayerId"}
 * 
 * @returns {Integer} Index of a route in a route array, or -1 if route is not in an 
 * array.
 */
MapClass.prototype.getRouteIndex = function(mapRoute) {   
    for (var i = 0, len = this.mapRoutes.length; i < len; i++) {
        if (this.mapRoutes[i].id === mapRoute.id){
            return i;
        }
    }
    return -1;
};

/**
 * Add given route to a route array.
 * 
 * @param {Object} route Given route, format: 
 * {id: "someID", layerGroup: "someLayerGroup", polyLineLayerId: "somepolyLineLayerId"}
 * 
 * @throws {GetsWebClientException}
 */
MapClass.prototype.addMapRoute = function(mapRoute) {   
    var index = this.getRouteIndex(mapRoute);
    if (index < 0) {
        this.mapRoutes.push(mapRoute);
    }
};

MapClass.prototype.addTrackPointsToLayerGroup = function (track, group) {
    var coordinatesArray = this.getCoordinatesArray(track);
    
    for (var i = 0; i < track.points.length; i++) {
        var marker = L.marker(coordinatesArray[i], {
            title: track.points[i].name + ' Track: ' + track.hname,
            icon: new L.NumberedDivIcon({number: i + 1})
        }).bindPopup(
                '<b>' + track.points[i].name + '</b><br>' +
                '<img class="info-image" alt="No image" src="' + track.points[i].photo + '">' +
                track.points[i].description + '<br>' +
                track.points[i].coordinates + '<br>' +
                '<a href="' + track.points[i].url + '">' + track.points[i].url + '</a>' +
                '<audio controls src="' + track.points[i].audio + '"></audio>' +
                '<br><br><b>Track</b>: ' + track.hname
                );
        group.addLayer(marker);
    }
};

MapClass.prototype.addRawRoute = function (track, mapRoute) {
    var coordinatesArray = this.getCoordinatesArray(track);

    var polyline = L.polyline(
            coordinatesArray, 
            {
                color: track.onMap[MapClass.ROUTE_TYPE_RAW].color, //this.getRandomColor(),
                weight: 5,
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round'
            }
    ).bindPopup('<b>Track</b>: ' + track.hname);
    
    var group = L.layerGroup();
    group.addLayer(polyline);
    
    for (var i = 0, len = mapRoute.routes.length; i < len; i++) {
        if (mapRoute.routes[i].type === MapClass.ROUTE_TYPE_RAW) {
            this.layersControl.removeLayer(mapRoute.routes[i].layerGroup);
            this.map.removeLayer(mapRoute.routes[i].layerGroup);
            mapRoute.routes.splice(i, 1);
            break;
        }
    }
    
    mapRoute.routes.push({
        name: track.onMap[MapClass.ROUTE_TYPE_RAW].name,
        type: MapClass.ROUTE_TYPE_RAW,
        color: track.onMap[MapClass.ROUTE_TYPE_RAW].color,
        layerGroup: group
    });
    
    this.layersControl.addOverlay(group, track.hname + ' - <span style="color: ' + track.onMap[MapClass.ROUTE_TYPE_RAW].color + ';">' + track.onMap[MapClass.ROUTE_TYPE_RAW].name + '</span>');
    this.map.addLayer(group);
};

MapClass.prototype.addServiceRoute = function (track, mapRoute) {
    var group = L.layerGroup();
    
    for (var i = 0; i < track.serviceRoutes.length; i++) {
        var polyline = L.Polyline.fromEncoded(
                track.serviceRoutes[i],
                {
                    color: track.onMap[MapClass.ROUTE_TYPE_SERVICE].color,
                    weight: 5,
                    opacity: 0.8,
                    lineJoin: 'round',
                    lineCap: 'round'
                }
        ).bindPopup('<b>Track</b>: ' + track.hname);

        group.addLayer(polyline);
    }
    
    for (var i = 0, len = mapRoute.routes.length; i < len; i++) {
        if (mapRoute.routes[i].type === MapClass.ROUTE_TYPE_SERVICE) {            
            this.layersControl.removeLayer(mapRoute.routes[i].layerGroup);
            this.map.removeLayer(mapRoute.routes[i].layerGroup);
            mapRoute.routes.splice(i, 1);
            break;
        }
    }
    
    mapRoute.routes.push({
        name: track.onMap[MapClass.ROUTE_TYPE_SERVICE].name,
        type: MapClass.ROUTE_TYPE_SERVICE,
        color: track.onMap[MapClass.ROUTE_TYPE_SERVICE].color,
        layerGroup: group
    });
    
    this.layersControl.addOverlay(group, track.hname + ' - <span style="color: ' + track.onMap[MapClass.ROUTE_TYPE_SERVICE].color + ';">' + track.onMap[MapClass.ROUTE_TYPE_SERVICE].name + '</span>');
    this.map.addLayer(group);
};

MapClass.prototype.addCurveRawRoute = function (track, mapRoute) {
    var group = L.layerGroup();

    for (var i = 0, len = track.oACurve.length; i < len - 1; i++) {
        L.polyline(
                [
                    track.oACurve[i],
                    track.oACurve[i + 1]
                ],
                {
                    color: track.onMap[MapClass.ROUTE_TYPE_CURVE_RAW].color,
                    weight: 5,
                    opacity: 0.8,
                    lineJoin: 'round',
                    lineCap: 'round'
                }
        ).addTo(group);
    }

    for (var i = 0, len = mapRoute.routes.length; i < len; i++) {
        if (mapRoute.routes[i].type === MapClass.ROUTE_TYPE_CURVE_RAW) {
            this.layersControl.removeLayer(mapRoute.routes[i].layerGroup);
            this.map.removeLayer(mapRoute.routes[i].layerGroup);
            mapRoute.routes.splice(i, 1);
            break;
        }
    }

    mapRoute.routes.push({
        name: track.onMap[MapClass.ROUTE_TYPE_CURVE_RAW].name,
        type: MapClass.ROUTE_TYPE_CURVE_RAW,
        color: track.onMap[MapClass.ROUTE_TYPE_CURVE_RAW].color,
        layerGroup: group
    });

    this.layersControl.addOverlay(group, track.hname + ' - <span style="color: ' + track.onMap[MapClass.ROUTE_TYPE_CURVE_RAW].color + ';">' + track.onMap[MapClass.ROUTE_TYPE_CURVE_RAW].name + '</span>');
    this.map.addLayer(group);
};

MapClass.prototype.addCurveServiceRoute = function (track, mapRoute) {
    var group = L.layerGroup();

    var polyline = L.Polyline.fromEncoded(
            track.oACurve,
            {
                color: track.onMap[MapClass.ROUTE_TYPE_CURVE_SERVICE].color,
                weight: 5,
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round'
            }
    ).bindPopup('<b>Track</b>: ' + track.hname);

    group.addLayer(polyline);

    for (var i = 0, len = mapRoute.routes.length; i < len; i++) {
        if (mapRoute.routes[i].type === MapClass.ROUTE_TYPE_CURVE_SERVICE) {
            this.layersControl.removeLayer(mapRoute.routes[i].layerGroup);
            this.map.removeLayer(mapRoute.routes[i].layerGroup);
            mapRoute.routes.splice(i, 1);
            break;
        }
    }

    mapRoute.routes.push({
        name: track.onMap[MapClass.ROUTE_TYPE_CURVE_SERVICE].name,
        type: MapClass.ROUTE_TYPE_CURVE_SERVICE,
        color: track.onMap[MapClass.ROUTE_TYPE_CURVE_SERVICE].color,
        layerGroup: group
    });

    this.layersControl.addOverlay(group, track.hname + ' - <span style="color: ' + track.onMap[MapClass.ROUTE_TYPE_CURVE_SERVICE].color + ';">' + track.onMap[MapClass.ROUTE_TYPE_CURVE_SERVICE].name + '</span>');
    this.map.addLayer(group);
};


/**
 * Add given track to a map.
 * 
 * @param {Object} track Given track. 
 * 
 * @throws {GetsWebClientException}
 */
MapClass.prototype.placeTrackInMap = function(track, type) {
    if (!track) {
        throw new GetsWebClientException('Map Error', 'placeTrackInMap, track undefined or null.');
    }
    
    if (track.points.length <= 0) {
        throw new GetsWebClientException('Map Error', 'placeTrackInMap, track has no points.');
    }
       
    var index = this.getRouteIndex({id: track.name});   
    if (index < 0) {
        var group = L.layerGroup(); 
        
        this.addTrackPointsToLayerGroup(track, group);
        this.layersControl.addOverlay(group, track.hname + ' - Markers');
        this.map.addLayer(group);
              
        var mapRoute = {
            id: track.name,
            points: group,
            routes: []
        };
        
        this.mapRoutes.push(mapRoute);
    } else {
        var mapRoute = this.mapRoutes[index];
    }
    
    switch (type) {
        case MapClass.ROUTE_TYPE_RAW:
            this.addRawRoute(track, mapRoute);
            break;
        case MapClass.ROUTE_TYPE_SERVICE:
            this.addServiceRoute(track, mapRoute);
            break;
        case MapClass.ROUTE_TYPE_CURVE_RAW:
            this.addCurveRawRoute(track, mapRoute);
            break;
        case MapClass.ROUTE_TYPE_CURVE_SERVICE:    
            this.addCurveServiceRoute(track, mapRoute);
            break;
    }
        
    var bounds = new L.LatLngBounds(
            new L.LatLng(track.bounds.southwest.lat, track.bounds.southwest.lng),
            new L.LatLng(track.bounds.northeast.lat, track.bounds.northeast.lng)
    );
    // zoom the map to the polyline
    this.map.fitBounds(bounds);
};

MapClass.prototype.removeTrackFromMap = function (track, type) {
    var index = this.getRouteIndex({id: track.name});
    if (index < 0) {
        return;
    }
    var mapRoute = this.mapRoutes[index];
    for (var i = 0, len = mapRoute.routes.length; i < len; i++) {
        if (mapRoute.routes[i].type === type) {
            this.layersControl.removeLayer(mapRoute.routes[i].layerGroup);
            this.map.removeLayer(mapRoute.routes[i].layerGroup);
            mapRoute.routes.splice(i, 1);
            break;
        }
    }
    
    if (mapRoute.routes.length < 1) {
        this.layersControl.removeLayer(mapRoute.points);
        this.map.removeLayer(mapRoute.points);
        this.mapRoutes.splice(index, 1);
    }
};

MapClass.prototype.getRoutesForTrack = function (track) {    
    var index = this.getRouteIndex({id: track.name});
    if (index < 0) {
        return;
    }
    
    return this.mapRoutes[index].routes;
};

MapClass.prototype.placePointsOnMap = function(pointList, markerBaseLink) {
    if (!pointList) {
        throw new GetsWebClientException('Map Error', 'placePointsOnMap, pointList undefined or null.');
    }
    this.pointsLayer = new L.MarkerClusterGroup();
     
    for (var i = 0; i < pointList.length; i++) {
        var coords = pointList[i].coordinates.split(',');
                  
        var marker = L.marker([coords[1], coords[0]], {title: pointList[i].name}); //{icon: myIcon}
        this.pointsLayer.addLayer(marker);
        
        var popup = L.popup()
            .setContent(
                '<b>' + pointList[i].name + 
                '</b><br>' + pointList[i].description + 
                (markerBaseLink ? 
                    '<br><a id="' + this.pointsLayer.getLayerId(marker) + '" href="' + markerBaseLink.url + pointList[i].uuid + '">' + markerBaseLink.text + '</a>' : '')
            );  
        marker.bindPopup(popup);
    }
  
    this.map.addLayer(this.pointsLayer);
};

MapClass.prototype.closePopupInPointsLayer = function(id) {
    var marker = this.pointsLayer.getLayer(id);
    if (marker) {
        marker.closePopup();
    }
};

MapClass.prototype.removePointsLayer = function() {
    if (this.pointsLayer) {
        this.map.removeLayer(this.pointsLayer);
        this.pointsLayer = null;
    }
};

/**
 * Map getters.
 * 
 * @returns {Object} Map object.
 */
MapClass.prototype.getMap = function() {    
    if (!this.map) {
        this.initMap();
    }
    return this.map;
};

MapClass.prototype.getLayersControl = function() {    
    if (!this.layersControl) {
        this.initMap();
    }
    return this.layersControl;
};

/**
 * Create random color string.
 * 
 * @return {String} Color in HEX format "#FFFFFF".
 */
MapClass.prototype.getRandomColor = function() {
    return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
};

/**
 * Create coordinates array for given track.
 * 
 * @param {Object} track Given track. 
 */
MapClass.prototype.getCoordinatesArray = function (track) {
    var coordinatesArray = [];
    for (var i = 0; i < track.points.length; i++) {
        var localCoords = track.points[i].coordinates.split(',');
        var point = new L.LatLng(localCoords[1], localCoords[0]);      
        coordinatesArray.push(point);
    }
    
    return coordinatesArray;
};


MapClass.prototype.checkTrack = function(track) {
    var index = this.getRouteIndex({id: track.name});
    if (index < 0) {
        return false;
    } else {
        var route = this.routes[index];
        if (!this.map.hasLayer(route.layerGroup)) {
            this.map.addLayer(route.layerGroup);
        }
        var bounds = new L.LatLngBounds(
                new L.LatLng(track.bounds.southwest.lat, track.bounds.southwest.lng),
                new L.LatLng(track.bounds.northeast.lat, track.bounds.northeast.lng)
        );
        this.map.fitBounds(bounds);
        return true;
    }
};

/**
 * Set center of a map.
 * 
 * @param {Double} latitude
 * @param {Double} longitude
 */
MapClass.prototype.setCenter = function(latitude, longitude) {
    this.map.setView([latitude, longitude], 11);
};

/**
 * Get center of a map.
 * 
 * @returns {Object} Object in LatLng Leaflet format {lat: someLat, lng: someLng}
 */
MapClass.prototype.getCenter = function() {
    return this.map.getCenter();
};

MapClass.prototype.getSize = function() {
    return this.map.getSize();
};

/**
 * Create draggable temporary marker which will send coordinates on drag. Marker 
 * automatically will be placed on the map.
 * 
 * @param {Double} latitude
 * @param {Double} longitude
 * @param {Function} callback Callback function will be called on marker's drag event.
 */
MapClass.prototype.createTempMarker = function(latitude, longitude, callback) {
    this.map.setView([latitude, longitude], this.map.getZoom());
    if (!this.tempMarker) { 
        var tempMarkerIcon = L.icon({
            iconUrl: TEMP_MARKER_IMAGE,
            shadowUrl: null,
            zIndexOffset: 0,
            iconSize: new L.Point(25, 41),
            iconAnchor: new L.Point(13, 41),
            popupAnchor: new L.Point(0, -33),
            className: 'leaflet-div-icon-num'
        });
        this.tempMarker = L.marker([latitude, longitude], {
            draggable: true,
            riseOnHover: true,
            icon: tempMarkerIcon
        }).addTo(this.map);
        if (callback) {
            this.tempMarker.on('drag', function(e) {
                callback(e.target.getLatLng());
            });
        }
    } else {
        this.tempMarker.setLatLng(L.latLng(latitude, longitude));
        if (callback) {
            this.tempMarker.off();
            this.tempMarker.on('drag', function(e) {
                callback(e.target.getLatLng());
            });
        }    
    }
};

/**
 * Set temporary marker location.
 */
MapClass.prototype.setTempMarkerLocation = function(latitude, longitude) {
    if (!this.tempMarker) {
        return;
    }
    this.tempMarker.setLatLng(L.latLng(latitude, longitude));
};

/**
 * Remove temporary marker from the map.
 */
MapClass.prototype.removeTempMarker = function() {
    if (this.tempMarker) {
        this.map.removeLayer(this.tempMarker);
        this.tempMarker = null;
    }
};

/**
 * Create search area.
 */
MapClass.prototype.createSearchArea = function(lat, lng, radius) {
    if (!this.searchArea) {
        this.searchArea = new L.EditableCircleMarker([lat, lng], radius, {
            color: '#0000ff',
            weight: 2,
            opacity: 0.2
        });
        this.searchArea.onAdd(this.map);
    } else {
        this.searchArea.setLatLng([lat, lng]);
        this.searchArea.setRadius(radius);
        this.searchArea.onAdd(this.map);
    }
};

/**
 * Hide search area.
 */
MapClass.prototype.hideSearchArea = function() {
    if (this.searchArea) {
        this.searchArea.onRemove(this.map);
    }
};

/**
 * Set search area value.
 */
MapClass.prototype.setSearchAreaParams = function(lat, lng, radius) {
    if (this.searchArea) {
        this.searchArea.setLatLng([lat, lng]);
        this.searchArea.setRadius(radius);
    }
};

/**
 * Create user icon
 */
MapClass.prototype.createUserMarker = function(lat, lng) {
    if (!this.userMarker) {
        var userIcon = L.icon({
            iconUrl: LOCATION_IMAGE,
            shadowUrl: null,
            iconSize: new L.Point(48, 48),
            iconAnchor: new L.Point(13, 41),
            popupAnchor: new L.Point(0, - 33),
            className: 'leaflet-div-icon-num'
        });
        this.userMarker = L.marker([lat, lng], {icon: userIcon}).bindPopup('<b>Your current position</b>').addTo(this.map);
    } 
};

/**
 * Set callback on given map's event
 * 
 * @param {String} eventName Given event's name
 * @param {Function} callback Callback function
 */
MapClass.prototype.setMapCallback = function(eventName, callback) {
    if (!eventName || !callback) {
        return;
    }
    
    this.map.on(eventName, function (e) {
        callback(e);
    });
};

MapClass.prototype.drawConvexHullObjects = function (objects) {
    if (!objects) {
        throw new GetsWebClientException('Map Error', 'drawConvexHullObjects, objects undefined or null.');
    }
    
    var group = L.layerGroup();
    
    for (var i = 0, len = objects.length; i < len; i++) {
        var cHull = objects[i].hull;
        var coords = [];
        for (var j = 0, lenHull = cHull.length; j < lenHull; j++) {
            coords.push(new L.LatLng(cHull[j].x, cHull[j].y));
        }
        
        L.polygon(
                coords, {
                    color: '#FF0000',
                    weight: 2,
                    opacity: 0.7,
                    lineJoin: 'round',
                    lineCap: 'round'
        }).bindPopup('#' + i).addTo(group);       
    }  
    this.layersControl.addOverlay(group, 'Obstacles');
    this.map.addLayer(group);
};

MapClass.prototype.drawBoundingBox = function (obsts) {
    if (!obsts) {
        throw new GetsWebClientException('Map Error', 'drawBoundingBox, obsts undefined or null.');
    }
    var group = L.layerGroup();

    for (var i = 0, len = obsts.length; i < len; i++) {

        var north = obsts[i].bbox.northeast.lat;
        var east = obsts[i].bbox.northeast.lng;
        var south = obsts[i].bbox.southwest.lat;
        var west = obsts[i].bbox.southwest.lng;


        L.polygon(
                [
                    new L.LatLng(north, west),
                    new L.LatLng(north, east),
                    new L.LatLng(south, east),
                    new L.LatLng(south, west)
                ],
                {
                    color: '#FF0000',
                    weight: 2,
                    opacity: 0.7
                }
        ).addTo(group);
    }
    
    this.layersControl.addOverlay(group, 'Obstacles');
    //this.map.addLayer(group);
};

MapClass.prototype.drawEncodedPolyline = function (polyline, label, color) {
    var group = L.layerGroup();
    
    var color_ = color || this.getRandomColor();
    var _polyline = L.Polyline.fromEncoded(polyline, {
        color: color_,
        weight: 5,
        opacity: 0.8,
        lineJoin: 'round',
        lineCap: 'round'
    });
    if (label) _polyline.bindPopup(label);
    _polyline.addTo(group);
    
    this.layersControl.addOverlay(group, '<span style="color: '+ color_ +';">' + label + '</span>');
    //this.map.addLayer(group);
};

MapClass.prototype.addMarker = function (latLng, label) {
    L.marker(latLng, {
        title: label,
        riseOnHover: true
    }).bindPopup(label).addTo(this.map);
};

MapClass.prototype.addSquareGrid = function (bbox, width) {
    var R = 6378137;//Earth radius in meters
    
    var north = bbox.northeast.lat,
        east = bbox.northeast.lng,
        south = bbox.southwest.lat,
        west = bbox.southwest.lng;
    
    var topleft = new L.LatLng(north, west),
        topright = new L.LatLng(north, east),
        bottomright = new L.LatLng(south, east),
        bottomleft = new L.LatLng(south, west);
  
    var group = L.layerGroup();
    
    // draw vertical lines of the grid
    var distanceHorizontal = topleft.distanceTo(topright);
    Logger.debug('distanceHorizontal: ' + distanceHorizontal);
    for (var i = 0; i <= distanceHorizontal; i += width) {      
        var newLng = west + (180 / Math.PI) * (i / (R * Math.cos(Math.PI * north / 180.0)));//(i*1000 / R / Math.cos(west));//(180/pi)*(dx/6378137)/cos(lat0)
        L.polyline(
            [
                new L.LatLng(north, newLng),
                new L.LatLng(south, newLng)
            ], 
            {
                color: '#000000', 
                weight: 1,
                opacity: 0.8
            }
        ).addTo(group);
    }
    
    // draw horizontal lines of the grid
    var distanceVertical = topleft.distanceTo(bottomleft);
    Logger.debug('distanceVertical: ' + distanceVertical);
    for (var i = 0; i <= distanceVertical; i += width) {      
        var newLat = south + (180 / Math.PI) * (i / R);
        L.polyline(
            [
                new L.LatLng(newLat, west),
                new L.LatLng(newLat, east)
            ], 
            {
                color: '#000000', 
                weight: 1,
                opacity: 0.8
            }
        ).addTo(group);
    }
    
    this.layersControl.addOverlay(group, 'Grid');
    this.map.addLayer(group);
}; 

MapClass.prototype.drawValidPoints = function (grid) {
    var group = L.layerGroup();
    
    for (var i = 0, len = grid.length; i < len; i++) {
        for (var j = 0, len2 = grid[i].length; j < len2; j++) {
            L.circle(grid[i][j].coords, 2, {
                color: grid[i][j].valid ? (grid[i][j].waypoint ? '#0000ff' : '#006600') : '#660000',
                weight: 2,
                opacity: 1
            }).addTo(group);
        }
    }
    
    this.layersControl.addOverlay(group, 'Grid');
    //this.map.addLayer(group);
};

MapClass.prototype.drawPath = function (path, label, color) {
    var group = L.layerGroup();
    
    var color_ = color || this.getRandomColor();
    for (var i = 0, len = path.length; i < len - 1; i++) {
        L.polyline(
            [
                path[i].coords,
                path[i + 1].coords
            ], 
            {
                color: color_, 
                weight: 2,
                opacity: 0.9
            }
        ).addTo(group);

        //L.marker(path[i].coords).bindPopup('#' + i).addTo(group);
    }
    
    this.layersControl.addOverlay(group, '<span style="color: '+ color_ +';">' + label + '</span>');
    this.map.addLayer(group);
};

MapClass.prototype.drawTriangulation = function (tri) {
    var group = L.layerGroup();

    for (var i = 0, len = tri.length; i < len; i++) {

        /*L.polygon(
                [
                    new L.LatLng(tri[i].points_[0].x, tri[i].points_[0].y),
                    new L.LatLng(tri[i].points_[1].x, tri[i].points_[1].y),
                    new L.LatLng(tri[i].points_[2].x, tri[i].points_[2].y)
                ],
                {
                    color: '#006600',
                    weight: 2,
                    opacity: 0.7,
                    fillOpacity: 0.5,
                    fillColor: '#00CC66'
                }
        ).addTo(group);*/
        L.polyline(
                [
                    new L.LatLng(tri[i].points_[0].x, tri[i].points_[0].y),
                    new L.LatLng(tri[i].points_[1].x, tri[i].points_[1].y)
                ],
                {
                    color: tri[i].constrained_edge[0] ? '#660000' : '#006600',
                    weight: 2,
                    opacity: 0.7,
                    fillOpacity: 0.5,
                    fillColor: '#00CC66'
                }
        ).addTo(group);

        L.polyline(
                [
                    new L.LatLng(tri[i].points_[1].x, tri[i].points_[1].y),
                    new L.LatLng(tri[i].points_[2].x, tri[i].points_[2].y)
                ],
                {
                    color: tri[i].constrained_edge[1] ? '#660000' : '#006600',
                    weight: 2,
                    opacity: 0.7,
                    fillOpacity: 0.5,
                    fillColor: '#00CC66'
                }
        ).addTo(group);

        L.polyline(
                [
                    new L.LatLng(tri[i].points_[2].x, tri[i].points_[2].y),
                    new L.LatLng(tri[i].points_[0].x, tri[i].points_[0].y)
                ],
                {
                    color: tri[i].constrained_edge[2] ? '#660000' : '#006600',
                    weight: 2,
                    opacity: 0.7,
                    fillOpacity: 0.5,
                    fillColor: '#00CC66'
                }
        ).addTo(group);
    }
    
    this.layersControl.addOverlay(group, 'Triangulation');
    //this.map.addLayer(group);
};

MapClass.prototype.drawObstacles = function (objects) {
    var group = L.layerGroup();

    for (var i = 0, len = objects.length; i < len; i++) {
        var points = objects[i].points;
        var coords = [];
        for (var j = 0, lenH = points.length; j < lenH; j++) {
            coords.push(new L.LatLng(points[j].x, points[j].y));
        }

        L.polygon(
                coords,
                {
                    color: '#FF0000',
                    weight: 2,
                    opacity: 1                   
                }
        ).bindPopup('#' + i).addTo(group);
    }
    
    this.layersControl.addOverlay(group, 'Obstacles');
    //this.map.addLayer(group);
};

MapClass.prototype.drawPolygon = function (polygon) {
    //var group = L.layerGroup();

    var coords = [];
    for (var i = 0, len = polygon.length; i < len; i++) {
        coords.push(new L.LatLng(polygon[i].x, polygon[i].y));
    }

    L.polygon(
            coords,
            {
                color: this.getRandomColor(),
                weight: 2,
                opacity: 1
            }
    ).addTo(this.map);

    //this.layersControl.addOverlay(group, 'intersecting polygon');
    //this.map.addLayer(group);
};

MapClass.prototype.project = function (latlng) {
    return this.map.project(latlng);
};

MapClass.prototype.unproject = function (point) {
    return this.map.unproject(point);
};

MapClass.prototype.drawLatLngPolyline = function (path, label, color) {
    var group = L.layerGroup();
    
    var color_ = color || this.getRandomColor();
    for (var i = 0, len = path.length; i < len - 1; i++) {
        L.polyline(
            [
                path[i],
                path[i + 1]
            ], 
            {
                color: color_, 
                weight: 2,
                opacity: 0.9,
                lineJoin: 'round',
                lineCap: 'round'
            }
        ).addTo(group);

        //L.marker(path[i].coords).bindPopup('#' + i).addTo(group);
    }
    
    this.layersControl.addOverlay(group, '<span style="color: '+ color_ +';">' + label + '</span>');
    //this.map.addLayer(group);
};