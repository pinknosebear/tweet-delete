const { exec } = require("child_process");

function runCurl(command) {
    return new Promise((resolve) => {
        exec(command, { shell: "/bin/bash" }, (err, stdout, stderr) => {
            if (err) {
                console.error("✗ ERROR:", stderr || err.message);
                return resolve(false);
            }

            if (stdout.includes('"errors"')) {
                console.log("✗ API ERROR:", stdout);
                return resolve(false);
            }

            console.log("✓ SUCCESS:", stdout);
            resolve(true);
        });
    });
}

module.exports = { runCurl };