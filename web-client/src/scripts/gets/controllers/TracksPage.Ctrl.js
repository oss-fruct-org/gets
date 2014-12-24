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
    this._trackEdit = null;
    this._pointInfo = null;
    this._pointAdd = null;
    this._pointEdit = null;
    
    this._routes = null;
    
    this._headerView = null;
    
    this.currentView = null;
}

// Forms
TracksPage.MAIN = 'main';
TracksPage.TRACK_INFO = 'track_info';
TracksPage.POINT_INFO = 'point_info';
TracksPage.ADD_TRACK = 'track_add';
TracksPage.ADD_POINT = 'point_add';
TracksPage.EDIT_TRACK = 'track_edit';
TracksPage.EDIT_POINT = 'point_edit';

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
    } else if (form === TracksPage.EDIT_TRACK) {
        this.showEditTrack();
    } else if (form === TracksPage.EDIT_POINT) {
        this.showEditPoint();
    } else if (typeof form === 'undefined') {
        this.window.location.replace('#form=' + TracksPage.MAIN);
    }
};

TracksPage.prototype.initPage = function() {
    var self = this;
    try {          
        // Init models
        if (!this._tracks) {
            this._tracks = new TracksClass();
        }
        if (!this._points) {
            this._points = new PointsClass();
        }
        if (!this._categories) {
            this._categories = new CategoriesClass();
        }
        if (!this._user) {
            this._user = new UserClass(this.window);
            this._user.fetchAuthorizationStatus();
            Logger.debug('is Auth: ' + this._user.isLoggedIn());
        }
        if (!this._utils) {
            this._utils = new UtilsClass(this.window);
        }
    
        // Init views
        if (!this._tracksMain) {
            this._tracksMain = new TracksMain(this.document, $(this.document).find('#tracks-main-page'));
            this._tracksMain.initView(this._user.isLoggedIn());
        }
        if (!this._trackInfo) {
            this._trackInfo = new TrackInfo(this.document, $(this.document).find('#tracks-info-page'));
        }
        if (!this._trackAdd) {
            this._trackAdd = new TrackAdd(this.document, $(this.document).find('#tracks-edit-track-page'));
        }
        if (!this._trackEdit) {
            this._trackEdit = new TrackEdit(this.document, $(this.document).find('#tracks-edit-track-page'));
        }
        if (!this._pointInfo) {
            this._pointInfo = new PointInfo(this.document, $(this.document).find('#point-info-page'));
        }
        if (!this._pointAdd) {
            this._pointAdd = new PointAdd(this.document, $(this.document).find('#edit-point-page'));
        }
        if (!this._pointEdit) {
            this._pointEdit = new PointEdit(this.document, $(this.document).find('#edit-point-page'));
        }
        if (!this._headerView) {
            this._headerView = new HeaderView(this.document, $(this.document).find('.navbar'));
        }
        
        if (!this._routes) {
            this._routes = new Routes();
        }
        
        // Init map
        if (!this._mapCtrl) {
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
    this.currentView = this._tracksMain;
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
        self._user.authorizeGoogle();
    });

    // Sign out handler
    $(this.document).on('click', '#sign-out-btn', function(e) {
        e.preventDefault();
        self._user.logout();
        self.window.location.replace('#form=main');
        self.window.location.reload(true);
    });
    
    // Add track handler
    $(this.document).on('submit', '#tracks-edit-track-form', function(e) {
        e.preventDefault();
        var form = self._utils.getHashVar('form');
        if (form === TracksPage.ADD_TRACK) {
            self.addTrackHandler(this);
        } else if (form === TracksPage.EDIT_TRACK){
            self.editTrackHandler(this);
        }
    });
    
    // Use default active radius 
    $(this.document).on('change', '#edit-point-radius-default', function(e) {
        e.preventDefault();
        if($(this).is(":checked")) {
            $(self.document).find('#edit-point-active-radius-input').val($(this).data('defaultValue')).attr('disabled', 'disabled');        
            Logger.debug('checked');
        } else {
            $(self.document).find('#edit-point-active-radius-input').removeAttr('disabled');
        }       
    });
    
    // Add point handler
    $(this.document).on('submit', '#edit-point-form', function(e) {
        e.preventDefault();
        var form = self._utils.getHashVar('form');
        if (form === TracksPage.ADD_POINT) {
            self.addPointHandler(this, false);
        } else if (form === TracksPage.EDIT_POINT){
            self.addPointHandler(this, true);
        }     
    });

    // Remove track handler
    $(this.document).on('click', '#tracks-info-remove', function(e) {
        e.preventDefault();
        if (confirm($(self._trackInfo.getView()).find('#tracks-info-remove').data('removetext'))) {
            try {
                var trackName = decodeURIComponent(self._utils.getHashVar('track_id'));
                self._mapCtrl.removeTrack(self._tracks.getTrack(trackName, false));
                self._tracks.removeTrack();
                self.window.location.replace('#form=main');
                self.updateTracksHandler();
                MessageBox.showMessage($(self._trackInfo.getView()).data('messagesuccessRemove'), MessageBox.SUCCESS_MESSAGE);
            } catch (Exception) {
                MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
            }
        }
    });
    
    // Remove point handler
    $(this.document).on('click', '#point-info-remove', function(e) {
        e.preventDefault();
        if (confirm($(self._pointInfo.getView()).find('#point-info-remove').data('removetext'))) {
            try {
                var trackName = decodeURIComponent(self._utils.getHashVar('track_id'));    
                var track = self._tracks.getTrack(trackName, false);
                self._points.removePoint();
                if (self._mapCtrl.checkTrack(track)) {
                    self._mapCtrl.removeTrack(track);
                    self._mapCtrl.addTrack(self._tracks.getTrack(trackName, true));
                }              
                self.window.location.replace('#form=track_info&track_id=' + trackName);
                MessageBox.showMessage($(self._pointInfo.getView()).data('messagesuccessRemove'), MessageBox.SUCCESS_MESSAGE);
            } catch (Exception) {
                MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
            }
        }
    });

    // Update tracks handler
    $(this.document).on('click', '#tracks-main-update', function(e) {
        e.preventDefault();
        self.updateTracksHandler();
    });

    // Add track to the map handler
    $(this.document).on('click', '#tracks-info-map', function(e) {
        e.preventDefault();
        var trackName = decodeURIComponent(self._utils.getHashVar('track_id'));
        if (trackName) {           
            //self._routes.makeGoogleDirectionsRoute(self._tracks.getTrack(trackName, false));
            self._mapCtrl.addTrack(self._tracks.getTrack(trackName, false), '0');
        }       
    });
    
    // Enable/disable clear button for file inputs. (NOT WORKING)
    $(this.document).on('change', 'input[type="file"]', function(e) {
        e.preventDefault();
    });
    
    // Clear file input handler
    $(this.document).on('click', '#edit-point-audio-input-clear, #edit-point-picture-input-clear', function(e) {
        e.preventDefault();
         self._utils.resetFileInput($(this).parent().siblings());
    });
    
    // Enter press handler
    $(this.document).keypress(function(e) {
        var form = self._utils.getHashVar('form');
        if (e.which == 13) {
            if (form === TracksPage.ADD_TRACK) {
                self._trackAdd.onEnterPressed();
            } else if (form === TracksPage.ADD_POINT) {
                self._pointAdd.onEnterPressed();
            } 
        }
    });
    
    // Create/remove temp marker (Use map) handler edit-point-use-map
    $(this.document).on('click', '#edit-point-use-map', function (e){
        e.preventDefault();
        var form = self._utils.getHashVar('form');
        if(!$(this).hasClass('active') && (form === TracksPage.ADD_POINT || form === TracksPage.EDIT_POINT)) {
            $(this).addClass('active');
            var coords = null;
            var settings = $(self.document).find('#edit-point-use-map-settings li a.marked-list-item').data('item');
            
            if (settings === 'center') {
                coords = self._mapCtrl.getMapCenter();
            } else if (settings === 'location') {
                if (self._user.isCoordsSet()) {
                    coords = self._user.getUsersGeoPosition();
                }
            }
            
            self._pointAdd.setLatLng(
                        Math.floor(coords.lat * 1000000) / 1000000, 
                        Math.floor(coords.lng * 1000000) / 1000000
            );
            self._mapCtrl.createTempMarker(coords.lat, coords.lng, function (position) {
                self._pointAdd.setLatLng(
                    Math.floor(position.lat * 1000000) / 1000000, 
                    Math.floor(position.lng * 1000000) / 1000000
                );
            });
        } else {
            $(this).removeClass('active');
            self._mapCtrl.removeTempMarker();
        }
    });
    
    // Use different settings for Use map button
    $(this.document).on('click', '#edit-point-use-map-settings li a', function (e){
        e.preventDefault();
        
        $(self.document).find('#edit-point-use-map-settings li a').removeClass('marked-list-item');   
        
        if ($(this).hasClass('marked-list-item')) {
            $(this).removeClass('marked-list-item');
        } else {
            $(this).addClass('marked-list-item');
        }
        
        var useMapButton = $(self.document).find('#edit-point-use-map');
        if($(useMapButton).hasClass('active')) {
            $(useMapButton).removeClass('active');
            $(useMapButton).click();
        }
    });    
    
    // upload picture show/hide handler
    $(this.document).on('click', '#edit-point-picture-toggle-upload', function (e){
        e.preventDefault();
        var upload = $(self.document).find('#edit-point-picture-upload');
        if ($(upload).hasClass('hidden')) {
            $(upload).removeClass('hidden').addClass('show');
            $(self.document).find('#edit-point-picture-input-url').attr('disabled', 'disabled');
            // scroll to upload element
            $(self.document).find('#edit-point-page .action-menu-inner-content').animate({
                scrollTop: $('#edit-point-picture-input-file-upload').offset().top
            }, 2000);
        } else {
            $(upload).removeClass('show').addClass('hidden');
            $(self.document).find('#edit-point-picture-input-url').removeAttr('disabled');
        }       
    });
    
    // Upload picture handler
    $(this.document).on('click', '#edit-point-picture-input-file-upload', function (e) {
        e.preventDefault();
        self._pointAdd.toggleOverlay();
        try {
            var imageFile = $(self.document).find('#edit-point-picture-input-file').get(0).files[0];
            if (typeof imageFile !== 'undefined') {
                self._utils.uploadFile({
                    file: imageFile
                }, function (url) {
                    $(self.document).find('#edit-point-picture-input-url').val(url);
                    $(self.document).find('#edit-point-picture-upload').removeClass('show').addClass('hidden');
                    $(self.document).find('#edit-point-picture-input-url').removeAttr('disabled');
                    self._pointAdd.toggleOverlay();
                });
            }
        } catch (Exception) {
            MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        }
    });
    
    $(this.document).on('change', '#edit-point-picture-input-file', function(e) {
        e.preventDefault();
        if ($(this).val() !== '') {
            $(self.document).find('#edit-point-picture-input-file-upload').removeClass('disabled');
        } else {
            $(self.document).find('#edit-point-picture-input-file-upload').addClass('disabled');
        }        
    });
    
    // Clear file input handler
    $(this.document).on('click', '#edit-point-picture-input-file-clear', function(e) {
        e.preventDefault();
        self._utils.resetFileInput($(self.document).find('#edit-point-picture-input-file'));
    });
    
    $(this.document).on('click', '#edit-point-picture-input-file-cancel', function (e){
        $(self.document).find('#edit-point-picture-upload').removeClass('show').addClass('hidden');
        $(self.document).find('#edit-point-picture-input-url').removeAttr('disabled');
    });
    
    // upload audio show/hide handler
    $(this.document).on('click', '#edit-point-audio-toggle-upload', function (e){
        e.preventDefault();
        var upload = $(self.document).find('#edit-point-audio-upload');
        if ($(upload).hasClass('hidden')) {
            $(upload).removeClass('hidden').addClass('show');
            $(self.document).find('#edit-point-audio-input-url').attr('disabled', 'disabled');
            // scroll to upload element
            $(self.document).find('#edit-point-page .action-menu-inner-content').animate({
                scrollTop: $('#edit-point-audio-input-file-upload').offset().top
            }, 2000);
        } else {
            $(upload).removeClass('show').addClass('hidden');
            $(self.document).find('#edit-point-audio-input-url').removeAttr('disabled');
        }
    });
    
    // Upload audio handler
    $(this.document).on('click', '#edit-point-audio-input-file-upload', function (e) {
        e.preventDefault();
        self._pointAdd.toggleOverlay();
        try {
            var audioFile = $(self.document).find('#edit-point-audio-input-file').get(0).files[0];
            if (typeof audioFile !== 'undefined') {
                self._utils.uploadFile({
                    file: audioFile
                }, function (url) {
                    $(self.document).find('#edit-point-audio-input-url').val(url);
                    $(self.document).find('#edit-point-audio-upload').removeClass('show').addClass('hidden');
                    $(self.document).find('#edit-point-audio-input-url').removeAttr('disabled');
                    self._pointAdd.toggleOverlay();
                });
            }
        } catch (Exception) {
            MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        }
    });
    
    $(this.document).on('change', '#edit-point-audio-input-file', function(e) {
        e.preventDefault();//id="edit-point-audio-input-file-upload"
        if ($(this).val() !== '') {
            $(self.document).find('#edit-point-audio-input-file-upload').removeClass('disabled');
        } else {
            $(self.document).find('#edit-point-audio-input-file-upload').addClass('disabled');
        }        
    });
    
    // Clear file input handler
    $(this.document).on('click', '#edit-point-audio-input-file-clear', function(e) {
        e.preventDefault();
        self._utils.resetFileInput($(self.document).find('#edit-point-audio-input-file'));
    });
    
    $(this.document).on('click', '#edit-point-audio-input-file-cancel', function (e){
        $(self.document).find('#edit-point-audio-upload').removeClass('show').addClass('hidden');
        $(self.document).find('#edit-point-audio-input-url').removeAttr('disabled');
    });
    
    //publish
    $(this.document).on('click', '#tracks-info-publish', function (e){
        e.preventDefault();
        try {
            var trackName = decodeURIComponent(self._utils.getHashVar('track_id'));
            var track = self._tracks.getTrack(trackName, false);
            if (track.published) {
                self._tracks.unPublishTrack();
                MessageBox.showMessage($(self._trackInfo.getView()).data('messagesuccessUnpublish'), MessageBox.SUCCESS_MESSAGE);
            } else {
                self._tracks.publishTrack();
                MessageBox.showMessage($(self._trackInfo.getView()).data('messagesuccessPublish'), MessageBox.SUCCESS_MESSAGE);
            }
            track.published = !track.published;
            self._trackInfo.togglePublishButton(track);
        } catch (Exception) {
            MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        }
    });
    
    // Add field handler
    $(this.document).on('click', '#edit-point-add-field-open', function(e) {
        e.preventDefault();
        if (!$(self.document).find('#edit-point-add-field-open-button').hasClass('hidden')) {
            $(self.document).find('#edit-point-add-field-open-button').addClass('hidden');
            $(self.document).find('#edit-point-add-field-input-box').removeClass('hidden').addClass('show');
            $(self.document).find('#edit-point-add-field-control-buttons').removeClass('hidden').addClass('show');
            
            $(self.document).find('#edit-point-page .action-menu-inner-content').animate({
                scrollTop: $('#edit-point-add-field-input-box').offset().top
            }, 2000);
        }
    });
    
    $(this.document).on('click', '#edit-point-add-field-save', function(e) {
        e.preventDefault();//edit-point-add-field-save  class="form-group" 
        var extendedData = $(self.document).find('#edit-point-extended-data');
        var extendedDataHTML = $(extendedData).html();
        var fieldName = $(self.document).find('#edit-point-add-field-input-name').val();
        var fieldValue = $(self.document).find('#edit-point-add-field-input-value').val();
        extendedDataHTML += '<div class="form-group"><label for="' + fieldName + '" class="block">' + fieldName + '</label><input name="' + fieldName + '" class="form-control" type="text" value="' + fieldValue + '" /></div>';
        $(extendedData).html(extendedDataHTML);
        
        // close
        $(self.document).find('#edit-point-add-field-cancel').click();
    });
    
    // Close add field handler
    $(this.document).on('click', '#edit-point-add-field-cancel', function(e) {
        e.preventDefault();
        $(self.document).find('#edit-point-add-field-input').val('');
        $(self.document).find('#edit-point-add-field-open-button').removeClass('hidden').addClass('show');
        $(self.document).find('#edit-point-add-field-input-box').removeClass('show').addClass('hidden');
        $(self.document).find('#edit-point-add-field-control-buttons').removeClass('show').addClass('hidden');
    });
    
    // get user's coordinates
    if (this.window.navigator.geolocation) {
        this.window.navigator.geolocation.getCurrentPosition(function(position) {  
            self._user.setUserGeoPosition(position);
            self._mapCtrl.setMapCenter(position.coords.latitude, position.coords.longitude); 
            self._mapCtrl.createUserMarker(position.coords.latitude, position.coords.longitude);
        }, this.handleGeoLocationError);
    } else {
       Logger.debug('geolocation is not supported by this browser');
    }
};

