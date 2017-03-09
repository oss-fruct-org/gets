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
    this.routesPointsLayer = null;
    this.socialsLayer = null;
    this.routeLayer = null;
    this.routeLayerArray = null;
    this.currentRouteLayer = null;
    this.socialMarkers = [];
    this.socialList = [];
    this.currentPosition = [];
    this.routeStartMarker = null;
    this.routeTargetLocation = null;
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
        this.baseMapLayer = L.tileLayer(TILE_PROVIDER + '/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        });
    } 
    
    if (!this.map) {
        this.map = L.map('map', {
            center: [61.7830, 34.350],
            zoom: 10,
            zoomControl: false,
            layers: [this.baseMapLayer],
            contextmenu: true,
            contextmenuWidth: 140,
        });
        var that = this;
        L.Control.zoomHome = L.Control.extend({
            options: {
                position: 'topright',
                zoomInText: '+',
                zoomInTitle: gettext('Zoom in'),
                zoomOutText: '-',
                zoomOutTitle: gettext('Zoom out'),
                zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
                zoomHomeTitle: gettext('Zoom home')
            },

            onAdd: function (map) {
                var controlName = 'gin-control-zoom',
                    container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
                    options = this.options;

                this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
                    controlName + '-in', container, this._zoomIn);
                this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
                    controlName + '-home', container, this._zoomHome);
                this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
                    controlName + '-out', container, this._zoomOut);

                this._updateDisabled();
                map.on('zoomend zoomlevelschange', this._updateDisabled, this);

                return container;
            },

            onRemove: function (map) {
                map.off('zoomend zoomlevelschange', this._updateDisabled, this);
            },

            _zoomIn: function (e) {
                this._map.zoomIn(e.shiftKey ? 3 : 1);
            },

            _zoomOut: function (e) {
                this._map.zoomOut(e.shiftKey ? 3 : 1);
            },

            _zoomHome: function (e) {
                that.map.setView(that.currentPosition, 15);
            },

            _createButton: function (html, title, className, container, fn) {
                var link = L.DomUtil.create('a', className, container);
                link.innerHTML = html;
                link.href = '#';
                link.title = title;

                L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
                    .on(link, 'click', L.DomEvent.stop)
                    .on(link, 'click', fn, this)
                    .on(link, 'click', this._refocusOnMap, this);

                return link;
            },

            _updateDisabled: function () {
                var map = this._map,
                    className = 'leaflet-disabled';

                L.DomUtil.removeClass(this._zoomInButton, className);
                L.DomUtil.removeClass(this._zoomOutButton, className);

                if (map._zoom === map.getMinZoom()) {
                    L.DomUtil.addClass(this._zoomOutButton, className);
                }
                if (map._zoom === map.getMaxZoom()) {
                    L.DomUtil.addClass(this._zoomInButton, className);
                }
            }
        });
