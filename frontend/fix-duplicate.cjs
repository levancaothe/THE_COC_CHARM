// const fs = require('fs');
// const path = require('path');

// const filePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
// let content = fs.readFileSync(filePath, 'utf8');

// // Find and remove the duplicate OrderDetailModal function
// const lines = content.split('\n');
// let startLine = -1;
// let endLine = -1;
// let braceCount = 0;
// let inFunction = false;

// for (let i = 0; i < lines.length; i++) {
//   const line = lines[i];
  
//   // Find start of OrderDetailModal function (not the import)
//   if (line.match(/^function OrderDetailModal/)) {
//     startLine = i;
//     inFunction = true;
//     braceCount = 0;
//   }
  
//   if (inFunction) {
//     // Count braces
//     for (const char of line) {
//       if (char === '{') braceCount++;
//       if (char === '}') braceCount--;
//     }
    
//     // When braces balance, we've found the end
//     if (braceCount === 0 && startLine !== i) {
//       endLine = i;
//       break;
//     }
//   }
// }

// if (startLine !== -1 && endLine !== -1) {
//   console.log(`Found OrderDetailModal function from line ${startLine + 1} to ${endLine + 1}`);
  
//   // Remove the function
//   lines.splice(startLine, endLine - startLine + 1);
  
//   // Write back
//   fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
//   console.log('✅ Removed duplicate OrderDetailModal function');
// } else {
//   console.log('❌ Could not find OrderDetailModal function to remove');
// }
