// Global settings
var DEBUGMODE = true;

// Global data
var categories = null;
var points = null;
var trackList = null;
var track = null;
var point = null;

// Global UI elements
var trackListMenuElement = null;
var trackInfoElement = null;

// Tracks forms
var MAIN = 'main';
var TRACK_INFO = 'track_info';
var POINT_INFO = 'point_info';
var ADD_TRACK = 'add_track';

// Message types
var INFO_MESSAGE = 0;
var SUCCESS_MESSAGE = 1;
var WARNING_MESSAGE = 2;
var ERROR_MESSAGE = 3;

// Boolean settings
var editTrackCategoriesSet = false;


var _log = (function (undefined) {
    var Log = Error; // does this do anything?  proper inheritance...?
    Log.prototype.write = function (args) {
        /// <summary>
        /// Paulirish-like console.log wrapper.  Includes stack trace via @fredrik SO suggestion (see remarks for sources).
        /// </summary>
        /// <param name="args" type="Array">list of details to log, as provided by `arguments`</param>
        /// <remarks>Includes line numbers by calling Error object -- see
        /// * http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
        /// * http://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number
        /// * http://stackoverflow.com/a/3806596/1037948
        /// </remarks>

        // via @fredrik SO trace suggestion; wrapping in special construct so it stands out
        var suffix = {
            "@": (this.lineNumber
                    ? this.fileName + ':' + this.lineNumber + ":1" // add arbitrary column value for chrome linking
                    : extractLineNumberFromStack(this.stack)
                    )
        };

        args = args.concat([suffix]);
        // via @paulirish console wrapper
        if (console && console.log) {
            if (console.log.apply) {
                console.log.apply(console, args);
            } else {
                console.log(args);
            } // nicer display in some browsers
        }
    };
    var extractLineNumberFromStack = function (stack) {
        /// <summary>
        /// Get the line/filename detail from a Webkit stack trace.  See http://stackoverflow.com/a/3806596/1037948
        /// </summary>
        /// <param name="stack" type="String">the stack string</param>

        // correct line number according to how Log().write implemented
        var line = stack.split('\n')[3];
        // fix for various display text
        line = (line.indexOf(' (') >= 0
                ? line.split(' (')[1].substring(0, line.length - 1)
                : line.split('at ')[1]
                );
        return line;
    };

    return function (params) {
        /// <summary>
        /// Paulirish-like console.log wrapper
        /// </summary>
        /// <param name="params" type="[...]">list your logging parameters</param>

        // only if explicitly true somewhere
        if (typeof DEBUGMODE === typeof undefined || !DEBUGMODE)
            return;

        // call handler extension which provides stack trace
        Log().write(Array.prototype.slice.call(arguments, 0)); // turn into proper array
    };//--	fn	_log

})();

function getXmlHttp() {
    var xmlhttp;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
}

function authorizeGoogle(returnUrl) {  
    var getRedirectLink = getXmlHttp();
    //getRedirectLink.open('POST', 'http://localhost/service/userLogin.php', false);
    getRedirectLink.open('POST', 'http://oss.fruct.org/projects/gets/service/userLogin.php', false);
    getRedirectLink.setRequestHeader('Content-Type', 'text/xml');
    getRedirectLink.send('<request><params></params></request>');
    if (getRedirectLink.status !== 200) {
        console.log('An error occurred while processing the request');
        return;
    }
    var getRedirectLinkRespCode = getRedirectLink.responseXML.getElementsByTagName('code')[0].childNodes[0].nodeValue;
    if (getRedirectLinkRespCode != 2) {
        console.log(getRedirectLink.responseXML.getElementsByTagName('message')[0].childNodes[0].nodeValue);
        return;
    }

    var id = getRedirectLink.responseXML.getElementsByTagName('id')[0].childNodes[0].nodeValue;
    var redirect_url = getRedirectLink.responseXML.getElementsByTagName('redirect_url')[0].childNodes[0].nodeValue;

    var googleAuthWindow = window.open(redirect_url, 'Google Auth', 'height=600,width=500');
    var timer = setInterval(function() {
        if (googleAuthWindow.closed) {
            clearInterval(timer);
            var getAuthToken = getXmlHttp();
            //getAuthToken.open('POST', 'http://localhost/service/userLogin.php', false);
            getAuthToken.open('POST', 'http://oss.fruct.org/projects/gets/service/userLogin.php', false);
            getAuthToken.setRequestHeader('Content-Type', 'text/xml');
            getAuthToken.send('<request><params><id>' + id + '</id></params></request>');

            if (getAuthToken.status !== 200) {
                console.log('An error occurred while processing the request');
                return;
            }
            console.log('getAuthToken.responseText: ' + getAuthToken.responseText);
            var getAuthTokenRespCode = getAuthToken.responseXML.getElementsByTagName('code')[0].childNodes[0].nodeValue;
            if (getAuthTokenRespCode != 0) {
                console.log(getAuthToken.responseXML.getElementsByTagName('message')[0].childNodes[0].nodeValue);
                return;
            }

            var auth_token = getAuthToken.responseXML.getElementsByTagName('auth_token')[0].childNodes[0].nodeValue;
            if (typeof(returnUrl) !== 'undefined' || returnUrl  !== '') {
                window.location.replace('actions/login.php?googlelogin=1&auth_token=' + auth_token + '&return_url=' + returnUrl);
            } else {
                window.location.replace('actions/login.php?googlelogin=1&auth_token=' + auth_token);
            }
        }
    }, 1000);
}

