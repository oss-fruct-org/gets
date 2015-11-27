/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-12-20          (the version of the package this class was first added to)
 */

/**
 * Constructor for controller "Routes".
 * 
 * @constructor
 */
function Routes() {
    Number.prototype.toFixedDown = function (digits) {
        var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
                m = this.toString().match(re);
        return m ? parseFloat(m[1]) : this.valueOf();
    };
}

Routes.prototype.makeGoogleDirectionsRoute = function (track, options, callback, map) {
    if (!track) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, track undefined or null');
    }
    if (!track.hasOwnProperty('points')) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, track has no "points" property');
    }
    if (track.points.length < 1) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, track has empty points array');
    }
    if (track.points.length == 1) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, can\'t request route for just one point');
    }
    if (track.points.length >= 11) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, total number of points in the route must be 10 or less (will be fixed in further updates)');
    }
    
    // Construct url for request
    //origin=Boston,MA&destination=Concord,MA&
    var urlRequest = 'http://maps.googleapis.com/maps/api/directions/json?sensor=false&';
    
    if (options) {
        for (var i = 0, len = options.length; i < len; i++) {
            if (options[i].name !== 'optimize') {
                urlRequest += options[i].name + '=' + options[i].value + '&';
            } else {
                var optimize = options[i];
            }
        }
    }
    
    var coords = track.points[0].coordinates.split(',');
    urlRequest += 'origin=' + String(coords[1] + ',' + coords[0]) + '&';
    
    coords = track.points[track.points.length - 1].coordinates.split(',');
    urlRequest += 'destination=' + String(coords[1] + ',' + coords[0]) + '&';
    
    if (track.points.length >= 3) {
        urlRequest += 'waypoints=';
        for (var i = 1; i < track.points.length - 1; i++) {
            var localCoords = track.points[i].coordinates.split(',');
            urlRequest += String(localCoords[1] + ',' + localCoords[0]) + '|';
        }
        if (optimize) {
            urlRequest += optimize.name + ':' + optimize.value;
        }
    }
    
    var getRouteRequest = $.ajax({
        url: RETRANSLATOR_ACTION,
        type: 'POST',
        async: true,
        dataType: 'json',
        data: JSON.stringify({url: urlRequest})
    });
    
    getRouteRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Routes Error', 'makeGoogleDirectionsRoute, getRouteRequest failed ' + textStatus);
    });
    
    var that = this;
    getRouteRequest.done(function(data, textStatus, jqXHR) {
        track.serviceRoutes = [];
        track.bounds = jqXHR.responseJSON.routes[0].bounds;
        for (var i = 0, len = jqXHR.responseJSON.routes.length; i < len; i++) {
            var pointsStr = jqXHR.responseJSON.routes[i].overview_polyline.points;
            track.serviceRoutes.push(pointsStr);
            
            var pointsArr = L.PolylineUtil.decode(pointsStr);
            pointsArr = pointsArr.map(function (elem) {
                return new L.LatLng(elem[0], elem[1]);
            });
            
            var pointsArr2 = L.PolylineUtil.decode(pointsStr);
            pointsArr2 = pointsArr2.map(function (elem) {
                return {coords: new L.LatLng(elem[0], elem[1])};
            });
            
            Logger.error('Google.Path PNum: ' + pointsArr.length + 
                ' L: ' + that.calcDistLatLngs(pointsArr) + 
                ' A: ' + that.calcAnglesSumLatLngs(pointsArr, map) + 
                ' DF: 0');
                      
            Logger.error('Google.Path \u005Catpbox{PN = ' + pointsArr.length + 
                ' \u005C\u005C D = ' + that.calcDistLatLngs(pointsArr) + 
                ' \u005C\u005C A = ' + that.calcAnglesSumLatLngs(pointsArr, map) + 
                ' \u005C\u005C DF = ' + that.calcFDistance2(track, pointsArr, map) + '}');
        
            var bezier = that.bezierCurveszzz(pointsArr2, map);
            Logger.error('Google.Path Bezier \u005Catpbox{PN = ' + bezier.length + 
                ' \u005C\u005C D = ' + that.calcDistLatLngs(bezier) + 
                ' \u005C\u005C A = ' + that.calcAnglesSumLatLngs(bezier, map) + 
                ' \u005C\u005C DF = ' + that.calcFDistance2(track, bezier, map) + '}');
            map.drawLatLngPolyline(bezier, 'Google.Path Bezier', /*'#BB00BB'*/'#0000FF');    
                
        
            var hermite = that.smoothcurvejs(pointsArr2, map);        
            Logger.error('Google.Path Hermite \u005Catpbox{PN = ' + hermite.length + 
                ' \u005C\u005C D = ' + that.calcDistLatLngs(hermite) + 
                ' \u005C\u005C A = ' + that.calcAnglesSumLatLngs(hermite, map) + 
                ' \u005C\u005C DF = ' + that.calcFDistance2(track, hermite, map) + '}'); 
            map.drawLatLngPolyline(hermite, 'Google.Path Hermite', /*'#BB00BB'*/'#0000FF');    
        }
            
        if (callback) {
            callback();
        }
    });
    
    
    /*var newRoute = [];
    var legs = getRouteRequest.responseJSON.routes[0].legs;
    for (var j = 0, len = legs.length; j < len; j++) {
        newRoute.push({
            lat: legs[j].start_location.lat,
            lng: legs[j].start_location.lng
        });
    }
    
    newRoute.push({
        lat: legs[legs.length - 1].end_location.lat, 
        lng: legs[legs.length - 1].end_location.lat
    });
    
    Logger.debug(newRoute);
    track.googleRoute = newRoute;*/ 
};

/**
 * Request OSM obstacles over Overpass API
 * @param {type} track
 * @param {type} callback
 * @returns {undefined}
 */
