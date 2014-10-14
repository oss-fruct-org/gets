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
    this._headerView = null;
    this._pointInfo = null;
    
    this.currentView = null;
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
        this.showPointInfo();
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
        if (this._headerView == null) {
            this._headerView = new HeaderView(this.document, $(this.document).find('.navbar'));
        }
        if (this._pointInfo == null) {
            this._pointInfo = new PointInfo(this.document, $(this.document).find('#point-info-page'));
        }
        
        // Init map
        if (this._mapCtrl == null) {
            this._mapCtrl = new MapController(this.document, this.window);
            this._mapCtrl.initMap();
            //var position = this._user.getUserGeoPosition();
            //this._mapCtrl.setMapCenter(position.latitude, position.longitude);
        }        
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
    
    //Init first page
    this.currentView = this._pointsMain;
    this.changeForm();

    // Init Points main
    this._pointsMain.toggleOverlay();
    this._pointsMain.setLatitude(this._mapCtrl.getMapCenter().lat);
    this._pointsMain.setLongitude(this._mapCtrl.getMapCenter().lng);
    var formDataInit = $(this.document).find('#point-main-form').serializeArray();
    this._points.downLoadPoints(formDataInit, function() {
        Logger.debug(self._points.getPointList());
        self._pointsMain.placePointsInPointList(self._points.getPointList());
        self._mapCtrl.removePointsFromMap();
        self._mapCtrl.placePointsOnMap(self._points.getPointList());
        
        self._pointsMain.toggleOverlay();
    });
    

    // Hash change handler
    $(this.window).on('hashchange', function() {
        Logger.debug('hashchanged');
        self.changeForm();
    });

    // Sign in handler
    $(this.document).on('click', '#sign-in-btn', function(e) {
        e.preventDefault();
        self._user.authorizeGoogle();
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
        self._pointsMain.toggleOverlay();
        
        var formData = $(this).serializeArray();
        Logger.debug(formData);
        self._points.downLoadPoints(formData, function() {
            self._pointsMain.placePointsInPointList(self._points.getPointList(false));
            self._mapCtrl.placePointsOnMap(self._points.getPointList());
            
            self._pointsMain.toggleOverlay();
        });
    });
    
    //dragend
    this._mapCtrl.setMapCallback('dragend', function(e){
        self._pointsMain.toggleOverlay();
        
        var center = self._mapCtrl.getMapCenter();
        self._pointsMain.setLatitude(Math.floor(center.lat * 10000) / 10000);
        self._pointsMain.setLongitude(Math.floor(center.lng * 10000) / 10000);
        
        self._mapCtrl.setSearchAreaParams(
            self._pointsMain.getLatitude(), 
            self._pointsMain.getLongitude(), 
            self._pointsMain.getRadius() * 1000
        );
        
        var formDataInit = $(self.document).find('#point-main-form').serializeArray();       
        self._points.downLoadPoints(formDataInit, function () {           
            self._pointsMain.placePointsInPointList(self._points.getPointList());
            self._mapCtrl.removePointsFromMap();
            self._mapCtrl.placePointsOnMap(self._points.getPointList());
            
            self._pointsMain.toggleOverlay();
        });
    });
    
    
    // get user's coordinates
    if (this.window.navigator.geolocation) {
        this.window.navigator.geolocation.getCurrentPosition(function(position) {  
            self._pointsMain.toggleOverlay();
            
            Logger.debug(position);
            self._user.setUserGeoPosition(position);
            self._mapCtrl.setMapCenter(position.coords.latitude, position.coords.longitude);
            self._pointsMain.setLatitude(Math.floor(position.coords.latitude * 10000) / 10000);
            self._pointsMain.setLongitude(Math.floor(position.coords.longitude * 10000) / 10000);
            var formDataInit = $(self.document).find('#point-main-form').serializeArray();
            self._points.downLoadPoints(formDataInit, function() {
                self._pointsMain.placePointsInPointList(self._points.getPointList());
                self._mapCtrl.removePointsFromMap();
                self._mapCtrl.placePointsOnMap(self._points.getPointList());
                
                self._pointsMain.toggleOverlay();
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
        this._headerView.clearOption();
        
        this._pointsMain.placeCategoriesInPointMain(this._categories.getCategories());

        this.currentView.hideView();
        this.currentView = this._pointsMain;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

PointsPage.prototype.showPointInfo = function() {
    try {
        this._headerView.changeOption($(this._pointInfo.getView()).data('pagetitle'), 'glyphicon-chevron-left', '#form=main');
        
        var pointName = decodeURIComponent(this._utils.getHashVar('point_name'));
        if (!pointName) {
            throw new GetsWebClientException('Track Page Error', 'showPointInfo, hash parameter pointName undefined');
        }
        this._points.findPointInPointList(pointName);
        
        this._pointInfo.placePointInPointInfo(this._points.getPoint(), this._user.isLoggedIn());
        
        this.currentView.hideView();
        this.currentView = this._pointInfo;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

