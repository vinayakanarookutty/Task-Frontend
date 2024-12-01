import React, { useState,useEffect } from 'react';
import { Tabs,Input, Card, Typography, Form, Button,message, Select,Table, Checkbox, Row, Col, Layout, Image } from 'antd';
import { UserOutlined, SettingOutlined, BellOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

// Ant Design components
const { Title, Text } = Typography;
const { Header, Content } = Layout;
const { Option } = Select;
// Define TypeScript types
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  profileImageKey?: string;
  password?: string;
}

const Profile: React.FC = () => {
  // Use hooks
  const location = useLocation();
  const navigate = useNavigate();

  // Extract user data from location state
  const userData: User | undefined = location.state?.user;

  const getImageUrl = (key: string) => {
    console.log(key)
    return `https://${import.meta.env.VITE_AWS_S3_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${key}`;
  };

  // Logout handler
  const handleLogout = () => {
    // Implement logout logic if needed
    navigate('/login');
  };

  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data from server
    fetch(`${import.meta.env.VITE_API_URL}/profileuserview`) // Update with your endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        const formattedData = data.map((item: any) => ({
          ...item,
          key: item.userId, // Ant Design requires a unique key for each row
        }));
        setData(formattedData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Profile Image',
      dataIndex: 'profileImageKey',
      key: 'profileImageKey',
      render: (profileImageKey: string) => (
        <img
          src={getImageUrl(profileImageKey)} // Replace with your actual base URL
          alt="Profile"
          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
  ];


  const onFinish = async (values:any) => {
    try {
      console.log(values)
      values.email=userData?.email;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values),
      });
  
      if (response.status === 201) {
        const data = await response.json();
        console.log(data)
          message.success('Profile Added Succesfully!');
      } else {
        const errorData = await response.json(); // Handle error details, if any
        message.error(errorData.message || 'An unexpected error occurred. Please try again.');
      }
    
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      // Optionally, show an error message
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <Header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 bg-white shadow-md">
        <Title level={4} className="!mb-0 text-gray-800">Profile</Title>
        <div className="flex items-center gap-4">
          <Button type="text" icon={<BellOutlined />} className="text-gray-600 hover:text-gray-800" />
          <Button 
            onClick={handleLogout} 
            icon={<LogoutOutlined />} 
            className="text-red-500 hover:text-red-600 border-none"
          />
        </div>
      </Header>

      {/* Content Section */}
      <Content className="pt-16 pb-8 px-8">
        <div className="max-w-4xl mx-auto">
          <Card
            className="shadow-lg rounded-xl overflow-hidden"
            style={{
              height: 'calc(100vh - 150px)',
              minHeight: '600px',
              maxHeight: '800px',
            }}
          >
            <div className="flex h-full">
              {/* Sidebar Profile Section */}
              <div className="w-1/3 bg-gray-50 border-r p-6 flex flex-col items-center justify-center text-center">
                <Image
                 src={getImageUrl(userData?.profileImageKey)} 
                  alt="Profile Picture"
                  className="mb-4 rounded-full shadow-md"
                  width={200}
                  height={200}
                  preview={false}
                />
                <Title level={4} className="mb-2">{userData?.name || 'User Name'}</Title>
                <Text type="secondary">{userData?.email || 'user@example.com'}</Text>
              </div>

              {/* Main Content Area */}
              <div className="w-2/3 overflow-y-auto">
                <Tabs
                  defaultActiveKey="1"
                  className="px-6 pt-6"
                  items={[
                    {
                      key: '1',
                      label: (
                        <span className="flex items-center">
                          <UserOutlined className="mr-2" />
                          Personal Information
                        </span>
                      ),
                      children: (
                        <div className="p-4">
                          <Row gutter={[16, 16]}>
                            <Col span={24}>
                              <Card title="Contact Details" bordered={false}>
                                <Row>
                                  <Col span={12}>
                                    <Text strong>Full Name</Text>
                                    <p>{userData?.name || 'Not Available'}</p>
                                  </Col>
                                  <Col span={12}>
                                    <Text strong>Email</Text>
                                    <p>{userData?.email || 'Not Available'}</p>
                                  </Col>
                                </Row>
                              </Card>
                            </Col>
                          </Row>
                        </div>
                      ),
                    },
                    {
                      key: '2',
                      label: (
                        <span className="flex items-center">
                          <SettingOutlined className="mr-2" />
                         Update Profile
                        </span>
                      ),
                      children: (
                        <Form layout="vertical" onFinish={onFinish} className="p-4">
                        <Row gutter={[16, 16]}>
                          {/* Personal Information Section */}
                          <Col xs={20} md={22}>
                            <Card title="Personal Information" className="h-full shadow-sm">
                              <Form.Item label="Phone Number" name="phoneNumber" rules={[{ required: true, message: 'Phone Number is required' }]}>
                                <Input placeholder="Enter your phone number" />
                              </Form.Item>
                              <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Address is required' }]}>
                                <Input.TextArea placeholder="Enter your address" rows={4} />
                              </Form.Item>
                            </Card>
                          </Col>
                  
                          {/* Notification Settings Section */}
                         
                  
                        
                  
                          {/* Save Settings Button */}
                          <Col xs={24}>
                            <Button type="primary" size="large" block htmlType="submit">
                              Save Settings
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                      ),
                    },
                    {
                      key: '3',
                      label: (
                        <span className="flex items-center">
                          <SettingOutlined className="mr-2" />
                          Settings
                        </span>
                      ),
                      children: (
                        <Form layout="vertical" className="p-4">
                          <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                              <Card title="Notification Settings" className="h-full shadow-sm">
                                <Form.Item>
                                  <Checkbox.Group className="flex flex-col gap-3">
                                    <Checkbox value="email">Email Notifications</Checkbox>
                                    <Checkbox value="sms">SMS Notifications</Checkbox>
                                    <Checkbox value="push">Push Notifications</Checkbox>
                                  </Checkbox.Group>
                                </Form.Item>
                              </Card>
                            </Col>
                            <Col xs={24} md={12}>
                              <Card title="Account Settings" className="h-full shadow-sm">
                                <Form.Item label="Language">
                                  <Select
                                    size="large"
                                    defaultValue="english"
                                    options={[
                                      { value: 'english', label: 'English' },
                                      { value: 'spanish', label: 'Spanish' },
                                      { value: 'french', label: 'French' },
                                    ]}
                                  />
                                </Form.Item>
                                <Form.Item label="Time Zone">
                                  <Select
                                    size="large"
                                    defaultValue="utc"
                                    options={[
                                      { value: 'utc', label: 'UTC (GMT+0)' },
                                      { value: 'est', label: 'EST (GMT-5)' },
                                      { value: 'pst', label: 'PST (GMT-8)' },
                                    ]}
                                  />
                                </Form.Item>
                              </Card>
                            </Col>
                            <Col xs={24}>
                              <Button type="primary" size="large" block>
                                Save Settings
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      ),
                    },
                    {
                      key: '4',
                      label: (
                        <span className="flex items-center">
                          <SettingOutlined className="mr-2" />
                         View
                        </span>
                      ),
                      children: (
                        <div>
                        <h2 className="flex items-center">
                          <SettingOutlined className="mr-2" />
                          View
                        </h2>
                        <Table
                          dataSource={data}
                          columns={columns}
                          pagination={{ pageSize: 5 }} // Adjust page size as needed
                        />
                      </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Profile;
