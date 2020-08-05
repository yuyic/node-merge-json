import fse from "fs-extra";
import _ from "lodash";
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
    output?: string;
    deepMerge?: boolean;
    sources: (JsonArray | JsonMap | string)[]
}

const parse = async (target: JsonArray | JsonMap | string) => {
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

    const { output, deepMerge, sources } = opts;

    if(sources.length===0){
      console.warn(`[node-merge-json] sources length should >0!`);
      return {}
    }
    
    const json = await parse(_.head(sources));
    const tail = _.tail(sources);
    const parsedSources = await Promise.all(
      tail.map(async (source) => {
          return await parse(source);
      })
    );

    if (deepMerge) {
      _.merge(json, parsedSources);
    } else {
      _.assign(json, parsedSources);
    }

    if(typeof output==="string" && path.isAbsolute(output)){
        await fse.writeFile(output, JSON.stringify(json, null, 2), "utf-8");
    }

    return json;
}
