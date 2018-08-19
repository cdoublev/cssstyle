"use strict";

const fs = require("fs");
const path = require("path");
const t = require("babel-types");
const generate = require("babel-generator").default;
const camelToDashed = require("../lib/parsers").camelToDashed;

const dahsedProperties = fs
  .readdirSync(path.resolve(__dirname, "../lib/properties"))
  .filter(propertyFile => propertyFile.substr(-3) === ".js")
  .map(propertyFile => camelToDashed(propertyFile.replace('.js', '')))

const valid_properties_out_file = fs.createWriteStream(
  path.resolve(__dirname, "../lib/validProperties.js"),
  { encoding: "utf-8" }
);
valid_properties_out_file.write("'use strict';\n\n// autogenerated\n\n");
valid_properties_out_file.write('/*\n *\n * http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSS2Properties\n */\n\n');

const validPropertiesStatements = [];
validPropertiesStatements.push(
  t.variableDeclaration("var", [
    t.variableDeclarator(
      t.identifier("validProperties"),
      t.newExpression(t.identifier("Set"), [])
    )
  ])
);

dahsedProperties.forEach(property => {
  validPropertiesStatements.push(
    t.expressionStatement(
      t.callExpression(
        t.memberExpression(
          t.identifier("validProperties"),
          t.identifier("add")
        ),
        [t.stringLiteral(property)]
      )
    )
  );
});

validPropertiesStatements.push(
  t.expressionStatement(
    t.assignmentExpression(
      "=",
      t.memberExpression(t.identifier("module"), t.identifier("exports")),
      t.identifier("validProperties")
    )
  )
);

valid_properties_out_file.write(
  generate(t.program(validPropertiesStatements)).code + "\n"
);
valid_properties_out_file.end(function(err) {
  if (err) {
    throw err;
  }
});