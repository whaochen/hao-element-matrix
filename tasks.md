# TASKS.md — 晧脈元素庫（Hao Element Matrix）開發與部署規格書

本文件為 **晧脈元素庫 · Hao Element Matrix** 專案之完整實作與部署指南，供本機 **Google Antigravity** 依序執行建置、驗證並推送至 GitHub 與 Cloudflare Pages。

## 專案總覽與核心原則

| 項目 | 規格定案 |
| :--- | :--- |
| 網站名稱 | **晧脈元素庫 · Hao Element Matrix** |
| 品牌用字鐵律 | 全站 UI、Meta 標籤、程式碼註解與資料檔**一律使用「晧」字**（Unicode `U+6667`），嚴禁誤植異體字（`U+7693`） |
| GitHub 倉庫 | `whaochen/hao-element-matrix`（建議本機路徑：`D:\Projects\hao-element-matrix`） |
| 技術架構 | 純靜態前端（HTML5 + Tailwind CSS + Vanilla ES Modules + JSON 資料驅動），零後端、零資料庫、永久零元維運 |
| 部署管線 | GitHub `main` 分支自動觸發 **Cloudflare Pages** 發布；流量統計採 Cloudflare 後台免費 **Web Analytics** |
| 首波點亮元素 | **C（第 6 號，碳）** → 環境部碳足跡查詢系統（`https://cfp-query-web.carbon-factor-search.workers.dev/`） |

## 建議目錄結構

```text
hao-element-matrix/
├── index.html                  # 主入口頁面（含 SEO / Open Graph Meta 與語意結構）
├── assets/
│   ├── styles.css              # 暗黑霓虹主題、週期表 Grid、留白、動畫與挖礦區樣式
│   ├── app.js                  # 週期表渲染、點擊鎖定邏輯、色環篩選、搜尋、清單切換與挖礦互動
│   └── constellation.js        # 背景輕量級分子星網 Canvas 動畫
├── data/
│   ├── periodic_base.json      # 118 個化學元素底圖資料（固定不需常改）
│   ├── projects.json           # 已點亮系統註冊表（未來新增系統只需編輯此檔）
│   └── mining_veins.json       # 元素探勘區（挖礦預告區）礦脈資料
├── scripts/
│   └── verify_project.py       # 上線前自動檢核腳本（品牌用字、JSON Schema、連結格式）
├── TASKS.md                    # 本規格文件
└── README.md                   # 專案說明與「一鍵點亮新元素 SOP」
```

## 資料規格（Data-Driven Schema）

### 1. `data/projects.json`（未來新增系統只需追加一筆）

```json
{
  "C": {
    "title": "環境部碳足跡查詢系統",
    "subtitle": "CFP Query Platform",
    "description": "整合環境部碳足跡排放係數（CFP_P_02）與碳標籤產品（CFP_P_01）查詢，結合 ISO 14067 生命週期階段引導與 MRV 查核支援。",
    "url": "https://cfp-query-web.carbon-factor-search.workers.dev/",
    "domainLabel": "cfp-query-web.carbon-factor-search.workers.dev",
    "status": "live",
    "statusLabel": "LIVE 上線中",
    "tags": ["ISO 14067", "碳足跡係數", "環境部開放資料"],
    "emblemType": "carbon"
  }
}
```

### 2. `data/mining_veins.json`（元素探勘區預告資料）

