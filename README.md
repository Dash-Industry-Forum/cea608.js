# cea608.js
A JavaScript project for parsing and decoding CEA-608 caption data.

The input is either binary data (e.g. extracted from a SEI NAL unit) with associated timing or SCC files.
The output is either callbacks with time-stamped maps of 32x15 styled characters, or a WebVTT Node stream.

## Build and test

This project uses Node.js and `mocha` with `chai` for tests. To install the tools and run the tests, type:

    npm install
    npm test

Syntax is checked using jshint.

For coverage tests, install `istanbul` and then run the script:

    npm install -g istanbul
    npm run-script istanbul

