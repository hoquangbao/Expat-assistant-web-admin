import React, { useEffect, useState } from 'react'
import { Layout, Menu, Button, Typography, Row, Modal, Form, Input, Upload, message, TimePicker, Select, Tabs, Affix, Dropdown } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { Table, Tag, Space, Image } from 'antd';
import { Link } from 'react-router-dom'
import axios from 'axios';
import '../dist/css/homepage.css'
import { storage } from '../firebase/FirebaseUtil';
import padLeft from 'pad-left';
import moment from 'moment';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;
const Text = Typography
const { TabPane } = Tabs;

export default function Location() {
  const [locationData, setLocationData] = useState([]);
  const [locationType, setLocationType] = useState([])
  const [locationType1, setLocationType1] = useState()
  const [channelModalContent, setChannelModalContent] = useState({})
  const [updateModalContent, setUpdateModalContent] = useState({})
  const [createConversationModalVisible, setConversationCreateModalVisible] = useState(false);
  const [createLocationModalVisible, setLocationCreateModalVisible] = useState(false);
  const [closeTime, setCloseTime] = useState();
  const [openTime, setOpenTime] = useState()
  const [channelUpdateModalVisible, setChannelUpdateModalVisible] = useState(false);
  const [locationUpdateModalVisible, setLocationUpdateModalVisible] = useState(false);
  const [top, setTop] = useState(0);


  const [channelForm] = Form.useForm()
  const [locationForm] = Form.useForm()

  const token = localStorage.getItem('token')
  console.log(locationType)
  const { Option } = Select


  const columnsType = [
    {
      title: 'ID',
      dataIndex: 'typeId',
      key: 'typeId',
    },

    {
      title: 'Location Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Action',
      key: 'action',
      render: (record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => onOpenLocationUpdateModal(record)}>Update</Button>
        </Space>
      ),
    },
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'locationId',
      key: 'locationId',
    },
    {
      title: 'Location Name',
      dataIndex: 'locationName',
      key: 'locationName',
    },
    {
      title: 'Location Address',
      dataIndex: 'locationAddress',
      key: 'locationAddress',
    },
    {
      title: 'Location Latitude',
      dataIndex: 'locationLatitude',
      key: 'locationLatitude',
    },
    {
      title: 'Location Longitude',
      dataIndex: 'locationLongitude',
      key: 'locationLongitude',
    },
    {
      title: 'Location Image',
      dataIndex: 'locationImageLink',
      key: 'locationImageLink',
      render: image => <Image
        width={150}
        src={image}
      />
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
      locationImageLink: eventCoverImage
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
        await axios.get('https://hcmc.herokuapp.com/api/location/location',
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
        ).then(res => {
          console.log(res)
          const tableData = res.data.map(location => ({
            ...location
          }))

          setLocationData(tableData)
        }).catch(error => {
          console.log(error)
        })
      } catch (e) {
        console.log(e)
      }
    }
    fetchLessons();
    async function fetchLocationType() {
      try {
        await axios.get('https://hcmc.herokuapp.com/api/location/type',
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
        ).then(res => {
          console.log(res)
          const tableData = res.data.map(location => ({
            ...location
          }))

          setLocationType(tableData)
        }).catch(error => {
          console.log(error)
        })
      } catch (e) {
        console.log(e)
      }
    }
    fetchLocationType();
  }, [])

  console.log(channelModalContent)

  function onChannelCreateFormFinish(values) {
    const preparedData = {
      ...channelModalContent,
      ...values,
      ...{ closeTime },
      ...{ openTime }
    }
    console.log(preparedData)
    async function createBlog() {
      try {
        const result = await axios.post(`https://hcmc.herokuapp.com/api/location/create`, {
          "close_time": preparedData.closeTime,
          "locationAddress": preparedData.locationAddress,
          "locationImageLink": preparedData.image,
          "locationLatitude": preparedData.locationLatitude,
          "locationLongitude": preparedData.locationLongitude,
          "locationName": preparedData.locationName,
          "locationType": {
            "typeId": preparedData.locationType1
          },
          "open_time": preparedData.openTime
        }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        console.log(result)
        if (result.status === 200) {
          await axios.get('https://hcmc.herokuapp.com/api/location/location',
            { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
          ).then(res => {
            console.log(res)
            const tableData = res.data.map(location => ({
              ...location
            }))
            res.data.map(location => {
              setLocationType(locationType => [...locationType, location.locationType.type])
            })

            setLocationData(tableData)
          }).catch(error => {
            console.log(error)
          })
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

  function onLocationCreateFormFinish(values) {
    console.log(values)
    async function createBlog() {
      try {
        const result = await axios.post(`https://hcmc.herokuapp.com/api/location/create-type`, {
          "type": values.type
        }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        console.log(result)
        if (result.status === 200) {
          await axios.get('https://hcmc.herokuapp.com/api/location/type',
            { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
          ).then(res => {
            console.log(res)
            const tableData = res.data.map(location => ({
              ...location
            }))

            setLocationType(tableData)
            setLocationCreateModalVisible(false)
          }).catch(error => {
            console.log(error)
          })
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
      ...{ closeTime },
      ...{ openTime }
    }
    console.log(preparedData)
    async function createBlog() {
      try {
        const result = await axios.put(`https://hcmc.herokuapp.com/api/location/edit`, {
          "close_time": preparedData.closeTime,
          "locationAddress": preparedData.locationAddress,
          "locationId": preparedData.locationId,
          "locationImageLink": preparedData.locationImageLink,
          "locationLatitude": preparedData.locationLatitude,
          "locationLongitude": preparedData.locationLongitude,
          "locationName": preparedData.locationName,
          "locationType": {
            "typeId": preparedData.locationType.typeId,
          },
          "open_time": preparedData.openTime
        },
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        if (result.status === 200 || result.status === 201) {
          await axios.get('https://hcmc.herokuapp.com/api/location/location',
            { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
          ).then(res => {
            console.log(res)
            const tableData = res.data.map(location => ({
              ...location
            }))

            setLocationData(tableData)
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

  const onLocationUpdateFormFinish = values => {
    const preparedData = {
      ...updateModalContent,
      ...values,
    }
    console.log(preparedData)
    async function createBlog() {
      try {
        const result = await axios.put(`https://hcmc.herokuapp.com/api/location/edit-type`, {
          "typeId": preparedData.typeId,
          "type": preparedData.type
        },
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        if (result.status === 200 || result.status === 201) {
          await axios.get('https://hcmc.herokuapp.com/api/location/type',
            { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
          ).then(res => {
            console.log(res)
            const tableData = res.data.map(location => ({
              ...location
            }))
            setLocationType(tableData)
            setLocationCreateModalVisible(false)
          }).catch(error => {
            console.log(error)
          })
          console.log("success")
          setLocationUpdateModalVisible(false)
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

  const showConversationModal = () => {
    setConversationCreateModalVisible(true);
  };

  const handleConversationCancel = () => {
    setConversationCreateModalVisible(false);
  };

  const showLocationModal = () => {
    setLocationCreateModalVisible(true);
  };

  const handleLocationCancel = () => {
    setLocationCreateModalVisible(false);
    setLocationUpdateModalVisible(false)
  };

  function onOkCloseTime(values) {
    const closeTime = values.format('YYYY-MM-DDTHH:mm:ss');
    setCloseTime(closeTime);
  }

  function onOkOpenTime(values) {
    const openTime = values.format('YYYY-MM-DDTHH:mm:ss');
    setOpenTime(openTime);
  }

  const onOpenBlogUpdateModal = (record) => {
    console.log(record)
    const startTime = record.open_time;
    const monthStart = padLeft(startTime[1], 2, '0')
    const dateStart = padLeft(startTime[2], 2, '0')
    const hourStart = padLeft(startTime[3], 2, '0')
    const minuteStart = padLeft(startTime[4], 2, '0')
    var eventStartTime = startTime[0] + "-" + monthStart + "-" + dateStart + "T" + hourStart + ":" + minuteStart
    const endtime = record.close_time;
    const monthEnd = padLeft(endtime[1], 2, '0')
    const dateEnd = padLeft(endtime[2], 2, '0')
    const hourEnd = padLeft(endtime[3], 2, '0')
    const minuteEnd = padLeft(endtime[4], 2, '0')
    var eventEndTime = endtime[0] + "-" + monthEnd + "-" + dateEnd + "T" + hourEnd + ":" + minuteEnd
    setOpenTime(eventStartTime);
    setCloseTime(eventEndTime);
    channelForm.setFieldsValue(record)
    setChannelModalContent(record)
    setLocationType1(record.locationType.type)
    setChannelUpdateModalVisible(true);
  }

  const onOpenLocationUpdateModal = (record) => {
    console.log(record)
    locationForm.setFieldsValue(record)
    setUpdateModalContent(record)
    setLocationUpdateModalVisible(true);
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

  const format = 'HH:mm';

  const locationTypes = [];
  locationType.forEach(element => {
    locationTypes.push(<Option key={element.typeId}>{element.type}</Option>);
  });

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
              <TabPane tab="Location" key="1">
                <Button onClick={showConversationModal} type="primary" style={{ color: 'blue', marginLeft: '0', paddingRight: 30 }} size={"large"}>
                  <Row><PlusOutlined style={{ color: 'white', paddingRight: 5 }} /><Text style={{ color: 'white' }}>Create New Location</Text></Row>
                </Button>
                <Modal
                  title="Create New Location"
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
                      name="locationAddress"
                      rules={[{ required: true, message: 'This field is required!' }]}>
                      <div style={{ width: '100%', paddingBottom: 20 }}>
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Location Address" />
                      </div>
                    </Form.Item>
                    <Form.Item
                      name="locationLatitude"
                      rules={[{ required: true, message: 'This field is required!' }]}
                    >
                      <div style={{ width: '100%', paddingBottom: 20 }}>
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Location Latitude" />
                      </div>
                    </Form.Item>
                    <Form.Item
                      name="locationLongitude"
                      rules={[{ required: true, message: 'This field is required!' }]}
                    >
                      <div style={{ width: '100%', paddingBottom: 20 }}>
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Location Longitude" />
                      </div>
                    </Form.Item>
                    <Form.Item
                      name="locationName"
                      rules={[{ required: true, message: 'This field is required!' }]}
                    >
                      <div style={{ width: '100%', paddingBottom: 20 }}>
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Location Name" />
                      </div>
                    </Form.Item>
                    <Form.Item
                      name="locationType1"
                      rules={[{ required: true, message: 'This field is required!' }]}
                    >
                      <Select
                        placeholder="Please select location type"
                        style={{ width: '100%' }}
                      >
                        {locationTypes}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="open_time">
                      <div style={{ width: "100%", paddingBottom: 20 }}>
                        <TimePicker style={{ width: "100%", }} format={format} onOk={onOkOpenTime} placeholder="Open Time" />
                      </div>
                    </Form.Item>
                    <Form.Item
                      name="close_time">
                      <div style={{ width: "100%", paddingBottom: 20 }}>
                        <TimePicker style={{ width: "100%", }} format={format} onOk={onOkCloseTime} placeholder="Close Time" />
                      </div>
                    </Form.Item>
                    <div style={{ width: '100%', paddingBottom: 20 }}>
                      <h3>Location Image</h3>
                      <Upload
                        listType="picture-card"
                        showUploadList={false}
                        action={uploadEventImg}
                        beforeUpload={beforeUpload}
                        onChange={handleBlogImageChange}
                      >
                        {
                          channelModalContent.locationImageLink ? <img src={channelModalContent.locationImageLink} style={{ width: '100%' }} alt={channelModalContent.locationImageLink} /> :
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
                  title="Update Location"
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
                      <Form.Item
                        name="locationAddress"
                        rules={[{ required: true, message: 'This field is required!' }]}>
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Location Address" />
                      </Form.Item>
                      <Form.Item
                        name="locationLatitude"
                        rules={[{ required: true, message: 'This field is required!' }]}
                      >
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Location Latitude" />
                      </Form.Item>
                      <Form.Item
                        name="locationLongitude"
                        rules={[{ required: true, message: 'This field is required!' }]}
                      >
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Location Longitude" />
                      </Form.Item>
                      <Form.Item
                        name="locationName"
                        rules={[{ required: true, message: 'This field is required!' }]}
                      >
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Location Name" />
                      </Form.Item>
                      {/* <Form.Item
                        rules={[{ required: true, message: 'This field is required!' }]}
                      >
                        <Select
                          placeholder="Please select location type"
                          style={{ width: '100%' }}
                        >
                          {locationTypes}
                        </Select>
                      </Form.Item> */}
                      <div style={{ width: '100%', paddingBottom: 20 }}>
                        <h3>Location Image</h3>
                        <Upload
                          listType="picture-card"
                          showUploadList={false}
                          action={uploadEventImg}
                          beforeUpload={beforeUpload}
                          onChange={handleBlogImageChange}
                        >
                          {
                            channelModalContent.locationImageLink ? <img src={channelModalContent.locationImageLink} style={{ width: '100%' }} alt={channelModalContent.locationImageLink} /> :
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

                <Table columns={columns} dataSource={locationData} />
              </TabPane>
              <TabPane tab="Location Type" key="2">
                <Button onClick={showLocationModal} type="primary" style={{ color: 'blue', marginLeft: '0', paddingRight: 30 }} size={"large"}>
                  <Row><PlusOutlined style={{ color: 'white', paddingRight: 5 }} /><Text style={{ color: 'white' }}>Create Location Type</Text></Row>
                </Button>
                <Modal
                  title="Create New Location"
                  style={{ width: 700 }}
                  visible={createLocationModalVisible}
                  footer={[
                    <Button
                      default
                      onClick={handleLocationCancel}
                    >
                      Cancel
                    </Button>,
                    <Button
                      key="submit"
                      form="locationForm"
                      type="primary"
                      htmlType="submit"
                    >
                      Submit
                    </Button>,
                  ]}>
                  <Form
                    id="locationForm"
                    name="locationForm"
                    form={locationForm}
                    onFinish={onLocationCreateFormFinish}
                    onFinishFailed={(e) => console.log(e)}>
                    <Form.Item
                      name="type"
                      rules={[{ required: true, message: 'This field is required!' }]}
                    >
                      <div style={{ width: '100%', paddingBottom: 20 }}>
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Location Type" />
                      </div>
                    </Form.Item>
                  </Form>
                </Modal>
                <Modal
                  title="Update Location"
                  visible={locationUpdateModalVisible}
                  width={900}
                  onCancel={() => {
                    setLocationCreateModalVisible(false)
                  }}
                  footer={[
                    <Button
                      default
                      onClick={handleLocationCancel}
                    >
                      Cancel
                    </Button>,
                    <Button
                      key="submit"
                      form="locationForm"
                      htmlType="submit"
                      type="primary"
                    >
                      Submit
                    </Button>
                  ]}
                >
                  <div
                    style={{ maxHeight: '60vh', overflowY: 'auto' }}
                  >
                    <Form
                      id="locationForm"
                      name="locationForm"
                      form={locationForm}
                      onFinish={onLocationUpdateFormFinish}
                      onFinishFailed={(e) => console.log(e)}
                    >
                      <Form.Item
                        name="type"
                        rules={[{ required: true, message: 'This field is required!' }]}
                      >
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Location Type" />
                      </Form.Item>
                    </Form>
                  </div>
                </Modal>
                <Table columns={columnsType} dataSource={locationType} />
              </TabPane>
            </Tabs>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>HCMC Expat Assitant ©2021</Footer>
      </Layout>
    </Layout>
  )
}
