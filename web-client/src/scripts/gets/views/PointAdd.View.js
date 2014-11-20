/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-09-03          (the version of the package this class was first added to)
 */

/**
 * Constructor for view "PointAdd".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} addPoint addPoint dom object.
 */
function PointAdd(document, addPoint) {
    this.document = document;
    this.addPoint = addPoint;
}

PointAdd.prototype.getView = function() {
    return this.addPoint;
};

/**
 * Show view
 */
PointAdd.prototype.showView = function() {
    $(this.addPoint).removeClass('hidden').addClass('show');
};

/**
 * Hide view
 */
PointAdd.prototype.hideView = function() {
    $(this.addPoint).removeClass('show').addClass('hidden');
    // Remove the temp marker, if it is on the map 
    $(this.addPoint).find('#edit-point-use-map').click();
};

/**
 * Toggle overlay
 */
PointAdd.prototype.toggleOverlay = function() {
    $(this.addPoint).find('#edit-point-overlay').toggleClass('busy-overlay-visible');
};

/**
 * Enter pressed.
 */
PointAdd.prototype.onEnterPressed = function() {
    $(this.addPoint).find('#edit-point-save').click();
};

/**
 * Set lat, lng input fileds value.
 */
PointAdd.prototype.setLatLng = function(lat, lng) {
    $(this.addPoint).find('#edit-point-lat-input').val(lat);
    $(this.addPoint).find('#edit-point-lon-input').val(lng);
};

/**
 * Place categories into point pointAdd HTML object.
 * 
 * @param {Array} categories Array which contains categories.
 * 
 * @throws {GetsWebClientException}
 */
PointAdd.prototype.placeCategoriesInPointAdd = function (categories) {
    var pointAddCategories = $(this.addPoint).find('#edit-point-category-input');
    var pointAddCategoriesParent = $(pointAddCategories).parent();
    if ($(pointAddCategoriesParent).hasClass('hidden')) {
        $(pointAddCategoriesParent).removeClass('hidden').addClass('show');
    }
    $(pointAddCategories).empty();

    var self = this;
    $(categories).each(function(index, value) {
        var categoryItem = $(self.document.createElement('option'));
        $(categoryItem).attr('value', value.id);
        $(categoryItem).text(value.name);
        $(categoryItem).appendTo(pointAddCategories);
    });
};

PointAdd.prototype.removeCustomFields = function () {
    $(this.addPoint).find('#edit-point-extended-data').html('');   
};
