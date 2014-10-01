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
TrackInfo.prototype.placeTrackInTrackInfo = function (track, categories, isAuth) {   
    $(this.trackInfo).find('#tracks-info-name').text(track.hname).attr('title', track.hname).readmore({
        moreLink: '<a href="#">Expand</a>',
        lessLink: '<a href="#">Collapse</a>'
    });
    
    $(this.trackInfo).find('#tracks-info-description').text(track.description);
    var tracksPointList = $(this.trackInfo).find('#tracks-points-list');
         
    $(tracksPointList).empty();
    
    // Add points count
    $(this.trackInfo).find('#tracks-points-list-count-badge').text(track.points.length);
    
    for (var i = 0; i < track.points.length; i++) {
        var tracksPointItem = $(this.document.createElement('li'));
        $(tracksPointItem).addClass('list-group-item');
        var trackPointLinkElement = $(this.document.createElement('a'));
        $(trackPointLinkElement).attr('href', '#form=point_info&track_id=' + track.name + '&point_name=' + track.points[i].name);
        $(trackPointLinkElement).attr('title', track.points[i].name);
        $(trackPointLinkElement).addClass('ellipsis-text');
        $(trackPointLinkElement).text(track.points[i].name);
        $(trackPointLinkElement).appendTo(tracksPointItem);
        $(tracksPointItem).appendTo(tracksPointList);
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
    Logger.debug('IS_LOGGED_IN: ' + isAuth + ' track.access: ' + track.access);
    Logger.debug('!IS_LOGGED_IN || track.access === \'r\': ' + (!isAuth || track.access === 'r'));
      
    if (!isAuth || track.access === 'r') {      
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
    $(this.trackInfo).find('#tracks-info').toggleClass('busy-overlay-visible');
};



