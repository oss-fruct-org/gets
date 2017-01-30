function RoutesPage(document, window) {
    this.document = document;
    this.window = window;

    // Models
    this._socials = null;
    this._points = null;
    this._categories = null;
    this._user = null;
    this._utils = null;
    this._routes = null;
    this._mapCtrl = null;

    // Views
    this._socialsMain = null;
    this._headerView = null;
    this._socialInfo = null;
    this._routeInfo = null;
    this._pointsMain = null;

    this.currentView = null;
}

// Forms
RoutesPage.MAIN = 'main';
RoutesPage.SOCIAL_INFO = 'social_info';
RoutesPage.ROUTE_INFO = 'route_info';
RoutesPage.ADD_ROUTE = 'add_route';
RoutesPage.POINT_INFO = 'route_info';

RoutesPage.prototype.changeForm = function () {
    var form = this._utils.getHashVar('form');
    Logger.debug('changeForm form = ' + form);
    if (form === RoutesPage.MAIN) {
        this.showSocialsMain();
    } else if (form === RoutesPage.SOCIAL_INFO) {
        $("#social-all-access").html("Показать все категории");
        this.showSocialInfo();
    } else if (form === RoutesPage.ADD_ROUTE) {
        this.addRouteFromMap();
    } else if (form === RoutesPage.ROUTE_INFO) {
        this.showRouteInfo();
    } else if (typeof form === 'undefined') {
        this.window.location.replace('#form=' + RoutesPage.MAIN);
    }
};

RoutesPage.prototype.initPage = function () {
    var self = this;

    if(this._routes == null)
    {
        this._routes = [];
    }
    // Init map
    if (this._mapCtrl == null) {
        this._mapCtrl = new MapController(this.document, this.window);
        this._mapCtrl.initMap();
    }

    // Init models
    if (!this._points) {
        this._points = new PointsClass();
    }
    if (!this._categories) {
        this._categories = [];
    }
    if (!this._socials) {
        this._socials = new SocialsClass();
    }
    if (!this._user) {
        this._user = new UserClass(this.window);
        this._user.fetchAuthorizationStatus();
        Logger.debug('is Auth: ' + this._user.isLoggedIn());
    }
    if (!this._utils) {
        this._utils = new UtilsClass(this.window);
    }

    // Init views
    if (!this._socialsMain) {
        this._socialsMain = new SocialsMain(this.document, $(this.document).find('#socials-main-page'));
    }
    if (!this._headerView) {
        this._headerView = new HeaderView(this.document, $(this.document).find('.navbar'));
    }
    if (!this._pointsMain) {
        this._pointsMain = new PointsMain(this.document, $(this.document).find('#points-main-page'));
        this._pointsMain.initView(this._user.isLoggedIn());
    }

    if (!this._socialInfo) {
        this._socialInfo = new SocialInfo(this.document, $(this.document).find('#social-info-page'));
    }
    if (!this._routeInfo) {
        this._routeInfo = new RouteInfo(this.document, $(this.document).find('#route-info-page'));
    }

    //Init first page
    this.currentView = this._socialsMain;
    this.changeForm();

    // Init Socials main
    this._socialsMain.toggleOverlay();
    this._socialsMain.setLatitude(this._mapCtrl.getMapCenter().lat);
    this._socialsMain.setLongitude(this._mapCtrl.getMapCenter().lng);


    // Hash change handler
    $(this.window).on('hashchange', function () {
        Logger.debug('hashchanged');
        self.changeForm();
    });

    // Sign in handler
    $(this.document).on('click', '#sign-in-btn', function (e) {
        e.preventDefault();
        self._user.authorizeGoogle();
    });

    // Sign out handler
    $(this.document).on('click', '#sign-out-btn', function (e) {
        e.preventDefault();
        self._user.logout();
    });

    $(this.document).on('click', '#social-map-focus', function(e) {
        e.preventDefault();
        self._mapCtrl.setMapCenterOnSocial(self._socials.social.uuid);
    });

    $(this.document).on('click', '.disabilitiesSelect', function(e) {
        var states = [];
        $(".scope").each(function () {
            $(this).prop('checked') ? states[$(this).prop('id')] = true :
                states[$(this).prop('id')] = false;
        });
        if(self._routes.length != 0) {
            var from = self._routes[0].getRouteBegin();
            var to = self._routes[0].getRouteEnd();
            self.route(from['lat'],from['lng'],to['lat'],to['lng']);
        }
        self._mapCtrl.placeFilteredSocialsOnMap(returnCategory(), states);
    });

    $(this.document).on('click', '.scope', function(e) {
        var states = [];
        $(".scope").each(function () {
            $(this).prop('checked') ? states[$(this).prop('id')] = true :
                states[$(this).prop('id')] = false;
        });
        self._mapCtrl.placeFilteredSocialsOnMap(returnCategory(), states);
    });


    $(this.document).on('click', '#social-all-access', function(e) {
        e.preventDefault();
        if ($(".invisibleAccessibility").css("display") == "none")
        {
            $(".invisibleAccessibility").css("display", "block");
            $("#social-all-access").html("Скрыть невыбранные категории");
        }
        else
        {
            $(".invisibleAccessibility").css("display", "none");
            $("#social-all-access").html("Показать все категории");
        }
    });

    this.downloadSocialsHandler();
    this.getCategories();
    // this.downloadPointsHandler();
    // get user's coordinates
    if (this.window.navigator.geolocation) {
        this.window.navigator.geolocation.getCurrentPosition(function (position) {
            Logger.debug(position);
            self._user.setUserGeoPosition(position);
            self._mapCtrl.setMapCenter(position.coords.latitude, position.coords.longitude);
            self._socialsMain.setLatitude(Math.floor(position.coords.latitude * 10000) / 10000);
            self._socialsMain.setLongitude(Math.floor(position.coords.longitude * 10000) / 10000);
            self._pointsMain.setLatitude(Math.floor(position.coords.latitude * 10000) / 10000);
            self._pointsMain.setLongitude(Math.floor(position.coords.longitude * 10000) / 10000);

            self.downloadPointsHandler();
            //self.downloadSocialsHandler();

        }, this.handleGeoLocationError);
    } else {
        Logger.debug('geolocation is not supported by this browser');
    }

    $(this.document).on('click', '.route_to', function (e) {
        e.preventDefault();
        var toCoords = this.name.split(',');
        var fromCoords = self._user.getUsersGeoPosition();
        self.route(fromCoords.lat,fromCoords.lng,toCoords[0],toCoords[1]);
    });
};

