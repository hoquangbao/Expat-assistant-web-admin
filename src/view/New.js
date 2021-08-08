import React, { useEffect, useState } from 'react'
import { Layout, Menu, Button, Typography, Row, Modal, Form, Input, Upload } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, PlusOutlined } from '@ant-design/icons';
import { Table, Tag, Space, Image } from 'antd';
import { Link } from 'react-router-dom'
import axios from 'axios';
import '../dist/css/homepage.css'

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;
const Text = Typography

export default function New() {
  const [channelData, setChannelData] = useState([]);
  const [createConversationModalVisible, setConversationCreateModalVisible] = useState(false);

  const token = localStorage.getItem('token')

  const columns = [
    {
      title: 'ID',
      dataIndex: 'channelId',
      key: 'channelId',
    },
    {
      title: 'Create By',
      dataIndex: 'createBy',
      key: 'createBy',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Channel Name',
      dataIndex: 'channelName',
      key: 'channelName',
      render: (text, record) => {
        return (
          <Link to={`/channeldetail/${record.channelId}`}>{text}</Link>
        );
      },
    },
    {
      title: 'Topic Image',
      dataIndex: 'image',
      key: 'image',
      render: image => <Image
        width={150}
        src={image}
      />
    },
    {
      title: 'Topic Status',
      key: 'topicStatus',
      dataIndex: 'topicStatus',
      render: () => (
        <Tag color="green" >
          ACTIVE
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <a>Update</a>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    async function fetchLessons() {
      try {
        await axios.get('https://hcmc.herokuapp.com/api/channels/status?page=0&size=5&sortBy=channelId&status=1',
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
        ).then(res => {
          console.log(res)
          const tableData = res.data.listChannel.map(channel => ({
            ...channel
          }))
          setChannelData(tableData)
        }).catch(error => {
          console.log(error)
        })
      } catch (e) {
        console.log(e)
      }
    }
    fetchLessons();
  }, [])

  const showConversationModal = () => {
    setConversationCreateModalVisible(true);
  };

  const handleConversationCancel = () => {
    setConversationCreateModalVisible(false);
  };

  return (
    <Layout className="ant-layout">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={broken => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="logo" />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
          <Menu.Item key="1" icon={<UserOutlined />}>
            <Link to="/lesson">Lessons</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<VideoCameraOutlined />}>
            <Link to="/new">New</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<VideoCameraOutlined />}>
            <Link to="/appointment">Appointment</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className="site-layout-sub-header-background" style={{ padding: 0 }} />
        <Content style={{ margin: '24px 16px 0' }}>

          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Button onClick={showConversationModal} type="primary" style={{ color: 'blue', marginLeft: '0', paddingRight: 30 }} size={"large"}>
              <Row><PlusOutlined style={{ color: 'white', paddingRight: 5 }} /><Text style={{ color: 'white' }}>Create New Channel</Text></Row>
            </Button>
            <Modal
              title="Create New Channel"
              style={{ width: 700 }}
              visible={createConversationModalVisible}
              footer={[
                <Button
                  default
                  onClick={handleConversationCancel}
                >
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  form="conversationForm"
                  type="primary"
                  htmlType="submit"
                >
                  Submit
                </Button>,
              ]}>
              <Form
                id="conversationForm"
                name="conversationForm"
                onFinishFailed={(e) => console.log(e)}>
                <Form.Item
                  name="conversation"
                  rules={[{ required: true, message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Channel Description" />
                  </div>
                </Form.Item>
                <Form.Item
                  name="conversationDescription"
                  rules={[{ required: true, message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Channel Name" />
                  </div>
                </Form.Item>
                <div style={{ width: '100%', paddingBottom: 20 }}>
                  <h3>Channel Image</h3>
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </div>

              </Form>
            </Modal>
            <Table columns={columns} dataSource={channelData} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>HCMC Expat Assitant ©2021</Footer>
      </Layout>
    </Layout>
  )
}
