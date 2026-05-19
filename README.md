# Launch Studio Website

A lightweight static website starter built with plain HTML, CSS, and JavaScript.

## Customize

- Edit `index.html` to change the text, sections, email address, and links.
- Edit `styles.css` to change colors, spacing, and layout.
- Replace `assets/hero-website-launch.png` with your own image if you want a different hero visual.

## Publish With GitHub Pages

1. Create a new GitHub repository.
2. Upload these files to the repository root:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `assets/hero-website-launch.png`
   - `README.md`
3. In GitHub, open **Settings** > **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/root`, then save.

Your site will be available at:

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/
```

If you install Git locally, you can publish from this folder with:

```bash
git init
git add .
git commit -m "Create website"
git branch -M main
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/YOUR-REPOSITORY-NAME.git
git push -u origin main
```
