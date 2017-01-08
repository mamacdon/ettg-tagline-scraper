const Promise = require("bluebird");
const fs = require("fs");
const nodePath = require("path");
const yearTitlesMap = require("./year-titles");
const taglines = require("./taglines");
const titles = require("./titles");

const taglinesAsync = Promise.promisify(taglines);
const idForTitleAsync = Promise.promisify(titles);

Promise.map(Object.keys(yearTitlesMap), year => {
    const titles = yearTitlesMap[year];
    return titles.map(title => {
        // search IMDB for `title` in this year
        return idForTitleAsync(title, year)
        .then(id => {
            return taglinesAsync(id)
            .then(taglines => {
                console.log("Found %d taglines for %s (%s)", taglines.length, title, year)
                return taglines;
            })
        })
    })
})
.then(results => {
    // Flatten 2-d array
    const allTaglines = results.reduce((acc, titlesForYear) => {
        acc = acc.concat(titlesForYear);
        return acc;
    }, [])

    const contents = allTaglines.join("\n");
    fs.writeFileSync(nodePath.join(__dirname, "./text/taglines.txt"), contents)
})