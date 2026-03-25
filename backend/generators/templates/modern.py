from __future__ import annotations
from generators.latex_templates import TemplateConfig

CONFIG = TemplateConfig(
    template_id="modern",
    font_size=11,
    margins=(0.6, 0.6, 0.6, 0.6),
    section_style="colored_bar",
    bullet_char=r"\textbullet",
    accent_rgb=(20, 30, 97),   # Navy #141E61
)
