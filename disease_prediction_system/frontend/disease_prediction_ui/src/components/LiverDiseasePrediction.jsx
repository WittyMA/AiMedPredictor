import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { LiverIcon } from "@/components/icons/LiverIcon";


const LiverDiseasePrediction = () => {
  const [formData, setFormData] = useState({
    Age: '',
    Gender: '',
    Total_Bilirubin: '',
    Direct_Bilirubin: '',
    Alkaline_Phosphotase: '',
    Alamine_Aminotransferase: '',
    Aspartate_Aminotransferase: '',
    Total_Protiens: '',
    Albumin: '',
    Albumin_and_Globulin_Ratio: ''
  })

  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setPrediction(null)

    try {
      // Convert form data to appropriate types
      const processedData = {
        Age: parseFloat(formData.Age),
        Gender: formData.Gender === 'male' ? 1 : 0,
        Total_Bilirubin: parseFloat(formData.Total_Bilirubin),
        Direct_Bilirubin: parseFloat(formData.Direct_Bilirubin),
        Alkaline_Phosphotase: parseFloat(formData.Alkaline_Phosphotase),
        Alamine_Aminotransferase: parseFloat(formData.Alamine_Aminotransferase),
        Aspartate_Aminotransferase: parseFloat(formData.Aspartate_Aminotransferase),
        Total_Protiens: parseFloat(formData.Total_Protiens),
        Albumin: parseFloat(formData.Albumin),
        Albumin_and_Globulin_Ratio: parseFloat(formData.Albumin_and_Globulin_Ratio)
      }

      const response = await fetch('/api/predict/liver_disease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData)
      })

      const result = await response.json()

      if (response.ok) {
        setPrediction(result)
        toast({
          title: "Prediction Complete",
          description: "Liver disease risk assessment completed successfully.",
        })
      } else {
        throw new Error(result.error || 'Prediction failed')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      Age: '',
      Gender: '',
      Total_Bilirubin: '',
      Direct_Bilirubin: '',
      Alkaline_Phosphotase: '',
      Alamine_Aminotransferase: '',
      Aspartate_Aminotransferase: '',
      Total_Protiens: '',
      Albumin: '',
      Albumin_and_Globulin_Ratio: ''
    })
    setPrediction(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <LiverIcon className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900">Liver Disease Prediction</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          AI-powered liver disease risk assessment using liver function test results and patient demographics.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>
              Enter the patient's demographic information and liver function test results.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="Age">Age (years)</Label>
                  <Input
                    id="Age"
                    type="number"
                    placeholder="e.g., 45"
                    value={formData.Age}
                    onChange={(e) => handleInputChange('Age', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Gender">Gender</Label>
                  <Select value={formData.Gender} onValueChange={(value) => handleSelectChange('Gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bilirubin Tests */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="Total_Bilirubin">Total Bilirubin (mg/dL)</Label>
                  <Input
                    id="Total_Bilirubin"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1.0"
                    value={formData.Total_Bilirubin}
                    onChange={(e) => handleInputChange('Total_Bilirubin', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Direct_Bilirubin">Direct Bilirubin (mg/dL)</Label>
                  <Input
                    id="Direct_Bilirubin"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 0.3"
                    value={formData.Direct_Bilirubin}
                    onChange={(e) => handleInputChange('Direct_Bilirubin', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Enzyme Tests */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="Alkaline_Phosphotase">Alkaline Phosphatase (IU/L)</Label>
                  <Input
                    id="Alkaline_Phosphotase"
                    type="number"
                    placeholder="e.g., 120"
                    value={formData.Alkaline_Phosphotase}
                    onChange={(e) => handleInputChange('Alkaline_Phosphotase', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Alamine_Aminotransferase">ALT (Alanine Aminotransferase) (IU/L)</Label>
                  <Input
                    id="Alamine_Aminotransferase"
                    type="number"
                    placeholder="e.g., 30"
                    value={formData.Alamine_Aminotransferase}
                    onChange={(e) => handleInputChange('Alamine_Aminotransferase', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="Aspartate_Aminotransferase">AST (Aspartate Aminotransferase) (IU/L)</Label>
                <Input
                  id="Aspartate_Aminotransferase"
                  type="number"
                  placeholder="e.g., 25"
                  value={formData.Aspartate_Aminotransferase}
                  onChange={(e) => handleInputChange('Aspartate_Aminotransferase', e.target.value)}
                  required
                />
              </div>

              {/* Protein Tests */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="Total_Protiens">Total Proteins (g/dL)</Label>
                  <Input
                    id="Total_Protiens"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 7.0"
                    value={formData.Total_Protiens}
                    onChange={(e) => handleInputChange('Total_Protiens', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Albumin">Albumin (g/dL)</Label>
                  <Input
                    id="Albumin"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 4.0"
                    value={formData.Albumin}
                    onChange={(e) => handleInputChange('Albumin', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="Albumin_and_Globulin_Ratio">Albumin/Globulin Ratio</Label>
                <Input
                  id="Albumin_and_Globulin_Ratio"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 1.5"
                  value={formData.Albumin_and_Globulin_Ratio}
                  onChange={(e) => handleInputChange('Albumin_and_Globulin_Ratio', e.target.value)}
                  required
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Predict Liver Disease Risk'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
            <CardDescription>
              AI-powered liver disease risk assessment results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prediction ? (
              <div className="space-y-6">
                {/* Risk Level */}
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                    prediction.risk_level === 'High' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {prediction.risk_level === 'High' ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : (
                      <CheckCircle className="h-5 w-5" />
                    )}
                    <span className="font-semibold">
                      {prediction.risk_level} Risk
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {prediction.prediction === 1 ? 'Liver Disease Detected' : 'No Liver Disease Detected'}
                    </p>
                    <p className="text-gray-600">
                      Confidence: {(prediction.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Probability Breakdown */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Probability Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>No Liver Disease</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${prediction.probability.no_liver_disease * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {(prediction.probability.no_liver_disease * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Liver Disease</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${prediction.probability.liver_disease * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {(prediction.probability.liver_disease * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recommendation:</strong> {prediction.recommendation}
                  </AlertDescription>
                </Alert>

                {/* Additional Information */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• This prediction is based on AI analysis and should not replace professional medical diagnosis</li>
                    <li>• Consult with a hepatologist for comprehensive liver health evaluation</li>
                    <li>• Regular liver function monitoring is important for early detection</li>
                    <li>• Lifestyle modifications can significantly impact liver health</li>
                  </ul>
                </div>

                {/* Normal Ranges Reference */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Normal Reference Ranges:</h4>
                  <div className="text-sm text-blue-800 grid md:grid-cols-2 gap-2">
                    <div>• Total Bilirubin: 0.3-1.2 mg/dL</div>
                    <div>• Direct Bilirubin: 0.0-0.3 mg/dL</div>
                    <div>• ALT: 7-40 IU/L</div>
                    <div>• AST: 10-40 IU/L</div>
                    <div>• Alkaline Phosphatase: 44-147 IU/L</div>
                    <div>• Total Proteins: 6.0-8.3 g/dL</div>
                    <div>• Albumin: 3.5-5.0 g/dL</div>
                    <div>• A/G Ratio: 1.1-2.5</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <LiverIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Enter patient information and click "Predict Liver Disease Risk" to see results here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LiverDiseasePrediction
