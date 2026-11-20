#!/usr/bin/env python3
"""Build public/resume.pdf.

The resume used to exist only as a PDF, so every edit meant re-exporting from
a document nobody could find. The content now lives in this file: change the
text below and re-run.

    python3 -m venv .venv && .venv/bin/pip install fpdf2
    .venv/bin/python tools/resume.py

Markdown in body strings: **bold**, __italic__.
"""

from pathlib import Path

from fpdf import FPDF

NAVY = (31, 56, 100)
GREY = (90, 90, 90)
RULE = (160, 170, 190)

NAME = 'Shreyes Jishnu Suchindran'
TAGLINE = 'Unity Developer | Multiplayer + Performance | Mobile + 3D'
LOCATION = 'Noida, India'
PHONE = '+91 91599 67589'
LINKS = [
    ('shreyesjishnu@gmail.com', 'mailto:shreyesjishnu@gmail.com'),
    ('LinkedIn', 'https://www.linkedin.com/in/shreyesjishnu/'),
    ('GitHub', 'https://github.com/ShreyesJishnu'),
    ('Portfolio', 'https://shreyesjishnu.github.io/Shreyes_Portfolio/'),
]

SUMMARY = (
    'Unity developer with 2+ years shipping live mobile and VR titles in C#. At Blacklight '
    "Studio Works, built and released two kids' titles on Google Play, Dino Genie Coloring World "
    'and DinoGenie Chef, and ship features for Ludo Superstar and Parchisi Superstar. Previously '
    'took a Meta Quest 3 VR build from 25 FPS to a stable 60 FPS. Also build real-time graphics '
    'for the browser with Three.js and WebGL.'
)

SKILLS = [
    ('Engines and Languages', 'Unity 6, C# (OOP, SOLID), C++, Python, GLSL, JavaScript'),
    ('Mobile and Cross-Platform', 'Android, iOS, Meta Quest 3 / 3S, Google Play Console releases, live-ops builds'),
    ('Gameplay Systems', 'Gameplay loops, AI behaviors, combat, scoring, UI / UX, input and interaction, animation'),
    ('Performance Optimization', 'Unity Profiler, Frame Debugger, GPU / CPU profiling, draw calls, memory and GC'),
    ('Multiplayer and Networking', 'Photon (PUN), real-time state sync, reconnect handling, client-server patterns'),
    ('Graphics and Rendering', 'GLSL compute shaders, GPU ray tracing, BVH, Shader Graph, URP, Three.js / WebGL'),
    ('Tools and Workflow', 'Git, DOTween, Visual Studio, Claude Code, Cursor, agile sprints, code reviews'),
]

EXPERIENCE = [
    {
        'role': 'Associate Unity Developer | Blacklight Studio Works, Noida',
        'dates': 'Jan 2026 - Present',
        'note': "Live mobile titles on Google Play: multiplayer board games and kids' titles.",
        'bullets': [
            'Built and released **Dino Genie Coloring World** and **DinoGenie Chef** end to end in '
            'Unity, through the Google Play Console under the Play Families policy.',
            'Shipped features across two live multiplayer mobile titles, Ludo Superstar and '
            'Parchisi Superstar: animation work and side games embedded within the main app.',
            'Ship live online services across release branches: leaderboards, in-game chat, '
            'online multiplayer sync, and asset store pipelines.',
        ],
    },
    {
        'role': 'Junior Unity Developer | Wundrsight Health, Bengaluru',
        'dates': 'Feb 2025 - Jan 2026',
        'note': 'NeuralXR, ReliefXR, ReviveXR | clinical VR rehabilitation titles on Meta Quest 3 / 3S.',
        'bullets': [
            'Raised average frame rate from 25 FPS to a stable 60 FPS on Meta Quest 3 / 3S through '
            'GPU and CPU profiling, draw-call reduction, and frame-budget rework.',
            'Designed and shipped the real-time clinician livestream system: gameplay runs at 60 FPS '
            'in-headset while the encoded stream holds a stable 30 FPS for remote session monitoring.',
            'Built five therapy-focused VR modules end-to-end (kayaking, boxing, neck rotation, '
            'balance, guided movement) including gameplay loops, scoring logic, physics-driven '
            'interaction, and UI flows.',
        ],
    },
    {
        'role': 'Unity Developer Intern | Karma Play, Remote',
        'dates': 'Nov 2024 - Jan 2025',
        'note': None,
        'bullets': [
            'Built core multiplayer gameplay with Photon Unity Networking (PUN): real-time state '
            'sync, player interaction, reconnect handling for a mobile title.',
            'Implemented enemy AI behaviors, combat logic, UI animation, and particle effects.',
        ],
    },
]