Routes.prototype.requestOSMObstacles = function (track, callback) {
    if (!track) {
        throw new GetsWebClientException('Routes Error', 'requestOSMObstacles, track undefined or null');
    }
    if (!track.hasOwnProperty('bounds')) {
        //throw new GetsWebClientException('Routes Error', 'requestOSMObstacles, there is no bounds for this track');
        if (!track.hasOwnProperty('points')) {
            throw new GetsWebClientException('Routes Error', 'requestOSMObstacles, track has no "points" property');
        }
        
        track.bounds = this.getBoundBoxForPoints(track.points);
    }
    
    var bboxForHull = function (hull) {
        var points = hull.getHull();
        var north = 0.0, east = 0.0, south = 0.0, west = 0.0;
        north = south = points[0].x;
        east = west = points[0].y;
        for (var k = 1, len = points.length; k < len; k++) {
            if (points[k].x > north)
                north = points[k].x;
            if (points[k].x < south)
                south = points[k].x;
            if (points[k].y > east)
                east = points[k].y;
            if (points[k].y < west)
                west = points[k].y;
        }
        return {
            northeast: {
                lat: north,
                lng: east
            },
            southwest: {
                lat: south,
                lng: west
            }
        };
    };
      
    var urlRequest = 'http://overpass-api.de/api/interpreter?data=[out:xml][timeout:1000];(way["building"="yes"](' + track.bounds.southwest.lat + ',' + track.bounds.southwest.lng + ',' + track.bounds.northeast.lat + ',' + track.bounds.northeast.lng + ');way["natural"="water"](' + track.bounds.southwest.lat + ',' + track.bounds.southwest.lng + ',' + track.bounds.northeast.lat + ',' + track.bounds.northeast.lng + '););(._;>;);out skel qt;';
    urlRequest = urlRequest.split(' ').join('%20').split('"').join('%22');//replace(' ', '%20').replace('"','%22');
    Logger.debug(urlRequest);
  
    /*var getObstaclesRequest = $.ajax({
        url: urlRequest,
        type: 'GET',
        async: true,
        dataType: 'xml'
        //data: JSON.stringify({url: urlRequest})8
    });
    
    getObstaclesRequest.fail(function(jqXHR, textStatus) {
        throw new GetsWebClientException('Routes Error', 'requestOSMObstacles, getObstaclesRequest failed ' + textStatus);
    });
    
    getObstaclesRequest.done(function(data, textStatus, jqXHR) {*/
        var data = $.parseXML('<?xml version="1.0" encoding="UTF-8"?> <osm version="0.6" generator="Overpass API"> <note>The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.</note> <meta osm_base="2015-02-26T17:26:02Z"/> <node id="365575081" lat="61.7869783" lon="34.3494788"> <tag k="name" v="SportLab"/> <tag k="service:bicycle:repair" v="yes"/> <tag k="service:bicycle:retail" v="yes"/> <tag k="shop" v="bicycle"/> <tag k="website" v="http://sport-lab.ru"/> </node> <node id="365583884" lat="61.7873362" lon="34.3537478"> <tag k="amenity" v="cafe"/> <tag k="name" v="Кивач"/> <tag k="opening_hours" v="24/7"/> </node> <node id="393065229" lat="61.7868609" lon="34.3616912"/> <node id="393065230" lat="61.7869108" lon="34.3620323"/> <node id="393065231" lat="61.7868379" lon="34.3620800"/> <node id="393065232" lat="61.7867880" lon="34.3617389"/> <node id="393065323" lat="61.7889618" lon="34.3550819"/> <node id="393065324" lat="61.7888162" lon="34.3552772"/> <node id="393065325" lat="61.7888719" lon="34.3554632"/> <node id="393065326" lat="61.7890175" lon="34.3552678"/> <node id="393065341" lat="61.7894289" lon="34.3519433"/> <node id="393065342" lat="61.7893766" lon="34.3517682"/> <node id="393065343" lat="61.7896711" lon="34.3516189"/> <node id="393065353" lat="61.7896188" lon="34.3514439"/> <node id="393065394" lat="61.7875958" lon="34.3525897"/> <node id="393065395" lat="61.7876525" lon="34.3525154"/> <node id="393065396" lat="61.7874005" lon="34.3519231"/> <node id="393065397" lat="61.7877399" lon="34.3521223"/> <node id="393065398" lat="61.7877707" lon="34.3522288"/> <node id="393065399" lat="61.7874572" lon="34.3518488"/> <node id="393065401" lat="61.7878158" lon="34.3521704"/> <node id="393065402" lat="61.7877850" lon="34.3520640"/> <node id="393065685" lat="61.7864012" lon="34.3472717"/> <node id="393065686" lat="61.7863374" lon="34.3470446"/> <node id="393065689" lat="61.7863890" lon="34.3469798"/> <node id="393065690" lat="61.7864528" lon="34.3472069"/> <node id="393065725" lat="61.7895426" lon="34.3480577"/> <node id="393065726" lat="61.7894126" lon="34.3487477"/> <node id="393065727" lat="61.7895426" lon="34.3487477"/> <node id="393065728" lat="61.7894126" lon="34.3480577"/> <node id="393067943" lat="61.7837511" lon="34.3464395"/> <node id="393067946" lat="61.7838149" lon="34.3463522"/> <node id="393067947" lat="61.7838530" lon="34.3464766"/> <node id="393067948" lat="61.7837892" lon="34.3465639"/> <node id="393069070" lat="61.7845600" lon="34.3610387"/> <node id="393069071" lat="61.7842390" lon="34.3616608"/> <node id="393069072" lat="61.7841990" lon="34.3615293"/> <node id="393069080" lat="61.7846000" lon="34.3611702"/> <node id="393069300" lat="61.7837774" lon="34.3448178"/> <node id="393069301" lat="61.7839004" lon="34.3451731"/> <node id="393069302" lat="61.7838392" lon="34.3452678"/> <node id="393069303" lat="61.7837162" lon="34.3449125"/> <node id="393069445" lat="61.7829501" lon="34.3538062"/> <node id="393069446" lat="61.7827108" lon="34.3541333"/> <node id="393069447" lat="61.7828237" lon="34.3543837"/> <node id="393069448" lat="61.7830197" lon="34.3541158"/> <node id="393069494" lat="61.7834878" lon="34.3573949"/> <node id="393069497" lat="61.7835215" lon="34.3575000"/> <node id="393069498" lat="61.7832790" lon="34.3576945"/> <node id="393069499" lat="61.7833127" lon="34.3577996"/> <node id="393069500" lat="61.7829510" lon="34.3568800"/> <node id="393069501" lat="61.7828900" lon="34.3566810"/> <node id="393069502" lat="61.7828155" lon="34.3567770"/> <node id="393069503" lat="61.7828756" lon="34.3569772"/> <node id="393069504" lat="61.7831112" lon="34.3579839"/> <node id="393069505" lat="61.7832046" lon="34.3578644"/> <node id="393069506" lat="61.7829041" lon="34.3572593"/> <node id="393069589" lat="61.7829521" lon="34.3571979"/> <node id="393069614" lat="61.7848646" lon="34.3548821"/> <node id="393069615" lat="61.7847394" lon="34.3544906"/> <node id="393069623" lat="61.7846196" lon="34.3546620"/> <node id="393069624" lat="61.7847448" lon="34.3550535"/> <node id="393069668" lat="61.7836045" lon="34.3585740"/> <node id="393069669" lat="61.7834180" lon="34.3585501"/> <node id="393069670" lat="61.7834815" lon="34.3587494"/> <node id="393069671" lat="61.7835410" lon="34.3583747"/> <node id="393069684" lat="61.7840993" lon="34.3570015"/> <node id="393069685" lat="61.7840459" lon="34.3570855"/> <node id="393069686" lat="61.7839982" lon="34.3567138"/> <node id="393069689" lat="61.7839448" lon="34.3567978"/> <node id="420856877" lat="61.7874881" lon="34.3498120"> <tag k="amenity" v="cafe"/> <tag k="name" v="Морозко"/> </node> <node id="420856891" lat="61.7855210" lon="34.3509966"> <tag k="name" v="Лотос"/> <tag k="shop" v="supermarket"/> </node> <node id="518832108" lat="61.7827705" lon="34.3536564"/> <node id="518832123" lat="61.7826768" lon="34.3517797"/> <node id="518832140" lat="61.7819440" lon="34.3557930"/> <node id="518832158" lat="61.7824350" lon="34.3534320"/> <node id="518832180" lat="61.7826270" lon="34.3529541"/> <node id="518832201" lat="61.7825954" lon="34.3538905"/> <node id="518832205" lat="61.7825415" lon="34.3537101"/> <node id="518832287" lat="61.7820090" lon="34.3559910"/> <node id="518832374" lat="61.7826743" lon="34.3531126"/> <node id="518832408" lat="61.7827757" lon="34.3516478"/> <node id="518832415" lat="61.7824170" lon="34.3554260"/> <node id="518832463" lat="61.7823877" lon="34.3532735"/> <node id="518832478" lat="61.7824502" lon="34.3505561"> <tag k="name" v="Алкор"/> <tag k="shop" v="computer"/> </node> <node id="518832489" lat="61.7827166" lon="34.3534760"/> <node id="518832506" lat="61.7823513" lon="34.3506880"/> <node id="518832542" lat="61.7823520" lon="34.3552390"/> <node id="518832910" lat="61.7826540" lon="34.3625367"/> <node id="518832915" lat="61.7825976" lon="34.3623600"/> <node id="518832921" lat="61.7824092" lon="34.3626289"/> <node id="518832923" lat="61.7824656" lon="34.3628056"/> <node id="519975113" lat="61.7832785" lon="34.3495126"/> <node id="519975114" lat="61.7851919" lon="34.3527551"/> <node id="519975117" lat="61.7855924" lon="34.3521935"/> <node id="519975120" lat="61.7831606" lon="34.3455938"/> <node id="519975125" lat="61.7859267" lon="34.3516129"/> <node id="519975137" lat="61.7843188" lon="34.3542751"/> <node id="519975141" lat="61.7838728" lon="34.3497758"/> <node id="519975156" lat="61.7839517" lon="34.3541969"/> <node id="519975163" lat="61.7832155" lon="34.3492964"/> <node id="519975170" lat="61.7860467" lon="34.3509982"/> <node id="519975188" lat="61.7848733" lon="34.3513829"/> <node id="519975215" lat="61.7859988" lon="34.3526303"/> <node id="519975236" lat="61.7829169" lon="34.3459206"/> <node id="519975250" lat="61.7855004" lon="34.3523263"/> <node id="519975274" lat="61.7860800" lon="34.3526510"/> <node id="519975301" lat="61.7831511" lon="34.3455620"/> <node id="519975330" lat="61.7864706" lon="34.3532977"/> <node id="519975360" lat="61.7846212" lon="34.3537651"/> <node id="519975366" lat="61.7841332" lon="34.3541401"/> <node id="519975368" lat="61.7846644" lon="34.3534093"/> <node id="519975370" lat="61.7828668" lon="34.3500495"/> <node id="519975407" lat="61.7828563" lon="34.3457183"/> <node id="519975412" lat="61.7855329" lon="34.3524269"/> <node id="519975425" lat="61.7833392" lon="34.3511151"/> <node id="519975501" lat="61.7855335" lon="34.3520112"/> <node id="519975503" lat="61.7861439" lon="34.3512992"/> <node id="519975545" lat="61.7850678" lon="34.3516483"/> <node id="519975595" lat="61.7855322" lon="34.3517413"/> <node id="519975626" lat="61.7849983" lon="34.3514344"/> <node id="519975635" lat="61.7860238" lon="34.3527322"/> <node id="519975641" lat="61.7851281" lon="34.3525572"/> <node id="519975674" lat="61.7857243" lon="34.3506944"/> <node id="519975698" lat="61.7841900" lon="34.3550212"/> <node id="519975715" lat="61.7830933" lon="34.3454004"/> <node id="519975726" lat="61.7856329" lon="34.3536383"/> <node id="519975753" lat="61.7848583" lon="34.3538072"/> <node id="519975776" lat="61.7860569" lon="34.3525464"/> <node id="519975779" lat="61.7828038" lon="34.3498333"/> <node id="519975782" lat="61.7847475" lon="34.3534468"/> <node id="519975796" lat="61.7858211" lon="34.3547161"/> <node id="519975829" lat="61.7856548" lon="34.3504805"/> <node id="519975861" lat="61.7847008" lon="34.3540239"/> <node id="519975871" lat="61.7854877" lon="34.3536146"/> <node id="519975873" lat="61.7852782" lon="34.3526305"/> <node id="519975884" lat="61.7852714" lon="34.3525169"/> <node id="519975918" lat="61.7831344" lon="34.3454196"/> <node id="519975938" lat="61.7843870" lon="34.3549327"/> <node id="519975952" lat="61.7842992" lon="34.3542113"/> <node id="519975968" lat="61.7834725" lon="34.3504789"/> <node id="519975978" lat="61.7831696" lon="34.3455372"/> <node id="519975992" lat="61.7861176" lon="34.3542933"/> <node id="519975996" lat="61.7863647" lon="34.3535329"/> <node id="519976015" lat="61.7835550" lon="34.3502154"/> <node id="519976019" lat="61.7853984" lon="34.3533525"/> <node id="519976062" lat="61.7853730" lon="34.3533892"/> <node id="519976063" lat="61.7867661" lon="34.3532711"/> <node id="519976081" lat="61.7839246" lon="34.3544405"/> <node id="519976083" lat="61.7842050" lon="34.3543408"/> <node id="519976090" lat="61.7835703" lon="34.3508083"/> <node id="519976095" lat="61.7846972" lon="34.3535160"/> <node id="519976097" lat="61.7846981" lon="34.3503951"/> <node id="519976100" lat="61.7854236" lon="34.3521699"/> <node id="519976103" lat="61.7854889" lon="34.3532423"/> <node id="519976110" lat="61.7832415" lon="34.3507858"/> <node id="519976122" lat="61.7860537" lon="34.3528247"/> <node id="519976131" lat="61.7853143" lon="34.3527425"/> <node id="519976133" lat="61.7838123" lon="34.3495801"/> <node id="519976154" lat="61.7839845" lon="34.3546354"/> <node id="519976161" lat="61.7852347" lon="34.3524032"/> <node id="519976166" lat="61.7854591" lon="34.3536559"/> <node id="519976174" lat="61.7860589" lon="34.3541090"/> <node id="519976181" lat="61.7861852" lon="34.3537922"/> <node id="519976183" lat="61.7834945" lon="34.3500198"/> <node id="519976206" lat="61.7853452" lon="34.3531877"/> <node id="519976210" lat="61.7854516" lon="34.3522568"/> <node id="519976236" lat="61.7840915" lon="34.3540045"/> <node id="519976238" lat="61.7862681" lon="34.3540489"/> <node id="519976243" lat="61.7839963" lon="34.3543419"/> <node id="519976251" lat="61.7857624" lon="34.3545318"/> <node id="519976253" lat="61.7846057" lon="34.3505239"/> <node id="519976264" lat="61.7840455" lon="34.3545514"/> <node id="519976273" lat="61.7855391" lon="34.3537738"/> <node id="519976284" lat="61.7845123" lon="34.3539150"/> <node id="519976293" lat="61.7866780" lon="34.3529982"/> <node id="519976297" lat="61.7849657" lon="34.3512542"/> <node id="519976315" lat="61.7855876" lon="34.3534979"/> <node id="519976317" lat="61.7858040" lon="34.3517630"/> <node id="519976342" lat="61.7854312" lon="34.3530636"/> <node id="519976344" lat="61.7831092" lon="34.3454533"/> <node id="519976383" lat="61.7845326" lon="34.3539810"/> <node id="519976390" lat="61.7859714" lon="34.3525454"/> <node id="519976416" lat="61.7844460" lon="34.3629640"/> <node id="519976422" lat="61.7842820" lon="34.3632010"/> <node id="519976449" lat="61.7842170" lon="34.3631740"/> <node id="519976453" lat="61.7845380" lon="34.3632010"/> <node id="519976466" lat="61.7839810" lon="34.3629640"/> <node id="519976474" lat="61.7841750" lon="34.3635820"/> <node id="519976486" lat="61.7839390" lon="34.3628080"/> <node id="519976490" lat="61.7841530" lon="34.3629790"/> <node id="519976498" lat="61.7835960" lon="34.3617630"/> <node id="519976529" lat="61.7840460" lon="34.3626590"/> <node id="519976532" lat="61.7837250" lon="34.3615910"/> <node id="519976536" lat="61.7842170" lon="34.3636240"/> <node id="519976540" lat="61.7844120" lon="34.3623580"/> <node id="519976556" lat="61.7842400" lon="34.3636240"/> <node id="519976565" lat="61.7844770" lon="34.3625520"/> <node id="519976569" lat="61.7841940" lon="34.3636010"/> <node id="519976600" lat="61.7882825" lon="34.3578450"/> <node id="519976602" lat="61.7875474" lon="34.3560015"/> <node id="519976612" lat="61.7879927" lon="34.3568918"/> <node id="519976616" lat="61.7873607" lon="34.3586420"/> <node id="519976629" lat="61.7875165" lon="34.3563931"/> <node id="519976635" lat="61.7872457" lon="34.3552547"/> <node id="519976637" lat="61.7863605" lon="34.3592848"/> <node id="519976639" lat="61.7873357" lon="34.3557885"/> <node id="519976653" lat="61.7874474" lon="34.3556368"/> <node id="519976660" lat="61.7874613" lon="34.3589825"/> <node id="519976662" lat="61.7879292" lon="34.3580065"/> <node id="519976664" lat="61.7865758" lon="34.3587160"/> <node id="519976666" lat="61.7872572" lon="34.3611346"/> <node id="519976677" lat="61.7872149" lon="34.3606843"/> <node id="519976704" lat="61.7866368" lon="34.3589265"/> <node id="519976718" lat="61.7875427" lon="34.3555003"/> <node id="519976726" lat="61.7871286" lon="34.3609416"/> <node id="519976740" lat="61.7879350" lon="34.3569703"/> <node id="519976748" lat="61.7879118" lon="34.3568940"/> <node id="519976760" lat="61.7876995" lon="34.3559898"/> <node id="519976766" lat="61.7874901" lon="34.3558227"/> <node id="519976795" lat="61.7876436" lon="34.3560699"/> <node id="519976797" lat="61.7877167" lon="34.3571594"/> <node id="519976818" lat="61.7874402" lon="34.3561550"/> <node id="519976820" lat="61.7877842" lon="34.3573817"/> <node id="519976836" lat="61.7873166" lon="34.3548105"/> <node id="519976839" lat="61.7881091" lon="34.3577618"/> <node id="519976842" lat="61.7872568" lon="34.3587794"/> <node id="519976843" lat="61.7873918" lon="34.3559636"/> <node id="519976858" lat="61.7873575" lon="34.3591199"/> <node id="519976885" lat="61.7873912" lon="34.3557090"/> <node id="519976901" lat="61.7879978" lon="34.3582322"/> <node id="519976905" lat="61.7873876" lon="34.3550323"/> <node id="519976907" lat="61.7872959" lon="34.3551635"/> <node id="519976917" lat="61.7879323" lon="34.3571802"/> <node id="519976922" lat="61.7876746" lon="34.3561666"/> <node id="519976935" lat="61.7873435" lon="34.3608773"/> <node id="519976950" lat="61.7871968" lon="34.3553248"/> <node id="519976952" lat="61.7871216" lon="34.3550898"/> <node id="519976955" lat="61.7862994" lon="34.3590743"/> <node id="519976977" lat="61.7878929" lon="34.3660301"/> <node id="519976980" lat="61.7867312" lon="34.3643208"/> <node id="519976982" lat="61.7877439" lon="34.3662521"/> <node id="519976984" lat="61.7880229" lon="34.3657101"/> <node id="519976986" lat="61.7868382" lon="34.3642138"/> <node id="519976987" lat="61.7869032" lon="34.3648358"/> <node id="519976988" lat="61.7871172" lon="34.3633818"/> <node id="519976989" lat="61.7883659" lon="34.3642301"/> <node id="519976990" lat="61.7869262" lon="34.3642138"/> <node id="519976992" lat="61.7879809" lon="34.3660301"/> <node id="519976994" lat="61.7873992" lon="34.3629468"/> <node id="519976996" lat="61.7867962" lon="34.3649418"/> <node id="519976998" lat="61.7868542" lon="34.3651558"/> <node id="519976999" lat="61.7881939" lon="34.3656221"/> <node id="519977001" lat="61.7874832" lon="34.3626688"/> <node id="519977003" lat="61.7867122" lon="34.3642138"/> <node id="519977005" lat="61.7883469" lon="34.3650001"/> <node id="519977007" lat="61.7877859" lon="34.3656871"/> <node id="519977009" lat="61.7869262" lon="34.3643848"/> <node id="519977010" lat="61.7871972" lon="34.3636108"/> <node id="519977011" lat="61.7881749" lon="34.3640581"/> <node id="519977012" lat="61.7866672" lon="34.3642978"/> <node id="519977013" lat="61.7883659" lon="34.3637411"/> <node id="519977014" lat="61.7879809" lon="34.3659461"/> <node id="519977015" lat="61.7866022" lon="34.3641488"/> <node id="519977016" lat="61.7882589" lon="34.3650231"/> <node id="519977017" lat="61.7883239" lon="34.3641271"/> <node id="519977018" lat="61.7883239" lon="34.3641921"/> <node id="519977020" lat="61.7882359" lon="34.3654731"/> <node id="519977023" lat="61.7874832" lon="34.3631458"/> <node id="519977025" lat="61.7880459" lon="34.3658171"/> <node id="519977042" lat="61.7884309" lon="34.3639281"/> <node id="519977044" lat="61.7869262" lon="34.3646908"/> <node id="519977047" lat="61.7881939" lon="34.3642981"/> <node id="519977049" lat="61.7873992" lon="34.3626688"/> <node id="519977051" lat="61.7867962" lon="34.3643628"/> <node id="519977053" lat="61.7880459" lon="34.3653281"/> <node id="519977055" lat="61.7867732" lon="34.3647058"/> <node id="519977058" lat="61.7867962" lon="34.3645758"/> <node id="519977060" lat="61.7873992" lon="34.3632678"/> <node id="519977063" lat="61.7877439" lon="34.3657751"/> <node id="519977064" lat="61.7870332" lon="34.3633328"/> <node id="519977066" lat="61.7870752" lon="34.3632518"/> <node id="519977068" lat="61.7883009" lon="34.3649351"/> <node id="519977069" lat="61.7883239" lon="34.3650881"/> <node id="519977070" lat="61.7869452" lon="34.3640038"/> <node id="519977071" lat="61.7878509" lon="34.3656221"/> <node id="519977072" lat="61.7867542" lon="34.3639538"/> <node id="519977073" lat="61.7881749" lon="34.3653671"/> <node id="519977074" lat="61.7879389" lon="34.3658591"/> <node id="519977075" lat="61.7881299" lon="34.3655381"/> <node id="519977076" lat="61.7870562" lon="34.3648998"/> <node id="519977077" lat="61.7881449" lon="34.3649161"/> <node id="519977079" lat="61.7881749" lon="34.3639931"/> <node id="519977080" lat="61.7870982" lon="34.3634388"/> <node id="519977082" lat="61.7879809" lon="34.3662521"/> <node id="519977085" lat="61.7870562" lon="34.3641108"/> <node id="519977088" lat="61.7883659" lon="34.3641421"/> <node id="519977091" lat="61.7868075" lon="34.3448131"/> <node id="519977099" lat="61.7873570" lon="34.3538168"/> <node id="519977107" lat="61.7874555" lon="34.3499221"/> <node id="519977109" lat="61.7866483" lon="34.3474976"/> <node id="519977115" lat="61.7880779" lon="34.3525005"/> <node id="519977120" lat="61.7872054" lon="34.3494323"/> <node id="519977128" lat="61.7870012" lon="34.3526384"/> <node id="519977174" lat="61.7871051" lon="34.3493240"/> <node id="519977183" lat="61.7875656" lon="34.3535350"/> <node id="519977193" lat="61.7873525" lon="34.3453934"/> <node id="519977197" lat="61.7871138" lon="34.3445774"/> <node id="519977204" lat="61.7873668" lon="34.3499070"/> <node id="519977225" lat="61.7865843" lon="34.3469446"/> <node id="519977227" lat="61.7880405" lon="34.3460865"/> <node id="519977229" lat="61.7874924" lon="34.3532922"/> <node id="519977237" lat="61.7864465" lon="34.3464824"/> <node id="519977239" lat="61.7873042" lon="34.3443282"/> <node id="519977255" lat="61.7867323" lon="34.3473906"/> <node id="519977256" lat="61.7873449" lon="34.3501860"/> <node id="519977260" lat="61.7865437" lon="34.3485425"/> <node id="519977267" lat="61.7871144" lon="34.3524856"/> <node id="519977279" lat="61.7875631" lon="34.3532200"/> <node id="519977280" lat="61.7861868" lon="34.3456268"/> <node id="519977281" lat="61.7870069" lon="34.3446379"/> <node id="519977283" lat="61.7862739" lon="34.3455085"/> <node id="519977285" lat="61.7865718" lon="34.3450604"/> <node id="519977292" lat="61.7873968" lon="34.3534213"/> <node id="519977296" lat="61.7865003" lon="34.3470476"/> <node id="519977298" lat="61.7867500" lon="34.3446081"/> <node id="519977311" lat="61.7868981" lon="34.3478626"/> <node id="519977323" lat="61.7875176" lon="34.3467246"/> <node id="519977332" lat="61.7881400" lon="34.3526993"/> <node id="519977336" lat="61.7866669" lon="34.3489462"/> <node id="519977338" lat="61.7866166" lon="34.3447757"/> <node id="519977367" lat="61.7866640" lon="34.3449446"/> <node id="519977377" lat="61.7876252" lon="34.3534188"/> <node id="519977382" lat="61.7874799" lon="34.3500022"/> <node id="519977398" lat="61.7872913" lon="34.3500098"/> <node id="519977404" lat="61.7871578" lon="34.3494972"/> <node id="519977407" lat="61.7872436" lon="34.3441210"/> <node id="519977409" lat="61.7872470" lon="34.3491307"/> <node id="519977412" lat="61.7875815" lon="34.3469330"/> <node id="519977422" lat="61.7870503" lon="34.3443740"/> <node id="519977424" lat="61.7870941" lon="34.3445237"/> <node id="519977430" lat="61.7868156" lon="34.3481712"/> <node id="519977433" lat="61.7865337" lon="34.3463641"/> <node id="519977436" lat="61.7880232" lon="34.3460322"/> <node id="519977451" lat="61.7869123" lon="34.3457953"/> <node id="519977462" lat="61.7866811" lon="34.3449718"/> <node id="519977467" lat="61.7868131" lon="34.3459199"/> <node id="519977473" lat="61.7870727" lon="34.3484348"/> <node id="519977477" lat="61.7872725" lon="34.3496530"/> <node id="519977481" lat="61.7872624" lon="34.3455114"/> <node id="519977536" lat="61.7867734" lon="34.3480329"/> <node id="519977538" lat="61.7872845" lon="34.3496366"/> <node id="519998462" lat="61.7895361" lon="34.3464221"/> <node id="519998490" lat="61.7900343" lon="34.3460213"/> <node id="519998494" lat="61.7894803" lon="34.3465330"/> <node id="519998498" lat="61.7895236" lon="34.3468564"/> <node id="519998504" lat="61.7894267" lon="34.3468674"/> <node id="519998511" lat="61.7898550" lon="34.3469889"/> <node id="519998548" lat="61.7894745" lon="34.3456361"/> <node id="519998569" lat="61.7898655" lon="34.3464495"/> <node id="519998573" lat="61.7893257" lon="34.3465433"/> <node id="519998580" lat="61.7897404" lon="34.3468268"/> <node id="519998589" lat="61.7898446" lon="34.3460339"/> <node id="519998598" lat="61.7895268" lon="34.3469797"/> <node id="519998687" lat="61.7894383" lon="34.3472460"/> <node id="519998754" lat="61.7894847" lon="34.3463186"/> <node id="519998829" lat="61.7897436" lon="34.3469551"/> <node id="519998835" lat="61.7898918" lon="34.3469847"/> <node id="519998837" lat="61.7898970" lon="34.3471911"/> <node id="519998840" lat="61.7898505" lon="34.3468143"/> <node id="519998886" lat="61.7900387" lon="34.3463111"/> <node id="519998898" lat="61.7895354" lon="34.3461804"/> <node id="519998899" lat="61.7893123" lon="34.3456469"/> <node id="519998900" lat="61.7895374" lon="34.3463150"/> <node id="519998910" lat="61.7898636" lon="34.3463228"/> <node id="519998935" lat="61.7894787" lon="34.3464260"/> <node id="519998956" lat="61.7898465" lon="34.3461596"/> <node id="519998985" lat="61.7895368" lon="34.3464714"/> <node id="521698108" lat="61.7888750" lon="34.3673780"/> <node id="521698124" lat="61.7887450" lon="34.3669510"/> <node id="521698138" lat="61.7885090" lon="34.3669770"/> <node id="521698266" lat="61.7888100" lon="34.3666910"/> <node id="521698363" lat="61.7885090" lon="34.3666910"/> <node id="521698460" lat="61.7889820" lon="34.3672290"/> <node id="521796454" lat="61.7828483" lon="34.3635614"/> <node id="521796455" lat="61.7836145" lon="34.3641088"/> <node id="521796457" lat="61.7831043" lon="34.3617377"/> <node id="521796458" lat="61.7837848" lon="34.3642455"/> <node id="521796459" lat="61.7830760" lon="34.3639108"/> <node id="521796460" lat="61.7834655" lon="34.3645587"/> <node id="521796463" lat="61.7834116" lon="34.3643746"/> <node id="521796464" lat="61.7837284" lon="34.3640688"/> <node id="521796466" lat="61.7834610" lon="34.3636656"/> <node id="521796467" lat="61.7829296" lon="34.3634469"/> <node id="521796469" lat="61.7828910" lon="34.3641835"/> <node id="521796470" lat="61.7828057" lon="34.3630531"/> <node id="521796472" lat="61.7836684" lon="34.3642929"/> <node id="521796477" lat="61.7832287" lon="34.3621728"/> <node id="521796479" lat="61.7832245" lon="34.3637539"/> <node id="521796481" lat="61.7834058" lon="34.3634937"/> <node id="521796482" lat="61.7829515" lon="34.3643672"/> <node id="521796486" lat="61.7827244" lon="34.3631676"/> <node id="521796489" lat="61.7840115" lon="34.3639222"/> <node id="521796490" lat="61.7837026" lon="34.3633239"/> <node id="521796491" lat="61.7832797" lon="34.3639258"/> <node id="521796492" lat="61.7831365" lon="34.3640945"/> <node id="521796495" lat="61.7832103" lon="34.3616022"/> <node id="521796496" lat="61.7833347" lon="34.3620373"/> <node id="521796497" lat="61.7837839" lon="34.3632080"/> <node id="521796498" lat="61.7838739" lon="34.3638614"/> <node id="521796510" lat="61.7862316" lon="34.3659275"/> <node id="521796512" lat="61.7840217" lon="34.3656801"/> <node id="521796514" lat="61.7838327" lon="34.3656609"/> <node id="521796517" lat="61.7837454" lon="34.3657881"/> <node id="521796518" lat="61.7864909" lon="34.3657787"/> <node id="521796526" lat="61.7861883" lon="34.3655427"/> <node id="521796531" lat="61.7858870" lon="34.3659647"/> <node id="521796535" lat="61.7864082" lon="34.3655139"/> <node id="521796539" lat="61.7858954" lon="34.3663061"/> <node id="521796540" lat="61.7839630" lon="34.3654998"/> <node id="521796541" lat="61.7862556" lon="34.3658940"/> <node id="521796542" lat="61.7864498" lon="34.3658362"/> <node id="521796547" lat="61.7858186" lon="34.3660603"/> <node id="521796551" lat="61.7859379" lon="34.3661276"/> <node id="521796552" lat="61.7862133" lon="34.3658689"/> <node id="521796553" lat="61.7863167" lon="34.3656417"/> <node id="521796559" lat="61.7838978" lon="34.3658607"/> <node id="521796562" lat="61.7840444" lon="34.3653812"/> <node id="521796565" lat="61.7842417" lon="34.3659871"/> <node id="521796569" lat="61.7860189" lon="34.3661335"/> <node id="521796578" lat="61.7839490" lon="34.3664135"/> <node id="521796582" lat="61.7862561" lon="34.3654479"/> <node id="521796583" lat="61.7863850" lon="34.3656288"/> <node id="521796589" lat="61.7860831" lon="34.3663390"/> <node id="521796593" lat="61.7862393" lon="34.3657060"/> <node id="521796602" lat="61.7862999" lon="34.3660359"/> <node id="522677065" lat="61.7831917" lon="34.3461240"/> <node id="522677075" lat="61.7872194" lon="34.3578260"/> <node id="522677086" lat="61.7835509" lon="34.3568438"/> <node id="522677150" lat="61.7894847" lon="34.3606997"/> <node id="522677297" lat="61.7898584" lon="34.3502232"/> <node id="522677896" lat="61.7828860" lon="34.3547630"/> <node id="522677901" lat="61.7836385" lon="34.3652509"/> <node id="522678064" lat="61.7881135" lon="34.3463332"/> <node id="522678246" lat="61.7859403" lon="34.3557356"/> <node id="522678367" lat="61.7834125" lon="34.3620112"/> <node id="522678369" lat="61.7825307" lon="34.3639907"/> <node id="522678385" lat="61.7868027" lon="34.3609407"/> <node id="522678405" lat="61.7835285" lon="34.3497930"/> <node id="522678565" lat="61.7823526" lon="34.3542950"/> <node id="522678595" lat="61.7890664" lon="34.3663825"/> <node id="522678657" lat="61.7887904" lon="34.3653851"/> <node id="522678780" lat="61.7870205" lon="34.3523572"/> <node id="522679072" lat="61.7878298" lon="34.3476787"/> <node id="522679111" lat="61.7846165" lon="34.3516196"/> <node id="522679179" lat="61.7842325" lon="34.3579436"/> <node id="522679355" lat="61.7885425" lon="34.3449940"/> <node id="522679363" lat="61.7830463" lon="34.3566110"/> <node id="522679686" lat="61.7871213" lon="34.3594623"/> <node id="522679763" lat="61.7832250" lon="34.3563460"/> <node id="522679768" lat="61.7835215" lon="34.3588561"/> <node id="522679779" lat="61.7899668" lon="34.3615590"/> <node id="522679914" lat="61.7877380" lon="34.3623580"/> <node id="522680100" lat="61.7861257" lon="34.3472822"/> <node id="522680101" lat="61.7833322" lon="34.3474599"/> <node id="522680108" lat="61.7856827" lon="34.3549195"/> <node id="522680258" lat="61.7831431" lon="34.3596369"/> <node id="522680310" lat="61.7869005" lon="34.3625061"/> <node id="522680345" lat="61.7821765" lon="34.3565456"/> <node id="522680371" lat="61.7856170" lon="34.3591337"/> <node id="522680419" lat="61.7867032" lon="34.3504930"/> <node id="522680533" lat="61.7866243" lon="34.3602557"/> <node id="522680564" lat="61.7896378" lon="34.3507985"/> <node id="522680634" lat="61.7831037" lon="34.3598076"/> <node id="522680782" lat="61.7847550" lon="34.3617210"/> <node id="522681120" lat="61.7881267" lon="34.3588057"/> <node id="522681165" lat="61.7846406" lon="34.3492374"/> <node id="522681511" lat="61.7832905" lon="34.3594584"/> <node id="522681542" lat="61.7835145" lon="34.3458141"/> <node id="522682023" lat="61.7888103" lon="34.3619795"/> <node id="522682027" lat="61.7842648" lon="34.3514669"/> <node id="522682069" lat="61.7843849" lon="34.3519453"/> <node id="522682381" lat="61.7893673" lon="34.3617165"/> <node id="522682507" lat="61.7859957" lon="34.3481771"/> <node id="522682522" lat="61.7878029" lon="34.3565956"/> <node id="522682639" lat="61.7894069" lon="34.3605705"/> <node id="522683099" lat="61.7870243" lon="34.3628559"/> <node id="522683291" lat="61.7873546" lon="34.3470615"/> <node id="522683332" lat="61.7888759" lon="34.3650617"/> <node id="522683630" lat="61.7836335" lon="34.3632228"/> <node id="522683839" lat="61.7868574" lon="34.3585192"/> <node id="522683949" lat="61.7833674" lon="34.3583807"/> <node id="522684135" lat="61.7879557" lon="34.3590717"/> <node id="522684184" lat="61.7871378" lon="34.3513802"/> <node id="522684388" lat="61.7838297" lon="34.3475681"/> <node id="522684535" lat="61.7898746" lon="34.3658025"/> <node id="522684615" lat="61.7837664" lon="34.3574838"/> <node id="522684679" lat="61.7891078" lon="34.3540206"/> <node id="522684789" lat="61.7836281" lon="34.3562617"/> <node id="522684907" lat="61.7889121" lon="34.3656136"/> <node id="522685025" lat="61.7823404" lon="34.3567132"/> <node id="522685087" lat="61.7854610" lon="34.3605340"/> <node id="522685089" lat="61.7867674" lon="34.3613557"/> <node id="522685246" lat="61.7846715" lon="34.3502879"/> <node id="522685260" lat="61.7832767" lon="34.3565020"/> <node id="522685645" lat="61.7835454" lon="34.3560243"/> <node id="522685729" lat="61.7831624" lon="34.3656354"/> <node id="522685802" lat="61.7891070" lon="34.3596258"/> <node id="522685940" lat="61.7890893" lon="34.3605565"/> <node id="522686479" lat="61.7848200" lon="34.3617780"/> <node id="522686533" lat="61.7890113" lon="34.3662374"/> <node id="522686780" lat="61.7825010" lon="34.3524510"/> <node id="522686853" lat="61.7823965" lon="34.3636034"/> <node id="522686879" lat="61.7872499" lon="34.3482506"/> <node id="522687144" lat="61.7854442" lon="34.3546809"/> <node id="522687865" lat="61.7883790" lon="34.3659850"/> <node id="522688201" lat="61.7885801" lon="34.3579531"/> <node id="522688239" lat="61.7883825" lon="34.3565295"/> <node id="522688283" lat="61.7854373" lon="34.3589705"/> <node id="522688348" lat="61.7894285" lon="34.3670956"/> <node id="522688359" lat="61.7873561" lon="34.3599352"/> <node id="522688377" lat="61.7853960" lon="34.3616710"/> <node id="522688497" lat="61.7836860" lon="34.3487967"/> <node id="522688615" lat="61.7830635" lon="34.3627250"/> <node id="522688867" lat="61.7861833" lon="34.3473706"/> <node id="522688874" lat="61.7889087" lon="34.3580706"/> <node id="522689001" lat="61.7875793" lon="34.3570410"/> <node id="522689013" lat="61.7831476" lon="34.3657646"/> <node id="522689045" lat="61.7847018" lon="34.3494442"/> <node id="522689074" lat="61.7834284" lon="34.3494498"/> <node id="522689089" lat="61.7848390" lon="34.3624870"/> <node id="522689160" lat="61.7834620" lon="34.3565546"/> <node id="522689190" lat="61.7843532" lon="34.3517305"/> <node id="522689253" lat="61.7890666" lon="34.3594867"/> <node id="522689414" lat="61.7843042" lon="34.3604677"/> <node id="522689416" lat="61.7826581" lon="34.3473808"/> <node id="522689424" lat="61.7858753" lon="34.3555208"/> <node id="522689509" lat="61.7847740" lon="34.3616710"/> <node id="522689546" lat="61.7846900" lon="34.3642880"/> <node id="522689569" lat="61.7877990" lon="34.3626210"/> <node id="522689656" lat="61.7875020" lon="34.3625140"/> <node id="522689674" lat="61.7823962" lon="34.3536250"/> <node id="522689725" lat="61.7892584" lon="34.3530171"/> <node id="522689786" lat="61.7838261" lon="34.3576675"/> <node id="522689953" lat="61.7890473" lon="34.3604725"/> <node id="522690099" lat="61.7895966" lon="34.3595139"/> <node id="522690125" lat="61.7845747" lon="34.3493248"/> <node id="522690257" lat="61.7883790" lon="34.3662260"/> <node id="522690278" lat="61.7883325" lon="34.3566826"/> <node id="522690281" lat="61.7874015" lon="34.3475145"/> <node id="522690349" lat="61.7849712" lon="34.3606734"/> <node id="522690364" lat="61.7847900" lon="34.3617780"/> <node id="522690409" lat="61.7832098" lon="34.3595460"/> <node id="522690417" lat="61.7832959" lon="34.3494899"/> <node id="522690536" lat="61.7855189" lon="34.3588516"/> <node id="522690613" lat="61.7868472" lon="34.3598344"/> <node id="522690654" lat="61.7837865" lon="34.3567739"/> <node id="522690782" lat="61.7871972" lon="34.3580374"/> <node id="522690957" lat="61.7843702" lon="34.3512913"/> <node id="522691068" lat="61.7879532" lon="34.3475051"/> <node id="522691099" lat="61.7823716" lon="34.3543527"/> <node id="522691108" lat="61.7868177" lon="34.3626371"/> <node id="522691171" lat="61.7840961" lon="34.3581540"/> <node id="522691180" lat="61.7839800" lon="34.3614453"/> <node id="522691407" lat="61.7830980" lon="34.3567670"/> <node id="522691532" lat="61.7836973" lon="34.3488359"/> <node id="522691541" lat="61.7827939" lon="34.3573170"/> <node id="522691553" lat="61.7850020" lon="34.3579415"/> <node id="522691579" lat="61.7866957" lon="34.3501186"/> <node id="522691617" lat="61.7890726" lon="34.3643099"/> <node id="522691901" lat="61.7844756" lon="34.3600353"/> <node id="522692077" lat="61.7885079" lon="34.3661625"/> <node id="522692293" lat="61.7851552" lon="34.3577819"/> <node id="522692375" lat="61.7881660" lon="34.3662260"/> <node id="522692435" lat="61.7844913" lon="34.3497234"/> <node id="522692751" lat="61.7833085" lon="34.3581778"/> <node id="522692778" lat="61.7844607" lon="34.3511554"/> <node id="522693067" lat="61.7865038" lon="34.3613573"/> <node id="522693146" lat="61.7827068" lon="34.3588446"/> <node id="522693294" lat="61.7831815" lon="34.3631079"/> <node id="522693652" lat="61.7896711" lon="34.3660609"/> <node id="522693671" lat="61.7851632" lon="34.3538218"/> <node id="522693797" lat="61.7888885" lon="34.3655367"/> <node id="522694089" lat="61.7833962" lon="34.3606397"/> <node id="522694171" lat="61.7893563" lon="34.3543484"/> <node id="522694334" lat="61.7823520" lon="34.3528510"/> <node id="522694486" lat="61.7824612" lon="34.3576745"/> <node id="522694972" lat="61.7848679" lon="34.3500122"/> <node id="522695036" lat="61.7832575" lon="34.3630030"/> <node id="522695264" lat="61.7890006" lon="34.3587126"/> <node id="522695275" lat="61.7870756" lon="34.3493473"/> <node id="522695532" lat="61.7890437" lon="34.3639287"/> <node id="522695534" lat="61.7898096" lon="34.3675516"/> <node id="522695571" lat="61.7889951" lon="34.3548104"/> <node id="522695638" lat="61.7883765" lon="34.3452096"/> <node id="522695672" lat="61.7872747" lon="34.3582831"/> <node id="522695689" lat="61.7834907" lon="34.3458505"/> <node id="522695763" lat="61.7895838" lon="34.3509562"/> <node id="522695839" lat="61.7866645" lon="34.3600524"/> <node id="522696021" lat="61.7847393" lon="34.3603746"/> <node id="522696077" lat="61.7887726" lon="34.3576645"/> <node id="522696179" lat="61.7847740" lon="34.3645740"/> <node id="522696369" lat="61.7835799" lon="34.3590343"/> <node id="522696867" lat="61.7828479" lon="34.3574934"/> <node id="522696970" lat="61.7883821" lon="34.3596298"/> <node id="522697028" lat="61.7843050" lon="34.3640590"/> <node id="522697141" lat="61.7831721" lon="34.3586345"/> <node id="522697202" lat="61.7841760" lon="34.3608932"/> <node id="522697219" lat="61.7823060" lon="34.3527030"/> <node id="522697324" lat="61.7888943" lon="34.3620595"/> <node id="522697549" lat="61.7863602" lon="34.3612668"/> <node id="522697623" lat="61.7893424" lon="34.3451750"/> <node id="522697891" lat="61.7847900" lon="34.3650890"/> <node id="522697913" lat="61.7861729" lon="34.3465369"/> <node id="522697944" lat="61.7881010" lon="34.3670150"/> <node id="522698109" lat="61.7828554" lon="34.3560133"/> <node id="522698118" lat="61.7877818" lon="34.3582214"/> <node id="522698123" lat="61.7864383" lon="34.3615030"/> <node id="522698227" lat="61.7877583" lon="34.3585672"/> <node id="522698774" lat="61.7832306" lon="34.3605340"/> <node id="522698778" lat="61.7825982" lon="34.3638860"/> <node id="522699160" lat="61.7825392" lon="34.3542729"/> <node id="522699189" lat="61.7843907" lon="34.3603632"/> <node id="522699308" lat="61.7840458" lon="34.3582237"/> <node id="522699313" lat="61.7846107" lon="34.3500909"/> <node id="522699316" lat="61.7861122" lon="34.3551999"/> <node id="522699394" lat="61.7897216" lon="34.3680016"/> <node id="522699498" lat="61.7837297" lon="34.3565930"/> <node id="522699781" lat="61.7881430" lon="34.3613770"/> <node id="522699786" lat="61.7892988" lon="34.3675328"/> <node id="522699829" lat="61.7870980" lon="34.3593826"/> <node id="522699903" lat="61.7856778" lon="34.3612890"/> <node id="522700063" lat="61.7889278" lon="34.3663510"/> <node id="522700068" lat="61.7825011" lon="34.3540739"/> <node id="522700080" lat="61.7841170" lon="34.3582213"/> <node id="522700319" lat="61.7869415" lon="34.3629869"/> <node id="522700406" lat="61.7890489" lon="34.3643424"/> <node id="522700408" lat="61.7885714" lon="34.3571216"/> <node id="522700513" lat="61.7889849" lon="34.3543256"/> <node id="522700525" lat="61.7895737" lon="34.3555652"/> <node id="522700572" lat="61.7876915" lon="34.3579304"/> <node id="522700601" lat="61.7836076" lon="34.3570247"/> <node id="522700923" lat="61.7831605" lon="34.3468834"/> <node id="522701001" lat="61.7896372" lon="34.3602509"/> <node id="522701110" lat="61.7866903" lon="34.3600187"/> <node id="522701124" lat="61.7870090" lon="34.3583031"/> <node id="522701213" lat="61.7825430" lon="34.3525960"/> <node id="522701288" lat="61.7860129" lon="34.3472391"/> <node id="522701295" lat="61.7831383" lon="34.3569522"/> <node id="522701335" lat="61.7866021" lon="34.3612120"/> <node id="522701420" lat="61.7896585" lon="34.3597169"/> <node id="522701451" lat="61.7821948" lon="34.3567574"/> <node id="522701478" lat="61.7837665" lon="34.3473635"/> <node id="522701721" lat="61.7871641" lon="34.3592962"/> <node id="522702298" lat="61.7893265" lon="34.3674085"/> <node id="522702302" lat="61.7828210" lon="34.3575302"/> <node id="522702562" lat="61.7892551" lon="34.3451283"/> <node id="522703052" lat="61.7883370" lon="34.3667140"/> <node id="522703226" lat="61.7880820" lon="34.3670990"/> <node id="522703357" lat="61.7832684" lon="34.3512667"/> <node id="522703579" lat="61.7895841" lon="34.3675132"/> <node id="522703708" lat="61.7884738" lon="34.3447576"/> <node id="522703769" lat="61.7875418" lon="34.3576769"/> <node id="522703799" lat="61.7860654" lon="34.3466828"/> <node id="522703814" lat="61.7874420" lon="34.3621915"/> <node id="522704050" lat="61.7829848" lon="34.3655448"/> <node id="522704473" lat="61.7895259" lon="34.3669681"/> <node id="522704550" lat="61.7866184" lon="34.3598938"/> <node id="522704632" lat="61.7833751" lon="34.3459826"/> <node id="522704694" lat="61.7874655" lon="34.3474278"/> <node id="522704708" lat="61.7891883" lon="34.3616515"/> <node id="522705124" lat="61.7846900" lon="34.3646960"/> <node id="522705217" lat="61.7893443" lon="34.3616095"/> <node id="522705359" lat="61.7846480" lon="34.3647460"/> <node id="522705417" lat="61.7820497" lon="34.3567103"/> <node id="522705439" lat="61.7848693" lon="34.3557417"/> <node id="522705544" lat="61.7893119" lon="34.3512890"/> <node id="522705908" lat="61.7900463" lon="34.3660612"/> <node id="522705919" lat="61.7846900" lon="34.3617210"/> <node id="522706362" lat="61.7882829" lon="34.3461090"/> <node id="522706541" lat="61.7893684" lon="34.3449572"/> <node id="522706574" lat="61.7855490" lon="34.3604040"/> <node id="522706743" lat="61.7882230" lon="34.3670570"/> <node id="522706921" lat="61.7889593" lon="34.3622965"/> <node id="522706950" lat="61.7841162" lon="34.3584506"/> <node id="522706964" lat="61.7880590" lon="34.3670990"/> <node id="522707110" lat="61.7842808" lon="34.3599558"/> <node id="522707286" lat="61.7879012" lon="34.3472078"/> <node id="522707357" lat="61.7838035" lon="34.3608585"/> <node id="522707560" lat="61.7888753" lon="34.3617165"/> <node id="522707561" lat="61.7887281" lon="34.3580898"/> <node id="522707623" lat="61.7852787" lon="34.3551764"/> <node id="522707726" lat="61.7877624" lon="34.3563328"/> <node id="522707842" lat="61.7889501" lon="34.3591177"/> <node id="522708245" lat="61.7823705" lon="34.3542688"/> <node id="522708253" lat="61.7892124" lon="34.3538723"/> <node id="522708274" lat="61.7893018" lon="34.3591814"/> <node id="522708457" lat="61.7829130" lon="34.3507587"/> <node id="522708562" lat="61.7820561" lon="34.3610897"/> <node id="522708616" lat="61.7859870" lon="34.3472743"/> <node id="522708670" lat="61.7889432" lon="34.3587969"/> <node id="522709022" lat="61.7876421" lon="34.3614809"/> <node id="522709051" lat="61.7895348" lon="34.3561060"/> <node id="522709107" lat="61.7850795" lon="34.3581835"/> <node id="522709283" lat="61.7892503" lon="34.3544912"/> <node id="522709513" lat="61.7881909" lon="34.3584800"/> <node id="522709792" lat="61.7876205" lon="34.3603464"/> <node id="522709833" lat="61.7897226" lon="34.3646429"/> <node id="522709889" lat="61.7861475" lon="34.3472526"/> <node id="522710091" lat="61.7867302" lon="34.3611530"/> <node id="522710303" lat="61.7877490" lon="34.3474219"/> <node id="522710377" lat="61.7858500" lon="34.3613510"/> <node id="522710635" lat="61.7849385" lon="34.3559596"/> <node id="522710650" lat="61.7848810" lon="34.3648910"/> <node id="522710890" lat="61.7868728" lon="34.3506025"/> <node id="522711068" lat="61.7888875" lon="34.3544589"/> <node id="522711112" lat="61.7893778" lon="34.3509633"/> <node id="522711123" lat="61.7865715" lon="34.3476603"/> <node id="522711195" lat="61.7880590" lon="34.3612480"/> <node id="522711290" lat="61.7879509" lon="34.3473660"/> <node id="522711317" lat="61.7891962" lon="34.3584363"/> <node id="522711321" lat="61.7832736" lon="34.3492395"/> <node id="522711368" lat="61.7889883" lon="34.3583569"/> <node id="522711516" lat="61.7844525" lon="34.3594537"/> <node id="522711534" lat="61.7855648" lon="34.3574880"/> <node id="522711916" lat="61.7877821" lon="34.3563987"/> <node id="522712098" lat="61.7854610" lon="34.3618850"/> <node id="522712183" lat="61.7881010" lon="34.3635440"/> <node id="522712343" lat="61.7845504" lon="34.3517188"/> <node id="522712825" lat="61.7890013" lon="34.3604495"/> <node id="522712868" lat="61.7889652" lon="34.3643159"/> <node id="522713115" lat="61.7869819" lon="34.3615376"/> <node id="522713300" lat="61.7844578" lon="34.3493581"/> <node id="522713326" lat="61.7829727" lon="34.3620844"/> <node id="522713445" lat="61.7845380" lon="34.3644670"/> <node id="522713606" lat="61.7851180" lon="34.3624070"/> <node id="522713946" lat="61.7880820" lon="34.3634940"/> <node id="522714152" lat="61.7895723" lon="34.3600413"/> <node id="522714172" lat="61.7892813" lon="34.3651074"/> <node id="522714218" lat="61.7888163" lon="34.3587099"/> <node id="522714291" lat="61.7892811" lon="34.3449105"/> <node id="522714653" lat="61.7871962" lon="34.3515785"/> <node id="522714700" lat="61.7899211" lon="34.3504531"/> <node id="522714782" lat="61.7890925" lon="34.3546770"/> <node id="522715080" lat="61.7887799" lon="34.3582443"/> <node id="522715108" lat="61.7896796" lon="34.3554225"/> <node id="522715111" lat="61.7841606" lon="34.3516233"/> <node id="522715217" lat="61.7895413" lon="34.3579919"/> <node id="522715305" lat="61.7856330" lon="34.3606410"/> <node id="522715368" lat="61.7861772" lon="34.3554147"/> <node id="522715715" lat="61.7869820" lon="34.3592165"/> <node id="522715899" lat="61.7827283" lon="34.3621962"/> <node id="522716151" lat="61.7835843" lon="34.3474785"/> <node id="522716204" lat="61.7836431" lon="34.3614300"/> <node id="522716335" lat="61.7848620" lon="34.3648260"/> <node id="522716615" lat="61.7835117" lon="34.3493412"/> <node id="522716815" lat="61.7893855" lon="34.3534183"/> <node id="522716940" lat="61.7836669" lon="34.3588522"/> <node id="522717003" lat="61.7828210" lon="34.3545530"/> <node id="522717037" lat="61.7888030" lon="34.3571491"/> <node id="522717061" lat="61.7849040" lon="34.3626860"/> <node id="522717230" lat="61.7874620" lon="34.3477144"/> <node id="522717268" lat="61.7884484" lon="34.3659672"/> <node id="522717337" lat="61.7891961" lon="34.3637315"/> <node id="522717339" lat="61.7897109" lon="34.3611730"/> <node id="522717362" lat="61.7890378" lon="34.3663477"/> <node id="522717388" lat="61.7825226" lon="34.3541392"/> <node id="522717461" lat="61.7877790" lon="34.3475348"/> <node id="522717525" lat="61.7862496" lon="34.3467896"/> <node id="522717779" lat="61.7868672" lon="34.3594153"/> <node id="522718015" lat="61.7888500" lon="34.3652001"/> <node id="522718025" lat="61.7899433" lon="34.3657119"/> <node id="522718441" lat="61.7868352" lon="34.3517411"/> <node id="522718754" lat="61.7855005" lon="34.3572871"/> <node id="522718771" lat="61.7821080" lon="34.3540493"/> <node id="522718802" lat="61.7849850" lon="34.3594389"/> <node id="522718857" lat="61.7840169" lon="34.3573897"/> <node id="522719141" lat="61.7879018" lon="34.3554987"/> <node id="522719240" lat="61.7881010" lon="34.3670570"/> <node id="522719264" lat="61.7892611" lon="34.3511272"/> <node id="522719283" lat="61.7878234" lon="34.3632056"/> <node id="522719293" lat="61.7889363" lon="34.3605145"/> <node id="522719565" lat="61.7844310" lon="34.3638610"/> <node id="522719652" lat="61.7896577" lon="34.3612480"/> <node id="522719655" lat="61.7892063" lon="34.3668427"/> <node id="522720161" lat="61.7835929" lon="34.3651058"/> <node id="522720306" lat="61.7895564" lon="34.3665475"/> <node id="522720660" lat="61.7857587" lon="34.3585588"/> <node id="522720835" lat="61.7886991" lon="34.3643437"/> <node id="522721335" lat="61.7866619" lon="34.3587952"/> <node id="522721347" lat="61.7888522" lon="34.3655866"/> <node id="522722508" lat="61.7847740" lon="34.3612630"/> <node id="522722855" lat="61.7844765" lon="34.3494213"/> <node id="522723024" lat="61.7875516" lon="34.3473204"/> <node id="522723353" lat="61.7891648" lon="34.3598114"/> <node id="522723362" lat="61.7832626" lon="34.3503217"/> <node id="522723520" lat="61.7887799" lon="34.3580121"/> <node id="522723691" lat="61.7832994" lon="34.3574444"/> <node id="522723741" lat="61.7869398" lon="34.3516003"/> <node id="522723816" lat="61.7874784" lon="34.3574702"/> <node id="522723863" lat="61.7847550" lon="34.3644180"/> <node id="522723927" lat="61.7879382" lon="34.3554467"/> <node id="522724008" lat="61.7891324" lon="34.3642355"/> <node id="522724034" lat="61.7892183" lon="34.3617015"/> <node id="522724090" lat="61.7874854" lon="34.3614628"/> <node id="522724095" lat="61.7823838" lon="34.3543347"/> <node id="522724133" lat="61.7888710" lon="34.3652746"/> <node id="522724340" lat="61.7894174" lon="34.3557119"/> <node id="522724390" lat="61.7847217" lon="34.3502187"/> <node id="522724496" lat="61.7865075" lon="34.3627269"/> <node id="522724518" lat="61.7882100" lon="34.3458623"/> <node id="522724793" lat="61.7837483" lon="34.3606839"/> <node id="522724804" lat="61.7848001" lon="34.3500616"/> <node id="522724891" lat="61.7891507" lon="34.3649213"/> <node id="522724981" lat="61.7849682" lon="34.3633847"/> <node id="522725175" lat="61.7873450" lon="34.3502580"/> <node id="522725277" lat="61.7895244" lon="34.3507373"/> <node id="522725431" lat="61.7870193" lon="34.3573537"/> <node id="522725762" lat="61.7847900" lon="34.3645470"/> <node id="522725805" lat="61.7866157" lon="34.3612532"/> <node id="522726160" lat="61.7887119" lon="34.3583463"/> <node id="522726185" lat="61.7852890" lon="34.3600040"/> <node id="522726494" lat="61.7880405" lon="34.3554025"/> <node id="522726629" lat="61.7848757" lon="34.3608079"/> <node id="522726650" lat="61.7893450" lon="34.3674653"/> <node id="522726748" lat="61.7847320" lon="34.3616710"/> <node id="522726765" lat="61.7898026" lon="34.3610388"/> <node id="522726829" lat="61.7861792" lon="34.3468189"/> <node id="522726844" lat="61.7894016" lon="34.3678456"/> <node id="522727315" lat="61.7835942" lon="34.3603973"/> <node id="522727474" lat="61.7889823" lon="34.3612435"/> <node id="522727688" lat="61.7895316" lon="34.3676736"/> <node id="522727799" lat="61.7850702" lon="34.3601127"/> <node id="522727931" lat="61.7824775" lon="34.3519447"/> <node id="522728000" lat="61.7842056" lon="34.3579923"/> <node id="522728220" lat="61.7832431" lon="34.3493910"/> <node id="522728282" lat="61.7893650" lon="34.3673523"/> <node id="522728315" lat="61.7833003" lon="34.3621700"/> <node id="522728394" lat="61.7851421" lon="34.3577407"/> <node id="522728792" lat="61.7825042" lon="34.3541662"/> <node id="522728901" lat="61.7832903" lon="34.3467106"/> <node id="522728919" lat="61.7866305" lon="34.3502560"/> <node id="522729001" lat="61.7876717" lon="34.3454459"/> <node id="522729068" lat="61.7861258" lon="34.3468914"/> <node id="522729326" lat="61.7833716" lon="34.3562952"/> <node id="522729346" lat="61.7827891" lon="34.3583056"/> <node id="522729564" lat="61.7834425" lon="34.3579587"/> <node id="522729722" lat="61.7877235" lon="34.3631444"/> <node id="522730126" lat="61.7892633" lon="34.3586698"/> <node id="522730313" lat="61.7887414" lon="34.3646226"/> <node id="522730321" lat="61.7885123" lon="34.3597493"/> <node id="522730401" lat="61.7879222" lon="34.3474065"/> <node id="522730466" lat="61.7881940" lon="34.3447755"/> <node id="522730744" lat="61.7849040" lon="34.3648680"/> <node id="522730889" lat="61.7846030" lon="34.3647840"/> <node id="522731070" lat="61.7872805" lon="34.3500464"/> <node id="522731485" lat="61.7880820" lon="34.3681940"/> <node id="522731623" lat="61.7847090" lon="34.3619340"/> <node id="522731819" lat="61.7876169" lon="34.3512406"/> <node id="522731890" lat="61.7877258" lon="34.3456345"/> <node id="522731936" lat="61.7830866" lon="34.3513360"/> <node id="522732280" lat="61.7857202" lon="34.3586150"/> <node id="522732373" lat="61.7874804" lon="34.3567092"/> <node id="522732397" lat="61.7853433" lon="34.3553865"/> <node id="522732401" lat="61.7875741" lon="34.3613651"/> <node id="522732469" lat="61.7845464" lon="34.3593217"/> <node id="522732494" lat="61.7893445" lon="34.3668687"/> <node id="522732500" lat="61.7889857" lon="34.3661532"/> <node id="522732542" lat="61.7879492" lon="34.3583022"/> <node id="522733067" lat="61.7832321" lon="34.3592801"/> <node id="522733593" lat="61.7867048" lon="34.3613456"/> <node id="522733596" lat="61.7853770" lon="34.3598740"/> <node id="522733698" lat="61.7882230" lon="34.3670150"/> <node id="522733708" lat="61.7878563" lon="34.3629652"/> <node id="522733788" lat="61.7896015" lon="34.3661526"/> <node id="522733795" lat="61.7837512" lon="34.3494788"/> <node id="522734035" lat="61.7861935" lon="34.3468658"/> <node id="522734293" lat="61.7876146" lon="34.3472352"/> <node id="522734361" lat="61.7837457" lon="34.3630640"/> <node id="522734497" lat="61.7880864" lon="34.3462415"/> <node id="522734852" lat="61.7879710" lon="34.3667140"/> <node id="522735082" lat="61.7835509" lon="34.3615590"/> <node id="522735202" lat="61.7823467" lon="34.3541964"/> <node id="522735390" lat="61.7855260" lon="34.3607970"/> <node id="522735463" lat="61.7842348" lon="34.3610737"/> <node id="522735499" lat="61.7881660" lon="34.3659850"/> <node id="522735511" lat="61.7848950" lon="34.3595686"/> <node id="522735535" lat="61.7864487" lon="34.3625528"/> <node id="522735669" lat="61.7833325" lon="34.3519626"/> <node id="522735880" lat="61.7875023" lon="34.3599793"/> <node id="522735941" lat="61.7875303" lon="34.3604763"/> <node id="522736499" lat="61.7828831" lon="34.3480560"/> <node id="522736507" lat="61.7870970" lon="34.3590663"/> <node id="522736703" lat="61.7823210" lon="34.3533967"/> <node id="522737046" lat="61.7887660" lon="34.3653153"/> <node id="522737083" lat="61.7896997" lon="34.3661579"/> <node id="522737125" lat="61.7844229" lon="34.3494925"/> <node id="522737142" lat="61.7839980" lon="34.3603305"/> <node id="522737170" lat="61.7848348" lon="34.3602401"/> <node id="522737207" lat="61.7866282" lon="34.3510261"/> <node id="522737641" lat="61.7855505" lon="34.3589486"/> <node id="522738055" lat="61.7890473" lon="34.3608355"/> <node id="522738272" lat="61.7880723" lon="34.3553571"/> <node id="522738370" lat="61.7882481" lon="34.3449640"/> <node id="522738545" lat="61.7844460" lon="34.3645740"/> <node id="522739135" lat="61.7886163" lon="34.3617435"/> <node id="522739151" lat="61.7822262" lon="34.3567166"/> <node id="522739655" lat="61.7875425" lon="34.3614483"/> <node id="522739683" lat="61.7894286" lon="34.3511251"/> <node id="522739739" lat="61.7826372" lon="34.3603280"/> <node id="522739915" lat="61.7882080" lon="34.3633880"/> <node id="522739931" lat="61.7874387" lon="34.3469475"/> <node id="522740112" lat="61.7824378" lon="34.3518310"/> <node id="522740290" lat="61.7834116" lon="34.3655697"/> <node id="522740319" lat="61.7845230" lon="34.3601862"/> <node id="522740426" lat="61.7834708" lon="34.3605354"/> <node id="522740604" lat="61.7844625" lon="34.3515665"/> <node id="522740684" lat="61.7832792" lon="34.3597742"/> <node id="522740827" lat="61.7889823" lon="34.3608355"/> <node id="522740887" lat="61.7840676" lon="34.3585828"/> <node id="522741123" lat="61.7893794" lon="34.3647144"/> <node id="522741136" lat="61.7875161" lon="34.3619662"/> <node id="522741311" lat="61.7895752" lon="34.3505685"/> <node id="522741357" lat="61.7847320" lon="34.3644670"/> <node id="522741611" lat="61.7837314" lon="34.3590569"/> <node id="522741740" lat="61.7830746" lon="34.3600529"/> <node id="522741869" lat="61.7867512" lon="34.3618064"/> <node id="522742063" lat="61.7848097" lon="34.3500926"/> <node id="522742283" lat="61.7842558" lon="34.3580187"/> <node id="522742491" lat="61.7867623" lon="34.3595610"/> <node id="522742631" lat="61.7889173" lon="34.3605565"/> <node id="522742915" lat="61.7830030" lon="34.3580128"/> <node id="522743702" lat="61.7834379" lon="34.3518177"/> <node id="522743736" lat="61.7893965" lon="34.3658597"/> <node id="522743775" lat="61.7876001" lon="34.3580574"/> <node id="522743949" lat="61.7841494" lon="34.3581763"/> <node id="522744057" lat="61.7828110" lon="34.3508959"/> <node id="522744194" lat="61.7841943" lon="34.3600603"/> <node id="522744495" lat="61.7860582" lon="34.3483772"/> <node id="522744535" lat="61.7843076" lon="34.3520614"/> <node id="522744799" lat="61.7877550" lon="34.3564348"/> <node id="522745013" lat="61.7879354" lon="34.3542937"/> <node id="522745166" lat="61.7898740" lon="34.3616900"/> <node id="522745246" lat="61.7890536" lon="34.3663999"/> <node id="522745364" lat="61.7832689" lon="34.3567609"/> <node id="522745431" lat="61.7889032" lon="34.3675082"/> <node id="522745531" lat="61.7877563" lon="34.3629040"/> <node id="522745551" lat="61.7866886" lon="34.3617963"/> <node id="522745862" lat="61.7870724" lon="34.3595262"/> <node id="522746049" lat="61.7848857" lon="34.3631412"/> <node id="522746159" lat="61.7869374" lon="34.3508141"/> <node id="522746311" lat="61.7853120" lon="34.3618270"/> <node id="522746411" lat="61.7895086" lon="34.3681736"/> <node id="522746504" lat="61.7824636" lon="34.3540245"/> <node id="522746702" lat="61.7891443" lon="34.3588325"/> <node id="522746880" lat="61.7824208" lon="34.3544471"/> <node id="522746921" lat="61.7845840" lon="34.3628570"/> <node id="522747072" lat="61.7829135" lon="34.3619119"/> <node id="522747141" lat="61.7881240" lon="34.3632580"/> <node id="522747992" lat="61.7874588" lon="34.3512319"/> <node id="522748106" lat="61.7852841" lon="34.3588395"/> <node id="522748267" lat="61.7849040" lon="34.3616710"/> <node id="522748502" lat="61.7855549" lon="34.3545225"/> <node id="522748585" lat="61.7835987" lon="34.3461672"/> <node id="522748671" lat="61.7833660" lon="34.3654246"/> <node id="522749017" lat="61.7891979" lon="34.3599254"/> <node id="522749081" lat="61.7896516" lon="34.3644191"/> <node id="522749433" lat="61.7829701" lon="34.3656740"/> <node id="522749661" lat="61.7851602" lon="34.3599831"/> <node id="522749921" lat="61.7844219" lon="34.3520555"/> <node id="522749937" lat="61.7840532" lon="34.3605051"/> <node id="522750083" lat="61.7893252" lon="34.3672302"/> <node id="522750102" lat="61.7841264" lon="34.3581021"/> <node id="522750447" lat="61.7873034" lon="34.3478857"/> <node id="522750666" lat="61.7828027" lon="34.3478663"/> <node id="522750766" lat="61.7880285" lon="34.3609500"/> <node id="522751029" lat="61.7873122" lon="34.3484567"> <tag k="shop" v="hunting"/> </node> <node id="522751501" lat="61.7847090" lon="34.3617630"/> <node id="522751521" lat="61.7840847" lon="34.3596751"/> <node id="522751872" lat="61.7869521" lon="34.3596888"/> <node id="522752201" lat="61.7872470" lon="34.3615700"/> <node id="522752371" lat="61.7901369" lon="34.3587763"/> <node id="522752391" lat="61.7876731" lon="34.3474284"/> <node id="522752473" lat="61.7888827" lon="34.3586125"/> <node id="522752500" lat="61.7892793" lon="34.3616095"/> <node id="522752710" lat="61.7888278" lon="34.3651276"/> <node id="522752777" lat="61.7829870" lon="34.3479196"/> <node id="522753542" lat="61.7819686" lon="34.3607912"/> <node id="522753872" lat="61.7852576" lon="34.3555063"/> <node id="522754355" lat="61.7895410" lon="34.3510081"/> <node id="522754408" lat="61.7848620" lon="34.3647840"/> <node id="522754792" lat="61.7852341" lon="34.3540236"/> <node id="522754869" lat="61.7892848" lon="34.3640383"/> <node id="522755062" lat="61.7885366" lon="34.3645664"/> <node id="522755554" lat="61.7889178" lon="34.3584603"/> <node id="522755948" lat="61.7846030" lon="34.3644180"/> <node id="522756246" lat="61.7880315" lon="34.3587010"/> <node id="522756355" lat="61.7872199" lon="34.3480019"/> <node id="522756577" lat="61.7899011" lon="34.3658922"/> <node id="522756604" lat="61.7879290" lon="34.3681940"/> <node id="522756726" lat="61.7824780" lon="34.3553190"/> <node id="522756833" lat="61.7879100" lon="34.3668440"/> <node id="522757157" lat="61.7827801" lon="34.3587447"/> <node id="522757184" lat="61.7875847" lon="34.3616319"/> <node id="522758019" lat="61.7896156" lon="34.3678036"/> <node id="522758107" lat="61.7845488" lon="34.3492374"/> <node id="522758532" lat="61.7860650" lon="34.3475313"/> <node id="522758836" lat="61.7843564" lon="34.3581172"/> <node id="522758865" lat="61.7848610" lon="34.3635472"/> <node id="522758927" lat="61.7820328" lon="34.3538210"/> <node id="522758968" lat="61.7882863" lon="34.3567486"/> <node id="522759115" lat="61.7896969" lon="34.3645625"/> <node id="522759167" lat="61.7893395" lon="34.3656720"/> <node id="522759272" lat="61.7893745" lon="34.3667854"/> <node id="522759707" lat="61.7891150" lon="34.3669669"/> <node id="522760059" lat="61.7875112" lon="34.3613951"/> <node id="522760196" lat="61.7836168" lon="34.3577042"/> <node id="522760232" lat="61.7856181" lon="34.3547094"/> <node id="522760264" lat="61.7888443" lon="34.3617015"/> <node id="522760491" lat="61.7892405" lon="34.3673539"/> <node id="522760508" lat="61.7866404" lon="34.3499354"/> <node id="522760726" lat="61.7849040" lon="34.3649550"/> <node id="522760980" lat="61.7840030" lon="34.3583781"/> <node id="522761215" lat="61.7829846" lon="34.3514732"/> <node id="522761381" lat="61.7824170" lon="34.3551330"/> <node id="522761438" lat="61.7824868" lon="34.3540950"/> <node id="522761537" lat="61.7835900" lon="34.3489207"> <tag k="amenity" v="bank"/> <tag k="atm" v="yes"/> <tag k="name" v="Сбербанк"/> <tag k="operator" v="Сбербанк"/> <tag k="website" v="http://sberbank.ru/"/> </node> <node id="522761833" lat="61.7852710" lon="34.3536697"/> <node id="522761934" lat="61.7857759" lon="34.3586115"/> <node id="522762063" lat="61.7866230" lon="34.3622896"/> <node id="522762190" lat="61.7845825" lon="34.3518145"/> <node id="522762252" lat="61.7853448" lon="34.3538652"/> <node id="522762416" lat="61.7842302" lon="34.3470152"/> <node id="522762433" lat="61.7897066" lon="34.3665093"/> <node id="522762643" lat="61.7875687" lon="34.3544547"/> <node id="522762726" lat="61.7870544" lon="34.3613253"/> <node id="522762970" lat="61.7863606" lon="34.3506264"/> <node id="522762997" lat="61.7880117" lon="34.3592457"/> <node id="522763035" lat="61.7856441" lon="34.3592170"/> <node id="522763191" lat="61.7879379" lon="34.3510953"/> <node id="522763245" lat="61.7891668" lon="34.3537282"/> <node id="522763480" lat="61.7892665" lon="34.3559131"/> <node id="522763574" lat="61.7865353" lon="34.3507234"/> <node id="522763698" lat="61.7876841" lon="34.3514536"/> <node id="522764006" lat="61.7894093" lon="34.3615445"/> <node id="522764060" lat="61.7885358" lon="34.3575306"/> <node id="522764135" lat="61.7878413" lon="34.3477409"/> <node id="522764252" lat="61.7897433" lon="34.3611226"/> <node id="522764293" lat="61.7846480" lon="34.3647840"/> <node id="522764399" lat="61.7896085" lon="34.3582255"/> <node id="522764515" lat="61.7880898" lon="34.3588621"/> <node id="522764568" lat="61.7871332" lon="34.3473390"/> <node id="522764662" lat="61.7874004" lon="34.3510337"/> <node id="522764691" lat="61.7894816" lon="34.3507892"/> <node id="522764921" lat="61.7872828" lon="34.3580326"/> <node id="522765032" lat="61.7825773" lon="34.3576134"/> <node id="522765035" lat="61.7871729" lon="34.3617953"/> <node id="522765396" lat="61.7878828" lon="34.3566360"/> <node id="522765628" lat="61.7865261" lon="34.3511661"/> <node id="522765729" lat="61.7850506" lon="34.3621801"/> <node id="522765771" lat="61.7860983" lon="34.3471918"/> <node id="522765799" lat="61.7899868" lon="34.3639389"/> <node id="522765808" lat="61.7870497" lon="34.3474553"/> <node id="522765865" lat="61.7846900" lon="34.3618010"/> <node id="522765885" lat="61.7829525" lon="34.3578475"/> <node id="522765990" lat="61.7884264" lon="34.3564669"/> <node id="522766146" lat="61.7889546" lon="34.3640345"/> <node id="522766214" lat="61.7853797" lon="34.3587055"/> <node id="522766246" lat="61.7828357" lon="34.3481191"/> <node id="522766362" lat="61.7864363" lon="34.3581769"/> <node id="522766677" lat="61.7855583" lon="34.3593420"/> <node id="522766785" lat="61.7824641" lon="34.3634987"/> <node id="522766922" lat="61.7898655" lon="34.3677641"/> <node id="522766964" lat="61.7823657" lon="34.3577985"/> <node id="522767115" lat="61.7896309" lon="34.3643542"/> <node id="522767290" lat="61.7848082" lon="34.3498184"/> <node id="522767520" lat="61.7881432" lon="34.3611058"/> <node id="522767545" lat="61.7887237" lon="34.3655919"/> <node id="522767656" lat="61.7895712" lon="34.3605774"/> <node id="522767737" lat="61.7878813" lon="34.3580833"/> <node id="522767759" lat="61.7888775" lon="34.3652958"/> <node id="522767958" lat="61.7845863" lon="34.3598798"/> <node id="522768182" lat="61.7867056" lon="34.3611203"/> <node id="522768210" lat="61.7871309" lon="34.3495305"/> <node id="522768305" lat="61.7838472" lon="34.3493548"/> <node id="522768520" lat="61.7892540" lon="34.3650182"/> <node id="522768821" lat="61.7827787" lon="34.3472201"/> <node id="522768840" lat="61.7878559" lon="34.3540446"/> <node id="522768921" lat="61.7866818" lon="34.3624637"/> <node id="522769790" lat="61.7893419" lon="34.3603609"/> <node id="522769899" lat="61.7895656" lon="34.3682116"/> <node id="522770076" lat="61.7828199" lon="34.3478435"/> <node id="522770099" lat="61.7832972" lon="34.3493205"/> <node id="522770123" lat="61.7883370" lon="34.3670340"/> <node id="522770296" lat="61.7878707" lon="34.3508823"/> <node id="522770325" lat="61.7835133" lon="34.3601514"/> <node id="522770918" lat="61.7871251" lon="34.3522165"/> <node id="522771169" lat="61.7850338" lon="34.3529178"/> <node id="522771279" lat="61.7822856" lon="34.3565329"/> <node id="522771280" lat="61.7892270" lon="34.3597307"/> <node id="522771453" lat="61.7828006" lon="34.3558329"/> <node id="522771464" lat="61.7832228" lon="34.3462150"/> <node id="522771838" lat="61.7846030" lon="34.3646540"/> <node id="522772070" lat="61.7831683" lon="34.3597196"/> <node id="522772179" lat="61.7887080" lon="34.3643727"/> <node id="522772564" lat="61.7839571" lon="34.3572060"/> <node id="522772640" lat="61.7851884" lon="34.3552884"/> <node id="522772748" lat="61.7834246" lon="34.3490425"/> <node id="522772908" lat="61.7829282" lon="34.3578807"/> <node id="522773101" lat="61.7900583" lon="34.3641620"/> <node id="522773305" lat="61.7893840" lon="34.3563072"/> <node id="522773326" lat="61.7888360" lon="34.3581796"/> <node id="522773441" lat="61.7827875" lon="34.3623688"/> <node id="522773478" lat="61.7835087" lon="34.3472248"/> <node id="522773591" lat="61.7834735" lon="34.3456939"/> <node id="522773702" lat="61.7834931" lon="34.3463285"/> <node id="522773750" lat="61.7865090" lon="34.3474601"/> <node id="522773929" lat="61.7897664" lon="34.3672686"/> <node id="522773963" lat="61.7853770" lon="34.3620370"/> <node id="522774204" lat="61.7835232" lon="34.3564250"/> <node id="522774473" lat="61.7834619" lon="34.3472871"/> <node id="522774581" lat="61.7901988" lon="34.3589793"/> <node id="522774695" lat="61.7875210" lon="34.3622780"/> <node id="522774751" lat="61.7888943" lon="34.3611595"/> <node id="522774753" lat="61.7831631" lon="34.3514116"/> <node id="522774979" lat="61.7845190" lon="34.3616290"/> <node id="522775689" lat="61.7867390" lon="34.3590395"/> <node id="522775727" lat="61.7831131" lon="34.3584316"/> <node id="522775773" lat="61.7839212" lon="34.3612648"/> <node id="522775903" lat="61.7849260" lon="34.3530699"/> <node id="522776342" lat="61.7894302" lon="34.3596240"/> <node id="522776482" lat="61.7842264" lon="34.3580594"/> <node id="522776614" lat="61.7823485" lon="34.3519708"/> <node id="522776645" lat="61.7831395" lon="34.3626201"/> <node id="522776872" lat="61.7825497" lon="34.3600295"/> <node id="522777093" lat="61.7836731" lon="34.3578767"/> <node id="522777157" lat="61.7889931" lon="34.3673851"/> <node id="522777669" lat="61.7846480" lon="34.3630440"/> <node id="522777680" lat="61.7847090" lon="34.3618850"/> <node id="522777911" lat="61.7835309" lon="34.3564471"/> <node id="522777924" lat="61.7847276" lon="34.3598987"/> <node id="522778252" lat="61.7846260" lon="34.3620370"/> <node id="522778485" lat="61.7887245" lon="34.3569030"/> <node id="522778968" lat="61.7865463" lon="34.3599877"/> <node id="522779419" lat="61.7897216" lon="34.3679526"/> <node id="522779438" lat="61.7866248" lon="34.3608757"/> <node id="522779496" lat="61.7889351" lon="34.3534754"/> <node id="522779774" lat="61.7847111" lon="34.3501844"/> <node id="522779883" lat="61.7833975" lon="34.3603007"/> <node id="522779892" lat="61.7823882" lon="34.3520845"/> <node id="522779987" lat="61.7867222" lon="34.3601282"/> <node id="522780352" lat="61.7834989" lon="34.3581313"/> <node id="522780613" lat="61.7842815" lon="34.3578757"/> <node id="522780833" lat="61.7845840" lon="34.3647190"/> <node id="522780868" lat="61.7865146" lon="34.3613901"/> <node id="522781032" lat="61.7847785" lon="34.3633037"/> <node id="522781194" lat="61.7883079" lon="34.3449731"/> <node id="522781376" lat="61.7829118" lon="34.3483744"/> <node id="522781515" lat="61.7895506" lon="34.3677806"/> <node id="522781541" lat="61.7840038" lon="34.3594292"/> <node id="522781610" lat="61.7877646" lon="34.3545376"/> <node id="522781612" lat="61.7878514" lon="34.3565309"/> <node id="522781841" lat="61.7891721" lon="34.3595414"/> <node id="522781850" lat="61.7894459" lon="34.3649221"/> <node id="522782073" lat="61.7892791" lon="34.3649838"/> <node id="522782247" lat="61.7834300" lon="34.3572531"/> <node id="584905191" lat="61.7887832" lon="34.3657872"/> <node id="610234788" lat="61.7884259" lon="34.3592237"> <tag k="amenity" v="pub"/> <tag k="name" v="Нойбранденбург"/> <tag k="name:en" v="Neubrandenburg"/> <tag k="opening_hours" v="Mo-Sa 10:00-01:00; Su 10:00-02:00"/> </node> <node id="613705851" lat="61.7850811" lon="34.3581916"/> <node id="613705853" lat="61.7851767" lon="34.3580575"/> <node id="613705855" lat="61.7858785" lon="34.3587527"/> <node id="613705856" lat="61.7858143" lon="34.3585556"/> <node id="614308240" lat="61.7891694" lon="34.3679614"/> <node id="614308242" lat="61.7890795" lon="34.3680845"/> <node id="1163003858" lat="61.7872399" lon="34.3534290"> <tag k="addr:housenumber" v="28"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="name" v="Ленторг"/> <tag k="shop" v="convenience"/> </node> <node id="1335828029" lat="61.7830521" lon="34.3599789"> <tag k="amenity" v="public_building"/> <tag k="name" v="Паспортная служба"/> </node> <node id="1335828030" lat="61.7835335" lon="34.3623936"> <tag k="amenity" v="courthouse"/> <tag k="name" v="Петрозаводский гарнизонный военный суд"/> </node> <node id="1335828034" lat="61.7885256" lon="34.3596159"> <tag k="name" v="Экслибрис"/> <tag k="name:en" v="Ex Libris"/> <tag k="opening_hours" v="Mo-Fr 10:00-19:00; Sa-Su 11:00-18:00"/> <tag k="shop" v="books"/> </node> <node id="1335828062" lat="61.7895739" lon="34.3609823"> <tag k="amenity" v="cafe"/> <tag k="cuisine" v="international"/> <tag k="int_name" v="Deja Vu"/> <tag k="name" v="Дежавю"/> <tag k="website" v="http://dejavu.petrofood.ru/"/> <tag k="wifi" v="free"/> </node> <node id="1406160467" lat="61.7869983" lon="34.3522865"> <tag k="amenity" v="pharmacy"/> </node> <node id="1406172284" lat="61.7867302" lon="34.3446330"> <tag k="name" v="Медтехторг"/> <tag k="shop" v="electronics"/> </node> <node id="1406758060" lat="61.7827067" lon="34.3484793"/> <node id="1406758062" lat="61.7827494" lon="34.3484165"/> <node id="1406758063" lat="61.7827532" lon="34.3486205"/> <node id="1406758064" lat="61.7827959" lon="34.3485577"/> <node id="1406758067" lat="61.7831953" lon="34.3500907"/> <node id="1406758068" lat="61.7833341" lon="34.3500465"/> <node id="1406758069" lat="61.7833841" lon="34.3502181"/> <node id="1406758070" lat="61.7833951" lon="34.3498301"/> <node id="1692701788" lat="61.7864208" lon="34.3655544"/> <node id="1692701814" lat="61.7868067" lon="34.3650164"/> <node id="1740301808" lat="61.7815880" lon="34.3671448"/> <node id="1740301809" lat="61.7815969" lon="34.3673831"/> <node id="1740301811" lat="61.7816004" lon="34.3668400"/> <node id="1740301828" lat="61.7816241" lon="34.3676239"/> <node id="1740301832" lat="61.7816418" lon="34.3666032"/> <node id="1740301835" lat="61.7816643" lon="34.3678394"/> <node id="1740301839" lat="61.7817040" lon="34.3663926"/> <node id="1740301842" lat="61.7817151" lon="34.3670323"/> <node id="1740301843" lat="61.7817161" lon="34.3673967"/> <node id="1740301847" lat="61.7817605" lon="34.3666925"/> <node id="1740301848" lat="61.7817620" lon="34.3661083"/> <node id="1740301861" lat="61.7817637" lon="34.3677052"/> <node id="1740301864" lat="61.7817701" lon="34.3681389"/> <node id="1740301868" lat="61.7817962" lon="34.3661919"/> <node id="1740301872" lat="61.7818155" lon="34.3665069"/> <node id="1740301883" lat="61.7818779" lon="34.3680093"/> <node id="1740301885" lat="61.7818928" lon="34.3658458"/> <node id="1740301895" lat="61.7819677" lon="34.3662275"/> <node id="1740301897" lat="61.7819741" lon="34.3656070"/> <node id="1740301899" lat="61.7819844" lon="34.3657569"/> <node id="1740301904" lat="61.7821171" lon="34.3654759"/> <node id="1740301907" lat="61.7821500" lon="34.3656662"/> <node id="1740301908" lat="61.7821665" lon="34.3660643"/> <node id="1740301914" lat="61.7822912" lon="34.3660710"/> <node id="1740301915" lat="61.7823031" lon="34.3660731"/> <node id="1740301917" lat="61.7823360" lon="34.3656483"/> <node id="1740301920" lat="61.7823808" lon="34.3654029"/> <node id="1740301947" lat="61.7830461" lon="34.3686393"/> <node id="1740301950" lat="61.7830601" lon="34.3664654"/> <node id="1740301954" lat="61.7830656" lon="34.3664770"/> <node id="1740301955" lat="61.7830807" lon="34.3688716"/> <node id="1740301963" lat="61.7831377" lon="34.3657952"/> <node id="1740301964" lat="61.7831420" lon="34.3657913"/> <node id="1740301966" lat="61.7831492" lon="34.3685650"/> <node id="1740301968" lat="61.7831619" lon="34.3685524"/> <node id="1740301972" lat="61.7832220" lon="34.3655653"/> <node id="1740301976" lat="61.7832286" lon="34.3666490"/> <node id="1740301977" lat="61.7832292" lon="34.3684686"/> <node id="1740301978" lat="61.7832426" lon="34.3656598"/> <node id="1740301980" lat="61.7832531" lon="34.3657069"/> <node id="1740301981" lat="61.7832557" lon="34.3687113"/> <node id="1740301983" lat="61.7832665" lon="34.3684101"/> <node id="1740301985" lat="61.7832987" lon="34.3683406"/> <node id="1740301988" lat="61.7833244" lon="34.3668712"/> <node id="1740301990" lat="61.7833286" lon="34.3682584"/> <node id="1740301991" lat="61.7833771" lon="34.3684688"/> <node id="1740301992" lat="61.7833802" lon="34.3680608"/> <node id="1740301993" lat="61.7833860" lon="34.3670797"/> <node id="1740301994" lat="61.7834235" lon="34.3673241"/> <node id="1740301995" lat="61.7834250" lon="34.3665384"/> <node id="1740301996" lat="61.7834250" lon="34.3678173"/> <node id="1740301997" lat="61.7834355" lon="34.3674585"/> <node id="1740301998" lat="61.7834400" lon="34.3676908"/> <node id="1740301999" lat="61.7834495" lon="34.3682553"/> <node id="1740302000" lat="61.7834646" lon="34.3664451"/> <node id="1740302001" lat="61.7834826" lon="34.3667139"/> <node id="1740302002" lat="61.7835057" lon="34.3668151"/> <node id="1740302004" lat="61.7835096" lon="34.3680095"/> <node id="1740302005" lat="61.7835379" lon="34.3678506"/> <node id="1740302006" lat="61.7835506" lon="34.3670522"/> <node id="1740302007" lat="61.7835528" lon="34.3676308"/> <node id="1740302009" lat="61.7835580" lon="34.3673857"/> <node id="1740302010" lat="61.7835588" lon="34.3671233"/> <node id="1744596853" lat="61.7892007" lon="34.3530989"> <tag k="level" v="1"/> <tag k="name" v="DNS"/> <tag k="shop" v="computer"/> </node> <node id="1744596856" lat="61.7893484" lon="34.3597301"> <tag k="level" v="-1"/> <tag k="name" v="Диаско"/> <tag k="shop" v="computer"/> </node> <node id="1744596861" lat="61.7890172" lon="34.3533589"> <tag k="name" v="Никольский"/> <tag k="shop" v="mall"/> </node> <node id="1744596871" lat="61.7893028" lon="34.3586191"> <tag k="name" v="Флория"/> <tag k="shop" v="florist"/> </node> <node id="1744596873" lat="61.7890303" lon="34.3589999"> <tag k="name" v="Школьный мир"/> <tag k="shop" v="books"/> </node> <node id="1744596876" lat="61.7874351" lon="34.3497490"/> <node id="1744596887" lat="61.7885106" lon="34.3594933"/> <node id="1744596888" lat="61.7885597" lon="34.3574965"> <tag k="entrance" v="emergency"/> </node> <node id="1744596893" lat="61.7885851" lon="34.3538441"/> <node id="1744596895" lat="61.7886168" lon="34.3538016"/> <node id="1744596896" lat="61.7886287" lon="34.3539894"/> <node id="1744596897" lat="61.7886603" lon="34.3539470"/> <node id="1744596904" lat="61.7887573" lon="34.3582782"/> <node id="1744596908" lat="61.7887811" lon="34.3540306"/> <node id="1744596911" lat="61.7887977" lon="34.3543936"/> <node id="1744596914" lat="61.7888091" lon="34.3542454"/> <node id="1744596917" lat="61.7888186" lon="34.3539804"/> <node id="1744596919" lat="61.7888232" lon="34.3541716"/> <node id="1744596923" lat="61.7888374" lon="34.3525117"/> <node id="1744596925" lat="61.7888627" lon="34.3586418"/> <node id="1744596926" lat="61.7888480" lon="34.3544109"/> <node id="1744596927" lat="61.7888537" lon="34.3525750"/> <node id="1744596928" lat="61.7888594" lon="34.3542626"/> <node id="1744596929" lat="61.7888608" lon="34.3541213"/> <node id="1744596931" lat="61.7888938" lon="34.3533076"/> <node id="1744596934" lat="61.7889023" lon="34.3533341"/> <node id="1744596936" lat="61.7889058" lon="34.3532903"/> <node id="1744596938" lat="61.7889143" lon="34.3533168"/> <node id="1744596944" lat="61.7889269" lon="34.3524905"/> <node id="1744596947" lat="61.7889330" lon="34.3523941"/> <node id="1744596950" lat="61.7889996" lon="34.3557378"/> <node id="1744596955" lat="61.7890375" lon="34.3555769"/> <node id="1744596957" lat="61.7890394" lon="34.3579709"/> <node id="1744596963" lat="61.7890429" lon="34.3558913"/> <node id="1744596968" lat="61.7890610" lon="34.3556602"/> <node id="1744596969" lat="61.7890633" lon="34.3580504"/> <node id="1744596972" lat="61.7890823" lon="34.3579133"/> <node id="1744596981" lat="61.7891061" lon="34.3579928"/> <node id="1744596998" lat="61.7891194" lon="34.3554734"/> <node id="1744597010" lat="61.7891862" lon="34.3557102"/> <node id="1744597021" lat="61.7892779" lon="34.3558979"/> <node id="1744597035" lat="61.7893925" lon="34.3598768"/> <node id="1744597036" lat="61.7894023" lon="34.3539154"/> <node id="1744597038" lat="61.7894226" lon="34.3539847"/> <node id="1744597040" lat="61.7894230" lon="34.3599841"/> <node id="1744597043" lat="61.7894451" lon="34.3538593"/> <node id="1744597045" lat="61.7894509" lon="34.3598026"/> <node id="1744597047" lat="61.7894654" lon="34.3539286"/> <node id="1744597052" lat="61.7894814" lon="34.3599099"/> <node id="1744597118" lat="61.7898693" lon="34.3591069"/> <node id="1744597120" lat="61.7898768" lon="34.3591314"/> <node id="1744597136" lat="61.7899745" lon="34.3589633"/> <node id="1744597139" lat="61.7899820" lon="34.3589878"/> <node id="1744597213" lat="61.7884820" lon="34.3573619"> <tag k="name" v="7-я семья"/> <tag k="opening_hours" v="24/7"/> <tag k="shop" v="convenience"/> </node> <node id="1745321780" lat="61.7876746" lon="34.3519238"/> <node id="1745321781" lat="61.7877038" lon="34.3520000"/> <node id="1745321783" lat="61.7877454" lon="34.3518026"/> <node id="1745321784" lat="61.7877746" lon="34.3518788"/> <node id="1745321817" lat="61.7891526" lon="34.3485431"/> <node id="1745321818" lat="61.7891549" lon="34.3486833"/> <node id="1745321821" lat="61.7893189" lon="34.3485312"/> <node id="1745321822" lat="61.7893211" lon="34.3486714"/> <node id="1766694842" lat="61.7877983" lon="34.3531769"> <tag k="name" v="Настоящая мебель"/> <tag k="shop" v="furniture"/> </node> <node id="1766694875" lat="61.7856465" lon="34.3519924"/> <node id="1766694877" lat="61.7856236" lon="34.3520270"/> <node id="1766694880" lat="61.7856728" lon="34.3519525"/> <node id="1766694896" lat="61.7858253" lon="34.3518292"> <tag k="entrance" v="service"/> </node> <node id="1766694902" lat="61.7859348" lon="34.3535755"/> <node id="1766694910" lat="61.7859850" lon="34.3535053"/> <node id="1766694913" lat="61.7860132" lon="34.3538262"/> <node id="1766694915" lat="61.7860635" lon="34.3537489"/> <node id="1766694922" lat="61.7861309" lon="34.3528089"> <tag k="entrance" v="service"/> </node> <node id="1766694925" lat="61.7861876" lon="34.3524212"> <tag k="entrance" v="main"/> </node> <node id="1766694965" lat="61.7864966" lon="34.3536604"/> <node id="1766694966" lat="61.7865094" lon="34.3537002"/> <node id="1766694972" lat="61.7865972" lon="34.3495144"/> <node id="1766694976" lat="61.7866109" lon="34.3495599"/> <node id="1766694979" lat="61.7866225" lon="34.3494803"/> <node id="1766694997" lat="61.7866362" lon="34.3495258"/> <node id="1766694998" lat="61.7866408" lon="34.3494541"/> <node id="1766695000" lat="61.7866552" lon="34.3495010"/> <node id="1766695002" lat="61.7866682" lon="34.3494165"/> <node id="1766695006" lat="61.7866826" lon="34.3494634"/> <node id="1766695021" lat="61.7867579" lon="34.3488220"/> <node id="1766695022" lat="61.7867671" lon="34.3488521"/> <node id="1766695031" lat="61.7868168" lon="34.3487842"/> <node id="1766695054" lat="61.7868275" lon="34.3488192"/> <node id="1766695078" lat="61.7869826" lon="34.3485579"/> <node id="1766695079" lat="61.7869932" lon="34.3485928"/> <node id="1766695081" lat="61.7870330" lon="34.3487810"/> <node id="1766695082" lat="61.7870534" lon="34.3488489"/> <node id="1766695083" lat="61.7870722" lon="34.3487286"/> <node id="1766695085" lat="61.7870925" lon="34.3487964"/> <node id="1766695137" lat="61.7878779" lon="34.3539166"/> <node id="1766695139" lat="61.7878878" lon="34.3539459"/> <node id="1766695141" lat="61.7879050" lon="34.3538758"/> <node id="1766695142" lat="61.7879149" lon="34.3539051"/> <node id="1766695259" lat="61.7885041" lon="34.3535901"/> <node id="1766695294" lat="61.7885266" lon="34.3535571"/> <node id="1766695304" lat="61.7885789" lon="34.3538179"/> <node id="1766695311" lat="61.7886014" lon="34.3537849"/> <node id="1766695321" lat="61.7886760" lon="34.3538833"/> <node id="1766695323" lat="61.7886865" lon="34.3539159"/> <node id="1766695330" lat="61.7887386" lon="34.3537933"/> <node id="1766695331" lat="61.7887491" lon="34.3538258"/> <node id="1766695332" lat="61.7887807" lon="34.3545994"/> <node id="1766695352" lat="61.7888028" lon="34.3546224"/> <node id="1766695362" lat="61.7888213" lon="34.3544248"/> <node id="1766695371" lat="61.7888434" lon="34.3544478"/> <node id="1767558961" lat="61.7866513" lon="34.3499716"> <tag k="amenity" v="bank"/> <tag k="name" v="Пробизнесбанк"/> </node> <node id="1767558967" lat="61.7840911" lon="34.3576567"/> <node id="1767558969" lat="61.7841181" lon="34.3577532"/> <node id="1767558971" lat="61.7841338" lon="34.3576032"/> <node id="1767558973" lat="61.7841608" lon="34.3576997"/> <node id="1767558984" lat="61.7857472" lon="34.3585755"> <tag k="entrance" v="yes"/> </node> <node id="1767558986" lat="61.7858003" lon="34.3588665"/> <node id="1767558988" lat="61.7858254" lon="34.3589434"/> <node id="1767558990" lat="61.7858440" lon="34.3588029"/> <node id="1767558994" lat="61.7858690" lon="34.3588798"/> <node id="1767558997" lat="61.7865195" lon="34.3584407"/> <node id="1767558998" lat="61.7867361" lon="34.3581349"/> <node id="1767559000" lat="61.7868873" lon="34.3579174"/> <node id="1767559008" lat="61.7870512" lon="34.3558734"/> <node id="1767559014" lat="61.7871017" lon="34.3576148"/> <node id="1767559016" lat="61.7871071" lon="34.3560523"/> <node id="1767559018" lat="61.7871280" lon="34.3560230"/> <node id="1767559020" lat="61.7871327" lon="34.3557595"/> <node id="1767559024" lat="61.7871643" lon="34.3561391"/> <node id="1767559026" lat="61.7872248" lon="34.3560545"/> <node id="1768267392" lat="61.7857399" lon="34.3592737"/> <node id="1768267393" lat="61.7857755" lon="34.3593919"/> <node id="1768267395" lat="61.7858045" lon="34.3593529"/> <node id="1768267396" lat="61.7858239" lon="34.3594173"/> <node id="1768267399" lat="61.7859130" lon="34.3590402"/> <node id="1768267400" lat="61.7859233" lon="34.3556797"/> <node id="1768267401" lat="61.7859300" lon="34.3590965"/> <node id="1768267403" lat="61.7859639" lon="34.3590507"/> <node id="1768267404" lat="61.7860020" lon="34.3591771"/> <node id="1768267407" lat="61.7861279" lon="34.3552517"/> <node id="1768267411" lat="61.7861938" lon="34.3556347"/> <node id="1768267412" lat="61.7862102" lon="34.3556853"/> <node id="1768267413" lat="61.7862393" lon="34.3555690"/> <node id="1768267414" lat="61.7862556" lon="34.3556195"/> <node id="1773521469" lat="61.7841055" lon="34.3548966"> <tag k="name" v="Октябрьская железная дорога. Петрозаводское отделение"/> <tag k="office" v="administrative"/> <tag k="operator" v="РЖД"/> </node> <node id="1773521510" lat="61.7825914" lon="34.3577708"/> <node id="1773521512" lat="61.7826154" lon="34.3577379"/> <node id="1773521515" lat="61.7827291" lon="34.3582211"/> <node id="1773521516" lat="61.7827526" lon="34.3542699"/> <node id="1773521517" lat="61.7827532" lon="34.3581882"/> <node id="1773521519" lat="61.7827782" lon="34.3542349"/> <node id="1773521521" lat="61.7828600" lon="34.3501966"/> <node id="1773521522" lat="61.7829009" lon="34.3501404"/> <node id="1773521525" lat="61.7829327" lon="34.3577481"/> <node id="1773521527" lat="61.7829567" lon="34.3577134"/> <node id="1773521528" lat="61.7829674" lon="34.3578556"/> <node id="1773521529" lat="61.7829736" lon="34.3505658"/> <node id="1773521530" lat="61.7829736" lon="34.3539651"/> <node id="1773521531" lat="61.7829913" lon="34.3539410"/> <node id="1773521532" lat="61.7829914" lon="34.3578209"/> <node id="1773521533" lat="61.7830144" lon="34.3505096"/> <node id="1773521534" lat="61.7830611" lon="34.3506708"/> <node id="1773521535" lat="61.7830832" lon="34.3507593"/> <node id="1773521536" lat="61.7830956" lon="34.3577000"/> <node id="1773521537" lat="61.7830973" lon="34.3504822"/> <node id="1773521538" lat="61.7831075" lon="34.3506189"/> <node id="1773521540" lat="61.7831296" lon="34.3507074"/> <node id="1773521541" lat="61.7831386" lon="34.3506301"/> <node id="1773521542" lat="61.7831398" lon="34.3504293"/> <node id="1773521543" lat="61.7831410" lon="34.3576419"/> <node id="1773521545" lat="61.7831810" lon="34.3505772"/> <node id="1773521547" lat="61.7832633" lon="34.3506848"/> <node id="1773521550" lat="61.7832786" lon="34.3507365"/> <node id="1773521551" lat="61.7833090" lon="34.3506240"/> <node id="1773521552" lat="61.7833244" lon="34.3506757"/> <node id="1773521554" lat="61.7833412" lon="34.3502192"/> <node id="1773521555" lat="61.7833528" lon="34.3502589"/> <node id="1773521596" lat="61.7840290" lon="34.3545724"> <tag k="amenity" v="atm"/> </node> <node id="1773521597" lat="61.7840324" lon="34.3540859"> <tag k="entrance" v="main"/> </node> <node id="1773521601" lat="61.7840927" lon="34.3548568"/> <node id="1773521605" lat="61.7841255" lon="34.3548116"/> <node id="1773521606" lat="61.7841291" lon="34.3549752"> <tag k="amenity" v="atm"/> <tag k="operator" v="Транскредитбанк"/> </node> <node id="1773521607" lat="61.7841368" lon="34.3550002"/> <node id="1773521610" lat="61.7841696" lon="34.3549550"/> <node id="1773521613" lat="61.7842379" lon="34.3549554"/> <node id="1773521619" lat="61.7842773" lon="34.3550837"/> <node id="1773521643" lat="61.7844208" lon="34.3547045"/> <node id="1773521645" lat="61.7844596" lon="34.3548375"/> <node id="1773521648" lat="61.7845013" lon="34.3549814"/> <node id="1773521649" lat="61.7845075" lon="34.3547749"/> <node id="1773521650" lat="61.7845175" lon="34.3545067"/> <node id="1773521651" lat="61.7845181" lon="34.3548113"/> <node id="1773521652" lat="61.7845318" lon="34.3551030"/> <node id="1773521653" lat="61.7845326" lon="34.3545583"/> <node id="1773521654" lat="61.7845493" lon="34.3549276"/> <node id="1773521655" lat="61.7845797" lon="34.3550492"/> <node id="1773521656" lat="61.7846035" lon="34.3546494"/> <node id="1773521657" lat="61.7846141" lon="34.3546858"/> <node id="1773521659" lat="61.7846184" lon="34.3576358"/> <node id="1773521660" lat="61.7846219" lon="34.3543702"/> <node id="1773521661" lat="61.7846352" lon="34.3539102"/> <node id="1773521662" lat="61.7846370" lon="34.3544218"/> <node id="1773521663" lat="61.7846424" lon="34.3577154"/> <node id="1773521664" lat="61.7846469" lon="34.3575975"/> <node id="1773521667" lat="61.7846543" lon="34.3543328"/> <node id="1773521668" lat="61.7846567" lon="34.3538807"/> <node id="1773521669" lat="61.7846683" lon="34.3543808"/> <node id="1773521670" lat="61.7846700" lon="34.3540233"/> <node id="1773521671" lat="61.7846709" lon="34.3576772"/> <node id="1773521672" lat="61.7846915" lon="34.3539938"/> <node id="1773521674" lat="61.7847180" lon="34.3542495"/> <node id="1773521676" lat="61.7847709" lon="34.3544305"/> <node id="1773521695" lat="61.7853585" lon="34.3556155"/> <node id="1773521696" lat="61.7853948" lon="34.3555624"/> <node id="1773521698" lat="61.7854308" lon="34.3558368"/> <node id="1773521699" lat="61.7854384" lon="34.3590647"/> <node id="1773521700" lat="61.7854585" lon="34.3590355"/> <node id="1773521701" lat="61.7854671" lon="34.3557837"/> <node id="1773521702" lat="61.7855095" lon="34.3592833"/> <node id="1773521703" lat="61.7855296" lon="34.3592540"/> <node id="1773521704" lat="61.7857393" lon="34.3586737"/> <node id="1773521706" lat="61.7866185" lon="34.3588635"/> <node id="1773521707" lat="61.7866287" lon="34.3588987"/> <node id="1773521708" lat="61.7866571" lon="34.3588133"/> <node id="1773521709" lat="61.7866673" lon="34.3588486"/> <node id="1781833793" lat="61.7897072" lon="34.3506705"/> <node id="1781833795" lat="61.7897161" lon="34.3507031"/> <node id="1781833805" lat="61.7898407" lon="34.3505077"/> <node id="1781833807" lat="61.7898495" lon="34.3505403"/> <node id="1812513848" lat="61.7895035" lon="34.3607593"> <tag k="amenity" v="pharmacy"/> </node> <node id="1824089041" lat="61.7882336" lon="34.3586126"> <tag k="amenity" v="pharmacy"/> <tag k="name" v="Apteek"/> <tag k="name:en" v="Apteek"/> <tag k="opening_hours" v="24/7"/> </node> <node id="1824089045" lat="61.7883461" lon="34.3603601"> <tag k="amenity" v="restaurant"/> <tag k="name" v="Fuad"/> <tag k="name:en" v="Fuad"/> <tag k="opening_hours" v="Mo-Th 11:00-23:00; Fr 11:00-24:00; Sa 12:00-24:00; Su 12:00-23:00"/> <tag k="phone" v="+7 911 4000659"/> </node> <node id="1824089050" lat="61.7883506" lon="34.3589758"> <tag k="amenity" v="cafe"/> <tag k="name" v="Kaffe Haus"/> <tag k="name:en" v="Kaffe Haus"/> <tag k="opening_hours" v="Mo-Th 09:00-01:00; Fr 09:00-02:00; Sa 10:00-02:00; Su 10:00-01:00"/> </node> <node id="1824089065" lat="61.7883048" lon="34.3605118"> <tag k="amenity" v="restaurant"/> <tag k="name" v="Карельская горница"/> <tag k="name:en" v="Karelian Cousine"/> <tag k="opening_hours" v="Tu-Sa 11:00-23:00; Su-Mo 11:00-23:00"/> <tag k="phone" v="+7 911 4000659"/> <tag k="website" v="http://gornica.ru"/> </node> <node id="1824089067" lat="61.7883835" lon="34.3583231"/> <node id="1824089068" lat="61.7883970" lon="34.3583681"/> <node id="1824089069" lat="61.7884114" lon="34.3582853"/> <node id="1824089070" lat="61.7884250" lon="34.3583303"/> <node id="1824089072" lat="61.7886555" lon="34.3598691"/> <node id="1824089073" lat="61.7886660" lon="34.3598379"/> <node id="1824089074" lat="61.7886708" lon="34.3598923"/> <node id="1824089075" lat="61.7886814" lon="34.3598611"/> <node id="1824089076" lat="61.7884661" lon="34.3599190"> <tag k="amenity" v="atm"/> <tag k="drive_through" v="no"/> <tag k="name" v="Банкомат ВТБ"/> <tag k="operator" v="ВТБ24"/> <tag k="operator:en" v="VTB24"/> </node> <node id="1824089077" lat="61.7884185" lon="34.3600940"> <tag k="amenity" v="bank"/> <tag k="drive_through" v="no"/> <tag k="name" v="Сбербанк"/> <tag k="operator" v="Сбербанк"/> <tag k="operator:en" v="Sberbank"/> </node> <node id="1824089078" lat="61.7884370" lon="34.3600261"> <tag k="amenity" v="atm"/> <tag k="drive_through" v="no"/> <tag k="name" v="Сбербанк"/> <tag k="operator" v="Сбербанк"/> <tag k="operator:en" v="Sberbank"/> </node> <node id="1824106802" lat="61.7871003" lon="34.3639543"> <tag k="name" v="Национальный музей Республики Карелия"/> <tag k="opening_hours" v="Tu-Su 10:00-18:00"/> <tag k="phone" v="+7 8142 782702"/> <tag k="tourism" v="museum"/> <tag k="website" v="http://kgkm.karelia.ru/"/> </node> <node id="1824106803" lat="61.7883496" lon="34.3569471"> <tag k="name" v="Рив Гош"/> <tag k="opening_hours" v="Mo-Su 10:00-21:00"/> <tag k="phone" v="+7 8142 592048"/> <tag k="shop" v="chemist"/> <tag k="website" v="http://www.rivegauche.ru/"/> </node> <node id="1824115572" lat="61.7877388" lon="34.3549878"> <tag k="name" v="Ткани"/> <tag k="opening_hours" v="Mo-Fr 10:00-20:00; Sa-Su 11:00-18:00"/> <tag k="shop" v="fabric"/> </node> <node id="1824123896" lat="61.7881462" lon="34.3560985"> <tag k="amenity" v="restaurant"/> <tag k="name" v="Sanches"/> <tag k="name:en" v="Sanches"/> <tag k="opening_hours" v="Mo-Su 12:00-01:00"/> </node> <node id="1824123897" lat="61.7881648" lon="34.3561569"> <tag k="name" v="Выставочный зал"/> <tag k="opening_hours" v="Tu-Su 12:00-19:00"/> <tag k="tourism" v="yes"/> </node> <node id="1824123899" lat="61.7881832" lon="34.3562145"> <tag k="name" v="Ювелирторг"/> <tag k="opening_hours" v="Mo-Sa 11:00-20:00; Su 11:00-19:00"/> <tag k="shop" v="jewelry"/> </node> <node id="1824137605" lat="61.7886418" lon="34.3666910"> <tag k="amenity" v="bank"/> <tag k="drive_through" v="no"/> <tag k="name" v="Сбербанк"/> <tag k="operator" v="Сбербанк"/> <tag k="operator:en" v="Sberbank"/> </node> <node id="1824137606" lat="61.7886933" lon="34.3666910"> <tag k="amenity" v="atm"/> <tag k="drive_through" v="no"/> <tag k="name" v="Сбербанк"/> <tag k="operator" v="Сбербанк"/> <tag k="operator:en" v="Sberbank"/> </node> <node id="1891303183" lat="61.7866958" lon="34.3446763"> <tag k="name" v="МедТезТорг"/> <tag k="shop" v="convenience"/> </node> <node id="2098187443" lat="61.7867558" lon="34.3532393"/> <node id="2098196584" lat="61.7856858" lon="34.3520047"/> <node id="2098196585" lat="61.7855821" lon="34.3521619"/> <node id="2098196589" lat="61.7855515" lon="34.3520668"/> <node id="2098196593" lat="61.7851568" lon="34.3526462"/> <node id="2098196599" lat="61.7856697" lon="34.3519572"/> <node id="2098196603" lat="61.7855660" lon="34.3521144"/> <node id="2098196612" lat="61.7856071" lon="34.3519736"/> <node id="2098210683" lat="61.7854485" lon="34.3521340"> <tag k="entrance" v="main"/> </node> <node id="2099931550" lat="61.7844969" lon="34.3519429"> <tag k="entrance" v="main"/> </node> <node id="2099931554" lat="61.7853721" lon="34.3523716"> <tag k="entrance" v="service"/> </node> <node id="2317998767" lat="61.7836018" lon="34.3457032"/> <node id="2317998768" lat="61.7837578" lon="34.3462781"/> <node id="2317998769" lat="61.7838118" lon="34.3454483"/> <node id="2317998770" lat="61.7838452" lon="34.3461720"/> <node id="2317998771" lat="61.7839264" lon="34.3458708"/> <node id="2317998772" lat="61.7839561" lon="34.3465807"/> <node id="2317998773" lat="61.7840023" lon="34.3465247"/> <node id="2317998774" lat="61.7840333" lon="34.3466391"/> <node id="2317998775" lat="61.7840741" lon="34.3456915"/> <node id="2317998781" lat="61.7841369" lon="34.3465133"/> <node id="2317998815" lat="61.7842569" lon="34.3469558"/> <node id="2317998824" lat="61.7843775" lon="34.3468095"/> <node id="2326775766" lat="61.7893586" lon="34.3670010"/> <node id="2326775774" lat="61.7895221" lon="34.3672821"/> <node id="2326775856" lat="61.7895915" lon="34.3671926"/> <node id="2795670108" lat="61.7842245" lon="34.3468365"/> <node id="2795670109" lat="61.7841893" lon="34.3468825"/> <node id="2795670110" lat="61.7842256" lon="34.3470003"/> <node id="2795670112" lat="61.7842488" lon="34.3469669"> <tag k="barrier" v="gate"/> </node> <node id="2795670113" lat="61.7842141" lon="34.3468495"/> <node id="2938709826" lat="61.7833846" lon="34.3499806"/> <node id="2938709827" lat="61.7833570" lon="34.3498798"/> <node id="2948315587" lat="61.7856123" lon="34.3521161"/> <node id="2948315588" lat="61.7855961" lon="34.3520687"/> <node id="3135042345" lat="61.7856909" lon="34.3507488"> <tag k="amenity" v="atm"/> <tag k="brand" v="Возрождение"/> <tag k="opening_hours" v="sunrise-sunset"/> </node> <node id="3141314112" lat="61.7841671" lon="34.3468105"/> <node id="3141315398" lat="61.7859641" lon="34.3470510"/> <node id="3141315399" lat="61.7859769" lon="34.3468847"/> <node id="3141315406" lat="61.7860827" lon="34.3467400"/> <node id="3221962561" lat="61.7871008" lon="34.3529682"> <tag k="addr:city" v="петрозаводск"/> <tag k="addr:housenumber" v="28"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="name" v="Новая мода"/> <tag k="shop" v="clothes"/> </node> <node id="3227796333" lat="61.7874475" lon="34.3497400"/> <node id="3227796334" lat="61.7874648" lon="34.3498026"/> <node id="3227796335" lat="61.7874850" lon="34.3498579"/> <node id="3372269656" lat="61.7892250" lon="34.3609756"> <tag k="amenity" v="pub"/> <tag k="name" v="Пинта"/> </node> <way id="34278948"> <nd ref="393069303"/> <nd ref="393069302"/> <nd ref="393069301"/> <nd ref="393069300"/> <nd ref="393069303"/> <tag k="building" v="yes"/> </way> <way id="34278952"> <nd ref="393067943"/> <nd ref="393067948"/> <nd ref="393067947"/> <nd ref="393067946"/> <nd ref="393067943"/> <tag k="building" v="yes"/> </way> <way id="34279663"> <nd ref="393069671"/> <nd ref="393069669"/> <nd ref="393069670"/> <nd ref="393069668"/> <nd ref="393069671"/> <tag k="building" v="yes"/> </way> <way id="34279684"> <nd ref="393069689"/> <nd ref="393069685"/> <nd ref="393069684"/> <nd ref="393069686"/> <nd ref="393069689"/> <tag k="building" v="yes"/> </way> <way id="34279770"> <nd ref="393069623"/> <nd ref="393069624"/> <nd ref="393069614"/> <nd ref="393069615"/> <nd ref="393069623"/> <tag k="building" v="yes"/> <tag k="building:levels" v="3"/> </way> <way id="34279987"> <nd ref="393069502"/> <nd ref="393069503"/> <nd ref="393069500"/> <nd ref="393069501"/> <nd ref="393069502"/> <tag k="addr:housenumber" v="10"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="34279991"> <nd ref="393069494"/> <nd ref="393069498"/> <nd ref="393069499"/> <nd ref="393069497"/> <nd ref="393069494"/> <tag k="building" v="yes"/> </way> <way id="34279994"> <nd ref="393069506"/> <nd ref="393069504"/> <nd ref="393069505"/> <nd ref="1773521543"/> <nd ref="1773521536"/> <nd ref="393069589"/> <nd ref="393069506"/> <tag k="building" v="yes"/> </way> <way id="34280122"> <nd ref="393069445"/> <nd ref="393069446"/> <nd ref="1773521516"/> <nd ref="1773521519"/> <nd ref="393069447"/> <nd ref="393069448"/> <nd ref="1773521530"/> <nd ref="1773521531"/> <nd ref="393069445"/> <tag k="addr:housenumber" v="31а"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="34280178"> <nd ref="393065728"/> <nd ref="393065726"/> <nd ref="393065727"/> <nd ref="393065725"/> <nd ref="393065728"/> <tag k="building" v="yes"/> </way> <way id="34280326"> <nd ref="393065686"/> <nd ref="393065685"/> <nd ref="393065690"/> <nd ref="393065689"/> <nd ref="393065686"/> <tag k="building" v="yes"/> </way> <way id="34280865"> <nd ref="393065397"/> <nd ref="393065398"/> <nd ref="393065401"/> <nd ref="393065402"/> <nd ref="393065397"/> <tag k="building" v="yes"/> </way> <way id="34280874"> <nd ref="393065396"/> <nd ref="393065394"/> <nd ref="393065395"/> <nd ref="393065399"/> <nd ref="393065396"/> <tag k="building" v="yes"/> </way> <way id="34280933"> <nd ref="393065323"/> <nd ref="393065324"/> <nd ref="393065325"/> <nd ref="393065326"/> <nd ref="393065323"/> <tag k="building" v="yes"/> </way> <way id="34280966"> <nd ref="393069070"/> <nd ref="393069072"/> <nd ref="393069071"/> <nd ref="393069080"/> <nd ref="393069070"/> <tag k="building" v="yes"/> </way> <way id="34280990"> <nd ref="393065343"/> <nd ref="393065341"/> <nd ref="393065342"/> <nd ref="393065353"/> <nd ref="393065343"/> <tag k="addr:housenumber" v="52"/> <tag k="addr:street" v="улица Крупской"/> <tag k="building" v="yes"/> <tag k="building:levels" v="2"/> </way> <way id="34281204"> <nd ref="393065232"/> <nd ref="393065231"/> <nd ref="393065230"/> <nd ref="393065229"/> <nd ref="393065232"/> <tag k="addr:country" v="RU"/> <tag k="addr:housenumber" v="2Б"/> <tag k="addr:street" v="Закаменский переулок"/> <tag k="building" v="yes"/> </way> <way id="41909992"> <nd ref="518832140"/> <nd ref="518832542"/> <nd ref="518832415"/> <nd ref="518832287"/> <nd ref="518832140"/> <tag k="addr:housenumber" v="27"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="41910006"> <nd ref="518832158"/> <nd ref="518832463"/> <nd ref="518832180"/> <nd ref="518832374"/> <nd ref="518832158"/> <tag k="addr:housenumber" v="21А"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="41910010"> <nd ref="518832408"/> <nd ref="518832123"/> <nd ref="518832506"/> <nd ref="518832478"/> <nd ref="518832408"/> <tag k="addr:housenumber" v="23"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> <tag k="building:levels" v="5"/> </way> <way id="41910022"> <nd ref="518832201"/> <nd ref="518832205"/> <nd ref="518832489"/> <nd ref="518832108"/> <nd ref="518832201"/> <tag k="addr:housenumber" v="19А"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="41910052"> <nd ref="518832910"/> <nd ref="518832923"/> <nd ref="518832921"/> <nd ref="518832915"/> <nd ref="518832910"/> <tag k="addr:housenumber" v="7Б"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="41960981"> <nd ref="519975501"/> <nd ref="2098196589"/> <nd ref="2098196603"/> <nd ref="2098196585"/> <nd ref="519975117"/> <nd ref="519975250"/> <nd ref="519975412"/> <nd ref="519976131"/> <nd ref="519975873"/> <nd ref="519975114"/> <nd ref="2098196593"/> <nd ref="519975641"/> <nd ref="519976161"/> <nd ref="519975884"/> <nd ref="2099931554"/> <nd ref="519976210"/> <nd ref="519976100"/> <nd ref="2098210683"/> <nd ref="519975501"/> <tag k="addr:housenumber" v="20"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="41960992"> <nd ref="519975829"/> <nd ref="519975674"/> <nd ref="3135042345"/> <nd ref="420856891"/> <nd ref="519975545"/> <nd ref="519975626"/> <nd ref="519975829"/> <tag k="addr:housenumber" v="37"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="41960995"> <nd ref="519975120"/> <nd ref="519975236"/> <nd ref="519975407"/> <nd ref="519975715"/> <nd ref="519976344"/> <nd ref="519975918"/> <nd ref="519975978"/> <nd ref="519975301"/> <nd ref="519975120"/> <tag k="addr:housenumber" v="31В"/> <tag k="addr:street" v="Красноармейская улица"/> <tag k="building" v="yes"/> </way> <way id="41961013"> <nd ref="519975968"/> <nd ref="519976090"/> <nd ref="519975425"/> <nd ref="519976110"/> <nd ref="1773521550"/> <nd ref="1773521547"/> <nd ref="1773521551"/> <nd ref="1773521552"/> <nd ref="519975968"/> <tag k="addr:housenumber" v="20А"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="41961016"> <nd ref="519975796"/> <nd ref="519976251"/> <nd ref="519976174"/> <nd ref="519975992"/> <nd ref="519975796"/> <tag k="addr:housenumber" v="33Б"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> </way> <way id="41961032"> <nd ref="519975366"/> <nd ref="519975368"/> <nd ref="519976095"/> <nd ref="519975782"/> <nd ref="519975753"/> <nd ref="519975861"/> <nd ref="1773521672"/> <nd ref="1773521670"/> <nd ref="1773521661"/> <nd ref="1773521668"/> <nd ref="519975360"/> <nd ref="519976284"/> <nd ref="519976383"/> <nd ref="519975137"/> <nd ref="519975952"/> <nd ref="519976083"/> <nd ref="519975938"/> <nd ref="1773521619"/> <nd ref="1773521613"/> <nd ref="519975698"/> <nd ref="1773521610"/> <nd ref="1773521607"/> <nd ref="1773521606"/> <nd ref="1773521469"/> <nd ref="1773521601"/> <nd ref="1773521605"/> <nd ref="519976264"/> <nd ref="1773521596"/> <nd ref="519976154"/> <nd ref="519976081"/> <nd ref="519976243"/> <nd ref="519975156"/> <nd ref="1773521597"/> <nd ref="519976236"/> <nd ref="519975366"/> <tag k="addr:housenumber" v="16"/> <tag k="addr:street" v="улица Анохина"/> <tag k="amenity" v="college"/> <tag k="building" v="yes"/> <tag k="building:levels" v="5"/> <tag k="name" v="Железнодорожный колледж"/> </way> <way id="41961043"> <nd ref="519976097"/> <nd ref="519976297"/> <nd ref="519975188"/> <nd ref="519976253"/> <nd ref="519976097"/> <tag k="addr:housenumber" v="37Б"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="41961044"> <nd ref="519975141"/> <nd ref="519976015"/> <nd ref="519976183"/> <nd ref="519976133"/> <nd ref="519975141"/> <tag k="addr:housenumber" v="26"/> <tag k="addr:street" v="Красноармейская улица"/> <tag k="building" v="yes"/> </way> <way id="41961048"> <nd ref="519975871"/> <nd ref="519976166"/> <nd ref="519976062"/> <nd ref="519976019"/> <nd ref="519976206"/> <nd ref="519976342"/> <nd ref="519976103"/> <nd ref="519976390"/> <nd ref="519975215"/> <nd ref="519975776"/> <nd ref="1766694896"/> <nd ref="519976317"/> <nd ref="1766694880"/> <nd ref="2098196599"/> <nd ref="1766694875"/> <nd ref="1766694877"/> <nd ref="2098196612"/> <nd ref="519975595"/> <nd ref="519975170"/> <nd ref="519975503"/> <nd ref="519975125"/> <nd ref="1766694925"/> <nd ref="519975330"/> <nd ref="519976293"/> <nd ref="2098187443"/> <nd ref="519976063"/> <nd ref="1766694965"/> <nd ref="1766694966"/> <nd ref="519976238"/> <nd ref="519976181"/> <nd ref="519975996"/> <nd ref="1766694922"/> <nd ref="519975274"/> <nd ref="519975635"/> <nd ref="519976122"/> <nd ref="519976315"/> <nd ref="519975726"/> <nd ref="519976273"/> <nd ref="519975871"/> <tag k="addr:city" v="Петрозаводск"/> <tag k="addr:country" v="RU"/> <tag k="addr:housenumber" v="33"/> <tag k="addr:postcode" v="185910"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> <tag k="building:levels" v="4"/> </way> <way id="41961058"> <nd ref="519975163"/> <nd ref="522728220"/> <nd ref="519975113"/> <nd ref="519975370"/> <nd ref="519975779"/> <nd ref="519975163"/> <tag k="addr:housenumber" v="24"/> <tag k="addr:street" v="Красноармейская улица"/> <tag k="building" v="yes"/> </way> <way id="41961065"> <nd ref="519976498"/> <nd ref="519976532"/> <nd ref="519976529"/> <nd ref="519976486"/> <nd ref="519976498"/> <tag k="addr:housenumber" v="14"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="41961073"> <nd ref="519976422"/> <nd ref="519976416"/> <nd ref="519976453"/> <nd ref="519976556"/> <nd ref="519976536"/> <nd ref="519976569"/> <nd ref="519976474"/> <nd ref="519976466"/> <nd ref="519976540"/> <nd ref="519976565"/> <nd ref="519976490"/> <nd ref="519976449"/> <nd ref="519976422"/> <tag k="addr:housenumber" v="12"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="41961084"> <nd ref="519976836"/> <nd ref="519976905"/> <nd ref="519976907"/> <nd ref="519976653"/> <nd ref="519976718"/> <nd ref="519976760"/> <nd ref="519976795"/> <nd ref="519976922"/> <nd ref="519976629"/> <nd ref="519976818"/> <nd ref="519976602"/> <nd ref="519976766"/> <nd ref="519976843"/> <nd ref="519976639"/> <nd ref="519976885"/> <nd ref="519976635"/> <nd ref="519976950"/> <nd ref="519976952"/> <nd ref="519976836"/> <tag k="addr:housenumber" v="29"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="amenity" v="university"/> <tag k="building" v="yes"/> <tag k="building:levels" v="4"/> <tag k="name" v="Карельская государственная педагогическая академия"/> </way> <way id="41961087"> <nd ref="519976600"/> <nd ref="519976901"/> <nd ref="519976662"/> <nd ref="519976839"/> <nd ref="519976917"/> <nd ref="519976820"/> <nd ref="519976797"/> <nd ref="519976748"/> <nd ref="519976740"/> <nd ref="519976612"/> <nd ref="519976600"/> <tag k="addr:housenumber" v="25"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> </way> <way id="41961088"> <nd ref="519976842"/> <nd ref="519976616"/> <nd ref="519976660"/> <nd ref="519976858"/> <nd ref="519976842"/> <tag k="addr:housenumber" v="37"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="41961095"> <nd ref="519976637"/> <nd ref="519976955"/> <nd ref="519976664"/> <nd ref="1773521706"/> <nd ref="1773521708"/> <nd ref="1773521709"/> <nd ref="1773521707"/> <nd ref="519976704"/> <nd ref="519976637"/> <tag k="addr:housenumber" v="31А"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> <tag k="building:levels" v="6"/> </way> <way id="41961101"> <nd ref="519976666"/> <nd ref="519976726"/> <nd ref="519976677"/> <nd ref="519976935"/> <nd ref="519976666"/> <tag k="addr:housenumber" v="3"/> <tag k="addr:street" v="Закаменский переулок"/> <tag k="building" v="yes"/> </way> <way id="41961105"> <nd ref="519976982"/> <nd ref="519977063"/> <nd ref="519977007"/> <nd ref="519977071"/> <nd ref="519977053"/> <nd ref="519977077"/> <nd ref="519977047"/> <nd ref="519977011"/> <nd ref="519977079"/> <nd ref="519977013"/> <nd ref="519977042"/> <nd ref="519977017"/> <nd ref="519977088"/> <nd ref="519976989"/> <nd ref="519977018"/> <nd ref="519977068"/> <nd ref="519977005"/> <nd ref="519977069"/> <nd ref="519977016"/> <nd ref="519977073"/> <nd ref="519977020"/> <nd ref="519976999"/> <nd ref="519977075"/> <nd ref="519976984"/> <nd ref="519977025"/> <nd ref="519977014"/> <nd ref="519977074"/> <nd ref="519976977"/> <nd ref="519976992"/> <nd ref="519977082"/> <nd ref="519976982"/> <tag k="addr:city" v="Петрозаводск"/> <tag k="addr:housenumber" v="2"/> <tag k="addr:postcode" v="185035"/> <tag k="addr:street" v="площадь Ленина"/> <tag k="building" v="yes"/> <tag k="name" v="Министерство культуры Республики Карелия"/> <tag k="name:en" v="The Ministry of Culture of the Republic of Karelia"/> <tag k="phone" v="+7 (814-2) 78 35 96"/> <tag k="source" v="http://gov.karelia.ru/gov/Power/Ministry/Culture/"/> <tag k="website" v="http://mincultrk.ru/"/> </way> <way id="41961107"> <nd ref="519977044"/> <nd ref="519977009"/> <nd ref="519977051"/> <nd ref="519976980"/> <nd ref="519977003"/> <nd ref="519977012"/> <nd ref="519977015"/> <nd ref="519977072"/> <nd ref="519976986"/> <nd ref="519976990"/> <nd ref="519977070"/> <nd ref="519977080"/> <nd ref="519977064"/> <nd ref="519977066"/> <nd ref="519976988"/> <nd ref="519976994"/> <nd ref="519977049"/> <nd ref="519977001"/> <nd ref="519977023"/> <nd ref="519977060"/> <nd ref="519977010"/> <nd ref="1824106802"/> <nd ref="519977085"/> <nd ref="519977076"/> <nd ref="519976998"/> <nd ref="1692701814"/> <nd ref="519976996"/> <nd ref="519976987"/> <nd ref="519977055"/> <nd ref="519977058"/> <nd ref="519977044"/> <tag k="addr:housenumber" v="1"/> <tag k="addr:street" v="площадь Ленина"/> <tag k="building" v="yes"/> </way> <way id="41961108"> <nd ref="519977283"/> <nd ref="519977433"/> <nd ref="519977237"/> <nd ref="519977280"/> <nd ref="519977283"/> <tag k="addr:housenumber" v="4"/> <tag k="addr:street" v="улица Шотмана"/> <tag k="building" v="yes"/> </way> <way id="41961111"> <nd ref="519977193"/> <nd ref="519977481"/> <nd ref="519977281"/> <nd ref="519977424"/> <nd ref="519977422"/> <nd ref="519977407"/> <nd ref="519977239"/> <nd ref="519977197"/> <nd ref="519977193"/> <tag k="addr:housenumber" v="8"/> <tag k="addr:street" v="улица Шотмана"/> <tag k="building" v="yes"/> </way> <way id="41961114"> <nd ref="519977115"/> <nd ref="519977332"/> <nd ref="1766694842"/> <nd ref="519977377"/> <nd ref="519977279"/> <nd ref="519977115"/> <tag k="addr:housenumber" v="27"/> <tag k="addr:street" v="улица Антикайнена"/> <tag k="building" v="yes"/> <tag k="building:levels" v="5"/> </way> <way id="41961117"> <nd ref="522734497"/> <nd ref="519977412"/> <nd ref="519977323"/> <nd ref="519977436"/> <nd ref="519977227"/> <nd ref="522734497"/> <tag k="addr:housenumber" v="47"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="41961127"> <nd ref="519977285"/> <nd ref="519977367"/> <nd ref="519977338"/> <nd ref="1891303183"/> <nd ref="1406172284"/> <nd ref="519977298"/> <nd ref="519977091"/> <nd ref="519977462"/> <nd ref="519977451"/> <nd ref="519977467"/> <nd ref="519977285"/> <tag k="addr:housenumber" v="6"/> <tag k="addr:street" v="улица Шотмана"/> <tag k="building" v="yes"/> </way> <way id="41961131"> <nd ref="519977292"/> <nd ref="519977229"/> <nd ref="519977183"/> <nd ref="519977099"/> <nd ref="365583884"/> <nd ref="1163003858"/> <nd ref="3221962561"/> <nd ref="519977128"/> <nd ref="519977267"/> <nd ref="519977292"/> <tag k="addr:housenumber" v="28"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> <tag k="building:levels" v="4"/> </way> <way id="41961135"> <nd ref="519977336"/> <nd ref="519977260"/> <nd ref="519977430"/> <nd ref="519977536"/> <nd ref="519977311"/> <nd ref="519977473"/> <nd ref="1766695078"/> <nd ref="1766695079"/> <nd ref="1766695054"/> <nd ref="1766695031"/> <nd ref="1766695022"/> <nd ref="1766695021"/> <nd ref="519977336"/> <tag k="addr:housenumber" v="49"/> <tag k="addr:street" v="Красная улица"/> <tag k="building" v="yes"/> <tag k="name" v="Калинка"/> <tag k="shop" v="electronics"/> </way> <way id="41961136"> <nd ref="519977109"/> <nd ref="519977296"/> <nd ref="519977225"/> <nd ref="519977255"/> <nd ref="519977109"/> <tag k="addr:housenumber" v="51"/> <tag k="addr:street" v="Красная улица"/> <tag k="building" v="yes"/> </way> <way id="41961139"> <nd ref="519977256"/> <nd ref="519977398"/> <nd ref="519977204"/> <nd ref="519977538"/> <nd ref="519977477"/> <nd ref="519977120"/> <nd ref="519977404"/> <nd ref="519977174"/> <nd ref="519977409"/> <nd ref="1744596876"/> <nd ref="3227796333"/> <nd ref="3227796334"/> <nd ref="420856877"/> <nd ref="3227796335"/> <nd ref="519977107"/> <nd ref="519977382"/> <nd ref="519977256"/> <tag k="addr:housenumber" v="47"/> <tag k="addr:street" v="Красная улица"/> <tag k="building" v="yes"/> </way> <way id="41962063"> <nd ref="519998494"/> <nd ref="519998573"/> <nd ref="519998899"/> <nd ref="519998548"/> <nd ref="519998754"/> <nd ref="519998900"/> <nd ref="519998898"/> <nd ref="519998956"/> <nd ref="519998589"/> <nd ref="519998490"/> <nd ref="519998886"/> <nd ref="519998910"/> <nd ref="519998569"/> <nd ref="519998985"/> <nd ref="519998462"/> <nd ref="519998935"/> <nd ref="519998494"/> <tag k="addr:housenumber" v="1А"/> <tag k="addr:street" v="Первомайский проспект"/> <tag k="building" v="yes"/> </way> <way id="41962077"> <nd ref="519998687"/> <nd ref="519998504"/> <nd ref="519998498"/> <nd ref="519998598"/> <nd ref="519998829"/> <nd ref="519998580"/> <nd ref="519998840"/> <nd ref="519998511"/> <nd ref="519998835"/> <nd ref="519998837"/> <nd ref="519998687"/> <tag k="addr:housenumber" v="3"/> <tag k="addr:street" v="Первомайский проспект"/> <tag k="building" v="yes"/> </way> <way id="42032987"> <nd ref="521698108"/> <nd ref="521698124"/> <nd ref="521698138"/> <nd ref="521698363"/> <nd ref="1824137605"/> <nd ref="1824137606"/> <nd ref="521698266"/> <nd ref="521698460"/> <nd ref="521698108"/> <tag k="addr:housenumber" v="4"/> <tag k="addr:street" v="улица Андропова"/> <tag k="building" v="yes"/> </way> <way id="42036085"> <nd ref="521796464"/> <nd ref="521796498"/> <nd ref="521796490"/> <nd ref="521796497"/> <nd ref="521796489"/> <nd ref="521796458"/> <nd ref="521796464"/> <tag k="addr:housenumber" v="3"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42036086"> <nd ref="521796463"/> <nd ref="521796455"/> <nd ref="521796472"/> <nd ref="521796460"/> <nd ref="521796463"/> <tag k="addr:housenumber" v="9"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42036087"> <nd ref="521796466"/> <nd ref="521796491"/> <nd ref="521796479"/> <nd ref="521796481"/> <nd ref="521796466"/> <tag k="addr:housenumber" v="3Б"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42036090"> <nd ref="521796469"/> <nd ref="521796459"/> <nd ref="521796492"/> <nd ref="521796482"/> <nd ref="521796469"/> <tag k="addr:housenumber" v="3В"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42036091"> <nd ref="521796470"/> <nd ref="521796467"/> <nd ref="521796454"/> <nd ref="521796486"/> <nd ref="521796470"/> <tag k="addr:housenumber" v="5Б"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42036093"> <nd ref="521796457"/> <nd ref="521796495"/> <nd ref="521796496"/> <nd ref="521796477"/> <nd ref="521796457"/> <tag k="addr:housenumber" v="7"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> <tag k="shop" v="computer"/> </way> <way id="42036097"> <nd ref="521796578"/> <nd ref="521796517"/> <nd ref="521796514"/> <nd ref="521796559"/> <nd ref="521796512"/> <nd ref="521796540"/> <nd ref="521796562"/> <nd ref="521796565"/> <nd ref="521796578"/> <tag k="addr:housenumber" v="1"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> <tag k="name" v="Экспоцентр"/> </way> <way id="42036101"> <nd ref="521796593"/> <nd ref="521796526"/> <nd ref="521796582"/> <nd ref="521796553"/> <nd ref="521796535"/> <nd ref="1692701788"/> <nd ref="521796518"/> <nd ref="521796542"/> <nd ref="521796583"/> <nd ref="521796552"/> <nd ref="521796510"/> <nd ref="521796541"/> <nd ref="521796602"/> <nd ref="521796589"/> <nd ref="521796569"/> <nd ref="521796539"/> <nd ref="521796547"/> <nd ref="521796531"/> <nd ref="521796551"/> <nd ref="521796593"/> <tag k="addr:housenumber" v="5"/> <tag k="addr:street" v="улица Фридриха Энгельса"/> <tag k="building" v="yes"/> </way> <way id="42078232"> <nd ref="522764691"/> <nd ref="522725277"/> <nd ref="522695763"/> <nd ref="522754355"/> <nd ref="522764691"/> <tag k="addr:housenumber" v="47"/> <tag k="addr:street" v="улица Антикайнена"/> <tag k="building" v="yes"/> <tag k="building:levels" v="1"/> </way> <way id="42078296"> <nd ref="522691407"/> <nd ref="522679363"/> <nd ref="522679763"/> <nd ref="522685260"/> <nd ref="522691407"/> <tag k="addr:housenumber" v="10"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42078362"> <nd ref="522746159"/> <nd ref="522710890"/> <nd ref="522731070"/> <nd ref="522725175"/> <nd ref="522746159"/> <tag k="addr:housenumber" v="26А"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42078459"> <nd ref="522715368"/> <nd ref="522678246"/> <nd ref="1768267400"/> <nd ref="522689424"/> <nd ref="522699316"/> <nd ref="1768267407"/> <nd ref="522715368"/> <tag k="addr:housenumber" v="19"/> <tag k="addr:street" v="улица Антикайнена"/> <tag k="building" v="yes"/> <tag k="building:levels" v="3"/> <tag k="name" v="Военный комиссариат Республики Карелия"/> <tag k="office" v="government"/> <tag k="short_name" v="Райвоенкомат"/> </way> <way id="42078520"> <nd ref="522767545"/> <nd ref="584905191"/> <nd ref="522692077"/> <nd ref="522717268"/> <nd ref="522767545"/> <tag k="addr:housenumber" v="3"/> <tag k="addr:street" v="улица Андропова"/> <tag k="building" v="yes"/> </way> <way id="42078602"> <nd ref="522778968"/> <nd ref="522704550"/> <nd ref="522695839"/> <nd ref="522701110"/> <nd ref="522779987"/> <nd ref="522680533"/> <nd ref="522778968"/> <tag k="addr:housenumber" v="29"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42078635"> <nd ref="522759115"/> <nd ref="522781850"/> <nd ref="522741123"/> <nd ref="522767115"/> <nd ref="522749081"/> <nd ref="522765799"/> <nd ref="522773101"/> <nd ref="522709833"/> <nd ref="522759115"/> <tag k="addr:housenumber" v="9"/> <tag k="addr:street" v="улица Андропова"/> <tag k="building" v="yes"/> <tag k="building:levels" v="5"/> </way> <way id="42078687"> <nd ref="522731890"/> <nd ref="522729001"/> <nd ref="522730466"/> <nd ref="522738370"/> <nd ref="522731890"/> <tag k="addr:housenumber" v="47А"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42078722"> <nd ref="522744535"/> <nd ref="522715111"/> <nd ref="522682027"/> <nd ref="522689190"/> <nd ref="522740604"/> <nd ref="522690957"/> <nd ref="522692778"/> <nd ref="522679111"/> <nd ref="522712343"/> <nd ref="522762190"/> <nd ref="2099931550"/> <nd ref="522749921"/> <nd ref="522682069"/> <nd ref="522744535"/> <tag k="addr:housenumber" v="37А"/> <tag k="addr:street" v="улица Анохина"/> <tag k="amenity" v="school"/> <tag k="building" v="yes"/> <tag k="ref" v="10"/> </way> <way id="42078730"> <nd ref="522767290"/> <nd ref="522694972"/> <nd ref="522742063"/> <nd ref="522724804"/> <nd ref="522779774"/> <nd ref="522724390"/> <nd ref="522685246"/> <nd ref="522699313"/> <nd ref="522767290"/> <tag k="addr:housenumber" v="35Б"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> </way> <way id="42078851"> <nd ref="522707842"/> <nd ref="522714218"/> <nd ref="1744596925"/> <nd ref="522752473"/> <nd ref="522708670"/> <nd ref="522695264"/> <nd ref="522755554"/> <nd ref="522711368"/> <nd ref="522746702"/> <nd ref="1744596873"/> <nd ref="522707842"/> <tag k="addr:housenumber" v="24"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> <tag k="building:levels" v="2"/> </way> <way id="42078878"> <nd ref="522697219"/> <nd ref="522686780"/> <nd ref="522701213"/> <nd ref="522694334"/> <nd ref="522697219"/> <tag k="addr:housenumber" v="21В"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="42078879"> <nd ref="522743702"/> <nd ref="522735669"/> <nd ref="522774753"/> <nd ref="522703357"/> <nd ref="522743702"/> <tag k="addr:housenumber" v="18"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> <tag k="building:levels" v="5"/> </way> <way id="42078903"> <nd ref="522692375"/> <nd ref="522735499"/> <nd ref="522687865"/> <nd ref="522690257"/> <nd ref="522692375"/> <tag k="addr:housenumber" v="1А"/> <tag k="addr:street" v="улица Андропова"/> <tag k="building" v="yes"/> </way> <way id="42078905"> <nd ref="522689786"/> <nd ref="522684615"/> <nd ref="522772564"/> <nd ref="522718857"/> <nd ref="522689786"/> <tag k="addr:housenumber" v="11А"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="42078914"> <nd ref="522692293"/> <nd ref="522718754"/> <nd ref="522711534"/> <nd ref="522709107"/> <nd ref="522691553"/> <nd ref="522728394"/> <nd ref="522692293"/> <tag k="addr:housenumber" v="20"/> <tag k="addr:street" v="улица Антикайнена"/> <tag k="building" v="yes"/> <tag k="building:levels" v="5"/> </way> <way id="42078922"> <nd ref="522685025"/> <nd ref="522771279"/> <nd ref="522771453"/> <nd ref="522698109"/> <nd ref="522685025"/> <tag k="addr:housenumber" v="8"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42078934"> <nd ref="522765628"/> <nd ref="522762970"/> <nd ref="522728919"/> <nd ref="522680419"/> <nd ref="522763574"/> <nd ref="522737207"/> <nd ref="522765628"/> <tag k="addr:housenumber" v="24"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> <tag k="ruins" v="yes"/> </way> <way id="42079041"> <nd ref="522686853"/> <nd ref="522766785"/> <nd ref="522698778"/> <nd ref="522678369"/> <nd ref="522686853"/> <tag k="addr:housenumber" v="5В"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42079071"> <nd ref="522746921"/> <nd ref="522689089"/> <nd ref="522717061"/> <nd ref="522777669"/> <nd ref="522746921"/> <tag k="addr:housenumber" v="15"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42079081"> <nd ref="522699829"/> <nd ref="522679686"/> <nd ref="522745862"/> <nd ref="522715715"/> <nd ref="522736507"/> <nd ref="522701721"/> <nd ref="522699829"/> <tag k="addr:housenumber" v="35"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> <tag k="name" v="Филиал МТС"/> <tag k="office" v="telecommunication"/> <tag k="operator" v="МТС"/> <tag k="shop" v="mobile_phone"/> <tag k="website" v="http://mts.ru/"/> </way> <way id="42079141"> <nd ref="522773441"/> <nd ref="522715899"/> <nd ref="522747072"/> <nd ref="522713326"/> <nd ref="522773441"/> <tag k="addr:housenumber" v="7А"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42079180"> <nd ref="522776872"/> <nd ref="522739739"/> <nd ref="522708562"/> <nd ref="522753542"/> <nd ref="522776872"/> <tag k="addr:housenumber" v="11"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42079185"> <nd ref="522756355"/> <nd ref="522765808"/> <nd ref="522764568"/> <nd ref="522750447"/> <nd ref="522756355"/> <tag k="addr:housenumber" v="40"/> <tag k="addr:street" v="Красная улица"/> <tag k="building" v="yes"/> </way> <way id="42079195"> <nd ref="522724518"/> <nd ref="522706362"/> <nd ref="522678064"/> <nd ref="522734497"/> <nd ref="519977227"/> <nd ref="522724518"/> <tag k="addr:housenumber" v="47Б"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42079199"> <nd ref="522770099"/> <nd ref="522711321"/> <nd ref="522772748"/> <nd ref="522716615"/> <nd ref="522689074"/> <nd ref="522678405"/> <nd ref="2938709826"/> <nd ref="1406758068"/> <nd ref="1406758069"/> <nd ref="1773521555"/> <nd ref="1773521554"/> <nd ref="522723362"/> <nd ref="1406758067"/> <nd ref="2938709827"/> <nd ref="1406758070"/> <nd ref="522690417"/> <nd ref="519975113"/> <nd ref="522728220"/> <nd ref="522770099"/> <tag k="addr:housenumber" v="24А"/> <tag k="addr:street" v="Красноармейская улица"/> <tag k="amenity" v="courthouse"/> <tag k="building" v="yes"/> <tag k="layer" v="1"/> <tag k="name" v="Арбитражный суд РК"/> </way> <way id="42079200"> <nd ref="522719141"/> <nd ref="1824115572"/> <nd ref="522762643"/> <nd ref="522768840"/> <nd ref="522745013"/> <nd ref="522781610"/> <nd ref="522726494"/> <nd ref="522738272"/> <nd ref="522765990"/> <nd ref="522688239"/> <nd ref="522700408"/> <nd ref="522778485"/> <nd ref="522717037"/> <nd ref="1744596888"/> <nd ref="522764060"/> <nd ref="1744597213"/> <nd ref="1824106803"/> <nd ref="522758968"/> <nd ref="522690278"/> <nd ref="1824123899"/> <nd ref="1824123897"/> <nd ref="1824123896"/> <nd ref="522723927"/> <nd ref="522719141"/> <tag k="addr:housenumber" v="26"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> <tag k="building:levels" v="4"/> </way> <way id="42079256"> <nd ref="522777093"/> <nd ref="522780352"/> <nd ref="522729564"/> <nd ref="522760196"/> <nd ref="522777093"/> <tag k="addr:housenumber" v="26"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42079310"> <nd ref="522758836"/> <nd ref="522706950"/> <nd ref="522699308"/> <nd ref="522691171"/> <nd ref="522700080"/> <nd ref="522743949"/> <nd ref="522750102"/> <nd ref="522728000"/> <nd ref="522776482"/> <nd ref="522742283"/> <nd ref="522679179"/> <nd ref="522780613"/> <nd ref="522758836"/> <tag k="addr:housenumber" v="7"/> <tag k="addr:street" v="улица Антикайнена"/> <tag k="building" v="yes"/> <tag k="building:levels" v="3"/> </way> <way id="42079318"> <nd ref="522737641"/> <nd ref="1773521704"/> <nd ref="522732280"/> <nd ref="1767558984"/> <nd ref="522720660"/> <nd ref="522761934"/> <nd ref="613705856"/> <nd ref="613705855"/> <nd ref="1767558990"/> <nd ref="1767558994"/> <nd ref="1767558988"/> <nd ref="1767558986"/> <nd ref="522680371"/> <nd ref="522763035"/> <nd ref="522766677"/> <nd ref="1773521703"/> <nd ref="1773521702"/> <nd ref="1773521699"/> <nd ref="1773521700"/> <nd ref="522688283"/> <nd ref="522690536"/> <nd ref="522737641"/> <tag k="addr:housenumber" v="4"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> <tag k="name" v="Ростелеком"/> <tag k="office" v="telecommunication"/> </way> <way id="42079334"> <nd ref="522756726"/> <nd ref="522761381"/> <nd ref="522717003"/> <nd ref="522677896"/> <nd ref="522756726"/> <tag k="addr:housenumber" v="29"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42079399"> <nd ref="522776614"/> <nd ref="522740112"/> <nd ref="522727931"/> <nd ref="522779892"/> <nd ref="522776614"/> <tag k="addr:housenumber" v="23А"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="42079400"> <nd ref="522760232"/> <nd ref="522680108"/> <nd ref="522732397"/> <nd ref="522707623"/> <nd ref="522760232"/> <tag k="addr:housenumber" v="18Б"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42079451"> <nd ref="522688874"/> <nd ref="522773326"/> <nd ref="522723520"/> <nd ref="522707561"/> <nd ref="522715080"/> <nd ref="1744596904"/> <nd ref="522726160"/> <nd ref="522688201"/> <nd ref="522696077"/> <nd ref="522688874"/> <tag k="addr:housenumber" v="24А"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> <tag k="building:levels" v="2"/> </way> <way id="42079452"> <nd ref="522685729"/> <nd ref="1740301972"/> <nd ref="1740301978"/> <nd ref="522689013"/> <nd ref="522749433"/> <nd ref="522704050"/> <nd ref="522685729"/> <tag k="addr:housenumber" v="1А"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42079463"> <nd ref="522718441"/> <nd ref="522723741"/> <nd ref="522770918"/> <nd ref="522678780"/> <nd ref="1406160467"/> <nd ref="522718441"/> <tag k="addr:housenumber" v="30"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> </way> <way id="42079487"> <nd ref="522730126"/> <nd ref="522711317"/> <nd ref="522715217"/> <nd ref="522764399"/> <nd ref="1744596871"/> <nd ref="522730126"/> <tag k="addr:housenumber" v="17"/> <tag k="addr:street" v="улица Фридриха Энгельса"/> <tag k="building" v="yes"/> <tag k="building:levels" v="4"/> </way> <way id="42079493"> <nd ref="522710091"/> <nd ref="522678385"/> <nd ref="522762726"/> <nd ref="522713115"/> <nd ref="522710091"/> <tag k="addr:housenumber" v="2"/> <tag k="addr:street" v="Закаменский переулок"/> <tag k="building" v="yes"/> </way> <way id="42079498"> <nd ref="522732469"/> <nd ref="522777924"/> <nd ref="522740319"/> <nd ref="522691901"/> <nd ref="522767958"/> <nd ref="522711516"/> <nd ref="522732469"/> <tag k="addr:housenumber" v="7А"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="42079522"> <nd ref="522691532"/> <nd ref="522768305"/> <nd ref="522733795"/> <nd ref="522761537"/> <nd ref="522688497"/> <nd ref="522691532"/> <tag k="addr:housenumber" v="28"/> <tag k="addr:street" v="Красноармейская улица"/> <tag k="building" v="yes"/> </way> <way id="42079570"> <nd ref="522685645"/> <nd ref="522684789"/> <nd ref="522774204"/> <nd ref="522777911"/> <nd ref="522689160"/> <nd ref="522729326"/> <nd ref="522685645"/> <tag k="addr:housenumber" v="13Б"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> <tag k="building:levels" v="2"/> </way> <way id="42079618"> <nd ref="522684184"/> <nd ref="522764662"/> <nd ref="522747992"/> <nd ref="522714653"/> <nd ref="522684184"/> <tag k="addr:housenumber" v="28А"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> </way> <way id="42079703"> <nd ref="522681542"/> <nd ref="522695689"/> <nd ref="522748585"/> <nd ref="522773702"/> <nd ref="522704632"/> <nd ref="522771464"/> <nd ref="522677065"/> <nd ref="522773591"/> <nd ref="522681542"/> <tag k="addr:housenumber" v="31Б"/> <tag k="addr:street" v="Красноармейская улица"/> <tag k="building" v="yes"/> </way> <way id="42079708"> <nd ref="522693067"/> <nd ref="522780868"/> <nd ref="522698123"/> <nd ref="522697549"/> <nd ref="522779438"/> <nd ref="522768182"/> <nd ref="522725805"/> <nd ref="522701335"/> <nd ref="522693067"/> <tag k="addr:housenumber" v="14"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42079721"> <nd ref="522749661"/> <nd ref="522727799"/> <nd ref="522735511"/> <nd ref="522718802"/> <nd ref="522749661"/> <tag k="addr:housenumber" v="5"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="42079865"> <nd ref="522690349"/> <nd ref="522726629"/> <nd ref="522696021"/> <nd ref="522737170"/> <nd ref="522690349"/> <tag k="addr:housenumber" v="5А"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="42079909"> <nd ref="522770076"/> <nd ref="522750666"/> <nd ref="522689416"/> <nd ref="522768821"/> <nd ref="522752777"/> <nd ref="522680101"/> <nd ref="522700923"/> <nd ref="522728901"/> <nd ref="522774473"/> <nd ref="522773478"/> <nd ref="522716151"/> <nd ref="522781376"/> <nd ref="522766246"/> <nd ref="522736499"/> <nd ref="522770076"/> <tag k="addr:housenumber" v="31"/> <tag k="addr:street" v="Красноармейская улица"/> <tag k="amenity" v="university"/> <tag k="building" v="yes"/> <tag k="name" v="Медицинский корпус ПетрГУ"/> <tag k="operator" v="Петрозаводский Государственный Университет"/> </way> <way id="42079945"> <nd ref="522720161"/> <nd ref="522677901"/> <nd ref="522740290"/> <nd ref="522748671"/> <nd ref="522720161"/> <tag k="addr:housenumber" v="4"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42079963"> <nd ref="522776645"/> <nd ref="522695036"/> <nd ref="522693294"/> <nd ref="522688615"/> <nd ref="522776645"/> <tag k="addr:housenumber" v="5А"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42079989"> <nd ref="522745551"/> <nd ref="522733593"/> <nd ref="522685089"/> <nd ref="522741869"/> <nd ref="522745551"/> <tag k="addr:housenumber" v="2Е"/> <tag k="addr:street" v="Закаменский переулок"/> <tag k="building" v="yes"/> </way> <way id="42080103"> <nd ref="522702562"/> <nd ref="522714291"/> <nd ref="522706541"/> <nd ref="522697623"/> <nd ref="522702562"/> <tag k="addr:housenumber" v="9"/> <tag k="addr:street" v="Студенческий переулок"/> <tag k="building" v="yes"/> </way> <way id="42080105"> <nd ref="522697913"/> <nd ref="522717525"/> <nd ref="522734035"/> <nd ref="522726829"/> <nd ref="522729068"/> <nd ref="522765771"/> <nd ref="522680100"/> <nd ref="522709889"/> <nd ref="522688867"/> <nd ref="522758532"/> <nd ref="522708616"/> <nd ref="522701288"/> <nd ref="3141315398"/> <nd ref="3141315399"/> <nd ref="3141315406"/> <nd ref="522703799"/> <nd ref="522697913"/> <tag k="addr:housenumber" v="38А"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> </way> <way id="42080117"> <nd ref="522733596"/> <nd ref="522706574"/> <nd ref="522685087"/> <nd ref="522726185"/> <nd ref="522733596"/> <tag k="addr:housenumber" v="3"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="42080164"> <nd ref="522758865"/> <nd ref="522781032"/> <nd ref="522746049"/> <nd ref="522724981"/> <nd ref="522758865"/> <tag k="addr:housenumber" v="10"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> <tag k="dance:style" v="samba;rumba;jive;tango;slow_waltz;vienne_waltz;quickstep;pasodoble"/> <tag k="dance:teaching" v="yes"/> <tag k="leisure" v="sports_centre"/> <tag k="name" v="Танцевальный клуб &quot;Ритм&quot;"/> </way> <way id="42080185"> <nd ref="522700319"/> <nd ref="522691108"/> <nd ref="522680310"/> <nd ref="522683099"/> <nd ref="522700319"/> <tag k="addr:housenumber" v="2Б"/> <tag k="addr:street" v="Закаменский переулок"/> <tag k="building" v="yes"/> </way> <way id="42080245"> <nd ref="522763480"/> <nd ref="1744597021"/> <nd ref="522724340"/> <nd ref="522709051"/> <nd ref="522773305"/> <nd ref="522763480"/> <tag k="addr:housenumber" v="51"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> <tag k="building:levels" v="2"/> </way> <way id="42080291"> <nd ref="522701478"/> <nd ref="3141314112"/> <nd ref="2795670109"/> <nd ref="2795670110"/> <nd ref="522762416"/> <nd ref="522684388"/> <nd ref="522701478"/> <tag k="addr:housenumber" v="33"/> <tag k="addr:street" v="Красноармейская улица"/> <tag k="building" v="yes"/> </way> <way id="42080316"> <nd ref="522686879"/> <nd ref="522751029"/> <nd ref="522764135"/> <nd ref="522717461"/> <nd ref="522686879"/> <tag k="addr:housenumber" v="45"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42080345"> <nd ref="522749017"/> <nd ref="522723353"/> <nd ref="522771280"/> <nd ref="522781841"/> <nd ref="522685802"/> <nd ref="522689253"/> <nd ref="522708274"/> <nd ref="522776342"/> <nd ref="1744596856"/> <nd ref="522749017"/> <tag k="addr:housenumber" v="22А"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> <tag k="building:levels" v="2"/> </way> <way id="42080392"> <nd ref="522753872"/> <nd ref="522710635"/> <nd ref="522705439"/> <nd ref="522772640"/> <nd ref="522753872"/> <tag k="addr:housenumber" v="18В"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42080430"> <nd ref="522719283"/> <nd ref="522729722"/> <nd ref="522745531"/> <nd ref="522733708"/> <nd ref="522719283"/> <tag k="addr:housenumber" v="1А"/> <tag k="addr:street" v="площадь Ленина"/> <tag k="building" v="yes"/> <tag k="power" v="substation"/> </way> <way id="42080644"> <nd ref="522711112"/> <nd ref="522739683"/> <nd ref="522705544"/> <nd ref="522719264"/> <nd ref="522711112"/> <tag k="addr:housenumber" v="45"/> <tag k="addr:street" v="улица Антикайнена"/> <tag k="building" v="yes"/> <tag k="building:levels" v="1"/> </way> <way id="42080658"> <nd ref="522766964"/> <nd ref="522705417"/> <nd ref="522680345"/> <nd ref="522739151"/> <nd ref="522701451"/> <nd ref="522694486"/> <nd ref="522766964"/> <tag k="addr:housenumber" v="30"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42080669"> <nd ref="522735463"/> <nd ref="522691180"/> <nd ref="522775773"/> <nd ref="522697202"/> <nd ref="522735463"/> <tag k="addr:housenumber" v="16"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42080687"> <nd ref="522720306"/> <nd ref="522773929"/> <nd ref="522703579"/> <nd ref="2326775774"/> <nd ref="2326775856"/> <nd ref="522704473"/> <nd ref="522688348"/> <nd ref="2326775766"/> <nd ref="522732494"/> <nd ref="522759272"/> <nd ref="522720306"/> <tag k="addr:housenumber" v="26"/> <tag k="addr:street" v="улица Свердлова"/> <tag k="building" v="yes"/> </way> <way id="42080707"> <nd ref="522689725"/> <nd ref="522716815"/> <nd ref="522763245"/> <nd ref="522708253"/> <nd ref="522684679"/> <nd ref="522779496"/> <nd ref="1744596861"/> <nd ref="1744596853"/> <nd ref="522689725"/> <tag k="addr:housenumber" v="36"/> <tag k="addr:street" v="Красная улица"/> <tag k="building" v="yes"/> <tag k="building:levels" v="2"/> </way> <way id="42080729"> <nd ref="522745431"/> <nd ref="522777157"/> <nd ref="614308240"/> <nd ref="614308242"/> <nd ref="522745431"/> <tag k="addr:housenumber" v="31"/> <tag k="addr:street" v="улица Свердлова"/> <tag k="building" v="yes"/> </way> <way id="42080766"> <nd ref="522678367"/> <nd ref="1335828030"/> <nd ref="522734361"/> <nd ref="522683630"/> <nd ref="522728315"/> <nd ref="522678367"/> <tag k="addr:housenumber" v="5"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42080794"> <nd ref="522713445"/> <nd ref="522738545"/> <nd ref="522697028"/> <nd ref="522719565"/> <nd ref="522755948"/> <nd ref="522689546"/> <nd ref="522741357"/> <nd ref="522723863"/> <nd ref="522725762"/> <nd ref="522696179"/> <nd ref="522716335"/> <nd ref="522754408"/> <nd ref="522730744"/> <nd ref="522710650"/> <nd ref="522760726"/> <nd ref="522697891"/> <nd ref="522705124"/> <nd ref="522705359"/> <nd ref="522764293"/> <nd ref="522730889"/> <nd ref="522780833"/> <nd ref="522771838"/> <nd ref="522713445"/> <tag k="addr:housenumber" v="10"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42080805"> <nd ref="522677297"/> <nd ref="522714700"/> <nd ref="1781833807"/> <nd ref="1781833805"/> <nd ref="1781833793"/> <nd ref="1781833795"/> <nd ref="522680564"/> <nd ref="522741311"/> <nd ref="522677297"/> <tag k="addr:housenumber" v="49"/> <tag k="addr:street" v="улица Антикайнена"/> <tag k="building" v="yes"/> <tag k="building:levels" v="2"/> </way> <way id="42080812"> <nd ref="522713606"/> <nd ref="522765729"/> <nd ref="522746311"/> <nd ref="522773963"/> <nd ref="522713606"/> <tag k="addr:housenumber" v="17"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42080887"> <nd ref="522699189"/> <nd ref="522689414"/> <nd ref="522744194"/> <nd ref="522707110"/> <nd ref="522699189"/> <tag k="addr:housenumber" v="8А"/> <tag k="addr:street" v="улица Антикайнена"/> <tag k="building" v="yes"/> </way> <way id="42080905"> <nd ref="522688359"/> <nd ref="522684135"/> <nd ref="522762997"/> <nd ref="522735880"/> <nd ref="522709792"/> <nd ref="522735941"/> <nd ref="522688359"/> <tag k="addr:housenumber" v="18"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42080972"> <nd ref="522691579"/> <nd ref="1767558961"/> <nd ref="522760508"/> <nd ref="365575081"/> <nd ref="522695275"/> <nd ref="522768210"/> <nd ref="522691579"/> <tag k="addr:housenumber" v="26"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42081068"> <nd ref="522746504"/> <nd ref="522761438"/> <nd ref="522700068"/> <nd ref="522717388"/> <nd ref="522728792"/> <nd ref="522699160"/> <nd ref="522746880"/> <nd ref="522724095"/> <nd ref="522691099"/> <nd ref="522678565"/> <nd ref="522708245"/> <nd ref="522735202"/> <nd ref="522746504"/> <tag k="addr:housenumber" v="29А"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42081076"> <nd ref="522715108"/> <nd ref="522700525"/> <nd ref="522709283"/> <nd ref="522694171"/> <nd ref="522715108"/> <tag k="addr:housenumber" v="34"/> <tag k="addr:street" v="Красная улица"/> <tag k="building" v="yes"/> <tag k="building:levels" v="5"/> </way> <way id="42081140"> <nd ref="522679768"/> <nd ref="522696369"/> <nd ref="522681511"/> <nd ref="522733067"/> <nd ref="522679768"/> <tag k="addr:housenumber" v="3А"/> <tag k="addr:street" v="улица Антикайнена"/> <tag k="building" v="yes"/> </way> <way id="42081190"> <nd ref="522731485"/> <nd ref="522756604"/> <nd ref="522756833"/> <nd ref="522734852"/> <nd ref="522703052"/> <nd ref="522770123"/> <nd ref="522706743"/> <nd ref="522733698"/> <nd ref="522697944"/> <nd ref="522719240"/> <nd ref="522703226"/> <nd ref="522706964"/> <nd ref="522731485"/> <tag k="addr:housenumber" v="2"/> <tag k="addr:street" v="улица Андропова"/> <tag k="building" v="yes"/> </way> <way id="42081199"> <nd ref="522768921"/> <nd ref="522724496"/> <nd ref="522735535"/> <nd ref="522762063"/> <nd ref="522768921"/> <tag k="addr:housenumber" v="2А"/> <tag k="addr:street" v="Закаменский переулок"/> <tag k="building" v="yes"/> </way> <way id="42081240"> <nd ref="522718771"/> <nd ref="522758927"/> <nd ref="522736703"/> <nd ref="522689674"/> <nd ref="522718771"/> <tag k="addr:housenumber" v="21Б"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="42081245"> <nd ref="522701295"/> <nd ref="522745364"/> <nd ref="522782247"/> <nd ref="522723691"/> <nd ref="522701295"/> <tag k="addr:housenumber" v="28А"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42081279"> <nd ref="522710303"/> <nd ref="522707286"/> <nd ref="522711290"/> <nd ref="522730401"/> <nd ref="522691068"/> <nd ref="522679072"/> <nd ref="522710303"/> <tag k="addr:housenumber" v="45Б"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42081302"> <nd ref="522690782"/> <nd ref="522695672"/> <nd ref="522775689"/> <nd ref="522721335"/> <nd ref="522683839"/> <nd ref="1767558998"/> <nd ref="1767558997"/> <nd ref="522766362"/> <nd ref="522725431"/> <nd ref="1767559014"/> <nd ref="1767559000"/> <nd ref="522701124"/> <nd ref="522690782"/> <tag k="addr:housenumber" v="31Б"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42081331"> <nd ref="522709022"/> <nd ref="522757184"/> <nd ref="522724090"/> <nd ref="522760059"/> <nd ref="522739655"/> <nd ref="522732401"/> <nd ref="522709022"/> <tag k="addr:housenumber" v="7"/> <tag k="addr:street" v="Закаменский переулок"/> <tag k="building" v="yes"/> </way> <way id="42081351"> <nd ref="522703769"/> <nd ref="522764921"/> <nd ref="522677075"/> <nd ref="522723816"/> <nd ref="522703769"/> <tag k="addr:housenumber" v="31В"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42081363"> <nd ref="522770296"/> <nd ref="522763191"/> <nd ref="522763698"/> <nd ref="522731819"/> <nd ref="522770296"/> <tag k="addr:housenumber" v="45"/> <tag k="addr:street" v="Красная улица"/> <tag k="building" v="yes"/> </way> <way id="42081411"> <nd ref="522696970"/> <nd ref="522681120"/> <nd ref="522764515"/> <nd ref="522756246"/> <nd ref="522709513"/> <nd ref="1824089041"/> <nd ref="1824089050"/> <nd ref="610234788"/> <nd ref="1744596887"/> <nd ref="1335828034"/> <nd ref="522730321"/> <nd ref="1824089076"/> <nd ref="1824089078"/> <nd ref="1824089077"/> <nd ref="1824089045"/> <nd ref="1824089065"/> <nd ref="522767520"/> <nd ref="522750766"/> <nd ref="522696970"/> <tag k="addr:housenumber" v="13"/> <tag k="addr:street" v="улица Фридриха Энгельса"/> <tag k="building" v="yes"/> </way> <way id="42081443"> <nd ref="522734293"/> <nd ref="522752391"/> <nd ref="522717230"/> <nd ref="522690281"/> <nd ref="522704694"/> <nd ref="522683291"/> <nd ref="522739931"/> <nd ref="522723024"/> <nd ref="522734293"/> <tag k="addr:housenumber" v="45А"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42081488"> <nd ref="522712183"/> <nd ref="522713946"/> <nd ref="522747141"/> <nd ref="522739915"/> <nd ref="522712183"/> <tag k="addr:housenumber" v="2А"/> <tag k="addr:street" v="площадь Ленина"/> <tag k="building" v="yes"/> </way> <way id="42081513"> <nd ref="522740684"/> <nd ref="522741740"/> <nd ref="1335828029"/> <nd ref="522693146"/> <nd ref="522757157"/> <nd ref="522680634"/> <nd ref="522772070"/> <nd ref="522680258"/> <nd ref="522690409"/> <nd ref="522740684"/> <tag k="addr:housenumber" v="22"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42081569"> <nd ref="522765035"/> <nd ref="522752201"/> <nd ref="522741136"/> <nd ref="522703814"/> <nd ref="522765035"/> <tag k="addr:housenumber" v="4"/> <tag k="addr:street" v="Закаменский переулок"/> <tag k="building" v="yes"/> </way> <way id="42081642"> <nd ref="522774979"/> <nd ref="522722508"/> <nd ref="522748267"/> <nd ref="522686479"/> <nd ref="522690364"/> <nd ref="522689509"/> <nd ref="522680782"/> <nd ref="522726748"/> <nd ref="522705919"/> <nd ref="522751501"/> <nd ref="522765865"/> <nd ref="522777680"/> <nd ref="522731623"/> <nd ref="522778252"/> <nd ref="522774979"/> <tag k="addr:housenumber" v="15А"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42081759"> <nd ref="522698227"/> <nd ref="522743775"/> <nd ref="522700572"/> <nd ref="522698118"/> <nd ref="522767737"/> <nd ref="522732542"/> <nd ref="522698227"/> <tag k="addr:housenumber" v="41"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42081769"> <nd ref="522695532"/> <nd ref="522717337"/> <nd ref="522754869"/> <nd ref="522724008"/> <nd ref="522695532"/> <tag k="addr:housenumber" v="5А"/> <tag k="addr:street" v="улица Андропова"/> <tag k="amenity" v="public_building"/> <tag k="building" v="yes"/> <tag k="name" v="Казенное учереждение Национальный архив Республики Карелия"/> <tag k="name:en" v="National archive of Republic of Karelia"/> </way> <way id="42081805"> <nd ref="522744057"/> <nd ref="522708457"/> <nd ref="522731936"/> <nd ref="522761215"/> <nd ref="522744057"/> <tag k="addr:housenumber" v="20"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> <tag k="building:levels" v="5"/> </way> <way id="42081879"> <nd ref="522712868"/> <nd ref="522730313"/> <nd ref="522683332"/> <nd ref="522752710"/> <nd ref="522718015"/> <nd ref="522737046"/> <nd ref="522755062"/> <nd ref="522720835"/> <nd ref="522772179"/> <nd ref="522766146"/> <nd ref="522700406"/> <nd ref="522691617"/> <nd ref="522782073"/> <nd ref="522768520"/> <nd ref="522714172"/> <nd ref="522684907"/> <nd ref="522693797"/> <nd ref="522721347"/> <nd ref="522678657"/> <nd ref="522724133"/> <nd ref="522767759"/> <nd ref="522724891"/> <nd ref="522712868"/> <tag k="addr:housenumber" v="5"/> <tag k="addr:street" v="улица Андропова"/> <tag k="amenity" v="police"/> <tag k="building" v="yes"/> <tag k="name" v="ФСБ"/> </way> <way id="42081905"> <nd ref="522760980"/> <nd ref="522740887"/> <nd ref="522741611"/> <nd ref="522716940"/> <nd ref="522760980"/> <tag k="addr:housenumber" v="5"/> <tag k="addr:street" v="улица Антикайнена"/> <tag k="building" v="yes"/> </way> <way id="42081919"> <nd ref="522762433"/> <nd ref="522733788"/> <nd ref="522693652"/> <nd ref="522737083"/> <nd ref="522756577"/> <nd ref="522684535"/> <nd ref="522718025"/> <nd ref="522705908"/> <nd ref="522762433"/> <tag k="addr:housenumber" v="10"/> <tag k="addr:street" v="улица Андропова"/> <tag k="building" v="yes"/> </way> <way id="42081967"> <nd ref="522698774"/> <nd ref="522779883"/> <nd ref="522740426"/> <nd ref="522694089"/> <nd ref="522716204"/> <nd ref="522735082"/> <nd ref="522698774"/> <tag k="addr:housenumber" v="18"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42081976"> <nd ref="522769899"/> <nd ref="522746411"/> <nd ref="522726844"/> <nd ref="522727688"/> <nd ref="522781515"/> <nd ref="522758019"/> <nd ref="522695534"/> <nd ref="522766922"/> <nd ref="522779419"/> <nd ref="522699394"/> <nd ref="522769899"/> <tag k="addr:housenumber" v="7"/> <tag k="addr:street" v="улица Дзержинского"/> <tag k="building" v="yes"/> <tag k="name" v="Детский мир"/> <tag k="shop" v="toys"/> </way> <way id="42082004"> <nd ref="522689045"/> <nd ref="522692435"/> <nd ref="522737125"/> <nd ref="522722855"/> <nd ref="522713300"/> <nd ref="522758107"/> <nd ref="522690125"/> <nd ref="522681165"/> <nd ref="522689045"/> <tag k="addr:housenumber" v="37А"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> </way> <way id="42082016"> <nd ref="522707357"/> <nd ref="522724793"/> <nd ref="522737142"/> <nd ref="522749937"/> <nd ref="522707357"/> <tag k="addr:housenumber" v="20"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42082021"> <nd ref="522773750"/> <nd ref="522711123"/> <nd ref="522744495"/> <nd ref="522682507"/> <nd ref="522773750"/> <tag k="addr:housenumber" v="36А"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> </way> <way id="42082034"> <nd ref="522735390"/> <nd ref="522715305"/> <nd ref="522710377"/> <nd ref="522712098"/> <nd ref="522688377"/> <nd ref="522699903"/> <nd ref="522735390"/> <tag k="addr:housenumber" v="1"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="42082055"> <nd ref="522724034"/> <nd ref="522752500"/> <nd ref="522738055"/> <nd ref="522740827"/> <nd ref="522774751"/> <nd ref="522727474"/> <nd ref="522760264"/> <nd ref="522707560"/> <nd ref="522682023"/> <nd ref="522739135"/> <nd ref="522742631"/> <nd ref="522719293"/> <nd ref="522712825"/> <nd ref="522689953"/> <nd ref="522685940"/> <nd ref="3372269656"/> <nd ref="522764006"/> <nd ref="522705217"/> <nd ref="522682381"/> <nd ref="522706921"/> <nd ref="522697324"/> <nd ref="522704708"/> <nd ref="522724034"/> <tag k="addr:housenumber" v="21"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> <tag k="name" v="Северная"/> <tag k="name:en" v="Severnaya"/> <tag k="tourism" v="hotel"/> </way> <way id="42082083"> <nd ref="522700513"/> <nd ref="522714782"/> <nd ref="522695571"/> <nd ref="522711068"/> <nd ref="522700513"/> <tag k="addr:housenumber" v="41"/> <tag k="addr:street" v="Красная улица"/> <tag k="building" v="yes"/> <tag k="building:levels" v="1"/> </way> <way id="42082257"> <nd ref="522762252"/> <nd ref="522748502"/> <nd ref="522687144"/> <nd ref="522754792"/> <nd ref="522762252"/> <tag k="addr:housenumber" v="18А"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42082280"> <nd ref="522683949"/> <nd ref="522697141"/> <nd ref="522775727"/> <nd ref="522692751"/> <nd ref="522683949"/> <tag k="addr:housenumber" v="24"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="building" v="yes"/> </way> <way id="42082349"> <nd ref="522771169"/> <nd ref="522761833"/> <nd ref="522693671"/> <nd ref="522775903"/> <nd ref="522771169"/> <tag k="addr:housenumber" v="18"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42082389"> <nd ref="522682639"/> <nd ref="522769790"/> <nd ref="522714152"/> <nd ref="522701001"/> <nd ref="522682639"/> <tag k="addr:housenumber" v="22"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> </way> <way id="42082398"> <nd ref="522774695"/> <nd ref="522679914"/> <nd ref="522711195"/> <nd ref="522699781"/> <nd ref="522689569"/> <nd ref="522689656"/> <nd ref="522774695"/> <tag k="addr:housenumber" v="11"/> <tag k="addr:street" v="улица Фридриха Энгельса"/> <tag k="building" v="yes"/> </way> <way id="42082411"> <nd ref="522751521"/> <nd ref="522727315"/> <nd ref="522770325"/> <nd ref="522781541"/> <nd ref="522751521"/> <tag k="addr:housenumber" v="8"/> <tag k="addr:street" v="улица Антикайнена"/> <tag k="building" v="yes"/> <tag k="building:levels" v="4"/> </way> <way id="42082456"> <nd ref="522700601"/> <nd ref="522677086"/> <nd ref="522699498"/> <nd ref="522690654"/> <nd ref="522700601"/> <tag k="addr:housenumber" v="13А"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="42082468"> <nd ref="522717339"/> <nd ref="522719652"/> <nd ref="1335828062"/> <nd ref="1812513848"/> <nd ref="522677150"/> <nd ref="522767656"/> <nd ref="522764252"/> <nd ref="522726765"/> <nd ref="522679779"/> <nd ref="522745166"/> <nd ref="522717339"/> <tag k="addr:housenumber" v="20"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="building" v="yes"/> </way> <way id="42082519"> <nd ref="522752371"/> <nd ref="522774581"/> <nd ref="522701420"/> <nd ref="522690099"/> <nd ref="1744597120"/> <nd ref="1744597118"/> <nd ref="1744597136"/> <nd ref="1744597139"/> <nd ref="522752371"/> <tag k="addr:housenumber" v="12"/> <tag k="addr:street" v="улица Фридриха Энгельса"/> <tag k="building" v="yes"/> <tag k="building:levels" v="5"/> </way> <way id="42082528"> <nd ref="522679355"/> <nd ref="522695638"/> <nd ref="522781194"/> <nd ref="522703708"/> <nd ref="522679355"/> <tag k="addr:housenumber" v="49"/> <tag k="addr:street" v="улица Анохина"/> <tag k="building" v="yes"/> </way> <way id="42082711"> <nd ref="522742491"/> <nd ref="522717779"/> <nd ref="522751872"/> <nd ref="522690613"/> <nd ref="522742491"/> <tag k="addr:housenumber" v="33"/> <tag k="addr:street" v="улица Герцена"/> <tag k="building" v="yes"/> </way> <way id="42082728"> <nd ref="522728282"/> <nd ref="522702298"/> <nd ref="522726650"/> <nd ref="522699786"/> <nd ref="522760491"/> <nd ref="522750083"/> <nd ref="522728282"/> <tag k="addr:housenumber" v="30"/> <tag k="addr:street" v="улица Свердлова"/> <tag k="building" v="yes"/> </way> <way id="42082740"> <nd ref="613705851"/> <nd ref="613705853"/> <nd ref="522766214"/> <nd ref="522748106"/> <nd ref="613705851"/> <tag k="addr:housenumber" v="6"/> <tag k="addr:street" v="улица Максима Горького"/> <tag k="building" v="yes"/> </way> <way id="42082768"> <nd ref="522678595"/> <nd ref="522719655"/> <nd ref="522759707"/> <nd ref="522700063"/> <nd ref="522686533"/> <nd ref="522732500"/> <nd ref="522759167"/> <nd ref="522743736"/> <nd ref="522717362"/> <nd ref="522745246"/> <nd ref="522678595"/> <tag k="addr:housenumber" v="6"/> <tag k="addr:street" v="улица Андропова"/> <tag k="building" v="yes"/> </way> <way id="42082786"> <nd ref="522732373"/> <nd ref="522707726"/> <nd ref="522711916"/> <nd ref="522744799"/> <nd ref="522682522"/> <nd ref="522781612"/> <nd ref="522765396"/> <nd ref="522689001"/> <nd ref="522732373"/> <tag k="addr:housenumber" v="27"/> <tag k="addr:street" v="проспект Ленина"/> <tag k="amenity" v="nightclub"/> <tag k="building" v="yes"/> <tag k="name" v="Победа"/> <tag k="name:en" v="Pobeda"/> </way> <way id="42082865"> <nd ref="522691541"/> <nd ref="522696867"/> <nd ref="522702302"/> <nd ref="522772908"/> <nd ref="522765885"/> <nd ref="522742915"/> <nd ref="522729346"/> <nd ref="1773521517"/> <nd ref="1773521515"/> <nd ref="1773521510"/> <nd ref="1773521512"/> <nd ref="522765032"/> <nd ref="522691541"/> <tag k="addr:housenumber" v="28"/> <tag k="addr:street" v="улица Гоголя"/> <tag k="amenity" v="public_building"/> <tag k="building" v="yes"/> <tag k="name" v="Дом офицеров"/> </way> <way id="127023621"> <nd ref="1406758062"/> <nd ref="1406758060"/> <nd ref="1406758063"/> <nd ref="1406758064"/> <nd ref="1406758062"/> <tag k="building" v="yes"/> <tag k="power" v="substation"/> </way> <way id="162096323"> <nd ref="1740301914"/> <nd ref="1740301908"/> <nd ref="1740301895"/> <nd ref="1740301872"/> <nd ref="1740301847"/> <nd ref="1740301842"/> <nd ref="1740301843"/> <nd ref="1740301861"/> <nd ref="1740301883"/> <nd ref="1740301864"/> <nd ref="1740301835"/> <nd ref="1740301828"/> <nd ref="1740301809"/> <nd ref="1740301808"/> <nd ref="1740301811"/> <nd ref="1740301832"/> <nd ref="1740301839"/> <nd ref="1740301868"/> <nd ref="1740301848"/> <nd ref="1740301885"/> <nd ref="1740301899"/> <nd ref="1740301897"/> <nd ref="1740301904"/> <nd ref="1740301907"/> <nd ref="1740301917"/> <nd ref="1740301914"/> <tag k="building" v="yes"/> </way> <way id="162096324"> <nd ref="1740301954"/> <nd ref="1740301976"/> <nd ref="1740301988"/> <nd ref="1740301993"/> <nd ref="1740301994"/> <nd ref="1740301997"/> <nd ref="1740301998"/> <nd ref="1740301996"/> <nd ref="1740301992"/> <nd ref="1740301990"/> <nd ref="1740301985"/> <nd ref="1740301983"/> <nd ref="1740301977"/> <nd ref="1740301968"/> <nd ref="1740301966"/> <nd ref="1740301947"/> <nd ref="1740301955"/> <nd ref="1740301981"/> <nd ref="1740301991"/> <nd ref="1740301999"/> <nd ref="1740302004"/> <nd ref="1740302005"/> <nd ref="1740302007"/> <nd ref="1740302009"/> <nd ref="1740302010"/> <nd ref="1740302006"/> <nd ref="1740302002"/> <nd ref="1740302001"/> <nd ref="1740301995"/> <nd ref="1740302000"/> <nd ref="1740301980"/> <nd ref="1740301964"/> <nd ref="1740301954"/> <tag k="building" v="yes"/> </way> <way id="162096326"> <nd ref="1740301950"/> <nd ref="1740301963"/> <nd ref="1740301920"/> <nd ref="1740301915"/> <nd ref="1740301950"/> <tag k="building" v="yes"/> </way> <way id="162597834"> <nd ref="1744596895"/> <nd ref="1744596893"/> <nd ref="1744596896"/> <nd ref="1744596897"/> <nd ref="1744596895"/> <tag k="building" v="yes"/> </way> <way id="162597835"> <nd ref="1744596917"/> <nd ref="1744596908"/> <nd ref="1744596919"/> <nd ref="1744596929"/> <nd ref="1744596917"/> <tag k="building" v="yes"/> </way> <way id="162597838"> <nd ref="1744597035"/> <nd ref="1744597045"/> <nd ref="1744597052"/> <nd ref="1744597040"/> <nd ref="1744597035"/> <tag k="building" v="yes"/> </way> <way id="162597840"> <nd ref="1744596927"/> <nd ref="1744596944"/> <nd ref="1744596947"/> <nd ref="1744596923"/> <nd ref="1744596927"/> <tag k="building" v="yes"/> <tag k="shop" v="kiosk"/> </way> <way id="162597841"> <nd ref="1744596914"/> <nd ref="1744596911"/> <nd ref="1744596926"/> <nd ref="1744596928"/> <nd ref="1744596914"/> <tag k="building" v="yes"/> </way> <way id="162597844"> <nd ref="1744596981"/> <nd ref="1744596972"/> <nd ref="1744596957"/> <nd ref="1744596969"/> <nd ref="1744596981"/> <tag k="building" v="yes"/> <tag k="power" v="substation"/> </way> <way id="162597845"> <nd ref="1744596938"/> <nd ref="1744596936"/> <nd ref="1744596931"/> <nd ref="1744596934"/> <nd ref="1744596938"/> <tag k="building" v="yes"/> </way> <way id="162597848"> <nd ref="1744597047"/> <nd ref="1744597043"/> <nd ref="1744597036"/> <nd ref="1744597038"/> <nd ref="1744597047"/> <tag k="building" v="yes"/> <tag k="building:levels" v="1"/> </way> <way id="162597849"> <nd ref="1744597010"/> <nd ref="1744596998"/> <nd ref="1744596955"/> <nd ref="1744596968"/> <nd ref="1744596950"/> <nd ref="1744596963"/> <nd ref="1744597010"/> <tag k="building" v="yes"/> </way> <way id="162677859"> <nd ref="1745321822"/> <nd ref="1745321821"/> <nd ref="1745321817"/> <nd ref="1745321818"/> <nd ref="1745321822"/> <tag k="building" v="yes"/> </way> <way id="162677860"> <nd ref="1745321781"/> <nd ref="1745321780"/> <nd ref="1745321783"/> <nd ref="1745321784"/> <nd ref="1745321781"/> <tag k="building" v="yes"/> </way> <way id="165087670"> <nd ref="1766695082"/> <nd ref="1766695081"/> <nd ref="1766695083"/> <nd ref="1766695085"/> <nd ref="1766695082"/> <tag k="bench" v="yes"/> <tag k="building" v="yes"/> </way> <way id="165087675"> <nd ref="1766695331"/> <nd ref="1766695330"/> <nd ref="1766695321"/> <nd ref="1766695323"/> <nd ref="1766695331"/> <tag k="building" v="yes"/> </way> <way id="165087678"> <nd ref="1766695137"/> <nd ref="1766695141"/> <nd ref="1766695142"/> <nd ref="1766695139"/> <nd ref="1766695137"/> <tag k="building" v="yes"/> <tag k="shop" v="kiosk"/> </way> <way id="165087679"> <nd ref="1766695294"/> <nd ref="1766695259"/> <nd ref="1766695304"/> <nd ref="1766695311"/> <nd ref="1766695294"/> <tag k="building" v="yes"/> </way> <way id="165087681"> <nd ref="1766695362"/> <nd ref="1766695371"/> <nd ref="1766695352"/> <nd ref="1766695332"/> <nd ref="1766695362"/> <tag k="building" v="yes"/> </way> <way id="165087684"> <nd ref="1766694998"/> <nd ref="1766695002"/> <nd ref="1766695006"/> <nd ref="1766695000"/> <nd ref="1766694998"/> <tag k="building" v="yes"/> </way> <way id="165087685"> <nd ref="1766694910"/> <nd ref="1766694902"/> <nd ref="1766694913"/> <nd ref="1766694915"/> <nd ref="1766694910"/> <tag k="building" v="yes"/> <tag k="power" v="substation"/> </way> <way id="165087686"> <nd ref="1766694979"/> <nd ref="1766694972"/> <nd ref="1766694976"/> <nd ref="1766694997"/> <nd ref="1766694979"/> <tag k="building" v="yes"/> </way> <way id="165194560"> <nd ref="1767558967"/> <nd ref="1767558971"/> <nd ref="1767558973"/> <nd ref="1767558969"/> <nd ref="1767558967"/> <tag k="building" v="yes"/> </way> <way id="165194561"> <nd ref="1767559020"/> <nd ref="1767559008"/> <nd ref="1767559016"/> <nd ref="1767559018"/> <nd ref="1767559024"/> <nd ref="1767559026"/> <nd ref="1767559020"/> <tag k="building" v="yes"/> </way> <way id="165271326"> <nd ref="1768267413"/> <nd ref="1768267414"/> <nd ref="1768267412"/> <nd ref="1768267411"/> <nd ref="1768267413"/> <tag k="building" v="yes"/> <tag k="shop" v="kiosk"/> </way> <way id="165271327"> <nd ref="1768267404"/> <nd ref="1768267403"/> <nd ref="1768267401"/> <nd ref="1768267399"/> <nd ref="1768267392"/> <nd ref="1768267393"/> <nd ref="1768267395"/> <nd ref="1768267396"/> <nd ref="1768267404"/> <tag k="building" v="yes"/> </way> <way id="165824682"> <nd ref="1773521664"/> <nd ref="1773521659"/> <nd ref="1773521663"/> <nd ref="1773521671"/> <nd ref="1773521664"/> <tag k="building" v="yes"/> <tag k="name" v="Овощи-фрукты"/> <tag k="shop" v="greengrocer"/> </way> <way id="165824693"> <nd ref="1773521643"/> <nd ref="1773521645"/> <nd ref="1773521649"/> <nd ref="1773521651"/> <nd ref="1773521657"/> <nd ref="1773521656"/> <nd ref="1773521676"/> <nd ref="1773521674"/> <nd ref="1773521667"/> <nd ref="1773521669"/> <nd ref="1773521662"/> <nd ref="1773521660"/> <nd ref="1773521650"/> <nd ref="1773521653"/> <nd ref="1773521643"/> <tag k="building" v="yes"/> <tag k="building:levels" v="3"/> </way> <way id="165824694"> <nd ref="1773521538"/> <nd ref="1773521534"/> <nd ref="1773521535"/> <nd ref="1773521540"/> <nd ref="1773521538"/> <tag k="building" v="yes"/> </way> <way id="165824696"> <nd ref="1773521696"/> <nd ref="1773521695"/> <nd ref="1773521698"/> <nd ref="1773521701"/> <nd ref="1773521696"/> <tag k="building" v="yes"/> </way> <way id="165824698"> <nd ref="1773521648"/> <nd ref="1773521654"/> <nd ref="1773521655"/> <nd ref="1773521652"/> <nd ref="1773521648"/> <tag k="building" v="yes"/> <tag k="building:levels" v="2"/> <tag k="power" v="substation"/> </way> <way id="165824700"> <nd ref="1773521542"/> <nd ref="1773521537"/> <nd ref="1773521541"/> <nd ref="1773521545"/> <nd ref="1773521542"/> <tag k="building" v="yes"/> </way> <way id="165824701"> <nd ref="1773521521"/> <nd ref="1773521522"/> <nd ref="1773521533"/> <nd ref="1773521529"/> <nd ref="1773521521"/> <tag k="building" v="yes"/> </way> <way id="165824702"> <nd ref="1773521527"/> <nd ref="1773521525"/> <nd ref="1773521528"/> <nd ref="1773521532"/> <nd ref="1773521527"/> <tag k="building" v="yes"/> </way> <way id="171375505"> <nd ref="1824089075"/> <nd ref="1824089074"/> <nd ref="1824089072"/> <nd ref="1824089073"/> <nd ref="1824089075"/> <tag k="building" v="yes"/> <tag k="shop" v="gift"/> </way> <way id="171375506"> <nd ref="1824089069"/> <nd ref="1824089070"/> <nd ref="1824089068"/> <nd ref="1824089067"/> <nd ref="1824089069"/> <tag k="building" v="yes"/> <tag k="shop" v="florist"/> </way> <way id="199822110"> <nd ref="2098196585"/> <nd ref="2948315587"/> <nd ref="2098196584"/> <nd ref="2098196599"/> <nd ref="2948315588"/> <nd ref="2098196603"/> <nd ref="2098196585"/> <tag k="building" v="yes"/> <tag k="layer" v="1"/> </way> <way id="222854117"> <nd ref="2317998769"/> <nd ref="2317998767"/> <nd ref="2317998768"/> <nd ref="2317998770"/> <nd ref="2317998772"/> <nd ref="2317998773"/> <nd ref="2317998774"/> <nd ref="2317998781"/> <nd ref="2795670108"/> <nd ref="2795670113"/> <nd ref="2795670109"/> <nd ref="2795670110"/> <nd ref="2795670112"/> <nd ref="2317998815"/> <nd ref="2317998824"/> <nd ref="2317998775"/> <nd ref="2317998771"/> <nd ref="2317998769"/> <tag k="addr:housenumber" v="1"/> <tag k="addr:street" v="площадь Гагарина"/> <tag k="building" v="yes"/> <tag k="name" v="Park Inn"/> <tag k="operator" v="Radisson"/> <tag k="tourism" v="hotel"/> <tag k="website" v="http://www.parkinn.ru/hotel-petrozavodsk"/> </way> </osm> ');
        
        var obsts = [];
        $(data).find('way').each(function (key, node) {
            var convexHull = new ConvexHullGrahamScan();
            var ob = [];
            $(node).find('nd').each(function (key, ref) {
                var point = $(data).find("node[id='" + $(ref).attr('ref')+ "']");
                
                ob.push({x: parseFloat($(point).attr('lat')), y: parseFloat($(point).attr('lon'))});
            });
            ob.splice(ob.length - 1, 1);
            for (var i = 0, len = ob.length; i < len; i++) convexHull.addPoint(ob[i].x, ob[i].y);
            var obst = {
                hull: convexHull.getHull(),
                points: ob
            };
            obsts.push(obst);
        });
        
        /*Logger.debug('obsts before: ');
        Logger.debug(obsts);
        // merge intersecting obstacles
        for (var i = 0, len = obsts.length; i < len - 1; i++) {
            var isMerged = false;
            for (var j = i + 1; j < len; j++) {
                //if (i === j || !obsts[i] || !obsts[j]) continue;
                if (this.isPolygonsIntersecting(obsts[i].hull, obsts[j].hull)) {
                    var newPoints = mergeHulls(obsts[i].points, obsts[j].points);
                    var newHull = new ConvexHullGrahamScan();
                    for (var k = 0; k < newPoints.length; k++) {
                        newHull.addPoint(newPoints[k].x, newPoints[k].y);
                    }
                    obsts[j] = {
                        hull: newHull.getHull(),
                        points: newPoints
                    };
                }
            }
            if (isMerged)
                obsts.splice(i, 1);
        }
        Logger.debug('obsts after: ');*/
                   
        if (callback) {
            callback(obsts);
        }
    //});   
};

