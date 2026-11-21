#!/usr/bin/env python3
"""task_lib 归类：标题/分支/任务 ID 行才计数；正文随口 T73 不算。"""
import unittest

from task_lib import group_by_task, task_ids


class TaskLibTest(unittest.TestCase):
    def test_title_and_branch(self):
        pr = {
            "title": "[Logic] T73 impl",
            "headRefName": "feature/t73-x",
            "body": "随便提一下任务ID这个词",
            "state": "MERGED",
            "number": 1,
            "mergedAt": "2026-11-02T00:00:00Z",
            "url": "https://example.test/1",
        }
        self.assertEqual(task_ids(pr), ["T73"])

    def test_task_id_line_only(self):
        pr = {
            "title": "chore",
            "headRefName": "docs/ci",
            "body": "任务 ID：T12\n另：不要把这段里的 T99 算进去",
            "state": "OPEN",
            "number": 2,
            "url": "https://example.test/2",
        }
        self.assertEqual(task_ids(pr), ["T12"])

    def test_pets73_not_t73(self):
        pr = {
            "title": "fix PETS73",
            "headRefName": "fix/pets73",
            "body": "任务 ID：无",
            "state": "MERGED",
            "number": 3,
            "mergedAt": "2026-11-02T00:00:00Z",
            "url": "https://example.test/3",
        }
        self.assertEqual(task_ids(pr), [])

    def test_group(self):
        prs = [
            {
                "title": "T1 a",
                "headRefName": "f",
                "body": "",
                "state": "MERGED",
                "number": 10,
                "mergedAt": "2026-01-01T00:00:00Z",
                "url": "u",
            },
            {
                "title": "T1 b",
                "headRefName": "g",
                "body": "",
                "state": "OPEN",
                "number": 11,
                "url": "u",
            },
        ]
        g = group_by_task(prs)
        self.assertEqual([p["number"] for p in g["T1"]["merged"]], [10])
        self.assertEqual([p["number"] for p in g["T1"]["open"]], [11])


if __name__ == "__main__":
    unittest.main()
