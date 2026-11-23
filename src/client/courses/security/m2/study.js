// Reading-first material for security module 2 (web security): summary, study notes and key terms.
export default {
summary: {
  big: `<p>A web application spreads across several interpreters: the <b>browser</b> parses HTML and runs JavaScript, the <b>web server</b> runs server-side code such as PHP, and that code sends <b>SQL</b> to a database. Each of them treats some characters as instructions. Most web attacks work by getting <b>user data mistaken for code</b> by one of these interpreters.</p>
  <p><b>SQL injection</b> lets input change a database query, so an attacker can read or change data they shouldn't. <b>Cross-site scripting (XSS)</b> gets the attacker's script served from the target site, so it runs with that site's rights in other users' browsers. <b>Cross-site request forgery (CSRF)</b> doesn't inject code at all: it abuses the browser's habit of attaching cookies to every request to a site.</p>
  <p>The defences follow from the causes: <b>prepared statements</b> keep SQL code and data apart, <b>output encoding</b> and a <b>Content Security Policy</b> keep data from becoming script, <b>anti-CSRF tokens</b> and <b>SameSite</b> cookies prove a request was intended, and <b>input validation</b>, <b>least privilege</b> and cookie flags limit the damage when something slips through.</p>`,
  takeaways: [
    "HTTP is stateless; a <b>session ID in a cookie</b> identifies the logged-in user, so whoever holds it <i>is</i> that user until the session ends.",
    "The <b>same-origin policy</b> stops scripts from one origin (scheme + host + port) reading another's data. XSS gets around it by running inside the target's origin.",
    "<b>SQL injection</b>: input joined into query text changes the query's meaning. It threatens confidentiality (reading data), integrity (changing it) and sometimes availability.",
    "The book classifies SQL injection as <b>in-band</b> (tautology, end-of-line comment, piggybacked queries), <b>inferential</b> (illegal queries, blind injection) and <b>out-of-band</b>.",
    "<b>Prepared statements</b> compile the query first and bind data afterwards, so data can never alter the structure. This is the fix in Lab 2's final task.",
    "<b>Stored XSS</b> is saved on the server and hits every visitor; <b>reflected XSS</b> comes back from a single crafted request. Both are fixed by <b>encoding output</b> for its context.",
    "<b>CSRF</b>: another page makes the victim's browser send a request; the cookie goes with it. Defend with <b>secret tokens</b> in forms, <b>SameSite</b> cookies, and never changing state with GET.",
    "Cookie flags: <b>HttpOnly</b> (scripts can't read it), <b>Secure</b> (HTTPS only), <b>SameSite</b> (not sent on cross-site requests).",
    "Validate input with a <b>whitelist</b> of what is allowed, after <b>canonicalising</b> alternative encodings; blacklists miss new tricks.",
    "Defence in depth: <b>least-privilege</b> database accounts, no detailed error messages to users, HTTPS everywhere, and a <b>CSP</b> that forbids inline scripts.",
  ],
  formulas: [
    ["origin = scheme + host + port", "Two URLs share an origin only if all three match. Scripts can read data only from their own origin.", "Deciding whether one page's script can read another page.",
      [["scheme", "http or https"], ["host", "e.g. www.example.com"], ["port", "e.g. 443"]]],
    ["prepare(\"… WHERE name = ?\") → bind(value) → execute", "Prepared statement: the query structure is fixed before the data arrives.", "Fixing any query that contains user input.",
      [["?", "placeholder for a value; never part of the SQL code"]]],
    ["&lt; → &amp;lt;,&nbsp; &gt; → &amp;gt;,&nbsp; \" → &amp;quot;,&nbsp; ' → &amp;#39;,&nbsp; &amp; → &amp;amp;", "HTML output encoding (PHP: htmlspecialchars).", "Writing user data into an HTML page.",
      [["&amp;lt;", "shown as &lt; but never starts a tag"]]],
  ],
  traps: [
    "Thinking HTTPS stops SQL injection or XSS: it protects data in transit, not how the server interprets it.",
    "Fixing SQL injection by blacklisting quote characters: numeric fields need no quotes, and encodings slip past filters. Use prepared statements.",
    "Confusing XSS and CSRF: XSS runs the attacker's script in the victim's browser on the target site; CSRF only makes the browser send a request, with no script on the target.",
    "Believing POST alone stops CSRF: another page can submit a POST form too. Use a secret token or SameSite cookies.",
    "Assuming validating input once on the way in is enough: data stored earlier can be used unsafely later (second-order injection). Every query must treat its inputs as data.",
    "Thinking HttpOnly prevents XSS: it only stops the script reading that cookie; the script can still act as the user.",
  ],
},
notes: [
{id: "web", title: "How a web application works", ref: "Lecture 4",
 gist: "Browser, HTTP, server-side code and a database: several interpreters, each with its own idea of what is code.",
 body: `<p>The lecture's whiteboard sketch: a page is <b>HTML</b> for structure, <b>CSS</b> style sheets for appearance, and <b>JavaScript</b> (no relation to Java), a client-side scripting language that runs in the browser. Pages also load external content: images, scripts from other servers, adverts.</p>
 <p>The browser talks to the server with <b>HTTP</b>: <b>GET</b> requests carry parameters in the URL (<code>/page.php?name=value</code>), <b>POST</b> requests carry them in the body. The server runs code (PHP in the SEED lab) that typically queries a database and builds the HTML it sends back.</p>
 <p><b>Cookies and sessions.</b> HTTP is stateless: each request stands alone. After you log in, the server creates a session and sends a <b>cookie</b> with a session ID; the browser then attaches it to every request to that site, for as long as the cookie lives (the whiteboard's “30 days”). Whoever presents the cookie is treated as you.</p>
 <p><b>Same-origin policy.</b> A script may read data only from its own <b>origin</b> (scheme, host and port). That is what normally stops a page on one site reading your bank's pages. Web attacks either get code into the target's own origin (XSS) or use requests the browser sends anyway (CSRF).</p>`},
{id: "threats", title: "Threats to web applications", ref: "Lecture 4 · §11.2 · pp. 384–386",
 gist: "Web applications are exposed to anyone, built quickly, and pass untrusted input to powerful interpreters.",
 body: `<p>A web application is reachable by the whole Internet, often written in scripting languages, and handles valuable data. The book's Chapter 11 puts the central problem plainly: <b>all input is untrusted</b>, and failing to check how it will be interpreted causes <b>injection attacks</b>.</p>
 <ul>
 <li><b>Confidentiality</b>: reading other users' records, stealing session cookies.</li>
 <li><b>Integrity</b>: changing data (salaries, passwords in the lab), defacing pages, making transactions in the user's name.</li>
 <li><b>Availability</b>: deleting data or overloading the database.</li>
 </ul>
 <p>Injection appears wherever input is passed to an interpreter: the database (SQL injection), the shell (<b>command injection</b>), the program itself (code injection), and other users' browsers (XSS).</p>`},
{id: "sqli", title: "SQL injection", ref: "§5.4 · pp. 177–181",
 gist: "If a query is built by joining strings, input can change its structure. The database then runs a different query from the one the developer wrote.",
 body: `<p>A typical vulnerable page reads fields from a form and <b>joins them into the text</b> of an SQL query, for example a login check that selects the row whose name and password hash match. The database receives one string and cannot tell which parts the developer wrote and which came from the user.</p>
 <p>If the input contains characters that are meaningful in SQL (quotes that end a string, comment markers, keywords), it can end the intended data early and add conditions or clauses of its own. The query still runs, but now it means something else: it may return rows it shouldn't, skip a check, or update more rows than intended.</p>
 <p><b>What the lab shows</b> (without the specific inputs, which the lab sheet walks through): the login page can be made to accept a user without the password check, the same works from the command line where special characters must be URL-encoded, and the profile-update page can be made to change columns the form never offered. The server refuses to run a second statement in the same request because PHP's <code>mysqli::query()</code> executes only one.</p>
 <p><b>Avenues</b> (book): user input in forms and URLs; server variables such as HTTP headers that get logged to the database; <b>second-order injection</b>, where data stored earlier is later used unsafely; and cookies.</p>`},
{id: "sqltypes", title: "Kinds of SQL injection", ref: "§5.4 · pp. 179–181",
 gist: "In-band attacks get results through the normal page, inferential ones deduce them from behaviour, out-of-band ones send them elsewhere.",
 body: `<ul>
 <li><b>In-band</b>: the same channel carries the attack and the results.
  <ul><li><b>Tautology</b>: inject a condition that is always true, so a WHERE clause matches every row.</li>
  <li><b>End-of-line comment</b>: comment out the rest of the intended query, removing the conditions after the input.</li>
  <li><b>Piggybacked queries</b>: add whole extra statements; needs a server that accepts several statements per call.</li>
  <li><b>UNION queries</b> (also in-band): append a second SELECT whose rows come back with the real ones.</li></ul></li>
 <li><b>Inferential</b>: no data is returned directly.
  <ul><li><b>Illegal/logically incorrect queries</b>: provoke error messages that reveal table and column names, as a first information-gathering step.</li>
  <li><b>Blind SQL injection</b>: ask the database true/false questions and watch the page's behaviour or response time.</li></ul></li>
 <li><b>Out-of-band</b>: the data leaves through another channel such as e-mail or DNS, useful when responses show nothing.</li>
 </ul>
 <p><b>Countermeasures</b> in the book: <b>defensive coding</b> (manual checks, <b>parameterised query insertion</b>, SQL DOM), <b>detection</b> (signature-based, anomaly-based, code analysis) and <b>run-time prevention</b> (checking queries against a model of legitimate ones).</p>`},
{id: "xss", title: "Cross-site scripting (XSS)", ref: "§11.2 · pp. 392–394",
 gist: "Input from one user is shown to another without encoding, so the browser runs it as the site's own script.",
 body: `<p>XSS happens when input supplied by one user is later included in a page shown to another user, and the browser interprets it as HTML or script. Because the script arrives from the target site, it runs in that site's <b>origin</b>, with all the rights of the site's own code.</p>
 <ul>
 <li><b>Stored (persistent) XSS</b>: the input is saved, for example in a forum post or profile field, and served to everyone who views it. The book's example is a guestbook comment.</li>
 <li><b>Reflected XSS</b>: the input travels in a request, typically a crafted link, and the response copies it straight back, as with a search page that repeats your search term.</li>
 <li><b>DOM-based XSS</b>: the page's own JavaScript writes untrusted data into the page.</li>
 </ul>
 <p>A successful script can read the page (and any cookie not marked HttpOnly), send requests as the user, change what the user sees, or redirect them. The book's term “XSS reflection vulnerability” covers both main kinds: content is “reflected” to other users.</p>
 <p><b>Defences</b> (the whiteboard's list): <b>filter</b> input, <b>encode</b> output for its context (HTML body, attribute, JavaScript, URL), and a <b>Content Security Policy</b> header that tells the browser which script sources to trust, so injected inline scripts don't run. Mark session cookies <b>HttpOnly</b>.</p>`},
{id: "csrf", title: "Cross-site request forgery (CSRF)", ref: "Lecture 4",
 gist: "Another site makes the victim's browser send a request; the browser adds the session cookie, so the server thinks the victim meant it.",
 body: `<p>The whiteboard example: a bank whose money-transfer page takes its parameters in a <b>GET</b> URL, and a user who stays logged in (a session cookie valid for 30 days). Any other page the user visits can make the browser request that URL, for instance by loading it as an image. The browser attaches the bank's cookie automatically, and the bank sees a properly authenticated request.</p>
 <p>The attacker never sees the cookie or the response; they only need the request to happen. That is the difference from XSS, where the attacker's script runs inside the target site.</p>
 <p><b>Defences</b>:</p>
 <ul>
 <li>A <b>secret token</b> in every form, tied to the session and checked by the server. Other origins can't read it (same-origin policy), so they can't forge a valid request.</li>
 <li><b>SameSite</b> cookies, which the browser doesn't send on cross-site requests.</li>
 <li>Never change state with GET. POST alone is not enough, since other sites can submit forms, but it removes the easiest route.</li>
 <li>Re-authentication for sensitive actions, and short session lifetimes.</li>
 </ul>`},
{id: "defence", title: "Defending web applications", ref: "§5.4, §11.2 · pp. 181–183, 388–395",
 gist: "Keep data separate from code at every interpreter, validate what comes in, encode what goes out, and limit the damage.",
 body: `<ol>
 <li><b>Prepared statements</b> (parameterised queries) for every SQL query that includes input. In PHP with mysqli: <code>$stmt = $conn-&gt;prepare("SELECT … WHERE name = ? AND Password = ?")</code>, then <code>$stmt-&gt;bind_param("ss", $name, $hash)</code> and <code>$stmt-&gt;execute()</code>. The SQL is compiled first; the values are sent as pure data.</li>
 <li><b>Input validation</b> by <b>whitelisting</b>: accept only input that matches what is expected (digits for an ID, a list of allowed values), after <b>canonicalisation</b> to one standard encoding. Blacklisting known-bad input misses new tricks.</li>
 <li><b>Output encoding</b> for the context the data lands in (HTML-escape with <code>htmlspecialchars</code>, and so on).</li>
 <li><b>Content Security Policy</b>: a response header listing trusted script sources; forbids inline scripts.</li>
 <li><b>Cookie flags</b>: <b>Secure</b>, <b>HttpOnly</b>, <b>SameSite</b>; HTTPS everywhere.</li>
 <li><b>Anti-CSRF tokens</b> in state-changing forms.</li>
 <li><b>Least privilege</b>: the database account should only allow what each page needs. Don't show detailed error messages to users; log them instead.</li>
 <li><b>Detection</b>: web application firewalls and anomaly detection as an extra layer, never as the only fix.</li>
 </ol>`},
],
glossary: [
  ["HTTP GET / POST", "Request methods: parameters in the URL / in the request body."],
  ["Cookie", "Small value the server asks the browser to store and send back with every request to that site."],
  ["Session", "Server-side state for a logged-in user, identified by a session ID in a cookie."],
  ["Origin", "Scheme + host + port of a URL."],
  ["Same-origin policy", "Browser rule: scripts can read data only from their own origin."],
  ["Injection attack", "Input is interpreted as code by some interpreter (SQL, shell, browser, the program itself)."],
  ["SQL injection", "Input changes the structure of a database query built from strings."],
  ["Tautology", "Injected always-true condition (in-band SQL injection)."],
  ["End-of-line comment", "Injected comment that removes the rest of the intended query."],
  ["Piggybacked query", "Extra statement appended to the intended one."],
  ["UNION query", "Extra SELECT whose rows are returned with the real ones."],
  ["Blind SQL injection", "Inferring data from true/false behaviour or timing when nothing is displayed."],
  ["Second-order injection", "Stored data later used unsafely in another query."],
  ["Prepared statement", "Query compiled with placeholders; values bound afterwards as data."],
  ["Command injection", "Input passed to a shell command runs extra commands."],
  ["Cross-site scripting (XSS)", "Attacker's script served from the target site runs in other users' browsers."],
  ["Stored / reflected / DOM-based XSS", "Saved on the server / echoed from a request / written by the page's own script."],
  ["CSRF", "Cross-site request forgery: another page makes the victim's browser send an authenticated request."],
  ["Anti-CSRF token", "Secret per-session value in forms that other origins can't read."],
  ["HttpOnly / Secure / SameSite", "Cookie flags: hidden from scripts / HTTPS only / not sent cross-site."],
  ["Content Security Policy", "Response header listing trusted script sources; blocks inline scripts."],
  ["Whitelisting / blacklisting", "Accepting only known-good input / rejecting known-bad input."],
  ["Canonicalisation", "Converting alternative encodings of input to one standard form before checking it."],
  ["Output encoding", "Escaping data for the context where it is written (e.g. HTML)."],
],
};
