/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-29          (the version of the package this class was first added to)
 */

/**
 * Constructor for class "Utils". This class is suppoused to contain all utils 
 * methods. All methods are static.
 * 
 * @constructor
 * @param {Object} windowObj window dom object of the current page.
 */
function UtilsClass(windowObj) {
    if (!windowObj.hasOwnProperty('location')) {
        throw new GetsWebClientException('Utils Error', 'UtilsClass, windowObj argument is not a window object');
    }
    this.windowObj = windowObj;
}

/**
 * Create or update existing hash parameter in the current url hash. 
 * 
 * @param {String} param Param name
 * @param {String} paramVal New param value
 */
UtilsClass.prototype.updateHashParameter = function (param, paramVal) {
    var newHash = '';
    var currentHash = this.windowObj.location.hash;
    var temp = '';
    var tempArray = [];
    if (currentHash) {
        tempArray = currentHash.split('&');
        for (var i = 0, len = tempArray.length; i < len; i++){
            if (tempArray[i].split('=')[0] !== param){
                newHash += temp + tempArray[i];
                temp = '&';
            }
        }
    }

    var rows_txt = temp + '' + param + '=' + paramVal;
    this.windowObj.location.hash = newHash + rows_txt;
};

/**
 * Upload file to a User's Google Drive storage. 
 * 
 * @param {Object} paramsObj A container for parameters.
 * @param {String} paramsObj.title A title of a file (optional).
 * @param {File} paramsObj.file A file that need to be uploaded.
 * 
 * @throws {GetsWebClientException}
 * 
 * @returns {String} url that can be used to download file.
 */
UtilsClass.prototype.uploadFile = function(paramsObj, callback) {
    if (!paramsObj.file) {
        throw new GetsWebClientException('Utils Error', 'uploadFile, paramsObj.file undefined or null');
    }

    var fileTitle = '';
    var file = paramsObj.file;

    if (!paramsObj.title) {
        fileTitle = file.name;
    } else {
        fileTitle = paramsObj.title;
    }
    
    var that = this;

    var getPostURLRequest = $.ajax({
        url: GET_UPLOAD_LINK_ACTION,
        type: 'POST',
        async: true,
        contentType: 'application/json',
        dataType: 'xml',
        data: JSON.stringify({title: fileTitle})
    });

    getPostURLRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Utils Error', 'uploadFile, getPostURLRequest failed ' + textStatus);
    });
    
    getPostURLRequest.done(function(data, textStatus, jqXHR) {
        if ($(jqXHR.responseText).find('code').text() !== '0') {
            throw new GetsWebClientException('Utils Error', 'uploadFile, ' + $(jqXHR.responseText).find('message').text());
        }
        
        var postURL = encodeURIComponent($(jqXHR.responseText).find('post_url').text());
        
        var uploadFileRequest = $.ajax({
            url: UPLOAD_FILE_ACTION + '?post_url=' + postURL,
            type: 'POST',
            async: true,
            cache: false,
            processData: false,
            contentType: false,
            data: file
        });
        
        uploadFileRequest.fail(function (jqXHR, textStatus) {
            throw new GetsWebClientException('Utils Error', 'uploadFile, uploadFileRequest failed ' + textStatus);
        });
        
        uploadFileRequest.done(function(data, textStatus, jqXHRd) {
            var downloadUrl = $(jqXHRd.responseText).find('downloadUrl').text();
            Logger.debug('downloadUrl: ' + downloadUrl);
            
            if (callback) {
                callback(that.htmlEscape(downloadUrl));
            }
        });
    });
};

/**
 * Get hash parameters as key-value array. 
 * 
 * @returns {Array} Array of hash parameters.
 */
UtilsClass.prototype.getHashVars = function() {
    var vars = [], hash;
    var hashes = this.windowObj.location.href.slice(this.windowObj.location.href.indexOf('#') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
};

/**
 * Get hash parameter value by name.
 * 
 * @param {String} name Name of a parameter.
 * 
 * @returns {String} Parameter value.
 */
UtilsClass.prototype.getHashVar = function(name) {
    return this.getHashVars()[name];
};

/**
 * Check are coordinates correct.
 * 
 * @param {Double} latitude Latitude.
 * @param {Double} longitude Longitude.
 * @param {Double} altitude Altitude.
 * 
 * @throws {GetsWebClientException}
 * 
 * @returns {Boolean} True if coordinates are correct, otherwise throws exception 
 * with message.
 */
UtilsClass.prototype.checkCoordsInput = function(latitude, longitude, altitude) {
    if (!latitude || !longitude) {
        throw new GetsWebClientException('Utils Error', 'checkCoordsInput, latitude or longitude is not defined');
    }
    
    if (!isNaN(latitude)) {
        if (latitude >= 90 || latitude <= -90) {
            throw new GetsWebClientException('Utils Error', '"Latitude" must be between -90 to 90');
        }
    } else {
        throw new GetsWebClientException('Utils Error', '"Latitude" field must be a number');
    }
    
    if (!isNaN(longitude)) {
        if (longitude >= 180 || longitude <= -180) {
            throw new GetsWebClientException('Utils Error', '"Longitude" must be between -180 to 180');
        }
    } else {
        throw new GetsWebClientException('Utils Error', '"Longitude" field must be a number');
    }
    
    if (!isNaN(altitude)) {
        if (altitude < 0) {
            throw new GetsWebClientException('Utils Error', '"Altitude" must be a positive number');
        }
    } else {
        throw new GetsWebClientException('Utils Error', '"Altitude" field must be a number');
    }
    
    return true;
};

UtilsClass.prototype.guid = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
    }
    return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
    };
};


UtilsClass.prototype.htmlEscape = function(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
};

/**
 * Create date + time combination. Main usage is creating time for 
 * add point method.
 * 
 * @returns {String} Date + time string in "dd MM yyyy HH:mm:ss.SSS" format      
 */
UtilsClass.prototype.getDateTime = function () {
    var currentDate = new Date();
    
    return '' + ('0' + currentDate.getDate()).slice(-2) + ' ' + 
            ('0' + (currentDate.getMonth() + 1)).slice(-2) + ' ' + 
            currentDate.getFullYear() + ' ' + 
            ('0' + (currentDate.getHours())).slice(-2) + ':' + 
            ('0' + (currentDate.getMinutes())).slice(-2) + ':' + 
            ('0' + (currentDate.getSeconds())).slice(-2) + '.' + 
            currentDate.getMilliseconds().toString().slice(0, 3);
};

/**
 * Clear value of the given file input element.
 * 
 * @param {Object} fileInputElement given file input DOM element.
 */
UtilsClass.prototype.resetFileInput = function(fileInputElement) {
    $(fileInputElement).wrap('<form>').closest('form').get(0).reset();
    $(fileInputElement).unwrap();
};

/*
 * Clear values of all input elements contained in the given element.
 * 
 * @param {Object} element given DOM element.
 */
UtilsClass.prototype.clearAllInputFields = function(element) {
    // clear all text input
    $(element).find('input[type!="button"][type!="file"]').val('');
    
    // clear textarea input
    $(element).find('textarea').val('');
    
    // And then clear all file input
    var self = this;
    $(element).find('input[type="file"]').each(function() {
        self.resetFileInput(this);
    });
};

/**
 * Exception constructor.
 * 
 * @constructor
 * @param {String} name Name of an error
 * @param {String} message Error message
 */
function GetsWebClientException(name, message) {
    this.name = name;
    this.message = message;
};

GetsWebClientException.prototype.toString = function () {
    return this.name + ": " + this.message;
};