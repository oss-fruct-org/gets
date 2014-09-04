/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-30          (the version of the package this class was first added to)
 */

/**
 * Constructor for controller "TracksPage".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} window window dom object of the current page.
 */
function TracksPage(document, window) {
    if (!window.hasOwnProperty('location')) {
        throw new GetsWebClientException('Track Page Error', 'TracksPage, windowObj argument is not a window object');
    }
    this.document = document;
    this.window = window;

    // Models
    this._tracks = null;
    this._points = null;
    this._categories = null;
    this._user = null;
    this._utils = null;
    
    this._mapCtrl = null;
    
    // Views 
    this._tracksMain = null;
    this._trackInfo = null;
    this._trackAdd = null;
    this._pointInfo = null;
    this._pointAdd = null;
}

// Forms
TracksPage.MAIN = 'main';
TracksPage.TRACK_INFO = 'track_info';
TracksPage.POINT_INFO = 'point_info';
TracksPage.ADD_TRACK = 'add_track';
TracksPage.ADD_POINT = 'add_point';
TracksPage.EDIT_TRACK = 'edit_track';

TracksPage.prototype.changeForm = function() {
    var form = this._utils.getHashVar('form');
    Logger.debug('changeForm form = ' + form);
    if (form === TracksPage.MAIN) {
        this.showTrackMain();
    } else if (form === TracksPage.TRACK_INFO) {
        this.showTrackInfo();
    } else if (form === TracksPage.ADD_TRACK) {
        this.showAddTrack();
    } else if (form === TracksPage.POINT_INFO) {
        this.showPointInfo();
    } else if (form === TracksPage.ADD_POINT) {
        this.showAddPoint();
    } else if (typeof form === 'undefined') {
        this.window.location.hash = 'form=' + TracksPage.MAIN;
        this.showTrackMain();
    }
};

TracksPage.prototype.initPage = function() {
    try {
        var self = this;
        
        // Init models
        if (this._tracks == null) {
            this._tracks = new TracksClass();
        }
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
        if (this._tracksMain == null) {
            this._tracksMain = new TracksMain(this.document, $(this.document).find('#tracks-main-page'));
            this._tracksMain.initView(this._user.isLoggedIn());
        }
        if (this._trackInfo == null) {
            this._trackInfo = new TrackInfo(this.document, $(this.document).find('#tracks-info-page'));
        }
        if (this._trackAdd == null) {
            this._trackAdd = new TrackAdd(this.document, $(this.document).find('#tracks-edit-track-page'));
        }
        if (this._pointInfo == null) {
            this._pointInfo = new PointInfo(this.document, $(this.document).find('#point-info-page'));
        }
        if (this._pointAdd == null) {
            this._pointAdd = new PointAdd(this.document, $(this.document).find('#edit-point-page'));
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
            self._user.authorizeGoogle('tracks.php');
        });
        
        // Sign out handler
        $(this.document).on('click', '#sign-out-btn', function(e) {
            e.preventDefault();
        });
        
        // Remove track handler
        $(this.document).on('click', '#tracks-info-remove', function(e) {
            e.preventDefault();
            self._tracks.removeTrack();
        });
        
        // Update tracks handler
        $(this.document).on('click', '#tracks-main-update', function(e) {
            e.preventDefault();
            self.updateTracksHandler();
        });
    } catch (Exception) {
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.showTrackMain = function() {
    try {
        this._tracksMain.placeTracksInTrackList(this._tracks.getTrackList(false));
        this._tracksMain.placeCategoriesInTrackMain(this._categories.getCategories());

        this._trackAdd.hideView();
        this._trackInfo.hideView();
        this._tracksMain.showView();
    } catch (Exception) {
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.showTrackInfo = function() {
    try {
        var trackName = decodeURIComponent(this._utils.getHashVar('track_id'));
        Logger.debug('trackName: ' + trackName);
        if (trackName) {
            this._trackInfo.placeTrackInTrackInfo(
                    this._tracks.getTrack(trackName, true), 
                    this._categories.getCategories(), 
                    this._user.isLoggedIn()
            );

            this._pointAdd.hideView();
            this._pointInfo.hideView();
            this._tracksMain.hideView();
            this._trackInfo.showView();
        }
    } catch (Exception) {
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.showAddTrack = function() {
    try {
        this._trackAdd.placeCategoriesInAddTrack(this._categories.getCategories());
        
        this._tracksMain.hideView();
        this._trackAdd.showView();        
    } catch (Exception) {
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.showAddPoint = function() {
    try {      
        this._trackInfo.hideView();
        this._pointAdd.showView();        
    } catch (Exception) {
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.showPointInfo = function() {
    try {
        var pointName = decodeURIComponent(this._utils.getHashVar('point_name'));
        if (!pointName) {
            throw new GetsWebClientException('Track Page Error', 'showPointInfo, hash parameter pointName undefined');
        }
        this._points.setPoint(this._tracks.findPoint(pointName));
        
        this._pointInfo.placePointInPointInfo(this._points.getPoint(), this._user.isLoggedIn());
        
        this._trackInfo.hideView();
        this._pointInfo.showView();       
    } catch (Exception) {
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.updateTracksHandler = function() {
    try {
        $(this.document).find('#tracks-main-overlay').toggleClass('busy-overlay-visible');
        this._tracksMain.placeTracksInTrackList(this._tracks.getTrackList(true));
        $(this.document).find('#tracks-main-overlay').toggleClass('busy-overlay-visible');
    } catch (Exception) {
        Logger.error(Exception.toString());
    }
};