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
var ADD_POINT = 'add_point';

// Message types
var INFO_MESSAGE = 0;
var SUCCESS_MESSAGE = 1;
var WARNING_MESSAGE = 2;
var ERROR_MESSAGE = 3;

// Boolean settings
var editTrackCategoriesSet = false;
var needCoordsEditPointSet = false;
var needTracksUpdate = false;
var needTrackUpdate = false;
var mainTracksCategoriesSet = false;
var editPointCategoriesSet = false;

// Languages codes 
var ru_RU = 'ru_RU';
var en_US = 'en_US';

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();


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

function checkCoordsInput(latitude, longitude, altitude) { 
    console.log('latitude: ' + latitude + ' longitude: ' + longitude + ' altitude: ' + altitude);
       
    if (!isNaN(latitude)) {
        if (latitude >= 90 || latitude <= -90) {
            showMessage('"Latitude" must be between -90 to 90', ERROR_MESSAGE);
            return false;
        }
    } else {
        showMessage('"Latitude" field must be a number', ERROR_MESSAGE);
        return false;
    }
    
    if (!isNaN(longitude)) {
        if (longitude >= 180 || longitude <= -180) {
            showMessage('"Longitude" must be between -180 to 180', ERROR_MESSAGE);
            return false;
        }
    } else {
        showMessage('"Longitude" field must be a number', ERROR_MESSAGE);
        return false;
    }
    
    if (!isNaN(altitude)) {
        if (altitude < 0) {
            showMessage('"Altitude" must be a positive number', ERROR_MESSAGE);
            return false;
        }
    } else {
        showMessage('"Altitude" field must be a number', ERROR_MESSAGE);
        return false;
    }
    
    return true;
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
    },
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
    disableTempMarker();
    if (form === MAIN) {
        showTrackMain();
    } else if (form === TRACK_INFO) {
        console.log('track_id ' + decodeURIComponent($.getHashVar('track_id')));
        showTrackInfo();
    } else if (form === POINT_INFO) {
        showTrackPointInfo();
    } else if (form === ADD_TRACK) {
        showAddTrack();
    } else if (form === ADD_POINT) {
        showAddPoint();
    }else if (typeof(form) === 'undefined') {
        window.location.hash = 'form=main';
        showTrackMain();
    } 
}

