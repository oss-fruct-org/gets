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
    try {
        var self = this;
        
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
        
        //Init first page
        this.changeForm();
              
        // Init handlers
        
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
        
        // 
        $(this.document).on('submit', '#point-main-form', function(e) {
            e.preventDefault();
            var formData = $(this).serializeArray();
            Logger.debug(formData);
            self._points.downLoadPoints(formData);
            self._pointsMain.placePointsInPointList(self._points.getPointList(false));
        });
        
    } catch (Exception) {
        Logger.error(Exception.toString());
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

