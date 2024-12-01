import { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, message, Upload } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UploadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload';
import background_img from "../../assets/background.jpg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const { Title, Text } = Typography;


// Define the shape of form values
interface RegistrationFormValues {
  name: string;
  email: string;
  password: string;
  confirmpassword: string;
  agreement: boolean;
  profileImage?: RcFile;
}

export function Registration() {
  const [form] = Form.useForm<RegistrationFormValues>();
  const navigate = useNavigate();
  const [profileImageKey, setProfileImageKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Assume AWS S3 configuration is already set (you should already have the environment variables)


  const [s3Client] = useState(() => new S3Client({ 
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
  }));
  
  const customRequest = async (info:any) => {
    const { file, onSuccess, onError } = info;
    
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }
      
      if (file.size / 1024 / 1024 > 5) {
        throw new Error('File must be smaller than 5MB');
      }
  
      // Generate unique filename
      const filename = `profile-${Date.now()}-${file.name}`;
  
      // Prepare S3 upload parameters
      const params = {
        Bucket: import.meta.env.VITE_AWS_S3_BUCKET_NAME!,
        Key: filename,
        Body: file,
        ContentType: file.type
      };
  
      // Upload to S3
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
  
      // Update state with image key
      setProfileImageKey(filename);
  
      // Notify upload success
      onSuccess(filename);
    } catch (error) {
      console.error('Upload Error:', error);
      message.error(error.message || 'File upload failed');
      onError(error);
    }
  };

// Function to upload file to S3
// const uploadToS3 = async (file: RcFile): Promise<string | null> => {
//   const s3Client = createS3Client();
//   if (!s3Client) {
//     message.error('Failed to create S3 client');
//     return null;
//   }

//   try {
//     const fileExtension = file.name.split('.').pop();
//     const uniqueFileName = `profile-images/${uuidv4()}.${fileExtension}`;

//     const uploadParams = {
//       Bucket: import.meta.env.VITE_AWS_S3_BUCKET_NAME, // Your S3 bucket name
//       Key: uniqueFileName,
//       Body: file,
//       ContentType: file.type,
//     };

//     console.log('Starting file upload to S3...');
//     const command = new PutObjectCommand(uploadParams);
//     await s3Client.send(command);

//     // Return the S3 file key after successful upload
//     console.log('S3 Upload Successful');
//     return uniqueFileName;
//   } catch (error) {
//     console.error('S3 Upload Error:', error);
//     message.error('Failed to upload profile picture to S3');
//     return null;
//   }
// };

// const handleImageUpload = async (info:any) => {
//   const { status, originFileObj } = info.file;
// console.log(status)
//   if (status === 'done') {
//     try {
//       setIsSubmitting(true);

//       // Generate a unique filename
//       const filename = `profile-${Date.now()}-${originFileObj.name}`;

//       // Prepare S3 upload parameters
//       const params = {
//         Bucket: import.meta.env.VITE_AWS_S3_BUCKET_NAME!,
//         Key: filename,
//         Body: originFileObj,
//         ContentType: originFileObj.type
//       };

//       // Upload to S3
//       const command = new PutObjectCommand(params);
//       await s3Client.send(command);

//       // Store the S3 key in state
//      setProfileImageKey(filename);

