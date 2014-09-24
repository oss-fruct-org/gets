/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-09-17          (the version of the package this class was first added to)
 */

/**
 * Constructor for view "HeaderView".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} header header dom object.
 */
function HeaderView(document, header) {
    this.document = document;
    this.header = header;
}

HeaderView.prototype.changeOption = function(text, gliph, href) {
    var headerOption = $(this.header).find('.navbar-option');
    var html = '';
    $(headerOption).empty().trigger('blur');// 
    
    if (href) {
        $(headerOption).attr('href', href);
    } 
    
    if (gliph) {
        html += '<span class="glyphicon ' + gliph + '"></span> ' + text;
    } else {
        html += text;
    }
    $(headerOption).html(html);
};

HeaderView.prototype.clearOption = function() {
    $(this.header).find('.navbar-option').removeAttr('href').empty().trigger('blur');
};
