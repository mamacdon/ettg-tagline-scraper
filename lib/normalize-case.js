const fs = require("fs");
const nlcstToString = require("nlcst-to-string");
const nodehun = require("nodehun");
const nodePath = require("path");
const ParseEnglish = require("parse-english");
const Promise = require("bluebird");

const dictDir = nodePath.join(nodePath.dirname(require.resolve("nodehun")), "../../examples/dictionaries/");
const affbuf = fs.readFileSync(dictDir + "/en_US.aff");
const dictbuf = fs.readFileSync(dictDir + "/en_US.dic");
const dict = Promise.promisifyAll(new nodehun(affbuf, dictbuf));

const parseEnglish = new ParseEnglish();

module.exports = normalizeCase;

// For some reason these are capitalized in the dictionary although they should not be
const nevercap = /^(?:as|at|a|good|in|it|love|the|to)$/i

// Tries to undo titlecasing and convert to sentence case.
// This fails a good portion of the time
function normalizeCase(tagline, title) {
    if (typeof tagline !== "string" && typeof title !== "string") {
        throw new TypeError("Need tagline and title")
    }

    // First step: we basically lowercase the initial capital on any word that
    // doesn't appear capitalized in a dictionary
    return Promise.map(tagline.split(/\b/), word => {
        if (!/\w/.test(word)) {
            return word; // spaces or punctuation probably
        }

        return analyze(dict, word)
        .then(attrs => {
            const stem = attrs.st;
            if (!stem) {
                return word; // unknown word, preserve
            }

            const dictCap = (stem[0].toUpperCase() === stem[0]);
            if (dictCap && !nevercap.test(word)) {
                return word; // capitalized in dictionary => preserve
            }

            // Sometimes the movie title shows up in the tagline
            if (!nevercap.test(word) && new Set(title.split(/\b/)).has(word)) {
                return word; // title word => preserve
            }

            if (word.toUpperCase() === word) {
                return word; // all uppercase => preserve
            }

            // Otherwise lowercase it
            return word[0].toLowerCase() + word.substr(1);
        })
    })
    .then(words => words.join(""))
    .then(tagline => sentenceCase(tagline)) // Now apply sentence case
}

// @fulfills hash of morphological attributes
function analyze(dict, word) {
    return dict.analyzeAsync(word)
    .then(fields => {
        const map = {};
        // in practice hunspell seems to always return a 1-element array here
        fields.forEach(f => {
            // f is something like "st:overwork ts:0 al:overwrought is:Vd"
            f.trim().split(" ").forEach(p => {
                const match = /^([^:]+):(.+)$/.exec(p);
                if (!match) {
                    return;
                }
                map[match[1]] = match[2];
            })
        })
        return map;
    })
}

function sentenceCase(text) {
    const para = parseEnglish.tokenizeParagraph(text);
    const sentences = Array.prototype.filter.call(para.children, n => n.type === "SentenceNode")

    // Capitalize a WordNode `w` if any of these hold:
    // - w is first child
    // - w's first non-WhiteSpace predecessor is a BigPunctuator, OR
    //   is a WordNode whose last child is a BigPunctuator
    sentences.forEach(s => {
        const nodes = s.children;
        nodes.forEach((n, i) => {
            const type = n.type;
            if (type !== "WordNode") {
                return;
            }

            if (i === 0) {
                capitalize(n);
                return;
            }

            // ok this code fuckin sucks i know
            let j = i - 1;
            let pred = nodes[j];
            while (pred && pred.type === "WhiteSpaceNode") {
                j--;
                pred = nodes[j];
            }

            if (!pred) {
                return;
            }

            // pred is the first non-whitespace predecessor
            if (isBigPunctuator(pred) || (pred.type === "WordNode" && isBigPunctuator(pred.children[pred.children.length - 1]))) {
                capitalize(n);
            }
        })
    })
    return nlcstToString(para);
}

// returns whether n is a punctuator conventionally followed by capital letter
function isBigPunctuator(n) {
    if (!n || n.type !== "PunctuationNode") {
        return false
    }

    switch (n.value) {
    case ".":
    case "…":
    case "?":
    case "!":
        return true;
    }
    return false;
}

function capitalize(node) {
    Array.prototype.some.call(node.children, child => {
        if (child.type === "TextNode") {
            const val = child.value;
            if (val === val.toUpperCase()) {
                // Skip - all uppercase
                return true;
            }
            child.value = val[0].toUpperCase() + val.substr(1)
            return true;
        }
    })
}