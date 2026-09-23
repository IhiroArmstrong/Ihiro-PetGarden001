#!/usr/bin/env python3
"""Generate SCENARIO_TESTS_GWT.md from SCENARIO_TESTS.md."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "SCENARIO_TESTS.md"
OUT = ROOT / "docs" / "SCENARIO_TESTS_GWT.md"

P0 = {"A", "A-ACCEPT", "B", "D", "I", "J", "K", "N", "Q", "Q1", "Q2", "Q3", "Q4", "AD"}
P2 = {"H", "AA", "AL", "R", "M", "L", "AB", "AJ", "P3"}


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


def priority(sid: str) -> str:
    b = sid.split("-")[0]
    if sid in P0 or b in P0:
        return "P0"
    if sid in P2 or b in P2:
        return "P2"
    return "P1"


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
    o = [f"## 场景 {sec.sid}：{sec.title}", ""]
    if sec.meta:
        o.append(f"> {sec.meta[:350]}{'…' if len(sec.meta)>350 else ''}\n")
    o += ["### 步骤总览", "", "| 步骤 ID | 优先级 | 覆盖 | 摘要 |", "|---|---|---|---|"]
    for st in sec.steps:
        o.append(
            f"| {st.sid} | {priority(sec.sid)} | {cov_note(st.coverage, sec.meta)[:45]} | {clean(st.raw)[:50].replace('|','/')} |"
        )
    for i, p in enumerate(sec.prose, 1):
        o.append(f"| {sec.sid}-P{i} | {priority(sec.sid)} | 人工 QA | {p[:40]} |")
    o += ["", "### Given-When-Then 明细", ""]
    for st in sec.steps:
        g, w, t, cl = gwt(sec, st)
        if cl:
            clarify.append(f"{st.sid} · {clean(st.raw)[:100]}")
        o += [f"#### {st.sid}", "", f"- **优先级**：{priority(sec.sid)}", f"- **覆盖**：{cov_note(st.coverage, sec.meta)}", "", "**Given**"]
        o += [f"- {x}" for x in g]
        o += ["", "**When**", *[f"- {x}" for x in w], "", "**Then**", *[f"- {x}" for x in t], ""]
    for i, p in enumerate(sec.prose, 1):
        clarify.append(f"{sec.sid}-P{i} · 验收 prose 需拆 DEV reset + 各断言")
        o += [
            f"#### {sec.sid}-P{i}",
            "",
            f"- **优先级**：{priority(sec.sid)}",
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
    head = """# SCENARIO_TESTS_GWT.md — Given-When-Then 场景剧本

生成日期：2026-09-23  
源文档：`focus-tiger/docs/SCENARIO_TESTS.md`  
备份：`focus-tiger/docs/archive/SCENARIO_TESTS.backup-2026-09-23-pre-gwt.md`  

---

"""
    body = "".join(render(s, clarify) for s in sections)
    foot = "## 待澄清清单\n\n" + "\n".join(f"- {x}" for x in sorted(set(clarify))) + "\n"
    n = sum(len(s.steps) for s in sections)
    foot += f"\n---\n\n_场景 {len(sections)} · 步骤 {n} · 待澄清 {len(set(clarify))}_\n"
    OUT.write_text(head + body + foot, encoding="utf-8")
    print(len(sections), n, len(set(clarify)))


if __name__ == "__main__":
    main()
