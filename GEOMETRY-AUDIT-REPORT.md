# Geometry audit and external reference comparison

Audit date: 2026-10-20

## Scope

The current generator supports one idealized open-front rectangular cabinet made from sheet material of uniform nominal thickness. It is not yet a general-purpose furniture generator. The model assumes side panels at full outside height, top and bottom fitted between the sides, and a back panel mounted over the rear edges.

## Independent deterministic test sweep

A separate deterministic script evaluated 100,000 input tuples using the same declared ideal equations. Of these, 99,396 met the geometric preconditions (W > 2t and D > t). All 99,396 accepted cases had positive panel dimensions and satisfied:

- outside width: 2t + (W - 2t) = W
- outside height: H
- outside depth: (D - t) + t = D

No invariant failures were observed in this sweep. This validates the equations under the declared model; it does not validate the correctness of the joint design for every material, nor physical fit, SVG rendering, or printer output.

The application also contains four expected-cut-list regression cases, 1,000 deterministic property cases, and four invalid-input cases. These in-app tests should be executed in a browser or automated test environment as part of a future CI workflow; their presence in source code alone is not evidence that a browser test runner executed them.

## External reference comparison

### Reference A: MiniAntiques1 — Miniature Cupboard PDF Plan, 1:12
Source: https://www.etsy.com/listing/4449308316/miniature-cupboard-pdf-plan-112-scale

Published finished dimensions: width 85 mm, height 70 mm, depth 47 mm. The public listing describes a downloadable PDF with measurements and diagrams, originally made from cedar wood, and says other materials including cardboard may be used.

For a controlled formula comparison, assume the reference's outside dimensions as the target and assume t = 1 mm in our generator. Our ideal model predicts:
- 2 sides: 46 × 70 mm
- top: 83 × 46 mm
- bottom: 83 × 46 mm
- back: 85 × 70 mm

The listing's publicly visible description does not expose its exact panel cut list, joint layout, or material thickness. Therefore this is an outside-dimension comparison, not a verified exact cut-list match.

### Reference B: BaharMiniature — 1:12 Dollhouse Cabinet Template
Source: https://www.etsy.com/listing/4509123342/112-scale-dollhouse-cabinet-template

Published finished dimensions: width 83 mm, height 130 mm, depth 25 mm. The listing describes A4 PDF hand-cut templates and SVG cutting files. Its publicly visible description does not establish the exact cut list, material thickness, or whether its joints match our model.

For a controlled formula comparison, assume t = 1 mm. Our ideal model predicts:
- 2 sides: 24 × 130 mm
- top: 81 × 24 mm
- bottom: 81 × 24 mm
- back: 83 × 130 mm

Again, only the finished outside dimensions are available for comparison. The generated part sizes must not be described as matching the reference's own cut list.

### Reference C: Velvetiny Miniatures — cabinet laser-cut file
Source: https://www.etsy.com/listing/4303997396/svg-file-dollhouse-cabinet-with

The listing states the file is designed for 3 mm material and that dimensions will be off if used with another thickness. This is useful evidence that material thickness is a first-class design parameter. However, the design includes a removable front and is made for laser cutting, so its joint layout is not equivalent to the current open-front cardboard cabinet. It cannot be used as a direct panel-by-panel validation of our current equations.

## Conclusions

1. The outside-dimension equations are internally consistent for the specified joint arrangement.
2. The independent sweep found no arithmetic invariant failures across 99,396 valid cases.
3. The external references show why thickness, joint design, and print settings matter, but their public listings do not provide sufficient equivalent cut-list data for an exact panel-by-panel match.
4. An outside dimension matching a reference is not an independent proof of cut-list accuracy when those outside dimensions are the input to the generator.
5. A genuine external cut-list comparison requires a lawfully accessible, dimensioned reference plan that states material thickness and joint construction. Compare equivalent joints and material conventions only.
6. Remaining validation: browser execution tests, SVG face/edge consistency, generated PDF scale, physical material fit when practical, and more construction variants.

## 3D preview note

Individual panels are displayed as brown 3D-style slabs. Their front-face dimensions come from the canonical parts list. The extrusion is intentionally exaggerated on screen so thin material remains visible; the visible extrusion is not a scale-accurate rendering of thickness. The diagrams are explanatory and must not be used as print-scale cut templates.
