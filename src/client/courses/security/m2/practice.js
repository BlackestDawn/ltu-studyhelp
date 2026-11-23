import { shuffle } from "../../../lib/util.js";
import { bankDrill } from "../../../lib/drill.js";

// Scenarios described in words: what goes wrong, which attack class it is, and the defence for its root cause.
const SCEN = [
  { s: "A search page copies the search term straight into the results page. A link with a crafted search term makes the page run script in the visitor's browser.", a: "Reflected XSS", d: "Encode output for HTML" },
  { s: "A forum saves posts and shows them to every visitor without changing them. One post contains script that runs for everyone who opens the thread.", a: "Stored XSS", d: "Encode output for HTML" },
  { s: "A page on another site makes the victim's browser send a money-transfer request to their bank. The bank accepts it because the browser sent the victim's session cookie along.", a: "CSRF", d: "Secret anti-CSRF token" },
  { s: "A login script builds its database query by joining the typed username and password into the query text.", a: "SQL injection", d: "Prepared statements" },
  { s: "A product page shows nothing extra, but whether it loads normally or with an error depends on a condition the attacker smuggled into the query, revealing data one yes/no answer at a time.", a: "Blind SQL injection", d: "Prepared statements" },
  { s: "A script passes a form field to a shell command, so extra shell syntax in the field runs extra commands on the server.", a: "Command injection", d: "Whitelist input validation" },
  { s: "A site uses plain http://, so someone on the same Wi-Fi reads the session cookie off the air and reuses it.", a: "Session hijacking", d: "HTTPS with Secure cookies" },
];
const ATTACKS = ["SQL injection", "Blind SQL injection", "Stored XSS", "Reflected XSS", "CSRF", "Command injection", "Session hijacking"];
const DEFENCES = ["Prepared statements", "Encode output for HTML", "Secret anti-CSRF token", "Whitelist input validation", "HTTPS with Secure cookies"];
const WHY = {
  "Reflected XSS": "The input comes back in the response and runs in the site's own origin. Encoding output (&lt; becomes &amp;lt;) makes the browser show it as text; a Content Security Policy that forbids inline scripts is a second layer.",
  "Stored XSS": "The script is saved on the server and served to every visitor. Encode on output; HttpOnly cookies stop it reading the session cookie; CSP limits where scripts may come from.",
  "CSRF": "The browser attaches the bank's cookie to any request to the bank, whichever page triggers it. A secret token in each form, which the other site can't read, or SameSite cookies stop it.",
  "SQL injection": "Joining input into query text lets it change the query's structure. Prepared statements compile the query first and send the data separately, so data can never become code.",
  "Blind SQL injection": "No data is shown, but behaviour leaks it bit by bit. Same root cause, same fix: prepared statements.",
  "Command injection": "The shell interprets special characters. Accept only what is known to be valid (a whitelist), or avoid the shell and pass arguments directly.",
  "Session hijacking": "The session ID is as good as the password while it is valid. Send it only over HTTPS (Secure flag), and set HttpOnly so scripts can't read it either.",
};

// Code descriptions: what is wrong and how to fix it.
const FIXES = [
  { s: "<code>$sql = \"SELECT … WHERE name='\" . $_POST['name'] . \"'\";</code> followed by <code>$conn->query($sql)</code>", a: "Use a prepared statement with a ? placeholder and bind_param" },
  { s: "<code>echo \"Welcome back, \" . $_GET['user'];</code>", a: "Encode the value with htmlspecialchars before output" },
  { s: "A form that changes the account e-mail address, accepted as a GET request with only the session cookie checked", a: "Require POST plus a per-session secret token in the form" },
  { s: "<code>system(\"ping \" . $_GET['host']);</code>", a: "Check the input against a strict whitelist (e.g. a valid hostname) and avoid the shell" },
  { s: "<code>Set-Cookie: session=…</code> with no flags, on a site that is also reachable over http://", a: "Add Secure, HttpOnly and SameSite, and redirect to HTTPS" },
];
const FIX_OPTS = FIXES.map(f => f.a);

