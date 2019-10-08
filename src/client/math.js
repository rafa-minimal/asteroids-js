import planck from 'planck-js';

const Vec2 = planck.Vec2;

export function rnd(upper, lower) {
    var l = lower || 0;
    var r = upper - l;
    return Math.random() * r + l
}

export function rotateDeg(vec, angleDeg) {
    let rad = angleDeg / (2 * Math.PI);
    let c = Math.cos(angleDeg);
    let s = Math.sin(angleDeg);
    vec.x = c * vec.x - s * vec.y;
    vec.y = s * vec.x + c * vec.y;
    return vec;
}

export function rndVecRadius(radius) {
    const angle = rnd(360.0);
    return Vec2(radius * Math.cos(angle), radius * Math.sin(angle));
}