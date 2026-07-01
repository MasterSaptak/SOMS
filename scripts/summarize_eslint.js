const fs = require('fs');

try {
  let content = fs.readFileSync('./eslint_report.json');
  // Handle UTF-16 LE BOM
  if (content[0] === 0xFF && content[1] === 0xFE) {
    content = content.toString('utf16le');
  } else {
    content = content.toString('utf8');
  }
  
  const data = JSON.parse(content);
  const summary = [];

  for (const file of data) {
    const errors = file.messages.filter(m => m.severity === 2); // 2 is error
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
  
  console.log(JSON.stringify(summary, null, 2));
} catch (e) {
  console.error(e);
}
