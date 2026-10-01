#!/usr/bin/env python3
"""Generate SCENARIO_TESTS_GWT.md from SCENARIO_TESTS.md."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "SCENARIO_TESTS.md"
OUT = ROOT / "docs" / "SCENARIO_TESTS_GWT.md"

# --- E2E priority classification (SSOT for generator + SCENARIO_TESTS_GWT §编写规范) ---

DIMENSION_LABELS = {
    "revenue": "收入/资金相关",
    "irreversible": "不可逆或高代价",
    "cross_system": "跨系统链路",
    "high_frequency": "高频且用户量大",
    "historical": "历史上出过事故",
}

DIMENSION_KEYWORDS: dict[str, tuple[str, ...]] = {
    "revenue": (
        "stripe",
        "checkout",
        "buy yin a tea",
        "buy a tea",
        "yin's sanctuary",
        "yins sanctuary",
        "focus tiger pro",
        "ai companion add-on",
        "结账",
        "lifetime checkout",
        "membership 订阅",
    ),
    "irreversible": (
        "forget",
        "newsletter",
        "resend",
        "practice backup",
        "practice-backup",
        "留资",
        "误删",
        "群发",
    ),
    "cross_system": (
        "electron",
        "stripe",
        "llama",
        "confide",
        "desktop:dev",
        "zen cinema",
        "focus circle",
        "127.0.0.1",
        "documentpictureinpicture",
        "托盘",
    ),
    "high_frequency": (),
    "historical": (
        "stripe 回跳",
        "付完先睡着",
        "误睡",
        "收进托盘误触发",
    ),
}

DIMENSION_SCENARIOS: dict[str, frozenset[str]] = {
    "revenue": frozenset({"Q", "Q1", "Q2", "Q3", "Q4", "AC", "AD"}),
    "irreversible": frozenset({"AI", "AG", "AG-0", "AJ"}),
    "cross_system": frozenset(
        {"AB", "AE", "AG", "AG-0", "AK", "U", "U1", "U2", "U3", "AN", "AO", "AP", "AQ", "AR", "AJ", "AL", "AM"}
    ),
    "high_frequency": frozenset({"A", "A-ACCEPT", "B", "C", "D", "E", "F", "I", "J", "K"}),
    "historical": frozenset({"AD", "Q", "Q1", "Q2", "Q3", "Q4", "B", "U", "U1", "U2", "U3", "AB", "D"}),
}

CRITICAL_P0_IDS = DIMENSION_SCENARIOS["revenue"] | DIMENSION_SCENARIOS["irreversible"] | DIMENSION_SCENARIOS["cross_system"]

DOWNGRADE_KEYWORDS: dict[str, tuple[str, ...]] = {
    "form_validation": ("格式校验", "必填", "validation only", "纯校验"),
    "rule_branches": ("排列组合", "各分支", "权限判断", "价格计算"),
    "ui_copy_only": ("热力图", "语言切换", "文案", "样式", "展示", "免责", "privacy", "locale"),
}

FORCE_P2 = frozenset({"H"})
EXPERIMENTAL_P2 = frozenset({"AA", "AL", "AM", "R"})
UI_DOMINANT_P2 = frozenset({"G", "O", "W", "V"})


@dataclass
class Step:
    sid: str
    raw: str
    coverage: str = ""
    subs: list[str] = field(default_factory=list)


@dataclass
class Section:
    sid: str
    title: str
    meta: str = ""
    steps: list[Step] = field(default_factory=list)
    prose: list[str] = field(default_factory=list)


def section_blob(sec: Section) -> str:
    parts = [sec.title, sec.meta]
    for st in sec.steps:
        parts.append(st.raw)
        parts.extend(st.subs)
    return " ".join(parts).lower()


def keyword_hit(blob: str, keyword: str) -> bool:
    k = keyword.lower()
    if len(k) <= 5 and k.replace("-", "").isalpha():
        return re.search(rf"(?<![a-z0-9/]){re.escape(k)}(?![a-z0-9/])", blob) is not None
    return k in blob


def downgrade_hits(blob: str) -> list[str]:
    found: list[str] = []
    for label, keys in DOWNGRADE_KEYWORDS.items():
        if any(keyword_hit(blob, k) for k in keys):
            found.append(label)
    return found


def dimension_hits(sec: Section, *, keyword_dims: frozenset[str] | None = None) -> list[str]:
    sid = sec.sid
    base = sid.split("-")[0]
    blob = section_blob(sec)
    hits: list[str] = []
    allow_kw = keyword_dims or frozenset(DIMENSION_LABELS)
    for dim, label in DIMENSION_LABELS.items():
        ids = DIMENSION_SCENARIOS.get(dim, frozenset())
        keys = DIMENSION_KEYWORDS.get(dim, ())
        id_hit = sid in ids or base in ids
        kw_hit = dim in allow_kw and any(keyword_hit(blob, k) for k in keys)
        if id_hit or kw_hit:
            hits.append(label)
    return list(dict.fromkeys(hits))


def classify_priority(sec: Section) -> tuple[str, str]:
    sid = sec.sid

    if sid in FORCE_P2 or "已废弃" in sec.title:
        return "P2", "已废弃；不进 E2E 必跑集"

    base = sid.split("-")[0]
    if sid in UI_DOMINANT_P2 or base in UI_DOMINANT_P2 or sid in EXPERIMENTAL_P2 or base in EXPERIMENTAL_P2:
        if sid in CRITICAL_P0_IDS or base in CRITICAL_P0_IDS:
            hits = dimension_hits(sec)
            return "P0", "；".join(hits)
        reason = "实验/回访/验证切片" if sid in EXPERIMENTAL_P2 or base in EXPERIMENTAL_P2 else "展示/文案/自动欢迎为主"
        down = downgrade_hits(section_blob(sec))
        if down:
            reason += f"；下沉信号：{', '.join(down)}"
        return "P2", reason + "；E2E 只保一条主干或人工"

    hits = dimension_hits(sec, keyword_dims=frozenset({"revenue", "irreversible", "cross_system", "historical"}))
    hf_ids = DIMENSION_SCENARIOS["high_frequency"]
    if sid in hf_ids or base in hf_ids:
        if DIMENSION_LABELS["high_frequency"] not in hits:
            hits.append(DIMENSION_LABELS["high_frequency"])

    if hits:
        return "P0", "；".join(hits)

    blob = section_blob(sec)
    down = downgrade_hits(blob)
    strong_down = [d for d in down if d in {"form_validation", "rule_branches"}]
    if strong_down:
        return "P2", f"下沉到单测/集成：{', '.join(strong_down)}"

    return "P1", "正式用户路径；E2E 保一条主干，分支下沉单测/集成"


def priority(sec: Section) -> str:
    return classify_priority(sec)[0]


def priority_rationale(sec: Section) -> str:
    level, reason = classify_priority(sec)
    return f"{level} · {reason}"


def writing_standards() -> str:
    return f"""## 编写规范 · E2E 优先级（P0 / P1 / P2）

