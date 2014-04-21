/*$(document).ready(function(){
 $( '.sub-unsun-status' ).hide();
 $( '.sub-unsun-button' ).click(function( event ) {
 var target = $( event.target );
 console.log('clicked: ' + 
 'id = ' + target.attr('id') + 
 ' status = ' + target.html());
 var actionUrl = '';
 var newInnerHtmlText;
 if (target.html() === 'subscribe') {
 action_url = 'actions/subscribe_channels_action.php';
 newInnerHtmlText = 'unsubscribe';
 } else {
 action_url = 'actions/unsubscribe_channels_action.php'
 newInnerHtmlText = 'subscribe';
 }
 $.ajax({
 type: 'GET',
 contentType: 'application/x-www-form-urlencoded"',
 url: action_url,
 data: 'channel=' + target.attr('id'),
 success: function(result){
 console.log('result: ' + result);
 var resultDecoded = JSON.parse(result);
 var statusElement = document.getElementById(target.attr('id') + '-status');
 if (resultDecoded.errno === 0) {
 console.log('action status = OK');
 statusElement.style = 'color: #17ff00;';
 $( statusElement ).html('&#x2713; Successfully '+ target.html() + 'd');
 $( statusElement ).show(1000).delay(2000).fadeOut('slow');
 target.html(newInnerHtmlText);
 } else {
 console.log('action status = Error');
 statusElement.style = 'color: #ff0000;';
 $( statusElement ).html('&#x2717; Error');
 $( statusElement ).show(1000).delay(2000).fadeOut('slow');
 }
 },
 error: function(xhr, status, error) {
 var err = eval("(" + xhr.responseText + ")");
 console.log(err.Message);
 }});
 });
 });*/

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
    var getRedirectLinkRespCode = getRedirectLink.responseXML.getElementsByTagName('code')[0].childNodes[0].nodeValue
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
    var latitude = document.forms['form-data']['latitude'].value;
    var longitude = document.forms['form-data']['longitude'].value;
    var radius = document.forms['form-data']['radius'].value;
    
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
    var latitude = document.forms['form-data']['latitude'].value;
    var longitude = document.forms['form-data']['longitude'].value;
    var radius = document.forms['form-data']['radius'].value;
    var category = document.forms['form-data']['category'].value;
       
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
        document.forms['form-data']['submit'].disabled=false;
    } else {
        document.forms['form-data']['submit'].disabled=true;
    }
}