function checkGeoInput() {
    var latitude = document.getElementById('latitude-input').value;
    var longitude = document.getElementById('longitude-input').value;
    var radius = document.getElementById('radius-input').value;
    
    console.log('latitude: ' + latitude + ' longitude: ' + longitude + ' radius: ' + radius);
    
    if (!isNaN(latitude)) {
        if (latitude >= 90 || latitude <= -90) {
            alert('Latitude must be between -90 to 90.');
            return false;
        }
    } else {
        alert('Latitude field must be a number.');
        return false;
    }
    
    if (!isNaN(longitude)) {
        if (longitude >= 180 || longitude <= -180) {
            alert('Longitude must be between -180 to 180.');
            return false;
        }
    } else {
        alert('Longitude field must be a number.');
        return false;
    }
    
    if (!isNaN(radius)) {
        if (radius < 0) {
            alert('Radius must be a positive number.');
            return false;
        }
    } else {
        alert('Radius field must be a number.');
        return false;
    }
    
    return true;
}

function enableSubmit(){
    var latitude = document.getElementById('latitude-input').value;
    var longitude = document.getElementById('longitude-input').value;
    var radius = document.getElementById('radius-input').value;
    var category = document.getElementById('category-input').value;
       
    var isLocationEmpty = false;
    var isCategoryEmpty = false;
    
    if ((latitude == null || latitude == "") || 
        (longitude == null || longitude == "") || 
        (radius == null || radius == "")) {
        isLocationEmpty = true;
    }
    if (category == -1) {
        isCategoryEmpty = true;
    }
    
    if (!isCategoryEmpty || !isLocationEmpty) {
        document.getElementById('load-input').disabled=false;
    } else {
        document.getElementById('load-input').disabled=true;
    }
}

function form_request(params) {
    var xml_request = '<?xml version="1.0" encoding="UTF-8"?>';
    xml_request += '<request><params>';
    xml_request += params;
    xml_request += '</params></request>';
    return xml_request;
}

function getElementByAttributeValue(element, attribute, value) {
    var allElements = element.getElementsByTagName('*');
    for (var i = 0; i < allElements.length; i++) {
        if (allElements[i].getAttribute(attribute) === value) {
            return allElements[i];
        }
    }
}

