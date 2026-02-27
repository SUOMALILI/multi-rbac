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
npm run dev          # Start development server
npm run build        # Build frontend to custom_components/rbac/www/
npm run preview      # Preview built frontend
```

### Backend Development
```bash
ruff check          # Lint Python code (configured in .ruff.toml)
ruff format         # Format Python code
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
- `sshpass` installed for automated SSH password authentication
- Frontend must be built before deployment (handled by deploy scripts)

### VS Code Tasks (`.vscode/tasks.json`)
- **Deploy Backend + Frontend**: Runs `./scripts/deploy.sh` (full deployment with restart)
- **Build + Deploy Frontend**: Runs `./scripts/deploy-frontend.sh` (frontend only)
- **Start Dev Server**: Runs `npm run dev` in frontend directory (background task)
- **Task Presentation**: All tasks show output in shared panel
- **Problem Matchers**: No custom problem matchers configured
- **Task Groups**: All tasks in "build" group

## Architecture Overview

### Backend Structure (`custom_components/rbac/`)
- **`__init__.py`**: Main integration setup, middleware interception, configuration loading, permission evaluation
- **`services.py`**: Service definitions, HTTP API endpoints, user management (1,479 lines - largest file)
- **`const.py`**: Constants, role hierarchy, restrictable domains/services, configuration version
- **`sensor.py`**: RBAC sensor entities (configuration URL, status sensors)
- **`config_flow.py`**: Configuration flow for Home Assistant UI
- **Key Methods**:
  - `async_setup`: Main setup, patches service registry
  - `_check_access`: Core permission evaluation logic
  - `_evaluate_user_roles`: Determines user's active roles with template conditions
  - `_load_access_control_config`: Loads and validates YAML config
  - `_save_access_control_config`: Saves configuration changes
- **Service Registry Patching**: Monkey-patches Home Assistant's service call handling
- **Configuration Management**: Handles versioning and validation of `access_control.yaml`
- **Error Propagation**: Raises `HomeAssistantError` for permission denials

### Frontend Structure (`frontend/`)
- **Preact + Ant Design + CodeMirror** stack
- **`src/components/`**: React components for configuration UI
  - `App.jsx`: Main application component with layout and state management
  - `RoleEditModal.jsx`: Role editing with permissions configuration
  - `RolesManagement.jsx`: Role listing and management
  - `UserAssignments.jsx`: User role assignment interface
  - `DefaultRestrictions.jsx`: Default domain/entity restrictions
  - Various utility components for selects, modals, etc.
- **`src/utils/`**: Authentication helpers, theme management
- **Build output**: `custom_components/rbac/www/` (config.html, config.js, rbac.js)
- **Build process**: Vite-based bundling with Preact preset
- **State Management**: React hooks (useState, useEffect) for component state
- **API Communication**: `makeAuthenticatedRequest` utility for backend API calls
- **Theme Support**: Light/dark mode with Ant Design theme configuration
- **Code Editor**: CodeMirror integration for YAML editing
- **Form Handling**: Ant Design form components with validation
- **Loading States**: Comprehensive loading indicators and error states

### Middleware Pattern
1. **Service Interception**: Patches Home Assistant's service registry in `__init__.py` `async_setup`
2. **Role Evaluation**: Evaluates user roles and permissions per service call using `_check_access`
3. **Template Support**: Role conditions can use Home Assistant templates with `merge_condition`
4. **Dynamic Configuration**: YAML config reloadable without restart via API or service call
5. **Multi-Role Merging**: User permissions are union of all active role permissions
6. **Admin Exemption**: Users with admin role bypass all restrictions
7. **Default Restrictions**: Always applied to non-admin users
8. **Frontend Integration**: `rbac.js` filters UI elements based on permissions
9. **Logging**: Comprehensive logging of denied access and configuration changes
10. **Sensor Entities**: Provides configuration URL and status sensors via `sensor.py`
11. **Configuration Flow**: Home Assistant UI integration via `config_flow.py`
12. **Service Definitions**: `services.yaml` defines available RBAC services

### Permission Model (V3 - Pure Whitelist)
- **Role Hierarchy**: guest (0) < user (1) < admin (2) < super_admin (3) (defined in `const.py`)
- **Domain/Entity Control**: Restrict at domain or specific entity level
- **Service/Action Control**: Restrict specific services within domains
- **Pure Whitelist**: Roles define what's allowed (empty permissions = no access)
- **Admin Role Exemption**: Users with admin role bypass all restrictions
- **Multi-Role Support**: Users can have multiple roles, permissions are merged (union)
- **Template Conditions**: Roles can have Home Assistant template conditions that determine when they apply (`merge_condition: true/false`)
- **Default Restrictions**: Always applied to non-admin users (defined in `access_control.yaml`)
- **Permission Evaluation**: Handled in `__init__.py` `_check_access` method
- **Restrictable Domains**: Defined in `const.py` `RESTRICTABLE_DOMAINS`
- **Common Services**: Predefined service lists in `const.py` `COMMON_SERVICES`
- **Hide vs Services**: Entities/domains can be hidden (`hide: true`) or have specific services restricted
- **User Context**: Template evaluation has access to `current_user_str` variable

