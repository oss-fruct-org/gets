
function SocialInfo(document, socialInfo) {
    this.document = document;
    this.socialInfo = socialInfo;
}
/**
 * Place social info on socialInfo HTML DOM Object.
 *
 * @param {Object} social Object contains social info.
 * @param {Boolean} isAuth Variable indicates is user authorized.
 */
SocialInfo.prototype.placeSocialInSocialInfo = function(social, categoryId) {
    // Get all elements
    var nameElement = $(this.socialInfo).find('#social-info-name');
    var objectNameElement = $(this.socialInfo).find('#social-info-objectName');
    var routeElement = $(this.socialInfo).find('#social-info-route');
    var addressElement = $(this.socialInfo).find('#social-info-address');
    var accessElement = $(this.socialInfo).find('#social-info-access');
    //$(pointsInfoEdit).attr('href', '#form=social_info'  + "&social_uuid" + social.uuid + "#focus");

    // Clear value of all elements
    $(nameElement).text('');
    $(objectNameElement).text('');
    $(routeElement).text('');
    $(addressElement).text('');
    $(accessElement).text('');

    // Then fill elemnts with new values
    if (social.title != null && social.title != '')
        $(nameElement).text(social.title).attr('title', social.title);
    if (social.objectName != null && social.objectName != '')
        $(objectNameElement).text(social.objectName);
    if (social.address != null && social.address != '')
        $(addressElement).text(social.address);
    if (social.route != null && social.route != '')
        $(routeElement).append("Как добраться: " + social.route);
    if (social.access != null)
        $(accessElement).append(getAccessString(social.access, categoryId));
};

SocialInfo.prototype.getView = function() {
    return this.socialInfo;
};

/**
 * Show view
 */
SocialInfo.prototype.showView = function() {
    $(this.socialInfo).removeClass('hidden').addClass('show');
};

/**
 * Hide view
 */
SocialInfo.prototype.hideView = function() {
    $(this.socialInfo).removeClass('show').addClass('hidden');
};

SocialInfo.prototype.nextImage = function() {
    var photoElement = $(this.socialInfo).find('#social-info-image');
    this.photoIndex = (this.photoIndex < this.photos.length - 1) ? this.photoIndex + 1 : 0;
    $(photoElement).find('a').attr('href', this.photos[this.photoIndex]);
    $(photoElement).find('img').attr('src', this.photos[this.photoIndex]);
};

SocialInfo.prototype.prevImage = function() {
    var photoElement = $(this.socialInfo).find('#social-info-image');
    this.photoIndex = (this.photoIndex > 0) ? this.photoIndex - 1 : this.photos.length - 1;
    $(photoElement).find('a').attr('href', this.photos[this.photoIndex]);
    $(photoElement).find('img').attr('src', this.photos[this.photoIndex]);
};



