import React, { useEffect, useState } from 'react'
import { Layout, Menu, Button, Typography, Row, Modal, Form, Input, Upload, message, Affix, Dropdown } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { Table, Tag, Space, Image } from 'antd';
import { Link } from 'react-router-dom'
import axios from 'axios';
import '../dist/css/homepage.css'
import { storage } from '../firebase/FirebaseUtil';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;
const Text = Typography

export default function New() {
  const [channelData, setChannelData] = useState([]);
  const [channelModalContent, setChannelModalContent] = useState({})
  const [updateModalContent, setUpdateModalContent] = useState({})
  const [createConversationModalVisible, setConversationCreateModalVisible] = useState(false);
  const [channelUpdateModalVisible, setChannelUpdateModalVisible] = useState(false);
  const [top, setTop] = useState(0);


  const [channelForm] = Form.useForm()

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
      render: (record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => onOpenBlogUpdateModal(record)}>Update</Button>
        </Space>
      ),
    },
  ];

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';

    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('Image must smaller than 1MB!');
    }
    return isJpgOrPng && isLt1M;
  }

  const uploadEventImg = async (file) => {
    let identify = file.name + '__' + Date.now();
    let eventCoverImage;
    await storage.ref(`image/Event/${identify}`).put(file);
    await storage.ref(`image/Event`).child(identify).getDownloadURL().then(url => {
      eventCoverImage = url;
    })
    setChannelModalContent({
      ...channelModalContent,
      image: eventCoverImage
    })
    return eventCoverImage
  }

  const handleBlogImageChange = info => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, eventCoverImage => {
        setChannelModalContent({
          ...channelModalContent,
          image: eventCoverImage
        })
      }
      );
    }
  }

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

  function onChannelCreateFormFinish(values) {
    const preparedData = {
      ...values,
      ...channelModalContent,
    }
    async function createBlog() {
      try {
        const result = await axios.post(`https://hcmc.herokuapp.com/api/channels/create`, {
          "channelName": preparedData.channelName,
          "createBy": 2,
          "description": preparedData.description,
          "image": preparedData.image,
          "status": 1
        }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        console.log(result)
        if (result.status === 200) {
          setChannelData(channelData => [...channelData, preparedData])
          setConversationCreateModalVisible(false)
        } else {
          message.error({
            content: 'Something went wrong!',
            style: {
              position: 'fixed',
              bottom: '10px',
              left: '50%'
            }
          })
        }
      } catch (e) {
        console.log(e)
      }
    }
    createBlog();
  }

  const onTopicUpdateFormFinish = values => {
    const preparedData = {
      ...channelModalContent,
      ...values,
    }
    console.log(preparedData)
    async function createBlog() {
      try {
        const result = await axios.put(`https://hcmc.herokuapp.com/api/channels/update`, {
          "channelId": preparedData.channelId,
          "channelName": preparedData.channelName,
          "createBy": 2,
          "description": preparedData.description,
          "image": preparedData.image,
          "status": 1
        },
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        if (result.status === 200 || result.status === 201) {
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
          console.log("success")
          setChannelUpdateModalVisible(false)
        } else {
          message.error({
            content: 'Something went wrong!',
            style: {
              position: 'fixed',
              bottom: '10px',
              left: '50%'
            }
          })
        }
      } catch (e) {
        console.log(e)
      }
    }
    createBlog();
  }

  function onBlogUpdateFormFinish(values) {
    const preparedData = {
      ...values,
      ...channelModalContent
    }
    console.log(preparedData)

  }

  const showConversationModal = () => {
    setConversationCreateModalVisible(true);
  };

  const handleConversationCancel = () => {
    setConversationCreateModalVisible(false);
  };

  const onOpenBlogUpdateModal = (record) => {
    console.log(record)
    channelForm.setFieldsValue(record)
    setChannelModalContent(record)
    setChannelUpdateModalVisible(true);
  }

  function handleBlogUpdateCancel() {
    setChannelUpdateModalVisible(false)
  }

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<LogoutOutlined />} onClick={() => onClickLogout()}>
        <Link to="/">Logout</Link>
      </Menu.Item>
    </Menu>
  );

  function onClickLogout() {
    localStorage.setItem('token', "");
    localStorage.setItem('id', "");
  }

  console.log(channelModalContent)
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
        <Menu theme="dark" mode="inline">
          <Menu.Item key="1" icon={<UserOutlined />}>
            <Link to="/lesson">Lessons</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<VideoCameraOutlined />}>
            <Link to="/new">New</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<VideoCameraOutlined />}>
            <Link to="/event">Event</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<VideoCameraOutlined />}>
            <Link to="/location">Location</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Affix offsetTop={top}>
          <Header className="site-layout-sub-header-background" style={{ padding: 0 }} >
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: 10, paddingRight: 20 }}>
              <Dropdown overlay={menu} trigger={['click']}>
                <Button shape="circle" size="large">
                  <UserOutlined />
                </Button>
              </Dropdown>
            </div>
          </Header>
        </Affix>
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
                  form="channelForm"
                  type="primary"
                  htmlType="submit"
                >
                  Submit
                </Button>,
              ]}>
              <Form
                id="channelForm"
                name="channelForm"
                form={channelForm}
                onFinish={onChannelCreateFormFinish}
                onFinishFailed={(e) => console.log(e)}>
                <Form.Item
                  name="description"
                  rules={[{ required: true, message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Channel Description" />
                  </div>
                </Form.Item>
                <Form.Item
                  name="channelName"
                  rules={[{ required: true, message: 'This field is required!' }]}
                >
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
                    action={uploadEventImg}
                    beforeUpload={beforeUpload}
                    onChange={handleBlogImageChange}
                  >
                    {
                      channelModalContent.image ? <img src={channelModalContent.image} style={{ width: '100%' }} alt={channelModalContent.image} /> :
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    }
                  </Upload>
                </div>

              </Form>
            </Modal>
            <Modal
              visible={channelUpdateModalVisible}
              width={900}
              onCancel={() => {
                setChannelUpdateModalVisible(false)
              }}
              footer={[
                <Button
                  key="submit"
                  form="channelForm"
                  htmlType="submit"
                >
                  Submit
                </Button>
              ]}
            >
              <div
                style={{ maxHeight: '60vh', overflowY: 'auto' }}
              >
                <Form
                  id="channelForm"
                  name="channelForm"
                  form={channelForm}
                  onFinish={onTopicUpdateFormFinish}
                  onFinishFailed={(e) => console.log(e)}
                >
                  <h3>Channel Description</h3>
                  <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'This field is required!' }]}
                    initialValue={channelModalContent.description}
                  >
                    <Input />
                  </Form.Item>
                  <h3>Channel Name</h3>
                  <Form.Item
                    name="channelName"
                    rules={[{ required: true, message: 'This field is required!' }]}
                    initialValue={channelModalContent.channelName}
                  >
                    <Input />
                  </Form.Item>
                  <h3>Vocabulary Image</h3>
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    action={uploadEventImg}
                    beforeUpload={beforeUpload}
                    onChange={handleBlogImageChange}
                  >
                    {
                      channelModalContent.image ? <img src={channelModalContent.image} style={{ width: '100%' }} alt={channelModalContent.image} /> :
                        <div>

                          <div style={{ marginTop: 20 }}>
                            <img src={channelModalContent.image} style={{ width: '100%' }} />
                          </div>
                        </div>
                    }
                  </Upload>
                </Form>
              </div>
            </Modal>
            <Table columns={columns} dataSource={channelData} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>HCMC Expat Assitant ©2021</Footer>
      </Layout>
    </Layout >
  )
}