Routes.prototype.getBoundBoxForPoints = function (points) {
    if (points.length < 1) return;
    
    var north = 0.0, east = 0.0, south = 0.0, west = 0.0;
    var localCoords = points[0].coordinates.split(',');
    north = south = parseFloat(localCoords[1]);
    east = west = parseFloat(localCoords[0]);
     
    for (var i = 1; i < points.length; i++) {
        localCoords = points[i].coordinates.split(',');
        if (parseFloat(localCoords[1]) > north) {
            north = parseFloat(localCoords[1]);
        }
        if (parseFloat(localCoords[1]) < south) {
            south = parseFloat(localCoords[1]);
        }
        if (parseFloat(localCoords[0]) > east) {
            east = parseFloat(localCoords[0]);
        }
        if (parseFloat(localCoords[0]) < west) {
            west = parseFloat(localCoords[0]);
        }      
    }
    
    return {
        northeast: {
            lat: north,
            lng: east
        },
        southwest: {
            lat: south,
            lng: west
        }
    };
};

Routes.prototype.addCurvePoints = function (track, type) {
    Logger.debug('type: ' + type);
    
    var curvePoints = null;
    switch (type) {
        case MapClass.ROUTE_TYPE_CURVE_RAW:
            curvePoints = [];
            for (var i = 0, len = track.points.length; i < len; i++) {
                var point = track.points[i].coordinates.split(',').map(parseFloat);
                curvePoints.push({coords: new L.LatLng(point[1], point[0])});
            }
            break;
        case MapClass.ROUTE_TYPE_CURVE_SERVICE:
            Logger.debug(track.serviceRoutes[0]);
            if (!track.serviceRoutes[0]) {
                Logger.error('No service route had been found');
                return;
            }
            var points = L.PolylineUtil.decode(track.serviceRoutes[0]);
            curvePoints = [];
            for (var i = 0, len = points.length; i < len; i++) {
                curvePoints.push({coords: new L.LatLng(points[i][0], points[i][1])});
            }
            break;
        default: 
            Logger.error('Unknown type');
    }
    return curvePoints;
};

