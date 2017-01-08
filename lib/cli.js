/*global console*/
/*eslint-disable no-console*/
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const nodePath = require("path");
const nodeUtil = require("util");
const yearTitlesMap = require("./year-titles");
const taglinesAsync = Promise.promisify(require("./taglines"));
const idForTitleAsync = Promise.promisify(require("./titles"));

const idsFile = nodePath.join(__dirname, "../text/ids.csv");
const taglinesFile = nodePath.join(__dirname, "../text/taglines.txt");

const id2TitleMap = {};
const allTaglines = [];
const errors = [];

const flusher = setInterval(writeResult, 1500); // periodically write results in case we hang or die
let pendingWrite;

console.log("Running on %d titles (%d years)", yearTitlesMap.size, Object.keys(yearTitlesMap).length);
Promise.map(Object.keys(yearTitlesMap), year => {
    const titles = yearTitlesMap[year];
    // console.log("===" + year + "===")
    return Promise.map(titles, title => {
        // search IMDB for `title` in this year
        return idForTitleAsync(title, year)
        .then(id => {
            id2TitleMap[id] = [title, year];
            return taglinesAsync(id, title)
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
.then(() => {
    clearInterval(flusher);
    return writeResult();
})
.then(() => {
    console.log();
    console.log("FAILURES (" + errors.length + ")");
    errors.forEach(e => {
        console.log(" * " + e)
    })
})

function writeResult() {
    if (pendingWrite) {
        // Make sure we write again after since the content mightve changed
        return pendingWrite
        .then(writeResult)
    }
    const taglinesContent = allTaglines.join("\n");
    const idsContent = Object.keys(id2TitleMap).map(id => {
        const entry = id2TitleMap[id];
        return nodeUtil.format("%s,%s,%s", id, entry[0].replace(/,/g, '\\,'), entry[1]);
    }).join("\n");

    return Promise.all([
        fs.writeFileAsync(taglinesFile, taglinesContent),
        fs.writeFileAsync(idsFile, idsContent),
    ])
    .finally(() => {
        pendingWrite = null
    })
}