<p align="center">
  <img src="https://github.com/SUOMALILI/multi-rbac/raw/main/logo.jpg" alt="Home Assistant RBAC Logo" width="180" />
</p>

<h1 align="center">🏠 Home Assistant Multi-RBAC Middleware (Dev)</h1>

<p align="center">

<strong>A more powerful and flexible multi-role access control solution.</strong>

Provides granular permission management for Home Assistant by intercepting service calls, based on a pure whitelist mechanism.

</p>

## 🌟 Core Philosophy: Evolution of V3

In Version V3, we have completely redesigned the permission model, shifting from a **Single-role** approach to a **Multi-role Union** model:

- **Multi-role Support**: A user can have multiple roles at the same time, and the final permissions are the union of the permissions of all activated roles.
- **Pure Whitelist Mode**: "Deny all" by default; only entities and services explicitly authorized in roles are accessible.
- **Dynamic Template Evaluation**: Leverage the Home Assistant template engine to dynamically determine whether a role is active based on real-time status (e.g., geographic location, time).
- **Admin Exemption**: System administrators automatically bypass all restrictions to ensure core configurations remain secure and accessible at all times.

## ✨ Key Features

- 🛡️ **Service Call Interception**: Deep integration with the underlying Service Registry to automatically intercept and validate all Home Assistant service calls.
- 👥 **Multi-role Management**: Support assigning multiple roles to users with automatic permission merging.
- 📝 **YAML & GUI Dual-Driven**: Configure via a modern web interface or directly edit the `access_control.yaml` file.
- 🔍 **Granular Control**: Support permission management at the Domain, Entity, and specific Service levels.
- 🚀 **Deep Frontend Integration**: Works with `rbac.js` to automatically hide unauthorized entities in the Quick-bar for a cleaner UI experience.
- 🔄 **Hot Reload**: Configuration changes take effect immediately without restarting Home Assistant.
- 📊 **Deny Logging**: Built-in `deny_log` interface to track and record all unauthorized access attempts in real time.

## 📸 UI Preview

*(It is recommended to update the screenshot of the V3 multi-role assignment interface here)*

- **Role Management**: Define complex whitelist rules.
- **User Assignment**: Select multiple roles for users.
- **Dynamic Conditions**: Configure the `merge_condition` template.

## 🚀 Quick Start

### HACS Installation (Recommended)

1. Search for `Multi-RBAC` in HACS and install it.
2. Restart Home Assistant.
3. Add `RBAC` on the Integrations page.
4. Access the configuration panel from the sidebar to start setup.

### Manual Installation

1. Copy `custom_components/rbac` to your `custom_components` directory.
2. Restart Home Assistant and install the integration.

## 💡 Advanced Usage: Dynamic Role Control

With V3's **Template Conditions**, you can implement highly intelligent scenario control. For example:

**Scenario: Temporary Guest Permissions**

> The "Guest Role" only takes effect when the guest is at home (based on geographic location). If the guest leaves, they cannot control home devices even if their account remains active.

```yaml
# Use merge_condition in role configuration
merge_condition: "{{ states('person.guest') == 'home' }}"

## 📄 License
This project is licensed under the MIT License.
