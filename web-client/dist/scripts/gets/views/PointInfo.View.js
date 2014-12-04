/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-09-02          (the version of the package this class was first added to)
 */

/**
 * Constructor for view "PointInfo".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} pointInfo pointInfo dom object.
 */
function PointInfo(document, pointInfo) {
    this.document = document;
    this.pointInfo = pointInfo;
}

/**
 * Place point info on pointInfo HTML DOM Object.
 * 
 * @param {Object} point Object contains point info.
 * @param {Boolean} isAuth Variable indicates is user authorized.
 */
PointInfo.prototype.placePointInPointInfo = function(point, isAuth) {
    // Get all elements
    var nameElement = $(this.pointInfo).find('#point-info-name');
    var coordsElementLat = $(this.pointInfo).find('#point-info-coords-lat');
    var coordsElementLon = $(this.pointInfo).find('#point-info-coords-lon');
    var coordsElementAlt = $(this.pointInfo).find('#point-info-coords-alt');
    var descElement = $(this.pointInfo).find('#point-info-description');
    var urlElement = $(this.pointInfo).find('#point-info-url a');
    var audioElement = $(this.pointInfo).find('#point-info-audio');
    var photoElement = $(this.pointInfo).find('#point-info-image img');
    var extendedDataElement = $(this.pointInfo).find('#point-info-extended-data');

    // Clear value of all elements
    $(nameElement).text('');
    $(coordsElementLat).text('');
    $(coordsElementLon).text('');
    $(coordsElementAlt).text('');
    $(descElement).html('');
    $(urlElement).attr('href', '').text('');
    $(audioElement).empty();
    $(photoElement).attr('src', '');
    $(extendedDataElement).html('');

    // Then fill elemnts with new values 
    $(nameElement).text(point.name).attr('title', point.name);
    
    var coords = point.coordinates.split(',');
    $(coordsElementLat).text(coords[1]);
    $(coordsElementLon).text(coords[0]);
    $(coordsElementAlt).text(coords[2]);
    
    $(descElement).html(point.description);
          
    if (point.url !== '') {
        $(urlElement).attr('href', point.url).text(point.url);
    }

    if (point.audio !== '') {
        // Add 'audio' element
        $(this.document.createElement('audio'))
                .attr('src', point.audio)
                .attr('controls', '')
                .append($(this.document.createElement('span')).html('Your browser doesn\'t support audio feature or audio file has unsupported format. \n\
                        Try to <a href="' + point.audio + '">download it</a>' + 'and open locally.' ))
                .appendTo(audioElement);
    }

    if (point.photo !== '') {
        $(photoElement).attr('src', point.photo);
    }
    
    var extendedDataText = '';
    for (var i = 0, len = point.extendedData.length; i < len; i++) {
        extendedDataText += '<div class="emulate-tab"><label>' + point.extendedData[i].name + ': &nbsp;</label><div class="inline">' + point.extendedData[i].value + '</div></div>';
    }
    $(extendedDataElement).html(extendedDataText);

    var pointsInfoEdit = $('#point-info-edit');
    var pointsInfoRemove = $('#point-info-remove');
    
    $(pointsInfoEdit).attr('href', '#form=point_edit' + (point.track ? ('&track_id=' + point.track) : '') + '&point_uuid=' + point.uuid);

    if (!isAuth || point.access === 'r') {
        $(pointsInfoEdit).on('click', function(e) {
            e.preventDefault();
        });
        $(pointsInfoEdit).addClass('disabled');
        $(pointsInfoRemove).addClass('disabled');
    } else {
        $(pointsInfoEdit).off('click');        
        $(pointsInfoEdit).removeClass('disabled');
        $(pointsInfoRemove).removeClass('disabled');
    }
};

PointInfo.prototype.getView = function() {
    return this.pointInfo;
};

/**
 * Show view
 */
PointInfo.prototype.showView = function() {
    $(this.pointInfo).removeClass('hidden').addClass('show');
};

/**
 * Hide view
 */
PointInfo.prototype.hideView = function() {
    $(this.pointInfo).removeClass('show').addClass('hidden');
};



