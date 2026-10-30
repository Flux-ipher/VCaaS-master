'use client'

import { useState } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ReportForm {
  type: string
  severity: string
  description: string
  email: string
  anonymous: boolean
}

interface SecurityReportFormProps {
  onSubmit: (formData: ReportForm) => void
}

export default function SecurityReportForm({ onSubmit }: SecurityReportFormProps) {
  const [reportForm, setReportForm] = useState<ReportForm>({
    type: 'security',
    severity: 'medium',
    description: '',
    email: '',
    anonymous: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(reportForm)
    
    // Reset form
    setReportForm({
      type: 'security',
      severity: 'medium', 
      description: '',
      email: '',
      anonymous: false
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Report Security Issue</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Type
            </label>
            <select
              value={reportForm.type}
              onChange={(e) => setReportForm({...reportForm, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="security">Security Vulnerability</option>
              <option value="fraud">Fraudulent Activity</option>
              <option value="unauthorized">Unauthorized Voice Usage</option>
              <option value="data">Data Privacy Concern</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              value={reportForm.severity}
              onChange={(e) => setReportForm({...reportForm, severity: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={reportForm.description}
            onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
            placeholder="Please provide detailed information about the security issue..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white resize-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email (Optional)
          </label>
          <input
            type="email"
            value={reportForm.email}
            onChange={(e) => setReportForm({...reportForm, email: e.target.value})}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white"
          />
        </div>
        
        <div className="flex items-center">
          <input
            id="anonymous"
            type="checkbox"
            checked={reportForm.anonymous}
            onChange={(e) => setReportForm({...reportForm, anonymous: e.target.checked})}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
            Submit anonymously (we won't be able to follow up)
          </label>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            Submit Security Report
          </button>
        </div>
      </form>
    </div>
  )
}