//       message.success(`${info.file.name} file uploaded successfully`);
//     } catch (error) {
//       console.error('S3 Upload Error:', error);
//       message.error('File upload failed');
//     } finally {
//       setIsSubmitting(false);
//     }
//   } else if (status === 'error') {
//     message.error(`${info.file.name} file upload failed`);
//   }
// };
// State to store the uploaded image key (S3 object key)
const handleImageUpload = async (info: UploadChangeParam<UploadFile>) => {
  const { file, fileList } = info;
  const { status } = file;

  // Ensure only one file is processed
  if (fileList.length > 1) {
    fileList.splice(0, fileList.length - 1);
  }

  console.log('Upload Info:', {
    status,
    file,
    fileType: file.type,
    fileSize: file.size
  });

  if (status === 'done' && file.originFileObj) {
    try {
      setIsSubmitting(true);

      // Generate a unique filename
      const filename = `profile-${Date.now()}-${file.name}`;

      // Prepare S3 upload parameters
      const params = {
        Bucket: import.meta.env.VITE_AWS_S3_BUCKET_NAME!,
        Key: filename,
        Body: file.originFileObj,
        ContentType: file.type
      };

      // Upload to S3
      const command = new PutObjectCommand(params);
      const response = await s3Client.send(command);

      console.log('S3 Upload Response:', response);

      // Store the S3 key in state and log it
      setProfileImageKey(prevKey => {
        console.log('Previous Key:', prevKey);
        console.log('New Key:', filename);
        return filename;
      });

      message.success(`${file.name} uploaded successfully to S3`);
    } catch (error) {
      console.error('S3 Upload Error:', error);
      message.error('Failed to upload file to S3');
    } finally {
      setIsSubmitting(false);
    }
  }
};
const onFinish = async (values: RegistrationFormValues) => {
  // Prevent multiple submissions
  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    // Prepare registration payload
    const registrationPayload = {
      name: values.name,
      email: values.email,
      password: values.password,
      profileImageKey: profileImageKey || undefined // Only include if image was uploaded
    };
    console.log(JSON.stringify(registrationPayload))

    // Send registration request to backend
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationPayload),
    });

    if (response.status === 201) {
      const data = await response.json();
      console.log(data)
        message.success('Registration successful!');
        navigate('/home', { state: { user: data } });
    } else {
      const errorData = await response.json(); // Handle error details, if any
      message.error(errorData.message || 'An unexpected error occurred. Please try again.');
    }
    
  } catch (error) {
    console.error('Registration Error:', error);
    message.error('Registration failed. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
  const onFinishFailed = (errorInfo: any) => {
    console.log('Form Validation Failed:', errorInfo);
    message.error('Registration failed. Please check your inputs.');
  };

  return (
    <div 
      style={{ 
        backgroundImage: `url(${background_img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-10 rounded-xl shadow-2xl relative">
        {/* Glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl backdrop-blur-sm -z-10" />
        
        {/* Logo and Title */}
        <div className="relative z-10 text-center">
          <Title level={2} className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Partner with Us
          </Title>
        </div>
        
        {/* Registration Form */}
        <Form
          form={form}
          name="driver_registration"
          onFinish={onFinish}
          
          onFinishFailed={onFinishFailed}
          layout="vertical"
          className="mt-8 space-y-5 relative z-10"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-blue-500" />} 
              placeholder="Full Name" 
              className="h-11 rounded-lg border-gray-200 hover:border-blue-500 transition-colors" 
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-blue-500" />} 
              placeholder="Email Address" 
              className="h-11 rounded-lg border-gray-200 hover:border-blue-500 transition-colors" 
            />
          </Form.Item>
          <Form.Item
            name="profileImage"
            label="Profile Picture"
          >
           <Upload
  name="profileImage"
  listType="picture"
  className="w-full"
  maxCount={1}
  accept="image/*"
  customRequest={customRequest}
  onChange={handleImageUpload}
>
  <Button 
    icon={<UploadOutlined />} 
    className="w-full"
    disabled={isSubmitting}
  >
    Click to Upload Profile Picture
  </Button>
</Upload>
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters long!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-blue-500" />} 
              placeholder="Password" 
              className="h-11 rounded-lg border-gray-200 hover:border-blue-500 transition-colors" 
            />
          </Form.Item>

          <Form.Item
            name="confirmpassword"
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-blue-500" />} 
              placeholder="Confirm Password" 
              className="h-11 rounded-lg border-gray-200 hover:border-blue-500 transition-colors" 
            />
          </Form.Item>

          {/* Profile Image Upload */}
         
         
          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              { validator: (_, value) => value ? Promise.resolve() : Promise.reject('Please accept the agreement') },
            ]}
          >
            <Checkbox className="text-gray-600">
              I agree to the <Link to="/terms" className="text-blue-600 hover:text-blue-800 font-medium">Terms and Conditions</Link>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg h-12 text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] border-0 shadow-lg hover:shadow-xl"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Join Our Team
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-6 text-center relative z-10">
          <Text className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
              Sign in
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}

export default Registration;