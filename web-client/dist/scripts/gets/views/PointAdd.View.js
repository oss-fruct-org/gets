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

