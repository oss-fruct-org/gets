// Global settings
var NUM_OF_COLUMNS_IN_POINTS_TABLE = 3;
var NUM_OF_COLUMNS_IN_TRACKS_TABLE = 5;

// Global data
var points = null;
var tracksList = null;
var track = null;

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

function authorizeGoogle() {
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
            window.location.replace('actions/login_action.php?googlelogin=1&auth_token=' + auth_token);
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
    var requestString = '';
    var tracksArray = new Array();
    
    if (typeof(paramsObj.token) !== 'undefined' && paramsObj.token != null && paramsObj.token !== '') {
        requestString += '<auth_token>' + paramsObj.token + '</auth_token>';
    }
    
    if (typeof(paramsObj.category) !== 'undefined' && paramsObj.category != null && paramsObj.category !== '') {
        requestString += '<category_name>' + paramsObj.category + '</category_name>';
    }
    
    requestString = form_request(requestString);
    
    var requestXHR = getXmlHttp();
    requestXHR.open('POST', 'http://oss.fruct.org/projects/gets/service/loadTracks.php', false);
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
    
    console.log(tracksArray);
    return tracksArray;
}

function getTrackAsObject(paramsObj) {
    var requestString = '';
    var track = new Object();
    
    if (typeof(paramsObj.token) !== 'undefined' && paramsObj.token != null && paramsObj.token !== '') {
        requestString += '<auth_token>' + paramsObj.token + '</auth_token>';
    }
    
    if (typeof(paramsObj.name) === 'undefined' || paramsObj.name == null || paramsObj.name === '') {
        console.log('Name is empty.');
        return null;
    }   
    requestString += '<name>' + paramsObj.name + '</name>';
    
    requestString = form_request(requestString);
    
    var requestXHR = getXmlHttp();
    requestXHR.open('POST', 'http://oss.fruct.org/projects/gets/service/loadTrack.php', false);
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
    
    track.name = paramsObj.name;
    track.points = trackPointArray;
     
    console.log(track);
    return track;
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

function downloadTracks() {
    tracksList = getListOfTracksAsArray({});
}

function downloadTrack() {
    var name = document.getElementById('track-name-input').value;
    if (typeof(name) === 'undefined' || name == null || name === '') {
        alert('Name field is empty.');
        console.log('Name is empty.');
        return;
    }
    
    track = getTrackAsObject({
        name: name 
    });;
}

function placePointsInList() {
    if (typeof(points) === 'undefined' || points == null) {
        console.log('points undefined or null');
        return;
    }
    
    // get the reference for the parent
    var tabList = document.getElementById('tab-list');

    // creates a <table> element and a <thead> and a <tbody> elements
    var tbl = document.createElement('table');
    var tblHead = document.createElement('thead');
    var tblBody = document.createElement('tbody');
    
    //creating the head of the table
    var tblHeadRow = document.createElement('tr');
    
    var tblHeadCell = document.createElement('td');
    var tblHeadCellBold = document.createElement('b');
    var tblHeadCellBoldText = document.createTextNode('Name');
    tblHeadCellBold.appendChild(tblHeadCellBoldText);
    tblHeadCell.appendChild(tblHeadCellBold);
    tblHeadRow.appendChild(tblHeadCell);
    
    tblHeadCell = document.createElement('td');
    tblHeadCellBold = document.createElement('b');
    tblHeadCellBoldText = document.createTextNode('Description');
    tblHeadCellBold.appendChild(tblHeadCellBoldText);
    tblHeadCell.appendChild(tblHeadCellBold);
    tblHeadRow.appendChild(tblHeadCell);
    
    tblHeadCell = document.createElement('td');
    tblHeadCellBold = document.createElement('b');
    tblHeadCellBoldText = document.createTextNode('Coordinates');
    tblHeadCellBold.appendChild(tblHeadCellBoldText);
    tblHeadCell.appendChild(tblHeadCellBold);
    tblHeadRow.appendChild(tblHeadCell);
    
    tblHead.appendChild(tblHeadRow);

    // creating all cells
    for (var i = 0; i < points.length; i++) {      
        var tblBodyRow = document.createElement("tr");
        
        var tblBodyCell = document.createElement('td');
        var tblBodyCellText = document.createTextNode(points[i].name);
        tblBodyCell.appendChild(tblBodyCellText);
        tblBodyRow.appendChild(tblBodyCell);
        
        tblBodyCell = document.createElement('td');
        tblBodyCell.innerHTML = points[i].description;
        tblBodyRow.appendChild(tblBodyCell);
        
        tblBodyCell = document.createElement('td');
        tblBodyCellText = document.createTextNode(points[i].coordinates);
        tblBodyCell.appendChild(tblBodyCellText);
        tblBodyRow.appendChild(tblBodyCell);
               
        tblBody.appendChild(tblBodyRow);
    }

    // put the <thead> in the <table>
    tbl.appendChild(tblHead);
    // put the <tbody> in the <table>
    tbl.appendChild(tblBody);
    
    // appends <table> into <body>
    tabList.appendChild(tbl);
    // sets the border attribute of tbl to 2;
    tbl.setAttribute("border", "2");   
}

function placeTracksInList() {
    if (typeof(tracksList) === 'undefined' || tracksList == null) {
        console.log('tracksList undefined or null');
        return;
    }
    
    // get the reference for the parent
    var tabList = document.getElementById('tab-list');

    // creates a <table> element and a <thead> and a <tbody> elements
    var tbl = document.createElement('table');
    var tblHead = document.createElement('thead');
    var tblBody = document.createElement('tbody');
    
    //creating the head of the table
    var tblHeadRow = document.createElement('tr');
    
    var tblHeadCell = document.createElement('td');
    var tblHeadCellBold = document.createElement('b');
    var tblHeadCellBoldText = document.createTextNode('Name');
    tblHeadCellBold.appendChild(tblHeadCellBoldText);
    tblHeadCell.appendChild(tblHeadCellBold);
    tblHeadRow.appendChild(tblHeadCell);
    
    tblHeadCell = document.createElement('td');
    tblHeadCellBold = document.createElement('b');
    tblHeadCellBoldText = document.createTextNode('HName');
    tblHeadCellBold.appendChild(tblHeadCellBoldText);
    tblHeadCell.appendChild(tblHeadCellBold);
    tblHeadRow.appendChild(tblHeadCell);
      
    tblHeadCell = document.createElement('td');
    tblHeadCellBold = document.createElement('b');
    tblHeadCellBoldText = document.createTextNode('Description');
    tblHeadCellBold.appendChild(tblHeadCellBoldText);
    tblHeadCell.appendChild(tblHeadCellBold);
    tblHeadRow.appendChild(tblHeadCell);
    
    tblHeadCell = document.createElement('td');
    tblHeadCellBold = document.createElement('b');
    tblHeadCellBoldText = document.createTextNode('Category id');
    tblHeadCellBold.appendChild(tblHeadCellBoldText);
    tblHeadCell.appendChild(tblHeadCellBold);
    tblHeadRow.appendChild(tblHeadCell);
    
    tblHeadCell = document.createElement('td');
    tblHeadCellBold = document.createElement('b');
    tblHeadCellBoldText = document.createTextNode('Access');
    tblHeadCellBold.appendChild(tblHeadCellBoldText);
    tblHeadCell.appendChild(tblHeadCellBold);
    tblHeadRow.appendChild(tblHeadCell);
    
    tblHead.appendChild(tblHeadRow);

    // creating all cells
    for (var i = 0; i < tracksList.length; i++) {      
        var tblBodyRow = document.createElement("tr");
        
        var tblBodyCell = document.createElement('td');
        var tblBodyCellText = document.createTextNode(tracksList[i].name);
        tblBodyCell.appendChild(tblBodyCellText);
        tblBodyRow.appendChild(tblBodyCell);
        
        tblBodyCell = document.createElement('td');
        tblBodyCellText = document.createTextNode(tracksList[i].hname);
        tblBodyCell.appendChild(tblBodyCellText);
        tblBodyRow.appendChild(tblBodyCell);
        
        tblBodyCell = document.createElement('td');
        tblBodyCell.innerHTML = tracksList[i].description;
        tblBodyRow.appendChild(tblBodyCell);
        
        tblBodyCell = document.createElement('td');
        tblBodyCellText = document.createTextNode(tracksList[i].categoryId);
        tblBodyCell.appendChild(tblBodyCellText);
        tblBodyRow.appendChild(tblBodyCell);
        
        tblBodyCell = document.createElement('td');
        tblBodyCellText = document.createTextNode(tracksList[i].access);
        tblBodyCell.appendChild(tblBodyCellText);
        tblBodyRow.appendChild(tblBodyCell);
               
        tblBody.appendChild(tblBodyRow);
    }

    // put the <thead> in the <table>
    tbl.appendChild(tblHead);
    // put the <tbody> in the <table>
    tbl.appendChild(tblBody);
    
    // appends <table> into <body>
    tabList.appendChild(tbl);
    // sets the border attribute of tbl to 2;
    tbl.setAttribute("border", "2");   
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