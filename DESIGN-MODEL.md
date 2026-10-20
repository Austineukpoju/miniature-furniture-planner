# Miniature Furniture Generator — Design Model v1

## Status

This document defines the current prototype's idealized geometry. It is a mathematical specification, not a claim of physical validation. The supported design is one open-front rectangular cabinet made from sheet material of uniform thickness.

## Inputs

All dimensions are in millimetres:

- W: requested finished outside width
- H: requested finished outside height
- D: requested finished outside depth
- t: nominal sheet/cardboard thickness

The prototype currently restricts inputs to W and H 10–500 mm, D 5–500 mm, and t 0.2–10 mm. The geometry additionally requires W > 2t and D > t.

## Explicit joint arrangement

1. The two side panels span the full outside height H.
2. The top and bottom panels fit between the inside faces of the side panels.
3. The side, top, and bottom panels form a body whose front-to-rear depth is D − t.
4. The back panel is placed across the rear edges. Its thickness extends the total outside depth by t.
5. No door, drawer, shelf, bevel, blade kerf, glue layer, compression, or material variation is modelled in this version.

This is one particular construction method. Changing the joints or mounting the back inside the cabinet requires a different geometry model and recalculated parts.

## Ideal cut-list equations

| Part | Quantity | Width | Height / depth |
|---|---:|---:|---:|
| Side panels A | 2 | D − t | H |
| Top panel B | 1 | W − 2t | D − t |
| Bottom panel C | 1 | W − 2t | D − t |
| Back panel D | 1 | W | H |

The word “width” in this table means the first rectangle dimension, and “height” means the second rectangle dimension in the cutting pattern. For top and bottom, these correspond to cabinet width and depth, respectively.

## Mathematical invariants

For every accepted input, the design engine must verify:

- The assembled outside width is 2t + (W − 2t) = W.
- The assembled outside height is H.
- The assembled outside depth is (D − t) + t = D.
- Every cut dimension is positive.
- There are five physical panels: two A, one B, one C, and one D.
- The preview, cut list, assembly guide, and exported plan consume the same generated design object; they must not independently reimplement the formulas.

Floating-point comparisons should use a small tolerance. Display formatting must not be used in calculations.

## Example regression cases

### Case 1
Input: W=40, H=50, D=30, t=1 mm.

- A side panels: 2 × 29 × 50 mm
- B top: 1 × 38 × 29 mm
- C bottom: 1 × 38 × 29 mm
- D back: 1 × 40 × 50 mm

### Case 2
Input: W=36, H=45, D=27, t=1 mm.

- A side panels: 2 × 26 × 45 mm
- B top: 1 × 34 × 26 mm
- C bottom: 1 × 34 × 26 mm
- D back: 1 × 36 × 45 mm

### Case 3
Input: W=80, H=100, D=60, t=2 mm.

- A side panels: 2 × 58 × 100 mm
- B top: 1 × 76 × 58 mm
- C bottom: 1 × 76 × 58 mm
- D back: 1 × 80 × 100 mm

## What mathematical tests can and cannot prove

Automated tests can check equations, invalid input rejection, positive cut sizes, repeatable results, and consistency between data views. They cannot establish that a hand-cut edge is square, that the stated cardboard thickness is accurate, that glue adds no dimensional change, or that a browser/printer preserves 100% scale.

The current deterministic in-app checks are useful regression checks, but they are not an independently executed formal proof and do not constitute a physical prototype test. The preview is an illustrative projection, not CAD-grade collision analysis.

## Physical tolerance policy

Do not silently subtract a generic “tolerance” from all parts: that could make the finished outside dimensions wrong. A future version should let the user choose a joint style and fit preference, then apply an explicit, documented allowance only to the mating dimensions affected by that joint. Keep nominal outside dimensions and compensated cut dimensions visible as separate values.

## Reference research policy

Dimensioned cabinet and miniature-making plans can inform construction methods, joint placement, beginner instructions, and print-scale safeguards. They should be treated as reference material, not copied as unverified formulas. Before using a reference to validate this model, record its source, material, joint arrangement, scale, and stated dimensions. Compare equivalent geometry only.

## Next development milestones

1. Replace the preview's decorative faces with a model generated from explicit panel coordinates and thickness.
2. Add automated checks that the preview, cut list, assembly steps, and export all use the same design model.
3. Improve the cutting diagram: panel ID, quantity, dimensions, orientation, edge labels, and clear assembly callouts.
4. Generate a real PDF/SVG export with a 100 mm calibration line, page-fit warnings, and optional tiled output.
5. Add other furniture designs only when each has its own explicit joint model and regression cases.
6. Validate a physical sample when practical; until then, label results “mathematically checked, not physically validated.”
