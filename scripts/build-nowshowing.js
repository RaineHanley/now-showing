
 const fs = require("fs");
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = (process.env.NOTION_DATABASE_ID || "").replace(/[^a-f0-9]/gi, "");

function getText(prop) {
  if (!prop) return "";
  if (prop.type === "title") return (prop.title || []).map(t => t.plain_text).join("").trim();
  if (prop.type === "rich_text") return (prop.rich_text || []).map(t => t.plain_text).join("").trim();
  return "";
}

function getSelect(prop) {
  if (!prop) return "";
  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "multi_select") return (prop.multi_select || []).map(x => x.name).join(", ");
  return "";
}

function getDate(prop) {
  if (!prop) return "";
  if (prop.type === "date") return prop.date?.start || "";
  return "";
}

(async () => {
  if (!process.env.NOTION_TOKEN) throw new Error("Missing NOTION_TOKEN");
  if (!databaseId) throw new Error("Missing NOTION_DATABASE_ID");

const res = await notion.databases.query({
  database_id: databaseId,
  page_size: 100
});

  const videos = res.results.map(page => {
    const p = page.properties || {};
    return {
      title: getText(p["Title"]),
      subtitle: getText(p["Subtitle"]),
      category: getSelect(p["Category"]),
      expiry: getDate(p["Expiry"])
    };
  }).filter(v => v.title);

  fs.writeFileSync("nowshowing.json", JSON.stringify({ videos }, null, 2));
  console.log("Wrote nowshowing.json:", videos.length, "items");
})();
