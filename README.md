## Usage

    $(npm bin)/ettg-tagline-scraper

### What it does
Uses a list of [thriller titles obtained from Wikipedia](https://en.wikipedia.org/wiki/List_of_erotic_thriller_films),
and finds the taglines from IMDb for each title. Taglines are written to `./text/taglines.txt`.

Also saves the IMDb film `id` for each title to `./text/ids.csv` (for possible use later). The ids are obtained by
doing a crude search on the title and year.

### Capitalization
Taglines on IMDb are written in inconsistent styles. Some use title case:

> All She Wanted Was A Taste… And She Gave As Good As She Got.

Others use regular English sentence case:

> Love can be cruel but obsession can be murder.

The tool makes an attempt to normalize everything to sentence case, but this is an inexact
process and will sometimes produce weird results. Some minor typographical nits are also cleaned up.

