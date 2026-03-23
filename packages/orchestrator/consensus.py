"""
ConsensusEngine — Multi-agent voting and agreement detection.

Phase 1 implements simple majority voting.
Phase 2 will add weighted consensus and BFT-inspired fault tolerance.
"""

from __future__ import annotations

import enum
from dataclasses import dataclass, field
from typing import Optional


class VoteOption(str, enum.Enum):
    AGREE = "agree"
    DISAGREE = "disagree"
    ABSTAIN = "abstain"
    NEEDS_CLARIFICATION = "needs_clarification"


@dataclass
class Vote:
    agent_id: str
    agent_name: str
    option: VoteOption
    rationale: str = ""


@dataclass
class VoteResult:
    topic: str
    votes: list[Vote] = field(default_factory=list)
    consensus_reached: bool = False
    winning_option: Optional[VoteOption] = None
    summary: str = ""

    def to_dict(self) -> dict:
        return {
            "topic": self.topic,
            "consensus_reached": self.consensus_reached,
            "winning_option": self.winning_option.value if self.winning_option else None,
            "summary": self.summary,
            "votes": [
                {
                    "agent_id": v.agent_id,
                    "agent_name": v.agent_name,
                    "option": v.option.value,
                    "rationale": v.rationale,
                }
                for v in self.votes
            ],
        }


class ConsensusEngine:
    """
    Evaluates agreement/disagreement among council members.
    """

    CONSENSUS_THRESHOLD = 0.6  # 60% agreement = consensus

    def tally(self, topic: str, votes: list[Vote]) -> VoteResult:
        """
        Tally votes and determine if consensus was reached.
        """
        result = VoteResult(topic=topic, votes=votes)

        if not votes:
            result.summary = "No votes cast."
            return result

        # Count votes by option
        counts: dict[VoteOption, int] = {}
        for vote in votes:
            counts[vote.option] = counts.get(vote.option, 0) + 1

        total = len(votes)
        abstains = counts.get(VoteOption.ABSTAIN, 0)
        effective_total = total - abstains

        if effective_total == 0:
            result.summary = "All agents abstained."
            return result

        # Find winning option (excluding abstain)
        non_abstain = {k: v for k, v in counts.items() if k != VoteOption.ABSTAIN}
        winning_option = max(non_abstain, key=non_abstain.get)
        winning_count = non_abstain[winning_option]
        ratio = winning_count / effective_total

        result.winning_option = winning_option
        result.consensus_reached = ratio >= self.CONSENSUS_THRESHOLD

        rationale_snippets = [
            f"{v.agent_name}: {v.rationale[:80]}"
            for v in votes
            if v.option == winning_option and v.rationale
        ]

        result.summary = (
            f"{'Consensus' if result.consensus_reached else 'No consensus'}: "
            f"{winning_option.value} ({winning_count}/{effective_total} agents). "
            + (" | ".join(rationale_snippets) if rationale_snippets else "")
        )

        return result

    def detect_from_text(self, agent_responses: dict[str, str]) -> bool:
        """
        Heuristic: check if agent responses show convergent agreement.
        Used as a lightweight alternative to explicit voting.
        """
        agreement_signals = ["agree", "correct", "yes", "good idea", "that works", "confirmed"]
        disagreement_signals = ["disagree", "wrong", "no,", "however,", "but actually", "incorrect"]

        agree_count = 0
        disagree_count = 0

        for response in agent_responses.values():
            lower = response.lower()
            if any(sig in lower for sig in agreement_signals):
                agree_count += 1
            if any(sig in lower for sig in disagreement_signals):
                disagree_count += 1

        total = len(agent_responses)
        if total == 0:
            return False

        return agree_count / total >= self.CONSENSUS_THRESHOLD and disagree_count == 0