const S2_DRILLS = [
{id:"s2scen",pages:"Lecture 4 · §5.4, §11.2",tag:"Attacks and defences",title:"Name the attack and its defence",gen(){
  const picks=shuffle(SCEN).slice(0,3);
  return{q:"<p>For each scenario, name the attack and the defence that addresses its root cause.</p>"+picks.map((x,i)=>`<p><b>${i+1}.</b> ${x.s}</p>`).join(""),
  fields:picks.flatMap((x,i)=>[{label:`${i+1}. Attack`,type:"select",opts:ATTACKS,ans:x.a},{label:`${i+1}. Best defence`,type:"select",opts:DEFENCES,ans:x.d}]),
  sol:picks.map((x,i)=>`<p><b>${i+1}. ${x.a}</b> → <b>${x.d}</b>. ${WHY[x.a]}</p>`).join("")};}},
{id:"s2fix",pages:"Lecture 4 countermeasures · §11.2 validating input",tag:"Code review",title:"Fix the vulnerable code",gen(){
  const picks=shuffle(FIXES).slice(0,3);
  return{q:"<p>Each line comes from a PHP web application. Pick the fix that removes the vulnerability.</p>"+picks.map((x,i)=>`<p><b>${i+1}.</b> ${x.s}</p>`).join(""),
  fields:picks.map((x,i)=>({label:`${i+1}. Fix`,type:"select",opts:FIX_OPTS,ans:x.a})),
  sol:`<p>The common thread: never let user data be read as code by the next interpreter in line (SQL parser, HTML parser, shell), and never let the browser's automatic cookies be the only proof that a request is intended.</p>`+picks.map((x,i)=>`<p><b>${i+1}.</b> ${x.a}.</p>`).join("")};}},
{id:"s2sqlclass",pages:"§5.4 SQL injection attack avenues and types",fixed:true,tag:"SQL injection · classification",title:"How SQL injection is classified",gen:bankDrill([
  {label:"Injected condition that makes a WHERE clause true for every row",type:"select",opts:["Tautology","Piggybacked query","Union query","Out-of-band attack"],ans:"Tautology",short:"Tautology:",why:"an in-band attack: the data comes back through the normal page."},
  {label:"Using a comment to make the database ignore the rest of the intended query",type:"select",opts:["End-of-line comment","Tautology","Blind injection","Union query"],ans:"End-of-line comment",short:"End-of-line comment:",why:"in-band; it removes conditions the developer wrote after the input."},
  {label:"Adding a whole extra statement after the intended one",type:"select",opts:["Piggybacked query","Tautology","Inference","Illegal query"],ans:"Piggybacked query",short:"Piggybacked:",why:"only works if the server accepts several statements per call; PHP's mysqli query() does not, which is why it fails in the lab."},
  {label:"Deliberately causing database errors to learn table names and types",type:"select",opts:["Illegal/logically incorrect queries","Union query","Out-of-band attack","Tautology"],ans:"Illegal/logically incorrect queries",short:"Inferential:",why:"a preliminary information-gathering step; detailed error messages help the attacker, so production sites should hide them."},
  {label:"Learning data from yes/no page behaviour when nothing is displayed",type:"select",opts:["Blind SQL injection","Union query","Piggybacked query","Tautology"],ans:"Blind SQL injection",short:"Blind:",why:"inferential; it is slow but works even on sites that show no errors."},
  {label:"Getting the data sent out by another channel, such as e-mail or DNS",type:"select",opts:["Out-of-band attack","In-band attack","Tautology","End-of-line comment"],ans:"Out-of-band attack",short:"Out-of-band:",why:"used when the response itself carries no useful information."},
  {label:"Main input avenue for SQL injection in web applications",type:"select",opts:["User input in forms and URLs","Server log files","The TLS handshake","DNS replies"],ans:"User input in forms and URLs",short:"Avenues:",why:"the book also lists server variables (headers), second-order injection (data stored earlier) and cookies."},
  {label:"Injection where data stored safely earlier is later used unsafely in another query",type:"select",opts:["Second-order injection","Blind injection","Tautology","Union query"],ans:"Second-order injection",short:"Second-order:",why:"validating input only on the way in is not enough; every query must treat its inputs as data."},
],5)},
{id:"s2web",pages:"Lecture 4 · §5.4, §11.2",fixed:true,tag:"Web security concepts",title:"Web application facts",gen:bankDrill([
  {label:"HTTP is stateless. What usually keeps you logged in between requests?",type:"select",opts:["A session ID in a cookie","Your IP address","The TCP connection","The Referer header"],ans:"A session ID in a cookie",short:"Sessions:",why:"the server keeps session state and gives the browser a cookie with the session ID, sent with every request to that site."},
  {label:"Cookie flag that stops JavaScript reading the cookie",type:"select",opts:["HttpOnly","Secure","SameSite","Path"],ans:"HttpOnly",short:"HttpOnly:",why:"limits what an XSS script can steal. Secure sends the cookie only over HTTPS; SameSite controls cross-site sending (against CSRF)."},
  {label:"Browser rule that stops a script from one site reading another site's pages",type:"select",opts:["Same-origin policy","Content Security Policy","HSTS","CORS preflight"],ans:"Same-origin policy",short:"Same-origin policy:",why:"origin = scheme + host + port. XSS gets around it by having the script served from the target's own origin."},
  {label:"Why prepared statements stop SQL injection",type:"select",opts:["The query is compiled before the data is bound to it","They escape every quote character","They encrypt the query","They run with fewer privileges"],ans:"The query is compiled before the data is bound to it",short:"Prepared statements:",why:"code and data travel separately, so data can never change the query's structure. Escaping is easy to get wrong."},
  {label:"Validating input by comparing it with known-good patterns is called",type:"select",opts:["Whitelisting","Blacklisting","Canonicalisation","Output encoding"],ans:"Whitelisting",short:"Whitelisting:",why:"blacklists of known-bad input miss new tricks and alternative encodings. Canonicalise first (one standard encoding), then compare."},
  {label:"HTTP response header that tells the browser which script sources to trust",type:"select",opts:["Content-Security-Policy","Set-Cookie","Strict-Transport-Security","X-Forwarded-For"],ans:"Content-Security-Policy",short:"CSP:",why:"with inline scripts disallowed, injected script tags don't run even if they reach the page."},
  {label:"Why CSRF works although the attacker never sees the victim's cookie",type:"select",opts:["The browser attaches it to requests to that site automatically","The attacker guesses it","It is sent in the URL","XSS copies it first"],ans:"The browser attaches it to requests to that site automatically",short:"CSRF:",why:"a request triggered by another page looks exactly like the victim's own. Tokens and SameSite cookies break that."},
  {label:"Least-privilege defence for a web application's database account",type:"select",opts:["Grant only the statements and tables the page needs","Use the database root account","Share one account across all apps","Disable logging"],ans:"Grant only the statements and tables the page needs",short:"Least privilege:",why:"limits the damage if injection does happen (a read-only page can't update salaries)."},
],5)},
];

