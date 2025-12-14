import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { captureAndFinalizePaymentService } from "@/services";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

function PaypalPaymentReturnPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");
  const [groupCode, setGroupCode] = useState(null);
  const [courseName, setCourseName] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (paymentId && payerId) {
      async function capturePayment() {
        const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

        const response = await captureAndFinalizePaymentService(
          paymentId,
          payerId,
          orderId
        );

        if (response?.success) {
          setGroupCode(response?.groupJoinCode);
          setCourseName(response?.data?.courseTitle);
          sessionStorage.removeItem("currentOrderId");
          
          // Auto redirect after 5 seconds
          setTimeout(() => {
            window.location.href = "/student-courses";
          }, 5000);
        }
      }

      capturePayment();
    }
  }, [payerId, paymentId]);

  const handleCopyCode = async () => {
    if (groupCode) {
      await navigator.clipboard?.writeText(groupCode);
      toast({
        title: "Copied!",
        description: `Group code copied to clipboard`,
      });
    }
  };

  if (groupCode) {
    return (
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-green-600">🎉 Enrollment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Course</p>
            <p className="text-lg font-semibold">{courseName}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-gray-600 mb-2">Your Group Join Code</p>
            <div className="flex items-center gap-2">
              <code className="text-2xl font-bold tracking-wider text-blue-600">{groupCode}</code>
              <Button
                onClick={handleCopyCode}
                variant="ghost"
                size="sm"
                className="ml-auto"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Share this code with classmates to join the group chat</p>
          </div>
          <Button
            onClick={() => window.location.href = "/student-courses"}
            className="w-full"
          >
            Go to My Courses
          </Button>
          <p className="text-xs text-gray-500 text-center">Redirecting in 5 seconds...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing payment... Please wait</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default PaypalPaymentReturnPage;