```json
[
  {
    "id": "vein-01",
    "codename": "礦脈 #01 · 代號 ??",
    "stage": "精煉測試中",
    "progress": 78,
    "color": "#00e676",
    "sector": "環境政策與知識脈絡",
    "hint": "偵測到高密度台灣環境政策脈絡訊號，正在打磨法規時間軸與研究圖譜，即將解鎖揭曉元素代號。",
    "baseEnergy": 42
  },
  {
    "id": "vein-02",
    "codename": "礦脈 #02 · 代號 ??",
    "stage": "核心開採中",
    "progress": 64,
    "color": "#ffd600",
    "sector": "互動教學與工程模擬",
    "hint": "偵測到清晰的數學波形與模糊控制訊號，正在校準視覺化模擬引擎與雙語語音模組。",
    "baseEnergy": 31
  },
  {
    "id": "vein-03",
    "codename": "深層未知礦脈 · ???",
    "stage": "地質探勘中",
    "progress": 26,
    "color": "#b388ff",
    "sector": "下一世代 AI 協作工具",
    "hint": "尚有 117 顆休眠元素等待點亮。想敲開哪一顆元素？點擊上方「雷達隨機探勘」看看下一個候選座標。",
    "baseEnergy": 19
  }
]
```

## 分階段實作任務

### Phase 1：專案初始化與資料層建立
- [ ] 初始化 Git 倉庫與上述目錄結構。
- [ ] 建立 `data/periodic_base.json`，完整收錄 1～118 號化學元素（原子序、英文符號、英文名、台灣繁體中文譯名、原子量、週期表 `col`/`row` 座標、所屬 10 大化學族）。
- [ ] 建立 `data/projects.json`（填入首波點亮元素 `C`）與 `data/mining_veins.json`（填入 3 條探勘礦脈）。
- [ ] 建立 `README.md`，附上本機預覽指令與「如何點亮新元素」的 3 步驟說明。

### Phase 2：視覺架構與展覽級留白版面
- [ ] 實作深邃宇宙暗黑底色（`#050811`）與 `assets/constellation.js` 互動分子星網背景（支援 DPR 高解析度與滑鼠微弱引力連線）。
- [ ] 設定展覽級天地左右留白：桌機版 `.app-shell` 採 `max-width: 1380px; padding: 36px 44px 52px;`，平板與手機依斷點優雅縮減。
- [ ] 建置 18 欄 × 7 週期 + 鑭系（57–71）/ 錒系（89–103）完整週期表 CSS Grid，其中第 1～3 列高度設為 `minmax(78px, 86px)`，讓上方中央資訊卡具備充裕空間。
- [ ] 區分三層元素視覺狀態：
  - **已點亮元素（如 `C`）**：高飽和霓虹邊框、呼吸發光光暈、掃描光澤動畫、`LIVE` 綠點指示燈與懸浮放大。
  - **已鎖定元素**：白色內框 + 霓虹外光環突出標示。
  - **休眠元素（其餘 117 格）**：暗玻璃半透明骨架（`opacity: 0.44`），滑鼠移入即亮起預覽。
- [ ] 在週期表上方凹槽（`grid-column: 3 / 13; grid-row: 1 / 4`）建置**放大版中央資訊卡**：
  - 左欄（`142px`）：放大全息元素磚、鎖定狀態徽章（`🔒 已鎖定 · ✕` / `👁 預覽中`）、原子序與原子量。
  - 中欄（彈性寬度）：44px 動態旋轉分子 SVG 徽章、狀態標籤、領域標籤、**完整不截斷的系統標題與 2～3 行介紹**、底部標籤列與網域顯示。
  - 右欄（`134px`）：三顆直向對齊發光按鈕——`前往系統 ↗`、`只看已點亮`、`清單視圖`。
- [ ] 在左下角建置 **10 色互動領域色環（SVG Donut）**，對應 10 大元素家族與規劃領域，滑鼠移入顯示領域名稱、點擊篩選週期表、點擊圓心「全部」重置。

