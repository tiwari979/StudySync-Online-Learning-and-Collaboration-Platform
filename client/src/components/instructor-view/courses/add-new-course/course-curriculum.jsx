import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import VideoPlayer from "@/components/video-player";
import { courseCurriculumInitialFormData } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import {
  mediaBulkUploadService,
  mediaDeleteService,
  mediaUploadService,
} from "@/services";
import { Upload } from "lucide-react";
import { useContext, useRef, useState } from "react";

function CourseCurriculum() {
  const {
    courseCurriculumFormData,
    setCourseCurriculumFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const bulkUploadInputRef = useRef(null);
  
  // State for form visibility and inputs
  const [addLectureMode, setAddLectureMode] = useState(false);
  const [replaceVideoIndex, setReplaceVideoIndex] = useState(null);
  const [youtubeUrlIndex, setYoutubeUrlIndex] = useState(null);
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [newLectureYoutubeUrl, setNewLectureYoutubeUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  function handleOpenAddLectureForm() {
    setAddLectureMode(true);
  }

  function handleCancelAddLecture() {
    setAddLectureMode(false);
    setNewLectureTitle("");
    setNewLectureYoutubeUrl("");
  }

  function handleSaveNewLecture() {
    if (newLectureTitle.trim() && newLectureYoutubeUrl.trim()) {
      setCourseCurriculumFormData([
        ...courseCurriculumFormData,
        {
          ...courseCurriculumInitialFormData[0],
          title: newLectureTitle.trim(),
          videoUrl: newLectureYoutubeUrl.trim(),
          public_id: "", // YouTube URL has no public_id
        },
      ]);
      handleCancelAddLecture();
    }
  }

  function handleNewLectureFileUpload(event) {
    const file = event.target.files?.[0];
    if (file && newLectureTitle.trim()) {
      // Handle file upload for new lecture
      const formData = new FormData();
      formData.append("file", file);

      setMediaUploadProgress(true);
      mediaUploadService(formData, setMediaUploadProgressPercentage)
        .then((response) => {
          if (response?.success) {
            setCourseCurriculumFormData([
              ...courseCurriculumFormData,
              {
                ...courseCurriculumInitialFormData[0],
                title: newLectureTitle.trim(),
                videoUrl: response?.data?.secure_url,
                public_id: response?.data?.public_id,
              },
            ]);
            handleCancelAddLecture();
            setMediaUploadProgress(false);
          }
        });
    }
  }

  function handleCourseTitleChange(event, currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    cpyCourseCurriculumFormData[currentIndex] = {
      ...cpyCourseCurriculumFormData[currentIndex],
      title: event.target.value,
    };

    setCourseCurriculumFormData(cpyCourseCurriculumFormData);
  }

  function handleFreePreviewChange(currentValue, currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    cpyCourseCurriculumFormData[currentIndex] = {
      ...cpyCourseCurriculumFormData[currentIndex],
      freePreview: currentValue,
    };

    setCourseCurriculumFormData(cpyCourseCurriculumFormData);
  }

  async function handleSingleLectureUpload(event, currentIndex) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const videoFormData = new FormData();
      videoFormData.append("file", selectedFile);

      try {
        setMediaUploadProgress(true);
        const response = await mediaUploadService(
          videoFormData,
          setMediaUploadProgressPercentage
        );
        if (response.success) {
          let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
          cpyCourseCurriculumFormData[currentIndex] = {
            ...cpyCourseCurriculumFormData[currentIndex],
            videoUrl: response?.data?.url,
            public_id: response?.data?.public_id,
          };
          setCourseCurriculumFormData(cpyCourseCurriculumFormData);
          setMediaUploadProgress(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function handleReplaceVideo(currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    const getCurrentVideoPublicId =
      cpyCourseCurriculumFormData[currentIndex].public_id;

    const deleteCurrentMediaResponse = await mediaDeleteService(
      getCurrentVideoPublicId
    );

    if (deleteCurrentMediaResponse?.success) {
      cpyCourseCurriculumFormData[currentIndex] = {
        ...cpyCourseCurriculumFormData[currentIndex],
        videoUrl: "",
        public_id: "",
      };

      setCourseCurriculumFormData(cpyCourseCurriculumFormData);
    }
  }

  function isCourseCurriculumFormDataValid() {
    return courseCurriculumFormData.every((item) => {
      return (
        item &&
        typeof item === "object" &&
        item.title.trim() !== "" &&
        item.videoUrl.trim() !== ""
      );
    });
  }

  function handleOpenBulkUploadDialog() {
    bulkUploadInputRef.current?.click();
  }

  function areAllCourseCurriculumFormDataObjectsEmpty(arr) {
    return arr.every((obj) => {
      return Object.entries(obj).every(([key, value]) => {
        if (typeof value === "boolean") {
          return true;
        }
        return value === "";
      });
    });
  }

  async function handleMediaBulkUpload(event) {
    const selectedFiles = Array.from(event.target.files);
    const bulkFormData = new FormData();

    selectedFiles.forEach((fileItem) => bulkFormData.append("files", fileItem));

    try {
      setMediaUploadProgress(true);
      const response = await mediaBulkUploadService(
        bulkFormData,
        setMediaUploadProgressPercentage
      );

      console.log(response, "bulk");
      if (response?.success) {
        let cpyCourseCurriculumFormdata =
          areAllCourseCurriculumFormDataObjectsEmpty(courseCurriculumFormData)
            ? []
            : [...courseCurriculumFormData];

        cpyCourseCurriculumFormdata = [
          ...cpyCourseCurriculumFormdata,
          ...response?.data.map((item, index) => ({
            videoUrl: item?.url,
            public_id: item?.public_id,
            title: `Lecture ${
              cpyCourseCurriculumFormdata.length + (index + 1)
            }`,
            freePreview: false,
          })),
        ];
        setCourseCurriculumFormData(cpyCourseCurriculumFormdata);
        setMediaUploadProgress(false);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function handleDeleteLecture(currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    const getCurrentSelectedVideoPublicId =
      cpyCourseCurriculumFormData[currentIndex].public_id;

    if (getCurrentSelectedVideoPublicId) {
      const response = await mediaDeleteService(getCurrentSelectedVideoPublicId);

      if (response?.success) {
        cpyCourseCurriculumFormData = cpyCourseCurriculumFormData.filter(
          (_, index) => index !== currentIndex
        );

        setCourseCurriculumFormData(cpyCourseCurriculumFormData);
      }
    } else {
      // If no public_id, it's a YouTube URL, just delete it
      cpyCourseCurriculumFormData = cpyCourseCurriculumFormData.filter(
        (_, index) => index !== currentIndex
      );
      setCourseCurriculumFormData(cpyCourseCurriculumFormData);
    }
  }

  function handleAddYoutubeUrl(index) {
    setYoutubeUrlIndex(index);
  }

  function handleSaveYoutubeUrl(index) {
    if (youtubeUrl.trim()) {
      let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
      cpyCourseCurriculumFormData[index] = {
        ...cpyCourseCurriculumFormData[index],
        videoUrl: youtubeUrl.trim(),
        public_id: "", // YouTube URLs don't have public_id
      };
      setCourseCurriculumFormData(cpyCourseCurriculumFormData);
      setYoutubeUrlIndex(null);
      setYoutubeUrl("");
      setReplaceVideoIndex(null);
    }
  }

  function handleReplaceVideo(index) {
    setReplaceVideoIndex(index);
  }

  function handleCancelReplace() {
    setReplaceVideoIndex(null);
    setYoutubeUrlIndex(null);
    setYoutubeUrl("");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Create Course Curriculum</CardTitle>
        <div>
          <Input
            type="file"
            ref={bulkUploadInputRef}
            accept="video/*"
            multiple
            className="hidden"
            id="bulk-media-upload"
            onChange={handleMediaBulkUpload}
          />
          <Button
            as="label"
            htmlFor="bulk-media-upload"
            variant="outline"
            className="cursor-pointer"
            onClick={handleOpenBulkUploadDialog}
          >
            <Upload className="w-4 h-5 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {addLectureMode ? (
          <div className="border-2 border-green-400 p-4 rounded-lg space-y-4 mb-6">
            <p className="text-sm font-semibold">Add New Lecture</p>
            
            <div className="space-y-2">
              <Label className="block">Lecture Title</Label>
              <Input
                type="text"
                placeholder="Enter lecture title"
                value={newLectureTitle}
                onChange={(e) => setNewLectureTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="block">Option 1: Upload Video from Local System</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={handleNewLectureFileUpload}
              />
            </div>

            <div className="space-y-2">
              <Label className="block">Option 2: Enter YouTube URL</Label>
              <Input
                type="text"
                placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
                value={newLectureYoutubeUrl}
                onChange={(e) => setNewLectureYoutubeUrl(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSaveNewLecture}
                className="bg-green-600 hover:bg-green-700"
              >
                Add Lecture
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelAddLecture}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleOpenAddLectureForm}
            className="mb-6"
          >
            + Add New Lecture
          </Button>
        )}
        {mediaUploadProgress ? (
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        ) : null}
        <div className="mt-4 space-y-4">
          {courseCurriculumFormData.map((curriculumItem, index) => (
            <div className="border p-5 rounded-md">
              <div className="flex gap-5 items-center">
                <h3 className="font-semibold">Lecture {index + 1}</h3>
                <Input
                  name={`title-${index + 1}`}
                  placeholder="Enter lecture title"
                  className="max-w-96"
                  onChange={(event) => handleCourseTitleChange(event, index)}
                  value={courseCurriculumFormData[index]?.title}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    onCheckedChange={(value) =>
                      handleFreePreviewChange(value, index)
                    }
                    checked={courseCurriculumFormData[index]?.freePreview}
                    id={`freePreview-${index + 1}`}
                  />
                  <Label htmlFor={`freePreview-${index + 1}`}>
                    Free Preview
                  </Label>
                </div>
              </div>
              <div className="mt-6">
                {replaceVideoIndex === index ? (
                  <div className="border-2 border-blue-400 p-4 rounded-lg space-y-4">
                    <p className="text-sm font-semibold">Replace Video - Choose an option:</p>
                    
                    <div className="space-y-2">
                      <Label className="block">Option 1: Upload from Local System</Label>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(event) =>
                          handleSingleLectureUpload(event, index)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="block">Option 2: Enter YouTube URL</Label>
                      <Input
                        type="text"
                        placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          if (youtubeUrl.trim()) {
                            handleSaveYoutubeUrl(index);
                          } else {
                            handleCancelReplace();
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelReplace}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : courseCurriculumFormData[index]?.videoUrl ? (
                  <div className="flex gap-3">
                    <VideoPlayer
                      url={courseCurriculumFormData[index]?.videoUrl}
                      width="450px"
                      height="200px"
                    />
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => handleReplaceVideo(index)}>
                        Replace Video
                      </Button>
                      <Button
                        onClick={() => handleDeleteLecture(index)}
                        className="bg-red-900"
                      >
                        Delete Lecture
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="block mb-2">Add Video</Label>
                      <div className="flex gap-3">
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(event) =>
                            handleSingleLectureUpload(event, index)
                          }
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={() => handleAddYoutubeUrl(index)}
                        >
                          Add YouTube URL
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCurriculum;
