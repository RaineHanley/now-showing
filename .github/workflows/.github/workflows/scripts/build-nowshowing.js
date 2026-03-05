const fs = require("fs");
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

// 🔧 CHANGE THESE to match your Notion property names exactly
const PROP_TITLE = "Title";
const PROP_SUBTITLE = "Subtitle";
const PROP_CATEGORY = "Category";
const PROP_EXPIRY = "expiry";   // or "Expiry" / "Expiry Date"
const PROP_ACTIVE = "active";   // or "Active"

function pickPlainText(prop) {
  if (!prop) return "";
  if (prop.type === "title") return (prop.title || []).map(t => t.plain_text).join("").trim();
  if (prop.type === "rich_text") return (prop.rich_text || []).map(t => t.plain_text).join("").trim();
  return "";
}

function pickSelectName(prop) {
  if (!prop) return "";
  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "multi_select") return (prop.multi_select || []).map(x => x.name).join(", ");
  return "";
}

function pickDateStart(prop) {
  if (!prop) return "";
  if (prop.type === "date") return prop.date?.start || "";
  return "";
}

function pickCheckbox(prop) {
  if (!prop) return false;
  if (prop.type === "checkbox") return !!prop.checkbox;
  return false;
}

(async () => {
  const res = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        { property: PROP_ACTIVE, checkbox: { equals: true } }
        // optional: expiry on/after today; we can add if you want
      ]
    }
  });

  const videos = res.results.map(page => {
    const p = page.properties;

    const title = pickPlainText(p[PROP_TITLE]);
    const subtitle = pickPlainText(p[PROP_SUBTITLE]);
    const category = pickSelectName(p[PROP_CATEGORY]);
    const expiry = pickDateStart(p[PROP_EXPIRY]);

    return { title, subtitle, category, expiry };
  }).filter(v => v.title);

  const out = { videos };
  fs.writeFileSync("nowshowing.json", JSON.stringify(out, null, 2));
  console.log(`Wrote nowshowing.json with ${videos.length} items`);
})();
