# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Home Assistant RBAC Middleware** - a flexible Role-Based Access Control (RBAC) middleware component for Home Assistant that intercepts service calls and enforces access control based on YAML configuration.

**Current Development Status:** Migrating from V2 (single-role, mixed allow/deny) to V3 (multi-role, pure whitelist). The project is actively being developed.

**Key Features:**
- Service call interception for all Home Assistant services
- YAML-based configuration with dynamic reload
- Modern Preact frontend for configuration management
- Domain, entity, and service-level access control
- Frontend blocking of restricted entities in quick-bar
- Template-based role conditions using Home Assistant templates
- **V3 Features:** Multi-role support, pure whitelist mode, admin role exemption, template condition merging

## Development Commands

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server (port 5173)
npm run build        # Build frontend to custom_components/rbac/www/
npm run preview      # Preview built frontend
```

### Backend Development
```bash
python3 -m py_compile custom_components/rbac/*.py  # Syntax check
```

**Note:** `ruff` is configured but not installed globally. Use Python syntax check instead.

### Deployment
```bash
./scripts/deploy.sh              # Full deployment (backend + frontend)
./scripts/deploy-frontend.sh     # Frontend-only deployment
```

**Deployment Requirements:**
- Create `.env` file from `.env.example` with SSH credentials
- SSH access to Home Assistant server
- Home Assistant custom_components directory path configured
- `sshpass` installed for automated SSH password authentication
- Frontend must be built before deployment (handled by deploy scripts)

### VS Code Tasks (`.vscode/tasks.json`)
- **Deploy Backend + Frontend**: Runs `./scripts/deploy.sh` (full deployment with restart)
- **Build + Deploy Frontend**: Runs `./scripts/deploy-frontend.sh` (frontend only)
- **Start Dev Server**: Runs `npm run dev` in frontend directory (background task)
- **Task Presentation**: All tasks show output in shared panel

## Architecture Overview

### Backend Structure (`custom_components/rbac/`)
- **`__init__.py`**: Main integration setup, middleware interception, configuration loading, permission evaluation
- **`services.py`**: Service definitions, HTTP API endpoints, user management (1,479 lines - largest file)
- **`const.py`**: Constants, role hierarchy, restrictable domains/services, configuration version
- **`sensor.py`**: RBAC sensor entities (configuration URL, status sensors)
- **`config_flow.py`**: Configuration flow for Home Assistant UI

**Key Methods:**
- `async_setup`: Main setup, patches service registry
- `_check_access`: Core permission evaluation logic
- `_evaluate_user_roles`: Determines user's active roles with template conditions
- `_load_access_control_config`: Loads and validates YAML config
- `_save_access_control_config`: Saves configuration changes

**Service Registry Patching**: Monkey-patches Home Assistant's service call handling to intercept all service calls.

### Frontend Structure (`frontend/`)
- **Preact + Ant Design + CodeMirror** stack
- **`src/components/`**: React components for configuration UI
  - `App.jsx`: Main application component with layout and state management
  - `RoleEditModal.jsx`: Role editing with permissions configuration
  - `RolesManagement.jsx`: Role listing and management
  - `UserAssignments.jsx`: User role assignment interface
  - `DefaultRestrictions.jsx`: Default domain/entity restrictions
- **Build output**: `custom_components/rbac/www/` (config.html, config.js, rbac.js)
- **Build process**: Vite-based bundling with Preact preset
- **API Communication**: `makeAuthenticatedRequest` utility for backend API calls

### Middleware Pattern
1. **Service Interception**: Patches Home Assistant's service registry in `__init__.py` `async_setup`
2. **Role Evaluation**: Evaluates user roles and permissions per service call using `_check_access`
3. **Template Support**: Role conditions can use Home Assistant templates with `merge_condition`
4. **Dynamic Configuration**: YAML config reloadable without restart via API or service call
5. **Multi-Role Merging**: User permissions are union of all active role permissions
6. **Admin Exemption**: Users with admin role bypass all restrictions
7. **Default Restrictions**: Always applied to non-admin users
8. **Frontend Integration**: `rbac.js` filters UI elements based on permissions

### Permission Model (V3 - Pure Whitelist)
- **Pure Whitelist**: Roles define what's allowed (empty permissions = no access)
- **Admin Role Exemption**: Users with admin role bypass all restrictions
- **Multi-Role Support**: Users can have multiple roles, permissions are merged (union)
- **Template Conditions**: Roles can have Home Assistant template conditions that determine when they apply (`merge_condition: true/false`)
- **Default Restrictions**: Always applied to non-admin users (defined in `access_control.yaml`)

### HTTP API Endpoints (`services.py`)
- `/api/rbac/config` - Configuration management (GET/PUT) - full config CRUD
- `/api/rbac/users` - User management (GET/POST/DELETE) - user role assignments
- `/api/rbac/domains` - Domain listing (GET) - all available Home Assistant domains
- `/api/rbac/entities` - Entity listing (GET) - all entities (filtered by permissions)
- `/api/rbac/services` - Service listing (GET) - services per domain
- `/api/rbac/current_user` - Current user info (GET) - authenticated user details
- `/api/rbac/deny_log` - Access denial logging (GET) - recent denied service calls
- `/api/rbac/static/` - Static file serving (config.html, config.js, rbac.js)

**Authentication**: Uses Home Assistant's built-in authentication system.

## Key Directories and Files

### Essential Paths
- `custom_components/rbac/` - Backend Python integration
- `frontend/src/` - Frontend source code
- `custom_components/rbac/www/` - Built frontend assets (deployed to Home Assistant)
- `scripts/` - Deployment and development scripts

### Configuration Files
- `custom_components/rbac/access_control.yaml` - Default access control config (V3 format)
- `custom_components/rbac/services.yaml` - Service definitions
- `custom_components/rbac/manifest.json` - Integration metadata (domain, name, version, requirements)
- `requirements.txt` - Python dependencies (PyYAML)

### Development Configuration
- `.devcontainer.json` - VS Code dev container setup (Python 3.13 + Node.js)
- `.vscode/tasks.json` - Build/deploy tasks
- `.ruff.toml` - Python linting configuration (based on Home Assistant core, target-version: py313)
- `frontend/package.json` - Frontend dependencies (Preact, Ant Design, CodeMirror, Vite)
- `frontend/vite.config.js` - Vite build configuration (Preact preset, outputs to `custom_components/rbac/www/`)

## Development Workflow

1. **Local Setup**: Use VS Code dev container (Python 3.13 + Node.js) or local environment
2. **Frontend Development**: `cd frontend && npm run dev` (runs Vite dev server on port 5173)
3. **Backend Development**: Edit Python files in `custom_components/rbac/`
4. **Build Frontend**: `cd frontend && npm run build` (outputs to `custom_components/rbac/www/`)
5. **Deploy**: Configure `.env` from `.env.example` and run `./scripts/deploy.sh`
6. **Test**: Access configuration at `/api/rbac/static/config.html` in Home Assistant
7. **Frontend Script**: Add to Home Assistant configuration.yaml:
   ```yaml
   frontend:
     extra_module_url:
       - /api/rbac/static/rbac.js
   ```

## Testing and CI/CD

### GitHub Actions Workflows
- `.github/workflows/backend-build.yml` - Backend build and validation (Python linting, manifest validation, frontend build required)
- `.github/workflows/frontend-build.yml` - Frontend build (Node.js, Vite build, artifact upload)
- `.github/workflows/pr-checks.yml` - Pull request validation (runs both frontend and backend checks conditionally)

**CI Dependencies**: Python 3.11, Node.js 18, PyYAML, homeassistant package

**Trigger Paths**: Workflows run only when relevant files change (custom_components/, frontend/, .github/workflows/)

## Important Notes

- **Admin Access**: Only admin users can access RBAC configuration page
- **Template Conditions**: Roles can use Home Assistant templates for dynamic evaluation (`merge_condition: true/false`)
- **Default Restrictions**: Non-admin users always have default domain/entity restrictions enforced
- **Frontend Blocking**: `rbac.js` script filters quick-bar based on user permissions
- **Service Calls**: All Home Assistant service calls are intercepted and evaluated
- **Configuration Version**: Currently using V3 (pure whitelist, multi-role) format
- **Data Flow**: Frontend communicates with backend via `/api/rbac/*` endpoints defined in `services.py`
- **Middleware Pattern**: Patches Home Assistant service registry to intercept calls
- **Security**: Relies on Home Assistant's authentication system; no separate auth needed
- **Deployment**: Requires SSH access to Home Assistant server with `sshpass`
- **Active Development**: Project is under active development; APIs and formats may change
- **Monkey Patching**: Modifies Home Assistant core behavior - may break with updates

## Recent Architecture Changes

### RBAC V3 Simplification (2026-02-28)
- **完全移除向后兼容**: 不再处理`role`字段，只使用`roles`数组
- **空角色支持**: 用户可以没有分配任何角色（空`roles`数组），此时用户没有任何设备控制权限
- **角色重复验证**: 防止创建同名角色，但允许编辑现有角色时使用相同名称
- **简化错误信息**: 用户无角色时显示"no_roles"而不是"unknown"
- **统一数据格式**: 前后端都只使用`roles`数组格式

**关键修改文件:**
- `custom_components/rbac/__init__.py`: 修复角色获取逻辑，移除`role`字段支持
- `custom_components/rbac/services.py`: 修复角色删除逻辑，添加角色重复验证
- `frontend/src/components/UserAssignments.jsx`: 移除默认user角色分配
- `frontend/src/components/RoleEditModal.jsx`: 添加角色重复验证规则

**前端参数传递**: `RoleEditModal`组件需要`availableRoles`参数从父组件传递，用于角色重复验证。