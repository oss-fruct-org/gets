/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-08-30          (the version of the package this class was first added to)
 */

/**
 * Constructor for class "Categories". This class is suppoused to contain all categories 
 * data and methods to operate on it.
 * 
 * @constructor
 */
function CategoriesClass() {
    this.categories = null;
};

/**
 * Check whether categories are downloaded or not.
 */
CategoriesClass.prototype.isCategoriesDownloaded = function () {
    return !!this.categories;
};

/**
 * Check is categories need to be downloaded.
 */
CategoriesClass.prototype.checkCategories = function () {
    if (!this.isCategoriesDownloaded()) {
        this.downloadCategories();
    }
};

/**
 * Download list of categories from the GeTS Server. 
 */
CategoriesClass.prototype.downloadCategories = function () {
    $.support.cors = true; // IE8 compatability
    var getCategoriesRequest = $.ajax({
        url: GET_CATEGORIES_ACTION,
        type: 'POST',
        async: false, 
        contentType: 'application/json', 
        dataType: 'xml', 
        data: ''
    });
       
    getCategoriesRequest.fail(function( jqXHR, textStatus ) {
	Logger.debug('CategoriesClass.downloadCategories(): fail=' + 'getCategoriesAsArray, getCategoriesRequest failed ' + textStatus);
        throw new GetsWebClientException('Categories Error', 'getCategoriesAsArray, getCategoriesRequest failed ' + textStatus);
    });
      
    if ($($.parseXML(getCategoriesRequest.responseText)).find('code').text() !== '0') {
	Logger.debug('CategoriesClass.downloadCategories(): fail=' + $($.parseXML(getCategoriesRequest.responseText)).find('code').text());
        throw new GetsWebClientException('Categories Error', 'getCategoriesAsArray, ' + $(getCategoriesRequest.responseText).find('message').text());
    }

    var categoryElementList = $($.parseXML(getCategoriesRequest.responseText)).find('category');
    var categoriesArray = [];
    $(categoryElementList).each(function (index, value) {
        var categoryObj = {};
        categoryObj.id = $(value).find('id').length ? $(value).find('id').text() : '';
        categoryObj.names = $(value).find('name').length ? parseVals($(value).find('name').text()) : '';
        categoryObj.description = $(value).find('description').length ? parseVals($(value).find('description').text()) : '';
        categoryObj.url = $(value).find('url').length ? parseVals($(value).find('url').text()) : '';
        if (typeof(categoryObj.names) === 'object') {
    	    var langID = lang.substr(lang.indexOf("lang=") + 5,2);
    	    if (categoryObj.names.hasOwnProperty("name_" + langID)) {
    		categoryObj.name = categoryObj.names["name_" + langID];
    	    } else {
    		categoryObj.name = categoryObj.names.name;
    	    }
        } else {
    	    categoryObj.name = categoryObj.names;
        }

        categoriesArray.push(categoryObj);
    });

    this.categories = categoriesArray;
};

function parseVals(stringValue) {
    try {
	return JSON.parse(stringValue);
    } catch (e) {
	return stringValue;
    }
}

/**
 * Getters
 */
CategoriesClass.prototype.getCategories = function () {
    this.checkCategories();
    return this.categories;
};



CategoriesClass.prototype.getCategory = function (id) {
    this.checkCategories();
    for (var i = 0; i < this.categories.length; i++) {
	if (this.categories[i].id === id) {
	    return this.categories[i];
	}
    }
};
