from __future__ import annotations
from generators.latex_generator import TemplateConfig

CONFIG = TemplateConfig(
    template_id="overleaf",
    font_size=11,
    margins=(0.5, 0.5, 0.5, 0.5),
    section_style="scshape_rule",
    bullet_char=r"$\circ$",
    accent_rgb=None,
)