// add the new control to the map
        var zoomHome = new L.Control.zoomHome();
        zoomHome.addTo(this.map);
    }
        
      /*
    if (!this.layersControl) {
        this.layersControl = L.control.layers({
            "Base map": this.baseMapLayer
        }, null, {position: 'topleft'}).addTo(this.map);
    }*/
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

    var polyline = L.Polyline.fromEncoded(
            track.oACurve,
            {
                color: track.onMap[MapClass.ROUTE_TYPE_CURVE_RAW].color,
                weight: 5,
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round'
            }
    ).bindPopup('<b>Track</b>: ' + track.hname);

    group.addLayer(polyline);
    
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
    this.pointsLayer = new L.MarkerClusterGroup({disableClusteringAtZoom: 17});
    
    var iconsArray = {};

    for (var i = 0; i < pointList.length; i++) {
        var coords = pointList[i].coordinates.split(',');
        if (typeof iconsArray[pointList[i].category_id] == 'undefined') {
    	    var imgUrl = pointList[i].iconURL;
    	    if (imgUrl != '') {
    		//Logger.debug(imgUrl);
    		iconsArray[pointList[i].category_id] = L.icon({iconUrl: imgUrl,iconSize:[30,30]});
    	    } else {
    		iconsArray[pointList[i].category_id] = new L.Icon.Default;
    	    }
        }
        var marker = L.marker([coords[1], coords[0]], {title: pointList[i].name, draggable: false, icon: iconsArray[pointList[i].category_id]}); //{icon: myIcon}

        marker.uuid = pointList[i].uuid;
        marker.title = pointList[i].name;
        marker.category_id = pointList[i].category_id;
        marker.categoryName = pointList[i].categoryName;
        marker.iconURL = pointList[i].iconURL;


        this.pointsLayer.addLayer(marker);

        var popup = L.popup()
            .setContent('<img style="float:left" src="' + pointList[i].iconURL + '" width="30"/>' +
            '<b>' + pointList[i].name +
            '</b>' + (pointList[i].description != '{}' ? '<br>' + pointList[i].description : '') +
            (markerBaseLink ?
            '<br><a id="' + this.pointsLayer.getLayerId(marker) + '" href="' + markerBaseLink.url + pointList[i].uuid + '">' + markerBaseLink.text + '</a>' : '')
        );
        marker.bindPopup(popup);

        marker.on('contextmenu', function(e) {
            if (this.dragging.enabled())
                this.dragging.disable();
            else
                this.dragging.enable();
            var updPoint= new PointsClass();
            updPoint.point = {};
            updPoint.point.uuid = this.uuid;
            var latLng = this.getLatLng();
            updPoint.addPoint([{name: "longitude", value: latLng.lng.toString()}, {name: "latitude", value: latLng.lat.toString()},
                {name: "category", value: this.category_id}, {name: "title", value: this.title}], true, null);
        });
    }

    this.map.addLayer(this.pointsLayer);
};


function onEachFeature(feature, layer) {
    var popupContent = '<br><a href="' + feature.properties.popupContent + '">'+gettext("put-track-in-track-info")+'</a>';
    layer.bindPopup(popupContent);
}
MapClass.prototype.placeRouteOnMap = function (route, points, routeBaseLink, categories) {
        var that = this;
        var coords = [];
        this.routesPointsLayer = new L.MarkerClusterGroup({disableClusteringAtZoom: 17});
        $.each(route.getObstacles(), function (id, val) {
            var tmpPoint = points.findPointInPointList(val['uuid']);
            var coords = tmpPoint.coordinates.split(',');
            var tmpCategory;
            $.each(categories, function (i,v) {
                if($(v).find("id").text() == tmpPoint.category_id)
                    tmpCategory = v;
            });
            var ic = L.icon({
                iconUrl: $(tmpCategory).find("url").text().split('"')[3],
                iconSize: [40,40]
            });
            var marker = L.marker([coords[1], coords[0]], {title: tmpPoint.name, draggable: false,  icon: ic}); //{icon: myIcon}
            marker.uuid = tmpPoint.uuid;
            marker.title = tmpPoint.name;
            marker.category_id = tmpPoint.category_id;


            that.routesPointsLayer.addLayer(marker);

            var popup = L.popup()
                .setContent(
                    '<b>' + tmpPoint.name +
                    '</b><br>' +tmpPoint.description);
            marker.bindPopup(popup);
        });
        this.routeLayer.addLayer(this.routesPointsLayer);
        $.each(route.getRouteCoords(), function (id, val) {
            coords.push([val['lng'],val['lat']]);
        });
        var currRoute = {
            "type": "Feature",
            "properties": {
                "type": route.getType(),
                "popupContent": routeBaseLink,
                "underConstruction": false
            },
            "geometry": {
                "type": "LineString",
                "coordinates": coords
            }
        };
    var geoJsonRuteLayer = L.geoJson(currRoute, {
        onEachFeature: onEachFeature,
        style: function(feature) {
            switch (feature.properties.type) {
                case 'normal': return {color: "#f1c40f", opacity: 0.5};
                case 'safe':   return {color: "#2ecc71", opacity: 0.5};
                case 'fastest':   return {color: "#c0392b", opacity: 0.5};
            }
        }
    });
    var that = this;
    geoJsonRuteLayer.on('click', function (e) {
        var layer = e.target;
        layer.setStyle({opacity: 1});
        layer.bringToFront();
    });
    this.routeLayerArray[route.getType()] = geoJsonRuteLayer;
    this.routeLayer.addLayer(geoJsonRuteLayer);
    this.map.addLayer(this.routeLayer);
};

