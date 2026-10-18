"""
Usage: python scripts/make_story_videos.py lenny/denim-tide.jpg lenny-denim-tide

Makes the seed 'artwork in motion' videos: a slow, eased push-in on a still artwork, 9:16, 8 seconds.
Nothing is added to the artwork — no text, no effects beyond the camera move and a short fade in/out.
Artworks that are already close to 9:16 fill the frame; others sit on a blurred, darkened copy of themselves.
"""
import cv2, numpy as np, subprocess, math, sys, os

W, H, FPS, SECS = 720, 1280, 30, 8
BG = np.array([9, 10, 11], np.float32)  # #0b0a09 in BGR order
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "public", "art") + os.sep
OUT = os.path.join(ROOT, "public", "stories") + os.sep

def make(src, name):
    img = cv2.imread(SRC + src)
    ih, iw = img.shape[:2]
    ratio = iw / ih
    fill = abs(ratio - W / H) / (W / H) < 0.06          # already ~9:16 → fill the frame
    if fill:
        base = max(W / iw, H / ih)                       # cover
        bg = None
    else:
        base = min(W * 0.9 / iw, H * 0.72 / ih)          # contain, with room around it
        cover = max(W / iw, H / ih)
        bgi = cv2.resize(img, (int(iw * cover) + 1, int(ih * cover) + 1), interpolation=cv2.INTER_AREA)
        y0, x0 = (bgi.shape[0] - H) // 2, (bgi.shape[1] - W) // 2
        bgi = bgi[y0:y0 + H, x0:x0 + W]
        bg = (cv2.GaussianBlur(bgi, (0, 0), 28).astype(np.float32) * 0.42 + BG * 0.58)

    procs = []
    for ext, args in (
        ("mp4", ["-c:v", "libx264", "-preset", "slow", "-crf", "25", "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart"]),
        ("webm", ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36", "-pix_fmt", "yuv420p", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2"]),
    ):
        procs.append(subprocess.Popen(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-an", *args, f"{OUT}{name}.{ext}"],
            stdin=subprocess.PIPE))
    n = FPS * SECS
    for f in range(n):
        t = f / (n - 1)
        e = 0.5 - 0.5 * math.cos(math.pi * t)            # ease in-out
        s = base * (1.0 + 0.10 * e)                       # 10% push-in
        dx, dy = 14 * (e - 0.5), -10 * (e - 0.5)          # a slight drift
        M = np.float32([[s, 0, W / 2 - iw * s / 2 + dx], [0, s, H / 2 - ih * s / 2 + dy]])
        warped = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE if fill else cv2.BORDER_CONSTANT)
        if fill:
            frame = warped.astype(np.float32)
        else:
            mask = cv2.warpAffine(np.ones((ih, iw), np.float32), M, (W, H), flags=cv2.INTER_LINEAR)[..., None]
            frame = warped.astype(np.float32) * mask + bg * (1 - mask)
        fade = min(1.0, f / (FPS * 0.35), (n - 1 - f) / (FPS * 0.35))   # short fade in / out
        frame = frame * fade + BG * (1 - fade)
        if f == 0:
            cv2.imwrite(f"{OUT}{name}-poster.jpg", cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE) if fill else np.clip(frame*0+ (warped.astype(np.float32)*mask + bg*(1-mask)), 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 86])
        b = np.clip(frame, 0, 255).astype(np.uint8).tobytes()
        for p in procs:
            p.stdin.write(b)
    for p in procs:
        p.stdin.close()
        p.wait()
    sz = {e: os.path.getsize(f"{OUT}{name}.{e}") // 1024 for e in ("mp4", "webm")}
    print(f"{name}: fill={fill}  mp4 {sz['mp4']} KB  webm {sz['webm']} KB", flush=True)

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or len(args) % 2:
        sys.exit("usage: python scripts/make_story_videos.py <image path under public/art> <output name> [more pairs...]\n"
                 "  e.g. python scripts/make_story_videos.py lenny/denim-tide.jpg lenny-denim-tide\n"
                 "needs: python 3, opencv-python, numpy, and ffmpeg on your PATH")
    os.makedirs(OUT, exist_ok=True)
    for src, name in zip(args[::2], args[1::2]):
        make(src, name)
