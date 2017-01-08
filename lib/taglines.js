const Promise = require("bluebird");
const request = require("request");
const cheerio = require("cheerio");

module.exports = function(id, cb) {
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
            return cleanup(tagline);
        }).toArray();

        Promise.all(taglinePromises)
        .asCallback(cb)
    });
}

function cleanup(text) {
    text = text
    .replace(/\.\.\./g, "…")
    .replace(/ \u2026/, "…") // people put spaces in front of ellipsis
    .replace(/\[Video Australia\]/g, "") //wtf??
    .trim();

    // TODO - undo stupid titlecasing that many taglines have
    return Promise.resolve(text)
}

