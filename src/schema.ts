import {
  requireStatic,
  SchemaEnum,
  DefindexToName,
  SchemaItem,
} from "tf2-static-schema";
import { ISchema, ItemsGame } from "tf2-item-format";
import { DEFINDEXES, NAMES } from "./overrides";
import { FastSchemaItem } from "./types/fast";

function isNumber(str: string | number): str is number {
  // Although it doesn't check for decimals, it is not required here.
  return typeof str === "number" || /^\d+$/.test(str);
}

export class Schema implements ISchema {
  public effects!: SchemaEnum;
  public wears!: SchemaEnum;
  public killstreaks!: SchemaEnum;
  public textures!: SchemaEnum;
  public itemNames!: DefindexToName;
  public items!: FastSchemaItem[];
  public qualities!: SchemaEnum;
  public itemsGame!: ItemsGame;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {
    //load items
    this.loadDefindexes();
    this.loadItemNames();
  }

  getTextures() {
    if (!this.textures) this.loadTextures();

    return this.textures;
  }

  getEffects() {
    if (!this.effects) this.loadEffects();

    return this.effects;
  }

  loadEffects(): void {
    this.effects = requireStatic("effects") as SchemaEnum;
  }

  loadWears(): void {
    this.wears = requireStatic("wears") as SchemaEnum;
  }

  loadKillstreaks(): void {
    this.killstreaks = requireStatic("killstreaks") as SchemaEnum;
  }

  loadTextures(): void {
    const textures = requireStatic("paint-kits") as SchemaEnum;
    this.textures = textures;
  }

  loadItemNames(): void {
    this.itemNames = requireStatic("item-names") as DefindexToName;
  }

  loadDefindexes(): void {
    const rawItems = requireStatic("items") as SchemaItem[];
    const strippedItems = rawItems.map(stripItem);

    //sort by item_name property
    strippedItems.sort((a, b) => {
      const aName = this.getName(a.defindex);
      const bName = this.getName(b.defindex);

      if (aName < bName) return -1;
      if (aName > bName) return 1;

      //sort by defindex
      if (a.defindex < b.defindex) return -1;
      if (a.defindex > b.defindex) return 1;
      return 0;
    });

    this.items = strippedItems;
  }

  loadQualities(): void {
    this.qualities = requireStatic("qualities") as SchemaEnum;
  }

  loadItemsGame(): void {
    this.itemsGame = requireStatic("items-game") as ItemsGame;
  }

  getEffect(search: string | number): number | string {
    if (!this.effects) this.loadEffects();

    return this.effects[search];
  }

  getWear(search: string | number): number | string {
    if (!this.wears) this.loadWears();

    return this.wears[search];
  }

  getKillstreak(search: string | number): number | string {
    if (!this.killstreaks) this.loadKillstreaks();

    return this.killstreaks[search];
  }

  getTexture(search: string | number): number | string {
    if (!this.textures) this.loadTextures();

    return this.textures[search];
  }

  /**
   * @todo https://github.com/Nicklason/tf2-automatic/blob/master/src/lib/items.ts
   * @param {string} search
   * @return {number}
   */
  getDefindex(search: number | string): number | null {
    if (!this.items) this.loadDefindexes();
    if (typeof search === "number") return search;

    // Exceptions
    if (DEFINDEXES[search]) return DEFINDEXES[search];

    // Modified binary search
    // Since the Schema include many entries with the same name
    // We need for first find an entry with the same name
    // And then use two pointers to isolate the range of entries with the same name
    // And then scan the range to get the correct entry

    let left = 0;
    let right = this.items.length - 1;

    // Find an entry with the same name
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const item: FastSchemaItem = this.items[mid];
      const name: string = selectName(item);
      if (name === search) {
        left = mid;
        right = mid;
        break;
      }

      if (name < search) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }

