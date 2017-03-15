const marked = require("marked")
const highlightCode = require("./highlightCode")
marked.setOptions({highlight: highlightCode, gfm: true})
module.exports = marked
