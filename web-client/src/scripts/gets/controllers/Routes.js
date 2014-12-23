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

Routes.prototype.makeGoogleDirectionsRoute = function (track) {
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
        track.route = track.points;
    }
    
    // Construct url for request
    //origin=Boston,MA&destination=Concord,MA&
    var urlRequest = 'http://maps.googleapis.com/maps/api/directions/json?sensor=false&';
    
    var coords = track.points[0].coordinates.split(',');
    urlRequest += 'origin=' + String(coords[1] + ',' + coords[0]) + '&';
    
    coords = track.points[track.points.length - 1].coordinates.split(',');
    urlRequest += 'destination=' + String(coords[1] + ',' + coords[0]) + '&';
    
    urlRequest += 'waypoints=';
    for (var i = 1; i < track.points.length - 1; i++) {
        var localCoords = track.points[i].coordinates.split(',');        
        urlRequest += String(localCoords[1] + ',' + localCoords[0]) + (i != track.points.length - 2 ? '|' : '');
    }
    
    var getRouteRequest = $.ajax({
        url: RETRANSLATOR_ACTION,
        type: 'POST',
        async: false,
        dataType: 'json',
        data: JSON.stringify({url: urlRequest})
    });
    
    getRouteRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, getRouteRequest failed ' + textStatus);
    });
    
    var newRoute = [];
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
    track.googleRoute = newRoute; 
};


