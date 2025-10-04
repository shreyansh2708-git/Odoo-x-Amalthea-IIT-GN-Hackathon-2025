# 💸 Expenzify – Smart Expense Management System  

<p align="center">
  <img src="https://img.shields.io/badge/Hackathon-Odoo%20x%20IIT-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Team-Odoobytes-orange?style=for-the-badge" />
</p>

---

## 🔗 Quick Links  
- 🌐 [Live Demo] *(Hosted Link)*  -
- 🎥 [Demo Video] *(Walkthrough Video)*  - https://youtu.be/UPSSm05-CgY

---

## 👥 Team Odoobytes  
- **Shreyansh Mishra** *(Team Leader)*  
- Shejal Dubey  
- Raghav Maheswari  
- Nikita Singh  

👨‍🏫 **Reviewer:** Aman Patel  

---

## 🚀 About the Project  

Companies often struggle with **manual expense reimbursement processes** that are:  
- ⏳ Time-consuming  
- ❌ Error-prone  
- 🔍 Lacking transparency  

**Expenzify** solves this by providing a **smart, automated expense management system** with:  
- Flexible approval workflows  
- Role-based permissions  
- Multi-currency support  
- OCR-powered receipt scanning  

---

## ✨ Key Features  

### 👤 Authentication & User Management  
- Auto company creation on signup (with country-based currency).  
- Secure login & signup with role-based access → **Admin, Manager, Employee**.  
- Admin can manage users, assign roles, and configure workflows.  

### 📝 Expense Submission (Employee Role)  
- Submit claims with **amount, category, description, and date**.  
- Multi-currency support with **real-time conversion APIs**.  
- Attach receipts and supporting documents.  
- View expense history with approval/rejection status.  

### ✅ Approval Workflow (Manager/Admin Role)  
- **Multi-level approval chains** (Manager → Finance → Director).  
- Approval sequence is configurable by Admin.  
- Managers can approve/reject with comments.  
- **Conditional rules**:  
  - **Percentage rule** (e.g., 60% approvals required).  
  - **Specific approver rule** (e.g., CFO auto-approval).  
  - **Hybrid rule** (combine both).  
- Notifications and reminders for pending approvals.  

### 📌 Role Permissions  
- **Admin:** Full control over users, roles, rules, and overrides.  
- **Manager:** Approve/reject, view team expenses, escalate if needed.  
- **Employee:** Submit and track expenses.  

### 🧾 OCR for Receipts  
- Auto-read receipts with OCR → pre-fills fields like amount, date, merchant name, and category.  
- Reduces manual entry and errors.  

### 📊 Analytics & Reports  
- Dashboard for Admins to view overall expense trends.  
- Export reports in multiple formats (CSV, PDF).  
- Insights on spending by category, department, or employee.  

### 🔔 Notifications & Alerts  
- Email/SMS/WhatsApp reminders for pending approvals.  
- Status updates for employees when claims are approved/rejected.  

---

## 🌍 APIs Used  
- Country & Currency Info → [`restcountries.com`](https://restcountries.com/v3.1/all?fields=name,currencies)  
- Currency Conversion → [`exchangerate-api`](https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY})  

---

## 🛠 Tech Stack  
- **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with Typescript  

---

## 🎨 Mockup Preview  
🔗 [View Excalidraw Mockup](https://link.excalidraw.com/l/65VNwvy7c4X/4WSLZDTrhkA)  

---

## 🏆 Hackathon Note  
This project was built for the **Odoo x IIT Hackathon** by **Team Odoobytes**.  

