/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-09-03          (the version of the package this class was first added to)
 */

/**
 * Constructor for controller "PointsPage".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} window window dom object of the current page.
 */
function PointsPage(document, window) {
    if (!window.hasOwnProperty('location')) {
        throw new GetsWebClientException('Points Page Error', 'PointsPage, windowObj argument is not a window object');
    }
    this.document = document;
    this.window = window;
    
    // Models
    this._points = null;
    this._categories = null;
    this._user = null;
    this._utils = null;
    
    this._mapCtrl = null;
    
    // Views
    this._pointsMain = null;  
}

// Forms
PointsPage.MAIN = 'main';
PointsPage.POINT_INFO = 'point_info';
PointsPage.ADD_POINT = 'add_point';

PointsPage.prototype.changeForm = function() {
    var form = this._utils.getHashVar('form');
    Logger.debug('changeForm form = ' + form);
    if (form === PointsPage.MAIN) {
        this.showPointsMain();
    } else if (form === PointsPage.POINT_INFO) {
        //this.showPointInfo();
    } else if (form === PointsPage.ADD_POINT) {
        //this.showAddPoint();
    } else if (typeof form === 'undefined') {
        this.window.location.hash = 'form=' + PointsPage.MAIN;
        this.showPointsMain();
    }
};

PointsPage.prototype.initPage = function() {
    var self = this;
    
    try {      
        // Init models
        if (this._points == null) {
            this._points = new PointsClass();
        }
        if (this._categories == null) {
            this._categories = new CategoriesClass();
        }
        if (this._user == null) {
            this._user = new UserClass(this.window);
            this._user.fetchAuthorizationStatus();
            Logger.debug('is Auth: ' + this._user.isLoggedIn());
        }
        if (this._utils == null) {
            this._utils = new UtilsClass(this.window);
        }
    
        // Init views
        if (this._pointsMain == null) {
            this._pointsMain = new PointsMain(this.document, $(this.document).find('#points-main-page'));
            this._pointsMain.initView(this._user.isLoggedIn());
        }
        
        // Init map
        if (this._mapCtrl == null) {
            this._mapCtrl = new MapController(this.document, this.window);
            this._mapCtrl.initMap();
            //var position = this._user.getUserGeoPosition();
            //this._mapCtrl.setMapCenter(position.latitude, position.longitude);
        }        
    } catch (Exception) {
        Logger.error(Exception.toString());
    }
    
    //Init first page
    this.changeForm();

    // Init Points main
    this._pointsMain.setLatitude(this._mapCtrl.getMapCenter().lat);
    this._pointsMain.setLongitude(this._mapCtrl.getMapCenter().lng);
    var formDataInit = $(this.document).find('#point-main-form').serializeArray();
    this._points.downLoadPoints(formDataInit, function() {
        Logger.debug(self._points.getPointList());
        self._pointsMain.placePointsInPointList(self._points.getPointList());
        self._mapCtrl.placePointsOnMap(self._points.getPointList());
    });
    

    // Hash change handler
    $(this.window).on('hashchange', function() {
        Logger.debug('hashchanged');
        self.changeForm();
    });

    // Sign in handler
    $(this.document).on('click', '#sign-in-btn', function(e) {
        e.preventDefault();
        self._user.authorizeGoogle('');
    });

    // Sign out handler
    $(this.document).on('click', '#sign-out-btn', function(e) {
        e.preventDefault();
    });
    
    // Create/remove search area
    $(this.document).on('change', '#points-main-show-search-area', function(e) {
        e.preventDefault();
        if($(this).is(":checked")) {
            var coords = null;
            self._mapCtrl.createSearchArea(
                self._pointsMain.getLatitude(), 
                self._pointsMain.getLongitude(), 
                self._pointsMain.getRadius() * 1000
            );
            Logger.debug('checked');
        } else {
            self._mapCtrl.hideSearchArea();
        }       
    });

    // 
    $(this.document).on('submit', '#point-main-form', function(e) {
        e.preventDefault();
        var formData = $(this).serializeArray();
        Logger.debug(formData);
        self._points.downLoadPoints(formData, function() {
            self._pointsMain.placePointsInPointList(self._points.getPointList(false));
            self._mapCtrl.placePointsOnMap(self._points.getPointList());
        });
    });
    
    
    // get user's coordinates
    if (this.window.navigator.geolocation) {
        this.window.navigator.geolocation.getCurrentPosition(function(position) {  
            Logger.debug(position);
            self._user.setUserGeoPosition(position);
            self._mapCtrl.setMapCenter(position.coords.latitude, position.coords.longitude);
            self._pointsMain.setLatitude(Math.floor(position.coords.latitude * 10000) / 10000);
            self._pointsMain.setLongitude(Math.floor(position.coords.longitude * 10000) / 10000);
            var formDataInit = $(self.document).find('#point-main-form').serializeArray();
            self._points.downLoadPoints(formDataInit, function() {
                self._pointsMain.placePointsInPointList(self._points.getPointList());
                self._mapCtrl.placePointsOnMap(self._points.getPointList());
            });
        }, this.handleGeoLocationError);
    } else {
       Logger.debug('geolocation is not supported by this browser');
    }
};

PointsPage.prototype.handleGeoLocationError = function (error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            Logger.debug('user denied the request for Geolocation');
            break;
        case error.POSITION_UNAVAILABLE:
            Logger.debug('location information is unavailable');
            break;
        case error.TIMEOUT:
            Logger.debug('the request to get user location timed out');
            break;
        case error.UNKNOWN_ERROR:
            Logger.debug('an unknown error occurred');
            break;
    }
};

PointsPage.prototype.showPointsMain = function() {
    try {
        this._pointsMain.placeCategoriesInPointMain(this._categories.getCategories());

        this._pointsMain.showView();
    } catch (Exception) {
        Logger.error(Exception.toString());
    }
};