Routes.prototype.addCShape = function (track) { 
    //sign( (Bx-Ax)*(Y-Ay) - (By-Ay)*(X-Ax) )
    var calculateSign = function (A, B, C) {
        return (B.lat - A.lat) * (C.lng - A.lng) - (B.lng - A.lng) * (C.lat - A.lat);
    };
    
    var cShapePolyline = [];
    
    cShapePolyline.push({point: track.curvePoints[0], isInflection: false});
    
    for (var i = 1, len = track.curvePoints.length; i < len - 2; i++) {
        var b_0 = track.curvePoints[i - 1], 
            b_1 = track.curvePoints[i], 
            b_2 = track.curvePoints[i + 1], 
            b_3 = track.curvePoints[i + 2];
        
        cShapePolyline.push({point: b_1, isInflection: false});
               
        Logger.debug('i = ' + i + ' sign1 = ' + calculateSign(b_1, b_0, b_2) + ' sign2 = ' + calculateSign(b_2, b_1, b_3));
        if ((calculateSign(b_1, b_0, b_2) * calculateSign(b_2, b_1, b_3)) <= 0) {
            cShapePolyline.push({point: new L.LatLng((b_1.lat + b_2.lat) / 2, (b_1.lng + b_2.lng) / 2), isInflection: true});
        }       
    }
    
    cShapePolyline.push({point: track.curvePoints[track.curvePoints.length - 2], isInflection: false});
    cShapePolyline.push({point: track.curvePoints[track.curvePoints.length - 1], isInflection: false});
    
    Logger.debug(cShapePolyline);
    
    track.cShapePolyline = cShapePolyline;
    
    var cShapeSections = [];
    var section = [];
    for (var i = 0, len = cShapePolyline.length; i < len; i++) {
        section.push(cShapePolyline[i].point);
        if (cShapePolyline[i].isInflection || (section.length >= 4)) {
            if (cShapePolyline[i].isInflection && (section.length < 4)) {
                section.push(cShapePolyline[i].point);
            }
            cShapeSections.push(section);
            section = [];
            section.push(cShapePolyline[i].point);           
        }
        if (i >= len - 1) {
            if (section.length < 4) {
                section.push(cShapePolyline[i].point);
                cShapeSections.push(section);
            }
        }
    }  
    //cShapeSections.push(section);
    
    Logger.debug(cShapeSections);
    
    track.cShapeSections = cShapeSections;
};

