import { Schema } from "./schema";
import { createFormat } from "tf2-item-format";

const format = createFormat(new Schema());

format.parseEconItem = format.parseEconItem.bind(format);
format.parseString = format.parseString.bind(format);
format.stringify = format.stringify.bind(format);
format.fixName = format.fixName.bind(format);
format.createBPListing = format.createBPListing.bind(format);
format.toSKU = format.toSKU.bind(format);
format.parseSKU = format.parseSKU.bind(format);

export default format;
