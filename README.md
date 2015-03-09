
# tweets-over-time

The (undocumented, unsupported) [URL tweet count endpoint][1] doesn't provide an easy way to get daily totals.  This little server will fetch counts when you tell it to
and save them, and then let you query for all the known counts of a given URL.


# Install

Needs a version of Node supported by [levelDOWN][2] (tested on 0.10).

```
git clone [this repo] [your dir]
cd [your dir]
npm install
```

# Run

```
node index.js
```

# Use

The first time you ask for the counts for `https://github.com`, it doesn't give you 
any, since it hasn't started tracking them yet.

```bash
curl http://localhost:3000/count?url=https://github.com
```
Output:
```
{"url":"https://github.com","since":"Mon Mar 09 2015 14:59:52 GMT-0700 (PDT)","counts":[]}
```


But now, `https://github.com` is being tracked.  Tell the server to fetch data
from the twitter endpoint like so:

```bash
curl http://localhost:3000/fetch
```
Output:
```
Mon Mar 09 2015 15:02:02 GMT-0700 (PDT) Fetching count for https://github.com
```

Now try getting the count again, with the result:

```javascript
{
  "url": "https://github.com",
  "since": "Mon Mar 09 2015 14:59:52 GMT-0700 (PDT)",
  "counts": [
    {"date":"Mon Mar 09 2015 14:59:52 GMT-0700 (PDT)","count":"10"},
    {"date":"Mon Mar 09 2015 15:02:02 GMT-0700 (PDT)","count":"10"}
  ]
}
```

(Note: there are two counts here because, actually, immediately after adding the
URL to the list of ones to track, the server does an initial fetch, and then, in
this example, we triggered another one just a couple minutes later.)





[1]: https://google.com
[2]: https://github.com/rvagg/node-leveldown/
