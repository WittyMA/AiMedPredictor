import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Stethoscope, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";


const CovidSymptomsPrediction = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // ✅ Default state is "No" for all symptoms
  const [formData, setFormData] = useState({
    breathing_problem: "No",
    fever: "No",
    dry_cough: "No",
    sore_throat: "No",
    running_nose: "No",
    asthma: "No",
    chronic_lung_disease: "No",
    headache: "No",
    heart_disease: "No",
    diabetes: "No",
    hyper_tension: "No",
    fatigue: "No",
    gastrointestinal: "No",
    abroad_travel: "No",
    contact_with_covid_patient: "No",
    attended_large_gathering: "No",
    visited_public_exposed_places: "No",
    family_working_public_places: "No",
    wearing_masks: "No",
    sanitization_from_market: "No",
  });

  const handleSymptomChange = (symptom, checked) => {
    setFormData((prev) => ({
      ...prev,
      [symptom]: checked ? "Yes" : "No", // ✅ Send Yes/No
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/predict/covid_symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Prediction failed");

      const data = await response.json();
      setResult(data);

      toast({
        title: "Assessment Complete",
        description: "Your COVID-19 risk assessment is ready.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to get prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "High":
        return "bg-red-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const symptoms = [
    { key: "breathing_problem", label: "Breathing Problem" },
    { key: "fever", label: "Fever" },
    { key: "dry_cough", label: "Dry Cough" },
    { key: "sore_throat", label: "Sore Throat" },
    { key: "running_nose", label: "Runny Nose" },
    { key: "asthma", label: "Asthma" },
    { key: "chronic_lung_disease", label: "Chronic Lung Disease" },
    { key: "headache", label: "Headache" },
    { key: "heart_disease", label: "Heart Disease" },
    { key: "diabetes", label: "Diabetes" },
    { key: "hyper_tension", label: "High Blood Pressure" },
    { key: "fatigue", label: "Fatigue" },
    { key: "gastrointestinal", label: "Gastrointestinal Issues" },
    { key: "abroad_travel", label: "Abroad Travel" },
    { key: "contact_with_covid_patient", label: "Contact with COVID Patient" },
    { key: "attended_large_gathering", label: "Attended Large Gathering" },
    { key: "visited_public_exposed_places", label: "Visited Public Places" },
    { key: "family_working_public_places", label: "Family in Public-facing Jobs" },
    { key: "wearing_masks", label: "Wearing Masks" },
    { key: "sanitization_from_market", label: "Sanitization After Market" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Stethoscope className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900">COVID-19 Symptoms Assessment</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Assess your COVID-19 infection probability based on symptoms and exposure history.
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This tool is for informational purposes only and should not replace professional medical advice.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Symptom Assessment</CardTitle>
            <CardDescription>Check your symptoms to assess COVID-19 risk.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Symptoms</h3>
                <div className="grid grid-cols-1 gap-3">
                  {symptoms.map((s) => (
                    <div key={s.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={s.key}
                        checked={formData[s.key] === "Yes"} // ✅ check for "Yes"
                        onCheckedChange={(checked) => handleSymptomChange(s.key, checked)}
                      />
                      <Label htmlFor={s.key}>{s.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assessing Risk...
                  </>
                ) : (
                  "Assess COVID-19 Risk"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
        <CardHeader>
          <CardTitle>Assessment Results</CardTitle>
          <CardDescription>
            AI-powered COVID-19 risk assessment based on your symptoms and exposure history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              {/* Risk Level */}
              <div className="text-center space-y-4">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-white ${getRiskColor(
                    result.risk_level
                  )}`}
                >
                  {result.risk_level === "High" ? (
                    <AlertTriangle className="mr-2 h-5 w-5" />
                  ) : (
                    <CheckCircle className="mr-2 h-5 w-5" />
                  )}
                  <span className="font-semibold">{result.risk_level} Risk</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {result.prediction === 1
                    ? "Possible COVID-19 Infection"
                    : "Low COVID-19 Probability"}
                </p>
              </div>

              {/* Confidence Score */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Confidence</span>
                  <span className="text-sm font-bold text-gray-900">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Probability Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Probability Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-800">
                      No COVID-19
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {(result.probability.no_covid * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-red-800">COVID-19</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {(result.probability.covid * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <Alert
                className={
                  result.risk_level === "High"
                    ? "border-red-200 bg-red-50"
                    : "border-green-200 bg-green-50"
                }
              >
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {result.risk_level === "High" ? (
                    <>
                      <strong>Recommendations:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Consider getting tested for COVID-19</li>
                        <li>• Self-isolate and avoid contact with others</li>
                        <li>• Monitor symptoms closely</li>
                        <li>• Seek medical attention if symptoms worsen</li>
                        <li>• Follow local health guidelines</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <strong>Recommendations:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Continue following preventive measures</li>
                        <li>• Maintain social distancing</li>
                        <li>• Wear masks in public spaces</li>
                        <li>• Practice good hand hygiene</li>
                        <li>• Monitor for any new symptoms</li>
                      </ul>
                    </>
                  )}
                </AlertDescription>
              </Alert>

              {/* Important Notice */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> This assessment is not a medical
                  diagnosis. If you have severe symptoms like difficulty breathing,
                  chest pain, or high fever, seek immediate medical attention.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Stethoscope className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>
                Complete the assessment form and click "Assess COVID-19 Risk" to see
                your results here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      </div>
    </div>
  );
};

export default CovidSymptomsPrediction;
