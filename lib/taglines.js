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

        const taglines = $('#taglines_content div.soda').map(function() {
            const text = $(this).text().trim();
            if (text.indexOf("don't have any") !== -1) { // no taglines for this title
                cb(null, []);
                return;
            }
            return cleanup(text);
        }).toArray()

        cb(null, taglines);
    });
}

function cleanup(text) {
    text = text
    .replace(/\.\.\./g, "…")
    .replace(/\[Video Australia]/g, "") //wtf??

    // TODO - undo stupid titlecasing that many taglines have

    return text.trim();
}