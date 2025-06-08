import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Papa from "papaparse";

const AddUserForm = ({ onUserAdded }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "نام نمی‌تواند خالی باشد.";
    if (!email.trim()) {
      newErrors.email = "ایمیل نمی‌تواند خالی باشد.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "فرمت ایمیل صحیح نیست.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const profilePicUrl = profilePic ? URL.createObjectURL(profilePic) : null;
    onUserAdded({ name, email, profilePicUrl });

    setIsLoading(false);
    alert("کاربر با موفقیت اضافه شد! در حال انتقال به لیست کاربران...");

    navigate("/users");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          alert(
            `${results.data.length} کاربر از فایل خوانده شد. نتیجه درلیست کاربران نمایش داده می‌شود.`
          );
          results.data.forEach((user) => onUserAdded(user));
        },
        error: (error) => {
          console.error("خطا در خواندن فایل:", error);
          alert("خطایی در پردازش فایل رخ داد.");
        },
      });
      e.target.value = null;
    }
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h2>افزودن کاربر جدید</h2>
        <Link to="/users" className="nav-link">
          مشاهده لیست کاربران{" "}
        </Link>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>نام</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>
        <div className="form-group">
          <label>ایمیل</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
        <div className="form-group">
          <label>عکس پروفایل</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePic(e.target.files[0])}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="loader"></div>
          ) : (
            <label style={{ fontWeight : "bold"}}>ثبت کاربر</label>
          )}
        </button>
      </form>

      <hr />

      <div className="bonus-section">
        <h3> افزودن کاربران از فایل</h3>
        <div className="form-group">
          <input type="file" accept="xlsx" onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;
