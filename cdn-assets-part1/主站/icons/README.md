# Favicon / 站点图标 尺寸规范

请将对应尺寸的图片放入此文件夹，并按文件名命名：

## 必需
| 文件名 | 尺寸 | 用途 |
|--------|------|------|
| `favicon.ico` | 16×16, 32×32, 48×48 (多尺寸 ICO) | 浏览器标签、收藏夹 |
| `favicon-16.png` | 16×16 | 标签页小图标 |
| `favicon-32.png` | 32×32 | 标签页、书签栏 |
| `apple-touch-icon.png` | 180×180 | iOS 主屏幕图标 |

## 推荐 (PWA / 高清屏)
| 文件名 | 尺寸 | 用途 |
|--------|------|------|
| `icon-192.png` | 192×192 | Android Chrome、PWA 清单 |
| `icon-512.png` | 512×512 | Android 启动画面、PWA |
| `safari-pinned-tab.svg` | SVG (单色) | Safari 固定标签 |

## HTML 引用示例
```html
<link rel="icon" type="image/x-icon" href="icons/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16.png">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="manifest" href="icons/manifest.json">
```

## manifest.json (可选，PWA 用)
```json
{
  "name": "我的粒子",
  "short_name": "粒子",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#0d0e11",
  "background_color": "#0d0e11",
  "display": "standalone"
}
```

---

**提示**：`favicon.ico` 最好用在线工具 (如 realfavicongenerator.net) 把多尺寸合成一个 `.ico` 文件。