/*global console*/
/*eslint-disable no-console*/
const Promise = require("bluebird");
const fs = require("fs");
const nodePath = require("path");
const yearTitlesMap = require("./year-titles");
const taglines = require("./taglines");
const titles = require("./titles");

const taglinesAsync = Promise.promisify(taglines);
const idForTitleAsync = Promise.promisify(titles);

const allTaglines = [];
const errors = [];

Promise.map(Object.keys(yearTitlesMap), year => {
    const titles = yearTitlesMap[year];
    console.log(" Year " + year)
    return Promise.map(titles, title => {
        // search IMDB for `title` in this year
        return idForTitleAsync(title, year)
        .then(id => {
            return taglinesAsync(id)
            .then(taglines => {
                console.log("Found %d taglines for %s (%s)", taglines.length, title, year)
                taglines.forEach(t => allTaglines.push(t))
            })
        })
        .catch(e => {
            errors.push(title + " (" + year + "): " + e.message)
            return null
        })
    });
}, { concurrency: 10 })
.then(_ => {
    const contents = allTaglines.join("\n");
    fs.writeFileSync(nodePath.join(__dirname, "../text/taglines.txt"), contents)

    console.log()
    console.log("FAILURES (" + errors.length + ")");
    errors.forEach(e => {
        console.log(" * " + e)
    })
})
