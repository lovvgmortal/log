
export interface ContentPiece {
  id: string;
  title: string;
  description: string;
  script: string; // Used for Transcript
  comments?: string; // NEW: Audience feedback
  url?: string; // NEW: YouTube Link
  uniquePoints?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  color?: string;
}

// NEW: User Settings from Supabase
export interface UserSettings {
  openrouter_key?: string;
  youtube_key?: string;
}

// NEW: Detailed Section Structure for DNA (Phase 1 Upgrade)
export interface DNASectionDetail {
  section_name: string;                    // Required - e.g., "Hook", "Build-up", "Climax"

  // Timing (optional)
  timing?: string;                         // e.g., "0-8s"
  word_count_range?: string;               // e.g., "40-60"

  // Style per-section (optional)
  tone?: string;                           // e.g., "Khẩn trương, hỗn loạn"
  language_style?: string;                 // e.g., "Casual, slang"
  pacing?: string;                         // e.g., "Cực nhanh, câu < 5 từ"

  // Content (optional)
  content_focus?: string;                  // e.g., "Tạo urgency + tension"
  must_include?: string[];                 // e.g., ["Âm thanh mạnh", "Câu hỏi"]

  // Audience (optional)
  audience_reaction?: string;              // e.g., "Shock + relatability"
  value_delivered?: string;                // e.g., "Instant entertainment"
  audience_value?: string;                 // NEW: Specific value viewer gets (MANDATORY for DNA extraction)
  audience_interaction?: string;           // NEW: Specific CTA or engagement prompt

  // Viral (optional)
  viral_triggers?: string;                 // e.g., "Âm thanh 'Rầm!' + tên học sinh"
  micro_hook?: string;                     // NEW: Small hook at start of section to keep retention

  // Retention/Open Loops (optional)
  open_loop?: string;                      // e.g., "Promise twist ở cuối"
  close_loop?: string;                     // e.g., "Deliver twist đã promise"

  // Transitions (optional)
  transition_in?: string;                  // e.g., "In medias res"
  transition_out?: string;                 // e.g., "Lệnh 'Trả lời ngay!'"

  // Anti-patterns (optional)
  avoid_patterns?: string[];               // e.g., ["Không giải thích context"]

  // Strategic repetition (optional)
  allowed_repetition?: string;             // e.g., "Có thể lặp âm thanh"
  repetition_method?: string;              // e.g., "Escalation"
}

// DNA Structure Analysis
export interface ScriptDNA {
  id: string;
  name: string;
  source_urls?: string[];
  user_notes?: string;
  niche?: string; // NEW: The specific industry or category (e.g. "Crypto", "Health", "Gaming")
  analysis: {
    // Legacy global fields (backward compatible)
    pacing: string;
    tone: string;

    // UPGRADED: structure_skeleton now supports both formats
    // Legacy: string[] like ["Hook", "Intro", "Body"]
    // New: DNASectionDetail[] with full details
    structure_skeleton: string[] | DNASectionDetail[];

    // --- PHASE 2 UPGRADE: DEEP QUALITATIVE ANALYSIS ---

    // 1. HOOK ANGLE (REPLACES simple "hook_technique")
    // "No Evidence, No Insight" Rule applied here
    hook_angle: {
      type: string;        // e.g. "Negative", "Curiosity", "Benefit", "Paradox"
      description: string; // The "Psychological Deconstruction" with EVIDENCE.
    };

    // 2. LINGUISTIC FINGERPRINT (REPLACES simple "linguistic_style")
    linguistic_fingerprint: {
      role_persona: string;      // e.g. "The Rebel", "The Wise Mentor"
      tone_description: string;  // Detailed evidence-based description
      keywords: string[];        // Signature words/phrases
      sentence_structure: string; // e.g. "Short, punchy, no conjunctions"
    };

    // 3. PATTERN RECOGNITION (The 70/30 Rule)
    // REPLACES "successful_patterns"
    core_patterns: string[];      // The 70% (Safe, Standard Rules)
    viral_x_factors: string[];    // The 30% (Anomalies, Outliers - The "Magic")

    retention_tactics: string[];
    audience_psychology: string;

    // --- NEW: UPGRADED INTELLIGENCE ---
    audience_sentiment: {
      high_dopamine_triggers: string[];
      confusion_points: string[];
      objections: string[];
    };
    contrastive_insight: string;
    // ----------------------------------

    // DEPRECATED / REMOVED in favor of above:
    // linguistic_style: string; (Replaced by fingerprint)
    // successful_patterns: string[]; (Replaced by core_patterns)
    // hook_technique: string; (Replaced by hook_angle)

    content_gaps: string[];
    viral_triggers: string[]; // Keep for specific moments
    flop_reasons: string[];

    // NEW: Global optional fields
    target_platform?: string;              // e.g., "YouTube Shorts"
    target_length?: string;                // e.g., "60-90 giây"
    target_word_count_range?: string;      // NEW: e.g., "3000-3400" - calculated from viral scripts
    overall_vibe?: string;                 // e.g., "Comedy, classroom humor"
  };
  raw_transcript_summary: string;
}

