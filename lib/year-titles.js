const fs = require("fs");
const nodePath = require("path");
const list = fs.readFileSync(nodePath.join(__dirname, "../text/thriller_list.txt"), "utf-8");
const yearRegexp = /===(\d{4,})===/g;

module.exports = buildMap();

function buildMap() {
    const map = {};

    let match;
    while ((match = yearRegexp.exec(list)) !== null) {
        const yearStart = yearRegexp.lastIndex + 1;
        const year = match[1]; // "1993"

        // read titles on lines until we hit another = or EOF
        let nextYearStart = list.indexOf('=', yearStart);
        if (nextYearStart === -1) {
            nextYearStart = list.length; // eof
        }

        const titles = list.substring(yearStart, nextYearStart).split(/\r?\n/).filter(s => s.length);
        map[year] = titles;
    }
    Object.defineProperty(map, "size", {
        enumerable: false,
        value: Object.keys(map).reduce((acc, key) => {
            return acc + map[key].length
        }, 0)
    })
    return map;
}
