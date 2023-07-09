# fast-format

A faster implementation of @danocmx's `node-tf2-item-format/static`.
This repo provides an alternative ISchema that is optimized for speed.

> Memory usage _will_ be higher than the original implementation.

## Why?

The author of `node-tf2-item-format` [has stated](https://github.com/danocmx/node-tf2-item-format/pull/210#issuecomment-1299105832) that performance in static schema is not a priority. However, I have run into multiple situations where the performance of `node-tf2-item-format/static` becomes a major bottleneck. This package is an attempt to address that.

## Usage

In general, this package is a drop-in replacement for `node-tf2-item-format/static` (v5) or `node-tf2-item-format` (v4).

TS

```typescript
//v4 or v5/static style
import { parseEconItem } from "@piman51277/fast-format";

//v5 style
import { FastSchema } from "@piman51277/fast-format";
import { createFormat } from "tf2-item-format";

const format = createFormat(new FastSchema());

format.parseEconItem = format.parseEconItem.bind(format);
format.parseString = format.parseString.bind(format);
format.stringify = format.stringify.bind(format);
format.fixName = format.fixName.bind(format);
format.createBPListing = format.createBPListing.bind(format);
format.toSKU = format.toSKU.bind(format);
format.parseSKU = format.parseSKU.bind(format);
```

> Note, due to the incompatibilities between CommonJS and ES Modules, you will need to use the `default` export when using CommonJS.

JS

```javascript
//v4 or v5/static style
const {
  default: { parseEconItem },
} = require("@piman51277/fast-format");
```

For more information, refer to `node-tf2-item-format`'s [README](https://github.com/danocmx/node-tf2-item-format)

## Performance

Across the board, `fast-format` performs around the same or better than `node-tf2-item-format/static`. Notably, `parseEconItem` (with `defindexes=true`) is around 2x faster than the original implementation.

### Methodology

Benchmarking was done by parsing random EconItems from a pool of 1000 items in the author's inventory.
[Link to backpack](https://backpack.tf/profiles/76561198954908705)

Precompute steps are not included, by means of running the functions multiple times before the benchmark.

Benchmark Machine Specs:

```
CPU:Intel i7-1360P @ 5.0GHz
RAM: 32GB of DDR5 6000Mhz
OS: Debian 12.0
```

`tf2-item-format` version: `5.9.0`

`tf2-static-schema` version: `1.49.0`

### Results

(You can check these yourself using the `npm run benchmark` command)

```
parseEconItem defindex=true
fast-format x 32,351 ops/sec ±0.41% (93 runs sampled)
tf2-item-format/static x 16,913 ops/sec ±0.76% (94 runs sampled)
Fastest is fast-format

parseEconItem defindex=false
fast-format x 34,066 ops/sec ±0.35% (98 runs sampled)
tf2-item-format/static x 33,983 ops/sec ±0.44% (99 runs sampled)
Fastest is fast-format,tf2-item-format/static

toSKU
fast-format x 8,713,657 ops/sec ±0.23% (96 runs sampled)
tf2-item-format/static x 8,724,382 ops/sec ±0.24% (99 runs sampled)
Fastest is tf2-item-format/static,fast-format
```
