import fse from "fs-extra";
import lodash from "lodash";
import path from "path"

async function readJsonFile(path: string) {
  try {
    return JSON.parse(await fse.readFile(path, "utf-8"));
  } catch (err) {
    console.warn(`[node-merge-json] ${path} could not be loaded!`);
    return {};
  }
}

type AnyJson =  boolean | number | string | null | JsonArray | JsonMap;

interface JsonMap {  [key: string]: AnyJson; }

interface JsonArray extends Array<AnyJson> {}

export interface Options{
    target: JsonArray | JsonMap | string;
    output?: string;
    deepMerge?: boolean;
    sources: (JsonArray | JsonMap | string)[]
}

const parse = async (target: Options['target']) => {
    if(typeof target === 'string' && path.isAbsolute(target) && path.extname(target)==='.json'){
        return await readJsonFile(target);
    }
    else {
        return target;
    }
}

export default async function mergeJson(
    opts: Options
) {

    const { target, output, deepMerge, sources } = opts;
    
    const json = await parse(target);

    const parsedSources = await Promise.all(
      sources.map(async (source) => {
          return await parse(source);
      })
    );

    if (deepMerge) {
      lodash.merge(json, parsedSources);
    } else {
      lodash.assign(json, parsedSources);
    }

    if(typeof output==="string" && path.isAbsolute(output)){
        await fse.writeFile(output, JSON.stringify(json, null, 2), "utf-8");
    }

    return json;
}
