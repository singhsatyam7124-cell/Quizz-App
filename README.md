# WebDev Quiz

An interactive multiple-choice quiz that runs fully in the browser. It asks 12 questions on HTML, CSS and JavaScript, keeps score, and shows a result screen with a review of every answer. Built with plain HTML, CSS and JavaScript, with no frameworks or libraries.

This project was made for the **JavaScript Quiz App** assignment in the Web Development subject.

## How to run

1. Download or clone the project and keep the three files in the same folder.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).

No installation, build step or internet connection is needed. If you are offline, the page uses system fonts instead of the Google Fonts it normally loads.

## Project structure

```
quiz/
├── index.html   Page structure: start, quiz and result screens
├── style.css    Styling, light and dark themes, responsive layout
├── script.js    Questions data and all quiz logic
└── README.md    This file
```

## Features

### Required

- **Question data in an array of objects.** Each object has `question`, `options` and `answer`. Questions are rendered by JavaScript, not written in the HTML.
- **One question at a time** with clickable option buttons.
- **Right/wrong feedback.** The chosen answer turns green or red, and the correct answer is always highlighted. Buttons are disabled after answering so a question cannot be scored twice.
- **Question counter and progress bar** ("Question 3 of 12").
- **Result screen** with score, percentage and a message based on how well you did.
- **Review list** showing each question, your answer and the correct answer.
- **Restart button** to play again.
- **Responsive layout** that works on phones and desktops.

### Extra

- **Dark / Light mode toggle.** The choice is saved in `localStorage` and restored on the next visit. On the first visit it follows the system theme.
- **Countdown timer.** Each question has 20 seconds. When time runs out, the correct answer is shown and the quiz moves to the next question.
- **Best score.** Saved in `localStorage` and shown on the start screen.
- **Keyboard shortcuts.** Press `1`–`4` to choose an option and `Enter` for the next question.
- **Shuffling.** Questions and their options are shuffled every time the quiz starts.

## Result messages

| Score | Message |
| --- | --- |
| 100% | Perfect score. Flawless. |
| 80% to 99% | Great job! |
| 50% to 79% | Good effort. A little more practice and you're there. |
| Below 50% | Try again. You'll do better next time. |

## How the code works

State is kept in a few variables in `script.js`:

| Variable | Purpose |
| --- | --- |
| `questions` | The shuffled copy of the questions for the current game |
| `currentIndex` | Which question is being shown |
| `score` | Number of correct answers so far |
| `answers` | What the user picked for each question (used by the review list) |
| `locked` | `true` once the current question is answered |

Main functions:

| Function | What it does |
| --- | --- |
| `startQuiz()` | Shuffles the questions and options, resets the state and starts the first question |
| `showQuestion()` | Draws the current question and creates the option buttons with `createElement` |
| `checkAnswer(chosen)` | Compares the choice with the correct answer, updates the score and colours the buttons |
| `goNext()` | Moves to the next question, or to the result screen after the last one |
| `showResult()` | Calculates the percentage, picks the message, saves the best score and builds the review list |
| `shuffle(list)` | Returns a shuffled copy of an array (Fisher-Yates) |
| `getPercent(correct, total)` | Returns the score as a percentage |
| `getMessage(percent)` | Returns the result message for a percentage |

## Concepts practised

Variables and constants, data types, operators, conditionals, loops, functions (including arrow functions, parameters and return values), arrays and objects, DOM selection and modification, creating elements dynamically, event listeners, `setInterval` timers, and `localStorage`.

## Customising the quiz

To change the topic, edit only the `QUESTIONS` array at the top of `script.js`. Each question needs this shape:

```js
{
  question: "Your question text?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  answer: "Option B"   // must match one of the options exactly
}
```

The quiz needs at least 10 questions to meet the assignment requirement, and every question should have 2 to 4 options so the keyboard shortcuts work. To change the time per question, edit `TIME_PER_QUESTION` in `script.js`.

## Browser support

Works in current versions of Chrome, Edge, Firefox and Safari.

## Author

Add your name, roll number and class here.
