import { 
  UserProfile, UserPreference, JobItem, ApplicationItem, 
  AutomationItem, AnalyticsOverview, JobMatchDetails 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private useMock: boolean = false;
  private backendAvailable: boolean | null = null;

  constructor() {
    // Check if user stored preference in localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jobpilot_mock_mode');
      if (stored !== null) {
        this.useMock = stored === 'true';
      }
    }
  }

  public setMockMode(enabled: boolean) {
    this.useMock = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobpilot_mock_mode', String(enabled));
    }
  }

  public isMockMode(): boolean {
    return this.useMock;
  }

  public async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { 
        method: 'GET', 
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000) 
      });
      this.backendAvailable = res.ok;
      return res.ok;
    } catch {
      this.backendAvailable = false;
      return false;
    }
  }

  private async fetchWithFallback<T>(path: string, options: RequestInit, mockFallback: () => T): Promise<T> {
    if (this.useMock) {
      return mockFallback();
    }

    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      console.warn(`[JobPilot API] Request to ${path} failed, falling back to mock adapter:`, err);
      return mockFallback();
    }
  }

  // 1. Profile
  public async getProfile(): Promise<UserProfile> {
    return this.fetchWithFallback('/api/v1/profile', { method: 'GET' }, () => mockData.profile);
  }

  public async updateProfile(pref: Partial<UserPreference>): Promise<UserProfile> {
    return this.fetchWithFallback('/api/v1/profile', {
      method: 'PATCH',
      body: JSON.stringify(pref)
    }, () => {
      mockData.profile.preference = { ...mockData.profile.preference, ...pref } as UserPreference;
      return mockData.profile;
    });
  }

  // 2. Jobs
  public async searchJobs(params: any = {}): Promise<{ total: number; page: number; items: JobItem[] }> {
    return this.fetchWithFallback('/api/v1/jobs/search', {
      method: 'POST',
      body: JSON.stringify(params)
    }, () => {
      let filtered = [...mockData.jobs];
      if (params.query) {
        const q = params.query.toLowerCase();
        filtered = filtered.filter(j => 
          j.title.toLowerCase().includes(q) || 
          j.company.toLowerCase().includes(q) ||
          j.skills.some(s => s.toLowerCase().includes(q))
        );
      }
      if (params.remote_only) {
        filtered = filtered.filter(j => j.work_mode === 'remote');
      }
      if (params.min_match_score) {
        filtered = filtered.filter(j => (j.match?.overall_score || 0) >= params.min_match_score);
      }
      return { total: filtered.length, page: params.page || 1, items: filtered };
    });
  }

  public async getJob(jobId: string): Promise<JobItem> {
    return this.fetchWithFallback(`/api/v1/jobs/${jobId}`, { method: 'GET' }, () => {
      const found = mockData.jobs.find(j => j.id === jobId);
      if (!found) throw new Error('Job not found');
      return found;
    });
  }

  public async toggleSaveJob(jobId: string): Promise<{ id: string; is_saved: boolean }> {
    return this.fetchWithFallback(`/api/v1/jobs/${jobId}/save`, { method: 'POST' }, () => {
      const job = mockData.jobs.find(j => j.id === jobId);
      if (job) {
        job.is_saved = !job.is_saved;
        return { id: jobId, is_saved: job.is_saved };
      }
      return { id: jobId, is_saved: true };
    });
  }

  public async dismissJob(jobId: string): Promise<{ id: string; is_dismissed: boolean }> {
    return this.fetchWithFallback(`/api/v1/jobs/${jobId}/dismiss`, { method: 'POST' }, () => {
      const job = mockData.jobs.find(j => j.id === jobId);
      if (job) job.is_dismissed = true;
      return { id: jobId, is_dismissed: true };
    });
  }

  public async calculateJobMatch(jobId: string): Promise<JobMatchDetails> {
    return this.fetchWithFallback(`/api/v1/jobs/${jobId}/match`, { method: 'POST' }, () => {
      const job = mockData.jobs.find(j => j.id === jobId);
      return job?.match || {
        overall_score: 85,
        skills_score: 88,
        experience_score: 82,
        matched_skills: ["Python", "FastAPI"],
        missing_skills: ["Distributed Systems"],
        match_reasons: ["Strong Python expertise"],
        concerns: [],
        interview_topics: ["Asynchronous API Design"]
      };
    });
  }

  // 3. Applications
  public async getApplications(): Promise<ApplicationItem[]> {
    return this.fetchWithFallback('/api/v1/applications', { method: 'GET' }, () => mockData.applications);
  }

  public async createApplication(appData: Partial<ApplicationItem>): Promise<ApplicationItem> {
    return this.fetchWithFallback('/api/v1/applications', {
      method: 'POST',
      body: JSON.stringify(appData)
    }, () => {
      const created: ApplicationItem = {
        id: `app-${Date.now()}`,
        user_id: 'usr-alex-1001',
        job_id: appData.job_id,
        company: appData.company || 'Unknown Co',
        role_title: appData.role_title || 'Software Engineer',
        source_url: appData.source_url,
        stage: appData.stage || 'Saved',
        applied_at: appData.applied_at || new Date().toISOString(),
        notes: appData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        events: [
          {
            id: `ev-${Date.now()}`,
            to_stage: appData.stage || 'Saved',
            note: 'Application initiated',
            created_at: new Date().toISOString()
          }
        ]
      };
      mockData.applications.unshift(created);
      return created;
    });
  }

  public async updateApplication(appId: string, updates: Partial<ApplicationItem>): Promise<ApplicationItem> {
    return this.fetchWithFallback(`/api/v1/applications/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }, () => {
      const app = mockData.applications.find(a => a.id === appId);
      if (!app) throw new Error('Application not found');
      if (updates.stage && updates.stage !== app.stage) {
        app.events.unshift({
          id: `ev-${Date.now()}`,
          from_stage: app.stage,
          to_stage: updates.stage,
          note: updates.notes || `Moved to ${updates.stage}`,
          created_at: new Date().toISOString()
        });
      }
      Object.assign(app, updates, { updated_at: new Date().toISOString() });
      return app;
    });
  }

  // 4. Resume & AI Tools
  public async tailorResume(jobId: string): Promise<{ original_bullets: string[]; tailored_bullets: string[]; alignment_summary: string }> {
    return this.fetchWithFallback('/api/v1/resume/tailor', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId })
    }, () => ({
      original_bullets: [
        "Architected microservices handling 10M+ daily events using FastAPI, PostgreSQL, and Redis.",
        "Designed and deployed Next.js web portals with Tailwind CSS and responsive design systems.",
        "Integrated LangChain and vector retrieval pipelines for automated semantic document analysis."
      ],
      tailored_bullets: [
        "Architected microservices handling 10M+ daily events using FastAPI, PostgreSQL, and Redis (Emphasized: Asynchronous throughput and resilient cache design).",
        "Designed and deployed Next.js web portals with Tailwind CSS and responsive design systems (Emphasized: SSR optimization, TypeScript type-safety, and interactive state).",
        "Integrated LangChain and vector retrieval pipelines for automated semantic document analysis (Emphasized: Deterministic guardrails, tool calling, and RAG retrieval accuracy)."
      ],
      alignment_summary: "Tailored to emphasize high-concurrency microservices and verified LangChain agent design without adding unverified claims."
    }));
  }

  public async generateCoverLetter(jobId: string): Promise<{ cover_letter: string; company: string; role_title: string }> {
    return this.fetchWithFallback('/api/v1/cover-letter/generate', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId })
    }, () => {
      const job = mockData.jobs.find(j => j.id === jobId) || mockData.jobs[0];
      return {
        company: job.company,
        role_title: job.title,
        cover_letter: `Dear ${job.company} Hiring Team,\n\nI am writing to express my strong enthusiasm for the ${job.title} role. With hands-on experience building resilient full-stack systems and agentic AI architectures using Next.js, FastAPI, and LangChain, I am confident in my ability to deliver immediate value.\n\nThroughout my career, I have maintained high engineering standards, from designing high-concurrency microservices to delivering fluid, accessible user experiences. I look forward to the possibility of discussing how my technical background aligns with ${job.company}'s goals.\n\nSincerely,\nAlex Morgan`
      };
    });
  }

  // 5. AI Career Assistant Chat
  public async sendAgentMessage(message: string, contextJobId?: string): Promise<{ response: string; tool_calls?: any[]; suggested_actions?: string[] }> {
    return this.fetchWithFallback('/api/v1/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context_job_id: contextJobId })
    }, () => {
      const lower = message.toLowerCase();
      if (lower.includes('match') || lower.includes('best') || lower.includes('recommend')) {
        return {
          response: "I analyzed your verified profile against active listings. Your strongest fit right now is **Stripe - Staff AI Platform Engineer** (96% match) due to direct alignment with Python, FastAPI, and LangChain. **Figma - Senior Full Stack** is also a 94% match if you want a visual AI product focus.",
          tool_calls: [
            {
              tool_name: 'search_jobs',
              parameters: { query: 'engineer', remote_only: true },
              result: mockData.jobs.slice(0, 3)
            }
          ],
          suggested_actions: ["Tailor my resume for Stripe", "Draft recruiter outreach for Figma", "Compare Stripe and Figma"]
        };
      }
      if (lower.includes('compare')) {
        return {
          response: "Comparing **Stripe (Staff AI Platform)** vs **Figma (Senior Full Stack)**:\n\n- **Stripe**: Pure backend & AI infrastructure focus ($210k-$290k). Deep focus on distributed systems, Redis, and LangChain.\n- **Figma**: Visual canvas & interactive product focus ($175k-$245k). Next.js App Router, React, and frontend performance.\n\nBoth roles match your background, but Stripe represents higher compensation and deeper agent infrastructure ownership.",
          tool_calls: [
            {
              tool_name: 'compare_jobs',
              parameters: { job_id_a: 'gh-stripe-4921', job_id_b: 'gh-figma-8312' },
              result: { match_a: 96, match_b: 94 }
            }
          ],
          suggested_actions: ["Draft cover letter for Stripe", "What are common interview questions for Stripe?"]
        };
      }
      if (lower.includes('cover letter') || lower.includes('draft')) {
        return {
          response: "I've drafted a truthful cover letter tailored for **Stripe** emphasizing your proven FastAPI microservices and vector retrieval experience. You can inspect and edit it in the Resume Studio.",
          suggested_actions: ["Draft recruiter message for Stripe", "Schedule follow-up reminder"]
        };
      }
      return {
        response: "I'm your dedicated JobPilot Career Assistant. I can help evaluate matched opportunities, truthfully tailor resume bullets, draft outreach messages, or guide interview prep.",
        suggested_actions: ["Find jobs matching my resume", "Explain why Stripe is a good fit", "Summarize my application pipeline"]
      };
    });
  }

  // 6. Automations
  public async getAutomations(): Promise<AutomationItem[]> {
    return this.fetchWithFallback('/api/v1/automations', { method: 'GET' }, () => mockData.automations);
  }

  public async triggerAutomationRun(automationId: string): Promise<any> {
    return this.fetchWithFallback(`/api/v1/automations/${automationId}/run`, { method: 'POST' }, () => ({
      id: `run-${Date.now()}`,
      automation_id: automationId,
      status: 'completed',
      jobs_found: 18,
      jobs_matched: 12,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    }));
  }

  // 7. Analytics
  public async getAnalytics(): Promise<AnalyticsOverview> {
    return this.fetchWithFallback('/api/v1/analytics/overview', { method: 'GET' }, () => mockData.analytics);
  }
}

