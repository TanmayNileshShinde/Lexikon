# Security policy

## Supported versions

Lexikon is a small project: only the latest code on `main` (and the deployment built from it)
receives fixes.

## How Lexikon is exposed

Lexikon is a public, read-only web service: a React single-page app and a small HTTP API that
looks words up in a SQLite file opened in read-only mode. There are no accounts, no user input
that is stored, and no write endpoints.

Examples of problems we want to hear about:

- a crafted request that makes the API read files other than the dictionary database, or run
  arbitrary SQL (the queries are parameterised: this should not be possible);
- a crafted query or id that crashes the server or makes it use unbounded CPU or memory;
- a way to inject script into the page through dictionary data or a URL (cross-site scripting);
- an overly permissive CORS configuration that lets another site abuse the API;
- a vulnerable dependency that Lexikon actually uses in a vulnerable way.

Out of scope: wrong or offensive dictionary content (it comes from Wiktionary; fix it there)
and denial of service by sheer traffic volume.

## Reporting a vulnerability

Please **do not open a public issue**. Report it privately through GitHub instead:
[Report a vulnerability](https://github.com/julianel5/Lexikon/security/advisories/new)
(the *Security* tab of the repository, then *Report a vulnerability*).

Include what you found, how to reproduce it, and what an attacker could do with it. We aim to
answer within 7 days. Once a fix is ready, it is released and the advisory is published,
crediting you unless you prefer otherwise.
