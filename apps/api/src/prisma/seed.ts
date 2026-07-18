import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultTemplates = [
  {
    id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb7d",
    name: "Modern Minimalist",
    thumbnailUrl: null,
    htmlStructure: `<div class="resume-container template-modern">
  <header class="resume-header">
    <h1 class="name">{{fullName}}</h1>
    <div class="contact-info">
      {{#if email}}<span>{{email}}</span>{{/if}}
      {{#if phoneNumber}}<span>• {{phoneNumber}}</span>{{/if}}
      {{#if location}}<span>• {{location}}</span>{{/if}}
    </div>
  </header>
  
  {{#if summary}}
  <section class="resume-section section-summary">
    <h2 class="section-title">Professional Summary</h2>
    <div class="divider"></div>
    <p class="summary-text">{{summary}}</p>
  </section>
  {{/if}}
  
  {{#if experience}}
  <section class="resume-section section-experience">
    <h2 class="section-title">Work Experience</h2>
    <div class="divider"></div>
    <div class="experience-list">
      {{#each experience}}
      <div class="experience-item">
        <div class="item-header">
          <span class="company-title"><strong>{{title}}</strong> — {{company}}</span>
          <span class="dates">{{startDate}} - {{endDate}}</span>
        </div>
        {{#if location}}<div class="location-text">{{location}}</div>{{/if}}
        {{#if description}}<p class="description">{{description}}</p>{{/if}}
      </div>
      {{/each}}
    </div>
  </section>
  {{/if}}
  
  {{#if education}}
  <section class="resume-section section-education">
    <h2 class="section-title">Education</h2>
    <div class="divider"></div>
    <div class="education-list">
      {{#each education}}
      <div class="education-item">
        <div class="item-header">
          <span class="degree-school"><strong>{{degree}} {{#if fieldOfStudy}}in {{fieldOfStudy}}{{/if}}</strong> — {{institution}}</span>
          <span class="dates">{{startDate}} - {{endDate}}</span>
        </div>
        {{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}
        {{#if description}}<p class="description">{{description}}</p>{{/if}}
      </div>
      {{/each}}
    </div>
  </section>
  {{/if}}
  
  {{#if skills}}
  <section class="resume-section section-skills">
    <h2 class="section-title">Skills</h2>
    <div class="divider"></div>
    <div class="skills-list">
      {{#each skills}}
      <span class="skill-badge">{{name}}</span>
      {{/each}}
    </div>
  </section>
  {{/if}}
</div>`,
    cssStyles: `body {
  font-family: 'Inter', sans-serif;
  color: var(--text-color, #1f2937);
  font-size: var(--font-size, 10pt);
  line-height: 1.5;
  margin: 0;
  padding: 0;
}
.resume-container {
  max-width: 800px;
  margin: 0 auto;
}
.resume-header {
  text-align: center;
  margin-bottom: 25px;
}
.resume-header .name {
  font-size: 24pt;
  font-weight: 800;
  color: var(--primary-color, #0284c7);
  margin: 0 0 5px 0;
  letter-spacing: -0.025em;
}
.contact-info {
  display: flex;
  justify-content: center;
  gap: 10px;
  font-size: 9pt;
  color: #6b7280;
}
.resume-section {
  margin-bottom: 20px;
}
.section-title {
  font-size: 12pt;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--primary-color, #0284c7);
  margin: 0 0 4px 0;
  letter-spacing: 0.05em;
}
.divider {
  height: 1px;
  background-color: var(--primary-color, #0284c7);
  opacity: 0.3;
  margin-bottom: 10px;
}
.summary-text {
  margin: 0;
  text-align: justify;
}
.experience-list, .education-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.item-header {
  display: flex;
  justify-content: space-between;
  font-size: 10pt;
}
.location-text {
  font-size: 8.5pt;
  color: #6b7280;
  margin-top: 1px;
}
.description {
  margin: 5px 0 0 0;
  font-size: 9.5pt;
  color: #4b5563;
  text-align: justify;
}
.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.skill-badge {
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 8.5pt;
  color: #374151;
}`
  },
  {
    id: "a3a2901a-8c5f-40e9-aa81-9b1b4d0891d2",
    name: "Classic Executive",
    thumbnailUrl: null,
    htmlStructure: `<div class="resume-container template-executive">
  <header class="resume-header">
    <h1 class="name">{{fullName}}</h1>
    <div class="contact-info">
      {{#if email}}<span>{{email}}</span>{{/if}}
      {{#if phoneNumber}}<span> | {{phoneNumber}}</span>{{/if}}
      {{#if location}}<span> | {{location}}</span>{{/if}}
    </div>
  </header>
  
  {{#if summary}}
  <section class="resume-section section-summary">
    <h2 class="section-title">Executive Summary</h2>
    <p class="summary-text">{{summary}}</p>
  </section>
  {{/if}}
  
  {{#if experience}}
  <section class="resume-section section-experience">
    <h2 class="section-title">Professional Experience</h2>
    <div class="experience-list">
      {{#each experience}}
      <div class="experience-item">
        <div class="item-header">
          <span class="company-title"><strong>{{company}}</strong></span>
          <span class="dates">{{startDate}} - {{endDate}}</span>
        </div>
        <div class="role-location">
          <span class="role"><em>{{title}}</em></span>
          {{#if location}}<span class="location">{{location}}</span>{{/if}}
        </div>
        {{#if description}}<p class="description">{{description}}</p>{{/if}}
      </div>
      {{/each}}
    </div>
  </section>
  {{/if}}
  
  {{#if education}}
  <section class="resume-section section-education">
    <h2 class="section-title">Education</h2>
    <div class="education-list">
      {{#each education}}
      <div class="education-item">
        <div class="item-header">
          <span class="degree-school"><strong>{{institution}}</strong></span>
          <span class="dates">{{startDate}} - {{endDate}}</span>
        </div>
        <div class="degree-text">
          <span>{{degree}}{{#if fieldOfStudy}} in {{fieldOfStudy}}{{/if}}</span>
          {{#if gpa}}<span> (GPA: {{gpa}})</span>{{/if}}
        </div>
        {{#if description}}<p class="description">{{description}}</p>{{/if}}
      </div>
      {{/each}}
    </div>
  </section>
  {{/if}}
  
  {{#if skills}}
  <section class="resume-section section-skills">
    <h2 class="section-title">Core Competencies</h2>
    <div class="skills-list">
      {{#each skills}}
      <span class="skill-item">{{name}}</span>
      {{/each}}
    </div>
  </section>
  {{/if}}
</div>`,
    cssStyles: `body {
  font-family: 'Playfair Display', 'Georgia', serif;
  color: var(--text-color, #111827);
  font-size: var(--font-size, 10.5pt);
  line-height: 1.4;
  margin: 0;
  padding: 0;
}
.resume-container {
  max-width: 800px;
  margin: 0 auto;
}
.resume-header {
  text-align: center;
  border-bottom: 2px solid var(--primary-color, #1e3a8a);
  padding-bottom: 12px;
  margin-bottom: 20px;
}
.resume-header .name {
  font-size: 26pt;
  font-weight: 700;
  color: var(--primary-color, #1e3a8a);
  margin: 0 0 5px 0;
}
.contact-info {
  font-size: 9pt;
  color: #4b5563;
  font-family: 'Inter', sans-serif;
}
.resume-section {
  margin-bottom: 22px;
}
.section-title {
  font-size: 11pt;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--primary-color, #1e3a8a);
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 3px;
  margin: 0 0 8px 0;
  letter-spacing: 0.05em;
  font-family: 'Inter', sans-serif;
}
.summary-text {
  margin: 0;
  text-align: justify;
}
.experience-list, .education-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.item-header {
  display: flex;
  justify-content: space-between;
  font-size: 10.5pt;
}
.role-location, .degree-text {
  display: flex;
  justify-content: space-between;
  font-size: 9.5pt;
  color: #4b5563;
  margin-top: 1px;
}
.description {
  margin: 6px 0 0 0;
  font-size: 9.5pt;
  color: #374151;
  text-align: justify;
  font-family: 'Inter', sans-serif;
}
.skills-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 9pt;
}
.skill-item {
  color: #374151;
  display: list-item;
  list-style-type: square;
  margin-left: 15px;
}`
  },
  {
    id: "f3b39cb2-9d3f-4e0e-9273-04b39ad34b22",
    name: "Tech Sidebar",
    thumbnailUrl: null,
    htmlStructure: `<div class="resume-container template-tech">
  <div class="tech-left-col">
    <header class="resume-header">
      <h1 class="name">{{fullName}}</h1>
    </header>
    
    {{#if summary}}
    <section class="resume-section section-summary">
      <h2 class="section-title">Summary</h2>
      <p class="summary-text">{{summary}}</p>
    </section>
    {{/if}}
    
    {{#if experience}}
    <section class="resume-section section-experience">
      <h2 class="section-title">Experience</h2>
      <div class="experience-list">
        {{#each experience}}
        <div class="experience-item">
          <div class="item-header">
            <span class="title"><strong>{{title}}</strong></span>
            <span class="dates">{{startDate}} - {{endDate}}</span>
          </div>
          <div class="company-loc">{{company}} {{#if location}}• {{location}}{{/if}}</div>
          {{#if description}}<p class="description">{{description}}</p>{{/if}}
        </div>
        {{/each}}
      </div>
    </section>
    {{/if}}
  </div>
  
  <div class="tech-right-col">
    <div class="sidebar-block contact-block">
      {{#if email}}<div class="contact-item">✉ {{email}}</div>{{/if}}
      {{#if phoneNumber}}<div class="contact-item">☎ {{phoneNumber}}</div>{{/if}}
      {{#if location}}<div class="contact-item">📍 {{location}}</div>{{/if}}
    </div>
    
    {{#if skills}}
    <div class="sidebar-block">
      <h3 class="sidebar-title">Skills</h3>
      <div class="skills-list">
        {{#each skills}}
        <span class="skill-tag">{{name}}</span>
        {{/each}}
      </div>
    </div>
    {{/if}}
    
    {{#if education}}
    <div class="sidebar-block">
      <h3 class="sidebar-title">Education</h3>
      <div class="education-list">
        {{#each education}}
        <div class="education-item">
          <div class="edu-degree"><strong>{{degree}}</strong></div>
          <div class="edu-field">{{fieldOfStudy}}</div>
          <div class="edu-school">{{institution}}</div>
          <div class="edu-dates">{{startDate}} - {{endDate}}</div>
          {{#if gpa}}<div class="edu-gpa">GPA: {{gpa}}</div>{{/if}}
        </div>
        {{/each}}
      </div>
    </div>
    {{/if}}
  </div>
</div>`,
    cssStyles: `body {
  font-family: 'Inter', sans-serif;
  color: var(--text-color, #1f2937);
  font-size: var(--font-size, 9.5pt);
  line-height: 1.4;
  margin: 0;
  padding: 0;
}
.resume-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  max-width: 800px;
  margin: 0 auto;
}
.tech-left-col {
  display: flex;
  flex-direction: column;
}
.tech-right-col {
  background-color: #f9fafb;
  border-left: 1px solid #e5e7eb;
  padding: 0 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.resume-header .name {
  font-size: 26pt;
  font-weight: 800;
  color: var(--primary-color, #0f766e);
  margin: 0 0 15px 0;
  letter-spacing: -0.03em;
}
.resume-section {
  margin-bottom: 20px;
}
.section-title {
  font-size: 11pt;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--primary-color, #0f766e);
  border-bottom: 2px solid var(--primary-color, #0f766e);
  padding-bottom: 3px;
  margin: 0 0 10px 0;
}
.summary-text {
  margin: 0;
}
.experience-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.experience-item .item-header {
  display: flex;
  justify-content: space-between;
}
.company-loc {
  font-size: 8.5pt;
  color: #6b7280;
  margin-top: 1px;
}
.experience-item .description {
  margin: 5px 0 0 0;
  font-size: 9pt;
  color: #4b5563;
}
.sidebar-block {
  display: flex;
  flex-direction: column;
}
.sidebar-title {
  font-size: 10pt;
  font-weight: 700;
  text-transform: uppercase;
  color: #374151;
  margin: 0 0 8px 0;
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 2px;
}
.contact-block {
  font-size: 8.5pt;
  color: #4b5563;
  margin-top: 20px;
  gap: 4px;
}
.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.skill-tag {
  background-color: var(--primary-color, #0f766e);
  color: white;
  font-size: 8pt;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}
.education-item {
  font-size: 8.5pt;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
}
.edu-degree {
  color: #1f2937;
}
.edu-school, .edu-dates {
  color: #6b7280;
}`
  }
];

async function main() {
  console.log("🌱 Seeding database templates...");
  for (const t of defaultTemplates) {
    await prisma.template.upsert({
      where: { id: t.id },
      update: t,
      create: t
    });
  }
  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
