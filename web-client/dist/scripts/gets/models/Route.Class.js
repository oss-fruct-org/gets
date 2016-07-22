/**
 * Created by artyo on 03.05.2016.
 */

function RouteClass(dist, weight, type, routeCoords, obstacles, rBegin, rEnd) {
    this.routeBegin = rBegin;
    this.routeEnd = rEnd;
    this.distance = dist;
    this.weight = weight;
    this.obstacles = obstacles;
    this.type = type;
    this.routeCoords = routeCoords;
};

RouteClass.prototype.getDistance = function () {
    return this.distance;
};

RouteClass.prototype.getWeight = function () {
    return this.weight;
};

RouteClass.prototype.getObstacles = function () {
    return this.obstacles;
};

RouteClass.prototype.getType = function () {
    return this.type;
};

RouteClass.prototype.getRouteCoords = function () {
    return this.routeCoords;
};

RouteClass.prototype.getRouteBegin = function () {
    return this.routeBegin;
};

RouteClass.prototype.getRouteEnd = function () {
    return this.routeEnd;
};