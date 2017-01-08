// http://www.imdb.com/find?ref_=nv_sr_fn&q=judicial+consent+1994&s=tt (all titles)
// http://www.imdb.com/find?q=judicial%20consent%201994&s=tt&ttype=ft&ref_=fn_ft (movies only)
const cheerio = require("cheerio");
const request = require("request");

module.exports = function(title, year, cb) {
    const query = {
        q: title,
        s: "tt",     // title search
        ttype: "ft"  // movie title
    }
    request('http://www.imdb.com/find', {qs: query}, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            cb(new Error("IMDB failed to respond or returned an error: " + error || response.statusCode));
            return;
        }

        body = body.replace(/(\r\n|\n|\r)/gm,"").replace(/ +(?= )/g,'');
        const $ = cheerio.load(body);

        let foundUrl;
        $('.findList .findResult .result_text').each(function() {
            const text = $(this).text().trim();
            if (text.indexOf(title) !== -1 && text.indexOf("(" + year + ")") !== -1) { // Wild Things (1994)
                // looks good
                foundUrl = $(this).find('a').attr('href');
            }
        })

        if (!foundUrl) {
            cb(new Error("Could not find id"))
            return;
        }
        const id = idFromUrl(foundUrl)

        cb(null, id);
    });
}

const regexp = /title\/([^/]+)\//
function idFromUrl(url) {
    return url.match(regexp)[1];
}