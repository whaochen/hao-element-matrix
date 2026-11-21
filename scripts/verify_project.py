#!/usr/bin/env python3
"""
晧脈元素庫 · Hao Element Matrix — 上線前自動化檢核腳本
檢查項目：
1. 品牌用字鐵律：掃描全專案 .html / .css / .js / .json / .md 檔案，確保零誤植異體字（U+7693）。
2. 元素底圖完整性：驗證 data/periodic_base.json 精確包含 118 筆元素、無重複原子序、符號與座標。
3. 已點亮系統檢核：驗證 data/projects.json 內所有 url 皆為合法 https:// 網址且元素符號存在於週期表。
4. 元素探勘區檢核：驗證 data/mining_veins.json 結構完整。
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
FORBIDDEN_CHAR = chr(0x7693)  # 嚴禁誤植之異體字
BRAND_CHAR = chr(0x6667)      # 正確品牌用字「晧」
SCAN_EXTS = {".html", ".css", ".js", ".json", ".md"}
IGNORE_DIRS = {".git", "node_modules", "__pycache__", ".venv"}


def check_brand_character() -> tuple[bool, list[str]]:
    errors: list[str] = []
    scanned = 0
    brand_hits = 0

    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        if any(part in IGNORE_DIRS for part in path.parts):
            continue
        if path.suffix.lower() not in SCAN_EXTS:
            continue

        scanned += 1
        text = path.read_text(encoding="utf-8")
        brand_hits += text.count(BRAND_CHAR)
        bad_count = text.count(FORBIDDEN_CHAR)
        if bad_count > 0:
            rel = path.relative_to(ROOT)
            errors.append(f"{rel} 發現 {bad_count} 次誤植異體字 (U+7693)")

    if errors:
        return False, errors
    return True, [f"已掃描 {scanned} 個檔案，異體字 (U+7693) 出現 0 次，正確「{BRAND_CHAR}」字出現 {brand_hits} 次。"]


def check_periodic_base() -> tuple[bool, list[str], set[str]]:
    path = ROOT / "data" / "periodic_base.json"
    if not path.exists():
        return False, ["找不到 data/periodic_base.json"], set()

    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        return False, ["data/periodic_base.json 必須為 JSON 陣列"], set()

    errors: list[str] = []
    if len(data) != 118:
        errors.append(f"元素數量應為 118，實際為 {len(data)}")

    numbers: set[int] = set()
    symbols: set[str] = set()
    coords: set[tuple[int, int]] = set()
    required_keys = {"number", "symbol", "nameEn", "nameZh", "mass", "col", "row", "family"}

    for idx, item in enumerate(data, start=1):
        missing = required_keys - set(item.keys())
        if missing:
            errors.append(f"第 {idx} 筆缺少欄位：{sorted(missing)}")
            continue

        num = item["number"]
        sym = item["symbol"]
        coord = (item["col"], item["row"])

        if num in numbers:
            errors.append(f"重複原子序：{num}")
        numbers.add(num)

        if sym in symbols:
            errors.append(f"重複元素符號：{sym}")
        symbols.add(sym)

        if coord in coords:
            errors.append(f"重複週期表座標：{coord}（元素 {sym}）")
        coords.add(coord)

    expected_numbers = set(range(1, 119))
    if numbers != expected_numbers:
        missing_nums = sorted(expected_numbers - numbers)
        extra_nums = sorted(numbers - expected_numbers)
        errors.append(f"原子序不完整，缺少={missing_nums}，多餘={extra_nums}")

    if errors:
        return False, errors, symbols
    return True, ["data/periodic_base.json 驗證通過：共 118 筆元素，原子序 1–118、符號與座標皆無重複。"], symbols


def check_projects(valid_symbols: set[str]) -> tuple[bool, list[str]]:
    path = ROOT / "data" / "projects.json"
    if not path.exists():
        return False, ["找不到 data/projects.json"]

    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not data:
        return False, ["data/projects.json 必須為非空 JSON 物件"]

    errors: list[str] = []
    required_keys = {"title", "subtitle", "description", "url", "domainLabel", "status", "statusLabel", "tags"}

    for sym, proj in data.items():
        if sym not in valid_symbols:
            errors.append(f"元素符號 '{sym}' 不存在於 data/periodic_base.json")

        missing = required_keys - set(proj.keys())
        if missing:
            errors.append(f"元素 '{sym}' 缺少欄位：{sorted(missing)}")

        url = proj.get("url", "")
        parsed = urlparse(url)
        if parsed.scheme != "https" or not parsed.netloc:
            errors.append(f"元素 '{sym}' 的 url 非合法 https:// 網址：{url!r}")

    if errors:
        return False, errors
    return True, [f"data/projects.json 驗證通過：共 {len(data)} 個已點亮系統（{', '.join(data.keys())}），網址皆為合法 https://。"]


def check_mining_veins() -> tuple[bool, list[str]]:
    path = ROOT / "data" / "mining_veins.json"
    if not path.exists():
        return False, ["找不到 data/mining_veins.json"]

    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list) or not data:
        return False, ["data/mining_veins.json 必須為非空 JSON 陣列"]

    required_keys = {"id", "codename", "stage", "progress", "color", "sector", "hint", "baseEnergy"}
    errors: list[str] = []
    ids: set[str] = set()
    for idx, vein in enumerate(data, start=1):
        missing = required_keys - set(vein.keys())
        if missing:
            errors.append(f"第 {idx} 條礦脈缺少欄位：{sorted(missing)}")
        vid = vein.get("id")
        if vid in ids:
            errors.append(f"重複礦脈 id：{vid}")
        ids.add(vid)

    if errors:
        return False, errors
    return True, [f"data/mining_veins.json 驗證通過：共 {len(data)} 條探勘礦脈。"]


def check_dom_ids() -> tuple[bool, list[str]]:
    html_path = ROOT / "index.html"
    js_path = ROOT / "assets" / "app.js"
    if not html_path.exists() or not js_path.exists():
        return False, ["缺少 index.html 或 assets/app.js"]

    html = html_path.read_text(encoding="utf-8")
    js = js_path.read_text(encoding="utf-8")
    html_ids = set(re.findall(r'id="([^"]+)"', html))
    js_ids = set(re.findall(r"getElementById\('([^']+)'\)", js))
    missing = sorted(js_ids - html_ids)
    if missing:
        return False, [f"assets/app.js 參照了 index.html 不存在的 DOM ID：{missing}"]
    return True, [f"DOM ID 一致性檢核通過：assets/app.js 查詢的 {len(js_ids)} 個 ID 皆存在於 index.html。"]


def check_badge_component() -> tuple[bool, list[str]]:
    badge_path = ROOT / "badge.js"
    base_path = ROOT / "data" / "periodic_base.json"
    if not badge_path.exists():
        return False, ["找不到根目錄 badge.js"]

    text = badge_path.read_text(encoding="utf-8")
    errors: list[str] = []
    if "customElements.define(TAG_NAME" not in text or "'hao-element-badge'" not in text:
        errors.append("badge.js 未註冊 <hao-element-badge> 自訂標籤")
    if "attachShadow" not in text:
        errors.append("badge.js 未使用 Shadow DOM")

    raw_parts = re.findall(r"'([^']*)'\s*(?:\+|;)", text.split("const RAW_ELEMENTS =", 1)[-1].split(";", 1)[0] + ";")
    tokens = " ".join(raw_parts).split()
    base = json.loads(base_path.read_text(encoding="utf-8"))
    expected = [f"{e['symbol']}:{e['nameZh']}" for e in sorted(base, key=lambda x: x["number"])]
    actual = [":".join(t.split(":")[:2]) for t in tokens]
    if actual != expected:
        errors.append(f"badge.js 元素表與 periodic_base.json 不一致（badge.js 共 {len(actual)} 筆）")

    if errors:
        return False, errors
    return True, [f"badge.js 驗證通過：已註冊 <hao-element-badge>（Shadow DOM），內建 {len(actual)} 個元素與底圖完全一致。"]


def main() -> int:
    print("=== 晧脈元素庫 · Hao Element Matrix 自動化檢核 ===")
    all_ok = True

    ok1, msgs1 = check_brand_character()
    print(f"[{'PASS' if ok1 else 'FAIL'}] 1. 品牌用字檢核")
    for m in msgs1:
        print(f"       {m}")
    all_ok = all_ok and ok1

    ok2, msgs2, symbols = check_periodic_base()
    print(f"[{'PASS' if ok2 else 'FAIL'}] 2. periodic_base.json 檢核")
    for m in msgs2:
        print(f"       {m}")
    all_ok = all_ok and ok2

    ok3, msgs3 = check_projects(symbols)
    print(f"[{'PASS' if ok3 else 'FAIL'}] 3. projects.json 檢核")
    for m in msgs3:
        print(f"       {m}")
    all_ok = all_ok and ok3

    ok4, msgs4 = check_mining_veins()
    print(f"[{'PASS' if ok4 else 'FAIL'}] 4. mining_veins.json 檢核")
    for m in msgs4:
        print(f"       {m}")
    all_ok = all_ok and ok4

    ok5, msgs5 = check_dom_ids()
    print(f"[{'PASS' if ok5 else 'FAIL'}] 5. DOM ID 參照檢核")
    for m in msgs5:
        print(f"       {m}")
    all_ok = all_ok and ok5

    ok6, msgs6 = check_badge_component()
    print(f"[{'PASS' if ok6 else 'FAIL'}] 6. badge.js 回航徽章檢核")
    for m in msgs6:
        print(f"       {m}")
    all_ok = all_ok and ok6

    print("=" * 48)
    if all_ok:
        print("RESULT: ALL CHECKS PASSED!")
        return 0
    print("RESULT: CHECKS FAILED!")
    return 1


if __name__ == "__main__":
    sys.exit(main())
