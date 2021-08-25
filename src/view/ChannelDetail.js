import React, { useState, useEffect } from 'react'
import { Layout, Menu } from 'antd';
import { Table, Tag, Space, Image, Typography, Form, message, Button, Modal, Input, Upload, Row, Affix, Dropdown } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import padLeft from 'pad-left';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom'
import { storage } from '../firebase/FirebaseUtil'
import '../dist/css/homepage.css'
import TextArea from 'antd/lib/input/TextArea';

const { Header, Content, Footer, Sider } = Layout;
const Text = Typography
const { SubMenu } = Menu;

export default function ChannelDetail() {
  const [blogData, setBlogData] = useState([]);
  const [channelData, setChannelData] = useState({});
  const [category, setCategory] = useState({})
  const [blogCreateModalVisible, setBlogCreateModalVisible] = useState(false);
  const [blogUpdateModalVisible, setBlogUpdateModalVisible] = useState(false);
  const [blogModalContent, setBlogModalContent] = useState({});
  const [blogContentData, setBlogContentData] = useState();
  const [top, setTop] = useState(0);


  const [blogForm] = Form.useForm()

  const channelId = window.location.pathname.split('/').reverse()[0]
  const token = localStorage.getItem('token')
  const id = localStorage.getItem('adminId')

  const columns = [
    {
      title: 'ID',
      dataIndex: 'blogId',
      key: 'blogId',
    },
    {
      title: 'Channel',
      dataIndex: 'Channel',
      render: () => (
        <Text>{channelData.channelName}</Text>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      render: () => (
        <Text>{category.categoryName}</Text>
      ),
    },
    {
      title: 'Create By',
      dataIndex: 'createBy',
      key: 'createBy',
    },
    {
      title: 'Blog Title',
      dataIndex: 'blogTitle',
      key: 'blogTitle',
    },

    {
      title: 'Cover Image',
      dataIndex: 'cover_link',
      key: 'cover_link',
      render: image => <Image
        width={150}
        src={image}
      />
    },
    {
      title: 'Create Date',
      dataIndex: 'createDate',
      key: 'createDate',
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
      title: 'Action',
      key: 'action',
      render: (record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => onOpenBlogUpdateModal(record)}>Update</Button>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    async function fetchBlog() {
      try {
        await axios.get(`https://hcmc.herokuapp.com/api/blogs/channel?channelId=${channelId}&page=0&size=100&sortBy=blogId`,
          { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
        ).then(res => {
          console.log(res)
          const tableData = res.data.listBlog.map(blog => ({
            ...blog,
          }))
          const channelData = res.data.listBlog[0].channel
          const category = res.data.listBlog[0].category
          setCategory(category)
          setBlogData(tableData)
          setChannelData(channelData)
          setBlogModalContent({
            ...blogModalContent,
            category: {
              categoryId: category.categoryId
            },
            channel: {
              channelId: channelId
            },
            priority: 1,
            createBy: id,
          })
        }).catch(error => {
          console.log(error)
        })
      } catch (e) {
        console.log(e)
      }
    }
    fetchBlog();

  }, []);

  function onOpenBlogUpdateModal(record) {
    console.log(record)
    blogForm.setFieldsValue(record)
    setBlogModalContent(record)
    if (blogModalContent.blogContent !== undefined) {
      const blogContent = setBlogContent();
      setBlogContentData(blogContent)
    }
    setBlogUpdateModalVisible(true);

  }

  function setBlogContent() {
    var blogContent = ''
    blogContent = blogModalContent.blogContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
    blogContent = blogModalContent.blogContent.replace('<p>', '');
    blogContent = blogContent.replace('</p>', '');
    blogContent = blogContent.replace(/<br\s*[\/]?>/gi, "\n")
    return blogContent
  }

  function showBlogModal() {
    setBlogCreateModalVisible(true);

  }

  function handleBlogCancel() {
    setBlogCreateModalVisible(false)
  }

  function handleBlogUpdateCancel() {
    setBlogUpdateModalVisible(false)
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

  const uploadBlogImg = async (file) => {
    let identify = file.name + '__' + Date.now();
    let cover_link;
    await storage.ref(`image/Blog/${identify}`).put(file);
    await storage.ref(`image/Blog`).child(identify).getDownloadURL().then(url => {
      cover_link = url;
    })
    setBlogModalContent({
      ...blogModalContent,
      cover_link: cover_link
    })
    return cover_link
  }

  const handleBlogImageChange = info => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, cover_link => {
        setBlogModalContent({
          ...blogModalContent,
          cover_link: cover_link
        })
      }
      );
    }
  }


  function onBlogFormFinish(values) {


    var currentdate = new Date();
    const month = padLeft(currentdate.getMonth() + 1, 2, '0')
    const date = padLeft(currentdate.getDate(), 2, '0')
    const hour = padLeft(currentdate.getHours(), 2, '0')
    const minute = padLeft(currentdate.getMinutes(), 2, '0')
    const second = padLeft(currentdate.getSeconds(), 2, '0')
    var createDate = currentdate.getFullYear() + "-"
      + month + "-"
      + date + "T" + hour + ":"
      + minute + ":"
      + second;
    const preparedData = {
      ...blogModalContent,
      ...values,
      ...{ createDate }
    }
    console.log(preparedData)
    var blogContent = values.blogContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
    var blogContents = "<p>" + blogContent + "</p>"
    async function createBlog() {
      try {
        const result = await axios.post(`https://hcmc.herokuapp.com/api/blogs/create`, {
          "blogContent": blogContents,
          "blogTitle": values.blogTitle,
          "category": {
            "categoryId": category.categoryId,
          },
          "channel": {
            "channelId": channelId,
          },
          "cover_link": preparedData.cover_link,
          "createBy": id,
          "createDate": createDate,
          "priority": 1,
        }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        console.log(result)
        if (result.status === 200 || result.status === 201) {
          await axios.get(`https://hcmc.herokuapp.com/api/blogs/channel?channelId=${channelId}&page=0&size=100&sortBy=blogId`,
            { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
          ).then(res => {
            console.log(res)
            const tableData = res.data.listBlog.map(blog => ({
              ...blog,
            }))
            const channelData = res.data.listBlog[0].channel
            const category = res.data.listBlog[0].category
            setCategory(category)
            setBlogData(tableData)
            setChannelData(channelData)
            setBlogModalContent({
              ...blogModalContent,
              category: {
                categoryId: category.categoryId
              },
              channel: {
                channelId: channelId
              },
              priority: 1,
              createBy: id,
            })
          }).catch(error => {
            console.log(error)
          })
          console.log("success")
          setBlogCreateModalVisible(false)
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
      ...blogModalContent,
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
    console.log(preparedData)
    async function createBlog() {
      try {
        const result = await axios.put(`https://hcmc.herokuapp.com/api/blogs/update`, {
          "blogContent": blogContents,
          "blogTitle": values.blogTitle,
          "blogId": preparedData.blogId,
          "category": {
            "categoryId": category.categoryId,
          },
          "channel": {
            "channelId": channelId,
          },
          "cover_link": preparedData.cover_link,
          "createBy": id,
          "createDate": datetime,
          "priority": 1,
        }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        console.log(result)
        if (result.status === 200 || result.status === 201) {
          await axios.get(`https://hcmc.herokuapp.com/api/blogs/channel?channelId=${channelId}&page=0&size=100&sortBy=blogId`,
            { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } },
          ).then(res => {
            console.log(res)
            const tableData = res.data.listBlog.map(blog => ({
              ...blog,
            }))
            const channelData = res.data.listBlog[0].channel
            const category = res.data.listBlog[0].category
            setCategory(category)
            setBlogData(tableData)
            setChannelData(channelData)
          }).catch(error => {
            console.log(error)
          })
          console.log("success")
          setBlogUpdateModalVisible(false)
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

  console.log(blogContentData)

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
            <Button onClick={showBlogModal} type="primary" style={{ color: 'blue', marginBottom: '20px', marginLeft: '0', paddingRight: 30 }} size={"large"}>
              <Row><PlusOutlined style={{ color: 'white', paddingRight: 5 }} /><Text style={{ color: 'white' }}>Create New Blog</Text></Row>
            </Button>

            <Modal
              title="Create New Blog"
              width={1000}
              visible={blogCreateModalVisible}
              footer={[
                <Button
                  default
                  onClick={handleBlogCancel}
                >
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  form="blogForm"
                  type="primary"
                  htmlType="submit"
                >
                  Submit
                </Button>,
              ]}>
              <Form
                id="blogForm"
                name="blogForm"
                form={blogForm}
                onFinish={onBlogFormFinish}
                onFinishFailed={(e) => console.log(e)}>
                <Form.Item
                  name="blogTitle"
                  rules={[{ required: true, message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Blog Title" />
                  </div>
                </Form.Item>
                <Form.Item
                  name="blogContent"
                  rules={[{ required: true, message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <TextArea
                      style={{ width: '100%' }}
                      rows={4}
                      placeholder="Blog Content" >
                    </TextArea>
                  </div>
                </Form.Item>
                <Form.Item
                  name="channel"
                  rules={[{ message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <Input
                      style={{ width: '100%' }}
                      value={channelId}
                      rows={4}
                      disabled />
                  </div>
                </Form.Item>
                <div style={{ width: '100%', paddingBottom: 20 }}>
                  <h3>Image</h3>
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    action={uploadBlogImg}
                    beforeUpload={beforeUpload}
                    onChange={handleBlogImageChange}
                  >
                    {
                      blogModalContent.cover_link ? <img src={blogModalContent.cover_link} style={{ width: '100%' }} alt={blogModalContent.cover_link} /> :
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
              title="Update Blog"
              width={1000}
              visible={blogUpdateModalVisible}
              footer={[
                <Button
                  default
                  onClick={handleBlogUpdateCancel}
                >
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  form="blogForm"
                  type="primary"
                  htmlType="submit"
                >
                  Submit
                </Button>,
              ]}>
              <Form
                id="blogForm"
                name="blogForm"
                form={blogForm}
                onFinish={onBlogUpdateFormFinish}
                onFinishFailed={(e) => console.log(e)}>
                <Form.Item
                  name="blogTitle"
                  rules={[{ required: true, message: 'This field is required!' }]}
                  initialValue={blogModalContent.blogTitle}>
                  <Input
                    style={{ width: '100%' }}
                    placeholder="Blog Title" />
                </Form.Item>
                <Form.Item
                  name="blogContent"
                  rules={[{ required: true, message: 'This field is required!' }]}
                  initialValue={blogModalContent.blogContent}>
                  <TextArea
                    style={{ width: '100%' }}
                    rows={14}
                    placeholder="Blog Content" >
                  </TextArea>
                </Form.Item>
                <Form.Item
                  name="channelId"
                  initialValue={channelId}>
                  <Input
                    style={{ width: '100%' }}
                    value={channelId}
                    rows={4}
                    disabled />
                </Form.Item>
                <div style={{ width: '100%', paddingBottom: 20 }}>
                  <h3>Image</h3>
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    action={uploadBlogImg}
                    beforeUpload={beforeUpload}
                    onChange={handleBlogImageChange}
                  >
                    {
                      blogModalContent.cover_link ? <img src={blogModalContent.cover_link} style={{ width: '100%' }} alt={blogModalContent.cover_link} /> :
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    }
                  </Upload>
                </div>
              </Form>
            </Modal>



            <Table columns={columns} dataSource={blogData} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>HCMC Expat Assitant ©2021</Footer>
      </Layout>
    </Layout>
  )
}
