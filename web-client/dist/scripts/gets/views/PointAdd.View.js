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
    
    $.extend($.inputmask.defaults.aliases, { 
        "decimal": { 
            mask: "i", 
            definitions: { 
                'i': { 
                    validator: "^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s+[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$",
                    cardinality: 9
                }
            } 
        }
    });
    
    //$(this.addPoint).find('#edit-point-lat-lon-input').inputmask('decimal');
    //$(this.addPoint).find('#edit-point-lon-input').mask('999.999999', {placeholder: '0'});
    
    //$(this.addPoint).find('#edit-point-lat-input-deg').mask('99° 99′ 99″ N', {placeholder: '0'});
    //$(this.addPoint).find('#edit-point-lon-input-deg').mask('99° 99′ 99″ W', {placeholder: '0'});
    
    this.coordsInputMode = 'decimal';
}

PointAdd.DECIMAL = 'decimal';
PointAdd.DEGREE_M = 'degrees-m';
PointAdd.DEGREE_M_S = 'degrees-m-s';

PointAdd.prototype.getView = function() {
    return this.addPoint;
};

/**
 * Show view
 */
PointAdd.prototype.showView = function() {
    this.defaultCoordsInputFormat();
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
    switch (this.coordsInputMode) {
        case PointAdd.DEGREE_M:
            $(this.addPoint).find('#edit-point-lat-lon-input').val(this.convertDec2DegM(lat) + ', ' + this.convertDec2DegM(lng));
            break;
        case PointAdd.DEGREE_M_S:
            $(this.addPoint).find('#edit-point-lat-lon-input').val(this.convertDec2DegMS(lat) + ', ' + this.convertDec2DegMS(lng));
            break;
        default:
            $(this.addPoint).find('#edit-point-lat-lon-input').val(lat + ', ' + lng);
    }   
};

PointAdd.prototype.getLatLng = function() {
    var val = $(this.addPoint).find('#edit-point-lat-lon-input').val();  
    if (val === '') return null;
    val = val.split(',');
    
    var result;
    switch (this.coordsInputMode) {
        case PointAdd.DEGREE_M:
            var mm1 = val[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '').split(' ');
            var mm2 = val[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '').split(' ');
            result = {
                lat: this.convertDegM2Dec(mm1[0], mm1[1]),
                lng: this.convertDegM2Dec(mm2[0], mm2[1])
            };
            break;
        case PointAdd.DEGREE_M_S:
            var ss1 = val[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '').split(' ');
            var ss2 = val[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '').split(' ');
            result = {
                lat: this.convertDegMS2Dec(ss1[0], ss1[1], ss1[2]),
                lng: this.convertDegMS2Dec(ss2[0], ss2[1], ss2[2])
            };
            break;
        default:
            result = {
                lat: val[0],
                lng: val[1]
            };
    }
    
    return result;
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

PointAdd.prototype.switchCoordsInputFormat = function (type) {
    if (this.coordsInputMode === type) return;
    var coords = this.getLatLng();
    this.coordsInputMode = type;
    if (!coords) return;
    this.setLatLng(coords.lat, coords.lng);   
};

PointAdd.prototype.defaultCoordsInputFormat = function () {
    this.coordsInputMode = PointAdd.DECIMAL;
    $(this.addPoint).find('#edit-point-coords-input-type li a').removeClass('marked-list-item');
    $(this.addPoint).find('#edit-point-coords-input-type li a[data-item="' + PointAdd.DECIMAL + '"]').addClass('marked-list-item');   
};


PointAdd.prototype.convertDec2DegMS = function (dec) {
    var deg = Math.floor(dec);
    var min = (dec % 1) * 60;
    var sec = (min % 1) * 60;
    return deg + ' ' + Math.floor(min) + ' ' + Math.floor(sec * 10000) / 10000;
};

PointAdd.prototype.convertDec2DegM = function (dec) {
    var deg = Math.floor(dec);
    var min = (dec % 1) * 60;
    return deg + ' ' + Math.floor(min * 10000) / 10000;
};

PointAdd.prototype.convertDegM2Dec = function (deg, min) {
    return Math.floor((parseFloat(deg) + parseFloat(min / 60)) * 100000) / 100000;
};

PointAdd.prototype.convertDegMS2Dec = function (deg, min, sec) {
    return Math.floor((parseFloat(deg) + parseFloat(min / 60) + parseFloat(sec / 3600)) * 100000) / 100000;
};