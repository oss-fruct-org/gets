/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-30          (the version of the package this class was first added to)
 */

/**
 * Constructor for view "TracksMain".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} mainTracks mainTracks dom object.
 */
function TracksMain(document, mainTracks) {
    this.document = document;
    this.mainTracks = mainTracks;
}

TracksMain.prototype.initView = function(isAuth) {
    if (!isAuth) {
        $(this.mainTracks).find('#tracks-main-add-track').addClass('disabled').on('click', function(e) {
            e.preventDefault();
        });
    }
};

/**
 * Place tracks data into track list HTML object.
 * 
 * @constructor
 * @param {Array} trackList Array which contains tracks.
 * 
 * @throws {GetsWebClientException}
 */
TracksMain.prototype.placeTracksInTrackList = function (trackList) {   
    var trackListElement = $(this.mainTracks).find( '#tracks-list' );
    $( trackListElement ).empty();
   
    if (!trackListElement || !trackListElement.length) {
        throw new GetsWebClientException('TrackMain View Error', 'placeTracksInTrackList, trackListElement undefined or null');
    }
    
    if (!trackList) {
       throw new GetsWebClientException('TrackMain View Error', 'placeTracksInTrackList, trackList undefined or null');
    }
    
    var self = this;
    $(trackList).each(function(index, value) {      
        var trackLinkElement = $(self.document.createElement('a'));
        $(trackLinkElement).attr('href', '#form=track_info&track_id=' + value.name);
        $(trackLinkElement).text(value.hname);
        $(trackLinkElement).addClass('list-group-item');
        $(trackLinkElement).appendTo(trackListElement);
    });          
};

/**
 * Place categories into track tracksMain HTML object.
 * 
 * @param {Array} categories Array which contains categories.
 * 
 * @throws {GetsWebClientException}
 */
TracksMain.prototype.placeCategoriesInTrackMain = function (categories) {
    var mainTracksCategories = $(this.mainTracks).find('#tracks-main-filter-category');

    // Add 'all' category with value ''
    $(this.document.createElement('option'))
            .attr('value', '')
            .text('All')
            .appendTo(mainTracksCategories);

    // Add 'none' category with value -1
    $(this.document.createElement('option'))
            .attr('value', -1)
            .text('None')
            .appendTo(mainTracksCategories);

    var self = this;
    $.each(categories, function(index, value) {
        var categoryItem = $(self.document.createElement('option'));
        $(categoryItem).attr('value', value.id);
        $(categoryItem).text(value.name);
        $(categoryItem).appendTo(mainTracksCategories);
    });
}; 

/**
 * Show view
 */
TracksMain.prototype.showView = function() {
    Logger.debug('showView');
    $(this.mainTracks).removeClass('hidden').addClass('show');
};

/**
 * Hide view
 */
TracksMain.prototype.hideView = function() {
    $(this.mainTracks).removeClass('show').addClass('hidden');
};

/**
 * Toggle overlay
 */
TracksMain.prototype.toggleOverlay = function() {
    $(this.mainTracks).find('#tracks-main-overlay').toggleClass('busy-overlay-visible');
};
