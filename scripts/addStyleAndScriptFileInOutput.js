const fs = require("fs");
const path = require("path");

const indexHTMLPath = path.resolve(__dirname, "../dist/index.html");

let indexContent = fs.readFileSync(indexHTMLPath, "utf-8");

indexContent = indexContent.replace(
  "</head>",
  `<link rel="stylesheet" href="./plugins/plugins.css" /></head>`
);
indexContent = indexContent.replace(
  "</body>",
  `<script  src="./plugins/plugins.js"></script></body>`
);

fs.writeFileSync(indexHTMLPath, indexContent, "utf-8");
