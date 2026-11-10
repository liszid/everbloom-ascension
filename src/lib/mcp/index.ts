import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCharacters from "./tools/list-characters";
import getCharacter from "./tools/get-character";
import getEquipment from "./tools/get-equipment";
import getInventory from "./tools/get-inventory";
import getProgress from "./tools/get-progress";

// Vite inlines the stable ref; the published SUPABASE_URL may be a proxy.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "everbloom-ascend-craft",
  title: "Everbloom Ascend Craft",
  version: "0.1.0",
  instructions:
    "Read-only tools for the Thornvale RPG (Tower of a Thousand Floors). They act as the signed-in player and read their own saved characters. Start with `list_characters`, then pass its slot number to `get_character`, `get_equipment`, `get_inventory` or `get_progress`. Data reflects the last save; the game autosaves every few seconds while being played.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCharacters, getCharacter, getEquipment, getInventory, getProgress],
});
