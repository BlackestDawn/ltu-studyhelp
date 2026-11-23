import { S2_DRILLS, S2_MCQ } from "./practice.js";
import study from "./study.js";

export default {
  id: "m2", num: 2,
  eyebrow: "Lecture 4 (self-paced) · Lab 2",
  short: "Web security",
  title: "Web security",
  blurb: "How web applications work, how insecure handling of user input lets attackers inject SQL and scripts, and how prepared statements, encoding and other defences stop them.",
  focus: "There is no quiz for this module; it prepares you for Lab 2. Everything comes back to one idea: data from the user must never be treated as code. For each attack, be able to say where the data crosses into code (the SQL parser, the browser's script engine, a request the browser sends on its own) and which defence keeps it data.",
  obj: [
    "Describe the architecture of a web application: browser, HTTP, web server, server-side code and database",
    "Explain how cookies and sessions keep users logged in, and why session cookies are valuable to attackers",
    "Identify common threats to web applications and the CIA properties they compromise",
    "Explain how SQL injection works and why building queries from user input is the root cause",
    "Classify SQL injection attacks: tautologies, end-of-line comments, piggybacked and UNION queries, and inferential (blind) attacks",
    "Explain stored and reflected cross-site scripting and what an injected script can do",
    "Explain cross-site request forgery and why it works even though the attacker never sees the cookie",
    "Choose suitable countermeasures: prepared statements, input validation, output encoding, Content Security Policy and cookie flags",
  ],
  concepts: ["HTTP GET / POST", "Cookies", "Sessions", "Same-origin policy", "SQL injection", "Tautology", "End-of-line comment", "Piggybacked query", "Blind SQL injection", "Prepared statement", "Cross-site scripting", "CSRF", "Input validation", "Output encoding", "Content Security Policy"],
  questions: [
    "Where in a web application does user input end up, and which of those places interpret it as code?",
    "How can input to a login form change what a query means, and what does the database then do differently?",
    "Why does a prepared statement stop SQL injection when escaping quotes sometimes doesn't?",
    "How can a script injected into one user's profile steal another user's session?",
    "Why does the browser attach the victim's cookie to a forged request, and what stops it?",
    "Why is whitelisting input safer than blacklisting known-bad input?",
  ],
  readNote: "(the course lists none for this module; these sections cover the same ground)",
  read: [["§5.4 SQL injection attacks", "177–183"], ["§11.2 Handling program input: injection and cross-site scripting attacks, validating input", "384–395"]],
  probs: ["Ch. 5 review questions on SQL injection", "§11.2 command-injection example (Figure 11.2)", "§11.2 XSS example (Figure 11.5)"],
  slides: ["L06 Web Security (whiteboard notes for the self-paced lecture)"],
  lab: {
    name: "Lab 2: Web security, SQL injection",
    what: "Explore a deliberately vulnerable employee-management site in the SEED VM, then fix its code with prepared statements.",
    seed: "SQL Injection Attack Lab", url: "Labs_20.04/Web/Web_SQL_Injection/",
    explain: [
      "Which part of the page's code built the query from user input, and why that is the vulnerability",
      "What your attacks changed: which rows were returned or updated, and which CIA property that breaks",
      "Why the server refused to run more than one statement per request",
      "How you rewrote the code with prepared statements, and why that removes the vulnerability rather than hiding it",
    ],
  },
  quizzes: [],
  lectures: [
    { title: "Lecture 4: Web security (self-paced)", pages: "§5.4, §11.2 (optional)", slides: "L06",
      notes: ["web", "threats", "sqli", "sqltypes", "xss", "csrf", "defence"],
      focus: "Work out, for each attack, where user data is mistaken for code. Then match each attack to its defence, and practise the SQL inputs before Lab 2.",
      takeaway: "Web attacks exploit insecure handling of user input: SQL injection turns input into database commands, XSS turns it into scripts in other users' browsers, and CSRF abuses the browser's habit of attaching cookies. Keep data separate from code with prepared statements, encoding, CSP and anti-CSRF tokens." },
  ],
  drills: S2_DRILLS, mcq: S2_MCQ,
  ...study,
};
