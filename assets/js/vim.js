// Terminal Input Handler
class TerminalInput {
  constructor(inputId, wrapperId, onEnter) {
    this.input = document.getElementById(inputId);
    this.wrapper = document.getElementById(wrapperId);
    this.onEnter = onEnter;
    this.value = '';
    this.cursorPos = 0;

    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    // Focus on wrapper click
    this.wrapper.addEventListener('click', () => {
      this.input.focus();
    });

    // Keep input focused
    this.input.addEventListener('blur', () => {
      setTimeout(() => this.input.focus(), 0);
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (this.onEnter) {
          this.onEnter(this.value);
        }
        this.value = '';
        this.cursorPos = 0;
        this.render();
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        if (this.cursorPos > 0) {
          this.value = this.value.slice(0, this.cursorPos - 1) + this.value.slice(this.cursorPos);
          this.cursorPos--;
          this.render();
        }
        e.preventDefault();
      } else if (e.key === 'Delete') {
        if (this.cursorPos < this.value.length) {
          this.value = this.value.slice(0, this.cursorPos) + this.value.slice(this.cursorPos + 1);
          this.render();
        }
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        this.cursorPos = Math.max(0, this.cursorPos - 1);
        this.render();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        this.cursorPos = Math.min(this.value.length, this.cursorPos + 1);
        this.render();
        e.preventDefault();
      } else if (e.key === 'Home') {
        this.cursorPos = 0;
        this.render();
        e.preventDefault();
      } else if (e.key === 'End') {
        this.cursorPos = this.value.length;
        this.render();
        e.preventDefault();
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        this.value = this.value.slice(0, this.cursorPos) + e.key + this.value.slice(this.cursorPos);
        this.cursorPos++;
        this.render();
        e.preventDefault();
      }
    });

    this.input.focus();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    let html = '';
    const text = this.value || '';

    for (let i = 0; i < text.length; i++) {
      const char = this.escapeHtml(text[i]);
      if (i === this.cursorPos) {
        html += `<span class="terminal-cursor">${char === ' ' ? '&nbsp;' : char}</span>`;
      } else {
        html += char;
      }
    }

    // Cursor at end
    if (this.cursorPos >= text.length) {
      html += '<span class="terminal-cursor">&nbsp;</span>';
    }

    this.wrapper.innerHTML = html || '<span class="terminal-cursor">&nbsp;</span>';
  }

  focus() {
    this.input.focus();
  }

  clear() {
    this.value = '';
    this.cursorPos = 0;
    this.render();
  }
}

