/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-31          (the version of the package this class was first added to)
 */

/**
 * Constructor for view "TracksInfo".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} trackInfo trackInfo dom object.
 */
function TrackInfo(document, trackInfo) {
    this.document = document;
    this.trackInfo = trackInfo;
}

/**
 * Place track data into track info HTML object.
 * 
 * @param {Object} track Object which contains track.
 * @param {Array} categories Array which contains categories.
 * @param {Boolean} isAuth Variable indicates is user authorized.
 * 
 * @throws {GetsWebClientException}
 */
TrackInfo.prototype.placeTrackInTrackInfo = function (track, categories, user) {   
    $(this.trackInfo).find('#tracks-info-name').text(track.hname).attr('title', track.hname).readmore({
        moreLink: '<a href="#">Expand</a>',
        lessLink: '<a href="#">Collapse</a>'
    });
    
    $(this.trackInfo).find('#tracks-info-description').text(track.description);
    var tracksPointList = $(this.trackInfo).find('#tracks-points-list');        
    $(tracksPointList).empty();

    // Publish/Unpublish button label 
    var tracksInfoPublish = $(this.trackInfo).find('#tracks-info-publish');
    if (track.published) {
        $(tracksInfoPublish).html('<span class="glyphicon glyphicon-share-alt"></span> ' + $(tracksInfoPublish).data('labelUnpublish'));
    } else {
        $(tracksInfoPublish).html('<span class="glyphicon glyphicon-share-alt"></span> ' + $(tracksInfoPublish).data('labelPublish'));
    }
    
    if (user.isAuth && track.access === 'rw') { 
        $(tracksInfoPublish).removeClass('disabled');
    } else {     
        $(tracksInfoPublish).addClass('disabled');      
    }
    
    // Add points count
    $(this.trackInfo).find('#tracks-points-list-count-badge').text(track.points.length);
    
    for (var i = 0; i < track.points.length; i++) {       
        var trackPointLinkElement = $(this.document.createElement('a'));
        $(trackPointLinkElement).attr('href', '#form=point_info&track_id=' + track.name + '&point_uuid=' + track.points[i].uuid);
        $(trackPointLinkElement).attr('title', track.points[i].name);
        $(trackPointLinkElement).addClass('ellipsis-text');
        $(trackPointLinkElement).addClass('list-group-item');
        $(trackPointLinkElement).text(track.points[i].name);
        $(trackPointLinkElement).appendTo(tracksPointList);
    }
    
    var tracksInfoAdd = $(this.trackInfo).find('#tracks-info-add');
    var tracksInfoEdit = $(this.trackInfo).find('#tracks-info-edit');
    var tracksInfoRemove = $(this.trackInfo).find('#tracks-info-remove');
    var tracksInfoCategory = $(this.trackInfo).find('#tracks-info-category');

    $(tracksInfoAdd).attr('href', '#form=point_add&track_id=' + track.name);
    $(tracksInfoEdit).attr('href', '#form=track_edit&track_id=' + track.name);
      
    if (track.categoryId === '-1') {
        $( tracksInfoCategory ).text('Category: None');
    } else {
        for (var i = 0, len = categories.length; i < len; i++) {
            if (track.categoryId === categories[i].id) {
                $( tracksInfoCategory ).text('Category: ' + categories[i].name);
                break;
            }
        }
    }
       
    // disable the buttons if user doesn't have the rights for modification of the track's data or 
    // user doesn't sign in or both
    Logger.debug('IS_LOGGED_IN: ' + user.isAuth + ' track.access: ' + track.access);
    Logger.debug('!IS_LOGGED_IN || track.access === \'r\': ' + (!user.isAuth || track.access === 'r'));
      
    if (!user.isAuth || track.access === 'r') {      
        $(tracksInfoAdd).on('click', function (e) {
            e.preventDefault();
        });
        $(tracksInfoAdd).addClass('disabled');
             
        $(tracksInfoEdit).on('click', function (e) {
            e.preventDefault();
        });
        $(tracksInfoEdit).addClass('disabled');
        
        $(tracksInfoRemove).addClass('disabled');
    } else {
        $(tracksInfoAdd).off('click');
        $(tracksInfoAdd).removeClass('disabled');
        
        $(tracksInfoEdit).off('click');
        $(tracksInfoEdit).removeClass('disabled');
               
        $(tracksInfoRemove).removeClass('disabled');
    }
};

/**
 * Show routes that on map
 */
