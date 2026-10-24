# 能天使 · Coopanion 桌宠形象包

非官方同人形象，包含红发、金瞳、光环和几何光翼。维护 / 发布：[Eroalot](https://github.com/Eroalot)。

![能天使](idle.png)

## 下载与安装

1. 安装支持 Figure API 2 的 [Coopanion](https://github.com/Pal-AI-Lab/Coopanion)。
2. 在 [Releases](https://github.com/Eroalot/coopanion-exusiai-figure/releases/latest) 下载 `exusiai-v0.2.1.zip`。
3. 打开 Coopanion →「装扮」→ 形象区「导入」，选择 ZIP，再选用「能天使」。不用提前解压。
4. 已有旧版时，确认替换同 ID 形象即可。

这是形象包，不需要到扩展页安装。聊天连接及 API Key 由使用者在 Coopanion 中自行配置。

## 动作

- 默认双手自然放下。
- 独立「比耶」动作：手臂连续抬起、停留、再缓缓放下，总时长约 2.8 秒。
- 可对桌宠说「比个耶」，由当前聊天模型调用；动作词为 `peace` / `比耶` / `胜利手势`。
- 支持眨眼、说话口型、走跑、跳跃、睡觉、拖拽及宿主框架动作。

## 兼容性与实际表现

- `manifest: 2` / `api: 2`，形象 ID：`exusiai-lightwings`，版本 `0.2.1`。
- Windows、Coopanion v0.2.8 对应框架中验证；其他平台未实机测试。
- 二维插画配合局部网格变形，不是 Live2D 模型。
- 坐姿使用身体压缩；光翼随整体身体移动，没有独立拍翼。
- 原图鞋面接近正面，左右移动采用整体镜像和鞋部摆动，不是独立侧面行走立绘。
- 形象包仅包含素材、绘制入口和文档，不含应用、聊天配置、API Key 或直播插件。

## 验证

使用真实框架检查比耶动作逐帧变化、自动恢复、眨眼配准、说话口型、双向移动与抵达、跳跃、坐睡、拖拽、销毁及官方不透明源沙箱加载。抬手区间的 49 个采样画面均不同；这不是对所有表情逐项视觉验收的声明。

## 素材与权利

角色来自《明日方舟》。美术基于用户参考，经 AI 工具生成和编辑；原始参考图不随包分发。角色、商标及参考素材的权利属于相应权利人。详见 [RIGHTS.md](RIGHTS.md)。

[Coopanion 官方形象包说明](https://github.com/Pal-AI-Lab/Coopanion/tree/main/packages/cortico-world-desktop-pet#形象包)。
