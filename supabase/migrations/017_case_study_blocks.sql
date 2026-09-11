-- ──────────────────────────────────────────────────────────────────────────
-- 017_case_study_blocks.sql
--
-- Widget/block model for case study detail pages. This lets each UI card or
-- section be edited independently while the public renderer preserves the
-- legacy manufacturing case-study visual style.
--
-- Rollback: 017_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

CREATE TABLE IF NOT EXISTS tbrain_landing.case_study_blocks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id uuid NOT NULL REFERENCES tbrain_landing.case_studies(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN (
    'metrics_grid',
    'text_card',
    'objective_grid',
    'challenge_cards',
    'qa_framework',
    'process_steps',
    'outcome',
    'cta'
  )),
  title         text,
  subtitle      text,
  content       text,
  config        jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order int NOT NULL DEFAULT 100,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS case_study_blocks_study_order_idx
  ON tbrain_landing.case_study_blocks (case_study_id, is_active, display_order)
  WHERE is_active = true;

ALTER TABLE tbrain_landing.case_study_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS case_study_blocks_select ON tbrain_landing.case_study_blocks;
CREATE POLICY case_study_blocks_select ON tbrain_landing.case_study_blocks
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS case_study_blocks_insert ON tbrain_landing.case_study_blocks;
CREATE POLICY case_study_blocks_insert ON tbrain_landing.case_study_blocks
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('content.create'));

DROP POLICY IF EXISTS case_study_blocks_update ON tbrain_landing.case_study_blocks;
CREATE POLICY case_study_blocks_update ON tbrain_landing.case_study_blocks
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

DROP POLICY IF EXISTS case_study_blocks_delete ON tbrain_landing.case_study_blocks;
CREATE POLICY case_study_blocks_delete ON tbrain_landing.case_study_blocks
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.delete'));

DROP TRIGGER IF EXISTS case_study_blocks_updated_at ON tbrain_landing.case_study_blocks;
CREATE TRIGGER case_study_blocks_updated_at
  BEFORE UPDATE ON tbrain_landing.case_study_blocks
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.touch_updated_at();

WITH manufacturing AS (
  SELECT id FROM tbrain_landing.case_studies WHERE slug = 'manufacturing' LIMIT 1
)
INSERT INTO tbrain_landing.case_study_blocks
  (case_study_id, type, title, subtitle, content, config, display_order, is_active)
