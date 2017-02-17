
function RouteInfo(document, routeInfo) {
    this.document = document;
    this.routeInfo = routeInfo;
}

RouteInfo.prototype.placeRouteInRouteInfo = function(routes, obstacles, routeType, categories) {
    var btnDistanceSafe = $(this.routeInfo).find('#route-type-safe');
    var btnDistanceNormal = $(this.routeInfo).find('#route-type-normal');
    var btnDistanceFastest = $(this.routeInfo).find('#route-type-fastest');
    var obstaclesDiv = $(this.routeInfo).find('#route-obstacles');
    var weight = $(this.routeInfo).find('#route-weight');
    var obstaclesCalc = $(this.routeInfo).find('#obstacles_calc');

    $(obstaclesCalc).text('');
    $(btnDistanceSafe).text('');
    $(btnDistanceNormal).text('');
    $(btnDistanceFastest).text('');
    $(obstaclesCalc).hide();
    $(btnDistanceSafe).css("display","none");
    $(btnDistanceNormal).css("display","none");
    $(btnDistanceFastest).css("display","none");
    $('.distanceBtn').css("opacity",0.5);
    $(obstaclesDiv).text('');
    $(weight).text('');
    var weightObst = 0;
    var currentRoute;
    $.each(routes, function (key, value) {
        switch (value.getType()) {
            case 'normal':
                $(btnDistanceNormal).css("display","block");
                $(btnDistanceNormal).text(Math.round(value.getDistance())/1000 + " км");
                break;
            case 'safe':
                $(btnDistanceSafe).css("display","block");
                $(btnDistanceSafe).text(Math.round(value.getDistance())/1000 + " км");
                break;
            case 'fastest':
                $(btnDistanceFastest).css("display","block");
                $(btnDistanceFastest).text(Math.round(value.getDistance())/1000 + " км");
                break;
        }
        if(value.getType() == routeType)
            currentRoute = value;
    });
    var obsctCalcString ='';
    if(currentRoute.getObstacles().length == 0)
        $(obstaclesDiv).text("На данном маршруте нет препятствий!");
    $.each(currentRoute.getObstacles(), function (id, val) {
        var tmpPoint = obstacles.findPointInPointList(val['uuid']);
        var bgColor = "rgba(0,0,0,0);";
        var img;
        $.each(tmpPoint.extendedData, function (id2, value1) {
            if(value1.name == "rating") {
                if (Number(value1.value) < 2)
                    bgColor = "rgba(0,255,0,0.5);";
                else if (Number(value1.value) < 4)
                    bgColor = "rgba(255, 153, 0, 0.5);";
                else
                    bgColor = "rgba(255, 0, 0, 0.5);";
            }
            if(value1.name == "category_id") {
                $.each(categories, function (i,v) {
                    if($(v).find("id").text() == value1.value)
                       img = $(v).find("url").text().split('"')[3];
                });
            }
        });
        var appDiv = '<div class="obstacles_info" style="border: 1px solid #000; cursor: pointer; background: '+ bgColor + '">' +
            '<div class="obstacles_info_header">' +
            '<div class="picture_box"><img src="' + img +'"></div>' +
            '<div style="line-height: 50px;"><label>'+ tmpPoint.name + '</label></div>' +
            '</div>' +
            '<div class="full_obstacles_info">' +
                '<div class="main-block">' +
                '<label>Координаты</label>' +
                    '<div class="emulate-tab"><label>Широта: &nbsp;</label><div class="inline"></div>' + tmpPoint.coordinates.split(',')[1] + '</div>' +
                    '<div class="emulate-tab"><label>Долгота: &nbsp;</label><div class="inline"></div>' + tmpPoint.coordinates.split(',')[0] + '</div>' +
                    '<div class="emulate-tab"><label>Высота: &nbsp;</label><div class="inline"></div>0</div>' +
                '</div>' +
                '<div class="main-block">' +
                    '<label for="point-info-description">Описание</label>' +
                    '<div id="point-info-description">' + tmpPoint.description + '</div>' +
                '</div>' +
                '<div class="main-block">' +
                '<label for="point-info-url">Ссылка</label>' +
                    '<div id="point-info-url">' +
                        '<a target="_blank">' + tmpPoint.url + '</a>' +
                    '</div>' +
                '</div>' +
                '<div class="main-block">' +
                '<label for="point-info-audio">Дополнительные данные</label>' +
                    '<div id="point-info-extended-data">';
                    $.each(tmpPoint.extendedData, function (id1, value) {
                        appDiv +='<div><b>' + value.name + ':</b>  ' + value.value + '</div>';
                        if(value.name == "rating") {
                            weightObst += Number(value.value);
                            obsctCalcString += '<div>' + tmpPoint.name + '  \+' +  value.value;
                        }
                    });
                    appDiv += '</div>' +
                '</div>' +
            '</div>';
        $(obstaclesDiv).append(appDiv);
    });
    var obstclColor;
    switch (routeType) {
        case 'normal':
            obstclColor = "rgba(255, 153, 0, 0.5)";
            $(btnDistanceNormal).css("opacity",1);
            break;
        case 'safe':
            obstclColor = "rgba(0,255,0,0.5)";
            $(btnDistanceSafe).css("opacity",1);
            break;
        case 'fastest':
            obstclColor = "rgba(255, 0, 0, 0.5)";
            $(btnDistanceFastest).css("opacity",1);
            break;
    }

    $(weight).text(weightObst);
    $(weight).css('background', obstclColor);
    $(obstaclesCalc).append(obsctCalcString);

    $('.obstacles_info').on('click', function (e) {
        $('.full_obstacles_info').css('display', 'none');
        $(this).children().css('display','flex');
    });
    $('.full_obstacles_info').on('click', function (e) {
        $('.full_obstacles_info').hide();
    });
    $(btnDistanceSafe).on('click', function () {
        window.location = "routes.php?"+lang+"#form=route_info&route_type=safe";
    });

    $(btnDistanceNormal).on('click', function () {
        window.location = "routes.php?"+lang+"#form=route_info&route_type=normal";
    });

    $(btnDistanceFastest).on('click', function () {
        window.location = "routes.php?"+lang+"#form=route_info&route_type=fastest";
    });
    $(weight).on('click', function () {
       $(obstaclesCalc).toggle();
    });

};

RouteInfo.prototype.getView = function() {
    return this.routeInfo;
};

/**
 * Show view
 */
RouteInfo.prototype.showView = function() {
    $(this.routeInfo).removeClass('hidden').addClass('show');
};

/**
 * Hide view
 */
RouteInfo.prototype.hideView = function() {
    $(this.routeInfo).removeClass('show').addClass('hidden');
};




