const { port } = require("./config");
const app = require("./server");

const server = app.listen(port, function() {
    console.log("Webserver is ready");
});

// quit on ctrl-c when running docker in terminal
process.on("SIGINT", function onSigint() {
    console.info("Got SIGINT (aka ctrl-c in docker). Graceful shutdown ", new Date().toISOString());
    shutdown();
});

// quit properly on docker stop
process.on("SIGTERM", function onSigterm() {
    console.info("Got SIGTERM (docker container stop). Graceful shutdown ", new Date().toISOString());
    shutdown();
});

// shut down server
function shutdown() {
    server.close((err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        process.exit(0);
    });
}
//
// need above in docker container to properly exit
//