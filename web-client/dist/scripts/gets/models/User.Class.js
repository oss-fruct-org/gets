/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-30          (the version of the package this class was first added to)
 */

/**
 * Constructor for class "User". This class is suppoused to contain all user 
 * data and methods to operate on it.
 * 
 * @constructor
 * @param {Object} windowObj windowObj window dom object of the current page.
 */
function UserClass(windowObj) {
    this.email = null;
    this.isAuthorized = false;
    if (!windowObj.hasOwnProperty('location')) {
        throw new GetsWebClientException('User Error', 'UserClass, windowObj argument is not a window object');
    }
    this.windowObj = windowObj;
    this.coords = null;
};

/**
 * Authorize user using Google OAuth2.0.
 * 
 * @param {String} returnUrl Page's url to which redirect user after successfull 
 * authorization.
 * 
 * @throws {GetsWebClientException}
 */ 
UserClass.prototype.authorizeGoogle = function(returnUrl) {
    var getRedirectLinkRequest = $.ajax({
        url: 'actions/login.php',
        type: 'POST',
        async: false, 
        contentType: 'application/json',
        dataType: 'xml', 
        data: ''
    });
    
    getRedirectLinkRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('User Error', 'authorizeGoogle, getRedirectLinkRequest failed ' + textStatus);
    });

    if ($(getRedirectLinkRequest.responseText).find('code').text() !== '2') {
        throw new GetsWebClientException('User Error', 'authorizeGoogle, getRedirectLinkRequest: ' + $(getRedirectLinkRequest.responseText).find('message').text());
    }
    
    var id = $(getRedirectLinkRequest.responseText).find('id').text();
    var redirect_url = $(getRedirectLinkRequest.responseText).find('redirect_url').text();
    
    var googleAuthWindow = this.windowObj.open(redirect_url, 'Google Auth', 'height=600,width=500');
    var self = this;
    var timer = setInterval(function() {
        if (googleAuthWindow.closed) {
            clearInterval(timer);
            
            var getAuthTokenRequest = $.ajax({
                url: 'actions/login.php',
                type: 'POST',
                async: false,
                contentType: 'text/xml',
                dataType: 'xml',
                data: JSON.stringify({id: id})
            });
            
            getAuthTokenRequest.fail(function(jqXHR, textStatus) {
                throw new GetsWebClientException('User Error', 'authorizeGoogle, getAuthTokenRequest failed ' + textStatus);
            });

            if ($(getAuthTokenRequest.responseText).find('code').text() !== '0') {
                throw new GetsWebClientException('User Error', 'authorizeGoogle, getAuthTokenRequest: ' + $(getAuthTokenRequest.responseText).find('message').text());
            }
                       
            var auth_token = $(getAuthTokenRequest.responseText).find('auth_token').text(); 
            self.windowObj.location.reload(true);
        }
    }, 1000);
    
};

/**
 * Fetch authorization status from the GeTS Server.
 * 
 * @throws {GetsWebClientException}
 */
UserClass.prototype.fetchAuthorizationStatus = function() {
    var getAuthStatusRequest = $.ajax({
        url: 'actions/isLoggedIn.php',
        type: 'GET',
        async: false,
        data: null
    });
    
    getAuthStatusRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('User Error', 'fetchAuthorizationStatus, getAuthStatusRequest failed ' + textStatus);
    });
       
    var statusObj = JSON.parse(getAuthStatusRequest.responseText);
    if (statusObj.hasOwnProperty('status')) {       
        this.isAuthorized = statusObj.status;
    }
};

/**
 * Fetch user's email from the GeTS Server.
 * 
 * @throws {GetsWebClientException}
 */
UserClass.prototype.fetchEmail = function() {
    var getEmailRequest = $.ajax({
        url: 'actions/getUserInfo.php',
        type: 'GET',
        async: false,
        dataType: 'xml',
        data: null
    });
    
    getEmailRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('User Error', 'fetchEmail, getEmailRequest failed ' + textStatus);
    });
    
    if ($(getEmailRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('User Error', 'fetchEmail, getEmailRequest: ' + $(getEmailRequest.responseText).find('message').text());
    }
    
    Logger.debug(getEmailRequest.responseText);
    
    this.email = $(getEmailRequest.responseText).find('email').length ? $(getEmailRequest.responseText).find('email').text() : 'Unknown';
};
/**
 * Get users geo coordinates.
 * 
 * @returns {Object} User's location in format {latitude: "someLatitude", longitude: "someLongitude"}
 */
UserClass.prototype.getUserGeoPosition = function() {
    if (!this.coords) {
        this.locateUser();
    }
    Logger.debug(this.coords);
    return this.coords;
};

UserClass.prototype.locateUser = function() {
    if (this.windowObj.navigator.geolocation) {
        Logger.debug('locateUser');
        var coordinates = {};
        this.windowObj.navigator.geolocation.getCurrentPosition(function (position) { 
            coordinates.latitude = position.coords.latitude;
            coordinates.longitude = position.coords.longitude;
            Logger.debug(coordinates);
        }, this.handleGeoLocationError);
        this.coords = coordinates;
    } else {
       throw new GetsWebClientException('User Error', 'getGeoPosition, geolocation is not supported by this browser');
    }
};

UserClass.prototype.handleGeoLocationError = function (error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            throw new GetsWebClientException('User Error', 'handleGeoLocationError, user denied the request for Geolocation');
        case error.POSITION_UNAVAILABLE:
            throw new GetsWebClientException('User Error', 'handleGeoLocationError, location information is unavailable');
        case error.TIMEOUT:
            throw new GetsWebClientException('User Error', 'handleGeoLocationError, the request to get user location timed out');
        case error.UNKNOWN_ERROR:
            throw new GetsWebClientException('User Error', 'handleGeoLocationError, an unknown error occurred');
    }
};

/**
 * Get authorization status.
 */
UserClass.prototype.isLoggedIn = function() {
    return this.isAuthorized;
};