Routes.prototype.simpleCurve = function (track, type, map) { 
    if (track.points.length < 2) {
        throw new GetsWebClientException('Routes Error', 'obstacleAvoidingCurve, total number of points in the route must be 2 or more');
    }
    
    var curvePoints = this.addCurvePoints(track, type);
    
    track.oACurve = this.smoothcurvejs(curvePoints, map);//this.bezierCurveszzz(curvePoints);    
};

Routes.prototype.ESP_gridbased = function (track, callback, map) {
    var that = this;
    this.generateGrid(track, 2);
    this.requestOSMObstacles(track, function (obsts) {
        that.markInvalidPointsOnGrid(track, obsts);
        that.AStarGrid(track);
        track.esp.curve_ = that.bezierCurves(that.partitionToCShape(track.esp.path, map));
        
        var trackPoints = track.points.map(function (elem) {
            var crs = elem.coordinates.split(',').map(parseFloat);
            return new L.LatLng(crs[1], crs[0]);
        });
        
        var trackPoints2 = track.points.map(function (elem) {
            var crs = elem.coordinates.split(',').map(parseFloat);
            return {coords: new L.LatLng(crs[1], crs[0])};
        });
        
        /*that.makeGoogleDirectionsRoute(track, [{name: 'mode', value: 'walking'}], function () {
            Logger.error('O.Path PNum: ' + trackPoints.length + 
                ' L: ' + that.calcDistLatLngs(trackPoints) + 
                ' A: ' + that.calcAnglesSumLatLngs(trackPoints, map) + 
                ' DF: 0');
        });*/        
        Logger.error('O.Path \u005Catpbox{PN = ' + trackPoints.length + 
                ' \u005C\u005C D = ' + that.calcDistLatLngs(trackPoints) + 
                ' \u005C\u005C A = ' + that.calcAnglesSumLatLngs(trackPoints, map) + 
                ' \u005C\u005C DF = 0' + '}');
        
        var bezier0 = that.bezierCurveszzz(trackPoints2, map);
        
        map.drawLatLngPolyline(bezier0, 'O.Path Bez: ', '#0000FF');
                      
        Logger.error('O.Path Bez \u005Catpbox{PN = ' + bezier0.length + 
                ' \u005C\u005C D = ' + that.calcDistLatLngs(bezier0) + 
                ' \u005C\u005C A = ' + that.calcAnglesSumLatLngs(bezier0, map) + 
                ' \u005C\u005C DF = ' + that.calcFDistance3(track, bezier0, map) + '}');
        
        var hermite0 = that.smoothcurvejs(trackPoints2, map);
        
        map.drawLatLngPolyline(hermite0, 'O.Path Hermite: ', '#0000FF');
                      
        Logger.error('O.Path Hermite \u005Catpbox{PN = ' + hermite0.length + 
                ' \u005C\u005C D = ' + that.calcDistLatLngs(hermite0) + 
                ' \u005C\u005C A = ' + that.calcAnglesSumLatLngs(hermite0, map) + 
                ' \u005C\u005C DF = ' + that.calcFDistance3(track, hermite0, map) + '}');
        
        
        ///////////////////////////////////////////////////////////////////
        
      
        Logger.error('Grid O.Path \u005Catpbox{PN = ' + track.esp.path.length + 
                ' \u005C\u005C D = ' + that.calcDistLineSegs(track.esp.path) + 
                ' \u005C\u005C A = ' + that.calcAnglesSumLineSegs(track.esp.path, map) + 
                ' \u005C\u005C DF = ' + that.calcFDistance3(track, track.esp.path.map(function (elem) {
                        return elem.coords;
                }), map) + '}');
        
        //map.drawEncodedPolyline(L.PolylineUtil.encode(that.bezierCurvesz(track.esp.path)), 'Grid Shortest path - Curve---', '#0000BB');
        //map.drawEncodedPolyline(L.PolylineUtil.encode(that.bezierCurveszzz(that.removeClosePoints(track.esp.path), map)), 'Grid Shortest path - Curve---', '#0000BB');
        
        var bezier = that.bezierCurveszzz(track.esp.path, map);
                      
        Logger.error('Grid Bez.Path \u005Catpbox{PN = ' + bezier.length + 
                ' \u005C\u005C D = ' + that.calcDistLatLngs(bezier) + 
                ' \u005C\u005C A = ' + that.calcAnglesSumLatLngs(bezier, map) + 
                ' \u005C\u005C DF = ' + that.calcFDistance3(track, bezier, map) + '}');
        
        map.drawLatLngPolyline(bezier, 'Grid Bez.Path - Curve (Bezier)| P-s Num: ' + bezier.length + 
                '; D: ' + that.calcDistLatLngs(bezier) + 
                'm; A: ' + that.calcAnglesSumLatLngs(bezier, map) + 
                '°; DF: ' + that.calcFDistance(track, bezier, map), '#2A064E');
               
        //that.calcAnglesSumTrack(track);
        //that.smoothcurvejs(track.esp_tri.path, map);
        var hermite = that.smoothcurvejs(track.esp.path, map);
        
        map.drawLatLngPolyline(hermite, 'Grid Bez.Path - Curve Lib (Hermite 0.4)| P-s Num: ' + hermite.length + 
                '; D: ' + that.calcDistLatLngs(hermite) + 
                'm; A: ' + that.calcAnglesSumLatLngs(hermite, map) + 
                '°; DF: ' + that.calcFDistance(track, hermite, map), '#862E62');
                      
        Logger.error('Grid Hermite.Path \u005Catpbox{PN = ' + hermite.length + 
                ' \u005C\u005C D = ' + that.calcDistLatLngs(hermite) + 
                ' \u005C\u005C A = ' + that.calcAnglesSumLatLngs(hermite, map) + 
                ' \u005C\u005C DF = ' + that.calcFDistance3(track, hermite, map) + '}');
        
        
      
        //that.pointToPointCurve(track, obsts);
        //track.esp.pp = that.partitionToCShape(track.esp.path, track);
        //track.esp.curve_s = that.bezierCurvesSections(track.esp.sections);
        callback(obsts);       
    });
};

