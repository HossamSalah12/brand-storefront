# Local fonts — one-time setup

The build was failing because `next build` tries to download fonts
directly from Google's servers (`fonts.gstatic.com`) at build time, and
that request was timing out on your connection. The project now uses
**self-hosted fonts** instead, so the build never needs internet access
for fonts again — but you need to download the font files **once** and
place them in this folder.

This takes about 5 minutes. No coding needed, just downloading and
copying files.

## Step 1 — Download each font family

Visit each link below, click the **"Download family"** button (top
right of the page), and unzip the downloaded file.

1. Amiri — https://fonts.google.com/specimen/Amiri
2. IBM Plex Sans Arabic — https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic
3. Fraunces — https://fonts.google.com/specimen/Fraunces
4. Work Sans — https://fonts.google.com/specimen/Work+Sans

## Step 2 — Copy the files you need

Inside each unzipped folder, open the **`static`** subfolder — that's
where the individual weight files live (not the single "variable" font
file). Copy these exact files into the matching folder inside this
project's `fonts/` directory:

**`fonts/amiri/`**
- `Amiri-Regular.ttf`
- `Amiri-Bold.ttf`

**`fonts/ibm-plex-sans-arabic/`**
- `IBMPlexSansArabic-Light.ttf`
- `IBMPlexSansArabic-Regular.ttf`
- `IBMPlexSansArabic-Medium.ttf`
- `IBMPlexSansArabic-SemiBold.ttf`

**`fonts/fraunces/`**
- `Fraunces-Regular.ttf`
- `Fraunces-Italic.ttf`
- `Fraunces-SemiBold.ttf`

**`fonts/work-sans/`**
- `WorkSans-Light.ttf`
- `WorkSans-Regular.ttf`
- `WorkSans-Medium.ttf`
- `WorkSans-SemiBold.ttf`

(If a filename in the zip looks slightly different — e.g. missing a
dash, or `SemiBold` written as `Semibold` — that's fine, just rename it
to match exactly what's listed above, or update the path in
`app/layout.tsx` to match the actual filename.)

## Step 3 — Build again

```bash
npm run build
npm run start
```

No network request to Google is made this time — the build should
finish normally regardless of your connection.

## Faster alternative (optional)

If hunting through zip files is annoying, https://gwfh.mranftl.com/fonts
lets you pick a font family, tick only the specific weights you need,
and download just those `.ttf` files directly — skips the unzip step
entirely.
