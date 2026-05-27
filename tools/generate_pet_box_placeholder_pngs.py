from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "rocorogue-public" / "assets" / "ui" / "pet_box"
PORTRAIT_DIR = ROOT / "rocorogue-public" / "assets" / "portraits_256"

FONT_REGULAR = Path("C:/Windows/Fonts/msyh.ttc")
FONT_BOLD = Path("C:/Windows/Fonts/msyhbd.ttc")


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_BOLD if bold and FONT_BOLD.exists() else FONT_REGULAR
    if path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.load_default(size=size)


def save_png(image: Image.Image, name: str) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    image.save(OUT_DIR / name, "PNG")


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    hex_color = hex_color.lstrip("#")
    return (
        int(hex_color[0:2], 16),
        int(hex_color[2:4], 16),
        int(hex_color[4:6], 16),
        alpha,
    )


def png_surface(width: int, height: int, scale: int = 4) -> tuple[Image.Image, ImageDraw.ImageDraw, int]:
    image = Image.new("RGBA", (width * scale, height * scale), (0, 0, 0, 0))
    return image, ImageDraw.Draw(image), scale


def box(values: tuple[int, int, int, int], scale: int) -> tuple[int, int, int, int]:
    return tuple(int(v * scale) for v in values)


def point(values: tuple[float, float], scale: int) -> tuple[int, int]:
    return (int(values[0] * scale), int(values[1] * scale))


def rounded(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], radius: int, fill, scale: int) -> None:
    draw.rounded_rectangle(box(xy, scale), radius=radius * scale, fill=fill)


def ellipse(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], fill, scale: int) -> None:
    draw.ellipse(box(xy, scale), fill=fill)


def line(draw: ImageDraw.ImageDraw, xy: list[tuple[float, float]], fill, width: int, scale: int) -> None:
    draw.line([point(p, scale) for p in xy], fill=fill, width=width * scale, joint="curve")


def polygon(draw: ImageDraw.ImageDraw, xy: list[tuple[float, float]], fill, scale: int) -> None:
    draw.polygon([point(p, scale) for p in xy], fill=fill)


def text_center(
    draw: ImageDraw.ImageDraw,
    center: tuple[int, int],
    value: str,
    size: int,
    fill,
    scale: int,
    bold: bool = False,
) -> None:
    fnt = font(size * scale, bold)
    bbox = draw.textbbox((0, 0), value, font=fnt)
    x = center[0] * scale - (bbox[2] - bbox[0]) / 2
    y = center[1] * scale - (bbox[3] - bbox[1]) / 2 - 2 * scale
    draw.text((x, y), value, font=fnt, fill=fill)


def downsample(image: Image.Image, width: int, height: int, scale: int) -> Image.Image:
    if scale == 1:
        return image
    return image.resize((width, height), Image.Resampling.LANCZOS)


def star_points(cx: int, cy: int, outer: int, inner: int, arms: int = 5, offset: float = -math.pi / 2):
    pts = []
    for i in range(arms * 2):
        r = outer if i % 2 == 0 else inner
        a = offset + i * math.pi / arms
        pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    return pts


def draw_pet_mark(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: int, fill) -> None:
    ellipse(draw, (cx - 10, cy - 4, cx + 8, cy + 15), fill, scale)
    ellipse(draw, (cx - 23, cy - 5, cx - 12, cy + 8), fill, scale)
    ellipse(draw, (cx - 9, cy - 21, cx + 3, cy - 8), fill, scale)
    ellipse(draw, (cx + 5, cy - 19, cx + 17, cy - 6), fill, scale)
    ellipse(draw, (cx + 14, cy - 4, cx + 26, cy + 10), fill, scale)


def draw_funnel(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: int, fill) -> None:
    polygon(
        draw,
        [(cx - 18, cy - 18), (cx + 18, cy - 18), (cx + 6, cy - 2), (cx + 3, cy + 15), (cx - 5, cy + 19), (cx - 6, cy - 2)],
        fill,
        scale,
    )


def draw_box_icon(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: int, fill) -> None:
    line(draw, [(cx - 20, cy - 4), (cx, cy - 16), (cx + 20, cy - 4), (cx, cy + 8), (cx - 20, cy - 4)], fill, 4, scale)
    line(draw, [(cx - 20, cy - 4), (cx - 20, cy + 14), (cx, cy + 26), (cx + 20, cy + 14), (cx + 20, cy - 4)], fill, 4, scale)
    line(draw, [(cx, cy + 8), (cx, cy + 26)], fill, 4, scale)


def text_left(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    value: str,
    size: int,
    fill,
    scale: int,
    bold: bool = False,
) -> None:
    draw.text((xy[0] * scale, xy[1] * scale), value, font=font(size * scale, bold), fill=fill)