// Vim Editor State
class VimEditor {
constructor(contentId, statusModeId, statusPosId, onQuit) {
    this.content = document.getElementById(contentId);
    this.statusMode = document.getElementById(statusModeId);
    this.statusPos = document.getElementById(statusPosId);
    this.onQuit = onQuit; // Callback for :q and :wq

    // Find line numbers element (replace -level or -sandbox with -line-numbers-level or -line-numbers-sandbox)
    const lineNumbersId = contentId.replace('vim-content', 'vim-line-numbers');
    this.lineNumbers = document.getElementById(lineNumbersId);

    this.mode = 'normal'; // 'normal', 'insert', 'command'
    this.lines = [''];
    this.cursorRow = 0;
    this.cursorCol = 0;
    this.clipboard = '';
    this.deleteBuffer = '';
    this.commandBuffer = '';
    this.commandInput = '';
    this.undoStack = [];
    this.redoStack = [];

    this.setupEventListeners();
    this.render();
}

setupEventListeners() {
    this.content.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.content.focus();
}

handleKeyDown(e) {
    e.preventDefault();

    // Save state for undo (except for command mode)
    if (this.mode !== 'command') {
    this.saveState();
    }

    if (this.mode === 'normal') {
    this.handleNormalMode(e);
    } else if (this.mode === 'insert') {
    this.handleInsertMode(e);
    } else if (this.mode === 'command') {
    this.handleCommandMode(e);
    }

    this.render();
}

handleNormalMode(e) {
    const key = e.key;

    // Command mode
    if (key === ':') {
    this.mode = 'command';
    this.commandInput = ':';
    return;
    }

    // Mode switching
    if (key === 'i') {
    this.mode = 'insert';
    return;
    }
    if (key === 'a') {
    this.mode = 'insert';
    this.cursorCol = Math.min(this.cursorCol + 1, this.lines[this.cursorRow].length);
    return;
    }
    if (key === 'A') {
    this.mode = 'insert';
    this.cursorCol = this.lines[this.cursorRow].length;
    return;
    }
    if (key === 'o') {
    this.mode = 'insert';
    this.lines.splice(this.cursorRow + 1, 0, '');
    this.cursorRow++;
    this.cursorCol = 0;
    return;
    }
    if (key === 'O') {
    this.mode = 'insert';
    this.lines.splice(this.cursorRow, 0, '');
    this.cursorCol = 0;
    return;
    }

    // Movement
    if (key === 'h') {
    this.cursorCol = Math.max(0, this.cursorCol - 1);
    } else if (key === 'j') {
    this.cursorRow = Math.min(this.lines.length - 1, this.cursorRow + 1);
    this.cursorCol = Math.min(this.cursorCol, this.lines[this.cursorRow].length - 1);
    this.cursorCol = Math.max(0, this.cursorCol);
    } else if (key === 'k') {
    this.cursorRow = Math.max(0, this.cursorRow - 1);
    this.cursorCol = Math.min(this.cursorCol, this.lines[this.cursorRow].length - 1);
    this.cursorCol = Math.max(0, this.cursorCol);
    } else if (key === 'l') {
    this.cursorCol = Math.min(this.lines[this.cursorRow].length - 1, this.cursorCol + 1);
    } else if (key === 'w') {
    this.moveToNextWord();
    } else if (key === 'b') {
    this.moveToPrevWord();
    } else if (key === '0') {
    this.cursorCol = 0;
    } else if (key === '$') {
    this.cursorCol = Math.max(0, this.lines[this.cursorRow].length - 1);
    } else if (key === 'G') {
    this.cursorRow = this.lines.length - 1;
    } else if (key === 'g' && this.commandBuffer === 'g') {
    this.cursorRow = 0;
    this.commandBuffer = '';
    return;
    }

    // Editing
    if (key === 'x') {
    if (this.cursorCol < this.lines[this.cursorRow].length) {
        this.lines[this.cursorRow] =
        this.lines[this.cursorRow].slice(0, this.cursorCol) +
        this.lines[this.cursorRow].slice(this.cursorCol + 1);
    }
    } else if (key === 'd' && this.commandBuffer === 'd') {
    this.deleteBuffer = this.lines[this.cursorRow];
    this.lines.splice(this.cursorRow, 1);
    if (this.lines.length === 0) this.lines = [''];
    this.cursorRow = Math.min(this.cursorRow, this.lines.length - 1);
    this.commandBuffer = '';
    return;
    } else if (key === 'y' && this.commandBuffer === 'y') {
    this.clipboard = this.lines[this.cursorRow];
    this.commandBuffer = '';
    return;
    } else if (key === 'p') {
    if (this.clipboard) {
        this.lines.splice(this.cursorRow + 1, 0, this.clipboard);
    } else if (this.deleteBuffer) {
        this.lines.splice(this.cursorRow + 1, 0, this.deleteBuffer);
    }
    } else if (key === 'u') {
    this.undo();
    return;
    } else if (key === 'r' && e.ctrlKey) {
    this.redo();
    return;
    }

    // Command buffer for multi-key commands
    if (key === 'd' || key === 'y' || key === 'g' || key === 'c') {
    this.commandBuffer = key;
    } else {
    this.commandBuffer = '';
    }
}

handleInsertMode(e) {
    const key = e.key;

    if (key === 'Escape') {
    this.mode = 'normal';
    this.cursorCol = Math.max(0, this.cursorCol - 1);
    return;
    }

    if (key === 'Backspace') {
    if (this.cursorCol > 0) {
        this.lines[this.cursorRow] =
        this.lines[this.cursorRow].slice(0, this.cursorCol - 1) +
        this.lines[this.cursorRow].slice(this.cursorCol);
        this.cursorCol--;
    } else if (this.cursorRow > 0) {
        const prevLine = this.lines[this.cursorRow - 1];
        this.lines[this.cursorRow - 1] = prevLine + this.lines[this.cursorRow];
        this.lines.splice(this.cursorRow, 1);
        this.cursorRow--;
        this.cursorCol = prevLine.length;
    }
    } else if (key === 'Enter') {
    const restOfLine = this.lines[this.cursorRow].slice(this.cursorCol);
    this.lines[this.cursorRow] = this.lines[this.cursorRow].slice(0, this.cursorCol);
    this.lines.splice(this.cursorRow + 1, 0, restOfLine);
    this.cursorRow++;
    this.cursorCol = 0;
    } else if (key.length === 1) {
    this.lines[this.cursorRow] =
        this.lines[this.cursorRow].slice(0, this.cursorCol) +
        key +
        this.lines[this.cursorRow].slice(this.cursorCol);
    this.cursorCol++;
    }
}

handleCommandMode(e) {
    const key = e.key;

    if (key === 'Escape') {
    this.mode = 'normal';
    this.commandInput = '';
    return;
    }

    if (key === 'Backspace') {
    if (this.commandInput.length > 1) {
        this.commandInput = this.commandInput.slice(0, -1);
    } else {
        this.mode = 'normal';
        this.commandInput = '';
    }
    return;
    }

    if (key === 'Enter') {
    this.executeCommand(this.commandInput);
    this.commandInput = '';
    this.mode = 'normal';
    return;
    }

    if (key.length === 1) {
    this.commandInput += key;
    }
}

executeCommand(cmd) {
    if (cmd === ':w') {
    // Save - just show a message in status
    this.statusMode.textContent = 'File saved';
    setTimeout(() => {
        if (this.mode === 'normal') {
        this.statusMode.textContent = '-- NORMAL --';
        }
    }, 2000);
    } else if (cmd === ':q' || cmd === ':quit') {
    // Quit - call the onQuit callback
    if (this.onQuit) {
        this.onQuit();
    }
    } else if (cmd === ':wq' || cmd === ':x') {
    // Save and quit
    if (this.onQuit) {
        this.onQuit();
    }
    } else {
    this.statusMode.textContent = `Unknown command: ${cmd}`;
    setTimeout(() => {
        if (this.mode === 'normal') {
        this.statusMode.textContent = '-- NORMAL --';
        }
    }, 2000);
    }
}

moveToNextWord() {
    const line = this.lines[this.cursorRow];
    let pos = this.cursorCol;

    // Skip current word
    while (pos < line.length && line[pos] !== ' ') pos++;
    // Skip spaces
    while (pos < line.length && line[pos] === ' ') pos++;

    if (pos >= line.length && this.cursorRow < this.lines.length - 1) {
    this.cursorRow++;
    this.cursorCol = 0;
    } else {
    this.cursorCol = pos;
    }
}

moveToPrevWord() {
    let pos = this.cursorCol;

    if (pos > 0) {
    pos--;
    const line = this.lines[this.cursorRow];
    // Skip spaces
    while (pos > 0 && line[pos] === ' ') pos--;
    // Skip word
    while (pos > 0 && line[pos - 1] !== ' ') pos--;
    this.cursorCol = pos;
    } else if (this.cursorRow > 0) {
    this.cursorRow--;
    this.cursorCol = Math.max(0, this.lines[this.cursorRow].length - 1);
    }
}

saveState() {
    this.undoStack.push({
    lines: JSON.parse(JSON.stringify(this.lines)),
    cursorRow: this.cursorRow,
    cursorCol: this.cursorCol,
    mode: this.mode
    });
    if (this.undoStack.length > 100) this.undoStack.shift();
    this.redoStack = [];
}

undo() {
    if (this.undoStack.length > 0) {
    const currentState = {
        lines: JSON.parse(JSON.stringify(this.lines)),
        cursorRow: this.cursorRow,
        cursorCol: this.cursorCol,
        mode: this.mode
    };
    this.redoStack.push(currentState);

    const prevState = this.undoStack.pop();
    this.lines = prevState.lines;
    this.cursorRow = prevState.cursorRow;
    this.cursorCol = prevState.cursorCol;
    this.mode = prevState.mode;
    }
}

redo() {
    if (this.redoStack.length > 0) {
    this.undoStack.push({
        lines: JSON.parse(JSON.stringify(this.lines)),
        cursorRow: this.cursorRow,
        cursorCol: this.cursorCol,
        mode: this.mode
    });

    const nextState = this.redoStack.pop();
    this.lines = nextState.lines;
    this.cursorRow = nextState.cursorRow;
    this.cursorCol = nextState.cursorCol;
    this.mode = nextState.mode;
    }
}

escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

render() {
    // Update line numbers
    if (this.lineNumbers) {
    let lineNumbersHtml = '';
    this.lines.forEach((_, idx) => {
        lineNumbersHtml += `<div>${idx + 1}</div>`;
    });
    this.lineNumbers.innerHTML = lineNumbersHtml;
    }

    // Update content with cursor
    this.content.innerHTML = '';
    this.lines.forEach((line, lineIdx) => {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'vim-line';

    const lineText = line || ' ';

    // Build line content with cursor
    if (lineIdx === this.cursorRow) {
        let lineHtml = '';
        for (let i = 0; i < lineText.length; i++) {
        const char = this.escapeHtml(lineText[i]);
        if (i === this.cursorCol) {
            lineHtml += `<span class="vim-cursor block">${char === ' ' ? '&nbsp;' : char}</span>`;
        } else {
            lineHtml += char;
        }
        }
        // Cursor at end of line
        if (this.cursorCol >= lineText.length) {
        lineHtml += '<span class="vim-cursor block">&nbsp;</span>';
        }
        lineDiv.innerHTML = lineHtml || '<span class="vim-cursor block">&nbsp;</span>';
    } else {
        lineDiv.textContent = lineText;
    }

    this.content.appendChild(lineDiv);
    });

    // Update status bar
    if (this.mode === 'command') {
    this.statusMode.textContent = this.commandInput;
    } else {
    const modeText = this.mode === 'normal' ? '-- NORMAL --' :
                        this.mode === 'insert' ? '-- INSERT --' : '-- VISUAL --';
    this.statusMode.textContent = modeText;
    }
    this.statusPos.textContent = `${this.cursorRow + 1},${this.cursorCol + 1}`;
}

getText() {
    return this.lines.join('\n');
}

setText(text) {
    this.lines = text.split('\n');
    if (this.lines.length === 0) this.lines = [''];
    this.cursorRow = 0;
    this.cursorCol = 0;
    this.mode = 'normal';
    this.render();
}

clear() {
    this.lines = [''];
    this.cursorRow = 0;
    this.cursorCol = 0;
    this.mode = 'normal';
    this.render();
}
}