// In-Memory Seed Mock Data
export interface MockDataState {
  profile: UserProfile;
  jobs: JobItem[];
  applications: ApplicationItem[];
  automations: AutomationItem[];
  analytics: AnalyticsOverview;
}

export const mockData: MockDataState = {
  profile: {
    id: "usr-alex-1001",
    email: "alex.morgan@example.com",
    full_name: "Alex Morgan",
    is_active: true,
    created_at: "2026-09-20T10:00:00Z",
    preference: {
      target_roles: ["Senior Full Stack Engineer", "Staff AI Systems Engineer", "AI Platform Lead"],
      preferred_locations: ["San Francisco, CA", "Remote (US/Global)", "Bengaluru, India"],
      remote_preference: "remote" as const,
      min_salary: 160000,
      salary_currency: "USD",
      experience_level: "Senior",
      skills: ["TypeScript", "Next.js", "Python", "FastAPI", "PostgreSQL", "LangChain", "LangGraph", "Redis", "Tailwind CSS"],
      preferred_companies: ["Stripe", "Figma", "Anthropic", "OpenAI", "Scale AI", "Vercel", "Linear"],
      employment_type: "full-time",
      notice_period: "30 days",
      search_frequency: "daily" as const
    }
  },
  jobs: [
    {
      id: "gh-stripe-4921",
      title: "Staff AI Platform Engineer",
      company: "Stripe",
      company_logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop",
      location: "San Francisco, CA (Remote Option)",
      work_mode: "remote" as const,
      salary_min: 210000,
      salary_max: 290000,
      salary_currency: "USD",
      experience_level: "Staff / Lead",
      job_type: "full-time",
      description: "We are building the next generation AI infrastructure at Stripe to empower payment automation and fraud intelligence. Looking for engineers experienced in LangChain, Python, distributed systems, and real-time inference.",
      requirements: [
        "7+ years experience with Python & Distributed Systems",
        "Experience with LLM inference, LangChain, or LangGraph",
        "Production experience with PostgreSQL and Redis"
      ],
      nice_to_have: [
        "Experience with pgvector or semantic search",
        "Payments domain experience"
      ],
      skills: ["Python", "FastAPI", "LangChain", "PostgreSQL", "Redis", "Distributed Systems"],
      source_code: "greenhouse",
      source_url: "https://stripe.com/jobs",
      posted_at: "2026-10-20T08:00:00Z",
      is_saved: true,
      is_dismissed: false,
      match: {
        overall_score: 96,
        skills_score: 98,
        experience_score: 94,
        matched_skills: ["Python", "FastAPI", "LangChain", "PostgreSQL", "Redis"],
        missing_skills: ["Distributed Systems"],
        match_reasons: [
          "Direct match with target stack (FastAPI, LangChain, PostgreSQL)",
          "Top-tier compensation above target ($210k-$290k)",
          "Remote flexibility matches your profile"
        ],
        concerns: ["Requires deep high-concurrency systems experience"],
        interview_topics: [
          "Distributed Redis locking & cache invalidation",
          "Designing safe agentic fallback strategies",
          "High-throughput asynchronous Python architecture"
        ]
      }
    },
    {
      id: "gh-figma-8312",
      title: "Senior Full Stack Engineer - AI Experiences",
      company: "Figma",
      company_logo: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&h=100&fit=crop",
      location: "Remote - US / Canada",
      work_mode: "remote" as const,
      salary_min: 175000,
      salary_max: 245000,
      salary_currency: "USD",
      experience_level: "Senior",
      job_type: "full-time",
      description: "Help shape the future of collaborative design by integrating generative AI capabilities directly into the Figma canvas. You will architect intuitive Next.js frontend interfaces and fast backend APIs.",
      requirements: [
        "5+ years building production web apps with TypeScript and React",
        "Strong understanding of Next.js App Router and state management",
        "Experience working with Python backends or Node.js services"
      ],
      nice_to_have: [
        "Knowledge of WebGL / Canvas rendering",
        "LLM evaluation techniques"
      ],
      skills: ["TypeScript", "Next.js", "React", "Tailwind CSS", "Python", "REST APIs"],
      source_code: "greenhouse",
      source_url: "https://figma.com/careers",
      posted_at: "2026-10-19T14:00:00Z",
      is_saved: false,
      is_dismissed: false,
      match: {
        overall_score: 94,
        skills_score: 96,
        experience_score: 92,
        matched_skills: ["TypeScript", "Next.js", "React", "Tailwind CSS", "Python"],
        missing_skills: ["Canvas Rendering"],
        match_reasons: [
          "Exceptional frontend architecture alignment",
          "Fully remote role",
          "Matches preferred company list"
        ],
        concerns: ["Heavy visual design and creative canvas focus"],
        interview_topics: [
          "State management in high-frequency interactive canvas apps",
          "Next.js App Router SSR and performance patterns",
          "API contract design between React and Python"
        ]
      }
    },
    {
      id: "lever-anthropic-104",
      title: "AI Applications Full Stack Engineer",
      company: "Anthropic",
      company_logo: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=100&h=100&fit=crop",
      location: "San Francisco, CA / Hybrid",
      work_mode: "hybrid" as const,
      salary_min: 200000,
      salary_max: 280000,
      salary_currency: "USD",
      experience_level: "Senior",
      job_type: "full-time",
      description: "Build internal tools, red-teaming consoles, and user-facing AI applications powering Claude. You will bridge complex AI agent workflows with sleek, highly responsive frontend interfaces.",
      requirements: [
        "Deep knowledge of TypeScript, React, and Python",
        "Familiarity with agentic workflows, function calling, and RAG pipelines",
        "High focus on reliability, security, and developer UX"
      ],
      nice_to_have: [
        "LangGraph or AutoGen experience",
        "FastAPI and PostgreSQL"
      ],
      skills: ["TypeScript", "React", "Python", "FastAPI", "LangGraph", "RAG", "PostgreSQL"],
      source_code: "lever",
      source_url: "https://anthropic.com/careers",
      posted_at: "2026-10-19T09:00:00Z",
      is_saved: true,
      is_dismissed: false,
      match: {
        overall_score: 92,
        skills_score: 95,
        experience_score: 88,
        matched_skills: ["TypeScript", "React", "Python", "FastAPI", "LangGraph", "PostgreSQL"],
        missing_skills: ["Red-Teaming"],
        match_reasons: [
          "State-of-the-art AI lab with highest tier compensation",
          "Exact match for LangGraph & agent workflows"
        ],
        concerns: ["Hybrid work policy (SF office 2 days/week)"],
        interview_topics: [
          "Safe prompt execution & injection prevention",
          "LangGraph conditional routing and state checkpoints",
          "Real-time SSE token streaming to React interfaces"
        ]
      }
    },
    {
      id: "wf-langchain-33",
      title: "Lead AI Engineer - Multi-Agent Workflows",
      company: "Autonomous AI (YC W24)",
      company_logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop",
      location: "Remote (Global)",
      work_mode: "remote" as const,
      salary_min: 160000,
      salary_max: 220000,
      salary_currency: "USD",
      experience_level: "Lead",
      job_type: "full-time",
      description: "We are crafting agentic workflows for enterprise sales. You will build LangGraph state machines, multi-step search planners, and dynamic resume matching engines.",
      requirements: [
        "Demonstrated experience building autonomous agents with LangGraph or CrewAI",
        "Production Python / FastAPI mastery",
        "Comfortable with rapid startup iteration"
      ],
      nice_to_have: [
        "Equity-driven mindset",
        "Experience with Next.js dashboards"
      ],
      skills: ["LangGraph", "LangChain", "Python", "FastAPI", "TypeScript", "Next.js"],
      source_code: "wellfound",
      source_url: "https://wellfound.com/jobs",
      posted_at: "2026-10-20T04:00:00Z",
      is_saved: false,
      is_dismissed: false,
      match: {
        overall_score: 89,
        skills_score: 92,
        experience_score: 85,
        matched_skills: ["LangGraph", "LangChain", "Python", "FastAPI", "TypeScript", "Next.js"],
        missing_skills: ["Enterprise CRM Integrations"],
        match_reasons: [
          "Perfect overlap with your agentic AI engineering background",
          "High equity upside (1.0% - 2.5%)"
        ],
        concerns: ["Early-stage YC startup workload pace"],
        interview_topics: [
          "Designing fault-tolerant agent retries",
          "Managing cyclic graphs vs DAGs",
          "Prompt optimization and latency reduction"
        ]
      }
    },
    {
      id: "ind-uber-412",
      title: "Senior Backend Systems Engineer",
      company: "Uber",
      company_logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop",
      location: "San Francisco, CA / Seattle, WA",
      work_mode: "hybrid" as const,
      salary_min: 170000,
      salary_max: 235000,
      salary_currency: "USD",
      experience_level: "Senior",
      job_type: "full-time",
      description: "Join Uber's Marketplace engineering team to build low-latency matching and dispatch algorithms. Work with high-concurrency systems handling millions of transactions.",
      requirements: [
        "5+ years experience in high throughput backend engineering",
        "Strong fundamentals in concurrency, caching, and data modeling",
        "Experience with Redis, Kafka, and PostgreSQL"
      ],
      nice_to_have: [
        "Go or Python experience",
        "Geospatial indexing"
      ],
      skills: ["Python", "PostgreSQL", "Redis", "Distributed Systems", "Microservices"],
      source_code: "indeed",
      source_url: "https://www.indeed.com/viewjob?jk=uber-marketplace-engineer",
      posted_at: "2026-10-18T10:00:00Z",
      is_saved: false,
      is_dismissed: false,
      match: {
        overall_score: 84,
        skills_score: 85,
        experience_score: 83,
        matched_skills: ["Python", "PostgreSQL", "Redis"],
        missing_skills: ["Kafka", "Geospatial Indexing"],
        match_reasons: [
          "Strong backend fundamentals match",
          "Proven brand & engineering pedigree"
        ],
        concerns: ["Less generative AI focus; primarily core backend distribution"],
        interview_topics: [
          "Concurrency models in Python vs Go",
          "PostgreSQL query tuning & indexing strategies"
        ]
      }
    }
  ],
  applications: [
    {
      id: "app-001",
      user_id: "usr-alex-1001",
      job_id: "gh-stripe-4921",
      company: "Stripe",
      role_title: "Staff AI Platform Engineer",
      source_url: "https://stripe.com/jobs",
      stage: "Interview" as const,
      applied_at: "2026-10-14T11:00:00Z",
      salary_offered: "$235,000 + Equity",
      recruiter_name: "Elena Rostova",
      recruiter_email: "elena.r@stripe.com",
      interview_date: "2026-10-23T15:00:00Z",
      follow_up_date: "2026-10-24T09:00:00Z",
      notes: "Round 1 passed. Round 2 Systems Architecture on LangGraph state machines scheduled.",
      cover_letter: "I am thrilled to apply for the Staff AI Platform Engineer position at Stripe...",
      created_at: "2026-10-14T11:00:00Z",
      updated_at: "2026-10-20T08:00:00Z",
      events: [
        { id: "ev-1", to_stage: "Saved" as const, note: "Discovered via Greenhouse Agent", created_at: "2026-10-13T10:00:00Z" },
        { id: "ev-2", from_stage: "Saved", to_stage: "Applied" as const, note: "Applied with tailored resume", created_at: "2026-10-14T11:00:00Z" },
        { id: "ev-3", from_stage: "Applied", to_stage: "Assessment" as const, note: "Completed take-home evaluation (Passed)", created_at: "2026-10-17T16:00:00Z" },
        { id: "ev-4", from_stage: "Assessment", to_stage: "Interview" as const, note: "Confirmed Systems Round with Lead Architect", created_at: "2026-10-20T08:00:00Z" }
      ]
    },
    {
      id: "app-002",
      user_id: "usr-alex-1001",
      job_id: "lever-anthropic-104",
      company: "Anthropic",
      role_title: "AI Applications Full Stack Engineer",
      source_url: "https://anthropic.com/careers",
      stage: "Applied" as const,
      applied_at: "2026-10-18T10:30:00Z",
      salary_offered: undefined,
      recruiter_name: "Marcus Vance",
      recruiter_email: "mvance@anthropic.com",
      interview_date: undefined,
      follow_up_date: "2026-10-25T10:00:00Z",
      notes: "Applied with customized cover letter highlighting streaming UI & RAG evaluations.",
      cover_letter: "To the Anthropic Hiring Team: As a builder of multi-agent workflows...",
      created_at: "2026-10-17T12:00:00Z",
      updated_at: "2026-10-18T10:30:00Z",
      events: [
        { id: "ev-5", to_stage: "Saved" as const, note: "Found via Lever adapter", created_at: "2026-10-17T12:00:00Z" },
        { id: "ev-6", from_stage: "Saved", to_stage: "Applied" as const, note: "Submitted application", created_at: "2026-10-18T10:30:00Z" }
      ]
    },
    {
      id: "app-003",
      user_id: "usr-alex-1001",
      job_id: "gh-figma-8312",
      company: "Figma",
      role_title: "Senior Full Stack Engineer - AI Experiences",
      source_url: "https://figma.com/careers",
      stage: "Shortlisted" as const,
      applied_at: undefined,
      salary_offered: undefined,
      recruiter_name: undefined,
      recruiter_email: undefined,
      interview_date: undefined,
      follow_up_date: undefined,
      notes: "Tailoring resume bullets to emphasize Next.js canvas optimizations.",
      cover_letter: undefined,
      created_at: "2026-10-19T15:00:00Z",
      updated_at: "2026-10-19T15:00:00Z",
      events: [
        { id: "ev-7", to_stage: "Shortlisted" as const, note: "Added to high-priority shortlist", created_at: "2026-10-19T15:00:00Z" }
      ]
    },
    {
      id: "app-004",
      user_id: "usr-alex-1001",
      job_id: "wf-langchain-33",
      company: "Autonomous AI (YC W24)",
      role_title: "Lead AI Engineer - Multi-Agent Workflows",
      source_url: "https://wellfound.com/jobs",
      stage: "Offer" as const,
      applied_at: "2026-10-06T09:00:00Z",
      salary_offered: "$195,000 + 1.8% Equity",
      recruiter_name: "Devin Chen (Founder)",
      recruiter_email: "devin@autonomousai.example",
      interview_date: undefined,
      follow_up_date: "2026-10-22T17:00:00Z",
      notes: "Formal offer received! Discussing start date and vesting schedule.",
      cover_letter: undefined,
      created_at: "2026-10-06T09:00:00Z",
      updated_at: "2026-10-20T14:00:00Z",
      events: [
        { id: "ev-8", to_stage: "Offer" as const, note: "Formal offer package presented by founder", created_at: "2026-10-20T14:00:00Z" }
      ]
    }
  ],
  automations: [
    {
      id: "aut-001",
      name: "Daily Agentic Scout",
      is_active: true,
      frequency: "daily" as const,
      keywords: ["Staff AI Engineer", "Senior Full Stack", "AI Platform"],
      locations: ["Remote", "San Francisco, CA"],
      min_match_score: 80,
      enabled_sources: ["greenhouse", "lever", "wellfound", "indeed", "linkedin"],
      email_notifications: true,
      max_jobs_per_run: 25,
      last_run_at: "2026-10-20T06:00:00Z",
      next_run_at: "2026-10-21T06:00:00Z"
    }
  ],
  analytics: {
    total_jobs_discovered: 146,
    new_jobs_today: 18,
    strong_matches: 38,
    applications_submitted: 14,
    interviews_scheduled: 3,
    responses_received: 9,
    applications_needing_followup: 2,
    pipeline: [
      { stage: "Saved", count: 12 },
      { stage: "Shortlisted", count: 8 },
      { stage: "Applied", count: 6 },
      { stage: "Assessment", count: 3 },
      { stage: "Interview", count: 3 },
      { stage: "Offer", count: 1 },
      { stage: "Rejected", count: 4 },
      { stage: "Withdrawn", count: 1 }
    ],
    discovery_trends: [
      { date: "Mon", jobs_discovered: 14, matches: 8, applied: 1 },
      { date: "Tue", jobs_discovered: 22, matches: 12, applied: 2 },
      { date: "Wed", jobs_discovered: 19, matches: 11, applied: 0 },
      { date: "Thu", jobs_discovered: 27, matches: 16, applied: 1 },
      { date: "Fri", jobs_discovered: 31, matches: 21, applied: 2 },
      { date: "Sat", jobs_discovered: 15, matches: 7, applied: 0 },
      { date: "Sun", jobs_discovered: 18, matches: 9, applied: 1 }
    ],
    match_distribution: {
      "90-100%": 12,
      "80-89%": 26,
      "70-79%": 44,
      "60-69%": 38,
      "< 60%": 26
    },
    top_matched_skills: [
      { skill: "Python", frequency: 42 },
      { skill: "FastAPI", frequency: 38 },
      { skill: "TypeScript", frequency: 35 },
      { skill: "Next.js", frequency: 31 },
      { skill: "LangChain", frequency: 28 },
      { skill: "PostgreSQL", frequency: 24 }
    ]
  }
};

export const apiClient = new ApiClient();
