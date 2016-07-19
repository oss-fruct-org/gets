
function SocialsMain(document, mainSocials) {
    this.document = document;
    this.mainSocials = mainSocials;
}

SocialsMain.prototype.initView = function(isAuth) {
    if (!isAuth) {
        $(this.mainSocials).find('#socials-main-add-social').addClass('disabled').on('click', function(e) {
            e.preventDefault();
        });
    }
};

/**
 * Place socials data into social list HTML object.
 *
 * @constructor
 * @param {Array} socialList Array which contains socials.
 *
 * @throws {GetsWebClientException}
 */
SocialsMain.prototype.placeSocialsInSocialList = function (socialList) {
    var socialListElement = $(this.mainSocials).find( '#social-list' );
    $( socialListElement ).empty();

    if (!socialListElement || !socialListElement.length) {
        throw new GetsWebClientException('SocialsMain View Error', 'placeSocialsInSocialList, socialListElement undefined or null');
    }

    if (!socialList) {
        throw new GetsWebClientException('SocialsMain View Error', 'placeSocialsInSocialList, socialList undefined or null');
    }

    var socialListHTML = '';
    for (var i = 0, len = socialList.length; i < len; i++) {
        socialListHTML += '<li class="list-group-item"><a href="#form=social_info&social_uuid=' + socialList[i].uuid + '">' + socialList[i].title + '</a></li>';
    }
    $(socialListElement).html(socialListHTML);
};
SocialsMain.prototype.placeScopesInScopeList = function (scopeList) {
    var scopeListElement = $(this.mainSocials).find( '#scopes-list' );
    $( scopeListElement ).empty();

    if (!scopeListElement || !scopeListElement.length) {
        throw new GetsWebClientException('SocialsMain View Error', 'placeScopeListElement, scopeListElement undefined or null');
    }

    if (!scopeList) {
        throw new GetsWebClientException('SocialsMain View Error', 'placeScopeListElement, scopeList undefined or null');
    }
    var scopeListHTML = 'Сферы деятельности';
    for (var i = 0, len = scopeList.length; i < len; i++) {
        scopeListHTML += '<div class="checkbox"><label><input checked="true" type="checkbox" class="scope" id=' + scopeList[i].id + '>' + scopeList[i].name + '</label></div>';
    }
    scopeListHTML += '<br>';
    $(scopeListElement).html(scopeListHTML);
};
/**
 * Place categories into track mainSocials HTML object.
 *
 * @param {Array} categories Array which contains categories.
 *
 * @throws {GetsWebClientException}
 */
SocialsMain.prototype.placeCategoriesInSocialMain = function (categories) {
    var mainSocialsCategories = $(this.mainSocials).find('#socials-main-filter-category');
    $(mainSocialsCategories).empty();

    // Add 'none' category with value -1
    $(this.document.createElement('option'))
        .attr('value', -1)
        .text('None')
        .appendTo(mainSocialsCategories);

    var self = this;
    $(categories).each(function(index, value) {
        var categoryItem = $(self.document.createElement('option'));
        $(categoryItem).attr('value', value.id);
        $(categoryItem).text(value.name);
        $(categoryItem).appendTo(mainSocialsCategories);
    });
};

/**
 * Show view
 */
SocialsMain.prototype.showView = function() {
    $(this.mainSocials).removeClass('hidden').addClass('show');
};

/**
 * Hide view
 */
SocialsMain.prototype.hideView = function() {
    $(this.mainSocials).removeClass('show').addClass('hidden');
};

SocialsMain.prototype.getLatitude = function() {
    return $(this.mainSocials).find('#socials-main-latitude-input').val();
};

SocialsMain.prototype.getLongitude = function() {
    return $(this.mainSocials).find('#socials-main-longitude-input').val();
};

SocialsMain.prototype.getRadius = function() {
    return $(this.mainSocials).find('#socials-main-radius-input').val();
};

SocialsMain.prototype.setLatitude = function(latitude) {
    $(this.mainSocials).find('#socials-main-latitude-input').val(latitude);
};

SocialsMain.prototype.setLongitude = function(longitude) {
    $(this.mainSocials).find('#socials-main-longitude-input').val(longitude);
};

SocialsMain.prototype.setRadius = function(radius) {
    $(this.mainSocials).find('#socials-main-radius-input').val(radius);
};

/**
 * Toggle overlay
 */
SocialsMain.prototype.toggleOverlay = function() {
    $(this.mainSocials).find('#socials-main-overlay').toggleClass('busy-overlay-visible');
};

/**
 * Add overlay
 */
SocialsMain.prototype.showOverlay = function() {
    $(this.mainSocials).find('#socials-main-overlay').addClass('busy-overlay-visible');
};

/**
 * Remove overlay
 */
SocialsMain.prototype.hideOverlay = function() {
    $(this.mainSocials).find('#socials-main-overlay').removeClass('busy-overlay-visible');
};