RoutesPage.prototype.downloadPointsHandler = function() {
    try {
        var formData = $(this.document).find('#point-main-form').serializeArray();

        this._points.downLoadPoints(formData, function () {});
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

RoutesPage.prototype.route = function (fromLat,fromLng,toLat,toLng) {
    var that = this;
    var data = {
        'fromLat': fromLat,
        'fromLng': fromLng,
        'toLat': toLat,
        'toLng': toLng,
        'disability': returnCategory()
    };
    $.ajax({
        type: 'POST',
        url: GET_ROUTES_ACTION,
        dataType: 'json ',
        data: "routeCoords=" + JSON.stringify(data),
        success: function(response) {
            window.location = "routes.php?lang=ru#form=main";
            that._routes = [];
            that._mapCtrl.removeRoutesFromMap();
            var flag = false;
            $.each(response, function (key, value) {
                if(value['type'] == "safe")
                    flag = true;
               var tmpRoute = new RouteClass(value['distance'],value['weight'], value['type'],value['routePoints'],value['obstacles'],value['routePoints'][0],value['routePoints'][value['routePoints'].length - 1]);
                that._mapCtrl.placeRouteOnMap(tmpRoute, that._points, '#form=' + RoutesPage.ROUTE_INFO + '&route_type=' + value['type'], that._categories);
                that._routes.push(tmpRoute);
            });
            if(flag)
                window.location = "routes.php?lang=ru#form=route_info&route_type=safe";
            else
                window.location = "routes.php?lang=ru#form=route_info&route_type=fastest";
        },
        error: function (xhr, ajaxOptions, thrownError) {
    	    alert(xhr.status);
    	    alert(xhr.responseText);
        }
    });
};

RoutesPage.prototype.handleGeoLocationError = function (error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            Logger.debug('user denied the request for Geolocation');
            break;
        case error.POSITION_UNAVAILABLE:
            Logger.debug('location information is unavailable');
            break;
        case error.TIMEOUT:
            Logger.debug('the request to get user location timed out');
            break;
        case error.UNKNOWN_ERROR:
            Logger.debug('an unknown error occurred');
            break;
    }
};

RoutesPage.prototype.showSocialsMain = function () {
    try {
        this._headerView.clearOption();
        this.currentView.hideView();
        this.currentView = this._socialsMain;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

RoutesPage.prototype.showSocialInfo = function () {
    try {
        this._headerView.changeOption($(this._socialInfo.getView()).data('pagetitle'), 'glyphicon-chevron-left', '#form=main');
        var socialUUID = decodeURIComponent(this._utils.getHashVar('social_uuid'));
        if (!socialUUID) {
            throw new GetsWebClientException('Track Page Error', 'showSocialInfo, hash parameter social uuid undefined');
        }

        var social = this._socials.findSocialInsocialList(socialUUID);
        var categoryId =
        this._socialInfo.placeSocialInSocialInfo(social, returnCategory());


        this.currentView.hideView();
        this.currentView = this._socialInfo;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

RoutesPage.prototype.downloadSocialsHandler = function () {
    var that = this;
    try {
        this._socialsMain.showOverlay();
        var formData = $(this.document).find('#socials-main-form').serializeArray();

        this._socials.downloadSocials(formData, function () {
            var socialList = that._socials.getSocialList();
            var scopeList = that._socials.getScopeList();
            that._mapCtrl.removeSocialsFromMap();
            that._socialsMain.placeSocialsInSocialList(socialList);
            that._socialsMain.placeScopesInScopeList(scopeList);
            that._mapCtrl.placeSocialsOnMap(socialList);
            that._socialsMain.hideOverlay();
        });
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

RoutesPage.prototype.showRouteInfo = function () {
    try {
        this._headerView.changeOption($(this._routeInfo.getView()).data('pagetitle'), 'glyphicon-chevron-left', '#form=main');
        var routeType = decodeURIComponent(this._utils.getHashVar('route_type'));
        this._mapCtrl.setCurrentRouteLayer(routeType);
        this._routeInfo.placeRouteInRouteInfo(this._routes, this._points,  routeType, this._categories);
        this.currentView.hideView();
        this.currentView = this._routeInfo;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        window.location = "routes.php?lang=ru#form=main";
        Logger.error(Exception.toString());
    }
};

RoutesPage.prototype.addRouteFromMap = function () {
    var toLat = decodeURIComponent(this._utils.getHashVar('lat'));
    var toLng = decodeURIComponent(this._utils.getHashVar('lng'));
    var fromCoords = this._user.getUsersGeoPosition();
    this.route(fromCoords.lat,fromCoords.lng,toLat,toLng);
};
RoutesPage.prototype.getCategories = function () {
    this._categories= [];
    var that = this;
    var retCategory;
    var url = "http://gets.cs.petrsu.ru/obstacle/service/getCategories.php";
    var data = '<request><params></params></request>';
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        retCategory = new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        retCategory = new ActiveXObject("Microsoft.XMLHTTP");
    }

    retCategory.open("POST", url, true);
    retCategory.send(data);
    retCategory.onreadystatechange = function () {
        if (retCategory.readyState == 4 && retCategory.status == 200) {
            $(retCategory.responseText).find("category").each(function (i, val) {
                that._categories.push(val);
            });
        }
    };
};

function returnCategory() {
    if ($("#deaf").prop("checked"))
        return 4;
    if ($("#blind").prop("checked"))
        return 3;
    if ($("#mental").prop("checked"))
        return 5;
    if ($("#muscle").prop("checked"))
        return 2;
    if ($("#wheelchair").prop("checked"))
        return 1;
}