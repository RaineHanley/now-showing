const fs = require("fs");
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

function getText(prop) {
  if (!prop) return "";
  if (prop.type === "title") return prop.title.map(t => t.plain_text).join("");
  if (prop.type === "rich_text") return prop.rich_text.map(t => t.plain_text).join("");
  return "";
}

function getSelect(prop) {
  if (!prop) return "";
  if (prop.type === "select") return prop.select?.name || "";
  return "";
}

function getDate(prop) {
  if (!prop) return "";
  if (prop.type === "date") return prop.date?.start || "";
  return "";
}

(async () => {

  const res = await notion.databases.query({
    database_id: databaseId
  });

  const videos = res.results.map(page => {
    const p = page.properties;

    return {
      title: getText(p["Title"]),
      subtitle: getText(p["Subtitle"]),
      category: getSelect(p["Category"]),
      expiry: getDate(p["expiry"])
    };

  }).filter(v => v.title);

  fs.writeFileSync(
    "nowshowing.json",
    JSON.stringify({ videos }, null, 2)
  );

})();
