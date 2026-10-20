# Browser validation and reference-plan audit

Date: 2026-10-20

## Browser testing setup

The repository now includes Playwright tests and a GitHub Actions workflow. On pushes to main and pull requests, GitHub Actions installs Chromium and runs the application in a real browser against the local index.html file.

The browser suite checks:
- initial cut list, 3D face SVG, individual panel cards, and math audit status;
- changing width, height, depth, and thickness updates the preview, cut list, cutting patterns, panel cards, and caption;
- invalid geometry is rejected;
- the tolerance calculator responds;
- the 100 mm calibration SVG and dimensioned cutting-pattern SVGs are present;
- uncaught browser page errors are absent in key flows.

Important status distinction: creating the workflow does not itself mean a successful run has occurred. A green result must be confirmed from the workflow run after GitHub Actions executes it. Browser tests are not a substitute for physical material tests or printer-scale checks.

## 3D geometry audit

The preview uses an isometric projection of cabinet coordinates:
- x: outside width W;
- y: depth, from the front plane y=0 to the rear outside plane y=D;
- z: height from 0 to H;
- carcass depth: D-t;
- back panel: mounted at the rear of the carcass, with thickness extending from y=D-t to y=D.

The revised SVG assigns stable data-face identifiers so browser tests can assert the presence of expected surfaces. Invalid dimensions now clear generated previews and cut patterns so a previous valid plan cannot be mistaken for the current invalid inputs. The preview now explicitly depicts the back's inside face, exterior side faces, top panel and side strips, interior top/bottom/side surfaces, front cut edges, and exposed back thickness edges.

This is still a 2D SVG projection of ideal panel surfaces, not a solid CAD mesh. A visual inspection of the rendered screenshot and edge occlusion remains valuable. Do not describe it as manufacturing-grade CAD.

## External dimensioned reference comparison

Reference: “Free Cupboard Woodworking Plans From One Sheet of Plywood: Complete Cut List Included”
Source: https://freewoodworkingplans4u.com/free-cupboard-woodworking-plans-from-one-sheet-of-plywood-complete-cut-list-included/

The published cut list describes 3/4-inch plywood (t = 0.75 in), sides 47 3/4 × 11 1/4 in (qty 2), top and bottom 22 1/2 × 11 1/4 in (qty 1 each), and back 47 3/4 × 24 in (qty 1). It states that the top/bottom fit between the sides, and the back is attached over the rear so it adds its thickness to the cabinet's outside depth.

For a like-for-like formula comparison, use the reference dimensions:
- outside width W = 24 in;
- outside height H = 47.75 in;
- outside depth D = 12 in (11.25 in carcass + 0.75 in back);
- uniform thickness t = 0.75 in.

The generator's model predicts:
- sides: (D-t) × H = 11.25 × 47.75 in, qty 2;
- top: (W-2t) × (D-t) = 22.5 × 11.25 in, qty 1;
- bottom: 22.5 × 11.25 in, qty 1;
- back: W × H = 24 × 47.75 in, qty 1.

These dimensions match the reference cut list exactly when dimensions are expressed in the same orientation and the reference's nominal 3/4-inch thickness and joint method are assumed. This is a valid equation-level cross-check of the same construction convention, not an independent guarantee of the reference plan's build quality. The reference is full-size woodworking in plywood, not a miniature cardboard plan; its material scale differs, but the joint arrangement is equivalent.

The full-size reference values exceed the app's current 500 mm input maximum for height. To run a proportional end-to-end test within the existing limits, the browser suite scales all reference dimensions by 0.4: W=243.84, H=485.14, D=121.92, t=7.62 mm. The generator should then produce sides 114.3 × 485.14 mm (qty 2), top and bottom 228.6 × 114.3 mm, and back 243.84 × 485.14 mm. Uniform scaling preserves all dimension ratios and the joint equations, so this is a valid proportional cut-list comparison. It does not replace testing the full-size woodworking plan or prove cardboard performance.

## Current limitations and future-proofing

1. Only the open-front cabinet design is supported. Doors, drawers, shelves, grooves, and alternate joint arrangements need distinct geometry rules.
2. Nominal cardboard thickness can vary. Future versions should offer measured thickness, joint style, and fit allowance separately.
3. SVG cutting patterns currently annotate dimensions and are intended to print at actual size; browser print dialog scaling can still change them.
4. Large panels may need tiling or a larger paper size. A future sheet-layout tool should account for label margins, rotations, and material waste.
5. Add a screenshot artifact to CI, visual regression checks, keyboard/accessibility tests, and downloadable PDF validation after the initial browser suite is green.
6. A full CAD-grade solid model and export (e.g. 3MF/STEP) are future work, not current functionality.