### HTTP API Endpoints (`services.py`)
- `/api/rbac/config` - Configuration management (GET/PUT) - full config CRUD
- `/api/rbac/users` - User management (GET/POST/DELETE) - user role assignments
- `/api/rbac/domains` - Domain listing (GET) - all available Home Assistant domains
- `/api/rbac/entities` - Entity listing (GET) - all entities (filtered by permissions)
- `/api/rbac/services` - Service listing (GET) - services per domain
- `/api/rbac/current_user` - Current user info (GET) - authenticated user details
- `/api/rbac/deny_log` - Access denial logging (GET) - recent denied service calls
- `/api/rbac/static/` - Static file serving (config.html, config.js, rbac.js)
- **Authentication**: Uses Home Assistant's built-in authentication system
- **Error Handling**: Comprehensive error responses with appropriate HTTP status codes
- **View Classes**: RBACConfigView, RBACUsersView, RBACDomainsView, etc.
- **Static File Serving**: Serves built frontend files from `custom_components/rbac/www/`
- **MIME Types**: Proper content-type headers for different file types
- **Request Validation**: Voluptuous schemas for input validation

## Key Directories and Files

### Essential Paths
- `custom_components/rbac/` - Backend Python integration
- `frontend/src/` - Frontend source code
- `custom_components/rbac/www/` - Built frontend assets (deployed to Home Assistant)
- `config/` - Example Home Assistant configurations
- `scripts/` - Deployment and development scripts
- `screenshots/` - Documentation screenshots
- `brands/` - Integration branding assets
- `.github/workflows/` - CI/CD pipeline definitions
- `frontend/node_modules/` - Frontend dependencies (gitignored)
- `doc/` - Documentation (referenced but may not exist)

### Configuration Files
- `custom_components/rbac/access_control.yaml` - Default access control config (V3 format)
- `custom_components/rbac/services.yaml` - Service definitions
- `custom_components/rbac/manifest.json` - Integration metadata (domain, name, version, requirements)
- `info.json` - HACS integration metadata (name, render_readme, filename, country list)
- `hacs.json` - HACS store configuration (name, content_in_root, render_readme)
- `requirements.txt` - Python dependencies (PyYAML)
- `strings.json` - Translation strings for Home Assistant UI
- `translations/` - Localization files for multiple languages
- `LICENSE` - MIT License

### Development Configuration
- `.devcontainer.json` - VS Code dev container setup (Python 3.13 + Node.js, with apt packages: ffmpeg, nodejs, npm)
- `.vscode/tasks.json` - Build/deploy tasks (deploy, frontend deploy, dev server)
- `.vscode/launch.json` - Debug configurations
- `.ruff.toml` - Python linting configuration (based on Home Assistant core, target-version: py313)
- `requirements.txt` - Python dependencies (PyYAML)
- `frontend/package.json` - Frontend dependencies (Preact, Ant Design, CodeMirror, Vite)
- `frontend/vite.config.js` - Vite build configuration (Preact preset)
- `.env.example` - Template for deployment environment variables
- `hacs.json` - HACS store configuration
- `info.json` - HACS integration metadata
- `hacs.sh` - HACS installation script for Docker environments
- `scripts/setup` - Dev container post-create script for initial setup

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
8. **Debugging**: Check Home Assistant logs for "RBAC Middleware" messages
9. **CI/CD**: Push changes to trigger GitHub Actions validation
10. **HACS Release**: Update version in `manifest.json` for HACS updates
11. **Documentation**: Update README.md with new features/changes

## Testing and CI/CD

### GitHub Actions Workflows
- `.github/workflows/backend-build.yml` - Backend build and validation (Python linting, manifest validation, frontend build required)
- `.github/workflows/frontend-build.yml` - Frontend build (Node.js, Vite build, artifact upload)
- `.github/workflows/pr-checks.yml` - Pull request validation (runs both frontend and backend checks conditionally)
- `.github/workflows/validate.yml` - Home Assistant validation
- `.github/workflows/hassfest.yaml` - Home Assistant manifest validation
- **CI Dependencies**: Python 3.11, Node.js 18, PyYAML, homeassistant package
- **Trigger Paths**: Workflows run only when relevant files change (custom_components/, frontend/, .github/workflows/)
- **Branch Protection**: Main and dev branches have validation requirements
- **Artifact Storage**: Frontend build artifacts stored for 1 day
- **Parallel Execution**: Frontend and backend checks can run in parallel

