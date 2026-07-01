const { ESLint } = require("eslint");

async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(["."]);
  
  const summary = [];
  for (const file of results) {
    const errors = file.messages.filter(m => m.severity === 2);
    if (errors.length > 0) {
      summary.push({
        file: file.filePath,
        errors: errors.map(e => ({
          line: e.line,
          rule: e.ruleId,
          message: e.message
        }))
      });
    }
  }
  
  require('fs').writeFileSync('eslint_summary.json', JSON.stringify(summary, null, 2));
  console.log("Done. Errors:", summary.reduce((acc, f) => acc + f.errors.length, 0));
}

main().catch(console.error);
