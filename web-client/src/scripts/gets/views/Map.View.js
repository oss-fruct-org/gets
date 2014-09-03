/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-31          (the version of the package this class was first added to)
 */

/**
 * Constructor for "Map View". Actual map is provided by LeafletJS 
 * http://leafletjs.com/ .
 * 
 * @constructor
 * @param {Object} mapElement DOM Element.
 */
function MapView(mapElement) {
    this.mapElement = mapElement;
}

/**
 * Fit map size acording to a viewPort.
 * 
 * @param {Double} viewPortWidth
 * @param {Double} viewPortHeight
 */
MapView.prototype.fitMap = function(viewPortWidth, viewPortHeight) {
    if (this.mapElement) {
        $(this.mapElement).width(viewPortWidth - 415).height(viewPortHeight - 50);
    }
};