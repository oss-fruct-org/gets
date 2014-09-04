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
    this.routes = [];
}

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
            layers: [this.baseMapLayer]
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
        iconUrl: 'images/icons/marker_hole.png',
        number: '',
        shadowUrl: null,
        iconSize: new L.Point(25, 41),
        iconAnchor: new L.Point(13, 41),
        popupAnchor: new L.Point(0, -33),
        /*
         iconAnchor: (Point)
         popupAnchor: (Point)
         */
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

/**
 * Get index of a route in a route array.
 * 
 * @param {Object} route Given route, format: 
 * {id: "someID", layerGroup: "someLayerGroup", polyLineLayerId: "somepolyLineLayerId"}
 * 
 * @returns {Integer} Index of a route in a route array, or -1 if route is not in an 
 * array.
 */
MapClass.prototype.getRouteIndex = function(route) {
    for (var i = 0, len = this.routes.length; i < len; i++) {
        if (this.routes[i].id === route.id){
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
MapClass.prototype.addRoute = function(route) {
    if (
        !route.hasOwnProperty('id') || 
        !route.hasOwnProperty('layerGroup') || 
        !route.hasOwnProperty('polyLineLayerId')
    ) {
        throw new GetsWebClientException('Map Error', 'addRoute, argument is not a route.');
    }
    
    var index = this.getRouteIndex(route);
    if (index == -1) {
        this.routes.push(route);
    }
};

/**
 * Add given track to a map.
 * 
 * @param {Object} track Given track. 
 * 
 * @throws {GetsWebClientException}
 */
MapClass.prototype.placeTrackInMap = function(track) {
    if (!track) {
        throw new GetsWebClientException('Map Error', 'placeTrackInMap, track undefined or null.');
    }
    
    if (track.points.length <= 0) {
        throw new GetsWebClientException('Map Error', 'placeTrackInMap, track has no points.');
    }
    
    var group = L.layerGroup();  
    var coordinatesArray = getCoordinatesArray();
        
    // create a red polyline from an arrays of LatLng points
    var polyline = L.polyline(
            coordinatesArray, {
                color: getRandomColor(),
                weight: 7,
                opacity: 0.9,
                lineJoin: 'round',
                lineCap: 'round'
    }).bindPopup('<b>Track</b>: ' + track.hname);
            
    group.addLayer(polyline);
 
    for (var i = 0; i < track.points.length; i++) {
        var marker = L.marker(coordinatesArray[i], {
                title: track.points[i].name + ' Track: ' + track.hname,
                icon:	new L.NumberedDivIcon({number: i + 1})
            }).bindPopup(
                '<b>' + track.points[i].name + '</b><br>' + 
                track.points[i].description + '<br>' + 
                track.points[i].coordinates + '<br>' +
                '<a href="' + track.points[i].url + '">' + track.points[i].url + '</a>' + 
                '<audio controls src="' + track.points[i].audio + '"></audio>' + 
                '<br><br><b>Track</b>: ' + track.hname
            );
        group.addLayer(marker);
    }
    
    group.addTo(this.map);
    this.layersControl.addOverlay(group, track.hname);
    
    //console.log(group.getLayerId(polyline));
    var mapRoute = {
        id: track.name,
        layerGroup: group,
        polyLineLayerId: group.getLayerId(polyline)
    };
    
    this.addRoute(mapRoute);
    
    // zoom the map to the polyline
    this.map.fitBounds(polyline.getBounds());
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

/**
 * Set center of a map.
 * 
 * @param {Double} latitude
 * @param {Double} longitude
 */
MapClass.prototype.setCenter = function(latitude, longitude) {
    this.map.setView([latitude, longitude], 11);
};

