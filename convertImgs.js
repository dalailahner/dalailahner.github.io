import { existsSync, readdirSync } from "node:fs";
import { confirm, input, select } from "@inquirer/prompts";
import sharp from "sharp";

// USER INPUT:
const inputDir = await input({ message: "source images path:" }, { clearPromptOnDone: true });
if (!existsSync(inputDir)) {
  console.error(`inputDir "${inputDir} does not exist!"`);
  process.exit(1);
}

const fileformat = await select(
  {
    message: "output file format",
    choices: [
      {
        value: "avif",
      },
      {
        value: "jpeg",
      },
      {
        value: "png",
      },
      {
        value: "webp",
      },
    ],
  },
  { clearPromptOnDone: true },
);

const outputDir = await input({ message: "output path:", default: inputDir }, { clearPromptOnDone: true });
if (!existsSync(outputDir)) {
  console.error(`outputDir "${outputDir} does not exist!"`);
  process.exit(1);
}

const confirmation = await confirm({ message: `Convert files in ${inputDir} to .${fileformat} and save them to ${outputDir}?` }, { clearPromptOnDone: true });

// SHARP PROCESSING:
if (confirmation) {
  const files = readdirSync(inputDir);

  for (const file of files) {
    const nameArray = file.split(".");
    nameArray.pop();
    const name = nameArray.join(".");
    sharp(`${inputDir}/${file}`).toFormat(fileformat, getFileOptions(fileformat)).toFile(`${outputDir}/${name}.${fileformat}`);
  }
}

// FUNCTIONS:
function getFileOptions(format) {
  if (format === "avif") {
    return { quality: 60, effort: 6 };
  }
  if (format === "jpeg") {
    return { quality: 60 };
  }
  if (format === "png") {
    return {};
  }
  if (format === "webp") {
    return { quality: 60, alphaQuality: 80 };
  }
}
