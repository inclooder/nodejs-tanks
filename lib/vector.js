var math = require('./math')
var _ = require('underscore')

var Vector = function(x, y){
    this.x = x
    this.y = y
}

Vector.prototype.length = function(){
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
}

Vector.prototype.normalize = function(){
    var x = this.x / this.length()
    var y = this.y / this.length()
    return new Vector(x, y)
}

Vector.prototype.add = function(other){
    var x = this.x + other.x
    var y = this.y + other.y
    return new Vector(x, y)
}

Vector.prototype.mul = function(other){
    if(_.isNumber(other)) {
        other = new Vector(other, other)
    }
    return new Vector(this.x * other.x, this.y * other.y)
}

Vector.prototype.rotate = function(degree){
    var radians = math.degreesToRadians(degree)
    var x = this.x * Math.cos(radians) - this.y * Math.sin(radians)
    var y = this.x * Math.sin(radians) + this.y * Math.cos(radians)
    return new Vector(x, y)
}

Vector.prototype.negate = function(){
    return new Vector(-this.x, -this.y)
}

module.exports = Vector