Routes.prototype.generateGrid = function (track, width) {   
    var waypoints = [];
    for (var k = 0, len = track.points.length; k < len; k++) {
        var point = track.points[k].coordinates.split(',').map(parseFloat);
        waypoints.push(new L.LatLng(point[1], point[0]));
    }
    
    var bbox = track.bounds;
    
    var R = 6378137, //Earth radius in meters
        margin = 50;
    
    var north = bbox.northeast.lat,
        east = bbox.northeast.lng,
        south = bbox.southwest.lat,
        west = bbox.southwest.lng;

    north += (180 / Math.PI) * (margin / R);  
    east += (180 / Math.PI) * (margin / (R * Math.cos(Math.PI * north / 180.0)));
    south -= (180 / Math.PI) * (margin / R);  
    west -= (180 / Math.PI) * (margin / (R * Math.cos(Math.PI * south / 180.0)));
    
    var topleft = new L.LatLng(north, west),
        topright = new L.LatLng(north, east),
        bottomright = new L.LatLng(south, east),
        bottomleft = new L.LatLng(south, west);
    
    var distanceHorizontal = topleft.distanceTo(topright);
    var distanceVertical = topleft.distanceTo(bottomleft);
    
    var grid = [];
    Logger.debug('grid 1(distVert, num): ' + distanceVertical + ', ' + parseInt(distanceVertical / width, 10));
    Logger.debug('grid 2(distHor, num): ' + distanceHorizontal + ', ' + parseInt(distanceHorizontal / width, 10));
    
    var used = [];
    for (var i = 0; i < (distanceVertical + width); i += width) {
        grid.push([]);
        var newLat = south + (180 / Math.PI) * (i / R);
        for (var j = 0; j < (distanceHorizontal + width); j += width) {
            var newLng = west + (180 / Math.PI) * (j / (R * Math.cos(Math.PI * north / 180.0)));
            var coords = new L.LatLng(newLat, newLng);
            var cell = {
                coords: coords,
                valid: true,
                waypoint: false
            };           
            for (var k = 0, len = waypoints.length; k < len; k++) {
                var isUsed = false;
                for (var p = 0; p < used.length; p++) {
                    if (used[p] === k) {
                        isUsed = true;
                        break;
                    } 
                }
                if (isUsed) continue;    
                if (coords.distanceTo(waypoints[k]) < width) {
                    cell.waypoint = true;
                    cell.order = k;
                    used.push(k);
                    //waypoints.splice(k, 1);
                    /*var waypointCell = {
                        coords: waypoints[k],
                        valid: true,
                        waypoint: true
                    };*/
                    //grid[grid.length - 1].push(waypointCell);
                    break;
                }
            }
            grid[grid.length - 1].push(cell);
        }
    }
    
    Logger.debug(grid);
    
    track.esp = {
        grid: grid
    };
};

