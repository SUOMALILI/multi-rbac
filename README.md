<p align="center">
  <img src="https://github.com/SUOMALILI/multi-rbac/raw/main/logo.png" alt="Home Assistant RBAC Logo" width="180" />
</p>

<h1 align="center">🏠 Home Assistant Multi-RBAC Middleware (Dev)</h1>

<p align="center">

<strong>更强大、更灵活的多角色访问控制方案。</strong>

通过拦截服务调用，基于纯白名单机制为 Home Assistant 提供精细化的权限管理。



## 🌟 核心理念：V3 的进化

在 V3 版本中，我们彻底重构了权限模型，从单一角色（Single-role）转向了**多角色并集（Multi-role Union）**模式：

- **多角色支持**：一个用户可以同时拥有多个角色，最终权限是所有激活角色权限的并集。
- **纯白名单模式**：默认“拒绝所有”，只有在角色中明确授权的实体和服务才能被访问。
- **动态模板评估**：利用 Home Assistant 模板引擎，根据实时状态（如地理位置、时间）动态决定角色是否生效。
- **管理员豁免**：系统管理员自动绕过所有限制，确保核心配置永远安全可用。

## ✨ 主要功能

- 🛡️ **服务调用拦截**：深度集成底层 Service Registry，自动拦截并校验所有 Home Assistant 服务调用。
- 👥 **多角色管理**：支持为用户分配多个角色，权限自动合并。
- 📝 **YAML & GUI 双驱动**：既可以通过现代化的 Web 界面配置，也可以直接编辑 `access_control.yaml`。
- 🔍 **精细化控制**：支持 Domain（域）、Entity（实体）以及具体 Service（服务）级别的权限管控。
- 🚀 **前端深度集成**：配合 `rbac.js` 自动隐藏 Quick-bar 中未授权的实体，净化 UI 体验。
- 🔄 **热重载**：配置修改立即生效，无需重启 Home Assistant。
- 📊 **拒绝日志**：内置 `deny_log` 接口，实时追踪并记录所有非法访问尝试。

## 📸 界面预览

*(建议在此处更新 V3 版本多角色分配界面的截图)*

- **角色管理**：定义复杂的白名单规则。
- **用户分配**：为用户勾选多个角色。
- **动态条件**：配置 `merge_condition` 模板。

## 🚀 快速开始

### HACS 安装 (推荐)

1. 在 HACS 中搜索 `Multi-RBAC` 并安装。
2. 重启 Home Assistant。
3. 在集成页面添加 `RBAC`。
4. 在侧边栏进入配置面板开始设置。

### 手动安装

1. 将 `custom_components/rbac` 拷贝至你的 `custom_components` 目录。
2. 重启并安装集成。

## 💡 进阶玩法：动态角色控制

利用 V3 的 **Template Conditions**，你可以实现非常智能的场景控制。例如：

**场景：临时访客权限**

> 只有当访客在家时（基于地理位置），其“访客角色”才会生效。如果访客离开，即使账号还在，也无法控制家中设备。

YAML

```
# 在角色配置中使用 merge_condition
merge_condition: "{{ states('person.guest') == 'home' }}"
```

## 🛠 开发与架构

项目采用了前后端分离的现代化架构：

- **后端**：Python (Home Assistant 集成)，采用 Monkey-patching 技术实现非侵入式中间件。
- **前端**：Preact + Ant Design + Vite，构建极其轻量且响应迅速的管理后台。



## 📄 开源协议

本项目基于 MIT 协议开源。欢迎提交 Pull Request 或 Issue！
