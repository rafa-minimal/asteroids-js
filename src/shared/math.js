const planck = require('planck-js');

const Vec2 = planck.Vec2;

rnd = function (upper, lower) {
    var l = lower || 0;
    var r = upper - l;
    return Math.random() * r + l
};

rotateDeg = function (vec, angleDeg) {
    let rad = angleDeg / (2 * Math.PI);
    let c = Math.cos(angleDeg);
    let s = Math.sin(angleDeg);
    vec.x = c * vec.x - s * vec.y;
    vec.y = s * vec.x + c * vec.y;
    return vec;
};

rndVecRadius = function (radius) {
    const angle = rnd(360.0);
    return Vec2(radius * Math.cos(angle), radius * Math.sin(angle));
};

module.exports = {rnd, rotateDeg, rndVecRadius};