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
            return $(this).text().trim()
        }).toArray()

        cb(null, taglines);
    });
}
