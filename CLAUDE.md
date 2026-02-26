# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Home Assistant RBAC Middleware** - a flexible Role-Based Access Control (RBAC) middleware component for Home Assistant that intercepts service calls and enforces access control based on YAML configuration.

**Key Features:**
- Service call interception for all Home Assistant services
- YAML-based configuration with dynamic reload
- Modern Preact frontend for configuration management
- Domain, entity, and service-level access control
- Frontend blocking of restricted entities in quick-bar
- Template-based role conditions using Home Assistant templates

## Development Commands

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build frontend to custom_components/rbac/www/
npm run preview      # Preview built frontend
```

### Backend Development
```bash
ruff check          # Lint Python code (configured in .ruff.toml)
```

### Deployment
```bash
./scripts/deploy.sh              # Full deployment (backend + frontend)
./scripts/deploy-frontend.sh     # Frontend-only deployment
```

**Deployment Requirements:**
- Create `.env` file from `.env.example` with SSH credentials
- SSH access to Home Assistant server
- Home Assistant custom_components directory path configured

### VS Code Tasks
- **Deploy Backend + Frontend**: Runs `./scripts/deploy.sh`
- **Build + Deploy Frontend**: Runs `./scripts/deploy-frontend.sh`
- **Start Dev Server**: Runs `npm run dev` in frontend directory

## Architecture Overview

### Backend Structure (`custom_components/rbac/`)
- **`__init__.py`**: Main integration setup, middleware interception, configuration loading
- **`services.py`**: Service definitions, HTTP API endpoints, user management (1,479 lines)
- **`const.py`**: Constants, role hierarchy, restrictable domains/services
- **`sensor.py`**: RBAC sensor entities (configuration URL, status sensors)
- **`config_flow.py`**: Configuration flow for Home Assistant UI

### Frontend Structure (`frontend/`)
- **Preact + Ant Design + CodeMirror** stack
- **`src/components/`**: React components for configuration UI
- **`src/utils/`**: Authentication helpers, theme management
- **Build output**: `custom_components/rbac/www/` (config.html, config.js, rbac.js)

### Middleware Pattern
1. **Service Interception**: Patches Home Assistant's service registry
2. **Role Evaluation**: Evaluates user roles and permissions per service call
3. **Template Support**: Role conditions can use Home Assistant templates
4. **Dynamic Configuration**: YAML config reloadable without restart

### Permission Model
- **Role Hierarchy**: guest (0) < user (1) < admin (2) < super_admin (3)
- **Domain/Entity Control**: Restrict at domain or specific entity level
- **Service/Action Control**: Restrict specific services within domains
- **Allow/Deny Lists**: Configure roles to allow all (with exceptions) or deny all (with exceptions)

### HTTP API Endpoints (`services.py`)
- `/api/rbac/config` - Configuration management
- `/api/rbac/users` - User management
- `/api/rbac/domains` - Domain listing
- `/api/rbac/entities` - Entity listing
- `/api/rbac/services` - Service listing
- `/api/rbac/current_user` - Current user info
- `/api/rbac/deny_log` - Access denial logging
- `/api/rbac/static/` - Static file serving

## Key Directories and Files

### Essential Paths
- `custom_components/rbac/` - Backend Python integration
- `frontend/src/` - Frontend source code
- `custom_components/rbac/www/` - Built frontend assets
- `config/` - Example Home Assistant configurations
- `scripts/` - Deployment and development scripts

### Configuration Files
- `custom_components/rbac/access_control.yaml` - Default access control config
- `custom_components/rbac/services.yaml` - Service definitions
- `custom_components/rbac/manifest.json` - Integration metadata
- `info.json` - HACS integration metadata
- `hacs.json` - HACS store configuration

### Development Configuration
- `.devcontainer.json` - VS Code dev container setup
- `.vscode/tasks.json` - Build/deploy tasks
- `.vscode/launch.json` - Debug configurations
- `.ruff.toml` - Python linting configuration
- `requirements.txt` - Python dependencies

## Development Workflow

1. **Local Setup**: Use VS Code dev container (Python 3.13 + Node.js)
2. **Frontend Development**: `cd frontend && npm run dev`
3. **Backend Development**: Edit Python files in `custom_components/rbac/`
4. **Build Frontend**: `cd frontend && npm run build`
5. **Deploy**: Configure `.env` and run `./scripts/deploy.sh`
6. **Test**: Access configuration at `/api/rbac/static/config.html`

## Testing and CI/CD

### GitHub Actions Workflows
- `.github/workflows/backend-build.yml` - Backend build and validation
- `.github/workflows/frontend-build.yml` - Frontend build
- `.github/workflows/pr-checks.yml` - Pull request validation
- `.github/workflows/validate.yml` - Home Assistant validation
- `.github/workflows/hassfest.yaml` - Home Assistant manifest validation

### Validation
- **hassfest**: Home Assistant integration validation
- **Ruff**: Python linting and formatting
- **No unit tests** currently in codebase

## Important Notes

- **Admin Access**: Only admin users can access RBAC configuration page
- **Template Conditions**: Roles can use Home Assistant templates for dynamic evaluation
- **Default Restrictions**: Non-admin users always have default domain/entity restrictions enforced
- **Frontend Blocking**: `rbac.js` script filters quick-bar based on user permissions
- **Service Calls**: All Home Assistant service calls are intercepted and evaluated

## Common Development Tasks

### Adding a New API Endpoint
1. Add route handler in `services.py` (RBAC*View classes)
2. Update URL patterns in `services.py` setup
3. Test via HTTP request to `/api/rbac/your-endpoint`

### Modifying Frontend Components
1. Edit components in `frontend/src/components/`
2. Run `npm run build` to compile changes
3. Deploy with `./scripts/deploy-frontend.sh`

### Updating Permission Logic
1. Modify middleware in `__init__.py` `_check_access` method
2. Update role evaluation in `_evaluate_user_roles`
3. Test with different user roles and service calls

### Changing Configuration Structure
1. Update `access_control.yaml` template
2. Modify config loading in `__init__.py` `_load_access_control_config`
3. Update frontend components to handle new structure