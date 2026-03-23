"""
TurnEngine — Manages structured turn-taking in the council.

Supports multiple strategies:
- ROUND_ROBIN: agents take turns in fixed order
- CONDUCTOR_LED: meta-agent decides who speaks next
- REACTIVE: any agent can respond based on relevance scoring
"""

from __future__ import annotations

import enum
from dataclasses import dataclass
from typing import Optional


class TurnStrategy(str, enum.Enum):
    ROUND_ROBIN = "round_robin"
    CONDUCTOR_LED = "conductor_led"
    REACTIVE = "reactive"


@dataclass
class Turn:
    agent_id: str
    agent_name: str
    reason: str = ""


class TurnEngine:
    """
    Determines which agent speaks next in a council session.
    """

    def __init__(
        self,
        agent_ids: list[str],
        agent_names: dict[str, str],
        strategy: TurnStrategy = TurnStrategy.ROUND_ROBIN,
        conductor_id: Optional[str] = None,
    ):
        self.agent_ids = agent_ids
        self.agent_names = agent_names
        self.strategy = strategy
        self.conductor_id = conductor_id
        self._round_robin_index = 0
        self._turn_count = 0
        self._last_speaker: Optional[str] = None

    def next_turn(
        self,
        last_message: Optional[str] = None,
        skip_ids: Optional[list[str]] = None,
    ) -> Turn:
        """
        Return the next agent that should speak.
        """
        skip = set(skip_ids or [])
        eligible = [aid for aid in self.agent_ids if aid not in skip]

        if not eligible:
            eligible = self.agent_ids

        if self.strategy == TurnStrategy.ROUND_ROBIN:
            return self._round_robin(eligible)
        elif self.strategy == TurnStrategy.CONDUCTOR_LED:
            return self._conductor_led(eligible)
        else:
            return self._round_robin(eligible)

    def _round_robin(self, eligible: list[str]) -> Turn:
        if self._round_robin_index >= len(eligible):
            self._round_robin_index = 0
        agent_id = eligible[self._round_robin_index]
        self._round_robin_index = (self._round_robin_index + 1) % len(eligible)
        self._turn_count += 1
        self._last_speaker = agent_id
        return Turn(
            agent_id=agent_id,
            agent_name=self.agent_names.get(agent_id, agent_id),
            reason="round_robin",
        )

    def _conductor_led(self, eligible: list[str]) -> Turn:
        # Conductor speaks every 3rd turn to summarize/redirect
        if self._turn_count % 3 == 2 and self.conductor_id in eligible:
            self._turn_count += 1
            self._last_speaker = self.conductor_id
            return Turn(
                agent_id=self.conductor_id,
                agent_name=self.agent_names.get(self.conductor_id, "Meta-Agent"),
                reason="conductor_checkpoint",
            )
        return self._round_robin(eligible)

    def reset(self) -> None:
        self._round_robin_index = 0
        self._turn_count = 0
        self._last_speaker = None

    @property
    def turn_count(self) -> int:
        return self._turn_count
