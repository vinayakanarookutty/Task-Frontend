import { Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import background_img from "../../assets/background.jpg"
const { Title, Text } = Typography;

// Define the shape of login form values
interface LoginFormValues {
  email: string;
  password: string;
}

// Define the shape of login response
interface LoginResponse {
  statusCode:string,
  message: string;
}

export function Login() {
  const [form] = Form.useForm<LoginFormValues>();
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
   try{
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })
    const data = await response.json();
    if (data.statusCode === 200) {
   
        message.success('Registration successful!');
        navigate('/home', { state: { user: data.user } });
    } else {
       
      message.error(data.message || 'An unexpected error occurred. Please try again.');
    }
    
   }catch(error){
    console.error('Registration Error:', error);
    message.error('Registration failed. Please try again.');
   }
    
   
    
   
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Login failed. Please check your inputs.');
  };

  return (
    <div style={{ 
      backgroundImage: `url(${background_img})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }} className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <img src="/api/placeholder/1000/800" alt="Background" className="object-cover w-full h-full opacity-5" />
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>

        {/* Content */}
        <div className="relative z-10">
          
          <Title level={2} className="mt-6 text-center text-3xl font-extrabold text-gray-900">
           Login
          </Title>
          <Text className="mt-2 text-center text-sm text-gray-600 block">
            Join our elite team of professional drivers
          </Text>
        </div>
        
        <Form
          form={form}
          name="driver_login"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          className="mt-8 space-y-6 relative z-10"
        >
          <Form.Item
            name="email"
            rules={[{ 
              required: true, 
              message: 'Please input your Email!' 
            }]}
          >
            <Input 
              prefix={<PhoneOutlined className="site-form-item-icon text-blue-500" />} 
              placeholder="Email" 
              className="rounded-md" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { 
                required: true, 
                message: 'Please input your password!' 
              }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="site-form-item-icon text-blue-500" />} 
              placeholder="Password" 
              className="rounded-md" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-md h-12 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Join Our Team
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-6 text-center relative z-10">
          <Text className="text-sm text-gray-600">
            Don't have an account? <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</Link>
          </Text>
        </div>
      </div>
    </div>
  );
}

export default Login;