PET_BOX_MOCK_PETS = [
    {
        "id": "dimo",
        "name": "迪莫",
        "level": 5,
        "max_level": 60,
        "exp": 0,
        "exp_max": 30,
        "type_labels": ["光"],
        "stars": 1,
        "max_stars": 6,
        "talent_title": "灵巧的天分",
        "stats": {"hp": 58, "attack": 52, "magic_attack": 62, "defense": 49, "speed": 56, "magic_defense": 54},
        "trait_name": "伙伴",
        "nature_name": "勇敢",
        "secondary_nature_name": "无",
        "colors": ("#fff4b0", "#6db8ff", "#26313a"),
        "accent": "#ffd65a",
        "portrait": "JL_dimo.png",
        "trait_symbol": "star",
    },
    {
        "id": "huohua",
        "name": "火花",
        "level": 5,
        "max_level": 60,
        "exp": 0,
        "exp_max": 30,
        "type_labels": ["火"],
        "stars": 1,
        "max_stars": 6,
        "talent_title": "炽热的天分",
        "stats": {"hp": 55, "attack": 60, "magic_attack": 58, "defense": 46, "speed": 57, "magic_defense": 43},
        "trait_name": "猛火",
        "nature_name": "热情",
        "secondary_nature_name": "无",
        "colors": ("#a95c35", "#f3b449", "#3a241d"),
        "accent": "#f39a42",
        "portrait": "JL_huohua.png",
        "trait_symbol": "flame",
    },
    {
        "id": "shuilanlan",
        "name": "水蓝蓝",
        "level": 5,
        "max_level": 60,
        "exp": 0,
        "exp_max": 30,
        "type_labels": ["水"],
        "stars": 2,
        "max_stars": 6,
        "talent_title": "清澈的天分",
        "stats": {"hp": 62, "attack": 47, "magic_attack": 60, "defense": 56, "speed": 48, "magic_defense": 59},
        "trait_name": "激流",
        "nature_name": "冷静",
        "secondary_nature_name": "无",
        "colors": ("#d4efff", "#4ba5d9", "#34414b"),
        "accent": "#55bde8",
        "portrait": "JL_shuilanlan.png",
        "trait_symbol": "drop",
    },
    {
        "id": "miaomiao",
        "name": "喵喵",
        "level": 5,
        "max_level": 60,
        "exp": 0,
        "exp_max": 30,
        "type_labels": ["草"],
        "stars": 1,
        "max_stars": 6,
        "talent_title": "自然的天分",
        "stats": {"hp": 60, "attack": 50, "magic_attack": 57, "defense": 52, "speed": 52, "magic_defense": 61},
        "trait_name": "茂盛",
        "nature_name": "开朗",
        "secondary_nature_name": "无",
        "colors": ("#cde86c", "#79bd54", "#2f5134"),
        "accent": "#9ed65b",
        "portrait": "JL_miaomiao.png",
        "trait_symbol": "leaf",
    },
    {
        "id": "luoyin",
        "name": "罗隐",
        "level": 5,
        "max_level": 60,
        "exp": 0,
        "exp_max": 30,
        "type_labels": ["地", "恶"],
        "stars": 1,
        "max_stars": 6,
        "talent_title": "一般般的天分",
        "stats": {"hp": 107, "attack": 159, "magic_attack": 78, "defense": 112, "speed": 75, "magic_defense": 70},
        "trait_name": "石头大餐",
        "nature_name": "固执",
        "secondary_nature_name": "无",
        "colors": ("#c9ad64", "#4a414d", "#292525"),
        "accent": "#b99044",
        "portrait": "JL_luoyin.png",
        "trait_symbol": "star",
    },
    {
        "id": "huajianchentieshou",
        "name": "画间沉铁兽",
        "level": 5,
        "max_level": 60,
        "exp": 0,
        "exp_max": 30,
        "type_labels": ["普通", "武"],
        "stars": 1,
        "max_stars": 6,
        "talent_title": "一般般的天分",
        "stats": {"hp": 100, "attack": 160, "magic_attack": 67, "defense": 100, "speed": 105, "magic_defense": 76},
        "trait_name": "变形活画",
        "secondary_nature_name": "无",
        "colors": ("#d9d0bf", "#f1913b", "#4b4540"),
        "accent": "#c3b395",
        "portrait": "JL_huajianchentieshou.png",
        "trait_symbol": "star",
    },
]


TYPE_COLORS = {
    "普通": "#c3b395",
    "萌": "#57c47a",
    "武": "#f1913b",
    "火": "#e66b38",
    "机械": "#65bdd1",
    "草": "#7fca58",
    "光": "#f2c94c",
    "水": "#4da8e8",
    "地": "#b99044",
    "恶": "#5c5362",
}