      if (left > right) {
        return null;
      }
    }

    //we have located an entry with the same name
    let rangeStart = left;
    let rangeEnd = right;

    //push each pointer until we find an entry with a different name
    while (rangeStart > 0) {
      const item: FastSchemaItem = this.items[rangeStart - 1];
      const name: string = selectName(item);
      if (name !== search) {
        break;
      }
      rangeStart--;
    }

    while (rangeEnd < this.items.length - 1) {
      const item: FastSchemaItem = this.items[rangeEnd + 1];
      const name: string = selectName(item);
      if (name !== search) {
        break;
      }
      rangeEnd++;
    }

    //scan the range to find the correct entry
    let upgradeableDfx: number | null = null;
    for (let i = rangeStart; i <= rangeEnd; i++) {
      const item: FastSchemaItem = this.items[i];
      const name: string = selectName(item);
      if (name === search) {
        if (!hasUpgradeable(item) || isUpgradeable(item.name)) {
          return item.defindex;
        }

        upgradeableDfx = item.defindex;
      }
    }

    return upgradeableDfx;
  }

  getName(search: number | string): string {
    if (!this.itemNames) this.loadItemNames();
    if (!isNumber(search)) return search as string;
    const name = NAMES[search];
    if (name) return name;

    return this.itemNames[search as number];
  }

  getQuality(search: number | string): number | string {
    if (!this.qualities) this.loadQualities();

    return this.qualities[search];
  }

  getEffectName(effect: number | string): string {
    if (!isNumber(effect)) return effect as string;

    return this.getEffect(effect as number) as string;
  }

  getWearName(wear: number | string): string {
    if (!isNumber(wear)) return wear as string;

    return this.getWear(wear as number) as string;
  }

  getKillstreakName(killstreak: number | string): string {
    if (!isNumber(killstreak)) return killstreak as string;

    return this.getKillstreak(killstreak as number) as string;
  }

  getTextureName(texture: number | string): string {
    if (!isNumber(texture)) return texture as string;

    return this.getTexture(texture as number) as string;
  }

  getQualityName(quality: number | string): string {
    if (!isNumber(quality)) return quality as string;

    return this.getQuality(quality as number) as string;
  }

  getEffectEnum(effect: number | string): number {
    if (isNumber(effect)) return effect as number;

    return this.getEffect(effect as string) as number;
  }

  getWearEnum(wear: number | string): number {
    if (isNumber(wear)) return wear as number;

    return this.getWear(wear as string) as number;
  }

  getKillstreakEnum(killstreak: number | string): number {
    if (isNumber(killstreak)) return killstreak as number;

    return this.getKillstreak(killstreak as string) as number;
  }

  getTextureEnum(texture: number | string): number {
    if (isNumber(texture)) return texture as number;

    return parseInt(this.getTexture(texture as string) as string);
  }

  getQualityEnum(quality: number | string): number {
    if (isNumber(quality)) return quality as number;

    return this.getQuality(quality as string) as number;
  }

  isUniqueHat(defindexOrName: string | number): boolean {
    if (isNumber(defindexOrName)) {
      defindexOrName = this.getName(defindexOrName);
    }

    const item = this.getSchemaItemFromName(defindexOrName);
    return !!item?.proper_name;
  }

  getCrateNumber(defindexOrName: string | number): number {
    if (!this.itemsGame) this.loadItemsGame();

    if (!isNumber(defindexOrName)) {
      const defindex = this.getDefindex(defindexOrName);
      if (!defindex) return 0;
      defindexOrName = defindex;
    }

    const item = this.itemsGame.items[defindexOrName + ""];
    if (!item) return 0;

    const crateSeries = parseInt(
      (item.static_attrs &&
        item.static_attrs["set supply crate series"]) as string
    );

    return isNaN(crateSeries) ? 0 : crateSeries;
  }

  private getSchemaItemFromName(search: string) {
    if (!this.items) this.loadDefindexes();

    let byDefindex = 0;
    if (DEFINDEXES[search]) {
      byDefindex = DEFINDEXES[search];
    }

    let correctItem: FastSchemaItem | null = null;
    for (let i = 0; i < this.items.length; i++) {
      const item: FastSchemaItem = this.items[i];
      const name: string = selectName(item);
      if (byDefindex ? byDefindex === item.defindex : name === search) {
        if (!hasUpgradeable(item) || isUpgradeable(item.name)) {
          return item;
        }

        correctItem = item;
      }
    }

    return correctItem;
  }
}

/**
 * @todo get from schema
 * @param {object} item
 * @return {string}
 */
function selectName(item: FastSchemaItem): string {
  if (item.item_name === "Kit") return item.item_type_name;
  // Due to BackpackTF naming colisions.
  if (item.defindex === 20003) return "Professional Killstreak Fabricator";
  if (item.defindex === 20002) return "Specialized Killstreak Fabricator";
  return item.item_name;
}

function isUpgradeable(name: string): boolean {
  return name.startsWith("Upgradeable ");
}

function hasUpgradeable(item: FastSchemaItem): boolean {
  return item.name.includes(item.item_class.toUpperCase());
}

function stripItem(item: SchemaItem): FastSchemaItem {
  return {
    name: item.name,
    proper_name: item.proper_name,
    defindex: item.defindex,
    item_class: item.item_class,
    item_type_name: item.item_type_name,
    item_name: item.item_name,
  };
}

export default new Schema();