Routes.prototype.markInvalidPointsOnGrid = function (track, obstacles) { 
    if (!obstacles || obstacles.length < 1) return;
    
    var grid = track.esp.grid;
      
    for (var i = 0, len = grid.length; i < len; i++) {
        for (var j = 0, len2 = grid[i].length; j < len2; j++) {
            for (var k = 0, len3 = obstacles.length; k < len3; k++) {
                if (grid[i][j].waypoint) break;
                //if (this.checkHit(obstacles[k].bbox, grid[i][j].coords)) {
                if (this.pointInsidePolygon(grid[i][j].coords, obstacles[k].hull)) {
                    grid[i][j].valid = false;
                }
            }
        }
    }
};

Routes.prototype.AStarGrid = function (track) {
    var waypoints = [];
    for (var k = 0, len = track.points.length; k < len; k++) {
        var point = track.points[k].coordinates.split(',').map(parseFloat);
        waypoints.push(new L.LatLng(point[1], point[0]));
    }
    
    var grid = track.esp.grid;
           
    var graph = {
        weights: [],
        result: [],
        waypoints: []
    };
    
    for (var j = 0; j < grid.length; j++) {
        graph.weights.push([]);
        for (var l = 0; l < grid[j].length; l++) {
            if (grid[j][l] && grid[j][l].valid) {
                graph.weights[graph.weights.length - 1].push(1);
                if (grid[j][l].waypoint) {
                    graph.waypoints.push({x: j, y: l, order: grid[j][l].order});
                }
            } else {
                graph.weights[graph.weights.length - 1].push(0);
            }
        }
    }
    Logger.debug(graph);
    
    var findWithProp = function (array, prop, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][prop] === value) {
                return i;
            }
        }
    };
    
    var A_StarGraph = new Graph(graph.weights, { diagonal: true });
    Logger.debug(A_StarGraph);
    for (var i = 0, len = graph.waypoints.length; i < len - 1; i++) {
        //Logger.debug('indexOf ' + i + ' and ' + (i + 1) + ': ' + findWithProp(graph.waypoints, 'order', i) + ', ' + findWithProp(graph.waypoints, 'order', i + 1));
        var startIndex = findWithProp(graph.waypoints, 'order', i),
            endIndex = findWithProp(graph.waypoints, 'order', i + 1);
    
        var startPoint = A_StarGraph.grid[graph.waypoints[startIndex].x][graph.waypoints[startIndex].y],
            endPoint = A_StarGraph.grid[graph.waypoints[endIndex].x][graph.waypoints[endIndex].y];
    
        //var result = astar.search(A_StarGraph, startPoint, endPoint,{ heuristic: astar.heuristics.diagonal }); 
        var result = theta_star.search(A_StarGraph, startPoint, endPoint); 
        if (result.length > 1) {
            for (var j = (i === 0) ? 0 : 1, res_len = result.length; j < res_len; j++) {
                graph.result.push(grid[result[j].x][result[j].y]);
            }
        }
    }
    //graph.result.splice(6, 1);
    //graph.result.splice(11, 1);
    track.esp.path = graph.result;
    track.esp.path_dist = this.calcDistLineSegs(track.esp.path);
    Logger.debug(track.esp.path);
};

Routes.prototype.pointToPointCurve = function (track, obstacles) {
    var path = track.esp.path,
        tempPoints = [],
        curve = [];

    var waypointsCounter = 0;
    tempPoints.push(path[0]);
    for (var i = 1, len = path.length; i < len; i++) {
        //if (waypointsCounter > 0) {
        tempPoints.push(path[i]);
        //}
        if (path[i].waypoint) {

            //if (waypointsCounter > 0) {
            var CShapePoints = this.partitionToCShape(tempPoints);
            //Logger.debug(CShapePoints);
            var bezierPoints = this.bezierCurves(CShapePoints, obstacles);
            //Logger.debug(bezierPoints);
            curve = curve.concat(bezierPoints);
            //break;
            //}
            //Logger.debug(tempPoints);
            tempPoints = [];
            tempPoints.push(path[i]);
            //waypointsCounter++;
        }
    }   
    track.esp.curve = L.PolylineUtil.encode(curve);
    Logger.debug(track.esp.curve);
};

Routes.prototype.partitionToCShape = function (points, map) {
    // only 4 or more points can create S-shaped curve, which is the type of curve we want to get rid
    if (points.length < 4) {
        for (var i = 0; i < points.length; i++) {
            points[i].isInflection = false;
        }
        return points;
    }
    
    //sign( (Bx-Ax)*(Y-Ay) - (By-Ay)*(X-Ax) )//.coords
    var calculateSign = function (A, B, C) {
        return (B.coords.lat - A.coords.lat) * (C.coords.lng - A.coords.lng) - (B.coords.lng - A.coords.lng) * (C.coords.lat - A.coords.lat);
    };
    var pointsSubs = function (p0, p1) {
        return new L.LatLng(p0.coords.lat - p1.coords.lat, p0.coords.lng - p1.coords.lng);
    };
    var dot = function (p0, p1) {
        return p0.lat * p1.lat + p0.lng * p1.lng;
    };
    var cross = function (p0, p1) {
        return p0.lat * p1.lng - p0.lng * p1.lat;
    };
    var calculateSign2 = function (p0, p1, p2) {
        return dot(pointsSubs(p0, p1), pointsSubs(p2, p1));
    };
        
   
    var cShapePolyline = [];
    
    points[0].isInflection = false;
    cShapePolyline.push(points[0]);
    
    for (var i = 1, len = points.length; i < len - 2; i++) {
        var b_0 = points[i - 1], 
            b_1 = points[i], 
            b_2 = points[i + 1], 
            b_3 = points[i + 2];
              
        b_1.isInflection = false;
        cShapePolyline.push(b_1);
               
        //Logger.debug('i = ' + i + ' sign1 = ' + calculateSign(b_1, b_0, b_2) + ' sign2 = ' + calculateSign(b_2, b_1, b_3));
        //Logger.debug('i = ' + i + ' sign1_ = ' + calculateSign2(b_0, b_1, b_3) + ' sign2_ = ' + calculateSign2(b_0, b_2, b_3));
        //if ((calculateSign(b_1, b_0, b_2) * calculateSign(b_2, b_1, b_3)) <= 0) {
        if (!(calculateSign2(b_0, b_1, b_3) < 0) && !(calculateSign2(b_0, b_2, b_3) < 0)) {
            cShapePolyline.push({
                coords: new L.LatLng((b_1.coords.lat + b_2.coords.lat) / 2, (b_1.coords.lng + b_2.coords.lng) / 2), 
                valid: true, 
                waypoint: false,
                isInflection: true
            });
        }       
    }
    
    points[points.length - 1].isInflection = false;
    cShapePolyline.push(points[points.length - 1]);
    
    /*for (var i = 0; i < cShapePolyline.length; i++) {
        map.addMarker(cShapePolyline[i].coords, 'i = ' + i + '<br>isInflection: ' + cShapePolyline[i].isInflection);
    }*/
              
    return cShapePolyline;
};

Routes.prototype.bezierCurves = function (points, obstacles, map) { 
    // only 4 or more points can create S-shaped curve, which is the type of curve we want to get rid
    
    var df = 0;
    if (points.length < 4) {
        var coordsArray = [];
        for (var i = 0; i < points.length; i++) {
            coordsArray.push(points[i].coords);
        }
        return {
            curve: coordsArray,
            df: df
        };
    }
    
    var U_DEFAULT = 0.7;
    
    var u = U_DEFAULT;
    var u_ = 0;
    var accuracy = 0.1;
          
    var curve = [];
    
    // Calculate N*p
    var pointsMult = function (p, N) {
        return new L.LatLng(N * p.lat, N * p.lng);
    };
    
    // Calculate p1 + p0
    var pointsAdd = function (p0, p1) {
        return new L.LatLng(p1.lat + p0.lat, p1.lng + p0.lng);
    };
    
    // Calculate p0 - p1
    var pointsSubs = function (p0, p1) {
        return new L.LatLng(p0.lat - p1.lat, p0.lng - p1.lng);
    };
    
    var bezier = function (t, p0, p1, p2, p3) {        
        var lat = Math.pow(1 - t, 3) * p0.lat + 3 * Math.pow(1 - t, 2) * t * p1.lat + 3 * (1 - t) * Math.pow(t, 2) * p2.lat + Math.pow(t, 3) * p3.lat;
        var lng = Math.pow(1 - t, 3) * p0.lng + 3 * Math.pow(1 - t, 2) * t * p1.lng + 3 * (1 - t) * Math.pow(t, 2) * p2.lng + Math.pow(t, 3) * p3.lng;
        
        return new L.LatLng(lat, lng);
    };
    
    var that = this;
    var checkCollision = function (p0, p1, p2, p3) {
        //Logger.debug('in checkCollision');
        var controlPointsHull = new ConvexHullGrahamScan();
        controlPointsHull.addPoint(p0.lat, p0.lng);
        controlPointsHull.addPoint(p1.lat, p1.lng);
        controlPointsHull.addPoint(p2.lat, p2.lng);
        controlPointsHull.addPoint(p3.lat, p3.lng);

        controlPointsHull = controlPointsHull.getHull();
        //Logger.debug(controlPointsHull);
        for (var k = 0, len = obstacles.length; k < len; k++) {
            if (that.isPolygonsIntersecting(controlPointsHull, obstacles[k].hull)) {
                //Logger.debug(controlPointsHull);
                //Logger.debug(obstacles[k]);
                //map.drawPolygon(controlPointsHull);
                //map.drawPolygon(obstacles[k]);
                return true;
            }
        }
        return false;
    };
       
    var b0 = points[0].coords,
        b1 = pointsAdd(points[0].coords, pointsMult(pointsSubs(points[1].coords, points[0].coords), u / 2)),
        b2 = pointsAdd(points[0].coords, pointsSubs(pointsSubs(points[1].coords, points[0].coords), pointsMult(pointsSubs(points[1].coords, points[0].coords), u / 2))),
        b3 = pointsAdd(points[0].coords, pointsAdd(pointsSubs(points[1].coords, points[0].coords), pointsMult(pointsSubs(pointsSubs(points[2].coords, points[1].coords), pointsSubs(points[1].coords, points[0].coords)), u / 4)));
    /*while (checkCollision(b0, b1, b2, b3)) {
        Logger.debug('u = ' + u);
        if (u < 0.1) break;
        u -= 0.09;        
        b0 = points[0].coords,
        b1 = pointsAdd(points[0].coords, pointsMult(pointsSubs(points[1].coords, points[0].coords), u / 2)),
        b2 = pointsAdd(points[0].coords, pointsSubs(pointsSubs(points[1].coords, points[0].coords), pointsMult(pointsSubs(points[1].coords, points[0].coords), u / 2))),
        b3 = pointsAdd(points[0].coords, pointsAdd(pointsSubs(points[1].coords, points[0].coords), pointsMult(pointsSubs(pointsSubs(points[2].coords, points[1].coords), pointsSubs(points[1].coords, points[0].coords)), u / 4)));
    }   
    if (map) {
        map.addMarker(points[0].coords, 'i = ' + 0);
        //map.addMarker(b0, 'b0');
        //map.addMarker(b1, 'b1');
        //map.addMarker(b2, 'b2');
        //map.addMarker(b3, 'b3');
    };*/
    for (var j = 0.0; j <= 1; j += accuracy) {
        curve.push(bezier(j, b0, b1, b2, b3));
    }
    //map.drawEncodedPolyline(L.PolylineUtil.encode(curve), 'a')
    
    u = U_DEFAULT;
    var dfArray = [];
    for (var i = 1, len = points.length; i < len - 2; i++) {
        if (points[i].isInflection) u = U_DEFAULT;       
        b0 = pointsAdd(points[i].coords, pointsMult(pointsSubs(pointsSubs(points[i + 1].coords, points[i].coords), pointsSubs(points[i].coords, points[i - 1].coords)), u / 4));
        b1 = pointsAdd(points[i].coords, pointsMult(pointsSubs(points[i + 1].coords, points[i].coords), u / 2));
        b2 = pointsAdd(points[i].coords, pointsSubs(pointsSubs(points[i + 1].coords, points[i].coords), pointsMult(pointsSubs(points[i + 1].coords, points[i].coords), u / 2)));
        b3 = pointsAdd(points[i].coords, pointsAdd(pointsSubs(points[i + 1].coords, points[i].coords), pointsMult(pointsSubs(pointsSubs(points[i + 2].coords, points[i + 1].coords), pointsSubs(points[i + 1].coords, points[i].coords)), u / 4)));
        //
        dfArray.push(b1.distanceTo(points[i].coords));
        //Logger.debug('b i = ' + i + ', u = ' + u);
        /*while (checkCollision(b0, b1, b2, b3)) {            
            if (u < 0.2) break;
            u -= 0.09;
            b0 = pointsAdd(points[i].coords, pointsMult(pointsSubs(pointsSubs(points[i + 1].coords, points[i].coords), pointsSubs(points[i].coords, points[i - 1].coords)), u / 4));
            b1 = pointsAdd(points[i].coords, pointsMult(pointsSubs(points[i + 1].coords, points[i].coords), u / 2));
            b2 = pointsAdd(points[i].coords, pointsSubs(pointsSubs(points[i + 1].coords, points[i].coords), pointsMult(pointsSubs(points[i + 1].coords, points[i].coords), u / 2)));
            b3 = pointsAdd(points[i].coords, pointsAdd(pointsSubs(points[i + 1].coords, points[i].coords), pointsMult(pointsSubs(pointsSubs(points[i + 2].coords, points[i + 1].coords), pointsSubs(points[i + 1].coords, points[i].coords)), u / 4)));
        }
        Logger.debug('a i = ' + i + ', u = ' + u);
        if (map) {           
            map.addMarker(points[i].coords, 'i = ' + i);
            //map.addMarker(b0, 'b0');
            //map.addMarker(b1, 'b1');
            //map.addMarker(b2, 'b2');
            //map.addMarker(b3, 'b3');
        }*/
        for (var j = 0.0; j <= 1; j += accuracy) {
            curve.push(bezier(j, b0, b1, b2, b3));
        }
        //map.drawEncodedPolyline(L.PolylineUtil.encode(curve), 'a');
    }
    df = Math.max.apply(Math, dfArray);
    
    u = U_DEFAULT;
    var len = points.length;
    b0 = pointsAdd(points[len - 2].coords, pointsMult(pointsSubs(pointsSubs(points[len - 1].coords, points[len - 2].coords), pointsSubs(points[len - 2].coords, points[len - 3].coords)), u / 4));
    b1 = pointsAdd(points[len - 2].coords, pointsMult(pointsSubs(points[len - 1].coords, points[len - 2].coords), u / 2));
    b2 = pointsAdd(points[len - 2].coords, pointsSubs(pointsSubs(points[len - 1].coords, points[len - 2].coords), pointsMult(pointsSubs(points[len - 1].coords, points[len - 2].coords), u / 2)));
    b3 = points[len - 1].coords;
    /*while (checkCollision(b0, b1, b2, b3)) {
        //Logger.debug('u = ' + u);
        if (u < 0.1) break;
        u -= 0.09;
        b0 = pointsAdd(points[len - 2].coords, pointsMult(pointsSubs(pointsSubs(points[len - 1].coords, points[len - 2].coords), pointsSubs(points[len - 2].coords, points[len - 3].coords)), u / 4));
        b1 = pointsAdd(points[len - 2].coords, pointsMult(pointsSubs(points[len - 1].coords, points[len - 2].coords), u / 2));
        b2 = pointsAdd(points[len - 2].coords, pointsSubs(pointsSubs(points[len - 1].coords, points[len - 2].coords), pointsMult(pointsSubs(points[len - 1].coords, points[len - 2].coords), u / 2)));
        b3 = points[len - 1].coords;
    }
    if (map) {
        //map.addMarker(b0, 'b0');
        //map.addMarker(b1, 'b1');
        //map.addMarker(b2, 'b2');
        //map.addMarker(b3, 'b3');
    }*/    
    for (var j = 0; j <= 1; j += accuracy) {
        curve.push(bezier(j, b0, b1, b2, b3));
    }
    
    /*if (map) {
        for (var i = 0, len = points.length; i < len; i++) {
            map.addMarker(points[i].coords, 'i = ' + i);
        }
    }*/
       
    return {
        curve: curve,
        df: df
    };
};

