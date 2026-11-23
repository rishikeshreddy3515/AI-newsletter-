export const CURATED_FALLBACK_ARTICLES = [
  {
    id: "curated-1",
    title: "OpenAI Engine Behind ChatGPT Latency Optimization",
    url: "https://openai.com/index/chatgpt-latency-optimization",
    source: { name: "OpenAI Research" },
    publication_date: new Date().toISOString(),
    category: "Models & Systems",
    image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200",
    description: "OpenAI details internal tool system improvements, including custom speculative decoding clusters and Codex-guided execution profiling to reduce inference latency across production models.",
    analysis: [
      {
        short_headline: "OpenAI Engine Behind ChatGPT Latency Optimization",
        one_sentence_summary: "OpenAI deployed speculative decoding clusters and compiler optimizations, reducing latency by over 40% on peak workloads.",
        detailed_summary: "OpenAI highlights its internal tool system, the Performance Factory, which uses Codex agents to continuously trace execution paths, identify latency spikes, and auto-submit code fixes to maintain production throughput for ChatGPT. The implementation couples hardware-level tensor cache locality with dynamic batch scheduler adaptations.",
        why_it_matters: "Inference latency is the primary barrier to real-time interactive agents and enterprise voice pipelines. Sub-second model response times unlock natural conversational interactions and lower per-query compute expenditure.",
        editorial_comment: "Speed is the feature everyone feels instantly.",
        importance_score: 95,
        novelty_score: 88,
        is_worth_including: true
      }
    ],
    status: [{ is_read: false, is_saved: false }]
  },
  {
    id: "curated-2",
    title: "DeepMind AlphaGeometry 2 Scales Mathematical Olympiad Reasoning",
    url: "https://deepmind.google/discover/blog/alphageometry-2",
    source: { name: "Google DeepMind" },
    publication_date: new Date(Date.now() - 3600000 * 6).toISOString(),
    category: "Breakthroughs",
    image_url: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1200",
    description: "AlphaGeometry 2 combines neuro-symbolic search with synthetic theorem generation, solving 84% of all historical Olympiad geometry problems within competition time limits.",
    analysis: [
      {
        short_headline: "AlphaGeometry 2 Scales Mathematical Olympiad Reasoning",
        one_sentence_summary: "DeepMind's neuro-symbolic system achieves gold-medal level geometry deduction without human mathematical training data.",
        detailed_summary: "By synthesizing over 100 million novel geometric proofs and coupling a fine-tuned Gemini base with a fast formal deductive engine, AlphaGeometry 2 eliminates hallucination in formal proofs while generating rigorous steps verified by Isabelle/Lean.",
        why_it_matters: "Proves that self-play and synthetic formal verification can replace human annotation for deep scientific and mathematical discovery.",
        editorial_comment: "Formal reasoning without hallucination.",
        importance_score: 92,
        novelty_score: 94,
        is_worth_including: true
      }
    ],
    status: [{ is_read: false, is_saved: false }]
  },
  {
    id: "curated-3",
    title: "Liquid State Architectures: Edge Transformers Without Quadratic Attention",
    url: "https://arxiv.org/abs/liquid-transformers",
    source: { name: "MIT CSAIL" },
    publication_date: new Date(Date.now() - 3600000 * 18).toISOString(),
    category: "Architecture",
    image_url: "https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=1200",
    description: "Researchers introduce continuous-time differential operators into state space layers, providing unbounded context memory while executing within low thermal envelopes on edge silicon.",
    analysis: [
      {
        short_headline: "Liquid State Architectures for Edge Computing",
        one_sentence_summary: "Continuous-time state spaces achieve infinite context windows at constant per-token computational complexity.",
        detailed_summary: "The work replaces standard softmax dot-product attention with adaptive differential decay kernels. On edge devices, the architecture delivers 10x throughput over traditional transformers with zero degradation on 500k-token retrieval benchmarks.",
        why_it_matters: "Allows local devices—smartphones, wearables, and autonomous drones—to maintain continuous real-time world models without constant cloud connectivity.",
        editorial_comment: "The quadratic bottleneck is dissolving.",
        importance_score: 89,
        novelty_score: 91,
        is_worth_including: true
      }
    ],
    status: [{ is_read: false, is_saved: false }]
  },
  {
    id: "curated-4",
    title: "Anthropic Releases Interpretability Findings on Feature Circuits in Claude",
    url: "https://anthropic.com/research/feature-circuits",
    source: { name: "Anthropic" },
    publication_date: new Date(Date.now() - 3600000 * 28).toISOString(),
    category: "Safety & Alignment",
    image_url: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=1200",
    description: "Mapping millions of sparse autoencoder features across intermediate layers sheds light on how multi-step planning and deceptive alignment representations manifest internally.",
    analysis: [
      {
        short_headline: "Inside the Mind of Modern LLMs: Feature Circuits",
        one_sentence_summary: "Researchers successfully isolate neural circuits governing complex ethical reasoning and self-reflection.",
        detailed_summary: "Using dictionaries of millions of sparse autoencoder concepts, Anthropic researchers isolated specific feature circuits responsible for sycophancy, truthfulness, and safety compliance, demonstrating the ability to dial safety behaviors up or down in real time.",
        why_it_matters: "Constitutes a decisive milestone towards mechanistic interpretability, turning neural black boxes into inspectable, verifiable circuits.",
        editorial_comment: "Looking inside the black box.",
        importance_score: 88,
        novelty_score: 89,
        is_worth_including: true
      }
    ],
    status: [{ is_read: false, is_saved: false }]
  },
  {
    id: "curated-5",
    title: "Autonomous Agent Teams Outperform Single Monolithic Models in Complex Coding",
    url: "https://research.google/pubs/agent-teams",
    source: { name: "Google Research" },
    publication_date: new Date(Date.now() - 3600000 * 40).toISOString(),
    category: "Agentic AI",
    image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
    description: "A benchmark of multi-agent architectures reveals that specialized coordinator, researcher, and critic roles resolve full repository pull requests with a 68% success rate on SWE-bench.",
    analysis: [
      {
        short_headline: "Agent Swarms Beat Monolithic Models in Software Engineering",
        one_sentence_summary: "Role-sharded swarms of smaller models consistently surpass giant single prompts on complex programming benchmarks.",
        detailed_summary: "Dividing tasks into distinct architecture review, test generation, and diff verification loops prevents context window pollution and compounding reasoning errors, delivering superior reliability across 5,000 repository tasks.",
        why_it_matters: "Points the way forward for enterprise automation: specialized teams of nimble agents rather than one enormous catch-all prompt.",
        editorial_comment: "Teams of agents are the new microservices.",
        importance_score: 91,
        novelty_score: 86,
        is_worth_including: true
      }
    ],
    status: [{ is_read: false, is_saved: false }]
  }
];

