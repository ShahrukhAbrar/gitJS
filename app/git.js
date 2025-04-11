const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

console.error("Logs from your program will appear here!");

const command = process.argv[2];

switch (command) {
  case "init":
    createGitDirectory();
    break;
  case "cat-file":
    const hash = process.argv[4];
    catFiles(hash);
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}

function createGitDirectory() {
  fs.mkdirSync(path.join(process.cwd(), ".git"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "objects"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(process.cwd(), ".git", "refs"), { recursive: true });

  fs.writeFileSync(
    path.join(process.cwd(), ".git", "HEAD"),
    "ref: refs/heads/main\n"
  );
  console.log("Initialized git directory");
}

async function catFiles(hash) {
  const content = await fs.readFileSync(
    path.join(process.cwd(), ".git", "objects", hash.slice(0, 2), hash.slice(2))
  );
  const data = zlib.inflateSync(content).toString();
  var res = "";
  if (process.argv[3] === "-t") {
    res = data.split(" ")[0];
  } else if (process.argv[3] === "-s") {
    res = data.split("\x00")[0];
    res = res.split(" ")[1];
  } else if (process.argv[3] === "-p") {
    res = data.split("\0")[1];
  } else {
    res = "missing arg";
  }
  process.stdout.write(res);
}
