# Time-Varying Data Science (TVDS) Group — Website

A modern, static website for the Time-Varying Data Science Group at Tsinghua
Shenzhen International Graduate School, led by Prof. Ercan E. Kuruoglu.

No build step, no dependencies — plain HTML, CSS, and a little JavaScript. It
works on GitHub Pages as-is.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — animated graph hero, lab intro, research areas |
| `professor.html` | Prof. Kuruoglu's bio, contact info, and **Join Us / opportunities** |
| `publications.html` | Publication list, grouped by year |
| `people.html` | PI + students/researchers (and optional alumni) |
| `assets/css/style.css` | All styling (the design system) |
| `assets/js/main.js` | Mobile nav, scroll animations, hero graph animation |
| `assets/img/` | Put photos here |

## How to edit content

Each page has a yellow **"For the site editor"** note box marking exactly where
to make changes. In short:

### Add / update a student
Open `people.html`. Copy a member card (`<article class="person card">…`),
change the name, role, and bio. To add a photo, save it to `assets/img/` and
replace the placeholder initials block with:

```html
<img class="person__photo" src="assets/img/their-photo.jpg" alt="Their Name">
```

### Add a publication
Open `publications.html`. Copy one `<article class="pub">…</article>` block and
paste it under the right year. Wrap a lab member's name in
`<span class="me">Name</span>` to highlight it. A blank template is at the
bottom of the file.

### Update the professor's photo, bio, or open positions
Open `professor.html`. Swap the `profile__photo` placeholder for an `<img>`
(see comment in the file), edit the biography text, and edit/remove the
`callout` blocks under **"Studying & opportunities"** to keep positions current.

## Preview locally

Just open `index.html` in a browser, or run a tiny local server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy on GitHub Pages

1. Create a repository on GitHub. For a lab/organization site, the repo named
   `<username>.github.io` will be served at the root domain. Any other repo name
   is served at `https://<username>.github.io/<repo>/`.
2. Push this folder:

   ```bash
   git add -A
   git commit -m "Initial TVDS group website"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```

3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from
   a branch**, pick `main` and `/ (root)`, then **Save**.
4. Wait ~1 minute; the site URL appears on that same Pages settings screen.

The `.nojekyll` file tells GitHub Pages to serve the files directly without
running Jekyll.

### Custom domain (optional)
Add a `CNAME` file containing your domain (e.g. `tvds.example.edu`) and configure
the DNS as described in GitHub's Pages documentation.

## Notes

- Fonts (Inter, Space Grotesk) load from Google Fonts.
- The content reflects publicly available information as of mid-2026 and uses
  placeholder roles/photos for students — please verify names, titles, and
  details with the group before publishing.
