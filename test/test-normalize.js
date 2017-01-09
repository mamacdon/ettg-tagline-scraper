/*eslint-env mocha*/
const assert = require("assert");
const Promise = require("bluebird");
const sentenceCase = require("../lib/normalize-case");

// input, want
const data = [
    ["love. obsession. Revenge.", "Love. Obsession. Revenge."],
    ["thunder, lightning, and murder", "Thunder, lightning, and murder"],
    ["forbidden pleasure. reckless desire. winner takes all.", "Forbidden pleasure. Reckless desire. Winner takes all."]
];

describe("normalize-case", () => {
    it("should work", () => {
        return Promise.map(data, d => {
            const input = d[0], want = d[1];

            return sentenceCase(input, "")
            .then(got => {
                assert.equal(got, want)
            })
        })
    })
})