$.extend({
    getHashVars: function () {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('#') + 1).split('&');
        for (var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    getHashVar: function (name) {
        return $.getHashVars()[name];
    }
});

$.extend({
    getUrlVars: function () {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    getUrlVar: function (name) {
        return $.getUrlVars()[name];
    }
});

function changeForm() {
    var form = $.getHashVar('form');
    console.log('in changeForm ' + form);
    if (form === MAIN) {
        showTrackMain();
    } else if (form === TRACK_INFO) {
        console.log('track_id ' + decodeURIComponent($.getHashVar('track_id')));
        showTrackInfo();
    } else if (form === POINT_INFO) {
        showTrackPointInfo();
    } else if (form === ADD_TRACK) {
        showAddTrack();
    } else if (typeof(form) === 'undefined') {
        window.location.hash = 'form=main';
        showTrackMain();
    } 
}

function getCategoriesAsArray(token) {
    var request;
    var categoriesArray = new Array();
    
    if (typeof(token) === 'undefined') {
       request = form_request('');
    } else {
        request = form_request('<auth_token>' + token + '</auth_token>');
    }
    
    var requestXHR = getXmlHttp();
    requestXHR.open('POST', 'http://oss.fruct.org/projects/gets/service/getCategories.php', false);
    requestXHR.setRequestHeader('Content-Type', 'text/xml');
    requestXHR.send(request);
    if (requestXHR.status !== 200) {
        console.log('An error occurred while processing the request');
        return;
    }
    
    var responseXML = requestXHR.responseXML;
    var requestXHRRespCode = responseXML.getElementsByTagName('code')[0].childNodes[0].nodeValue;
    if (requestXHRRespCode != 0) {
        console.log(responseXML.getElementsByTagName('message')[0].childNodes[0].nodeValue);
        return null;
    }

    var categoryElementList = responseXML.getElementsByTagName('category');
    for (var i = 0; i < categoryElementList.length; i++) {
        var categoryObj = new Object();
        categoryObj.id = categoryElementList[i].getElementsByTagName('id')[0].childNodes[0].nodeValue;
        categoryObj.name = categoryElementList[i].getElementsByTagName('name')[0].childNodes[0].nodeValue;
        categoryObj.description = categoryElementList[i].getElementsByTagName('description')[0].childNodes[0].nodeValue;
        categoryObj.url = categoryElementList[i].getElementsByTagName('url')[0].childNodes[0].nodeValue;

        categoriesArray.push(categoryObj);
    }

    console.log(categoriesArray);
    return categoriesArray;
}

function getPointsAsArray(paramsObj) {
    var requestString = '';
    var pointsArray = new Array();
    
    if (typeof(paramsObj.token) !== 'undefined' && paramsObj.token != null) {
        requestString = '<auth_token>' + paramsObj.token + '</auth_token>';
    }
  
    var locationCondition = (
        (typeof(paramsObj.latitude) !== 'undefined' && paramsObj.latitude != null && paramsObj.latitude !== '') &&
        (typeof(paramsObj.longitude) !== 'undefined' && paramsObj.longitude != null && paramsObj.longitude !== '') &&
        (typeof(paramsObj.radius) !== 'undefined' && paramsObj.radius != null && paramsObj.radius !== '')
    );
                    
    var categoryCondition = typeof(paramsObj.category) !== 'undefined' && 
                            paramsObj.category != null && 
                            paramsObj.category != -1;
                    
    if (!locationCondition && !categoryCondition) {
        console.log('Request options are incorrect.');
        return null;
    }
    
    if (locationCondition && categoryCondition) {
        requestString += '<latitude>' + paramsObj.longitude + '</latitude>';
        requestString += '<longitude>' + paramsObj.latitude + '</longitude>';
        requestString += '<radius>' + paramsObj.radius + '</radius>';
        requestString += '<category_id>' + paramsObj.category + '</category_id>';       
    } else if (locationCondition) {
        requestString += '<latitude>' + paramsObj.longitude +'</latitude>';
        requestString += '<longitude>' + paramsObj.latitude + '</longitude>';
        requestString += '<radius>' + paramsObj.radius + '</radius>';
    } else {
        requestString += '<category_id>' + paramsObj.category + '</category_id>';
    }
    
    if (typeof(paramsObj.space) !== 'undefined' && paramsObj.space != null) {
        requestString += '<space>' + paramsObj.space + '</space>';
    } 
       
    requestString = form_request(requestString);
    
    var requestXHR = getXmlHttp();
    requestXHR.open('POST', 'http://oss.fruct.org/projects/gets/service/loadPoints.php', false);
    requestXHR.setRequestHeader('Content-Type', 'text/xml');
    requestXHR.send(requestString);
    if (requestXHR.status !== 200) {
        console.log('An error occurred while processing the request');
        return;
    }
    
    var responseXML = requestXHR.responseXML;
    var requestXHRRespCode = responseXML.getElementsByTagName('code')[0].childNodes[0].nodeValue;
    if (requestXHRRespCode != 0) {
        console.log(responseXML.getElementsByTagName('message')[0].childNodes[0].nodeValue);
        return null;
    }
    
    var pointElementList = responseXML.getElementsByTagName('Placemark');
    for (var i = 0; i < pointElementList.length; i++) {
        var pointObj = new Object();
        pointObj.name = pointElementList[i].getElementsByTagName('name')[0].childNodes[0].nodeValue;
        pointObj.description = pointElementList[i].getElementsByTagName('description')[0].childNodes[0].nodeValue;
        pointObj.coordinates = pointElementList[i].getElementsByTagName('coordinates')[0].childNodes[0].nodeValue;

        pointsArray.push(pointObj);
    }

    console.log(pointsArray);
    return pointsArray;
}

function getListOfTracksAsArray(paramsObj) {
    if (typeof(paramsObj) == 'undefined' && paramsObj == null) {
        console.log('paramsObj is undefined or null')
    }
    
    var tracksArray = new Array();         
    var requestString = JSON.stringify(paramsObj);
   
    var requestXHR = getXmlHttp();
    requestXHR.open('POST', 'actions/getTracks.php', false);
    requestXHR.setRequestHeader('Content-Type', 'application/json');
    requestXHR.send(requestString);
    if (requestXHR.status !== 200) {
        console.log('An error occurred while processing the request');
        return;
    }
      
    var responseXML = requestXHR.responseXML;
    var requestXHRRespCode = responseXML.getElementsByTagName('code')[0].childNodes[0].nodeValue;
    if (requestXHRRespCode != 0) {
        showMessage(responseXML.getElementsByTagName('message')[0].childNodes[0].nodeValue, ERROR_MESSAGE);
        console.log(responseXML.getElementsByTagName('message')[0].childNodes[0].nodeValue);
        return;
    }
    
    var trackElementList = responseXML.getElementsByTagName('track');
    for (var i = 0; i < trackElementList.length; i++) {
        var trackObj = new Object();
        trackObj.name = trackElementList[i].getElementsByTagName('name')[0].childNodes[0].nodeValue;
        trackObj.hname = trackElementList[i].getElementsByTagName('hname')[0].childNodes[0].nodeValue;
        trackObj.description = trackElementList[i].getElementsByTagName('description')[0].childNodes[0].nodeValue;
        trackObj.access= trackElementList[i].getElementsByTagName('access')[0].childNodes[0].nodeValue;
        trackObj.categoryId = trackElementList[i].getElementsByTagName('category_id')[0].childNodes[0].nodeValue;

        tracksArray.push(trackObj);
    }
      
    tracksArray.sort(sortTracksAlphabetically);
    
    console.log(tracksArray);
    return tracksArray;
}

function getTrackAsObject(paramsObj) {
  
    if (typeof(paramsObj) == 'undefined' && paramsObj == null) {
        console.log('paramsObj is undefined or null')
    }
    
    var newtrack = new Object();
    var requestString = JSON.stringify(paramsObj);
    
    var requestXHR = getXmlHttp();
    requestXHR.open('POST', 'actions/getTrackByName.php', false);
    requestXHR.setRequestHeader('Content-Type', 'application/json');
    requestXHR.send(requestString);
    if (requestXHR.status !== 200) {
        console.log('An error occurred while processing the request');
        return;
    }
    
    console.log(requestXHR.responseText);
    
    var responseXML = requestXHR.responseXML;
    var requestXHRRespCode = responseXML.getElementsByTagName('code')[0].childNodes[0].nodeValue;
    if (requestXHRRespCode != 0) {
        console.log(responseXML.getElementsByTagName('message')[0].childNodes[0].nodeValue);
        return null;
    }
    
    var trackPlacemarkList = responseXML.getElementsByTagName('Placemark');
    var trackPointArray = new Array();
    for (var i = 0; i < trackPlacemarkList.length; i++) {
        var pointObj = new Object();
        pointObj.name = trackPlacemarkList[i].getElementsByTagName('name')[0].childNodes[0].nodeValue;
        pointObj.description = trackPlacemarkList[i].getElementsByTagName('description')[0].childNodes[0].nodeValue;
        pointObj.url = getElementByAttributeValue(trackPlacemarkList[i], 'name', 'url').getElementsByTagName('value')[0].childNodes[0].nodeValue;
        pointObj.descriptionExt = getElementByAttributeValue(trackPlacemarkList[i], 'name', 'description').getElementsByTagName('value')[0].childNodes[0].nodeValue;
        pointObj.audio = getElementByAttributeValue(trackPlacemarkList[i], 'name', 'audio').getElementsByTagName('value')[0].childNodes[0].nodeValue;
        pointObj.coordinates = trackPlacemarkList[i].getElementsByTagName('coordinates')[0].childNodes[0].nodeValue;

        trackPointArray.push(pointObj);
    }
      
    for (var i = 0; i < trackList.length; i++) {
        if (trackList[i].name.toLowerCase().indexOf(paramsObj.name) !== -1) {            
            newtrack.hname = trackList[i].hname;
            newtrack.description = trackList[i].description;
            newtrack.access = trackList[i].access;
            newtrack.categoryId = trackList[i].categoryId;
            break;
        }
    }
    newtrack.name = paramsObj.name;
    newtrack.points = trackPointArray;
     
    console.log(newtrack);
    return newtrack;
}

function downloadPoints() {
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
}

function downloadCategories() {
    categories = getCategoriesAsArray();
}

function downloadTracks() {
    trackList = getListOfTracksAsArray({});
}

function downloadTrack(name) {   
    track = getTrackAsObject({
        name: name 
    });;
}

function sortTracksAlphabetically(a, b) {
    var A = a.hname.toLowerCase();
    var B = b.hname.toLowerCase();
    if (A < B) {
        return -1;
    } else if (A > B) {
        return  1;
    } else {
        return 0;
    }
}

function placeTracksInTrackList() {
    
    var trackListElement = $( '#tracks-list' );
    $( trackListElement ).empty();
    
    if (typeof(trackListElement) === 'undefined' || trackListElement == null) {
        console.log('trackListElement undefined or null');
        return;
    }
    
    if (trackList === 'undefined' || trackList == null) {
        console.log('trackList undefined or null');
        return;
    }
             
    for (var i = 0, len = trackList.length; i < len; i++) {
        var trackElement = $( document.createElement('li') );
        var trackLinkElement = $( document.createElement('a') );
        $( trackLinkElement).attr('href', '#form=track_info&track_id=' + trackList[i].name);
        $( trackLinkElement).addClass('transition-link');
        $( trackLinkElement).addClass('padding-std');
        $( trackLinkElement).addClass('ellipsis-text');
        $( trackLinkElement).text(trackList[i].hname);
        $( trackLinkElement).appendTo(trackElement);
        $( trackElement ).appendTo(trackListElement);
    }   
}

function loadPointsHandler() {
    downloadPoints();
    placePointsOnMap();
    placePointsInList();
}

function loadTracksHandler() {
    downloadTracks();
    placeTracksInList();
}

function loadTrackHandler() {
    downloadTrack();
    placeTrackOnMap();
}

function searchTrack(searchString) {
    if (typeof(trackList) === 'undefined' || trackList == null) {
        console.log('tracksList undefined or null');
        return;
    }
    
    var trackListElement = $( '#tracks-list' );
    $( trackListElement ).empty();
    
    var resultsCounter = 0;
    for (var i = 0, len = trackList.length; i < len; i++) {
        if (trackList[i].hname.toLowerCase().indexOf(searchString.toLowerCase()) !== -1) {
            var trackElement = $(document.createElement('li'));
            var trackLinkElement = $( document.createElement('a') );
            $( trackLinkElement).attr('href', '#form=track_info&track_id=' + trackList[i].name);           
            $( trackLinkElement).addClass('transition-link');
            $( trackLinkElement).addClass('padding-std');
            $( trackLinkElement).addClass('ellipsis-text');
            $( trackLinkElement).text(trackList[i].hname);
            $( trackLinkElement).appendTo(trackElement);
            $( trackElement ).appendTo(trackListElement);
            resultsCounter++;
        }
    } 
    
    /*if (resultsCounter !== 1) {
        var noResultsElement = $( document.createElement('span') );
        $( noResultsElement ).text('No results');
        $( noResultsElement ).appendTo(trackListContent);
    }*/
}


function placeTrackInTrackInfo() {
    if (typeof(track) === 'undefined' || track == null) {
        console.log('track undefined or null');
        return;
    }
        
    $( '#tracks-info-name' ).text(track.hname);
    $( '#tracks-info-description' ).text(track.description);
    var tracksPointList = $( '#tracks-points-list' );
         
    $( '#tracks-points-list' ).empty();
    
    for (var i = 0; i < track.points.length; i++) {
        var tracksPointItem = $( document.createElement('li') );
        var trackPointLinkElement = $( document.createElement('a') );
        $( trackPointLinkElement).attr('href', '#form=point_info&track_id=' + track.name + '&point_name=' + track.points[i].name);           
        $( trackPointLinkElement).addClass('transition-link');
        $( trackPointLinkElement).addClass('padding-std');
        $( trackPointLinkElement).addClass('ellipsis-text');
        $( trackPointLinkElement).text(track.points[i].name);
        $( trackPointLinkElement).appendTo(tracksPointItem);
        $( tracksPointItem ).appendTo(tracksPointList);
    }  
}

function placePointInPointInfo() {
    if (typeof(track) === 'undefined' || track == null) {
        console.log('track undefined or null');
        return;
    }
    
    var pointName = decodeURIComponent($.getHashVar('point_name'));
    if (typeof(pointName) === 'undefined' || pointName == null || pointName === '') {
        console.log('point name undefined or null or empty');
        return;
    }
        
    for (var i = 0, len = track.points.length; i < len; i++) {
        if (track.points[i].name.toLowerCase().indexOf(pointName.toLowerCase()) !== -1) {
            point = track.points[i];
            break;
        }
    }
     
    $( '#tracks-point-info-name' ).text(point.name);
    $( '#tracks-point-info-coords' ).text(point.coordinates);
    $( '#tracks-point-info-description' ).text(point.description);  
    $( '#tracks-point-info-url a' ).attr('href', point.url).text(point.url);
    $( '#tracks-point-info-audio audio source').attr('src', point.audio);
}

function slideLeft(idOfElement) {
    $( idOfElement ).animate({
        right: "+=300"
        }, 1000, 
        function() {
            console.log($( idOfElement ).attr('id'));
    });
}

function updateTracks() {
    downloadTracks();
    placeTracksInTrackList();  
}

function showTrackInfo() {
    checkTrackList();
    checkTrack();
    placeTrackInTrackInfo();
           
    $( '#tracks-point-info-page' ).removeClass( 'visible' ).addClass( 'hidden' );
    $( '#tracks-main-page' ).removeClass( 'visible' ).addClass( 'hidden' );
    $( '#tracks-info-page' ).removeClass( 'hidden' ).addClass( 'visible' );
}

function showTrackMain() {
    checkTrackList();
    var searchName = $.getHashVar('name');
    
    if (typeof(searchName) !== 'undefined' || searchName !== '') {
        $( '#tracks-main-search-input' ).val(searchName).trigger('input');
    }
    
    $( '#tracks-edit-track-page' ).removeClass( 'visible' ).addClass( 'hidden' );
    $( '#tracks-info-page' ).removeClass( 'visible' ).addClass( 'hidden' );
    $( '#tracks-main-page' ).removeClass( 'hidden' ).addClass( 'visible' );
}

function showTrackPointInfo() {
    checkTrackList();
    checkTrack();
    
    placePointInPointInfo();
    
    $( '#tracks-info-page' ).removeClass( 'visible' ).addClass( 'hidden' );
    $( '#tracks-point-info-page' ).removeClass( 'hidden' ).addClass( 'visible' );
}

function showAddTrack() {
    if (!editTrackCategoriesSet) {
        checkCategories();
        var editTrackCategories = $( '#tracks-edit-track-category-input' );
        for (var i = 0, len = categories.length; i < len; i++) {
            var categoryItem = $( document.createElement('option') );
            $( categoryItem ).attr('value', categories[i].id);
            $( categoryItem ).text(categories[i].name);
            $( categoryItem ).appendTo(editTrackCategories);
        }
        editTrackCategoriesSet = true;
    }
    
    $( '#tracks-main-page' ).removeClass( 'visible' ).addClass( 'hidden' );
    $( '#tracks-edit-track-page' ).removeClass( 'hidden' ).addClass( 'visible' );
}

function checkTrackList() {
    if (trackList === 'undefined' || trackList == null) {
        downloadTracks();
    }
}

function checkTrack() {
    var track_id = decodeURIComponent($.getHashVar('track_id'));
    if (typeof(track_id) !== 'undefined' || track_id  !== '') {
        if (track === 'undefined' || track == null || (track.name !== track_id)) {
            downloadTrack(track_id);
        }
    }
}

function checkCategories() {
    if (categories === 'undefined' || categories == null) {
        downloadCategories();
    }
}

function showMessage(messageText, messageType) {
    var messageBox = $('#message-box');
    $(messageBox).html(messageText + '<div class="close-icon">x</div>');
    $(messageBox).removeClass();

    switch (messageType) {
        case INFO_MESSAGE:
            $(messageBox).addClass('info-message-box');
            break;
        case SUCCESS_MESSAGE:
            $(messageBox).addClass('success-message-box');
            break;
        case WARNING_MESSAGE:
            $(messageBox).addClass('warning-message-box');
            break;
        case ERROR_MESSAGE:
            $(messageBox).addClass('error-message-box');
            break;
    }

    //$( messageBox ).show().delay(2000).fadeOut();
    $(messageBox).slideDown('slow');//.delay(1500).slideUp('slow');
    setTimeout(function () {
        $(messageBox).slideUp('slow');
    }, 10000);

    $(messageBox).find('.close-icon').on('click', function () {
        $(messageBox).slideUp('slow');
    });
}