TracksPage.prototype.handleGeoLocationError = function (error) {
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

TracksPage.prototype.showTrackMain = function() {
    try {
        this._tracksMain.toggleOverlay();
        this._headerView.clearOption();
        
        var self = this;
        this._tracks.downloadTrackList({}, function() {
            self._tracksMain.placeTracksInTrackList(self._tracks.getTrackList(false));
            self._tracksMain.placeCategoriesInTrackMain(self._categories.getCategories());
            
            self.currentView.hideView();
            self.currentView = self._tracksMain;
            self.currentView.showView();
            
            self._tracksMain.toggleOverlay();
        });
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.showTrackInfo = function() {
    try {
        this._headerView.changeOption($(this._trackInfo.getView()).data('pagetitle'), 'glyphicon-chevron-left', '#form=main');
        var trackName = decodeURIComponent(this._utils.getHashVar('track_id'));
        Logger.debug('trackName: ' + trackName);
        if (trackName) {
            this._trackInfo.placeTrackInTrackInfo(
                    this._tracks.getTrack(trackName, true), 
                    this._categories.getCategories(), 
                    this._user.getUser()
            );

            this.currentView.hideView();
            this.currentView = this._trackInfo;
            this.currentView.showView();
        }
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.showAddTrack = function() {
    try {    
        this._headerView.changeOption($(this._trackAdd.getView()).data('pagetitleAdd'), 'glyphicon-chevron-left', '#form=main');
        this._utils.clearAllInputFields(this._trackAdd.getView());
        this._trackAdd.placeCategoriesInAddTrack(this._categories.getCategories());
        
        this.currentView.hideView();
        this.currentView = this._trackAdd;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.showAddPoint = function() {
    try {
        var trackName = decodeURIComponent(this._utils.getHashVar('track_id'));
        this._headerView.changeOption($(this._pointAdd.getView()).data('pagetitleAdd'), 'glyphicon-chevron-left', '#form=track_info&track_id=' + trackName);
        this._utils.clearAllInputFields(this._pointAdd.getView());
        this._pointAdd.removeCustomFields();
        
        this.currentView.hideView();
        this.currentView = this._pointAdd;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.showPointInfo = function() {
    try {
        var trackName = decodeURIComponent(this._utils.getHashVar('track_id'));
        this._headerView.changeOption($(this._pointInfo.getView()).data('pagetitle'), 'glyphicon-chevron-left', '#form=track_info&track_id=' + trackName);
        
        var pointUUID = decodeURIComponent(this._utils.getHashVar('point_uuid'));
        if (!pointUUID) {
            throw new GetsWebClientException('Track Page Error', 'showPointInfo, hash parameter pointUUID undefined');
        }
        this._points.setPoint(this._tracks.findPoint(pointUUID));
        
        this._pointInfo.placePointInPointInfo(this._points.getPoint(), this._user.isLoggedIn());
        
        this.currentView.hideView();
        this.currentView = this._pointInfo;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.showEditPoint = function() {
    try {
        var point = this._points.getPoint();
        this._headerView.changeOption($(this._pointEdit.getView()).data('pagetitleEdit'), 'glyphicon-chevron-left', '#form=point_info&track_id=' + point.track + '&point_name=' + point.name);
        this._pointEdit.removeCustomFields();
        this._pointEdit.placePointInPointEdit(point);  
        this._pointEdit.placeCategoriesInPointAdd(this._categories.getCategories(), point.category_id);
        
        this.currentView.hideView();
        this.currentView = this._pointEdit;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.showEditTrack = function() {
    try {
        var trackName = decodeURIComponent(this._utils.getHashVar('track_id'));
        this._headerView.changeOption($(this._trackEdit.getView()).data('pagetitleEdit'), 'glyphicon-chevron-left', '#form=' + TracksPage.TRACK_INFO + '&track_id=' + trackName);
        this._trackEdit.placeCategoriesInEditTrack(this._categories.getCategories());
        this._trackEdit.placeTrackInTrackEdit(this._tracks.getTrack(trackName, false));
        
        this.currentView.hideView();
        this.currentView = this._trackEdit;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.updateTracksHandler = function() {
    try {
        this._tracksMain.toggleOverlay();
        
        var self = this;
        this._tracks.downloadTrackList({}, function() {
            self._tracksMain.placeTracksInTrackList(self._tracks.getTrackList(false));
            self._tracksMain.toggleOverlay();
        });      
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

TracksPage.prototype.addTrackHandler = function (form) {

    this._trackAdd.toggleOverlay();
    var formData = $(form).serializeArray();
    formData.push({name: 'user_name', value: this._user.getEmail()});
    var that = this;
    this._tracks.addTrack(formData, function (track_name) {
        try {
            that._trackAdd.toggleOverlay();
            that.window.location.replace('#form=' + TracksPage.MAIN);
            MessageBox.showMessage($(that._trackAdd.getView()).data('messagesuccessAdd'), MessageBox.SUCCESS_MESSAGE);
        } catch (Exception) {
            that._trackAdd.toggleOverlay();
            MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
            Logger.error(Exception.toString());
        }
    });
};

TracksPage.prototype.editTrackHandler = function (form) {
    this._trackEdit.toggleOverlay();
    var formData = $(form).serializeArray();
    formData.push({name: 'update', value: 'true'});
    formData.push({name: 'user_name', value: this._user.getEmail()});
    var that = this;
    this._tracks.addTrack(formData, function (track_name) {
        try {
            that._trackEdit.toggleOverlay();
            that.window.location.replace('#form=' + TracksPage.MAIN);
            MessageBox.showMessage($(that._trackEdit.getView()).data('messagesuccessEdit'), MessageBox.SUCCESS_MESSAGE);
        } catch (Exception) {
            that._trackEdit.toggleOverlay();
            MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
            Logger.error(Exception.toString());
        }
    });
};

TracksPage.prototype.addPointHandler = function (form, update) {
    try {
        if (this._utils.checkCoordsInput(
                $(form).find('#edit-point-lat-input').val(),
                $(form).find('#edit-point-lon-input').val(),
                $(form).find('#edit-point-alt-input').val()
                )) {
            this._pointAdd.toggleOverlay();

            var paramsObj = $(form).serializeArray();
            var trackName = decodeURIComponent(this._utils.getHashVar('track_id'));
            paramsObj.push({name: 'channel', value: trackName});
            if (!update) {
                paramsObj.push({name: 'index', value: this._tracks.getTrack(trackName, true).points.length + 1});
            }
            var that = this;
            this._points.addPoint(paramsObj, update, function () {
                var track = that._tracks.getTrack(trackName, false);
                if (that._mapCtrl.checkTrack(track)) {
                    that._mapCtrl.removeTrack(track);
                    that._mapCtrl.addTrack(that._tracks.getTrack(trackName, true));
                }
                that.window.location.replace('#form=' + TracksPage.TRACK_INFO + '&track_id=' + trackName);
                MessageBox.showMessage($(that._pointAdd.getView()).data('messagesuccessAdd'), MessageBox.SUCCESS_MESSAGE);
            });
        }
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
    } finally {
        this._pointAdd.toggleOverlay();
    }
};