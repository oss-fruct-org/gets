var baseMapLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var map = L.map('map', {
    center: [61.7830, 34.350],
    zoom: 10,
    layers: [baseMapLayer]
});

var layersControl = L.control.layers({       
    "Base map": baseMapLayer                      
}, null, {position: 'topleft'}).addTo(map);

var tempMarker = null;
var routes = [];

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

/*map.on('click', function (e) {
    if (needCoordsEditPointSet) {
        console.log('lat: ' + e.latlng.lat + ' lng: ' + e.latlng.lng);
        tempMarker = L.marker([e.latlng.lat, e.latlng.lng], {
            draggable: true
        }).addTo(map);
        setCoordsInEditPoint(e.latlng);
        
        tempMarker.on('drag', function (e) {
            setCoordsInEditPoint(e.target.getLatLng());
        });
    }
});*/

function createTempMarker() {
    if (tempMarker == null) {
        var mapCenter = map.getCenter();
        tempMarker = L.marker([mapCenter.lat, mapCenter.lng], {
                draggable: true,
                riseOnHover: true
        }).addTo(map);
        
        setCoordsInEditPoint(mapCenter);
        
        tempMarker.on('drag', function (e) {
            setCoordsInEditPoint(e.target.getLatLng());
        });
    }
}

function removeTempMarker() {
    if (tempMarker != null) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
}

function placePointsOnMap() {
    if (typeof(points) === 'undefined' || points == null) {
        console.log('points undefined or null');
        return;
    }
    
    for (var i = 0; i < points.length; i++) {
        var coords = points[i].coordinates.split(',');
        L.marker([coords[1], coords[0]], {title: points[i].name}).addTo(map)
            .bindPopup('<b>' + points[i].name + '</b><br>' + points[i].description);
    }
}

function placeTrackOnMap() {
    if (typeof(track) === 'undefined' || track == null) {
        console.log('track undefined or null');
        return;
    }
    
    if (track.points.length <= 0) {
        console.log('Track "' + track.name + '" has no points');
        showMessage('This track has no points', WARNING_MESSAGE);
        return;
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
    
    group.addTo(map);
    layersControl.addOverlay(group, track.hname);
    
    //console.log(group.getLayerId(polyline));
    var mapRoute = {
        id: track.name,
        layerGroup: group,
        polyLineLayerId: group.getLayerId(polyline)
    };
    
    routes.push(mapRoute);
    
    // zoom the map to the polyline
    map.fitBounds(polyline.getBounds());
}

function removeTrackFromMap() {
    var index = getTrackIndex();
    if (index == null) { 
        return;
    }
    
    if (map.hasLayer(routes[index].layerGroup)) {
        map.removeLayer(routes[index].layerGroup);
    }
    layersControl.removeLayer(routes[index].layerGroup);
}

function getTrackIndex() {
    for (var i = 0, len = routes.length; i < len; i++) {
        if (routes[i].id.indexOf(track.name) !== -1) {
            return i;
        }
    }
    
    return null;
}

function checkTrackOnMap() {
    var index = getTrackIndex();
    if (index == null) {       
        placeTrackOnMap();
    } else {
        if (!map.hasLayer(routes[index].layerGroup)) {
            routes[index].layerGroup.addTo(map);
        }
        map.fitBounds(routes[index].layerGroup.getLayer(routes[index].polyLineLayerId).getBounds());
    }
}

function getCoordinatesArray() {
    var coordinatesArray = [];
    for (var i = 0; i < track.points.length; i++) {
        var localCoords = track.points[i].coordinates.split(',');
        var point = new L.LatLng(localCoords[1], localCoords[0]);      
        coordinatesArray.push(point);
    }
    
    return coordinatesArray;
}

function getRandomColor() {
    return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
}
