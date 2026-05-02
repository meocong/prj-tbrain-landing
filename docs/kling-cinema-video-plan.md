# Plan tạo video cinema bằng Kling

## Bối cảnh hiện tại trên site

- Component video dùng chung: `src/components/marketing/fx/VideoBackground.tsx`.
- Trang Physical AI đã có video nền cinema rồi, nên giai đoạn này chưa cần thêm video mới cho Physical AI.
- Asset Physical AI hiện tại:
  - `/public/videos/physical-ambient.webm`
  - `/public/videos/physical-ambient.mp4`
  - `/public/images/physical-poster.jpg`
- File đang cắm video Physical AI: `src/app/data/physical-ai/_sections/HeroPhysical.tsx`.
- Hai nơi nên thêm video tiếp theo:
  - Home hero: `src/components/marketing/sections/HeroSection.tsx`
  - Terminal Bench hero: `src/components/terminal-bench/landing/Hero.tsx`
- Format mục tiêu: 16:9, muted, loop được, chuyển động nhẹ, file nhẹ. Video Physical AI hiện tại khoảng 3 MB mỗi file.

## Quy trình dùng Kling đề xuất

Dùng Kling để tạo asset offline, không gọi Kling trực tiếp lúc user mở website.

1. Gen 3-5 clip candidate trong Kling.
2. Ưu tiên `image-to-video` nếu có ảnh reference/poster đẹp để giữ style ổn định.
3. Dùng `text-to-video` khi muốn explore concept rộng hơn.
4. Chọn duration 5s trước; chỉ dùng 10s nếu loop 5s bị lặp quá rõ.
5. Download clip tốt nhất.
6. Encode thành cả WebM và MP4.
7. Tạo poster frame tương ứng trong `/public/images/`.
8. Cắm asset vào hero component tương ứng.

Docs Kling hiện có async task, text-to-video, image-to-video, video extension, lip-sync. Các tham số quan trọng thường là `model`, `prompt`, `duration`, `aspect_ratio`, `mode`, `negative_prompt`.

Nguồn đã check ngày 2026-05-02:

- https://klingapi.com/docs
- https://klingapi.com/features

## Video cần tạo

### 1. Video cho Home hero

Mục tiêu: thêm mood cinema cho first viewport của homepage, nhưng không làm headline khó đọc.

File code sẽ cắm:

```text
src/components/marketing/sections/HeroSection.tsx
```

Tên asset nên dùng:

```text
public/videos/home-cinema.webm
public/videos/home-cinema.mp4
public/images/home-cinema-poster.jpg
```

Setting đề xuất trong Kling:

```text
Mode: Image-to-video nếu có reference frame đẹp; nếu chưa có thì text-to-video
Duration: thử 5s trước, 10s nếu loop bị cụt
Aspect ratio: 16:9
Camera: slow dolly / slow parallax
Motion: chuyển động nhẹ, ambient, không cắt cảnh nhanh
```

Prompt:

```text
Cinematic 16:9 hero background video for an AI data infrastructure company, a premium robotics and agent-evaluation lab, optical motion capture stage in the distance, abstract terminal traces and clean data pipeline visualizations floating as subtle glass UI overlays, server-room depth, human experts reviewing AI outputs at workstations, dark elegant lighting with purple and teal accents, realistic B2B technology film, slow dolly movement, shallow depth of field, no readable text, no logos, no close-up faces, no distorted hands, seamless loop ambient motion
```

Negative prompt:

```text
readable text, logo, watermark, brand marks, cartoon, anime, cyberpunk city, neon overload, distorted hands, extra fingers, extra limbs, close-up face, horror, weapons, shaky camera, fast cuts, flashing lights, cluttered dashboard
```

Lưu ý khi chọn clip:

- Khu vực giữa màn hình nên tương đối yên, vì headline nằm ở trung tâm.
- Tránh mọi chữ/câu lệnh đọc được trong video. Text AI sinh ra thường méo và nhìn rẻ.
- Mood tốt nhất: premium, abstract vừa đủ, vẫn gợi được robotics + agents + data.

### 2. Video cho Terminal Bench hero

Mục tiêu: Terminal Bench có identity cinema riêng: terminal task thật, Docker environment, deterministic verification, agent evaluation.

File code sẽ cắm:

```text
src/components/terminal-bench/landing/Hero.tsx
```

Tên asset nên dùng:

```text
public/videos/terminal-bench-cinema.webm
public/videos/terminal-bench-cinema.mp4
public/images/terminal-bench-cinema-poster.jpg
```

Setting đề xuất trong Kling:

```text
Mode: Image-to-video nếu có terminal/dashboard reference frame; nếu chưa có thì text-to-video
Duration: 5s
Aspect ratio: 16:9
Camera: slow push-in / slow lateral parallax
Motion: cursor glow, test status pulse, container/node movement; không typing quá nhanh
```

Prompt chính:

