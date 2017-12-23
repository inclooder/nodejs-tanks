module.exports.degreesToRadians = function(degrees){
    return degrees / (180 / Math.PI)
}

module.exports.radiansToDegrees = function(radians){
    return radians * (180 / Math.PI)
}

module.exports.vectorBetweenTwoPoints = function(p1, p2) {
    var Vector = require('./vector')
    return new Vector(p2.x - p1.x, p2.y - p1.y)
}

module.exports.getAngleBetweenTwoPoints = function(p1, p2){
    var diff = module.exports.vectorBetweenTwoPoints(p1, p2)
    return Math.atan2(diff.y, diff.x) * (180 / Math.PI)
}
