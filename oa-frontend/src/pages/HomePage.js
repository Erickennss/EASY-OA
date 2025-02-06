import React, { useState, useRef, useEffect } from "react";
import { Tabs, List, Input, Button, Space, Avatar } from "antd";
import {
  MailOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import io from "socket.io-client";
import "./HomePage.css";

const { TabPane } = Tabs;

// 模拟消息数据
const mockMessages = [
  {
    id: 1,
    sender: "张三",
    content: "你好，明天的会议几点开始？",
    time: "2025-02-06 10:00",
  },
  {
    id: 2,
    sender: "李四",
    content: "文档已经整理好了，你可以查看一下。",
    time: "2025-02-06 09:30",
  },
];

// 模拟通讯录数据
const mockContacts = [
  {
    id: 1,
    name: "张三",
    email: "zhangsan@example.com",
    phone: "13800138000",
  },
  {
    id: 2,
    name: "李四",
    email: "lisi@example.com",
    phone: "13900139000",
  },
];

const HomePage = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [contacts] = useState(mockContacts);
  const [newMessage, setNewMessage] = useState("");
  const quillRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    // 连接到后端 WebSocket 服务器
    socket.current = io("http://localhost:3002");

    if (quillRef.current) {
      const quill = new Quill(quillRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ["clean"],
          ],
        },
      });

      // 监听后端发送的初始文档内容
      socket.current.on("initial-document", (delta) => {
        quill.setContents(delta);
      });

      // 监听后端发送的文本变化
      socket.current.on("text-change", (delta) => {
        quill.updateContents(delta);
      });

      // 监听编辑器文本变化，发送到后端
      quill.on("text-change", (delta, oldDelta, source) => {
        if (source === "user") {
          socket.current.emit("text-change", delta);
        }
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    const newMsg = {
      id: messages.length + 1,
      sender: "你",
      content: newMessage,
      time: new Date().toLocaleString(),
    };
    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  return (
    <div className="home-container">
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <MailOutlined /> 消息
            </span>
          }
          key="1">
          <List
            dataSource={messages}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{item.sender[0]}</Avatar>}
                  title={item.sender}
                  description={
                    <div>
                      <p>{item.content}</p>
                      <p style={{ color: "#999" }}>{item.time}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          <Space style={{ width: "100%", marginTop: "20px" }}>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="输入消息内容"
              style={{ flex: 1 }}
            />
            <Button type="primary" onClick={handleSendMessage}>
              发送
            </Button>
          </Space>
        </TabPane>
        <TabPane
          tab={
            <span>
              <UserOutlined /> 通讯录
            </span>
          }
          key="2">
          <List
            dataSource={contacts}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{item.name[0]}</Avatar>}
                  title={item.name}
                  description={
                    <div>
                      <p>邮箱: {item.email}</p>
                      <p>电话: {item.phone}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <FileTextOutlined /> 文档协同编辑
            </span>
          }
          key="3">
          <div ref={quillRef} className="quill-container" />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default HomePage;
