
# tweets-over-time

The (undocumented, unsupported) [URL tweet count endpoint][1] doesn't provide an easy way to get daily totals.  This little server will fetch counts when you tell it to
and save them, and then let you query for all the known counts of a given URL.


# Install it

Needs a version of Node supported by [levelDOWN][2] (tested on 0.10).

```
git clone [this repo] [your dir]
cd [your dir]
npm install
```

# Run it

```
node index.js
```

# Use it (TL;DR version)

## `GET /count?url=...`

Get the collected count data for the given URL.  If the URL isn't yet being
tracked, add it to the list of URLs to track.

## `GET /fetch`

Trigger the server to fetch tweet count for *all* tracked URLs.


# Use it (full version)

Ask for the counts for a given URL like so:
```bash
curl http://localhost:3000/count?url=https://github.com
```

The first time you ask for a given URL, it doesn't give you any tweet counts,
since it hasn't started tracking them yet.  E.g., the first response will look
like:

```
{"url":"https://github.com","since":"Mon Mar 09 2015 14:59:52 GMT-0700 (PDT)","counts":[]}
```

But now, `https://github.com` is being tracked. Tell the server to fetch data
from the twitter endpoint at any time like so:

```bash
curl http://localhost:3000/fetch
```

Output:
```
Mon Mar 09 2015 15:02:02 GMT-0700 (PDT) Fetching count for https://github.com
```

Now if we try getting the count again (`curl http://localhost:3000/count?url=https://github.com`), we get count data:

```javascript
{
  "url": "https://github.com",
  "since": "Mon Mar 09 2015 14:59:52 GMT-0700 (PDT)",
  "counts": [
    {"date":"Mon Mar 09 2015 14:59:52 GMT-0700 (PDT)","count":"36812"},
    {"date":"Mon Mar 09 2015 15:02:02 GMT-0700 (PDT)","count":"36812"}
  ]
}
```

(Why are there *two* counts here?  I didn't mention it before, but immediately 
after adding the URL to the list of ones to track, the server does an initial 
fetch just for that URL.  Then, in this example, we triggered another one just a
couple minutes later.)



[1]: https://google.com
[2]: https://github.com/rvagg/node-leveldown/
