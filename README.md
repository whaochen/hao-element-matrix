# 晧脈元素庫 · Hao Element Matrix

以化學元素週期表為視覺隱喻打造的個人數位作品與工具矩陣。全站採純靜態前端架構（HTML5 + Tailwind CSS + Vanilla ES Modules + JSON 資料驅動），零後端、零資料庫，透過 GitHub 與 Cloudflare Pages 自動部署。

- **品牌名稱**：晧脈元素庫 · Hao Element Matrix
- **首波點亮元素**：`C`（第 6 號，碳）→ [環境部碳足跡查詢系統](https://cfp-query-web.carbon-factor-search.workers.dev/)
- **部署目標**：GitHub `whaochen/hao-element-matrix` → Cloudflare Pages

## 目錄結構

```text
hao-element-matrix/
├── index.html                  # 主入口頁面（SEO / Open Graph Meta 與語意結構）
├── assets/
│   ├── styles.css              # 暗黑霓虹主題、週期表 Grid、留白、動畫與挖礦區樣式
│   ├── app.js                  # 週期表渲染、點擊鎖定、色環篩選、搜尋、清單切換與挖礦互動
│   └── constellation.js        # 背景輕量級分子星網 Canvas 動畫
├── data/
│   ├── periodic_base.json      # 118 個化學元素底圖資料
│   ├── projects.json           # 已點亮系統註冊表（新增系統只需編輯此檔）
│   └── mining_veins.json       # 元素探勘區（挖礦預告區）礦脈資料
├── scripts/
│   └── verify_project.py       # 上線前自動檢核腳本
├── tasks.md                    # 開發與部署規格書
└── README.md                   # 本說明文件
```

## 本機預覽指令

由於使用 ES Modules 與 `fetch()` 載入 JSON，請使用本機靜態伺服器預覽（不可直接雙擊 `index.html`）：

```bash
python -m http.server 8080
```

開啟瀏覽器前往 `http://localhost:8080` 即可預覽。

## 一鍵點亮新元素 SOP（3 步驟）

未來每完成一個新系統，只需以下 3 個步驟即可在週期表上點亮對應元素：

1. **編輯 `data/projects.json`**
   選擇一顆尚未點亮的化學元素符號作為鍵值（例如 `"Si"` 或 `"Fe"`），依下列格式新增一筆資料：
   ```json
   "Si": {
     "title": "你的系統名稱",
     "subtitle": "System Subtitle",
     "description": "2～3 行精煉介紹，說明系統核心功能與適用對象。",
     "url": "https://your-service.example.com/",
     "domainLabel": "your-service.example.com",
     "status": "live",
     "statusLabel": "LIVE 上線中",
     "tags": ["標籤一", "標籤二", "標籤三"],
     "emblemType": "default"
   }
   ```
2. **執行自動化檢核**
   ```bash
   python scripts/verify_project.py
   ```
   確認品牌用字、118 元素底圖與 `projects.json` 格式全數通過。
3. **提交並推送至 GitHub `main` 分支**
   ```bash
   git add data/projects.json
   git commit -m "feat: illuminate Si element"
   git push origin main
   ```
   Cloudflare Pages 將在數十秒內自動完成重新發布。

## 回航徽章 Web Component（badge.js）

任何子系統只要兩行即可嵌入連回主站的回航徽章（純原生、零依賴、Shadow DOM 樣式隔離）：

```html
<script src="https://hao-element-matrix.pages.dev/badge.js" defer></script>
<hao-element-badge symbol="O" theme="dark" compact="false"></hao-element-badge>
```

| 屬性 | 說明 |
| :--- | :--- |
| `symbol` | 元素符號（如 `C` / `O` / `Ti`），內建完整 118 元素中文名與主題色 |
| `theme` | `dark`（深色底，預設）或 `light`（淺色底） |
| `compact` | `true` 時僅顯示迷你 3D 元素方塊與 `↗` |

點擊後開新分頁前往 `https://hao-element-matrix.pages.dev/?el={symbol}`，主站會自動鎖定該元素於上方資訊卡。

## Cloudflare Pages 部署設定

- **Framework preset**：None
- **Build command**：留空
- **Build output directory**：`/`
- **Web Analytics**：於 Cloudflare Pages 後台直接啟用免費 Web Analytics。
