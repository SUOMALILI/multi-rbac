import { useState, useEffect } from 'preact/hooks';
import {
  Card,
  Typography,
  Space,
  Row,
  Col,
  Avatar,
  Select,
  Tag,
  Button,
  Divider
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { RoleEditModal } from './RoleEditModal';
import { getHAAuth, makeAuthenticatedRequest } from '../utils/auth';

export function UserAssignments({ data, onSuccess, onError, onDataChange, isDarkMode = false }) {
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState({});
  const [editingRole, setEditingRole] = useState(null);
  const [editingRoleData, setEditingRoleData] = useState(null);

  // Initialize user roles from config
  useEffect(() => {
    if (data.config?.users) {
      const roles = {};
      Object.entries(data.config.users).forEach(([userId, userConfig]) => {
        // 只使用roles数组，完全移除role字段支持
        roles[userId] = userConfig.roles || [];
      });
      setUserRoles(roles);
    }
  }, [data.config]);

  // Check if user has an admin role
  const isUserAdmin = (user) => {
    const roleNames = userRoles[user.id] || [];
    if (!roleNames.length || !data.config?.roles) return false;

    // Check if any of the user's roles has admin: true
    return roleNames.some(roleName => {
      const role = data.config.roles[roleName];
      return role?.admin === true;
    });
  };

  // Get admin glow styles
  const getAdminGlowStyles = (isAdmin) => {
    if (!isAdmin) return {};
    
    const backgroundColor = isDarkMode ? '#262626' : 'white';
    
    return {
      border: '2px solid transparent',
      background: `linear-gradient(${backgroundColor}, ${backgroundColor}) padding-box, linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57) border-box`,
      animation: 'adminGlow 2s ease-in-out infinite alternate',
      boxShadow: '0 0 20px rgba(255, 107, 107, 0.3)'
    };
  };

  const handleRoleChange = async (userId, newRoles) => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('/api/rbac/config', {
        method: 'POST',
        body: JSON.stringify({
          action: 'assign_user_roles',
          userId: userId,
          roles: newRoles
        })
      });

      if (!response.ok) {
        throw new Error('Failed to assign roles');
      }

      // Update local state
      const updatedUserRoles = { ...userRoles, [userId]: newRoles };
      setUserRoles(updatedUserRoles);

      // Update parent data
      const updatedUsers = { ...data.config?.users || {} };
      if (!updatedUsers[userId]) {
        updatedUsers[userId] = {};
      }
      updatedUsers[userId].roles = newRoles;

      onDataChange({
        ...data,
        config: {
          ...data.config,
          users: updatedUsers
        }
      });

      const user = data.users.find(u => u.id === userId);
      const userName = user ? user.name : userId;
      const roleNames = newRoles.length > 0 ? newRoles.join(', ') : 'No roles';
      onSuccess(`${newRoles.length > 0 ? `Roles "${roleNames}" assigned to` : 'All roles removed from'} ${userName} successfully!`);
    } catch (error) {
      console.error('Error assigning roles:', error);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRoles = () => {
    const roles = Object.keys(data.config?.roles || {});
    // Add default roles if they don't exist
    if (!roles.includes('admin')) roles.unshift('admin');
    if (!roles.includes('user')) roles.push('user');
    if (!roles.includes('guest')) roles.push('guest');
    return roles;
  };

  const isRoleValid = (userId) => {
    const userRolesList = userRoles[userId] || [];
    const availableRoles = getAvailableRoles();
    // All user roles must be in available roles
    return userRolesList.every(role => availableRoles.includes(role));
  };

  const getUserDisplayName = (user) => {
    return user.name || user.username || user.id;
  };

  const getUserPicture = (user) => {
    // Use the entity_picture from the person entity if available
    if (user.entity_picture) {
      return user.entity_picture;
    }
    
    // Fallback: construct URL from user ID (for backwards compatibility)
    if (user.id) {
      return `/api/image/serve/${user.id}/512x512`;
    }
    
    return null;
  };

  const handleEditRole = (roleName) => {
    const role = data.config?.roles?.[roleName];
    if (role) {
      setEditingRole(roleName);
      setEditingRoleData(role);
    }
  };

  const closeRoleModal = () => {
    setEditingRole(null);
    setEditingRoleData(null);
  };

  return (
    <div>
      <style>
        {`
          @keyframes adminGlow {
            0% {
              box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
            }
            100% {
              box-shadow: 0 0 30px rgba(78, 205, 196, 0.5), 0 0 40px rgba(69, 183, 209, 0.3);
            }
          }
          
          .role-selector-container .ant-space-item:last-child {
            margin-left: auto !important;
          }
        `}
      </style>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Assign roles to users to control their access permissions.
      </Typography.Paragraph>
      
      {data.users && data.users.length > 0 ? (
        <Row gutter={[16, 16]}>
          {data.users.map(user => (
            <Col xs={24} sm={12} key={user.id}>
              <Card 
                size="small" 
                style={{ 
                  height: '100%',
                  ...getAdminGlowStyles(isUserAdmin(user))
                }}
              >
                <Space align="center" style={{ width: '100%', height: '80px' }} className="role-selector-container">
                  {/* User Picture */}
                  <Avatar
                    src={getUserPicture(user)}
                    size={48}
                  >
                    {getUserDisplayName(user).charAt(0).toUpperCase()}
                  </Avatar>
                  
                  {/* User Info */}
                  <Space direction="vertical" style={{ flex: 1 }}>
                    <Typography.Text strong>
                      {getUserDisplayName(user)}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      ID: {user.id}
                    </Typography.Text>
                  </Space>
                  
                  {/* Role Selector - Right Aligned */}
                  <div>
                    <Select
                      mode="multiple"
                      value={userRoles[user.id] || []}
                      onChange={(value) => handleRoleChange(user.id, value)}
                      disabled={loading}
                      style={{ minWidth: 180 }}
                      size="small"
                      status={isRoleValid(user.id) ? '' : 'error'}
                      placeholder={isRoleValid(user.id) ? undefined : 'Select Roles...'}
                      maxTagCount={2}
                    >
                      {getAvailableRoles().map(role => (
                        <Select.Option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Typography.Text type="secondary" style={{ textAlign: 'center', display: 'block', padding: '40px 0' }}>
          No users found.
        </Typography.Text>
      )}

      {/* Role Edit Modal */}
      <RoleEditModal
        isOpen={!!editingRole}
        onClose={closeRoleModal}
        roleName={editingRole}
        roleData={editingRoleData}
        data={data}
        onSuccess={onSuccess}
        onError={onError}
        onDataChange={onDataChange}
      />
    </div>
  );
}
