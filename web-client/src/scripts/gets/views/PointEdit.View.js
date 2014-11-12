/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-09-21          (the version of the package this class was first added to)
 */

/**
 * Constructor for view "PointEdit".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} editPoint editPoint dom object.
 */
function PointEdit(document, editPoint) {
    this.document = document;
    this.editPoint = editPoint;
}

PointEdit.prototype.getView = function() {
    return this.editPoint;
};

PointEdit.prototype.placePointInPointEdit = function(point) {
    $(this.editPoint).find('#edit-point-name-input').val(point.name);
    
    if (point.descriptionExt !== '') {
        $(this.editPoint).find('#edit-point-desc-input').val(point.descriptionExt);
    } else {
        $(this.editPoint).find('#edit-point-desc-input').val(point.description);
        
        var json = null;
        var descriptionText = '';
        try {          
            json = JSON.parse(point.description);
        } catch (Exception) {} 
        
        if (json) {
            $.each(json, function (key, val) {
                descriptionText += '<div class="emulate-tab"><label>' + key + ': &nbsp;</label><input class="inline" type="text" value="' + val + '"/></div>';
            });
            $(this.editPoint).find('#edit-point-desc-input-keyvalue').html(descriptionText);
        }        
    }
    
    $(this.editPoint).find('#edit-point-url-input').val(point.url);
    $(this.editPoint).find('#edit-point-active-radius-input').val(point.radius);
    $(this.editPoint).find('#edit-point-picture-input-url').val(point.photo);
    $(this.editPoint).find('#edit-point-audio-input-url').val(point.audio);
    
    var coords = point.coordinates.split(',');
    $(this.editPoint).find('#edit-point-lat-input').val(coords[1]);
    $(this.editPoint).find('#edit-point-lon-input').val(coords[0]);
};

/**
 * Show view
 */
PointEdit.prototype.showView = function() {
    $(this.editPoint).removeClass('hidden').addClass('show');
};

/**
 * Hide view
 */
PointEdit.prototype.hideView = function() {
    $(this.editPoint).removeClass('show').addClass('hidden');
    // Remove the temp marker, if it is on the map 
    $(this.editPoint).find('#edit-point-use-map').click();
};

/**
 * Toggle overlay
 */
PointEdit.prototype.toggleOverlay = function() {
    $(this.editPoint).find('#edit-point-overlay').toggleClass('busy-overlay-visible');
};

/**
 * Enter pressed.
 */
PointEdit.prototype.onEnterPressed = function() {
    $(this.editPoint).find('#edit-point-save').click();
};

/**
 * Set lat, lng input fileds value.
 */
PointEdit.prototype.setLatLng = function(lat, lng) {
    $(this.editPoint).find('#edit-point-lat-input').val(lat);
    $(this.editPoint).find('#edit-point-lon-input').val(lng);
};

