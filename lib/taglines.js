const Promise = require("bluebird");
const request = require("request");
const cheerio = require("cheerio");
const normalizeCase = require("./normalize-case");

module.exports = function(id, title, cb) {
    request('http://www.imdb.com/title/' + id + '/taglines', function (error, response, body) {
        if (error || response.statusCode !== 200) {
            cb(new Error("IMDB failed to respond or returned an error: " + error || response.statusCode));
            return;
        }

        body = body.replace(/(\r\n|\n|\r)/gm,"").replace(/ +(?= )/g,'');
        const $ = cheerio.load(body);

        const result = $('#taglines_content div.soda');
        if (result.text().indexOf("don't have any") !== -1) {
            // no taglines for this title
            cb(null, []);
            return;
        }

        const taglinePromises = result.map(function() {
            const tagline = $(this).text();
            return cleanup(tagline, title);
        }).toArray();

        Promise.all(taglinePromises)
        .asCallback(cb)
    });
}

// @returns Promise
function cleanup(text, title) {
    return Promise.try(() => {
        text = text
        .replace(/( ?\.){3,}/g, "…")      // use ellipsis character
        .replace(/ \u2026/, "…")          // with no leading space
        .replace(/…([^\s'",.])/, "… $1")  // add trailing sapace after ellipsis
        .replace(/ ?\([^(]+?\)/, "")      // remove parentheticals
        .replace(/ ?\[[^\[]+?\]/, "")     // remove parentheticals
        .replace(/(?: - )|--/, " — ")     // em dash
        .trim();
        return normalizeCase(text, title);
    })
}