SELECT id, type, title, subtitle, content, config::jsonb, display_order, true
FROM manufacturing,
(VALUES
  (
    'metrics_grid',
    NULL,
    NULL,
    NULL,
    $${
      "metrics": [
        {"value": "500", "label": "CAD Drawings"},
        {"value": "15", "label": "Annotation Fields"},
        {"value": "95%+", "label": "Accuracy Rate"},
        {"value": "30", "label": "Days Delivery"}
      ]
    }$$,
    10
  ),
  (
    'text_card',
    'About the Client',
    NULL,
    $$<p>Tbrain partnered with a <span class="font-bold text-blue-600">leading AI-powered manufacturing company</span> valued at nearly <span class="font-bold text-blue-600">$3 billion on NASDAQ</span>.</p><p>This industry leader connects businesses with a vast network of manufacturing partners worldwide, offering services ranging from <span class="font-semibold">CNC machining and 3D printing to injection molding, sheet metal fabrication</span>, serving industries including aerospace, automotive, healthcare, robotics, and consumer products.</p>$$,
    $${"variant":"blue_gradient"}$$,
    20
  ),
  (
    'objective_grid',
    'Project Objective',
    NULL,
    NULL,
    $${
      "items": [
        {"icon":"🎯","title":"Accuracy","body":"At least <span class=\"font-bold text-indigo-600\">95%</span> accuracy rate required","tone":"indigo"},
        {"icon":"⚡","title":"Speed","body":"Strict <span class=\"font-bold text-blue-600\">30-day</span> timeline","tone":"blue"},
        {"icon":"🔧","title":"Solution","body":"Complete <span class=\"font-bold text-purple-600\">turnkey process</span> from scratch","tone":"purple"}
      ]
    }$$,
    30
  ),
  (
    'challenge_cards',
    'The Challenge',
    NULL,
    NULL,
    $${
      "cards": [
        {"icon":"⏱️","title":"Intense Time Pressure & Scale","body":"Process and annotate <span class=\"font-bold text-red-600\">500 complex CAD drawings</span> across <span class=\"font-bold text-red-600\">15 annotation fields</span> within just one month. Manual approaches would cause unacceptable delays and high error rates.","tone":"red"},
        {"icon":"🚫","title":"No Established Process","body":"Client had <span class=\"font-bold text-orange-600\">no formalized annotation platform or workflow</span>, requiring Tbrain to engineer a dedicated solution from the ground up.","tone":"orange"},
        {"icon":"👨‍🔧","title":"Specialized Talent Shortage","body":"Required <span class=\"font-bold text-yellow-600\">deep mechanical engineering expertise</span> for CAD drawing interpretation. Client lacked sufficient in-house subject matter experts.","tone":"yellow"},
        {"icon":"✓","title":"High Quality Standard","body":"Strict mandate requiring <span class=\"font-bold text-purple-600\">minimum 95% accuracy rate</span> to be deemed acceptable for AI training purposes.","tone":"purple"}
      ]
    }$$,
    40
  ),
  (
    'qa_framework',
    'Tbrain''s Strategic Solution',
    NULL,
    $$<p>We designed a comprehensive strategy built on <span class="font-bold text-indigo-600">three foundational pillars</span>: Multi-Layer Quality Assurance, Strategic Platform Integration, and Elite Subject Matter Experts.</p>$$,
    $${
      "frameworkTitle":"5-Layer Quality Assurance Framework",
      "layers":[
        {"num":"Layer 1","label":"MAKER","title":"Annotation Execution","body":"Domain-trained makers perform detailed interpretation and initial annotation across all 15 fields","tone":"blue"},
        {"num":"Layer 2","label":"REVIEW","title":"100% Peer Review","body":"Expert mechanical engineer validates technical accuracy and provides actionable feedback","tone":"green"},
        {"num":"Layer 5","label":"FINAL QA","title":"Client Acceptance","body":"Seamless validation of pre-polished, high-quality data by client team","tone":"purple"}
      ],
      "sampleGateTitle":"Parallel Statistical Quality Gates",
      "sampleGates":[
        {"num":"Layer 3","label":"SAMPLE 1","body":"Independent QA analyst validates random sample","tone":"yellow"},
        {"num":"Layer 4","label":"SAMPLE 2","body":"Concurrent second QA analyst validates separate sample","tone":"orange"}
      ],
      "warning":"⚠️ If either sample fails → Entire batch rejected",
      "solutionCards":[
        {"icon":"🔧","title":"Platform Integration","body":"Leveraged <span class=\"font-semibold\">Labelbox</span> for intelligent workload distribution, collaborative annotation, and complete audit trails","tone":"blue"},
        {"icon":"👨‍🎓","title":"Elite Team Assembly","body":"University lecturers, top-10 US engineering graduates, and Associate Professors with 20+ years experience","tone":"indigo"},
        {"icon":"✓","title":"Quality First","body":"Proprietary validation tools and batched delivery to ensure zero surprises at project conclusion","tone":"purple"}
      ]
    }$$,
    50
  ),
  (
    'process_steps',
    'Implementation Process',
    NULL,
    NULL,
    $${
      "steps":[
        {"number":"1","title":"Project Kick-off & Setup","body":"Deep-dive requirements meetings, Statement of Work (SOW) development, Labelbox configuration, and comprehensive team onboarding","tone":"blue"},
        {"number":"2","title":"Annotation & Review Cycle","body":"Continuous high-velocity loop: Task distribution → Maker annotation (100 drawings/week) → Expert review → Parallel sample testing → QA validation","tone":"indigo"},
        {"number":"3","title":"Finalization & Delivery","body":"Batched submission (5 batches of 100), proprietary tool validation, secure data export, and complete project handover with detailed reporting","tone":"purple"}
      ]
    }$$,
    60
  ),
  (
    'outcome',
    'Outstanding Outcome',
    NULL,
    NULL,
    $${
      "cards":[
        {"value":"95%+","label":"High Pass Rate Achieved","body":"Exceeded the ambitious 95% requirement with exceptionally high accuracy validated by client's rigorous internal checks","tone":"green"},
        {"value":"30","label":"Days On-Time Delivery","body":"All 500 complex drawings completed precisely within strict timeline, preventing costly downstream delays","tone":"blue"}
      ],
      "benefitsTitle":"Client Benefits",
      "benefits":[
        "<span class=\"font-semibold\">Scalable & Replicable Workflow:</span> Established validated process serves as powerful benchmark for ongoing business needs",
        "<span class=\"font-semibold\">Zero Strain on Internal Resources:</span> Client's engineering team remained focused on core innovation and revenue-generating activities",
        "<span class=\"font-semibold\">Turnkey Solution Delivered:</span> Complete end-to-end process from scratch with zero rework required",
        "<span class=\"font-semibold\">AI Initiative Protected:</span> Strategic timeline preserved with absolute confidence in data foundation"
      ]
    }$$,
    70
  ),
  (
    'cta',
    'Need Expert CAD Annotation Services?',
    'Let Tbrain deliver precision-engineered data solutions on enterprise timelines',
    NULL,
    $${"label":"Connect Us Today","href":"https://www.linkedin.com/company/tbrain-ai"}$$,
    80
  )
) AS seed(type, title, subtitle, content, config, display_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM tbrain_landing.case_study_blocks b
  WHERE b.case_study_id = manufacturing.id
);

COMMIT;
