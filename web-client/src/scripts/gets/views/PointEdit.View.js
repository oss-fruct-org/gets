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

/**
 * Place categories into point pointAdd HTML object.
 * 
 * @param {Array} categories Array which contains categories.
 */
PointEdit.prototype.placeCategoriesInPointAdd = function (categories, selected) {
    var pointAddCategories = $(this.editPoint).find('#edit-point-category-input');
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
    
    if (selected) {
        $(pointAddCategories).val(selected);
    }
};

PointEdit.prototype.placePointInPointEdit = function(point) {
    $(this.editPoint).find('#edit-point-name-input').val(point.name);
    
    $(this.editPoint).find('#edit-point-desc-input').val(point.description);              
  
    $(this.editPoint).find('#edit-point-url-input').val(point.url === '{}' ? '' : point.url);
    $(this.editPoint).find('#edit-point-active-radius-input').val(point.radius);
    $(this.editPoint).find('#edit-point-picture-input-url').val(point.photo);
    $(this.editPoint).find('#edit-point-audio-input-url').val(point.audio);
    $(this.editPoint).find('#edit-point-active-radius-input').val(point.radius);//
    
    var coords = point.coordinates.split(',');
    $(this.editPoint).find('#edit-point-lat-lon-input').val(coords[1] + ', ' + coords[0]);
    
    var extendedDataText = '';
    for (var i = 0, len = point.extendedData.length; i < len; i++) {
        if (point.extendedData[i].name !== 'uuid' && 
            point.extendedData[i].name !== 'access' && 
            point.extendedData[i].name !== 'link' && 
            point.extendedData[i].name !== 'description' && 
            point.extendedData[i].name !== 'time' && 
            point.extendedData[i].name !== 'category_id' && 
            point.extendedData[i].name !== 'radius' && 
            point.extendedData[i].name !== 'index' &&
            point.extendedData[i].name !== 'idx' && 
            point.extendedData[i].name !== 'audio' &&
            point.extendedData[i].name !== 'photo') {
            extendedDataText += '<div class="form-group"><label>' + point.extendedData[i].name + '</label><input class="form-control" type="text" name="' + point.extendedData[i].name + '" value="' + point.extendedData[i].value + '" /></div>';
        }
    }
    $(this.editPoint).find('#edit-point-extended-data').html(extendedDataText);
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

PointEdit.prototype.removeCustomFields = function () {
    $(this.editPoint).find('#edit-point-extended-data').html('');   
};

