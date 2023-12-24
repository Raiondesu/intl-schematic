// packages/cli/src/init.ts
import { blue, bold, gray, green } from "colorette";
import { existsSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
function init(outputFile = "translation.schema.json") {
  console.log(`${bold(blue("intl-schematic"))}: detecting installed plugins...`);
  const dependencies = readdirSync(cwd("node_modules/@intl-schematic"));
  console.log(`${bold(blue("intl-schematic"))}: detected plugins:`);
  const schematicPlugins = dependencies.filter((pluginName) => {
    if (!pluginName.startsWith("plugin")) {
      return false;
    }
    if (existsSync(cwd("node_modules", "@intl-schematic", pluginName, "property.schema.json"))) {
      console.log(`	 - \u2705 @intl-schematic/${bold(green(pluginName))} - schema detected`);
      return true;
    }
    console.log(`	 - \u{1F50C} @intl-schematic/${gray(pluginName)}`);
    return false;
  });
  schematicPlugins.forEach((plugin) => {
  });
  console.log(`${bold(blue("intl-schematic"))}: writing to file`, outputFile);
  const schema = JSON.stringify({
    "$ref": "https://unpkg.com/intl-schematic/translation.schema.json",
    "additionalProperties": {
      "anyOf": schematicPlugins.map((plugin) => ({
        "$ref": `https://unpkg.com/@intl-schematic/${plugin}/property.schema.json`
      })).concat({
        "$ref": "https://unpkg.com/intl-schematic/property.schema.json"
      })
    }
  }, null, 4);
  writeFileSync(cwd(outputFile), schema);
  function cwd(...paths) {
    return join(process.cwd(), ...paths);
  }
}
export {
  init
};