// Level definitions
const levels = [
{
    id: 1,
    title: "Level 1: Insert Mode Basics",
    objective: "Write the text 'Hello, Vim!' using insert mode",
    instructions: "First, type <span class='help-key'>vim level1.txt</span> in the terminal to open vim. Then press <span class='help-key'>i</span> to enter insert mode, type the text, and press <span class='help-key'>Esc</span> to return to normal mode.",
    hint: "Type 'vim level1.txt', then press 'i' to start typing, then 'Esc' when done",
    initialText: "",
    targetText: "Hello, Vim!",
    completed: false
},
{
    id: 2,
    title: "Level 2: Navigation with hjkl",
    objective: "Move to the word 'TARGET' and delete it using x",
    instructions: "Use <span class='help-key'>h j k l</span> to move the cursor, then press <span class='help-key'>x</span> to delete characters",
    hint: "Use 'l' to move right to the target word, then use 'x' multiple times",
    initialText: "Keep this text but delete TARGET here",
    targetText: "Keep this text but delete  here",
    completed: false
},
{
    id: 3,
    title: "Level 3: Delete Line",
    objective: "Delete the second line using dd",
    instructions: "Move to the second line using <span class='help-key'>j</span>, then press <span class='help-key'>dd</span> to delete the entire line",
    hint: "Press 'j' to move down, then press 'd' twice quickly",
    initialText: "First line - keep this\nSecond line - DELETE ME\nThird line - keep this too",
    targetText: "First line - keep this\nThird line - keep this too",
    completed: false
},
{
    id: 4,
    title: "Level 4: Copy and Paste",
    objective: "Duplicate the first line using yy and p",
    instructions: "Use <span class='help-key'>yy</span> to copy the line and <span class='help-key'>p</span> to paste it below",
    hint: "Press 'y' twice to copy, then 'p' to paste",
    initialText: "Copy this line",
    targetText: "Copy this line\nCopy this line",
    completed: false
},
{
    id: 5,
    title: "Level 5: Word Navigation",
    objective: "Change the word 'old' to 'new'",
    instructions: "Use <span class='help-key'>w</span> to jump to the next word, <span class='help-key'>x</span> to delete, and <span class='help-key'>i</span> to insert",
    hint: "Navigate with 'w', delete 'old' with 'xxx', then 'i' to insert 'new'",
    initialText: "This is old text",
    targetText: "This is new text",
    completed: false
},
{
    id: 6,
    title: "Level 6: Line Ends",
    objective: "Add an exclamation mark at the end of the line",
    instructions: "Use <span class='help-key'>$</span> to jump to the end of the line, then <span class='help-key'>a</span> to append",
    hint: "Press '$' to go to the end, 'a' to append, type '!', then 'Esc'",
    initialText: "Add excitement here",
    targetText: "Add excitement here!",
    completed: false
}
];

