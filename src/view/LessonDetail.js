import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button, Typography, Modal, Input, Form, Upload, message, Affix, Dropdown } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, PlusOutlined, LogoutOutlined } from '@ant-design/icons';
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
  const [conversationUpdateModalVisible, setConversationUpdateModalVisible] = useState(false);
  const [createVocabularyModalVisible, setCreateVocabularyModalVisible] = useState(false);
  const [vocabularyUpdateModalVisible, setVocabularyUpdateModalVisible] = useState(false);
  const [vocabularyCreateModalContent, setVocabularyCreateModalContent] = useState({})
  const [conversationForm] = Form.useForm()
  const [vocabularyForm] = Form.useForm()
  const [top, setTop] = useState(0);


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
      render: (record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => onOpenVocabularyUpdateModal(record)}>Update</Button>
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
      render: (record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => onOpenConversationUpdateModal(record)}>Update</Button>
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
    console.log(preparedData)
    async function createConversation() {
      try {
        const result = await axios.post(`https://hcmc.herokuapp.com/api/conversation/${topicId}`, {
          "conversation": values.conversation,
          "conversationId": 0,
          "conversationImage": preparedData.conversationImage,
          "description": values.description,
          "topic":
          {
            "topicId": topicId
          },
          "voice_link": preparedData.voice_link,
        }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        if (result.status === 200 || result.status === 201) {
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

  const onOpenConversationUpdateModal = (record) => {
    console.log(record)
    conversationForm.setFieldsValue(record)
    setConversationCreateModalContent(record)
    setConversationUpdateModalVisible(true);
  }

  const onConversationUpdateFormFinish = values => {
    const preparedData = {
      ...conversationCreateModalContent,
      ...values,
    }
    console.log(preparedData)
    async function updateTopic() {
      try {
        const result = await axios.put(`https://hcmc.herokuapp.com/api/conversation/${preparedData.conversationId}`, {
          "conversation": preparedData.conversation,
          "conversationId": preparedData.conversationId,
          "conversationImage": preparedData.conversationImage,
          "description": preparedData.description,
          "topic": {
            "topicId": preparedData.topic.topicId,
          },
          "voice_link": preparedData.voice_link
        },
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        if (result.status === 200 || result.status === 201) {
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
          console.log("success")
          setConversationUpdateModalVisible(false)
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
    updateTopic();
  }

  function onVocabularyFinish(values) {
    const preparedData = {
      ...vocabularyCreateModalContent,
      ...values,
    }
    console.log(preparedData)
    async function createConversation() {
      try {
        const result = await axios.post(`https://hcmc.herokuapp.com/api/vocabulary/create?topicId=${topicId}`, {
          "description": preparedData.description,
          "image_link": preparedData.image_link,
          "vocabulary": preparedData.vocabulary,
          "voice_link": preparedData.voice_link
        }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        if (result.status === 200 || result.status === 201) {
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
          setCreateVocabularyModalVisible(false)
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

  const onOpenVocabularyUpdateModal = (record) => {
    console.log(record)
    vocabularyForm.setFieldsValue(record)
    setVocabularyCreateModalContent(record)
    setVocabularyUpdateModalVisible(true);
  }

  const onVocabularyUpdateFormFinish = values => {
    const preparedData = {
      ...vocabularyCreateModalContent,
      ...values,
    }
    console.log(preparedData)
    async function updateTopic() {
      try {
        const result = await axios.put(`https://hcmc.herokuapp.com/api/vocabulary/${preparedData.vocabularyId}`, {
          "description": preparedData.description,
          "image_link": preparedData.image_link,
          "vocabulary": preparedData.vocabulary,
          "voice_link": preparedData.voice_link
        },
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        if (result.status === 200 || result.status === 201) {
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
          console.log("success")
          setVocabularyUpdateModalVisible(false)
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
    updateTopic();
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


  const uploadVocabularyImg = async (file) => {
    let identify = file.name + '__' + Date.now();
    let conversationImg;
    await storage.ref(`image/Vocabulary/${identify}`).put(file);
    await storage.ref(`image/Vocabulary`).child(identify).getDownloadURL().then(url => {
      conversationImg = url;
    })
    setVocabularyCreateModalContent({
      ...vocabularyCreateModalContent,
      image_link: conversationImg
    })
    return conversationImg
  }

  const handleVocabularyImageChange = info => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => {
        setVocabularyCreateModalContent({
          ...vocabularyCreateModalContent,
          image_link: imageUrl
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

  const showVocabularyModal = () => {
    setCreateVocabularyModalVisible(true);
  };

  const handleVocabularyCancel = () => {
    setCreateVocabularyModalVisible(false);
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
      voice_link: connversatioVoiceURL
    })
    return connversatioVoiceURL
  }

  const uploadVocabularyVoiceLink = async (file) => {
    let identify = file.name + '__' + Date.now();
    let connversatioVoiceURL;
    await storage.ref(`voice/Vocabulary/${identify}`).put(file);
    await storage.ref(`voice/Vocabulary`).child(identify).getDownloadURL().then(url => {
      connversatioVoiceURL = url;
    })
    setVocabularyCreateModalContent({
      ...vocabularyCreateModalContent,
      voice_link: connversatioVoiceURL
    })
    return connversatioVoiceURL
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
            <Tabs defaultActiveKey="1">

              <TabPane tab="Vocabulary" key="1">
                <Button onClick={showVocabularyModal} type="primary" style={{ color: 'blue', marginBottom: '20px', marginLeft: '0', paddingRight: 30 }} size={"large"}>
                  <PlusOutlined style={{ color: 'white', paddingRight: 5 }} /><Text style={{ color: 'white' }}>Create New Vocabulary</Text>
                </Button>
                <Modal
                  title="Create New Vocabulary"
                  style={{ width: 700 }}
                  visible={createVocabularyModalVisible}
                  footer={[
                    <Button
                      default
                      onClick={handleVocabularyCancel}
                    >
                      Cancel
                    </Button>,
                    <Button
                      key="submit"
                      form="vocabularyForm"
                      type="primary"
                      htmlType="submit"
                    >
                      Submit
                    </Button>,
                  ]}>
                  <Form
                    id="vocabularyForm"
                    name="vocabularyForm"
                    form={vocabularyForm}
                    onFinish={onVocabularyFinish}
                    onFinishFailed={(e) => console.log(e)}>
                    <Form.Item
                      name="vocabulary"
                      rules={[{ required: true, message: 'This field is required!' }]}>
                      <Input
                        style={{ width: '100%' }}
                        placeholder="Vocabulary Description" />
                    </Form.Item>
                    <Form.Item
                      name="description"
                      rules={[{ required: true, message: 'This field is required!' }]}>
                      <Input
                        style={{ width: '100%' }}
                        placeholder="Vocabulary" />
                    </Form.Item>
                    <div style={{ width: '100%', paddingBottom: 20 }}>
                      <h3>Vocabulary Image</h3>
                      <Upload
                        listType="picture-card"
                        showUploadList={false}
                        action={uploadVocabularyImg}
                        beforeUpload={beforeUpload}
                        onChange={handleVocabularyImageChange}
                      >
                        {
                          vocabularyCreateModalContent.image_link ? <img src={vocabularyCreateModalContent.image_link} style={{ width: '100%' }} alt={vocabularyCreateModalContent.image_link} /> :
                            <div>
                              <PlusOutlined />
                              <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        }
                      </Upload>
                    </div>

                    <div style={{ width: '100%', paddingBottom: 20 }}>
                      <h3>Vocabulary Voice</h3>
                      <Upload
                        style={{ width: "100%" }}
                        listType="picture-card"
                        showUploadList={false}
                        action={uploadVocabularyVoiceLink}
                        onChange={handleVocabularyImageChange}
                      >
                        {
                          vocabularyCreateModalContent.voice_link ? <audio key={vocabularyCreateModalContent.voice_link} controls><source src={vocabularyCreateModalContent.voice_link} type="audio/mpeg" /></audio> :
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
                  title="Update Vocabulary"
                  visible={vocabularyUpdateModalVisible}
                  width={900}
                  onCancel={() => {
                    setVocabularyUpdateModalVisible(false)
                  }}
                  footer={[
                    <Button
                      key="submit"
                      form="vocabularyForm"
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
                      id="vocabularyForm"
                      name="vocabularyForm"
                      form={vocabularyForm}
                      onFinish={onVocabularyUpdateFormFinish}
                      onFinishFailed={(e) => console.log(e)}
                    >
                      <Form.Item
                        name="vocabulary"
                        rules={[{ required: true, message: 'This field is required!' }]}
                        initialValue={vocabularyCreateModalContent.vocabulary}>
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Conversation Description" />
                      </Form.Item>
                      <Form.Item
                        name="description"
                        rules={[{ required: true, message: 'This field is required!' }]}>
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Vocabulary" />
                      </Form.Item>
                      <div style={{ width: '100%', paddingBottom: 20 }}>
                        <h3>Vocabulary Image</h3>
                        <Upload
                          listType="picture-card"
                          showUploadList={false}
                          action={uploadVocabularyImg}
                          beforeUpload={beforeUpload}
                          onChange={handleVocabularyImageChange}
                        >
                          {
                            vocabularyCreateModalContent.image_link ? <img src={vocabularyCreateModalContent.image_link} style={{ width: '100%' }} alt={vocabularyCreateModalContent.image_link} /> :
                              <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                              </div>
                          }
                        </Upload>
                      </div>

                      <div style={{ width: '100%', paddingBottom: 20 }}>
                        <h3>Vocabulary Voice</h3>
                        <Upload
                          style={{ width: "100%" }}
                          listType="picture-card"
                          showUploadList={false}
                          action={uploadVocabularyVoiceLink}
                          onChange={handleVocabularyImageChange}
                        >
                          {
                            vocabularyCreateModalContent.voice_link ? <audio key={vocabularyCreateModalContent.voice_link} controls><source src={vocabularyCreateModalContent.voice_link} type="audio/mpeg" /></audio> :
                              <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                              </div>
                          }
                        </Upload>
                      </div>
                    </Form>
                  </div>
                </Modal>

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
                      <Input
                        style={{ width: '100%' }}
                        placeholder="Conversation Description" />
                    </Form.Item>
                    <Form.Item
                      name="description"
                      rules={[{ required: true, message: 'This field is required!' }]}>
                      <Input
                        style={{ width: '100%' }}
                        placeholder="Conversation" />
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
                          conversationCreateModalContent.conversationImage ? <img src={conversationCreateModalContent.conversationImage} style={{ width: '100%' }} alt={conversationCreateModalContent.conversationImage} /> :
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
                        style={{ width: "100%" }}
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
                <Modal
                  title="Update Conversation"
                  visible={conversationUpdateModalVisible}
                  width={900}
                  onCancel={() => {
                    setConversationUpdateModalVisible(false)
                  }}
                  footer={[
                    <Button
                      key="submit"
                      form="conversationForm"
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
                      id="conversationForm"
                      name="conversationForm"
                      form={conversationForm}
                      onFinish={onConversationUpdateFormFinish}
                      onFinishFailed={(e) => console.log(e)}
                    >
                      <Form.Item
                        name="conversation"
                        rules={[{ required: true, message: 'This field is required!' }]}
                        initialValue={conversationCreateModalContent.conversation}>
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Conversation Description" />
                      </Form.Item>
                      <Form.Item
                        name="description"
                        rules={[{ required: true, message: 'This field is required!' }]}>
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Conversation" />
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
                            conversationCreateModalContent.conversationImage ? <img src={conversationCreateModalContent.conversationImage} style={{ width: '100%' }} alt={conversationCreateModalContent.conversationImage} /> :
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
                          style={{ width: "100%" }}
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
                  </div>
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