### Validation
- **hassfest**: Home Assistant integration validation
- **Ruff**: Python linting and formatting (configured in `.ruff.toml`, based on Home Assistant core)
- **Flake8**: Python linting in CI
- **Black**: Python code formatting in CI
- **Manifest validation**: Checks required fields in `manifest.json`
- **Python syntax validation**: Compiles all Python files
- **Frontend build validation**: Ensures build outputs exist
- **Import validation**: Tests module imports work correctly
- **Required files check**: Ensures all Home Assistant integration files exist
- **No unit tests** currently in codebase
- **Conditional Execution**: PR checks run only when relevant files change
- **Cache Optimization**: npm cache used for faster CI runs

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
- **State Management**: Frontend uses React hooks for state; no external state library
- **Error Handling**: Both frontend and backend have comprehensive error handling and logging
- **Deployment**: Requires SSH access to Home Assistant server with `sshpass`
- **HACS Support**: Ready for HACS installation with proper metadata files
- **Active Development**: Project is under active development; APIs and formats may change
- **Monkey Patching**: Modifies Home Assistant core behavior - may break with updates

## Common Development Tasks

### Adding a New API Endpoint
1. Add route handler in `services.py` (RBAC*View classes)
2. Update URL patterns in `services.py` setup
3. Test via HTTP request to `/api/rbac/your-endpoint`
4. Update frontend to use new endpoint if needed
5. Add appropriate error handling and authentication checks
6. Ensure proper CORS handling if needed
7. Add documentation for new endpoint
8. Test with different user roles and permissions

### Modifying Frontend Components
1. Edit components in `frontend/src/components/`
2. Run `npm run build` to compile changes (outputs to `custom_components/rbac/www/`)
3. Deploy with `./scripts/deploy-frontend.sh`
4. Test changes in Home Assistant at `/api/rbac/static/config.html`
5. Use `npm run dev` for local development with hot reload
6. Check browser console for JavaScript errors
7. Verify authentication still works with changes

### Updating Permission Logic
1. Modify middleware in `__init__.py` `_check_access` method
2. Update role evaluation in `_evaluate_user_roles`
3. Test with different user roles and service calls
4. Update `const.py` if adding new roles or changing hierarchy
5. Test template condition evaluation if modifying `_evaluate_user_roles`
6. Consider impact on frontend blocking in `rbac.js`
7. Update API endpoints if permission data structure changes
8. Test edge cases (no roles, multiple roles with conflicting permissions)

### Changing Configuration Structure
1. Update `access_control.yaml` template (V3 format)
2. Modify config loading in `__init__.py` `_load_access_control_config`
3. Update frontend components to handle new structure (especially `RoleEditModal.jsx`)
4. Update permission evaluation logic in `__init__.py` `_check_access` and `_evaluate_user_roles`
5. Update API endpoints in `services.py` if needed for new data structure
6. Test configuration migration from old format if applicable
7. Update default configuration creation logic
8. Update validation logic for new structure
9. Update documentation and examples

### Debugging Service Interception
1. Check logs for "RBAC Middleware" messages
2. Verify `access_control.yaml` is loaded correctly
3. Test with different user roles using Home Assistant service calls
4. Check deny log via frontend or API endpoint
5. Verify service registry patching in `__init__.py` setup
6. Check user role assignments in configuration
7. Verify template conditions evaluate correctly
8. Test with admin vs non-admin users
9. Check configuration version compatibility (should be '3.0')
10. Verify default restrictions are being applied
11. Check if integration is enabled in configuration
12. Test with built-in Home Assistant users vs local users

### Working with V3 Configuration Format
1. **Roles**: Define permissions in `permissions.domains` and `permissions.entities`
2. **Admin Role**: Set `admin: true` to bypass restrictions
3. **Template Conditions**: Use `template` and `merge_condition` for dynamic role activation
4. **Multi-Role Users**: Users can have multiple roles; permissions are unioned
5. **Pure Whitelist**: Empty permissions = no access (except for admin roles)
6. **Configuration Structure**:
   - `version`: '3.0'
   - `enabled`: Global toggle
   - `default_restrictions`: Always applied to non-admin users
   - `users`: User to role assignments
   - `roles`: Role definitions with permissions
7. **Example Role**:
   ```yaml
   user:
     description: Standard user
     admin: false
     permissions:
       domains:
         light:
           hide: false
           services: [turn_on, turn_off]
       entities:
         switch.living_room: {hide: false}
     template: "{{ states('person.john_doe') == 'home' }}"
     merge_condition: true
   ```
8. **Default Config**: Created automatically if `access_control.yaml` doesn't exist
9. **Settings**: Global settings like `show_notifications`, `send_event`, `frontend_blocking_enabled`
10. **Validation**: Configuration version checked on load