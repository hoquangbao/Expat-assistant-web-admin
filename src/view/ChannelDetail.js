import React, { useState, useEffect } from 'react'
import { Layout, Menu } from 'antd';
import { Table, Tag, Space, Image, Typography, Form, message, Button, Modal, Input, Upload, Row } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, PlusOutlined } from '@ant-design/icons';
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

  const [blogForm] = Form.useForm()

  const channelId = window.location.pathname.split('/').reverse()[0]
  const token = localStorage.getItem('token')
  const id = localStorage.getItem('id')

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
        }).catch(error => {
          console.log(error)
        })
      } catch (e) {
        console.log(e)
      }
    }
    fetchBlog();
  }, []);

  const onOpenBlogUpdateModal = (record) => {
    console.log(record)
    blogForm.setFieldsValue(record)
    setBlogModalContent(record)
    var blogContent = blogModalContent.blogContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
    var blogContent = blogModalContent.blogContent.replace('<p>', '');
    blogContent = blogContent.replace('</p>', '');
    blogContent = blogContent.replace(/<br\s*[\/]?>/gi, "\n")
    setBlogContentData(blogContent)
    setBlogUpdateModalVisible(true);
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
          "createDate": datetime,
          "priority": 1,
        }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
        )
        console.log(result)
        if (result.status === 200) {
          setBlogData(blogData.map(row => {
            if (row.id === blogData.id) {
              return {
                ...row,
                ...values
              }
            }
            return row;
          }))
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
    console.log(values.blogTitle)
    async function createBlog() {
      // try {
      //   const result = await axios.post(`https://hcmc.herokuapp.com/api/blogs/create`, {
      //     "blogContent": blogContents,
      //     "blogTitle": values.blogTitle,
      //     "category": {
      //       "categoryId": category.categoryId,
      //     },
      //     "channel": {
      //       "channelId": channelId,
      //     },
      //     "cover_link": preparedData.cover_link,
      //     "createBy": id,
      //     "createDate": datetime,
      //     "priority": 1,
      //   }, { headers: { "content-type": "application/json", "Authorization": `Bearer ${token}` } }
      //   )
      //   console.log(result)
      //   if (result.status === 200) {
      //     setBlogData(blogData.map(row => {
      //       if (row.id === blogData.id) {
      //         return {
      //           ...row,
      //           ...values
      //         }
      //       }
      //       return row;
      //     }))
      //     console.log("success")
      //     setBlogCreateModalVisible(false)
      //   } else {
      //     message.error({
      //       content: 'Something went wrong!',
      //       style: {
      //         position: 'fixed',
      //         bottom: '10px',
      //         left: '50%'
      //       }
      //     })
      //   }
      // } catch (e) {
      //   console.log(e)
      // }
    }
    createBlog();
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
            <Button onClick={showBlogModal} type="primary" style={{ color: 'blue', marginBottom: '20px', marginLeft: '0', paddingRight: 30 }} size={"large"}>
              <Row><PlusOutlined style={{ color: 'white', paddingRight: 5 }} /><Text style={{ color: 'white' }}>Create New Blog</Text></Row>
            </Button>

            <Modal
              title="Create New Blog"
              style={{ width: 700 }}
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
              style={{ width: 700 }}
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
                  rules={[{ required: true, message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <Input
                      style={{ width: '100%' }}
                      value={blogModalContent.blogTitle}
                      placeholder="Blog Title" />
                  </div>
                </Form.Item>
                <Form.Item
                  name="blogContent"
                  rules={[{ required: true, message: 'This field is required!' }]}>
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <TextArea
                      style={{ width: '100%' }}
                      value={blogContentData}
                      rows={4}
                      placeholder="Blog Content" >
                    </TextArea>
                  </div>
                </Form.Item>
                <Form.Item
                  name="channel">
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



            <Table columns={columns} dataSource={blogData} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>HCMC Expat Assitant ©2021</Footer>
      </Layout>
    </Layout>
  )
}
