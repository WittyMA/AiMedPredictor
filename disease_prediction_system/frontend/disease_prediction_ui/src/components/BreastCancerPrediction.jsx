import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BreastIcon } from '@/components/icons/BreastIcon'

const BreastCancerPrediction = () => {
  const [formData, setFormData] = useState({
    radius_mean: '',
    texture_mean: '',
    perimeter_mean: '',
    area_mean: '',
    smoothness_mean: '',
    compactness_mean: '',
    concavity_mean: '',
    concave_points_mean: '',
    symmetry_mean: '',
    fractal_dimension_mean: '',
    radius_se: '',
    texture_se: '',
    perimeter_se: '',
    area_se: '',
    smoothness_se: '',
    compactness_se: '',
    concavity_se: '',
    concave_points_se: '',
    symmetry_se: '',
    fractal_dimension_se: '',
    radius_worst: '',
    texture_worst: '',
    perimeter_worst: '',
    area_worst: '',
    smoothness_worst: '',
    compactness_worst: '',
    concavity_worst: '',
    concave_points_worst: '',
    symmetry_worst: '',
    fractal_dimension_worst: ''
  });


  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field, value) => {
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
      const processedData = {}
      Object.keys(formData).forEach(key => {
        processedData[key] = parseFloat(formData[key])
      })

      const response = await fetch('/api/predict/breast_cancer', {
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
          description: "Breast cancer risk assessment completed successfully.",
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
    const resetData = {}
    Object.keys(formData).forEach(key => {
      resetData[key] = ''
    })
    setFormData(resetData)
    setPrediction(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <BreastIcon className="h-8 w-8 text-pink-500" />
          <h1 className="text-3xl font-bold text-gray-900">Breast Cancer Prediction</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          AI-powered breast cancer risk assessment using cell nuclei characteristics from fine needle aspirate (FNA).
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Cell Nuclei Characteristics</CardTitle>
            <CardDescription>
              Enter the measurements from fine needle aspirate (FNA) of breast mass cell nuclei.
            </CardDescription>
          </CardHeader>
         <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mean Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Mean Values</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="radius_mean">Mean Radius</Label>
                    <Input
                      id="radius_mean"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 14.13"
                      value={formData.radius_mean}
                      onChange={(e) => handleInputChange('radius_mean', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="texture_mean">Mean Texture</Label>
                    <Input
                      id="texture_mean"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 19.26"
                      value={formData.texture_mean}
                      onChange={(e) => handleInputChange('texture_mean', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="perimeter_mean">Mean Perimeter</Label>
                    <Input
                      id="perimeter_mean"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 91.97"
                      value={formData.perimeter_mean}
                      onChange={(e) => handleInputChange('perimeter_mean', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area_mean">Mean Area</Label>
                    <Input
                      id="area_mean"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 654.9"
                      value={formData.area_mean}
                      onChange={(e) => handleInputChange('area_mean', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smoothness_mean">Mean Smoothness</Label>
                    <Input
                      id="smoothness_mean"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.0963"
                      value={formData.smoothness_mean}
                      onChange={(e) => handleInputChange('smoothness_mean', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compactness_mean">Mean Compactness</Label>
                    <Input
                      id="compactness_mean"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.1058"
                      value={formData.compactness_mean}
                      onChange={(e) => handleInputChange('compactness_mean', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="concavity_mean">Mean Concavity</Label>
                    <Input
                      id="concavity_mean"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.0895"
                      value={formData.concavity_mean}
                      onChange={(e) => handleInputChange('concavity_mean', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concave points_mean">Mean Concave Points</Label>
                    <Input
                      id="concave_points_mean"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.0489"
                      value={formData.concave_points_mean}
                      onChange={(e) => handleInputChange('concave_points_mean', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="symmetry_mean">Mean Symmetry</Label>
                    <Input
                      id="symmetry_mean"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.1812"
                      value={formData.symmetry_mean}
                      onChange={(e) => handleInputChange('symmetry_mean', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fractal_dimension_mean">Mean Fractal Dimension</Label>
                    <Input
                      id="fractal_dimension_mean"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.0634"
                      value={formData.fractal_dimension_mean}
                      onChange={(e) => handleInputChange('fractal_dimension_mean', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Standard Error Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Standard Error Values</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="radius_se">Radius Error</Label>
                    <Input
                      id="radius_se"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.4052"
                      value={formData.radius_se}
                      onChange={(e) => handleInputChange('radius_se', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="texture_se">Texture Error</Label>
                    <Input
                      id="texture_se"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 1.217"
                      value={formData.texture_se}
                      onChange={(e) => handleInputChange('texture_se', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="perimeter_se">Perimeter Error</Label>
                    <Input
                      id="perimeter_se"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 2.868"
                      value={formData.perimeter_se}
                      onChange={(e) => handleInputChange('perimeter_se', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area_se">Area Error</Label>
                    <Input
                      id="area_se"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 40.34"
                      value={formData.area_se}
                      onChange={(e) => handleInputChange('area_se', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smoothness_se">Smoothness Error</Label>
                    <Input
                      id="smoothness_se"
                      type="number"
                      step="0.00001"
                      placeholder="e.g., 0.007061"
                      value={formData.smoothness_se}
                      onChange={(e) => handleInputChange('smoothness_se', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compactness_se">Compactness Error</Label>
                    <Input
                      id="compactness_se"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.02504"
                      value={formData.compactness_se}
                      onChange={(e) => handleInputChange('compactness_se', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="concavity_se">Concavity Error</Label>
                    <Input
                      id="concavity_se"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.03189"
                      value={formData.concavity_se}
                      onChange={(e) => handleInputChange('concavity_se', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concave points_se">Concave Points Error</Label>
                    <Input
                      id="concave_points_se"
                      type="number"
                      step="0.00001"
                      placeholder="e.g., 0.01109"
                      value={formData.concave_points_se}
                      onChange={(e) => handleInputChange('concave_points_se', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="symmetry_se">Symmetry Error</Label>
                    <Input
                      id="symmetry_se"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.02419"
                      value={formData.symmetry_se}
                      onChange={(e) => handleInputChange('symmetry_se', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fractal_dimension_se">Fractal Dimension Error</Label>
                    <Input
                      id="fractal_dimension_se"
                      type="number"
                      step="0.00001"
                      placeholder="e.g., 0.004564"
                      value={formData.fractal_dimension_se}
                      onChange={(e) => handleInputChange('fractal_dimension_se', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Worst Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Worst Values</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="radius_worst">Worst Radius</Label>
                    <Input
                      id="radius_worst"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 16.27"
                      value={formData.radius_worst}
                      onChange={(e) => handleInputChange('radius_worst', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="texture_worst">Worst Texture</Label>
                    <Input
                      id="texture_worst"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 25.68"
                      value={formData.texture_worst}
                      onChange={(e) => handleInputChange('texture_worst', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="perimeter_worst">Worst Perimeter</Label>
                    <Input
                      id="perimeter_worst"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 108.9"
                      value={formData.perimeter_worst}
                      onChange={(e) => handleInputChange('perimeter_worst', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area_worst">Worst Area</Label>
                    <Input
                      id="area_worst"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 858.1"
                      value={formData.area_worst}
                      onChange={(e) => handleInputChange('area_worst', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smoothness_worst">Worst Smoothness</Label>
                    <Input
                      id="smoothness_worst"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.1322"
                      value={formData.smoothness_worst}
                      onChange={(e) => handleInputChange('smoothness_worst', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compactness_worst">Worst Compactness</Label>
                    <Input
                      id="compactness_worst"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.2050"
                      value={formData.compactness_worst}
                      onChange={(e) => handleInputChange('compactness_worst', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="concavity_worst">Worst Concavity</Label>
                    <Input
                      id="concavity_worst"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.4000"
                      value={formData.concavity_worst}
                      onChange={(e) => handleInputChange('concavity_worst', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concave points_worst">Worst Concave Points</Label>
                    <Input
                      id="concave_points_worst"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.1625"
                      value={formData.concave_points_worst}
                      onChange={(e) => handleInputChange('concave_points_worst', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="symmetry_worst">Worst Symmetry</Label>
                    <Input
                      id="symmetry_worst"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.2364"
                      value={formData.symmetry_worst}
                      onChange={(e) => handleInputChange('symmetry_worst', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fractal_dimension_worst">Worst Fractal Dimension</Label>
                    <Input
                      id="fractal_dimension_worst"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 0.07678"
                      value={formData.fractal_dimension_worst}
                      onChange={(e) => handleInputChange('fractal_dimension_worst', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Predict Breast Cancer Risk'
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
              AI-powered breast cancer risk assessment results
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
                      {prediction.prediction === 1 ? 'Malignant' : 'Benign'}
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
                      <span>Benign (No Cancer)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${prediction.probability.benign * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {(prediction.probability.benign * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Malignant (Cancer)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${prediction.probability.malignant * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {(prediction.probability.malignant * 100).toFixed(1)}%
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
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-pink-900 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-pink-800 space-y-1">
                    <li>• This prediction is based on AI analysis and should not replace professional medical diagnosis</li>
                    <li>• Immediate consultation with an oncologist is recommended for any suspicious findings</li>
                    <li>• Regular mammography screening is crucial for early detection</li>
                    <li>• Early detection significantly improves treatment outcomes</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BreastIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Enter cell nuclei measurements and click "Predict Breast Cancer Risk" to see results here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BreastCancerPrediction
