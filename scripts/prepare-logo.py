import os
import shutil
from PIL import Image

src_img = r"C:\Users\USER\.gemini\antigravity-ide\brain\cee18048-415e-4c41-aaf6-914ef4798ffd\.user_uploaded\media_1792215162750.png"
out_dir = r"d:\WEB SİTELERİ\asiaplast\public\images"
icons_dir = r"d:\WEB SİTELERİ\asiaplast\public\icons"
public_dir = r"d:\WEB SİTELERİ\asiaplast\public"

os.makedirs(out_dir, exist_ok=True)
os.makedirs(icons_dir, exist_ok=True)

im = Image.open(src_img).convert("RGBA")
bbox = im.getbbox()
print("Original bbox:", bbox)

# 1. Main Logo (Tight crop with clean 12px horizontal and 8px vertical padding)
pad_x = 12
pad_y = 8
crop_box = (
    max(0, bbox[0] - pad_x),
    max(0, bbox[1] - pad_y),
    min(im.width, bbox[2] + pad_x),
    min(im.height, bbox[3] + pad_y)
)
logo_tight = im.crop(crop_box)
logo_tight.save(os.path.join(out_dir, "logo.png"), "PNG", optimize=True)
logo_tight.save(os.path.join(public_dir, "logo.png"), "PNG", optimize=True)
print("Saved logo.png size:", logo_tight.size)

# Also create a dark-theme / white-text version for dark headers/sidebars
# In the white version: the navy letters (#012654) become white (#ffffff)
# while the cyan/teal emblem (#00b4c3) remains vibrant cyan/teal
white_logo_data = []
for r, g, b, a in logo_tight.getdata():
    if a < 10:
        white_logo_data.append((0, 0, 0, 0))
    elif b > 60 and r < 40 and g < 60:  # The navy letters
        white_logo_data.append((255, 255, 255, a))
    else:  # The cyan emblem / dot
        white_logo_data.append((r, g, b, a))

logo_white = Image.new("RGBA", logo_tight.size)
logo_white.putdata(white_logo_data)
logo_white.save(os.path.join(out_dir, "logo-white.png"), "PNG", optimize=True)
logo_white.save(os.path.join(public_dir, "logo-white.png"), "PNG", optimize=True)
print("Saved logo-white.png size:", logo_white.size)

# 2. Extract the emblem 'A' mark on the left (up to x=456)
emblem_raw = im.crop((bbox[0], bbox[1], 456, bbox[3]))
emblem_box = emblem_raw.getbbox()
emblem_tight = emblem_raw.crop(emblem_box)
print("Emblem tight size:", emblem_tight.size)

# Place emblem into square canvas with generous, balanced margin for favicon & app icons
ew, eh = emblem_tight.size
canvas_size = max(ew, eh) + int(max(ew, eh) * 0.16)
square_canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
pos_x = (canvas_size - ew) // 2
pos_y = (canvas_size - eh) // 2
square_canvas.paste(emblem_tight, (pos_x, pos_y), emblem_tight)

square_canvas.save(os.path.join(out_dir, "logo-icon.png"), "PNG", optimize=True)
square_canvas.save(os.path.join(public_dir, "logo-icon.png"), "PNG", optimize=True)
print("Saved logo-icon.png size:", square_canvas.size)

# Generate favicons & touch icons
for sz in [16, 32, 48]:
    resized = square_canvas.resize((sz, sz), Image.Resampling.LANCZOS)
    resized.save(os.path.join(public_dir, f"favicon-{sz}x{sz}.png"), "PNG", optimize=True)

# Apple touch icon (180x180) - usually with solid background or elegant transparent
apple_touch = square_canvas.resize((180, 180), Image.Resampling.LANCZOS)
apple_touch.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG", optimize=True)

# Favicon.ico with multiple sizes (16, 32, 48)
square_canvas.save(
    os.path.join(public_dir, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)]
)

# App icons 192 and 512
icon192 = square_canvas.resize((192, 192), Image.Resampling.LANCZOS)
icon192.save(os.path.join(icons_dir, "icon-192.png"), "PNG", optimize=True)

icon512 = square_canvas.resize((512, 512), Image.Resampling.LANCZOS)
icon512.save(os.path.join(icons_dir, "icon-512.png"), "PNG", optimize=True)

# Maskable 512 with brand background or generous safe area
maskable = Image.new("RGBA", (512, 512), (255, 255, 255, 255))
emblem_for_mask = square_canvas.resize((360, 360), Image.Resampling.LANCZOS)
maskable.paste(emblem_for_mask, ((512 - 360) // 2, (512 - 360) // 2), emblem_for_mask)
maskable.save(os.path.join(icons_dir, "maskable-512.png"), "PNG", optimize=True)

print("All logo assets generated successfully!")
