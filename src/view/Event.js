import React, { useEffect, useState } from 'react'
import { Button, Input, Layout, Menu, message, Row, Typography, Upload, Form, TimePicker, DatePicker } from 'antd';
import { PlusOutlined, UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import padLeft from 'pad-left';
import { Table, Tag, Space, Image } from 'antd';
import { Link } from 'react-router-dom'
import axios from 'axios';
import '../dist/css/homepage.css'
import Modal from 'antd/lib/modal/Modal';
import { storage } from '../firebase/FirebaseUtil';
import TextArea from 'antd/lib/input/TextArea';

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography
const { SubMenu } = Menu;

export default function Event() {
  const [eventData, setEventData] = useState([]);
  const [createEventModal, setCreatEventModal] = useState(false);
  const [eventModalContent, setEventModalContent] = useState({})
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [currentDate, setCurrentDate] = useState();
  const [eventStartDate, setEventStartDate] = useState();
  const [eventEndDate, setEventEndDate] = useState();

  const [eventForm] = Form.useForm()

  const token = localStorage.getItem('token')
  const id = localStorage.getItem('id')

  const columns = [
    {
      title: 'ID',
      dataIndex: 'eventId',
      key: 'eventId',
    },
    {
      title: 'Event Title',
      dataIndex: 'eventTitle',
      key: 'eventTitle',
    },
    {
      title: 'Description',
      dataIndex: 'eventDesc',
      key: 'eventDesc',
    },
    {
      title: 'Start Date',
      dataIndex: 'eventStartDate',
      key: 'eventStartDate',
      render: (text) => {
        const date1 = padLeft(text[1], 2, '0')
        const date2 = padLeft(text[2], 2, '0')
        const date = date2 + "/" + date1 + "/" + text[0]
        return (
          <Text>{date}</Text>
        );
      },
    },
    {
      title: 'End Date',
      dataIndex: 'eventEndDate',
      key: 'eventEndDate',
      render: (text) => {
        const date1 = padLeft(text[1], 2, '0')
        const date2 = padLeft(text[2], 2, '0')
        const date = date2 + "/" + date1 + "/" + text[0]
        return (
          <Text>{date}</Text>
        );
      },
    },
    {
      title: 'Organizers',
      dataIndex: 'organizers',
      key: 'organizers',
    },
    {
      title: 'Image',
      dataIndex: 'eventCoverImage',
      key: 'eventCoverImage',
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
          <Button type="primary" >Update</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    async function fetchEvent() {
      try {
        await axios.get('https://hcmc.herokuapp.com/api/events/event?page=0&size=20&sortBy=eventId',
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
        ).then(res => {
          console.log(res)
          const tableData = res.data.content.map(event => ({
            ...event
          }))
          setEventData(tableData)
        }).catch(error => {
          console.log(error)
        })
      } catch (e) {
        console.log(e)
      }
    }
    fetchEvent();
  }, [])

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
    await storage.ref(`image/Blog/${identify}`).put(file);
    await storage.ref(`image/Blog`).child(identify).getDownloadURL().then(url => {
      eventCoverImage = url;
    })
    setEventModalContent({
      ...eventModalContent,
      eventCoverImage: eventCoverImage
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
        setEventModalContent({
          ...eventModalContent,
          eventCoverImage: eventCoverImage
        })
      }
      );
    }
  }

  function onEventFormFinish(values) {
    const preparedData = {
      ...values,
      ...eventModalContent,
    }
    var currentdate = new Date();
    const month = padLeft(currentdate.getMonth() + 1, 2, '0')
    const date = padLeft(currentdate.getDate(), 2, '0')
    const hour = padLeft(currentdate.getHours(), 2, '0')
    const minute = padLeft(currentdate.getMinutes(), 2, '0')
    const second = padLeft(currentdate.getSeconds(), 2, '0')
    var datetime = currentdate.getFullYear() + "-"
      + month + "-"
      + date + "T" + hour + ":"
      + minute + ":"
      + second;
    var blogContent = values.blogContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
    var blogContents = "<p>" + blogContent + "</p>"
    async function createBlog() {
      try {
        const result = await axios.post(`https://hcmc.herokuapp.com/api/blogs/create`, {
          "blogContent": blogContents,
          "blogTitle": values.blogTitle,
          "cover_link": preparedData.cover_link,
          "createBy": id,
          "createDate": datetime,
          "priority": 1,
        }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        console.log(result)
        if (result.status === 200) {
          // setBlogData(blogData.map(row => {
          //   if (row.id === blogData.id) {
          //     return {
          //       ...row,
          //       ...values
          //     }
          //   }
          //   return row;
          // }))
          setCreatEventModal(false)
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

  function onOkStartTime(values) {
    const startTime = values.format('HH:mm:ss');
    console.log(values.format("YYYY-MM-DDTHH:mm:ss"))
    // const adding = moment(values).add(sessionTime, 'm').toArray();
    // const hour = padLeft(adding[3], 2, '0')
    // const minute = padLeft(adding[4], 2, '0')
    // const second = padLeft(adding[5], 2, '0')
    // const endTime = hour + ":" + minute + ":" + second
    setStartTime(startTime);
    // setEventStartDate(currentDate + startTime)
  }

  function onOkEndTime(values) {
    const endtime = values.format('HH:mm:ss');
    // const adding = moment(values).add(sessionTime, 'm').toArray();
    // const hour = padLeft(adding[3], 2, '0')
    // const minute = padLeft(adding[4], 2, '0')
    // const second = padLeft(adding[5], 2, '0')
    // const endTime = hour + ":" + minute + ":" + second
    setEndTime(endtime);
    // setEventEndDate(currentDate + endTime)

  }

  function showCreateEventModal() {
    setCreatEventModal(true)
  }

  function handleEventCancel() {
    setCreatEventModal(false)
  }

  const format = 'DD/MM/YYYY HH:mm';

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
            <Button onClick={showCreateEventModal} type="primary" style={{ color: 'blue', marginBottom: '20px', marginLeft: '0', paddingRight: 30 }} size={"large"}>
              <Row><PlusOutlined style={{ color: 'white', paddingRight: 5 }} /><Text style={{ color: 'white' }}>Create New Event</Text></Row>
            </Button>
            <Modal
              title="Create New Blog"
              width={800}
              visible={createEventModal}
              footer={[
                <Button
                  default
                  onClick={handleEventCancel}
                >
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  form="eventForm"
                  type="primary"
                  htmlType="submit"
                >
                  Submit
                </Button>,
              ]}>
              <Form
                id="eventForm"
                name="eventForm"
                form={eventForm}
                onFinish={onEventFormFinish}
                onFinishFailed={(e) => console.log(e)}>
                <Form.Item
                  name="eventTitle"
                  rules={[{ required: true, message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Event Title" />
                  </div>
                </Form.Item>
                <Form.Item
                  name="organizers"
                  rules={[{ required: true, message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Organizer" />
                  </div>
                </Form.Item>
                <Form.Item
                  name="eventDesc"
                  rules={[{ required: true, message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <TextArea
                      style={{ width: '100%' }}
                      rows={4}
                      placeholder="Event Description" >
                    </TextArea>
                  </div>
                </Form.Item>
                <Form.Item
                  name="eventStartDate">
                  <div style={{ width: "100%", paddingBottom: 20 }}>
                    <DatePicker showTime placeholder="Start Date" style={{ width: "100%", }} format={format} onOk={onOkStartTime} />
                  </div>
                </Form.Item>
                <Form.Item
                  name="eventEndDate">
                  <div style={{ width: "100%", paddingBottom: 20 }}>
                    <DatePicker showTime placeholder="End Date" style={{ width: "100%", }} format={format} onOk={onOkEndTime} />
                  </div>
                </Form.Item>
                <div style={{ width: '100%', paddingBottom: 20 }}>
                  <h3>Image</h3>
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    action={uploadEventImg}
                    beforeUpload={beforeUpload}
                    onChange={handleBlogImageChange}
                  >
                    {
                      eventModalContent.cover_link ? <img src={eventModalContent.cover_link} style={{ width: '100%' }} alt={eventModalContent.cover_link} /> :
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    }
                  </Upload>
                </div>
              </Form>
            </Modal>
            <Table columns={columns} dataSource={eventData} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>HCMC Expat Assitant ©2021</Footer>
      </Layout>
    </Layout>
  )
}
