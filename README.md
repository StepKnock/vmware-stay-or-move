# VMware: stay or move, at your own prices

One HTML file. Download it, double-click it, and drop in an RVTools export. It shows what you run, what sits idle, and a 3-year comparison of staying on VMware, moving to another hypervisor, or moving to cloud, at prices you type in yourself. It can tell you staying is cheapest.

Your file never leaves your computer. The page has no server behind it, makes no network requests, and stores nothing. You do not have to take our word for it: the three checks below take two minutes.

## How to use it

1. Download `vmware-stay-or-move.html` from the latest release.
2. In RVTools: File, then Export all to Excel.
3. Open the HTML file in Chrome, Edge or Firefox and drop the export on it. Or press "Try the made-up sample" first.
4. Type your own prices into the 3-year comparison. Every price starts blank.
5. Print it (one page) or export the rows as CSV.

## What it shows

- **What you have:** VMs (on, off, suspended, templates), vCPUs, memory, disk space, hosts, sockets, cores, datastores.
- **What sits idle:** powered-off VMs and the space they still hold, snapshots older than the age you pick, and the biggest VMs to check first.
- **Stay or move over 3 years:** licensed cores under the per-CPU minimum you set (default 16), then each option's 3-year total from your prices, people hours and one-time costs. It names the lowest total, whichever it is.

## What it does not prove

This is not licensing advice. Broadcom's prices and rules change and are not public; use your own contract. RVTools holds no usage data, so this cannot tell you a machine is too big, only that it is big. It does not plan the move or check which applications depend on each other.

## Check it yourself

1. **Watch the network.** Open the file, press F12, open the Network tab, then load your export. Nothing goes to any internet address. The only entries you may see are the file itself and its built-in reader, which starts from a `blob:` address inside the page.
2. **Turn Wi-Fi off.** Disconnect from every network, open the file, and load your export. It works the same.
3. **Check the fingerprint.** Compare the file's SHA-256 with the one in this README and on the release page.
   - Windows (PowerShell): `Get-FileHash .\vmware-stay-or-move.html -Algorithm SHA256`
   - macOS or Linux: `shasum -a 256 vmware-stay-or-move.html`

   SHA-256 for version 1.0.0: `2841920d5e9a894935bb3eb14d87ef44e79a01b3379e323a48768b95ab6927a1`

## For your security team

- **What is read:** four tabs (vInfo, vHost, vSnapshot, vDatastore) and only the columns listed on the page. IP addresses, DNS names, notes and annotations are dropped as the file is read and never kept. VM, host and datastore names are hidden (VM-001, HOST-001) until the person running it turns them on, and the toggle is off on every load.
- **What it can reach:** nothing. A Content Security Policy in the file sets `connect-src 'none'` and `default-src 'none'`, allows only the file's own script and style by hash, and enforces Trusted Types. There are no external scripts, fonts or images.
- **What it keeps:** nothing. No cookies, local storage or IndexedDB. Reloading the page wipes everything.
- **Hostile files:** the reader refuses files over 50 MB, more than 300 MB unzipped, more than 200,000 rows, any DOCTYPE, UTF-16 parts, broken or deeply nested XML, and zip entries that share data. Reading runs in a worker that is stopped after 10 seconds. CSV export puts a `'` before any cell that starts with `=`, `+`, `-`, `@`, a tab or a carriage return.
- **Who made it and why:** StepKnock, a two-person San Diego company that works on storage, backup and recovery. We are paid through partners when a customer buys hardware or software. This file asks for nothing, has no sign-up, and costs nothing to use.

## The source

`source/` holds everything the HTML file is built from: the reader (`engine/engine.js`), the cost math (`engine/cost.js`), the page (`page/src/`) and the build script (`page/build.mjs`), which inlines them into one file and writes the CSP hashes. The made-up sample workbook is in `source/sample/`. Rebuild with Node 20 or later: `node source/page/build.mjs` writes `source/dist/vmware-stay-or-move.html`, which should match the fingerprint above byte for byte.

## License

MIT. See `LICENSE`.
