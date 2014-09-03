/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-29          (the version of the package this class was first added to)
 */

/**
 * Constructor for class "Tracks". This class is suppoused to contain all tracks 
 * data and methods to operate on it.
 * 
 * @constructor
 */
function TracksClass() {
    this.trackList = null;
    this.track = null;
    this.needTrackListUpdate = false;
    this.needTrackUpdate = false;
};

// Codes for languages
TracksClass.ru_RU = 'ru_RU';
TracksClass.en_US = 'en_US';

/**
 * Callback function for Array.sort() method. Allow to sort array of tracks 
 * alphabetically.
 * 
 * @param {Object} a Track object
 * @param {Object} b Track object
 */
TracksClass.prototype.sortTracksAlphabetically = function (a, b) {
    var A = a.hname.toLowerCase();
    var B = b.hname.toLowerCase();
    if (A < B) {
        return -1;
    } else if (A > B) {
        return  1;
    } else {
        return 0;
    }
};

/**
 * Check whether trackList is downloaded or not.
 */
TracksClass.prototype.isTrackListDownloaded = function () {
    return !!this.trackList;
};

/**
 * Check whether track is downloaded or not.
 */
TracksClass.prototype.isTrackDownloaded = function () {
    return !!this.track;
};

/**
 * Check is trackList need to be downloaded.
 */
TracksClass.prototype.checkTrackList = function () {
    if (!this.isTrackListDownloaded() || this.needTrackListUpdate) {
        this.downloadTrackList();
    }
};

/**
 * Check is track need to be downloaded.
 * 
 * @param {String} name Name of a track
 */
TracksClass.prototype.checkTrack = function (name) {
    if (!this.isTrackDownloaded() || this.needTrackUpdate) {
        this.downloadTrackByName({name: name});
    }
};

/**
 * Downloads track list from the GeTS Server and saves it as an array in 
 * internal variable "trackList". 
 * 
 * @param {Object} paramsObj A container for parameters
 * @param {String} paramsObj.categoryName Filter tracks by category
 * 
 * @throws {GetsWebClientException}
 */
TracksClass.prototype.downloadTrackList = function (paramsObj) {
    if (!paramsObj) {
        Logger.debug('downloadTrackList paramsObj is undefined or null');
    }

    var params = paramsObj || {};

    var tracksArray = [];
    var requestString = JSON.stringify(params);

    var getTrackList = $.ajax({
        url: 'actions/getTracks.php',
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: requestString
    });

    Logger.debug(getTrackList.responseText);

    getTrackList.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Tracks Error', 'getTrackList failed ' + textStatus);
    });

    if ($(getTrackList.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Tracks Error', 'getTrackList: ' + $(getTrackList.responseText).find('message').text());
    }

    var trackListItems = $($.parseXML(getTrackList.responseText)).find('track');
    $.each(trackListItems, function(index, value) {
        var trackObj = {};
        trackObj.name = $(value).find('name').length ? $(value).find('name').text() : '';
        trackObj.hname = $(value).find('hname').length ? $(value).find('hname').text() : '';
        trackObj.description = $(value).find('description').length ? $(value).find('description').text() : '';
        trackObj.access = $(value).find('access').length ? $(value).find('access').text() : '';
        trackObj.categoryId = $(value).find('category_id').length ? $(value).find('category_id').text() : '';

        tracksArray.push(trackObj);
    });

    tracksArray.sort(this.sortTracksAlphabetically);
    Logger.debug(tracksArray);
    this.trackList = tracksArray;
};

/**
 * Downloads track from the GeTS Server by name and saves it in internal variable 
 * "track". 
 * 
 * @param {Object} paramsObj A container for parameters
 * @param {String} paramsObj.name Name of a track
 * 
 * @throws {GetsWebClientException}
 */
TracksClass.prototype.downloadTrackByName = function(paramsObj) {
    if (!paramsObj.name) {
        throw new GetsWebClientException('Tracks Error', 'downloadTrackByName, paramsObj.name undefined or null');
    }

    var newtrack = {};
    var requestString = JSON.stringify(paramsObj);

    var getTrackRequest = $.ajax({
        url: 'actions/getTrackByName.php',
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: requestString
    });

    Logger.debug(getTrackRequest.responseText);

    getTrackRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Tracks Error', 'getTrackAsObject, getTrackRequest failed ' + textStatus);
    });

    if ($(getTrackRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Tracks Error', 'getTrackAsObject, ' + $(getTrackRequest.responseText).find('message').text());
    }

    var trackPlacemarkList = $(getTrackRequest.responseText).find('Placemark');
    var trackPointArray = new Array();
    $.each(trackPlacemarkList, function(index, value) {
        Logger.debug(value);
        var pointObj = {};
        pointObj.index = $(value).find("[name='idx']").length ? $(value).find("[name='idx']").text() : '';
        pointObj.uuid = $(value).find("[name='uuid']").length ? $(value).find("[name='uuid']").text() : '';
        pointObj.name = $(value).find('name').length ? $(value).find('name').text() : '';
        pointObj.description = $(value).find('description').length ? $(value).find('description').text() : '';
        pointObj.url = $(value).find("[name='url']").length ? $(value).find("[name='url']").text() : 'undefined';
        pointObj.descriptionExt = $(value).find("[name='description']").length ? $(value).find("[name='description']").text() : '';
        pointObj.audio = $(value).find("[name='audio']").length ? $(value).find("[name='audio']").text() : '';
        pointObj.photo = $(value).find("[name='photo']").length ? $(value).find("[name='photo']").text() : '';
        pointObj.coordinates = $(value).find('coordinates').length ? $(value).find('coordinates').text() : '';

        trackPointArray.push(pointObj);
    });

    $.each(this.trackList, function(index, value) {
        if (value.name === paramsObj.name) {
            newtrack.hname = value.hname;
            newtrack.description = value.description;
            newtrack.access = value.access;
            newtrack.categoryId = value.categoryId;
            return false;
        }
    });

    newtrack.name = paramsObj.name;
    newtrack.points = trackPointArray;

    Logger.debug(newtrack);
    this.track = newtrack;
};

