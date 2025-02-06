import React, { useState } from "react";
import { Form, Input, Button, message, Space } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import "./LoginPage.css";
import logo from "../assets/LOGO.png";

const LoginPage = () => {
  const [form] = Form.useForm();
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const apiUrl = isRegister
      ? "http://localhost:3001/register"
      : "http://localhost:3001/login";
    try {
      let data;
      if (isRegister) {
        data = {
          username: values.username,
          password: values.password,
          email: values.email,
        };
      } else {
        data = {
          identifier: values.identifier,
          password: values.password,
        };
      }
      const response = await axios.post(apiUrl, data);
      if (response.data.success) {
        if (isRegister) {
          message.success("注册成功，请登录");
          setIsRegister(false);
        } else {
          message.success(response.data.message);
          navigate("/tasks");
        }
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("网络错误");
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    form.resetFields();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="OA 系统 logo" className="login-logo" />{" "}
        {/* 添加 logo */}
        <h1 className="login-title">
          {isRegister ? "OA 办公系统注册" : "OA 办公系统登录"}
        </h1>
        <Form
          form={form}
          name={isRegister ? "register" : "login"}
          onFinish={onFinish}
          initialValues={{ remember: true }}
          scrollToFirstError
          className="login-form">
          {isRegister ? (
            <Form.Item
              name="username"
              rules={[{ required: true, message: "请输入用户名" }]}>
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="用户名"
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="identifier"
              rules={[{ required: true, message: "请输入用户名或邮箱" }]}>
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="用户名或邮箱"
              />
            </Form.Item>
          )}
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="密码"
            />
          </Form.Item>
          {isRegister && (
            <>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "请输入邮箱" },
                  { type: "email", message: "请输入有效的邮箱地址" },
                ]}>
                <Input
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  placeholder="邮箱"
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: "请再次输入密码",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("两次输入的密码不一致"));
                    },
                  }),
                ]}>
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="确认密码"
                />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button">
                {isRegister ? "注册" : "登录"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
        <Button type="link" onClick={toggleMode}>
          {isRegister ? "已有账号？去登录" : "没有账号？去注册"}
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
