const markdownIt = require("markdown-it")
const highlightCode = require("./highlightCode")

let markdown = markdownIt({highlight: highlightCode, langPrefix: 'lang-', html: true})
markdown.use(require("markdown-it-anchor"), {
  slugify: s => s.toLowerCase().replace(/\W/g, '-').replace(/-+/g, '-')
});
module.exports = markdown.render.bind(markdown)
