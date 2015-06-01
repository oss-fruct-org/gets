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
    this.userVote = null;
    this.userVotePositive = null;
    this.userVoteNegative = null;
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
        url: GET_POINTS_ACTION,
        type: 'POST',
        async: true, 
        contentType: 'application/json', 
        dataType: 'xml', 
        data: JSON.stringify(requestObj)
    });
    
    //Logger.debug(getPointsRequest.responseText);

    getPointsRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Points Error', 'getPointsRequest failed ' + textStatus);
    });
    
    var self = this;
    getPointsRequest.done(function(data, textStatus, jqXHR) {
        if ($(jqXHR.responseText).find('code').text() !== '0') {
            throw new GetsWebClientException('Points Error', 'getPointsRequest: ' + $(jqXHR.responseText).find('message').text());
        }
        
        //Logger.debug(jqXHR.responseText);
        var pointListItems = $($.parseXML(jqXHR.responseText)).find('Placemark');
        var pointsArray = [];
        for (var i = 0, len = pointListItems.length; i < len; i++) {          
            var pointObj = {};
            var pointExtendedData = [];
            pointObj.photos = [];
            
            pointObj.name = $(pointListItems[i]).find('name').length ? $(pointListItems[i]).find('name').text() : '';
            pointObj.description = $(pointListItems[i]).find('description').length ? $(pointListItems[i]).find('description').text() : '';
            pointObj.uuid = $(pointListItems[i]).find("[name='uuid']").length ? $(pointListItems[i]).find("[name='uuid']").text() : '';
            pointObj.access = $(pointListItems[i]).find("[name='access']").length ? $(pointListItems[i]).find("[name='access']").text() : '';
            $(pointListItems[i]).find("gets\\:photo").each(function (idx, val) {
                pointObj.photos.push($(val).text());
            });
            pointObj.audio = $(pointListItems[i]).find("[name='audio']").length ? $(pointListItems[i]).find("[name='audio']").text() : '';
            pointObj.url = $(pointListItems[i]).find("[name='link']").length ? $(pointListItems[i]).find("[name='link']").text() : '';
            pointObj.coordinates = $(pointListItems[i]).find('coordinates').length ? $(pointListItems[i]).find('coordinates').text() : '';
            pointObj.category_id = $(pointListItems[i]).find("[name='category_id']").length ? $(pointListItems[i]).find("[name='category_id']").text() : '';
            pointObj.radius = $(pointListItems[i]).find("[name='radius']").length ? $(pointListItems[i]).find("[name='radius']").text() : '';
            
            $(pointListItems[i]).find('Data').each(function(index, newValue) {               
                pointExtendedData.push({name: $(newValue).attr('name')/*.replace(/_/g, ' ')*/, value: $(newValue).text()});               
            });                                    
            pointObj.extendedData = pointExtendedData;

            pointsArray.push(pointObj);
        }

        //Logger.debug(pointsArray);
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
 * @param {Boolean} update Set true if point should be updated
 * 
 * @throws {GetsWebClientException}
 */
PointsClass.prototype.addPoint = function (paramsObj, update, callback) {
    if (!paramsObj) {
        throw new GetsWebClientException('Points Error', 'addPoint, paramsObj is undefined or null');
    }
    if (update && !this.point) {
        throw new GetsWebClientException('Points Error', 'addPoint, there is no point to update');
    }
    
    Logger.debug(paramsObj);
      
    var newParamsObj = {};  
    var channel = null;
    var category = null;
    
    if (update) {
        newParamsObj.uuid = this.point.uuid;
    }
         
    $(paramsObj).each(function (idx, value) {
        Logger.debug(idx, value);
        if (value.name === 'altitude') return true;
        if (value.name === 'title') {
            newParamsObj.title = value.value;
        } else if (value.name === 'description') {
            newParamsObj.description = value.value;
        } else if (value.name === 'category') {
            category = value.value;
        } else if (value.name === 'channel') {
            channel = value.value;
        } else if (value.name === 'url') {
            newParamsObj.link = value.value;
        } else if (value.name === 'latitude') {
            newParamsObj.latitude = value.value;
        } else if (value.name === 'longitude') {
            newParamsObj.longitude = value.value;
        } else if (value.name === 'photo') {
            newParamsObj.photos = newParamsObj.photos || [];
            newParamsObj.photos.push({
                photo: value.value
            });
        } else {
            if (value.value !== '') {
                newParamsObj.extended_data = newParamsObj.extended_data || {};
                newParamsObj.extended_data[value.name.replace(/ /g, '_')] = value.value;
            }
        }
    });
    
    // Temprorary fix for altitude
    newParamsObj.altitude = 0.0;
    
    if (channel) {
        newParamsObj.channel = channel;
    } else {
        newParamsObj.category_id = category;
    }
               
    Logger.debug(newParamsObj);
    Logger.debug(JSON.stringify(newParamsObj));
    
    var addPointRequest = $.ajax({
        url: update ? UPDATE_POINT_ACTION : ADD_POINT_ACTION,
        type: 'POST',
        async: false, 
        contentType: 'application/json', 
        dataType: 'xml', 
        data: JSON.stringify(newParamsObj)
    });
    
    addPointRequest.fail(function( jqXHR, textStatus ) {
        throw new GetsWebClientException('Points Error', 'addPoint, addPointRequest failed ' + textStatus);
    });
    
    addPointRequest.done(function (data, textStatus, jqXHR) {
        if ($(jqXHR.responseText).find('code').text() !== '0') {
            throw new GetsWebClientException('Points Error', 'addPoint, ' + $(jqXHR.responseText).find('message').text());
        }

        if (callback) {
            callback();
        }
    });   
};

/**
 * Create description for add point as object.
 * 
 * @param {String} audioURL Audio track url.
 * @param {String} imageURL Description text.
 * @param {String} uuid Point's UUID.
 * @param {String} index Point's position in a track.
 * 
 * @returns {Object} New description object    
 */
PointsClass.prototype.createDescription = function(audioURL, imageURL, index, radius) {
    var descObj = {};
     
    /*if (!text) {
        descObj.description = '';
    } else {
        descObj.description = text;
    }*/
           
    if (audioURL) {
        descObj.audio = audioURL;
    }
    
    if (imageURL) {
        descObj.photo = imageURL;
    }
      
    if (index) {
        descObj.idx = index;
    }
    
    if (radius) {
        descObj.radius = radius;       
    } else {
        descObj.radius = 63;
    }
    
    return descObj;
};

PointsClass.prototype.removePoint = function (callback) {
    var point = this.getPoint();
    if (point.access === 'r') {
        throw new GetsWebClientException('Points Error', 'removePoint, "point" is read only');
    }
    
    var request = {};
    
    // Check if it's point from track or from category
    if (point.hasOwnProperty('track')) {
        request.track_name = point.track;
    }
    for (var i = 0, len = point.extendedData.length; i < len; i++) {
        if (point.extendedData[i].name === 'category_id') {
            request.category_id = point.extendedData[i].value;
        }
    }
    
    request.uuid = point.uuid;
  
    var removePointRequest = $.ajax({
        url: REMOVE_POINT_ACTION,
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify(request)
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

/**
 * Vote for point 
 * 
 * @param {String} vote user's vote (positive or negative).   
 */

PointsClass.prototype.voteForPoint = function (vote, callback) {
    var point = this.getPoint();
    if (point.latitude === 0) {
        throw new GetsWebClientException('Points Error', 'voteForPoint, getPoint - no point');
    }

    var request = {};
    var coords = point.coordinates.split(',');
    request.latitude = coords[1];
    request.longitude = coords[0];
    request.altitude = coords[2];
    request.vote = vote;
  
    var voteForPointRequest = $.ajax({
        url: VOTE_FOR_POINT_ACTION,
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify(request)
    });
    
    point_uiid = point.uuid;
    voteForPointRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Points Error', 'voteForPoint, voteForPointRequest failed ' + textStatus);
    });
    
    if (($(voteForPointRequest.responseText).find('vote').text() === 'already voted') && (vote === '1')) {
       this.userVotePositive = 'already voted';
    }   
    if (($(voteForPointRequest.responseText).find('vote').text() === 'already voted') && (vote === '-1')) {
       this.userVoteNegative = 'already voted';
    }   

    if (($(voteForPointRequest.responseText).find('vote').text() === 'voted first')  && (vote === '1')) {
       this.userVotePositive = 'voted first';
    }   

    if (($(voteForPointRequest.responseText).find('vote').text() === 'voted first')  && (vote === '-1')) {
       this.userVoteNegative = 'voted first';
    }  

    if ($(voteForPointRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Points Error', ' ' + $(voteForPointRequest.responseText).find('message').text());
    }   
    
    if (callback) {
        callback();
    }
    
};

/**
 * Get user's vote for point 
 * 
 * 
 */

PointsClass.prototype.getUserVote = function () {
    var point = this.getPoint();
    if (!point) {
        throw new GetsWebClientException('Points Error', 'getUserVote, no point');
    }
    
    var request = {};
    var coords = point.coordinates.split(',');
    request.latitude = coords[1];
    request.longitude = coords[0];
    request.altitude = coords[2];
  
    var getUserVoteRequest = $.ajax({
        url: GET_USER_VOTE_ACTION,
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify(request)
    });
    
    getUserVoteRequest.fail(function(jqXHR, textStatus) {
        if (textStatus !== "User doesn't authorize") {
            throw new GetsWebClientException('Points Error', 'getUserVoteRequest failed ' + textStatus);  
        } 
    });
   
    getUserVoteRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Points Error', 'getUserVoteRequest failed ' + textStatus);
    });

    if ($(getUserVoteRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Channel Error', 'getUserVoteRequest, ' + $(getUserVoteRequest.responseText).find('message').text());
    }

        //Logger.debug(jqXHR.responseText);
        var channelTypeElement = null;
        channelTypeElement = $(getUserVoteRequest.responseText).find('type').length ? $(getUserVoteRequest.responseText).find('type').text() : '';

        var channelType = null;

    if(channelTypeElement === 'positive') {
        channelType = 1;
    }
    else if(channelTypeElement === 'negative') {
          channelType = 2;
    }
    else if(channelTypeElement === 'no vote') {
        channelType = 3;
    }
     
    this.userVote = channelType;
   
};
      
/**
 * Change user's vote for point 
 * 
 * 
 */

PointsClass.prototype.changeVoteForPoint = function (vote, callback) {
    var point = this.getPoint();
    if (!point) {
        throw new GetsWebClientException('Points Error', 'changeVoteForPoint, no point');
    }
    
    var request = {};
    var coords = point.coordinates.split(',');
    request.latitude = coords[1];
    request.longitude = coords[0];
    request.altitude = coords[2];
    request.vote = vote;
  
    var changeVoteForPointRequest = $.ajax({
        url: CHANGE_VOTE_ACTION,
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify(request)
    });
    
    changeVoteForPointRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Points Error', 'changeVoteForPoint, changeVoteForPointRequest failed ' + textStatus);
    });
    
    if (($(changeVoteForPointRequest.responseText).find('vote').text() !== null) && (vote =='1')) {
       this.userVotePositive = 'voted';
       this.userVoteNegative = null;
    }   
    if (($(changeVoteForPointRequest.responseText).find('vote').text() !== null) && (vote =='-1')) {
       this.userVoteNegative = 'voted';
       this.userVotePositive = null;
    }   
    
    if ($(changeVoteForPointRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Points Error', ' ' + $(changeVoteForPointRequest.responseText).find('message').text());
    }   
    
    if (callback) {
        callback();
    }
    
};

/**
 * Delete user's vote for point 
 * 
 * 
 */

PointsClass.prototype.deleteVoteForPoint = function (userVote, callback) {

/*
    var userVote = this.getVote();
    if (!userVote) {
        throw new GetsWebClientException('Points Error', 'deleteVoteForPoint, no userVote');
    }
*/
    var point = this.getPoint();
    if (!point) {
        throw new GetsWebClientException('Points Error', 'deleteVoteForPoint, no point');
    }
    
    var request = {};
    var coords = point.coordinates.split(',');
    request.latitude = coords[1];
    request.longitude = coords[0];
    request.altitude = coords[2];
    request.user_vote = userVote;
    
    var deleteVoteForPointRequest = $.ajax({
        url: DELETE_VOTE_ACTION,
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify(request)
    });
    
    deleteVoteForPointRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Points Error', 'deleteVoteForPoint, deleteVoteForPointRequest failed ' + textStatus);
    });
    
    if (($(deleteVoteForPointRequest.responseText).find('code').text() === '0') && (userVote === '1')) {
       this.userVotePositive = null;
    } 

    if (($(deleteVoteForPointRequest.responseText).find('code').text() === '0') && (userVote === '2')) {
       this.userVoteNegative = null;
    }    
    
    if ($(deleteVoteForPointRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Points Error', ' ' + $(deleteVoteForPointRequest.responseText).find('message').text());
    }   
    
    if (callback) {
        callback();
    }
    
};

PointsClass.prototype.findPointInPointList = function(uuid) {
    if (!uuid || !this.pointList) {
        return;
    }
    for (var i = 0, len = this.pointList.length; i < len; i++) {
        if (this.pointList[i].uuid.trim() === uuid.trim()) {
            this.point = this.pointList[i];
            return this.point;
        }
    }
};


PointsClass.prototype.setUserVoteNegative = function(status) {
        this.userVoteNegative = status;
        return this.userVoteNegative;  
};

PointsClass.prototype.setUserVotePositive = function(status) {
        this.userVotePositive = status;
        return this.userVotePositive;  
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

PointsClass.prototype.getUserVoteNegative = function() {
        return this.userVoteNegative;  
};

PointsClass.prototype.getVote = function() {
     if (!this.userVote) {
        throw new GetsWebClientException('Points Error', 'getVote, vote undefined or null');
    }
        return this.userVote;  
};

PointsClass.prototype.getUserVotePositive = function() {
        return this.userVotePositive;  
};


