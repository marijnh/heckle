const {escapeHTML} = require("mold-template")
const CodeMirror = require("codemirror/addon/runmode/runmode.node.js")

module.exports = function highlightCode(code, lang) {
  if (!lang) return escapeHTML(code)
  if (!CodeMirror.modes.hasOwnProperty(lang)) {
    try { require("codemirror/mode/" + lang + "/" + lang) }
    catch(e) { console.log(e.toString()); CodeMirror.modes[lang] = false }
  }
  if (CodeMirror.modes[lang]) {
    let html = ""
    CodeMirror.runMode(code, lang, function(token, style) {
      if (style) html += "<span class=\"cm-" + style + "\">" + escapeHTML(token) + "</span>"
      else html += escapeHTML(token)
    });
    return html
  } else return escapeHTML(code)
}
