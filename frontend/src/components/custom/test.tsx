import { UploadButton } from "./uploadthing";

export default function UploadPDF() {
  //const token = localStorage.getItem("token") ?? "";
    const token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZWU0NjBkZS00MWJhLTQzYzUtYWVmMC0xMjU5YWIyMTgxYWIiLCJzdGFnZSI6InZlcmlmaWVkIiwiaWF0IjoxNzUxMjI0MTIyLCJleHAiOjE3NTEzMTA1MjJ9.KuAY0HT5OkH05saxwTPpRIBpkPAEvXU9IA53PAJkdNs"
  return (
    <UploadButton
      endpoint="pdfUploader"
      headers={{
        Authorization: `Bearer ${token}`,
      }}
      onClientUploadComplete={(res) => {
        console.log("✅ Upload complete:", res);

      }}
      onUploadError={(err) => {
        console.error("❌ Upload error:", err.message);
      }}
      appearance={{
        button: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
        container: "my-4",
      }}
    />
  );
}
