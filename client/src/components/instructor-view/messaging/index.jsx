import { useState, useMemo, useContext } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Copy, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InstructorContext } from "@/context/instructor-context";
import {
	getCourseGroupByCourseService,
	createCourseGroupService,
	joinCourseGroupService,
} from "@/services";
import { useNavigate } from "react-router-dom";

function InstructorMessaging() {
	const navigate = useNavigate();
	const { toast } = useToast();
	const { instructorCoursesList } = useContext(InstructorContext);

	const [selectedCourseId, setSelectedCourseId] = useState("");
	const [joinCode, setJoinCode] = useState("");
	const [groupId, setGroupId] = useState("");
	const [loading, setLoading] = useState(false);

	const courseOptions = useMemo(() => {
		return (instructorCoursesList || []).map((c) => ({ id: c?._id, title: c?.title }));
	}, [instructorCoursesList]);

	async function ensureGroupAndJoin(courseId) {
		try {
			setLoading(true);
			// Try fetching existing group first
			let res = null;
			try {
				res = await getCourseGroupByCourseService(courseId);
			} catch (err) {
				const status = err?.response?.status;
				if (!status || status !== 404) throw err;
			}

			if (!res?.success || !res?.data) {
				// Create if missing
				const course = (instructorCoursesList || []).find((c) => c?._id === courseId);
				res = await createCourseGroupService({
					courseId,
					name: `${course?.title || "Course"} Group`,
					description: course?.description || "",
				});
			}

			if (!res?.success || !res?.data) {
				return toast({
					title: "Group unavailable",
					description: res?.message || "Could not load group for this course",
					variant: "destructive",
				});
			}

			const group = res.data;
			setGroupId(group?._id || "");
			setJoinCode(group?.joinCode || "");

			if (group?.joinCode) {
				await joinCourseGroupService({ joinCode: group.joinCode });
			}

			toast({
				title: "Group ready",
				description: group?.joinCode
					? `Join code: ${group.joinCode} (copied to clipboard)`
					: "Group prepared",
			});

			if (group?.joinCode) {
				try {
					await navigator.clipboard?.writeText(group.joinCode);
				} catch {}
			}
		} catch (error) {
			toast({
				title: "Group error",
				description: error?.response?.data?.message || error?.message,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}

	function handleOpenGroup() {
		if (!groupId) {
			return toast({ title: "No group", description: "Select a course first" });
		}
		navigate(`/instructor/group/${groupId}`);
	}

	async function handleCopyCode() {
		if (!joinCode) return;
		try {
			await navigator.clipboard?.writeText(joinCode);
			toast({ title: "Copied", description: "Join code copied" });
		} catch {}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl font-bold">Messages</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Select Course</label>
						<Select
							value={selectedCourseId}
							onValueChange={(val) => {
								setSelectedCourseId(val);
								setJoinCode("");
								setGroupId("");
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Choose a course" />
							</SelectTrigger>
							<SelectContent>
								{courseOptions.map((opt) => (
									<SelectItem key={opt.id} value={opt.id}>
										{opt.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Action</label>
						<div className="flex gap-2">
							<Button
								disabled={!selectedCourseId || loading}
								onClick={() => ensureGroupAndJoin(selectedCourseId)}
							>
								{loading ? "Preparing..." : "Join Course Group"}
							</Button>
							<Button variant="secondary" disabled={!groupId} onClick={handleOpenGroup}>
								<MessageSquare className="h-4 w-4 mr-2" /> Open Group
							</Button>
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">Group Join Code</label>
					<div className="flex gap-2">
						<Input readOnly value={joinCode} placeholder="No code yet" />
						<Button variant="outline" disabled={!joinCode} onClick={handleCopyCode}>
							<Copy className="h-4 w-4 mr-2" /> Copy
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default InstructorMessaging;