// https://www.particleincell.com/2012/bezier-splines/
Routes.prototype.bezierCurvesz = function (points) { 
    // only 4 or more points can create S-shaped curve, which is the type of curve we want to get rid
    if (points.length < 4) {
        var coordsArray = [];
        for (var i = 0; i < points.length; i++) {
            coordsArray.push(points[i].coords);
        }
        return coordsArray;
    }
    
    var accuracy = 0.1;
    var curve = [];
    
    /*computes control points given knots K, this is the brain of the operation*/
    var computeControlPoints = function computeControlPoints(K) {
        var p1 = [],
            p2 = [],
            n = K.length - 1,

            /*rhs vector*/
            a = [],
            b = [],
            c = [],
            r = [];

        /*left most segment*/
        a[0] = 0;
        b[0] = 2;
        c[0] = 1;
        r[0] = K[0] + 2 * K[1];

        /*internal segments*/
        for (var i = 1; i < n - 1; i++) {
            a[i] = 1;
            b[i] = 4;
            c[i] = 1;
            r[i] = 4 * K[i] + 2 * K[i + 1];
        }

        /*right segment*/
        a[n - 1] = 2;
        b[n - 1] = 7;
        c[n - 1] = 0;
        r[n - 1] = 8 * K[n - 1] + K[n];

        /*solves Ax=b with the Thomas algorithm (from Wikipedia)*/
        for (var i = 1; i < n; i++) {
            var m = a[i] / b[i - 1];
            b[i] = b[i] - m * c[i - 1];
            r[i] = r[i] - m * r[i - 1];
        }

        p1[n - 1] = r[n - 1] / b[n - 1];
        for (var i = n - 2; i >= 0; --i)
            p1[i] = (r[i] - c[i] * p1[i + 1]) / b[i];

        /*we have p1, now compute p2*/
        for (var i = 0; i < n - 1; i++)
            p2[i] = 2 * K[i + 1] - p1[i + 1];

        p2[n - 1] = 0.5 * (K[n] + p1[n - 1]);

        return {p1: p1, p2: p2};
    };
    
    var bezier = function (t, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {        
        var lat = Math.pow(1 - t, 3) * p0x + 3 * Math.pow(1 - t, 2) * t * p1x + 3 * (1 - t) * Math.pow(t, 2) * p2x + Math.pow(t, 3) * p3x;
        var lng = Math.pow(1 - t, 3) * p0y + 3 * Math.pow(1 - t, 2) * t * p1y + 3 * (1 - t) * Math.pow(t, 2) * p2y + Math.pow(t, 3) * p3y;
        
        return new L.LatLng(lat, lng);
    };
    
    var lat = [],
        lng = [];

    for (var i = 0, len = points.length; i < len; i++) {
        lat.push(points[i].coords.lat);
        lng.push(points[i].coords.lng);
    } 
    Logger.debug(lat);
    Logger.debug(lng);
    
    /*computes control points p1 and p2 for x and y direction*/
    var	px = computeControlPoints(lat),
	py = computeControlPoints(lng);

    for (var i = 0, len = points.length; i < len - 1; i++) {
        for (var j = 0; j <= 1; j += accuracy) {
            curve.push(bezier(j, lat[i], lng[i], px.p1[i], py.p1[i], px.p2[i], py.p2[i], lat[i+1], lng[i+1]));
        }
    } 
    
    return curve;   
};

// http://www.codeproject.com/Articles/31859/Draw-a-Smooth-Curve-through-a-Set-of-D-Points-wit
Routes.prototype.bezierCurveszzz = function (points, map) {
    //Logger.debug(points);
    // only 4 or more points can create S-shaped curve, which is the type of curve we want to get rid
    if (points.length < 4) {
        var coordsArray = [];
        for (var i = 0; i < points.length; i++) {
            coordsArray.push(points[i].coords);
        }
        return coordsArray;
    }
    
    var accuracy = 0.1;
    var curve = [];
    
    var getFirstControlPoints = function (rhs) {
        var n = rhs.length,
                x = new Array(n), // Solution vector.
                tmp = new Array(n), // Temp workspace.
                b = 2.0;

        x[0] = rhs[0] / b;
        for (var k = 1; k < n; k++) { // Decomposition and forward substitution
            tmp[k] = 1 / b;
            b = (k < n - 1 ? 4.0 : 3.5) - tmp[k];
            x[k] = (rhs[k] - x[k - 1]) / b;
        }
        for (var k = 1; k < n; k++)
            x[n - k - 1] -= tmp[n - k] * x[n - k]; // Backsubstitution.

        return x;
    };

    var getCurveControlPoints = function (knots) {
        var firstControlPoints,
            secondControlPoints;

        var n = knots.length - 1;
        if (n === 1) {
            // Special case: Bezier curve should be a straight line.
            // 3P1 = 2P0 + P3
            firstControlPoints.push(new L.LatLng((2 * knots[0].coords.lat + knots[1].coords.lat) / 3,
                    (2 * knots[0].coords.lng + knots[1].coords.lng) / 3));


            secondControlPoints.push(new L.LatLng(2 * firstControlPoints[0].lat - knots[0].coords.lat,
                    2 * firstControlPoints[0].lng - knots[0].coords.lng));
            return {
                firstControlPoints: firstControlPoints,
                secondControlPoints: secondControlPoints
            };
        }

        // Calculate first Bezier control points
        // Right hand side vector
        var rhs = new Array(n);

        // Set right hand side X values
        for (var p = 1; p < n - 1; ++p)
            rhs[p] = 4 * knots[p].coords.lat + 2 * knots[p + 1].coords.lat;
        rhs[0] = knots[0].coords.lat + 2 * knots[1].coords.lat;
        rhs[n - 1] = (8 * knots[n - 1].coords.lat + knots[n].coords.lat) / 2.0;
        // Get first control points X-values
        var x = getFirstControlPoints(rhs);

        // Set right hand side Y values
        for (var p = 1; p < n - 1; ++p)
            rhs[p] = 4 * knots[p].coords.lng + 2 * knots[p + 1].coords.lng;
        rhs[0] = knots[0].coords.lng + 2 * knots[1].coords.lng;
        rhs[n - 1] = (8 * knots[n - 1].coords.lng + knots[n].coords.lng) / 2.0;
        // Get first control points Y-values
        var y = getFirstControlPoints(rhs);

        // Fill output arrays.
        firstControlPoints = new Array(n);
        secondControlPoints = new Array(n);
        for (var p = 0; p < n; ++p) {
            // First control point
            firstControlPoints[p] = new L.LatLng(x[p], y[p]);
            // Second control point
            if (p < n - 1)
                secondControlPoints[p] = new L.LatLng(2 * knots[p + 1].coords.lat - x[p + 1], 2 * knots[p + 1].coords.lng - y[p + 1]);
            else
                secondControlPoints[p] = new L.LatLng((knots[n].coords.lat + x[n - 1]) / 2, (knots[n].coords.lng + y[n - 1]) / 2);
        }
        
        return {
            firstControlPoints: firstControlPoints,
            secondControlPoints: secondControlPoints
        };
    };
    
    var bezier = function (t, p0, p1, p2, p3) {        
        var lat = Math.pow(1 - t, 3) * p0.lat + 3 * Math.pow(1 - t, 2) * t * p1.lat + 3 * (1 - t) * Math.pow(t, 2) * p2.lat + Math.pow(t, 3) * p3.lat;
        var lng = Math.pow(1 - t, 3) * p0.lng + 3 * Math.pow(1 - t, 2) * t * p1.lng + 3 * (1 - t) * Math.pow(t, 2) * p2.lng + Math.pow(t, 3) * p3.lng;
        
        return new L.LatLng(lat, lng);
    };
    
    /*computes control points p1 and p2 for x and y direction*/
    var	pxy = getCurveControlPoints(points);
    Logger.debug(pxy);
    
    for (var i = 0, len = points.length; i < len - 1; i++) {
        //if (i >= 1 && i < 2) {
            //map.addMarker(points[i].coords, 'points[i].coords: ' + i);
            //map.addMarker(pxy.firstControlPoints[i], 'pxy.firstControlPoints[i]: ' + i);
            //map.addMarker(pxy.secondControlPoints[i], 'pxy.secondControlPoints[i]: ' + i);
            //map.addMarker(points[i + 1].coords, 'points[i + 1].coords: ' + (i + 1));

            for (var j = 0; j <= 1; j += accuracy) {
                curve.push(bezier(j, points[i].coords, pxy.firstControlPoints[i], pxy.secondControlPoints[i], points[i + 1].coords));
            }
        //}
    } 
    //map.addMarker(points[len - 1].coords, 'points[i].coords: ' + (len - 1));
    
    return curve;
};

Routes.prototype.yetAnotherBezierCurve = function (points) {
    var accuracy = 0.1;
    var curve = [];
    var p = 0;
    
    var getControlPoints = function (x0, y0, x1, y1, x2, y2, t) {
        var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        var d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        var fa = t * d01 / (d01 + d12);   // scaling factor for triangle Ta
        var fb = t * d12 / (d01 + d12);   // ditto for Tb, simplifies to fb=t-fa
        var p1x = x1 - fa * (x2 - x0);    // x2-x0 is the width of triangle T
        var p1y = y1 - fa * (y2 - y0);    // y2-y0 is the height of T
        var p2x = x1 + fb * (x2 - x0);
        var p2y = y1 + fb * (y2 - y0);
        
        return {
            p1: new L.LatLng(p1x, p1y),
            p2: new L.LatLng(p2x, p2y)
        };
    };
    
    var bezier = function (t, p0, p1, p2, p3) {        
        var lat = Math.pow(1 - t, 3) * p0.lat + 3 * Math.pow(1 - t, 2) * t * p1.lat + 3 * (1 - t) * Math.pow(t, 2) * p2.lat + Math.pow(t, 3) * p3.lat;
        var lng = Math.pow(1 - t, 3) * p0.lng + 3 * Math.pow(1 - t, 2) * t * p1.lng + 3 * (1 - t) * Math.pow(t, 2) * p2.lng + Math.pow(t, 3) * p3.lng;
        
        return new L.LatLng(lat, lng);
    };
    
    for (var i = 0, len = points.length; i < len - 2; i++) {
        //if (i >= 1 && i < 2) {
        //map.addMarker(points[i].coords, 'points[i].coords: ' + i);
        //map.addMarker(pxy.firstControlPoints[i], 'pxy.firstControlPoints[i]: ' + i);
        //map.addMarker(pxy.secondControlPoints[i], 'pxy.secondControlPoints[i]: ' + i);
        //map.addMarker(points[i + 1].coords, 'points[i + 1].coords: ' + (i + 1));
        var controlPoints = getControlPoints(
                points[i].coords.lat, points[i].coords.lng, 
                points[i + 1].coords.lat, points[i + 1].coords.lng, 
                points[i + 2].coords.lat, points[i + 2].coords.lng, p);
                
        for (var j = 0; j <= 1; j += accuracy) {
            curve.push(bezier(j, points[i].coords, controlPoints.p1, controlPoints.p2, points[i + 1].coords));
        }
        //}
    } 
    
    return curve;
};


Routes.prototype.checkHit = function (bbox, point) {
    var left = false,
        right = false,
        top = false,
        bottom = false;

    if (point.lat < bbox.northeast.lat)
        top = true;
    if (point.lng < bbox.northeast.lng)
        right = true;
    if (point.lat > bbox.southwest.lat)
        bottom = true;
    if (point.lng > bbox.southwest.lng)
        left = true;

    return top && right && bottom && left;
};

// Determine if a point is inside a polygon.
//
// point     - A Vec2 (2-element Array).
// polyVerts - Array of Vec2's (2-element Arrays). The vertices that make
//             up the polygon, in clockwise order around the polygon.
//
Routes.prototype.pointInsidePolygon = function (point, polyVerts) {
    //Logger.debug(point);
    //Logger.debug(polyVerts);
    var nsub = function (v1, v2) {
        return {
            x: v1.x - v2.x, 
            y: v1.y - v2.y
        };
    };
    // aka the "scalar cross product"
    var perpdot = function (v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    };

    var _point;
    if (!point.x || !point.y) {
        _point = {
            x: point.lat,
            y: point.lng
        };
    } else {
        _point = point;
    }
    
    
    var i, len, v1, v2, edge, x;
    // First translate the polygon so that `point` is the origin. Then, for each
    // edge, get the angle between two vectors: 1) the edge vector and 2) the
    // vector of the first vertex of the edge. If all of the angles are the same
    // sign (which is negative since they will be counter-clockwise) then the
    // point is inside the polygon; otherwise, the point is outside.
    for (i = 0, len = polyVerts.length; i < len; i++) {
        v1 = nsub(polyVerts[i], _point);
        v2 = nsub(polyVerts[i + 1 > len - 1 ? 0 : i + 1], _point);
        edge = nsub(v1, v2);
        // Note that we could also do this by using the normal + dot product
        x = perpdot(edge, v1);
        // If the point lies directly on an edge then count it as in the polygon
        if (x < 0) {
            return false;
        }
    }
    return true;
};

Routes.prototype.ESP_trianglebased = function (track, callback, map) {
    var that = this;
    this.requestOSMObstacles(track, function (obsts) {
        that.generateTriangulation(track, obsts, map);
        that.AStarTri(track, map);
        track.esp_tri.curve_ = that.bezierCurves(track.esp_tri.path, obsts, map);
        //map.drawEncodedPolyline(L.PolylineUtil.encode(that.yetAnotherBezierCurve(that.additionalPoints(track.esp_tri.path), map)), 'Tri. Shortest path - Curve---', '#BB00BB');
              
        Logger.error('Tri O.Path PNum: ' + track.esp_tri.path.length + 
                ' L: ' + that.calcDistLineSegs(track.esp_tri.path) + 
                ' A: ' + that.calcAnglesSumLineSegs(track.esp_tri.path, map) + 
                ' DF: ' + that.calcFDistance(track, track.esp_tri.path.map(function (elem) {
                        return elem.coords;
                }), map));
                
        Logger.error('Tri O.Path \u005Catpbox{PN = ' + track.esp_tri.path.length + 
                ' \u005C\u005C D = ' + that.calcDistLineSegs(track.esp_tri.path) + 
                ' \u005C\u005C A = ' + that.calcAnglesSumLineSegs(track.esp_tri.path, map) + 
                ' \u005C\u005C DF = ' + that.calcFDistance(track, track.esp_tri.path.map(function (elem) {
                        return elem.coords;
                }), map) + '}');        
        
        var bezier = that.bezierCurveszzz(track.esp_tri.path, map);
        
        map.drawLatLngPolyline(bezier, 'Tri. Shortest path - Curve (Bezier)| P-s Num: ' + bezier.length + 
                '; D: ' + that.calcDistLatLngs(bezier) + 
                'm; A: ' + that.calcAnglesSumLatLngs(bezier, map) + 
                '°; DF: ' + that.calcFDistance(track, bezier, map), /*'#BB00BB'*/'#AE3B00');
              
        Logger.error('Tri Bez.Path \u005Catpbox{PN = ' + bezier.length + 
                ' \u005C\u005C D = ' + that.calcDistLatLngs(bezier) + 
                ' \u005C\u005C A = ' + that.calcAnglesSumLatLngs(bezier, map) + 
                ' \u005C\u005C DF = ' + that.calcFDistance(track, bezier, map) + '}');
        
                       
        //that.calcAnglesSumTrack(track);
        //that.smoothcurvejs(track.esp_tri.path, map);
        var hermite = that.smoothcurvejs(track.esp_tri.path, map);
        
        map.drawLatLngPolyline(hermite, 'Tri. Shortest path - Curve Lib (Hermite 0.4)| P-s Num: ' + hermite.length + 
                '; D: ' + that.calcDistLatLngs(hermite) + 
                'm; A: ' + that.calcAnglesSumLatLngs(hermite, map) + 
                '°; DF: ' + that.calcFDistance(track, hermite, map), /*'#123456'*/'#AE9500');
        
        Logger.error('Tri Hermite.Path \u005Catpbox{PN = ' + hermite.length + 
                ' \u005C\u005C D = ' + that.calcDistLatLngs(hermite) + 
                ' \u005C\u005C A = ' + that.calcAnglesSumLatLngs(hermite, map) + 
                ' \u005C\u005C DF = ' + that.calcFDistance(track, hermite, map) + '}');
        
        //Logger.debug('distance: ' + that.calcFDistance(track, track.esp_tri.path, map));
        callback(obsts);       
    });
    
};

Routes.prototype.generateTriangulation = function (track, obstacles, map) {
    var bbox = track.bounds;
    var waypoints = [];
    for (var k = 0, len = track.points.length; k < len; k++) {
        var point = track.points[k].coordinates.split(',').map(parseFloat);
        waypoints.push(new L.LatLng(point[1], point[0]));
    }
       
    var north = bbox.northeast.lat,
        east = bbox.northeast.lng,
        south = bbox.southwest.lat,
        west = bbox.southwest.lng;

    var R = 6378137, //Earth radius in meters
        margin = 170; // bbox margin in meters
    
    Logger.debug('north = ' + north + '; east = ' + east + '; south = ' + south + '; west = ' + west);

    /*north += (180 / Math.PI) * (margin / R);  
    east += (180 / Math.PI) * (margin / (R * Math.cos(Math.PI * north / 180.0)));
    south -= (180 / Math.PI) * (margin / R);  
    west -= (180 / Math.PI) * (margin / (R * Math.cos(Math.PI * south / 180.0)));*/
    north = 61.790289;  
    east = 34.399309;
    south = 61.780753;  
    west = 34.34369;
    
    Logger.debug('north = ' + north + '; east = ' + east + '; south = ' + south + '; west = ' + west);
    
    var contour = [
        new poly2tri.Point(north, west),
        new poly2tri.Point(north, east),
        new poly2tri.Point(south, east),
        new poly2tri.Point(south, west)
    ];
    var swctx = new poly2tri.SweepContext(contour);
    
    var holes = [];
    //Logger.debug(obstacles);
    for (var i = 0, len = obstacles.length; i < len; i++) {
        var hull = obstacles[i].hull;
        var isNotObstacle = false;
        for (var k = 0, lenW = waypoints.length; k < lenW; k++) {
            if (this.pointInsidePolygon(waypoints[k], hull)) {
                isNotObstacle = true;
                break;
            }
        }
        if (isNotObstacle) continue;       
        if (i === 86 || i === 22 || i === 220|| i === 85 || i === 44 || i === 142 || i === 118 || i === 32 || i === 117) continue;
        //if (i === 11 || i === 14 || i === 33 || i === 35 || i === 11 || i === 22 || i === 34 || i === 32) continue;
        //if (i > 2) continue;
        //Logger.debug('i = ' + i);
        var hole = [];
        var points = obstacles[i].points;
        for (var j = 0, len2 = points.length; j < len2; j++) {
            hole.push(new poly2tri.Point(points[j].x, points[j].y));
        }
        holes.push(hole);
    }
    try {
        swctx.addHoles(holes);
        swctx.triangulate();
    } catch (Exception) {
        var points = Exception.points;
        for (var i = 0; i < points.length; i++)
            map.addMarker(new L.LatLng(points[i].x, points[i].y), 'Exception point');
        Logger.debug(Exception);
    }
    var triangles = swctx.getTriangles();
    //Logger.debug(swctx);
    //Logger.debug(triangles);
    
    track.esp_tri = {
        tri: triangles
    };
};

Routes.prototype.AStarTri = function (track, map) {
    var path_ = [];
    for (var i = 0; i < track.points.length - 1; i++) {
    //for (var i = 1; i < 2; i++) {
        var coords = track.points[i].coordinates.split(',').map(parseFloat);
        var start_p = {
            x: coords[1],
            y: coords[0]
        };

        coords = track.points[i + 1].coordinates.split(',').map(parseFloat);
        var end_p = {
            x: coords[1],
            y: coords[0]
        };

        var start_index = this.locatePointIndexInTri(start_p, track.esp_tri.tri);
        var end_index = this.locatePointIndexInTri(end_p, track.esp_tri.tri);
        if ((start_index > -1) && (end_index > -1)) {
            var result = astar_tri.search(track.esp_tri.tri, track.esp_tri.tri[start_index], track.esp_tri.tri[end_index], start_p, end_p, map);
            //map.drawTriangulation(result);           
            var path = this.funnel(result, start_p, end_p, map);
            //Logger.debug(path);
            if (path.length > 0) {
                for (var j = (i === 0) ? 0 : 1, res_len = path.length; j < res_len; j++) {
                    path_.push({
                        coords: new L.LatLng(path[j].x, path[j].y),
                        waypoint: j === 0 || j === (res_len - 1)
                    });
                }
            }
                     
            /*for (var k = 0, len = path.length; k < len; k++) {
                path_.push(new L.LatLng(path[k].x, path[k].y));
            }
            Logger.debug(path_);
            map.drawEncodedPolyline(L.PolylineUtil.encode(path_), 'tr - ' + (i + 1));*/
            
        } else {
            Logger.debug('one or both points wasn\'t located ' + (i + 1) + ', ' + (i + 2));
        }
    }
    
    Logger.debug('tri path: ');
    Logger.debug(path_);
    track.esp_tri.path = this.distinct(path_);
    track.esp_tri.path_dist = this.calcDistLineSegs(track.esp_tri.path);
    Logger.debug('tri after: ');
    Logger.debug(track.esp_tri.path);
    //map.drawEncodedPolyline(L.PolylineUtil.encode(track.esp_tri.path), 'tr - final');
};

Routes.prototype.locatePointIndexInTri = function (point, tri) {
    for (var lp = 0, lplen = tri.length; lp < lplen; lp++) {
        if (this.pointInsidePolygon(point, tri[lp].points_)) {
            return lp;
        }
    }
    return -1;
};

Routes.prototype.funnel = function (tri, start_p, end_p, map) {
    if (tri.length <= 1) {
        return [start_p, end_p];
    }
    //tri.splice(0, 1);
    //tri.splice(tri.length - 1, 1);

    var path = [],
        left_idx = 0,
        right_idx = 0,
        apex = start_p,
        left = start_p,
        right = start_p,
        leftVertices = [],
        rightVertices = [];

    var i, j, next, len;
    
    for (i = 0; i < tri.length - 1; i++) {
        var neighbors = tri[i + 1].neighbors_;
        for (j = 0; j < neighbors.length; j++) {
            if (!neighbors[j]) continue;
            if (tri[i] === neighbors[j]) {
                //Logger.debug(tri[i].points_);
                //Logger.debug(tri[i + 1].points_);
                leftVertices.push(tri[i + 1].points_[(j + 2) % 3]);
                rightVertices.push(tri[i + 1].points_[(j + 1) % 3]);
            }
        }
    }
    
    var triarea2 = function (a, b, c) {
        var ax = b.x - a.x,
            ay = b.y - a.y ,
            bx = c.x - a.x,
            by = c.y  - a.y ;
        return bx * ay - ax * by;
    };
    
    var equal = function (a, b, epsilon) {
        return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) < Math.pow(epsilon, 2);
    };
       
    path.push(start_p);
    // Initialise portal vertices.
    for (i = 0, len = tri.length; i < len; i++) {

        var portal_l = end_p,
                portal_r = end_p;

        if (i < len - 1) {
            portal_l = leftVertices[i];
            portal_r = rightVertices[i];
        }

        if (triarea2(apex, portal_l, left) >= 0) {
            if (equal(apex, left, 1e-6) || triarea2(apex, right, portal_l) > 0) {
                left = portal_l;
                left_idx = i;
            } else {
                path.push({
                    x: right.x,
                    y: right.y
                });
                apex = right;
                left = apex;
                left_idx = right_idx;
                i = right_idx;
                continue;
            }
        }
        
        if (triarea2(apex, right, portal_r) >= 0) {
            if (equal(apex, right, 1e-6) || triarea2(apex, portal_r, left) > 0) {
                right = portal_r;
                right_idx = i;
            } else {
                path.push({
                    x: left.x,
                    y: left.y
                });
                apex = left;
                right = apex;
                right_idx = left_idx;
                i = right_idx;
                continue;
            }
        }
    }
    path.push(end_p);  
      
    //var distinctArr = this.distinct(path);
      
    return path;
};       
            

// Here is our high level entry point.  It tests whether two polygons intersect.  The
// polygons must be convex, and they must not be degenerate.
Routes.prototype.isPolygonsIntersecting = function (polygonA, polygonB) {
    // Dot product operator
    var dot = function (a, b) {
        return a.x * b.x + a.y * b.y;
    };

    var pointSub = function (p0, p1) {
        return {
            x: p0.x - p1.x,
            y: p0.y - p1.y
        };
    };

    // Helper routine: test if two convex polygons overlap, using only the edges of
    // the first polygon (polygon "a") to build the list of candidate separating axes.
    var findSeparatingAxis = function (polygonA, polygonB) {
        // Iterate over all the edges
        var prev = polygonA.length - 1;
        for (var cur = 0; cur < polygonA.length; ++cur) {
            // Get edge vector.  (Assume operator- is overloaded)
            var edge = pointSub(polygonA[cur], polygonA[prev]);

            // Rotate vector 90 degrees (doesn't matter which way) to get
            // candidate separating axis.
            var v = {
                x: edge.y,
                y: -edge.x
            };

            // Gather extents of both polygons projected onto this axis
            var aMin, aMax, bMin, bMax;

            // gatherPolygonProjectionExtents(aVertCount, aVertlist, v, aMin, aMax);
            // Initialize extents to a single point, the first vertex
            aMin = aMax = dot(v, polygonA[0]);
            // Now scan all the rest, growing extents to include them
            for (var i = 1; i < polygonA.length; ++i) {
                var d = dot(v, polygonA[i]);
                if (d < aMin)
                    aMin = d;
                else if (d > aMax)
                    aMax = d;
            }

            // gatherPolygonProjectionExtents(bVertCount, bVertlist, v, bMin, bMax);
            // Initialize extents to a single point, the first vertex
            bMin = bMax = dot(v, polygonB[0]);
            // Now scan all the rest, growing extents to include them
            for (var i = 1; i < polygonB.length; ++i) {
                var b = dot(v, polygonB[i]);
                if (b < bMin)
                    bMin = b;
                else if (b > bMax)
                    bMax = b;
            }

            // Is this a separating axis?
            if (aMax < bMin)
                return true;
            if (bMax < aMin)
                return true;

            // Next edge, please
            prev = cur;
        }

        // Failed to find a separating axis
        return false;
    };

    // First, use all of A's edges to get candidate separating axes
    if (findSeparatingAxis(polygonA, polygonB))
        return false;

    // Now swap roles, and use B's edges
    if (findSeparatingAxis(polygonA, polygonB))
        return false;

    // No separating axis found.  They must overlap
    return true;
};

Routes.prototype.mergeHulls = function (hullA, hullB) {
    var mapFun = function (elem) {
        return [elem.x, elem.y];
    };
    var _hullA = hullA.map(mapFun),
        _hullB = hullB.map(mapFun);

    var getPolygonVertices = function (poly) {
        var vertices = [],
                numPoints = poly.getNumPoints();
        for (var k = 0; k < numPoints; k++) {
            vertices.push({
                x: poly.getX(k),
                y: poly.getY(k)
            });
        }
        return vertices;
    };

    var createPoly = function (points) {
        var res = new gpcas.geometry.PolyDefault();
        for (var k = 0; k < points.length; k++) {
            res.addPoint(new Point(points[k][0], points[k][1]));
        }
        return res;
    };

    var polyA = createPoly(_hullA),
        polyB = createPoly(_hullB);

    return getPolygonVertices(polyA.union(polyB));
};

Routes.prototype.distinct = function (arr) {
    var equal = function (a, b, epsilon) {
        return Math.pow(a.coords.lat - b.coords.lat, 2) + Math.pow(a.coords.lng - b.coords.lng, 2) < Math.pow(epsilon, 2);
    };
    
    var dArr = [];
    for (var i = 0; i < arr.length - 1; i++) {
        var isDistinct = true;
        for (var j = i + 1; j < arr.length; j++) {
            if (equal(arr[i], arr[j], 1e-6)) {
                isDistinct = false;
                break;
            }
        }
        if (isDistinct) dArr.push(arr[i]);
    }
    dArr.push(arr[arr.length - 1]);
    
    return dArr;
    /*var onlyUnique = function (value, index, self) {
        return self.indexOf(value) === index;
    };
    return arr.filter(onlyUnique);*/
    
};

Routes.prototype.removeClosePoints = function (arr) {
    var newArr = $.extend(true, [], arr);
    
    var isDistanceGreaterThan = function (a, b, d) {
        return a.coords.distanceTo(b.coords) > d;
    };
    
    var dArr = [];
    for (var i = 0; i < newArr.length - 1; i++) {
        if (newArr[i].waypoint || newArr[i + 1].waypoint) {
            dArr.push(newArr[i]);
            continue;
        }
        var isClose = false;
        if (!isDistanceGreaterThan(newArr[i], newArr[i + 1], 56)) {
            isClose = true;
            newArr[i + 1] = {
                coords: new L.LatLng((newArr[i].coords.lat + newArr[i + 1].coords.lat) / 2, (newArr[i].coords.lng + newArr[i + 1].coords.lng) / 2),
                waypoint: false
            };
                
        }
        if (!isClose) dArr.push(newArr[i]);
    }
    dArr.push(newArr[newArr.length - 1]);
    
    return dArr;   
};

Routes.prototype.calcDistLineSegs = function (arr) {
    var distance = 0;
    for (var i = 0; i < arr.length - 1; i++) {
        distance += arr[i].coords.distanceTo(arr[i + 1].coords);
    }
    
    return distance.toFixedDown(2);
};

Routes.prototype.calcDistLatLngs = function (arr) {
    var distance = 0;
    for (var i = 0; i < arr.length - 1; i++) {
        distance += arr[i].distanceTo(arr[i + 1]);
    }
    
    return distance.toFixedDown(2);
};

Routes.prototype.calcDistTrack = function (track) {
    var waypoints = [];
    for (var k = 0, len = track.points.length; k < len; k++) {
        var point = track.points[k].coordinates.split(',').map(parseFloat);
        waypoints.push(new L.LatLng(point[1], point[0]));
    }
    
    var distance = 0;
    for (var i = 0; i < waypoints.length - 1; i++) {
        distance += waypoints[i].distanceTo(waypoints[i + 1]);
    }
    
    return distance.toFixedDown(2);
};

Routes.prototype.calcDistEncodedPolyline = function (polyline) {
    var pointsArr = L.PolylineUtil.decode(polyline);
    var points = [];
    for (var i = 0, len = pointsArr.length; i < len; i++) {
        points.push(new L.LatLng(pointsArr[i][0], pointsArr[i][1]));        
    }
    
    var distance = 0;
    for (var i = 0; i < points.length - 1; i++) {
        distance += points[i].distanceTo(points[i + 1]);
    }
    
    return distance.toFixedDown(2);
};

Routes.prototype.calcAnglesSumTrack = function (track, map) {
    var waypoints = [];
    for (var k = 0, len = track.points.length; k < len; k++) {
        var point = track.points[k].coordinates.split(',').map(parseFloat);
        waypoints.push(new L.LatLng(point[1], point[0]));
    }
    
    var sum = 0;
    for (var i = 1; i < waypoints.length - 1; i++) {
        var p0 = map.project(waypoints[i - 1]),
            p1 = map.project(waypoints[i]),
            p2 = map.project(waypoints[i + 1]);
    
        //Logger.debug(p0, p1, p2);
        var dotprod = (p2.x - p1.x) * (p0.x - p1.x) + (p2.y - p1.y) * (p0.y - p1.y);
        var len1squared = (p0.x - p1.x) * (p0.x - p1.x) + (p0.y - p1.y) * (p0.y - p1.y);
        var len2squared = (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);

        var angle = 180 - Math.acos(dotprod / Math.sqrt(len1squared * len2squared)) * 180 / Math.PI;
        //Logger.debug('angle in point: ' + (i + 1) + ' equals: ' + angle);
        sum += angle;
    }
    
    return sum.toFixedDown(2);
};

Routes.prototype.calcAnglesSumLineSegs = function (arr, map) {
    var sum = 0;
    for (var i = 1; i < arr.length - 1; i++) {
        var p0 = map.project(arr[i - 1].coords),
            p1 = map.project(arr[i].coords),
            p2 = map.project(arr[i + 1].coords);
    
        //Logger.debug(p0, p1, p2);
        var dotprod = (p2.x - p1.x) * (p0.x - p1.x) + (p2.y - p1.y) * (p0.y - p1.y);
        var len1squared = (p0.x - p1.x) * (p0.x - p1.x) + (p0.y - p1.y) * (p0.y - p1.y);
        var len2squared = (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);

        var angle = 180 - Math.acos(dotprod / Math.sqrt(len1squared * len2squared)) * 180 / Math.PI;
        //Logger.debug('angle in point: ' + (i + 1) + ' equals: ' + angle);
        sum += isNaN(angle) ? 0 : angle;
    }
    
    return sum.toFixedDown(2);
};

Routes.prototype.calcAnglesSumLatLngs = function (arr, map) {
    var sum = 0;
    for (var i = 1; i < arr.length - 1; i++) {
        var p0 = map.project(arr[i - 1]),
            p1 = map.project(arr[i]),
            p2 = map.project(arr[i + 1]);

        var dotprod = (p2.x - p1.x) * (p0.x - p1.x) + (p2.y - p1.y) * (p0.y - p1.y);
        var len1squared = (p0.x - p1.x) * (p0.x - p1.x) + (p0.y - p1.y) * (p0.y - p1.y);
        var len2squared = (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);

        var angle = 180 - Math.acos(dotprod / Math.sqrt(len1squared * len2squared)) * 180 / Math.PI;
        if (isNaN(angle)) {
            //Logger.debug(p0, p1, p2);
            //Logger.debug(dotprod);
            //Logger.debug(len1squared);
            //Logger.debug(len2squared);
        }
        //Logger.debug('angle in point: ' + (i + 1) + ' equals: ' + angle);
        sum += isNaN(angle) ? 0 : angle;
    }
    
    return sum.toFixedDown(2);
};

Routes.prototype.calcFDistance = function (track, curve, map) {
    //Logger.debug(curve);
    var waypoints = [];
    for (var k = 0, len = track.points.length; k < len; k++) {
        var point = track.points[k].coordinates.split(',').map(parseFloat);
        waypoints.push(new L.LatLng(point[1], point[0]));
    }
    
    //var maxDist = -1;
    var distances = [];
    var index = 1;
    for (var i = 0; i < waypoints.length - 1; i++) {
        var l1 = map.project(waypoints[i], 1),
            l2 = map.project(waypoints[i + 1], 1);
    
        //Logger.debug('+++++++++++++++++++++++++++++++++');    
        //Logger.debug(l1);
        //Logger.debug(l2);
        var localDistances = [];
        localDistances.push(0);
        for (; index < curve.length; index++) {
            //Logger.debug(waypoints[i + 1], curve[index]);
            if (waypoints[i + 1].equals(curve[index])) break;
            
            //Logger.debug('---------------------------------'); 
            var p = map.project(curve[index], 1);
            //Logger.debug(p);
            localDistances.push(this.euclidian_p2e(p, l1, l2));
        }
        //Logger.debug(localDistances);
        distances.push(Math.max.apply(Math, localDistances));
    }
    //Logger.debug('+++++++++++++++++++++++++++++++++'); 
    //Logger.debug(distances);
    
    return Math.max.apply(Math, distances).toFixedDown(2);
};

Routes.prototype.calcFDistance2 = function (track, curve, map) {
    var waypoints = [];
    for (var k = 0, len = track.points.length; k < len; k++) {
        var point = track.points[k].coordinates.split(',').map(parseFloat);
        waypoints.push(new L.LatLng(point[1], point[0]));
    }
    //Logger.debug(waypoints);
    //Logger.debug(curve);
    
    var distances = [];
    for (var index = 1; index < curve.length - 1; index++) {
        var localDistances = [];
        var p = map.project(curve[index], 1);
        for (var i = 0; i < waypoints.length - 1; i++) {
            var l1 = map.project(waypoints[i], 1),
                l2 = map.project(waypoints[i + 1], 1); 
                
            localDistances.push(this.euclidian_p2e(p, l1, l2));
        }
        //Logger.debug(localDistances);
        distances.push(Math.min.apply(Math, localDistances));
    }
    //Logger.debug('+++++++++++++++++++++++++++++++++'); 
    //Logger.debug(distances);
    
    return Math.max.apply(Math, distances).toFixedDown(2);
};

Routes.prototype.calcFDistance3 = function (track, curve, map) {
    //Logger.debug(curve);
    var waypoints = [];
    for (var k = 0, len = track.points.length; k < len; k++) {
        var point = track.points[k].coordinates.split(',').map(parseFloat);
        waypoints.push(new L.LatLng(point[1], point[0]));
    }
    
    //var maxDist = -1;
    var distances = [];
    var index = 1;
    for (var i = 0; i < waypoints.length - 1; i++) {
        var l1 = map.project(waypoints[i], 1),
            l2 = map.project(waypoints[i + 1], 1);
    
        //Logger.debug('+++++++++++++++++++++++++++++++++');    
        //Logger.debug(l1);
        //Logger.debug(l2);
        var localDistances = [];
        for (; index < curve.length; index++) {
            //Logger.debug(waypoints[i + 1], curve[index]);
            if (waypoints[i + 1].distanceTo(curve[index]) < 3) break;
            
            //Logger.debug('---------------------------------'); 
            var p = map.project(curve[index], 1);
            //Logger.debug(p);
            localDistances.push(this.euclidian_p2e(p, l1, l2));
        }
        //Logger.debug(localDistances);
        distances.push(Math.max.apply(Math, localDistances));
    }
    //Logger.debug('+++++++++++++++++++++++++++++++++'); 
    //Logger.debug(distances);
    
    return Math.max.apply(Math, distances).toFixedDown(2);
};

Routes.prototype.smoothcurvejs = function (points, map) {
    var accuracy = 0.1;
    var tension = 0.4;
    var curve = [];
       
    var newPoints = points.map(function (elem) {
        var projection = map.project(elem.coords);
        return [projection.x, projection.y];
    });
       
    var path = Smooth(newPoints, {
        method: Smooth.METHOD_CUBIC,
        clip: Smooth.CLIP_MIRROR,
        cubicTension: tension
    });
    
    for (var i = 0, len = points.length; i < len - 1; i++) {
        curve.push(points[i].coords);
        for (var j = i + accuracy; j < i + 1; j += accuracy) {
            curve.push(map.unproject(path(j)));
        }
    }
    curve.push(points[points.length - 1].coords);
    
    return curve;
};

Routes.prototype.smoothcurvejs2 = function (points, map) {
    var accuracy = 0.0000001;
    var curve = [];
            
    var newPointsX = points.map(function (elem) {
        return elem.coords.lat;
    });
      
    var newPointsY = points.map(function (elem) {
        return elem.coords.lng;
    });
    
    var bubbleSort = function (a, b) {
        var swapped;
        do {
            swapped = false;
            for (var i = 0; i < a.length - 1; i++) {
                if (a[i] > a[i + 1]) {
                    var temp = a[i];
                    a[i] = a[i + 1];
                    a[i + 1] = temp;
                    
                    temp = b[i];
                    b[i] = b[i + 1];
                    b[i + 1] = temp;
                    
                    swapped = true;
                    
                    
                }
            }
        } while (swapped);
    };
    
    bubbleSort(newPointsX, newPointsY);         
    var mySpline = new MonotonicCubicSpline(newPointsX, newPointsY);
    Logger.debug(mySpline);
         
    for (var i = 0; i < newPointsX.length - 1; i++) {
        var diff = newPointsX[i + 1] - newPointsX[i];
        Logger.debug('newPointsX[i + 1],newPointsX[i],diff: ');
        Logger.debug(newPointsX[i + 1], newPointsX[i], diff);
        var step = diff / 10;
        //step = step.toFixedDown(10);
        var p2p = newPointsX[i];
        Logger.debug('step,p2p: ');
        Logger.debug(step,p2p);
        for (var j = 0; j < 10; j++) {           
            var inter = mySpline.interpolate(p2p);
            Logger.debug('val: ' + p2p + ' inter: ' + inter);
            var latlng = new L.LatLng(p2p, inter);
            //map.addMarker(latlng, 'i ' + i);
            curve.push(latlng);
            p2p += step;
        }     
    }
      
    return curve;
};

// point each N meters: 
// http://stackoverflow.com/questions/3073281/how-to-move-a-marker-100-meters-with-coordinates
Routes.prototype.additionalPoints = function (points) {
    var minDistance = points[0].coords.distanceTo(points[1].coords);
    for (var i = 1; i < points.length - 1; i++) {
        var distance = points[i].coords.distanceTo(points[i + 1].coords);
        if (distance < minDistance) {
            minDistance = distance;
        }
    }
    
    var newPoints = [];
    var N = minDistance / 2;
    for (var i = 0; i < points.length - 1; i++) {
        newPoints.push(points[i]);
        var dist = points[i].coords.distanceTo(points[i + 1].coords);
        var count = parseInt(dist / N);
        for (var j = 1; j < count; j++) {
            var ratio = (N * j) / dist;
            var newLat = points[i].coords.lat + ((points[i + 1].coords.lat - points[i].coords.lat) * ratio);
            var newLng = points[i].coords.lng + ((points[i + 1].coords.lng - points[i].coords.lng) * ratio);
            newPoints.push({
                coords: new L.LatLng(newLat, newLng)
            });
        }      
    }
    newPoints.push(points[points.length - 1]);
    
    Logger.debug(newPoints);
    return newPoints;
};


Routes.prototype.additionalPoints2 = function (points) {
    var index = 0;
    var minDistance = points[0].coords.distanceTo(points[1].coords);
    for (var i = 1; i < points.length - 1; i++) {
        var distance = points[i].coords.distanceTo(points[i + 1].coords);
        if (distance < minDistance) {
            minDistance = distance;
            index = i;
        }
    }
    
    var newPoints = [];
    for (var i = 0; i < points.length - 1; i++) {
        if (i === index) continue;
        newPoints.push(points[i]);
        var dist = points[i].coords.distanceTo(points[i + 1].coords);
        newPoints.push({
            coords: new L.LatLng((points[i].coords.lat + points[i + 1].coords.lat) / 2, (points[i].coords.lng + points[i + 1].coords.lng) / 2)
        });
        /*var count = parseInt(dist / minDistance);
        for (var j = 1; j < count; j++) {
            var ratio = (N * j) / dist;
            var newLat = points[i].coords.lat + ((points[i + 1].coords.lat - points[i].coords.lat) * ratio);
            var newLng = points[i].coords.lng + ((points[i + 1].coords.lng - points[i].coords.lng) * ratio);
            newPoints.push({
                coords: new L.LatLng(newLat, newLng)
            });
        }*/      
    }
    newPoints.push(points[points.length - 1]);
    
    Logger.debug(newPoints);
    return newPoints;
};

Routes.prototype.euclidian_p2e = function (point, edge_s, edge_e) {
    var A = point.x - edge_s.x,
        B = point.y - edge_s.y,
        C = edge_e.x - edge_s.x,
        D = edge_e.y - edge_s.y;

    var dot = A * C + B * D,
            len_sq = C * C + D * D,
            param = -1;

    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
        xx = edge_s.x;
        yy = edge_s.y;
    }
    else if (param > 1) {
        xx = edge_e.x;
        yy = edge_e.y;
    }
    else {
        xx = edge_s.x + param * C;
        yy = edge_s.y + param * D;
    }

    var dx = point.x - xx;
    var dy = point.y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
};

Routes.prototype.euclidian_p2p = function (pos0, pos1) {
    var dx = Math.abs(pos0.x - pos1.x);
    var dy = Math.abs(pos0.y - pos1.y);
    return Math.sqrt(dx * dx + dy * dy);
};
