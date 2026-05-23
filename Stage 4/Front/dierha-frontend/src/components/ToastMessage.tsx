type ToastMessageProps = {
  message: string;
  type?: "success" | "error" | "info";
};

function ToastMessage({ message, type = "success" }: ToastMessageProps) {
  if (!message) return null;

  return (
    <div className={`toast-message ${type}`} role="status">
      <span className="toast-dot" />
      <strong>{message}</strong>
    </div>
  );
}

export default ToastMessage;
