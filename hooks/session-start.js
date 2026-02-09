const fs = require('fs');
const path = require('path');
const os = require('os');

// Determine plugin root directory
const pluginRoot = path.resolve(__dirname, '..');

// Check if legacy skills directory exists and build warning
let warningMessage = '';
const legacySkillsDir = path.join(os.homedir(), '.config', 'superpowers', 'skills');
if (fs.existsSync(legacySkillsDir)) {
  warningMessage = '\n\n<important-reminder>IN YOUR FIRST REPLY AFTER SEEING THIS MESSAGE YOU MUST TELL THE USER:⚠️ **WARNING:** Superpowers now uses Claude Code\'s skills system. Custom skills in ~/.config/superpowers/skills will not be read. Move custom skills to ~/.claude/skills instead. To make this message go away, remove ~/.config/superpowers/skills</important-reminder>';
}

// Read using-superpowers content
const usingSuperpowersPath = path.join(pluginRoot, 'skills', 'using-superpowers', 'SKILL.md');
let usingSuperpowersContent = '';
try {
  usingSuperpowersContent = fs.readFileSync(usingSuperpowersPath, 'utf8');
} catch (e) {
  usingSuperpowersContent = 'Error reading using-superpowers skill: ' + e.message;
}

// Escape string for JSON embedding
function escapeForJson(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

const usingSuperpowersEscaped = escapeForJson(usingSuperpowersContent);
const warningEscaped = escapeForJson(warningMessage);

// Output context injection as JSON
const output = {
  systemMessage: "using-superpowers skill injected",
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: `<EXTREMELY_IMPORTANT>\nYou have superpowers.\n\n**Below is the full content of your 'superpowers:using-superpowers' skill - your introduction to using skills. For all other skills, use the 'Skill' tool:**\n\n${usingSuperpowersEscaped}\n\n${warningEscaped}\n</EXTREMELY_IMPORTANT>\n\n`
  }
};

console.log(JSON.stringify(output, null, 2));