TrackInfo.prototype.showRoutesOnMap = function(track) {
    var onMapContainer = $(this.trackInfo).find('#tracks-info-on-map-container');
    var routesOnMapContainer = $(this.trackInfo).find('#tracks-info-on-map-routes-container');
    if (!track.onMap) {
        $(routesOnMapContainer).empty();
        if ($(onMapContainer).hasClass('show')) {
            $(onMapContainer).removeClass('show').addClass('hidden');
        }
        return;
    }

    $(onMapContainer).removeClass('hidden').addClass('show');   
    $(routesOnMapContainer).empty();
    
    var routesOnMapHTML = '';
    $.each(track.onMap, function (key, value) {
        routesOnMapHTML += '<div id="tracks-info-on-map-route-' + key + '" data-type="' + key + '" class="row">\n\
                                <div class="col-md-10">\n\
                                    <span style="color: ' + value.color + ';font-size: 15px;font-weight: bold;">' + value.name + '</span>\n\
                                </div>\n\
                                <div class="col-md-2">\n\
                                    <button id="tracks-info-on-map-route-remove" type="button" class="close"><span aria-hidden="true">&times;</span></button>\n\
                                </div>\n\
                            </div>';
    });
    $(routesOnMapContainer).html(routesOnMapHTML);  
};

TrackInfo.prototype.addRouteOnMap = function(track, type) {
    var onMapContainer = $(this.trackInfo).find('#tracks-info-on-map-container');
    $(onMapContainer).removeClass('hidden').addClass('show');
    
    var routesOnMapContainer = $(this.trackInfo).find('#tracks-info-on-map-routes-container');
    $(routesOnMapContainer).html($(routesOnMapContainer).html() + '<div id="tracks-info-on-map-route-' + type + '" data-type="' + type + '" class="row">\n\
                                                                    <div class="col-md-10">\n\
                                                                        <span style="color: ' + track.onMap[type].color + ';font-size: 15px;font-weight: bold;">' + track.onMap[type].name + '</span>\n\
                                                                    </div>\n\
                                                                    <div class="col-md-2">\n\
                                                                        <button id="tracks-info-on-map-route-remove" type="button" class="close"><span aria-hidden="true">&times;</span></button>\n\
                                                                    </div>\n\
                                                                   </div>');
};

TrackInfo.prototype.removeRouteFromMap = function(type) {
    var onMapContainer = $(this.trackInfo).find('#tracks-info-on-map-container');   
    var routesOnMapContainer = $(this.trackInfo).find('#tracks-info-on-map-routes-container');
    
    $(routesOnMapContainer).find('#tracks-info-on-map-route-' + type).remove();
    if ($(routesOnMapContainer).children().length < 1) {
        $(onMapContainer).removeClass('show').addClass('hidden');
    }
};

TrackInfo.prototype.getRouteName = function(type) {
    var name = 'No name';
    switch (type) {
        case MapClass.ROUTE_TYPE_RAW:
                name = $(this.trackInfo).find('#tracks-info-map-raw-simple').text();
                break;
        case MapClass.ROUTE_TYPE_SERVICE:
                name = $(this.trackInfo).find('#tracks-info-map-service').text();
                break;
        case MapClass.ROUTE_TYPE_CURVE_RAW:
                name = $(this.trackInfo).find('#tracks-info-map-raw-curve').text();
                break;
        case MapClass.ROUTE_TYPE_CURVE_SERVICE:
                name = $(this.trackInfo).find('#tracks-info-map-service-curve').text();
                break;    
    }
    return name;
};

TrackInfo.prototype.getView = function() {
    return this.trackInfo;
};

/**
 * Show view
 */
TrackInfo.prototype.showView = function() {
    $(this.trackInfo).removeClass('hidden').addClass('show');
};

/**
 * Hide view
 */
TrackInfo.prototype.hideView = function() {
    $(this.trackInfo).removeClass('show').addClass('hidden');
};

/**
 * Toggle overlay
 */
TrackInfo.prototype.toggleOverlay = function() {
    var overlay = $(this.trackInfo).find('#tracks-info-overlay');
    if ($(overlay).hasClass('busy-overlay-visible')) {
        $(overlay).removeClass('busy-overlay-visible');
    } else {
        $(overlay).addClass('busy-overlay-visible');
    }  
};

/**
 * Toggle publish button
 */
TrackInfo.prototype.togglePublishButton = function(track) {
    var tracksInfoPublish = $(this.trackInfo).find('#tracks-info-publish');
    if (track.published) {
        $(tracksInfoPublish).html('<span class="glyphicon glyphicon-share-alt"></span> ' + $(tracksInfoPublish).data('labelUnpublish'));
    } else {
        $(tracksInfoPublish).html('<span class="glyphicon glyphicon-share-alt"></span> ' + $(tracksInfoPublish).data('labelPublish'));
    }
};
