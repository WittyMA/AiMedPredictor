import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Brain, Info, Zap, Activity, Heart, Monitor, Upload, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const MultimodalPrediction = () => {
  const [selectedModalities, setSelectedModalities] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  // Form data for tabular input (diabetes features)
  const [tabularData, setTabularData] = useState({
    Pregnancies: '',
    Glucose: '',
    BloodPressure: '',
    SkinThickness: '',
    Insulin: '',
    BMI: '',
    DiabetesPedigreeFunction: '',
    Age: ''
  })

  // Image data
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleTabularChange = (field, value) => {
    setTabularData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate tabular data
      const tabularValues = Object.values(tabularData)
      if (tabularValues.some(val => val === '')) {
        toast({
          title: "Missing Data",
          description: "Please fill in all tabular data fields.",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Validate image
      if (!imageFile) {
        toast({
          title: "Missing Image",
          description: "Please upload a chest X-ray image.",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Convert image to base64
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          // Prepare FormData for API
          const formData = new FormData()
          
          // Add tabular data
          formData.append('pregnancies', tabularData.Pregnancies)
          formData.append('glucose', tabularData.Glucose)
          formData.append('blood_pressure', tabularData.BloodPressure)
          formData.append('skin_thickness', tabularData.SkinThickness)
          formData.append('insulin', tabularData.Insulin)
          formData.append('bmi', tabularData.BMI)
          formData.append('diabetes_pedigree_function', tabularData.DiabetesPedigreeFunction)
          formData.append('age', tabularData.Age)
          
          // Add image file
          formData.append('image', imageFile)

          const response = await fetch('/api/predict/multimodal', {
            method: 'POST',
            body: formData
          })

          const result = await response.json()

          if (response.ok) {
            setPrediction(result)
            toast({
              title: "Prediction Complete",
              description: "Multi-modal analysis completed successfully.",
            })
          } else {
            throw new Error(result.error || 'Prediction failed')
          }
        } catch (error) {
          console.error('Prediction error:', error)
          toast({
            title: "Prediction Failed",
            description: error.message || "An error occurred during prediction.",
            variant: "destructive"
          })
        }
      }
      reader.readAsDataURL(imageFile)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const modalities = [
    {
      id: 'tabular',
      title: 'Tabular Data Analysis',
      description: 'Patient health metrics, lab results, and clinical measurements',
      icon: Activity,
      color: 'bg-blue-500',
      features: ['Blood tests', 'Vital signs', 'Medical history', 'Demographics']
    },
    {
      id: 'imaging',
      title: 'Medical Imaging',
      description: 'X-rays, CT scans, MRI, and other medical images',
      icon: Monitor,
      color: 'bg-green-500',
      features: ['Chest X-rays', 'CT scans', 'MRI images', 'Ultrasound']
    },
    {
      id: 'temporal',
      title: 'Time Series Data',
      description: 'ECG, EEG, continuous monitoring data over time',
      icon: Heart,
      color: 'bg-red-500',
      features: ['ECG signals', 'Heart rate variability', 'Blood pressure trends', 'Sleep patterns']
    }
  ]

  const advantages = [
    {
      title: 'Enhanced Accuracy',
      description: 'Combining multiple data types provides more comprehensive insights than single-modality analysis.',
      icon: Zap
    },
    {
      title: 'Robust Predictions',
      description: 'Multi-modal models are more resilient to missing or noisy data in individual modalities.',
      icon: Brain
    },
    {
      title: 'Holistic Assessment',
      description: 'Captures the full complexity of medical conditions through diverse data perspectives.',
      icon: Activity
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-gray-900">Multi-Modal AI Prediction</h1>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Advanced AI system that combines multiple data types for comprehensive health assessment and disease prediction.
        </p>
      </div>

      {/* Try Multi-Modal Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-500" />
            <span>Try Multi-Modal Prediction</span>
          </CardTitle>
          <CardDescription>
            Combine tabular health data with chest X-ray analysis for enhanced prediction accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showForm ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Experience the power of multi-modal AI by combining diabetes risk factors with chest X-ray analysis.
              </p>
              <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
                Start Multi-Modal Analysis
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tabular Data Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Patient Health Data</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pregnancies">Pregnancies</Label>
                    <Input
                      id="pregnancies"
                      type="number"
                      value={tabularData.Pregnancies}
                      onChange={(e) => handleTabularChange('Pregnancies', e.target.value)}
                      placeholder="Number of pregnancies"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="glucose">Glucose Level (mg/dL)</Label>
                    <Input
                      id="glucose"
                      type="number"
                      value={tabularData.Glucose}
                      onChange={(e) => handleTabularChange('Glucose', e.target.value)}
                      placeholder="Glucose level"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bloodpressure">Blood Pressure (mmHg)</Label>
                    <Input
                      id="bloodpressure"
                      type="number"
                      value={tabularData.BloodPressure}
                      onChange={(e) => handleTabularChange('BloodPressure', e.target.value)}
                      placeholder="Diastolic blood pressure"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skinthickness">Skin Thickness (mm)</Label>
                    <Input
                      id="skinthickness"
                      type="number"
                      value={tabularData.SkinThickness}
                      onChange={(e) => handleTabularChange('SkinThickness', e.target.value)}
                      placeholder="Triceps skin fold thickness"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insulin">Insulin (μU/mL)</Label>
                    <Input
                      id="insulin"
                      type="number"
                      value={tabularData.Insulin}
                      onChange={(e) => handleTabularChange('Insulin', e.target.value)}
                      placeholder="2-Hour serum insulin"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bmi">BMI (kg/m²)</Label>
                    <Input
                      id="bmi"
                      type="number"
                      value={tabularData.BMI}
                      onChange={(e) => handleTabularChange('BMI', e.target.value)}
                      placeholder="Body mass index"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dpf">Diabetes Pedigree Function</Label>
                    <Input
                      id="dpf"
                      type="number"
                      value={tabularData.DiabetesPedigreeFunction}
                      onChange={(e) => handleTabularChange('DiabetesPedigreeFunction', e.target.value)}
                      placeholder="Diabetes pedigree function"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      value={tabularData.Age}
                      onChange={(e) => handleTabularChange('Age', e.target.value)}
                      placeholder="Age in years"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Chest X-Ray Image</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload chest X-ray image
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </span>
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto max-h-64 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Run Multi-Modal Analysis'
                )}
              </Button>
            </form>
          )}

          {/* Prediction Results */}
          {prediction && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-Modal Prediction Results</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Prediction:</span>
                  <Badge variant={prediction.prediction === "Positive" ? "destructive" : "success"}>
                    {prediction.prediction}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Confidence:</span>
                  <span>{prediction.confidence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Risk Level:</span>
                  <Badge variant={prediction.risk_level === "High" ? "destructive" : "success"}>
                    {prediction.risk_level}
                  </Badge>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  {prediction.message}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What is Multi-Modal AI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-500" />
            <span>What is Multi-Modal AI?</span>
          </CardTitle>
          <CardDescription>
            Understanding the power of combining multiple data types for medical prediction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Multi-modal AI refers to artificial intelligence systems that can process and analyze multiple types of data 
            simultaneously. In healthcare, this means combining structured data (like lab results), medical images 
            (like X-rays), and time-series data (like ECG signals) to make more accurate and comprehensive predictions.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By leveraging the strengths of different data modalities, these systems can capture patterns and relationships 
            that might be missed when analyzing each data type in isolation, leading to more robust and reliable medical insights.
          </p>
        </CardContent>
      </Card>

      {/* Supported Modalities */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Supported Data Modalities</h2>
          <p className="text-gray-600">Our multi-modal system will integrate these different types of medical data</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {modalities.map((modality) => {
            const Icon = modality.icon
            return (
              <Card key={modality.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 ${modality.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{modality.title}</CardTitle>
                  <CardDescription>{modality.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-900">Key Features:</h4>
                    <ul className="space-y-1">
                      {modality.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Advantages */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Advantages of Multi-Modal AI</h2>
          <p className="text-gray-600">Why combining multiple data types leads to better medical predictions</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{advantage.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{advantage.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Technical Architecture */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Architecture</CardTitle>
          <CardDescription>
            How our multi-modal system processes and combines different data types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Data Processing Pipeline</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">1</Badge>
                  <span className="text-sm text-gray-700">Data ingestion and preprocessing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">2</Badge>
                  <span className="text-sm text-gray-700">Modality-specific feature extraction</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">3</Badge>
                  <span className="text-sm text-gray-700">Cross-modal attention mechanisms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">4</Badge>
                  <span className="text-sm text-gray-700">Unified prediction and confidence scoring</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Model Components</h3>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900">Tabular Encoder</div>
                  <div className="text-sm text-blue-700">Processes structured medical data</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900">Vision Transformer</div>
                  <div className="text-sm text-green-700">Analyzes medical images</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="font-medium text-red-900">Temporal CNN</div>
                  <div className="text-sm text-red-700">Processes time-series signals</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-900">Fusion Network</div>
                  <div className="text-sm text-purple-700">Combines all modalities</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Development Status</CardTitle>
          <CardDescription>
            Current progress and upcoming features for the multi-modal prediction system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-900">Individual Disease Models</span>
              <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-900">Medical Image Analysis</span>
              <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium text-yellow-900">Multi-Modal Fusion</span>
              <Badge className="bg-yellow-100 text-yellow-800">🔄 In Progress</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Time-Series Integration</span>
              <Badge className="bg-gray-100 text-gray-800">⏳ Planned</Badge>
            </div>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              While the multi-modal system is under development, you can currently use our individual prediction models 
              for diabetes, heart disease, COVID-19 symptoms, and chest X-ray analysis. These models provide accurate 
              single-modality predictions and will be integrated into the unified multi-modal system.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Try Our Current Models</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          While we're developing the multi-modal system, explore our individual AI models for specific health predictions.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild variant="outline">
            <a href="/diabetes">Diabetes Prediction</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/heart-disease">Heart Disease</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/kidney-disease">Kidney Disease</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/liver-disease">Liver Disease</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/breast-cancer">Breast Cancer</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/covid-symptoms">COVID-19 Symptoms</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/chest-xray">Chest X-Ray Analysis</a>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MultimodalPrediction
