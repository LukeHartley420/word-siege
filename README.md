# Word Siege

A browser-based speed typing game with a twist: instead of typing a fixed paragraph, enemy words march toward your gate and you destroy them by typing them. Built with plain HTML, CSS and JavaScript (canvas), no libraries.

## How to play
- Press **Enter** to start.
- Type a word to destroy it. The word closest to the gate that matches your typing is targeted.
- A wrong key resets your combo. Backspace deletes a letter.
- Words that reach the gate cost 1 gate point (5 total).
- Every 10 words destroyed starts a new wave: more words, faster, longer.
- Combos multiply your score. Your best score is saved in the browser.

## Run it
Open `index.html` in a browser, or host it with GitHub Pages.

## What I practised
The game loop with `requestAnimationFrame`, delta time for consistent speed, canvas drawing, keyboard events, game state management, simple particle effects and `localStorage`.

## Ideas for next steps
- Sound effects
- Power-ups (freeze, bomb)
- Mobile support with an on-screen input
- Word lists loaded from a JSON file