function getCategoriesAsArray() {    
    var getCategoriesRequest = $.ajax({
        url: 'actions/getCategories.php',
        type: 'POST',
        async: false, 
        contentType: 'application/json', 
        dataType: 'xml', 
        data: ''
    });
    
    console.log(getCategoriesRequest.responseText);
    
    getCategoriesRequest.fail(function( jqXHR, textStatus ) {
        console.log('getCategoriesAsArray: getCategoriesRequest failed ' + textStatus);
        return null;
    });
      
    if ($( getCategoriesRequest.responseText ).find('code').text() !== '0') {
        console.log('getCategoriesAsArray: ' + $( getCategoriesRequest.responseText ).find('message').text());
        return null;
    }

    var categoryElementList = $( getCategoriesRequest.responseText ).find('category');
    var categoriesArray = [];
    for (var i = 0; i < categoryElementList.length; i++) {
        var categoryObj = {};
        categoryObj.id = $( categoryElementList[i] ).find('id').length ? $( categoryElementList[i] ).find('id').text() : 'undefined';
        categoryObj.name = $( categoryElementList[i] ).find('name').length ? $( categoryElementList[i] ).find('name').text() : 'undefined';
        categoryObj.description = $( categoryElementList[i] ).find('description').length ? $( categoryElementList[i] ).find('description').text() : 'undefined';
        categoryObj.url = $( categoryElementList[i] ).find('url').length ? $( categoryElementList[i] ).find('url').text() : 'undefined';

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
    if (typeof paramsObj === 'undefined' || paramsObj == null) {
        console.log('paramsObj is undefined or null')
    }
    
    var tracksArray = [];         
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
  
    if (typeof paramsObj === 'undefined' || paramsObj == null) {
        console.log('paramsObj is undefined or null');
        return null;
    }
    
    var newtrack = {};
    var requestString = JSON.stringify(paramsObj);
    
    var getTrackRequest = $.ajax({
        url: 'actions/getTrackByName.php',
        type: 'POST',
        async: false, 
        contentType: 'application/json', 
        dataType: 'xml', 
        data: requestString
    });
    
    console.log(getTrackRequest.responseText);
    
    getTrackRequest.fail(function( jqXHR, textStatus ) {
        console.log('getTrackAsObject: getTrackRequest failed ' + textStatus);
        return null;
    });
      
    if ($( getTrackRequest.responseText ).find('code').text() !== '0') {
        console.log('getTrackAsObject: ' + $( getTrackRequest.responseText ).find('message').text());
        return null;
    }
    
    var trackPlacemarkList = $( getTrackRequest.responseText ).find('Placemark');
    console.log(trackPlacemarkList);
    var trackPointArray = new Array();
    for (var i = 0; i < trackPlacemarkList.length; i++) {
        var pointObj = {};
        pointObj.index = $( trackPlacemarkList[i] ).find("[name='idx']").length ? $( trackPlacemarkList[i] ).find("[name='idx']").text() : 'undefined';
        pointObj.uuid = $( trackPlacemarkList[i] ).find("[name='uuid']").length ? $( trackPlacemarkList[i] ).find("[name='uuid']").text() : 'undefined';
        pointObj.name = $( trackPlacemarkList[i] ).find('name').length ? $( trackPlacemarkList[i] ).find('name').text() : 'undefined';
        pointObj.description = $( trackPlacemarkList[i] ).find('description').length ? $( trackPlacemarkList[i] ).find('description').text() : 'undefined';
        pointObj.url = $( trackPlacemarkList[i] ).find("[name='url']").length ? $( trackPlacemarkList[i] ).find("[name='url']").text() : 'undefined';
        pointObj.descriptionExt = $( trackPlacemarkList[i] ).find("[name='description']").length ? $( trackPlacemarkList[i] ).find("[name='description']").text() : 'undefined';
        pointObj.audio = $( trackPlacemarkList[i] ).find("[name='audio']").length ? $( trackPlacemarkList[i] ).find("[name='audio']").text() : 'undefined';
        pointObj.photo = $( trackPlacemarkList[i] ).find("[name='photo']").length ? $( trackPlacemarkList[i] ).find("[name='photo']").text() : 'undefined';
        pointObj.coordinates = $( trackPlacemarkList[i] ).find('coordinates').length ? $( trackPlacemarkList[i] ).find('coordinates').text() : 'undefined';

        trackPointArray.push(pointObj);
    }
      
    for (var i = 0; i < trackList.length; i++) {
        if (trackList[i].name.indexOf(paramsObj.name) !== -1) {            
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

function addTrack(paramsObj) {
    if (typeof(paramsObj) == 'undefined' && paramsObj == null) {
        console.log('addTrack: paramsObj is undefined or null');
        return;
    }
    
    var track_name;
    
    for (var i = 0, len = paramsObj.length; i < len; i++) {
        if (paramsObj[i].name === 'hname') {
            track_name = 'tr_' + paramsObj[i].value.toLowerCase().replace(/\s/g, '_');
            console.log('name: ' + track_name);
            break;
        }
    }

    paramsObj.unshift({name: 'name', value: track_name});
    
    var newParamsObj = {};
    
    for (var i = 0, len = paramsObj.length; i < len; i++) {
        if (paramsObj[i].name === 'name') {
            newParamsObj.name = paramsObj[i].value;
        } else if (paramsObj[i].name === 'hname') {
            newParamsObj.hname = paramsObj[i].value;
        } else if (paramsObj[i].name === 'description') {
            newParamsObj.description = paramsObj[i].value;
        } else if (paramsObj[i].name === 'url') {
            newParamsObj.url = paramsObj[i].value;
        } else if (paramsObj[i].name === 'category_id') {
            newParamsObj.category_id = paramsObj[i].value;
        } else if (paramsObj[i].name === 'lang') {
            newParamsObj.lang = paramsObj[i].value;
        }
    }
    
    var requestString = JSON.stringify(newParamsObj);
    
    console.log(requestString);
    
    var requestXHR = getXmlHttp();
    requestXHR.open('POST', 'actions/addTrack.php', false);
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
        return;
    }
    
    needTracksUpdate = true;   
    showMessage('Track was successfully added', SUCCESS_MESSAGE);
    
    window.location.replace('#form=track_info&track_id=' + track_name);
}

function addPoint(paramsObj) {
    if (typeof(paramsObj) == 'undefined' && paramsObj == null) {
        console.log('addPoint: paramsObj is undefined or null')
        return;
    }
    
    console.log(paramsObj);
      
    var newParamsObj = {};
    
    var title = '';
    var descriptionText = '';
    var url = '';
    var lat = 0.0;
    var lng = 0.0;
    var alt = 0.0;
    var imageURL = null;
    var audioURL = null;
    var categoryID = track.categoryId;
    
    for (var i = 0, len = paramsObj.length; i < len; i++) {
        if (paramsObj[i].name === 'title') {
            title = paramsObj[i].value;
        } else if (paramsObj[i].name === 'description') {
            descriptionText = paramsObj[i].value;
        } else if (paramsObj[i].name === 'url') {
            url = paramsObj[i].value;
        } else if (paramsObj[i].name === 'category_id') {
            categoryID = paramsObj[i].value;
        } else if (paramsObj[i].name === 'latitude') {
            lat = paramsObj[i].value;
        } else if (paramsObj[i].name === 'longitude') {
            lng = paramsObj[i].value;
        } else if (paramsObj[i].name === 'altitude') {
            alt = paramsObj[i].value;
        } else if (paramsObj[i].name === 'imageURL') {
            imageURL = paramsObj[i].value;
        } else if (paramsObj[i].name === 'audioURL') {
            audioURL = paramsObj[i].value;
        }
    }
    
    var description = createDescriptionForPointAsJson(
            descriptionText, 
            imageURL, 
            audioURL, 
            categoryID,
            track.points.length + 1
    );
      
    newParamsObj.channel = track.name;
    newParamsObj.title = title;
    newParamsObj.description = description;
    newParamsObj.link = url;
    newParamsObj.latitude = lat;
    newParamsObj.longitude = lng;
    newParamsObj.altitude = alt;
    newParamsObj.time = getDateForAddPoint();
    
    console.log(newParamsObj); 
    
    var addPointRequest = $.ajax({
        url: 'actions/addPoint.php',
        type: 'POST',
        async: false, 
        contentType: 'application/json', 
        dataType: 'xml', 
        data: JSON.stringify(newParamsObj)
    });
    
    addPointRequest.fail(function( jqXHR, textStatus ) {
        console.log('addPoint: addPointRequest failed ' + textStatus);
        return;
    });
      
    if ($( addPointRequest.responseText ).find('code').text() !== '0') {
        console.log('addPoint: ' + $( addPointRequest.responseText ).find('message').text());
        return;
    }
    
    showMessage('Point "' + newParamsObj.title  + '" was successfully added to track "' + track.hname , SUCCESS_MESSAGE);
    
    needTrackUpdate = true;
    
    window.location.replace('#form=track_info&track_id=' + track.name);
    //window.location.reload(true);
}

function removeTrack() {
    if (typeof track === 'undefined' || track == null) {
        return;
    }
    if (typeof track.name === 'undefined' || track.name == null) {
        return;
    }
    
    var removeTrackRequest = $.ajax({
        url: 'actions/removeTrack.php',
        type: 'POST',
        async: false, 
        contentType: 'application/json', 
        dataType: 'xml', 
        data: JSON.stringify({name: track.name})
    });
    
    removeTrackRequest.fail(function( jqXHR, textStatus ) {
        console.log('removeTrack: removeTrackRequest failed ' + textStatus);
        return;
    });
      
    if ($( removeTrackRequest.responseText ).find('code').text() !== '0') {
        console.log('removeTrack: ' + $( removeTrackRequest.responseText ).find('message').text());
        return;
    }
    
    needTracksUpdate = true;
    showMessage('Track "' + track.hname + '" was successfully removed', SUCCESS_MESSAGE);
    
    window.location.replace('#form=main');
}

function removePoint() {
    if (typeof track === 'undefined' || track == null) {
        return;
    }
    if (typeof track.name === 'undefined' || track.name == null) {
        return;
    }
    if (typeof point === 'undefined' || point == null) {
        return;
    }
    if (typeof point.name === 'undefined' || point.name == null) {
        return;
    }
    
    var removePointRequest = $.ajax({
        url: 'actions/removePoint.php',
        type: 'POST',
        async: false, 
        contentType: 'application/json', 
        dataType: 'xml', 
        data: JSON.stringify({
            channel: track.name, 
            name: track.name, 
            category_id: track.categoryId
        })
    });
    
    removePointRequest.fail(function( jqXHR, textStatus ) {
        console.log('removePoint: removePointRequest failed ' + textStatus);
        return;
    });
      
    if ($( removePointRequest.responseText ).find('code').text() !== '0') {
        console.log('removePoint: ' + $( removePointRequest.responseText ).find('message').text());
        return;
    }
    
    needTrackUpdate = true;
    showMessage('Point "' + point.name + '" was successfully removed from track "' + track.hname + '"', SUCCESS_MESSAGE);
    
    window.location.replace('#form=track_info&track_id=' + track.name);
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

function searchTracks() {
    checkTrackList();
    
    var searchName = $.getHashVar('name');
    var categoryId = $.getHashVar('category_id');
    if (typeof(searchName) === 'undefined') {
        searchName = '';
    }
    if (typeof(categoryId) === 'undefined') {
        categoryId = '';
    }
      
    var trackListElement = $( '#tracks-list' );
    $( trackListElement ).empty();
    
    var resultsCounter = 0;
    for (var i = 0, len = trackList.length; i < len; i++) {
        if ((trackList[i].hname.toLowerCase().indexOf(searchName.toLowerCase()) !== -1) && 
            (trackList[i].categoryId.toString().indexOf(categoryId.toString()) !== -1)) {
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
      
    $( '#tracks-info-name' ).text(track.hname);
    $( '#tracks-info-description' ).text(track.description);
    var tracksPointList = $( '#tracks-points-list' );
         
    $( '#tracks-points-list' ).empty();
    
    for (var i = 0; i < track.points.length; i++) {
        var tracksPointItem = $( document.createElement('li') );
        var trackPointLinkElement = $( document.createElement('a') );
        $( trackPointLinkElement).attr('href', '#form=point_info&track_id=' + track.name + '&point_name=' + track.points[i].name);
        $( trackPointLinkElement).attr('title', track.points[i].name);
        $( trackPointLinkElement).addClass('transition-link');
        $( trackPointLinkElement).addClass('padding-std');
        $( trackPointLinkElement).addClass('ellipsis-text');
        $( trackPointLinkElement).text(track.points[i].name);
        $( trackPointLinkElement).appendTo(tracksPointItem);
        $( tracksPointItem ).appendTo(tracksPointList);
    }
    
    $( '#tracks-info-add' ).attr('href', '#form=add_point&track_id=' + track.name);
      
    if (track.categoryId === '-1') {
        $( '#tracks-info-category' ).text('Category: None');
    } else {
        for (var i = 0, len = categories.length; i < len; i++) {
            if (track.categoryId === categories[i].id) {
                $( '#tracks-info-category' ).text('Category: ' + categories[i].name);
                break;
            }
        }
    }
    
    /*if (track) {
        
    }
    $( '#tracks-info-lang' )*/
    
    // disable the buttons if user doesn't have the rights for modification of the track's data or 
    // user doesn't sign in or both
    console.log('IS_LOGGED_IN: ' + IS_LOGGED_IN + ' track.access: ' + track.access);
    console.log('!IS_LOGGED_IN || track.access === \'r\': ' + (!IS_LOGGED_IN || track.access === 'r'));
    
    var tracksInfoAdd = $('#tracks-info-add');
    var tracksInfoEdit = $('#tracks-info-edit');
    var tracksInfoRemove = $('#tracks-info-remove');
    
    if (!IS_LOGGED_IN || track.access === 'r') {      
        $(tracksInfoAdd).on('click', function (e) {
            e.preventDefault();
        });
        $(tracksInfoAdd).addClass('disabled-element');
             
        $(tracksInfoEdit).on('click', function (e) {
            e.preventDefault();
        });
        $(tracksInfoEdit).addClass('disabled-element');
        
        $(tracksInfoRemove).addClass('disabled-element');
    } else {
        $(tracksInfoAdd).off('click');
        $(tracksInfoAdd).removeClass('disabled-element');
        
        $(tracksInfoEdit).off('click');
        $(tracksInfoEdit).removeClass('disabled-element');
               
        $(tracksInfoRemove).removeClass('disabled-element');
    }
}

function placePointInPointInfo() {
    if (typeof(track) === 'undefined' || track == null) {
        console.log('track undefined or null');
        return;
    }
    
    var pointName = decodeURIComponent($.getHashVar('point_name'));
    if (typeof pointName === 'undefined' || pointName == null || pointName === '') {
        console.log('point name undefined or null or empty');
        return;
    }
    
    // do not update point info if this is the same point as before
    if (typeof point !== 'undefined' && point != null) {
        if (point.name.toLowerCase().indexOf(pointName.toLowerCase()) !== -1) {
            return;
        }
    }
        
    for (var i = 0, len = track.points.length; i < len; i++) {
        if (track.points[i].name.toLowerCase().indexOf(pointName.toLowerCase()) !== -1) {
            point = track.points[i];
            break;
        }
    }
    
    // Get all elements
    var nameElement = $( '#tracks-point-info-name' );
    var coordsElement = $( '#tracks-point-info-coords' );
    var descElement = $( '#tracks-point-info-description' );
    var urlElement = $( '#tracks-point-info-url a' );
    var audioElement = $( '#tracks-point-info-audio audio');
    var photoElement = $( '#tracks-point-info-image img' );
    
    // Clear value of all elements
    $( nameElement ).text('');
    $( coordsElement ).text('');
    $( descElement ).text('');
    $( urlElement ).attr('href', '').text('');
    $( audioElement ).attr('src', '');
    $( photoElement ).attr('src', '');
     
    // Then fill elemnts with new values 
    $( nameElement ).text(point.name);
    $( coordsElement ).text(point.coordinates);
    if (point.descriptionExt !== 'undefined') {
        $( descElement ).text(point.descriptionExt);
    }
      
    if (point.url !== 'undefined') {
        $( urlElement ).attr('href', point.url).text(point.url);
    }   
    
    if (point.audio !== 'undefined') {
        $( audioElement ).attr('src', point.audio);
    }
    
    if (point.photo !== 'undefined') {
        $( photoElement ).attr('src', point.photo);
    } 
    
    var pointsInfoEdit = $('#tracks-point-info-edit');
    var pointsInfoRemove = $('#tracks-point-info-remove');
    
    if (!IS_LOGGED_IN || track.access === 'r') {      
        $(pointsInfoEdit).on('click', function (e) {
            e.preventDefault();
        });
        $(pointsInfoEdit).addClass('disabled-element');
                    
        $(pointsInfoRemove).addClass('disabled-element');
    } else {
        $(pointsInfoEdit).off('click');
        $(pointsInfoEdit).removeClass('disabled-element');
               
        $(pointsInfoRemove).removeClass('disabled-element');
    }
}


function updateTracks() {
    $( '#tracks-main-overlay' ).toggleClass('busy-overlay-visible');
    downloadTracks();
    placeTracksInTrackList();
    $( '#tracks-main-overlay' ).toggleClass('busy-overlay-visible');
}

function showTrackInfo() {
    checkTrackList();
    checkTrack();
    checkCategories();
    placeTrackInTrackInfo();
           
    $( '#tracks-edit-point-page' ).removeClass( 'visible' ).addClass( 'hidden' );       
    $( '#tracks-point-info-page' ).removeClass( 'visible' ).addClass( 'hidden' );
    $( '#tracks-main-page' ).removeClass( 'visible' ).addClass( 'hidden' );
    $( '#tracks-edit-track-page' ).removeClass( 'visible' ).addClass( 'hidden' );
    
    $( '#tracks-info-page' ).removeClass( 'hidden' ).addClass( 'visible' );
}

function showTrackMain() {
    checkTrackList();
    
    // in case of 'category_id' or 'name' params are defined 
    searchTracks();
    
    if (!mainTracksCategoriesSet) {
        checkCategories();
        var mainTracksCategories = $( '#tracks-main-filter-category' );
        
        // Add 'all' category with value ''
        $( document.createElement('option') )
                .attr('value', '')
                .text('All')
                .appendTo(mainTracksCategories);
        
        // Add 'none' category with value -1
        $( document.createElement('option') )
                .attr('value', -1)
                .text('None')
                .appendTo(mainTracksCategories);
        
        for (var i = 0, len = categories.length; i < len; i++) {
            var categoryItem = $( document.createElement('option') );
            $( categoryItem ).attr('value', categories[i].id);
            $( categoryItem ).text(categories[i].name);
            $( categoryItem ).appendTo(mainTracksCategories);
        }
        mainTracksCategoriesSet = true;
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
        
        // Add 'none' category with value -1
        $( document.createElement('option') )
                .attr('value', -1)
                .text('None')
                .appendTo(editTrackCategories);
        
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

function showAddPoint() {
    checkTrack();
    
    if (!editPointCategoriesSet) {
        checkCategories();
        var editPointCategories = $( '#tracks-edit-point-category-input' );
        
        // Add 'none' category with value -1
        $( document.createElement('option') )
                .attr('value', -1)
                .text('None')
                .appendTo(editPointCategories);
        
        for (var i = 0, len = categories.length; i < len; i++) {
            var categoryItem = $( document.createElement('option') );
            $( categoryItem ).attr('value', categories[i].id);
            $( categoryItem ).text(categories[i].name);
            $( categoryItem ).appendTo(editPointCategories);
        }
        editPointCategoriesSet = true;
    }
    
    $( '#tracks-info-page' ).removeClass( 'visible' ).addClass( 'hidden' );  
    $( '#tracks-edit-point-page' ).removeClass( 'hidden' ).addClass( 'visible' );
}

function checkTrackList() {
    if (trackList === 'undefined' || trackList == null || needTracksUpdate) {
        downloadTracks();
        needTracksUpdate = false;
    }
}

function checkTrack() {
    var track_id = decodeURIComponent($.getHashVar('track_id'));
    if (typeof track_id !== 'undefined' && track_id  !== '') {
        if (track === 'undefined' || track == null || (track.name !== track_id) || needTrackUpdate) {
            downloadTrack(track_id);
            needTrackUpdate = false;
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
    var slideUpTimeOut = setTimeout(function () {
        $(messageBox).slideUp('slow');
    }, 10000);

    $(messageBox).find('.close-icon').on('click', function () {
        clearTimeout(slideUpTimeOut);
        $(messageBox).slideUp('slow');
    });
}

function getGeoPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setGeoPositionToMap, handleGeoLocationError);
    } else {
       showMessage('Geolocation is not supported by this browser', WARNING_MESSAGE);
    }
}

function setGeoPositionToMap(position) {
    //console
    if (typeof map === 'undefined' || map == null) {
        console.log('map undef or null');
        return;
    }
    map.setView([position.coords.latitude, position.coords.longitude], 11);
}

function handleGeoLocationError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            showMessage('User denied the request for Geolocation', WARNING_MESSAGE);
            break;
        case error.POSITION_UNAVAILABLE:
            showMessage('Location information is unavailable', WARNING_MESSAGE);
            break;
        case error.TIMEOUT:
            showMessage('The request to get user location timed out', WARNING_MESSAGE);
            break;
        case error.UNKNOWN_ERROR:
            showMessage('An unknown error occurred', WARNING_MESSAGE);
            break;
    }
}

function setCoordsInEditPoint(coords) {
    if (typeof coords === 'undefined' || coords == null) {
        console.log('coords undef or null');
        return;
    }
    
    var lat = Math.floor(coords.lat * 10000) / 10000;
    var lng = Math.floor(coords.lng * 10000) / 10000;
      
    $( '#tracks-edit-point-lat-input' ).val(lat);
    $( '#tracks-edit-point-lon-input' ).val(lng);
}

function updateHashParameter(param, paramVal) {   
    var newHash = '';
    var currentHash = window.location.hash;
    var temp = '';
    var tempArray = [];
    if (currentHash) {
        tempArray = currentHash.split('&');
        for (var i = 0, len = tempArray.length; i < len; i++){
            if (tempArray[i].split('=')[0] !== param){
                newHash += temp + tempArray[i];
                temp = '&';
            }
        }
    }

    var rows_txt = temp + '' + param + '=' + paramVal;
    window.location.hash = newHash + rows_txt;
}

function uploadFile(paramsObj) {
    if (typeof paramsObj === 'undefined' || paramsObj == null) {
        console.log('uploadFile: paramsObj undefined or null');
        return null;
    }
     
    if (typeof paramsObj.file === 'undefined' || paramsObj.file == null) {
        console.log('uploadFile: paramsObj.file undefined or null');
        return null;
    }
    
    var fileTitle = '';
    var file = null;
    
    file = paramsObj.file;
    
    if (typeof paramsObj.title === 'undefined' || paramsObj.title == null) {
        fileTitle = file.name;
    } else {
        fileTitle = paramsObj.title;
    }
      
    var getPostURLRequest = $.ajax({
        url: 'actions/getUploadLink.php', 
        type: 'POST', 
        async: false, 
        contentType: 'application/json', 
        dataType: 'xml', 
        data: JSON.stringify({title: fileTitle})    
    });
    
    getPostURLRequest.fail(function( jqXHR, textStatus ) {
        console.log('uploadFile: getPostURLRequest failed ' + textStatus);
        return null;
    });
    
    if ($( getPostURLRequest.responseText ).find('code').text() !== '0') {
        console.log('uploadFile: ' + $( getPostURLRequest.responseText ).find('message').text());
        return null;
    }
    
    var postURL = $( getPostURLRequest.responseText ).find('post_url').text();
    
    var uploadFileRequest = $.ajax({
        url: 'actions/uploadFile.php?post_url=' + postURL + '&mime_type=' + file.type,
        type: 'POST',
        async: false,
        cache: false,
        processData: false,
        contentType: false, 
        data: file
    });
    
    uploadFileRequest.fail(function( jqXHR, textStatus ) {
        console.log('uploadFile: uploadFileRequest failed ' + textStatus);
        return null;
    });
    
    if ($( uploadFileRequest.responseText ).find('code').text() !== '0') {
        console.log('uploadFile: ' + $( uploadFileRequest.responseText ).find('message').text());
        return null;
    }
    
    var downloadUrl = $( uploadFileRequest.responseText ).find('downloadUrl').text();
    console.log('downloadUrl: ' + downloadUrl);
    
    return downloadUrl;
}

function createDescriptionForPointAsJson(text, imageURL, audioURL, categoryID, index) {
    var descJSON = {};
     
    if (typeof text === 'undefined' || text == null) {
        descJSON.description = '';
    } else {
        descJSON.description = text;
    }
    
    descJSON.uuid = guid();
    
    if (typeof audioURL !== 'undefined' && audioURL != null) {
        descJSON.audio = audioURL;
    }
    
    if (typeof imageURL !== 'undefined' && imageURL != null) {
        descJSON.photo = imageURL;
    }
    
    if (typeof categoryID !== 'undefined' && categoryID != null && (categoryID >= -1)) {
        descJSON.category_id = categoryID;
    }
    
    if (typeof index !== 'undefined' && index != null && (index >= 1)) {
        descJSON.idx = index;
    }
    
    return descJSON;
}

/*
 * Function for creating date + time combination. Main usage is creating time for 
 * add point method.
 * 
 * Returns: 
 *      Date + time string in "dd MM yyyy HH:mm:ss.SSS" format
 */
function getDateForAddPoint() {
    var currentDate = new Date();
    
    return '' + ('0' + currentDate.getDate()).slice(-2) + ' ' + 
            ('0' + (currentDate.getMonth() + 1)).slice(-2) + ' ' + 
            currentDate.getFullYear() + ' ' + 
            ('0' + (currentDate.getHours())).slice(-2) + ':' + 
            ('0' + (currentDate.getMinutes())).slice(-2) + ':' + 
            ('0' + (currentDate.getSeconds())).slice(-2) + '.' + 
            currentDate.getMilliseconds().toString().slice(0, 3);
            
}

function disableTempMarker() {
    $( '#tracks-edit-point-use-map' ).removeClass('pushed-button');
    removeTempMarker();
}

function resetFileInput(fileInputElement) {
    $( fileInputElement ).wrap('<form>').closest('form').get(0).reset();
    $( fileInputElement ).unwrap();
}
