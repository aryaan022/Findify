<div align="center">

# Findify

### Discover Local Businesses • Connect with Communities • Support Local Economy

[![Live Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)](https://findify.live)
[![Website](https://img.shields.io/badge/Website-findify.live-blue?style=for-the-badge)](https://findify.live)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Visitors](https://komarev.com/ghpvc/?username=aryaan022&repo=Findify&style=for-the-badge&color=blue)](https://github.com/aryaan022/Findify)

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:36D1DC,100:5B86E5&height=200&section=header&text=Findify&fontSize=60&fontColor=fff&animation=twinkling&fontAlignY=35" alt="Findify Banner" width="100%" />

</div>

---

## Table of Contents
- [About](#-about-findify)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌍 About Findify

**Findify** is a modern full-stack web application designed to help users discover, review, and connect with local businesses in their area. Built with a focus on community engagement and supporting local economies, Findify provides an intuitive platform for both consumers and business owners.

**🌐 Live Site:** [findify.live](https://findify.live)

## ✨ Features

### For Users
- **📍 Location-Based Discovery**: Find businesses near you using geolocation and map integration
- **⭐ Reviews & Ratings**: Share your experiences and read authentic reviews from other users
- **❤️ Favorites Management**: Save your favorite businesses for quick access
- **🔍 Advanced Search**: Filter businesses by category, rating, distance, and more
- **📱 Responsive Design**: Seamless experience across desktop, tablet, and mobile devices

### For Business Owners
- **🏪 Business Listings**: Create and manage comprehensive business profiles
- **📊 Analytics Dashboard**: Track views, reviews, and customer engagement
- **📧 Customer Communication**: Connect directly with your customers
- **💼 Premium Features**: Enhanced visibility and promotional tools

### Security & Performance
- **🔐 Secure Authentication**: User accounts protected with Passport.js and session management
- **🗺️ Interactive Maps**: Powered by Mapbox for accurate location services
- **☁️ Cloud Storage**: Images and media handled by Cloudinary
- **📧 Email Integration**: Automated notifications via Resend API

---

## 🛠️ Tech Stack

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-8BC0D0?style=for-the-badge&logo=ejs&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)
![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?style=for-the-badge&logo=passport&logoColor=black)
![Cloudinary](https://img.shields.io/badge/Cloudinary-FFCA28?style=for-the-badge&logo=cloudinary&logoColor=black)

</div>

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware

### Frontend
- **EJS** - Embedded JavaScript templating
- **Bootstrap** - CSS framework for responsive design
- **Mapbox** - Interactive maps and geolocation services

### Additional Services
- **Cloudinary** - Cloud-based image and video management
- **Resend** - Email delivery service
- **Razorpay** - Payment processing integration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 22.13.1 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or cloud service like MongoDB Atlas)
- **Git** for version control

### Required API Keys

You'll need to obtain the following API keys:

1. **Mapbox Access Token** - [Get from Mapbox](https://www.mapbox.com/)
2. **MongoDB URI** - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB
3. **Cloudinary Credentials** - [Cloudinary Console](https://cloudinary.com/)
4. **Resend API Key** - [Resend Dashboard](https://resend.com/)
5. **Razorpay Keys** (optional) - [Razorpay Dashboard](https://razorpay.com/)

---

## ⚡ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/aryaan022/Findify.git
cd Findify
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
SESSION_SECRET=your_secure_session_secret

# Mapbox
MAP_ACCESS_TOKEN=your_mapbox_access_token

# Email Service
RESEND_API_KEY=your_resend_api_key

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

# Payment Processing (Optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Environment
NODE_ENV=development
```

### 4. Start the Application

```bash
# Development mode
node app.js

# The application will be available at http://localhost:3000
```

## 🚀 Usage

### For Users

1. **Sign Up/Login**: Create an account or log in to access all features
2. **Discover Businesses**: Use the map or search to find local businesses
3. **Read Reviews**: Check out what other users say about businesses
4. **Leave Reviews**: Share your experiences to help the community
5. **Save Favorites**: Bookmark businesses you want to visit again

### For Business Owners

1. **Register Your Business**: Create a comprehensive business profile
2. **Manage Listings**: Update business information, hours, and photos
3. **Respond to Reviews**: Engage with customer feedback
4. **Track Analytics**: Monitor your business performance and reach

## 🚀 Roadmap

### ✅ Completed Features
- ✅ Location-based business search and discovery
- ✅ User authentication and profile management
- ✅ Business reviews and rating system
- ✅ Favorites and bookmarking functionality
- ✅ Interactive map integration with Mapbox
- ✅ Image upload and management with Cloudinary
- ✅ Email notifications system

### 🔄 In Progress
- 🔄 Business owner dashboard enhancements
- 🔄 Advanced search filters (distance, rating, price)
- 🔄 Mobile app development

### 📅 Future Plans
- 📅 Real-time chat between users and businesses
- 📅 Event listings and calendar integration
- 📅 Social media integration
- 📅 Multi-language support
- 📅 Advanced analytics for business owners
- 📅 API for third-party integrations
- 📅 Push notifications for mobile app

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help improve Findify:

### How to Contribute

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub or use GitHub CLI
   gh repo fork aryaan022/Findify
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/Findify.git
   cd Findify
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Your Changes**
   - Write clean, well-documented code
   - Follow the existing coding style
   - Test your changes thoroughly

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: brief description of your feature"
   ```

6. **Push to Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Provide a clear description of your changes

### Contribution Guidelines

- **Code Style**: Follow the existing code formatting and style
- **Documentation**: Update documentation for any new features
- **Testing**: Ensure your changes don't break existing functionality
- **Issues**: Check existing issues before creating new ones
- **Communication**: Be respectful and constructive in discussions

### Types of Contributions Welcome

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Test coverage improvements

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No liability or warranty provided

---

## 📞 Contact

### Project Maintainer
- **GitHub**: [@aryaan022](https://github.com/aryaan022)
- **Project Link**: [https://github.com/aryaan022/Findify](https://github.com/aryaan022/Findify)

### Support
- **Live Site**: [findify.live](https://findify.live)
- **Issues**: [GitHub Issues](https://github.com/aryaan022/Findify/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aryaan022/Findify/discussions)

### Found a Bug?
Please report it by [creating an issue](https://github.com/aryaan022/Findify/issues/new) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

<div align="center">

**Made with ❤️ for local communities**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:5B86E5,100:36D1DC&height=120&section=footer" alt="Footer Banner" width="100%" />

</div>