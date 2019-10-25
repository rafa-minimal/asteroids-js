function permutations(array) {
    const results = [];

    function permute(left, right) {
        for (let i = 0; i < right.length; i++) {
            const cur = right.splice(i, 1);
            if (right.length === 0) {
                results.push(left.concat(cur));
            }
            permute(left.concat(cur), right.slice());
            right.splice(i, 0, cur[0]);
        }
        return results;
    }

    return permute([], array);
}

module.exports = {permutations};