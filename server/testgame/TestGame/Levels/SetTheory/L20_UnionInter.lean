import TestGame.Metadata

import Mathlib.Data.Set.Basic
import Mathlib.Algebra.Parity
import Mathlib

Game "TestGame"
World "SetTheory2"
Level 7

Title ""

Introduction
"
Wir haben bereits `∪` und `∩` kennengelernt. Von beiden gibt es auch eine Version für Familien
von Mengen: $\\bigcup_i A_ i$ und $\\bigcap_j B_ j$.

"

open Set

Statement
"" : True := sorry

NewTactics constructor intro rw assumption rcases simp tauto trivial

NewLemmas Subset.antisymm_iff empty_subset