PROJECTS = [
    {
        'name': 'The Great Indian Sandwich',
        'stack': 'Three.js, WebGL',
        'bullets': [
            'Scroll-driven sandwich builder for a Dr. Oetker QR campaign: five guided steps assemble '
            'a live WebGL model as the page scrolls. Ships as a static site, built for one thumb on a phone.',
        ],
    },
    {
        'name': 'GPU Whitted Ray Tracer',
        'stack': 'GLSL Compute Shaders, OpenTK',
        'bullets': [
            'Built a real-time GPU ray tracer rendering 6M+ triangles in a wavefront-style pipeline. '
            'Optimized BVH traversal to reduce thread divergence; implemented early-exit hit and '
            'any-hit shader paths.',
        ],
    },
    {
        'name': 'Reality Rip',
        'stack': 'Unreal Engine 4 cinematic short',
        'bullets': [
            'Award-winning real-time cinematic short integrating motion-capture animation, dynamic '
            'camera rigs, and VFX-driven lighting.',
        ],
    },
]

EDUCATION = [
    ('M.Sc. Game and Media Technology', 'Utrecht University', '2024'),
    ('B.E. Computer Science and Engineering', 'Sri Ramakrishna Engineering College', '2020'),
]

LANGUAGES = 'English, Hindi, Kannada, Tamil, Telugu'

BODY = 9.0
LEAD = 4.3


class Resume(FPDF):
    def header(self):  # the letterhead is drawn once, in build()
        pass

    def footer(self):
        pass

    def section(self, title):
        self.ln(2.4)
        self.set_font('Helvetica', 'B', 9.2)
        self.set_text_color(*NAVY)
        self.cell(0, 4.4, title.upper(), new_x='LMARGIN', new_y='NEXT')
        y = self.get_y() + 0.3
        self.set_draw_color(*RULE)
        self.set_line_width(0.35)
        self.line(self.l_margin, y, self.w - self.r_margin, y)
        self.ln(1.6)
        self.set_text_color(0, 0, 0)

    def body(self, text, indent=0.0, style=''):
        self.set_font('Helvetica', style, BODY)
        self.set_text_color(0, 0, 0)
        self.set_x(self.l_margin + indent)
        self.multi_cell(
            self.w - self.l_margin - self.r_margin - indent,
            LEAD, text, markdown=True, align='L', new_x='LMARGIN', new_y='NEXT',
        )

    def bullet(self, text):
        x = self.l_margin + 2.0
        self.set_font('Helvetica', '', BODY)
        self.set_xy(x, self.get_y())
        self.cell(3.0, LEAD, chr(149))
        self.set_x(x + 3.0)
        self.multi_cell(
            self.w - self.r_margin - (x + 3.0),
            LEAD, text, markdown=True, align='L', new_x='LMARGIN', new_y='NEXT',
        )

    def entry_head(self, left, right, note=None):
        """Role on the left, dates right-aligned on the same baseline."""
        y = self.get_y()
        self.set_font('Helvetica', 'B', BODY + 0.3)
        self.set_text_color(0, 0, 0)
        self.set_xy(self.l_margin, y)
        self.cell(0, LEAD, left)
        if right:
            self.set_font('Helvetica', 'I', BODY - 0.4)
            self.set_text_color(*GREY)
            self.set_xy(self.l_margin, y)
            self.cell(self.w - self.l_margin - self.r_margin, LEAD, right, align='R')
        self.ln(LEAD)
        if note:
            self.set_font('Helvetica', 'I', BODY - 0.4)
            self.set_text_color(*GREY)
            self.set_x(self.l_margin)
            self.multi_cell(0, LEAD - 0.3, note, align='L', new_x='LMARGIN', new_y='NEXT')
        self.set_text_color(0, 0, 0)