本文件步骤上的 **优先级** = **E2E 必须覆盖的关键路径分级**，不是「0–1 秒补句」排期表（后者仍见 `SCENARIO_TESTS.md` 文首「存量补句优先级」）。

### 关键业务路径（满足 **任意一条** → **P0**）

| 判断维度 | 具体标准 |
|---|---|
| 收入/资金相关 | 涉及支付、下单、退款、订阅计费 |
| 不可逆或高代价 | 操作失败会导致数据丢失、误删、误发（如邮件群发、批量导入） |
| 跨系统链路 | 需要多个服务/第三方协同才能完成；单元测试无法覆盖「接口对接是否真的通」 |
| 高频且用户量大 | 日活用户中超过某阈值（如 50%+）会走到的路径，如登录、首页加载、Sit/Companion 主路径 |
| 历史上出过事故 | 之前线上出过 bug 或客诉的功能点，优先回归覆盖 |

### 不该进 E2E、应下沉到单元/集成测试的典型信号

| 信号 | 处理方式 |
|---|---|
| 纯前端表单校验（必填、格式校验） | 单测 / 组件测试 |
| 后端业务规则分支（价格计算、权限判断排列组合） | 集成测试覆盖全分支；E2E 只验证「走通一条主干路径」 |
| UI 样式/文案类断言 | 除非该文案是法律/合规要求必须展示；否则不进 E2E 必跑集 |

