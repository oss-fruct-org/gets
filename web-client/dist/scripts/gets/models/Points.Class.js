/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-30          (the version of the package this class was first added to)
 */

/**
 * Constructor for class "Points". This class is suppoused to contain all points 
 * data and methods to operate on it.
 * 
 * @constructor
 */
function PointsClass() {
    this.pointList = null;
    this.point = null;
    this.needPointListUpdate = false;
    this.needPointUpdate = false;
};

/**
 * Check whether pointList is downloaded or not.
 */
PointsClass.prototype.isPointListDownloaded = function () {
    return !!this.pointList;
};

/**
 * Check whether point is downloaded or not.
 */
PointsClass.prototype.isPointDownloaded = function () {
    return !!this.point;
};

/**
 * Check is pointList need to be downloaded.
 */
PointsClass.prototype.checkPointList = function () {
    if (!this.isPointListDownloaded() || this.needPointListUpdate) {
        this.downLoadPoints();
    }
};

/**
 * Download points from the GeTS Server and store them in an internal variable 
 * "pointList".
 * 
 * @param {Object} paramsObj A container for parameters.
 * @param {Double} paramsObj.latitude Latitude of a center.
 * @param {Double} paramsObj.longitude Longitude of a center.
 * @param {Double} paramsObj.radius Radius of a search area.
 * @param {Integer} paramsObj.category Filter points by category (optional, value must be >= -1).
 * @param {String} paramsObj.space Filter points by space (optional; possible values = all, private, public; default=all)
 * 
 * @throws {GetsWebClientException}    
 */
PointsClass.prototype.downLoadPoints = function(paramsObj, callback) { 
    var lat = 0.0, lng = 0.0, radius = 1, categoryId = -1, space = 'public';
    
    $(paramsObj).each(function (idx, value) {
        if (value.name === 'latitude') {
            lat = value.value;
        } else if (value.name === 'longitude') {
            lng = value.value;
        } else if (value.name === 'radius') {
            radius = value.value;
        } else if (value.name === 'category_id') {
            categoryId = value.value;
        } else if (value.name === 'space') {
            space = value.value;
        } 
    });
    
    var locationCondition = (
        (typeof lat !== 'undefined' && lat != null && lat !== '') &&
        (typeof lng !== 'undefined' && lng != null && lng !== '') &&
        (typeof radius !== 'undefined' && radius != null && radius !== '')
    );
                    
    var categoryCondition = typeof categoryId !== 'undefined' && 
                            categoryId != null && 
                            categoryId != -1;
                    
    if (!locationCondition && !categoryCondition) {
        throw new GetsWebClientException('Points Error', 'downLoadPoints, request parameters are incorrect.');
    }
    
    var requestObj = {};
    
    if (locationCondition && categoryCondition) {
        requestObj.latitude = lat;
        requestObj.longitude = lng;
        requestObj.radius = radius;
        requestObj.category_id = categoryId;      
    } else if (locationCondition) {
        requestObj.latitude = lat;
        requestObj.longitude = lng;
        requestObj.radius = radius;
    } else {
        requestObj.category_id = categoryId;
    }
    
    //requestObj.space = space;
    
    var getPointsRequest = $.ajax({
        url: 'actions/getPoints.php',
        type: 'POST',
        async: true, 
        contentType: 'application/json', 
        dataType: 'xml', 
        data: JSON.stringify(requestObj)
    });
    
    Logger.debug(getPointsRequest.responseText);

    getPointsRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Points Error', 'getPointsRequest failed ' + textStatus);
    });
    
    var self = this;
    getPointsRequest.done(function(data, textStatus, jqXHR) {
        if ($(jqXHR.responseText).find('code').text() !== '0') {
            throw new GetsWebClientException('Points Error', 'getPointsRequest: ' + $(jqXHR.responseText).find('message').text());
        }

        var pointListItems = $($.parseXML(jqXHR.responseText)).find('Placemark');
        var pointsArray = [];
        $(pointListItems).each(function(index, value) {
            var pointObj = {};
            pointObj.index = $(value).find("[name='idx']").length ? $(value).find("[name='idx']").text() : '';
            pointObj.uuid = $(value).find("[name='uuid']").length ? $(value).find("[name='uuid']").text() : '';
            pointObj.name = $(value).find('name').length ? $(value).find('name').text() : '';
            pointObj.description = $(value).find('description').length ? $(value).find('description').text() : '';
            pointObj.url = $(value).find("[name='url']").length ? $(value).find("[name='url']").text() : '';
            pointObj.descriptionExt = $(value).find("[name='description']").length ? $(value).find("[name='description']").text() : '';
            pointObj.audio = $(value).find("[name='audio']").length ? $(value).find("[name='audio']").text() : '';
            pointObj.photo = $(value).find("[name='photo']").length ? $(value).find("[name='photo']").text() : '';
            pointObj.coordinates = $(value).find('coordinates').length ? $(value).find('coordinates').text() : '';

            pointsArray.push(pointObj);
        });

        Logger.debug(pointsArray);
        self.pointList = pointsArray;
        if (callback) {
            callback();
        }
    });
};