PET_SPECIFIC_PATTERNS = (
    "pet_avatar_*.png",
    "pet_slot_*.png",
    "trait_icon_*.png",
    "detail_radar_fill_*.png",
)

GENERATED_TYPE_PATTERNS = (
    "type_icon_*.png",
    "type_badge_*.png",
)


STAT_LABELS = [
    ("hp", "生命", -90),
    ("magic_attack", "魔攻", -30),
    ("magic_defense", "魔防", 30),
    ("speed", "速度", 90),
    ("defense", "防御", 150),
    ("attack", "攻击", 210),
]


def draw_small_star(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: int, active: bool) -> None:
    color = rgba("#ffe089", 255) if active else rgba("#858a84", 230)
    polygon(draw, star_points(cx, cy, 12, 5), color, scale)


def draw_simple_avatar(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, scale: int, pet: dict) -> None:
    primary, secondary, dark = pet["colors"]
    r = size // 2
    ellipse(draw, (cx - r, cy - r, cx + r, cy + r), rgba("#fff8e8", 255), scale)
    ellipse(draw, (cx - r + 7, cy - r + 7, cx + r - 7, cy + r - 7), rgba(primary, 255), scale)
    polygon(draw, [(cx - 33, cy - 20), (cx - 15, cy - 50), (cx + 2, cy - 18)], rgba(secondary, 255), scale)
    polygon(draw, [(cx + 33, cy - 20), (cx + 15, cy - 50), (cx - 2, cy - 18)], rgba(secondary, 255), scale)
    ellipse(draw, (cx - 29, cy - 14, cx - 13, cy + 3), rgba(dark, 255), scale)
    ellipse(draw, (cx + 13, cy - 14, cx + 29, cy + 3), rgba(dark, 255), scale)
    ellipse(draw, (cx - 8, cy + 0, cx + 8, cy + 14), rgba(dark, 230), scale)
    line(draw, [(cx - 6, cy + 18), (cx - 24, cy + 25)], rgba(dark, 200), 3, scale)
    line(draw, [(cx + 6, cy + 18), (cx + 24, cy + 25)], rgba(dark, 200), 3, scale)
    polygon(draw, star_points(cx + 30, cy - 31, 12, 5), rgba("#fff8e8", 245), scale)


def load_pet_portrait(pet: dict) -> Image.Image | None:
    portrait_name = pet.get("portrait")
    if not portrait_name:
        return None
    portrait_path = PORTRAIT_DIR / portrait_name
    if not portrait_path.exists():
        return None
    return Image.open(portrait_path).convert("RGBA")


