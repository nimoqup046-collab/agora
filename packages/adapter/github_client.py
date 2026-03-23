"""
GitHubClient — GitHub REST API v3 client for AGORA PR automation.

Handles the minimal set of operations needed for Phase 1:
  - Get default branch HEAD SHA (for branching from)
  - Create a new branch
  - Push / update a file on a branch
  - Open a pull request

Branch naming convention: agora/{session_id[:8]}/{agent_id}/{slug}
"""

from __future__ import annotations

import base64
from dataclasses import dataclass
from typing import Optional

import httpx


@dataclass
class PRResult:
    pr_url: str
    pr_number: int
    branch: str
    title: str
    sha: str

    def to_dict(self) -> dict:
        return {
            "pr_url": self.pr_url,
            "pr_number": self.pr_number,
            "branch": self.branch,
            "title": self.title,
            "sha": self.sha,
        }


class GitHubClient:
    """
    Async GitHub REST API client using httpx.
    """

    BASE_URL = "https://api.github.com"

    def __init__(self, token: str, owner: str, repo: str):
        self.owner = owner
        self.repo = repo
        self._http = httpx.AsyncClient(
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            timeout=30.0,
        )

    @property
    def _repo_url(self) -> str:
        return f"{self.BASE_URL}/repos/{self.owner}/{self.repo}"

    # ── Read operations ──────────────────────────────────────────────────────

    async def get_default_branch(self) -> str:
        """Return the repo's default branch name."""
        resp = await self._http.get(self._repo_url)
        resp.raise_for_status()
        return resp.json()["default_branch"]

    async def get_branch_sha(self, branch: str = "main") -> str:
        """Return the HEAD SHA of a branch."""
        resp = await self._http.get(
            f"{self._repo_url}/git/refs/heads/{branch}"
        )
        resp.raise_for_status()
        return resp.json()["object"]["sha"]

    # ── Write operations ─────────────────────────────────────────────────────

    async def create_branch(self, branch_name: str, from_branch: str = "main") -> str:
        """
        Create a new branch from `from_branch`.
        Returns the new branch name.
        """
        sha = await self.get_branch_sha(from_branch)
        resp = await self._http.post(
            f"{self._repo_url}/git/refs",
            json={"ref": f"refs/heads/{branch_name}", "sha": sha},
        )
        resp.raise_for_status()
        return branch_name

    async def push_file(
        self,
        branch: str,
        file_path: str,
        content: str,
        commit_message: str,
    ) -> str:
        """
        Create or update a file on a branch.
        Returns the commit SHA.
        """
        encoded = base64.b64encode(content.encode("utf-8")).decode("utf-8")
        existing_sha = await self._get_file_sha(branch, file_path)

        payload: dict = {
            "message": commit_message,
            "content": encoded,
            "branch": branch,
        }
        if existing_sha:
            payload["sha"] = existing_sha

        resp = await self._http.put(
            f"{self._repo_url}/contents/{file_path}",
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()["commit"]["sha"]

    async def create_pr(
        self,
        branch: str,
        title: str,
        body: str,
        base: Optional[str] = None,
    ) -> PRResult:
        """
        Open a pull request from `branch` → `base` (default: repo default branch).
        Returns a PRResult with the PR URL, number, and commit SHA.
        """
        if base is None:
            base = await self.get_default_branch()

        resp = await self._http.post(
            f"{self._repo_url}/pulls",
            json={
                "title": title,
                "body": body,
                "head": branch,
                "base": base,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return PRResult(
            pr_url=data["html_url"],
            pr_number=data["number"],
            branch=branch,
            title=title,
            sha=data["head"]["sha"],
        )

    # ── Helpers ───────────────────────────────────────────────────────────────

    async def _get_file_sha(self, branch: str, file_path: str) -> Optional[str]:
        """Return the blob SHA of an existing file, or None if it doesn't exist."""
        resp = await self._http.get(
            f"{self._repo_url}/contents/{file_path}",
            params={"ref": branch},
        )
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.json().get("sha")

    async def aclose(self) -> None:
        await self._http.aclose()

    @staticmethod
    def make_branch_name(session_id: str, agent_id: str, slug: str) -> str:
        """
        Deterministic branch name for traceability.
        Format: agora/{session_id[:8]}/{agent_id}/{slug}
        """
        safe_slug = slug.lower().replace(" ", "-")[:40]
        return f"agora/{session_id[:8]}/{agent_id}/{safe_slug}"
