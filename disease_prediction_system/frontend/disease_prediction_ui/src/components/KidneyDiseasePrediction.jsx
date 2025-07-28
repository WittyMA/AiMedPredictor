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
import { KidneyIcon } from './icons/KidneyIcon'

const KidneyDiseasePrediction = () => {
  const [formData, setFormData] = useState({
    age: '',
    bp: '',
    sg: '',
    al: '',
    su: '',
    rbc: '',
    pc: '',
    pcc: '',
    ba: '',
    bgr: '',
    bu: '',
    sc: '',
    sod: '',
    pot: '',
    hemo: '',
    pcv: '',
    wc: '',
    rc: '',
    htn: '',
    dm: '',
    cad: '',
    appet: '',
    pe: '',
    ane: ''
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
        age: parseFloat(formData.age),
        bp: parseFloat(formData.bp),
        sg: parseFloat(formData.sg),
        al: parseFloat(formData.al),
        su: parseFloat(formData.su),
        rbc: formData.rbc === 'normal' ? 1 : 0,
        pc: formData.pc === 'normal' ? 1 : 0,
        pcc: formData.pcc === 'present' ? 1 : 0,
        ba: formData.ba === 'present' ? 1 : 0,
        bgr: parseFloat(formData.bgr),
        bu: parseFloat(formData.bu),
        sc: parseFloat(formData.sc),
        sod: parseFloat(formData.sod),
        pot: parseFloat(formData.pot),
        hemo: parseFloat(formData.hemo),
        pcv: parseFloat(formData.pcv),
        wc: parseFloat(formData.wc),
        rc: parseFloat(formData.rc),
        htn: formData.htn === 'yes' ? 1 : 0,
        dm: formData.dm === 'yes' ? 1 : 0,
        cad: formData.cad === 'yes' ? 1 : 0,
        appet: formData.appet === 'good' ? 1 : 0,
        pe: formData.pe === 'yes' ? 1 : 0,
        ane: formData.ane === 'yes' ? 1 : 0
      }

      const response = await fetch('/api/predict/kidney_disease', {
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
          description: "Kidney disease risk assessment completed successfully.",
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
      age: '',
      bp: '',
      sg: '',
      al: '',
      su: '',
      rbc: '',
      pc: '',
      pcc: '',
      ba: '',
      bgr: '',
      bu: '',
      sc: '',
      sod: '',
      pot: '',
      hemo: '',
      pcv: '',
      wc: '',
      rc: '',
      htn: '',
      dm: '',
      cad: '',
      appet: '',
      pe: '',
      ane: ''
    })
    setPrediction(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <KidneyIcon className="h-8 w-8 text-green-500" />
          <h1 className="text-3xl font-bold text-gray-900">Kidney Disease Prediction</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          AI-powered kidney disease risk assessment using clinical parameters and laboratory test results.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>
              Enter the patient's clinical data and laboratory test results for kidney disease assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="e.g., 45"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bp">Blood Pressure (mmHg)</Label>
                  <Input
                    id="bp"
                    type="number"
                    placeholder="e.g., 120"
                    value={formData.bp}
                    onChange={(e) => handleInputChange('bp', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Urine Tests */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sg">Specific Gravity</Label>
                  <Input
                    id="sg"
                    type="number"
                    step="0.001"
                    placeholder="e.g., 1.020"
                    value={formData.sg}
                    onChange={(e) => handleInputChange('sg', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="al">Albumin</Label>
                  <Input
                    id="al"
                    type="number"
                    placeholder="e.g., 0"
                    value={formData.al}
                    onChange={(e) => handleInputChange('al', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="su">Sugar</Label>
                  <Input
                    id="su"
                    type="number"
                    placeholder="e.g., 0"
                    value={formData.su}
                    onChange={(e) => handleInputChange('su', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rbc">Red Blood Cells</Label>
                  <Select value={formData.rbc} onValueChange={(value) => handleSelectChange('rbc', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="abnormal">Abnormal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pc">Pus Cell</Label>
                  <Select value={formData.pc} onValueChange={(value) => handleSelectChange('pc', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="abnormal">Abnormal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pcc">Pus Cell Clumps</Label>
                  <Select value={formData.pcc} onValueChange={(value) => handleSelectChange('pcc', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="notpresent">Not Present</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ba">Bacteria</Label>
                  <Select value={formData.ba} onValueChange={(value) => handleSelectChange('ba', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="notpresent">Not Present</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bgr">Blood Glucose Random (mg/dL)</Label>
                  <Input
                    id="bgr"
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.bgr}
                    onChange={(e) => handleInputChange('bgr', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Blood Tests */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bu">Blood Urea (mg/dL)</Label>
                  <Input
                    id="bu"
                    type="number"
                    placeholder="e.g., 30"
                    value={formData.bu}
                    onChange={(e) => handleInputChange('bu', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sc">Serum Creatinine (mg/dL)</Label>
                  <Input
                    id="sc"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1.0"
                    value={formData.sc}
                    onChange={(e) => handleInputChange('sc', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sod">Sodium (mEq/L)</Label>
                  <Input
                    id="sod"
                    type="number"
                    placeholder="e.g., 140"
                    value={formData.sod}
                    onChange={(e) => handleInputChange('sod', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pot">Potassium (mEq/L)</Label>
                  <Input
                    id="pot"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 4.0"
                    value={formData.pot}
                    onChange={(e) => handleInputChange('pot', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hemo">Hemoglobin (g/dL)</Label>
                  <Input
                    id="hemo"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 12.5"
                    value={formData.hemo}
                    onChange={(e) => handleInputChange('hemo', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pcv">Packed Cell Volume (%)</Label>
                  <Input
                    id="pcv"
                    type="number"
                    placeholder="e.g., 40"
                    value={formData.pcv}
                    onChange={(e) => handleInputChange('pcv', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wc">White Blood Cell Count (cells/cumm)</Label>
                  <Input
                    id="wc"
                    type="number"
                    placeholder="e.g., 7000"
                    value={formData.wc}
                    onChange={(e) => handleInputChange('wc', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rc">Red Blood Cell Count (millions/cumm)</Label>
                  <Input
                    id="rc"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 4.5"
                    value={formData.rc}
                    onChange={(e) => handleInputChange('rc', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Medical History */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="htn">Hypertension</Label>
                  <Select value={formData.htn} onValueChange={(value) => handleSelectChange('htn', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dm">Diabetes Mellitus</Label>
                  <Select value={formData.dm} onValueChange={(value) => handleSelectChange('dm', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cad">Coronary Artery Disease</Label>
                  <Select value={formData.cad} onValueChange={(value) => handleSelectChange('cad', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appet">Appetite</Label>
                  <Select value={formData.appet} onValueChange={(value) => handleSelectChange('appet', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pe">Pedal Edema</Label>
                  <Select value={formData.pe} onValueChange={(value) => handleSelectChange('pe', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ane">Anemia</Label>
                  <Select value={formData.ane} onValueChange={(value) => handleSelectChange('ane', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
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
                    'Predict Kidney Disease Risk'
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
              AI-powered kidney disease risk assessment results
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
                      {prediction.prediction === 1 ? 'Kidney Disease Detected' : 'No Kidney Disease Detected'}
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
                      <span>No Kidney Disease</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${prediction.probability.no_kidney_disease * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {(prediction.probability.no_kidney_disease * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Kidney Disease</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${prediction.probability.kidney_disease * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {(prediction.probability.kidney_disease * 100).toFixed(1)}%
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
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• This prediction is based on AI analysis and should not replace professional medical diagnosis</li>
                    <li>• Consult with a nephrologist for comprehensive kidney health evaluation</li>
                    <li>• Regular monitoring of kidney function is recommended for high-risk individuals</li>
                    <li>• Early detection and treatment can significantly improve outcomes</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <KidneyIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Enter patient information and click "Predict Kidney Disease Risk" to see results here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default KidneyDiseasePrediction
