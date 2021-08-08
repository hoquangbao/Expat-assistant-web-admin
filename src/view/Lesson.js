import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button, Typography, Modal, Input, Form, Upload, message } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom'
import '../dist/css/homepage.css'
import { Table, Tag, Space } from 'antd';
import { Image } from 'antd';
import axios from 'axios';
import { storage } from '../firebase/FirebaseUtil'
import { less } from 'check-types';

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

export default function Lesson() {
  const [lessonData, setLessonData] = useState([]);
  const [lessonCreateModalContent, setLessonCreateModalContent] = useState({});

  const [loading, setLoading] = useState();
  const [imgUrl, setImgUrl] = useState();
  const [topicForm] = Form.useForm()
  const [lessonCreateModalVisible, setLessonCreateModalVisible] = useState(false);
  const [lessonUpdateModalVisible, setLessonUpdateModalVisible] = useState(false);


  const columns = [
    {
      title: 'ID',
      dataIndex: 'topicId',
      key: 'topicId',
    },
    {
      title: 'Topic Name',
      dataIndex: 'topicName',
      key: 'topicName',
      render: (text, record) => {
        return (
          <Link to={`/lessondetail/${record.topicId}`}>{text}</Link>
        );
      },
    },
    {
      title: 'Topic Desc',
      dataIndex: 'topicDesc',
      key: 'topicDesc',
    },
    {
      title: 'Topic Image',
      dataIndex: 'topicImage',
      key: 'topicImage',
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
          <Button type="primary" onClick={() => onOpenTopicUpdateModal(record)}>Update</Button>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  const token = localStorage.getItem('token')


  const handleUploadChange = info => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get url from response in real world.
      getBase64(info.file.originFileObj, imageUrl =>
        setImgUrl({
          imageUrl,
        }),
        setLoading(false)
      );
    }
  };


  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  useEffect(() => {
    async function fetchLessons() {
      try {
        await axios.get('https://hcmc.herokuapp.com/api/topic/topics',
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
        ).then(res => {
          const tableData = res.data.map(lesson => ({
            ...lesson
          }))
          setLessonData(tableData)
        }).catch(error => {
          console.log(error)
        })
      } catch (e) {
        console.log(e)
      }
    }
    fetchLessons();
  }, [])

  function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  }

  const uploadLessonImg = async (file) => {
    let identify = file.name + '__' + Date.now();
    let imgURL;
    await storage.ref(`image/${identify}`).put(file);
    await storage.ref(`image/`).child(identify).getDownloadURL().then(url => {
      imgURL = url;
    })
    setLessonCreateModalContent({
      ...lessonCreateModalContent,
      image: imgURL
    })
    return imgURL
  }

  const handleLessonImageChange = info => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => {
        setLessonCreateModalContent({
          ...lessonCreateModalContent,
          image: imageUrl
        })
      }
      );
    }
  }

  const showModal = () => {
    setLessonCreateModalVisible(true);
  };

  const onOpenTopicUpdateModal = (record) => {
    console.log(record)
    topicForm.setFieldsValue(record)
    setLessonCreateModalContent(record)
    setLessonUpdateModalVisible(true);
  }

  const handleCancel = () => {
    setLessonCreateModalVisible(false);
  };

  function onLessonFormFinish(values) {
    const lessonModalDatapreparedData = {
      ...values,
      ...lessonCreateModalContent,
    }
    async function createLesson() {
      try {
        const result = await axios.post('https://hcmc.herokuapp.com/api/topic/createTopic', {

          "topicDesc": lessonModalDatapreparedData.topicDescription,
          "topicImage": lessonModalDatapreparedData.image,
          "topicName": lessonModalDatapreparedData.topicName,
          "topicStatus": 1,
        },
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        if (result.code === 200) {
          setLessonData(lessonData.map(row => {
            if (row.id === lessonData.id) {
              return {
                ...row,
                ...values
              }
            }
            return row;
          }))
          console.log("success")
          setLessonCreateModalVisible(false)
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
    createLesson();
  }

  const onTopicUpdateFormFinish = values => {
    const preparedData = {
      ...values,
      ...lessonCreateModalContent,
    }
    async function updateTopic() {
      try {
        const result = await axios.put(`https://hcmc.herokuapp.com/api/topic/updateTopic`, {
          "topicDesc": values.topicDesc,
          "topicId": values.topicId,
          "topicImage": preparedData.topicImage,
          "topicName": values.topicName,
          "topicStatus": 1
        },
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        if (result.code === 200) {
          setLessonData(() =>
            lessonData.map(row => {
              if (row.id === lessonCreateModalContent.id) {
                return {
                  ...row,
                  ...values
                }
              }
              return row
            })
          )
          console.log("success")
          setLessonUpdateModalVisible(false)
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
            <Button onClick={showModal} type="primary" style={{ color: 'blue', marginBottom: '20px', marginLeft: '0', paddingRight: 30 }} size={"large"}>
              <PlusOutlined style={{ color: 'white', paddingRight: 5 }} /><Text style={{ color: 'white' }}>Create New Lesson</Text>
            </Button>
            {/* Create Topic Modal */}
            <Modal
              title="Create New Lesson"
              style={{ width: 700 }}
              visible={lessonCreateModalVisible}
              footer={[
                <Button
                  default
                  onClick={handleCancel}
                >
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  form="topicForm"
                  type="primary"
                  htmlType="submit"
                >
                  Submit
                </Button>,
              ]}>
              <Form
                id="topicForm"
                name="topicForm"
                form={topicForm}
                onFinish={onLessonFormFinish}
                onFinishFailed={(e) => console.log(e)}>
                <Form.Item
                  name="topicDescription"
                  rules={[{ required: true, message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Topic Description" />
                  </div>
                </Form.Item>
                <Form.Item
                  name="topicName"
                  rules={[{ required: true, message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Topic Name" />
                  </div>
                </Form.Item>
                <div style={{ width: '100%', paddingBottom: 20 }}>
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    action={uploadLessonImg}
                    beforeUpload={beforeUpload}
                    onChange={handleLessonImageChange}
                  >
                    {
                      lessonCreateModalContent.image ? <img src={lessonCreateModalContent.image} style={{ width: '100%' }} alt={lessonCreateModalContent.image} /> :
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    }
                  </Upload>
                </div>

              </Form>
            </Modal>
            {/* Update Topic Modal */}
            <Modal
              visible={lessonUpdateModalVisible}
              width={900}
              onCancel={() => {
                setLessonUpdateModalVisible(false)
              }}
              footer={[
                <Button
                  key="submit"
                  form="topicForm"
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
                  id="topicForm"
                  name="topicForm"
                  form={topicForm}
                  onFinish={onTopicUpdateFormFinish}
                  onFinishFailed={(e) => console.log(e)}
                >
                  <h3>Topic ID</h3>
                  <Form.Item
                    name="topicId"
                    rules={[{ required: true, message: 'This field is required!' }]}
                    initialValue={lessonCreateModalContent.topicId}
                  >
                    <Input disabled />
                  </Form.Item>
                  <h3>Topic Name</h3>
                  <Form.Item
                    name="topicName"
                    rules={[{ required: true, message: 'This field is required!' }]}
                    initialValue={lessonCreateModalContent.topicName}
                  >
                    <Input />
                  </Form.Item>
                  <h3>Topic Description</h3>
                  <Form.Item
                    name="topicDesc"
                    rules={[{ required: true, message: 'This field is required!' }]}
                    initialValue={lessonCreateModalContent.topicDesc}
                  >
                    <Input />
                  </Form.Item>
                  <h3>Vocabulary Image</h3>
                  {/* <Form.Item
                                    name="image"
                                    rules={[{ required: true, message: 'This field is required!' }]}
                                    initialValue={vocabularyModalContent.image}
                                  >
                                    <Image src={vocabularyModalContent.image} width={300} height={300} />
                                  </Form.Item> */}
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    action={uploadLessonImg}
                    beforeUpload={beforeUpload}
                    onChange={handleLessonImageChange}
                  >
                    {
                      lessonCreateModalContent.topicImage ? <img src={lessonCreateModalContent.topicImage} style={{ width: '100%' }} alt={lessonCreateModalContent.topicImage} /> :
                        <div>

                          <div style={{ marginTop: 20 }}>
                            <img src={lessonCreateModalContent.topicImage} style={{ width: '100%' }} />
                          </div>
                        </div>
                    }
                  </Upload>
                </Form>
              </div>
            </Modal>
            <Table columns={columns} dataSource={lessonData} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>HCMC Expat Assitant ©2021</Footer>
      </Layout>
    </Layout>
  )
}
