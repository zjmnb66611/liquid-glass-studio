# Liquid Glass Studio

一个以液态玻璃界面语言为主题的高质量视觉网站演示。

## 项目目标

页面不只是展示玻璃拟态效果，而是从用户视角组织信息：

- 首屏先建立主题和视觉记忆点
- 材质模块解释不同玻璃层在真实界面中的用途
- 体验模块拆解用户从看见到确认的路径
- 工艺模块展示图标、动效、对比度和折射细节
- 原则模块沉淀设计判断，避免单纯堆特效

## 文件结构

```text
液态玻璃设计演示/
├── index.html
├── README.md
├── styles/
│   └── main.css
└── scripts/
    ├── background.js
    └── interactions.js
```

## 技术组成

- Three.js: 渲染流体粒子背景
- SVG filters: 模拟玻璃折射和像素位移
- CSS backdrop-filter: 构建玻璃材质层
- Lucide icons: 统一线性图标语言
- Vanilla JS: 导航高亮、入场动效、鼠标高光和细微 3D 反馈

## 使用方式

可以直接用浏览器打开 `index.html`。如果浏览器限制本地 ES module 加载，建议在该目录启动一个静态服务器。

```powershell
python -m http.server 8080
```

然后访问：

```text
http://localhost:8080
```
