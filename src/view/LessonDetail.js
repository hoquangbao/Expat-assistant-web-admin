import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button, Typography, Modal, Input, Form, Upload, message } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom'
import '../dist/css/homepage.css'
import { Table, Tag, Space, Tabs } from 'antd';
import { storage } from '../firebase/FirebaseUtil'
import { Image } from 'antd';
import axios from 'axios';

const { Header, Content, Footer, Sider } = Layout;
const { TabPane } = Tabs;
const { Text } = Typography;


export default function LessonDetail() {
  const [vocabularyData, setVocabularyData] = useState([]);
  const [conversationData, setConversationData] = useState([]);
  const [conversationCreateModalContent, setConversationCreateModalContent] = useState({});
  const [createConversationModalVisible, setConversationCreateModalVisible] = useState(false);
  const [conversationForm] = Form.useForm()

  const vocabularyColumns = [
    {
      title: 'ID',
      dataIndex: 'vocabularyId',
      key: 'vocabularyId',
    },
    {
      title: 'Vocabulary',
      dataIndex: 'vocabulary',
      key: 'vocabulary',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Vocabulary Image',
      dataIndex: 'image_link',
      key: 'image_link',
      render: image => <Image
        width={150}
        src={image}
      />
    },
    {
      title: 'Vocabulary Status',
      key: 'vocabularyStatus',
      dataIndex: 'vocabularyStatus',
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

  const conversationColumns = [
    {
      title: 'ID',
      dataIndex: 'conversationId',
      key: 'conversationId',
    },
    {
      title: 'Conversation',
      dataIndex: 'conversation',
      key: 'conversation',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Conversation Image',
      dataIndex: 'conversationImage',
      key: 'conversationImage',
      render: image => <Image
        width={150}
        src={image}
      />
    },
    {
      title: 'Conversation Status',
      key: 'vocabularyStatus',
      dataIndex: 'vocabularyStatus',
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

  const token = localStorage.getItem('token')
  const topicId = window.location.pathname.split('/').reverse()[0]

  useEffect(() => {
    async function fetchVocabulary() {
      try {
        await axios.get(`https://hcmc.herokuapp.com/api/vocabulary/${topicId}`,
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
        ).then(res => {
          const tableVocabularyData = res.data.map(vocabulary => ({
            ...vocabulary
          }))
          setVocabularyData(tableVocabularyData)
        }).catch(error => {
          console.log(error)
        })
        await axios.get(`https://hcmc.herokuapp.com/api/conversation/${topicId}`,
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
        ).then(res => {
          const tableConversationData = res.data.map(conversation => ({
            ...conversation
          }))
          setConversationData(tableConversationData)
        }).catch(error => {
          console.log(error)
        })
      } catch (e) {
        console.log(e)
      }
    }
    fetchVocabulary();
  }, [])

  function onConversationFormFinish(values) {
    const preparedData = {
      ...values,
      ...conversationCreateModalContent,
    }
    async function createConversation() {
      try {
        const result = await axios.post(`https://hcmc.herokuapp.com/api/conversation/${topicId}`, {
          "conversation": values.conversation,
          "conversationId": 0,
          "conversationImage": preparedData.conversationImage,
          "description": values.conversationDescription,
          "topic":
          {
            "topicId": topicId
          },
          "voice_link": preparedData.connversatioVoiceURL,
        }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        if (result.code === 200) {
          setConversationData(conversationData.map(row => {
            if (row.id === conversationCreateModalContent.id) {
              return {
                ...row,
                ...values
              }
            }
            return row;
          }))
          console.log("success")
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
    createConversation();
  }

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

  const uploadConversationImg = async (file) => {
    let identify = file.name + '__' + Date.now();
    let conversationImg;
    await storage.ref(`image/Conversation/${identify}`).put(file);
    await storage.ref(`image/Conversation`).child(identify).getDownloadURL().then(url => {
      conversationImg = url;
    })
    setConversationCreateModalContent({
      ...conversationCreateModalContent,
      conversationImage: conversationImg
    })
    return conversationImg
  }

  const handleConversationImageChange = info => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => {
        setConversationCreateModalContent({
          ...conversationCreateModalContent,
          image: imageUrl
        })
      }
      );
    }
  }

  const showConversationModal = () => {
    setConversationCreateModalVisible(true);
  };

  const handleConversationCancel = () => {
    setConversationCreateModalVisible(false);
  };

  const uploadConversationVoiceLink = async (file) => {
    let identify = file.name + '__' + Date.now();
    let connversatioVoiceURL;
    await storage.ref(`voice/Conversation/${identify}`).put(file);
    await storage.ref(`voice/Conversation`).child(identify).getDownloadURL().then(url => {
      connversatioVoiceURL = url;
    })
    setConversationCreateModalContent({
      ...conversationCreateModalContent,
      conversation_voice_link: connversatioVoiceURL
    })
    return connversatioVoiceURL
  }

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
          <Menu.Item key="4" icon={<VideoCameraOutlined />}>
            <Link to="/event">Event</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className="site-layout-sub-header-background" style={{ padding: 0 }} />
        <Content style={{ margin: '24px 16px 0' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Tabs defaultActiveKey="1">


              <TabPane tab="Vocabulary" key="1">

                <Table columns={vocabularyColumns} dataSource={vocabularyData} />
              </TabPane>



              <TabPane tab="Conversation" key="2">
                <Button onClick={showConversationModal} type="primary" style={{ color: 'blue', marginBottom: '20px', marginLeft: '0', paddingRight: 30 }} size={"large"}>
                  <PlusOutlined style={{ color: 'white', paddingRight: 5 }} /><Text style={{ color: 'white' }}>Create New Conversation</Text>
                </Button>
                <Modal
                  title="Create New Conversation"
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
                    form={conversationForm}
                    onFinish={onConversationFormFinish}
                    onFinishFailed={(e) => console.log(e)}>
                    <Form.Item
                      name="conversation"
                      rules={[{ required: true, message: 'This field is required!' }]}>
                      <div style={{ width: '100%', paddingBottom: 20 }}>
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Conversation Description" />
                      </div>
                    </Form.Item>
                    <Form.Item
                      name="conversationDescription"
                      rules={[{ required: true, message: 'This field is required!' }]}>
                      <div style={{ width: '100%', paddingBottom: 20 }}>
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Conversation" />
                      </div>
                    </Form.Item>
                    <div style={{ width: '100%', paddingBottom: 20 }}>
                      <h3>Conversation Image</h3>
                      <Upload
                        listType="picture-card"
                        showUploadList={false}
                        action={uploadConversationImg}
                        beforeUpload={beforeUpload}
                        onChange={handleConversationImageChange}
                      >
                        {
                          conversationCreateModalContent.image ? <img src={conversationCreateModalContent.image} style={{ width: '100%' }} alt={conversationCreateModalContent.image} /> :
                            <div>
                              <PlusOutlined />
                              <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        }
                      </Upload>
                    </div>

                    <div style={{ width: '100%', paddingBottom: 20 }}>
                      <h3>Conversation Voice</h3>
                      <Upload
                        listType="picture-card"
                        showUploadList={false}
                        action={uploadConversationVoiceLink}
                        onChange={handleConversationImageChange}
                      >
                        {
                          conversationCreateModalContent.voice_link ? <audio key={conversationCreateModalContent.voice_link} controls><source src={conversationCreateModalContent.voice_link} type="audio/mpeg" /></audio> :
                            <div>
                              <PlusOutlined />
                              <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        }
                      </Upload>
                    </div>

                  </Form>
                </Modal>
                <Table columns={conversationColumns} dataSource={conversationData} />
              </TabPane>
            </Tabs>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>HCMC Expat Assitant ©2021</Footer>
      </Layout>
    </Layout>
  )
}