### Phase 3：核心互動體驗與 RWD 適配
- [ ] 實作**點擊先鎖定、按按鈕才跳轉**規則：
  - 頁面載入預設鎖定 `C（碳）`，讓訪客第一眼看到完整點亮示範。
  - 點擊任一元素鎖定於上方資訊卡；鎖定期間滑鼠移過其他元素時，上方資訊卡保持不動（避免滑鼠移向「前往系統 ↗」途中誤觸切換），僅在滑鼠旁顯示輕量浮動提示條。
  - 再次點擊已鎖定元素、點擊鎖定徽章或按 `ESC` 鍵解除鎖定，回到自由移入即時預覽模式。
  - 只有點擊右上 `前往系統 ↗` 按鈕才會開新分頁（`target="_blank" rel="noopener noreferrer"`）跳轉目標系統；若選定休眠元素，按鈕呈現「尚未上線」並於點擊時顯示 Toast 提示。
- [ ] 實作頂部即時搜尋（支援原子序、符號、中英文名、系統名稱、標籤與領域）與「已點亮 `X / 118`」進度徽章。
- [ ] 實作**清單視圖**與手機版自動切換：螢幕寬度小於 `680px` 時預設開啟卡片清單視圖（優先呈現已點亮系統），並提供一鍵切回週期表視圖。

### Phase 4：元素探勘區（Mining Zone）挖礦預告
- [ ] 於週期表下方留出 `32px` 視覺間距，建置「**元素探勘區 · MINING ZONE**」獨立區塊，呈現 `data/mining_veins.json` 的神秘礦脈卡片。
- [ ] 每張礦脈卡片包含開採階段標籤、開採純度動態進度條、期待能量計數與「`⛏️ 敲礦集氣 +1`」互動按鈕（使用 `localStorage` 並包覆 `try/catch` 記錄使用者集氣次數，每累積一定能量微微推進純度條並跳出 Toast 回饋）。
- [ ] 建置「`📡 雷達隨機探勘元素`」按鈕：點擊後於週期表上執行快速跳格掃描光束動畫，最後自動鎖定一顆休眠元素並平滑捲動至上方資訊卡。

### Phase 5：自動化檢核、GitHub 推送與 Cloudflare Pages 部署
- [ ] 撰寫 `scripts/verify_project.py`，驗證以下三項並於終端機執行通過：
  1. 掃描全專案 `.html` / `.css` / `.js` / `.json` / `.md` 檔案，確保**零誤植異體字**（`chr(0x7693)` 出現次數必須為 `0`）。
  2. 驗證 `periodic_base.json` 精確包含 118 筆元素、無重複原子序與符號。
  3. 驗證 `projects.json` 內所有 `url` 皆為合法 `https://` 網址，且對應符號皆存在於週期表。
- [ ] 執行 `git add .`、`git commit -m "feat: launch Hao Element Matrix v1 with C element & Mining Zone"` 並推送至 `whaochen/hao-element-matrix`。
- [ ] 前往 Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → 連結 GitHub 倉庫 `whaochen/hao-element-matrix`：
  - Build command：留空（純靜態零建置）
  - Build output directory：`/`（專案根目錄）
- [ ] 於 Cloudflare Pages 後台開啟免費 **Web Analytics**，不需在前台放訪客計數器。

## 驗收標準（Acceptance Criteria）

1. **品牌檢核通過**：執行 `python scripts/verify_project.py` 全數綠燈，全站僅出現「晧」字。
2. **視覺零截斷**：桌機版（1280px 與 1440px）天地左右留白清晰，上方資訊卡完整顯示「環境部碳足跡查詢系統」標題與說明無異常溢出，不與第 4 列元素重疊。
3. **互動流程精準**：點擊元素鎖定資訊卡 → 滑鼠移往按鈕不跑掉 → 點擊「前往系統 ↗」正確於新分頁開啟 `https://cfp-query-web.carbon-factor-search.workers.dev/`；`ESC` 可解除鎖定。
4. **挖礦區正常運作**：敲礦集氣數字即時更新且重新整理後保留；雷達隨機探勘可正常執行動畫並鎖定元素。
5. **跨裝置與線上可用**：手機版自動切至清單視圖無水平爆版；Cloudflare Pages 線上網址可正常載入且 Console 無紅字錯誤。
