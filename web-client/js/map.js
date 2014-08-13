var map = L.map('map').setView([61.7830, 34.350], 7);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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
    
    var coordinatesArray = new Array();
    for (var i = 0; i < track.points.length; i++) {
        var localCoords = track.points[i].coordinates.split(',');
        var point = new L.LatLng(localCoords[0], localCoords[1]);
        
        coordinatesArray.push(point);
    }
    
    // create a red polyline from an arrays of LatLng points
    var polyline = L.polyline(
            coordinatesArray, 
            {
                color: 'red',
                weight: 3,
                opacity: 1
            }).addTo(map);

    // zoom the map to the polyline
    map.fitBounds(polyline.getBounds());

    
    for (var i = 0; i < track.points.length; i++) {
        L.marker(coordinatesArray[i], {title: track.points[i].name}).addTo(map)
            .bindPopup(
                '<b>' + track.points[i].name + '</b><br>' + 
                track.points[i].description + '<br>' + 
                track.points[i].coordinates + '<br>' +
                '<a href="' + track.points[i].url + '">' + track.points[i].url + '</a>' + 
                '<audio controls><source type="audio/mpeg" src="' + track.points[i].audio + '"></audio>' + 
                '<br><br><b>Track</b>: ' + track.hname
            );
    }
}
