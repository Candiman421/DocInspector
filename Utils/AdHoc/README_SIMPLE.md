AdHoc Claude Code Merger - Simple & Working
Dead simple way to merge Claude's code into your files

🚀 Quick Setup
1. Setup AdHoc Folder
bashcd Utils/AdHoc
npm install  # (no dependencies needed, just creates node_modules)
2. Fix Your DocDom Issues Right Now
bash# Generate the pre-built DocDom fix
node make-template.js docdom-fixes fix-docdom.js

# Apply all the fixes
node merge-claude.js fix-docdom.js

# Check what changed
git diff

# Verify improvements
cd .. && node main-system-analyzer.js --verbose

📋 How It Works
Step 1: Create Template
bash# For function replacement
node make-template.js replace-function core/parser.js extractRegistration

# For adding new function  
node make-template.js add-function core/parser.js extractRegistration

# For file top updates
node make-template.js file-top core/parser.js parseModuleFile

# For export updates
node make-template.js exports core/parser.js

# For simple find/replace
node make-template.js find-replace myfile.js
Step 2: Edit Template
Open the generated claude-response.js and paste Claude's code:
javascript// claude-response.js
export default {
  description: "Replace extractRegistration function",
  operations: [
    {
      action: 'REPLACE_FUNCTION',
      file: 'core/module-parser.js',
      functionName: 'extractRegistration',
      newCode: `
// PASTE CLAUDE'S ENTIRE FUNCTION HERE
const extractRegistration = (content) => {
  // Claude's enhanced function...
};`
    }
  ]
};
Step 3: Apply Changes
bashnode merge-claude.js claude-response.js
Step 4: Verify
bashgit diff  # Review changes
git add -A && git commit -m "Applied Claude updates"

🎯 Action Types
REPLACE_FUNCTION
Replaces entire function (including JSDoc):
javascript{
  action: 'REPLACE_FUNCTION',
  file: 'path/to/file.js',
  functionName: 'myFunction',
  newCode: '/* Claude\'s complete function */'
}
INSERT_AFTER / INSERT_BEFORE
Adds new function after/before existing function:
javascript{
  action: 'INSERT_AFTER',
  file: 'path/to/file.js', 
  afterFunction: 'existingFunction',
  newCode: '/* Claude\'s new function */'
}
REPLACE_FILE_TOP
Replaces from top of file down to specified function:
javascript{
  action: 'REPLACE_FILE_TOP',
  file: 'path/to/file.js',
  stopBefore: 'firstFunction', // optional
  newCode: '/* imports, headers, etc */'
}
REPLACE_EXPORTS
Replaces export statement at end of file:
javascript{
  action: 'REPLACE_EXPORTS',
  file: 'path/to/file.js',
  newCode: 'export default { func1, func2 };'
}
FIND_REPLACE
Simple find and replace:
javascript{
  action: 'FIND_REPLACE',
  file: 'path/to/file.js',
  find: 'old text',
  replace: 'new text'
}

🔥 Real Examples
Example 1: Claude Gives You Enhanced Function
bash# 1. Create template
node make-template.js replace-function core/parser.js extractRegistration

# 2. Edit claude-response.js and paste Claude's function
# 3. Apply
node merge-claude.js
Example 2: Claude Gives You New Helper Function
bash# 1. Create template  
node make-template.js add-function core/parser.js extractRegistration

# 2. Edit claude-response.js and paste Claude's new function
# 3. Apply
node merge-claude.js
Example 3: Claude Updates Imports
bash# 1. Create template
node make-template.js file-top core/parser.js parseModuleFile

# 2. Edit claude-response.js and paste Claude's import section
# 3. Apply  
node merge-claude.js
Example 4: Multiple Changes
Create a custom claude-response.js:
javascriptexport default {
  description: "Multiple updates from Claude",
  operations: [
    {
      action: 'REPLACE_FUNCTION',
      file: 'core/parser.js',
      functionName: 'extractRegistration', 
      newCode: '/* Claude\'s enhanced function */'
    },
    {
      action: 'INSERT_AFTER',
      file: 'core/parser.js',
      afterFunction: 'extractRegistration',
      newCode: '/* Claude\'s new helper function */'
    },
    {
      action: 'REPLACE_EXPORTS',
      file: 'core/parser.js', 
      newCode: 'export default { parseFile, extractRegistration, newHelper };'
    }
  ]
};

🛡️ Safety Features

Git-based workflow - No backup files, use git diff to review
Function name anchors - Reliable positioning using function names
Simple operations - Easy to understand and debug
File validation - Checks files exist before modifying


🧪 Testing Your Changes
bash# Always review first
git diff

# Test your code still works
npm test  # or your test command

# Check DocDom improvements
node main-system-analyzer.js --verbose

# Commit when satisfied
git add -A && git commit -m "Applied Claude updates"

📁 File Structure
Utils/AdHoc/
├── package.json           # Simple package file
├── merge-claude.js        # Main merger script  
├── make-template.js       # Template generator
├── README.md             # This file
└── claude-response.js    # Your response file (generated)

💡 Pro Tips

Always use git - Commit before applying changes
Review diffs - Use git diff to see what changed
Test incrementally - Apply one change at a time for complex updates
Use descriptive names - Name your response files clearly (e.g., fix-parser.js)
Keep templates - Save commonly used templates for reuse


This system is intentionally simple and focused on getting Claude's code into your files quickly and safely. No complex features, no backup systems - just reliable file merging with git as your safety net.