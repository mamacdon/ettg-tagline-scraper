// http://www.imdb.com/find?ref_=nv_sr_fn&q=judicial+consent+1994&s=tt (all titles)
// http://www.imdb.com/find?q=judicial%20consent%201994&s=tt&ttype=ft&ref_=fn_ft (movies only)
const cheerio = require("cheerio");
const request = require("request");

module.exports = function(title, year, cb) {
    const query = {
        q: title,
        s: "tt",     // title search
        //ttype: "ft"  // movie title (not TV) - remove this because some titles are TV movies
    }
    request("http://www.imdb.com/find", {qs: query}, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            cb(new Error("IMDB failed to respond or returned an error: " + error || response.statusCode));
            return;
        }

        body = body.replace(/(\r\n|\n|\r)/gm,"").replace(/ +(?= )/g, "");
        const $ = cheerio.load(body);

        let foundUrl;
        $(".findList .findResult .result_text").each(function() {
            const text = $(this).text().trim();
            if (match(text, title, year)) {
                // looks good
                foundUrl = $(this).find("a").attr("href");
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

function match(text, title, year) {
    text = text.toLowerCase();
    title = title.toLowerCase();
    if (text.indexOf(title) !== -1 && text.indexOf("(" + year + ")") !== -1) {
        return true;
    }

    // try stripping off sequel subtitle if it has one and match separately
    const seq = parseSequel(title)
    if (!seq) {
        return false;
    }

    if (text.indexOf(seq.base) !== -1 && text.indexOf(seq.subtitle) !== -1) {
        return true;
    }
    return false;
}

const regexp = /title\/([^/]+)\//
function idFromUrl(url) {
    return url.match(regexp)[1];
}

const subtitleRegexp = /\d(?::?\s(.+?))?$/
function parseSequel(title) {
    const match = subtitleRegexp.exec(title)
    if (!match) {
        return null;
    }
    return { base: title.substring(0, match.index), subtitle: match[1]}
}