MapClass.prototype.setCurrentRouteLayer = function (type) {
    $.each(this.routeLayerArray, function (key, value) {
        value.setStyle({opacity: 0.5});
    });
    this.currentRouteLayer = this.routeLayerArray[type];
    this.currentRouteLayer.fire("click");
};

MapClass.prototype.getCurrentRouteLayer = function () {
  return this.currentRouteLayer;
};

MapClass.prototype.removeRoutesFromMap = function () {
    if (this.routeLayer) {
        this.map.removeLayer(this.routeLayer);
    }
    this.routeLayerArray = {};
    this.routeLayer = new L.layerGroup();
};

MapClass.prototype.placeSocialsOnMap = function(socialList) {
    this.socialList = socialList;
    this.socialsLayer = new L.MarkerClusterGroup({disableClusteringAtZoom: 17});
    for (var i = 0; i < socialList.length; i++) {
        var coords = socialList[i].coordinates.split(',');
        var ic = L.icon({
            iconUrl: socialList[i].icon,
            iconSize: [40,40]
        });
        var marker = L.marker([coords[0], coords[1]], {title: socialList[i].name, draggable: false, icon: ic}); //{icon: myIcon}
        marker.uuid = socialList[i].uuid;
        marker.title = socialList[i].title;
        this.socialsLayer.addLayer(marker);
        this.socialMarkers.push(marker);

        var popup = L.popup().setContent("<center>" + socialList[i].title + "<br><button class='route_to' name="+ coords + ">" + gettext("Route to") + 
    	    "</button><br><button class='social_info' name='"+ socialList[i].uuid+"'>"+ gettext("put-point-in-point-info") +"</button></center>");
        var self = this;
        marker.bindPopup(popup);
    }

    this.map.addLayer(this.socialsLayer);
};
MapClass.prototype.placeFilteredSocialsOnMap = function(categoryId, states) {
    this.removeSocialsLayer();
    var socialList = this.socialList;
    this.socialsLayer = new L.MarkerClusterGroup({disableClusteringAtZoom: 17});
    for (var i = 0; i < socialList.length; i++) {

        var isPassed = false;
        $.each(socialList[i].scopes, function (id, val) {
           if (states[val.Id])
            isPassed = true;
        });
        if (!isPassed)
            continue;

        var coords = socialList[i].coordinates.split(',');
        var imgUrl;
        switch (socialList[i].accessRelations[categoryId]) {
            // mother of god
            case 0:
                imgUrl = ICONS_FOLDER + 'ic_location_green.png';
                break;
            case 1:
                imgUrl = ICONS_FOLDER + 'ic_location_yellow.png';
                break;
            case 2:
                imgUrl = ICONS_FOLDER + 'ic_location_red.png';
                break;
            case 3:
                imgUrl = ICONS_FOLDER + 'ic_location_gray.png';
                break;
            default:
                continue;
        }

        var ic = L.icon({
            iconUrl: imgUrl,
            iconSize: [40,40]
        });
        var marker = L.marker([coords[0], coords[1]], {title: socialList[i].name, draggable: false, icon: ic}); //{icon: myIcon}
        marker.uuid = socialList[i].uuid;
        marker.title = socialList[i].title;
        marker.scopes = socialList[i].scopes;
        this.socialsLayer.addLayer(marker);
        this.socialMarkers.push(marker);

        var popup = L.popup().setContent("<center>" + socialList[i].title + "<br><button class='route_to' name="+ coords + ">" + gettext("Route to") + "</button></center>");
        var self = this;
        marker.bindPopup(popup);
    }

    this.map.addLayer(this.socialsLayer);
};

