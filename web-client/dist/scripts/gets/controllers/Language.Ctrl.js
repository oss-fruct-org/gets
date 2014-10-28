(function () {
    if (!window.jQuery) {
        // jQuery is not loaded 
        return;
    } 
    
    $(document).on('click', '.lang-button', function (e) {
        e.preventDefault();
        if ($.cookie('lang') === $(e.target).attr('lang')) {
            return;
        } 
        
        $.removeCookie('lang');
        $.cookie('lang', $(e.target).attr('lang'), { expires: 3650, path: '/' });     
        window.location.replace(location.protocol + '//' + location.host + location.pathname + '?lang=' + $.cookie('lang'));
    });
})();