// Initialize editors
let levelEditor = null;
let sandboxEditor = null;
let currentLevel = null;

// Tab switching
document.getElementById('levels-tab').addEventListener('click', () => {
document.getElementById('levels-mode').classList.remove('hidden');
document.getElementById('sandbox-mode').classList.add('hidden');
document.getElementById('levels-tab').classList.add('active');
document.getElementById('sandbox-tab').classList.remove('active');
});

document.getElementById('sandbox-tab').addEventListener('click', () => {
document.getElementById('levels-mode').classList.add('hidden');
document.getElementById('sandbox-mode').classList.remove('hidden');
document.getElementById('levels-tab').classList.remove('active');
document.getElementById('sandbox-tab').classList.add('active');

// Reset sandbox terminal
resetSandboxTerminal();
});

// Populate levels grid
function populateLevels() {
const grid = document.getElementById('levels-grid');
grid.innerHTML = '';

levels.forEach(level => {
    const card = document.createElement('div');
    card.className = `level-card bg-gray-100 dark:bg-gray-700 p-6 rounded-lg cursor-pointer ${level.completed ? 'level-complete' : ''}`;
    card.innerHTML = `
    <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">${level.title}</h3>
    <p class="text-gray-700 dark:text-gray-300 text-sm">${level.objective}</p>
    ${level.completed ? '<p class="text-white font-semibold mt-2">✓ Completed</p>' : ''}
    `;
    card.addEventListener('click', () => loadLevel(level));
    grid.appendChild(card);
});
}

