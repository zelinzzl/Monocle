import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { optimize } from "svgo";
import crypto from "crypto";
import prettier from "prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, "../src/assets/svg");
const LOTTIE_DIR = path.join(__dirname, "../src/assets/lottie");
const OUTPUT_DIR = path.join(__dirname, "../src/components/ui/icons/generated");
const OUTPUT_TS_FILE = path.join(
  __dirname,
  "../src/components/ui/icons/index.ts"
);
const CACHE_FILE = path.join(__dirname, ".icon-cache.json");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

type IconCache = Record<string, string>;
type IconData = { name: string; componentName: string; type: "svg" | "lottie" };

const toPascalCase = (str: string): string =>
  str
    .replace(/\W+/g, " ")
    .trim()
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (w) => w.toUpperCase())
    .replace(/\s+/g, "");

const getFileHash = (filePath: string): string => {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(content).digest("hex");
};

let cache: IconCache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    cache = {};
  }
}

const currentHashes: IconCache = {};
const generatedIcons: IconData[] = [];

const existingFiles = fs
  .readdirSync(OUTPUT_DIR)
  .filter((f) => f.endsWith(".tsx"));
existingFiles.forEach((f) => fs.unlinkSync(path.join(OUTPUT_DIR, f)));

const seenComponentNames = new Set<string>();

const processSvgFile = async (file: string): Promise<void> => {
  try {
    const svgPath = path.join(ICONS_DIR, file);
    const fileHash = getFileHash(svgPath);
    currentHashes[file] = fileHash;

    if (cache[file] === fileHash) {
      console.log(`Skipped SVG (cached): ${file}`);
      return;
    }

    const svgContent = fs.readFileSync(svgPath, "utf8");
    const componentName = toPascalCase(path.basename(file, ".svg"));

    if (seenComponentNames.has(componentName)) {
      console.warn(
        `Duplicate component name detected: ${componentName}, skipping.`
      );
      return;
    }
    seenComponentNames.add(componentName);

    const result = optimize(svgContent, {
      plugins: [
        "preset-default",
        {
          name: "removeAttrs",
          params: {
            attrs: "(width|height|class|style)",
          },
        },
      ],
    });

    const optimizedSvg = result.data
      .replace(/<svg([^>]*)>/, `<svg$1 {...rest} >`)
      .replace(/\s*class=["'][^"']*["']/g, "")
      .replace(/fill=["'](?!none)[^"']*["']/g, 'fill={color || "currentColor"}')
      .replace(/stroke=["'][^"']*["']/g, 'stroke={color || "currentColor"}')
      .replace(/stroke-linecap=/g, "strokeLinecap=")
      .replace(/stroke-linejoin=/g, "strokeLinejoin=")
      .replace(/stroke-width=/g, "strokeWidth=");

    const tsxContent = `import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const ${componentName} = (props: IconProps) => {
  const { color, ...rest } = props;
  return (${optimizedSvg});
};
export default ${componentName};
`;

    const formatted = await prettier.format(tsxContent, {
      parser: "typescript",
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, `${componentName}.tsx`), formatted);

    generatedIcons.push({ name: file, componentName, type: "svg" });
    console.log(`Generated SVG: ${componentName}.tsx`);
  } catch (error) {
    console.error(`Error processing SVG file ${file}:`, error);
  }
};

const processLottieFile = async (file: string): Promise<void> => {
  try {
    const lottiePath = path.join(LOTTIE_DIR, file);
    const fileHash = getFileHash(lottiePath);
    currentHashes[file] = fileHash;

    if (cache[file] === fileHash) {
      console.log(`Skipped Lottie (cached): ${file}`);
      return;
    }

    const lottieContent = fs.readFileSync(lottiePath, "utf8");
    const jsonData = JSON.parse(lottieContent);

    const animationName = path
      .basename(file, ".json")
      .replace(/\W+/g, " ")
      .trim()
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, "");

    if (seenComponentNames.has(animationName)) {
      console.warn(
        `Duplicate component name detected: ${animationName}, skipping.`
      );
      return;
    }
    seenComponentNames.add(animationName);

    const tsxContent = `const ${animationName} = ${lottieContent};

export default ${animationName};
`;

    const formatted = await prettier.format(tsxContent, {
      parser: "typescript",
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, `${animationName}.tsx`), formatted);

    generatedIcons.push({
      name: file,
      componentName: animationName,
      type: "lottie",
    });
    console.log(`Generated Lottie: ${animationName}.tsx`);
  } catch (error) {
    console.error(`Error processing Lottie file ${file}:`, error);
  }
};

const generateIndexFile = async (icons: IconData[]): Promise<void> => {
  const svgIcons = icons.filter((i) => i.type === "svg");
  const lottieIcons = icons.filter((i) => i.type === "lottie");

  const indexContent = `// Auto-generated file
${svgIcons
  .map(
    ({ componentName }) =>
      `import ${componentName} from './generated/${componentName}';`
  )
  .join("\n")}
${lottieIcons
  .map(
    ({ componentName }) =>
      `import ${componentName} from './generated/${componentName}';`
  )
  .join("\n")}

export type IconName =
${svgIcons.length > 0 ? svgIcons.map(({ componentName }) => `  | '${componentName}'`).join("\n") : "  | never"};

export type LottieName =
${lottieIcons.length > 0 ? lottieIcons.map(({ componentName }) => `  | '${componentName}'`).join("\n") : "  | never"};

export const iconComponents = {
${svgIcons.map(({ componentName }) => `  ${componentName},`).join("\n")}
} as const;

export const lottieComponents = {
${lottieIcons.map(({ componentName }) => `  ${componentName},`).join("\n")}
} as const;

export {
${[...svgIcons, ...lottieIcons]
  .map(({ componentName }) => `  ${componentName},`)
  .join("\n")}
};
`;

  const formatted = await prettier.format(indexContent, {
    parser: "typescript",
  });
  fs.writeFileSync(OUTPUT_TS_FILE, formatted);
  console.log(`Generated index file: ${OUTPUT_TS_FILE}`);
};

async function main() {
  try {
    const svgFiles = fs
      .readdirSync(ICONS_DIR)
      .filter((file) => file.endsWith(".svg"));
    await Promise.all(svgFiles.map(processSvgFile));

    const lottieFiles = fs
      .readdirSync(LOTTIE_DIR)
      .filter((file) => file.endsWith(".json"));
    await Promise.all(lottieFiles.map(processLottieFile));

    await generateIndexFile(generatedIcons);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(currentHashes, null, 2));

    console.log(`Done. Generated ${generatedIcons.length} icons.`);
  } catch (error) {
    console.error("Error during icon generation:", error);
    process.exit(1);
  }
}

main();
