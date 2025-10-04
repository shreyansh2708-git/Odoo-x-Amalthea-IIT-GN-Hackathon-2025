# 💸 Smart Expense Management System  
# 💸 Expenzify
<p align="center">
  <img src="https://img.shields.io/badge/Hackathon-Odoo%20x%20IIT-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Team-Odoobytes-orange?style=for-the-badge" />
</p>

---

## 🚀 About the Project  

Companies often struggle with **manual expense reimbursement processes** that are:  
- ⏳ Time-consuming  
- ❌ Error-prone  
- 🔍 Lacking transparency  

Our solution tackles these issues by building a **smart, automated expense management system** with flexible approval workflows and OCR-powered receipt scanning.

---

## ✨ Key Features  

### 👤 Authentication & User Management  
- Auto company creation on signup (with country-based currency).  
- Role-based access → **Admin, Manager, Employee**.  
- Admin can manage users, assign roles, and configure workflows.  

### 📝 Expense Submission (Employee Role)  
- Submit claims with **amount, category, description, and date**.  
- Multi-currency support with real-time conversion.  
- View expense history (approved/rejected).  

### ✅ Approval Workflow (Manager/Admin Role)  
- Multi-level approvals with defined sequence:  
  `Manager → Finance → Director`  
- Managers can view pending expenses and approve/reject with comments.  
- Conditional rules:  
  - **Percentage rule** (e.g., 60% approvals required).  
  - **Specific approver rule** (e.g., CFO auto-approval).  
  - **Hybrid rule** (combine both).  

### 📌 Role Permissions  
- **Admin:** Full control over users, roles, rules, and approvals.  
- **Manager:** Approve/reject, view team expenses, escalate if needed.  
- **Employee:** Submit and track expenses.  

### 🧾 OCR for Receipts  
- Scan and auto-generate expense entries.  
- Extracts fields like amount, date, description, merchant name, and category.  

---

## 🌍 APIs Used  
- Country & Currency Info → [`restcountries.com`](https://restcountries.com/v3.1/all?fields=name,currencies)  
- Currency Conversion → [`exchangerate-api`](https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY})  

---

## 🎨 Mockup Preview  
🔗 [View Excalidraw Mockup](https://link.excalidraw.com/l/65VNwvy7c4X/4WSLZDTrhkA)  

---

## 🏆 Hackathon Note  
This project was built for the **Odoo x IIT Hackathon** by **Team Odoobytes**.  

