import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createGroupService,
  fetchMyGroupsService,
  joinGroupService,
} from "@/services";

function StudentGroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [joinCode, setJoinCode] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadGroups() {
    try {
      const res = await fetchMyGroupsService();
      if (res.success) {
        setGroups(res.data || []);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  async function handleCreateGroup(e) {
    e.preventDefault();
    if (!createForm.name.trim()) {
      alert("Group name is required");
      return;
    }
    try {
      setSaving(true);
      const res = await createGroupService(createForm);
      if (res.success) {
        setCreateForm({ name: "", description: "" });
        await loadGroups();
      } else {
        alert(res.message || "Failed to create group");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create group");
    } finally {
      setSaving(false);
    }
  }

  async function handleJoinGroup(e) {
    e.preventDefault();
    if (!joinCode.trim() && !inviteToken.trim()) {
      alert("Provide a join code or invite token");
      return;
    }
    try {
      setSaving(true);
      const res = await joinGroupService({
        joinCode: joinCode.trim() || undefined,
        inviteToken: inviteToken.trim() || undefined,
      });
      if (res.success) {
        setJoinCode("");
        setInviteToken("");
        await loadGroups();
      } else {
        alert(res.message || "Failed to join group");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to join group");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50">
      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 bg-white/70 backdrop-blur-xl border rounded-3xl shadow-sm p-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs border">Collaborate & Learn</div>
            <h1 className="text-3xl font-extrabold tracking-tight">Study Groups</h1>
            <p className="text-muted-foreground max-w-2xl">Join peers, share resources, chat in real time, manage tasks, and stay accountable together.</p>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => document.getElementById("create-group-form")?.scrollIntoView({ behavior: "smooth" })}>Create a Group</Button>
              <Button variant="outline" onClick={() => document.getElementById("join-group-form")?.scrollIntoView({ behavior: "smooth" })}>Join with Code</Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center w-full lg:w-auto">
            {[{ label: "Active groups", value: groups.length }, { label: "Chats today", value: "120+" }, { label: "Resources shared", value: "500+" }].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white border shadow-sm px-4 py-3">
                <div className="text-xl font-bold text-indigo-700">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6" id="create-group-form">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Create a group</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleCreateGroup}>
                <Input
                  placeholder="Group name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <Input
                  placeholder="Description (optional)"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Create"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card id="join-group-form" className="border shadow-sm">
            <CardHeader>
              <CardTitle>Join with code or invite</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleJoinGroup}>
                <Input
                  placeholder="Join code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
                <Input
                  placeholder="Invite token (optional)"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                />
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Joining..." : "Join"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your groups</CardTitle>
              <span className="text-xs text-muted-foreground">Click a card to open chat</span>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">You are not in any groups yet. Create one or join with a code.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <div
                    key={group._id}
                    onClick={() => navigate(`/groups/${group._id}`)}
                    className="rounded-2xl border bg-white shadow-sm p-4 hover:shadow-md transition cursor-pointer flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-lg leading-tight">{group.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {group.description || "No description"}
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border">Join: {group.joinCode}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Members: {group.members?.length || 0}</div>
                    <div className="flex justify-end">
                      <Button size="sm" variant="ghost">Open</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default StudentGroupsPage;

