# V5 · Robotics Blog Drafts

5 launch posts drafted as outlines. Each becomes a `/blog/[slug]` entry authored via `/admin` CRUD once approved.

Tag every post with `category = robotics`. Once ≥ 3 posts exist, add a client-side chip filter on `src/app/blog/page.tsx` (BlogList component) that reads `?category=robotics` from the URL and filters the SSR'd list.

## Post index

| # | Slug                                         | Focus                         | Assets                                     |
|---|----------------------------------------------|-------------------------------|--------------------------------------------|
| 1 | anatomy-of-a-physical-ai-capture-pack        | Collect                       | PackDiagram, kit videos                    |
| 2 | eight-models-one-auto-label-pipeline         | Auto-Label                    | body-kpts + masks + descriptions           |
| 3 | fifteen-hard-rules-we-run-on-every-capture   | QC                            | summary.json badge grid + fail examples    |
| 4 | label-studio-humans-on-the-last-mile         | Human QC                      | hitl thumbs                                |
| 5 | zero-trust-delivery-lerobot-plus-rerun-proof | Deliver                       | LerobotPreview + Rerun screenshots         |

Each draft file below contains: title · deck · hero image path · outline · pull-quote candidates · CTA target.