export interface StyleAnalysis {
  core_formula: string;
  narrative_phases: { phase: string; purpose: string; duration_weight: string }[];
  pacing_map: { climax_points: string[]; speed_strategy: string; pattern: string };
  hook_hierarchy: { main_hook: string; micro_hooks: string[]; psychological_anchor: string };
  emotional_arc: { triggers: string[]; energy_flow: string; payoff_moment: string };
  linguistic_fingerprint: { pov: string; dominant_tones: string[]; vocabulary_style: string };
}

export interface BlueprintSection {
  id: string;
  title: string;
  type: string;
  purpose: string;
  hook_tactic: string;
  micro_hook?: string;
  emotional_goal: string;
  pacing_instruction: string;
  pov_instruction: string;
  tone_instruction: string;
  retention_loop: string;
  content_plan: string;
  word_count_target: number;
  generated_content?: string;
  custom_script_prompt?: string;
  dna_section_detail?: DNASectionDetail; // NEW: Phase 1 Upgrade
}

export interface ScriptBlueprint {
  analysis: StyleAnalysis;
  pitfalls: string[];
  sections: BlueprintSection[];

  // --- NEW: AUDIENCE SIMULATOR ---
  audience_simulation: {
    newbie_perspective: string;
    expert_perspective: string;
    hater_critique: string; // The "Anti-thesis" check
    final_verdict: string;
  };
  // -------------------------------

  critique: string;
}

// --- NEW: SCORING TYPES ---
export interface ScoringCriterion {
  id: string;
  name: string;
  description: string;
}

export interface ScoringTemplate {
  id: string;
  name: string;
  criteria: ScoringCriterion[];
}

export interface ScoreItem {
  criteria: string;
  score: number; // 0-100
  reasoning: string;
  improvement_tip: string;
}

export interface ScoringResult {
  total_score: number;
  breakdown: ScoreItem[];
  overall_feedback: string;
  timestamp: number;
  source_info?: string; // NEW: Tracks "DNA: [Name]" or "Rule: [Name]"
  contentHash?: string; // Hash of content when scored - detects content changes
}
// --------------------------

export interface ScriptSection {
  id: string;
  title: string;
  content: string;
  type: string;
  scoringResult?: ScoringResult; // NEW: Store score per section
}

export interface OptimizedResult {
  blueprint: ScriptBlueprint;
  rewritten: {
    title: string;
    description: string;
    tags: string;
    script_sections: ScriptSection[];
    explanation_of_changes: string;
  };
  fullScriptScore?: ScoringResult; // NEW: Store score of the full script with the version
}

// --- NEW: VERSION HISTORY ---
export interface VersionedItem<T> {
  id: string;
  timestamp: number;
  name: string; // e.g. "Draft 1", "Draft 2"
  data: T;
}
// ----------------------------

export type Step = 'input' | 'dna_selection' | 'blueprint' | 'result';
export type CreationMode = 'rewrite' | 'idea' | 'extract_dna';
export type OutputLanguage = 'Vietnamese' | 'English' | 'Spanish' | 'Japanese' | 'Korean';

export interface Folder {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  folderId?: string;
  name: string;
  updatedAt: number;
  data: {
    mode: CreationMode | null;
    language: OutputLanguage;
    userDraft: ContentPiece;
    virals: ContentPiece[];
    flops: ContentPiece[];
    targetWordCount: string;
    customStructurePrompt?: string;
    customBlueprintPrompt?: string;

    selectedDNA?: ScriptDNA;
    availableDNAs: ScriptDNA[];

    selectedModel?: string; // DEPRECATED: Use models.* instead

    // NEW: Per-step model selection
    models?: {
      dnaExtraction?: string;
      blueprint?: string;
      scriptGeneration?: string;
      refinement?: string;
    };

    scoringTemplates: ScoringTemplate[];
    selectedScoringTemplateId?: string; // NEW: Track active template for generation
    lastScore?: ScoringResult;

    blueprint: ScriptBlueprint | null;
    blueprintVersions?: VersionedItem<ScriptBlueprint>[]; // NEW: History

    result: OptimizedResult | null;
    resultVersions?: VersionedItem<OptimizedResult>[]; // NEW: History

    step: Step;
  }
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
}

export interface ChannelProfile {
  name: string;
  niche: string;
  audience: string;
  voice: string;
}

export interface ScriptNode {
  id: string;
  type: string;
  description: string;
  wordCountTarget: number;
  content: string;
}

export interface CreditUsage {
  usage: number;
  limit: number | null;
  is_free_tier: boolean;
}

export type RoutePath = '/home' | '/home/dashboard' | '/home/creating' | '/home/notes' | '/home/pricing' | '/home/dna';
