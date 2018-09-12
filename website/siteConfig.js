/* List of projects/orgs using your project for the users page */
const users = [];
// https://coolors.co/7400ba-2f242c-4c5454-ff715b-ffffff
const siteConfig = {
  title: "Fragmentum" /* title for your website */,
  tagline: "A next-generation query builder for node.js",
  url: "https://nlincoln.github.io/" /* your website url */,
  baseUrl: "/fragmentum/" /* base url for your project */,
  headerLinks: [
    { doc: "installation", label: "Docs" },
    { doc: "api-reference", label: "API" },
    { page: "help", label: "Help" },
    { blog: true, label: "Blog" }
  ],
  users,
  /* path to images for header/footer */
  headerIcon: null,
  footerIcon: null,
  favicon: null,
  /* colors for website */
  colors: {
    primaryColor: "#7400BA",
    secondaryColor: "#4C5454"
  },
  /* custom fonts for website */
  /*fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },*/
  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright: "Copyright © " + new Date().getFullYear() + " Nathan Lincoln",
  organizationName: "NLincoln", // or set an env variable ORGANIZATION_NAME
  projectName: "fragmentum", // or set an env variable PROJECT_NAME
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: "default"
  },
  scripts: ["https://buttons.github.io/buttons.js"],
  // You may provide arbitrary config keys to be used as needed by your template.
  repoUrl: "https://github.com/NLincoln/fragmentum"
};

module.exports = siteConfig;
