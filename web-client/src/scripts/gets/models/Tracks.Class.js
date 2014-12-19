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
 * @param {Object} paramsObj A container for parameters.
 * @param {String} paramsObj.categoryName Filter tracks by category.
 * @param {Function} callback Callback function on download complete.
 * 
 * @throws {GetsWebClientException}
 */
TracksClass.prototype.downloadTrackList = function (paramsObj, callback) {
    if (!paramsObj) {
        Logger.debug('downloadTrackList paramsObj is undefined or null');
    }

    var params = paramsObj || {};
    var tracksArray = [];

    var getTrackList = $.ajax({
        url: GET_TRACKS_ACTION,
        type: 'POST',
        async: true,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify(params)
    });

    getTrackList.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Tracks Error', 'getTrackList failed ' + textStatus);
    });

    var self = this;
    getTrackList.done(function(data, textStatus, jqXHR) {
        if ($(jqXHR.responseText).find('code').text() !== '0') {
            throw new GetsWebClientException('Tracks Error', 'getTrackList: ' + $(jqXHR.responseText).find('message').text());
        }
        
        var xml = $.parseXML(jqXHR.responseText);
        var trackListItems = $(xml).find('track');
        $(trackListItems).each(function(index, value) {
            //Logger.debug(value);
            var trackObj = {};
            trackObj.name = $(value).find('name').length ? $(value).find('name').text() : '';
            trackObj.hname = $(value).find('hname').length ? $(value).find('hname').text() : '';
            trackObj.description = $(value).find('description').length ? $(value).find('description').text() : '';
            trackObj.access = $(value).find('access').length ? $(value).find('access').text() : '';
            trackObj.categoryId = $(value).find('category_id').length ? $(value).find('category_id').text() : '';
            trackObj.published = $(value).find('published').length ? $(value).find('published').text() : false;

            tracksArray.push(trackObj);
        });

        tracksArray.sort(self.sortTracksAlphabetically);
        //Logger.debug(tracksArray);
        self.trackList = tracksArray;
        
        if (callback) {
            callback();
        }
    });
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
        url: GET_TRACK_BY_NAME_ACTION,
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: requestString
    });

    //Logger.debug(getTrackRequest.responseText);

    getTrackRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Tracks Error', 'getTrackAsObject, getTrackRequest failed ' + textStatus);
    });

    if ($(getTrackRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Tracks Error', 'getTrackAsObject, ' + $(getTrackRequest.responseText).find('message').text());
    }

    var trackPlacemarkList = $(getTrackRequest.responseText).find('Placemark');
    var trackPointArray = new Array();
    //Logger.debug(trackPlacemarkList);
    $(trackPlacemarkList).each(function(index, value) {
        //Logger.debug(value);
        var pointObj = {};
        var pointExtendedData = [];
        
        pointObj.index = $(value).find("[name='idx']").length ? $(value).find("[name='idx']").text() : '';
        pointObj.uuid = $(value).find("[name='uuid']").length ? $(value).find("[name='uuid']").text() : '';
        pointObj.name = $(value).find('name').length ? $(value).find('name').text() : '';
        pointObj.description = $(value).find("[name='description']").length ? $(value).find("[name='description']").text() : '';
        pointObj.url = $(value).find("[name='link']").length ? $(value).find("[name='link']").text() : '';
        pointObj.audio = $(value).find("[name='audio']").length ? $(value).find("[name='audio']").text() : '';
        pointObj.photo = $(value).find("[name='photo']").length ? $(value).find("[name='photo']").text() : '';
        pointObj.radius = $(value).find("[name='radius']").length ? $(value).find("[name='radius']").text() : '';
        pointObj.coordinates = $(value).find('coordinates').length ? $(value).find('coordinates').text() : '';
        
        $(value).find('Data').each(function (index, newValue) {
            pointExtendedData.push({name: $(newValue).attr('name'), value: $(newValue).text()});
        });
        pointObj.extendedData = pointExtendedData;

        trackPointArray.push(pointObj);
    });

    $(this.trackList).each(function(index, value) {
        if (value.name === paramsObj.name) {
            newtrack.hname = value.hname;
            newtrack.description = value.description;
            newtrack.access = value.access;
            newtrack.categoryId = value.categoryId;
            newtrack.published = value.published;
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
 * @param {callback} callback Callback on add track complete.
 * 
 * @throws {GetsWebClientException}
 */
TracksClass.prototype.addTrack = function (paramsObj, callback) {
    if (!paramsObj) {
        throw new GetsWebClientException('Tracks Error', 'addTrack, paramsObj undefined or null');
    }
    var hname, desc, url, lang, categoryId, update, userName;

    $(paramsObj).each(function(index, value) {
        if (value.name === 'hname') {
            hname = value.value;
        } else if (value.name === 'description') {
            desc = value.value;
        } else if (value.name === 'url') {
            url = value.value;
        } else if (value.name === 'category_id') {
            categoryId = value.value;
        } else if (value.name === 'lang') {
            lang = value.value;
        } else if (value.name === 'update') {
            update = value.value;
        } else if (value.name === 'user_name') {
            userName = value.value;
        }
    });
    
    //name = 'tr+' + userName + '+' + hname.toLowerCase().replace(/\+/g, '%2B') + '+' + lang;
    
    // Create single object from an array of objects
    var newParamsObj = {};
    newParamsObj.name = hname;
    //newParamsObj.hname = hname;
    newParamsObj.description = desc;
    newParamsObj.url = url;
    newParamsObj.category_id = categoryId;
    newParamsObj.lang = lang;
    newParamsObj.update = update;

    var addTrackRequest = $.ajax({
        url: ADD_TRACK_ACTION,
        type: 'POST',
        async: true,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify(newParamsObj)
    });

    addTrackRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Tracks Error', 'addTrack, addTrackRequest failed ' + textStatus);
    });
    
    addTrackRequest.done(function(data, textStatus, jqXHR) {
        if ($(jqXHR.responseText).find('code').text() !== '0') {
            throw new GetsWebClientException('Tracks Error', 'addTrack, ' + $(jqXHR.responseText).find('message').text());
        }
        
        if (callback) {
            callback(hname);
        }
    });
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
        url: REMOVE_TRACK_ACTION,
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
 * @param {String} pointUUID The UUID of a point.
 * @returns {Object} The first point with matched uuid, or null if there 
 * is no point with given uuid.
 */
TracksClass.prototype.findPoint = function(pointUUID) {
    if (!this.isTrackDownloaded()) {
        throw new GetsWebClientException('Tracks Error', 'findPoint, track is not loaded');
    }
    
    var track = this.track;
    var point = null;   
    $(track.points).each(function (index, value) {
        if (pointUUID.trim() === value.uuid.trim()) {
            point = value;
            point.access = track.access;
            point.track = track.name;
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

TracksClass.prototype.publishTrack = function () {
    if (!this.track) {
        throw new GetsWebClientException('Tracks Error', 'publishTrack, there is no track to publish');
    }
    
    var publishTrackRequest = $.ajax({
        url: PUBLISH_ACTION,
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify({track_name: this.track.name})
    });
    
    publishTrackRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Tracks Error', 'publishTrack, publishTrackRequest failed ' + textStatus);
    });

    if ($(publishTrackRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Tracks Error', 'publishTrack, ' + $(publishTrackRequest.responseText).find('message').text());
    }
};

TracksClass.prototype.unPublishTrack = function () {
    if (!this.track) {
        throw new GetsWebClientException('Tracks Error', 'unPublishTrack, there is no track to unpublish');
    }
    
    var unPublishTrackRequest = $.ajax({
        url: UNPUBLISH_ACTION,
        type: 'POST',
        async: false,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify({track_name: this.track.name})
    });
    
    unPublishTrackRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Tracks Error', 'unPublishTrack, unPublishTrackRequest failed ' + textStatus);
    });

    if ($(unPublishTrackRequest.responseText).find('code').text() !== '0') {
        throw new GetsWebClientException('Tracks Error', 'unPublishTrack, ' + $(unPublishTrackRequest.responseText).find('message').text());
    }
};