### 自动打标规则（生成器执行）

1. 扫描场景 ID + 标题 + meta + 步骤正文，命中上表 **P0 五维任意一条** → **P0**（**高频**维仅认 curated 场景 ID 表，不用 loose 关键词）。
2. 未命中 P0，且场景为 **实验/废弃/展示文案为主**，或命中 **下沉信号** 且无 P0 维度 → **P2**。
3. 其余正式用户路径 → **P1**（E2E 保一条主干，细节分支下沉）。
4. 每个场景区块文首输出 `> **E2E 优先级**：…` 判定依据，便于人工 override。
5. 改 `SCENARIO_TESTS.md` 后须重跑：`python3 focus-tiger/scripts/generate-scenario-tests-gwt.py`。

Agent 写/改场景时的强制规则见 `.cursor/rules/focus-tiger-scenario-gwt-priority.mdc`（`RULES_INDEX` → `scenario-gwt-priority`）。

---

"""


def parse_cov(t: str) -> str:
    m = re.search(r"\*\[(.*?)\]\*", t, re.DOTALL)
    return m.group(1).strip() if m else ""


def clean(t: str) -> str:
    t = re.sub(r"\s*\*\[.*?\]\*", "", t, flags=re.DOTALL)
    t = re.sub(r"\*\*([^*]+)\*\*", r"\1", t)
    return t.strip()


def cov_note(cov: str, meta: str) -> str:
    blob = f"{cov} {meta}"
    if not blob.strip():
        return "无自动化标注"
    found: list[str] = []
    for m in re.finditer(r"`?([a-zA-Z0-9_./-]+\.(?:test|spec)\.js[^`\s]*)`?", blob):
        found.append(f"已在 `{m.group(1)}` 覆盖")
    if "scenario-smoke.test.js" in blob and not found:
        found.append("已在 `scenario-smoke.test.js` 覆盖")
    if "仍须人工" in blob or "未覆盖" in blob:
        found.append("完整链路仍须人工")
    if "非" in blob and "DOM" in blob:
        found.append("E2E 未完整覆盖，此处 smoke/跳过")
    return "；".join(dict.fromkeys(found)) if found else blob[:160]


def url_for(raw: str) -> str:
    r = raw.lower()
    checks = [
        ("confide=1", "http://localhost:5173/?product=1&confide=1"),
        ("entitlementmock=subscription", "http://localhost:5173/?product=1&entitlementMock=subscription"),
        ("reflectioncompanion=1", "http://localhost:5173/?product=1&reflectionCompanion=1&sessionMinutes=1"),
        ("wellnessfirst=1", "http://localhost:5173/?product=1&wellnessFirst=1&flowerWelcome=0"),
        ("desktop:dev", "Electron desktop:dev + ?product=1"),
    ]
    for k, v in checks:
        if k in r:
            return v
    m = re.search(r"sessionminutes=(\d+)", r)
    if m:
        return f"http://localhost:5173/?product=1&sessionMinutes={m.group(1)}"
    return "http://localhost:5173/?product=1"


def gwt(sec: Section, step: Step) -> tuple[list[str], list[str], list[str], bool]:
    raw = clean(step.raw)
    cl = False
    g = [f"页面 URL：{url_for(raw)}"]

    if any(k in raw for k in ("零完成", "当日零", "day1", "清库")):
        g.append("localStorage 当日练习完成记录为空（`DailyCompletionStore.hasCompletedToday()` 为 false）")
    if re.search(r"\bIdle\b|处于 Idle|回 Idle", raw) and "Focusing" not in raw:
        g.append("Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）")
    if "Focusing" in raw or sec.sid in {"B", "X", "AK", "AB"}:
        if sec.sid in {"B", "X", "AK", "AB"} or "HUD" in raw or "Rise" in raw:
            g.append("处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）")
    if sec.sid == "D" or "dormant" in raw.lower() or "≥ 2 小时" in raw or "DORMANT" in raw:
        g.append("（睡态）`focus-tiger.focus-session-end.v1.lastEndedAt` 为 ≥2h 前 epoch ms，且浏览器 tab 曾 hidden ≥2h")
        cl = True
    if "A、B" in raw or "两独立" in raw:
        g.append("两个隔离 browser profile：用户 A / B 已加入同一 Focus Circle")
        cl = True

    w: list[str] = []
    t: list[str] = []

    def emit(r: str) -> None:
        r = r.strip(" ；;")
        if not r:
            return
        if "→" in r:
            a, b = r.split("→", 1)
            w.append(a.strip())
            t.append(b.strip())
            return
        if re.match(r"^(打开|导航|访问)", r):
            w.append(f"导航至 {url_for(r)}")
            rest = re.sub(r"^打开[^。；;]*[。；;]?\s*", "", r)
            if rest:
                emit(rest)
            return
        if re.match(r"^(点击|点选|点|轻点|再点)", r):
            w.append(r.rstrip("。"))
            return
        if re.match(r"^(切到|切回|切换)", r):
            w.append(r.rstrip("。"))
            return
        if re.match(r"^(输入|提交|选择|设|关闭|刷新|Share|Leave|Rise|Sit|Continue|Skip)", r):
            w.append(r.rstrip("。"))
            return
        if re.search(r"(应|不得|不应|须|必须|禁止|可见|出现|隐藏|仍在|没有)", r):
            t.append(r.rstrip("。"))
        else:
            t.append(r.rstrip("。"))

    emit(raw)
    for sub in step.subs:
        emit(clean(sub.lstrip("- ")))

    if not w and t:
        w.append("（无额外用户操作）")
    if not t:
        t.append("（Then 断言见原文；信息不足见待澄清清单）")
        cl = True

    if any(k in raw for k in ("模拟", "DEV", "实验室", "拨 ", "约 ", "两独立", "127.0.0.1")):
        cl = True
    return g, w, t, cl


def flush(cur: Section | None, out: list[Section]) -> Section | None:
    if cur and (cur.steps or cur.prose):
        out.append(cur)
    return None


def sid_from_heading(line: str, is_h2: bool) -> tuple[str, str]:
    text = line[3:].strip() if is_h2 else line[4:].strip()
    if is_h2:
        m = re.match(r"场景\s+([A-Z0-9]+)\s*[:：]\s*(.+)", text)
        if m:
            return m.group(1), m.group(2).strip()
        return "?", text
    m = re.match(r"^([A-Z0-9]+)\s*·\s*(.+)", text)
    if m:
        return m.group(1), text
    m = re.match(r"^(P[123]|Q[1-4]|U[1-3]|Y[12])\s*·", text)
    if m:
        return m.group(1), text
    if "Slice" in text or "验收脚本" in text:
        slug = re.sub(r"[^A-Za-z0-9]+", "-", text)[:28].strip("-")
        return slug.upper()[:12], text
    if "用户测试步骤" in text:
        return "B", text
    return re.sub(r"\W+", "-", text)[:16], text


def parse(text: str) -> list[Section]:
    out: list[Section] = []
    cur: Section | None = None
    meta: list[str] = []
    in_supp = False

    for line in text.splitlines():
        if line.startswith("## 调试强制触发") or re.match(r"## 2026-", line):
            cur = flush(cur, out)
            break

        if line.startswith("## 建议补充"):
            cur = flush(cur, out)
            in_supp = True
            continue

        if in_supp and line.startswith("| **"):
            cols = [c.strip() for c in line.strip("|").split("|")]
            if len(cols) >= 2:
                sid = cols[0].strip("*")
                meta_col = cols[2] if len(cols) > 2 else ""
                if "已升格" in meta_col:
                    continue
                if any(s.sid == sid for s in out):
                    continue
                out.append(
                    Section(
                        sid=sid,
                        title=cols[1],
                        meta=meta_col,
                        steps=[Step(f"{sid}-1", cols[1], coverage=meta_col)],
                    )
                )
            continue
        if in_supp and line.startswith("---"):
            in_supp = False
            continue

        if line.startswith("## 场景 "):
            cur = flush(cur, out)
            sid, title = sid_from_heading(line, True)
            cur = Section(sid=sid, title=title)
            meta = []
            continue

        if line.startswith("### "):
            sub = line[4:].strip()
            if sub in {
                "频率门槛（先记住，否则会以为「坏了」）",
                "为何默认 `http://localhost:5173/` 测不了真实切页 Re-focus",
                "DEV 辅助（勿当生产路径）",
            }:
                continue
            sid, title = sid_from_heading(line, False)
            if cur and cur.sid == "A" and "验收脚本" in title:
                cur = flush(cur, out)
                cur = Section(sid="A-ACCEPT", title=title)
                meta = []
                continue
            if cur and cur.sid == "B" and "用户测试步骤" in title:
                meta = cur.meta
                continue
            cur = flush(cur, out)
            cur = Section(sid=sid, title=title)
            meta = []
            continue

        if cur is None:
            continue

        if line.startswith(">"):
            meta.append(line.lstrip("> ").strip())
            cur.meta = "\n".join(meta)
            continue
        if line.strip() == "---":
            continue

        if cur.sid == "A-ACCEPT" and line.startswith("**"):
            cur.prose.append(line.strip())
            continue

        m = re.match(r"^(\d+[a-z]?)\.\s+(.*)", line)
        if m:
            n, rest = m.group(1), m.group(2)
            cur.steps.append(Step(f"{cur.sid}-{n}", rest, parse_cov(rest)))
            continue

        if cur.steps and line.startswith("   ") and not line.strip().startswith("*["):
            cur.steps[-1].subs.append(line.strip())

    flush(cur, out)

    if not any(s.sid == "H" for s in out):
        out.insert(
            next(i for i, s in enumerate(out) if s.sid == "G") + 1,
            Section(
                sid="H",
                title="正式瞳孔跟随（已废弃）",
                meta="EyeTracking no-op",
                steps=[Step("H-1", "已废弃；若仍见瞳孔跟鼠标则报 bug")],
            ),
        )

    ag0 = (
        "Electron 宽屏 Confide 问 How long have I practiced? / 练了多久 → "
        "`[data-testid=confide-to-yin-reply]` `data-source=practice_facts`，数字须对 Journey Log。"
    )
    if not any(s.sid == "AG-0" for s in out):
        idx = next((i for i, s in enumerate(out) if s.sid == "AG"), len(out))
        out.insert(
            idx,
            Section(
                sid="AG-0",
                title="AG · Slice 0（练习字段 · 已关单参考）",
                meta="confidePracticeFacts · desktopCompanionL2Route",
                steps=[Step("AG-0-1", ag0, coverage="confidePracticeFacts")],
            ),
        )

    if not any(s.sid == "P3" for s in out):
        idx = next((i for i, s in enumerate(out) if s.sid == "P2"), len(out)) + 1
        out.insert(
            idx,
            Section(
                sid="P3",
                title="P3 · 忙碌期策略（suppress · 对照）",
                meta="busyPolicy: suppress · SB-04",
                steps=[
                    Step(
                        "P3-1",
                        "到点横幅已出现 → Sit 开 Focusing → 横幅立刻隐藏；Rise 回 Idle 且仍满足条件 → 可再次出现（若本页未 dismiss）",
                        coverage="e2e/in-app-reminder.spec.js Focusing suppress",
                    ),
                ],
            ),
        )
    return out


def render(sec: Section, clarify: list[str]) -> str:
    pri = priority(sec)
    rationale = priority_rationale(sec)
    o = [f"## 场景 {sec.sid}：{sec.title}", ""]
    o.append(f"> **E2E 优先级**：{rationale}")
    if sec.meta:
        for line in sec.meta.splitlines():
            o.append(f"> {line[:350]}{'…' if len(line) > 350 else ''}")
    o += ["", "### 步骤总览", "", "| 步骤 ID | 优先级 | 覆盖 | 摘要 |", "|---|---|---|---|"]
    for st in sec.steps:
        o.append(
            f"| {st.sid} | {pri} | {cov_note(st.coverage, sec.meta)[:45]} | {clean(st.raw)[:50].replace('|', '/')} |"
        )
    for i, p in enumerate(sec.prose, 1):
        o.append(f"| {sec.sid}-P{i} | {pri} | 人工 QA | {p[:40]} |")
    o += ["", "### Given-When-Then 明细", ""]
    for st in sec.steps:
        g, w, t, cl = gwt(sec, st)
        if cl:
            clarify.append(f"{st.sid} · {clean(st.raw)[:100]}")
        o += [
            f"#### {st.sid}",
            "",
            f"- **优先级**：{pri}（{classify_priority(sec)[1]}）",
            f"- **覆盖**：{cov_note(st.coverage, sec.meta)}",
            "",
            "**Given**",
        ]
        o += [f"- {x}" for x in g]
        o += ["", "**When**", *[f"- {x}" for x in w], "", "**Then**", *[f"- {x}" for x in t], ""]
    for i, p in enumerate(sec.prose, 1):
        clarify.append(f"{sec.sid}-P{i} · 验收 prose 需拆 DEV reset + 各断言")
        o += [
            f"#### {sec.sid}-P{i}",
            "",
            f"- **优先级**：{pri}（{classify_priority(sec)[1]}）",
            "- **覆盖**：人工 QA",
            "",
            "**Given**",
            "- DEV 实验室执行「重置全部本地状态」",
            "- 硬刷新 `http://localhost:5173/?product=1`",
            "",
            "**When**",
            f"- {p}",
            "",
            "**Then**",
            "- 子句内所有可见/不得断言成立",
            "",
        ]
    o.append("---\n")
    return "\n".join(o)


def main() -> None:
    sections = parse(SRC.read_text(encoding="utf-8"))
    clarify: list[str] = []
    today = date.today().isoformat()
    head = f"""# SCENARIO_TESTS_GWT.md — Given-When-Then 场景剧本

生成日期：{today}  
源文档：`focus-tiger/docs/SCENARIO_TESTS.md`  
备份：`focus-tiger/docs/archive/SCENARIO_TESTS.backup-2026-09-23-pre-gwt.md`  

{writing_standards()}"""
    body = "".join(render(s, clarify) for s in sections)
    foot = "## 待澄清清单\n\n" + "\n".join(f"- {x}" for x in sorted(set(clarify))) + "\n"
    n = sum(len(s.steps) for s in sections)
    foot += f"\n---\n\n_场景 {len(sections)} · 步骤 {n} · 待澄清 {len(set(clarify))}_\n"
    OUT.write_text(head + body + foot, encoding="utf-8")
    print(len(sections), n, len(set(clarify)))


if __name__ == "__main__":
    main()
