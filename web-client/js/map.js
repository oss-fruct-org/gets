var map = L.map('map').setView([61.7830, 34.350], 7);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function placePointsOnMap() {
    if (!checkGeoInput()) {
        console.log('Incorrect input.');
        return;
    }
    
    var latitude = document.getElementById('latitude-input').value;
    var longitude = document.getElementById('longitude-input').value;
    var radius = document.getElementById('radius-input').value;
    var category = document.getElementById('category-input').value;
    
    console.log('latitude: ' + latitude + ' longitude: ' + longitude + ' radius: ' + radius);
    
    var points = getPointsAsArray({
        latitude: latitude, 
        longitude: longitude, 
        radius: radius, 
        category: category        
    });
    
    for (var i = 0; i < points.length; i++) {
        var coords = points[i].coordinates.split(',');
        L.marker([coords[1], coords[0]], {title: points[i].name}).addTo(map)
            .bindPopup('<b>' + points[i].name + '</b><br>' + points[i].description);
    }
}

document.getElementById('load-input').onclick = placePointsOnMap;