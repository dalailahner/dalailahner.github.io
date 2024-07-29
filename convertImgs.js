import { input, select, confirm } from "@inquirer/prompts";
import { readdirSync, existsSync, mkdirSync } from "fs";
import sharp from "sharp";

// USER INPUT:
let inputDir = await input({ message: "source images path:" }, { clearPromptOnDone: true });
inputDir = fixPathString(inputDir);

const fileformat = await select(
  {
    message: "output file format",
    choices: [
      {
        value: "avif",
      },
      {
        value: "jpg",
      },
      {
        value: "png",
      },
      {
        value: "webp",
      },
    ],
  },
  { clearPromptOnDone: true }
);

let outputDir = await input({ message: "output path:", default: inputDir }, { clearPromptOnDone: true });
outputDir = fixPathString(outputDir);

const confirmation = await confirm({ message: `Convert files in ${inputDir} to .${fileformat} and save them to ${outputDir}?` }, { clearPromptOnDone: true });

// SHARP PROCESSING:
if (confirmation) {
  const files = readdirSync(inputDir);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir);
  }

  files.forEach((file) => {
    const nameArray = file.split(".");
    nameArray.pop();
    const name = nameArray.join(".");
    sharp(inputDir + file)
      .toFormat(fileformat, getFileOptions(fileformat))
      .toFile(`${outputDir + name}.${fileformat}`);
  });
}

// FUNCTIONS:
function fixPathString(path) {
  const lastChar = path[path.length - 1];
  if (lastChar !== "/" && lastChar !== "\\") {
    path = path + "/";
  }
  return path;
}

function getFileOptions(format) {
  if (format === "avif") {
    return { quality: 60, effort: 6 };
  }
  if (format === "jpg") {
    return { quality: 60 };
  }
  if (format === "png") {
    return {};
  }
  if (format === "webp") {
    return { quality: 60, alphaQuality: 80 };
  }
}