def build(out: Path) -> Path:
    pdf = Resume(format='A4', unit='mm')
    pdf.set_margins(16, 12, 16)
    pdf.set_auto_page_break(False)
    pdf.set_title(f'{NAME} - Resume')
    pdf.set_author(NAME)
    pdf.add_page()

    pdf.set_font('Helvetica', 'B', 19)
    pdf.set_text_color(*NAVY)
    pdf.cell(0, 8.5, NAME, align='C', new_x='LMARGIN', new_y='NEXT')

    pdf.set_font('Helvetica', 'I', 9.6)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 4.6, TAGLINE, align='C', new_x='LMARGIN', new_y='NEXT')

    # Contact line: measured first, then drawn centred, so the links stay clickable.
    sep = '  |  '
    parts = [(LOCATION, None), (PHONE, None)] + LINKS
    pdf.set_font('Helvetica', '', 8.8)
    width = sum(pdf.get_string_width(t) for t, _ in parts)
    width += pdf.get_string_width(sep) * (len(parts) - 1)
    x = (pdf.w - width) / 2
    y = pdf.get_y() + 0.6
    for i, (text, href) in enumerate(parts):
        if i:
            pdf.set_text_color(0, 0, 0)
            pdf.set_font('Helvetica', '', 8.8)
            pdf.set_xy(x, y)
            pdf.cell(pdf.get_string_width(sep), 4.4, sep)
            x += pdf.get_string_width(sep)
        if href:
            pdf.set_text_color(*NAVY)
            pdf.set_font('Helvetica', 'U', 8.8)
        else:
            pdf.set_text_color(0, 0, 0)
            pdf.set_font('Helvetica', '', 8.8)
        w = pdf.get_string_width(text)
        pdf.set_xy(x, y)
        pdf.cell(w, 4.4, text, link=href)
        x += w
    pdf.set_y(y + 4.4)
    pdf.set_text_color(0, 0, 0)

    pdf.section('Summary')
    pdf.body(SUMMARY)

    pdf.section('Skills')
    for label, text in SKILLS:
        pdf.body(f'**{label}:** {text}')

    pdf.section('Experience')
    for job in EXPERIENCE:
        pdf.entry_head(job['role'], job['dates'], job['note'])
        for b in job['bullets']:
            pdf.bullet(b)
        pdf.ln(1.0)

    pdf.section('Projects')
    for proj in PROJECTS:
        pdf.entry_head(proj['name'], None)
        pdf.set_xy(pdf.l_margin, pdf.get_y() - LEAD)
        pdf.set_font('Helvetica', 'B', BODY + 0.3)
        lead_w = pdf.get_string_width(proj['name']) + 1.5
        pdf.set_xy(pdf.l_margin + lead_w, pdf.get_y())
        pdf.set_font('Helvetica', 'I', BODY - 0.4)
        pdf.set_text_color(*GREY)
        pdf.cell(0, LEAD, f"| {proj['stack']}", new_x='LMARGIN', new_y='NEXT')
        pdf.set_text_color(0, 0, 0)
        for b in proj['bullets']:
            pdf.bullet(b)

    pdf.section('Education')
    for degree, school, year in EDUCATION:
        y = pdf.get_y()
        pdf.set_font('Helvetica', 'B', BODY)
        pdf.set_xy(pdf.l_margin, y)
        pdf.cell(0, LEAD, degree)
        w = pdf.get_string_width(degree) + 1.5
        pdf.set_font('Helvetica', '', BODY)
        pdf.set_text_color(*GREY)
        pdf.set_xy(pdf.l_margin + w, y)
        pdf.cell(0, LEAD, f'| {school}  |  {year}', new_x='LMARGIN', new_y='NEXT')
        pdf.set_text_color(0, 0, 0)

    pdf.section('Languages')
    pdf.body(LANGUAGES)

    assert pdf.page_no() == 1, f'resume spilled onto {pdf.page_no()} pages'
    out.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(out))
    return out


if __name__ == '__main__':
    target = Path(__file__).resolve().parent.parent / 'public' / 'resume.pdf'
    print(build(target))