MapClass.prototype.setMapCenterOnSocial = function(uuid) {
    for (var i = 0; i < this.socialMarkers.length; i++)
     if (this.socialMarkers[i].uuid == uuid) {
         this.map.setView(this.socialMarkers[i].getLatLng(), 18);
         this.socialMarkers[i].openPopup();
     }
/*    $.each(this.socialMarkers)
        alert(this.uuid);
    this.map.setView([latitude, longitude], 11);*/
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

MapClass.prototype.removeSocialsLayer = function() {
    if (this.socialsLayer) {
        this.map.removeLayer(this.socialsLayer);
        this.socialsLayer = null;
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
/*    var ic = L.icon({
        iconUrl: "img/pegman.png",
        iconSize: [40,40]
    });
    var marker = L.marker([latitude, longitude], {title: "Вы здесь", draggable: false,  icon: ic});
    this.map.addLayer(marker);
*/
    this.updateStartMarker(latitude,longitude);
    this.currentPosition = [latitude,longitude];
    this.map.setView([latitude, longitude], 15);
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

MapClass.prototype.updateStartMarker = function(latitude, longitude) {
	if (this.routeStartMarker !== null) {
	    this.routeStartMarker.setLatLng([latitude, longitude]);
	    this.routeStartMarker.update();
	} else {
	    // координаты есть, маркера нет
	    var ic = L.icon({
    		iconUrl: "img/pegman.png",
    		iconSize: [40,40]});
	    this.routeStartMarker = L.marker([latitude, longitude], {title: gettext("Start point"), draggable: false, icon:ic});
	    this.map.addLayer(this.routeStartMarker);
	}
}

MapClass.prototype.updateTargetLocation = function(latitude, longitude) {
	if (this.routeTargetLocation !== null) {
	    this.routeTargetLocation.setLatLng([latitude, longitude]);
	    this.routeTargetLocation.update();
	} else {
	    // координаты есть, маркера нет
	    var ic = L.icon({
    		iconUrl: "images/icons/finished.png",
    		iconSize: [40,40]});
	    this.routeTargetLocation = L.marker([latitude, longitude], {title: gettext("Finish point"), draggable: false, icon:ic});
	    this.map.addLayer(this.routeTargetLocation);
	}
/*    var ic = L.icon({
        iconUrl: "img/pegman.png",
        iconSize: [40,40]
    });
    var marker = L.marker([latitude, longitude], {title: "Вы здесь", draggable: false,  icon: ic});
    this.map.addLayer(marker);
*/
}

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
    
    for (var i = 0, len = objects.length; i < len; i++) {
        var cHull = objects[i].getHull();
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
        }).addTo(this.map);
    }
};

MapClass.prototype.drawBoundingBox = function (track) {
    if (!track.bounds) {
        throw new GetsWebClientException('Map Error', 'drawBoundingBox, track.bounds undefined or null.');
    }
        
    var north = track.bounds.northeast.lat;
    var east = track.bounds.northeast.lng;
    var south = track.bounds.southwest.lat;
    var west = track.bounds.southwest.lng;
    
    
    L.polygon(
            [
                new L.LatLng(north, west),
                new L.LatLng(north, east),
                new L.LatLng(south, east),
                new L.LatLng(south, west)
            ],
            {
                color: '#0000FF',
                weight: 1,
                opacity: 0.4
            }
    ).bindPopup('Bounding box for track: <b>' + track.hname + '</b>').addTo(this.map);
};

MapClass.prototype.drawEncodedPolyline = function (polyline, label) {
    polyline = L.Polyline.fromEncoded(polyline, {
        color: '#00FF00',
        weight: 7,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round'
    });
    if (label) polyline.bindPopup(label);
    
    polyline.addTo(this.map);
};

MapClass.prototype.addMarker = function (latLng, label) {
    L.marker(latLng, {
        title: label
    }).bindPopup(label).addTo(this.map);
};