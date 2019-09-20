export function rnd(upper, lower) {
    var l = lower || 0
    var r = upper - l
    return Math.random() * r + l
}