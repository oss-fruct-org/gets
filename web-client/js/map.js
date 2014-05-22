var map = L.map('map').setView([61.7830, 34.350], 7);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//Global data
var points;

function placePointsOnMap() {
    if (!checkGeoInput()) {
        console.log('Incorrect input.');
        return;
    }
    
    var latitude = document.getElementById('latitude-input').value;
    var longitude = document.getElementById('longitude-input').value;
    var radius = document.getElementById('radius-input').value;
    var category = document.getElementById('category-input').value;
    //var space = document.getElementById('space-input').value;
    
    console.log('latitude: ' + latitude + ' longitude: ' + longitude + ' radius: ' + radius);
    
    points = getPointsAsArray({
        latitude: latitude, 
        longitude: longitude, 
        radius: radius, 
        category: category 
        //space: space
    });
    
    for (var i = 0; i < points.length; i++) {
        var coords = points[i].coordinates.split(',');
        L.marker([coords[1], coords[0]], {title: points[i].name}).addTo(map)
            .bindPopup('<b>' + points[i].name + '</b><br>' + points[i].description);
    }
}

document.getElementById('load-input').onclick = placePointsOnMap;