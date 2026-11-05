import difflib
from dataclasses import dataclass

@dataclass
class ScoringWeights:
    # These weights equal 1.0 (100%)
    w_semantic: float = 0.50
    w_tradition: float = 0.20
    w_morphology: float = 0.15
    w_frequency: float = 0.15

def calculate_morphology(source: str, target: str) -> float:
    """
    Calculates morphological overlap (M) using SequenceMatcher.
    Helps catch phonetic transliterations and partial string matches.
    """
    if not source or not target:
        return 0.0
    return difflib.SequenceMatcher(None, source.lower(), target.lower()).ratio()

def compute_confidence(
    semantic_score: float,
    tradition_match: bool,
    source_term: str,
    target_term: str,
    frequency_weight: float = 0.5, # Default baseline frequency
    weights: ScoringWeights = ScoringWeights()
) -> float:
    """
    Patent Formula: R = f(S, A, M, C)
    """
    # A: Tradition Alignment
    A = 1.0 if tradition_match else 0.5
    
    # M: Morphological Overlap
    M = calculate_morphology(source_term, target_term)
    
    # R: Final Composite Score
    R = (
        weights.w_semantic * semantic_score +
        weights.w_tradition * A +
        weights.w_morphology * M +
        weights.w_frequency * frequency_weight
    )
    
    return round(min(R, 1.0), 4)