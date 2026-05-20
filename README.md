# Charm Bracelet Website - Project Structure

Dự án website bán vòng tay charm với trình thiết kế kéo thả.

## Cấu trúc thư mục

### 1. Backend (Node.js + Express + MongoDB)
- `src/config/`: Cấu hình database (MongoDB) và các biến môi trường.
- `src/controllers/`: Xử lý logic cho các API endpoints (CRUD Charm, Category, v.v.).
- `src/models/`: Định nghĩa schema cho MongoDB (Mongoose Models).
- `src/routes/`: Định nghĩa các đường dẫn API.
- `src/services/`: Các dịch vụ bổ trợ (nếu có).
- `app.js`: Cấu hình Express middleware và routes.
- `server.js`: File thực thi chính để khởi chạy server.

### 2. Frontend (React + Vite)
- `src/components/`: Các component UI tái sử dụng (Button, Card, Canvas, v.v.).
- `src/pages/`: Các trang chính (Home, Designer, Admin).
- `src/services/`: Xử lý gọi API từ Backend.
- `src/styles/`: Quản lý CSS (variables.css cho theme, global.css cho style chung).
- `src/hooks/`: Các custom hooks (tính giá tiền, xử lý kéo thả).

## Công nghệ sử dụng
- **Frontend**: React, Vite, Vanilla CSS.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).

## Hướng dẫn cài đặt và chạy

### Bước 1: Backend
1. Di chuyển vào thư mục backend: `cd backend`
2. Cài đặt dependencies: `npm install`
3. Tạo file `.env` từ `.env.example` và cấu hình `MONGO_URI`.
4. Chạy server ở chế độ phát triển: `npm run dev`

### Bước 2: Frontend
1. Di chuyển vào thư mục frontend: `cd frontend`
2. Cài đặt dependencies: `npm install`
3. Chạy frontend: `npm run dev`

## Tính năng chính
- [x] Cấu trúc thư mục Scalable
- [ ] CRUD Charm & Category (Backend API & Frontend Pages)
- [ ] Bracelet Designer (Drag & Drop)
- [ ] Tính tổng tiền Real-time (usePriceCalculator hook)
- [ ] Lưu thiết kế vòng tay vào database