// Load a level
function loadLevel(level) {
currentLevel = level;
document.getElementById('levels-grid').parentElement.classList.add('hidden');
document.getElementById('level-viewer').classList.remove('hidden');

document.getElementById('level-title').textContent = level.title;
document.getElementById('level-objective').textContent = level.objective;
document.getElementById('level-instructions').innerHTML = level.instructions;
document.getElementById('target-output').textContent = level.targetText;
document.getElementById('hint-box').classList.add('hidden');
document.getElementById('result-box').classList.add('hidden');

// Reset to terminal view
resetLevelTerminal(level);
}

// Reset level terminal
function resetLevelTerminal(level) {
const shellTerminal = document.getElementById('shell-terminal-level');
const vimTerminal = document.getElementById('vim-terminal-level');
const terminalOutput = document.getElementById('terminal-output-level');
const filename = document.getElementById('level-filename');

// Show terminal, hide vim
shellTerminal.classList.remove('hidden-vim');
vimTerminal.classList.add('hidden-vim');

// Set filename
filename.textContent = `level${level.id}.txt`;
terminalOutput.innerHTML = `Type 'vim level${level.id}.txt' to start editing`;

// Create new terminal input
const terminalInputLevel = new TerminalInput('terminal-input-level', 'terminal-input-wrapper-level', (command) => {
    command = command.trim();
    terminalOutput.innerHTML += `\nuser@obot:~$ ${command}`;

    if (command.startsWith('vim ')) {
        // Enter vim
        shellTerminal.classList.add('hidden-vim');
        vimTerminal.classList.remove('hidden-vim');

        if (!levelEditor) {
        levelEditor = new VimEditor('vim-content-level', 'vim-mode-level', 'vim-position-level', () => {
            // onQuit callback
            vimTerminal.classList.add('hidden-vim');
            shellTerminal.classList.remove('hidden-vim');
            terminalOutput.innerHTML += `\n`;
            terminalInputLevel.clear();
            terminalInputLevel.focus();
        });
        }
        levelEditor.setText(level.initialText);
        levelEditor.content.focus();
    } else if (command === 'clear') {
        terminalOutput.innerHTML = `Type 'vim level${level.id}.txt' to start editing`;
    } else if (command === '') {
        // Just newline
    } else {
        terminalOutput.innerHTML += `\nbash: ${command}: command not found`;
    }
});
}

