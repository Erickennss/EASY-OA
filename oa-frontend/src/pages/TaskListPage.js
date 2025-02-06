import React, { useState, useEffect } from "react";
import { Table, Form, Input, Button, message } from "antd";
import axios from "axios";

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:3001/tasks");
        setTasks(response.data);
      } catch (error) {
        message.error("获取任务列表失败");
      }
    };
    fetchTasks();
  }, []);

  const onFinish = async (values) => {
    try {
      const response = await axios.post("http://localhost:3001/tasks", values);
      if (response.data.success) {
        message.success(response.data.message);
        form.resetFields();
        const fetchTasks = async () => {
          try {
            const response = await axios.get("http://localhost:3001/tasks");
            setTasks(response.data);
          } catch (error) {
            message.error("获取任务列表失败");
          }
        };
        fetchTasks();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("网络错误");
    }
  };

  const columns = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
  ];

  return (
    <div>
      <Form form={form} name="addTask" onFinish={onFinish} layout="inline">
        <Form.Item
          name="title"
          rules={[{ required: true, message: "请输入任务标题" }]}>
          <Input placeholder="任务标题" />
        </Form.Item>
        <Form.Item
          name="description"
          rules={[{ required: true, message: "请输入任务描述" }]}>
          <Input placeholder="任务描述" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            添加任务
          </Button>
        </Form.Item>
      </Form>
      <Table dataSource={tasks} columns={columns} rowKey="id" />
    </div>
  );
};

export default TaskListPage;
