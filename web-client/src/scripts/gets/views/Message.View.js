/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-09-07          (the version of the package this class was first added to)
 */

/**
 * Message view.
 * 
 * @constructor
 * @param {Object} mainContainer DOM Element.
 */
function MessageView(mainContainer) {
    this.mainContainer = mainContainer;
}

// Message types
MessageView.prototype.INFO_MESSAGE = 0;
MessageView.prototype.SUCCESS_MESSAGE = 1;
MessageView.prototype.ERROR_MESSAGE = 2;
MessageView.prototype.WARNING_MESSAGE = 3;

MessageView.prototype.showMessage = function(text, type) {
    // If message already exists, remove it
    var oldMessageBox = $(document).find('.message-box');
    if ($(oldMessageBox).length) {
        $(oldMessageBox).remove();
    }
    
    var messageBox = $(document.createElement('div'));
    
    $(messageBox).addClass('message-box alert alert-dismissible');
    $(messageBox).attr('role', 'alert');
       
    switch (type) {
        case this.INFO_MESSAGE:
            $(messageBox).addClass('alert-info');
            break;
        case this.SUCCESS_MESSAGE:
            $(messageBox).addClass('alert-success');
            break;
        case this.ERROR_MESSAGE:
            $(messageBox).addClass('alert-danger');
            break;
        case this.WARNING_MESSAGE:
            $(messageBox).addClass('alert-warning');
            break;
    }
    
    $(messageBox).html('<button type="button" class="close" data-dismiss="alert">\n\
                            <span aria-hidden="true">&times;</span>\n\
                        </button>' + text);
  
    $(messageBox).appendTo(this.mainContainer);
    // Fire message
    $(messageBox).alert();
};

