import newImpl from "../index";
import { parseEconItem, toSKU } from "tf2-item-format/static";

const oldImpl = {
  parseEconItem,
  toSKU,
};

//load the dataset
import { readFileSync } from "fs";
const dataset = JSON.parse(readFileSync("./testcases/econitems.json", "utf8"));

//run preload tasks
for (const item of dataset) {
  newImpl.parseEconItem(item, false, true);
  oldImpl.parseEconItem(item, false, true);

  newImpl.toSKU(item);
  oldImpl.toSKU(item);
}

//run benchmark
import Benchmark from "benchmark";

//parseEconItem defindex=true
console.log("\nparseEconItem defindex=true");
new Benchmark.Suite()
  .add("fast-format", () => {
    const rndmItem = dataset[Math.floor(Math.random() * dataset.length)];
    newImpl.parseEconItem(rndmItem, false, true);
  })
  .add("tf2-item-format/static", () => {
    const rndmItem = dataset[Math.floor(Math.random() * dataset.length)];
    oldImpl.parseEconItem(rndmItem, false, true);
  })
  .on("cycle", (event: any) => {
    console.log(String(event.target));
  })
  .on("complete", function (this: any) {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .on("error", (event: any) => {
    console.log(event.target.error);
  })
  .run();

//parseEconItem defindex=false
console.log("\nparseEconItem defindex=false");
new Benchmark.Suite()
  .add("fast-format", () => {
    const rndmItem = dataset[Math.floor(Math.random() * dataset.length)];
    newImpl.parseEconItem(rndmItem, false, false);
  })
  .add("tf2-item-format/static", () => {
    const rndmItem = dataset[Math.floor(Math.random() * dataset.length)];
    oldImpl.parseEconItem(rndmItem, false, false);
  })
  .on("cycle", (event: any) => {
    console.log(String(event.target));
  })
  .on("complete", function (this: any) {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .on("error", (event: any) => {
    console.log(event.target.error);
  })
  .run();

//toSKU
console.log("\ntoSKU");
new Benchmark.Suite()
  .add("fast-format", () => {
    const rndmItem = dataset[Math.floor(Math.random() * dataset.length)];
    newImpl.toSKU(rndmItem);
  })
  .add("tf2-item-format/static", () => {
    const rndmItem = dataset[Math.floor(Math.random() * dataset.length)];
    oldImpl.toSKU(rndmItem);
  })
  .on("cycle", (event: any) => {
    console.log(String(event.target));
  })
  .on("complete", function (this: any) {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .on("error", (event: any) => {
    console.log(event.target.error);
  })
  .run();
