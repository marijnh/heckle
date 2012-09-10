(function(evalMaker) {
  var custom = {};
  exports.define = function(name, func) {custom[name] = func;};

  var escapeHTML = exports.escapeHTML = function(text) {
    var HTMLspecial = {"<": "&lt;", "&": "&amp;", "\"": "&quot;"};
    return String(text).replace(/[<&\"]/g, function(ch) {return HTMLspecial[ch];});
  };

  var myEval = evalMaker(custom, escapeHTML);

  function splitTemplate(template) {
    var parts = [];
    function addString(string) {
      if (string.length)
        parts.push(string);
    }

    while (true) {
      var open = template.search(/[\[<]\?/);
      if (open == -1) {
        addString(template);
        break;
      } else {
        var close = template.indexOf("?" + (template.charAt(open) == "<" ? ">" : "]"), open + 2);
        if (close == -1) throw new Error("'<?' without matching '?>' in template.");
        var content = template.slice(open + 2, close);
        if (/^xml\b/.test(content)) {
          addString(template.slice(0, close + 2));
        } else {
          addString(template.slice(0, open));
          var match = content.match(/^([\w\.]+)(?:\s+((?:\r|\n|.)+))?$/);
          if (!match) throw new Error("Template command ('" + content + "') does not follow 'command [arguments]' format.");
          parts.push({command: match[1], args: match[2]});
        }
        template = template.slice(close + 2);
      }
    }

    return parts;
  }

  var JSspecial = {"\"": "\\\"", "\\": "\\\\", "\f": "\\f", "\b": "\\b",
                   "\n": "\\n", "\t": "\\t", "\r": "\\r", "\v": "\\v"};
  function escapeString(text) {
    return String(text).replace(/[\"\\\f\b\n\t\r\v]/g, function(ch) {return JSspecial[ch];});
  }

  exports.bake = function bake(template, ctx) {
    var parts = splitTemplate(template);
    var func = "(function templateFunction($arg, __output){\nvar __out = __output || [];\n";
    var stack = [], match;

    while (parts.length) {
      var cur = parts.shift();
      if (typeof cur == "string") {
        func += "__out.push(\"" + escapeString(cur) + "\");\n";
        continue;
      }
      switch (cur.command) {

      case "text": case "t":
        func += "__out.push(_escapeHTML(" + cur.args + "));\n";
        break;
      case "html": case "h":
        func += "__out.push(" + cur.args + ");\n";
        break;
      case "do": case "d":
        func += cur.args + "\n";
        break;

      case "if":
        stack.push("if");
        func += "if (" + cur.args + ") {\n";
        break;
      case "elif":
        if (stack[stack.length - 1] != "if") throw new Error("'elif' without matching 'if' in template.");
        func += "} else if (" + cur.args + ") {\n";
        break;
      case "else":
        if (stack[stack.length - 1] != "if") throw new Error("'else' without matching 'if' in template.");
        func += "} else {\n";
        break;
      case "if.":
        if (stack.pop() != "if") throw new Error("'if.' without matching 'if' in template.");
        func += "}\n";
        break;

      case "for":
        stack.push("for");
        if (match = cur.args.match(/^([\w\$_]+)(?:,\s*([\w\$_]+))?\s+in\s+((?:\r|\n|.)+)$/))
          func += "_forEachIn(" + match[3] + ", function(" + match[1] + ", " +
                  (match[2] || "$dummy") + ", $i) {\n";
        else if (match = cur.args.match(/^([\w\$_]+)\s+((?:\r|\n|.)+)$/))
          func += "(" + match[2] + ").forEach(function(" + match[1] + ", $i) {\n";
        else
          throw new Error("Malformed arguments to 'for' form in template -- expected variable name followed by expression.");
        break;
      case "for.":
        if (stack.pop() != "for") throw new Error("'for.' without matching 'for' in template.");
        func += "});\n";
        break;

      default:
        func += "_dispatchCustom(\"" + escapeString(cur.command) + "\", " + (/^\s*$/.test(cur.args) ? "null" : cur.args) + ", __out);\n";
      }
    }
    if (stack.length) throw new Error("Unclosed blocks in template (" + stack.join() + ").");

    func += "return __output ? \"\" : __out.join(\"\");\n})";
    return myEval(func, ctx);
  };
})(function(_customCommands, _escapeHTML) {
  function _forEachIn(obj, f) {
    var hop = Object.prototype.hasOwnProperty, i = 0;
    for (var n in obj) if (hop.call(obj, n)) f(n, obj[n], i++);
  }
  function _dispatchCustom(name, arg, output) {
    if (!_customCommands.hasOwnProperty(name))
      throw new Error("Unrecognised template command: '" + name + "'.");
    output.push(_customCommands[name](arg, output));
  }
  return function(__code, __ctx) {
    if (__ctx) with(__ctx) { return eval(__code); }
    else return eval(__code);
  };
});
