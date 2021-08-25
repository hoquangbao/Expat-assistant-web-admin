import React, { useEffect, useState } from 'react'
import { Button, Input, Layout, Menu, message, Row, Typography, Upload, Form, TimePicker, DatePicker, Select, Affix, Dropdown } from 'antd';
import { PlusOutlined, UploadOutlined, UserOutlined, VideoCameraOutlined, LogoutOutlined } from '@ant-design/icons';
import padLeft from 'pad-left';
import { Table, Tag, Space, Image } from 'antd';
import { Link } from 'react-router-dom'
import axios from 'axios';
import '../dist/css/homepage.css'
import Modal from 'antd/lib/modal/Modal';
import { storage } from '../firebase/FirebaseUtil';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';

const { Header, Content, Footer, Sider } = Layout;
const { Option } = Select;
const { Text } = Typography
const { SubMenu } = Menu;

export default function Event() {
  const [eventData, setEventData] = useState([]);
  const [locationData, setLocationData] = useState([])
  const [location, setLocation] = useState([])
  const [topicData, setTopicData] = useState([])
  const [locationName, setLocationName] = useState()
  const [locationId, setLocationId] = useState()
  const [topicName, setTopicName] = useState()
  const [topicId, setTopicId] = useState()
  const [createEventModal, setCreatEventModal] = useState(false);
  const [eventModalContent, setEventModalContent] = useState({})
  const [updateEventModal, setUpdateEventModal] = useState(false);
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [eventStatusRule, setEventStatusRule] = useState(false);
  const [currentDate, setCurrentDate] = useState();
  const [eventStartDate, setEventStartDate] = useState();
  const [eventEndDate, setEventEndDate] = useState();
  const [top, setTop] = useState(0);


  const [eventForm] = Form.useForm()

  const token = localStorage.getItem('token')
  const id = localStorage.getItem('adminId')

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
      title: 'Status',
      key: 'eventStatus',
      dataIndex: 'eventStatus',
      render: (text) => {
        switch (text) {
          case "1":
            return (<Tag color="yellow" >
              SCHEDULED
            </Tag>);
          case "2":
            return (<Tag color="red" >
              ON-HOLD
            </Tag>)
          case "3":
            return (<Tag color="blue" >
              IN-PROGRESS
            </Tag>)
          case "4":
            return (<Tag color="grey" >
              CANCEL
            </Tag>)
          case "5":
            return (<Tag color="green" >
              COMPLETED
            </Tag>)
        }
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => openUpdateEventModal(record)} >Update</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    async function fetchEvent() {
      try {
        await axios.get('https://hcmc.herokuapp.com/api/events/event?page=0&size=50&sortBy=eventId',
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
    async function fetchLocation() {
      try {
        await axios.get('https://hcmc.herokuapp.com/api/location/location',
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
        ).then(res => {
          console.log(res)
          const tableData = res.data.map(location => ({
            ...location
          }))

          setLocation(tableData)
        }).catch(error => {
          console.log(error)
        })
      } catch (e) {
        console.log(e)
      }
    }
    fetchLocation();
    async function fetchLessons() {
      try {
        await axios.get('https://hcmc.herokuapp.com/api/topic/topics',
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
        ).then(res => {
          const tableData = res.data.map(lesson => ({
            ...lesson
          }))
          setTopicData(tableData)
        }).catch(error => {
          console.log(error)
        })
      } catch (e) {
        console.log(e)
      }
    }
    fetchLessons();
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
    await storage.ref(`image/Event/${identify}`).put(file);
    await storage.ref(`image/Event`).child(identify).getDownloadURL().then(url => {
      eventCoverImage = url;
    })
    setEventModalContent({
      ...eventModalContent,
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
        setEventModalContent({
          ...eventModalContent,
          image: eventCoverImage
        })
      }
      );
    }
  }

  function onEventFormFinish(values) {
    const preparedData = {
      ...eventModalContent,
      ...values,
    }
    console.log(preparedData)
    const date = Date.now();
    const eventStatus = "1"
    const createDate = moment(date).format("YYYY-MM-DDTHH:mm:ss")
    const location = preparedData.location;
    const topic = preparedData.topic
    async function createBlog() {
      try {
        const result = await axios.post(`https://hcmc.herokuapp.com/api/events/create?locationId=${location}&topicId=${topic}`, {
          "createBy": 2,
          "createDate": createDate,
          "eventCoverImage": preparedData.image,
          "eventDesc": preparedData.eventDesc,
          "eventEndDate": endTime,
          "eventStartDate": startTime,
          "eventStatus": 1,
          "eventTitle": preparedData.eventTitle,
          "organizers": preparedData.organizers
        }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        console.log(result)
        if (result.status === 200) {
          await axios.get('https://hcmc.herokuapp.com/api/events/event?page=0&size=50&sortBy=eventId',
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

  function onEventUpdateFormFinish(values) {
    const preparedData = {
      ...values,
      ...eventModalContent,
    }
    console.log(preparedData)
    const createDate = preparedData.createDate;
    const createDate1 = padLeft(createDate[1], 2, '0')
    const createDate2 = padLeft(createDate[2], 2, '0')
    const createDate3 = padLeft(createDate[3], 2, '0')
    const createDate4 = padLeft(createDate[4], 2, '0')
    var eventCrreateDate = createDate[0] + "-" + createDate1 + "-" + createDate2 + "T" + createDate3 + ":" + createDate4 + ":00"
    const startTime = preparedData.eventStartDate;
    const monthStart = padLeft(startTime[1], 2, '0')
    const dateStart = padLeft(startTime[2], 2, '0')
    const hourStart = padLeft(startTime[3], 2, '0')
    const minuteStart = padLeft(startTime[4], 2, '0')
    var eventStartTime = startTime[0] + "-" + monthStart + "-" + dateStart + "T" + hourStart + ":" + minuteStart + ":00"
    const endtime = preparedData.eventEndDate;
    const monthEnd = padLeft(endtime[1], 2, '0')
    const dateEnd = padLeft(endtime[2], 2, '0')
    const hourEnd = padLeft(endtime[3], 2, '0')
    const minuteEnd = padLeft(endtime[4], 2, '0')
    var eventEndTime = endtime[0] + "-" + monthEnd + "-" + dateEnd + "T" + hourEnd + ":" + minuteEnd + ":00"

    console.log("start time: ", eventStartTime)
    console.log("end time: ", eventEndTime)
    async function updateTopic() {
      try {
        const result = await axios.put(`https://hcmc.herokuapp.com/api/events/update?eventLocationId=${locationId}&eventTopicId=${topicId}&locationId=${locationId}&topicId=${topicId}`, {
          "createBy": 2,
          "createDate": eventCrreateDate,
          "eventCoverImage": preparedData.eventCoverImage,
          "eventDesc": preparedData.eventDesc,
          "eventEndDate": eventEndTime,
          "eventId": preparedData.eventId,
          "eventStartDate": eventStartTime,
          "eventStatus": preparedData.eventChangeStatus,
          "eventTitle": preparedData.eventTitle,
          "organizers": preparedData.organizers
        }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        if (result.status === 200) {
          await axios.get('https://hcmc.herokuapp.com/api/events/event?page=0&size=50&sortBy=eventId',
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
          console.log("success")
          setUpdateEventModal(false)
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

  function onChangeEventStatus(values) {
    setEventModalContent({
      ...eventModalContent,
      eventChangeStatus: values
    })
  }

  function onOkStartTime(values) {
    const startTime = values.format('YYYY-MM-DDTHH:mm:ss');
    // const adding = moment(values).add(sessionTime, 'm').toArray();
    // const hour = padLeft(adding[3], 2, '0')
    // const minute = padLeft(adding[4], 2, '0')
    // const second = padLeft(adding[5], 2, '0')
    // const endTime = hour + ":" + minute + ":" + second
    setStartTime(startTime);
    // setEventStartDate(currentDate + startTime)
  }

  function onOkEndTime(values) {
    const endtime = values.format('YYYY-MM-DDTHH:mm:ss');
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

  const openUpdateEventModal = (record) => {
    eventForm.setFieldsValue(record);
    setEventModalContent(record);
    console.log(record)
    const startTime = record.eventStartDate;
    const monthStart = padLeft(startTime[1], 2, '0')
    const dateStart = padLeft(startTime[2], 2, '0')
    const hourStart = padLeft(startTime[3], 2, '0')
    const minuteStart = padLeft(startTime[4], 2, '0')
    var eventStartTime = startTime[0] + "-" + monthStart + "-" + dateStart + " " + hourStart + ":" + minuteStart
    const endtime = record.eventEndDate;
    const monthEnd = padLeft(endtime[1], 2, '0')
    const dateEnd = padLeft(endtime[2], 2, '0')
    const hourEnd = padLeft(endtime[3], 2, '0')
    const minuteEnd = padLeft(endtime[4], 2, '0')
    var eventEndTime = endtime[0] + "-" + monthEnd + "-" + dateEnd + " " + hourEnd + ":" + minuteEnd
    setStartTime(eventStartTime);
    setEndTime(eventEndTime);
    console.log("start time: ", eventStartTime)
    console.log("end time: ", eventEndTime)
    fetLocation(record.eventId);
    fetTopic(record.eventId)
    setUpdateEventModal(true)
  }

  async function fetLocation(eventId) {
    try {
      await axios.get(`https://hcmc.herokuapp.com/api/location/${eventId}`,
        { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
      ).then(res => {
        console.log(res)
        const tableData = res.data.map(event => ({
          ...event
        }))
        const tableData1 = res.data.map(event => event.locationName)
        const tableData2 = res.data.map(event => event.locationId)
        setLocationData(tableData)
        setLocationName(tableData1[0])
        setLocationId(tableData2[0])
      }).catch(error => {
        console.log(error)
      })
    } catch (e) {
      console.log(e)
    }
  }

  async function fetTopic(eventId) {
    try {
      await axios.get(`https://hcmc.herokuapp.com/api/topic/${eventId}`,
        { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
      ).then(res => {
        console.log(res)
        const tableData = res.data.map(event => ({
          ...event
        }))
        const tableData1 = res.data.map(event => event.topicName)
        const tableData2 = res.data.map(event => event.topicId)
        setTopicName(tableData1[0])
        setTopicId(tableData2[0])
      }).catch(error => {
        console.log(error)
      })
    } catch (e) {
      console.log(e)
    }
  }

  const dataLocation = [];
  location.forEach(element => {
    dataLocation.push(<Option key={element.locationId}>{element.locationName}</Option>);
  });

  const dataTopic = [];
  topicData.forEach(element => {
    dataTopic.push(<Option key={element.topicId}>{element.topicName}</Option>);
  });

  const format = 'YYYY-MM-DD HH:mm';

  const config = {
    rules: [
      {
        type: 'object',
        required: true,
        message: 'Please select time!',
      },
    ],
  };

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
        <Menu theme="dark" mode="inline" >
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
            <Button onClick={showCreateEventModal} type="primary" style={{ color: 'blue', marginBottom: '20px', marginLeft: '0', paddingRight: 30 }} size={"large"}>
              <Row><PlusOutlined style={{ color: 'white', paddingRight: 5 }} /><Text style={{ color: 'white' }}>Create New Event</Text></Row>
            </Button>
            <Modal
              title="Create New Event"
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
                  name="eventStartDate"
                  {...config}
                // rules={[{
                //   validator: async (rule, value) => {
                //     if (value === undefined || value === "" || value === null) {
                //       throw new Error('Something wrong!');
                //     }
                //   }
                //   , message: 'You cannot change to this event status',
                // }]}
                >
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
                <Form.Item
                  name="topic"
                >
                  <Select
                    placeholder="Please select topic"
                    style={{ width: '100%' }}
                  >
                    {dataTopic}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="location"
                >
                  <Select
                    placeholder="Please select location"
                    style={{ width: '100%' }}
                  >
                    {dataLocation}
                  </Select>
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
                      eventModalContent.image ? <img src={eventModalContent.image} style={{ width: '100%' }} alt={eventModalContent.image} /> :
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
              title="Update Event"
              visible={updateEventModal}
              width={900}
              onCancel={() => {
                setUpdateEventModal(false)
              }}
              footer={[
                <Button
                  key="submit"
                  form="eventForm"
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
                  id="eventForm"
                  name="eventForm"
                  form={eventForm}
                  onFinish={onEventUpdateFormFinish}
                  onFinishFailed={(e) => console.log(e)}
                >
                  <Form.Item
                    name="eventTitle"
                    rules={[{ required: true, message: 'This field is required!' }]}
                    initialValue={eventModalContent.eventTitle}>
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Event Title" />
                  </Form.Item>
                  <Form.Item
                    name="organizers"
                    rules={[{ required: true, message: 'This field is required!' }]}
                    initialValue={eventModalContent.organizers}>
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Organizer" />
                  </Form.Item>
                  <Form.Item
                    name="eventDesc"
                    rules={[{ required: true, message: 'This field is required!' }]}
                    initialValue={eventModalContent.eventDesc}>
                    <TextArea
                      style={{ width: '100%' }}
                      rows={4}
                      placeholder="Event Description" >
                    </TextArea>
                  </Form.Item>
                  <Form.Item>
                    <DatePicker disabled showTime value={moment(startTime, format)} placeholder="Start Date" style={{ width: "100%", }} format={format} onOk={onOkStartTime} />
                  </Form.Item>
                  <Form.Item>
                    <DatePicker disabled showTime value={moment(endTime, format)} placeholder="End Date" style={{ width: "100%", }} format={format} onOk={onOkEndTime} />
                  </Form.Item>
                  <Form.Item>
                    <Input
                      style={{ width: '100%' }}
                      value={locationName}
                      rows={4}
                      disabled />
                  </Form.Item>
                  <Form.Item>
                    <Input
                      style={{ width: '100%' }}
                      value={topicName}
                      rows={4}
                      disabled />
                  </Form.Item>
                  <Form.Item
                    name="eventStatus"
                    rules={[{
                      validator: async (rule, value) => {
                        console.log(value)
                        console.log(eventModalContent.eventStatus)
                        if (eventModalContent.eventStatus === "1" && value === "4") {
                          throw new Error('Something wrong!');
                        }
                        if (eventModalContent.eventStatus === "2" && value == "5") {
                          throw new Error('Something wrong!');
                        }
                        if (eventModalContent.eventStatus === "3" && value !== "5" && value !== "3") {
                          throw new Error('Something wrong!');
                        }
                        if (eventModalContent.eventStatus === "4" && value !== "4") {
                          throw new Error('Something wrong!');
                        }
                        if (eventModalContent.eventStatus === "5" && value !== "5") {
                          throw new Error('Something wrong!');
                        }
                      }
                      , message: 'You cannot change to this event status',
                    }]}
                    initialValue={eventModalContent.eventStatus}>
                    <Select
                      placeholder="Event Status"
                      onChange={onChangeEventStatus}
                      style={{ width: "100%", }}>
                      <Select.Option value="1">Scheduled</Select.Option>
                      <Select.Option value="2">On-hold</Select.Option>
                      <Select.Option value="3">In-Progress</Select.Option>
                      <Select.Option value="4">Canceled</Select.Option>
                      <Select.Option value="5">Completed</Select.Option>
                    </Select>
                  </Form.Item>
                  <h3>Event Image</h3>
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
                    action={uploadEventImg}
                    beforeUpload={beforeUpload}
                    onChange={handleBlogImageChange}
                  >
                    {
                      eventModalContent.eventCoverImage ? <img src={eventModalContent.eventCoverImage} style={{ width: '100%' }} alt={eventModalContent.eventCoverImage} /> :
                        <div>

                          <div style={{ marginTop: 20 }}>
                            <img src={eventModalContent.eventCoverImage} style={{ width: '100%' }} />
                          </div>
                        </div>
                    }
                  </Upload>
                </Form>
              </div>
            </Modal>

            <Table columns={columns} dataSource={eventData} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>HCMC Expat Assitant ©2021</Footer>
      </Layout>
    </Layout>
  )
}
