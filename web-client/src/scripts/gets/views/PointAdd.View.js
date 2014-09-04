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


