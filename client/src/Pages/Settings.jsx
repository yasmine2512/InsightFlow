import { useState, useEffect } from "react";
import { ErrorDialog } from "./ErrorDialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import {Trash2} from "lucide-react"
import axios from "axios";
import { DeleteDialog } from "./DeleteDialog";
import { SuccessDialog } from "./SuccesDialog";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const [name, setFullname] = useState("");
  const [orgname, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [initials, setInitials] = useState("??");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({error:"",title:""});
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessgae, setSuccessMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileMessage, setFileMessage] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const { user, updateUser, logout } = useAuth();
  const token = user?.token;
  const userId = user?.userId;
  
  useEffect(() => {
    async function fetchdata() {
      try {
        const response = await axios.get(`${API_URL}/api/auth/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const parts = (response.data.name || "").trim().split(" ");
        const ini = parts.length >= 2
          ? parts[0][0] + parts[parts.length - 1][0]
          : (parts[0]?.[0] ?? "?");
        setInitials(ini.toUpperCase());
        setFullname(response.data.name);
        setOrganization(response.data.organizationName);
        setEmail(response.data.email);
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load profile." });
      } finally {
        setLoading(false);
      }
    }
    fetchdata();
  }, [userId, token, API_URL]);

  // Fetch organization RAG files
  useEffect(() => {
    async function fetchOrgFiles() {
      if (!token) return;
      setFilesLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/files/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(response.data|| []);
      } catch (err) {
        console.error("Failed to fetch organization files", err);
      } finally {
        setFilesLoading(false);
      }
    }
    fetchOrgFiles();
  }, [token, API_URL]);

  async function handleFileUpload(e) {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    if (files.length >= 10) {
      setErrorMessage({error:"Maximum limit of 10 files reached for your organization.",title:"Size Error"})
      setErrorOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);

    setUploading(true);
    setFileMessage(null);
    try {
      const response = await axios.post(`${API_URL}/api/files/${userId}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });
      setFiles((prev) => [...prev, response.data.file]);
      setSuccessMessage("File uploaded successfully.");
      setSuccessOpen(true);
    } catch (err) {
      setErrorMessage({ error :err.response?.data?.message || "Failed to upload file.",title:"Upload Error"});
      setErrorOpen(true)
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleFileDelete(fileId) {
    setDeleteTarget(null);
    try {
      await axios.delete(`${API_URL}/api/files/${userId}/file/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      setSuccessMessage("File deleted successfully.");
      setSuccessOpen(true);
    } catch (err) {
      setErrorMessage({error:"Failed to delete file.",title:"Delete Error"});
      setErrorOpen(true);
    }
  }

  async function handleDelete() {
    if (!userId) return;
    try {
      await axios.delete(`${API_URL}/api/auth/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logout();
    } catch (error) {
      console.log(error);
      setErrorMessage({error:error.message,title:"Delete Error"});
      setErrorOpen(true);
    }
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await axios.put(`${API_URL}/api/auth/profile/${userId}`, { name, orgname }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateUser({ username: response.data.name });
      const parts = response.data.name.trim().split(" ");
      const ini = parts.length >= 2
        ? parts[0][0] + parts[parts.length - 1][0]
        : (parts[0]?.[0] ?? "?");
      setInitials(ini.toUpperCase());
      setFullname(response.data.name);
      setOrganization(response.data.organizationName);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-6">
        <h3 className="font-heading font-semibold">Profile</h3>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
            {initials}
          </div>
          <div>
            <Button variant="outline" size="sm">Change Avatar</Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading profile…</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
             <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="orgname">Organization</Label>
              <Input
                id="orgname"
                value={orgname}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Your organization"
              />
            </div>
          </div>
        )}

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-destructive"}`}>
            {message.text}
          </p>
        )}

        <Button
          className="gradient-primary border-0 text-primary-foreground"
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      <Separator />

    {/* Organization Files / RAG Knowledge Base Section */}
      {/* Organization Files / RAG Knowledge Base Section */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between w-full">
          <div className="text-left">
            <h3 className="font-heading font-semibold m-0 leading-none">Organization Knowledge Base</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-0">Upload documents to power your organization's AI context ({files.length}/10 files uploaded)</p>
          </div>
          <div>
            <input
              type="file"
              id="rag-file-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading || files.length >= 10}
            />
            <label htmlFor="rag-file-upload">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={uploading || files.length >= 10}
                asChild
              >
                <span>{uploading ? "Uploading..." : "Upload File"}</span>
              </Button>
            </label>
          </div>
        </div>

        {fileMessage && (
          <p className={`text-sm ${fileMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
            {fileMessage.text}
          </p>
        )}

        {filesLoading ? (
          <p className="text-sm text-muted-foreground">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No files uploaded yet. Upload PDFs, text docs, or markdown files to enable RAG.</p>
        ) : (
          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {files.map((file) => (
              <div key={file._id} className="flex items-center justify-between p-3 bg-background/50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="text-sm font-medium truncate max-w-xs sm:max-w-md">{file.name}</div>
                  <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => window.open(file.url, "_blank")}
                    title="View PDF"
                  >
                    {/* Simple SVG eye icon or use an icon library */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground hover:text-foreground">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(file._id)}
                  >
                    <Trash2 size={15}/>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Notifications */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
        <h3 className="font-heading font-semibold">Notifications</h3>
        {[
          { label: "Email notifications", desc: "Receive updates about your orders", defaultChecked: true },
          { label: "Push notifications", desc: "Browser push notifications", defaultChecked: false },
          { label: "Marketing emails", desc: "Receive tips and product updates", defaultChecked: true },
          { label: "Security alerts", desc: "Important security notifications", defaultChecked: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
            <Switch defaultChecked={item.defaultChecked} />
          </div>
        ))}
      </div>

      <Separator />

      {/* Danger Zone */}
      <div className="bg-card rounded-xl border border-destructive/30 p-6 shadow-soft space-y-4">
        <h3 className="font-heading font-semibold text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button onClick={() => setOpen(true)} variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
          Delete Account
        </Button>
      </div>

      <DeleteDialog 
        open={open}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
        Page="Your Account"
      />
      <DeleteDialog 
        open={deleteTarget !== null}
        onConfirm={() =>{handleFileDelete(deleteTarget)}}
        onCancel={() => setDeleteTarget(null)}
        Page="Your File"
      />
      <ErrorDialog
        open={errorOpen}
        title={errorMessage.title}
        message={errorMessage.error}
        actionLabel="Okay"
        onClose={() => setErrorOpen(false)}
      />
      <SuccessDialog
            open={successOpen}
            message={successMessgae}
            onClose={() => {
              setSuccessOpen(false);
              }}
            />    
    </div>
  );
}