const S2_MCQ=[
{q:"Where does a web application's PHP code run?",o:["In the browser, like JavaScript does","On the web server, before sending","Inside the database engine itself","In the visitor's operating system"],a:1,why:"Server-side code builds the page, often from database queries; the browser then renders the HTML and runs client-side JavaScript."},
{q:"Why is a session cookie valuable to an attacker?",o:["It holds the user's password in plain text","It lets the attacker decrypt all HTTPS traffic","Whoever presents it is treated as the user","It contains the web server's private key"],a:2,why:"HTTP is stateless; the session ID in the cookie is what identifies the logged-in user on every request."},
{q:"What is the root cause of SQL injection?",o:["Weak passwords on the database accounts","Unencrypted network links between server and database","Too many users sharing one database","Input joined into query text is parsed as SQL"],a:3,why:"Characters in the input can change the query's structure. Keeping data separate from code (prepared statements) removes the cause."},
{q:"Which CIA property does an injection that changes other users' salaries violate?",o:["Integrity","Confidentiality","Availability","Non-repudiation"],a:0,why:"Data is modified without authorisation. An injection that reads other users' records violates confidentiality instead."},
{q:"Why do prepared statements stop SQL injection when escaping sometimes fails?",o:["They are compiled to run faster","They check the user's password first","The query is fixed before data arrives","They strip every special character out"],a:2,why:"The database compiles the query with placeholders, then binds the values as pure data. Escaping can miss cases such as numeric fields or odd character sets."},
{q:"How does stored XSS differ from reflected XSS?",o:["It is saved on the server and served to all","It only works on sites served over HTTPS","Reflected XSS always needs a database","They are two names for one and the same attack"],a:0,why:"Reflected XSS bounces off a single request (usually a crafted link), so each victim must be lured; stored XSS hits everyone who views the page."},
{q:"What can a script injected by XSS do?",o:["Only display an alert box to the user","Rewrite the server's source code on disk","Whatever the site's own scripts can do","Read any file on the victim's hard disk"],a:2,why:"It runs in the site's origin: read the page and readable cookies, send requests as the user, change what the user sees."},
{q:"Which defence most directly stops XSS?",o:["Prepared statements for every query","Encoding user data where it is output","Longer timeouts on all of the user sessions","Hashing passwords with a strong salt"],a:1,why:"HTML-encoding turns &lt; and &gt; into harmless text. CSP and HttpOnly cookies are extra layers; prepared statements are for SQL."},
{q:"Why does CSRF work?",o:["The attacker has already stolen the victim's password","The browser adds the cookie to forged requests","The server leaks its whole session table","The attacker's script runs on the bank's page"],a:1,why:"The forged request carries a valid session cookie, so the server can't tell it from a real one. The last option describes XSS."},
{q:"Which defence stops CSRF?",o:["A secret per-session token in each form","HTML-encoding every value on output","Using GET instead of POST for all state changes","Making the session cookie value longer"],a:0,why:"Another site can't read the token, so it can't forge a valid request. SameSite cookies also help. State changes should never be done with GET."},
{q:"Why is whitelisting input safer than blacklisting?",o:["It runs faster on the server","It uses less memory per request","Unknown tricks are rejected by default","It needs no regular expressions or parsing at all"],a:2,why:"A blacklist only blocks what its authors thought of. A whitelist accepts only known-good input, after canonicalising alternative encodings."},
{q:"What does the HttpOnly flag on a cookie do?",o:["Sends it over HTTP only, never HTTPS","Hides the cookie from page scripts","Encrypts the cookie's stored value","Stops it being sent with any request"],a:1,why:"It limits what XSS can steal. Secure is the HTTPS-only flag; SameSite controls cross-site sending."},
{q:"A page shows no data and no errors, yet an attacker still extracts database contents. How?",o:["By reading the server's log files remotely","By decrypting the site's TLS session keys","By guessing the database administrator's password","By blind SQL injection, one yes/no at a time"],a:3,why:"Inferential attacks are slow but work without any visible output. Prepared statements stop them like any other injection."},
{q:"Which is a sensible second layer of defence against SQL injection?",o:["A database account with minimal rights","Showing full SQL error messages to users","Requiring longer passwords for all users","Turning off cookies across the whole site"],a:0,why:"Least privilege limits the damage. Detailed error messages do the opposite: they help the attacker map the database."},
];

export { S2_DRILLS, S2_MCQ };
