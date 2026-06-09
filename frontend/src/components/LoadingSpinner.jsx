import logoIcon from "../assets/ic.png";

export default function LoadingSpinner({ message = "Đang tải dữ liệu...", minHeight = "200px", size = "50px" }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: minHeight,
      gap: "12px",
      color: "#0a2e4f",
      fontWeight: "600",
      fontSize: "0.95rem",
      width: "100%"
    }}>
      <img
        src={logoIcon}
        alt="Loading..."
        style={{
          width: size,
          height: size,
          animation: "spin 1.5s linear infinite"
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span>{message}</span>
    </div>
  );
}