```text
Cinematic 16:9 hero background video for a software agent benchmark product, dark premium engineering lab, floating terminal windows, Docker container boxes, test harness results, code diff panels, verification pipeline nodes, agent task execution visualized as clean glowing paths through a Linux environment, subtle green pass checks and purple highlights, realistic high-end B2B SaaS product film, slow push-in camera, crisp glass UI, minimal motion, no readable text, no logos, no brand names, seamless loop
```

Negative prompt:

```text
readable text, logo, watermark, fake brand, chaotic hacker screen, matrix rain, cyberpunk city, excessive neon, red error spam, distorted UI, tiny illegible clutter, people close-up, shaky camera, fast cuts, flashing lights
```

Prompt thay thế nếu Kling làm UI quá rối:

```text
Cinematic macro video of an AI coding agent evaluation environment, abstract terminal panels and Docker containers arranged like a clean technical instrument, deterministic test pipeline glowing softly, green pass signal moving through stages, purple and teal accent light, dark glass background, premium enterprise software aesthetic, slow parallax, no readable text, no logos, seamless loop
```

Lưu ý khi chọn clip:

- Terminal Bench hero đã có `TerminalDevice` ở bên phải, nên video chỉ nên là background layer.
- Video cần low-contrast, không tranh visual với terminal card.
- Tránh code/command readable trong video vì text generated rất dễ lỗi.

### 3. Physical AI hero

Mục tiêu: chỉ dùng sau, nếu muốn thay video Physical AI hiện tại. Không ưu tiên lúc này vì Physical AI đã có video nền rồi.

Prompt:

```text
Cinematic 16:9 hero background video, humanoid robot training lab, optical motion capture stage, human performer wearing subtle mocap markers, robotic hands and depth cameras visible, clean white and glass lab, soft morning light, slow dolly movement, premium B2B technology film, realistic, no text, no logos, no distorted faces, no extra limbs, loopable ambient motion
```

Negative prompt:

```text
text, watermark, logo, cartoon, anime, horror, low resolution, distorted hands, distorted robot, extra fingers, extra limbs, shaky camera, harsh flicker, dark nightclub, weapons
```

### 4. Video loop cho product/capability section

Mục tiêu: một motif ngắn có thể tái dùng ở home/product section, gần tinh thần Physical AI nhưng abstract hơn.

Prompt:

```text
Cinematic macro shot of AI data capture pipeline, motion capture dots becoming clean skeletal trajectories, transparent UI overlays, robotics lab in background, soft neutral lighting, premium SaaS product visual, slow parallax camera, abstract but realistic, no readable text, no logos, seamless loop
```

### 5. Video card cho Case Study

Mục tiêu: teaser video cho case-study card hoặc header case-study.

Prompt:

```text
Cinematic case study teaser, human operator demonstrating warehouse manipulation task for humanoid robot training, multi-camera rig, clean industrial floor, subtle data overlays and tracking points, slow steady camera, realistic B2B documentary style, no text, no logos, loopable
```

## Encode video cho web

Giữ file gốc chất lượng cao, sau đó nén thành WebM + MP4.

Ví dụ cho Home hero:

```bash
ffmpeg -i input.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -an -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 public/videos/home-cinema.webm
ffmpeg -i input.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -an -c:v libx264 -crf 25 -preset slow -movflags +faststart public/videos/home-cinema.mp4
ffmpeg -i input.mp4 -vf "select=eq(n\\,0),scale=1920:1080" -frames:v 1 public/images/home-cinema-poster.jpg
```

Ví dụ cho Terminal Bench:

```bash
ffmpeg -i input.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -an -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 public/videos/terminal-bench-cinema.webm
ffmpeg -i input.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -an -c:v libx264 -crf 25 -preset slow -movflags +faststart public/videos/terminal-bench-cinema.mp4
ffmpeg -i input.mp4 -vf "select=eq(n\\,0),scale=1920:1080" -frames:v 1 public/images/terminal-bench-cinema-poster.jpg
```

Nếu đầu/cuối clip bị khựng khi loop, nên xử lý crossfade loop trước khi encode.

## Cách cắm vào code

Sau khi có asset, cắm bằng component `VideoBackground`.

Ví dụ Home hero:

```tsx
<VideoBackground
  src="/videos/home-cinema.webm"
  srcMp4="/videos/home-cinema.mp4"
  poster="/images/home-cinema-poster.jpg"
  overlay={...}
/>
```

Ví dụ Terminal Bench:

```tsx
<VideoBackground
  src="/videos/terminal-bench-cinema.webm"
  srcMp4="/videos/terminal-bench-cinema.mp4"
  poster="/images/terminal-bench-cinema-poster.jpg"
  overlay={...}
/>
```

Nếu có nhiều variant, tạo constant như `HOME_HERO_VIDEO` và `TERMINAL_BENCH_HERO_VIDEO`, đừng hardcode nhiều path rải rác trong component.
