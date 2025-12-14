import FormControls from "@/components/common-form/form-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MediaProgressbar from "@/components/media-progress-bar";
import { courseLandingPageFormControls } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { mediaUploadService } from "@/services";
import { Upload } from "lucide-react";
import { useContext, useRef, useState } from "react";

function CourseLanding() {
  const { courseLandingFormData, setCourseLandingFormData } =
    useContext(InstructorContext);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef(null);

  async function handleImageUpload(event) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const imageFormData = new FormData();
      imageFormData.append("file", selectedFile);

      try {
        setUploadProgress(true);
        const response = await mediaUploadService(
          imageFormData,
          setUploadPercentage
        );
        if (response.success) {
          setCourseLandingFormData({
            ...courseLandingFormData,
            // Cloudinary returns secure_url for images; fall back to url if needed
            image: response?.data?.secure_url || response?.data?.url,
          });
          setUploadProgress(false);
        }
      } catch (error) {
        console.log(error);
        setUploadProgress(false);
      }
    }
  }

  function handleImageClick() {
    fileInputRef.current?.click();
  }

  function handleImageUrlSave() {
    if (!imageUrlInput.trim()) return;
    setCourseLandingFormData({
      ...courseLandingFormData,
      image: imageUrlInput.trim(),
    });
    setImageUrlInput("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Landing Page</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          
          {courseLandingFormData?.image ? (
            <div className="space-y-3">
              <img
                src={courseLandingFormData.image}
                alt="Course"
                className="w-full h-48 object-cover rounded"
              />
              {uploadProgress && (
                <MediaProgressbar isMediaUploading={uploadProgress} progress={uploadPercentage} />
              )}
              <Button
                onClick={handleImageClick}
                variant="outline"
                className="w-full"
                disabled={uploadProgress}
              >
                Change Image
              </Button>
            </div>
          ) : (
            <div
              onClick={handleImageClick}
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <Label className="text-gray-600 cursor-pointer">
                {uploadProgress ? "Uploading..." : "Click to upload course image"}
              </Label>
              {uploadProgress && (
                <div className="w-full mt-2">
                  <MediaProgressbar isMediaUploading={uploadProgress} progress={uploadPercentage} />
                </div>
              )}
            </div>
          )}

          {/* Manual image URL entry */}
          <div className="mt-4 space-y-2">
            <Label className="text-gray-700">Or paste an image URL</Label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/your-image.jpg"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
              />
              <Button type="button" onClick={handleImageUrlSave} disabled={!imageUrlInput.trim()}>
                Use Image URL
              </Button>
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <FormControls
          formControls={courseLandingPageFormControls}
          formData={courseLandingFormData}
          setFormData={setCourseLandingFormData}
        />
      </CardContent>
    </Card>
  );
}

export default CourseLanding;
