# ettg-tagline-scraper
Fetches taglines for movies from [IMDB](http://www.imdb.com/). This tool was written to bootstrap
[ettg-tagline-generator](https://github.com/mamacdon/) and not much effort has been put into making it
reusable, so YMMV.

### Usage
Check out the repo and install it

    $ git clone https://github.com/mamacdon/ettg.git
    $ npm install

Then run this

    $ npm run scrape

It should begin fetching taglines for movies listed in the input file. Taglines are saved to `./text/taglines.txt`.

### Options
You can customize the input and output files using environment variables. Shown below are their
default values.

```console
INPUT=./text/titles.txt       # input file (see `Input format` for syntax)
OUTPUT=./text/taglines.txt    # output file
```

The default `INPUT` file is a list of [thriller movies obtained from Wikipedia](https://en.wikipedia.org/wiki/List_of_erotic_thriller_films).

### Input format
The input file looks like this. The movie titles are organized into sections by their release year.

    ===2005===
    Batman Begins
    King Kong

    ===2006===
    Casino Royale

    ===2007===
    Spider-Man 3
    Knocked Up
    Superbad

### How it works
Using the input file, it finds each movies's taglines and writes them to the output file. This process
involves scraping web pages, so it's pretty slow.

Before you can fetch the tagline, you need the IMDb film id, so the tool obtains the id by doing a crude search
on the title and release year. The ids are also saved (mostly for debugging purposes), to `./text/ids.csv`.

### Known issues
* The title search can sometimes fail. The tool will warn when this happens.
* Taglines on IMDb are written in inconsistent styles. Some use title case:

    > All She Wanted Was A Taste… And She Gave As Good As She Got.

    While others use regular English sentence case:

    > Love can be cruel but obsession can be murder.

    The tool makes an attempt to normalize everything to sentence case, but this is an inexact process and
    will sometimes produce weird results. It also cleans up some minor typographical nits, like converting
    sequences of period characters to ellipsis (U+2026).

### Acknowledgements
I borrowed the scraping approach from the [imdb](https://npmjs.org/package/imdb) package.

### License
ISC