/**
 * Upload track to the GeTS Server. 
 * 
 * @param {Object} paramsObj An array of objects in format {name: "someName", value: "someValue"}
 * @param {String} paramsObj[i].name = "name" Name of a track (value stored in paramsObj[i].value)
 * @param {String} paramsObj[i].name = "description" Description of a track (value stored in paramsObj[i].value)
 * @param {String} paramsObj[i].name = "url" Link of a track (value stored in paramsObj[i].value)
 * @param {String} paramsObj[i].name = "lang" Language of a track (value stored in paramsObj[i].value)
 * @param {String} paramsObj[i].name = "update" If existing track need to be updated (optional) (value stored in paramsObj[i].value)
 * 
 * @throws {GetsWebClientException}
 */
TracksClass.prototype.addTrack = function (paramsObj) {
    if (!paramsObj) {
        throw new GetsWebClientException('Tracks Error', 'addTrack, paramsObj undefined or null');
    }

    // Create track name in GeTS format (tr_track_name)
    var track_name;
    for (var i = 0, len = paramsObj.length; i < len; i++) {
        if (paramsObj[i].name === 'hname') {
            track_name = 'tr_' + paramsObj[i].value.toLowerCase().replace(/\s/g, '_');
            break;
        }
    }
    paramsObj.unshift({name: 'name', value: track_name});
    //if (paramsObj.update) {
    //    paramsObj.push({name: 'update', value: 'true'});
    //}

    // Create single object from an array of objects
    var newParamsObj = {};
    $.each(paramsObj, function(index, value) {
        if (value.name === 'name') {
            newParamsObj.name = value.value;
        } else if (value.name === 'hname') {
            newParamsObj.hname = value.value;
        } else if (value.name === 'description') {
            newParamsObj.description = value.value;
        } else if (value.name === 'url') {
            newParamsObj.url = value.value;
        } else if (value.name === 'category_id') {
            newParamsObj.category_id = value.value;
        } else if (value.name === 'lang') {
            newParamsObj.lang = value.value;
        } else if (value.name === 'update') {
            newParamsObj.update = value.value;
        }
    });

    var requestString = JSON.stringify(newParamsObj);

    var addTrackRequest = $.ajax({
        url: 'actions/addTrack.php',
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: requestString
    });

    Logger.debug(addTrackRequest.responseText);

    addTrackRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Tracks Error', 'addTrack, addTrackRequest failed ' + textStatus);
    });

    if ($(addTrackRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Tracks Error', 'addTrack, ' + $(addTrackRequest.responseText).find('message').text());
    }
};

/**
 * Remove track that stored in internal variable "track" from the GeTS Server. 
 * 
 * @throws {GetsWebClientException}
 */
TracksClass.prototype.removeTrack = function() {
    if (!this.track) {
        throw new GetsWebClientException('Tracks Error', 'removeTrack, "track" undefined or null');
    }
    if (this.track.access === 'r') {
        throw new GetsWebClientException('Tracks Error', 'removeTrack, "track" is read only');
    }

    var removeTrackRequest = $.ajax({
        url: 'actions/removeTrack.php',
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify({name: this.track.name})
    });

    removeTrackRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Tracks Error', 'removeTrack, removeTrackRequest failed ' + textStatus);
    });

    if ($(removeTrackRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Tracks Error', 'removeTrack, ' + $(removeTrackRequest.responseText).find('message').text());
    }
};

/**
 * Find point in a track which is stored in internal variable "track".
 * 
 * @param {String} pointName The name of a point.
 * @returns {Object} The first point with matched name, or null if there 
 * is no point with given name.
 */
TracksClass.prototype.findPoint = function(pointName) {
    if (!this.isTrackDownloaded()) {
        throw new GetsWebClientException('Tracks Error', 'findPoint, track is not loaded');
    }
    
    var track = this.track;
    var point = null;   
    $(track.points).each(function (index, value) {
        if (pointName.toLowerCase() === value.name.toLowerCase()) {
            point = value;
            point.access = track.access;
            return false;
        }
    });
    Logger.debug(point);
    return point;
};

/**
 * Getters
 */
TracksClass.prototype.getTrackList = function (needTrackListUpdate) {
    this.needTrackListUpdate = needTrackListUpdate;
    this.checkTrackList();
    return this.trackList;
    
};

TracksClass.prototype.getTrack = function (name, needTrackUpdate) {
    this.needTrackUpdate = needTrackUpdate;
    this.checkTrack(name);
    return this.track;  
};

/**
 * Setters
 */
TracksClass.prototype.setNeedTrackListUpdate = function (needTrackListUpdate) {
    if (this.needTrackListUpdate !== needTrackListUpdate) {
        this.needTrackListUpdate = needTrackListUpdate;
    }
};

TracksClass.prototype.setNeedTrackUpdate = function (needTrackUpdate) {
    if (this.needTrackUpdate !== needTrackUpdate) {
        this.needTrackUpdate = needTrackUpdate;
    }
};









