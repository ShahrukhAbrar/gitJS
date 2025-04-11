const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");

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
  case "hash-object":
    hashObject();
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
  const compressed = await fs.promises.readFile(
    path.join(process.cwd(), ".git", "objects", hash.slice(0, 2), hash.slice(2))
  );

  const fullData = zlib.inflateSync(compressed);

  const nullByteIndex = fullData.indexOf(0);
  const header = fullData.slice(0, nullByteIndex).toString();
  const body = fullData.slice(nullByteIndex + 1);

  let res = "";
  if (process.argv[3] === "-t") {
    res = header.split(" ")[0];
    process.stdout.write(res);
  } else if (process.argv[3] === "-s") {
    res = header.split(" ")[1];
    process.stdout.write(res);
  } else if (process.argv[3] === "-p") {
    process.stdout.write(body);
  } else {
    process.stdout.write("missing arg");
  }
}

async function hashObject() {
  var fileName;

  if (process.argv[3] == "-w") {
    fileName = process.argv[4];
  } else {
    fileName = process.argv[3];
  }
  var fileSize = (await fs.promises.stat(fileName)).size.toString();
  const content = fs.readFileSync(fileName);
  const header = `blob ${fileSize}\x00${content.toString()}`;
  fileHash = crypto.createHash("sha1").update(header).digest("hex");

  if (process.argv[3] == "-w") {
    var folderName = fileHash.slice(0, 2);
    var objectName = fileHash.slice(2);

    await fs.promises.mkdir(`.git/objects/${folderName}`, { recursive: true });

    fs.writeFileSync(
      path.join(process.cwd(), ".git", "objects", folderName, objectName),
      zlib.deflateSync(header)
    );
  }

  process.stdout.write(fileHash);
}
