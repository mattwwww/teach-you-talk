# 開口啦

## 啟動應用

在這個資料夾直接執行：

```bash
npm start
```

然後在瀏覽器開啟 <http://localhost:8081>。

`npm start` 會使用已建立的穩定網頁版本。如修改程式碼，先執行 `npm run build:web`。

如果依賴尚未安裝，先執行：

```bash
npm run install:app
```

其他指令：

```bash
npm run typecheck
npm run build
npm run android
```

如要在手機使用 Expo Go，可進入 `app` 資料夾後執行 `npm start`。

完整產品說明請參閱 [`app/README.md`](app/README.md)。
