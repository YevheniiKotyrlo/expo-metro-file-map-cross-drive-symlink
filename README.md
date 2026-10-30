# expo-metro-file-map-cross-drive-symlink

On Windows, `@expo/metro-file-map` resolves a relative symlink that sits on another drive than the project to a path under the project's drive (`D:\C:\…`), so a module reached through that symlink cannot be resolved. This repository is `npx create-expo-app@latest --template blank` (Expo 58.0.21, `@expo/metro-file-map` 58.0.5) with three changes:

- `make-store.js` lays out two packages, `greeting` and `punctuation`, in a store folder the way an isolated linker (Bun's isolated installs, pnpm) does: `greeting`'s dependency on `punctuation` is the relative symlink `..\..\punctuation@1.0.0\node_modules\punctuation`. It links the project's `node_modules/greeting` into the store.
- `metro.config.js` adds the store's `node_modules` to `watchFolders`.
- `App.js` renders `greeting('world')`.

## Steps

Windows with two drives (here `C:` and `D:`), npm, the development server only. Creating a relative symlink needs Developer Mode or an elevated shell.

1. Clone onto one drive and install:
   ```sh
   git clone https://github.com/YevheniiKotyrlo/expo-metro-file-map-cross-drive-symlink D:\expo-metro-file-map-cross-drive-symlink
   cd D:\expo-metro-file-map-cross-drive-symlink
   npm install
   ```
2. Make the store in a new folder on the other drive, here `C:\Temp\store`:
   ```sh
   node make-store.js C:\Temp\store
   ```
3. Start the dev server and wait for `Waiting on http://localhost:8081`:
   ```sh
   npx expo start
   ```
4. Request the Android bundle:
   ```sh
   curl.exe -s -o bundle.txt -w "%{http_code}\n" "http://localhost:8081/index.bundle?platform=android&dev=true&minify=false"
   ```

Expected: `200`, the bundle.

Seen: `500`, and the dev server prints `Unable to resolve "punctuation" from "C:\Temp\store\node_modules\.store\greeting@1.0.0\node_modules\greeting\index.js"`.

With the store on the same drive as the project (a fresh clone, `node make-store.js D:\Temp\store`), the same request answers `200`.
