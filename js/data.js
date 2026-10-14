/*
 * All editable content for the site lives here.
 * Pages read window.SITE and render from it, so change copy, links and
 * numbers in this file only.
 *
 * Any text written as [TODO: …] shows up on the page as a visible
 * placeholder, so you can mark gaps while drafting.
 */
window.SITE = {
  person: {
    name: "Dinesh Kumar",
    title: "Senior UI/UX & Product Designer",
    location: "Chennai, India",
    coords: "N 13.08° · E 80.27° · Chennai"
  },

  links: {
    email: "dineshkumarsn33@gmail.com",
    phone: "+91 99521 29182",
    phoneHref: "tel:+919952129182",
    whatsapp: "https://wa.me/919952129182",
    linkedin: "https://www.linkedin.com/in/dinesh-karthi-9224ba205",
    linkedinLabel: "in/dinesh-karthi-9224ba205",
    resume: "https://drive.google.com/file/d/12IQA5aOfOivI6v2IAtpou71HtvutawIL/view?usp=drivesdk"
  },

  hero: {
    label: "Senior UI/UX & Product Designer · Chennai",
    line: "I design calm interfaces for complicated products.",
    statsLead: "Seven years. SaaS, fintech, healthcare and AI.",
    engineer: "Trained as a civil engineer. I still work out the load before I draw the structure.",
    ctaLead: "The work is below. So is the resume."
  },

  stats: [
    { value: 35, suffix: "%", label: "fewer UI inconsistencies" },
    { value: 25, suffix: "%", label: "higher appointment completion" },
    { value: 20, suffix: "%", label: "better task success" },
    { value: 40, suffix: "%", label: "faster developer handoff" }
  ],

  about: {
    title: "Seven years of making hard software easier to use.",
    paragraphs: [
      "I'm a product designer in Chennai. Since 2019 I've designed software people use to get work done: payroll and billing tools, patient apps, recruitment platforms and payment flows.",
      "I studied civil engineering before I moved into design, and the habit stayed. I start with the load: who uses this, what they need to finish, and what breaks if we get it wrong. Then I draw.",
      "At Orange Office Technologies I lead product design from research to handoff. I run a Figma design system that engineering mirrors as a React library, and I mentor five junior designers. Accessibility is part of the brief from day one, not a check at the end."
    ],
    spec: [
      ["Based in", "Chennai, India"],
      ["Experience", "7+ years, since March 2019"],
      ["Focus", "B2B SaaS, fintech, healthcare, AI products"],
      ["Team", "Mentor to 5 junior designers"],
      ["Standard", "WCAG 2.1 AA, ADA/508-aligned"],
      ["Education", "B.E. Civil Engineering"]
    ],
    figure: "Fig. 02 — Terrace and reflecting pool, frame 150 of the fly-through"
  },

  /*
   * Projects. Order here is the order on the home page.
   * images: local copies could not be downloaded when the site was built,
   * so these point at the original GitHub attachment URLs. To self-host,
   * save the files under assets/projects/<slug>/ and change the paths
   * (e.g. "assets/projects/loyaltri/ui.png").
   */
  projects: [
    {
      slug: "loyaltri",
      name: "Loyaltri",
      category: "SaaS",
      sector: "Payroll, loyalty & subscription billing",
      company: "Orange Office Technologies",
      summary: "Payroll, subscription billing and loyalty modules for 50+ enterprise clients.",
      points: [
        "End-to-end UX (wireframes, user flows, high-fidelity prototypes) for payroll, subscription billing and loyalty modules used by 50+ enterprise clients.",
        "Redesigned multi-tier tax and payroll rule configuration with progressive disclosure and real-time inline validation, reducing configuration errors for HR administrators."
      ],
      metric: { prefix: "", value: 50, suffix: "+", label: "enterprise clients" },
      images: {
        wireframe: "https://github.com/user-attachments/assets/3db57d4c-95d5-478f-86b8-1deba64e60c9",
        flow: "https://github.com/user-attachments/assets/4b3f21bd-62fd-4dbe-8b99-ee806210b643",
        ui: "https://github.com/user-attachments/assets/5cc50964-e51b-42ca-b6b6-b250300db77d"
      },
      figma: "https://www.figma.com/design/0npQmAvx6Nscf4k6FWUJlL",
      caseStudy: {
        meta: {
          role: "Lead Designer",
          platform: "Web and mobile",
          timeline: "6–7 months",
          team: "3-person team, design led by me",
          tools: "Figma, Adobe XD, Sketch"
        },
        overview: [
          "Loyaltri is a SaaS product from Orange Office Technologies. It runs payroll, subscription billing and loyalty programmes for more than 50 enterprise clients.",
          "As lead designer I owned the UX from start to finish: research, wireframes, user flows and high-fidelity prototypes for all three modules, through to developer handoff."
        ],
        problem: [
          "The hardest part was rule configuration. Tax and payroll rules come in several tiers, and HR administrators were making errors while setting them up. A wrong payroll rule is not a cosmetic bug. It ends up in someone's salary.",
          "The configuration screens asked administrators to hold too many settings in their head at once, and mistakes only surfaced after saving."
        ],
        research: [
          "I started with stakeholder interviews with the product owner and the people who support HR teams, then walked through the existing configuration screens as an HR administrator would, with a heuristic evaluation.",
          "Two things stood out. Administrators work tier by tier, not all at once. And they need to know a rule is wrong while they are typing it, not after they have saved a payroll run."
        ],
        flow: [
          "Before drawing any screens I mapped how an HR administrator moves through payroll, billing and loyalty setup.",
          "Rule configuration got the most attention. I used progressive disclosure, so administrators only see the settings for the tier they are working on, not every option at once.",
          "Each tier is confirmed before the next one opens, so the flow always has one clear next step."
        ],
        wireframes: [
          "Wireframes came first, in low fidelity, to settle structure and the order of steps before visual decisions got in the way.",
          "I reviewed them with the product owner and developers early, so data rules and edge cases were agreed before high-fidelity design."
        ],
        finalUI: [
          "Real-time inline validation checks each rule as it is entered, so a mistake shows up next to the field that caused it instead of after saving.",
          "Drag the handle to compare the wireframe with the final screen."
        ],
        results: [
          { prefix: "", value: 50, suffix: "+", label: "Enterprise clients on the product" },
          { prefix: "", value: 3, suffix: "", label: "Modules designed end to end: payroll, billing, loyalty" }
        ],
        learned: [
          "In data-heavy products the best design decision is often what to hide. Progressive disclosure did more for error rates than any visual change.",
          "Validation is part of the interface, not a developer detail. Designing the error states alongside the happy path saved a round of rework."
        ]
      }
    },
    {
      slug: "medcare",
      name: "MedCare",
      category: "Healthcare",
      sector: "Patient mobile app",
      company: "Orange Office Technologies",
      summary: "A patient app for booking appointments, medical records and telehealth.",
      points: [
        "Patient flows for appointment booking, medical records and telehealth.",
        "Clinical terminology simplified into a 3-tap booking flow."
      ],
      metric: { prefix: "+", value: 25, suffix: "%", label: "appointment completion" },
      images: {
        wireframe: "https://github.com/user-attachments/assets/e695415a-e6e0-4acd-925a-d46f38450016",
        flow: "https://github.com/user-attachments/assets/7dcf450d-42d3-449f-8dfb-e777911b6ec8",
        ui: "https://github.com/user-attachments/assets/c003344b-4d6b-4293-8775-f29272c55d01"
      },
      figma: "https://www.figma.com/design/AFBBvjWdp7wJBpWa7QP71s",
      caseStudy: {
        meta: {
          role: "Lead Designer",
          platform: "Web and mobile",
          timeline: "3–4 months",
          team: "3-person team, design led by me",
          tools: "Figma, Adobe XD, Sketch"
        },
        overview: [
          "MedCare is a patient app on web and mobile. Appointment booking, medical records and telehealth sit in one place.",
          "As lead designer I took the patient flows for all three from research to high-fidelity prototypes and developer handoff."
        ],
        problem: [
          "Booking an appointment should not need a medical vocabulary. The clinical terms in the booking process got in the way of patients trying to see a doctor.",
          "Every extra screen and unfamiliar word was a point where a patient could give up before the booking was done."
        ],
        research: [
          "I ran usability testing on the booking flow and a heuristic evaluation of the existing screens, and used analytics to see where patients left the flow.",
          "Patients think in plain terms: what is wrong, which doctor, what time. They don't think in departments and procedure names. And the fewer decisions per screen, the more bookings were finished."
        ],
        flow: [
          "I cut booking down to three taps and replaced clinical terms with plain words patients already use.",
          "Choose what you need, pick a doctor and a time, confirm. Records and telehealth sit one step away from the same home screen."
        ],
        wireframes: [
          "I worked out the booking, records and telehealth screens in low fidelity first.",
          "Interactive prototypes let us test the three-tap flow with patients before any visual design was locked."
        ],
        finalUI: [
          "Large tap targets, plain labels and clear focus states keep the app usable for patients of every age, in line with WCAG 2.1 AA.",
          "Drag the handle to compare the wireframe with the final screen."
        ],
        results: [
          { prefix: "+", value: 25, suffix: "%", label: "Appointment completion" },
          { prefix: "", value: 3, suffix: "", label: "Taps to book an appointment" }
        ],
        learned: [
          "Plain language is a design tool. Changing the words did as much for completion as changing the layout.",
          "Testing a clickable prototype early showed us problems that would have been expensive to find after build."
        ]
      }
    },
    {
      slug: "monkifyai",
      name: "MonkifyAI",
      category: "AI",
      sector: "Recruitment platform",
      company: "Orange Office Technologies",
      summary: "AI candidate search with blockchain credential checks, built for recruiters.",
      points: [
        "AI-driven candidate search with blockchain credential verification.",
        "Modular dashboard widgets and customisable filter chips that balance search depth against recruiter cognitive load."
      ],
      metric: { prefix: "", value: 40, suffix: "%", label: "less shortlisting time" },
      images: {
        wireframe: "https://github.com/user-attachments/assets/257b7c00-4b32-4d84-babc-b07b3c0510bf",
        flow: "https://github.com/user-attachments/assets/28c3cabe-ab30-4d53-b42a-3b83b404f4f3",
        ui: "https://github.com/user-attachments/assets/c18402a9-125f-48f9-8f63-e039c9442ed8"
      },
      figma: "https://www.figma.com/design/Ox1ACsCYyqnWhx6mmIpwnZ",
      caseStudy: {
        meta: {
          role: "Lead Designer",
          platform: "Web and mobile",
          timeline: "3–4 months",
          team: "3-person team, design led by me",
          tools: "Figma, Adobe XD, Sketch"
        },
        overview: [
          "MonkifyAI is a recruitment platform. Recruiters find candidates through AI-driven search, and candidate credentials are verified on a blockchain.",
          "As lead designer I took the search experience and the recruiter dashboard from research to developer handoff."
        ],
        problem: [
          "Recruiters want deep search. But every extra filter is one more thing to keep in their head. The design had to give them depth without the clutter.",
          "AI results also need to earn trust. A recruiter has to see why a candidate appears and whether their credentials are real."
        ],
        research: [
          "I held stakeholder interviews with the product team and walked through how recruiters search and shortlist today, step by step.",
          "Recruiters reuse a small set of filters most of the time and reach for the rest only now and then. And verification only helps if it is visible at the moment of decision, not hidden in a profile."
        ],
        flow: [
          "Search is built around customisable filter chips. Recruiters add the filters they need and leave out the ones they don't.",
          "From search results a recruiter can compare, check verified credentials and shortlist without leaving the page."
        ],
        wireframes: [
          "The dashboard is made of modular widgets. I worked out the widget set and their layout in wireframes before any visual design.",
          "AI-assisted tools like Uizard helped me explore layout options quickly before settling on one direction."
        ],
        finalUI: [
          "Verified credentials carry a clear badge right in the results, so trust is visible without an extra click.",
          "Drag the handle to compare the wireframe with the final screen."
        ],
        results: [
          { prefix: "", value: 40, suffix: "%", label: "Less time spent shortlisting" },
          { prefix: "", value: 2, suffix: "", label: "Audiences served: recruiters and job seekers" }
        ],
        learned: [
          "With AI features, explaining the result matters as much as the result. Recruiters trusted matches more when they could see the reasons.",
          "Letting users shape their own filters beat trying to design one perfect filter panel for everyone."
        ]
      }
    },
    {
      slug: "aura",
      name: "Aura",
      category: "Fintech",
      sector: "B2C digital wallet",
      company: "Orange Office Technologies",
      summary: "A mobile-first wallet: onboarding, KYC, history and checkout.",
      points: [
        "Mobile-first payment flows (onboarding, KYC, transaction history, checkout) with micro-interactions that build trust.",
        "Multi-step verification collapsed into a single-screen biometric flow, with full WCAG 2.1 AA compliance."
      ],
      metric: { prefix: "+", value: 20, suffix: "%", label: "checkout conversion" },
      images: {
        wireframe: "https://github.com/user-attachments/assets/9d707417-9fe1-4b9b-bc90-9a4493ecb975",
        flow: "https://github.com/user-attachments/assets/ae7a3553-bf14-4357-b362-b1ece2d983c4",
        ui: "https://github.com/user-attachments/assets/a21ae331-caac-4d78-a6b4-5dd11d033d25"
      },
      figma: "https://www.figma.com/design/VwyjnjVnCKGmv3S9XpOeSL",
      caseStudy: {
        meta: {
          role: "Lead Designer",
          platform: "Web and mobile",
          timeline: "3–4 months",
          team: "3-person team, design led by me",
          tools: "Figma, Adobe XD, Sketch"
        },
        overview: [
          "Aura is a digital wallet for consumers. As lead designer I took its mobile-first payment flows from research to developer handoff: onboarding, KYC, transaction history and checkout."
        ],
        problem: [
          "A wallet has to verify who you are. But every extra verification step is another place to give up.",
          "People also need to trust that a payment went through. An unclear state at checkout makes them hesitate, retry or leave."
        ],
        research: [
          "I ran a UX audit of the onboarding and checkout flows, used funnel analysis to find where people dropped off, and A/B tested key variants.",
          "Most drop-off sat in verification and at the final payment step. Both were about effort and uncertainty, not missing features."
        ],
        flow: [
          "I collapsed the multi-step verification into a single-screen biometric flow.",
          "Onboarding, KYC, history and checkout share one pattern, so what people learn in one step carries to the next."
        ],
        wireframes: [
          "I wireframed onboarding, KYC, history and checkout as one connected set, so the steps between them were designed too.",
          "Interactive prototypes with micro-interaction specs let us validate timing and feedback before build."
        ],
        finalUI: [
          "Micro-interactions confirm each payment state, so people can see their money went where they meant it to. The flows meet WCAG 2.1 AA.",
          "Drag the handle to compare the wireframe with the final screen."
        ],
        results: [
          { prefix: "+", value: 20, suffix: "%", label: "Checkout conversion" },
          { text: "AA", label: "WCAG 2.1 compliance across the flows" }
        ],
        learned: [
          "In payments, feedback is the product. Small, clear confirmations did more for trust than any visual polish.",
          "Accessibility made the flow better for everyone: clear focus states and contrast helped every user move faster."
        ]
      }
    }
  ],

  process: [
    {
      name: "Understand",
      text: "Read the numbers and talk to the people before forming an opinion.",
      tools: ["Google Analytics", "Hotjar", "Microsoft Clarity", "Stakeholder interviews"]
    },
    {
      name: "Structure",
      text: "Map the flows and the information before any screen exists.",
      tools: ["FigJam", "Miro", "Journey mapping", "IA"]
    },
    {
      name: "Sketch",
      text: "Rough screens, fast. A wrong idea should be cheap to throw away.",
      tools: ["Figma", "Uizard", "Google Stitch"]
    },
    {
      name: "Design",
      text: "High-fidelity UI built from the design system, not next to it.",
      tools: ["Auto Layout", "Variables", "Components"]
    },
    {
      name: "Test",
      text: "Watch real people use it, then measure what changed.",
      tools: ["Usability testing", "A/B testing", "Funnel analysis"]
    },
    {
      name: "Hand off",
      text: "Specs, tokens and components that engineering builds from directly.",
      tools: ["Dev Mode", "Design tokens", "React library"]
    }
  ],

  experience: [
    {
      role: "Senior UI/UX & Product Designer",
      company: "Orange Office Technologies",
      dates: "Sep 2020 – Present",
      points: [
        "Led end-to-end product design for multi-tenant SaaS, healthcare and fintech platforms: requirement gathering, user research, user flows, wireframes, high-fidelity Figma prototypes and production handoff.",
        "Built and scaled a Figma design system with design tokens, variables and reusable components, mirrored by engineering as a React component library. Reduced UI inconsistencies by 35%.",
        "Conducted usability testing, heuristic evaluations and UX audits on healthcare and fintech portals. Reduced support tickets by 15% and improved task success rates by 20%.",
        "Drove data-informed design decisions using product analytics, heatmaps and A/B testing on key user flows, delivering an 18% conversion lift on the winning variant before full rollout.",
        "Designed WCAG 2.1 AA compliant clinician dashboards and digital payment flows with colour-contrast audits, keyboard navigation, focus states and ARIA annotations for developers.",
        "Defined information architecture and data-dense dashboard layouts for payroll, billing and subscription modules, using progressive disclosure to reduce cognitive load for HR and finance users.",
        "Designed mobile-first, responsive interfaces and validated flows with interactive prototypes and micro-interaction specs before build. Ran design QA with Figma Dev Mode specs on every release to reduce rework.",
        "Mentored a team of 5 junior designers through design reviews, critiques and Figma best practices.",
        "Presented concepts, prototypes and research insights to clients and leadership to secure sign-off. Partnered daily with Product Owners and Developers in Agile/Scrum sprints.",
        "Used AI-powered design tools (Adobe Firefly, Uizard, Google Stitch) to speed up ideation, concept exploration and early-stage prototyping."
      ]
    },
    {
      role: "UI/UX Designer & Front-End Developer",
      company: "Qmax",
      dates: "Mar 2019 – Sep 2020",
      points: [
        "Designed high-density, real-time analytics dashboards with data visualization, dynamic filtering and responsive layouts. Drove a 20% increase in user engagement.",
        "Established an Atomic Design system with reusable Figma components and matching HTML/CSS patterns. Accelerated developer handoff by 40%.",
        "Conducted user research and usability testing to validate design decisions, iterating on navigation flows and interaction patterns for mobile.",
        "Built interactive HTML, CSS and JavaScript prototypes to validate interactions before production development."
      ]
    }
  ],

  skills: [
    ["Design Tools", "Figma (Auto Layout, Variables, Components, Prototyping, Dev Mode), FigJam, Adobe XD, Photoshop, Illustrator, Miro, Canva"],
    ["UX Research & Strategy", "User Research, Stakeholder Interviews, Usability Testing, Heuristic Evaluation, UX Audits, User Flows, Journey Mapping, Information Architecture, Problem Framing, Design Thinking"],
    ["Data-Informed Design", "A/B Testing, Google Analytics, Hotjar, Microsoft Clarity, Heatmaps & Session Recordings, Funnel Analysis, KPI Tracking"],
    ["UI & Interaction", "Wireframing, Rapid Prototyping, High-Fidelity UI, Interaction Design, Micro-interactions, Visual Design, Progressive Disclosure, Dashboard & Data Visualization Design"],
    ["Design Systems", "Atomic Design, Design Tokens, Component Libraries, Reusable Pattern Systems, Design Documentation, Design QA, Developer Handoff Specs"],
    ["Responsive & Mobile", "Mobile-First, Responsive Web, Cross-Platform (Web, iOS, Android), CSS Flexbox & Grid"],
    ["Accessibility", "WCAG 2.1 AA, ADA/508-aligned Design, Colour-Contrast Audits, Keyboard Navigation, Focus States, ARIA Annotations"],
    ["AI Product Design", "UX for AI-powered Search & Recommendations, AI-assisted Design Workflows (Adobe Firefly, Uizard, Google Stitch), LLM-assisted Concepting & Prototyping"],
    ["Front-End", "HTML5, CSS3, SASS, Tailwind CSS, JavaScript (ES6+), React.js, Semantic HTML"],
    ["Leadership", "Design Mentoring, Design Reviews & Critiques, Client & Leadership Presentations, Stakeholder Management, Agile/Scrum, Jira, Cross-Functional Teams"]
  ],

  certifications: [
    "Google UX Design Professional Certificate",
    "Figma Advanced UI Design",
    "Design Patterns (UI/UX)",
    "HTML, CSS & JavaScript for Web Developers (Coursera / Johns Hopkins University)"
  ],

  education: {
    degree: "B.E. Civil Engineering",
    school: "Government College of Engineering",
    years: "2013 – 2017"
  },

  contact: {
    title: "Let’s build something useful.",
    line: "I’m open to senior product design and design system roles."
  }
};
