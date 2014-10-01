/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-09-29          (the version of the package this class was first added to)
 */

/**
 * Constructor for view "TrackEdit".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} editTrack editTrack dom object.
 */
function TrackEdit(document, editTrack) {
    this.document = document;
    this.editTrack = editTrack;
}

TrackEdit.prototype.getView = function() {
    return this.editTrack;
};

/**
 * Place categories into editTrack HTML object.
 * 
 * @param {Array} categories Array which contains categories.
 * 
 * @throws {GetsWebClientException}
 */
TrackEdit.prototype.placeCategoriesInEditTrack = function (categories) {
    var editTracksCategories = $(this.editTrack).find('#tracks-edit-track-category-input');

    // Add 'none' category with value -1
    $(this.document.createElement('option'))
            .attr('value', -1)
            .text('None')
            .appendTo(editTracksCategories);

    var self = this;
    $(categories).each(function(index, value) {
        var categoryItem = $(self.document.createElement('option'));
        $(categoryItem).attr('value', value.id);
        $(categoryItem).text(value.name);
        $(categoryItem).appendTo(editTracksCategories);
    });
};

TrackEdit.prototype.placeTrackInTrackEdit = function(track) {
    $(this.editTrack).find('#tracks-edit-track-name-input').val(track.hname);
    $(this.editTrack).find('#tracks-edit-track-desc-input').val(track.description);
    $(this.editTrack).find('#tracks-edit-track-url-input').val(typeof track.url === 'undefined' ? '' : track.url);
    $(this.editTrack).find('#tracks-edit-track-category-input').find('option[value=' + track.categoryId + ']').attr('selected', 'selected');
    //$(this.editTrack).find('#tracks-edit-track-lang-input').find('option[value=' + track.categoryId + ']').attr('selected', 'selected');
};

/**
 * Show view
 */
TrackEdit.prototype.showView = function() {
    $(this.editTrack).removeClass('hidden').addClass('show');
};

/**
 * Hide view
 */
TrackEdit.prototype.hideView = function() {
    $(this.editTrack).removeClass('show').addClass('hidden');
};

/**
 * Toggle overlay
 */
TrackEdit.prototype.toggleOverlay = function() {
    $(this.editTrack).find('#tracks-edit-track-overlay').toggleClass('busy-overlay-visible');
};

/**
 * Enter pressed.
 */
TrackEdit.prototype.onEnterPressed = function() {
    $(this.editTrack).find('#tracks-edit-track-save').click();
};

