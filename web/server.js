const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const { createRequestHandler } = require("@remix-run/express");

const BUILD_DIR = path.join(process.cwd(), "build");

const {
    Satellite, // the Satellite constructor
    logger, // pre-configured logger
} = require('@senecacdot/satellite');

const port = process.env.PORT || 3000;

// Define your microservice
const service = new Satellite();

service.app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
service.app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
service.app.use(
    "/build",
    express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
service.app.use(express.static("public", { maxAge: "1h" }));

service.app.use(morgan("tiny"));

service.router.all(  "*",
    process.env.NODE_ENV === "development"
        ? (req, res, next) => {
            purgeRequireCache();

            return createRequestHandler({
                build: require(BUILD_DIR),
                mode: process.env.NODE_ENV,
            })(req, res, next);
        }
        : createRequestHandler({
            build: require(BUILD_DIR),
            mode: process.env.NODE_ENV,
        })
)

// Start the service on the specified port
service.start(port, () => {
    logger.info('Satellite Microservice running on port ' + port);
});

function purgeRequireCache() {
    // purge require cache on requests for "server side HMR" this won't let
    // you have in-memory objects between requests in development,
    // alternatively you can set up nodemon/pm2-dev to restart the server on
    // file changes, but then you'll have to reconnect to databases/etc on each
    // change. We prefer the DX of this, so we've included it for you by default
    for (const key in require.cache) {
        if (key.startsWith(BUILD_DIR)) {
            delete require.cache[key];
        }
    }
}