def paste_pet_portrait(base: Image.Image, draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, scale: int, pet: dict) -> None:
    portrait = load_pet_portrait(pet)
    if portrait is None:
        draw_simple_avatar(draw, cx, cy, size, scale, pet)
        return

    target = size * scale
    portrait.thumbnail((target, target), Image.Resampling.LANCZOS)
    layer = Image.new("RGBA", (target, target), (0, 0, 0, 0))
    x = (target - portrait.width) // 2
    y = (target - portrait.height) // 2
    layer.alpha_composite(portrait, (x, y))
    base.alpha_composite(layer, ((cx - size // 2) * scale, (cy - size // 2) * scale))


def make_pet_avatar(pet: dict) -> None:
    w = h = 128
    image, draw, scale = png_surface(w, h)
    ellipse(draw, (0, 0, 128, 128), rgba("#fff8e8", 255), scale)
    ellipse(draw, (7, 7, 121, 121), rgba(pet["accent"], 255), scale)
    paste_pet_portrait(image, draw, 64, 64, 112, scale, pet)
    save_png(downsample(image, w, h, scale), f"pet_avatar_{pet['id']}.png")


def make_trait_icon(pet: dict) -> None:
    w = h = 86
    image, draw, scale = png_surface(w, h)
    ellipse(draw, (0, 0, 86, 86), rgba("#1a2022", 255), scale)
    ellipse(draw, (7, 7, 79, 79), rgba(pet["accent"], 255), scale)
    symbol = pet.get("trait_symbol")
    if symbol == "flame":
        polygon(draw, [(44, 15), (57, 38), (51, 62), (31, 64), (23, 46), (33, 33), (35, 18)], rgba("#fff8e8", 255), scale)
        ellipse(draw, (33, 39, 54, 66), rgba("#fff0bd", 255), scale)
    elif symbol == "drop":
        polygon(draw, [(43, 14), (61, 43), (55, 65), (43, 72), (29, 65), (24, 43)], rgba("#fff8e8", 255), scale)
        ellipse(draw, (32, 42, 54, 65), rgba("#d6f3ff", 255), scale)
    elif symbol == "leaf":
        polygon(draw, [(20, 51), (31, 25), (62, 20), (67, 50), (40, 67)], rgba("#fff8e8", 255), scale)
        line(draw, [(27, 57), (61, 25)], rgba(pet["accent"], 255), 4, scale)
    else:
        polygon(draw, star_points(43, 43, 28, 12, arms=6), rgba("#fff8e8", 255), scale)
    save_png(downsample(image, w, h, scale), f"trait_icon_{pet['id']}.png")


def make_pet_slot(pet: dict) -> None:
    w = h = 92
    image, draw, scale = png_surface(w, h)
    ellipse(draw, (7, 7, 85, 85), rgba("#15191c", 248), scale)
    ellipse(draw, (13, 13, 79, 79), rgba("#fff8e8", 255), scale)
    ellipse(draw, (17, 17, 75, 75), rgba(pet["accent"], 245), scale)
    paste_pet_portrait(image, draw, 46, 44, 68, scale, pet)
    rounded(draw, (54, 58, 88, 82), 7, rgba("#1b2123", 230), scale)
    text_center(draw, (71, 70), str(pet["level"]), 17, rgba("#fff8e8", 255), scale, True)
    save_png(downsample(image, w, h, scale), f"pet_slot_{pet['id']}.png")


def make_selected_slot() -> None:
    w = h = 92
    image, draw, scale = png_surface(w, h)
    ellipse(draw, (1, 1, 91, 91), rgba("#fff8e8", 255), scale)
    ellipse(draw, (8, 8, 84, 84), rgba("#62d39d", 245), scale)
    ellipse(draw, (15, 15, 77, 77), (0, 0, 0, 0), scale)
    save_png(downsample(image, w, h, scale), "pet_slot_selected.png")


def make_panel_button(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], label: str, scale: int) -> None:
    rounded(draw, xy, 30, rgba("#fff8e8", 255), scale)
    text_center(draw, ((xy[0] + xy[2]) // 2, (xy[1] + xy[3]) // 2), label, 25, rgba("#222829", 255), scale, True)


def draw_radar(draw: ImageDraw.ImageDraw, cx: int, cy: int, radius: int, scale: int, pet: dict) -> None:
    angles = [math.radians(item[2]) for item in STAT_LABELS]
    for ring in [0.33, 0.66, 1.0]:
        pts = [(cx + math.cos(a) * radius * ring, cy + math.sin(a) * radius * ring) for a in angles]
        line(draw, pts + [pts[0]], rgba("#747a72", 165), 3, scale)
    for a in angles:
        line(draw, [(cx, cy), (cx + math.cos(a) * radius, cy + math.sin(a) * radius)], rgba("#686e68", 140), 2, scale)

    stat_pts = []
    for key, _label, angle_deg in STAT_LABELS:
        a = math.radians(angle_deg)
        value = max(0, min(80, pet["stats"][key]))
        stat_pts.append((cx + math.cos(a) * radius * value / 80, cy + math.sin(a) * radius * value / 80))
    polygon(draw, stat_pts, rgba("#ffd26c", 190), scale)
    line(draw, stat_pts + [stat_pts[0]], rgba("#ffd26c", 255), 4, scale)

    for key, label, angle_deg in STAT_LABELS:
        a = math.radians(angle_deg)
        tx = cx + math.cos(a) * (radius + 60)
        ty = cy + math.sin(a) * (radius + 42)
        text_center(draw, (int(tx), int(ty - 14)), label, 18, rgba("#d6d2c8", 255), scale, True)
        text_center(draw, (int(tx), int(ty + 12)), str(pet["stats"][key]), 22, rgba("#ffd26c", 255), scale, True)


def draw_radar_base(draw: ImageDraw.ImageDraw, cx: int, cy: int, radius: int, scale: int) -> None:
    angles = [math.radians(item[2]) for item in STAT_LABELS]
    for ring in [0.33, 0.66, 1.0]:
        pts = [(cx + math.cos(a) * radius * ring, cy + math.sin(a) * radius * ring) for a in angles]
        line(draw, pts + [pts[0]], rgba("#87908a", 190), 3, scale)
    for a in angles:
        line(draw, [(cx, cy), (cx + math.cos(a) * radius, cy + math.sin(a) * radius)], rgba("#737b76", 165), 2, scale)


def make_detail_panel_bg() -> None:
    w, h = 800, 1080
    image, draw, scale = png_surface(w, h, scale=3)
    polygon(draw, [(78, 0), (800, 0), (800, 1080), (92, 1080), (45, 790), (35, 460)], rgba("#222829", 255), scale)
    polygon(draw, [(520, 760), (800, 760), (800, 1080), (522, 1080), (398, 1015), (430, 900)], rgba("#2c3334", 210), scale)
    save_png(downsample(image, w, h, scale), "detail_panel_bg.png")


def make_detail_top_button(name: str, label: str) -> None:
    w = h = 52
    image, draw, scale = png_surface(w, h)
    ellipse(draw, (0, 0, 52, 52), rgba("#fff8e8", 255), scale)
    text_center(draw, (26, 26), label, 25, rgba("#222829", 255), scale, True)
    save_png(downsample(image, w, h, scale), name)


def make_detail_side_paw() -> None:
    w = h = 66
    image, draw, scale = png_surface(w, h)
    ellipse(draw, (0, 0, 66, 66), rgba("#15191c", 245), scale)
    draw_pet_mark(draw, 33, 35, scale, rgba("#e8dfce", 235))
    save_png(downsample(image, w, h, scale), "detail_side_paw.png")


def make_detail_collapse_button() -> None:
    w, h = 66, 90
    image, draw, scale = png_surface(w, h)
    ellipse(draw, (0, 0, 66, 66), rgba("#fff8e8", 235), scale)
    text_center(draw, (33, 33), "收", 24, rgba("#222829", 255), scale, True)
    text_center(draw, (33, 78), "收起", 18, rgba("#fff8e8", 255), scale, True)
    save_png(downsample(image, w, h, scale), "detail_btn_collapse.png")


def make_detail_exp_bar() -> None:
    w, h = 484, 28
    image, draw, scale = png_surface(w, h)
    rounded(draw, (0, 0, w, h), 14, rgba("#141819", 255), scale)
    save_png(downsample(image, w, h, scale), "detail_exp_bar_bg.png")

    image, draw, scale = png_surface(w, h)
    rounded(draw, (0, 0, w, h), 14, rgba("#f5b94c", 255), scale)
    save_png(downsample(image, w, h, scale), "detail_exp_bar_fill.png")


def make_detail_star(name: str, active: bool) -> None:
    w = h = 28
    image, draw, scale = png_surface(w, h)
    color = rgba("#ffe089", 255) if active else rgba("#858a84", 230)
    polygon(draw, star_points(14, 14, 13, 6), color, scale)
    save_png(downsample(image, w, h, scale), name)


def make_detail_talent_label_bg() -> None:
    w, h = 190, 49
    image, draw, scale = png_surface(w, h)
    rounded(draw, (0, 0, w, h), 12, rgba("#ffd26c", 255), scale)
    save_png(downsample(image, w, h, scale), "detail_talent_label_bg.png")


def make_detail_question_icon() -> None:
    w = h = 30
    image, draw, scale = png_surface(w, h)
    ellipse(draw, (0, 0, 30, 30), rgba("#222829", 255), scale)
    text_center(draw, (15, 15), "?", 22, rgba("#ffd26c", 255), scale, True)
    save_png(downsample(image, w, h, scale), "detail_question_icon.png")


def make_detail_pill_bg() -> None:
    w, h = 185, 46
    image, draw, scale = png_surface(w, h)
    rounded(draw, (0, 0, w, h), 23, rgba("#fff8e8", 255), scale)
    save_png(downsample(image, w, h, scale), "detail_pill_bg.png")


def make_detail_action_button(name: str, label: str, width: int) -> None:
    w, h = width, 60
    image, draw, scale = png_surface(w, h)
    rounded(draw, (0, 0, w, h), 30, rgba("#fff8e8", 255), scale)
    text_center(draw, (w // 2, h // 2), label, 29, rgba("#222829", 255), scale, True)
    save_png(downsample(image, w, h, scale), name)


def make_gender_icon(name: str, gender: str) -> None:
    w = h = 32
    image, draw, scale = png_surface(w, h)
    fill = rgba("#d84f5f", 255) if gender == "female" else rgba("#4b9fe8", 255)
    ellipse(draw, (1, 1, 31, 31), rgba("#1a2022", 255), scale)
    ellipse(draw, (6, 6, 26, 26), fill, scale)
    if gender == "female":
        line(draw, [(16, 18), (16, 30)], rgba("#1a2022", 255), 3, scale)
        line(draw, [(10, 25), (22, 25)], rgba("#1a2022", 255), 3, scale)
    else:
        line(draw, [(21, 11), (29, 3)], rgba("#1a2022", 255), 3, scale)
        polygon(draw, [(28, 2), (30, 10), (22, 4)], rgba("#1a2022", 255), scale)
    save_png(downsample(image, w, h, scale), name)


def make_stat_icon(name: str, kind: str) -> None:
    w = h = 28
    image, draw, scale = png_surface(w, h)
    ellipse(draw, (0, 0, w, h), rgba("#1b2021", 240), scale)
    fill = rgba("#d6d2c8", 255)
    if kind == "hp":
        polygon(draw, [(14, 23), (5, 14), (5, 8), (10, 5), (14, 9), (18, 5), (23, 8), (23, 14)], fill, scale)
    elif kind == "attack":
        line(draw, [(8, 21), (21, 8)], fill, 4, scale)
        polygon(draw, [(19, 5), (24, 4), (23, 9)], fill, scale)
        line(draw, [(6, 18), (10, 22)], fill, 3, scale)
    elif kind == "magicAttack":
        polygon(draw, star_points(14, 13, 10, 4, arms=6), fill, scale)
        ellipse(draw, (11, 10, 17, 16), rgba("#1b2021", 255), scale)
    elif kind == "defense":
        polygon(draw, [(14, 4), (23, 8), (21, 19), (14, 24), (7, 19), (5, 8)], fill, scale)
        line(draw, [(14, 6), (14, 22)], rgba("#1b2021", 255), 2, scale)
    elif kind == "magicDefense":
        polygon(draw, [(14, 4), (23, 8), (21, 19), (14, 24), (7, 19), (5, 8)], fill, scale)
        polygon(draw, star_points(14, 14, 6, 3), rgba("#1b2021", 255), scale)
    elif kind == "speed":
        polygon(draw, [(6, 18), (16, 5), (14, 13), (22, 13), (11, 25), (13, 17)], fill, scale)
    save_png(downsample(image, w, h, scale), name)


def make_detail_radar_base() -> None:
    w = h = 330
    image, draw, scale = png_surface(w, h)
    draw_radar_base(draw, 165, 165, 142, scale)
    save_png(downsample(image, w, h, scale), "detail_radar_base.png")


def make_detail_radar_fill(pet: dict) -> None:
    w = h = 330
    image, draw, scale = png_surface(w, h)
    cx = cy = 165
    radius = 142
    stat_pts = []
    for key, _label, angle_deg in STAT_LABELS:
        a = math.radians(angle_deg)
        value = max(0, min(80, pet["stats"][key]))
        stat_pts.append((cx + math.cos(a) * radius * value / 80, cy + math.sin(a) * radius * value / 80))
    polygon(draw, stat_pts, rgba("#ffd26c", 190), scale)
    line(draw, stat_pts + [stat_pts[0]], rgba("#ffd26c", 255), 4, scale)
    save_png(downsample(image, w, h, scale), f"detail_radar_fill_{pet['id']}.png")


def cleanup_pet_specific_pngs() -> None:
    current_names = set()
    for pet in PET_BOX_MOCK_PETS:
        pet_id = pet["id"]
        current_names.update(
            {
                f"pet_avatar_{pet_id}.png",
                f"pet_slot_{pet_id}.png",
                f"trait_icon_{pet_id}.png",
                f"detail_radar_fill_{pet_id}.png",
            }
        )

    for pattern in PET_SPECIFIC_PATTERNS:
        for path in OUT_DIR.glob(pattern):
            if path.name not in current_names:
                path.unlink()


def cleanup_generated_type_pngs() -> None:
    for pattern in GENERATED_TYPE_PATTERNS:
        for path in OUT_DIR.glob(pattern):
            path.unlink()


def make_detail_component_pngs() -> None:
    make_detail_panel_bg()
    make_detail_top_button("detail_btn_share.png", "享")
    make_detail_top_button("detail_btn_book.png", "册")
    make_detail_top_button("detail_btn_back.png", "返")
    make_detail_side_paw()
    make_detail_collapse_button()
    make_detail_exp_bar()
    make_detail_star("detail_star_on.png", True)
    make_detail_star("detail_star_off.png", False)
    make_detail_talent_label_bg()
    make_detail_question_icon()
    make_detail_pill_bg()
    make_detail_action_button("detail_btn_feed.png", "精灵喂养", 230)
    make_detail_action_button("detail_btn_growth.png", "精灵成长", 212)
    make_detail_radar_base()


def make_detail_panel(pet: dict) -> None:
    make_detail_radar_fill(pet)


def make_background() -> None:
    width, height = 1920, 1080
    image = Image.new("RGBA", (width, height), (0, 0, 0, 255))
    px = image.load()
    top = (177, 214, 208)
    bottom = (168, 183, 207)
    for y in range(height):
        t = y / (height - 1)
        for x in range(width):
            edge = max(0, (x - 1500) / 420) * 0.08
            r = int(top[0] * (1 - t) + bottom[0] * t - 8 * edge)
            g = int(top[1] * (1 - t) + bottom[1] * t - 10 * edge)
            b = int(top[2] * (1 - t) + bottom[2] * t - 12 * edge)
            px[x, y] = (r, g, b, 255)

    pattern = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(pattern)
    for row in range(-1, 7):
        for col in range(-1, 10):
            cx = col * 250 + (row % 2) * 120 + 70
            cy = row * 175 + 45
            alpha = 30 if (row + col) % 2 == 0 else 20
            outline = (236, 255, 248, alpha)
            draw.rounded_rectangle((cx, cy, cx + 115, cy + 115), radius=26, outline=outline, width=5)
            draw.line((cx + 75, cy + 75, cx + 100, cy + 75), fill=outline, width=4)
            draw.line((cx + 78, cy + 90, cx + 96, cy + 90), fill=outline, width=3)
            sx = cx + 155
            sy = cy + 35
            pts = star_points(sx, sy, 45, 20, arms=6)
            draw.polygon(pts, outline)
            draw.line(pts + [pts[0]], fill=outline, width=5)

    haze = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    hz = ImageDraw.Draw(haze)
    hz.ellipse((-260, 250, 320, 850), fill=(255, 255, 255, 20))
    hz.ellipse((420, 80, 960, 570), fill=(255, 255, 255, 18))
    hz.ellipse((1180, 180, 1800, 760), fill=(255, 255, 255, 18))
    haze = haze.filter(ImageFilter.GaussianBlur(65))

    image = Image.alpha_composite(image, pattern)
    image = Image.alpha_composite(image, haze)
    save_png(image, "bg_pet_box.png")


def make_side_panel() -> None:
    w, h = 122, 742
    image, draw, scale = png_surface(w, h)
    rounded(draw, (0, 0, w, h), 58, rgba("#202829", 252), scale)
    rounded(draw, (0, 608, 122, 700), 28, rgba("#202829", 252), scale)
    save_png(downsample(image, w, h, scale), "side_panel.png")


def make_tab(name: str, active: bool = False, locked: bool = False) -> None:
    w = h = 92
    image, draw, scale = png_surface(w, h)
    if active:
        ellipse(draw, (3, 3, 89, 89), rgba("#fff8e8", 255), scale)
        ellipse(draw, (10, 10, 82, 82), rgba("#242b2d", 255), scale)
    else:
        ellipse(draw, (14, 14, 78, 78), rgba("#171d20", 238), scale)
    mark = rgba("#2a2d30", 220) if not locked else rgba("#535659", 220)
    draw_pet_mark(draw, 46, 47, scale, mark)
    if locked:
        rounded(draw, (33, 39, 59, 62), 5, rgba("#24282a", 230), scale)
        line(draw, [(37, 39), (37, 32), (55, 32), (55, 39)], rgba("#24282a", 230), 5, scale)
    save_png(downsample(image, w, h, scale), name)


def make_slot(name: str, locked: bool = False) -> None:
    w = h = 92
    image, draw, scale = png_surface(w, h)
    ellipse(draw, (7, 7, 85, 85), rgba("#15191c", 248), scale)
    ellipse(draw, (13, 13, 79, 79), rgba("#202426", 90), scale)
    draw_pet_mark(draw, 46, 49, scale, rgba("#2b2d31", 230))
    if locked:
        rounded(draw, (35, 42, 57, 63), 5, rgba("#4c5254", 235), scale)
        line(draw, [(39, 42), (39, 35), (53, 35), (53, 42)], rgba("#4c5254", 235), 4, scale)
    save_png(downsample(image, w, h, scale), name)


def make_empty_info() -> None:
    w, h = 380, 320
    image, draw, scale = png_surface(w, h)
    cream = rgba("#fff7e8", 248)
    ellipse(draw, (72, 86, 260, 226), cream, scale)
    ellipse(draw, (145, 40, 245, 150), cream, scale)
    ellipse(draw, (230, 103, 318, 200), cream, scale)
    polygon(draw, [(166, 219), (204, 220), (180, 252)], cream, scale)
    ellipse(draw, (178, 60, 236, 162), rgba("#a8cbc8", 255), scale)
    ellipse(draw, (193, 166, 241, 214), rgba("#a8cbc8", 255), scale)
    for cx, cy, outer in [(77, 117, 22), (317, 94, 16), (304, 142, 31), (83, 208, 18)]:
        polygon(draw, star_points(cx, cy, outer, max(7, outer // 2)), cream, scale)
    text_center(draw, (190, 282), "暂无精灵信息", 30, rgba("#fff7e8", 255), scale, True)
    save_png(downsample(image, w, h, scale), "empty_info_panel.png")


def make_selector() -> None:
    w, h = 386, 82
    image, draw, scale = png_surface(w, h)
    rounded(draw, (0, 0, w, h), 41, rgba("#202829", 255), scale)
    rounded(draw, (82, 11, 304, 71), 29, rgba("#fff8e8", 255), scale)
    save_png(downsample(image, w, h, scale), "box_selector_panel.png")


def make_label_title() -> None:
    w, h = 112, 42
    image, draw, scale = png_surface(w, h)
    text_center(draw, (w // 2, h // 2), "精灵盒子", 25, rgba("#202321", 255), scale, True)
    save_png(downsample(image, w, h, scale), "box_label_title.png")


def make_arrow(name: str, direction: str) -> None:
    w = h = 62
    image, draw, scale = png_surface(w, h)
    ellipse(draw, (2, 2, 60, 60), rgba("#fff8e8", 255), scale)
    if direction == "left":
        pts = [(36, 16), (19, 31), (36, 46)]
    else:
        pts = [(26, 16), (43, 31), (26, 46)]
    polygon(draw, pts, rgba("#202321", 255), scale)
    save_png(downsample(image, w, h, scale), name)


def make_label_icon(name: str, page: int) -> None:
    w, h = 70, 62
    image, draw, scale = png_surface(w, h)
    draw_pet_mark(draw, 38, 28, scale, rgba("#202321", 255))
    ellipse(draw, (38, 34, 62, 58), rgba("#202321", 255), scale)
    text_center(draw, (50, 48), str(page), 18, rgba("#fff8e8", 255), scale, True)
    save_png(downsample(image, w, h, scale), name)


def make_round_button(name: str, icon: str, dark: bool = False) -> None:
    w = h = 64
    image, draw, scale = png_surface(w, h)
    if dark:
        ellipse(draw, (2, 2, 62, 62), rgba("#15191a", 255), scale)
        ellipse(draw, (7, 7, 57, 57), rgba("#fff8e8", 230), scale)
        fill = rgba("#202321", 255)
    else:
        ellipse(draw, (2, 2, 62, 62), rgba("#fff8e8", 255), scale)
        fill = rgba("#202321", 255)
    if icon == "filter":
        draw_funnel(draw, 32, 32, scale, fill)
    elif icon == "box":
        draw_box_icon(draw, 32, 28, scale, fill)
    elif icon == "bottom":
        draw_box_icon(draw, 32, 30, scale, fill)
    save_png(downsample(image, w, h, scale), name)


def make_close() -> None:
    w = h = 68
    image, draw, scale = png_surface(w, h)
    line(draw, [(20, 18), (49, 47)], rgba("#444947", 255), 16, scale)
    line(draw, [(49, 18), (20, 47)], rgba("#444947", 255), 16, scale)
    line(draw, [(20, 18), (49, 47)], rgba("#fff8e8", 255), 10, scale)
    line(draw, [(49, 18), (20, 47)], rgba("#fff8e8", 255), 10, scale)
    save_png(downsample(image, w, h, scale), "btn_close.png")


def make_expand() -> None:
    w, h = 82, 92
    image, draw, scale = png_surface(w, h)
    ellipse(draw, (8, 2, 74, 68), rgba("#171b1c", 255), scale)
    ellipse(draw, (14, 8, 68, 62), rgba("#fff8e8", 220), scale)
    line(draw, [(26, 22), (56, 22)], rgba("#202321", 255), 5, scale)
    line(draw, [(26, 34), (56, 34)], rgba("#202321", 255), 5, scale)
    line(draw, [(26, 46), (56, 46)], rgba("#202321", 255), 5, scale)
    polygon(draw, [(21, 18), (14, 24), (21, 30)], rgba("#202321", 255), scale)
    polygon(draw, [(21, 42), (14, 48), (21, 54)], rgba("#202321", 255), scale)
    text_center(draw, (41, 79), "展开", 21, rgba("#fff8e8", 255), scale, True)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    cleanup_pet_specific_pngs()
    cleanup_generated_type_pngs()

    make_background()
    make_side_panel()
    make_tab("tab_pet_active.png", active=True)
    make_tab("tab_pet_normal.png")
    make_slot("pet_slot_empty.png")
    make_selected_slot()
    make_empty_info()
    make_selector()
    make_label_title()
    make_arrow("btn_arrow_left.png", "left")
    make_arrow("btn_arrow_right.png", "right")
    make_label_icon("box_label_page_1.png", 1)
    make_label_icon("box_label_page_2.png", 2)
    make_round_button("btn_filter.png", "filter")
    make_close()
    make_detail_component_pngs()
    make_gender_icon("gender_male.png", "male")
    make_gender_icon("gender_female.png", "female")
    make_stat_icon("stat_icon_hp.png", "hp")
    make_stat_icon("stat_icon_attack.png", "attack")
    make_stat_icon("stat_icon_magic_attack.png", "magicAttack")
    make_stat_icon("stat_icon_defense.png", "defense")
    make_stat_icon("stat_icon_magic_defense.png", "magicDefense")
    make_stat_icon("stat_icon_speed.png", "speed")
    for pet in PET_BOX_MOCK_PETS:
        make_pet_avatar(pet)
        make_trait_icon(pet)
        make_pet_slot(pet)
        make_detail_panel(pet)
    print(f"generated {len(list(OUT_DIR.glob('*.png')))} png files in {OUT_DIR}")


if __name__ == "__main__":
    main()
