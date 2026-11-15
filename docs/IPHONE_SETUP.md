# Put A.R.I.A. on GitHub and your iPhone (no computer)

You need a free GitHub account. Do all of this in **Safari**.

## 1. Unzip
In the Files app, tap `aria-repo.zip` to unzip it. You get a folder with `index.html`, `css`, `js` and so on.

## 2. Create the repository
1. Go to github.com and sign in. Tap the **+** then **New repository**.
2. Name it `aria`. Choose **Public** (free GitHub Pages needs it). Leave every box unticked. Tap **Create repository**.

## 3. Upload the top-level files
1. Tap **uploading an existing file**.
2. Tap **choose your files** and select: `index.html`, `manifest.webmanifest`, `sw.js`, `README.md`, `LICENSE`. (Files starting with a dot, like `.gitignore`, are hidden on iPhone. Skip them.)
3. Tap **Commit changes**.

## 4. Upload each folder
iPhone can't pick folders, so make each one like this. Repeat for **css**, **js**, **icons**, **docs** and **tests**:
1. In the repo tap **Add file** then **Create new file**.
2. In the name box type `js/start.txt` (typing `/` makes the folder). In the text area type `x`. Tap **Commit changes**.
3. Open the new folder, tap **Add file** then **Upload files**, choose all the files from that folder in the unzipped download, and commit.
4. Optional: delete `start.txt` afterwards.

## 5. Turn on the website
1. Tap **Settings** then **Pages**.
2. Under **Branch** choose `main` and `/ (root)`, then **Save**.
3. Wait one or two minutes. Your link will be `https://YOUR-USERNAME.github.io/aria/`.

## 6. Install on your iPhone
1. Open the link in Safari. Tap **Share** then **Add to Home Screen**.
2. Turn on dictation: iOS **Settings, General, Keyboard, Enable Dictation**.
3. Open ARIA from the home screen, tap the glowing core, and allow **Microphone** and **Speech Recognition** when asked.

## Updating later
Edit or upload a changed file on GitHub. The site refreshes in a minute or two. Close and reopen the app once or twice to pick it up. If you add a new file, add it to `FILES` in `sw.js` and change `VERSION`.
