# `node-merge-json`

> merge json file

## Usage

```
const mergeJson = require("node-merge-json");

mergeJson({
    dest: __dirname + "/output.json",
    deepMerge: true,
    sources: [
        __dirname + "/a.json",
        __dirname + "/b.json",
        __dirname + "/c.json"
    ]
}).then(
    mergedJson => console.log(mergedJson)
)

```
