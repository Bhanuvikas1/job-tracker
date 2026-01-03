export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p>© {new Date().getFullYear()} Job Tracker. Built by Bhanu.</p>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: "auto",
    padding: "16px",
    textAlign: "center",
    fontSize: "13px",
    color: "#6b7280",
    borderTop: "1px solid #e5e7eb",
  },
};