// Reset sandbox terminal
function resetSandboxTerminal() {
const shellTerminal = document.getElementById('shell-terminal-sandbox');
const vimTerminal = document.getElementById('vim-terminal-sandbox');
const terminalOutput = document.getElementById('terminal-output-sandbox');

// Show terminal, hide vim
shellTerminal.classList.remove('hidden-vim');
vimTerminal.classList.add('hidden-vim');

terminalOutput.innerHTML = `Type 'vim filename.txt' to start editing (e.g., vim notes.txt)`;

// Create new terminal input
const terminalInputSandbox = new TerminalInput('terminal-input-sandbox', 'terminal-input-wrapper-sandbox', (command) => {
    command = command.trim();
    terminalOutput.innerHTML += `\nuser@obot:~$ ${command}`;

    if (command.startsWith('vim ')) {
        const filename = command.substring(4).trim();
        if (filename) {
        // Enter vim
        shellTerminal.classList.add('hidden-vim');
        vimTerminal.classList.remove('hidden-vim');

        if (!sandboxEditor) {
            sandboxEditor = new VimEditor('vim-content-sandbox', 'vim-mode-sandbox', 'vim-position-sandbox', () => {
            // onQuit callback
            vimTerminal.classList.add('hidden-vim');
            shellTerminal.classList.remove('hidden-vim');
            terminalOutput.innerHTML += `\n`;
            terminalInputSandbox.clear();
            terminalInputSandbox.focus();
            });
        } else {
            sandboxEditor.onQuit = () => {
            vimTerminal.classList.add('hidden-vim');
            shellTerminal.classList.remove('hidden-vim');
            terminalOutput.innerHTML += `\n`;
            terminalInputSandbox.clear();
            terminalInputSandbox.focus();
            };
        }
        sandboxEditor.setText('');
        sandboxEditor.content.focus();
        } else {
        terminalOutput.innerHTML += `\nvim: missing filename`;
        }
    } else if (command === 'clear') {
        terminalOutput.innerHTML = `Type 'vim filename.txt' to start editing (e.g., vim notes.txt)`;
    } else if (command === '') {
        // Just newline
    } else {
        terminalOutput.innerHTML += `\nbash: ${command}: command not found`;
    }
});
}

// Back to levels
document.getElementById('back-to-levels').addEventListener('click', () => {
document.getElementById('level-viewer').classList.add('hidden');
document.getElementById('levels-grid').parentElement.classList.remove('hidden');
resetLevelTerminal(currentLevel);
populateLevels();
});

// Check answer
document.getElementById('check-answer').addEventListener('click', () => {
if (!levelEditor) {
    const resultBox = document.getElementById('result-box');
    resultBox.className = 'mt-4 p-4 rounded bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500';
    resultBox.innerHTML = '<p class="text-yellow-900 dark:text-yellow-100">Please open vim first by typing "vim level.txt" in the terminal!</p>';
    resultBox.classList.remove('hidden');
    return;
}

const userText = levelEditor.getText();
const resultBox = document.getElementById('result-box');

if (userText === currentLevel.targetText) {
    resultBox.className = 'mt-4 p-4 rounded bg-green-100 dark:bg-green-900 border-l-4 border-green-500';
    resultBox.innerHTML = '<p class="text-green-900 dark:text-green-100 font-semibold">🎉 Correct! Level completed!</p>';
    currentLevel.completed = true;
} else {
    resultBox.className = 'mt-4 p-4 rounded bg-red-100 dark:bg-red-900 border-l-4 border-red-500';
    resultBox.innerHTML = '<p class="text-red-900 dark:text-red-100">Not quite right. Try again or check the hint!</p>';
}
resultBox.classList.remove('hidden');
});

// Reset level
document.getElementById('reset-level').addEventListener('click', () => {
resetLevelTerminal(currentLevel);
document.getElementById('hint-box').classList.add('hidden');
document.getElementById('result-box').classList.add('hidden');
});

// Show hint
document.getElementById('show-hint').addEventListener('click', () => {
document.getElementById('hint-text').textContent = currentLevel.hint;
document.getElementById('hint-box').classList.remove('hidden');
});

// Reset sandbox
document.getElementById('reset-sandbox').addEventListener('click', () => {
resetSandboxTerminal();
});

// Initialize
populateLevels();