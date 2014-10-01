/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-09-02          (the version of the package this class was first added to)
 */

/**
 * Constructor for view "TrackAdd".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} addTrack addTrack dom object.
 */
function TrackAdd(document, addTrack) {
    this.document = document;
    this.addTrack = addTrack;
}

/**
 * Place categories into addTrack HTML object.
 * 
 * @param {Array} categories Array which contains categories.
 * 
 * @throws {GetsWebClientException}
 */
TrackAdd.prototype.placeCategoriesInAddTrack = function (categories) {
    var addTracksCategories = $(this.addTrack).find('#tracks-edit-track-category-input');

    // Add 'none' category with value -1
    $(this.document.createElement('option'))
            .attr('value', -1)
            .text('None')
            .appendTo(addTracksCategories);

    var self = this;
    $.each(categories, function(index, value) {
        var categoryItem = $(self.document.createElement('option'));
        $(categoryItem).attr('value', value.id);
        $(categoryItem).text(value.name);
        $(categoryItem).appendTo(addTracksCategories);
    });
}; 

TrackAdd.prototype.getView = function() {
    return this.addTrack;
};

/**
 * Show view
 */
TrackAdd.prototype.showView = function() {
    Logger.debug('showView');
    $(this.addTrack).removeClass('hidden').addClass('show');
};

/**
 * Hide view
 */
TrackAdd.prototype.hideView = function() {
    $(this.addTrack).removeClass('show').addClass('hidden');
};

/**
 * Toggle overlay
 */
TrackAdd.prototype.toggleOverlay = function() {
    $(this.addTrack).find('#tracks-edit-track-overlay').toggleClass('busy-overlay-visible');
};

/**
 * Enter pressed.
 */
TrackAdd.prototype.onEnterPressed = function() {
    $(this.addTrack).find('#tracks-edit-track-save').click();
};