/**
 * Upload point to a given track in the GeTS Server. 
 * 
 * @param {Object} paramsObj An array of objects in format {name: "someName", value: "someValue"}
 * @param {String} paramsObj[i].name="title" Name of a point (value stored in paramsObj[i].value)
 * @param {String} paramsObj[i].name="description" Description of a point (value stored in paramsObj[i].value)
 * @param {String} paramsObj[i].name="url" Link of a point (value stored in paramsObj[i].value)
 * @param {Double} paramsObj[i].name="latitude" Latitude of a point (value stored in paramsObj[i].value)
 * @param {Double} paramsObj[i].name="longitude" Longitude of a point (value stored in paramsObj[i].value)
 * @param {Double} paramsObj[i].name="altitude" Altitude of a point (value stored in paramsObj[i].value)
 * @param {String} paramsObj[i].name="imageURL" ImageURL of a point (optional) (value stored in paramsObj[i].value)
 * @param {String} paramsObj[i].name="audioURL" AudioURL of a point (optional) (value stored in paramsObj[i].value)
 * @param {String} paramsObj[i].name="uuid" UUID of a point (optional) (value stored in paramsObj[i].value)
 * @param {String} paramsObj[i].name="channel" Track in which point need to be uploaded (value stored in paramsObj[i].value)
 * @param {String} paramsObj[i].name="time" Time when point was created (value stored in paramsObj[i].value)
 * @param {Positive Integer} paramsObj[i].name="index" Position of a point in a track (optional) (value stored in paramsObj[i].value)
 * 
 * @throws {GetsWebClientException}
 */
