# Flash English (offline-capable / GitHub Pages)

CDN 依存（Tailwind Play CDN・React UMD・Babel standalone・Google Fonts）を全部やめて、
**同一オリジンの静的ファイルだけ**で動くようにした版です。Service Worker で precache するので、
一度オンラインで開けば以降はオフラインでも起動します。

## 構成

```
index.html               # 完成品（style.css / app.js を読むだけ）
style.css                # ← ビルド生成物 (Tailwind CLI)
app.js                   # ← ビルド生成物 (esbuild: React + JSX を bundle)
sw.js                    # Service Worker
manifest.webmanifest
icons/
src/main.jsx             # アプリ本体（編集するのはここ）
src/input.css            # Tailwind の入力 CSS
tailwind.config.js
package.json
```

`style.css` と `app.js` は生成物ですが、**GitHub Pages は静的ファイルをそのまま配信するだけ
なので、この2つも commit してください**（`.gitignore` では `node_modules` だけ除外）。

## ビルド

Node.js 18+ が必要。

```bash
npm install
npm run build     # style.css と app.js を生成
```

ローカル確認（Service Worker は `file://` では動かないので HTTP で開くこと）:

```bash
npm run serve     # http://localhost:5173
```

開発中は `npm run watch:css` / `npm run watch:js` を別ターミナルで。

## GitHub へのアップロード（初回）

前提: `npm run build` 済みで、`style.css` と `app.js` がプロジェクト直下にあること。

### A. git コマンドで（推奨）

既存リポジトリを更新する場合は、古い `index.html` を新しい一式で置き換えて push するだけです。

```bash
cd flash-english
git init                      # 既存リポジトリならこの行は不要
git add .                     # .gitignore により node_modules は除外される
git commit -m "Rebuild as offline PWA (Tailwind CLI + esbuild + Service Worker)"
git branch -M main
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git   # 既存なら不要
git push -u origin main
```

`git status` で `style.css` / `app.js` / `sw.js` / `manifest.webmanifest` / `icons/` が
staged になっているか必ず確認してください（どれか1つでも欠けるとオフライン化が壊れます）。

### B. ブラウザ (GitHub Web UI) で

1. リポジトリの **Add file → Upload files**
2. `index.html` / `style.css` / `app.js` / `sw.js` / `manifest.webmanifest` / `icons/` フォルダを
   ドラッグ&ドロップ（`node_modules` は絶対に上げない）
3. Commit

`src/` や `package.json` は動作には不要ですが、次回ビルドのために置いておくのを推奨します。

### GitHub Pages の設定

リポジトリの **Settings → Pages** → *Build and deployment* → Source: **Deploy from a branch** →
Branch: `main` / `/ (root)` → Save。公開URLは `https://<ユーザー名>.github.io/<リポジトリ名>/` です。

- Service Worker は **HTTPS 必須**ですが、GitHub Pages は HTTPS なので問題ありません。
- ファイル配置はサブディレクトリ (`/<リポジトリ名>/`) になりますが、すべて相対パス (`./`) なのでそのまま動きます。
- 反映まで最大1〜2分程度かかります。

## デプロイ手順（更新のたびに）

1. `src/main.jsx` などを編集
2. `npm run build`
3. **`sw.js` の `CACHE_VERSION` を上げる**（例: `"v1"` → `"v2"`）
   - これを忘れると、端末に残った古い `app.js` / `style.css` が使われ続けます
4. commit & push（GitHub Pages が更新される）
5. 端末側では、次にオンラインで開いたときに新しい Service Worker が入る

## Service Worker の方針

- `install`: `index.html` / `style.css` / `app.js` / icons を precache（`cache: "reload"` で HTTP キャッシュを迂回）
- ページ遷移 (`mode === "navigate"`): **network-first** → オンラインなら最新、オフラインならキャッシュの `index.html`
- その他の同一オリジン資産: **stale-while-revalidate** → キャッシュを即返しつつ裏で更新

## フォントを self-host したい場合（任意）

現状は外部フォントを読まず、`Inter` があれば使い、なければ system font にフォールバックします
（`tailwind.config.js` の `fontFamily.sans`）。Inter を厳密に使うなら:

```bash
npm i @fontsource/inter
mkdir -p fonts && cp node_modules/@fontsource/inter/files/inter-latin-*-normal.woff2 fonts/
ls fonts/      # ← 実際のファイル名を必ず確認してから下の @font-face を書く
```

`src/input.css` に `@font-face`（`src: url("../fonts/inter-latin-400-normal.woff2") format("woff2")` など）を
weight 400 / 700 / 900 分だけ追加し、`sw.js` の `PRECACHE_URLS` に `./fonts/...` を足してから再ビルドしてください。