PointsClass.prototype.addPoint = function (paramsObj, callback) {
    if (!paramsObj) {
        throw new GetsWebClientException('Points Error', 'addPoint, paramsObj is undefined or null');
    }
    
    Logger.debug(paramsObj);
      
    var newParamsObj = {};
    
    var title = '';
    var descriptionText = '';
    var url = '';
    var lat = 0.0;
    var lng = 0.0;
    var alt = 0.0;
    var imageURL = null;
    var audioURL = null;
    var uuid = null;
    var channel = '';
    var time = '';
    var index = 1;
    var radius = 0;
      
    $(paramsObj).each(function (idx, value) {
        if (value.name === 'title') {
            title = value.value;
        } else if (value.name === 'description') {
            descriptionText = value.value;
        } else if (value.name === 'url') {
            url = value.value;
        } else if (value.name === 'latitude') {
            lat = value.value;
        } else if (value.name === 'longitude') {
            lng = value.value;
        } else if (value.name === 'imageURL') {
            imageURL = value.value;
        } else if (value.name === 'audioURL') {
            audioURL = value.value;
        } else if (value.name === 'uuid') {
            uuid = value.value;
        } else if (value.name === 'channel') {
            channel = value.value;
        } else if (value.name === 'time') {
            time = value.value;
        } else if (value.name === 'index') {
            index = value.value;
        } else if (value.name === 'radius') {
            radius = value.value;
        }
    });
     
    var description = this.createDescription(descriptionText, audioURL, imageURL, uuid, index, radius);
                           
    newParamsObj.channel = channel;
    newParamsObj.title = title;
    newParamsObj.description = description;
    newParamsObj.link = url;
    newParamsObj.latitude = lat;
    newParamsObj.longitude = lng;
    newParamsObj.altitude = alt;
    newParamsObj.time = time;
    
    Logger.debug(newParamsObj); 
    
    var addPointRequest = $.ajax({
        url: 'actions/addPoint.php',
        type: 'POST',
        async: false, 
        contentType: 'application/json', 
        dataType: 'xml', 
        data: JSON.stringify(newParamsObj)
    });
    
    addPointRequest.fail(function( jqXHR, textStatus ) {
        throw new GetsWebClientException('Points Error', 'addPoint, addPointRequest failed ' + textStatus);
    });
      
    if ($( addPointRequest.responseText ).find('code').text() !== '0') {
        throw new GetsWebClientException('Points Error', 'addPoint, ' + $( addPointRequest.responseText ).find('message').text());
    }
    
    if (callback) {
        callback(title);
    }
};

/**
 * Create description for add point as object.
 * 
 * @param {String} text Description text.
 * @param {String} audioURL Audio track url.
 * @param {String} imageURL Description text.
 * @param {String} uuid Point's UUID.
 * @param {String} index Point's position in a track.
 * 
 * @returns {Object} New description object    
 */
PointsClass.prototype.createDescription = function(text, audioURL, imageURL, uuid, index, radius) {
    var descObj = {};
     
    if (!text) {
        descObj.description = '';
    } else {
        descObj.description = text;
    }
    
    if (!uuid) {
        descObj.uuid = '';
    } else {
        descObj.uuid = uuid;
    }
        
    if (audioURL) {
        descObj.audio = audioURL;
    }
    
    if (imageURL) {
        descObj.photo = imageURL;
    }
      
    if (index) {
        descObj.idx = index;
    }
    
    if (!radius) {
        descObj.radius = 0;
    } else {
        descObj.radius = radius;
    }
    
    return descObj;
};

PointsClass.prototype.removePoint = function (callback) {
    var point = this.getPoint();
    if (point.access === 'r') {
        throw new GetsWebClientException('Points Error', 'removePoint, "point" is read only');
    }
    
    var removePointRequest = $.ajax({
        url: 'actions/removePoint.php',
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify({
            channel: point.track,
            name: point.name
        })
    });
    
    removePointRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Points Error', 'removePoint, removePointRequest failed ' + textStatus);
    });
    
    if ($(removePointRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Points Error', 'removePoint, removePointRequest: ' + $(removePointRequest.responseText).find('message').text());
    }   
    
    if (callback) {
        callback();
    }
};

PointsClass.prototype.findPointInPointList = function(name) {
    if (!name || !this.pointList) {
        return;
    }
    
    for (var i = 0, len = this.pointList.length; i < len; i++) {
        if (this.pointList[i].name === name) {
            this.point = this.pointList[i];
            return this.point;
        }
    }
};

/**
 * Getters
 */
PointsClass.prototype.getPointList = function() {
    if (this.isPointListDownloaded()) {
        return this.pointList;
    }    
};

PointsClass.prototype.getPoint = function() {
    if (!this.point) {
        throw new GetsWebClientException('Points Error', 'getPoint, point undefined or null');
    }
    return this.point;
};

PointsClass.prototype.setPoint = function(point) {
    this.point = point;
};